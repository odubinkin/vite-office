/** @fileoverview Captures complete original DisposedException generated value/type/typed-catch ownership over full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-disposed-exception-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/lang/native-disposed-exception-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const selected = ["lang/DisposedException"];
for (const name of [
  "uno/Exception",
  "uno/RuntimeException",
  "uno/XInterface",
  "uno/TypeClass",
  ...selected,
]) {
  const relative = `com/sun/star/${name}.idl`;
  const destination = `${target}/idl/${relative}`;
  mkdirSync(destination.slice(0, destination.lastIndexOf("/")), { recursive: true });
  writeFileSync(destination, loadUnicodeOriginal(native.sources, `udkapi/${relative}`));
}
native.run(
  "output/playwright/task39-native-types/cppumaker",
  [
    "-nD",
    "-T",
    selected
      .map(
        /** Original declared interface target. @param name - IDL path. @returns Original complete name. */ (
          name,
        ) => "com.sun.star." + name.replaceAll("/", "."),
      )
      .join(";"),
    "-O",
    resolve(`${target}/generated`),
    pathToFileURL(resolve(`${target}/idl`)).href,
  ],
  "original-interface-type-generation",
);
for (const name of selected)
  for (const extension of ["hdl", "hpp"]) {
    const path = `${target}/generated/com/sun/star/${name}.${extension}`;
    native.manifest.generatedHashes[path] = hash(readFileSync(path));
  }
const driver = String.raw`#include <com/sun/star/uno/Reference.hxx>
#include <com/sun/star/lang/DisposedException.hpp>
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
template<typename E>void exceptionValue(E*e,rtl_uString*held,W&a){text(e->Message.pData);emit({e->Message.pData==held,id(e->Context.get()),e->Context.is(),a.count});}
template<typename E>void exceptions(){W a(11);auto*e=new E();exceptionValue(e,nullptr,a);auto held=rtl::OUString::createFromAscii("Message");auto*context=new Reference<XInterface>(&a);auto*p=new E(held,*context);exceptionValue(p,held.pData,a);text(held.pData);auto*c=new E(*p);exceptionValue(c,held.pData,a);exceptionValue(p,held.pData,a);auto*message=&c->Message;auto*owner=&c->Context;emit({&(*c=*c)==c,&c->Message==message,&c->Context==owner});exceptionValue(c,held.pData,a);emit({&(*e=*c)==e});exceptionValue(e,held.pData,a);text(held.pData);
auto*m=new E(std::move(*c));exceptionValue(c,held.pData,a);exceptionValue(m,held.pData,a);emit({&(*e=std::move(*m))==e});exceptionValue(e,held.pData,a);exceptionValue(m,held.pData,a);text(held.pData);delete m;delete c;delete p;exceptionValue(e,held.pData,a);delete e;text(held.pData);delete context;emit({a.count});}
using com::sun::star::lang::DisposedException;
void metadata(){auto const&t=cppu::UnoType<DisposedException>::get();ref(t.getTypeLibType());auto name=t.getTypeName();text(name.pData);emit({&t==&cppu::UnoType<DisposedException>::get()});auto*p=reinterpret_cast<P*>(t.getTypeLibType()->pType);while(p){desc(&p->aBase);emit({p->nMembers,p->pBaseTypeDescription!=nullptr});for(int i=0;i<p->nMembers;i++){emit({p->pMemberOffsets[i]});text(p->ppMemberNames[i]);ref(p->ppTypeRefs[i]);}p=p->pBaseTypeDescription;}}
void catches(){W a(11);auto held=rtl::OUString::createFromAscii("Disposed");Reference<XInterface>context(&a);for(int mode:{0,1,2}){try{if(mode==0)throw DisposedException(held,context);if(mode==1)throw RuntimeException(held,context);throw Exception(held,context);}catch(DisposedException&e){emit({0});exceptionValue(&e,held.pData,a);}catch(RuntimeException&e){emit({1});exceptionValue(&e,held.pData,a);}catch(Exception&e){emit({2});exceptionValue(&e,held.pData,a);}emit({a.count});text(held.pData);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values"){exceptions<DisposedException>();metadata();}else if(mode=="type"){metadata();DisposedException e;metadata();DisposedException copy(e);metadata();DisposedException moved(std::move(copy));metadata();}else if(mode=="catches")catches();else return 2;}
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
        `-I${target}/generated`,
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
      `-I${target}/generated`,
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
for (const mode of ["values", "type", "catches"]) {
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
  scope:
    "Complete original cppumaker normal comprehensive internal DisposedException value/type lifecycle and native typed catch classification over actual RuntimeException/Exception/Reference/OUString/Type/typelib owners. Full unchanged native SAL/CPPU dependencies normal-ASan/UBSan; initialized complete streams, source/generated/config/caller provenance. No generic exception bridge substitute or broad parity claim; debug/source-location/native physical ABI/thread/resource/shutdown and complete consumer QA unverified. System dependencies uninstrumented, leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw new Error("Changed complete original DisposedException observations");
console.log(
  `Original DisposedException observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
