import Fuse from "fuse.js";
import inquirer from "inquirer";
import {
  exportToCsv,
  getModfest,
  getMods,
  getShards,
  Mapping,
  Mod,
  ModfestEntry,
  Shard,
} from "./csv";

async function findMatches<T>(
  modName: string,
  shardData: T[],
  threshold: number,
) {
  const fuse = new Fuse(shardData, { keys: ["id"], threshold }); // Adjust threshold as needed
  const results = fuse.search(modName);
  return results.map((result) => result.item);
}

function compareShards(max: Shard, shard: Shard) {
  return +shard.collected > +max.collected ? shard : max;
}

function filterOptions(possibleMatches: Shard[], showAllOption: boolean) {
  // Group by `id`
  const groupedById = possibleMatches.reduce(
    (acc, match) => {
      if (!acc[match.id]) {
        acc[match.id] = [];
      }
      acc[match.id].push(match);
      return acc;
    },
    {} as Record<string, Shard[]>,
  );

  // For each group of `id`, select the one with the highest `collected`
  const highestCollectedMatches = Object.values(groupedById).map((group) =>
    group.reduce(compareShards),
  );

  // Create the choices list with the option to select from the whole list
  const choices = highestCollectedMatches.map((match) => {
    return {
      name: `${match.id} (collected: ${match.collected})`,
      value: match.id,
    };
  });

  if (!showAllOption) {
    return choices;
  }

  // Add an option to allow the user to choose from the entire list of possible matches
  choices.push({
    name: "Choose from the full list of matches",
    value: "fullList", // Special value to indicate the user wants the full list
  });

  return choices;
}

async function generateMappings(
  mf: ModfestEntry[],
  mod: Mod[],
  shard: Shard[],
) {
  const mergedData: Mapping[] = [];

  for (const entry of mf) {
    const entryName = entry.Name;

    if (!entryName) {
      continue;
    }

    const modMatch = mod.find((m) => m.name === entryName);

    if (modMatch) {
      const shardMatch = shard.find((shard) => shard.id === modMatch.id);

      if (shardMatch) {
        mergedData.push({
          ModfestEntryName: entryName,
          ShardId: shardMatch.id,
        });
        continue;
      }
    }

    const matchingShards = await findMatches(entryName, shard, 0.3);

    if (matchingShards.length === 0) {
      let possibleMatches = await findMatches(entryName, shard, 0.7);

      if (possibleMatches.length === 0) {
        console.log(`No match found for Mod: ${entryName}`);
        continue;
      }

      // Ask user to select the best match
      const selectedShard = await inquirer.prompt([
        {
          type: "list",
          name: "shardId",
          message: `Could not find an exact match for Mod: ${entryName}. Please select the closest match:`,
          choices: filterOptions(possibleMatches, true),
        },
      ]);

      if (selectedShard.shardId === "fullList") {
        possibleMatches = await findMatches(entryName, shard, 1);

        const fullListSelection = await inquirer.prompt([
          {
            type: "list",
            name: "shardId",
            message: "Please choose from the full list of possible matches:",
            choices: filterOptions(possibleMatches, false),
          },
        ]);
        selectedShard.shardId = fullListSelection.shardId;
      }

      // Find the selected shard from the list
      const shardRow = possibleMatches
        .filter((match) => match.id === selectedShard.shardId)
        .reduce(compareShards);
      if (shardRow) {
        mergedData.push({ ModfestEntryName: entryName, ShardId: shardRow.id });
      }
    } else {
      const bestShard = matchingShards.reduce(compareShards);

      mergedData.push({ ModfestEntryName: entryName, ShardId: bestShard.id });
    }
  }

  return mergedData;
}

async function run() {
  const mf = await getModfest();
  const mods = await getMods();
  const shards = await getShards();

  console.log("Merging data...");
  const mappings = await generateMappings(mf, mods, shards);

  exportToCsv(mappings, "mappings.csv");
  console.log(`Generated mappings.csv`);
}

run();
