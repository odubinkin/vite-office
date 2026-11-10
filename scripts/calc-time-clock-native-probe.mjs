/** @fileoverview Differentially checks unchanged tools::Time::GetClock plus unchanged RTL arithmetic functions and inline wrappers. Only scalar type/constant declarations are supplied by the fixture; this is not native full Time/SAL/UNO ABI or formatted time-display certification. Run with npx tsx. */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Time } from "../apps/office/src/tools/source/datetime/ttime.ts";
import { pow10Exp } from "../apps/office/src/sal/inc/rtl/math.ts";
const root = "vendor/libreoffice-reference",
  pin = "9bc445578031fecf56086729d8e4940c77e14d65";
if (execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw new Error("Changed LibreOffice baseline");
const paths = [
    "tools/source/datetime/ttime.cxx",
    "sal/rtl/math.cxx",
    "include/rtl/math.hxx",
    "include/rtl/math.h",
    "include/sal/mathconf.h",
    "include/sal/macros.h",
    "include/sal/types.h",
  ],
  sources = {},
  hashes = {};
for (const path of paths) {
  sources[path] = readFileSync(`${root}/${path}`, "utf8");
  hashes[path] = createHash("sha256").update(sources[path]).digest("hex");
  const original = execFileSync("git", ["-C", root, "show", `${pin}:${path}`], {
    encoding: "utf8",
  });
  if (original !== sources[path]) throw new Error(`Changed source: ${path}`);
}
/** Extracts one unchanged balanced source body including its declaration. @param source - Original text. @param signature - Exact declaration prefix. @param offset - Optional start position. @returns Original function/union/enum body. */
function body(source, signature, offset = 0) {
  const start = source.indexOf(signature, offset),
    opening = source.indexOf("{", start);
  if (start < 0 || opening < 0) throw new Error(`Missing source: ${signature}`);
  let depth = 1,
    end = opening + 1;
  for (; depth && end < source.length; ++end) {
    if (source[end] === "{") ++depth;
    else if (source[end] === "}") --depth;
  }
  if (depth) throw new Error(`Unbalanced source: ${signature}`);
  return source.slice(start, end);
}
const math = sources[paths[1]],
  inline = sources[paths[2]],
  table = math.slice(
    math.indexOf("constexpr int minExp"),
    math.indexOf("namespace\n{", math.indexOf("constexpr int minExp")),
  ),
  bitUnion = body(
    sources[paths[4]],
    "union sal_math_Double",
    sources[paths[4]].indexOf("/* IEEE 754 double structures for LittleEndian */"),
  ),
  rounding = body(sources[paths[3]], "enum rtl_math_RoundingMode"),
  helpers = ["bool isRepresentableInteger", "int getBitsInFracPart"]
    .map(
      /** Copies original scalar helper. @param signature - Original declaration. @returns Unchanged body. */ (
        signature,
      ) => body(math, signature),
    )
    .join("\n"),
  wrappers = [
    "inline double approxValue(",
    "inline double approxFloor(",
    "inline double approxCeil(",
    "inline double round(",
    "inline double pow10Exp(",
  ]
    .map(
      /** Copies original inline wrapper. @param signature - Original declaration. @returns Unchanged body. */ (
        signature,
      ) => body(inline, signature),
    )
    .join("\n"),
  functions = [
    "double SAL_CALL rtl_math_round(",
    "double SAL_CALL rtl_math_approxValue(",
    "double SAL_CALL rtl_math_pow10Exp(",
  ]
    .map(
      /** Copies original RTL function. @param signature - Original declaration. @returns Unchanged body. */ (
        signature,
      ) => body(math, signature),
    )
    .join("\n");
const build = "output/native/AQF9AG-icu-grego/time-clock";
mkdirSync(build, { recursive: true });
const driver = `#include <algorithm>
#include <sal/macros.h>
#include <bit>
#include <cassert>
#include <cfenv>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <iomanip>
using sal_uInt64=uint64_t;using sal_Int64=int64_t;using sal_Int32=int32_t;using sal_uInt16=uint16_t;
#define SAL_CALL
#define OSL_ASSERT assert
${sources["include/sal/types.h"].split("\n").find(/** Selects the unchanged native enum-width macro. @param line - Source line. @returns Matching definition. */ (line) => line.startsWith("#define SAL_MAX_ENUM "))}
${bitUnion};
${rounding};
double rtl_math_approxValue(double)noexcept;double rtl_math_round(double,int,rtl_math_RoundingMode)noexcept;double rtl_math_pow10Exp(double,int)noexcept;
namespace rtl{namespace math{${wrappers}}}
${table}
${helpers}
${functions}
namespace tools{struct Time{static constexpr int secondPerDay=86400,secondPerHour=3600,secondPerMinute=60;static void GetClock(double,sal_uInt16&,sal_uInt16&,sal_uInt16&,double&,int);};}
${body(sources[paths[0]], "void tools::Time::GetClock(")}
uint64_t bits(double value){uint64_t output;std::memcpy(&output,&value,8);return output;}
int main(){std::string encoded;int precision,kind;while(std::cin>>kind>>encoded>>precision){uint64_t raw=std::stoull(encoded,nullptr,16);double value;std::memcpy(&value,&raw,8);uint16_t hour=0,minute=0,second=0;double fraction=0;
if(kind==0)tools::Time::GetClock(value,hour,minute,second,fraction,precision);else fraction=rtl::math::pow10Exp(value,precision);
std::cout<<hour<<" "<<minute<<" "<<second<<" "<<std::hex<<std::setw(16)<<std::setfill('0')<<bits(fraction)<<std::dec<<"\\n";}}
`;
writeFileSync(`${build}/driver.cc`, driver);
const bytes = new DataView(new ArrayBuffer(8));
/** Encodes exact binary64 input/output. @param value - Number. @returns Hex bits. */
function bits(value) {
  bytes.setFloat64(0, value);
  return bytes.getBigUint64(0).toString(16).padStart(16, "0");
}
const cases = [],
  seen = new Set();
/** Adds a unique exact input tuple. @param kind - Clock or pow10 primitive. @param value - Number. @param precision - Fraction digits or decimal exponent. @returns Nothing. */
function add(kind, value, precision) {
  const key = `${kind} ${bits(value)} ${precision}`;
  if (!seen.has(key)) {
    seen.add(key);
    cases.push({ kind, value, precision, input: key });
  }
}
for (const days of [-100000000, -45000, -1, 0, 1, 45000, 100000000])
  for (const seconds of [
    0, 0.000000001, 0.009999999, 0.499999999, 0.999999999, 1, 59.99999, 60, 3599.999999, 43200,
    86399.999999999,
  ])
    for (const precision of [0, 1, 2, 3, 7, 9, 12])
      for (const sign of [-1, 1]) add(0, days + (sign * seconds) / 86400, precision);
let seed = 0xa9f92c17;
for (let index = 0; index < 10000; ++index) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  const day = index % 3 === 0 ? 0 : (seed % 100000000) - 50000000;
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  add(0, day + seed / 0x100000000, index % 13);
}
for (const value of [-0, 0, -1, 1, 0.999999999, 1e-300, 1e300])
  for (const exponent of [-324, -323, -308, -9, -2, 0, 2, 9, 308, 309]) add(1, value, exponent);
