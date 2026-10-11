/** @fileoverview Captures complete original public Any ownership and true type/ownership fields using full unchanged native dependency owners. */
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
const target = "output/playwright/uno-any-ownership-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-any-ownership-cases.json";
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
void constructors(){Types t;CW w(41);for(int c=0;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int v=0;v<2;v++)for(int api=0;api<4;api++){rtl::OUString h=rtl::OUString::createFromAscii("Aa");void*p=sample(r,d,t,h.pData,reinterpret_cast<W*>(&w),v);emit({c,v,api});{A*a=api==0?new A(p,r):api==1?new A(p,d):api==2?new A(p,cppu::detail::getTypeFromTypeDescriptionReference(&r)):nullptr;if(api==3){A source(p,r);a=new A(source);observe(*a);observe(source);delete a;a=nullptr;}else{observe(*a);delete a;}value(p,r);ref(r);text(h.pData);emit({w.count});}uno_type_destructData(p,r,css::uno::cpp_release);std::free(p);}typelib_typedescription_release(d);}for(int api=0;api<2;api++){emit({23,api});if(api==0){A a(nullptr,static_cast<R*>(nullptr));observe(a);a.setValue(nullptr,static_cast<R*>(nullptr));observe(a);}else{A a(nullptr,static_cast<D*>(nullptr));observe(a);a.setValue(nullptr,static_cast<D*>(nullptr));observe(a);}}}
void histories(){Types t;CW a(41),b(42);for(int ac=0;ac<=22;ac++){if(ac==16||ac==18||ac==21)continue;R*ar=t.get(ac);D*ad=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);for(int bc=0;bc<=22;bc++){if(bc==16||bc==18||bc==21)continue;R*br=t.get(bc);D*bd=nullptr;typelib_typedescriptionreference_getDescription(&bd,br);rtl::OUString ah=rtl::OUString::createFromAscii("Aa"),bh=rtl::OUString::createFromAscii("Bb");void*av=sample(ar,ad,t,ah.pData,reinterpret_cast<W*>(&a),1),*bv=sample(br,bd,t,bh.pData,reinterpret_cast<W*>(&b),1);emit({ac,bc});{A x(av,ar),y(bv,br);css::uno::Type const&alias=x.getValueType();emit({&(x=x)==&x});observe(x);observe(y);emit({&(x=y)==&x});observe(x);observe(y);emit({alias.getTypeLibType()==x.pType});x.setValue(av,ad);observe(x);x.setValue(bv,cppu::detail::getTypeFromTypeDescriptionReference(&br));observe(x);x.setValue(nullptr,ar);observe(x);x.clear();observe(x);emit({alias.getTypeLibType()==x.pType});x.setValue(av,ar);emit({&(x=std::move(y))==&x});observe(x);observe(y);emit({alias.getTypeLibType()==x.pType,&(x=std::move(x))==&x});observe(x);{A moved(std::move(x));observe(moved);observe(x);emit({x.pData==&moved,x.pData!=nullptr});}x.clear();observe(x);emit({a.count,b.count});}uno_type_destructData(bv,br,css::uno::cpp_release);uno_type_destructData(av,ar,css::uno::cpp_release);std::free(bv);std::free(av);typelib_typedescription_release(bd);}typelib_typedescription_release(ad);}}
template<class T>void typed(int id,T const&v){emit({id});A a(v);observe(a);A b(a);observe(b);emit({&(b=a)==&b,&(b=b)==&b});observe(b);b.clear();observe(b);}
void templates(){Types t;CW w(41);typed(0,false);typed(1,true);typed(2,sal_Bool(255));typed(3,sal_Int8(-97));typed(4,sal_Int16(-12345));typed(5,sal_uInt16(54321));typed(6,sal_Int32(-123456789));typed(7,sal_uInt32(0xfedcba98));typed(8,sal_Int64(-0x123456789abcdefLL));typed(9,sal_uInt64(0xfedcba9876543210ULL));typed(10,float(-1.2345));typed(11,-0.0);typed(12,sal_Unicode(0xd800));{rtl::OUString s=rtl::OUString::createFromAscii("Aa");typed(13,s);}{css::uno::Type t(type(typelib_TypeClass_BYTE));typed(14,t);}{css::uno::Reference<css::uno::XInterface>r(&w);typed(15,r);}{css::uno::RuntimeException e(rtl::OUString::createFromAscii("exception"),css::uno::Reference<css::uno::XInterface>(&w));typed(16,e);}ref(getCppuType(static_cast<A*>(nullptr)).getTypeLibType());{A a;observe(a);}emit({w.count});}
void callbacks(){Types t;CW w(41),root(91);w.root=&root;css::uno::cpp_acquire(&w);css::uno::cpp_release(&w);R*r=type(typelib_TypeClass_INTERFACE);emit({css::uno::cpp_queryInterface(nullptr,r)==nullptr});for(int iteration=0;iteration<2;iteration++)for(int mode=0;mode<5;mode++)for(int nullRoot=0;nullRoot<2;nullRoot++){w.mode=mode;w.root=nullRoot?nullptr:&root;emit({iteration,mode,nullRoot});try{void*p=css::uno::cpp_queryInterface(&w,r);cppPointerValue(p);if(p)css::uno::cpp_release(p);emit({0});}catch(std::runtime_error const&){emit({1});}emit({w.count,root.count});ref(r);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="constructors")constructors();else if(mode=="histories")histories();else if(mode=="templates")templates();else if(mode=="callbacks")callbacks();else return 2;return 0;}
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
for (const mode of ["constructors", "histories", "templates", "callbacks"]) {
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
    "Original public Any ownership/metadata and genfunc C++ virtual callbacks; full unchanged any/data/sequence and69 genuine SAL/CPPu owners. All initialized whole streams normal-ASan/UBSan identical. Actual original C factories and shared complete value/type/name/common/ref/string/count observers; only interface observation uses the actual pure caller C++ class layout. Native empty/moved VOID reserved bytes never observed, physical ABI/allocator/uninitialized field bytes/debug/thread/shutdown/full QA unverified. Later public Any extraction/comparison/get/query/ostream/fromAny/toAny and Sequence/Reference/services/Calc UI remain subsequent; no provider or runtime substitution. System dependencies uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original public Any ownership observations");
console.log(
  `Original public Any ownership observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
