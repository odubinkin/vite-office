/** @fileoverview Compares original SvNumberNatNum metadata/maps and MsLangId language resolution with actual local owners. Native fixtures represent language tags, configured locale values and string values; full SAL lifetime and formatter constructor/output are outside this witness. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { scope, pin } from "./rtl-ustring-native-sources.mjs";
import { SvNumberNatNum } from "../apps/office/src/svl/source/numbers/zformat.natnum.ts";
import { getRealLanguage } from "../apps/office/src/i18nlangtag/source/isolang/mslangid.ts";
const root = "vendor/libreoffice-reference",
  target = "output/native/AQF9AG-icu-grego/natnum";
const paths = [
  "include/svl/zformat.hxx",
  "svl/source/numbers/zformat.cxx",
  "include/i18nlangtag/lang.h",
  "i18nlangtag/source/isolang/mslangid.cxx",
];
const sources = paths.map(
  /** Reads and verifies exact pinned bytes. @param path - Upstream path. @returns Verified source. */ (
    path,
  ) => {
    const source = readFileSync(`${root}/${path}`, "utf8");
    if (
      execFileSync("git", ["-C", root, "show", `${pin}:${path}`], {
        encoding: "utf8",
        maxBuffer: 4e6,
      }) !== source
    )
      throw Error(`Modified pinned ${path}`);
    return source;
  },
);
const [header, format, language, resolver] = sources;
const wanted = [
  "LANGUAGE_DONTKNOW",
  "LANGUAGE_SYSTEM",
  "LANGUAGE_SYSTEM_DEFAULT",
  "LANGUAGE_PROCESS_OR_USER_DEFAULT",
  "LANGUAGE_HID_HUMAN_INTERFACE_DEVICE",
  "LANGUAGE_ENGLISH_US",
  "LANGUAGE_CHINESE_SIMPLIFIED",
  "LANGUAGE_CHINESE",
  "LANGUAGE_JAPANESE",
  "LANGUAGE_KOREAN",
];
const defines = wanted
  .map(
    /** Selects the original complete single-line identity declaration. @param name - Required macro. @returns Exact source line. */ (
      name,
    ) => {
      const line = language
        .split("\n")
        .find(
          /** Matches the exact macro identifier. @param line - Source line. @returns Match. */ (
            line,
          ) => line.startsWith(`#define ${name} `),
        );
      if (!line) throw Error(`Missing ${name}`);
      return line;
    },
  )
  .join("\n");
const cpp =
  String.raw`
#include <cstdint>
#include <iostream>
#include <map>
#include <array>
#include <string>
using sal_uInt8=uint8_t;using sal_uInt16=uint16_t;
struct LanguageType{uint16_t value;constexpr LanguageType(uint16_t v=0):value(v){}explicit constexpr operator uint16_t()const{return value;}template<class...T>bool anyOf(T...other)const{return ((*this==other)||...);}friend constexpr bool operator==(LanguageType a,LanguageType b){return a.value==b.value;}friend constexpr bool operator!=(LanguageType a,LanguageType b){return !(a==b);}friend constexpr bool operator<(LanguageType a,LanguageType b){return a.value<b.value;}};
constexpr LanguageType primary(LanguageType v){return LanguageType(sal_uInt16(v)&0x3ff);}
using OUString=std::u16string;
` +
  defines +
  String.raw`
LanguageType configuredSystem,configuredUI;
struct MsLangId{static LanguageType simplifySystemLanguages(LanguageType);static LanguageType getRealLanguage(LanguageType);static LanguageType getConfiguredSystemLanguage(){return configuredSystem;}static LanguageType getConfiguredSystemUILanguage(){return configuredUI;}};
` +
  scope(
    resolver,
    "inline LanguageType MsLangId::simplifySystemLanguages",
    "LanguageType MsLangId::getConfiguredSystemLanguage()",
  ) +
  scope(header, "class SvNumberNatNum\n", "\nclass CharClass;") +
  scope(
    format,
    "const std::map<LanguageType, std::array<sal_uInt8, 4>> tblDBNumToNatNum",
    "/**\n * SvNumFor",
  ) +
  String.raw`
int main(){unsigned system,ui,lang,num,date;std::cin>>system>>ui;configuredSystem=LanguageType(system);configuredUI=LanguageType(ui);while(std::cin>>lang>>num>>date){SvNumberNatNum db,native;db.SetLang(LanguageType(lang));native.SetLang(LanguageType(lang));db.SetNum(sal_uInt8(num),true);native.SetNum(sal_uInt8(num),false);db.SetDate(date);native.SetDate(date);std::cout<<unsigned(SvNumberNatNum::MapDBNumToNatNum(sal_uInt8(num),LanguageType(lang),date))<<' '<<unsigned(SvNumberNatNum::MapNatNumToDBNum(sal_uInt8(num),LanguageType(lang),date))<<' '<<unsigned(db.GetNatNum())<<' '<<unsigned(db.GetDBNum())<<' '<<unsigned(native.GetNatNum())<<' '<<unsigned(native.GetDBNum())<<' '<<db.IsSet()<<' '<<db.IsComplete()<<' '<<unsigned(sal_uInt16(db.GetLang()))<<'\n';}}
`;
writeFileSync(`${target}.cpp`, cpp);
execFileSync("clang++", ["-std=c++20", `${target}.cpp`, "-o", target], { stdio: "inherit" });
const inputs = [`${getRealLanguage(0)} ${getRealLanguage(0x04ff)}`],
  expected = [];
for (const lang of [
  0, 0x3ff, 0x400, 0x800, 0x4ff, 0x0004, 0x0404, 0x0804, 0x0c04, 0x1004, 0x0411, 0x0811, 0x0412,
  0x0812, 0x0409, 0x0455, 0x041e, 0xffff,
])
  for (let num = 0; num < 256; ++num)
    for (const date of [false, true]) {
      const db = new SvNumberNatNum(),
        native = new SvNumberNatNum();
      try {
        db.SetLang(lang);
        native.SetLang(lang);
        db.SetNum(num, true);
        native.SetNum(num, false);
        db.SetDate(date);
        native.SetDate(date);
        inputs.push(`${lang} ${num} ${Number(date)}`);
        expected.push(
          [
            SvNumberNatNum.MapDBNumToNatNum(num, lang, date),
            SvNumberNatNum.MapNatNumToDBNum(num, lang, date),
            db.GetNatNum(),
            db.GetDBNum(),
            native.GetNatNum(),
            native.GetDBNum(),
            Number(db.IsSet()),
            Number(db.IsComplete()),
            db.GetLang(),
          ].join(" "),
        );
      } finally {
        native.dispose();
        db.dispose();
      }
    }
const actual = execFileSync(target, {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 8e6,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Native rows ${actual.length}, expected ${expected.length}`);
for (let index = 0; index < actual.length; ++index)
  if (actual[index] !== expected[index])
    throw Error(`Mismatch ${inputs[index + 1]} native=${actual[index]} local=${expected[index]}`);
process.stdout.write(
  `Matched ${expected.length} original native modifier/map/language-resolution rows.\n`,
);