const input =
    cases
      .map(
        /** Returns native stdin tuple. @param entry - Case. @returns Input line. */ (entry) =>
          entry.input,
      )
      .join("\n") + "\n",
  modes = [
    ["optimized", "-O2"],
    ["debug", "-O0"],
    ["ubsan", "-O1", "-fsanitize=undefined", "-fno-sanitize-recover=undefined"],
  ],
  comparisons = [];
for (const [mode, ...flags] of modes) {
  const binary = `${build}/${mode}`,
    argv = [
      "-std=c++20",
      "-ffp-contract=off",
      `-I${root}/include`,
      ...flags,
      `${build}/driver.cc`,
      "-o",
      binary,
    ],
    compile = spawnSync("clang++", argv, { encoding: "utf8" });
  writeFileSync(`${build}/${mode}-compile.log`, compile.stderr ?? "");
  if (compile.status !== 0) throw new Error(compile.stderr);
  const execution = spawnSync(binary, [], { input, encoding: "utf8", maxBuffer: 16000000 });
  writeFileSync(`${build}/${mode}-stderr.log`, execution.stderr ?? "");
  if (execution.status !== 0) throw new Error(execution.stderr);
  const lines = execution.stdout.trim().split("\n"),
    mismatches = [];
  if (lines.length !== cases.length) throw new Error("Native output count mismatch");
  for (let index = 0; index < cases.length; ++index) {
    const entry = cases[index],
      hour = [0],
      minute = [0],
      second = [0],
      fraction = [0];
    if (entry.kind === 0)
      Time.GetClock(entry.value, hour, minute, second, fraction, entry.precision);
    else fraction[0] = pow10Exp(entry.value, entry.precision);
    const local = `${hour[0]} ${minute[0]} ${second[0]} ${bits(fraction[0])}`;
    if (local !== lines[index])
      mismatches.push({ input: entry.input, native: lines[index], local });
  }
  comparisons.push({ mode, command: ["clang++", ...argv], mismatches });
}
const report = {
  pin,
  sourceHashes: hashes,
  compiler: execFileSync("clang++", ["--version"], { encoding: "utf8" }).trim(),
  cases: cases.length,
  clockCases: cases.filter(
    /** Selects clock cases. @param entry - Case. @returns Clock flag. */ (entry) =>
      entry.kind === 0,
  ).length,
  comparisons,
  limitations:
    "Unchanged extracted GetClock/RTL functions, table, bit union and inline wrappers. Scalar type/constants supplied by fixture. Does not certify full Time/SAL/UNO ABI, time formatting/calendar services, arbitrary nonfinite cast domains or libm behavior on other platforms.",
};
writeFileSync(`${build}/comparison.json`, JSON.stringify(report, null, 2) + "\n");
const mismatchCount = comparisons.reduce(
  /** Counts every mode mismatch. @param total - Accumulator. @param mode - Comparison. @returns Total. */ (
    total,
    mode,
  ) => total + mode.mismatches.length,
  0,
);
console.log(
  JSON.stringify({
    cases: cases.length,
    modes: comparisons.length,
    mismatches: mismatchCount,
    evidence: `${build}/comparison.json`,
  }),
);
if (mismatchCount) throw new Error("Clock/RTL comparison failed");
