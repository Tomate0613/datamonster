import { getPerformance, type Performance } from "./csv";
import { mapCanvas } from "./map";
import { mapInfo } from "./data/data";

const GRID_SIZE = 16;

async function renderChartToPNG(
  data: Performance[],
  outputFilename: string,
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
) {
  const { ctx, transformPosition, transformScale, save } =
    await mapCanvas(fromX, fromZ, toX, toZ);

  ctx.fillStyle = "rgba(255, 99, 132, 0.5)";
  ctx.strokeStyle = "rgba(255, 99, 132, 1)";
  ctx.lineWidth = 2;

  const times = data.map((p) => +p.avgRenderTimeMs);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);

  function getColor(renderTime: number): string {
    const t = (renderTime - minTime) / (maxTime - minTime);

    let r = 0;
    let g = 0;
    let b = 0;

    if (t < 0.5) {
      // Green -> Red
      const ratio = t / 0.5;
      r = Math.floor(255 * ratio);
      g = Math.floor(255 * (1 - ratio));
    } else {
      // Red -> Blue
      const ratio = (t - 0.5) / 0.5;
      r = Math.floor(255 * (1 - ratio));
      b = Math.floor(255 * ratio);
    }

    return `rgba(${r},${g},${b},0.9)`;
  }

  for (const point of data) {
    const color = getColor(+point.avgRenderTimeMs);

    const [x, z] = transformPosition(+point.x, +point.z);
    const sideLength = transformScale(GRID_SIZE);

    ctx.fillStyle = color;

    ctx.beginPath();
    ctx.rect(x, z, sideLength, sideLength);
    ctx.fill();

    ctx.fillStyle = "black";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `10px sans-serif`;

    const text = "" + Math.round(+point.avgRenderTimeMs);

    ctx.fillText(text, x + sideLength / 2, z + sideLength / 2);
  }

  save(outputFilename);
}

async function run() {
  const data = await getPerformance();

  const outputFilename = "out/performance.png";
  await renderChartToPNG(
    data.filter((point) => +point.totalSamples > 20),
    outputFilename,
    mapInfo.minX,
    mapInfo.minZ,
    mapInfo.maxX,
    mapInfo.maxZ,
  );
}

run().catch((error) => console.error("Error:", error));
