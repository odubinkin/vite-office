/** @fileoverview Captures the unchanged original OOX getLimitedValue template under exact signed32/signed64 instantiation; no stream-loop bound or method is replaced. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { getLimitedValue } from "../apps/office/src/oox/inc/helper/helper.ts";
const sourcePath = "vendor/libreoffice-reference/include/oox/helper/helper.hxx",
  source = readFileSync(sourcePath, "utf8"),
  build = resolve("test-results/native/B8TCAE-oox-limited-value");
mkdirSync(build, { recursive: true });
const template = source.slice(
  source.indexOf("template< typename ReturnType, typename Type >"),
  source.indexOf(
    "template< typename ReturnType, typename Type >",
    source.indexOf("template< typename ReturnType, typename Type >") + 1,
  ),
);
if (
  !template.includes("inline ReturnType getLimitedValue") ||
  !template.includes("::std::clamp( nValue, nMin, nMax )")
)
  throw Error("Original OOX template signature changed");
const witness =
  "#include <algorithm>\n#include <cstdint>\n#include <iostream>\nnamespace oox {\n" +
  template +
  "\n}\nint main(){std::int64_t v,lo,hi;static_assert(sizeof(std::int32_t)==4 && sizeof(std::int64_t)==8);while(std::cin>>v>>lo>>hi)std::cout<<oox::getLimitedValue<std::int32_t,std::int64_t>(v,lo,hi)<<'\\n';}\n";
writeFileSync(`${build}/witness.cc`, witness);
execFileSync(
  "clang++",
  ["-std=c++20", "-Wall", "-Wextra", "-Werror", `${build}/witness.cc`, "-o", `${build}/witness`],
  { stdio: "inherit" },
);
const cases = [],
  values = [
    -(1n << 63n),
    -2147483649n,
    -2147483648n,
    -32769n,
    -32768n,
    -1n,
    0n,
    1n,
    99n,
    100n,
    101n,
    32767n,
    32768n,
    32769n,
    2147483647n,
    2147483648n,
    (1n << 63n) - 1n,
  ];
for (const [lo, hi] of [
  [0n, 32768n],
  [-2147483648n, 2147483647n],
  [0n, 0n],
  [-32768n, -1n],
  [-100n, 100n],
  [-(1n << 63n), (1n << 63n) - 1n],
])
  for (const value of values) cases.push([String(value), String(lo), String(hi)]);
const rows = execFileSync(`${build}/witness`, {
  input:
    cases
      .map(
        /** Serializes an exact integer input tuple. @param row - Original arguments. @returns Native query. */ (
          row,
        ) => row.join(" "),
      )
      .join("\n") + "\n",
  encoding: "utf8",
})
  .trimEnd()
  .split("\n");
for (let i = 0; i < cases.length; ++i) {
  const [value, min, max] = cases[i],
    expected = Number(rows[i]),
    actual = getLimitedValue(BigInt(value), BigInt(min), BigInt(max));
  if (actual !== expected)
    throw Error(`Original OOX clamp mismatch ${cases[i]} native=${expected} local=${actual}`);
}
if (process.argv.includes("--write-fixtures"))
  writeFileSync(
    "apps/office/src/oox/source/helper/limited-value.native-observations.json",
    JSON.stringify(
      {
        sourcePath,
        sourceSha256: createHash("sha256").update(source).digest("hex"),
        witnessSha256: createHash("sha256").update(witness).digest("hex"),
        scope:
          "Unchanged extracted original template with exact signed integer widths and C++20 narrowing; no native stream traversal, ABI, invalid bounds or allocation claim.",
        cases: cases.map(
          /** Pairs input only with compiled native output. @param row - Original arguments. @param index - Native output offset. @returns Observation. */ (
            row,
            index,
          ) => [...row, Number(rows[index])],
        ),
      },
      null,
      2,
    ) + "\n",
  );
console.log(`Matched ${rows.length} original getLimitedValue signed64/signed32 boundary cases`);
