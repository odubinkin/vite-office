/** @fileoverview Compiles unchanged pinned getMapName/helper/table bodies over explicit UTF16 string storage carriers. */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { definition } from "./rtl-string-convert-native-probe.mjs";
const root = "vendor/libreoffice-reference/",
  output = "output/playwright/font-map-name-native";
const paths = [
  "unotools/source/config/fontcfg.cxx",
  "include/unotools/fontcfg.hxx",
  "include/tools/fontenum.hxx",
];
const blobs = Object.fromEntries(
  paths.map(
    /** Applies map to path. @param path - path value. @returns Callback result. */ (path) => [
      path,
      readFileSync(root + path, "utf8"),
    ],
  ),
);
const text = blobs[paths[0]],
  header = blobs[paths[1]],
  enums = blobs[paths[2]];
const fontEnums = ["enum FontWeight", "enum FontWidth"]
  .map(
    /** Applies map to marker. @param marker - marker value. @returns Callback result. */ (
      marker,
    ) => definition(enums, marker) + ";",
  )
  .join("\n");
const attrs = definition(header, "enum class ImplFontAttrs") + ";";
const tables = text.slice(
  text.indexOf("const char* const aImplKillLeadingList[]"),
  text.indexOf("static bool ImplKillLeading("),
);
const functions = [
  "static bool ImplKillLeading(",
  "static sal_Int32 ImplIsTrailing(",
  "static bool ImplKillTrailing(",
  "static bool ImplKillTrailingWithExceptions(",
  "static bool ImplFindAndErase(",
  "void FontSubstConfiguration::getMapName(",
]
  .map(
    /** Applies map to marker. @param marker - marker value. @returns Callback result. */ (
      marker,
    ) => definition(text, marker),
  )
  .join("\n");
const data = JSON.parse(
  readFileSync("apps/office/src/unotools/source/config/data/font-name-map.json", "utf8"),
);
const records = JSON.parse(
  readFileSync("apps/office/src/unotools/source/config/data/font-substitutions.json", "utf8"),
);
const names = [
  ...new Set([
    "",
    "ce",
    "monospace",
    "oldface",
    "caps",
    "ps",
    "백묵",
    "백묵 gothic123",
    "백묵serif",
    "microsoft😀serif123ms",
    String.fromCharCode(0xbc31, 0xbc35) + " serif123",
    "microsoftadobeserif123ms",
    "msarialsemilightcondensed12",
    ...Object.keys(records.en),
    ...data.type.map(
      /** Applies map to [word]. @param value0 - word value. @returns Callback result. */ ([
        word,
      ]) => `adobe${word}semilightcondensed123ms`,
    ),
    ...data.weight.map(
      /** Applies map to [word]. @param value0 - word value. @returns Callback result. */ ([
        word,
      ]) => `${word}boldnarrow456`,
    ),
    ...data.width.map(
      /** Applies map to [word]. @param value0 - word value. @returns Callback result. */ ([
        word,
      ]) => `sun${word}serif789ps`,
    ),
    ...data.trailing
      .filter(Boolean)
      .map(
        /** Applies map to word. @param word - word value. @returns Callback result. */ (word) =>
          `abcfamily123${word}`,
      ),
  ]),
];
const source = String.raw`
#include <cstdint>
#include <cstring>
#include <iostream>
#include <string>
#include <string_view>
#include <vector>
using sal_Int32=std::int32_t;using sal_uInt32=std::uint32_t;using sal_Unicode=char16_t;
#define SAL_MAX_ENUM 2147483647
${fontEnums}
${attrs}
inline ImplFontAttrs operator|(ImplFontAttrs a,ImplFontAttrs b){return ImplFontAttrs(sal_uInt32(a)|sal_uInt32(b));}inline ImplFontAttrs& operator|=(ImplFontAttrs& a,ImplFontAttrs b){return a=a|b;}
// These carriers provide only the UTF16 copy/view/search/remove operations consumed by the unchanged function. They are not a substitute SAL string implementation or ownership witness.
struct OUString{std::u16string value;OUString()=default;OUString(std::u16string s):value(s){} const char16_t* getStr()const{return value.c_str();}sal_Int32 getLength()const{return value.size();}operator std::u16string_view()const{return value;}OUString copy(sal_Int32 a,sal_Int32 n=2147483647)const{return value.substr(a,n);}sal_Int32 indexOfAsciiL(const char* p,sal_Int32 n)const{std::u16string needle;for(int i=0;i<n;++i)needle.push_back(p[i]);auto pos=value.find(needle);return pos==value.npos?-1:pos;}};
struct OUStringBuffer{std::u16string value;OUStringBuffer(OUString const& s):value(s.value){}sal_Int32 getLength()const{return value.size();}char16_t operator[](int i)const{return value[i];}void remove(int p,int n){value.erase(p,n);}OUString makeStringAndClear(){auto result=OUString(value);value.clear();return result;}};
namespace utl {class FontSubstConfiguration{public:static void getMapName(OUString const&,OUString&,OUString&,FontWeight&,FontWidth&,ImplFontAttrs&);};
${tables}
${functions}}
static void units(OUString const& value){std::cout<<'[';for(unsigned i=0;i<value.value.size();++i){if(i)std::cout<<',';std::cout<<unsigned(value.value[i]);}std::cout<<']';}
int main(){std::vector<std::u16string> names={${names.map(/** Applies map to name. @param name - name value. @returns Callback result. */ (name) => `{${Array.from({ length: name.length }, /** Applies from to _, i. @param _ - _ value. @param i - i value. @returns Callback result. */ (_, i) => `char16_t(${name.charCodeAt(i)})`).join(",")}}`).join(",")}};bool comma=false;std::cout<<"[";for(unsigned index=0;index<names.size();++index)for(int weight:{0,5,8})for(int width:{0,5,7}){OUString shortName,familyName;FontWeight w=FontWeight(weight);FontWidth d=FontWidth(width);ImplFontAttrs type=ImplFontAttrs::OtherStyle;utl::FontSubstConfiguration::getMapName(OUString(names[index]),shortName,familyName,w,d,type);if(comma)std::cout<<',';comma=true;std::cout<<"{\"name\":"<<index<<",\"weight\":"<<weight<<",\"width\":"<<width<<",\"shortName\":";units(shortName);std::cout<<",\"familyName\":";units(familyName);std::cout<<",\"resultWeight\":"<<int(w)<<",\"resultWidth\":"<<int(d)<<",\"type\":"<<sal_uInt32(type)<<'}';}std::cout<<"]\n";}
`;
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/probe.cxx`, source);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    `${output}/probe.cxx`,
    "-o",
    `${output}/probe`,
  ],
  { stdio: "inherit" },
);
const cases = JSON.parse(
  execFileSync(`${output}/probe`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
);
writeFileSync(
  "apps/office/src/unotools/source/config/font-map-name.native.json",
  JSON.stringify(
    {
      baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
      scope:
        "Unchanged original getMapName, complete ordered tables and helper bodies; original width/weight/type enum declarations. Explicit std::u16string carriers supply consumed SAL string/view/buffer operations. ASan/UBSan. This verifies the name algorithm, not SAL storage/ownership, configuration-provider services, full AskConfig or VCL ABI.",
      sources: Object.fromEntries(
        Object.entries(blobs).map(
          /** Applies map to [path, value]. @param value0 - path, value value. @returns Callback result. */ ([
            path,
            value,
          ]) => [path, createHash("sha256").update(value).digest("hex")],
        ),
      ),
      driverHash: createHash("sha256").update(source).digest("hex"),
      names,
      cases,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ names: names.length, cases: cases.length, sanitized: true }));
