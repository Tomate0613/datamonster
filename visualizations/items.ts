import { getItems } from "./csv";

async function run() {
  const items = await getItems();

  const sorted = items
    .filter((item) => item.name_has_translation)
    .sort((a, b) => b.name.length - a.name.length);

  console.log(sorted);
}

run();
