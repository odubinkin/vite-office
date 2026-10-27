/** @fileoverview Captures original ISO-2022-JP/KR reverse conversion and original helper dependencies with sanitizers. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const root = "vendor/libreoffice-reference/",
  target = "output/playwright/sal-iso2022-native";
const sources = {};
/** Reads and fingerprints original source. @param path - Upstream path. @returns Original source. */
function source(path) {
  const text = readFileSync(root + path, "utf8");
  sources[path] = createHash("sha256").update(text).digest("hex");
  return text;
}
/** Removes only external include directives from unchanged owner bodies. @param text - Source. @returns Adapted translation unit. */
function includes(text) {
  return text.replace(/^#include.*$/gm, "");
}
const flags = [
  ...source("include/rtl/textcvt.h").matchAll(
    /^#define\s+(RTL_(?:TEXTTOUNICODE|UNICODETOTEXT)_[A-Z0-9_]+)\s+([^\n\\]+)$/gm,
  ),
]
  .map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) =>
      `#define ${m[1]} ${m[2]}`,
  )
  .join("\n");
const character = source("include/rtl/character.hxx");
const characterConstants = [
  ...character.matchAll(/^sal_uInt32 const surrogates\w+ = 0x[\dA-F]+;$/gm),
]
  .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
  .join("\n");
const characterFunctions = [
  "isUnicodeCodePoint",
  "isSurrogate",
  "isHighSurrogate",
  "isLowSurrogate",
  "combineSurrogates",
  "isUnicodeScalarValue",
]
  .map(
    /** Applies map to name. @param name - name value. @returns Callback result. */ (name) => {
      const m = character.match(new RegExp(`inline SAL_CONSTEXPR [^\\n]+ ${name}\\([^}]+?\\}`));
      if (!m) throw new Error(`Missing original character helper ${name}`);
      return m[0];
    },
  )
  .join("\n");
