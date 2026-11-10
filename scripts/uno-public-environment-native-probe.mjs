/** @fileoverview Captures original public Environment value ownership and accessors integrated with actual native DefaultEnvironment strong/weak callbacks. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/uno-public-environment-native",
  fixture = "apps/office/src/cppu/inc/uno/native-public-environment-cases.json",
  native = reuseExceptionNative(
    target,
    "output/playwright/uno-environment-registration-native",
    "apps/office/src/cppu/source/uno/native-environment-registration-cases.json",
  );
loadUnicodeOriginal(native.sources, "include/uno/environment.hxx");
loadUnicodeOriginal(native.sources, "cppu/source/uno/lbenv.cxx");
const caller = String.raw`#include "lbenv.cxx"
#include <uno/environment.hxx>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <initializer_list>
using Env=com::sun::star::uno::Environment;
void emit(std::initializer_list<sal_Int32> r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
uno_Environment*a=nullptr,*b=nullptr;Env*watched=nullptr;int tokens[2];
int identity(uno_Environment*p){return !p?-1:p==a?0:p==b?1:-2;}
void counts(int kind,uno_Environment*p){auto*e=reinterpret_cast<uno_DefaultEnvironment*>(p);emit({kind,identity(p),e->nRef,e->nWeakRef,watched?identity(watched->get()):-3});text(p->pTypeName);}
void acquired(uno_Environment*p){defenv_acquire(p);counts(30,p);}
void released(uno_Environment*p){defenv_release(p);counts(31,p);}
void disposing(uno_Environment*p){counts(32,p);}
uno_Environment*make(rtl::OUString const&name,void*context){auto*p=&(new uno_DefaultEnvironment(name,context))->aBase;defenv_acquire(p);defenv_acquireWeak(p);p->acquire=acquired;p->release=released;p->environmentDisposing=disposing;return p;}
void snapshot(Env const&env){emit({70,identity(env.get()),env.is()});}
void run(std::string const&mode){rtl::OUString name(u"env\0\u03a9:purpose",13),other=rtl::OUString::createFromAscii("other");a=make(name,&tokens[0]);b=make(other,&tokens[1]);
if(mode=="ownership"){{Env empty;watched=&empty;snapshot(empty);{Env copy(empty);snapshot(copy);}Env value(a);watched=&value;snapshot(value);{Env copy(value);snapshot(copy);Env moved(std::move(copy));snapshot(copy);snapshot(moved);value=a;snapshot(value);value=value;snapshot(value);value=b;snapshot(value);value=std::move(moved);snapshot(value);snapshot(moved);value=std::move(value);snapshot(value);value=nullptr;snapshot(value);value=b;value.clear();snapshot(value);value.clear();snapshot(value);value=empty;snapshot(value);value=std::move(moved);snapshot(value);}value=a;snapshot(value);watched=nullptr;}}
else if(mode=="accessors"){{Env value(a);watched=&value;{rtl::OUString copied=value.getTypeName();text(copied.pData);text(name.pData);emit({80,value.getContext()==&tokens[0]});copied=other;text(copied.pData);text(name.pData);text(other.pData);}text(name.pData);text(other.pData);snapshot(value);Env moved(std::move(value));snapshot(value);snapshot(moved);watched=&moved;emit({81,moved.getContext()==&tokens[0]});rtl::OUString returned=moved.getTypeName();text(returned.pData);watched=nullptr;}}
else std::exit(2);
counts(90,b);defenv_release(b);counts(91,b);defenv_releaseWeak(b);text(other.pData);counts(92,a);defenv_release(a);counts(93,a);defenv_releaseWeak(a);text(name.pData);}
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
for (const mode of ["ownership", "accessors"]) {
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
    throw Error("Original public environment " + mode + " failed: " + a.stderr + " " + b.stderr);
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
    "Original public environment.hxx resolved-pointer/default/copy/move ownership, equality-skipping assignment, release-before-null clear, destruction and owned type-name/borrowed context accessors over the actual original DefaultEnvironment strong/weak owners. Complete unchanged lbenv.cxx TU and verified full genuine desktop dependencies supply identical normal-ASan/UBSan streams. Enclosing acquisition/release observers invoke the real default callbacks. Production environment constructors/providers, descriptor/current lookup, invocation/purpose stack, public bootstrap, physical ABI/allocator/concurrency/noexcept termination and leak freedom remain uncertified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed whole original environment registration observations");
console.log(
  "Original public environment observations " +
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
