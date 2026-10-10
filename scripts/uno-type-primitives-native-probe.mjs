/** @fileoverview Observes genuine generated/C type classes, initialized real header records and original CPPU/RTL comparisons; type registration and reference lifecycle remain separate. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-type-primitives-native";
const fixture = "apps/office/src/cppu/source/typelib/native-type-primitives-cases.json";
const native = prepareCaseNative(target);
const header = loadUnicodeOriginal(native.sources, "include/typelib/typeclass.h");
loadUnicodeOriginal(native.sources, "udkapi/com/sun/star/uno/TypeClass.idl");
loadUnicodeOriginal(native.sources, "include/typelib/typedescription.h");
loadUnicodeOriginal(native.sources, "cppu/source/typelib/typelib.cxx");
loadUnicodeOriginal(native.sources, "sal/rtl/strtmpl.hxx");
loadUnicodeOriginal(native.sources, "sal/rtl/ustring.cxx");
const names = [...header.matchAll(/typelib_TypeClass_(\w+)\s*=\s*(?:\d+|SAL_MAX_ENUM)/g)].map(
  /** Retains every actual original enum declaration. @param match - Declaration. @returns Enumerator suffix. */
  (match) => match[1],
);
if (names.length !== 33) throw new Error("Incomplete original typelib type classes");
const strings = [
  [],
  [0],
  [0x41],
  [0x41, 0],
  [0x41, 0, 0x42],
  [0x41, 0, 0x43],
  [0x41, 0x42],
  [0x42],
  [1],
  [0xffff],
  [0xd800, 0xdc00],
];
const driver = String.raw`#include <typelib/typedescription.h>
#include <com/sun/star/uno/TypeClass.hdl>
#include <rtl/ustring.hxx>
#include <array>
#include <bit>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
static_assert(std::endian::native == std::endian::little);
template<size_t N>void emit(std::array<sal_Int32,N>const&row){if(std::fwrite(row.data(),sizeof(sal_Int32),N,stdout)!=N)std::exit(3);}
int main(int argc,char**argv){std::string mode=argc>1?argv[1]:"enums";
if(mode=="enums"){std::cout<<'[';bool comma=false;
${names
  .map(
    /** Calls the genuine independently declared native enums and header predicate. @param name - Actual enumerator. @returns Native observation statement. */
    (name) =>
      `if(comma)std::cout<<',';comma=true;std::cout<<"[\\"${name}\\","<<typelib_TypeClass_${name}<<','<<static_cast<sal_Int32>(css::uno::TypeClass::TypeClass_${name})<<','<<TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(typelib_TypeClass_${name})<<']';`,
  )
  .join("\n")}
std::cout<<']';return 0;}
if(mode=="units"){sal_Unicode witness[]={0,1,0x80,0xffff};for(sal_uInt32 c=0;c<65536;c++)for(auto other:witness){sal_Unicode first[2]={static_cast<sal_Unicode>(c),0},second[2]={other,0};emit(std::array<sal_Int32,2>{rtl_ustr_compare(first,second),rtl_ustr_compare(second,first)});}return 0;}
if(mode=="equals"){std::vector<std::vector<sal_Unicode>>units={${strings
  .map(
    /** Emits every initialized logical UTF16 input, including embedded zero. @param input - Units. @returns Native vector initializer. */
    (input) => `{${input.join(",")}}`,
  )
  .join(",")}};
for(int firstClass=0;firstClass<32;firstClass++)for(int secondClass=0;secondClass<32;secondClass++)for(size_t firstName=0;firstName<units.size();firstName++)for(size_t secondName=0;secondName<units.size();secondName++){
auto const&a=units[firstName];auto const&b=units[secondName];rtl::OUString first(a.empty()?u"":a.data(),a.size()),second(b.empty()?u"":b.data(),b.size());
// These are genuine fully initialized public C records, not replacement owners or factories. Only const equality is invoked.
typelib_TypeDescriptionReference p={37,5,static_cast<typelib_TypeClass>(firstClass),first.pData,nullptr,nullptr,nullptr};
typelib_TypeDescriptionReference q={41,7,static_cast<typelib_TypeClass>(secondClass),second.pData,nullptr,nullptr,nullptr};
auto pCount=p.nRefCount,qCount=q.nRefCount,aCount=first.pData->refCount,bCount=second.pData->refCount;
emit(std::array<sal_Int32,8>{typelib_typedescriptionreference_equals(&p,&q),typelib_typedescriptionreference_equals(&p,&p),p.nRefCount==pCount,q.nRefCount==qCount,first.pData->refCount==aCount,second.pData->refCount==bCount,rtl_ustr_compare(first.getStr(),second.getStr()),TYPELIB_TYPEDESCRIPTIONREFERENCE_ISREALLYWEAK(p.eTypeClass)});
}std::array<sal_Int32,1>last={typelib_typedescriptionreference_equals(nullptr,nullptr)};emit(last);return 0;}
if(mode=="null-assert"){rtl_ustr_compare(nullptr,u"a");return 0;}
return 2;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
/** Builds the genuine original full dependency units and caller with matching instrumentation. @param sanitized - ASan/UBSan selection. @returns Executable path. */
function build(sanitized) {
  const objects = native.libraries(sanitized),
    binary = `${target}/driver${sanitized ? "-asan" : ""}`,
    dependency = binary + ".d";
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
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
    `link${sanitized ? "-asan" : ""}`,
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  return binary;
}
/** Retains complete native outputs and process diagnostics. @param binary - Genuine executable. @param mode - Native caller selection. @returns Exact stdout bytes. */
function capture(binary, mode) {
  const result = spawnSync(binary, [mode], {
    maxBuffer: 8 * 1024 * 1024,
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
  if (result.status !== 0)
    throw new Error(result.stderr?.toString() ?? "Failed original type primitive observation");
  return result.stdout;
}
const binary = build(false),
  sanitized = build(true),
  captures = {};
for (const mode of ["enums", "units", "equals"]) {
  captures[mode] = capture(binary, mode);
  if (!capture(sanitized, mode).equals(captures[mode]))
    throw new Error(`Sanitized native output differs: ${mode}`);
}
if (
  captures.units.length !== 65536 * 4 * 2 * 4 ||
  captures.equals.length !== 32 * 32 * strings.length ** 2 * 8 * 4 + 4
)
  throw new Error("Incomplete original primitive observations");
const assertion = spawnSync(binary, ["null-assert"]);
writeFileSync(`${target}/null-assert.stderr`, assertion.stderr ?? "");
if (assertion.signal !== "SIGABRT" || !assertion.stderr.toString().includes("pStr"))
  throw new Error("Missing original terminated-wrapper null assertion");
native.manifest.state = "captured";
native.save();
const result = {
  baselineCommit: pin,
  sourceHashes: native.manifest.sourceHashes,
  generatedHashes: native.manifest.generatedHashes,
  archiveHashes: native.manifest.archiveHashes,
  configuredHeaderHashes: native.manifest.configurations,
  driverHash: hash(driver),
  enumValues: JSON.parse(captures.enums),
  strings,
  units: {
    count: 65536 * 4,
    width: 2,
    witnesses: [0, 1, 0x80, 0xffff],
    rawHash: hash(captures.units),
    gzipBase64: gzipSync(captures.units, { level: 9 }).toString("base64"),
  },
  equals: {
    count: 32 * 32 * strings.length ** 2,
    width: 8,
    iterationOrder: "firstClass,secondClass,firstName,secondName",
    fields: [
      "equals",
      "selfEquals",
      "firstTypeRefCountUnchanged",
      "secondTypeRefCountUnchanged",
      "firstNameRefCountUnchanged",
      "secondNameRefCountUnchanged",
      "terminatedNameCompare",
      "firstClassReallyWeak",
    ],
    rawHash: hash(captures.equals),
    gzipBase64: gzipSync(captures.equals, { level: 9 }).toString("base64"),
  },
  bothNullEquals: captures.equals.readInt32LE(captures.equals.length - 4),
  nullWrapperAssertion: "SIGABRT",
  sanitizedIdentical: true,
  scope:
    "Complete original enum values, real header weak classifier, original const CPPU record comparison and selected real SAL Unicode/NoShortening comparator. Initialized genuine C records expose const predicate inputs only; no native type factory/registry/reference lifecycle or portable UNO exception/service/reflection claim. Original ICU source verification comes from the shared build helper but no ICU code is linked by this caller. Native platform frameworks/libc are uninstrumented.",
};
if (write) writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Original UNO type primitive observations differ");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    enums: result.enumValues.length,
    units: result.units.count,
    equality: result.equals.count,
    sources: Object.keys(result.sourceHashes).length,
    sanitizedIdentical: true,
  }),
);
