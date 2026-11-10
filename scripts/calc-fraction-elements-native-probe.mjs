/** @fileoverview Compares unchanged original fraction-element arithmetic and original o3tl saturation headers with actual local compiled-section owners. Scalar native fixtures provide only the already-parsed denominator and exponent count; this does not certify token parsing, fraction display, full SAL/UNO ABI or undefined signed-overflow behavior across compilers. Run with npx tsx. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { saturating_castInt64 } from "../apps/office/src/o3tl/inc/float_int_conversion.ts";
import { sprintfIntegral } from "../apps/office/src/o3tl/inc/sprintf.ts";
import { SvNumberFormatter } from "../apps/office/src/svl/source/numbers/zforlist.ts";
import { unicode } from "../apps/office/src/i18nlangtag/source/isolang/isolang.tables.ts";
import {
  ImpGetFractionElements,
  GetDenominatorString,
} from "../apps/office/src/svl/source/numbers/zformat.fraction.ts";
const pin = "9bc445578031fecf56086729d8e4940c77e14d65",
  root = resolve("vendor/libreoffice-reference"),
  build = resolve("output/native/AQF9AG-icu-grego/fraction-elements"),
  sourcePath = "svl/source/numbers/zformat.cxx",
  source = readFileSync(`${root}/${sourcePath}`, "utf8");
if (execFileSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw Error("Wrong original baseline");
const hashes = {};
for (const path of [
  sourcePath,
  "include/o3tl/float_int_conversion.hxx",
  "include/o3tl/concepts.hxx",
  "include/o3tl/sprintf.hxx",
]) {
  const value = readFileSync(`${root}/${path}`, "utf8");
  if (
    execFileSync("git", ["-C", root, "show", `${pin}:${path}`], {
      encoding: "utf8",
      maxBuffer: 4e6,
    }) !== value
  )
    throw Error(`Modified original ${path}`);
  hashes[path] = createHash("sha256").update(value).digest("hex");
}
const signature = "void SvNumberformat::ImpGetFractionElements (",
  start = source.indexOf(signature),
  brace = source.indexOf("{", start);
if (start < 0) throw Error("Missing original fraction body");
let depth = 1,
  end = brace + 1;
for (; depth && end < source.length; ++end) {
  if (source[end] === "{") ++depth;
  else if (source[end] === "}") --depth;
}
if (depth) throw Error("Unclosed original body");
const method = source.slice(start, end);
mkdirSync(`${build}/include/sal`, { recursive: true });
writeFileSync(
  `${build}/include/sal/config.h`,
  "#pragma once\n// No SAL ABI is compiled in this scalar-only header fixture.\n",
);
const driver = `#include <o3tl/float_int_conversion.hxx>
#include <cmath>
#include <cstdint>
#include <cstring>
#include <iostream>
#include <iomanip>
using sal_Int64 = int64_t; using sal_uInt16=uint16_t;
using std::floor; using std::pow;
struct ImpSvNumberformatInfo{sal_uInt16 nCntExp;int32_t forced;};
struct ParsedDenominator{int32_t value;int32_t toInt32()const{return value;}};
ParsedDenominator lcl_GetDenominatorString(const ImpSvNumberformatInfo&i,int){return{i.forced};}
struct Section{ImpSvNumberformatInfo info;const ImpSvNumberformatInfo&Info()const{return info;}int GetCount()const{return 0;}};
struct SvNumberformat{Section NumFor[1];void ImpGetFractionElements(double&,sal_uInt16,double&,sal_Int64&,sal_Int64&)const;};
${method}
uint64_t bits(double value){uint64_t output;std::memcpy(&output,&value,8);return output;}
int main(){std::string input;unsigned count;int32_t forced;unsigned serial=0;
while(std::cin>>input>>count>>forced){uint64_t raw=std::stoull(input,nullptr,16);double value;std::memcpy(&value,&raw,8);double whole=0;sal_Int64 numerator=0,denominator=1;SvNumberformat format;format.NumFor[0].info={sal_uInt16(count),forced};
std::cerr<<"Q "<<serial++<<"\\n";
format.ImpGetFractionElements(value,0,whole,numerator,denominator);
std::cout<<"[\\""<<std::hex<<std::setw(16)<<std::setfill('0')<<bits(value)<<"\\",\\""<<std::setw(16)<<bits(whole)<<"\\",\\""<<std::dec<<numerator<<"\\",\\""<<denominator<<"\\"]\\n";
}}
`;
writeFileSync(`${build}/driver.cc`, driver);
const flags = [
    "-std=c++20",
    "-ffp-contract=off",
    "-I",
    `${build}/include`,
    "-I",
    `${root}/include`,
    `${build}/driver.cc`,
  ],
  commands = [];
for (const [name, extra] of [
  ["native", ["-O2"]],
  ["native-o0", ["-O0"]],
  ["native-ubsan", ["-O1", "-fsanitize=undefined", "-fsanitize-recover=undefined"]],
]) {
  const args = [...flags, ...extra, "-o", `${build}/${name}`];
  execFileSync("clang++", args, { encoding: "utf8" });
  commands.push({ tool: "clang++", args });
}
/** Serializes exact binary64 bits for native input and output. @param value - Number. @returns Hex bits. */
function bits(value) {
  const bytes = new ArrayBuffer(8),
    view = new DataView(bytes);
  view.setFloat64(0, value, false);
  return view.getBigUint64(0, false).toString(16).padStart(16, "0");
}
const values = [
  0,
  -0,
  0.1,
  0.25,
  1 / 3,
  Math.PI,
  -Math.PI,
  0.9999999999999999,
  Number.MIN_VALUE,
  1e-300,
  1e-200,
  1e-16,
  4294967295.25,
  -4294967295.25,
];
for (let index = 1; index <= 80; index++)
  for (const offset of [-Number.EPSILON, 0, Number.EPSILON])
    values.push(1 / (index * 123457) + offset);
