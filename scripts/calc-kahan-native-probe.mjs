/** @fileoverview Captures consumed original KahanSum operations with unchanged complete native headers and verified full SAL dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/calc-kahan-native";
const fixture = "apps/office/src/sc/inc/native-kahan-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "sc/inc/kahan.hxx",
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
const driver = String.raw`#include <kahan.hxx>
#include <bit>
#include <cstdint>
#include <cstdio>
#include <cmath>
#include <limits>
void hex(double v){std::printf("%016llx",static_cast<unsigned long long>(std::bit_cast<std::uint64_t>(v)));}
int main(){
 std::printf("PROFILE %d\n", SC_USE_SSE2);
 KahanSum zero,value(0.1);std::printf("DEFAULT ");hex(zero.get());std::printf(" ");hex(value.get());std::printf("\n");
 const double v[]={0.,-0.,1.,-1.,0.1,0.2,-0.3,1e16,-1e16,1e-16,-1e-16,1e300,-1e300,1e-300,-1e-300,std::numeric_limits<double>::denorm_min(),std::numeric_limits<double>::max(),INFINITY,-INFINITY,std::numeric_limits<double>::quiet_NaN()};
 std::uint64_t state=0x82e4953916ac7129ULL;
 for(unsigned n=0;n<2048;n++){
   unsigned ix[6];for(auto&i:ix){state^=state<<13;state^=state>>7;state^=state<<17;i=state%20;}
   if(n<2){ix[0]=ix[1]=0;ix[2]=n?8:7;ix[3]=2;ix[4]=n?7:8;ix[5]=2;}
   double seed=v[ix[0]],err=v[ix[1]],x=v[ix[2]],y=v[ix[3]],z=v[ix[4]],mult=v[ix[5]];
   std::printf("%u",n);for(double q:{seed,err,x,y,z,mult}){std::printf(" ");hex(q);}
   KahanSum a(seed,err);a.add(x);a.add(y);a.add(z);KahanSum b(a),c(a),d(y,x);d.add(z);c.add(d);b*=mult;
   for(double q:{a.get(),a.get(),b.get(),c.get(),d.get()}){std::printf(" ");hex(q);}a.add(x);std::printf(" ");hex(a.get());
   double sum=seed,error=err;KahanSum::sumNeumaierNormal(sum,error,x);std::printf(" ");hex(sum);std::printf(" ");hex(error);std::printf("\n");
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
    maxBuffer: 16 * 1024 * 1024,
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
  throw new Error(`Original Kahan observations failed:${normal.stderr} ${sanitized.stderr}`);
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
  `Native Kahan ${write ? "written" : "verified"}:${result.rowCount}rows,${Object.keys(objectHashes).length}verified objects`,
);
