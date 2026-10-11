/** @fileoverview Captures original cppu::detail borrowed Type pointer-cell views and live identity using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-type-view-native";
const fixture = "apps/office/src/cppu/inc/native-type-view-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <com/sun/star/uno/Type.hxx>
#include <cstdio>
#include <cstdlib>
#include <initializer_list>
#include <string>
#include <vector>
using com::sun::star::uno::Type;using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
void value(Type const&t){ref(t.getTypeLibType());emit({static_cast<sal_Int32>(t.getTypeClass())});{rtl::OUString n=t.getTypeName();text(n.pData);ref(t.getTypeLibType());}ref(t.getTypeLibType());}
void classes(){std::vector<typelib_TypeClass>classes;for(int i=0;i<15;i++)classes.push_back(static_cast<typelib_TypeClass>(i));classes.push_back(typelib_TypeClass_EXCEPTION);classes.push_back(typelib_TypeClass_INTERFACE);std::vector<Type const*>v;for(auto c:classes){R**cell=typelib_static_type_getByTypeClass(c);ref(*cell);Type const&a=cppu::detail::getTypeFromTypeClass(c),&b=cppu::detail::getTypeFromTypeDescriptionReference(cell),&again=cppu::detail::getTypeFromTypeClass(c);emit({&a==&b,&a==&again,reinterpret_cast<void const*>(&a)==reinterpret_cast<void const*>(cell),a.getTypeLibType()==*cell});value(a);ref(*cell);{Type copy(a);emit({&copy!=&a,copy.getTypeLibType()==a.getTypeLibType()});value(copy);value(a);}value(a);v.push_back(&a);}
 for(auto*a:v)for(auto*b:v){emit({a==b,a->equals(*b),*a==*b,*a!=*b,a->isAssignableFrom(*b)});ref(a->getTypeLibType());ref(b->getTypeLibType());}
}
void cells(){rtl::OUString an=rtl::OUString::createFromAscii("view.A"),bn=rtl::OUString::createFromAscii("view.B");R*a=nullptr,*b=nullptr;typelib_typedescriptionreference_new(&a,typelib_TypeClass_ENUM,an.pData);typelib_typedescriptionreference_new(&b,typelib_TypeClass_ENUM,bn.pData);R*cell=a,*same=a,*nil=nullptr;ref(a);ref(b);Type const&v=cppu::detail::getTypeFromTypeDescriptionReference(&cell),&other=cppu::detail::getTypeFromTypeDescriptionReference(&same),&empty=cppu::detail::getTypeFromTypeDescriptionReference(&nil);emit({&v==&cppu::detail::getTypeFromTypeDescriptionReference(&cell),&v!=&other,v.equals(other),v.getTypeLibType()==a,empty.getTypeLibType()==nullptr});value(v);value(other);ref(a);ref(b);text(an.pData);text(bn.pData);
 {Type copy(v);value(copy);value(v);cell=b;emit({&v==&cppu::detail::getTypeFromTypeDescriptionReference(&cell),v.getTypeLibType()==b,copy.getTypeLibType()==a,!v.equals(copy)});value(v);value(copy);ref(a);ref(b);emit({&(copy=v)==&copy});value(copy);value(v);ref(a);ref(b);cell=nullptr;emit({v.getTypeLibType()==nullptr,v.equals(empty),v.isAssignableFrom(copy),copy.isAssignableFrom(v)});cell=a;emit({v.getTypeLibType()==a,other.getTypeLibType()==a});value(v);value(copy);}ref(a);ref(b);nil=b;emit({empty.getTypeLibType()==b});value(empty);text(an.pData);text(bn.pData);typelib_typedescriptionreference_release(b);text(bn.pData);typelib_typedescriptionreference_release(a);text(an.pData);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="classes")classes();else if(mode=="cells")cells();else return 2;return 0;}
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
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
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
for (const mode of ["classes", "cells"]) {
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
    "Full unchanged original unotype.hxx detail pointer-cell casts, Type.h/Type.hxx member calls and all69 SAL/CPPU owners, normal and ASan/UBSan. All17 original supported static class cells preserve view/cell address identity, repeated helper identity, exact borrowed reference/no acquisition, acquired returned names and ordinary owning copies. All289 static view pairs and complete initialized name/count/common records are retained. Separate initialized enum pointer cells prove different view addresses with equal contents, live replacement/null/restoration, owning copy independence, acquire/release during assignment from the view, and null-cell nullable methods without destroying the borrowed Type alias. Ordinary static-cache bootstrap uses genuine upstream factories. Invalid static classes, destruction/assignment of const borrowed aliases, physical native object/pointer lifetime/ABI, compiler const enforcement, template/ADL overloads, threading/shutdown and full Any/Reference/default exceptions/case consumers remain unverified; system libraries are uninstrumented and leak detection is disabled. No original source method/body is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original borrowed Type observations");
console.log(
  `Original borrowed Type observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
