/** @fileoverview Read-only ICU Unicode corpus audit for native JavaScript NFD/NFC and Mark removal in Node and Chromium; writes evidence only to the requested repository output directory. */
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "@playwright/test";
/** Serializable reference input independent of each runtime's normalization implementation. */
interface Corpus {
  rows: string[][];
  marks: number[];
}
/** Executes the Unicode17 NFD/NFC conformance invariants and exact Mark membership in a JavaScript realm. @param corpus - Parsed ICU reference data. @returns Counts and bounded mismatch witnesses. */
function audit(corpus: Corpus) {
  let assertions = 0,
    normalizationFailures = 0,
    markFailures = 0;
  const mismatches: string[] = [];
  for (const row of corpus.rows) {
    for (let i = 0; i < 5; i++) {
      const source = row[i] as string;
      for (const [form, want] of [
        ["NFC", i < 3 ? row[1] : row[3]],
        ["NFD", i < 3 ? row[2] : row[4]],
      ] as const) {
        assertions++;
        if (source.normalize(form) !== want) {
          normalizationFailures++;
          if (mismatches.length < 10) mismatches.push(JSON.stringify({ source, form, want }));
        }
      }
    }
  }
  const marks = new Set(corpus.marks);
  for (let codepoint = 0; codepoint <= 0x10ffff; codepoint++) {
    if (/\p{M}/u.test(String.fromCodePoint(codepoint)) !== marks.has(codepoint)) {
      markFailures++;
      if (mismatches.length < 10) mismatches.push("Mark mismatch U+" + codepoint.toString(16));
    }
  }
  return {
    rows: corpus.rows.length,
    assertions,
    normalizationFailures,
    markCodepoints: marks.size,
    categoryAssertions: 0x110000,
    markFailures,
    mismatches,
  };
}
const source = process.argv[2],
  destination = process.argv[3];
if (source === undefined || destination === undefined)
  throw Error(
    "Usage: tsx scripts/writer-unicode-normalization-audit.ts <ICU-unidata-dir> <repository-output-dir>",
  );
const normal = await readFile(join(source, "NormalizationTest.txt"), "utf8"),
  data = await readFile(join(source, "UnicodeData.txt"), "utf8");
const corpus: Corpus = { rows: [], marks: [] };
for (const raw of normal.split("\n")) {
  const line = raw.split("#")[0]?.trim();
  if (!line || line.startsWith("@")) continue;
  const row: string[] = [];
  for (const field of line.split(";").slice(0, 5)) {
    let text = "";
    for (const hex of field.trim().split(/\s+/)) text += String.fromCodePoint(parseInt(hex, 16));
    row.push(text);
  }
  corpus.rows.push(row);
}
for (const raw of data.split("\n")) {
  if (!raw) continue;
  const fields = raw.split(";");
  if ((fields[2] as string).startsWith("M")) corpus.marks.push(parseInt(fields[0] as string, 16));
}
const node = audit(corpus),
  browser = await chromium.launch({ headless: true });
let chromiumResult: ReturnType<typeof audit>;
let browserVersion: string;
try {
  browserVersion = browser.version();
  const page = await browser.newPage();
  chromiumResult = await page.evaluate(audit, corpus);
} finally {
  await browser.close();
}
const result = {
  reference: {
    normalizationHeader: normal.split("\n")[0],
    normalizationSha256: createHash("sha256").update(normal).digest("hex"),
    unicodeDataSha256: createHash("sha256").update(data).digest("hex"),
  },
  node: {
    version: process.version,
    icu: process.versions.icu,
    unicode: process.versions.unicode,
    ...node,
  },
  chromium: { version: browserVersion, ...chromiumResult },
};
await mkdir(resolve(destination), { recursive: true });
await writeFile(
  join(destination, "unicode-native-conformance.json"),
  JSON.stringify(result, null, 2) + "\n",
);
console.log(JSON.stringify(result));
if (
  node.normalizationFailures ||
  node.markFailures ||
  chromiumResult.normalizationFailures ||
  chromiumResult.markFailures
)
  process.exitCode = 1;
