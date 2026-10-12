/** @fileoverview Captures the complete pinned shared formula error header using a normal-only native caller and verifies every actual header dependency. */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";

const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/formula-errorcodes-native";
const fixture = "apps/office/src/formula/inc/native-errorcodes-cases.json";
const config = "output/playwright/task39-native-types/headers";
const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
/** Hashes whole bytes. @param value - Source or output. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
const sources = {};
/** Verifies whole original bytes against the pinned git blob. @param path - Original file. @returns Source. */
function original(path) {
  const bytes = readFileSync(upstream + "/" + path);
  if (!bytes.equals(execFileSync("git", ["-C", upstream, "show", pin + ":" + path])))
    throw Error("Changed original header " + path);
  sources[path] = hash(bytes);
  return bytes.toString();
}
if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw Error("Expected pinned original source");
const header = original("include/formula/errorcodes.hxx");
const enumSource = header.match(/enum class FormulaError : sal_uInt16\s*\{([\s\S]*?)\};/u)?.[1];
if (!enumSource) throw Error("Missing original error enum");
const names = [...enumSource.matchAll(/^\s*(\w+)\s*=\s*(?:0x[\da-f]+|\d+)/gimu)].map(
  /** Reads the complete original enumerator name. @param match - Declaration. @returns Name. */
  (match) => match[1],
);
const caller = String.raw`
#include <formula/errorcodes.hxx>
#include <bit>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <string>
int main(int argc,char**argv) {
 if(argc!=2)return 2;std::string mode=argv[1];
 if(mode=="enum") {
 ENUM_CALLS
 } else if(mode=="create") {
  for(unsigned n=0;n<=65535;++n) {
   auto e=static_cast<FormulaError>(n);auto value=CreateDoubleError(e);
   std::cout<<n<<" "<<std::hex<<std::setw(16)<<std::setfill('0')<<std::bit_cast<std::uint64_t>(value)<<std::dec<<" "<<unsigned(GetDoubleErrorValue(value))<<" "<<isPublishedFormulaError(e)<<"\n";
  }
 } else if(mode=="decode") {
  std::uint32_t high[]={0,1,0x00100000,0x3ff00000,0x7fefffff,0x7ff00000,0x7ff00001,0x7ff7ffff,0x7ff80000,0x7fffffff};
  std::uint32_t low[]={0,1,10,500,501,532,541,0x7fff,0x8000,0xffff,0x10000,0x10001,0x1000000,0xffff0000,0xffffffff};
  for(auto sign:{0u,0x80000000u})for(auto hi:high)for(auto lo:low){
   auto bits=(std::uint64_t(hi|sign)<<32)|lo;auto v=std::bit_cast<double>(bits);
   std::cout<<std::hex<<std::setw(16)<<std::setfill('0')<<bits<<std::dec<<" "<<unsigned(GetDoubleErrorValue(v))<<"\n";
  }
 } else return 3;
}
`.replace(
  "ENUM_CALLS",
  names
    .map(
      /** Calls actual original enum members. @param name - Original name. @returns Caller expression. */
      (name) => String.raw`std::cout<<"${name} "<<unsigned(FormulaError::${name})<<"\n";`,
    )
    .join("\n"),
);
mkdirSync(target, { recursive: true });
writeFileSync(target + "/caller.cpp", caller);
const commands = [];
/** Runs and records an exact compiler or caller command. @param tool - Executable. @param argv - Arguments. @param label - Evidence file. @returns Whole stdout. */
function run(tool, argv, label) {
  const result = spawnSync(tool, argv, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  commands.push({ tool, argv, exitCode: result.status, signal: result.signal });
  writeFileSync(target + "/" + label + ".stdout", result.stdout ?? "");
  writeFileSync(target + "/" + label + ".stderr", result.stderr ?? "");
  writeFileSync(target + "/commands.json", JSON.stringify(commands, null, 2) + "\n");
  if (result.status !== 0 || result.signal || result.error || result.stderr)
    throw Error("Native command failed " + label + ": " + result.stderr);
  return result.stdout;
}
run(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-DMACOSX",
    "-DUNX",
    "-I" + config,
    "-I" + upstream + "/include",
    "-MMD",
    "-MF",
    target + "/caller.d",
    target + "/caller.cpp",
    "-o",
    target + "/caller",
  ],
  "compile",
);
const knownConfig = JSON.parse(
  readFileSync("output/playwright/uno-object-entry-native/manifest.json", "utf8"),
).configurations;
const configurations = {};
const toolchainMetadata = [];
for (const dependency of readFileSync(target + "/caller.d", "utf8")
  .replaceAll("\\\n", " ")
  .split(/\s+/u)
  .slice(1)
  .filter(Boolean)) {
  if (dependency === target + "/caller.cpp") continue;
  if (dependency.startsWith(upstream + "/")) original(dependency.slice(upstream.length + 1));
  else if (dependency.startsWith(config + "/")) {
    const name = dependency.slice(config.length + 1),
      actual = hash(readFileSync(dependency));
    if (actual !== knownConfig[name])
      throw Error("Changed original native configuration " + dependency);
    configurations[dependency] = actual;
  } else if (dependency.endsWith("/MacOSX.sdk/SDKSettings.json")) {
    // Compiler-reported SDK metadata is not repository source; no outside-repo file is read here.
    toolchainMetadata.push(dependency);
  } else throw Error("Unexpected native dependency " + dependency);
}
const captures = {};
for (const mode of ["enum", "create", "decode"])
  captures[mode] = run(target + "/caller", [mode], mode);
const data = {
  pin,
  normalOnly: true,
  driverHash: hash(caller),
  sourceHashes: sources,
  configurations,
  toolchainMetadata,
  captures,
};
writeFileSync(
  target + "/manifest.json",
  JSON.stringify(
    {
      ...data,
      captures: Object.fromEntries(
        Object.entries(captures).map(
          /** Records whole output identity. @param entry - Capture. @returns Size/hash entry. */
          ([key, value]) => [key, { byteLength: Buffer.byteLength(value), sha256: hash(value) }],
        ),
      ),
      commands,
    },
    null,
    2,
  ) + "\n",
);
if (write) writeFileSync(fixture, JSON.stringify(data, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Committed original whole outputs changed");
console.log(
  JSON.stringify({
    normalOnly: true,
    enumNames: names.length,
    createCases: 65536,
    decodeCases: 300,
    commands: commands.length,
    sources: Object.keys(sources).length,
    configurations: Object.keys(configurations).length,
  }),
);
