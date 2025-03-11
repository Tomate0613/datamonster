import { createCanvas, loadImage, type CanvasRenderingContext2D } from "canvas";
import { getMerged } from "./csv";
import fs from "fs";

function fitTextInCircle(
  ctx: CanvasRenderingContext2D,
  text: string,
  radius: number,
) {
  let fontSize = 10;

  do {
    ctx.font = `${fontSize}px sans-serif`;
    const textWidth = ctx.measureText(text).width;

    if (textWidth <= 2 * radius) {
      break;
    }

    fontSize -= 1;
  } while (fontSize > 0);

  return fontSize;
}

async function renderChartToPNG(
  data: any[],
  outputFilename: string,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  const canvasWidth = toX - fromX;
  const canvasHeight = toZ - fromZ;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const backgroundImage = await loadImage("background.png");

  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = "rgba(255, 99, 132, 0.5)";
  ctx.strokeStyle = "rgba(255, 99, 132, 1)";
  ctx.lineWidth = 2;

  data.forEach((point) => {
    const radius = point.collected * 0.3; // Scaling factor for the circle size

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
