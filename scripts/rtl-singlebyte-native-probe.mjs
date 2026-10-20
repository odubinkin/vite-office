/** @fileoverview Captures original single-byte descriptors,flags and conversion using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-singlebyte-native";
const fixture = "apps/office/src/sal/textenc/native-singlebyte-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "sal/textenc/convertsimple.cxx",
  "sal/textenc/convertsimple.hxx",
  "sal/textenc/tenchelp.hxx",
  "sal/textenc/unichars.hxx",
  "sal/textenc/textenc.cxx",
  "sal/textenc/gettextencodingdata.hxx",
  "include/rtl/textcvt.h",
  "include/rtl/textenc.h",
])
  loadUnicodeOriginal(native.sources, path);
const priorRoot = "output/playwright/rtl-float-format-native";
const prior = JSON.parse(readFileSync(`${priorRoot}/manifest.json`, "utf8"));
const priorFixture = JSON.parse(
  readFileSync("apps/office/src/sal/rtl/native-float-format-cases.json", "utf8"),
);
if (prior.state !== "captured" || prior.pin !== pin)
  throw new Error("Missing prior verified full native graph");
for (const [path, expected] of Object.entries(priorFixture.sourceHashes))
  if (
    prior.sourceHashes[path] !== expected ||
    hash(loadUnicodeOriginal(native.sources, path)) !== expected
  )
    throw new Error(`Changed verified original native source:${path}`);
for (const [path, expected] of Object.entries(prior.generatedHashes))
  if (hash(readFileSync(path)) !== expected)
    throw new Error(`Changed verified generated native header:${path}`);
const verifiedObjects = JSON.parse(
  readFileSync("apps/office/src/sal/rtl/native-oustringbuffer-cases.json", "utf8"),
);
if (verifiedObjects.pin !== pin || Object.keys(verifiedObjects.objectHashes).length !== 138)
  throw new Error("Missing verified immutable original object hashes");
const objectHashes = {};
/** Uses only completed original translation units with the matching instrumented graph and records actual immutable objects. @param sanitized - Required graph. @returns Verified full dependency object list. */
function objects(sanitized) {
  const entries = prior.commands.filter(
    /** Selects genuine original completed compilation commands. @param command - Prior executed compiler command. @returns Matching original graph. */ (
      command,
    ) =>
      command.tool === "clang++" &&
      command.exitCode === 0 &&
      command.argv.includes("-c") &&
      command.argv.includes("-fsanitize=address,undefined") === sanitized,
  );
  if (entries.length !== 69) throw new Error("Incomplete genuine native object graph");
  return entries.map(
    /** Records actual linked object bytes before execution. @param command - Original completed compile. @returns Object path. */ (
      command,
    ) => {
      const path = command.argv[command.argv.indexOf("-o") + 1];
      objectHashes[path] = hash(readFileSync(path));
      if (objectHashes[path] !== verifiedObjects.objectHashes[path])
        throw new Error(`Changed verified original object:${path}`);
      return path;
    },
  );
}
const driver = String.raw`#include "convertsimple.hxx"
#include "gettextencodingdata.hxx"
#include "tenchelp.hxx"
#include "unichars.hxx"
#include <rtl/textcvt.h>
#include <cstdio>
#include <cstdint>
#include <string>
#include <vector>
#include <cstdlib>
std::vector<int> encodings(){std::vector<int> ids{1,11,12};for(int i=1;i<97;i++){auto e=Impl_getTextEncodingData(i);if(!e||e->maConverter.mpConvertTextToUnicodeProc!=&sal::detail::textenc::convertCharToUnicode)continue;auto d=static_cast<const ImplByteConvertData*>(e->maConverter.mpConvertData);bool gap=false;for(int c=128;c<256;c++)if(!((c>=d->mnToUniStart1&&c<=d->mnToUniEnd1)||(c>=d->mnToUniStart2&&c<=d->mnToUniEnd2)))gap=true;if(gap){ids.push_back(i);return ids;}}std::abort();}
template<class T>void table(const T*p,int start,int end){if(!p){std::printf("null");return;}std::putchar('[');for(int i=start;i<=end;i++)std::printf("%s%u",i==start?"":",",unsigned(p[i-start]));std::putchar(']');}
void descriptors(){for(int id:encodings()){auto d=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(id)->maConverter.mpConvertData);std::printf("[%d,{\"mpToUniTab1\":",id);table(d->mpToUniTab1,d->mnToUniStart1,d->mnToUniEnd1);std::printf(",\"mpToUniTab2\":");table(d->mpToUniTab2,d->mnToUniStart2,d->mnToUniEnd2);std::printf(",\"mpToCharTab1\":");table(d->mpToCharTab1,d->mnToCharStart1,d->mnToCharEnd1);std::printf(",\"mpToCharTab2\":");table(d->mpToCharTab2,d->mnToCharStart2,d->mnToCharEnd2);std::printf(",\"mpToCharExTab\":");if(!d->mpToCharExTab)std::printf("null");else{std::putchar('[');for(int i=0;i<d->mnToCharExCount;i++){auto &e=d->mpToCharExTab[i];std::printf("%s{\"mnUniChar\":%u,\"mnChar\":%u,\"mnChar2\":%u}",i?",":"",unsigned(e.mnUniChar),unsigned(e.mnChar),unsigned(e.mnChar2));}std::putchar(']');}
std::printf(",\"mnToUniStart1\":%u,\"mnToUniEnd1\":%u,\"mnToUniStart2\":%u,\"mnToUniEnd2\":%u,\"mnToCharStart1\":%u,\"mnToCharEnd1\":%u,\"mnToCharStart2\":%u,\"mnToCharEnd2\":%u,\"mnToCharExCount\":%u}]\n",unsigned(d->mnToUniStart1),unsigned(d->mnToUniEnd1),unsigned(d->mnToUniStart2),unsigned(d->mnToUniEnd2),unsigned(d->mnToCharStart1),unsigned(d->mnToCharEnd1),unsigned(d->mnToCharStart2),unsigned(d->mnToCharEnd2),unsigned(d->mnToCharExCount));}}
void values(){for(int id:encodings()){auto d=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(id)->maConverter.mpConvertData);for(int c=0;c<256;c++){bool undefined=false;if(c>=128){unsigned u=0;if(c>=d->mnToUniStart1&&c<=d->mnToUniEnd1)u=d->mpToUniTab1[c-d->mnToUniStart1];else if(c>=d->mnToUniStart2&&c<=d->mnToUniEnd2)u=d->mpToUniTab2[c-d->mnToUniStart2];undefined=!u;}
std::vector<unsigned> flags{0,0xfffffff0u};if(undefined)for(unsigned mask=0;mask<16;mask++){flags.push_back(mask);flags.push_back(mask|0x8000);flags.push_back(mask|0x10430);}
for(int pattern=0;pattern<4;pattern++)for(int cap=0;cap<5;cap++)for(unsigned f:flags){char src[3]={};int n=0;if(pattern==1){src[0]=char(c);n=1;}else if(pattern==2){src[0]='A';src[1]=char(c);src[2]=0;n=3;}else if(pattern==3){src[0]=char(c);src[1]=0;src[2]=char(c);n=3;}sal_Unicode dest[6]={0xbeef,0xbeef,0xbeef,0xbeef,0xbeef,0xbeef};sal_uInt32 info=0xdeadbeef;sal_Size consumed=0xcafe;sal_Size written=sal::detail::textenc::convertCharToUnicode(d,nullptr,src,n,dest,cap,f,&info,&consumed);std::printf("[%d,%d,%d,%d,%u,[%zu,%u,%zu",id,c,pattern,cap,f,written,info,consumed);for(auto u:dest)std::printf(",%u",unsigned(u));std::puts("]]");}}}}
void helpers(){for(int c=0;c<256;c++)for(unsigned flags=0;flags<16;flags++)std::printf("[%d,%u,%u]\n",c,flags,unsigned(ImplGetUndefinedUnicodeChar(char(c),flags)));}
void aliases(){auto a=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(11)->maConverter.mpConvertData);auto m=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(1)->maConverter.mpConvertData);auto i=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(12)->maConverter.mpConvertData);std::printf("[%d,%d,%u,%u,%u]\n",int(a->mpToUniTab1==m->mpToUniTab1),int(m->mpToCharTab1==i->mpToCharTab1),unsigned(RTL_TEXTCVT_BYTE_PRIVATE_START),unsigned(RTL_TEXTCVT_BYTE_PRIVATE_END),unsigned(RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER));}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values")values();else if(mode=="descriptors")descriptors();else if(mode=="helpers")helpers();else if(mode=="aliases")aliases();else if(mode=="constants"){
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_IGNORE\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_IGNORE));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_IGNORE));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_INVALID_IGNORE));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_FLUSH\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_FLUSH));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_GLOBAL_SIGNATURE\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_GLOBAL_SIGNATURE));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_MASK));
std::printf("[\"RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK\",%u]\n",unsigned(RTL_TEXTTOUNICODE_FLAGS_INVALID_MASK));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_ERROR\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_ERROR));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOSMALL\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOSMALL));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_SRCBUFFERTOOSMALL));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOSMALL\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOSMALL));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_DESTBUFFERTOOSMALL));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_UNDEFINED\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_UNDEFINED));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_MBUNDEFINED\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_MBUNDEFINED));
std::printf("[\"RTL_TEXTTOUNICODE_INFO_INVALID\",%u]\n",unsigned(RTL_TEXTTOUNICODE_INFO_INVALID));
}else return 4;return std::ferror(stdout)?3:0;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
/** Links a new observation-only caller to the genuine unchanged original cached object graph. @param sanitized - Required instrumentation. @returns Native executable. */
function build(sanitized) {
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/sal/textenc",
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
      "-DCPPU_DLLIMPLEMENTATION",
      `${target}/driver.cpp`,
      ...objects(sanitized),
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
  return binary;
}
/** Captures original process bytes and terminal status. @param binary - Actual caller. @param mode - Native caller input. @returns Process result. */
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
  return result;
}
const normal = build(false),
  sanitized = build(true),
  captures = {};
for (const mode of ["descriptors", "values", "helpers", "aliases", "constants"]) {
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  if (
    first.status !== 0 ||
    second.status !== 0 ||
    !first.stdout.equals(second.stdout) ||
    /AddressSanitizer|runtime error:/.test(second.stderr.toString())
  )
    throw new Error(`Original single-byte observations failed:${first.stderr}\n${second.stderr}`);
  captures[mode] = {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  };
}
for (const [path, expected] of Object.entries(objectHashes))
  if (hash(readFileSync(path)) !== expected) throw new Error(`Linked object changed:${path}`);
const result = {
  pin,
  driverHash: hash(driver),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Saves complete original source hashes. @param entry - Genuine source. @returns Hash pair. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  objectHashes,
  captures,
  scope:
    "Full unchanged original convertCharToUnicode body with real core ASCII_US/MS1252/ISO8859_1 descriptors and one original registry descriptor with a genuine range gap. All256bytes,empty and embeddedzero/prefix streams,capacities0..4,initialized six-unit sentinel storage,all undefined masks with FLUSH and ignored flags,consumed/written/info outputs;original signed-char undefined helper,macro constants,complete fourteen-field core data and shared table identity. Genuine verified69normal+69ASanUBSan SAL/CPPU objects. No fake descriptor/host decoder/native body replacement. Full encoding registry,C factories,OUString byte construction,VCL serialization and UI remain pending.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed original single-byte observations");
console.log(
  `Native single-byte ${write ? "written" : "verified"}:${Object.keys(objectHashes).length}verified original objects;${Object.keys(captures).length}capture modes`,
);
