/** @fileoverview Captures original portable array summation operations with unchanged complete native headers and verified full SAL dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/calc-array-sum-native";
const fixture = "apps/office/src/sc/inc/native-array-sum-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "sc/inc/kahan.hxx",
  "sc/inc/arraysumfunctor.hxx",
  "include/formula/errorcodes.hxx",
  "include/o3tl/untaint.hxx",
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const priorRoot = "output/playwright/rtl-float-format-native";
const prior = JSON.parse(readFileSync(`${priorRoot}/manifest.json`, "utf8"));
const priorFixture = JSON.parse(
  readFileSync("apps/office/src/sal/rtl/native-float-format-cases.json", "utf8"),
);
if (prior.state !== "captured" || prior.pin !== pin)
  throw new Error("Missing prior verified full native graph");
for (const [path, expected] of Object.entries(priorFixture.sourceHashes))
  if (
    prior.sourceHashes[path] !== expected ||
    hash(loadUnicodeOriginal(native.sources, path)) !== expected
  )
    throw new Error(`Changed verified original native source:${path}`);
for (const [path, expected] of Object.entries(prior.generatedHashes))
  if (hash(readFileSync(path)) !== expected)
    throw new Error(`Changed verified generated native header:${path}`);
const objectHashes = {};
/** Uses only completed original translation units with the matching instrumented graph and records actual immutable objects. @param sanitized - Required graph. @returns Verified full dependency object list. */
function objects(sanitized) {
  const entries = prior.commands.filter(
    /** Selects genuine original completed compilation commands. @param command - Prior executed compiler command. @returns Matching original graph. */ (
      command,
    ) =>
      command.tool === "clang++" &&
      command.exitCode === 0 &&
      command.argv.includes("-c") &&
      command.argv.includes("-fsanitize=address,undefined") === sanitized,
  );
  if (entries.length !== 69) throw new Error("Incomplete genuine native object graph");
  return entries.map(
    /** Records actual linked object bytes before execution. @param command - Original completed compile. @returns Object path. */ (
      command,
    ) => {
      const path = command.argv[command.argv.indexOf("-o") + 1];
      objectHashes[path] = hash(readFileSync(path));
      return path;
    },
  );
}
const driver = String.raw`#include <arraysumfunctor.hxx>
#include <bit>
#include <cstdint>
#include <cstdio>
#include <cmath>
#include <limits>
#include <vector>
void hex(double v){std::printf("%016llx",static_cast<unsigned long long>(std::bit_cast<std::uint64_t>(v)));}
int main(){
 std::printf("PROFILE %d\n", SC_USE_SSE2);
 const double pool[]={0.,-0.,1.,-1.,0.1,0.2,-0.3,1e16,-1e16,1e-16,-1e-16,1e100,-1e100,1e-300,-1e-300,std::numeric_limits<double>::denorm_min(),1e200,-1e200,CreateDoubleError(FormulaError::NoValue)};
 std::uint64_t state=0xfda87130ce551824ULL;
 for(unsigned n=0;n<4096;n++){
   std::vector<double> values;for(unsigned i=0;i<n%65;i++){state^=state<<13;state^=state>>7;state^=state<<17;values.push_back(pool[state%19]);}
   if(n==1)values={CreateDoubleError(FormulaError::NoValue),1.,2.};
   if(n==2)values={0.1,CreateDoubleError(FormulaError::NoValue),0.2};
   if(n==3)values={CreateDoubleError(FormulaError::NoValue),CreateDoubleError(FormulaError::NoValue),42.};
   if(n==4)values={CreateDoubleError(FormulaError::NoValue),1.,INFINITY};
   if(n==5)values={INFINITY};
   std::printf("%u %zu",n,values.size());for(double v:values){std::printf(" ");hex(v);}
   KahanSum sum=sc::op::sumArray(values.data(),values.size());std::printf(" ");hex(sum.get());std::printf(" ");hex(sum.get());sum.add(1.);std::printf(" ");hex(sum.get());std::printf("\n");
 }
 return std::ferror(stdout)?3:0;
}`;
writeFileSync(`${target}/driver.cpp`, driver);
/** Links an observation-only caller to the completed original object graph. @param sanitized - Instrumentation. @returns Binary. */
function build(sanitized) {
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/sc/inc",
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
      "-DCPPU_DLLIMPLEMENTATION",
      "-MMD",
      "-MF",
      `${binary}.d`,
      `${target}/driver.cpp`,
      ...objects(sanitized),
      "-framework",
      "CoreFoundation",
      "-framework",
      "Foundation",
      "-pthread",
      "-lz",
      "-Wl,-dead_strip",
      "-o",
      binary,
    ],
    `link-${sanitized ? "asan" : "normal"}`,
  );
  const dependencies = readFileSync(`${binary}.d`, "utf8")
    .replaceAll(String.fromCharCode(92), "")
    .split(/\s+/)
    .filter(
      /** Selects actual original dependency paths. @param p - Dependency. @returns Original path membership. */ (
        p,
      ) => p.startsWith("vendor/libreoffice-reference/"),
    );
  for (const path of dependencies)
    loadUnicodeOriginal(native.sources, path.slice("vendor/libreoffice-reference/".length));
  return binary;
}
/** Captures actual native process bytes and instrumentation status. @param binary - Original caller. @returns Result. */
function capture(binary) {
  const r = spawnSync(binary, [], {
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(`${binary}.values`, r.stdout ?? "");
  writeFileSync(`${binary}.stderr`, r.stderr ?? "");
  native.manifest.commands.push({ tool: binary, argv: [], exitCode: r.status, signal: r.signal });
  return r;
}
const normal = capture(build(false)),
  sanitized = capture(build(true));
if (
  normal.status !== 0 ||
  sanitized.status !== 0 ||
  !normal.stdout.equals(sanitized.stdout) ||
  sanitized.stderr.length
)
  throw new Error(`Original array-sum observations failed:${normal.stderr} ${sanitized.stderr}`);
for (const [path, expected] of Object.entries(objectHashes))
  if (hash(readFileSync(path)) !== expected)
    throw new Error(`Changed linked original object:${path}`);
const result = {
  pin,
  driverHash: hash(driver),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Pins each complete original input. @param entry - Source path and bytes. @returns Hash entry. */ ([
        p,
        v,
      ]) => [p, hash(v)],
    ),
  ),
  objectHashes,
  profile: normal.stdout.toString().split("\n")[0],
  rowCount: normal.stdout.toString().trimEnd().split("\n").length,
  captures: {
    values: {
      byteLength: normal.stdout.length,
      digest: hash(normal.stdout),
      gzipBase64: gzipSync(normal.stdout).toString("base64"),
    },
  },
  scope:
    "Unchanged complete KahanSum header;portable native non-SSE2 specialization,default/value/error/copy,add scalar/accumulator,get including mutating flush and cancellation,multiply assignment,binary64 Neumaier step.2048deterministic finite/nonfinite input sequences;normal andASanUBSan streams agree. No claimed SSE2 or long-double parity.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed native Kahan observations");
console.log(
  `Native array sum ${write ? "written" : "verified"}:${result.rowCount}rows,${Object.keys(objectHashes).length}verified objects`,
);
