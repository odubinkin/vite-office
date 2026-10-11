/** @fileoverview Captures original Reference query/throw/identity and diagnostic message contracts with complete initialized type/ownership fields using full unchanged native dependency owners. */
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
const target = "output/playwright/uno-reference-query-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-reference-query-cases.json";
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


using F=css::uno::Reference<css::uno::XInterface>;
using B=css::uno::BaseReference;
using E=css::uno::RuntimeException;
struct Access:B{using B::iquery;using B::iquery_throw;};
void reference(F const&r,CW&w,CW&root){cppPointerValue(r.get());emit({r.is(),bool(r)});if(r.is())emit({r.operator->()==r.get(),&r.operator*()==r.get()});emit({w.count,root.count});ref(cppu::UnoType<css::uno::XInterface>::get().getTypeLibType());}
void exception(E const&e){text(e.Message.pData);cppPointerValue(e.Context.get());ref(cppu::UnoType<E>::get().getTypeLibType());ref(type(typelib_TypeClass_INTERFACE));}
template<class S>void operation(int api,S const&src,CW&w,CW&root){if(api<2){try{F r=api==0?F(src,css::uno::UNO_QUERY):F(src,css::uno::UNO_QUERY_THROW);emit({0});reference(r,w,root);}catch(E const&e){emit({1});exception(e);}catch(std::runtime_error const&){emit({2});}}else{F r(&root);try{if(api==2)emit({r.set(src,css::uno::UNO_QUERY)});else{r.set(src,css::uno::UNO_QUERY_THROW);emit({0});}}catch(E const&e){emit({1});reference(r,w,root);exception(e);}catch(std::runtime_error const&){emit({2});reference(r,w,root);}reference(r,w,root);}}
void queries(){Types t;CW w(41),root(91);root.root=&root;emit({int(css::uno::UNO_REF_NO_ACQUIRE),int(css::uno::UNO_QUERY),int(css::uno::UNO_QUERY_THROW),int(css::uno::UNO_SET_THROW)});emit({-1});{A src(rtl::OUString::createFromAscii("source"));F r(src,css::uno::UNO_QUERY);cppPointerValue(r.get());ref(type(typelib_TypeClass_INTERFACE));observe(src);}for(int mode=0;mode<5;mode++)for(int nr=0;nr<2;nr++)for(int source=0;source<8;source++)for(int api=0;api<4;api++){w.mode=mode;w.root=nr?nullptr:&root;emit({mode,nr,source,api});if(source==0)operation(api,static_cast<css::uno::XInterface*>(&w),w,root);else if(source==1){F src(&w);operation(api,static_cast<B const&>(src),w,root);}else if(source==2){auto*p=static_cast<css::uno::XInterface*>(&w);A src(&p,type(typelib_TypeClass_INTERFACE));operation(api,src,w,root);}else if(source==3){A src(rtl::OUString::createFromAscii("source"));operation(api,src,w,root);}else if(source==4)operation(api,static_cast<css::uno::XInterface*>(nullptr),w,root);else if(source==5){F src;operation(api,static_cast<B const&>(src),w,root);}else if(source==6){css::uno::XInterface*p=nullptr;A src(&p,type(typelib_TypeClass_INTERFACE));operation(api,src,w,root);}else{A src;operation(api,src,w,root);}emit({w.count,root.count});}
for(int source=0;source<4;source++)for(int api=0;api<2;api++){emit({5,source,api});auto use=[&](auto const&src){if(api==0){try{F r(src,css::uno::UNO_SET_THROW);emit({0});reference(r,w,root);}catch(E const&e){emit({1});exception(e);}}else{F r(&root);try{r.set(src,css::uno::UNO_SET_THROW);emit({0});}catch(E const&e){emit({1});reference(r,w,root);exception(e);}reference(r,w,root);}};if(source==0)use(static_cast<css::uno::XInterface*>(&w));else if(source==1){F src(&w);use(src);}else if(source==2)use(static_cast<css::uno::XInterface*>(nullptr));else{F src;use(src);}emit({w.count,root.count});}}
void members(){Types t;CW w(41),root(91);root.root=&root;for(int mode=0;mode<5;mode++)for(int nr=0;nr<2;nr++)for(int api=0;api<10;api++){w.mode=mode;w.root=nr?nullptr:&root;emit({mode,nr,api});try{if(api==0){F r=F::query(&w);reference(r,w,root);}else if(api==1){F src(&w);F r=F::query(static_cast<B const&>(src));reference(r,w,root);}else if(api==2){css::uno::Reference<CW>src(&w);F r=src.query<css::uno::XInterface>();reference(r,w,root);}else if(api==3){css::uno::Reference<CW>src(&w);F r=src.queryThrow<css::uno::XInterface>();reference(r,w,root);}else if(api==4||api==5){auto*p=static_cast<css::uno::XInterface*>(&w);A src(&p,type(typelib_TypeClass_INTERFACE));F r=api==4?src.query<css::uno::XInterface>():src.queryThrow<css::uno::XInterface>();reference(r,w,root);}else if(api==6){F r=F::query(static_cast<css::uno::XInterface*>(nullptr));reference(r,w,root);}else if(api==7){F src;F r=F::query(static_cast<B const&>(src));reference(r,w,root);}else if(api==8){A src;F r=src.query<css::uno::XInterface>();reference(r,w,root);}else{A src;F r=src.queryThrow<css::uno::XInterface>();reference(r,w,root);}emit({0});}catch(E const&e){emit({1});exception(e);}catch(std::runtime_error const&){emit({2});}emit({w.count,root.count});}
for(int throwing=0;throwing<2;throwing++)for(int nullSource=0;nullSource<2;nullSource++){emit({5,throwing,nullSource});try{auto*p=nullSource?nullptr:static_cast<css::uno::XInterface*>(&w);auto*r=throwing?Access::iquery_throw(p,cppu::UnoType<css::uno::XInterface>::get()):Access::iquery(p,cppu::UnoType<css::uno::XInterface>::get());F out(r,SAL_NO_ACQUIRE);reference(out,w,root);emit({0});}catch(E const&e){emit({1});exception(e);}catch(std::runtime_error const&){emit({2});}emit({w.count,root.count});}}
void identity(){Types t;CW a(41),b(42),r1(91),r2(92);for(int am=0;am<5;am++)for(int bm=0;bm<5;bm++)for(int ar=0;ar<3;ar++)for(int br=0;br<3;br++)for(int pc=0;pc<5;pc++){a.mode=am;b.mode=bm;a.root=ar==0?nullptr:ar==1?&r1:&r2;b.root=br==0?nullptr:br==1?&r1:&r2;css::uno::XInterface*ap=pc==2||pc==4?nullptr:&a,*bp=pc==0?&a:pc==1?&b:pc==2?&a:nullptr;emit({am,bm,ar,br,pc});{F x(ap),y(bp);for(int op=0;op<5;op++){emit({op});try{emit({op==0?x==static_cast<B const&>(y):op==1?x!=static_cast<B const&>(y):op==2?x==bp:op==3?x!=bp:x==static_cast<B const&>(x)});}catch(std::runtime_error const&){emit({2});}reference(x,a,r1);reference(y,b,r2);emit({a.count,b.count,r1.count,r2.count});}}emit({a.count,b.count,r1.count,r2.count});}}
void messages(){Types t;CW w(41);for(int ac=0;ac<=22;ac++){if(ac==16||ac==18||ac==21)continue;R*ar=t.get(ac);D*ad=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);for(int bc=0;bc<=22;bc++){if(bc==16||bc==18||bc==21)continue;R*br=t.get(bc);rtl::OUString h=rtl::OUString::createFromAscii("Aa");void*p=sample(ar,ad,t,h.pData,reinterpret_cast<W*>(&w),1);emit({ac,bc});{A a(p,ar);for(int api=0;api<3;api++){emit({api});auto*out=api==0?cppu_unsatisfied_iquery_msg(br):api==1?cppu_unsatisfied_iset_msg(br):cppu_Any_extraction_failure_msg(&a,br);text(out);rtl_uString_release(out);ref(ar);ref(br);observe(a);emit({w.count});}}uno_type_destructData(p,ar,css::uno::cpp_release);std::free(p);}typelib_typedescription_release(ad);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="queries")queries();else if(mode=="members")members();else if(mode=="identity")identity();else if(mode=="messages")messages();else return 2;return 0;}

