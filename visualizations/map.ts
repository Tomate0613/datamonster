import { createCanvas, loadImage } from "canvas";

export async function mapCanvas(
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

  return { canvas, ctx };
}
