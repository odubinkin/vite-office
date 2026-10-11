/** @fileoverview Records original locale-aware case values with genuine generated UNO types and fully instrumented native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import { gzipSync, gunzipSync } from "node:zlib";
import { prepareCaseNative, types, common } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, scope, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/casefolding-native";
const fixture = "apps/office/src/i18nutil/source/utility/native-casefolding-value-cases.json";
const native = prepareCaseNative(target);
const cpp = loadUnicodeOriginal(native.sources, "i18nutil/source/utility/casefolding.cxx");
loadUnicodeOriginal(native.sources, "include/i18nutil/casefolding.hxx");
loadUnicodeOriginal(native.sources, "i18nutil/source/utility/casefolding_data.h");
const implementation = scope(
  cpp,
  "const Mapping mapping_03a3[]",
  "static bool\nis_ja_voice_sound_mark",
);
native.manifest.scopeHashes.casefolding = hash(implementation);
const arrays = [...implementation.matchAll(/const Mapping (mapping_[\da-f]+)\[\]/g)].map(
  /** Names complete original conditional arrays. @param match - Declaration. @returns Array name. */
  (match) => match[1],
);
if (arrays.length !== 10) throw new Error("Incomplete original conditional mapping arrays");
// NotValue alone has native undefined behavior for U+1E9E; capture it separately.
const flags = [0, 1, 2, 4, 8, 16, 32, 64, 127, 255];
const characters = [
  0x03a3, 0x0307, 0x0130, 0x0069, 0x0049, 0x004a, 0x012e, 0x00cc, 0x00cd, 0x0128, 0x0041, 0x00df,
  0xfb03,
];
const languages = [
  "",
  "lt",
  "tr",
  "az",
  "en",
  "LT",
  "TR",
  "tr-TR",
  "lt\0",
  "ltx",
  "\u0131",
  "l\u0307t",
];
const contexts = [
  [0, 0, 0, 1],
  [0x41, 0, 1, 2],
  [0x41, 0x41, 1, 3],
  [0x41, 0x20, 1, 3],
  [0x0301, 0, 1, 2],
  [0x0069, 0, 1, 2],
  [0x006a, 0, 1, 2],
  [0xd800, 0, 1, 2],
  [0, 0, 2, 0],
  [0x41, 0x41, 1, 1],
  [0x0069, 0, 1, -1],
  [0, 0, 1, -2147483648],
];
for (const accent of [
  0x02ff, 0x0300, 0x0314, 0x0315, 0x033c, 0x033d, 0x0344, 0x0345, 0x0346, 0x0347, 0x0349, 0x034a,
  0x034c, 0x034d,
])
  contexts.push([0, accent, 2, 1]);
const fields = [
  "exception",
  "type",
  "nmap",
  "map0",
  "map1",
  "map2",
  "exceptionMessageLength",
  "exceptionContextPresent",
  "exceptionTypeNameMatches",
];
const languageLiterals = languages
  .map(
    /** Uses explicit native UTF16 units, retaining embedded zero units. @param language - Actual input. @returns Native initializer. */
    (language) =>
      `{${[...language]
        .map(
          /** Emits one BMP input unit. @param unit - Character. @returns Integer. */
          (unit) => unit.charCodeAt(0),
        )
        .join(",")}}`,
  )
  .join(",");
