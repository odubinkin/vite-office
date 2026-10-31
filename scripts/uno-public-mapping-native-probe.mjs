/** @fileoverview Captures original public uno::Mapping inline lifetime and interface/Type overload streams with full genuine native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/uno-public-mapping-native",
  fixture = "apps/office/src/cppu/inc/uno/native-public-mapping-cases.json",
  native = reuseExceptionNative(
    target,
    "output/playwright/uno-environment-registration-native",
    "apps/office/src/cppu/source/uno/native-environment-registration-cases.json",
  );
loadUnicodeOriginal(native.sources, "include/uno/mapping.hxx");
const caller = String.raw`#include <uno/mapping.hxx>
#include <rtl/ustring.hxx>
#include <typelib/typedescription.h>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <initializer_list>
#include <stdexcept>
using D=typelib_TypeDescription;using I=typelib_InterfaceTypeDescription;using R=typelib_TypeDescriptionReference;
namespace uno=com::sun::star::uno;
void emit(std::initializer_list<sal_Int32> r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
struct Input:uno_Mapping{int label,count=100;};
uno::Mapping*watched=nullptr;I*expected=nullptr;int raw[3],calls=0;bool drop=false,fail=false;
int identity(uno_Mapping*p){return p?static_cast<Input*>(p)->label:-1;}
int pointer(void*p){return !p?-1:p==&raw[0]?0:p==&raw[1]?1:p==&raw[2]?2:-2;}
void acquire(uno_Mapping*p){auto*r=static_cast<Input*>(p);emit({30,r->label,++r->count,watched?identity(watched->get()):-2});}
void release(uno_Mapping*p){auto*r=static_cast<Input*>(p);emit({31,r->label,--r->count,watched?identity(watched->get()):-2});}
void map(uno_Mapping*p,void**out,void*in,I*t){emit({40,identity(p),pointer(*out),pointer(in),t==expected});desc(&t->aBase);calls++;if(fail)throw std::runtime_error("prepared callback failure");*out=drop?nullptr:in;}
Input input(int label){Input r;r.label=label;r.acquire=acquire;r.release=release;r.mapInterface=map;return r;}
void snapshot(uno::Mapping const&m){emit({70,identity(m.get()),m.is()});}
void run(std::string const&mode){Input a=input(0),b=input(1);
if(mode=="ownership"){uno::Mapping empty;watched=&empty;snapshot(empty);{uno::Mapping copy(empty);snapshot(copy);}uno::Mapping value(&a);watched=&value;snapshot(value);{uno::Mapping copy(value);snapshot(copy);uno::Mapping moved(std::move(copy));snapshot(copy);snapshot(moved);value=&a;snapshot(value);value=value;snapshot(value);value=&b;snapshot(value);value=std::move(moved);snapshot(value);snapshot(moved);value=std::move(value);snapshot(value);value=&b;value.clear();snapshot(value);value.clear();snapshot(value);}value=&a;snapshot(value);watched=nullptr;}
else if(mode=="direct"||mode=="types"||mode=="throwing"){D*root=nullptr;typelib_typedescriptionreference_getDescription(&root,*typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE));expected=reinterpret_cast<I*>(root);{uno::Mapping value(&a);watched=&value;if(mode=="direct"){void*out=&raw[2];value.mapInterface(&out,&raw[0],expected);emit({80,pointer(out)});out=value.mapInterface(&raw[1],expected);emit({81,pointer(out)});out=value.mapInterface(nullptr,expected);emit({82,pointer(out)});drop=true;value.mapInterface(&out,&raw[0],root);emit({83,pointer(out)});}else if(mode=="types"){uno::Type type(root->pWeakRef);void*out=&raw[2];value.mapInterface(&out,&raw[0],type);emit({80,pointer(out)});out=value.mapInterface(&raw[1],type);emit({81,pointer(out)});rtl::OUString name=rtl::OUString::createFromAscii("public.Mapping.missing");uno::Type missing(uno::TypeClass_INTERFACE,name);value.mapInterface(&out,&raw[0],missing);emit({82,pointer(out),calls});out=value.mapInterface(&raw[0],missing);emit({83,pointer(out),calls});uno::Mapping none;none.mapInterface(&out,&raw[0],missing);emit({84,pointer(out),calls});}else{uno::Type type(root->pWeakRef);void*out=&raw[2];fail=true;try{value.mapInterface(&out,&raw[0],type);}catch(std::runtime_error const&){emit({85,pointer(out),calls});}desc(root);}watched=nullptr;}desc(root);typelib_typedescription_release(root);}
else std::exit(2);
emit({90,a.count,b.count,calls});}
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
for (const mode of ["ownership", "direct", "types", "throwing"]) {
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
    throw Error("Original public mapping " + mode + " failed: " + a.stderr + " " + b.stderr);
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
    "Original public mapping.hxx pointer/value constructors, assignment/move/clear/destruction and interface/Type map overloads over real C typelib owners and genuine verified desktop native dependencies. Whole normal-ASan/UBSan streams are required. Borrowed caller mapping records are enclosing input, not production mapping/bridge providers. Environment/name lookup constructors, deprecated helpers, full bootstrap, physical ABI/allocator/threads/noexcept termination and leak freedom remain uncertified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed whole original environment registration observations");
console.log(
  "Original public mapping observations " +
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
