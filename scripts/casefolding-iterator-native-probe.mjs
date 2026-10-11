/** @fileoverview Captures genuine original iterator, width tables and lookup classes with unchanged native owners and generated IDL flags. */
import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { prepareCaseNative, types, common } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, scope, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/task40-iterator-native";
const previousManifest = existsSync(`${target}/manifest.json`)
  ? JSON.parse(readFileSync(`${target}/manifest.json`, "utf8"))
  : null;
const native = prepareCaseNative(target);
const contract = JSON.parse(
  readFileSync("apps/office/src/i18nutil/source/utility/widthfolding-source-contract.json", "utf8"),
);
for (const [name, expected] of Object.entries(contract.sourceHashes))
  if (hash(loadUnicodeOriginal(native.sources, name)) !== expected)
    throw new Error(`Changed original source ${name}`);
loadUnicodeOriginal(
  native.sources,
  "i18npool/source/transliteration/transliteration_caseignore.cxx",
);
/** Checks complete original/generated compiler dependencies. @param path - Compiler dependency file. @returns Nothing. */
function dependencies(path) {
  for (const file of readFileSync(path, "utf8").replaceAll("\\\n", " ").split(/\s+/)) {
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
    else if (file.startsWith(`${common}/`))
      native.icuOriginal(file.slice("output/playwright/icu-case-native/icu/".length));
    else if (
      (file.startsWith(`${types}/generated/`) || file.startsWith(`${target}/generated/`)) &&
      !native.manifest.generatedHashes[file]
    )
      throw new Error(`Unverified generated header ${file}`);
  }
}
// Recompile the recorded genuine cppumaker graph; never treat an unverified cached executable as the original generator.
mkdirSync(`${target}/generator-objects`, { recursive: true });
const generator = JSON.parse(readFileSync(`${types}/objects-manifest.json`, "utf8")),
  generatorObjects = [];
const commands = generator.commands.filter(
  /** Selects original generator compilation units. @param command - Recorded command. @returns Compile flag. */ (
    command,
  ) => command.tool === "clang++" && command.argv.includes("-c"),
);
if (!commands.length) throw new Error("Missing genuine generator compile graph");
const maker = `${target}/cppumaker`;
const reusableGenerator =
  previousManifest?.pin === pin &&
  previousManifest.commands.some(
    /** Requires a real successful generator link. @param command - Original command. @returns Matching link. */ (
      command,
    ) => command.tool === "clang++" && command.exitCode === 0 && command.argv.includes(maker),
  ) &&
  previousManifest.generatedHashes[maker] ===
    (existsSync(maker) ? hash(readFileSync(maker)) : null) &&
  commands.every(
    /** Verifies every original compiled generator object, not just the executable filename. @param command - Original compile. @param i - Graph ordinal. @returns Hash equality. */ (
      _command,
      i,
    ) =>
      previousManifest.generatedHashes[`${target}/generator-objects/${i}.o`] ===
      (existsSync(`${target}/generator-objects/${i}.o`)
        ? hash(readFileSync(`${target}/generator-objects/${i}.o`))
        : null),
  );
if (reusableGenerator) {
  for (const [name, expected] of Object.entries(previousManifest.sourceHashes))
    if (hash(loadUnicodeOriginal(native.sources, name)) !== expected)
      throw new Error(`Changed generator source ${name}`);
  for (const [name, expected] of Object.entries(previousManifest.configurations))
    if (native.manifest.configurations[name] !== expected)
      throw new Error(`Changed generator configuration ${name}`);
  for (let i = 0; i < commands.length; i++)
    native.manifest.generatedHashes[`${target}/generator-objects/${i}.o`] =
      previousManifest.generatedHashes[`${target}/generator-objects/${i}.o`];
  native.manifest.generatedHashes[maker] = previousManifest.generatedHashes[maker];
  native.manifest.generatorReuse = {
    source: `${target}/manifest.json`,
    objectCount: commands.length,
    allSourceAndConfigurationAndObjectAndExecutableHashesVerified: true,
  };
}
for (let i = 0; !reusableGenerator && i < commands.length; i++) {
  const argv = [...commands[i].argv],
    object = `${target}/generator-objects/${i}.o`,
    dep = object + ".d";
  argv[argv.indexOf("-o") + 1] = object;
  if (argv.includes("-MF")) argv[argv.indexOf("-MF") + 1] = dep;
  else argv.push("-MMD", "-MF", dep);
  native.run("clang++", argv, `generator-object-${i}`);
  dependencies(dep);
  native.manifest.generatedHashes[object] = hash(readFileSync(object));
  generatorObjects.push(object);
}
if (!reusableGenerator)
  native.run(
    "clang++",
    [
      "-Wl,-dead_strip",
      "-pthread",
      "-framework",
      "CoreFoundation",
      "-framework",
      "Foundation",
      "-lz",
      ...generatorObjects,
      "-o",
      maker,
    ],
    "generator-link",
  );
