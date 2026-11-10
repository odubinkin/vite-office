/** @fileoverview Compiles pinned Big5, GB18030 and ISO-2022-CN conversion with native data and sanitizers. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";

const root = "vendor/libreoffice-reference/",
  target = "output/playwright/sal-cjk-native";
const sources = {};
/** Reads and fingerprints original source. @param path - Upstream path. @returns Original source. */
function source(path) {
  const text = readFileSync(root + path, "utf8");
  sources[path] = createHash("sha256").update(text).digest("hex");
  return text;
}
/** Removes only external include directives from unchanged owner bodies. @param text - Source. @returns Adapted translation unit. */
function includes(text) {
  return text.replace(/^#(?:include|pragma once).*$/gm, "");
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
  "getHighSurrogate",
  "getLowSurrogate",
  "splitSurrogates",
  "isUnicodeScalarValue",
]
  .map(
    /** Applies map to name. @param name - name value. @returns Callback result. */ (name) => {
      const m = character.match(new RegExp(`inline SAL_CONSTEXPR [^\\n]+ ${name}\\([^]*?\\n\\}`));
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
const getUndefinedUnicodeChar = header.match(
  /inline sal_Unicode ImplGetUndefinedUnicodeChar\([^]*?\n}/,
)?.[0];
if (!getUndefinedUnicodeChar) throw new Error("Missing original DBCS undefined-character helper.");
const structs = header.slice(
  header.indexOf("struct ImplDBCSEUDCData"),
  header.indexOf("/* - TextConverter - HelpFunctions"),
);
const definitions = [];
let macros = "";
for (const file of readdirSync(root + "sal/textenc")
  .filter(
    /** Applies filter to name. @param name - name value. @returns Callback result. */ (name) =>
      /^tcvt(?:scn|tcn)[1-6]\.tab$/.test(name),
  )
  .sort()) {
  const text = source("sal/textenc/" + file);
  macros +=
    [...text.matchAll(/^#define\s+(?:DBCS_EUDC_\w+|GBKOFF)\s+[^\n]+$/gm)]
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
const owners = ["context", "convertgb18030", "convertiso2022cn"]
  .map(
    /** Loads an unchanged contextual owner. @param name - Source basename. @returns Declarations and implementation. */ (
      name,
    ) => includes(source(`sal/textenc/${name}.hxx`)) + includes(source(`sal/textenc/${name}.cxx`)),
  )
  .join("\n");
const aggregates = [
  ["convertgb18030", "gb180302000", "Gb18030"],
  ["convertiso2022cn", "cns116431992", "Iso2022Cn"],
]
  .map(
    /** Extracts the original generated arrays and their descriptor. @param value - Source basenames and descriptor name. @returns Native declarations. */ ([
      owner,
      table,
      name,
    ]) => {
      const aggregate = source(`sal/textenc/${owner}.tab`).match(
        new RegExp(`Impl${name}ConverterData const \\w+[\\s\\S]*?\\};`),
      )?.[0];
      if (!aggregate) throw new Error(`Missing original descriptor ${name}.`);
      return includes(source(`sal/textenc/generate/${table}.tab`)) + "\n" + aggregate;
    },
  )
  .join("\n");
const multibyte = includes(source("sal/textenc/tcvtmb.cxx"));
const undefinedHeader = includes(source("sal/textenc/handleundefinedunicodetotextchar.hxx"));
const undefinedOwner = includes(source("sal/textenc/handleundefinedunicodetotextchar.cxx"));
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
using sal_uInt8=std::uint8_t; using sal_uInt16=std::uint16_t; using sal_uInt32=std::uint32_t;
using sal_Int32=std::int32_t; using sal_Unicode=char16_t; using sal_Size=std::size_t;
#define SAL_CONSTEXPR constexpr
#define SAL_DLLPUBLIC
#define SAL_UNUSED_PARAMETER
#define SAL_N_ELEMENTS(a) (sizeof(a)/sizeof((a)[0]))
#define RTL_TEXTCVT_BYTE_PRIVATE_START 0xF100
#define RTL_TEXTCVT_BYTE_PRIVATE_END 0xF1FF
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
${definitions.map(/** Declares a source array or descriptor. @param d - Native definition. @returns Forward declaration. */ (d) => `extern ${d.type} const ${d.name}${d.array ? "[]" : ""};`).join("\n")}
${dummy}
${definitions.map(/** Emits the original definition. @param d - Native definition. @returns Source. */ (d) => d.text).join("\n")}
${getUndefinedUnicodeChar}
${undefinedHeader}
${undefinedOwner}
${multibyte}
${owners}
${aggregates}

static std::uint32_t hash;
static void mix(std::uint32_t value) {
    for (int i=0; i<4; ++i) {
        hash ^= (value >> (8*i)) & 255;
        hash *= 16777619u;
    }
}
using Decode = decltype(&ImplConvertGb18030ToUnicode);
using Encode = decltype(&ImplConvertUnicodeToGb18030);
static void decode(Decode fn, void const* data, std::initializer_list<unsigned> input) {
    char source[8]{};
    unsigned cursor=0;
    for (unsigned byte : input) source[cursor++] = char(byte);
    sal_Unicode output[16]{};
    sal_uInt32 info=0;
    sal_Size used=0;
    auto written=fn(data,nullptr,source,input.size(),output,16,
        RTL_TEXTTOUNICODE_FLAGS_FLUSH | RTL_TEXTTOUNICODE_FLAGS_UNDEFINED_DEFAULT
        | RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT | RTL_TEXTTOUNICODE_FLAGS_INVALID_DEFAULT,&info,&used);
    mix(written); mix(info); mix(used);
    for (sal_Size i=0; i<written; ++i) mix(output[i]);
}
static bool unsafeReverse(ImplUniToDBCSHighTab const* table, unsigned value) {
    if (!table || value>0xffff) return false;
    auto const& entry=table[value>>8];
    unsigned low=value&255;
    if (low<entry.mnLowStart || low>entry.mnLowEnd) return false;
    if (!entry.mpToUniTrailTab) return true;
    static const std::map<sal_uInt16 const*,std::size_t> spans={
        {aImplDoubleByteIdentifierTab,1},
        ${definitions
          .filter(
            /** Selects original scalar arrays. @param d - Native definition. @returns Whether this is a reverse table candidate. */ (
              d,
            ) => d.type === "sal_uInt16" && d.array,
          )
          .map(
            /** Captures actual span. @param d - Native definition. @returns Span initializer. */ (
              d,
            ) => `{${d.name},SAL_N_ELEMENTS(${d.name})}`,
          )
          .join(",\n")}
    };
    return low-entry.mnLowStart >= spans.at(entry.mpToUniTrailTab);
}
static void encode(Encode fn, void const* data, unsigned max, ImplUniToDBCSHighTab const* table=nullptr) {
    for (unsigned value=0; value<=max; ++value) {
        if (unsafeReverse(table,value)) { mix(value); continue; }
        sal_Unicode source[2]{};
        unsigned units=1;
        if (value<0x10000) source[0]=sal_Unicode(value);
        else units=rtl::splitSurrogates(value, source);
        char output[16]{};
        sal_uInt32 info=0;
        sal_Size used=0;
        auto written=fn(data,nullptr,source,units,output,16,
            RTL_UNICODETOTEXT_FLAGS_FLUSH | RTL_UNICODETOTEXT_FLAGS_UNDEFINED_DEFAULT
            | RTL_UNICODETOTEXT_FLAGS_INVALID_DEFAULT,&info,&used);
        mix(written); mix(info); mix(used);
        for (sal_Size i=0; i<written; ++i) mix(static_cast<unsigned char>(output[i]));
    }
}

static void printUnsafe(ImplUniToDBCSHighTab const* table) {
    bool comma=false;
    std::cout << '[';
    for(unsigned value=0;value<=0xffff;++value) if(unsafeReverse(table,value)) {
        if(comma) std::cout << ',';
        comma=true; std::cout << value;
    }
    std::cout << ']';
}

static void printStreamingCases() {
    // Seed the original opaque context's otherwise uninitialized field before its first read.
    auto* gb=static_cast<ImplGb18030ToUnicodeContext*>(ImplCreateGb18030ToUnicodeContext());
    gb->m_nCode=0;
    char input[]={char(0x90),0x30,char(0x81),0x30};
    sal_Unicode text[2]{};
    sal_uInt32 info=0;
    sal_Size used=0;
    constexpr auto flags=RTL_TEXTTOUNICODE_FLAGS_MBUNDEFINED_DEFAULT | RTL_TEXTTOUNICODE_FLAGS_FLUSH;
    auto n=ImplConvertGb18030ToUnicode(&aImplGb18030ConvertData,gb,input,4,text,1,flags,&info,&used);
    std::cout << ",\"gb18030Retry\":[" << n << ',' << info << ',' << used << ',' << gb->m_nCode;
    n=ImplConvertGb18030ToUnicode(&aImplGb18030ConvertData,gb,input+3,1,text,2,flags,&info,&used);
    std::cout << ',' << n << ',' << info << ',' << used << ',' << unsigned(text[0]) << ']';
    ImplDestroyGb18030ToUnicodeContext(gb);

    auto* cn=ImplCreateUnicodeToIso2022CnContext();
    sal_Unicode unit=0x4e2d;
    char bytes[9]{};
    n=ImplConvertUnicodeToIso2022Cn(&aImplIso2022CnConvertData,cn,&unit,1,bytes,8,
        RTL_UNICODETOTEXT_FLAGS_FLUSH,&info,&used);
    std::cout << ",\"iso2022cnRetry\":[" << n << ',' << info << ',' << used;
    for(sal_Size i=0;i<n;++i) std::cout << ',' << unsigned(bytes[i]);
    n=ImplConvertUnicodeToIso2022Cn(&aImplIso2022CnConvertData,cn,&unit,1,bytes,4,
        RTL_UNICODETOTEXT_FLAGS_FLUSH,&info,&used);
    std::cout << ',' << n << ',' << info << ',' << used;
    for(sal_Size i=0;i<n;++i) std::cout << ',' << unsigned(bytes[i]);
    std::cout << ']';
    ImplDestroyUnicodeToIso2022CnContext(cn);
}

int main() {
    hash=2166136261u;
    for (unsigned a=0; a<256; ++a) {
        decode(ImplDBCSToUnicode,&aImplBIG5DBCSCvtData,{a});
        for (unsigned b=0; b<256; ++b) decode(ImplDBCSToUnicode,&aImplBIG5DBCSCvtData,{a,b});
    }
    std::cout << "{\"big5Decode\":" << hash;
    hash=2166136261u;
    encode(ImplUnicodeToDBCS,&aImplBIG5DBCSCvtData,0xffff,aBIG5DBCSHighTab);
    std::cout << ",\"big5Encode\":" << hash << ",\"big5Unsafe\":";
    printUnsafe(aBIG5DBCSHighTab);

    hash=2166136261u;
    for (unsigned a=0; a<256; ++a) {
        decode(ImplConvertGb18030ToUnicode,&aImplGb18030ConvertData,{a});
        for (unsigned b=0; b<256; ++b) decode(ImplConvertGb18030ToUnicode,&aImplGb18030ConvertData,{a,b});
    }
    for (unsigned a=0x81; a<=0xfe; ++a) for (unsigned b=0x30; b<=0x39; ++b)
      for (unsigned c=0x81; c<=0xfe; ++c) for (unsigned d=0x30; d<=0x39; ++d)
        decode(ImplConvertGb18030ToUnicode,&aImplGb18030ConvertData,{a,b,c,d});
    std::cout << ",\"gb18030Decode\":" << hash;
    hash=2166136261u;
    encode(ImplConvertUnicodeToGb18030,&aImplGb18030ConvertData,0x10ffff);
    std::cout << ",\"gb18030Encode\":" << hash;

    hash=2166136261u;
    for (unsigned a=0; a<256; ++a) {
        decode(ImplConvertIso2022CnToUnicode,&aImplIso2022CnConvertData,{a});
        for (unsigned b=0; b<256; ++b) decode(ImplConvertIso2022CnToUnicode,&aImplIso2022CnConvertData,{a,b});
    }
    for (unsigned a=0x21; a<=0x7e; ++a) for (unsigned b=0x21; b<=0x7e; ++b) {
        decode(ImplConvertIso2022CnToUnicode,&aImplIso2022CnConvertData,{0x1b,0x24,0x29,0x41,0x0e,a,b,0x0f});
        decode(ImplConvertIso2022CnToUnicode,&aImplIso2022CnConvertData,{0x1b,0x24,0x29,0x47,0x0e,a,b,0x0f});
        decode(ImplConvertIso2022CnToUnicode,&aImplIso2022CnConvertData,{0x1b,0x24,0x2a,0x48,0x1b,0x4e,a,b});
    }
    std::cout << ",\"iso2022cnDecode\":" << hash;
    hash=2166136261u;
    encode(ImplConvertUnicodeToIso2022Cn,&aImplIso2022CnConvertData,0x10ffff,aGB2312DBCSHighTab);
    std::cout << ",\"iso2022cnEncode\":" << hash << ",\"iso2022cnUnsafe\":";
    printUnsafe(aGB2312DBCSHighTab);
    printStreamingCases();
    std::cout << "}\n";
}
`;
mkdirSync(target, { recursive: true });
writeFileSync(target + "/probe.cxx", driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsigned-char",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    target + "/probe.cxx",
    "-o",
    target + "/probe",
  ],
  { stdio: "inherit" },
);
const observed = JSON.parse(execFileSync(target + "/probe", { encoding: "utf8" }));
writeFileSync(
  "apps/office/src/sal/textenc/cjk.native.json",
  JSON.stringify(
    {
      baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
      driverHash: createHash("sha256").update(driver).digest("hex"),
      sources,
      ...observed,
    },
    null,
    2,
  ) + "\n",
);
