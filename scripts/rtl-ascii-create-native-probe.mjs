/** @fileoverview Captures original terminated ASCII constructors and actual replaceable allocation-pointer ownership using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-ascii-create-native";
const fixture = "apps/office/src/sal/rtl/native-ascii-create-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <rtl/ustring.hxx>
#include "strimp.hxx"
#include <cstdio>
#include <cstdlib>
#include <initializer_list>
#include <string>
#include <vector>
#include <map>
void emit(std::initializer_list<sal_Int32> row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void observe(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
std::map<void*,int> ids;int nextId=1;bool failNext=false;std::vector<sal_Int32> events;
void* SAL_CALL allocate(std::size_t bytes){if(failNext){failNext=false;events.insert(events.end(),{2,static_cast<sal_Int32>(bytes)});return nullptr;}void*p=std::malloc(bytes);if(!p)std::exit(4);int id=nextId++;ids[p]=id;events.insert(events.end(),{0,id,static_cast<sal_Int32>(bytes)});return p;}
void SAL_CALL release(void*p){auto it=ids.find(p);if(it==ids.end())std::exit(5);auto*s=static_cast<rtl_uString*>(p);events.insert(events.end(),{1,it->second,s->refCount,s->length});for(int j=0;j<=s->length;j++)events.push_back(s->buffer[j]);ids.erase(it);std::free(p);}
void flush(){emit({static_cast<sal_Int32>(events.size())});for(auto n:events)emit({n});events.clear();}
void regular(){for(bool previous:{false,true})for(int n=0;n<4;n++){const char*values[]={nullptr,"","a\0ignored","Hello 127\x7f"};rtl_uString*p=nullptr,*held=nullptr;if(previous){rtl_uString_newFromAscii(&p,"old");held=p;rtl_uString_acquire(held);}emit({previous,n});observe(held);flush();rtl_uString_newFromAscii(&p,values[n]);observe(p);observe(held);flush();rtl_uString_release(p);if(held)rtl_uString_release(held);flush();}}
void bytes(){for(int a=1;a<128;a++)for(int b=0;b<128;b++){char v[]={static_cast<char>(a),static_cast<char>(b),0,'X',0};rtl_uString*p=nullptr;rtl_uString_newFromAscii(&p,v);emit({a,b});observe(p);rtl_uString_release(p);}}
void values(){for(int n=0;n<4;n++){const char*values[]={nullptr,"","a\0ignored","Hello 127\x7f"};OUString value=OUString::createFromAscii(values[n]),defaultValue;emit({n,value.pData==defaultValue.pData});observe(value.pData);flush();}flush();}
void failure(){for(bool previous:{false,true}){rtl_uString*p=nullptr,*held=nullptr;if(previous){rtl_uString_newFromAscii(&p,"old");held=p;rtl_uString_acquire(held);}emit({previous});observe(held);flush();failNext=true;rtl_uString_newFromAscii(&p,"fail");observe(p);observe(held);flush();if(held)rtl_uString_release(held);flush();}failNext=true;auto*p=new OUString(OUString::createFromAscii("fail"));observe(p->pData);flush();}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="bytes"){bytes();return 0;}rtl_allocateString=allocate;rtl_freeString=release;if(mode=="regular")regular();else if(mode=="values")values();else if(mode=="failure")failure();else if(mode=="bad-slot")rtl_uString_newFromAscii(nullptr,"a");else if(mode=="bad-byte"){char v[]={static_cast<char>(128),0};rtl_uString*p=nullptr;rtl_uString_newFromAscii(&p,v);}else return 2;return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  const dependency = `${binary}.d`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/sal/rtl",
      "-DCPPU_DLLIMPLEMENTATION",
      "-MMD",
      "-MF",
      dependency,
      `${target}/driver.cpp`,
      ...objects,
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
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  return binary;
}
/** Captures complete original process output, including terminal status and all diagnostics. @param binary - Actual original caller. @param mode - Caller mode. @returns Complete process result. */
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
  native.save();
  return result;
}
const normal = build(false),
  sanitized = build(true),
  captures = {};
for (const mode of ["regular", "bytes", "values", "failure"]) {
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  if (
    first.status !== 0 ||
    second.status !== 0 ||
    !first.stdout.equals(second.stdout) ||
    /AddressSanitizer|runtime error:/.test(second.stderr.toString())
  )
    throw new Error(`Original ${mode} capture failed: ${first.stderr}\n${second.stderr}`);
  captures[mode] = {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  };
}
const assertions = [];
for (const mode of ["bad-slot", "bad-byte"]) {
  const result = capture(normal, mode);
  if (result.signal !== "SIGABRT" || !/Assertion failed/.test(result.stderr.toString()))
    throw new Error(`Original checked ASCII guard failed: ${mode}`);
  assertions.push({ mode, signal: result.signal, stderr: result.stderr.toString() });
}
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes every complete original input. @param entry - Original source pair. @returns Full hash entry. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  assertions,
  scope:
    "Full unchanged SAL/CPPU dependency owners under normal and ASan/UBSan. Actual terminated rtl_uString_newFromAscii and OUString::createFromAscii char-pointer overload, every127 nonzero ASCII first byte crossed with every128 second byte, first-NUL semantics, null/empty input, original old-owner release order, initialized fields/terminators and actual allocator/free events. Failure mode sets the original replaceable allocation-function pointer to a caller hook returning null, rather than replacing an upstream method; it observes the original null result. The null-data C++ value is deliberately retained without destruction, because its destructor requires non-null data. This is an initialized source-provided failure witness, not ordinary operating-system OOM, source-view/literal overload or native ABI/threading/full consumer QA. System libraries are uninstrumented and leak detection is disabled. No original source body is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original ASCII constructor observations");
console.log(
  `Original ASCII constructor observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
