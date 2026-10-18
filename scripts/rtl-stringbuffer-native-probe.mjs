/** @fileoverview Captures original complete SAL stringbufferting wrappers and source-defined buffer writes using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-stringbuffer-native";
const fixture = "apps/office/src/sal/rtl/native-stringbuffer-cases.json";
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
const driver = String.raw`#include <rtl/ustrbuf.h>
#include <rtl/ustring.h>
#include <cstdio>
#include <cstdlib>
#include <new>
#include <string>
#include <vector>
void record(rtl_uString*p,int cap,rtl_uString*before){std::printf("[%d,%d,%d,%d",cap,p?p->length:-1,p?p->refCount:0,p==before);if(p)for(int i=0;i<=p->length;i++)std::printf(",%u",unsigned(p->buffer[i]));std::puts("]");}
std::vector<sal_Unicode> input(int n){std::vector<sal_Unicode>v;for(int i=0;i<n;i++)v.push_back(i==1?0:i==2?0xd800:i==3?0xdc00:65+i);return v;}
void values(){for(int n=0;n<=22;n++){auto v=input(n);rtl_uString*p=nullptr;int cap=n+16;rtl_uStringbuffer_newFromStr_WithLength(&p,v.data(),n);record(p,cap,nullptr);
 for(auto minimum:{-3,n+16,n+17,2*n+100}){auto before=p;rtl_uStringbuffer_ensureCapacity(&p,&cap,minimum);record(p,cap,before);}
 auto before=p;rtl_uStringbuffer_insert(&p,&cap,0,nullptr,0);record(p,cap,before);
 const char ascii[]={'X',0,'Y'};before=p;rtl_uStringbuffer_insert_ascii(&p,&cap,0,ascii,3);record(p,cap,before);
 sal_Unicode extra[]={0x1234,0,0x5678};before=p;rtl_uStringbuffer_insert(&p,&cap,p->length/2,extra,3);record(p,cap,before);
 before=p;rtl_uStringbuffer_insert(&p,&cap,1,nullptr,2);record(p,cap,before);
 for(auto code:{0u,0x41u,0xffffu,0xd800u,0x10000u,0x10ffffu}){before=p;rtl_uStringbuffer_insertUtf32(&p,&cap,p->length,code);record(p,cap,before);}
 before=p;rtl_uStringbuffer_remove(&p,1,2);record(p,cap,before);before=p;rtl_uStringbuffer_remove(&p,0,0);record(p,cap,before);before=p;rtl_uStringbuffer_remove(&p,p->length-1,99);record(p,cap,before);
 for(auto capacity:{0,p->length-1,p->length,p->length+7}){rtl_uString*copy=nullptr;int selected=rtl_uStringbuffer_newFromStringBuffer(&copy,capacity,p);record(copy,selected,p);rtl_uString_release(copy);}
 auto ref=rtl_uStringBuffer_refReturn(p);record(ref,cap,p);rtl_uString_release(ref);record(p,cap,p);
 before=p;auto moved=rtl_uStringBuffer_makeStringAndClear(&p,&cap);record(moved,2*n+100,before);record(p,cap,before);rtl_uString_release(moved);
 const sal_Unicode r[]={'R'};before=p;rtl_uStringbuffer_insert(&p,&cap,0,r,1);record(p,cap,before);before=p;rtl_uStringbuffer_remove(&p,0,99);record(p,cap,before);
 rtl_uString*copy=nullptr;int selected=rtl_uStringbuffer_newFromStringBuffer(&copy,0,p);record(copy,selected,p);rtl_uString_release(copy);rtl_uString_release(p);}
 rtl_uString*p=nullptr;rtl_uString_new(&p);int cap=0;auto before=p;auto moved=rtl_uStringBuffer_makeStringAndClear(&p,&cap);record(moved,0,before);record(p,cap,before);rtl_uString_release(p);
 p=nullptr;rtl_uStringbuffer_newFromStr_WithLength(&p,nullptr,7);record(p,16,nullptr);rtl_uString_release(p);
 p=nullptr;rtl_uString_new(&p);cap=0;before=p;rtl_uStringbuffer_ensureCapacity(&p,&cap,-1);record(p,cap,before);rtl_uString_release(p);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values"){values();return std::ferror(stdout)?3:0;}auto v=input(3);rtl_uString*p=nullptr;int cap=19;rtl_uStringbuffer_newFromStr_WithLength(&p,v.data(),3);
 if(mode=="overflow"){auto before=p;try{rtl_uStringbuffer_insert(&p,&cap,0,nullptr,2147483647);return 4;}catch(const std::bad_alloc&){record(p,cap,before);rtl_uString_release(p);return 0;}}
 switch(std::stoi(mode)){
 case 0:rtl_uStringbuffer_newFromStr_WithLength(nullptr,nullptr,-1);break;
 case 1:rtl_uStringbuffer_newFromStr_WithLength(&p,nullptr,-1);break;
 case 2:rtl_uStringbuffer_newFromStringBuffer(nullptr,-1,nullptr);break;
 case 3:rtl_uStringbuffer_newFromStringBuffer(&p,0,nullptr);break;
 case 4:rtl_uStringbuffer_newFromStringBuffer(nullptr,0,p);break;
 case 5:rtl_uStringbuffer_ensureCapacity(nullptr,nullptr,1);break;
 case 6:rtl_uStringbuffer_ensureCapacity(&p,nullptr,1);break;
 case 7:cap=-1;rtl_uStringbuffer_ensureCapacity(&p,&cap,1);break;
 case 8:rtl_uStringbuffer_insert(nullptr,nullptr,-1,nullptr,-1);break;
 case 9:rtl_uStringbuffer_insert(&p,nullptr,-1,nullptr,-1);break;
 case 10:cap=-1;rtl_uStringbuffer_insert(&p,&cap,-1,nullptr,-1);break;
 case 11:rtl_uStringbuffer_insert(&p,&cap,-1,nullptr,-1);break;
 case 12:rtl_uStringbuffer_insert(&p,&cap,4,nullptr,-1);break;
 case 13:rtl_uStringbuffer_insert(&p,&cap,0,nullptr,-1);break;
 case 14:rtl_uStringbuffer_remove(nullptr,-1,-1);break;
 case 15:rtl_uStringbuffer_remove(&p,-1,-1);break;
 case 16:rtl_uStringbuffer_remove(&p,4,-1);break;
 case 17:rtl_uStringbuffer_remove(&p,0,-1);break;
 case 18:rtl_uStringBuffer_makeStringAndClear(nullptr,nullptr);break;
 case 19:rtl_uStringBuffer_makeStringAndClear(&p,nullptr);break;
 case 20:rtl_uStringbuffer_insertUtf32(nullptr,nullptr,-1,0x110000);break;
 }return 5;}
`;
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
    maxBuffer: 32 * 1024 * 1024,
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
  sanitized = build(true),
  captures = {};
for (const mode of ["values", "overflow"]) {
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  if (
    first.status !== 0 ||
    second.status !== 0 ||
    !first.stdout.equals(second.stdout) ||
    /AddressSanitizer|runtime error:/.test(second.stderr.toString())
  )
    throw new Error(
      `Original buffer observations failed:${mode}:${first.stderr}\n${second.stderr}`,
    );
  captures[mode] = {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  };
}
const assertions = [];
for (let code = 0; code <= 20; code++) {
  const r = capture(normal, String(code));
  const expression = r.stderr.toString().match(/Assertion failed: \((.*?)\),/s)?.[1];
  if (r.signal !== "SIGABRT" || !expression)
    throw new Error(`Original buffer assertion failed:${code}:${r.stderr}`);
  assertions.push({ code, signal: r.signal, expression });
}
for (const [path, expected] of Object.entries(objectHashes))
  if (hash(readFileSync(path)) !== expected)
    throw new Error(`Linked original object changed:${path}`);
const result = {
  pin,
  driverHash: hash(driver),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Saves every complete genuine source hash. @param entry - Native source. @returns Hash pair. */ ([
        path,
        value,
      ]) => [path, hash(value)],
    ),
  ),
  objectHashes,
  captures,
  assertions,
  scope:
    "Unchanged genuine original Unicode buffer C/template/native allocation/refs from prior verified full69object normal and69object ASanUBSan SAL/CPPU graphs,linked by two new observation-only callers after source/config/generated/object checks. Compares initialized logical UTF16 units/terminator,capacity,refs and relative identity across constructor,reserve,copy,insertion/removal,ref-return,transfer/reset/reuse. Does not read uninitialized native spare/gap memory or certify invalid aliased insertion,ABI or full OUStringBuffer/class/consumer behavior.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed original stringbuffer observations");
console.log(
  `Native Unicode buffer observations ${write ? "written" : "verified"}: ${assertions.length}assertions;${Object.keys(objectHashes).length}verified actual objects`,
);
