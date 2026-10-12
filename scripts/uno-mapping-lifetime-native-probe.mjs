/** @fileoverview Captures whole unchanged lbmap.cxx private lifetime owners over verified immutable genuine desktop native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { hash, pin, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/uno-mapping-lifetime-native",
  fixture = "apps/office/src/cppu/source/uno/native-mapping-lifetime-cases.json",
  native = reuseExceptionNative(
    target,
    "output/playwright/uno-object-entry-native",
    "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  );
loadUnicodeOriginal(native.sources, "cppu/source/uno/lbmap.cxx");
const caller = String.raw`${unoNativeValueCaller}
#include "lbmap.cxx"
#include <utility>
using Owner=cppu::Mapping;using Entry=cppu::MappingEntry;
struct Input:uno_Mapping{int label,count=100;};
Owner*watched=nullptr;
int identity(uno_Mapping*p){return p?static_cast<Input*>(p)->label:-1;}
void acquireInput(uno_Mapping*p){auto*x=static_cast<Input*>(p);emit({30,x->label,++x->count,watched?identity(watched->get()):-2});}
void releaseInput(uno_Mapping*p){auto*x=static_cast<Input*>(p);emit({31,x->label,--x->count,watched?identity(watched->get()):-2});}
void freeA(uno_Mapping*){}void freeB(uno_Mapping*){}
Input input(int label){Input p;p.acquire=acquireInput;p.release=releaseInput;p.mapInterface=nullptr;p.label=label;return p;}
void snapshot(Owner const&o){emit({70,identity(o.get()),o.is()});}
void snapshot(Entry const&e){emit({71,e.nRef,identity(e.pMapping),e.freeMapping==freeA?1:e.freeMapping==freeB?2:0});text(e.aMappingName.pData);}
void mapping(){Input a=input(0),b=input(1);{Owner d; snapshot(d);Owner emptyCopy(d);snapshot(emptyCopy);Owner emptyMove(std::move(emptyCopy));snapshot(emptyCopy);snapshot(emptyMove);Owner aa(&a);snapshot(aa);Owner copied(aa);snapshot(copied);Owner moved(std::move(copied));snapshot(copied);snapshot(moved);watched=&aa;emit({40,&(aa=&b)==&aa});snapshot(aa);aa=&b;snapshot(aa);aa=nullptr;snapshot(aa);emit({41,&(aa=std::move(moved))==&aa});snapshot(aa);snapshot(moved);aa=std::move(aa);snapshot(aa);watched=&d;d=&a;snapshot(d);copied=&b;snapshot(copied);d=std::move(copied);snapshot(d);snapshot(copied);d=std::move(aa);snapshot(d);snapshot(aa);d=nullptr;snapshot(d);watched=nullptr;Owner live(&a);snapshot(live);copied=&b;snapshot(copied);}emit({99,a.count,b.count});}
void entries(){Input a=input(0),b=input(1);rtl::OUString name=rtl::OUString::createFromAscii("mapping");{Entry e(&a,freeA,name);snapshot(e);text(name.pData);e.nRef=-13;e.freeMapping=freeB;Entry c(e);snapshot(e);snapshot(c);Entry m(std::move(c));snapshot(c);snapshot(m);Entry d(nullptr,nullptr,rtl::OUString::createFromAscii("other"));snapshot(d);emit({42,&(d=e)==&d});snapshot(d);d=d;snapshot(d);emit({43,&(d=std::move(m))==&d});snapshot(d);snapshot(m);d=std::move(d);snapshot(d);}text(name.pData);rtl::OUString value=rtl::OUString::createFromAscii("rvalue");{Entry e(&b,nullptr,std::move(value));snapshot(e);text(value.pData);}text(value.pData);emit({99,a.count,b.count});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="mapping")mapping();else if(mode=="entries")entries();else return 2;return 0;}
`;
writeFileSync(target + "/driver.cpp", caller);
/** Captures all initialized original observations and terminal diagnostics. @param binary - Genuine process. @param mode - Complete scenario. @returns Full process result. */
function capture(binary, mode) {
  const r = spawnSync(binary, [mode], {
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(binary + "." + mode, r.stdout ?? "");
  writeFileSync(binary + "." + mode + ".stderr", r.stderr ?? "");
  native.manifest.commands.push({
    tool: binary,
    argv: [mode],
    exitCode: r.status,
    signal: r.signal,
  });
  native.save();
  return r;
}
const normal = native.build(false),
  sanitized = native.build(true),
  captures = {};
for (const mode of ["mapping", "entries"]) {
  const a = capture(normal, mode),
    b = capture(sanitized, mode);
  if (
    a.status !== 0 ||
    b.status !== 0 ||
    a.signal !== null ||
    b.signal !== null ||
    a.stderr.length ||
    b.stderr.length ||
    !a.stdout.equals(b.stdout)
  )
    throw Error("Original mapping lifetime " + mode + " failed: " + a.stderr + " " + b.stderr);
  captures[mode] = {
    byteLength: a.stdout.length,
    digest: hash(a.stdout),
    gzipBase64: gzipSync(a.stdout).toString("base64"),
  };
}
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes full original blobs. @param entry - Source pair. @returns Complete hash. */ ([
        p,
        v,
      ]) => [p, hash(v)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  scope:
    "Whole unchanged lbmap.cxx TU and verified reused genuine desktop native dependencies. Complete private Mapping and MappingEntry initialized callback/value/lifetime observations use pure caller-owned declared mapping records, not a registry/environment/mapping provider. Full registries/mediation/environment/exception consumers/upstream QA, physical ABI/allocator/pointer hash/leaks/native threads/shutdown remain unverified; leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed whole original mapping lifetime observations");
console.log(
  "Original mapping lifetime observations " +
    (write ? "written" : "verified") +
    ": " +
    Object.keys(result.sourceHashes).length +
    " complete sources; " +
    Object.entries(captures)
      .map(
        /** Reports every whole stream. @param entry - Capture pair. @returns Size. */ ([m, c]) =>
          m + "=" + c.byteLength,
      )
      .join(", "),
);
