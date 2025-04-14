import { getMerged, type Merged } from "./csv";
import fs from "fs";
import { mapCanvas } from "./map";

async function renderChartToPNG(
  data: Merged[],
  outputFilename: string,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  const { ctx, canvas } = await mapCanvas(fromX, fromZ, toX, toZ);

  ctx.fillStyle = "rgba(255, 99, 132, 0.5)";
  ctx.strokeStyle = "rgba(255, 99, 132, 1)";
  ctx.lineWidth = 2;

  data.forEach((point) => {
    const radius = +point.collected * 0.3;

    const x = 0.5 * (+point.X + +point.wX) - fromX;
    const z = 0.5 * (+point.Z + +point.wZ) - fromZ;

    ctx.fillStyle = "rgba(255, 99, 132, 0.5)";

    ctx.beginPath();
    ctx.arc(x, z, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "black";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = point.Mod + " (" + point.collected + ")";

    ctx.fillText(text, x, z);
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
