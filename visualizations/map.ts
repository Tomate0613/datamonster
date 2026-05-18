import { createCanvas, loadImage } from "canvas";
import fs from "node:fs";
import { green } from "./color";

export async function mapCanvas(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  scale: number = 1,
) {
  const canvasWidth = (toX - fromX) * scale;
  const canvasHeight = (toZ - fromZ) * scale;

  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const backgroundImage = await loadImage("data/background.png");

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  function transformScale(dx: number, dy: number): [number, number];
  function transformScale(d: number): number;
  function transformScale(x: number, z?: number) {
    if (z !== undefined) {
      return [x * scale, z * scale] as const;
    }

    return x * scale;
  }

  return {
    canvas,
    ctx,
    transformPosition(x: number, z: number) {
      return [(x - fromX) * scale, (z - fromZ) * scale] as const;
    },
    transformScale,
    save(filename: string) {
      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(filename, buffer);
      console.log(`Saved as ${green(filename)}`);
    },
  };
}

type Color = "r" | "g" | "b";
export function getColor(
  min: number,
  max: number,
  current: number,
  colors: readonly [Color, Color, Color],
  transparency: number = 0.9,
): string {
  const t = (current - min) / (max - min);

  let c = {
    r: 0,
    g: 0,
    b: 0,
  };

  if (t < 0.5) {
    // Green -> Red
    const ratio = t / 0.5;
    c[colors[0]] = Math.floor(255 * (1 - ratio));
    c[colors[1]] = Math.floor(255 * ratio);
  } else {
    // Red -> Blue
    const ratio = (t - 0.5) / 0.5;
    c[colors[1]] = Math.floor(255 * (1 - ratio));
    c[colors[2]] = Math.floor(255 * ratio);
  }

  return `rgba(${c.r},${c.g},${c.b},${transparency})`;
}
