/** @fileoverview Captures unchanged ICU78.3 default bidi levels and all Unicode bidi properties; compares every captured level with the consumed TypeScript source port. Run with tsx after building the original common library and icu-bidi-witness.cc. */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolveDefaultBidiLevels } from "../apps/office/src/external/icu/source/common/ubidi.ts";
import {
  ubidi_getClass,
  ubidi_getPairedBracketType,
  ubidi_getPairedBracket,
} from "../apps/office/src/external/icu/source/common/ubidi_props.ts";
const root = "output/playwright/writer-full-checkpoint",
  binary = `${root}/6764KT-bidi-native-build/bidi-witness`;
/** Digests complete witness bytes. @param bytes - Original bytes. @returns SHA256. */
function sha(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
const paths = [
  "source/common/ubidi.cpp",
  "source/common/ubidiln.cpp",
  "source/common/ubidiimp.h",
  "source/common/ubidi_props.cpp",
  "source/common/ubidi_props.h",
  "source/common/ubidi_props_data.h",
  "source/test/testdata/BidiCharacterTest.txt",
];
const sourceHashes = Object.fromEntries(
  paths.map(
    /** Captures full original source identity. @param path - ICU-relative path. @returns Hash pair. */ (
      path,
    ) => [path, sha(readFileSync(`vendor/icu-reference/${path}`))],
  ),
);
const cases = [];
for (const line of readFileSync(
  "vendor/icu-reference/source/test/testdata/BidiCharacterTest.txt",
  "utf8",
).split("\n")) {
  if (!line || line.startsWith("#")) continue;
  const fields = line.split(";"),
    initial = Number(fields[1]);
  if (initial !== 0 && initial !== 1) continue;
  cases.push({
    text: String.fromCodePoint(
      ...fields[0]
        .trim()
        .split(/\s+/)
        .map(
          /** Decodes actual Unicode test code points. @param value - Hex value. @returns Scalar. */ (
            value,
          ) => parseInt(value, 16),
        ),
    ),
    initial,
  });
}
const conformanceCount = cases.length;
const chars = [
  0x61, 0x5d0, 0x31, 0x2b, 0x24, 0x660, 0x2c, 0x2029, 9, 32, 0x28, 0x29, 0x5b, 0x5d, 0x7b, 0x7d,
  0x2329, 0x232a, 0x3008, 0x3009, 0x202a, 0x202b, 0x202c, 0x202d, 0x202e, 0x627, 0x300, 0, 0x2066,
  0x2067, 0x2068, 0x2069, 0x200e, 0x200f, 0x1f600, 0xd800, 0xdc00, 13, 10,
];
let seed = 0x6764ab;
for (let k = 0; k < 2000; ++k) {
  let text = "";
  for (let j = 0; j < k % 61; ++j) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    text += String.fromCodePoint(chars[seed % chars.length]);
  }
  cases.push({ text, initial: k % 2 });
}
for (const initial of [0, 1])
  for (const depth of [1, 2, 124, 125, 126, 130, 260])
    for (const controls of [
      ["\u202a", "\u202c"],
      ["\u202b", "\u202c"],
      ["\u2066", "\u2069"],
      ["\u2067", "\u2069"],
      ["\u2068", "\u2069"],
    ]) {
      cases.push({
        text: `a${controls[0].repeat(depth)}א(b)1${controls[1].repeat(depth)}z\r\nא[abc]`,
        initial,
      });
      cases.push({ text: `${controls[0].repeat(depth)}אב`, initial });
    }
for (const initial of [0, 1])
  for (const text of [
    "\u2068".repeat(130) + "a",
    "a\r\nא",
    "\u2067".repeat(130) + "\u202aa\u202c",
    "\u2067".repeat(130) + "\u202ca",
  ])
    cases.push({ text, initial });
const input =
  cases
    .map(
      /** Serializes exact UTF16 units to the original API witness. @param item - Actual case. @returns Witness input. */ (
        item,
      ) =>
        `${item.initial} ${Array.from({ length: item.text.length }, /** Reads one UTF16 unit,including lone surrogates. @param _unused - Unused value. @param index - Unit index. @returns Hex unit. */ (_unused, index) => item.text.charCodeAt(index).toString(16)).join(" ")}`,
    )
    .join("\n") + "\n";
const native = execFileSync(binary, [], { input, maxBuffer: 128 * 1024 * 1024, encoding: "utf8" })
  .trimEnd()
  .split("\n");
if (native.length !== cases.length) throw new Error("Native witness lost cases");
const failures = [],
  vectors = [];
for (let i = 0; i < cases.length; ++i) {
  const [count, values] = native[i].split("|"),
    levels = values ? values.split(" ").map(Number) : [],
    item = cases[i],
    actual = resolveDefaultBidiLevels(item.text, item.initial);
  const runs =
    actual.length === 0
      ? 0
      : 1 +
        actual
          .slice(1)
          .filter(
            /** Counts actual logical level changes. @param level - Current level. @param index - Previous index. @returns Whether changed. */ (
              level,
              index,
            ) => level !== actual[index],
          ).length;
  if (JSON.stringify(actual) !== JSON.stringify(levels) || runs !== Number(count)) {
    if (failures.length < 10) failures.push({ ...item, expected: levels, actual, runs, count });
  }
  if (i < 400 || i % 500 === 0 || i >= conformanceCount)
    vectors.push({
      initial: item.initial,
      units: Array.from(
        { length: item.text.length },
        /** Stores exact code units because the build JSON transformer rejects lone-surrogate string escapes. @param _unused - Unused value. @param index - Actual UTF16 index. @returns Unit. */
        (_unused, index) => item.text.charCodeAt(index),
      ),
      levels,
      count: Number(count),
    });
}
const nativeProps = execFileSync(binary, ["--properties"], { maxBuffer: 32 * 1024 * 1024 }),
  actualProps = Buffer.alloc(0x110000 * 12);
for (let c = 0; c <= 0x10ffff; ++c) {
  actualProps.writeUInt32LE(ubidi_getClass(c), c * 12);
  actualProps.writeUInt32LE(ubidi_getPairedBracketType(c), c * 12 + 4);
  actualProps.writeUInt32LE(ubidi_getPairedBracket(c), c * 12 + 8);
}
const report = {
  baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
  icuVersion: "78.3",
  sourceHashes,
  conformanceCount,
  count: cases.length,
  propertyCount: 0x110000,
  propertySha256: sha(nativeProps),
  actualPropertySha256: sha(actualProps),
  failures,
};
writeFileSync(`${root}/6764KT-bidi-native-comparison.json`, JSON.stringify(report, null, 2) + "\n");
if (failures.length || report.propertySha256 !== report.actualPropertySha256) {
  process.stderr.write(JSON.stringify(report, null, 2) + "\n");
  process.exitCode = 1;
} else {
  writeFileSync(
    "apps/office/src/external/icu/source/common/native-bidi-vectors.json",
    JSON.stringify({ ...report, vectors }) + "\n",
  );
  process.stdout.write(JSON.stringify({ ...report, fixtureCount: vectors.length }) + "\n");
}