`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  for (const unit of ["any", "data", "sequence", "cppu_opt"]) {
    const relative =
      unit === "cppu_opt" ? "cppu/source/cppu/cppu_opt.cxx" : `cppu/source/uno/${unit}.cxx`;
    const source = `${upstream}/${relative}`;
    loadUnicodeOriginal(native.sources, relative);
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
for (const mode of ["queries", "members", "identity", "messages"]) {
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
    "Original Reference query/throw/identity and cppu_opt diagnostic messages through actual public Any/genfunc owners; full unchanged any/data/sequence/cppu_opt and69 genuine SAL/CPPu owners. Diagnostic contract-violating root query replies are bounded caller observations, not valid UNO producer certification. All initialized whole streams normal-ASan/UBSan identical. Actual original C factories and shared complete value/type/name/common/ref/string/count observers; only interface observation uses the actual pure caller C++ class layout. Native empty/moved VOID reserved bytes never observed, physical ABI/allocator/uninitialized field bytes/debug/thread/shutdown/full QA unverified. Physical ordering/hash/ostream/deleted overloads, later Any typed comparison/get/string expressions, public Sequence/services/Calc UI remain subsequent; no provider or runtime substitution. System dependencies uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original public Any data operations observations");
console.log(
  `Original Reference query/throw/identity/message observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