const driver = String.raw`${native.prefix}
#include <i18nutil/casefolding.hxx>
#include "casefolding_data.h"
#include <com/sun/star/lang/Locale.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <rtl/character.hxx>
#include <array>
#include <bit>
#include <cstdio>
#include <cstdlib>
#include <iterator>
#include <string>
#include <vector>
static_assert(std::endian::native == std::endian::little);
using namespace com::sun::star::lang;
using namespace com::sun::star::uno;
namespace i18nutil {
${implementation}
}
using Row=std::array<sal_Int32,9>;
Row observe(i18nutil::Mapping const&m){return {0,m.type,m.nmap,m.map[0],m.map[1],m.map[2],0,0,0};}
Row observe(RuntimeException const&e){return {1,0,0,0,0,0,e.Message.getLength(),e.Context.is(),cppu::UnoType<RuntimeException>::get().getTypeName()=="com.sun.star.uno.RuntimeException"};}
template<size_t N>void emit(std::array<sal_Int32,N>const&row){if(std::fwrite(row.data(),sizeof(sal_Int32),N,stdout)!=N)std::exit(3);}
Row value(sal_Unicode const*str,sal_Int32 pos,sal_Int32 len,Locale const&locale,MappingType flag){try{return observe(i18nutil::casefolding::getValue(str,pos,len,locale,flag));}catch(RuntimeException const&e){return observe(e);}}
int main(int argc,char**argv){using namespace i18nutil;std::string mode=argc>1?argv[1]:"points";Locale empty;
if(mode=="points"){sal_Int32 flags[]={${flags.join(",")}};for(auto flag:flags)for(sal_uInt32 code=0;code<0x110000;code++){sal_Unicode input[3]={};sal_Int32 len=rtl::splitSurrogates(code,input);emit(value(input,0,len,empty,static_cast<MappingType>(flag)));}return 0;}
if(mode=="tails"){for(sal_uInt32 code=0x10000;code<0x110000;code++){sal_Unicode input[3]={};rtl::splitSurrogates(code,input);emit(value(input,1,2,empty,static_cast<MappingType>(255)));}return 0;}
if(mode=="internal-bit-ub"){sal_Unicode input[2]={0x1e9e,0};std::fprintf(stderr,"Initialized original input: U+1E9E, pos=0, len=1, MappingType::NotValue=128\n");emit(value(input,0,1,empty,MappingType::NotValue));return 0;}
if(mode=="conditions"){
std::vector<std::u16string>languages={${languageLiterals}};
sal_Unicode characters[]={${characters.join(",")}};
std::array<sal_Int32,4>contexts[]={${contexts
  .map(
    /** Emits complete allocated-buffer call inputs. @param context - Before/after/position/length. @returns Native row. */
    (context) => `{${context.join(",")}}`,
  )
  .join(",")}};
for(auto const&context:contexts)for(auto character:characters)for(auto const&language:languages)for(sal_Int32 flag=0;flag<256;flag++){
sal_Unicode input[5]={};auto pos=context[2],len=context[3];if(pos>0)input[pos-1]=context[0];input[pos]=character;input[pos+1]=context[1];auto saved=std::to_array(input);
Locale locale(rtl::OUString(language.data(),language.size()),rtl::OUString(),rtl::OUString());Row conditional;sal_Int32 borrowed=-1;
try{auto const&m=casefolding::getConditionalValue(input,pos,len,locale,static_cast<MappingType>(flag));conditional=observe(m);int address=0;
${arrays
  .map(
    /** Observes identity only through pointer equality within genuine arrays. @param name - Original const array. @returns Native caller. */
    (name) => `for(auto const&entry:${name}){if(&entry==&m)borrowed=address;address++;}`,
  )
  .join("\n")}
}catch(RuntimeException const&e){conditional=observe(e);}
auto actual=value(input,pos,len,locale,static_cast<MappingType>(flag));sal_Int32 copied=0;
try{auto copy=casefolding::getValue(input,pos,len,locale,static_cast<MappingType>(flag));auto initial=observe(copy);copy.type^=255;copy.nmap=3;for(auto&unit:copy.map)unit^=65535;copied=value(input,pos,len,locale,static_cast<MappingType>(flag))==initial;}catch(RuntimeException const&e){copied=observe(e)==actual;}
if(saved!=std::to_array(input))return 4;std::array<sal_Int32,20>row={};std::copy(conditional.begin(),conditional.end(),row.begin());row[9]=borrowed;std::copy(actual.begin(),actual.end(),row.begin()+10);row[19]=copied;emit(row);
}return 0;}
return 2;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
native.manifest.driverHash = hash(driver);
/** Verifies complete compiler dependencies, including full generated types and ICU headers. @param path - MMD output. @returns Nothing. */
function dependencies(path) {
  for (const file of readFileSync(path, "utf8").replaceAll("\\\n", " ").split(/\s+/)) {
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
    else if (file.startsWith(`${common}/`))
      native.icuOriginal(file.slice("output/playwright/icu-case-native/icu/".length));
    else if (file.startsWith(`${types}/generated/`) && !native.manifest.generatedHashes[file])
      throw new Error(`Unverified generated UNO dependency: ${file}`);
  }
}
/** Compiles all actual dependency owners and mapping bodies with matching instrumentation. @param sanitized - ASan/UBSan mode. @returns Executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized),
    binary = `${target}/driver${sanitized ? "-asan" : ""}`;
  const dependency = binary + ".d";
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
  dependencies(dependency);
  return binary;
}
/** Retains complete native bytes and terminal process diagnostics. @param binary - Actual native executable. @param mode - Corpus. @returns Full native output bytes. */
function capture(binary, mode) {
  const path = `${binary}.${mode}`,
    fd = openSync(path, "w");
  let result;
  try {
    result = spawnSync(binary, [mode], {
      stdio: ["ignore", fd, "pipe"],
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
    });
  } finally {
    closeSync(fd);
  }
  writeFileSync(path + ".stderr", result.stderr ?? "");
  native.manifest.commands.push({
    tool: binary,
    argv: [mode],
    exitCode: result.status,
    signal: result.signal,
  });
  native.save();
  if (result.status !== 0)
    throw new Error(result.stderr?.toString() ?? `Native capture failed: ${mode}`);
  return readFileSync(path);
}
/** Encodes every observed signed field difference and proves complete byte reconstruction. @param bytes - Full native observations. @param width - Native row fields. @returns Lossless compressed payload. */
function compressObservations(bytes, width) {
  const deltas = Buffer.allocUnsafe(bytes.length),
    previous = new Int32Array(width);
  for (let offset = 0; offset < bytes.length; offset += 4) {
    const column = (offset / 4) % width,
      value = bytes.readInt32LE(offset);
    deltas.writeInt32LE(value - previous[column], offset);
    previous[column] = value;
  }
  const compressed = gzipSync(deltas, { level: 9 }),
    restored = gunzipSync(compressed);
  previous.fill(0);
  for (let offset = 0; offset < restored.length; offset += 4) {
    const column = (offset / 4) % width;
    previous[column] += restored.readInt32LE(offset);
    restored.writeInt32LE(previous[column], offset);
  }
  if (!restored.equals(bytes)) throw new Error("Lossy native observation compression");
  return compressed;
}
const counts = {
  points: flags.length * 0x110000,
  tails: 0x100000,
  conditions: contexts.length * characters.length * languages.length * 256,
};
const widths = { points: fields.length, tails: fields.length, conditions: 20 };
const binary = build(false),
  sanitized = build(true),
  corpora = {};
const undefinedBehavior = spawnSync(sanitized, ["internal-bit-ub"], {
  env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
});
const undefinedDiagnostic = undefinedBehavior.stderr?.toString() ?? "";
writeFileSync(`${target}/internal-bit-ub.stderr`, undefinedDiagnostic);
writeFileSync(`${target}/internal-bit-ub.stdout`, undefinedBehavior.stdout ?? "");
native.manifest.commands.push({
  tool: sanitized,
  argv: ["internal-bit-ub"],
  exitCode: undefinedBehavior.status,
  signal: undefinedBehavior.signal,
});
if (
  (undefinedBehavior.status === 0 && !undefinedBehavior.signal) ||
  !undefinedDiagnostic.includes("index 352 out of bounds for type 'const Mapping[352]'")
)
  throw new Error("Original isolated internal-bit undefined behavior was not reproduced");
native.manifest.undefinedBehavior = {
  code: 0x1e9e,
  pos: 0,
  len: 1,
  mappingType: 128,
  signal: undefinedBehavior.signal,
  exitCode: undefinedBehavior.status,
  diagnosticHash: hash(undefinedDiagnostic),
  portableExpectedValue: null,
};
for (const mode of Object.keys(counts)) {
  const bytes = capture(binary, mode);
  if (bytes.length !== counts[mode] * widths[mode] * 4)
    throw new Error(`Incomplete native corpus: ${mode}`);
  if (!capture(sanitized, mode).equals(bytes))
    throw new Error(`Sanitized native output differs: ${mode}`);
  const compressed = compressObservations(bytes, widths[mode]);
  corpora[mode] = {
    count: counts[mode],
    width: widths[mode],
    rawBytes: bytes.length,
    rawHash: hash(bytes),
    encoding: "signed-int32-row-field-deltas-gzip-base64; previous fields start at zero",
    gzipBase64: compressed.toString("base64"),
  };
  console.log(
    `Captured complete original ${mode}: ${counts[mode]} observations, ${bytes.length} bytes; sanitizer-identical`,
  );
}
native.manifest.state = "captured";
native.save();
const result = {
  baselineCommit: pin,
  sourceHashes: native.manifest.sourceHashes,
  icuHashes: native.manifest.icuHashes,
  generatedHashes: native.manifest.generatedHashes,
  archiveHashes: native.manifest.archiveHashes,
  configuredHeaderHashes: native.manifest.configurations,
  scopeHashes: native.manifest.scopeHashes,
  driverHash: hash(driver),
  fields,
  flags,
  characters,
  languages,
  contexts,
  conditionFields: [
    ...fields,
    "borrowedConditionalIndex",
    ...fields.map(
      /** Names the separate getValue observation. @param field - Original observation field. @returns Field. */
      (field) => `value.${field}`,
    ),
    "copyIndependentAndInputUnchanged",
  ],
  iterationOrder: {
    points: "flag, code=0..0x10ffff",
    tails: "code=0x10000..0x10ffff, pos=1, len=2, flag=255",
    conditions:
      "context, character, language, flag=0..255; initialized allocated buffer[5], pos and len are independent caller values",
  },
  corpora,
  undefinedBehavior: {
    code: 0x1e9e,
    pos: 0,
    len: 1,
    mappingType: 128,
    tableIndex: 352,
    tableSize: 352,
    portableExpectedValue: null,
  },
  sanitizedIdentical: true,
  instrumentedDependencies:
    "All 67 genuine SAL and two CPPU units, original mapping and ICU scopes, generated Locale/RuntimeException and full dependent headers; platform/libc/frameworks uninstrumented",
  evidenceScope:
    "Original getValue/getConditionalValue value, conditional reference identity, copy independence, initialized UTF16 and real default UNO exception observations only. No portable exception/service/pool/document or getNextChar/widthfolding parity claim.",
};
if (write) writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Original full casefolding observations differ");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    sources: Object.keys(result.sourceHashes).length,
    corpora: counts,
    sanitizedIdentical: true,
  }),
);
