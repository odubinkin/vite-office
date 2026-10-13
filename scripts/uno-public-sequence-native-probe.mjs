/** @fileoverview Captures actual original public Sequence value ownership/COW/array/lifetime contracts, complete initialized fields and separate assertion/guard diagnostics using full unchanged native dependency owners. */
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
const target = "output/playwright/uno-public-sequence-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-public-sequence-cases.json";
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
#include <array>
#include <type_traits>
template<class E>using S=css::uno::Sequence<E>;
using F=css::uno::Reference<css::uno::XInterface>;
using NS=S<rtl::OUString>;
using RE=css::uno::RuntimeException;
template<class E>void fillCpp(E&e,int v,CW&w){if constexpr(std::is_same_v<E,sal_Bool>)e=v!=0;else if constexpr(std::is_same_v<E,rtl::OUString>)e=rtl::OUString::createFromAscii(v==0?"":"value");else if constexpr(std::is_same_v<E,css::uno::Type>)e=css::uno::Type(type(v==0?typelib_TypeClass_VOID:typelib_TypeClass_BYTE));else if constexpr(std::is_same_v<E,A>)e<<=sal_Int32(v==0?-14:27);else if constexpr(std::is_same_v<E,F>)e.set(v==0?&w:w.root);else if constexpr(std::is_same_v<E,NS>){e.realloc(1);e.getArray()[0]=rtl::OUString::createFromAscii(v==0?"":"nested");}else if constexpr(std::is_same_v<E,RE>){e.Message=rtl::OUString::createFromAscii(v==0?"":"member");e.Context.set(v==0?&w:w.root);}else e=static_cast<E>(v==0?3:v==1?17:250);}
template<class E>void peek(S<E>const&s){emit({s.getLength(),s.hasElements(),static_cast<sal_Int32>(s.size()),s.getConstArray()==reinterpret_cast<E const*>(s.get()->elements),s.begin()==s.getConstArray(),static_cast<sal_Int32>(s.end()-s.begin()),s.get()->nRefCount});}
template<class E>void state(S<E>const&s,CW&w,CW&root){peek(s);R*r=cppu::getTypeFavourUnsigned(static_cast<S<E>const*>(nullptr)).getTypeLibType();auto*p=s.get();value(&p,r);ref(r);R*er=cppu::getTypeFavourUnsigned(static_cast<E const*>(nullptr)).getTypeLibType();ref(er);for(int i=0;i<s.getLength();i++)value(const_cast<E*>(&s[i]),er);emit({w.count,root.count});}
template<class E>void history(int id,CW&w,CW&root){emit({id});std::array<E,3>src{};for(int i=0;i<3;i++)fillCpp(src[i],i,w);R*er=cppu::getTypeFavourUnsigned(static_cast<E const*>(nullptr)).getTypeLibType();emit({static_cast<sal_Int32>(sizeof(E))});
{S<E>a;S<E>b(2);S<E>c(src.data(),3);S<E>d(c);S<E>e(std::move(d));osl_atomic_increment(&c.get()->nRefCount);S<E>f(c.get(),SAL_NO_ACQUIRE);S<E>g{src[0],src[1],src[2]};S<E>z(id%2?nullptr:src.data(),0);emit({c.get()==d.get(),c.get()==e.get(),c.get()==f.get(),c.get()==g.get()});state(a,w,root);state(b,w,root);state(c,w,root);state(d,w,root);state(e,w,root);state(f,w,root);state(g,w,root);state(z,w,root);
emit({c==d,c==g,c!=g,c==b,c!=b});auto*old=c.get();auto*p=c.getArray();emit({old==c.get(),p==c.getConstArray()});emit({uno_type_assignData(p,er,&src[2],er,css::uno::cpp_queryInterface,css::uno::cpp_acquire,css::uno::cpp_release)});state(c,w,root);state(d,w,root);emit({c==d,c!=d});
a=d;emit({a.get()==d.get()});state(a,w,root);a=a;state(a,w,root);a=std::move(b);state(a,w,root);state(b,w,root);a=std::move(a);state(a,w,root);a.swap(c);state(a,w,root);state(c,w,root);a.swap(a);state(a,w,root);
for(int size:{3,1,0,2,2,0}){a.realloc(size);state(a,w,root);}auto*before=a.get();auto empty=css::uno::asNonConstRange(a);emit({empty.begin()==nullptr,empty.end()==nullptr,a.get()==before});auto range=css::uno::asNonConstRange(d);emit({range.begin()==d.getArray(),static_cast<sal_Int32>(range.end()-range.begin())});for(int i=0;i<d.getLength();i++)value(&range[i],er);state(d,w,root);}
ref(er);emit({w.count,root.count});for(int i=0;i<3;i++)value(&src[i],er);}
void lifecycle(){Types t;CW w(41),root(91);w.root=&root;root.root=&root;
history<sal_Bool>(0,w,root);history<sal_Int8>(1,w,root);history<sal_Int16>(2,w,root);history<sal_uInt16>(3,w,root);history<sal_Int32>(4,w,root);history<sal_uInt32>(5,w,root);history<sal_Int64>(6,w,root);history<sal_uInt64>(7,w,root);history<float>(8,w,root);history<double>(9,w,root);history<sal_Unicode>(10,w,root);history<rtl::OUString>(11,w,root);history<css::uno::Type>(12,w,root);history<A>(13,w,root);history<F>(14,w,root);history<NS>(15,w,root);history<RE>(16,w,root);emit({w.count,root.count});}
void cold(){Types t;R*er=type(typelib_TypeClass_LONG);D*sd=sequence(er);uno_Sequence*raw=nullptr;uno_type_sequence_construct(&raw,sd->pWeakRef,nullptr,2,css::uno::cpp_acquire);ref(sd->pWeakRef);alignas(S<sal_Int32>)char storage[sizeof(S<sal_Int32>)];auto*nil=new(storage)S<sal_Int32>(static_cast<uno_Sequence*>(nullptr),SAL_NO_ACQUIRE);emit({nil->get()==nullptr});ref(sd->pWeakRef);{S<sal_Int32>a(raw,SAL_NO_ACQUIRE);peek(a);ref(sd->pWeakRef);{S<sal_Int32>b(a);peek(a);peek(b);ref(sd->pWeakRef);}peek(a);ref(sd->pWeakRef);}ref(sd->pWeakRef);typelib_typedescription_release(sd);}
void guards(){Types t;CW w(41),root(91);for(int api=0;api<2;api++){emit({api});sal_Int64 marker=17;try{if(api){S<sal_Int64>s(&marker,2147483647);}else{S<sal_Int64>s(2147483647);}emit({0});}catch(std::bad_alloc const&){emit({1});}ref(cppu::getTypeFavourUnsigned(static_cast<S<sal_Int64>const*>(nullptr)).getTypeLibType());}
{S<sal_Int64>s(2);try{s.realloc(2147483647);emit({0});}catch(std::bad_alloc const&){emit({1});}state(s,w,root);}
uno_Sequence header={2,2147483647,{17}};{S<sal_Int64>s(&header,SAL_NO_ACQUIRE);try{s.getArray();emit({0});}catch(std::bad_alloc const&){emit({1});}emit({s.get()==&header,header.nRefCount,header.nElements,header.elements[0]});ref(cppu::getTypeFavourUnsigned(static_cast<S<sal_Int64>const*>(nullptr)).getTypeLibType());}emit({header.nRefCount,header.nElements,header.elements[0]});}
void rejection(std::string const&mode){if(mode=="size-negative"){uno_Sequence h={2,-1,{17}};S<sal_Int32>s(&h,SAL_NO_ACQUIRE);emit({static_cast<sal_Int32>(s.size())});}else{S<sal_Int32>s(2);if(mode=="index-under")emit({s[-1]});else if(mode=="index-over")emit({s[2]});else{auto r=css::uno::asNonConstRange(s);emit({r[mode=="range-under"?-1:2]});}}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="lifecycle")lifecycle();else if(mode=="cold")cold();else if(mode=="guards")guards();else if(mode=="index-under"||mode=="index-over"||mode=="range-under"||mode=="range-over"||mode=="size-negative")rejection(mode);else return 2;return 0;}
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
for (const mode of ["lifecycle", "cold", "guards"]) {
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
const rejections = {};
for (const mode of ["index-under", "index-over", "range-under", "range-over", "size-negative"]) {
  const a = capture(normal, mode),
    b = capture(sanitized, mode);
  if (
    a.status !== null ||
    b.status !== null ||
    a.signal !== "SIGABRT" ||
    b.signal !== "SIGABRT" ||
    !a.stderr.equals(b.stderr) ||
    !/Assertion failed:/.test(a.stderr.toString()) ||
    /AddressSanitizer|runtime error:/.test(b.stderr.toString())
  )
    throw new Error(`Changed original ${mode} rejection: ${a.stderr} ${b.stderr}`);
  rejections[mode] = {
    normalStatus: a.status,
    normalSignal: a.signal,
    sanitizedStatus: b.status,
    sanitizedSignal: b.signal,
    stderr: a.stderr.toString(),
    stderrDigest: hash(a.stderr),
    stdoutDigest: hash(a.stdout),
    stdoutBytes: a.stdout.length,
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
  rejections,
  scope:
    "Original normal internal Sequence.h/hxx value/ownership/array/COW/type contracts over real C/type/genfunc/OSL owners.73 unchanged native TUs (69 original dependencies plus any/data/sequence/cppu_opt), pure actual C++ scalar/OUString/Type/Any/Reference/nested Sequence/RuntimeException callers. Accepted complete initialized lifecycle/cold/guards streams normal-ASan/UBSan identical. Separate genuine native index/range/size assertion aborts; header-only allocation guards are bounded diagnostic callers, not valid ordinary producers. No indeterminate empty-tail bytes or missing huge-tail reads. Physical pointer/ABI/layout/allocator/resource/thread/debug/external-only/ostream/ByteSequence bridge/compile-only/full QA and later services/CharClass/pool/Calc document/UI unverified. System dependencies uninstrumented, leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original public Any data operations observations");
console.log(
  `Original public Sequence value and lifecycle observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
