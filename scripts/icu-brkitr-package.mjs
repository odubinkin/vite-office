/** @fileoverview Extracts original brkitr data and repackages the unchanged images with native gencmn. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const archive = readFileSync("vendor/icu-reference/source/data/in/icudt78l.dat");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "brkitr-common-data");
mkdirSync(root, { recursive: true });
const toc = archive.readUInt16LE(0);
if (archive.toString("ascii", 12, 16) !== "CmnD") throw new Error("Expected a native CmnD archive");
const count = archive.readUInt32LE(toc);
const files = [];
for (let i = 0; i < count; ++i) {
  const nameOffset = toc + archive.readUInt32LE(toc + 4 + i * 8);
  const name = archive.toString("ascii", nameOffset, archive.indexOf(0, nameOffset));
  if (!name.startsWith("icudt78l/brkitr/")) continue;
  const file = name.slice("icudt78l/".length);
  const start = toc + archive.readUInt32LE(toc + 8 + i * 8);
  const end = i + 1 < count ? toc + archive.readUInt32LE(toc + 16 + i * 8) : archive.length;
  const path = resolve(root, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, archive.subarray(start, end));
  files.push(file);
}
const manifest = resolve(root, "brkitr.lst");
writeFileSync(manifest, files.join("\n") + "\n");
execFileSync(
  resolve(build, "bin/gencmn"),
  ["-n", "icudt78l", "-s", root, "-d", root, "0", manifest],
  { cwd: root },
);
const packaged = readFileSync(resolve(root, "icudt78l.dat"));
const artifact =
  JSON.stringify(
    {
      sourceSha256: createHash("sha256").update(archive).digest("hex"),
      dataSha256: createHash("sha256").update(packaged).digest("hex"),
      data: packaged.toString("base64"),
    },
    null,
    2,
  ) + "\n";
const output = "apps/office/src/external/icu/source/data/in/icudt78l.brkitr.package.json";
if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== artifact) throw new Error("Pinned brkitr package differs");
} else writeFileSync(output, artifact);
console.log(`Packaged ${files.length} original brkitr files, ${packaged.length} bytes`);
