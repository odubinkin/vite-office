/** @fileoverview Captures original DefaultEnvironment strong/weak release and hardening through complete unchanged native owners and verified original dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/uno-environment-lifetime-native",
  fixture = "apps/office/src/cppu/source/uno/native-environment-lifetime-cases.json",
  native = reuseExceptionNative(
    target,
    "output/playwright/uno-environment-registration-native",
    "apps/office/src/cppu/source/uno/native-environment-registration-cases.json",
  );
loadUnicodeOriginal(native.sources, "cppu/source/uno/lbenv.cxx");
const caller = String.raw`#include "lbenv.cxx"
#include <cstdio>
#include <cstdlib>
#include <string>
void emit(std::initializer_list<sal_Int32> r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
uno_Environment *a=nullptr,*b=nullptr,**watched=nullptr;bool revive=false;int calls=0;
int identity(uno_Environment*p){return !p?-1:p==a?0:p==b?1:-2;}
void snapshot(uno_Environment*p){auto*e=reinterpret_cast<uno_DefaultEnvironment*>(p);emit({70,identity(p),e->nRef,e->nWeakRef,static_cast<int>(e->aOId2ObjectMap.size()),static_cast<int>(e->aPtr2ObjectMap.size())});text(p->pTypeName);}
void disposing(uno_Environment*p){auto*e=reinterpret_cast<uno_DefaultEnvironment*>(p);emit({30,identity(p),e->nRef,e->nWeakRef,watched?identity(*watched):-3});text(p->pTypeName);calls++;if(revive&&calls==1){uno_Environment*out=nullptr;defenv_harden(&out,p);emit({31,identity(out)});defenv_acquire(p);snapshot(p);}}
uno_Environment*make(rtl::OUString const&name){auto*p=&(new uno_DefaultEnvironment(name,nullptr))->aBase;p->environmentDisposing=disposing;return p;}
void run(std::string const&mode){rtl::OUString name=rtl::OUString::createFromAscii("lifetime"),other=rtl::OUString::createFromAscii("previous");a=make(name);snapshot(a);defenv_acquire(a);defenv_acquireWeak(a);snapshot(a);
if(mode=="live"){defenv_acquire(a);snapshot(a);uno_Environment*out=nullptr;defenv_harden(&out,a);emit({80,identity(out)});snapshot(a);defenv_dispose(a);snapshot(a);defenv_release(a);snapshot(a);defenv_release(a);snapshot(a);defenv_release(a);snapshot(a);out=nullptr;defenv_harden(&out,a);emit({81,identity(out)});snapshot(a);defenv_releaseWeak(a);text(name.pData);}
else if(mode=="replace"){b=make(other);defenv_acquire(b);uno_Environment*out=b;watched=&out;defenv_harden(&out,a);emit({80,identity(out)});text(other.pData);snapshot(a);defenv_harden(&out,a);emit({81,identity(out)});snapshot(a);theEnvironmentsData().isDisposing=true;defenv_harden(&out,a);emit({82,identity(out)});snapshot(a);theEnvironmentsData().isDisposing=false;watched=nullptr;defenv_release(a);snapshot(a);defenv_releaseWeak(a);text(name.pData);}
else if(mode=="reentrant"){revive=true;defenv_release(a);snapshot(a);defenv_release(a);snapshot(a);defenv_releaseWeak(a);text(name.pData);}
else if(mode=="registry"){uno_Environment*out=a;theEnvironmentsData().registerEnvironment(&out);snapshot(a);out=nullptr;theEnvironmentsData().getEnvironment(&out,name,nullptr);emit({80,identity(out)});snapshot(a);defenv_release(out);defenv_release(a);defenv_releaseWeak(a);snapshot(a);out=nullptr;theEnvironmentsData().getEnvironment(&out,name,nullptr);emit({81,identity(out)});b=make(name);defenv_acquire(b);out=b;theEnvironmentsData().registerEnvironment(&out);emit({82,identity(out)});snapshot(b);text(name.pData);defenv_release(b);snapshot(b);text(name.pData);}
else std::exit(2);
emit({90,calls});text(other.pData);}
int main(int argc,char**argv){if(argc!=2)return 2;run(argv[1]);return 0;}
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
for (const mode of ["live", "replace", "reentrant", "registry"]) {
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
    throw Error("Original environment lifetime " + mode + " failed: " + a.stderr + " " + b.stderr);
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
    "Complete unchanged lbenv.cxx TU, reused verified full original dependency build and normal-ASan/UBSan identical lifetime observations. Strong/weak counts, last-strong disposing callback timing, live/dead/shutdown/output hardening, explicit reentrant acquisition and actual weak-registry live lookup/dead rejection/replacement are covered. Portable borrowed count/record projection does not certify environment constructor, invocation stack, runtime bootstrap, physical allocation/threading/noexcept termination or leak freedom.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed whole original environment registration observations");
console.log(
  "Original environment lifetime observations " +
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