native.manifest.generatedHashes[maker] = hash(readFileSync(maker));
loadUnicodeOriginal(native.sources, "solenv/gbuild/UnoApiTarget.mk");
const names = [
  "com.sun.star.i18n.TransliterationModules",
  "com.sun.star.i18n.TransliterationModulesExtra",
];
for (const name of names) {
  const path = name.replaceAll(".", "/") + ".idl",
    directory = path.slice(0, path.lastIndexOf("/"));
  mkdirSync(`${target}/idl/${directory}`, { recursive: true });
  writeFileSync(`${target}/idl/${path}`, loadUnicodeOriginal(native.sources, `offapi/${path}`));
}
native.run(
  maker,
  [
    "-nD",
    "-L",
    "-T",
    names.join(";"),
    "-O",
    resolve(`${target}/generated`),
    pathToFileURL(resolve(`${target}/idl`)).href,
  ],
  "original-flag-generation",
);
for (const file of [
  "TransliterationModules.hdl",
  "TransliterationModules.hpp",
  "TransliterationModulesExtra.hpp",
  "TransliterationModulesExtra.hdl",
]) {
  const path = `${target}/generated/com/sun/star/i18n/${file}`;
  native.manifest.generatedHashes[path] = hash(readFileSync(path));
}
const cpp = native.sources["i18nutil/source/utility/casefolding.cxx"],
  width = native.sources["i18nutil/source/utility/widthfolding.cxx"];
const implementation = scope(cpp, "const Mapping mapping_03a3[]", "\n}\n\n/* vim:");
/** Extracts one complete unchanged original function, retaining its source spelling. @param signature - Unique original signature. @returns Original body and signature. */
function widthFunction(signature) {
  const start = width.indexOf(signature),
    body = width.indexOf("{", start);
  let depth = 0;
  if (start < 0 || body < 0) throw new Error(`Missing width function ${signature}`);
  for (let i = body; i < width.length; i++) {
    if (width[i] === "{") depth++;
    if (width[i] === "}" && --depth === 0) return width.slice(start, i + 1);
  }
  throw new Error(`Unclosed width function ${signature}`);
}
const getters = [
  "getfull2halfTable",
  "gethalf2fullTable",
  "getfull2halfTableForASC",
  "gethalf2fullTableForJIS",
  "getfullKana2halfKanaTable",
  "gethalfKana2fullKanaTable",
];
const functions = [
  ...getters.map(
    /** Retains genuine static getter bodies. @param name - Original method. @returns Original source. */ (
      name,
    ) => widthFunction(`oneToOneMapping& widthfolding::${name}()`),
  ),
  widthFunction("sal_Unicode widthfolding::decompose_ja_voiced_sound_marksChar2Char"),
  widthFunction("sal_Unicode widthfolding::getCompositionChar"),
];
native.manifest.scopeHashes.casefoldingIterator = hash(implementation);
for (let i = 0; i < functions.length; i++)
  native.manifest.scopeHashes[`width-${i}`] = hash(functions[i]);
const pointFlags = [0, 1, 2, 4, 8, 16, 32, 64, 127, 255],
  lookupFlags = [0, 1, 2, 3, 4, 5, 6, 7, 127, 128, 255];
const histories = [
  [0xdf],
  [0xdf, 0x41],
  [0xfb03],
  [0xfb03, 0x41],
  [0x69, 0x307, 0x49, 0x3a3],
  [0x41, 0x3a3],
  [0x304b, 0x3099],
  [0x30ab, 0x309a],
  [0xff76, 0xff9e],
  [0xff8a, 0xff9f],
  [0x3040, 0x3099],
  [0x3094, 0x3099],
  [0x3095, 0x3099],
  [0x309d, 0x309f],
  [0x30a6, 0x3099],
  [0x41, 0, 0x42],
  [0xd801, 0xdc37, 0x41],
  [0xd801, 0xdc37],
  [0x307, 0x41],
  [0x22, 0x27, 0x5c, 0x7e],
];
const languages = ["", "lt", "tr", "az", "LT", "tr-TR", "lt\0"];
const flagNames = Object.keys(contract.flags),
  moduleNames = Object.keys(contract.modules),
  extraNames = Object.keys(contract.extra);
