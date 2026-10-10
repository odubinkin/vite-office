/** @fileoverview Captures unchanged original casefolding const arrays and cased_letter with genuine full headers; Locale-dependent mapping and UNO exceptions are outside this primitive probe. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  upstream,
  pin,
  hash,
  scope,
  loadUnicodeOriginal,
  configureUnicodeNativeHeaders,
} from "./rtl-ustring-native-sources.mjs";

const write = process.argv.includes("--write"),
  check = process.argv.includes("--check");
if (Number(write) + Number(check) !== 1) throw new Error("Use exactly --write or --check");
if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw new Error("Expected pinned LibreOffice baseline");
const target = "output/playwright/casefolding-character-native";
const fixture = "apps/office/src/i18nutil/source/utility/native-casefolding-character-cases.json";
const sources = {};
const configured = configureUnicodeNativeHeaders(target, sources);
const options = loadUnicodeOriginal(sources, "config_host/config_options.h.in");
writeFileSync(`${target}/headers/config_options.h`, options);
const cpp = loadUnicodeOriginal(sources, "i18nutil/source/utility/casefolding.cxx");
const nativeScope = scope(cpp, "const Mapping mapping_03a3[]", "// for Lithuanian,");
const names = [...nativeScope.matchAll(/const Mapping (mapping_[\da-f]+)\[\]/g)].map(
  /** Names the original const arrays in declaration order. @param match - Original declaration. @returns Name. */
  (match) => match[1],
);
if (names.length !== 10) throw new Error("Incomplete original conditional mappings");
const conversions = [-65537, -65536, -1, 65536, 65537, 2147483647];
const driver = String.raw`#include <i18nutil/casefolding.hxx>
#include "casefolding_data.h"
#include <array>
#include <bit>
#include <cstdio>
#include <iostream>
#include <iterator>
#include <string>
static_assert(std::endian::native == std::endian::little);
namespace i18nutil {
${nativeScope}
}
int main(int argc,char **argv){using namespace i18nutil;std::string mode=argc>1?argv[1]:"points";
if(mode=="mappings"){std::cout<<'{';bool comma=false;auto emit=[&](char const*name,auto const&array){if(comma)std::cout<<',';comma=true;std::cout<<'"'<<name<<"\":[";for(size_t i=0;i<std::size(array);i++){if(i)std::cout<<',';auto const&m=array[i];std::cout<<'['<<int(m.type)<<','<<int(m.nmap)<<",["<<unsigned(m.map[0])<<','<<unsigned(m.map[1])<<','<<unsigned(m.map[2])<<"]]";}std::cout<<']';};
${names.map(/** Invokes the output caller with each complete original array. @param name - Actual original array. @returns Native caller. */ (name) => `emit("${name}",${name});`).join("\n")}
std::cout<<'}';return 0;}
if(mode=="conversions"){sal_Int64 inputs[]={${conversions.join(",")}};std::cout<<'[';for(size_t i=0;i<std::size(inputs);i++){if(i)std::cout<<',';std::cout<<'['<<inputs[i]<<','<<cased_letter(inputs[i])<<']';}std::cout<<']';return 0;}
for(sal_uInt32 code=0;code<=0xffff;code++){std::array<sal_uInt32,2>row={code,sal_uInt32(cased_letter(code))};if(std::fwrite(row.data(),sizeof(sal_uInt32),row.size(),stdout)!=row.size())return 3;}return 0;
}
`;
writeFileSync(`${target}/driver.cpp`, driver);
const flags = [
  "-std=c++20",
  "-DLIBO_INTERNAL_ONLY",
  "-DMACOSX",
  `-I${target}/headers`,
  `-I${upstream}/include`,
  `-I${upstream}/i18nutil/source/utility`,
];
/** Compiles genuine full original headers and the complete unchanged scope. @param sanitized - Enable actual sanitizers. @returns Executable path. */
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
    /** Selects actual original compiler dependencies. @param p - Compiler dependency. @returns Whether original. */
    (p) => p.startsWith(upstream + "/"),
  );
for (const p of new Set(deps)) loadUnicodeOriginal(sources, p.slice(upstream.length + 1));
/** Records every original native observation and real process diagnostics. @param executable - Native caller. @param mode - Complete corpus. @returns Exact bytes. */
function capture(executable, mode) {
  const result = spawnSync(executable, [mode], {
    maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(`${executable}.${mode}`, result.stdout);
  writeFileSync(`${executable}.${mode}.stderr`, result.stderr);
  if (result.status !== 0) throw new Error(result.stderr.toString());
  return result.stdout;
}
const captures = Object.fromEntries(
  ["points", "mappings", "conversions"].map(
    /** Retains complete original output for one corpus. @param mode - Actual caller selector. @returns Bytes pair. */
    (mode) => [mode, capture(binary, mode)],
  ),
);
if (captures.points.length !== 65536 * 2 * 4) throw new Error("Incomplete original UTF16 capture");
const sanitized = build(true);
for (const [mode, bytes] of Object.entries(captures))
  if (!capture(sanitized, mode).equals(bytes)) throw new Error(`Sanitized output differs: ${mode}`);
const configuration = execFileSync("clang++", [...flags, "-dM", "-E", `${target}/driver.cpp`], {
  encoding: "utf8",
});
writeFileSync(`${target}/configuration.txt`, configuration);
const result = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Records verified complete original blob hashes. @param entry - Full original source. @returns Digest pair. */
      ([name, bytes]) => [name, hash(bytes)],
    ),
  ),
  configuredHeaderHashes: {
    types: hash(configured.types),
    global: hash(configured.global),
    options: hash(options),
  },
  driverHash: hash(driver),
  scopeHash: hash(nativeScope),
  configurationHash: hash(configuration),
  points: {
    count: 65536,
    fields: ["code", "cased_letter"],
    rawBytes: captures.points.length,
    rawHash: hash(captures.points),
    gzipBase64: gzipSync(captures.points, { level: 9 }).toString("base64"),
  },
  mappings: JSON.parse(captures.mappings),
  conversions: JSON.parse(captures.conversions),
  sanitizedIdentical: true,
  evidenceScope:
    "Complete original conditional const Mapping arrays and cased_letter for every sal_Unicode value. Does not execute getValue/getConditionalValue, generated Locale, UNO exceptions or service/pool/document owners.",
};
if (write) writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Original casefolding primitive capture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    points: result.points.count,
    rawBytes: result.points.rawBytes,
    rawHash: result.points.rawHash,
    mappings: names.length,
    sources: Object.keys(sources).length,
    sanitizedIdentical: true,
  }),
);
