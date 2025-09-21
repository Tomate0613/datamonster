import { getMerged, type Merged } from "./csv";
import fs from "fs";
import { getColor, mapCanvas } from "./map";
import { mean, median } from "./math";

async function renderChartToPNG(
  data: Merged[],
  outputFilename: string,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  showNames: boolean = true,
) {
  const scale = 2;
  const { ctx, canvas } = await mapCanvas(fromX, fromZ, toX, toZ, scale);

  ctx.lineWidth = 2;

  const collected = data.map((p) => +p.collected);
  const minCollected = Math.min(...collected);
  const maxCollected = Math.max(...collected);
  const colors = ["r", "g", "b"] as const;

  console.log(minCollected, maxCollected);
  console.log(mean(collected));
  console.log(median(collected));

  data
    .sort((a, b) => +b.collected - +a.collected)
    .forEach((point) => {
      // const radius = +point.collected * 0.1;
      const radius = 30;

      const x = (0.5 * (+point.X + +point.wX) - fromX) * scale;
      const z = (0.5 * (+point.Z + +point.wZ) - fromZ) * scale;

      ctx.fillStyle = getColor(
        minCollected,
        maxCollected,
        +point.collected,
        colors,
        0.5,
      );
      ctx.strokeStyle = getColor(
        minCollected,
        maxCollected,
        +point.collected,
        colors,
        0.9,
      );

      ctx.beginPath();
      ctx.arc(x, z, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "black";

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // const text = point.collected;

      if (showNames) {
        ctx.fillText(point.collected, x, z + 5);
        ctx.fillText(point.name, x, z - 5);
      } else {
        ctx.fillText(point.collected, x, z);
      }
    });

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFilename, buffer);
  console.log(`Chart saved as ${outputFilename}`);
}

async function run() {
  const mergedData = await getMerged();

  const outputFilename = "shards.png";
  await renderChartToPNG(mergedData, outputFilename, -512, -512, 1023, 1023);
}

run().catch((error) => console.error("Error:", error));
