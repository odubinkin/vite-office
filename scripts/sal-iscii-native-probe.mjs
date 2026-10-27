/** @fileoverview Captures original ISCII reverse conversion and original helper dependencies with sanitizers. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const root = "vendor/libreoffice-reference/",
  target = "output/playwright/sal-iscii-native";
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
const ranges = source("sal/textenc/convertsinglebytetobmpunicode.hxx").match(
  /struct BmpUnicodeToSingleByteRange \{[\s\S]*?\};/,
)?.[0];
if (!ranges) throw new Error("Missing original range structure.");
const declarations = includes(source("sal/textenc/converter.hxx"));
const unichars = includes(source("sal/textenc/unichars.cxx"));
const converters = includes(source("sal/textenc/converter.cxx"));
const iscii = includes(source("sal/textenc/convertisciidevangari.cxx"));
const inputs = [
  [],
  [0x41, 0x901, 0x950, 0x94d, 0x200c, 0x94d, 0x200d],
  [0xd800],
  [0xdc00],
  [0xd800, 0xdc00],
  [0xd800, 0x41],
  [0x94d, 0x200c, 0x200d],
  [0x950, 0x958, 0x95f, 0x964],
  [0xf100, 0x200b, 0x200c, 0xffff],
];
const originalFlags = new Map(
  [
    ...source("include/rtl/textcvt.h").matchAll(
      /^#define\s+(RTL_UNICODETOTEXT_FLAGS_\w+)\s+\(\(sal_uInt32\)(0x[\dA-Fa-f]+)\)/gm,
    ),
  ].map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) => [
      m[1].slice("RTL_UNICODETOTEXT_FLAGS_".length),
      Number(m[2]),
    ],
  ),
);
/** Resolves original named flags without guessing numeric values. @param names - Source flag suffixes. @returns Combined original flag value. */
function flag(...names) {
  return names.reduce(
    /** Applies reduce to value, name. @param value - value value. @param name - name value. @returns Callback result. */ (
      value,
      name,
    ) => {
      const next = originalFlags.get(name);
      if (next === undefined) throw new Error(`Missing flag ${name}`);
      return value | next;
    },
    0,
  );
}
const nativeFlags = [
  0,
  flag("FLUSH"),
  flag("UNDEFINED_ERROR", "INVALID_ERROR"),
  flag("UNDEFINED_ERROR", "INVALID_ERROR", "FLUSH"),
  flag("UNDEFINED_IGNORE", "INVALID_IGNORE"),
  flag("UNDEFINED_IGNORE", "INVALID_IGNORE", "FLUSH"),
  flag("CONTROL_IGNORE", "PRIVATE_IGNORE", "NONSPACING_IGNORE", "UNDEFINED_ERROR"),
  flag("PRIVATE_MAPTO0", "FLUSH"),
];
const seeds = [
  [0, 0],
  [0x94d, 0],
  [0, 0xd800],
];
const driver = String.raw`
#include <cstdint>
#include <cstddef>
#include <iostream>
#include <vector>
#include <type_traits>
#include <concepts>
#include <cassert>
using sal_uInt8=std::uint8_t;using sal_uInt32=std::uint32_t;using sal_Unicode=char16_t;using sal_Size=std::size_t;
#define SAL_CONSTEXPR constexpr
#define SAL_DLLPUBLIC
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
#define RTL_TEXTCVT_BYTE_PRIVATE_START 0xF100
#define RTL_TEXTENC_UNICODE_REPLACEMENT_CHARACTER 0xFFFD
${flags}
namespace sal {${cast}}
namespace o3tl {${unsigned}}
namespace rtl {namespace detail {${characterConstants}} ${characterFunctions}}
namespace rtl::textenc {${ranges}}
${declarations}
${unichars}
${converters}
${iscii}
static std::uint32_t mix(std::uint32_t hash,std::uint32_t value){for(int i=0;i<4;++i){hash^=(value>>(8*i))&255;hash*=16777619u;}return hash;}
int main(){std::cout<<"{\"digests\":[";bool comma=false;
for(unsigned flags: {${nativeFlags.map(/** Applies map to f. @param f - f value. @returns Callback result. */ (f) => `${f}u`).join(",")}})for(unsigned capacity=0;capacity<=3;++capacity){std::uint32_t hash=2166136261u;for(unsigned unit=0;unit<65536;++unit){sal_Unicode input=sal_Unicode(unit);char out[16]{};UnicodeToIsciiDevanagari context;sal_uInt32 info=99;sal_Size consumed=99;auto n=ImplConvertUnicodeToIsciiDevanagari(nullptr,&context,&input,1,out,capacity,flags,&info,&consumed);for(unsigned v:{unit,unsigned(n),info,unsigned(consumed),unsigned(context.m_cPrevChar),unsigned(context.m_cHighSurrogate)})hash=mix(hash,v);for(sal_Size i=0;i<n;++i)hash=mix(hash,static_cast<unsigned char>(out[i]));}if(comma)std::cout<<',';comma=true;std::cout<<"{\"flags\":"<<flags<<",\"capacity\":"<<capacity<<",\"hash\":"<<hash<<"}";}
std::vector<std::vector<sal_Unicode>> inputs={${inputs.map(/** Applies map to units. @param units - units value. @returns Callback result. */ (units) => `{${units.join(",")}}`).join(",")}};unsigned seeds[][2]={${seeds.map(/** Applies map to seed. @param seed - seed value. @returns Callback result. */ (seed) => `{${seed.join(",")}}`).join(",")}};
std::cout<<"],\"cases\":[";comma=false;
for(unsigned index=0;index<inputs.size();++index)for(unsigned seed=0;seed<3;++seed)for(unsigned capacity: {0u,1u,2u,3u,16u})for(unsigned flags: {${nativeFlags.map(/** Applies map to f. @param f - f value. @returns Callback result. */ (f) => `${f}u`).join(",")}}){auto const& input=inputs[index];char out[32]{};UnicodeToIsciiDevanagari context;context.m_cPrevChar=seeds[seed][0];context.m_cHighSurrogate=seeds[seed][1];sal_uInt32 info=99;sal_Size consumed=99;auto n=ImplConvertUnicodeToIsciiDevanagari(nullptr,&context,input.data(),input.size(),out,capacity,flags,&info,&consumed);if(comma)std::cout<<',';comma=true;std::cout<<"{\"input\":"<<index<<",\"seed\":"<<seed<<",\"capacity\":"<<capacity<<",\"flags\":"<<flags<<",\"written\":"<<n<<",\"info\":"<<info<<",\"consumed\":"<<consumed<<",\"context\":["<<unsigned(context.m_cPrevChar)<<','<<unsigned(context.m_cHighSurrogate)<<"],\"bytes\":[";for(sal_Size i=0;i<n;++i){if(i)std::cout<<',';std::cout<<unsigned(static_cast<unsigned char>(out[i]));}std::cout<<"]}";}std::cout<<"]}\n";}
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
const result = JSON.parse(execFileSync(`${target}/probe`, { encoding: "utf8" }));
writeFileSync(
  "apps/office/src/sal/textenc/convertisciidevangari.encode.native.json",
  `${JSON.stringify({ baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65", driverHash: createHash("sha256").update(driver).digest("hex"), scope: "Unchanged original ISCII converter, bad-input helpers, Unicode classification and extracted original character/integer/range owners. Primitive SAL bindings only. Reverse non-null contexts; no forward lookahead execution. ASan/UBSan enabled. Not a full SAL service certificate.", sources, inputs, seeds, ...result }, null, 2)}\n`,
);
console.log(
  JSON.stringify({
    bmpCases: result.digests.length * 65536,
    vectorCases: result.cases.length,
    sanitized: true,
  }),
);
