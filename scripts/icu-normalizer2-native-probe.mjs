/** @fileoverview Compares the original ICU NFKC owner with the managed port on every scalar and the pinned conformance corpus. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";
import { getNFKCInstance } from "../apps/office/src/external/icu/source/common/unicode/normalizer2.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";

const source = resolve("vendor/icu-reference/source");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "normalizer2-witness");
mkdirSync(root, { recursive: true });
const cpp = String.raw`
#include <cstdint>
#include <iostream>
#include "unicode/normalizer2.h"
#include "unicode/putil.h"
#include "unicode/unistr.h"

using namespace icu;

uint32_t mix(uint32_t hash, uint32_t x) {
    return (hash ^ x) * 16777619U;
}

int main(int argc, char **argv) {
    if (argc != 2) return 2;
    u_setDataDirectory(argv[1]);
    UErrorCode status = U_ZERO_ERROR;
    const auto *nfkc = Normalizer2::getNFKCInstance(status);
    if (U_FAILURE(status) || nfkc == nullptr) return 3;
    UnicodeString input, output;
    for (int32_t base = 0; base < 0x110000; base += 0x1000) {
        uint32_t hash = 2166136261U;
        for (int32_t c = base; c < base + 0x1000; ++c) {
            input.remove().append(c);
            bool isNormalized = nfkc->isNormalized(input, status);
            nfkc->normalize(input, output, status);
            hash = mix(hash, nfkc->hasBoundaryBefore(c));
            hash = mix(hash, isNormalized);
            hash = mix(hash, output.length());
            for (int32_t i = 0; i < output.length(); ++i) hash = mix(hash, output.charAt(i));
        }
        std::cout << "S " << hash << '\n';
    }
    int32_t len;
    while (std::cin >> len) {
        input.remove();
        for (int32_t i = 0, c; i < len; ++i) {
            std::cin >> c;
            input.append(static_cast<char16_t>(c));
        }
        bool isNormalized = nfkc->isNormalized(input, status);
        nfkc->normalize(input, output, status);
        if (U_FAILURE(status)) return 4;
        std::cout << "N " << isNormalized << ' ' << output.length();
        for (int32_t i = 0; i < output.length(); ++i) std::cout << ' ' << uint16_t(output.charAt(i));
        std::cout << '\n';
    }
}
`;
writeFileSync(resolve(root, "witness.cpp"), cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    resolve(root, "witness.cpp"),
    resolve(build, "lib/libicuuc.a"),
    resolve(build, "stubdata/libicudata.a"),
    "-o",
    resolve(root, "witness"),
  ],
  { stdio: "inherit" },
);

/** Preserves counted UTF-16 and isolated surrogates in fixture and process input. @param text - Counted value. @returns Original units. */
function units(text) {
  const result = [];
  for (let i = 0; i < text.length; ++i) result.push(text.charCodeAt(i));
  return result;
}

/** Decodes one original Unicode conformance column. @param field - Space separated scalars. @returns UTF-16. */
function conformanceField(field) {
  let result = "";
  for (const cp of field.trim().split(" ")) result += String.fromCodePoint(parseInt(cp, 16));
  return result;
}

const corpus = [];
for (const raw of readFileSync(resolve(source, "data/unidata/NormalizationTest.txt"), "utf8").split(
  "\n",
)) {
  const line = raw.split("#", 1)[0].trim();
  if (!line || line.startsWith("@")) continue;
  const fields = line.split(";");
  const normalized = conformanceField(fields[3]);
  for (let i = 0; i < 5; ++i) corpus.push([conformanceField(fields[i]), normalized]);
}
const samples = [
  "",
  "ｶﾞ東京",
  "ｶﾀｶﾅ",
  "㍿",
  "神",
  "한글",
  "Ａ\u0301",
  "𠮷野家",
  "\u1100\u1161\u11a7",
  "\u1100\u1161\u0301\u11a7",
  "\u1100\u1161\u3131",
  "\u1100\u1161\u11a8\u11a7",
  "A\u0301\u0327\0ｶﾞ",
  "\ud800\u0301\udc00",
  "\ud800x\udc00",
  "\u00c5\u0323\u0345\u0315",
  "\u03b1\u0345\u0300",
  "\u0f73\u0f71\u0f72",
  "\u{11347}\u{11357}",
  "\u{1611e}\u{16123}\u{16125}",
];
let seed = 0x31415926;
/** Deterministic uint32 input generator. @returns Next seeded word. */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
const clusters = [
  0x41, 0x61, 0x5a, 0xc5, 0xe9, 0x301, 0x302, 0x308, 0x315, 0x327, 0x323, 0x34f, 0x345, 0x1f00,
  0x3b1, 0x1100, 0x1161, 0x11a7, 0x11a8, 0x3131, 0x314f, 0xac00, 0xac01, 0xff76, 0xff9e, 0x3099,
  0x30ab, 0x20, 0, 0xd800, 0xdc00, 0x1d165, 0x11347, 0x11357, 0x16123,
];
const adversarial = [];
for (let i = 0; i < 4096; ++i) {
  let text = "";
  const length = (random() >>> 24) % 16;
  for (let j = 0; j < length; ++j) {
    const key = random() >>> 16;
    text += String.fromCodePoint(
      key % 5 === 0 ? random() % 0x110000 : clusters[key % clusters.length],
    );
  }
  adversarial.push(text);
}

