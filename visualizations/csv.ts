import * as fastcsv from "fast-csv";
import fs from "fs";

export type CSV<T extends string[]> = { [K in T[number]]: string };
export type GenericCsv = CSV<string[]>;

async function parseCsv<T extends GenericCsv>(
  filename: string,
  delimiter = ",",
): Promise<T[]> {
  return new Promise((resolve) => {
    const results: any[] = [];
    fs.createReadStream(filename)
      .pipe(fastcsv.parse({ headers: true, delimiter }))
      .on("data", (row) => results.push(row))
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

function get<T extends GenericCsv>(filename: string) {
  return () => parseCsv<T>(filename);
}


export type ModfestEntry = CSV<['Mod', 'X', 'Z', 'wX', 'wZ']>;
export type Mod = CSV<["id", "name", "description", "authors", "version"]>;
export type Shard = CSV<["id", "name", "lore", "type", "collected"]>;
export type Area = CSV<["id", "priority", "type", "minX", "minY", "minZ", "maxX", "maxY", "maxZ"]>;
export type Performance = CSV<["minRenderTimeMs","maxRenderTimeMs","x","totalSamples","z","avgRenderTimeMs"]>;
export type Merged = ModfestEntry & Shard;


export const getModfest = get<ModfestEntry>('mf.csv');
export const getMods = get<Mod>('mf.csv');
export const getShards = get<Shard>('shard.csv');
export const getAreas = get<Area>('area.csv');
export const getMerged = get<Merged>('merged.csv');
export const getPerformance = get<Performance>('performance.csv');

