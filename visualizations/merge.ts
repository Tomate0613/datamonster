import Fuse from "fuse.js";
import inquirer from "inquirer";
import {exportToCsv, getModfest, getShards, Merged, ModfestEntry, Shard,} from "./csv";

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

function filterOptions(
  possibleMatches: Shard[],
  showAllOption: boolean,
) {
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
  const highestCollectedMatches = Object.values(groupedById).map((group) => group.reduce(compareShards));

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

async function mergeCsvs(mf: ModfestEntry[], shard: Shard[]) {
  const mergedData: Merged[] = [];

  for (const entry of mf) {
    const modName = entry.Mod;
    const matchingShards = await findMatches(modName, shard, 0.3);

    if (matchingShards.length === 0) {
      let possibleMatches = await findMatches(modName, shard, 0.7);

      if (possibleMatches.length === 0) {
        console.log(`No match found for Mod: ${modName}`);
        continue;
      }

      // Ask user to select the best match
      const selectedShard = await inquirer.prompt([
        {
          type: "list",
          name: "shardId",
          message: `Could not find an exact match for Mod: ${modName}. Please select the closest match:`,
          choices: filterOptions(possibleMatches, true),
        },
      ]);

      if (selectedShard.shardId === "fullList") {
        possibleMatches = await findMatches(modName, shard, 1);

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
        mergedData.push({ ...entry, ...shardRow });
      }
    } else {
      const bestShard = matchingShards.reduce(compareShards);

      mergedData.push({ ...entry, ...bestShard });
    }
  }

  return mergedData;
}

async function run() {
  const mf = await getModfest();
  const shards = await getShards();

  console.log("Merging data...");
  const merged = await mergeCsvs(mf, shards);

  exportToCsv(merged, "merged.csv");
  console.log(`Merged data successfully exported to merged.csv`);
}

run();
