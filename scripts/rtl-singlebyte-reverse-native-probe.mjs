/** @fileoverview Captures original complete reverse single-byte conversion,undefined handling and classifiers using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin } from "./rtl-ustring-native-sources.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-singlebyte-reverse-native";
const fixture = "apps/office/src/sal/textenc/native-singlebyte-reverse-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "sal/textenc/convertsimple.cxx",
  "sal/textenc/handleundefinedunicodetotextchar.cxx",
  "sal/textenc/handleundefinedunicodetotextchar.hxx",
  "sal/textenc/unichars.cxx",
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
#include "handleundefinedunicodetotextchar.hxx"
#include "gettextencodingdata.hxx"
#include "tenchelp.hxx"
#include "unichars.hxx"
#include <rtl/textcvt.h>
#include <cstdio>
#include <cstdint>
#include <string>
#include <vector>
#include <cstdlib>
std::vector<int> encodings(){std::vector<int> ids{1,11,12,40};for(int i=1;i<97;i++){if(i==1||i==11||i==12||i==40)continue;auto e=Impl_getTextEncodingData(i);if(e&&e->maConverter.mpConvertUnicodeToTextProc==&sal::detail::textenc::convertUnicodeToChar)ids.push_back(i);}return ids;}
template<class T>void table(const T*p,int start,int end){if(!p){std::printf("null");return;}std::putchar('[');for(int i=start;i<=end;i++)std::printf("%s%u",i==start?"":",",unsigned(p[i-start]));std::putchar(']');}
void descriptors(){for(int id:encodings()){auto d=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(id)->maConverter.mpConvertData);std::printf("[%d,{\"mpToUniTab1\":",id);table(d->mpToUniTab1,d->mnToUniStart1,d->mnToUniEnd1);std::printf(",\"mpToUniTab2\":");table(d->mpToUniTab2,d->mnToUniStart2,d->mnToUniEnd2);std::printf(",\"mpToCharTab1\":");table(d->mpToCharTab1,d->mnToCharStart1,d->mnToCharEnd1);std::printf(",\"mpToCharTab2\":");table(d->mpToCharTab2,d->mnToCharStart2,d->mnToCharEnd2);std::printf(",\"mpToCharExTab\":");if(!d->mpToCharExTab)std::printf("null");else{std::putchar('[');for(int i=0;i<d->mnToCharExCount;i++){auto &e=d->mpToCharExTab[i];std::printf("%s{\"mnUniChar\":%u,\"mnChar\":%u,\"mnChar2\":%u}",i?",":"",unsigned(e.mnUniChar),unsigned(e.mnChar),unsigned(e.mnChar2));}std::putchar(']');}
std::printf(",\"mnToUniStart1\":%u,\"mnToUniEnd1\":%u,\"mnToUniStart2\":%u,\"mnToUniEnd2\":%u,\"mnToCharStart1\":%u,\"mnToCharEnd1\":%u,\"mnToCharStart2\":%u,\"mnToCharEnd2\":%u,\"mnToCharExCount\":%u}]\n",unsigned(d->mnToUniStart1),unsigned(d->mnToUniEnd1),unsigned(d->mnToUniStart2),unsigned(d->mnToUniEnd2),unsigned(d->mnToCharStart1),unsigned(d->mnToCharEnd1),unsigned(d->mnToCharStart2),unsigned(d->mnToCharEnd2),unsigned(d->mnToCharExCount));}}
void emit(int id,const std::vector<sal_Unicode>&src,int cap,unsigned flags){char dst[12];for(auto&b:dst)b=char(0xbe);sal_uInt32 info=0xdeadbeef;sal_Size consumed=0xcafe;auto data=Impl_getTextEncodingData(id==1000?12:id)->maConverter.mpConvertData;ImplByteConvertData contract=*static_cast<const ImplByteConvertData*>(data);unsigned char second[32];if(id==1000){for(unsigned i=0;i<32;i++)second[i]=contract.mpToCharTab2[i];second[5]=0;contract.mpToCharTab2=second;data=&contract;}auto written=sal::detail::textenc::convertUnicodeToChar(data,nullptr,src.data(),src.size(),dst,cap,flags,&info,&consumed);std::printf("[%d,[",id);for(size_t i=0;i<src.size();i++)std::printf("%s%u",i?",":"",unsigned(src[i]));std::printf("],%d,%u,[%zu,%u,%zu",cap,flags,written,info,consumed);for(auto b:dst)std::printf(",%u",unsigned(static_cast<unsigned char>(b)));std::puts("]]");}
void values(){for(int cap=0;cap<3;cap++)for(unsigned f:std::vector<unsigned>{0,1,2,0x300})emit(1000,{0x85},cap,f);for(int id:std::vector<int>{1,11,12,40})for(unsigned c=0;c<65536;c++)for(unsigned f:std::vector<unsigned>{0,0x300})emit(id,{sal_Unicode(c)},7,f);
std::vector<unsigned> flags{0,1,2,3,4,5,6,15,0x10,0x20,0x30,0x40,0x50,0x60,0xf0,0x100,0x200,0x300,0x400,0x800,0x1000,0x2000,0x3800,0x3f00,0x8000,0x8300,0xfffffff0u};
for(int id:encodings()){auto d=static_cast<const ImplByteConvertData*>(Impl_getTextEncodingData(id)->maConverter.mpConvertData);std::vector<unsigned> chars{0,127,128,0xa9,0xab,0xae,0xbb,0x0ae0,0x100,0x200b,0x200c,0xfeff,0xe000,0xf0ff,0xf100,0xf1ff,0xf200,0xf8ff,0xffff};for(unsigned c=d->mnToCharStart1;c<=d->mnToCharEnd1;c++)chars.push_back(c);for(unsigned c=d->mnToCharStart2;c<=d->mnToCharEnd2;c++)chars.push_back(c);for(int i=0;i<d->mnToCharExCount;i++)chars.push_back(d->mpToCharExTab[i].mnUniChar);
for(unsigned c:chars)emit(id,{sal_Unicode(c)},7,0x300);
if(id!=1&&id!=11&&id!=12&&id!=40)continue;
for(unsigned c:std::vector<unsigned>{0,0xa9,0xab,0xae,0xbb,0x0ae0,0xff61,0x200b,0x070f,0xe000,0xf100,0xf1ff,0xd800,0xdc00,0xffff})for(unsigned f:flags)for(int cap=0;cap<8;cap++){emit(id,{sal_Unicode(c)},cap,f);emit(id,{'A',sal_Unicode(c),0},cap,f);}
for(auto src:std::vector<std::vector<sal_Unicode>>{{},{0xd800,0xdc00},{0xd800,0xdfff,'A'},{0xd800,'A'},{0xdc00,0xd800},{'A',0xd800},{0xf100,0xf1ff,0xf120}})for(unsigned f:flags)for(int cap=0;cap<8;cap++)emit(id,src,cap,f);
}}
void handlers(){std::vector<unsigned> flags;for(unsigned i=0;i<16;i++){flags.push_back(i);flags.push_back(i<<4);flags.push_back(i|0x8000);}for(unsigned f:std::vector<unsigned>{0x400,0x800,0x1000,0x2000,0x3800,0x3f00,0xffffffff})flags.push_back(f);
for(auto src:std::vector<std::vector<sal_Unicode>>{{0xffff},{0xf100},{0xf1ff},{0xe000},{0x200b},{0x200c},{0x070f},{0xd800},{0xd800,'A'},{0xd800,0xdc00},{0xd800,0xdfff},{0xdc00}})for(unsigned f:flags)for(int cap=0;cap<3;cap++){std::vector<sal_Unicode> input{'P'};input.insert(input.end(),src.begin(),src.end());input.push_back('S');const sal_Unicode* start=input.data()+1;const sal_Unicode* cur=start;char dst[8];for(auto&b:dst)b=char(0xbe);char*out=dst+1;sal_uInt32 info=0x8000;bool result=sal::detail::textenc::handleUndefinedUnicodeToTextChar(&cur,start+src.size(),&out,dst+1+cap,f,&info);std::printf("[[");for(size_t i=0;i<src.size();i++)std::printf("%s%u",i?",":"",unsigned(src[i]));std::printf("],%d,%u,[%d,%td,%td,%u",cap,f,int(result),cur-input.data(),out-dst,info);for(auto b:dst)std::printf(",%u",unsigned(static_cast<unsigned char>(b)));std::puts("]]");}}
void classifiers(){for(unsigned c=0;c<=0x110001;c++)std::putchar('0'+int(ImplIsControlOrFormat(c))+2*int(ImplIsPrivateUse(c))+4*int(ImplIsZeroWidth(c)));for(unsigned c:std::vector<unsigned>{0x7fffffff,0x80000000,0xffffffff})std::putchar('0'+int(ImplIsControlOrFormat(c))+2*int(ImplIsPrivateUse(c))+4*int(ImplIsZeroWidth(c)));}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="values")values();else if(mode=="descriptors")descriptors();else if(mode=="handlers")handlers();else if(mode=="classifiers")classifiers();else if(mode=="constants"){
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_0\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_0));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_QUESTIONMARK\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_QUESTIONMARK));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_UNDERLINE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_UNDERLINE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_IGNORE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_IGNORE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_0\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_0));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_QUESTIONMARK\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_QUESTIONMARK));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_UNDERLINE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_UNDERLINE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACESTR\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_REPLACESTR));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_NONSPACING_IGNORE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_NONSPACING_IGNORE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_CONTROL_IGNORE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_CONTROL_IGNORE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_PRIVATE_IGNORE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_PRIVATE_IGNORE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_NOCOMPOSITE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_NOCOMPOSITE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_FLUSH\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_FLUSH));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_GLOBAL_SIGNATURE));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_UNDEFINED_MASK));
std::printf("[\"RTL_UNICODETOTEXT_FLAGS_INVALID_MASK\",%u]\n",unsigned(RTL_UNICODETOTEXT_FLAGS_INVALID_MASK));
std::printf("[\"RTL_UNICODETOTEXT_INFO_ERROR\",%u]\n",unsigned(RTL_UNICODETOTEXT_INFO_ERROR));
std::printf("[\"RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL\",%u]\n",unsigned(RTL_UNICODETOTEXT_INFO_SRCBUFFERTOSMALL));
std::printf("[\"RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL\",%u]\n",unsigned(RTL_UNICODETOTEXT_INFO_DESTBUFFERTOSMALL));
std::printf("[\"RTL_UNICODETOTEXT_INFO_UNDEFINED\",%u]\n",unsigned(RTL_UNICODETOTEXT_INFO_UNDEFINED));
std::printf("[\"RTL_UNICODETOTEXT_INFO_INVALID\",%u]\n",unsigned(RTL_UNICODETOTEXT_INFO_INVALID));
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
for (const mode of ["descriptors", "values", "handlers", "classifiers", "constants"]) {
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
    "Whole original convertUnicodeToChar and undefined-handler/classifier bodies with actual core and original additional registry descriptors,and one valid caller-supplied copy of ISO88591 with its second-range0x85 entry set to the original undefined-zero sentinel (not a registry entry),complete BMP core cases,real two-byte MS1258 data,replacement tables,flags,capacities,private writes,surrogate consumption,initialized sentinel buffers and original raw outputs. Classifiers cover0..0x110001and unsigned32 high boundaries. Genuine verified69normal+69ASanUBSan original objects;no function substitution,host encoder or fixture expected-value implementation. Registry/factories/OUString/VCL/pool/UI remain pending.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed original single-byte observations");
console.log(
  `Native reverse single-byte ${write ? "written" : "verified"}:${Object.keys(objectHashes).length}verified original objects;${Object.keys(captures).length}capture modes`,
);
