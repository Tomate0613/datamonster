import fs from "fs";
import { getColor, mapCanvas } from "./map";
import { mean, median } from "./math";
import { mapInfo, submissions } from "./data/data";
import { getShards, Shard } from "./csv";

function stats(collected: number[]) {
  const minCollected = Math.min(...collected);
  const maxCollected = Math.max(...collected);

  console.log("Min", minCollected);
  console.log("Max", maxCollected);
  console.log("Mean", mean(collected));
  console.log("Median", median(collected));

  return { minCollected, maxCollected };
}

function title(...args: any[]) {
  const placeholders = args.map(() => "%s").join(" ");
  console.log(`\x1b[34m\x1b[1m${placeholders}\x1b[0m`, ...args);
}

function green(string: string) {
  return `\x1b[32m${string}\x1b[0m`
}

async function renderAll() {
  const shards = await getShards();
  title("All");
  stats(shards.map((shard) => +shard.collected));

  const modIds: string[] = [];
  const mergedMax = submissions.map((submission) => {
    modIds.push(submission.mod_id);
    const modShards = shards.filter((shard) => shard.id == submission.mod_id);
    const shard = modShards.reduce((max, obj) =>
      +obj.collected > +max.collected ? obj : max,
    );
    return { submission, shard };
  });

  const mergedMin = submissions.map((submission) => {
    const modShards = shards.filter((shard) => shard.id == submission.mod_id);
    const shard = modShards.reduce((min, obj) =>
      +obj.collected < +min.collected ? obj : min,
    );
    return { submission, shard };
  });

  title("\nExtra Shards");
  const nonSubmissionShards = shards.filter(
    (shard) => !modIds.includes(shard.id),
  );
  for (const shard of nonSubmissionShards) {
    console.log(`${shard.name} {${shard.lore}} (${shard.collected})`);
  }

  title("\nSubmission Max");
  await render(mergedMax, "out/shards_max.png", true, 2);
  title("\nSubmission Min");
  await render(mergedMin, "out/shards_min.png", true, 2);
}

type Submission = (typeof submissions)[number];

async function render(
  merged: { shard: Shard; submission: Submission }[],
  outputFilename: string,
  showNames: boolean,
  scale: number,
) {
  const { ctx, canvas } = await mapCanvas(
    mapInfo.minX,
    mapInfo.minZ,
    mapInfo.maxX,
    mapInfo.maxZ,
    scale,
  );

  ctx.lineWidth = 2;
  const colors = ["r", "g", "b"] as const;
  const { minCollected, maxCollected } = stats(
    merged.map((p) => +p.shard.collected),
  );

  merged
    .sort((a, b) => +b.shard.collected - +a.shard.collected)
    .forEach(({ submission, shard }) => {
      const radius = 30;

      const x = (submission.booth_data.marker_pos.x - mapInfo.minX) * scale;
      const z = (submission.booth_data.marker_pos.z - mapInfo.minZ) * scale;

      ctx.fillStyle = getColor(
        minCollected,
        maxCollected,
        +shard.collected,
        colors,
        0.5,
      );
      ctx.strokeStyle = getColor(
        minCollected,
        maxCollected,
        +shard.collected,
        colors,
        0.5,
      );

      ctx.beginPath();
      ctx.arc(x, z, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "black";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (showNames) {
        ctx.fillText(shard.collected, x, z + 5);
        ctx.fillText(submission.name, x, z - 5);
      } else {
        ctx.fillText(shard.collected, x, z);
      }
    });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFilename, buffer);
  console.log(`Saved as ${green(outputFilename)}`);
}

async function run() {
  await renderAll();
}

run().catch((error) => console.error("Error:", error));
