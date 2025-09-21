import {
  exportToCsv,
  getMappings,
  getModfest,
  getShards,
  Mapping,
  Merged,
  ModfestEntry,
  Shard,
} from "./csv";

function mergeCsvs(
  mf: ModfestEntry[],
  shard: Shard[],
  mapping: Mapping[],
): Merged[] {
  return mapping.map(({ ShardId, ModfestEntryName }) => ({
    ...mf.find(({ Name }) => Name === ModfestEntryName)!,
    ...shard.find(({ id }) => ShardId === id)!,
  }));
}

async function run() {
  const mf = await getModfest();
  const shards = await getShards();
  const mappings = await getMappings();

  console.log("Merging data...");
  const merged = mergeCsvs(mf, shards, mappings);

  exportToCsv(merged, "merged.csv");
  console.log(`Merged data successfully exported to merged.csv`);
}

run();
