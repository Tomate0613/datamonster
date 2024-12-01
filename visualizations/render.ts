import { createCanvas, loadImage } from "canvas";
import * as fs from "fs";
import * as fastcsv from "fast-csv";

// Parse CSV file to extract merged data
async function parseCsv(filename: string, delimiter: string) {
  return new Promise((resolve) => {
    const results: any[] = [];
    fs.createReadStream(filename)
      .pipe(fastcsv.parse({ headers: true, delimiter }))
      .on("data", (row) => results.push(row))
      .on("end", () => resolve(results));
  });
}

// Prepare the data by extracting relevant fields (e.g., X, Y, Z, collected)
// Render the chart to a PNG image
async function renderChartToPNG(
  data: any[],
  outputFilename: string,
  fromX: number,
  toX: number,
  fromZ: number,
  toZ: number,
) {
  const canvasWidth = toX - fromX;
  const canvasHeight = toZ - fromZ;

  // Create a canvas
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // Background color (optional)
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const backgroundImage = await loadImage("background.png");

  // Draw the background image scaled to fit the entire canvas
  ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);

  // Set some basic drawing styles
  ctx.fillStyle = "rgba(255, 99, 132, 0.5)";
  ctx.strokeStyle = "rgba(255, 99, 132, 1)";
  ctx.lineWidth = 2;

  // Draw circles for each data point
  data.forEach((point) => {
    // Scale the radius based on collected value
    //const radius = Math.sqrt(point.collected) * 2; // Scaling factor for the circle size
    const radius = point.collected * 0.3; // Scaling factor for the circle size

    const x = 0.5 * (+point.X + +point.wX) - fromX;
    const z = 0.5 * (+point.Z + +point.wZ) - fromZ;

    ctx.fillStyle = "rgba(255, 99, 132, 0.5)";

    // Draw a circle at (x, y) with the calculated radius
    ctx.beginPath();
    ctx.arc(x, z, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "black";

    ctx.textAlign = "center";
    ctx.fillText(point.Mod, x, z - radius - 10);
  });

  // Save the chart as a PNG file
  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(outputFilename, buffer);
  console.log(`Chart saved as ${outputFilename}`);
}

async function run() {
  // Load the merged CSV data
  const mergedData = (await parseCsv("merged.csv", ",")) as any; // Adjust file name if necessary

  // Prepare the data (e.g., X, Y, Z, collected)
  // Render and save the chart as a PNG
  const outputFilename = "collected_position_visualization.png"; // Output file name
  await renderChartToPNG(mergedData, outputFilename, -3600, -2577, -1904, -881);
}

run().catch((error) => console.error("Error:", error));
