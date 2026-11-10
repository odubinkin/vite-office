/** @fileoverview Packages pinned ICU dictionary bytes with LibreOffice's Khmer replacement. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [buildDirectory, mode] = process.argv.slice(2);
if (!buildDirectory || (mode !== undefined && mode !== "--check"))
  throw new Error(
    "Usage: node scripts/writer-native-word-dictionaries.mjs <ICU build directory> [--check]",
  );
const source = resolve(root, buildDirectory, "data/out/build/icudt78l/brkitr");
const target = resolve(root, "apps/office/src/external/icu/source/data/brkitr");
if (mode !== "--check") mkdirSync(target, { recursive: true });

for (const name of ["thaidict", "laodict", "burmesedict", "khmerdict", "cjdict"]) {
  const file = `${name}.dict`;
  const input =
    name === "khmerdict"
      ? resolve(root, "vendor/libreoffice-reference/external/icu", file)
      : resolve(source, file);
  const bytes = readFileSync(input);
  if (bytes[8] !== 0 || bytes.toString("ascii", 12, 16) !== "Dict" || bytes[16] !== 1)
    throw new Error(`Unexpected pinned ICU dictionary format for ${name}`);
  const output = resolve(target, file);
  if (mode === "--check") {
    if (!bytes.equals(readFileSync(output)))
      throw new Error(`Pinned ICU dictionary differs for ${name}`);
  } else writeFileSync(output, bytes);
}
