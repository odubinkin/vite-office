/** @fileoverview Observes the actual libc++64 std::hash<double> primitive used by Calc token hashing;no Calc class,document or service is replaced. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { format } from "prettier";

const mode = process.argv[2];
if (process.argv.length !== 3 || (mode !== "--check" && mode !== "--write"))
  throw new Error("Use exactly --check or --write");
const target = "output/playwright/calc-double-hash-native";
const fixture = "apps/office/src/sc/source/core/tool/native-double-hash-cases.json";
const driver = `#include <bit>
#include <cstdint>
#include <functional>
#include <iostream>
#ifndef _LIBCPP_VERSION
#error This observation targets libc++64,not another standard-library ABI
#endif
int main() {
 static_assert(sizeof(std::size_t)==8);
 static_assert(sizeof(double)==8);
 std::cout << "libcxx64 " << _LIBCPP_VERSION << "\\n";
 for(std::uint64_t bits : {0ULL,0x8000000000000000ULL,0x3ff0000000000000ULL,0xbff0000000000000ULL,0x400c000000000000ULL,0x7ff0000000000000ULL,0xfff0000000000000ULL,0x7ff8000000000001ULL,0xfff8000000000002ULL,1ULL,0x8000000000000001ULL,0xeeeeeeeeeeeeeeeeULL})
  std::cout<<bits<<" "<<std::hash<double>{}(std::bit_cast<double>(bits))<<"\\n";
}
`;
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/driver.cpp`, driver);
const captures = {};
for (const profile of ["normal", "asan"]) {
  const args = ["-std=c++20", `${target}/driver.cpp`, "-o", `${target}/${profile}`];
  if (profile === "asan") args.unshift("-fsanitize=address,undefined", "-fno-omit-frame-pointer");
  execFileSync("clang++", args, { stdio: "pipe" });
  captures[profile] = execFileSync(`${target}/${profile}`, [], { encoding: "utf8" });
  writeFileSync(`${target}/${profile}.txt`, captures[profile]);
}
assert.equal(captures.normal, captures.asan);
const lines = captures.normal.trim().split("\n"),
  version = lines.shift();
const value = {
  profile: "libcxx64",
  scope:
    "Only the real standard-library double hash primitive. No original Calc class compilation,GenHash differential or other ABI is certified.",
  driverSha256: createHash("sha256").update(driver).digest("hex"),
  cases: lines.map(
    /** Parses one native unsigned64 pair. @param line - Native output. @returns Bits and hash. */ (
      line,
    ) => {
      const [bits, hash] = line.split(" ");
      return { bits, hash };
    },
  ),
};
if (mode === "--write")
  writeFileSync(fixture, await format(JSON.stringify(value), { parser: "json" }));
else assert.deepEqual(value, JSON.parse(readFileSync(fixture, "utf8")));
console.log(
  JSON.stringify({
    profile: version,
    cases: value.cases.length,
    captures: "normal and ASan/UBSan identical",
    mode,
  }),
);
