/** @fileoverview Captures actual original ICU78.3 LocaleCacheKey/CacheKey descriptions and bounded C-buffer writes with the previously verified native libraries. */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const target = "test-results/native/B8TCAE-icu-key-description",
  source = resolve("vendor/icu-reference/source"),
  build = resolve("test-results/native/B8TCAE-icu"),
  fixture =
    "apps/office/src/external/icu/source/common/cache-key-description.native-observations.json",
  previous = JSON.parse(
    readFileSync(
      "apps/office/src/external/icu/source/i18n/factory.native-observations.json",
      "utf8",
    ),
  );
/** Hashes actual source/archive/driver bytes. @param value - Original bytes. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
const libraryHashes = {};
for (const [path, expected] of Object.entries(previous.libraryHashes)) {
  const actual = hash(readFileSync(`${build}/${path}`));
  if (actual !== expected) throw new Error("Changed verified native ICU archive " + path);
  libraryHashes[path] = actual;
}
const sourceHashes = {};
for (const path of [
  "common/unifiedcache.h",
  "i18n/sharedcalendar.h",
  "common/unifiedcache.cpp",
  "i18n/calendar.cpp",
]) {
  const actual = hash(readFileSync(`${source}/${path}`));
  if (actual !== previous.sourceHashes[path]) throw new Error("Changed pinned ICU source " + path);
  sourceHashes[path] = actual;
}
mkdirSync(target, { recursive: true });
const driver = String.raw`#include "unifiedcache.h"
#include "sharedcalendar.h"
#include "unicode/putil.h"
#include <iostream>
#include <cstring>
#include <string>
using namespace icu;
std::string unhex(std::string s){if(s=="-")return {};std::string out;for(size_t i=0;i<s.size();i+=2)out+=char(std::stoi(s.substr(i,2),nullptr,16));return out;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);char op;std::string hex;int capacity;while(std::cin>>op>>hex>>capacity){auto name=unhex(hex);LocaleCacheKey<SharedCalendar>key(Locale(name.c_str()));char buffer[80];std::memset(buffer,0x58,sizeof(buffer));auto result=op=='T'?key.CacheKey<SharedCalendar>::writeDescription(buffer,capacity):key.writeDescription(buffer,capacity);std::cout<<(result==buffer);for(auto c:buffer)std::cout<<' '<<unsigned(uint8_t(c));std::cout<<'\n';}}`;
writeFileSync(`${target}/driver.cc`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${target}/driver.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${target}/driver`,
  ],
  { stdio: "inherit" },
);
const queries = [];
for (const operation of ["L", "T"])
  for (const locale of ["en_US", "de_DE", "en_US@calendar=gregorian", ""])
    for (const capacity of [1, 2, 3, 5, 6, 7, 8, 16, 23, 24, 32, 64])
      queries.push([operation, locale, capacity]);
const input =
  queries
    .map(
      /** Encodes original narrow locale input without shell parsing. @param query - Actual public key arguments. @returns Native input. */ ([
        op,
        name,
        capacity,
      ]) => `${op} ${Buffer.from(name, "latin1").toString("hex") || "-"} ${capacity}`,
    )
    .join("\n") + "\n";
const output = execFileSync(`${target}/driver`, [`${source}/data/in`], { input, encoding: "utf8" })
  .trimEnd()
  .split("\n");
if (output.length !== queries.length) throw new Error("Native key description row count differs");
const captured = {
  icuVersion: "78.3",
  sourceHashes,
  libraryHashes,
  witnessSha256: hash(driver),
  scope:
    "Original public LocaleCacheKey<SharedCalendar> diagnostic and explicitly qualified CacheKey<SharedCalendar> base diagnostic on actual ICU key objects. Positive native capacities within initialized80-byte buffers; every output byte and returned-pointer identity is retained. No fake type/factory, private native state, zero-capacity input, full Calendar creation/cache ABI, allocation failure or concurrency equivalence is claimed.",
  cases: queries.map(
    /** Associates input only with compiled original complete buffer output. @param query - Native arguments. @param index - Output index. @returns Observation. */ (
      query,
      index,
    ) => [query, output[index].split(" ").map(Number)],
  ),
};
if (process.argv.includes("--write"))
  writeFileSync(fixture, JSON.stringify(captured, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(captured))
  throw new Error("Native cache key description fixture differs");
console.log(`Verified ${queries.length} original ICU key-description observations`);
