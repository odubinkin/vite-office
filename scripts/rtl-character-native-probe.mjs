/** @fileoverview Captures complete original RTL character headers exhaustively, using only lossless generic encoding of observed native rows. */
import { spawnSync, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import {
  upstream,
  pin,
  hash,
  loadUnicodeOriginal,
  configureUnicodeNativeHeaders,
} from "./rtl-ustring-native-sources.mjs";
const target = "output/playwright/rtl-character-native";
const fixture = "apps/office/src/sal/inc/rtl/native-character-cases.json";
const sources = {};
const { types, global } = configureUnicodeNativeHeaders(target, sources);
loadUnicodeOriginal(sources, "include/rtl/character.hxx");
const ascii = [
  "isAscii",
  "isAsciiLowerCase",
  "isAsciiUpperCase",
  "isAsciiAlpha",
  "isAsciiDigit",
  "isAsciiAlphanumeric",
  "isAsciiCanonicHexDigit",
  "isAsciiHexDigit",
  "isAsciiOctalDigit",
  "isAsciiWhiteSpace",
  "toAsciiUpperCase",
  "toAsciiLowerCase",
];
const guards = [
  ...ascii,
  "isSurrogate",
  "isHighSurrogate",
  "isLowSurrogate",
  "getHighSurrogate",
  "getLowSurrogate",
].map(
  /** Describes actual invalid native caller input. @param name - Original function. @returns Caller. */ (
    name,
  ) => ({ name, args: [0x110000], expression: "isUnicodeCodePoint(code)" }),
);
guards.push(
  { name: "getHighSurrogate", args: [0], expression: "code >= 0x10000" },
  { name: "getLowSurrogate", args: [0], expression: "code >= 0x10000" },
  { name: "compareIgnoreAsciiCase", args: [0x110000, 0], expression: "isUnicodeCodePoint(code1)" },
  { name: "compareIgnoreAsciiCase", args: [0, 0x110000], expression: "isUnicodeCodePoint(code2)" },
  { name: "combineSurrogates", args: [0, 0xdc00], expression: "isHighSurrogate(high)" },
  { name: "combineSurrogates", args: [0xd800, 0], expression: "isLowSurrogate(low)" },
  { name: "splitSurrogates", args: [0x110000], expression: "isUnicodeCodePoint(code)" },
  { name: "splitSurrogates", args: [0], pointerNull: true, expression: "output != NULL" },
);
const pointFields = [
  "code",
  "isUnicodeCodePoint",
  ...ascii.slice(0, 10),
  ...ascii.slice(10),
  "isSurrogate",
  "isHighSurrogate",
  "isLowSurrogate",
  "isUnicodeScalarValue",
  "getHighSurrogate",
  "getLowSurrogate",
  "combineSurrogates",
  "splitSurrogates",
  "output0",
  "output1",
];
const boundary = [
  0, 1, 7, 8, 9, 10, 11, 12, 13, 14, 32, 47, 48, 57, 58, 64, 65, 70, 71, 90, 91, 96, 97, 102, 103,
  122, 123, 127, 128, 255, 256, 0xd7ff, 0xd800, 0xdbff, 0xdc00, 0xdfff, 0xe000, 0xffff, 0x10000,
  0x10001, 0x10fffe, 0x10ffff,
];
const conversions = [
  -1, -4294967296, 4294967296, 4294967297, -2147483648, 4294967295, 0x110000, 1099511627776, 0xd800,
  0x10ffff,
];
const driver = String.raw`#include <rtl/character.hxx>
#include <array>
#include <bit>
#include <vector>
#include <iostream>
#include <cstdio>
#include <cstdlib>
#include <string>
static_assert(std::endian::native==std::endian::little);
int main(int argc,char**argv){std::string mode=argc>1?argv[1]:"points";
if(mode=="guard"){sal_Unicode output[2]={0x5555,0xaaaa};int n=std::atoi(argv[2]);volatile sal_uInt32 result=0;switch(n){
${guards
  .map(
    /** Invokes unchanged original functions with only genuine caller inputs. @param c - Caller. @param i - Selector. @returns Native invocation. */ (
      c,
      i,
    ) =>
      `case ${i}:result=rtl::${c.name}(${c.args.map(/** Formats an original integer caller literal. @param v - Original scalar input. @returns Native literal. */ (v) => `sal_uInt32(${v})`).join(",")}${c.name === "splitSurrogates" ? "," + (c.pointerNull ? "nullptr" : "output") : ""});break;`,
  )
  .join("\n")}
}return int(result);}
if(mode=="pairs"){std::cout<<'[';bool comma=false;auto emit=[&](sal_uInt32 a,sal_uInt32 b){if(comma)std::cout<<',';comma=true;std::cout<<'['<<a<<','<<b<<','<<rtl::compareIgnoreAsciiCase(a,b)<<']';};for(sal_uInt32 a=0;a<256;a++)for(sal_uInt32 b=0;b<256;b++)emit(a,b);sal_uInt32 boundaries[]={${boundary.join(",")}};for(auto a:boundaries)for(auto b:boundaries)emit(a,b);std::cout<<']';return 0;}
if(mode=="conversions"){sal_Int64 input[]={${conversions.join(",")}};std::cout<<'[';bool comma=false;for(auto v:input){if(comma)std::cout<<',';comma=true;std::cout<<'['<<v<<','<<rtl::isUnicodeCodePoint(v)<<','<<rtl::isUnicodeScalarValue(v)<<']';}std::cout<<']';return 0;}
if(mode=="constants"){std::cout<<'['<<rtl::detail::surrogatesHighFirst<<','<<rtl::detail::surrogatesHighLast<<','<<rtl::detail::surrogatesLowFirst<<','<<rtl::detail::surrogatesLowLast<<']';return 0;}
for(sal_uInt32 code=0;code<=0x10ffff;code++){sal_Unicode output[2]={0x5555,0xaaaa};sal_uInt32 high=0xffffffff,low=0xffffffff,combined=0xffffffff;if(code>=0x10000){high=rtl::getHighSurrogate(code);low=rtl::getLowSurrogate(code);combined=rtl::combineSurrogates(high,low);}auto count=rtl::splitSurrogates(code,output);
std::array<sal_uInt32,${pointFields.length}> row={code,rtl::isUnicodeCodePoint(code),${ascii.map(/** Invokes one complete original character function. @param name - Original name. @returns Native invocation. */ (name) => `rtl::${name}(code)`).join(",")},rtl::isSurrogate(code),rtl::isHighSurrogate(code),rtl::isLowSurrogate(code),rtl::isUnicodeScalarValue(code),high,low,combined,sal_uInt32(count),output[0],output[1]};if(std::fwrite(row.data(),sizeof(sal_uInt32),row.size(),stdout)!=row.size())return 3;}
}
`;
const flags = [
  "-std=c++20",
  "-DLIBO_INTERNAL_ONLY",
  "-DMACOSX",
  `-I${target}/headers`,
  `-I${upstream}/include`,
];
writeFileSync(`${target}/driver.cpp`, driver);
/** Compiles the original full header and writes exact diagnostics. @param sanitized - Sanitizer flag. @returns Actual binary path. */
function build(sanitized) {
  const binary = `${target}/driver${sanitized ? "-asan" : ""}`;
  const result = spawnSync(
    "clang++",
    [
      ...flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      `${target}/driver.cpp`,
      "-o",
      binary,
    ],
    { encoding: "utf8" },
  );
  writeFileSync(`${binary}.compile.stderr`, result.stderr);
  if (result.status !== 0) throw new Error(result.stderr);
  return binary;
}
const binary = build(false);
const deps = execFileSync("clang++", [...flags, "-MM", `${target}/driver.cpp`], {
  encoding: "utf8",
})
  .split(/\s+/)
  .filter(
    /** Records actual original header dependencies. @param p - Compiler path. @returns Original path flag. */ (
      p,
    ) => p.startsWith(upstream + "/"),
  );
for (const p of new Set(deps)) loadUnicodeOriginal(sources, p.slice(upstream.length + 1));
/** Captures complete native output, never reconstructed expected data. @param executable - Original caller. @param mode - Capture selector. @param out - Exact output path. @returns Raw bytes. */
function capture(executable, mode, out) {
  const fd = openSync(out, "w");
  let result;
  try {
    result = spawnSync(executable, [mode], {
      stdio: ["ignore", fd, "pipe"],
      encoding: "utf8",
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
    });
  } finally {
    closeSync(fd);
  }
  writeFileSync(out + ".stderr", result.stderr);
  if (result.status !== 0) throw new Error(result.stderr);
  return readFileSync(out);
}
const raw = capture(binary, "points", `${target}/points.bin`);
const pointCount = 0x110000,
  width = pointFields.length;
if (raw.length !== pointCount * width * 4) throw new Error("Incomplete original character capture");
const pairs = JSON.parse(capture(binary, "pairs", `${target}/pairs.json`));
const converted = JSON.parse(capture(binary, "conversions", `${target}/conversions.json`));
const constants = JSON.parse(capture(binary, "constants", `${target}/constants.json`));
const sanitized = build(true);
for (const [mode, bytes] of [
  ["points", raw],
  ["pairs", Buffer.from(JSON.stringify(pairs))],
  ["conversions", Buffer.from(JSON.stringify(converted))],
  ["constants", Buffer.from(JSON.stringify(constants))],
]) {
  const checked = capture(sanitized, mode, `${target}/${mode}.asan`);
  if (!checked.equals(bytes)) throw new Error(`Sanitized capture differs: ${mode}`);
}
for (const [i, g] of guards.entries()) {
  const result = spawnSync(binary, ["guard", String(i)], { encoding: "utf8" });
  writeFileSync(`${target}/guard-${i}.stderr`, result.stderr);
  if (result.signal !== "SIGABRT" || !result.stderr.includes(g.expression))
    throw new Error(`Missing original assertion${i}: ${result.stderr}`);
  g.signal = result.signal;
}
const compileGuards = [];
for (const name of ascii)
  for (const type of ["char", "signed char"]) {
    const caller = `#include <rtl/character.hxx>\nint main(){${type} code=65;return rtl::${name}(code);}\n`;
    const path = `${target}/deleted-${name}-${type.replace(" ", "-")}.cpp`;
    writeFileSync(path, caller);
    const result = spawnSync("clang++", [...flags, "-fsyntax-only", path], { encoding: "utf8" });
    writeFileSync(path + ".stderr", result.stderr);
    if (result.status === 0 || !result.stderr.includes("deleted"))
      throw new Error(`Missing original deleted overload ${name}/${type}`);
    compileGuards.push({ name, type, caller, accepted: false, diagnostic: "deleted" });
  }
const initial = Array.from(
    { length: width },
    /** Reads complete initialized native row fields. @param unused - Placeholder. @param i - Column. @returns Actual native value. */ (
      _,
      i,
    ) => raw.readUInt32LE(i * 4),
  ),
  runs = [];
let previous = initial,
  last = null;
for (let row = 1; row < pointCount; row++) {
  const next = [],
    delta = [];
  for (let column = 0; column < width; column++) {
    const value = raw.readUInt32LE((row * width + column) * 4);
    next.push(value);
    delta.push(value - previous[column]);
  }
  if (
    last &&
    last
      .slice(1)
      .every(
        /** Compares only captured neighboring deltas. @param value - Prior delta. @param i - Column. @returns Identical delta flag. */ (
          value,
          i,
        ) => value === delta[i],
      )
  )
    last[0]++;
  else {
    last = [1, ...delta];
    runs.push(last);
  }
  previous = next;
}
const restored = Buffer.alloc(raw.length);
let current = [...initial],
  position = 0;
/** Writes a losslessly decoded captured row. @returns Nothing. */
function storeRow() {
  for (const value of current) {
    restored.writeUInt32LE(value, position);
    position += 4;
  }
}
storeRow();
for (const [count, ...delta] of runs)
  for (let n = 0; n < count; n++) {
    current = current.map(
      /** Reconstructs all captured fields by generic delta addition. @param value - Prior observed field. @param i - Column. @returns Decoded field. */ (
        value,
        i,
      ) => value + delta[i],
    );
    storeRow();
  }
if (!restored.equals(raw))
  throw new Error("Lossless encoding does not restore complete original capture");
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources)
      .sort()
      .map(
        /** Preserves full pinned blob hashes. @param pair - Source. @returns Digest entry. */ ([
          path,
          bytes,
        ]) => [path, hash(bytes)],
      ),
  ),
  configuration: { flags, typesHash: hash(types), globalHash: hash(global), endian: "little" },
  driverHash: hash(driver),
  rawHash: hash(raw),
  rawBytes: raw.length,
  pointFields,
  pointCount,
  initial,
  runs,
  pairs,
  conversions: converted,
  constants,
  guards,
  compileGuards,
};
const check = process.argv.includes("--check"),
  write = process.argv.includes("--write");
if (check === write) throw new Error("Use exactly --write or --check");
if (write) writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Original character fixture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    pointCount,
    width,
    rawBytes: raw.length,
    runs: runs.length,
    pairs: pairs.length,
    guards: guards.length,
    compileGuards: compileGuards.length,
    sourceFiles: Object.keys(sources).length,
    driverHash: record.driverHash,
    rawHash: record.rawHash,
  }),
);
