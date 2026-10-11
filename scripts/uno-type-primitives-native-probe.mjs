/** @fileoverview Observes genuine generated/C type classes, initialized original CPPU/RTL records, registry ownership and fatal registration invariants against full unchanged native owners. */
import {
  registryDriver,
  registryAssertionDriver,
  derivedMemberDriver,
} from "./uno-registry-native-driver.mjs";
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
const descriptions = loadUnicodeOriginal(native.sources, "include/typelib/typedescription.h");
const uik = loadUnicodeOriginal(native.sources, "include/typelib/uik.h");
loadUnicodeOriginal(native.sources, "include/osl/interlck.h");
loadUnicodeOriginal(native.sources, "sal/osl/unx/interlck.cxx");
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
const countBoundaries = [
  -2147483648, -2147483647, -65537, -65536, -32769, -32768, -129, -128, -2, -1, 0, 1, 127, 128,
  32767, 32768, 65535, 65536, 2147483646, 2147483647,
];
const records = [
  ...(descriptions + uik)
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .matchAll(/typedef struct(?: SAL_DLLPUBLIC_RTTI)?\s+(_\w+)\s*\{([\s\S]*?)\}\s*(\w+)\s*;/g),
].map(
  /** Retains every actual full C record field in original order without initializing it. @param match - Full original declaration. @returns Record identity and field names. */
  (match) => ({
    tag: match[1],
    name: match[3],
    fields: [...match[2].matchAll(/\b(\w+)\s*;/g)].map(
      /** Selects an actual original field name. @param field - Declaration suffix. @returns Field name. */
      (field) => field[1],
    ),
  }),
);
if (records.length !== 15) throw new Error("Incomplete genuine C type records");
const driver = String.raw`#include <typelib/typedescription.h>
#include "typelib.hxx"
#include <osl/interlck.h>
#include <algorithm>
#include <thread>
#include <com/sun/star/uno/TypeClass.hdl>
#include <rtl/ustring.hxx>
#include <array>
#include <bit>
#include <cstdio>
#include <cstdlib>
#include <iostream>
#include <string>
#include <vector>
#include "typelib.cxx"
static_assert(std::endian::native == std::endian::little);
template<size_t N>void emit(std::array<sal_Int32,N>const&row){if(std::fwrite(row.data(),sizeof(sal_Int32),N,stdout)!=N)std::exit(3);}
${registryDriver}
${registryAssertionDriver}
${derivedMemberDriver}
int main(int argc,char**argv){std::string mode=argc>1?argv[1]:"enums";
if(registrationAssertion(mode))return 0;
if(registryCases(mode))return 0;
if(derivedMemberCases(mode))return 0;
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
if(mode=="records"){
${records
  .map(
    /** Observes genuine native record layout without constructing an owner or reading uninitialized storage. @param record - Full C declaration. @returns Original compiler layout observations. */
    (record) =>
      `emit(std::array<sal_Int32,${2 + record.fields.length * 2}>{static_cast<sal_Int32>(sizeof(${record.name})),static_cast<sal_Int32>(alignof(${record.name})),${record.fields
        .map(
          /** Retains the original compiler's field offset and size. @param field - Real field. @returns Layout observation. */
          (field) =>
            `static_cast<sal_Int32>(offsetof(${record.name},${field})),static_cast<sal_Int32>(sizeof(((${record.name}*)nullptr)->${field}))`,
        )
        .join(",")}});`,
  )
  .join("\n")}
return 0;}
if(mode=="counts"){std::vector<sal_Int32>inputs;for(sal_uInt32 word=0;word<65536;word++)inputs.push_back(std::bit_cast<sal_Int32>((word<<16)|word));for(auto value:std::array<sal_Int32,${countBoundaries.length}>{${countBoundaries.join(",")}})inputs.push_back(value);
for(auto initial:inputs){
std::array<oslInterlockedCount,3>storage={111,initial,222};auto result=osl_incrementInterlockedCount(&storage[1]);emit(std::array<sal_Int32,4>{result,storage[0],storage[1],storage[2]});
storage[1]=initial;result=osl_decrementInterlockedCount(&storage[1]);emit(std::array<sal_Int32,4>{result,storage[0],storage[1],storage[2]});
storage[1]=initial;result=osl_atomic_increment(&storage[1]);emit(std::array<sal_Int32,4>{result,storage[0],storage[1],storage[2]});
storage[1]=initial;result=osl_atomic_decrement(&storage[1]);emit(std::array<sal_Int32,4>{result,storage[0],storage[1],storage[2]});
}return 0;}
if(mode=="threads"){constexpr int workers=4,calls=4096;for(auto initial:std::array<sal_Int32,2>{0,2147475455})for(auto direction:std::array<int,2>{1,-1}){
std::array<oslInterlockedCount,3>storage={111,initial,222};std::array<std::vector<sal_Int32>,workers>outputs;std::vector<std::thread>threads;
for(int worker=0;worker<workers;worker++)threads.emplace_back([&,worker]{for(int i=0;i<calls;i++)outputs[worker].push_back(direction>0?osl_incrementInterlockedCount(&storage[1]):osl_decrementInterlockedCount(&storage[1]));});
for(auto&t:threads)t.join();std::vector<sal_Int32>all;for(auto const&output:outputs)all.insert(all.end(),output.begin(),output.end());std::sort(all.begin(),all.end());
emit(std::array<sal_Int32,4>{initial,storage[0],storage[1],storage[2]});for(auto value:all)emit(std::array<sal_Int32,1>{value});
}return 0;}
if(mode=="null-assert"){rtl_ustr_compare(nullptr,u"a");return 0;}
return 2;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
/** Builds the genuine original full dependency units and caller with matching instrumentation. @param sanitized - ASan/UBSan selection. @returns Executable path. */
function build(sanitized) {
  const allObjects = native.libraries(sanitized);
  const objects = allObjects.filter(
    /** The full unchanged typelib.cxx is included in the caller translation unit to access its genuine private constructor; omit only its duplicate linked object. @param object - Original compiled path. @returns Whether to link this separate owner. */
    (object) => !object.endsWith("/cppu_source_typelib_typelib.cxx.o"),
  );
  if (allObjects.length - objects.length !== 1)
    throw new Error("Expected exactly one original included typelib owner");
  const binary = `${target}/driver${sanitized ? "-asan" : ""}`,
    dependency = binary + ".d";
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
for (const mode of [
  "enums",
  "units",
  "equals",
  "records",
  "counts",
  "threads",
  "registry",
  "members",
]) {
  captures[mode] = capture(binary, mode);
  if (!capture(sanitized, mode).equals(captures[mode]))
    throw new Error(`Sanitized native output differs: ${mode}`);
}
if (
  captures.units.length !== 65536 * 4 * 2 * 4 ||
  captures.equals.length !== 32 * 32 * strings.length ** 2 * 8 * 4 + 4 ||
  captures.records.length !==
    records.reduce(
      /** Totals all genuine record fields. @param total - Accumulated fields. @param record - Original declaration. @returns Complete byte size. */ (
        total,
        record,
      ) => total + 2 + record.fields.length * 2,
      0,
    ) *
      4 ||
  captures.counts.length !== (65536 + countBoundaries.length) * 16 * 4 ||
  captures.threads.length !== 4 * (4 + 4 * 4096) * 4
)
  throw new Error("Incomplete original primitive observations");
const assertion = spawnSync(binary, ["null-assert"]);
writeFileSync(`${target}/null-assert.stderr`, assertion.stderr ?? "");
if (assertion.signal !== "SIGABRT" || !assertion.stderr.toString().includes("pStr"))
  throw new Error("Missing original terminated-wrapper null assertion");
const registrationAssertions = [];
for (let index = 0; index < 20; index++) {
  const mode = `invariant-${index}`,
    cases = [];
  for (const executable of [binary, sanitized]) {
    const failure = spawnSync(executable, [mode], {
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
      maxBuffer: 1024 * 1024,
    });
    const stderr = failure.stderr.toString();
    writeFileSync(`${executable}.${mode}.stderr`, stderr);
    native.manifest.commands.push({
      tool: executable,
      argv: [mode],
      exitCode: failure.status,
      signal: failure.signal,
    });
    if (
      failure.signal !== "SIGABRT" ||
      failure.stdout.length !== 0 ||
      !stderr.includes("typelib.cxx") ||
      !stderr.includes("Assertion failed") ||
      /AddressSanitizer|runtime error:/.test(stderr)
    )
      throw new Error(`Missing original registration assertion: ${mode}: ${stderr}`);
    const expression = stderr.match(/Assertion failed: \(([\s\S]*?)\), function /)?.[1];
    if (!expression) throw new Error(`Missing full original assertion expression: ${mode}`);
    cases.push({ signal: failure.signal, expression, diagnostic: stderr });
  }
  if (cases[0].expression !== cases[1].expression || cases[0].diagnostic !== cases[1].diagnostic)
    throw new Error(`Different original sanitized assertion: ${mode}`);
  registrationAssertions.push({ index, ...cases[0] });
}
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
  records: {
    declarations: records,
    rawHash: hash(captures.records),
    gzipBase64: gzipSync(captures.records, { level: 9 }).toString("base64"),
  },
  counts: {
    count: 65536 + countBoundaries.length,
    width: 16,
    boundaries: countBoundaries,
    rawHash: hash(captures.counts),
    gzipBase64: gzipSync(captures.counts, { level: 9 }).toString("base64"),
  },
  threads: {
    workers: 4,
    calls: 4096,
    initials: [0, 2147475455],
    directions: [1, -1],
    rawHash: hash(captures.threads),
    gzipBase64: gzipSync(captures.threads, { level: 9 }).toString("base64"),
  },
  registry: {
    rawHash: hash(captures.registry),
    gzipBase64: gzipSync(captures.registry, { level: 9 }).toString("base64"),
    fields:
      "Original full common/specific initialized fields, live name/type counts and pointer identity witnesses after every operation; unspecified native fields are never read",
  },
  members: {
    rawHash: hash(captures.members),
    gzipBase64: gzipSync(captures.members, { level: 9 }).toString("base64"),
    fields:
      "Full initialized derived common/member fields, complete parameter/exception values and pointer/counter witnesses before cloning, after copying/mutation, and after release; base member is borrowed while interface/base-reference caller ownership transfers on success",
  },
  registrationAssertions,
  bothNullEquals: captures.equals.readInt32LE(captures.equals.length - 4),
  nullWrapperAssertion: "SIGABRT",
  sanitizedIdentical: true,
  scope:
    "Complete original enum/C declaration/layout/const comparison/OSL observations plus genuine original newEmpty/reference allocation, acquire/release, extended destruction, getByName, callbacks, registration/completion and 256-entry typedef-provider cache ownership traces. All initialized fields/counts/identity witnesses are retained; unspecified native fields are never read. Twenty initialized invalid caller inputs record complete original C assertion diagnostics and SIGABRT with no stdout, identically in normal and sanitized builds and before any sanitizer finding. The twenty-first registration guard (retained count > 1) is satisfied by original getByName acquisition in valid traces; no impossible realm-local failing interleaving is fabricated. Browser Error adapts the C assertion boundary only, not native process termination, recovery, UNO exceptions or OSL debug assertions. Callback responses and specific members are initialized real caller inputs using the original factories and acquisitions, not replacement native owners. Derived member construction calls the genuine private function by including the full unchanged typelib.cxx owner in the caller translation unit and omitting its duplicate linked object; all other original dependencies stay linked. Full initialized method/attribute fields, parameter/exception values, independent copy identity and borrowed/transferred ownership are observed, including zero arrays, output replacement, mutations and releases. Direct caller records do not certify missing getByName routing or complete original consumer QA. Explicit zero-count/empty weak-pointer state witnesses certify the original safeguard branches only, not a native concurrent interleaving or valid ordinary user-level reachability. Common-prefix adaptation, full native ABI/platform synchronization, singleton shutdown, completion/getDescription/static type providers and portable Type/Any/Reference/default UNO exceptions, services and Calc document/edit/UI remain unverified or unfinished. Original ICU source verification comes from the shared build helper but no ICU code is linked by this caller. Native platform frameworks/libc are uninstrumented.",
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
    registrationAssertions: registrationAssertions.length,
    sanitizedIdentical: true,
  }),
);
