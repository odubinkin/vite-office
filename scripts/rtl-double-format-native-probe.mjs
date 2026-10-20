/** @fileoverview Captures original complete SAL number formatting and source-defined Unicode writes using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-double-format-native";
const fixture = "apps/office/src/sal/rtl/native-double-format-cases.json";
const native = prepareCaseNative(target);
for (const path of [
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
const driver = String.raw`#include <algorithm>
#include <initializer_list>
#include <rtl/math.h>
#include <rtl/ustrbuf.h>
#include <rtl/ustring.h>
#include <cstdio>
#include <cstring>
#include <cmath>
#include <limits>
#include <cstdint>
const sal_Int32 groups[][5]={{0},{3,0},{3,2,0},{1,0},{1,2,3,0},{2,4,1,0}};
unsigned serial=0;
unsigned excluded=0;
void emit(double v,int f,int p,int g,bool erase){
 // Negative F decimal counts can make the original stack-allocation bound smaller
 // than its emitted integer/grouping text. Keep that undefined native domain out
 // of returned-output observations; the retained initial ASan diagnostic proves it.
 double a=std::abs(v);
 if(std::isfinite(a)&&a>=1&&p<0&&(f==rtl_math_StringFormat_F||f==rtl_math_StringFormat_Automatic)){
   bool integer=a<0x1p53&&std::trunc(a)==a;
   int exp=int(std::floor(std::log10(a)));
   if(f==rtl_math_StringFormat_F||exp<15||integer){
     int places=integer?std::max(-15,p):std::max(-309,p);
     int required=(exp+2)*(g>=0?2:1)+1;
     for(int e=exp-1;e<=exp+1;e++){
       int digits=places+1+e;
       int bound=(digits<=0?std::max(places,std::abs(e)):digits+places)+10+(g>=0?std::abs(digits)*2:0);
       if(bound<required){excluded++;return;}
     }
   }
 }
 uint64_t bits;std::memcpy(&bits,&v,8);int kind=serial%4;sal_Unicode dec=serial%3==0?0x066b:serial%3==1?',':'.';sal_Unicode sep=serial%5==0?0:serial%5==1?0x202f:',';
 rtl_uString*s=nullptr;sal_Unicode initial[]={'A','B'};int cap=kind==1?18:kind==2?2:0;int offset=kind==0?-7:kind==3?0:1;
 if(kind==1)rtl_uStringbuffer_newFromStr_WithLength(&s,initial,2);else if(kind==3)rtl_uString_new(&s);else rtl_uString_newFromStr_WithLength(&s,initial,2);
 auto before=s;rtl_uString_acquire(before);
 rtl_math_doubleToUString(&s,kind==0?nullptr:&cap,offset,v,rtl_math_StringFormat(f),p,dec,g<0?nullptr:groups[g],sep,erase);
 std::printf("[\"%016llx\",%d,%d,%d,%u,%u,%d,%d,%d,%d,%d,%d,[",(unsigned long long)bits,f,p,g,unsigned(dec),unsigned(sep),int(erase),kind,cap,int(s==before),int(before->refCount),int(s->refCount));
 for(int i=0;i<=s->length;i++)std::printf("%s%u",i?",":"",unsigned(s->buffer[i]));std::puts("]]");rtl_uString_release(before);rtl_uString_release(s);serial++;
}
int main(int argc,char**argv){
 if(argc==2 && std::strcmp(argv[1],"unsafe")==0){
  std::fprintf(stderr,"Original undefined input:F,value=1e14,places=-15,groups={1,0},decimal=period,group=comma,erase=false\n");
  rtl_uString*s=nullptr;
  rtl_math_doubleToUString(&s,nullptr,0,1e14,rtl_math_StringFormat_F,-15,'.',groups[3],',',false);
  rtl_uString_release(s);return 4;
 }

 const int places[]={-310,-309,-308,-20,-16,-15,-8,-3,-1,0,1,2,3,6,7,14,15,16,17,20,308,309,310,rtl_math_DecimalPlaces_Max};
 const double values[]={0.0,-0.0,1.,-1.,0.5,-0.5,0.00001,0.0001,0.1,0.25,1.25,9.999999999999998,99.95,999.5,99999.99,999999.9999999999,1e-15,1e-14,1e14,1e15,1e16,1e17,1e18,1e19,1e20,1e99,1e100,1e-99,1e-100,1e-300,1.2345678901234567,123456789012345.67,9007199254740991.,9007199254740992.,std::numeric_limits<double>::denorm_min(),std::numeric_limits<double>::min(),std::numeric_limits<double>::max(),INFINITY,-INFINITY,NAN};
 for(double v:values)for(int f=0;f<8;f++)for(int p:places)for(int g=-1;g<6;g++)for(bool e:{false,true})emit(v,f,p,g,e);
 for(int i=0;i<8;i++){double v=std::numeric_limits<double>::max();for(int n=0;n<i;n++)v=std::nextafter(v,0.);for(int f=0;f<8;f++)emit(v,f,rtl_math_DecimalPlaces_Max,2,true);}
 uint64_t state=0x52194fcad1286723ULL;
 for(int n=0;n<16384;n++){state^=state<<13;state^=state>>7;state^=state<<17;double v;std::memcpy(&v,&state,8);emit(v,n%8,places[n%24],n%7-1,n%2);}
 std::fprintf(stderr,"Excluded original unsafe allocation domain:%u\n",excluded);return std::ferror(stdout)?3:0;
}`;
writeFileSync(`${target}/driver.cpp`, driver);
/** Links a new observation-only caller to the genuine unchanged original cached object graph. @param sanitized - Required instrumentation. @returns Native executable. */
function build(sanitized) {
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
      "-DCPPU_DLLIMPLEMENTATION",
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
  return binary;
}
/** Captures original process bytes and terminal status. @param binary - Actual caller. @param mode - Native caller input. @returns Process result. */
function capture(binary, mode) {
  const result = spawnSync(binary, [mode], {
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(`${binary}.${mode}`, result.stdout ?? "");
  writeFileSync(`${binary}.${mode}.stderr`, result.stderr ?? "");
  native.manifest.commands.push({
    tool: binary,
    argv: [mode],
    exitCode: result.status,
    signal: result.signal,
  });
  return result;
}
const normal = build(false),
  sanitized = build(true);
const first = capture(normal, "values"),
  second = capture(sanitized, "values");
if (
  first.status !== 0 ||
  second.status !== 0 ||
  !first.stdout.equals(second.stdout) ||
  /AddressSanitizer|runtime error:/.test(second.stderr.toString())
)
  throw new Error(`Original formatter observations failed:${first.stderr}\n${second.stderr}`);
for (const [path, expected] of Object.entries(objectHashes))
  if (hash(readFileSync(path)) !== expected)
    throw new Error(`Linked original object changed:${path}`);
const undefinedAllocation = capture(sanitized, "unsafe");
if (
  undefinedAllocation.status === 0 ||
  !/AddressSanitizer: dynamic-stack-buffer-overflow/.test(undefinedAllocation.stderr.toString()) ||
  !/strtmpl.hxx:1667/.test(undefinedAllocation.stderr.toString())
)
  throw new Error("Missing original negative-F stack-allocation failure witness");
const result = {
  undefinedAllocation: {
    input: "F,value=1e14,places=-15,groups={1,0},decimal=period,group=comma,erase=false",
    exitCode: undefinedAllocation.status,
    signal: undefinedAllocation.signal,
    diagnostic: "AddressSanitizer: dynamic-stack-buffer-overflow",
    source: "sal/rtl/strtmpl.hxx:1667",
  },
  rowCount: first.stdout.toString().trimEnd().split("\n").length,
  originalUnsafeAllocationDomain: first.stderr.toString().trim(),
  pin,
  driverHash: hash(driver),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Saves every genuine original source hash. @param entry - Native source. @returns Hash pair. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  objectHashes,
  captures: {
    values: {
      byteLength: first.stdout.length,
      digest: hash(first.stdout),
      gzipBase64: gzipSync(first.stdout).toString("base64"),
    },
  },
  scope:
    "Complete original number formatter and genuine Unicode allocation/buffer owners from verified full69normal+69ASanUBSan SAL/CPPU objects. Deterministic boundary/mode/precision/grouping/erase matrix and16384full-bit samples observe exact initialized Unicode units/terminator,capacity,relative identity and refs under replace/insert. No source replacements or network;bounded observations exclude the native negative-F stack-allocation unsafe domain using a conservative source-allocation bound (initial actual ASan overflow evidence retained in task artifacts) and do not certify exhaustive binary64 inputs,host shortest conversion equivalence or native ABI.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed original formatter observations");
console.log(
  `Native number formatting ${write ? "written" : "verified"}:${first.stdout.toString().split("\n").length - 1}states;${Object.keys(objectHashes).length}verified objects`,
);
