/** @fileoverview Captures original cppu::detail UnoType and Sequence.hxx overload/static-cell histories using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-unotype-native";
const fixture = "apps/office/src/cppu/inc/native-unotype-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver =
  unoNativeValueCaller.slice(0, unoNativeValueCaller.indexOf("struct W")) +
  String.raw`#include <com/sun/star/uno/Sequence.hxx>
#include <com/sun/star/uno/RuntimeException.hpp>
using css::uno::Type;
std::vector<Type const*> values;
void value(Type const&t){ref(t.getTypeLibType());emit({static_cast<sal_Int32>(t.getTypeClass())});{rtl::OUString n=t.getTypeName();text(n.pData);ref(t.getTypeLibType());}ref(t.getTypeLibType());}
void remember(std::initializer_list<Type const*> ts){for(auto*t:ts){value(*t);values.push_back(t);}}
void pairs(){for(auto*a:values)for(auto*b:values){emit({a==b,a->getTypeLibType()==b->getTypeLibType(),a->equals(*b),a->isAssignableFrom(*b)});ref(a->getTypeLibType());ref(b->getTypeLibType());}}
template<class T>void basic(int id){Type const&a=cppu::UnoType<T>::get(),&again=cppu::UnoType<T>::get(),&u=cppu::getTypeFavourUnsigned(static_cast<T*>(nullptr)),&c=cppu::getTypeFavourChar(static_cast<T*>(nullptr));emit({id,&a==&again,&a==&u,&a==&c});remember({&a,&u,&c});}
template<class T>void sequences(int id){using S=css::uno::Sequence<T>;using U=cppu::UnoSequenceType<T>;Type const&a=cppu::UnoType<U>::get(),&again=cppu::UnoType<U>::get(),&via=cppu::UnoType<S>::get(),&u=cppu::getTypeFavourUnsigned(static_cast<S*>(nullptr)),&c=cppu::getTypeFavourChar(static_cast<S*>(nullptr)),&legacy=getCppuType(static_cast<S*>(nullptr)),&supplied=getCppuSequenceType<T>(cppu::UnoType<T>::get()),&changed=getCppuSequenceType<T>(cppu::UnoType<void>::get());emit({id,&a==&again,&a==&via,&a!=&u,&u==&legacy,&u==&supplied,&u==&changed,&u!=&c,a.getTypeLibType()==u.getTypeLibType(),c.getTypeLibType()==u.getTypeLibType()});remember({&a,&u,&c});}
void nested(){using T=sal_uInt16;using S=css::uno::Sequence<T>;using U=cppu::UnoSequenceType<T>;using SS=css::uno::Sequence<S>;Type const&a=cppu::UnoType<SS>::get(),&same=cppu::UnoType<cppu::UnoSequenceType<S>>::get(),&other=cppu::UnoType<cppu::UnoSequenceType<U>>::get(),&u=cppu::getTypeFavourUnsigned(static_cast<SS*>(nullptr)),&c=cppu::getTypeFavourChar(static_cast<SS*>(nullptr)),&again=cppu::UnoType<SS>::get();emit({&a==&same,&a!=&other,&a==&again,&a!=&u,&u!=&c,a.getTypeLibType()==other.getTypeLibType()});remember({&a,&other,&u,&c});Type const&ch=getCharSequenceCppuType(),&ch2=getCharSequenceCppuType();emit({&ch==&ch2,&ch!=&cppu::getTypeFavourChar(static_cast<css::uno::Sequence<sal_Unicode>*>(nullptr)),ch.getTypeLibType()==cppu::UnoType<cppu::UnoSequenceType<cppu::UnoCharType>>::get().getTypeLibType()});remember({&ch,&cppu::UnoType<cppu::UnoSequenceType<cppu::UnoCharType>>::get()});}
void seeded(){using T=sal_Int32;using S=css::uno::Sequence<T>;using SS=css::uno::Sequence<S>;Type const&a=getCppuSequenceType<T>(cppu::UnoType<cppu::UnoCharType>::get()),&again=getCppuSequenceType<T>(cppu::UnoType<bool>::get()),&u=cppu::getTypeFavourUnsigned(static_cast<S*>(nullptr)),&via=cppu::UnoType<S>::get(),&c=cppu::getTypeFavourChar(static_cast<S*>(nullptr)),&outerU=cppu::getTypeFavourUnsigned(static_cast<SS*>(nullptr)),&outerA=cppu::UnoType<SS>::get(),&outerC=cppu::getTypeFavourChar(static_cast<SS*>(nullptr));emit({&a==&again,&a==&u,&a!=&via,&u!=&c,a.getTypeLibType()!=via.getTypeLibType(),outerU.getTypeLibType()!=outerA.getTypeLibType()});remember({&a,&u,&via,&c,&outerU,&outerA,&outerC});nested();}
void types(){
basic<void>(0);
basic<cppu::UnoVoidType>(1);
basic<bool>(2);
basic<sal_Bool>(3);
basic<sal_Int8>(4);
basic<sal_Int16>(5);
basic<cppu::UnoUnsignedShortType>(6);
basic<sal_uInt16>(7);
basic<sal_Int32>(8);
basic<sal_uInt32>(9);
basic<sal_Int64>(10);
basic<sal_uInt64>(11);
basic<float>(12);
basic<double>(13);
basic<cppu::UnoCharType>(14);
basic<sal_Unicode>(15);
basic<rtl::OUString>(16);
basic<css::uno::Type>(17);
basic<css::uno::Any>(18);
basic<css::uno::Exception>(19);
basic<css::uno::XInterface>(20);
basic<css::uno::RuntimeException>(21);
basic<css::uno::Reference<css::uno::XInterface>>(22);
pairs();}
void allSequences(){
sequences<sal_Bool>(0);
sequences<sal_Int8>(1);
sequences<sal_Int16>(2);
sequences<cppu::UnoUnsignedShortType>(3);
sequences<sal_uInt16>(4);
sequences<sal_Int32>(5);
sequences<sal_uInt32>(6);
sequences<sal_Int64>(7);
sequences<sal_uInt64>(8);
sequences<float>(9);
sequences<double>(10);
sequences<cppu::UnoCharType>(11);
sequences<sal_Unicode>(12);
sequences<rtl::OUString>(13);
sequences<css::uno::Type>(14);
sequences<css::uno::Any>(15);
sequences<css::uno::Exception>(16);
sequences<css::uno::XInterface>(17);
sequences<css::uno::RuntimeException>(18);
sequences<css::uno::Reference<css::uno::XInterface>>(19);
nested();pairs();}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="types")types();else if(mode=="sequences")allSequences();else if(mode=="seeded"){seeded();pairs();}else return 2;return 0;}
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
for (const mode of ["types", "sequences", "seeded"]) {
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
    "Full unchanged original unotype.hxx/Sequence.hxx/Type headers, actual generated RuntimeException ADL getter and all69 genuine SAL/CPPU dependency translation units rebuilt normal and ASan/UBSan. All23 basic/Reference/generated getters,20 sequence type families, nested exact template specializations, recursive unsigned/char overloads, independent member/function-static borrowed cell identities and complete initialized reference/name/common description/count observations. Legacy supplied-element first call shares only Sequence<E>::s_pType; later arguments remain ignored as original. No Sequence/Any value class, physical ABI/allocation/const/compiler-only illegal type/polymorphic ADL/rvalue enforcement, debug/native threads/shutdown/full consumer QA claim. System libraries uninstrumented and leak detection disabled; no original body/factory substituted.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original borrowed Type observations");
console.log(
  `Original UnoType observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
