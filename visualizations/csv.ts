import * as fastcsv from "fast-csv";
import fs from "node:fs";
import path from "node:path";
import { dirs } from "./utils";

export type CSV<T extends string[]> = { [K in T[number]]: string };
export type GenericCsv = CSV<string[]>;

async function parseCsv<T extends GenericCsv>(
  filename: string,
  delimiter = ",",
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    fs.createReadStream(path.join("data", filename))
      .pipe(fastcsv.parse({ headers: true, delimiter }))
      .on("data", (row) => results.push(row))
      .on("error", (err) => {
        reject(
          new Error(`Error parsing CSV from "${filename}": ${err.message}`),
        );
      })
      .on("end", () => resolve(results));
  });
}

export async function exportToCsv(data: unknown[], outputFilename: string) {
  const writeStream = fs.createWriteStream(outputFilename);
  const csvStream = fastcsv.format({ headers: true, quote: '"' });

  csvStream.pipe(writeStream);

  data.forEach((row) => {
    csvStream.write(row);
  });

  csvStream.end();
}

function get<T extends GenericCsv>(filename: string, delimiter?: string) {
  return () => parseCsv<T>(filename, delimiter);
}

dirs();

export type Mod = CSV<["id", "name", "description", "authors", "version"]>;
export type Shard = CSV<["id", "name", "lore", "type", "collected"]>;
export type Area = CSV<
  ["id", "priority", "type", "minX", "minY", "minZ", "maxX", "maxY", "maxZ"]
>;
export type Performance = CSV<
  [
    "minRenderTimeMs",
    "maxRenderTimeMs",
    "x",
    "totalSamples",
    "z",
    "avgRenderTimeMs",
  ]
>;
export type Item = CSV<
  ["path", "name_has_translation", "namespace", "name", "id"]
>;
export const getMods = get<Mod>("mod.csv");
export const getShards = get<Shard>("shard.csv");
export const getAreas = get<Area>("area.csv");
export const getPerformance = get<Performance>("performance.csv");
export const getItems = get<Item>("item.csv");

