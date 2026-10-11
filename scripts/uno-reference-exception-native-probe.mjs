/** @fileoverview Captures complete original direct Reference ownership and actual generated exception values/type ownership using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-reference-exception-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-reference-exception-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <com/sun/star/uno/Reference.hxx>
#include <com/sun/star/uno/Exception.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <com/sun/star/uno/Any.hxx>
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <utility>
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using P=typelib_CompoundTypeDescription;
using namespace com::sun::star::uno;
void emit(std::initializer_list<sal_Int32>r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}

struct W;int id(XInterface*);
struct W: XInterface { int value,count=10;Reference<XInterface>*watch=nullptr;
 explicit W(int n):value(n){};
 Any SAL_CALL queryInterface(Type const&)override{return Any();}
 void SAL_CALL acquire()override{emit({1,value,++count,watch?id(watch->get()):-1});}
 void SAL_CALL release()override{emit({2,value,--count,watch?id(watch->get()):-1});}
};
int id(XInterface*p){return p?static_cast<W*>(p)->value:0;}
void state(Reference<XInterface>*r,W&a,W&b){emit({id(r->get()),r->is(),static_cast<bool>(*r),static_cast<BaseReference*>(r)->get()==r->get(),a.count,b.count});}
void references(){W a(11),b(22);emit({UNO_REF_NO_ACQUIRE,SAL_NO_ACQUIRE});auto*r=new Reference<XInterface>();a.watch=r;b.watch=r;state(r,a,b);auto*n=new Reference<XInterface>(nullptr);state(n,a,b);delete n;
auto*p=new Reference<XInterface>(&a);state(p,a,b);auto*c=new Reference<XInterface>(*p);state(c,a,b);a.acquire();auto*t=new Reference<XInterface>(&a,SAL_NO_ACQUIRE);state(t,a,b);b.acquire();auto*u=new Reference<XInterface>(&b,UNO_REF_NO_ACQUIRE);state(u,a,b);
emit({r->set(&a)});state(r,a,b);emit({r->set(&a)});state(r,a,b);emit({r->set(&b)});state(r,a,b);emit({r->set(*c)});state(r,a,b);emit({r->set(nullptr)});state(r,a,b);r->clear();state(r,a,b);
emit({&(*r=&b)==r});state(r,a,b);emit({&(*r=*r)==r});state(r,a,b);emit({&(*r=*p)==r});state(r,a,b);auto*m=new Reference<XInterface>(std::move(*c));state(c,a,b);state(m,a,b);emit({&(*r=std::move(*m))==r});state(r,a,b);state(m,a,b);emit({&(*r=std::move(*r))==r});state(r,a,b);
a.acquire();emit({r->set(&a,SAL_NO_ACQUIRE)});state(r,a,b);b.acquire();emit({r->set(&b,UNO_REF_NO_ACQUIRE)});state(r,a,b);emit({r->set(nullptr,SAL_NO_ACQUIRE)});state(r,a,b);r->clear();state(r,a,b);r->set(&a);r->clear();state(r,a,b);
emit({&(*r=std::move(*m))==r});state(r,a,b);state(m,a,b);r->set(&a);state(r,a,b);delete c;delete m;delete t;delete u;delete p;state(r,a,b);delete r;a.watch=nullptr;b.watch=nullptr;emit({a.count,b.count});}
void runtimeType(){auto const&t=cppu::UnoType<RuntimeException>::get();ref(t.getTypeLibType());auto name=t.getTypeName();text(name.pData);emit({&t==&cppu::UnoType<RuntimeException>::get()});auto*p=reinterpret_cast<P*>(t.getTypeLibType()->pType);emit({p->nMembers,p->pBaseTypeDescription!=nullptr});if(p->pBaseTypeDescription){auto*b=p->pBaseTypeDescription;desc(&b->aBase);emit({b->nMembers});for(int i=0;i<b->nMembers;i++){emit({b->pMemberOffsets[i]});text(b->ppMemberNames[i]);ref(b->ppTypeRefs[i]);}}}
template<typename E>void exceptionValue(E*e,rtl_uString*held,W&a){text(e->Message.pData);emit({e->Message.pData==held,id(e->Context.get()),e->Context.is(),a.count});}
template<typename E>void exceptions(){W a(11);auto*e=new E();exceptionValue(e,nullptr,a);auto held=rtl::OUString::createFromAscii("Message");auto*context=new Reference<XInterface>(&a);auto*p=new E(held,*context);exceptionValue(p,held.pData,a);text(held.pData);auto*c=new E(*p);exceptionValue(c,held.pData,a);exceptionValue(p,held.pData,a);auto*message=&c->Message;auto*owner=&c->Context;emit({&(*c=*c)==c,&c->Message==message,&c->Context==owner});exceptionValue(c,held.pData,a);emit({&(*e=*c)==e});exceptionValue(e,held.pData,a);text(held.pData);
auto*m=new E(std::move(*c));exceptionValue(c,held.pData,a);exceptionValue(m,held.pData,a);emit({&(*e=std::move(*m))==e});exceptionValue(e,held.pData,a);exceptionValue(m,held.pData,a);text(held.pData);delete m;delete c;delete p;exceptionValue(e,held.pData,a);delete e;text(held.pData);delete context;emit({a.count});}
void literals(){for(int old:{0,1})for(int n:{0,1,3})for(int extra:{0,2})for(int nullSource:{0,1}){if(nullSource&&n)continue;auto held=rtl::OUString::createFromAscii("held");rtl_uString*out=nullptr;if(old){out=held.pData;rtl_uString_acquire(out);}const char input[]={'A',0,'B'};emit({old,n,extra,nullSource});text(held.pData);rtl_uString_newFromLiteral(&out,nullSource?nullptr:input,n,extra);text(out);text(held.pData);rtl_uString_release(out);text(held.pData);}
{rtl::OUString s("");text(s.pData);}{rtl::OUString s("A");text(s.pData);}{rtl::OUString s("Message");text(s.pData);}{const char input[]={'x',127,0};rtl::OUString s(input);text(s.pData);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="reference")references();else if(mode=="exception")exceptions<Exception>();else if(mode=="runtime"){exceptions<RuntimeException>();runtimeType();{W a(11);RuntimeException another;exceptionValue(&another,nullptr,a);}}else if(mode=="type"){runtimeType();RuntimeException e;runtimeType();RuntimeException copy(e);runtimeType();}else if(mode=="literal")literals();else if(mode=="bad-embedded"){const char input[]={'A',0,0};rtl::OUString out(input);}else if(mode=="bad-trailer"){const char input[]={'A','B'};rtl::OUString out(input);}else if(mode=="bad-ascii"){rtl_uString*out=nullptr;const char input[]={char(0x80)};rtl_uString_newFromLiteral(&out,input,1,0);}else return 2;return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  for (const unit of ["any", "data", "sequence"]) {
    const source = `${upstream}/cppu/source/uno/${unit}.cxx`;
    loadUnicodeOriginal(native.sources, `cppu/source/uno/${unit}.cxx`);
    const object = `${target}/${sanitized ? "asan" : "normal"}-uno-${unit}.o`;
    const dependency = object + ".d";
    native.run(
      "clang++",
      [
        ...native.flags,
        ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
        "-DCPPU_DLLIMPLEMENTATION",
        "-MMD",
        "-MF",
        dependency,
        "-c",
        source,
        "-o",
        object,
      ],
      `${sanitized ? "asan" : "normal"}-uno-${unit}`,
    );
    for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
      if (file.startsWith(`${upstream}/`))
        loadUnicodeOriginal(native.sources, originalDependency(file));
    objects.push(object);
  }
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  const dependency = `${binary}.d`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/uno",
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
for (const mode of ["reference", "exception", "runtime", "type", "literal"]) {
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
const assertionSignals = {};
for (const mode of ["bad-embedded", "bad-trailer", "bad-ascii"]) {
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  if (
    first.signal !== "SIGABRT" ||
    second.signal !== "SIGABRT" ||
    /AddressSanitizer|runtime error:/.test(second.stderr.toString())
  )
    throw new Error(`Original literal assertion ${mode} did not abort before unsafe access`);
  assertionSignals[mode] = { normal: first.signal, sanitized: second.signal };
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
  assertionSignals,
  scope:
    "Original direct Reference ownership and cppumaker generated normal internal debug0 Exception/RuntimeException default/parameter/copy/move/assign/reverse lifetime, with actual generated leaked RuntimeException type factory/register/release/Type owners. Full72 unchanged SAL/CPPU native translation units normal/ASan/UBSan, generated true native headers, initialized fields/count/name/common-description/member/callback visibility observations. Structural C++ pointer casts denote actual logical caller identity; physical multiple-inheritance adjustment/ABI,debug source-location append/native threads/shutdown/full QA and remaining Reference query/Any/throwing/comparison/Any C++/case/service/UI consumers remain unverified or unfinished. Actual original const char literal constructor, literal C wrapper and char-to-Unicode Copy template share the same original allocation/release-last owner; ASCII and array-literal assertion children abort before unsafe reads. No substitute type/exception/provider bodies; system dependencies uninstrumented/leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO copy/default construction observations");
console.log(
  `Original Reference and generated exception observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
