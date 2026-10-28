/** @fileoverview Original compiled-format locale decoding, serialization and calendar/numeral insertion witness. Fixtures supply value strings, language tags and configured locale values; no full formatter constructor/ABI claim. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pin, scope } from "./rtl-ustring-native-sources.mjs";
import {
  LocaleType,
  ImpGetLocaleType,
} from "../apps/office/src/svl/source/numbers/zformat.locale.ts";
import { ImpObtainCalendarAndNumerals } from "../apps/office/src/svl/source/numbers/zformat.locale-calendar.ts";
import { getRealLanguage } from "../apps/office/src/i18nlangtag/source/isolang/mslangid.ts";
import { unicode } from "../apps/office/src/i18nlangtag/source/isolang/isolang.tables.ts";
import { OUStringBuffer } from "../apps/office/src/sal/inc/rtl/ustrbuf.ts";
const root = "vendor/libreoffice-reference",
  target = `${process.env.VITE_OFFICE_ICU_NATIVE_BUILD ?? "output/native/AQF9AG-icu-grego"}/format-locale`;
const paths = [
  "include/svl/zformat.hxx",
  "svl/source/numbers/zformat.cxx",
  "include/i18nlangtag/lang.h",
  "i18nlangtag/source/isolang/mslangid.cxx",
  "include/o3tl/numeric.hxx",
];
const sources = paths.map(
  /** Loads complete verified pinned source bytes. @param path - Source path. @returns Source bytes. */ (
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
const [header, format, lang, resolver, numeric] = sources;
const cpp =
  String.raw`
#include <cstdint>
#include <iostream>
#include <string>
#include <string_view>
#include <type_traits>
using sal_uInt8=uint8_t;using sal_uInt16=uint16_t;using sal_uInt32=uint32_t;using sal_Int32=int32_t;using sal_Unicode=char16_t;
#define SAL_DLLPRIVATE
struct LanguageType{uint16_t value;constexpr LanguageType(uint16_t v=0):value(v){}explicit constexpr operator uint16_t()const{return value;}template<class...T>bool anyOf(T...other)const{return ((*this==other)||...);}friend constexpr bool operator==(LanguageType a,LanguageType b){return a.value==b.value;}friend constexpr bool operator!=(LanguageType a,LanguageType b){return !(a==b);}};
constexpr LanguageType primary(LanguageType value){return LanguageType(sal_uInt16(value)&0x3ff);}
` +
  lang
    .split("\n")
    .filter(
      /** Retains original complete language identity macros. @param line - Header line. @returns Identity declaration. */ (
        line,
      ) => line.startsWith("#define LANGUAGE_"),
    )
    .join("\n") +
  String.raw`
LanguageType configuredSystem,configuredUI;
struct MsLangId{static LanguageType simplifySystemLanguages(LanguageType);static LanguageType getRealLanguage(LanguageType);static LanguageType getConfiguredSystemLanguage(){return configuredSystem;}static LanguageType getConfiguredSystemUILanguage(){return configuredUI;}};
` +
  scope(
    resolver,
    "inline LanguageType MsLangId::simplifySystemLanguages",
    "LanguageType MsLangId::getConfiguredSystemLanguage()",
  ) +
  String.raw`
struct OUString{std::u16string value;OUString()=default;OUString(const char*s){while(*s)value+=char16_t(uint8_t(*s++));}OUString(std::u16string_view s):value(s){}int getLength()const{return value.size();}bool isEmpty()const{return value.empty();}char16_t operator[](size_t index)const{return value[index];}operator std::u16string_view()const{return value;}static OUString number(unsigned n){return OUString(std::to_string(n).c_str());}friend OUString operator+(const OUString&a,const OUString&b){return OUString(a.value+b.value);}};
struct OUStringBuffer{std::u16string value;bool isEmpty()const{return value.empty();}int getLength()const{return value.size();}void append(char16_t unit){value+=unit;}void insert(int pos,const OUString&s){value.insert(pos,s.value);}OUString makeStringAndClear(){OUString out(value);value.clear();return out;}};
namespace o3tl{template<class T>concept integral=std::is_integral_v<T>;
` +
  scope(
    numeric,
    "template <o3tl::integral T, T error = T(-1), o3tl::integral U>",
    "template <o3tl::integral T, T error = T(-1), o3tl::integral U>\nconstexpr T convertToHex(U cHigh",
  ) +
  "}\nclass SvNumberformat{public:\n" +
  scope(header, "struct SAL_DLLPRIVATE LocaleType\n", "\npublic:") +
  String.raw`
LocaleType maLocale;static LocaleType ImpGetLocaleType(std::u16string_view,sal_Int32&);OUString ImpObtainCalendarAndNumerals(OUStringBuffer&,sal_Int32,LanguageType&,const LocaleType&);
};
` +
  scope(format, "sal_Unicode toUniChar(sal_uInt8 n)", "bool IsCombiningSymbol(") +
  scope(
    format,
    "OUString SvNumberformat::LocaleType::generateCode() const",
    "// static\nSvNumberformat::LocaleType SvNumberformat::ImpGetLocaleType",
  ) +
  scope(
    format,
    "SvNumberformat::LocaleType SvNumberformat::ImpGetLocaleType",
    "static bool lcl_matchKeywordAndGetNumber",
  ) +
  scope(
    format,
    "OUString SvNumberformat::ImpObtainCalendarAndNumerals(",
    "namespace\n{\nbool NatNumTakesParameters",
  ) +
  String.raw`
std::string hex(std::u16string_view text){if(text.empty())return "-";const char*digits="0123456789abcdef";std::string out;for(auto unit:text)for(int shift=12;shift>=0;shift-=4)out+=digits[(unit>>shift)&15];return out;}
std::u16string decode(const std::string&s){if(s=="-")return {};std::u16string out;for(size_t i=0;i<s.size();i+=4)out+=char16_t(std::stoul(s.substr(i,4),nullptr,16));return out;}
void print(const SvNumberformat::LocaleType&v){auto code=v.generateCode();std::cout<<unsigned(sal_uInt16(v.meLanguage))<<' '<<unsigned(sal_uInt16(v.meLanguageWithoutLocaleData))<<' '<<unsigned(v.meSubstitute)<<' '<<unsigned(v.mnNumeralShape)<<' '<<unsigned(v.mnCalendarType)<<' '<<v.isPlainLocale()<<' '<<hex(code);}
int main(){unsigned sys,ui;std::cin>>sys>>ui;configuredSystem=LanguageType(sys);configuredUI=LanguageType(ui);char op;uint32_t raw,current,temporary;int pos;std::string data;while(std::cin>>op){if(op=='L'){std::cin>>raw>>temporary;SvNumberformat::LocaleType value(raw);value.meLanguageWithoutLocaleData=LanguageType(temporary);print(value);std::cout<<'\n';continue;}if(op=='P'){std::cin>>pos>>data;auto text=decode(data);auto value=SvNumberformat::ImpGetLocaleType(text,pos);print(value);std::cout<<' '<<pos<<'\n';continue;}std::cin>>current>>raw>>pos>>data;SvNumberformat owner;owner.maLocale.meLanguage=LanguageType(current);SvNumberformat::LocaleType target(raw);LanguageType lang(current);OUStringBuffer buffer;buffer.value=decode(data);auto calendar=owner.ImpObtainCalendarAndNumerals(buffer,pos,lang,target);std::cout<<unsigned(sal_uInt16(owner.maLocale.meLanguage))<<' '<<unsigned(sal_uInt16(lang))<<' '<<hex(calendar)<<' '<<hex(buffer.value)<<'\n';}}
`;
writeFileSync(`${target}.cpp`, cpp);
execFileSync("clang++", ["-std=c++20", `${target}.cpp`, "-o", target], { stdio: "inherit" });
/** Encodes exact logical UTF16 units, including embedded zeros. @param value - String or original value owner. @returns Transport hex. */
function hex(value) {
  if (typeof value === "string") {
    let out = "";
    for (let i = 0; i < value.length; ++i) out += value.charCodeAt(i).toString(16).padStart(4, "0");
    return out || "-";
  }
  return hex(String.fromCharCode(...value.getStr().subarray(0, value.getLength())));
}
/** Captures original metadata and active serialization. @param value - Actual metadata. @returns Native-compatible observation. */
function row(value) {
  const code = value.generateCode();
  try {
    return [
      value.meLanguage,
      value.meLanguageWithoutLocaleData,
      value.meSubstitute,
      value.mnNumeralShape,
      value.mnCalendarType,
      Number(value.isPlainLocale()),
      hex(code),
    ];
  } finally {
    code.dispose();
  }
}
const inputs = [`${getRealLanguage(0)} ${getRealLanguage(0x04ff)}`],
  expected = [];
for (const raw of [
  0, 0x409, 0x3ff, 0xf400, 0xf800, 0xffffffff, 0x10010409, 0x1b030411, 0x27050412, 0x8000f400,
])
  for (const without of [0x3ff, 0x407]) {
    const value = new LocaleType(raw);
    value.meLanguageWithoutLocaleData = without;
    inputs.push(`L ${raw >>> 0} ${without}`);
    expected.push(row(value).join(" "));
  }
for (const source of [
  "",
  "0",
  "409",
  "f400",
  "F800",
  "10010409",
  "10010409]",
  "1001040]",
  "123456789",
  "G",
  "409x",
  "$-409",
  "ab\u0000cd",
  "ffffffff",
  "FFFFFFFF]",
  "]",
])
  for (let start = 0; start <= source.length; ++start) {
    const value = unicode(source),
      pos = [start];
    try {
      inputs.push(`P ${start} ${hex(source)}`);
      expected.push([...row(ImpGetLocaleType(value.subView(0), pos)), pos[0]].join(" "));
    } finally {
      value.dispose();
    }
  }
const languages = [
  0x409, 0x401, 0x429, 0x439, 0x44e, 0x461, 0x041e, 0x454, 0x411, 0x412, 0x804, 0x404, 0x1404,
  0x1004, 0x850, 0x450, 0x7c46, 0x3ff, 0,
];
for (const current of languages)
  for (const temporary of languages)
    for (const numeral of [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 0x1b, 0x1c, 0x1d, 0x1e,
      0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x80, 0x82, 0xff,
    ])
      for (const calendar of [0, 3, 5, 6, 7, 8, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x17, 0x83]) {
        const raw = ((numeral << 24) | (calendar << 16) | temporary) >>> 0,
          locale = new LocaleType(),
          targetLocale = new LocaleType(raw),
          language = [current],
          source = unicode("x0"),
          buffer = new OUStringBuffer(source);
        locale.meLanguage = current;
        try {
          inputs.push(`C ${current} ${raw} 1 ${hex(source)}`);
          const result = ImpObtainCalendarAndNumerals(locale, buffer, 1, language, targetLocale);
          try {
            expected.push([locale.meLanguage, language[0], hex(result), hex(buffer)].join(" "));
          } finally {
            result.dispose();
          }
        } finally {
          buffer.dispose();
          source.dispose();
        }
      }
const actual = execFileSync(target, {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64e6,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let index = 0; index < actual.length; ++index)
  if (actual[index] !== expected[index])
    throw Error(`${inputs[index + 1]} native=${actual[index]} local=${expected[index]}`);
process.stdout.write(
  `Matched ${expected.length} original locale/hex/calendar/numeral observations.\n`,
);
if (process.argv.includes("--write-fixtures")) {
  /** Hashes exact native source or compiled-caller bytes. @param path - Evidence path. @returns SHA256. */
  function hash(path) {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  }
  const cases = inputs.slice(1).flatMap(
    /** Keeps every metadata/parser input and independent numeral-only/calendar-only axes after full native comparison. @param query - Native query. @param index - Native output offset. @returns Selected original observation. */
    (query, index) => {
      const fields = query.split(" "),
        raw = Number(fields[2]);
      return fields[0] !== "C" || ((raw >>> 16) & 255) === 0 || raw >>> 24 === 0
        ? [[query, actual[index]]]
        : [];
    },
  );
  writeFileSync(
    "apps/office/src/svl/source/numbers/format-locale.native-observations.json",
    JSON.stringify(
      {
        baselineCommit: pin,
        sourceHashes: Object.fromEntries(
          paths.map(
            /** Retains each verified original source identity. @param path - Original responsibility. @returns Hash pair. */
            (path) => [path, hash(`${root}/${path}`)],
          ),
        ),
        witnessSha256: hash(`${target}.cpp`),
        configuredLanguages: inputs[0],
        nativeComparedRows: actual.length,
        scope:
          "Unchanged extracted original locale metadata, parser and calendar/numeral insertion functions with scalar string/configured-language bindings. Full constructor, UNO/SAL ABI and formatting output remain unverified. Portable replay selects complete metadata/parser inputs and separate calendar/numeral axes after the complete differential product passes.",
        cases,
      },
      null,
      2,
    ) + "\n",
  );
  console.log(`Stored ${cases.length} native metadata/parser/calendar/numeral observations`);
}