let seed = 0x12345678;
for (let index = 0; index < 512; index++) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  values.push(seed / 4294967296);
}
const formatter = new SvNumberFormatter(0x409),
  cases = [];
try {
  for (const pattern of [
    "# ?/?",
    "# ??/??",
    "# ????????/????????",
    "# ?/8",
    "# ?/16",
    "# ?/100",
    "# ?/99999999",
  ]) {
    const code = unicode(pattern),
      check = [0],
      type = [0],
      key = [0];
    try {
      formatter["m_aFormatData"].PutEntry(
        formatter["m_aCurrentLanguage"],
        formatter.GetNatNum(),
        code,
        check,
        type,
        key,
        0x409,
      );
      if (check[0]) throw Error(`Invalid fixture ${pattern}`);
      const section = formatter.GetEntry(key[0])["NumFor"][0],
        denominator = GetDenominatorString(section);
      let forced;
      try {
        forced = denominator.toInt32();
      } finally {
        denominator.dispose();
      }
      for (const input of values) {
        const value = [input],
          whole = [0],
          numerator = [0n],
          divisor = [1n];
        ImpGetFractionElements(value, section, whole, numerator, divisor);
        cases.push({
          pattern,
          input: bits(input),
          count: section.Info().nCntExp,
          forced,
          expected: [bits(value[0]), bits(whole[0]), String(numerator[0]), String(divisor[0])],
        });
      }
    } finally {
      code.dispose();
    }
  }
} finally {
  formatter.dispose();
}
const input =
    cases
      .map(
        /** Supplies parsed scalar input to the unchanged native body. @param c - Compiled-section case. @returns Wire query. */ (
          c,
        ) => `${c.input} ${c.count} ${c.forced}`,
      )
      .join("\n") + "\n",
  results = {};
for (const name of ["native", "native-o0", "native-ubsan"]) {
  const result = spawnSync(`${build}/${name}`, [], {
    input,
    encoding: "utf8",
    timeout: 30000,
    maxBuffer: 20e6,
  });
  writeFileSync(`${build}/${name}.stderr`, result.stderr ?? "");
  if (result.status !== 0)
    throw Error(`Native ${name} failed ${result.status}: ${(result.stderr ?? "").slice(-1500)}`);
  const rows = result.stdout.trim().split("\n").map(JSON.parse);
  if (rows.length !== cases.length) throw Error(`Missing ${name} rows`);
  const undefinedCases = new Set();
  let current = -1;
  for (const line of result.stderr.split("\n")) {
    if (line.startsWith("Q ")) current = Number(line.slice(2));
    else if (line.includes("runtime error:")) undefinedCases.add(current);
  }
  results[name] = { rows, undefinedCases: [...undefinedCases] };
}
const mismatches = [];
for (let index = 0; index < cases.length; index++)
  for (const name of ["native", "native-o0", "native-ubsan"])
    if (JSON.stringify(results[name].rows[index]) !== JSON.stringify(cases[index].expected))
      mismatches.push({ index, name, case: cases[index], native: results[name].rows[index] });
