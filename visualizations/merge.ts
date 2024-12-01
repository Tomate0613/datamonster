import fs from "fs";
import * as fastcsv from "fast-csv";
import Fuse from "fuse.js";
import inquirer from "inquirer";

async function parseCsv(filename: string, delimiter: string) {
  return new Promise((resolve) => {
    const results: any[] = [];
    fs.createReadStream(filename)
      .pipe(fastcsv.parse({ headers: true, delimiter }))
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results));
  });
}

async function findBestMatch<T>(
  modName: string,
  shardData: T[],
  threshold: number,
) {
  const fuse = new Fuse(shardData, { keys: ["id"], threshold }); // Adjust threshold as needed
  const results = fuse.search(modName);
  return results.map((result) => result.item);
}

type Shard = { id: string; collected: string };

function compareFunc(max: Shard, shard: Shard) {
  return +shard.collected > +max.collected ? shard : max;
}

function filterOptions(
  possibleMatches: Shard[],
  shard: any,
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
    {} as Record<string, any[]>,
  );

  // For each group of `id`, select the one with the highest `collected`
  const highestCollectedMatches = Object.values(groupedById).map((group) => {
    const bestMatch = group.reduce(compareFunc);
    return bestMatch;
  });

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

async function mergeCsvs(
  mf: { Mod: string }[],
  shard: { id: string; collected: string }[],
) {
  const mergedData: any[] = [];

  for (const mod of mf) {
    const modName = mod.Mod;
    const matchingShards = await findBestMatch(modName, shard, 0.3);

    // If no exact match found, use fuzzy matching
    if (matchingShards.length === 0) {
      let possibleMatches = await findBestMatch(modName, shard, 0.7);

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
          choices: filterOptions(possibleMatches, shard, true),
        },
      ]);

      if (selectedShard.shardId === "fullList") {
        possibleMatches = await findBestMatch(modName, shard, 1);

        const fullListSelection = await inquirer.prompt([
          {
            type: "list",
            name: "shardId",
            message: "Please choose from the full list of possible matches:",
            choices: filterOptions(possibleMatches, shard, false),
          },
        ]);
        selectedShard.shardId = fullListSelection.shardId; // Update selected shard id with the user's choice
      }

      // Find the selected shard from the list
      const shardRow = possibleMatches
        .filter((match) => match.id === selectedShard.shardId)
        .reduce(compareFunc);
      if (shardRow) {
        mergedData.push({ ...mod, ...shardRow });
      }
    } else {
      // If an exact match is found, select the one with the largest `collected` value
      const bestShard = matchingShards.reduce(compareFunc);

      //console.log("Choose", bestShard.id, "for", mod.Mod)

      mergedData.push({ ...mod, ...bestShard });
    }
  }

  return mergedData;
}

async function exportToCsv(mergedData: any[], outputFilename: string) {
  const writeStream = fs.createWriteStream(outputFilename);
  const csvStream = fastcsv.format({ headers: true, quote: '"' });

  csvStream.pipe(writeStream);

  mergedData.forEach((row) => {
    csvStream.write(row);
  });

  csvStream.end();
  console.log(`Merged data successfully exported to ${outputFilename}`);
}

async function run() {
  const mf = (await parseCsv("mf.CSV", ";")) as { Mod: string }[];
  const shard = (await parseCsv("shard.csv", ",")) as {
    id: string;
    collected: string;
  }[];

  console.log("Merging data...");
  const merged = await mergeCsvs(mf, shard);

  exportToCsv(merged, "merged.csv");
}

run();