let input = "";
for (const [text] of corpus) {
  const list = units(text);
  input += `${list.length} ${list.join(" ")}\n`;
}
for (const text of [...samples, ...adversarial]) {
  const list = units(text);
  input += `${list.length} ${list.join(" ")}\n`;
}
const native = execFileSync(resolve(root, "witness"), [resolve(source, "data/in")], {
  input,
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});
const nativeScalars = [];
const nativeStrings = [];
for (const line of native.trimEnd().split("\n")) {
  const [op, ...fields] = line.split(" ");
  if (op === "S") nativeScalars.push(Number(fields[0]));
  else if (op === "N") nativeStrings.push(fields.map(Number));
}
if (
  nativeScalars.length !== 272 ||
  nativeStrings.length !== corpus.length + samples.length + adversarial.length
)
  throw new Error("Incomplete native NFKC observations");

const status = [0];
const nfkc = getNFKCInstance(status);
if (nfkc === null || status[0] !== 0)
  throw new Error("Unable to load original NFKC data " + status[0]);
const dest = new UnicodeString();

/** Returns the original witness row over the actual TypeScript normalization owner. @param text - Input. @returns Exact flags and code units. */
function observe(text) {
  const src = new UnicodeString(text, text.length);
  const normalized = nfkc.isNormalized(src, status);
  nfkc.normalize(src, dest, status);
  const result = dest.getBuffer();
  if (result === null || status[0] !== 0) throw new Error("Unexpected status " + status[0]);
  return [Number(normalized), result.length, ...units(result)];
}

/** Native digest over UTF-16 units and flags. @param hash - Running hash. @param word - Next value. @returns Unsigned digest. */
function mix(hash, word) {
  return Math.imul(hash ^ word, 16777619) >>> 0;
}
for (let base = 0; base < 0x110000; base += 0x1000) {
  let hash = 2166136261;
  for (let c = base; c < base + 0x1000; ++c) {
    hash = mix(hash, Number(nfkc.hasBoundaryBefore(c)));
    for (const value of observe(String.fromCodePoint(c))) hash = mix(hash, value);
  }
  if (hash !== nativeScalars[base >>> 12])
    throw new Error(JSON.stringify({ base, hash, native: nativeScalars[base >>> 12] }));
}
for (const [i, [text, expected]] of corpus.entries()) {
  const actual = observe(text);
  const official = [Number(text === expected), expected.length, ...units(expected)];
  if (
    JSON.stringify(actual) !== JSON.stringify(nativeStrings[i]) ||
    JSON.stringify(actual) !== JSON.stringify(official)
  )
    throw new Error(
      JSON.stringify({ i, source: units(text), actual, native: nativeStrings[i], official }),
    );
}
const portable = [];
for (const [index, text] of [...samples, ...adversarial].entries()) {
  const expected = nativeStrings[corpus.length + index];
  const actual = observe(text);
  if (JSON.stringify(actual) !== JSON.stringify(expected))
    throw new Error(JSON.stringify({ index, source: units(text), actual, expected }));
  if (index < samples.length) portable.push({ units: units(text), expected });
}

const path = resolve(
  "apps/office/src/external/icu/source/common/normalizer2.native-observations.json",
);
const bytes = await format(
  JSON.stringify({ icuVersion: "78.3", scalarDigests: nativeScalars, samples: portable }),
  {
    ...(await resolveConfig(path)),
    parser: "json",
  },
);
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== bytes) throw new Error("Pinned NFKC observations differ");
} else writeFileSync(path, bytes);
console.log(
  `Matched 1114112 scalar cases, ${corpus.length} conformance columns and ${samples.length + adversarial.length} targeted cases`,
);