const primitiveDriver = String.raw`#include <o3tl/float_int_conversion.hxx>
#include <cstdio>
#include <cstring>
#include <cstdint>
#include <iostream>
#include <cmath>
int main(){std::string input;while(std::cin>>input){uint64_t raw=std::stoull(input,nullptr,16);double value;std::memcpy(&value,&raw,8);std::cout<<"[\""<<o3tl::saturating_cast<int64_t>(value)<<"\",";
if(std::isfinite(value)&&std::trunc(value)==value){unsigned char data[100];std::memset(data,165,100);int count=std::snprintf(reinterpret_cast<char*>(data),100,"%.f",value);bool valid=count<0||unsigned(count)<100; if(valid)std::cout<<count;else std::cout<<"null";std::cout<<","<<(valid?"false":"true")<<",[";for(unsigned i=0;i<100;i++)std::cout<<(i?",":"")<<unsigned(data[i]);std::cout<<"]";}else std::cout<<"null,false,null";std::cout<<"]\n";}}
`;
writeFileSync(`${build}/primitives.cc`, primitiveDriver);
const primitiveArgs = [
  "-std=c++20",
  "-O2",
  "-I",
  `${build}/include`,
  "-I",
  `${root}/include`,
  `${build}/primitives.cc`,
  "-o",
  `${build}/primitives`,
];
execFileSync("clang++", primitiveArgs, { encoding: "utf8" });
commands.push({ tool: "clang++", args: primitiveArgs });
const primitiveValues = [
    0,
    -0,
    1,
    -1,
    1.9,
    -1.9,
    NaN,
    Infinity,
    -Infinity,
    Number.MIN_VALUE,
    1e20,
    1e23,
    1e99,
    1e100,
    Number.MIN_SAFE_INTEGER,
    Number.MAX_SAFE_INTEGER,
    -9223372036854775808,
    9223372036854775808,
    -9223372036854775808 + 1024,
    9223372036854775808 - 1024,
  ],
  primitiveCases = [];
for (const value of primitiveValues) {
  let count = null,
    assertion = false,
    data = null;
  if (Number.isFinite(value) && Number.isInteger(value)) {
    const buffer = new Uint8Array(100).fill(165);
    try {
      count = sprintfIntegral(buffer, value);
    } catch (error) {
      if (!String(error).includes("assert")) throw error;
      assertion = true;
    }
    data = [...buffer];
  }
  primitiveCases.push({
    input: bits(value),
    expected: [String(saturating_castInt64(value)), count, assertion, data],
  });
}
const primitiveRows = execFileSync(`${build}/primitives`, [], {
  input:
    primitiveCases
      .map(
        /** Provides an exact binary64 primitive query. @param entry - Source input. @returns Wire query. */ (
          entry,
        ) => entry.input,
      )
      .join("\n") + "\n",
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .map(JSON.parse);
if (primitiveRows.length !== primitiveCases.length) throw Error("Missing primitive rows");
for (let index = 0; index < primitiveCases.length; index++)
  if (JSON.stringify(primitiveRows[index]) !== JSON.stringify(primitiveCases[index].expected))
    mismatches.push({
      primitive: index,
      case: primitiveCases[index],
      native: primitiveRows[index],
    });
const report = {
  pin,
  compiler: execFileSync("clang++", ["--version"], { encoding: "utf8" }).trim(),
  sourceHashes: hashes,
  commands,
  cases: cases.length,
  primitiveCases: primitiveCases.length,
  undefinedCases: results["native-ubsan"].undefinedCases.map(
    /** Retains sanitizer evidence without promoting undefined domains into portable parity. @param index - Query index. @returns Case evidence. */ (
      index,
    ) => ({
      index,
      ...cases[index],
    }),
  ),
  mismatches: mismatches.slice(0, 20),
  mismatchCount: mismatches.length,
  limitations: [
    "Primitive witness executes the unchanged saturation header and native C snprintf; o3tl assertion truth/prefix mutation are compared, not native abort/ABI behavior.",
    "Native fixtures supply parsed forced denominator/exponent count only; parser/locale/output/ABI are not certified.",
    "Signed-overflow UBSan cases are reported separately and are not portable C++ defined-domain evidence.",
    "Three local clang build modes are compared with separate binary64 operations (-ffp-contract=off), not every compiler/FMA mode.",
  ],
};
writeFileSync(`${build}/comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify({
    cases: cases.length,
    primitiveCases: primitiveCases.length,
    undefinedCases: report.undefinedCases.length,
    mismatches: mismatches.length,
    evidence: `${build}/comparison.json`,
  }),
);
if (mismatches.length) throw Error("Fraction-element native mismatch");
