# Datamonster

## Exporting

`/datamonster export` exports all tracked data as a csv in the modpack directory

## Visualizations

### Input

- `mf.CSV` Expects at least (Mod, X, Z, wX, wZ)
- `shard.csv` Export from datamonster
- `background.png`
- minX, maxX, minZ, maxZ in `render.ts` (Currently hardcoded in `run` method)

### Usage
- `pnpm i`
- `pnpm merge` to merge the csv files into `merged.csv`
- `pnpm render` to render the shard distribution
