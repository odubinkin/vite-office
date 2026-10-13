/** @fileoverview Captures complete original public Any data operations and true type/ownership fields using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { unoNativeCppValueCaller } from "./uno-native-cpp-caller.mjs";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-any-data-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-any-data-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`${unoNativeCppValueCaller}
#include <com/sun/star/uno/Any.hxx>
#include <com/sun/star/uno/XInterface.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <com/sun/star/uno/Reference.hxx>
#include <stdexcept>
using A=css::uno::Any;
struct CW:css::uno::XInterface{int id,count=10000,mode=0;CW*root=nullptr;explicit CW(int i):id(i){}void SAL_CALL acquire()override{emit({1,id,++count});}void SAL_CALL release()override{emit({2,id,--count});}A SAL_CALL queryInterface(css::uno::Type const&t)override{emit({4,id,mode});ref(t.getTypeLibType());if(mode==0){auto*p=root;return A(&p,type(typelib_TypeClass_INTERFACE));}if(mode==1)return A();if(mode==2)return A(rtl::OUString::createFromAscii("other"));if(mode==3)throw css::uno::RuntimeException(rtl::OUString::createFromAscii("query"),css::uno::Reference<css::uno::XInterface>(root));throw std::runtime_error("caller");}};
void cppPointerValue(void*p){emit({p==nullptr});if(p){auto*w=static_cast<CW*>(p);emit({w->id,w->count});}}
void observe(A const&a){anyValue(const_cast<A*>(&a));emit({a.getValueTypeRef()==a.pType,static_cast<sal_Int32>(a.getValueTypeClass()),a.hasValue(),a.getValue()==a.pData,&a.getValueType()==&a.getValueType(),a.getValueType().getTypeLibType()==a.pType});ref(a.getValueType().getTypeLibType());{rtl::OUString n=a.getValueTypeName();text(n.pData);ref(a.pType);}ref(a.pType);D*d=nullptr;a.getValueTypeDescription(&d);desc(d);typelib_typedescription_release(d);ref(a.pType);}

#include <com/sun/star/uno/Sequence.hxx>
using Q=css::uno::Sequence<css::uno::Reference<css::uno::XInterface>>;
using E=css::uno::RuntimeException;
template<class T>void picked(int id,A const&a){emit({id});T v=T(71);emit({a>>=v});R*r=cppu::getTypeFavourUnsigned(&v).getTypeLibType();value(&v,r);ref(r);}
void pick(int id,A const&a,CW&root){if(id==0)picked<bool>(id,a);else if(id==1)picked<sal_Bool>(id,a);else if(id==2)picked<sal_Int8>(id,a);else if(id==3)picked<sal_Int16>(id,a);else if(id==4)picked<sal_uInt16>(id,a);else if(id==5)picked<sal_Int32>(id,a);else if(id==6)picked<sal_uInt32>(id,a);else if(id==7)picked<sal_Int64>(id,a);else if(id==8)picked<sal_uInt64>(id,a);else if(id==9)picked<float>(id,a);else if(id==10)picked<double>(id,a);else if(id==11)picked<sal_Unicode>(id,a);else if(id==12){emit({id});rtl::OUString v=rtl::OUString::createFromAscii("prior");emit({a>>=v});R*r=cppu::getTypeFavourUnsigned(&v).getTypeLibType();value(&v,r);ref(r);}else if(id==13){emit({id});css::uno::Type v(type(typelib_TypeClass_BYTE));emit({a>>=v});R*r=cppu::getTypeFavourUnsigned(&v).getTypeLibType();value(&v,r);ref(r);}else if(id==14){emit({id});css::uno::Reference<css::uno::XInterface>v(&root);emit({a>>=v});R*r=cppu::getTypeFavourUnsigned(&v).getTypeLibType();value(&v,r);ref(r);}else if(id==15){emit({id});Q v;emit({a>>=v});R*r=cppu::getTypeFavourUnsigned(&v).getTypeLibType();value(&v,r);ref(r);}else if(id==16){emit({id});E v;emit({a>>=v});R*r=cppu::getTypeFavourUnsigned(&v).getTypeLibType();value(&v,r);ref(r);}}
void extraction(){Types t;CW w(41),root(91);w.root=&root;root.root=&root;for(int c=0;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int v=0;v<2;v++){rtl::OUString h=rtl::OUString::createFromAscii("Aa");void*p=sample(r,d,t,h.pData,reinterpret_cast<W*>(&w),v);emit({c,v});{A a(p,r);for(int id=0;id<17;id++){pick(id,a,root);observe(a);emit({w.count,root.count});}observe(a);}uno_type_destructData(p,r,css::uno::cpp_release);std::free(p);typelib_typedescription_release(d);d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);}typelib_typedescription_release(d);}emit({23});{E e(rtl::OUString::createFromAscii("source"),css::uno::Reference<css::uno::XInterface>(&root));A a(e);pick(16,a,root);observe(a);}emit({w.count,root.count});}
void predicates(){Types t;CW w(41),root(91);w.root=&root;for(int ac=0;ac<=22;ac++){if(ac==16||ac==18||ac==21)continue;R*ar=t.get(ac);D*ad=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);for(int bc=0;bc<=22;bc++){if(bc==16||bc==18||bc==21)continue;R*br=t.get(bc);D*bd=nullptr;typelib_typedescriptionreference_getDescription(&bd,br);for(int v=0;v<2;v++){rtl::OUString ah=rtl::OUString::createFromAscii("Aa"),bh=rtl::OUString::createFromAscii(v?"Aa":"Bb");void*ap=sample(ar,ad,t,ah.pData,reinterpret_cast<W*>(&w),v),*bp=sample(br,bd,t,bh.pData,reinterpret_cast<W*>(&w),v);emit({ac,bc,v});{A a(ap,ar),b(bp,br);css::uno::Type const&type=cppu::detail::getTypeFromTypeDescriptionReference(&br);emit({a.isExtractableTo(type)});emit({a==b});emit({a!=b});emit({a==a});observe(a);observe(b);ref(ar);ref(br);emit({w.count,root.count});}uno_type_destructData(bp,br,css::uno::cpp_release);uno_type_destructData(ap,ar,css::uno::cpp_release);std::free(bp);std::free(ap);}typelib_typedescription_release(bd);}typelib_typedescription_release(ad);}}
template<class T>void help(int id,T const&v){emit({id});A a; a<<=v;observe(a);{A b=css::uno::toAny(v);observe(b);{A c=css::uno::toAny(b);observe(c);A d=css::uno::toAny(std::move(c));observe(d);observe(c);A e;emit({css::uno::fromAny(d,&e)});observe(e);emit({css::uno::fromAny(e,&e)});observe(e);}observe(b);}T dest=T();emit({css::uno::fromAny(a,&dest)});R*r=cppu::getTypeFavourUnsigned(&dest).getTypeLibType();value(&dest,r);ref(r);emit({a.has<T>()});observe(a);}
void helpers(){Types t;CW w(41),root(91);w.root=&root;help(0,false);help(1,true);help(2,sal_Bool(255));help(3,sal_Int8(-97));help(4,sal_Int16(-12345));help(5,sal_uInt16(54321));help(6,sal_Int32(-123456789));help(7,sal_uInt32(0xfedcba98));help(8,sal_Int64(-0x123456789abcdefLL));help(9,sal_uInt64(0xfedcba9876543210ULL));help(10,float(-1.2345));help(11,-0.0);help(12,sal_Unicode(0xd800));{rtl::OUString s=rtl::OUString::createFromAscii("Aa");help(13,s);}{css::uno::Type t(type(typelib_TypeClass_BYTE));help(14,t);}{css::uno::Reference<css::uno::XInterface>r(&w);help(15,r);}emit({w.count,root.count});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="extraction")extraction();else if(mode=="predicates")predicates();else if(mode=="helpers")helpers();else return 2;return 0;}

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
for (const mode of ["extraction", "predicates", "helpers"]) {
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
    "Original public Any data operations/metadata and genfunc C++ virtual callbacks; full unchanged any/data/sequence and69 genuine SAL/CPPu owners. All initialized whole streams normal-ASan/UBSan identical. Actual original C factories and shared complete value/type/name/common/ref/string/count observers; only interface observation uses the actual pure caller C++ class layout. Native empty/moved VOID reserved bytes never observed, physical ABI/allocator/uninitialized field bytes/debug/thread/shutdown/full QA unverified. Later public Any extraction/comparison/get/query/ostream/fromAny/toAny and Sequence/Reference/services/Calc UI remain subsequent; no provider or runtime substitution. System dependencies uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original public Any data operations observations");
console.log(
  `Original public Any data operations observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