const types = source("include/sal/types.h");
const cast = types.match(
  /template< typename T1, typename T2 > inline T1 static_int_cast\(T2 n\) \{[^}]+\}/,
)?.[0];
const safeint = source("include/o3tl/safeint.hxx");
const unsigned = safeint.match(
  /template <std::signed_integral T> constexpr std::make_unsigned_t<T> make_unsigned\(T value\)\s*\{[^}]+\}/,
)?.[0];
if (!cast || !unsigned) throw new Error("Missing original integer adapters.");
const declarations = includes(source("sal/textenc/converter.hxx"));
const unichars = includes(source("sal/textenc/unichars.cxx"));
const converters = includes(source("sal/textenc/converter.cxx"));
const header = source("sal/textenc/tenchelp.hxx");
const structs = header.slice(
  header.indexOf("struct ImplDBCSEUDCData"),
  header.indexOf("/* - TextConverter - HelpFunctions"),
);
const definitions = [];
let macros = "";
for (const file of readdirSync(root + "sal/textenc")
  .filter(
    /** Applies filter to name. @param name - name value. @returns Callback result. */ (name) =>
      /^tcvt(?:jp|kr)[1-6]\.tab$/.test(name),
  )
  .sort()) {
  const text = source("sal/textenc/" + file);
  macros +=
    [...text.matchAll(/^#define\s+DBCS_EUDC_\w+\s+[^\n]+$/gm)]
      .map(/** Applies map to m. @param m - m value. @returns Callback result. */ (m) => m[0])
      .join("\n") + "\n";
  for (const m of text.matchAll(
    /^(sal_uInt16|ImplDBCSEUDCData|ImplDBCSToUniLeadTab|ImplUniToDBCSHighTab|ImplDBCSConvertData|ImplEUCJPConvertData)\s+const\s+(\w+)(\[[^\]]*\])?\s*=\s*\{[\s\S]*?\};/gm,
  ))
    definitions.push({ type: m[1], name: m[2], array: !!m[3], text: m[0] });
}
const dummy = source("sal/textenc/tables.cxx").match(
  /sal_uInt16 const aImplDoubleByteIdentifierTab\[1\] = \{ 0 \};/,
)?.[0];
if (!dummy) throw new Error("Missing original identifier table.");
let owners = "",
  aggregates = "";
for (const codec of ["jp", "kr"]) {
  owners +=
    includes(source(`sal/textenc/convertiso2022${codec}.hxx`)) +
    includes(source(`sal/textenc/convertiso2022${codec}.cxx`));
  const aggregate = source(`sal/textenc/convertiso2022${codec}.tab`).match(
    /ImplIso2022\w+ConverterData const \w+[\s\S]*?\};/,
  )?.[0];
  if (!aggregate) throw new Error("Missing original ISO aggregate.");
  aggregates += aggregate + "\n";
}
const inputs = [
  [],
  [0x41, 0x65e5, 0x672c, 0x41],
  [0x41, 0xac00, 0xd55c, 0x41],
  [0xa5, 0xaf, 0x1b, 0xa],
  [0xd800],
  [0xd800, 0xdc00],
  [0xd800, 0x41],
  [0xdc00],
  [0xe9, 0x200b, 0xf100, 0xffff],
  [0xe, 0xf, 0x1b, 0xd, 0xa],
];
const capacities = [0, 1, 2, 3, 4, 5, 8, 12];
const seeds = [
  [0, 0],
  [0, 1],
  [0, 2],
  [0xd800, 0],
  [-1, -1],
];
const driver = String.raw`
#include <cstdint>
#include <cstddef>
#include <iostream>
#include <vector>
#include <map>
#include <iterator>
#include <type_traits>
#include <concepts>
#include <cassert>
using sal_uInt8=std::uint8_t;using sal_uInt16=std::uint16_t;using sal_uInt32=std::uint32_t;using sal_Unicode=char16_t;using sal_Size=std::size_t;
#define SAL_CONSTEXPR constexpr
#define SAL_DLLPUBLIC
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
#define RTL_TEXTCVT_BYTE_PRIVATE_START 0xF100
#define RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER 0xFFFD
${flags}
namespace sal {${cast}}
namespace o3tl {${unsigned}}
namespace rtl {namespace detail {${characterConstants}} ${characterFunctions}}
${declarations}
${unichars}
${converters}
${structs}
${macros}
extern sal_uInt16 const aImplDoubleByteIdentifierTab[1];
${definitions.map(/** Applies map to d. @param d - d value. @returns Callback result. */ (d) => `extern ${d.type} const ${d.name}${d.array ? "[]" : ""};`).join("\n")}
${dummy}
${definitions.map(/** Applies map to d. @param d - d value. @returns Callback result. */ (d) => d.text).join("\n")}
${owners}
${aggregates}
static std::uint32_t mix(std::uint32_t hash,std::uint32_t value){for(int i=0;i<4;++i){hash^=(value>>(8*i))&255;hash*=16777619u;}return hash;}
static bool unsafe(int codec,unsigned unit){if(unit<128)return false;auto const& e=(codec==0?aJIS0208DBCSHighTab:aKSC5601DBCSHighTab)[unit>>8];unsigned low=unit&255;if(low<e.mnLowStart || low>e.mnLowEnd)return false;
static const std::map<sal_uInt16 const*,std::size_t> spans={{aImplDoubleByteIdentifierTab,1},${definitions
  .filter(
    /** Applies filter to d. @param d - d value. @returns Callback result. */ (d) =>
      d.type === "sal_uInt16" && d.array,
  )
  .map(
    /** Applies map to d. @param d - d value. @returns Callback result. */ (d) =>
      `{${d.name},SAL_N_ELEMENTS(${d.name})}`,
  )
  .join(
    ",",
  )}};auto found=spans.find(e.mpToUniTrailTab);if(found==spans.end())std::abort();return low-e.mnLowStart>=found->second;}
struct Result {sal_Size n,consumed;sal_uInt32 info;int high,state;std::vector<unsigned> bytes;};
static Result convert(int codec,std::vector<sal_Unicode> const& input,unsigned capacity,unsigned flags,int high=0,int state=0){char out[512]{};Result r{};ImplUnicodeToIso2022JpContext jp{sal_Unicode(high),bool(state)};ImplUnicodeToIso2022KrContext kr{sal_Unicode(high),ImplUnicodeToIso2022KrSet(state)};void* context=high<0?nullptr:codec==0?static_cast<void*>(&jp):static_cast<void*>(&kr);r.n=codec==0?ImplConvertUnicodeToIso2022Jp(&aImplIso2022JpConvertData,context,input.data(),input.size(),out,capacity,flags,&r.info,&r.consumed):ImplConvertUnicodeToIso2022Kr(&aImplIso2022KrConvertData,context,input.data(),input.size(),out,capacity,flags,&r.info,&r.consumed);r.high=high<0?-1:codec==0?jp.m_nHighSurrogate:kr.m_nHighSurrogate;r.state=high<0?-1:codec==0?jp.m_b0208:kr.m_eSet;for(sal_Size i=0;i<r.n;++i)r.bytes.push_back(static_cast<unsigned char>(out[i]));return r;}
int main(){std::cout<<"{\"undefinedUnits\":[";for(int codec=0;codec<2;++codec){if(codec)std::cout<<',';std::cout<<'[';bool comma=false;for(unsigned unit=0;unit<65536;++unit)if(unsafe(codec,unit)){if(comma)std::cout<<',';comma=true;std::cout<<unit;}std::cout<<']';}
std::cout<<"],\"digests\":[";bool comma=false;for(int codec=0;codec<2;++codec)for(unsigned flags:{0u,RTL_UNICODETOTEXT_FLAGS_FLUSH,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR|RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_IGNORE|RTL_UNICODETOTEXT_FLAGS_INVALID_IGNORE})for(unsigned capacity:{${capacities.map(/** Applies map to c. @param c - c value. @returns Callback result. */ (c) => `${c}u`).join(",")}}){std::uint32_t hash=2166136261u;for(unsigned unit=0;unit<65536;++unit){if(unsafe(codec,unit))continue;auto r=convert(codec,{sal_Unicode(unit)},capacity,flags);for(unsigned value:{unit,unsigned(r.n),r.info,unsigned(r.consumed),unsigned(r.high),unsigned(r.state)})hash=mix(hash,value);for(unsigned b:r.bytes)hash=mix(hash,b);}if(comma)std::cout<<',';comma=true;std::cout<<"{\"codec\":"<<codec<<",\"capacity\":"<<capacity<<",\"flags\":"<<flags<<",\"hash\":"<<hash<<"}";}
std::vector<std::vector<sal_Unicode>> inputs={${inputs.map(/** Applies map to a. @param a - a value. @returns Callback result. */ (a) => `{${a.join(",")}}`).join(",")}};int seeds[][2]={${seeds.map(/** Applies map to a. @param a - a value. @returns Callback result. */ (a) => `{${a.join(",")}}`).join(",")}};
std::cout<<"],\"cases\":[";comma=false;for(int codec=0;codec<2;++codec)for(unsigned index=0;index<inputs.size();++index)for(unsigned seed=0;seed<5;++seed){if(codec==0 && seed==2)continue;for(unsigned capacity:{0u,1u,3u,4u,5u,8u,64u})for(unsigned flags:{0u,RTL_UNICODETOTEXT_FLAGS_FLUSH,RTL_UNICODETOTEXT_FLAGS_UNDEFINED_ERROR|RTL_UNICODETOTEXT_FLAGS_INVALID_ERROR}){auto r=convert(codec,inputs[index],capacity,flags,seeds[seed][0],seeds[seed][1]);if(comma)std::cout<<',';comma=true;std::cout<<"{\"codec\":"<<codec<<",\"input\":"<<index<<",\"seed\":"<<seed<<",\"capacity\":"<<capacity<<",\"flags\":"<<flags<<",\"written\":"<<r.n<<",\"info\":"<<r.info<<",\"consumed\":"<<r.consumed<<",\"context\":["<<r.high<<','<<r.state<<"],\"bytes\":[";for(unsigned i=0;i<r.bytes.size();++i){if(i)std::cout<<',';std::cout<<r.bytes[i];}std::cout<<"]}";}}std::cout<<"]}\n";}
`;
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/probe.cxx`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    `${target}/probe.cxx`,
    "-o",
    `${target}/probe`,
  ],
  { stdio: "inherit" },
);
const result = JSON.parse(
  execFileSync(`${target}/probe`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
);
writeFileSync(
  "apps/office/src/sal/textenc/convertiso2022.encode.native.json",
  `${JSON.stringify({ baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65", driverHash: createHash("sha256").update(driver).digest("hex"), scope: "Unchanged original ISO2022-JP/KR conversion owners and aggregates, source JIS/KS arrays and real shared helper/classification bodies. Original character/integer helpers, primitive SAL types. ASan/UBSan enabled. Out-of-array source lookups classified and not executed. Reverse call outputs only, not full SAL or Writer service parity.", sources, inputs, seeds, ...result }, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    digests: result.digests.length,
    undefinedUnits: result.undefinedUnits.map(
      /** Applies map to a. @param a - a value. @returns Callback result. */ (a) => a.length,
    ),
    vectors: result.cases.length,
    sanitized: true,
  }),
);
