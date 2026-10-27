/** @fileoverview Compiles unchanged pinned DBCS/EUC-JP converter bodies and original native tables; unused ignore-classification services trap rather than supply replacement behavior. */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = "vendor/libreoffice-reference/";
const target = "output/playwright/sal-dbcs-native";
mkdirSync(target, { recursive: true });
const sources = {};
/** Loads original pinned input while retaining a reproducible hash manifest. @param path - Upstream path. @returns Exact source. */
function source(path) {
  const text = readFileSync(root + path, "utf8");
  sources[path] = createHash("sha256").update(text).digest("hex");
  return text;
}
const header = source("sal/textenc/tenchelp.hxx");
const structs = header.slice(
  header.indexOf("struct ImplDBCSEUDCData"),
  header.indexOf("/* - TextConverter - HelpFunctions"),
);
const definitions = [];
const aggregates = new Map();
let macros = "";
for (const file of readdirSync(root + "sal/textenc")
  .filter((name) => /^tcvt(?:jp|kr|scn|tcn)[1-6]\.tab$/.test(name))
  .sort()) {
  const text = source("sal/textenc/" + file);
  macros +=
    [...text.matchAll(/^#define\s+(?:DBCS_EUDC_\w+|GBKOFF)\s+[^\n]+$/gm)]
      .map((m) => m[0])
      .join("\n") + "\n";
  for (const match of text.matchAll(
    /ImplTextEncodingData\s+const\s+(\w+)\s*=\s*\{\s*\{\s*&(\w+),\s*ImplDBCSToUnicode,/g,
  ))
    aggregates.set(match[1], match[2]);
  const pattern =
    /^(sal_uInt16|ImplDBCSEUDCData|ImplDBCSToUniLeadTab|ImplUniToDBCSHighTab|ImplDBCSConvertData|ImplEUCJPConvertData)\s+const\s+(\w+)(\[[^\]]*\])?\s*=\s*\{[\s\S]*?\};/gm;
  for (const match of text.matchAll(pattern))
    definitions.push({ type: match[1], name: match[2], array: !!match[3], text: match[0] });
}
const textHeader = source("include/rtl/textcvt.h");
const flags = [
  ...textHeader.matchAll(
    /^#define\s+(RTL_(?:TEXTTOUNICODE|UNICODETOTEXT)_[A-Z0-9_]+)\s+([^\n\\]+)$/gm,
  ),
]
  .map((m) => `#define ${m[1]} ${m[2]}`)
  .join("\n");
const undefinedOwner = source("sal/textenc/handleundefinedunicodetotextchar.cxx").replace(
  /^#include.*$/gm,
  "",
);
const converters = source("sal/textenc/tcvtmb.cxx").replace(/^#include.*$/gm, "");
const constants = source("include/rtl/textenc.h");
const ids = new Map(
  [...constants.matchAll(/#define\s+(RTL_TEXTENCODING_\w+)\s+\(RTL_TEXTENC_CAST\(\s*(\d+)/g)].map(
    (m) => [m[1], Number(m[2])],
  ),
);
const dispatcher = source("sal/textenc/tables.cxx");
const nativeFactory = new Map(
  [...dispatcher.matchAll(/&(\w+),\s*\/\*\s*(\w+)\s*\*\//g)].map((m) => [m[2], m[1]]),
);
// These are the currently represented DBCS descriptors. IDs and data pointers come only from original source, not the port's dispatcher.
const names = [
  "APPLE_CHINSIMP",
  "APPLE_CHINTRAD",
  "APPLE_JAPANESE",
  "APPLE_KOREAN",
  "MS_932",
  "MS_936",
  "MS_949",
  "MS_950",
  "EUC_CN",
  "EUC_KR",
  "MS_1361",
];
const bindings = names.map((name) => [
  ids.get("RTL_TEXTENCODING_" + name),
  aggregates.get(nativeFactory.get(name)),
]);
if (bindings.some(([id, data]) => id === undefined || data === undefined))
  throw new Error("Original descriptor factory binding changed; review the native probe route.");
const driver = String.raw`
#include <cstdint>
#include <cstddef>
#include <cstdlib>
#include <cassert>
#include <iostream>
#include <iterator>
#include <map>
#include <vector>
#include <string>
using sal_uInt8=std::uint8_t; using sal_uInt16=std::uint16_t; using sal_uInt32=std::uint32_t; using sal_Unicode=char16_t; using sal_Size=std::size_t;
#define SAL_UNUSED_PARAMETER
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
#define RTL_TEXTCVT_BYTE_PRIVATE_START 0xF100
#define RTL_TEXTCVT_BYTE_PRIVATE_END 0xF1FF
#define RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER 0xFFFD
${flags}
${structs}
namespace rtl { constexpr bool isHighSurrogate(sal_Unicode c){return c>=0xD800 && c<=0xDBFF;} constexpr bool isLowSurrogate(sal_Unicode c){return c>=0xDC00 && c<=0xDFFF;} }
namespace sal::detail::textenc { bool handleUndefinedUnicodeToTextChar(sal_Unicode const**,sal_Unicode const*,char**,char const*,sal_uInt32,sal_uInt32*); }
bool ImplIsZeroWidth(sal_Unicode){std::abort();} bool ImplIsControlOrFormat(sal_Unicode){std::abort();} bool ImplIsPrivateUse(sal_Unicode){std::abort();}
inline sal_Unicode ImplGetUndefinedUnicodeChar(unsigned char c,sal_uInt32 flags){return (flags & RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MASK)==RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_MAPTOPRIVATE ? RTL_TEXTCVT_BYTE_PRIVATE_START+c : RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER;}
${macros}
extern sal_uInt16 const aImplDoubleByteIdentifierTab[1];
${definitions.map((d) => `extern ${d.type} const ${d.name}${d.array ? "[]" : ""};`).join("\n")}
sal_uInt16 const aImplDoubleByteIdentifierTab[1]={0};
${definitions.map((d) => d.text).join("\n")}
${undefinedOwner}
${converters}
static std::uint32_t mix(std::uint32_t hash,std::uint32_t value){for(int i=0;i<4;++i){hash^=(value>>(8*i))&255;hash*=16777619u;}return hash;}
static bool unsafeEntry(ImplUniToDBCSHighTab const& entry,unsigned low){
  if(low<entry.mnLowStart || low>entry.mnLowEnd)return false;
  if(!entry.mpToUniTrailTab)return true;
  static const std::map<sal_uInt16 const*,std::size_t> spans={
    {aImplDoubleByteIdentifierTab,1},
    ${definitions
      .filter((d) => d.type === "sal_uInt16" && d.array)
      .map((d) => `{${d.name},SAL_N_ELEMENTS(${d.name})}`)
      .join(",\n")}
  };
  auto found=spans.find(entry.mpToUniTrailTab);if(found==spans.end())std::abort();
  return low-entry.mnLowStart>=found->second;
}
static bool unsafeDbcs(ImplDBCSConvertData const* data,unsigned unit){return unsafeEntry(data->mpToDBCSHighTab[unit>>8],unit&255);}
static bool unsafeEuc(unsigned unit){
  if(unit<=127 || (unit>=0xFF61 && unit<=0xFF9F))return false;
  auto const& first=aImplEUCJPCvtData.mpUniToJIS0208HighTab[unit>>8];unsigned low=unit&255;
  if(unsafeEntry(first,low))return true;
  unsigned converted=low>=first.mnLowStart && low<=first.mnLowEnd?first.mpToUniTrailTab[low-first.mnLowStart]:0;
  return !converted && unsafeEntry(aImplEUCJPCvtData.mpUniToJIS0212HighTab[unit>>8],low);
}
int main(int argc,char**argv){
  struct Binding {int encoding; ImplDBCSConvertData const* data;};
  Binding bindings[]={${bindings.map(([id, name]) => `{${id},&${name}}`).join(",")}};
  if(argc>1){int encoding=std::atoi(argv[1]);void const* data=nullptr;for(auto const& b:bindings)if(b.encoding==encoding)data=b.data;if(encoding==69)data=&aImplEUCJPCvtData;if(!data)return 2;for(unsigned c=0;c<65536;++c){if(encoding==69?unsafeEuc(c):unsafeDbcs(static_cast<ImplDBCSConvertData const*>(data),c)){std::cout<<c<<",-1,0,0\n";continue;}sal_Unicode input=sal_Unicode(c);char out[16]{};sal_uInt32 info=0;sal_Size used=0;auto n=encoding==69?ImplUnicodeToEUCJP(data,nullptr,&input,1,out,4,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,&info,&used):ImplUnicodeToDBCS(data,nullptr,&input,1,out,4,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,&info,&used);std::cout<<c<<','<<n<<','<<info<<','<<used;for(sal_Size i=0;i<n;++i)std::cout<<','<<unsigned(static_cast<unsigned char>(out[i]));std::cout<<'\n';}return 0;}
  std::cout << "{\"plainCharSigned\":" << (char(-1)<0 ? "true" : "false") << ",\"digests\":[";
  bool comma=false;
  for(auto const& binding:bindings){std::vector<unsigned> undefined;std::uint32_t hash=2166136261u;for(unsigned c=0;c<65536;++c){if(unsafeDbcs(binding.data,c)){undefined.push_back(c);continue;}sal_Unicode input=sal_Unicode(c);char out[16]{};sal_uInt32 info=0;sal_Size consumed=0;auto n=ImplUnicodeToDBCS(binding.data,nullptr,&input,1,out,4,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,&info,&consumed);hash=mix(hash,c);hash=mix(hash,n);hash=mix(hash,info);hash=mix(hash,consumed);for(sal_Size i=0;i<n;++i)hash=mix(hash,static_cast<unsigned char>(out[i]));}if(comma)std::cout<<',';comma=true;std::cout<<"{\"encoding\":"<<binding.encoding<<",\"hash\":"<<hash<<",\"undefinedUnits\":[";for(std::size_t i=0;i<undefined.size();++i){if(i)std::cout<<',';std::cout<<undefined[i];}std::cout<<"]}";}
  std::vector<unsigned> eucUndefined;std::uint32_t hash=2166136261u;for(unsigned c=0;c<65536;++c){if(unsafeEuc(c)){eucUndefined.push_back(c);continue;}sal_Unicode input=sal_Unicode(c);char out[16]{};sal_uInt32 info=0;sal_Size consumed=0;auto n=ImplUnicodeToEUCJP(&aImplEUCJPCvtData,nullptr,&input,1,out,4,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,&info,&consumed);hash=mix(hash,c);hash=mix(hash,n);hash=mix(hash,info);hash=mix(hash,consumed);for(sal_Size i=0;i<n;++i)hash=mix(hash,static_cast<unsigned char>(out[i]));}
  std::cout<<"],\"eucjpHash\":"<<hash<<",\"eucjpUndefinedUnits\":[";for(std::size_t i=0;i<eucUndefined.size();++i){if(i)std::cout<<',';std::cout<<eucUndefined[i];}std::cout<<"],\"privateBytes\":[";
  sal_Unicode privateInput[]={0xF100,0xF17F,0xF180,0xF1FF}; char out[16]{};sal_uInt32 info=0;sal_Size consumed=0;auto n=ImplUnicodeToDBCS(&aImplMS932DBCSCvtData,nullptr,privateInput,4,out,16,RTL_UNICODETOTEXT_FLAGS_PRIVATE_MAPTO0,&info,&consumed);for(sal_Size i=0;i<n;++i){if(i)std::cout<<',';std::cout<<unsigned(static_cast<unsigned char>(out[i]));}std::map<std::string,int> divergences; int checked=0;
  for(auto const& binding:bindings){auto const& data=*binding.data;for(int lead=0;lead<256;++lead){auto const& entry=data.mpToUniLeadTab[lead];bool single=!entry.mpToUniTrailTab || lead<data.mnLeadStart || lead>data.mnLeadEnd;int first=single?0:entry.mnTrailStart,last=single?0:entry.mnTrailEnd;for(int trail=first;trail<=last;++trail){char bytes[2]={char(lead),char(trail)};sal_Unicode text[2]{};sal_uInt32 status=0;sal_Size used=0;auto count=ImplDBCSToUnicode(&data,nullptr,bytes,single?1:2,text,2,RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_ERROR|RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_ERROR|RTL_TEXTTOUNICODE_FLAGS_INVALID_ERROR,&status,&used);if(status || count!=1)continue;if(unsafeDbcs(&data,text[0])){++divergences[std::to_string(binding.encoding)+":undefined-read"];++checked;continue;}char output[8]{};sal_uInt32 info=0;auto written=ImplUnicodeToDBCS(&data,nullptr,text,1,output,4,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR,&info,&used);sal_Unicode restored[2]{};sal_uInt32 decodedInfo=0;auto length=ImplDBCSToUnicode(&data,nullptr,output,written,restored,2,0,&decodedInfo,&used);if(info || decodedInfo || length!=1 || restored[0]!=text[0])++divergences[std::to_string(binding.encoding)+(info?":unmappable":":alias")];++checked;}}}
  std::cout<<"],\"roundTrip\":{\"checked\":"<<checked<<",\"divergences\":{";comma=false;for(auto const& item:divergences){if(comma)std::cout<<',';comma=true;std::cout<<'"'<<item.first<<"\":"<<item.second;}std::cout<<"}}}\n";
}
`;
writeFileSync(target + "/probe.cxx", driver);
execFileSync(
  "clang++",
  ["-std=c++17", "-O2", "-fsigned-char", target + "/probe.cxx", "-o", target + "/probe"],
  { stdio: "inherit" },
);
const result = JSON.parse(execFileSync(target + "/probe", { encoding: "utf8" }));
const fixture = {
  baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
  driverHash: createHash("sha256").update(driver).digest("hex"),
  scope:
    "Unchanged original DBCS/EUC-JP reverse bodies and native table initializers; Every BMP unit is audited under UNDEFINED_ERROR; original out-of-bounds table reads are classified and excluded from byte digests, never executed. Defined cases and private-byte profile are compiled observations. Signed plain char is explicit. Native ignore-classification calls trap and are outside this witness. This is not a full SAL or LibreOffice service certificate.",
  sources,
  ...result,
};
writeFileSync(
  "apps/office/src/sal/textenc/tcvtmb.encode.native.json",
  JSON.stringify(fixture, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    descriptors: result.digests.length,
    bmpUnitsPerDescriptor: 65536,
    eucjpHash: result.eucjpHash,
    plainCharSigned: result.plainCharSigned,
    privateBytes: result.privateBytes,
  }),
);
