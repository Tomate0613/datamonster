import fs from "node:fs";

export function dirs() {
  ensure("out");
  ensure("data");
}

function ensure(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
