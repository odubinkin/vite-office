/** @fileoverview Compiles unchanged pinned StarSymbol reverse-map definitions with actual standard multimap ownership and an immutable UTF16-name carrier. */
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { definition } from "./rtl-string-convert-native-probe.mjs";
const path = "vendor/libreoffice-reference/unotools/source/misc/fontcvt.cxx";
const source = readFileSync(path, "utf8");
const tableNames = [
  "aAdobeSymbolTab",
  "aWingDingsTab",
  "aMonotypeSortsTab",
  "aWebDingsTab",
  "aWingDings2Tab",
  "aWingDings3Tab",
  "aMTExtraTab",
  "aWingDingsExtraTab",
  "aSymbolExtraTab2",
  "aSymbolExtraTab",
  "aTNRExtraTab",
  "aSymbolNames",
];
const tables = tableNames
  .map(
    /** Extracts an unchanged pinned table. @param name - Source table. @returns C++ definition. */ (
      name,
    ) => {
      const expression = new RegExp(
        `(?:const sal_Unicode|ExtraTable const|constexpr OUString) ${name}\\[[^\\]]*\\]\\s*=`,
      );
      const marker = expression.exec(source)?.[0];
      if (!marker) throw Error(`Missing pinned table ${name}`);
      return definition(source, marker) + ";";
    },
  )
  .join("\n");
const functions = [
  "StarSymbolToMSMultiFontImpl::StarSymbolToMSMultiFontImpl()",
  "static const OUString & SymbolFontToString(",
  "OUString StarSymbolToMSMultiFontImpl::ConvertChar(",
  "StarSymbolToMSMultiFont *CreateStarSymbolToMSMultiFont()",
]
  .map(
    /** Extracts an unchanged pinned function. @param marker - Source signature. @returns C++ definition. */ (
      marker,
    ) => definition(source, marker),
  )
  .join("\n");
const driver = String.raw`
#include <cstdint>
#include <map>
#include <memory>
#include <iostream>
#include <string_view>
using sal_Unicode=char16_t;using sal_uInt8=std::uint8_t;
// Only immutable ASCII family names are consumed by these definitions. This carrier is not a SAL allocation/ABI witness.
struct OUString {std::u16string_view value;constexpr OUString()=default;constexpr OUString(std::u16string_view v):value(v){} bool isEmpty()const{return value.empty();}};
constexpr OUString operator""_ustr(char16_t const* p,std::size_t n){return OUString(std::u16string_view(p,n));}
class StarSymbolToMSMultiFont {public:virtual ~StarSymbolToMSMultiFont()=default;virtual OUString ConvertChar(sal_Unicode&)=0;};
${definition(source, "enum SymbolFont")};
${definition(source, "struct SymbolEntry")};
${definition(source, "class StarSymbolToMSMultiFontImpl :")};
${definition(source, "struct ExtraTable")};
${tables}
${functions}
int main(){std::unique_ptr<StarSymbolToMSMultiFont> converter(CreateStarSymbolToMSMultiFont());bool comma=false;std::cout<<"[";for(unsigned i=0;i<65536;++i){sal_Unicode mapped=sal_Unicode(i);auto font=converter->ConvertChar(mapped);if(font.isEmpty()){if(mapped!=i)return 1;continue;}if(comma)std::cout<<',';comma=true;std::cout<<'['<<i<<','<<unsigned(mapped)<<",\"";for(auto c:font.value)std::cout<<char(c);std::cout<<"\"]";}std::cout<<"]\n";}
`;
const output = "output/playwright/star-symbol-export-native";
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/probe.cxx`, driver);
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
const hits = JSON.parse(execFileSync(`${output}/probe`, { encoding: "utf8" }));
writeFileSync(
  "apps/office/src/unotools/source/misc/star-symbol-export.native.json",
  JSON.stringify(
    {
      baselineCommit: "9bc445578031fecf56086729d8e4940c77e14d65",
      sourcePath: path,
      sourceHash: createHash("sha256").update(source).digest("hex"),
      driverHash: createHash("sha256").update(driver).digest("hex"),
      scope:
        "Unchanged original enum,entry/class definitions,seven224slot tables,four extra tables,eight names,constructor,ConvertChar,name helper and factory. Actual std::multimap and virtual ownership. Immutable UTF16 family-name carrier only; no full SAL/Writer/VCL ABI claim. Every65536 input unit tested; missing keys retain input. ASan/UBSan.",
      domain: 65536,
      hits,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify({ domain: 65536, hits: hits.length, sanitized: true }));
