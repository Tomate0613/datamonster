import { getItems } from "./csv";

async function run() {
  const items = await getItems();

  const sorted = items
    .filter((item) => item.name_has_translation)
    .filter((item) => !item.name.startsWith("item.")) // TODO Fix name_has_translation so this isn't needed
    .sort((a, b) => b.name.length - a.name.length);

  const head = sorted.slice(0, 5);
  const tail = sorted.slice(-5);

  console.log("Longest item names");
  console.log(head);

  console.log("Shortest item names");
  console.log(tail);
}

run();
