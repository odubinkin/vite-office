/** @fileoverview Captures complete original shared SvxOptionsGrid class/constructor using a normal-only native caller and verifies every actual header dependency. */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { format, resolveConfig } from "prettier";

const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/svx-grid-options-native";
const fixture = "apps/office/src/svx/source/dialog/native-grid-options-cases.json";
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
const header = original("include/svx/optgrid.hxx"),
  source = original("svx/source/dialog/optgrid.cxx");
const start = header.indexOf("class SVX_DLLPUBLIC SvxOptionsGrid"),
  end = header.indexOf("class SVX_DLLPUBLIC SvxGridItem", start);
if (start < 0 || end < 0) throw Error("Missing original full class");
const classScope = header.slice(start, end);
const ctorStart = source.indexOf("SvxOptionsGrid::SvxOptionsGrid()"),
  ctorEnd = source.indexOf("SvxGridItem*", ctorStart);
if (ctorStart < 0 || ctorEnd < 0) throw Error("Missing original constructor");
const ctorScope = source.slice(ctorStart, ctorEnd);
const caller = String.raw`
#include <sal/types.h>
#include <svx/svxdllapi.h>
#include <iostream>
#include <cstdint>
${classScope}
${ctorScope}
void state(const char*label,const SvxOptionsGrid&a){std::cout<<label<<" "<<a.GetFieldDrawX()<<" "<<a.GetFieldDivisionX()<<" "<<a.GetFieldDrawY()<<" "<<a.GetFieldDivisionY()<<" "<<a.GetUseGridSnap()<<" "<<a.GetSynchronize()<<" "<<a.GetGridVisible()<<"\n";}
int main(){SvxOptionsGrid defaults;state("defaults",defaults);for(int64_t n:{-4294967297LL,-65537LL,-1LL,0LL,1LL,100LL,1000LL,1270LL,2147483647LL,2147483648LL,4294967295LL,4294967296LL,4294967297LL})for(int bits=0;bits<8;++bits){SvxOptionsGrid a;a.SetFieldDrawX(static_cast<sal_uInt32>(n));a.SetFieldDivisionX(static_cast<sal_uInt32>(n+1));a.SetFieldDrawY(static_cast<sal_uInt32>(n+2));a.SetFieldDivisionY(static_cast<sal_uInt32>(n+3));a.SetUseGridSnap(bits&1);a.SetSynchronize(bits&2);a.SetGridVisible(bits&4);SvxOptionsGrid copy(a),assigned;assigned=copy;assigned=assigned;state("value",a);state("copy",copy);state("assigned",assigned);a.SetFieldDrawX(3);a.SetFieldDivisionX(4);a.SetFieldDrawY(5);a.SetFieldDivisionY(6);a.SetUseGridSnap(!(bits&1));a.SetSynchronize(!(bits&2));a.SetGridVisible(!(bits&4));state("changed",a);state("retained",copy);assigned=a;state("reassigned",assigned);}}
`;
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
    "-DNDEBUG",
    "-I" + upstream,
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
captures.state = run(target + "/caller", [], "state");
const data = {
  pin,
  normalOnly: true,
  driverHash: hash(caller),
  sourceHashes: sources,
  scopes: { classScope: hash(classScope), ctorScope: hash(ctorScope) },
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
if (write)
  writeFileSync(
    fixture,
    await format(JSON.stringify(data), { ...(await resolveConfig(fixture)), parser: "json" }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Committed original whole outputs changed");
console.log(
  JSON.stringify({
    normalOnly: true,
    streamBytes: Buffer.byteLength(captures.state),
    streamLines: captures.state.trimEnd().split("\n").length,
    commands: commands.length,
    sources: Object.keys(sources).length,
    configurations: Object.keys(configurations).length,
  }),
);
