/** @fileoverview Captures unchanged pinned public NfCurrencyEntry placement functions with their original fixed-bank-symbol policy. No currency object, locale provider or formatter is emulated. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const sourcePath = "vendor/libreoffice-reference/svl/source/numbers/zforlist.cxx",
  headerPath = "vendor/libreoffice-reference/include/svl/zforlist.hxx",
  source = readFileSync(sourcePath, "utf8"),
  header = readFileSync(headerPath, "utf8"),
  build = resolve("test-results/native/B8TCAE-currency-placement"),
  fixture = "apps/office/src/svl/source/numbers/native-currency-placement.json";
/** Extracts the unchanged scalar source function, whose literals contain no braces. @param signature - Exact source signature. @returns Original complete source bytes. */
function body(signature) {
  const start = source.indexOf(signature);
  if (start < 0) throw new Error("Missing original function " + signature);
  const brace = source.indexOf("{", start);
  let depth = 1,
    end = brace + 1;
  for (; depth && end < source.length; ++end) {
    if (source[end] === "{") ++depth;
    else if (source[end] === "}") --depth;
  }
  if (depth) throw new Error("Unclosed original function " + signature);
  return source.slice(start, end);
}
/** Retains the actual original public header declaration. @param name - Original member name. @returns Declaration. */
function declaration(name) {
  const start = header.indexOf("static  sal_uInt16  " + name + "("),
    end = header.indexOf(";", start);
  if (start < 0 || end < 0) throw new Error("Missing original declaration " + name);
  return header.slice(start, end + 1);
}
/** Hashes the exact native source/driver bytes. @param value - Text. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
const driver = `#include <cstdint>
#include <iostream>
using sal_uInt16=uint16_t;
#define SAL_WARN(...) ((void)0)
${source.match(/^#define NF_BANKSYMBOL_FIX_POSITION .+$/m)?.[0] ?? "#error Missing original bank-symbol policy"}
struct NfCurrencyEntry {
${declaration("GetEffectivePositiveFormat")}
${declaration("GetEffectiveNegativeFormat")}
};
${body("static sal_uInt16 lcl_MergeNegativeParenthesisFormat(")}
${body("sal_uInt16 NfCurrencyEntry::GetEffectivePositiveFormat(")}
${body("sal_uInt16 NfCurrencyEntry::GetEffectiveNegativeFormat(")}
int main(){char op;int64_t intl,currency;int bank;while(std::cin>>op>>intl>>currency>>bank){auto i=sal_uInt16(intl),c=sal_uInt16(currency);std::cout<<(op=='P'?NfCurrencyEntry::GetEffectivePositiveFormat(i,c,bool(bank)):NfCurrencyEntry::GetEffectiveNegativeFormat(i,c,bool(bank)))<<'\\n';}}
`;
mkdirSync(build, { recursive: true });
writeFileSync(`${build}/currency-placement.cc`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-Wall",
    "-Wextra",
    `${build}/currency-placement.cc`,
    "-o",
    `${build}/currency-placement`,
  ],
  { stdio: "inherit" },
);
const values = [
    -1,
    ...Array.from(
      { length: 17 },
      /** Enumerates original placement values and the first diagnostic value. @param _ - Array value. @param index - Scalar. @returns Scalar. */ (
        _,
        index,
      ) => index,
    ),
    65535,
    65536,
    65537,
    4294967295,
  ],
  inputs = [];
for (const operation of ["P", "N"])
  for (const intl of values)
    for (const currency of values)
      for (const bank of [0, 1]) inputs.push(`${operation} ${intl} ${currency} ${bank}`);
const rows = execFileSync(`${build}/currency-placement`, {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
})
  .trimEnd()
  .split("\n");
if (rows.length !== inputs.length) throw new Error("Native placement row count differs");
const captured = {
  baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
  sourceHashes: { [sourcePath]: hash(source), [headerPath]: hash(header) },
  witnessSha256: hash(driver),
  scope:
    "Unchanged original scalar public NfCurrencyEntry positive/negative placement functions and private parenthesis helper under original NF_BANKSYMBOL_FIX_POSITION=1. Actual original UInt16 argument conversion, all defined placements and diagnostic unknown values. Only SAL_WARN logging is silenced. No currency object, locale/formatting algorithm, ABI, allocator or concurrency equivalence is claimed.",
  cases: inputs.map(
    /** Pairs input exclusively with compiled original output. @param query - Native input. @param index - Native output index. @returns Observation. */ (
      query,
      index,
    ) => [query, rows[index]],
  ),
};
const serialized = JSON.stringify(captured, null, 2) + "\n";
if (process.argv.includes("--write")) writeFileSync(fixture, serialized);
else if (readFileSync(fixture, "utf8") !== serialized)
  throw new Error("Native currency placement fixture differs");
console.log(`Verified ${rows.length} original currency-placement observations`);
