/** @fileoverview Compiles Writer's pinned LibreOffice dictionary rules with an existing ICU 78.3 build. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [buildDirectory, mode] = process.argv.slice(2);
if (!buildDirectory || (mode !== undefined && mode !== "--check"))
  throw new Error(
    "Usage: node scripts/writer-native-word-rules.mjs <ICU build directory> [--check]",
  );
const build = resolve(root, buildDirectory);
const output = resolve(root, "output/playwright/rtf-properties-native/compiled-word-rules");
const source = resolve(root, "vendor/libreoffice-reference/i18npool/source/breakiterator/data");
const target = resolve(
  root,
  "apps/office/src/i18npool/source/breakiterator/data/dict-word.brk.json",
);
mkdirSync(output, { recursive: true });

const data = {};
for (const name of ["dict_word", "dict_word_hu", "dict_word_prepostdash"]) {
  const compiled = resolve(output, `${name}.brk`);
  execFileSync(resolve(build, "bin/genbrk"), [
    "-i",
    resolve(build, "data/out/tmp"),
    "-r",
    resolve(source, `${name}.txt`),
    "-o",
    compiled,
  ]);
  const bytes = readFileSync(compiled);
  if (bytes[8] !== 0 || bytes.toString("ascii", 12, 16) !== "Brk " || bytes[16] !== 6)
    throw new Error(`Unexpected ICU break data format for ${name}`);
  data[name] = bytes.toString("base64");
}
const json = `${JSON.stringify(data, null, 2)}\n`;
if (mode === "--check") {
  if (json !== readFileSync(target, "utf8"))
    throw new Error("Compiled dictionary rules differ from the tracked native data.");
} else {
  mkdirSync(resolve(target, ".."), { recursive: true });
  writeFileSync(target, json);
}
