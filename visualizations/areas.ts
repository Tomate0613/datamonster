import { getAreas } from "./csv";
import { mapInfo } from "./data/data";
import { mapCanvas } from "./map";

async function render(scale: number) {
  const { ctx, transformPosition, transformScale, save } = await mapCanvas(
    mapInfo.minX,
    mapInfo.minZ,
    mapInfo.maxX,
    mapInfo.maxZ,
    scale,
  );

  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";

  const areas = await getAreas();

  for (const area of areas) {
    area.type;

    if (area.type === "area_lib:box") {
      ctx.rect(
        ...transformPosition(+area.minX, +area.minZ),
        ...transformScale(+area.maxX - +area.minX, +area.maxZ - +area.minZ),
      );
      ctx.stroke();
    }
  }

  save("out/areas.png");
}

async function run() {
  render(2);
}

run().catch((error) => console.error("Error:", error));