const driver = String.raw`${native.prefix}
#include <i18nutil/casefolding.hxx>
#include <i18nutil/oneToOneMapping.hxx>
#include <i18nutil/widthfolding.hxx>
#include <i18nutil/transliteration.hxx>
#include <rtl/character.hxx>
#include "casefolding_data.h"
#include "widthfolding_data.h"
#include <com/sun/star/lang/Locale.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <array>
#include <cstddef>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>
using namespace com::sun::star::lang; using namespace com::sun::star::uno;
namespace i18nutil {
${implementation}
${functions.join("\n")}
}
using namespace i18nutil;
static_assert(sizeof(OneToOneMappingTable_t)==4 && sizeof(UnicodePairWithFlag)==6);
template<class... T> void emit(T... fields){sal_Int32 row[]={sal_Int32(fields)...};if(std::fwrite(row,4,sizeof...(fields),stdout)!=sizeof...(fields))std::exit(3);}
using Getter=oneToOneMapping&(*)(); Getter getters[]={${getters.map(/** Binds actual original getter functions. @param name - Original method. @returns Function address. */ (name) => `&widthfolding::${name}`).join(",")}};
int pointFlags[]={${pointFlags.join(",")}},lookupFlags[]={${lookupFlags.join(",")}};
TransliterationFlags modules[]={TransliterationFlags::NONE,TransliterationFlags::IGNORE_CASE,TransliterationFlags::IGNORE_KANA,TransliterationFlags::IGNORE_CASE|TransliterationFlags::IGNORE_KANA,TransliterationFlags::IGNORE_WIDTH,TransliterationFlags::IGNORE_CASE|TransliterationFlags::IGNORE_WIDTH,TransliterationFlags::IGNORE_KANA|TransliterationFlags::IGNORE_WIDTH,TransliterationFlags::IGNORE_CASE|TransliterationFlags::IGNORE_KANA|TransliterationFlags::IGNORE_WIDTH};
void step(sal_Unicode const*input,sal_Int32&idx,sal_Int32 len,MappingElement&e,Locale const&locale,MappingType flag,TransliterationFlags module,bool&known){auto*element=&e.element;auto*map=e.element.map;bool end=idx>=len,loaded=!end&&bool(module&TransliterationFlags::IGNORE_CASE)&&e.current>=e.element.nmap;sal_Unicode result=0;int error=0,message=0,context=0,name=0;try{result=casefolding::getNextChar(input,idx,len,e,locale,flag,module);if(end)known=false;else if(loaded)known=true;}catch(RuntimeException const&x){error=1;message=x.Message.getLength();context=x.Context.is();name=cppu::UnoType<RuntimeException>::get().getTypeName()=="com.sun.star.uno.RuntimeException";}
emit(result,idx,e.current,e.element.type,e.element.nmap,known,known?map[0]:0,known?map[1]:0,known?map[2]:0,error,message,context,name,element==&e.element&&map==e.element.map);}
void seed(MappingElement&e){e.element.map[0]=0x1111;e.element.map[1]=0x2222;e.element.map[2]=0x3333;}
int main(int argc,char**argv){std::string mode=argc>1?argv[1]:"tables";Locale empty;
if(mode=="tables"){
emit(sizeof(OneToOneMappingTable_t),sizeof(UnicodePairWithFlag),offsetof(UnicodePairWithFlag,first),offsetof(UnicodePairWithFlag,second),offsetof(UnicodePairWithFlag,flag));
${moduleNames.map(/** Observes actual generated enum values. @param name - Original member. @returns Native observation. */ (name) => `emit(css::i18n::TransliterationModules_${name});`).join("\n")}
emit(css::i18n::TransliterationModules::TransliterationModules_MAKE_FIXED_SIZE);
${extraNames.map(/** Observes actual generated constant values. @param name - Original member. @returns Native observation. */ (name) => `emit(css::i18n::TransliterationModulesExtra::${name});`).join("\n")}
${flagNames.map(/** Observes actual header flag values. @param name - Original member. @returns Native observation. */ (name) => `emit(TransliterationFlags::${name});`).join("\n")}
for(auto const&r:decomposition_table)emit(r.decomposited_character_1,r.decomposited_character_2);for(auto const&r:composition_table)emit(r[0],r[1]);for(auto const&r:full2half)emit(r.first,r.second,r.flag);for(auto const&r:half2full)emit(r.first,r.second,r.flag);
for(auto a:getters)for(auto b:getters)emit(&a()==&b());
for(int key=0;key<65536;key++){emit(widthfolding::decompose_ja_voiced_sound_marksChar2Char(key));for(auto get:getters)emit(get().find(key),get()[key]);}
for(int first=0x3040;first<=0x30ff;first++)for(int second=0x3099;second<=0x309a;second++)emit(widthfolding::getCompositionChar(first,second),widthfolding::getCompositionChar(first+65536,second+65536));return 0;}
if(mode=="lookup"){
for(int table=0;table<2;table++)for(auto flag:lookupFlags){oneToOneMappingWithFlag owner(table?half2full:full2half,table?sizeof(half2full):sizeof(full2half),static_cast<UnicodePairFlag>(flag));for(int phase=0;phase<2;phase++){if(phase){owner.makeIndex();owner.makeIndex();}for(int key=0;key<65536;key++)emit(owner.find(key),owner[key]);}}
OneToOneMappingTable_t pairs[]={{1,0x1111},{258,0x2222},{259,0x3333}};for(auto bytes:{0,1,3,4,5,8,12}){oneToOneMapping owner(pairs,bytes);for(int key=0;key<65536;key++)emit(owner.find(key),owner[key]);}
oneToOneMapping explicitUnit(pairs,24,8),nullOwner(nullptr,128);oneToOneMappingWithFlag nullFlag(nullptr,0,7);nullFlag.makeIndex();nullFlag.makeIndex();for(int key=0;key<65536;key++)emit(explicitUnit.find(key),nullOwner[key],nullFlag[key]);
UnicodePairWithFlag rows[]={{0x41,0x61,1},{0x42,0x62,2},{0x300,0x301,4}};{oneToOneMappingWithFlag owner(rows,sizeof(rows),7);owner.makeIndex();for(int phase=0;phase<3;phase++){if(phase==1){rows[0].second=0x111;rows[1].flag=0;rows[2].first=0x301;}if(phase==2)owner.makeIndex();for(auto key:{0x41,0x42,0x300,0x301,-1,65536,65537})emit(owner.find(key),owner[key]);}}for(auto const&r:rows)emit(r.first,r.second,r.flag);return 0;}
if(mode=="points"){for(auto flag:pointFlags)for(auto module:modules)for(int code=0;code<65536;code++){sal_Unicode input[3]={sal_Unicode(code),0,0};sal_Int32 idx=0;MappingElement e;seed(e);bool known=true;step(input,idx,1,e,empty,static_cast<MappingType>(flag),module,known);step(input,idx,1,e,empty,static_cast<MappingType>(flag),module,known);}return 0;}
if(mode=="histories"){
std::vector<std::vector<sal_Unicode>>strings={${histories.map(/** Emits actual allocated caller units. @param units - Original input. @returns Native initializer. */ (units) => `{${units.join(",")}}`).join(",")}};
std::vector<std::u16string>languages={${languages.map(/** Emits exact language units including embedded zero. @param language - Caller field. @returns Native string. */ (language) => `std::u16string({${[...language].map(/** Emits one UTF16 unit. @param unit - Original character. @returns Native unit. */ (unit) => unit.charCodeAt(0)).join(",")}})`).join(",")}};
for(auto const&units:strings)for(auto const&language:languages)for(auto flag:pointFlags)for(int start=0;start<8;start++)for(int varying=0;varying<2;varying++){
auto input=units;input.push_back(0);auto saved=input;Locale locale(rtl::OUString(language.data(),language.size()),rtl::OUString(),rtl::OUString());sal_Int32 idx=0;MappingElement e;seed(e);bool known=true;for(size_t call=0;call<units.size()*3+2;call++){step(input.data(),idx,units.size(),e,locale,static_cast<MappingType>(flag),modules[(start+(varying?call:0))%8],known);if(input!=saved)return 4;}}
// A defined no-extra-match error observes idx++ before the original RHS throws.
sal_Unicode input[]={0xfb03,0x41,0};sal_Int32 idx=0;MappingElement e;seed(e);bool known=true;step(input,idx,2,e,empty,MappingType::NotValue,TransliterationFlags::IGNORE_CASE,known);return 0;}
return 2;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
native.manifest.driverHash = hash(driver);
/** Builds genuine original owners with matching instrumentation. @param sanitized - ASan/UBSan mode. @returns Actual native executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized),
    suffix = sanitized ? "-asan" : "",
    object = `${target}/oneToOneMapping${suffix}.o`,
    dep = object + ".d";
  const instrument = sanitized
    ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"]
    : [];
  native.run(
    "clang++",
    [
      ...native.flags,
      ...instrument,
      "-include",
      `${upstream}/include/sal/types.h`,
      "-MMD",
      "-MF",
      dep,
      "-c",
      `${upstream}/i18nutil/source/utility/oneToOneMapping.cxx`,
      "-o",
      object,
    ],
    `oneToOneMapping${suffix}`,
  );
  dependencies(dep);
  const binary = `${target}/driver${suffix}`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...instrument,
      `-I${target}/generated`,
      `-I${upstream}/i18nutil/source/utility`,
      "-MMD",
      "-MF",
      binary + ".d",
      `${target}/driver.cpp`,
      ...objects,
      object,
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
    `link${suffix}`,
  );
  dependencies(binary + ".d");
  return binary;
}
const binary = build(false),
  sanitized = build(true),
  captures = {};
/** Captures complete initialized output bytes with real terminal diagnostics. @param executable - Actual original process. @param mode - Caller corpus. @returns Complete bytes. */
function capture(executable, mode) {
  const path = executable + "." + mode,
    fd = openSync(path, "w");
  const result = spawnSync(executable, [mode], {
    stdio: ["ignore", fd, "pipe"],
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  closeSync(fd);
  writeFileSync(path + ".stderr", result.stderr ?? "");
  native.manifest.commands.push({
    tool: executable,
    argv: [mode],
    exitCode: result.status,
    signal: result.signal,
  });
  native.save();
  if (result.status !== 0)
    throw new Error(result.stderr?.toString() ?? `Native capture failed ${mode}`);
  return readFileSync(path);
}
for (const mode of ["tables", "lookup", "points", "histories"]) {
  const bytes = capture(binary, mode);
  if (!capture(sanitized, mode).equals(bytes)) throw new Error(`Sanitizer output differs ${mode}`);
  const delta = Buffer.allocUnsafe(bytes.length);
  let previous = 0;
  for (let at = 0; at < bytes.length; at += 4) {
    const value = bytes.readInt32LE(at);
    delta.writeInt32LE((value - previous) | 0, at);
    previous = value;
  }
  const packed = gzipSync(delta, { level: 9 }),
    restored = gunzipSync(packed);
  previous = 0;
  for (let at = 0; at < restored.length; at += 4) {
    previous = (previous + restored.readInt32LE(at)) | 0;
    restored.writeInt32LE(previous, at);
  }
  if (!restored.equals(bytes)) throw new Error("Lossy native capture");
  captures[mode] = {
    rawBytes: bytes.length,
    rawHash: hash(bytes),
    encoding: "signed-int32-sequential-deltas-mod32-gzip-base64",
    gzipBase64: packed.toString("base64"),
  };
  console.log(`Captured complete original ${mode}: ${bytes.length} bytes; sanitizer-identical`);
}
native.manifest.state = "captured";
native.save();
const result = {
  baselineCommit: pin,
  sourceHashes: native.manifest.sourceHashes,
  generatedHashes: native.manifest.generatedHashes,
  icuHashes: native.manifest.icuHashes,
  scopeHashes: native.manifest.scopeHashes,
  configurations: native.manifest.configurations,
  driverHash: hash(driver),
  getters,
  flagNames,
  moduleNames,
  extraNames,
  pointFlags,
  lookupFlags,
  histories,
  languages,
  iteratorFields: [
    "result",
    "idx",
    "current",
    "type",
    "nmap",
    "mapInitialized",
    "map0",
    "map1",
    "map2",
    "exception",
    "messageLength",
    "contextPresent",
    "typeNameMatches",
    "embeddedFieldIdentityStable",
  ],
  captures,
  sanitizedIdentical: true,
  evidenceScope:
    "Actual original getNextChar/scalar width getters and complete lookup classes, generated numeric flags and initialized caller/state observations only. Native default MappingElement map cells are uninitialized and deliberately masked; physical ABI/full Sequence string transformations/locale service/pool/consumer QA/UI remain unverified.",
};
const fixture = "apps/office/src/i18nutil/source/utility/native-casefolding-iterator-cases.json";
if (write) writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Complete original iterator observations differ");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    sources: Object.keys(result.sourceHashes).length,
    sanitizedIdentical: true,
  }),
);
