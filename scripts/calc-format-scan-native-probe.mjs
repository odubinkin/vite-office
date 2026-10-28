/** @fileoverview Compares unchanged pinned zforscan.cxx keyword, lexical, ScanType and token-helper bodies, plus zformat.cxx quote helpers, against the real local owners. Native fixtures supply scalar locale/currency/provider data, UTF16 string values and ICU-bound casing/letter classification; full UNO/SAL lifetime, format-prefix/final compilation and arbitrary classifier/OOM behavior are outside this witness. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { SvNFLanguageData } from "../apps/office/src/svl/source/numbers/zforlist.ts";
import { NumberFormatCodeMapper } from "../apps/office/src/i18npool/inc/numberformatcode.ts";
import { getLoadedLocale } from "../apps/office/src/unotools/source/i18n/localedatawrapper.ts";
import { convertLocaleToLanguage } from "../apps/office/src/i18nlangtag/source/isolang/mslangid.ts";
import { unicode, text } from "../apps/office/src/i18nlangtag/source/isolang/isolang.tables.ts";
import { IsInQuote, GetQuoteEnd } from "../apps/office/src/svl/source/numbers/zformat.quotes.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  icu = resolve("vendor/icu-reference/source"),
  scan = readFileSync("vendor/libreoffice-reference/svl/source/numbers/zforscan.cxx", "utf8"),
  format = readFileSync("vendor/libreoffice-reference/svl/source/numbers/zformat.cxx", "utf8"),
  list = readFileSync("vendor/libreoffice-reference/svl/source/numbers/zforlist.cxx", "utf8"),
  lang = readFileSync("vendor/libreoffice-reference/include/i18nlangtag/lang.h", "utf8"),
  keywords = readFileSync("vendor/libreoffice-reference/include/svl/nfkeytab.hxx", "utf8");
const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
if (
  execFileSync("git", ["-C", "vendor/libreoffice-reference", "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim() !== pin
)
  throw Error("Expected pinned scanner baseline");
for (const [path, value] of [
  ["svl/source/numbers/zforscan.cxx", scan],
  ["svl/source/numbers/zformat.cxx", format],
  ["svl/source/numbers/zforlist.cxx", list],
  ["include/i18nlangtag/lang.h", lang],
  ["include/svl/nfkeytab.hxx", keywords],
])
  if (
    execFileSync("git", ["-C", "vendor/libreoffice-reference", "show", `${pin}:${path}`], {
      encoding: "utf8",
      maxBuffer: 4e6,
    }) !== value
  )
    throw Error(`Modified pinned source ${path}`);
/** Extracts one unchanged C++ function, ignoring braces in comments and quoted literals. @param source - Original source. @param signature - Exact declaration prefix. @returns Complete function. */
function body(source, signature) {
  const start = source.indexOf(signature);
  if (start < 0) throw Error("Missing " + signature);
  const brace = source.indexOf("{", start);
  let depth = 0,
    state = "",
    end = brace;
  for (; end < source.length; ++end) {
    const c = source[end],
      n = source[end + 1];
    if (state === "//") {
      if (c === "\n") state = "";
      continue;
    }
    if (state === "/*") {
      if (c === "*" && n === "/") {
        state = "";
        end++;
      }
      continue;
    }
    if (state === '"' || state === "'") {
      if (c === "\\") {
        end++;
        continue;
      }
      if (c === state) state = "";
      continue;
    }
    if (c === "/" && (n === "/" || n === "*")) {
      state = c + n;
      end++;
      continue;
    }
    if (c === '"' || c === "'") {
      state = c;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return source.slice(start, end + 1);
  }
  throw Error("Unclosed " + signature);
}
/** Extracts a brace-delimited original enum, including its semicolon. @param source - Original header. @param name - Declaration prefix. @returns Native enum. */
function enumSource(source, name) {
  const start = source.indexOf(name),
    end = source.indexOf("};", start);
  if (start < 0 || end < 0) throw Error(name);
  return source.slice(start, end + 2);
}
const keywordEnum = enumSource(keywords, "enum NfKeywordIndex"),
  englishStart = scan.indexOf("const NfKeywordTable ImpSvNumberformatScan::sEnglishKeyword ="),
  englishEnd = scan.indexOf("};", englishStart) + 2;
const methods = [
  "void ImpSvNumberformatScan::ChangeIntl(",
  "void ImpSvNumberformatScan::InitSpecialKeyword(",
  "void ImpSvNumberformatScan::InitCompatCur()",
  "void ImpSvNumberformatScan::InitKeywords()",
  "void ImpSvNumberformatScan::SetDependentKeywords()",
  "short ImpSvNumberformatScan::GetKeyWord(",
  "short ImpSvNumberformatScan::Next_Symbol(",
  "sal_Int32 ImpSvNumberformatScan::Symbol_Division(",
  "void ImpSvNumberformatScan::SkipStrings(",
  "sal_uInt16 ImpSvNumberformatScan::PreviousKeyword(",
  "sal_uInt16 ImpSvNumberformatScan::NextKeyword(",
  "short ImpSvNumberformatScan::PreviousType(",
  "sal_Unicode ImpSvNumberformatScan::PreviousChar(",
  "sal_Unicode ImpSvNumberformatScan::NextChar(",
  "bool ImpSvNumberformatScan::IsLastBlankBeforeFrac(",
  "void ImpSvNumberformatScan::Reset()",
  "bool ImpSvNumberformatScan::Is100SecZero(",
  "sal_Int32 ImpSvNumberformatScan::ScanType()",
  "bool ImpSvNumberformatScan::InsertSymbol(",
  "int ImpSvNumberformatScan::FinalScanGetCalendar(",
  "bool ImpSvNumberformatScan::IsDateFragment(",
  "void ImpSvNumberformatScan::SwapArrayElements(",
];
const fixture =
  String.raw`
#include "unicode/unistr.h"
#include "unicode/locid.h"
#include "unicode/uchar.h"
#include "unicode/putil.h"
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <memory>
#include <set>
#include <string>
#include <string_view>
#include <vector>
using sal_Int32=int32_t;using sal_uInt16=uint16_t;using sal_Int16=int16_t;using sal_Unicode=char16_t;
namespace sal{template<class T,class U>T static_int_cast(U value){return static_cast<T>(value);}}
#define SAL_WARN(...)
constexpr size_t NF_MAX_FORMAT_SYMBOLS=100;
struct OUString{std::u16string value;OUString()=default;OUString(const char16_t*s):value(s){}OUString(const char*s){while(*s)value+=char16_t(uint8_t(*s++));}OUString(std::u16string_view s):value(s){}sal_Int32 getLength()const{return value.size();}const char16_t*getStr()const{return value.data();}char16_t operator[](size_t i)const{return value[i];}bool isEmpty()const{return value.empty();}void clear(){value.clear();}operator std::u16string_view()const{return value;}
OUString copy(int pos,int count=-1)const{assert(pos>=0&&pos<=getLength());if(count<0)count=getLength()-pos;assert(count<=getLength()-pos);return std::u16string_view(value).substr(pos,count);}std::u16string_view subView(int pos,int count)const{assert(pos>=0&&count>=0&&pos<=getLength()&&count<=getLength()-pos);return {value.data()+pos,size_t(count)};}
bool startsWith(const OUString&p)const{return value.size()>=p.value.size()&&value.compare(0,p.value.size(),p.value)==0;}int indexOf(const OUString&p,int from=0)const{auto n=value.find(p.value,from);return n==std::u16string::npos?-1:int(n);}OUString&operator+=(const OUString&s){value+=s.value;return *this;}friend bool operator==(const OUString&a,const OUString&b){return a.value==b.value;}friend bool operator!=(const OUString&a,const OUString&b){return !(a==b);}friend OUString operator+(const OUString&a,const OUString&b){return OUString(a.value+b.value);}};
OUString operator""_ustr(const char16_t*s,size_t n){return std::u16string_view(s,n);}
struct OUStringChar{char16_t unit;explicit OUStringChar(char16_t c):unit(c){}};
struct OUStringBuffer{std::u16string value;void append(OUStringChar c){value+=c.unit;}sal_Int32 getLength()const{return value.size();}char16_t operator[](size_t i)const{return value[i];}OUStringBuffer&operator=(const OUString&s){value=s.value;return *this;}OUStringBuffer&operator=(std::u16string_view s){value=s;return *this;}OUString makeStringAndClear(){OUString out(value);value.clear();return out;}};
struct LanguageType{uint16_t value;constexpr LanguageType(uint16_t v=0):value(v){}template<class...T>bool anyOf(T...other)const{return ((*this==other)||...);}friend bool operator==(LanguageType a,LanguageType b){return a.value==b.value;}friend bool operator!=(LanguageType a,LanguageType b){return !(a==b);}};
` +
  lang
    .split("\n")
    .filter(
      /** Reuses original identity macros rather than rebuilding language values. @param line - Header line. @returns Whether a native language macro. */ (
        line,
      ) => /^#define LANGUAGE_/.test(line),
    )
    .join("\n") +
  String.raw`
namespace MsLangId{LanguageType getRealLanguage(LanguageType value){return value;}}
namespace o3tl{template<class T>T sanitizing_dec(T value){assert(value>0);return value-1;}}
namespace com::sun::star::uno{template<class T>using Sequence=std::vector<T>;}
namespace com::sun::star::i18n{struct NumberFormatCode{OUString Code;};struct Currency2{OUString Symbol,BankSymbol;bool UsedInCompatibleFormatCodes;};}
namespace css=com::sun::star;
struct CharClass{std::string locale;OUString uppercase(const OUString&s,int pos=0,int count=-1)const{if(count<0)count=s.getLength()-pos;icu::UnicodeString value(reinterpret_cast<const UChar*>(s.getStr()+pos),count);value.toUpper(icu::Locale(locale.c_str()));return std::u16string_view(reinterpret_cast<const char16_t*>(value.getBuffer()),value.length());}bool isLetter(const OUString&s,int pos)const{auto u=s[pos];if(u<128)return (u>='A'&&u<='Z')||(u>='a'&&u<='z');UChar32 c=icu::UnicodeString(reinterpret_cast<const UChar*>(s.getStr()),s.getLength()).char32At(pos);return u_isalpha(c);}};
struct LanguageTag{LanguageType language;std::string locale;LanguageType getLanguageType(bool)const{return language;}const std::string&getLocale()const{return locale;}};
struct LocaleDataWrapper{LanguageTag loaded;OUString decimal,group,date,time,time100,curr,bank,trueWord,falseWord;std::vector<css::i18n::Currency2>currencies;LanguageTag getLoadedLanguageTag()const{return loaded;}const OUString&getTrueWord()const{return trueWord;}const OUString&getFalseWord()const{return falseWord;}const OUString&getTimeSep()const{return time;}const OUString&getTime100SecSep()const{return time100;}auto getAllCurrencies()const{return currencies;}const OUString&getCurrSymbol()const{return curr;}const OUString&getCurrBankSymbol()const{return bank;}static bool areChecksEnabled(){return false;}static void outputCheckMessage(const OUString&){}OUString appendLocaleInfo(const OUString&s)const{return s;}};
struct NFC{OUString code;css::i18n::NumberFormatCode getFormatCode(int,const std::string&)const{return{code};}};
struct SvNFLanguageData{LocaleDataWrapper*xLocaleData;CharClass*classifier;const LocaleDataWrapper*GetLocaleData()const{return xLocaleData;}const CharClass*GetCharClass()const{return classifier;}const OUString&GetNumDecimalSep()const{return xLocaleData->decimal;}const OUString&GetNumThousandSep()const{return xLocaleData->group;}const OUString&GetDateSep()const{return xLocaleData->date;}void GetCompatibilityCurrency(OUString&,OUString&)const;};
enum class SvNumFormatType{ALL=0,DEFINED=1,DATE=2,TIME=4,CURRENCY=8,NUMBER=16,SCIENTIFIC=32,FRACTION=64,PERCENT=128,TEXT=256,DATETIME=6,LOGICAL=1024,UNDEFINED=2048,EMPTY=4096,DURATION=8196};
int operator&(SvNumFormatType a,SvNumFormatType b){return int(a)&int(b);}
` +
  keywordEnum +
  String.raw`
using NfKeywordTable=std::array<OUString,NF_KEYWORD_ENTRIES_COUNT>;
namespace svt{enum NfSymbolType{NF_SYMBOLTYPE_STRING=-1,NF_SYMBOLTYPE_DEL=-2,NF_SYMBOLTYPE_BLANK=-3,NF_SYMBOLTYPE_STAR=-4,NF_SYMBOLTYPE_DIGIT=-5,NF_SYMBOLTYPE_DECSEP=-6,NF_SYMBOLTYPE_THSEP=-7,NF_SYMBOLTYPE_EXP=-8,NF_SYMBOLTYPE_FRAC=-9,NF_SYMBOLTYPE_EMPTY=-10,NF_SYMBOLTYPE_FRACBLANK=-11,NF_SYMBOLTYPE_CURRENCY=-12,NF_SYMBOLTYPE_CURRDEL=-13,NF_SYMBOLTYPE_CURREXT=-14,NF_SYMBOLTYPE_CALENDAR=-15,NF_SYMBOLTYPE_CALDEL=-16,NF_SYMBOLTYPE_DATESEP=-17,NF_SYMBOLTYPE_TIMESEP=-18,NF_SYMBOLTYPE_TIME100SECSEP=-19,NF_SYMBOLTYPE_PERCENT=-20,NF_SYMBOLTYPE_FRAC_FDIV=-21};}
using namespace svt;
constexpr int NF_NUMBER_STANDARD=0;
struct SvNumberformat{static bool IsInQuote(const OUString&,int,char16_t='"',char16_t=0,char16_t='\\');static int GetQuoteEnd(const OUString&,int,char16_t='"',char16_t=0);};
enum ScanState{SsStop=0,SsStart=1,SsGetChar=2,SsGetString=3,SsGetWord=4,SsGetStar=5,SsGetBlank=6};
struct ImpSvNumberformatScan{
enum class KeywordLocalization{LocaleLegacy,EnglishOnly,AllowEnglish};
SvNFLanguageData&mrCurrentLanguageData;NFC*xNFC;NfKeywordTable sKeyword;static const NfKeywordTable sEnglishKeyword;OUString sNameStandardFormat,sCurSymbol,sCurString,sCurAbbrev,sBooleanEquivalent1,sBooleanEquivalent2;mutable bool bKeywordsNeedInit=true,bCompatCurNeedInit=true;KeywordLocalization meKeywordLocalization=KeywordLocalization::AllowEnglish;bool bConvertMode=false;LanguageType eTmpLnge=LANGUAGE_DONTKNOW,eNewLnge=LANGUAGE_DONTKNOW;int nCurrPos=-1;OUString sStrArray[100];short nTypeArray[100]{};sal_uInt16 nStringsCnt=0,nResultStringsCnt=0,nThousand=0,nExpPos=0,nBlankPos=0,nCntPre=0,nCntPost=0,nCntExp=0,nNatNumModifier=0;short nDecPos=0;SvNumFormatType eScannedType=SvNumFormatType::UNDEFINED;bool bExp=false,bThousand=false,bDecSep=false,bFrac=false,bBlank=false;
ImpSvNumberformatScan(SvNFLanguageData&d,NFC*p):mrCurrentLanguageData(d),xNFC(p){Reset();}
void ChangeIntl(KeywordLocalization);void InitKeywords()const;void InitSpecialKeyword(NfKeywordIndex)const;void InitCompatCur()const;void SetDependentKeywords();const NfKeywordTable&GetKeywords()const{if(bKeywordsNeedInit)InitKeywords();return sKeyword;}const OUString&GetCurString()const{if(bCompatCurNeedInit)InitCompatCur();return sCurString;}
short GetKeyWord(const OUString&,int,bool&)const;short Next_Symbol(const OUString&,int&,OUString&)const;int Symbol_Division(const OUString&);void SkipStrings(uint16_t&,int&)const;uint16_t PreviousKeyword(uint16_t)const;uint16_t NextKeyword(uint16_t)const;short PreviousType(uint16_t)const;char16_t PreviousChar(uint16_t)const;char16_t NextChar(uint16_t)const;bool IsLastBlankBeforeFrac(uint16_t)const;void Reset();bool Is100SecZero(uint16_t,bool)const;int ScanType();bool InsertSymbol(uint16_t&,svt::NfSymbolType,const OUString&);int FinalScanGetCalendar(int&,uint16_t&,uint16_t&);bool IsDateFragment(size_t,size_t)const;void SwapArrayElements(size_t,size_t);bool IsAmbiguousE(short key)const{return(key==NF_KEY_EC||key==NF_KEY_E)&&(GetKeywords()[NF_KEY_EC]==GetKeywords()[NF_KEY_E]);}static bool StringEqualsChar(std::u16string_view s,char16_t c){return s.size()==1&&s[0]==c;}
};
` +
  scan.slice(englishStart, englishEnd) +
  "\n" +
  body(scan, "static const std::u16string_view& GermanColorName(") +
  "\n" +
  body(scan, "static OUString lcl_extractStandardGeneralName(") +
  "\n" +
  body(list, "void SvNFLanguageData::GetCompatibilityCurrency(") +
  "\n" +
  body(format, "bool SvNumberformat::IsInQuote(") +
  "\n" +
  body(format, "sal_Int32 SvNumberformat::GetQuoteEnd(") +
  "\n" +
  methods
    .map(
      /** Includes the actual unchanged source implementation. @param signature - Signature. @returns Source body. */ (
        signature,
      ) => body(scan, signature),
    )
    .join("\n") +
  String.raw`
OUString unhex(std::string s){OUString out;if(s=="-")return out;for(size_t i=0;i<s.size();i+=4)out.value+=char16_t(std::stoi(s.substr(i,4),nullptr,16));return out;}
std::string hex(const OUString&s){if(s.isEmpty())return "-";std::string out;constexpr char digits[]="0123456789abcdef";for(char16_t u:s.value){for(int shift=12;shift>=0;shift-=4)out+=digits[(u>>shift)&15];}return out;}
void word(OUString&out){std::string input;std::cin>>input;out=unhex(input);}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);char op;while(std::cin>>op){if(op=='I'){int count,result,source,type;sal_uInt16 position;std::cin>>count>>result>>position>>source>>type;LocaleDataWrapper l;CharClass c;NFC provider;SvNFLanguageData data{&l,&c};ImpSvNumberformatScan scanner(data,&provider);scanner.nStringsCnt=count;scanner.nResultStringsCnt=result;for(int i=0;i<100;++i){std::cin>>scanner.nTypeArray[i];word(scanner.sStrArray[i]);}OUString literal;word(literal);const OUString&value=source<0?literal:scanner.sStrArray[source];auto inserted=scanner.InsertSymbol(position,svt::NfSymbolType(type),value);std::cout<<inserted<<' '<<position<<' '<<scanner.nStringsCnt<<' '<<scanner.nResultStringsCnt;for(int i=0;i<100;++i)std::cout<<' '<<scanner.nTypeArray[i]<<' '<<hex(scanner.sStrArray[i]);std::cout<<'\n';continue;}if(op=='B'){OUString s;word(s);int p,q,inside,outside;std::cin>>p>>q>>inside>>outside;std::cout<<SvNumberformat::IsInQuote(s,p,q,inside,outside)<<'\n';continue;}if(op=='Q'){OUString s;word(s);int p;std::cin>>p;std::cout<<SvNumberformat::GetQuoteEnd(s,p)<<'\n';continue;}int language,mode,convert,oldlang,newlang;std::string tag;std::cin>>language>>mode>>convert>>oldlang>>newlang>>tag;LocaleDataWrapper l;l.loaded={LanguageType(language),tag};CharClass c;c.locale=tag;NFC provider;word(l.decimal);word(l.group);word(l.date);word(l.time);word(l.time100);word(l.curr);word(l.bank);word(provider.code);word(l.trueWord);word(l.falseWord);int count;std::cin>>count;for(int i=0;i<count;++i){css::i18n::Currency2 row;word(row.Symbol);word(row.BankSymbol);int compatible;std::cin>>compatible;row.UsedInCompatibleFormatCodes=compatible;l.currencies.push_back(row);}OUString input;word(input);SvNFLanguageData data{&l,&c};ImpSvNumberformatScan scanner(data,&provider);scanner.ChangeIntl(ImpSvNumberformatScan::KeywordLocalization(mode));scanner.bConvertMode=convert;scanner.eTmpLnge=LanguageType(oldlang);scanner.eNewLnge=LanguageType(newlang);int lexical=scanner.Symbol_Division(input),typed=lexical==0?scanner.ScanType():-99;if(op=='G'){int position=0;uint16_t index=0,result=scanner.nStringsCnt;auto status=scanner.FinalScanGetCalendar(position,index,result);std::cout<<status<<' '<<position<<' '<<index<<' '<<result;for(int i=0;i<scanner.nStringsCnt;++i)std::cout<<' '<<scanner.nTypeArray[i]<<' '<<hex(scanner.sStrArray[i]);for(int i=0;i+2<scanner.nStringsCnt;++i)std::cout<<' '<<scanner.IsDateFragment(i,i+2)<<' '<<scanner.IsDateFragment(i+2,i);if(scanner.nStringsCnt){scanner.SwapArrayElements(0,scanner.nStringsCnt-1);scanner.SwapArrayElements(0,0);}for(int i=0;i<scanner.nStringsCnt;++i)std::cout<<' '<<scanner.nTypeArray[i]<<' '<<hex(scanner.sStrArray[i]);std::cout<<'\n';continue;}std::cout<<lexical<<' '<<typed<<' '<<scanner.nCurrPos<<' '<<scanner.nStringsCnt<<' '<<int(scanner.eScannedType)<<' '<<scanner.bDecSep<<' '<<scanner.nDecPos<<' '<<int(scanner.meKeywordLocalization);for(const auto&k:scanner.GetKeywords())std::cout<<' '<<hex(k);for(int i=0;i<scanner.nStringsCnt;++i)std::cout<<' '<<scanner.nTypeArray[i]<<' '<<hex(scanner.sStrArray[i]);for(uint16_t i=0;i<=scanner.nStringsCnt;++i)std::cout<<' '<<scanner.PreviousKeyword(i)<<' '<<scanner.NextKeyword(i)<<' '<<scanner.PreviousType(i)<<' '<<uint32_t(scanner.PreviousChar(i))<<' '<<uint32_t(scanner.NextChar(i))<<' '<<scanner.IsLastBlankBeforeFrac(i)<<' '<<scanner.Is100SecZero(i,false)<<' '<<scanner.Is100SecZero(i,true);std::set<int>positions={0,input.getLength()};if(input.getLength()>0){positions.insert(1);positions.insert(input.getLength()-1);}for(int p:positions)for(bool start:{false,true}){bool english=start;auto key=scanner.GetKeyWord(input,p,english);std::cout<<' '<<key<<' '<<english;}std::cout<<'\n';}}
`;
writeFileSync(`${build}/format-scan-witness.cc`, fixture);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${icu}/common`,
    `-I${icu}/i18n`,
    `${build}/format-scan-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/format-scan-witness`,
  ],
  { stdio: "inherit" },
);
const inputs = [],
  expected = [];
/** Encodes a complete UTF16 fixture value without interpreting it as shell or token syntax. @param value - Source text/view. @returns Native transport word. */
function hex(value) {
  const s = typeof value === "string" ? value : text(value);
  let result = "";
  for (let i = 0; i < s.length; ++i) result += s.charCodeAt(i).toString(16).padStart(4, "0");
  return result || "-";
}
const patterns = [
  "",
  "General",
  "GENERAL",
  "general",
  "Standard",
  "sTaNdArD",
  "BOOLEAN",
  "LOGISCH",
  "@",
  "0",
  "#,##0.00",
  "0.00E+00",
  "0.00e-00",
  "0.00E00",
  "# ?/?",
  "# ??/16",
  "#  ? / ?",
  "[HH]:MM:SS",
  "HH:MM:SS.00",
  "HH:MM:SS,00",
  'MM:SS"x"00',
  "YYYY-MM-DD",
  'YYYY-MM-DD"T"HH:MM:SS.000',
  "YYYY-MM-DD\\THH:MM:SS,000",
  "HH YYYY-MM-DD",
  "HH:MM:SS MM",
  "[$USD-409]#,##0.00",
  "[~jewish]YYYY-MM-DD",
  "[~missing",
  "[foo]",
  "*x0",
  "*x0*y",
  "*",
  "_x0",
  "\\*0",
  '"USD"0',
  "\\$0",
  "General0@",
  'YYYY"quote',
  "AM/PM A/P",
  "fooGeneralbar",
  "E+ E- E0 EE",
  "MM TT JJ",
  "GGGG AA OOO",
  "T0",
  "0\u00000",
  "œЖ語0",
  "ſ0",
  ...["#", "M", "\\x", '"x"'].map(
    /** Exercises original fixed-capacity truncation. @param token - Token. @returns Repeated format. */ (
      token,
    ) => token.repeat(110),
  ),
];
const requested = [
  0x0409,
  ...JSON.parse(
    readFileSync("apps/office/src/svl/source/numbers/data/keyword-localization.json", "utf8"),
  ).map(
    /** Uses original requested language identities. @param row - Source row. @returns Language. */ (
      row,
    ) => row.value,
  ),
  0x041e,
  0x0419,
  0x0401,
  0x0429,
  0x041f,
  0x0804,
  0x0411,
];
const mapper = new NumberFormatCodeMapper();
try {
  for (const requestedLanguage of requested) {
    const current = new SvNFLanguageData(mapper, requestedLanguage),
      scanner = current.GetFormatScanner(),
      loc = current.GetLocaleData(),
      loaded = getLoadedLocale(loc.getMyLocale()),
      locale = current.GetCharClass().getMyLocale(),
      tag =
        text(locale.Language) === "qlt"
          ? text(locale.Variant)
          : text(locale.Language) + (text(locale.Country) ? "_" + text(locale.Country) : ""),
      mapped = mapper.getFormatCode(0, loaded);
    try {
      for (const mode of [0, 1, 2])
        for (const convert of [false, true])
          for (const pattern of patterns) {
            scanner.ChangeIntl(mode);
            if (convert) scanner.SetConvertMode(0x0409, 0x041e, false, true);
            else scanner.SetConvertMode(false);
            const value = unicode(pattern);
            try {
              const lexical = scanner["Symbol_Division"](value),
                typed = lexical === 0 ? scanner["ScanType"]() : -99,
                out = [
                  lexical,
                  typed,
                  scanner["nCurrPos"],
                  scanner["nStringsCnt"],
                  scanner.GetScannedType(),
                  Number(scanner["bDecSep"]),
                  scanner["nDecPos"],
                  scanner["meKeywordLocalization"],
                ];
              out.push(...scanner.GetKeywords().map(hex));
              for (let i = 0; i < scanner["nStringsCnt"]; ++i)
                out.push(scanner["nTypeArray"][i], hex(scanner["sStrArray"][i]));
              for (let i = 0; i <= scanner["nStringsCnt"]; ++i)
                out.push(
                  scanner["PreviousKeyword"](i),
                  scanner["NextKeyword"](i),
                  scanner["PreviousType"](i),
                  scanner["PreviousChar"](i),
                  scanner["NextChar"](i),
                  Number(scanner["IsLastBlankBeforeFrac"](i)),
                  Number(scanner["Is100SecZero"](i, false)),
                  Number(scanner["Is100SecZero"](i, true)),
                );
              const positions = new Set([0, value.getLength()]);
              if (value.getLength()) {
                positions.add(1);
                positions.add(value.getLength() - 1);
              }
              for (const position of [...positions].sort(
                /** Preserves native std::set order. @param a - First. @param b - Second. @returns Ordering. */ (
                  a,
                  b,
                ) => a - b,
              ))
                for (const start of [false, true]) {
                  const english = [start];
                  out.push(scanner["GetKeyWord"](value, position, english), Number(english[0]));
                }
              const currencies = loc.getAllCurrencies(),
                prefix = [
                  "L",
                  convertLocaleToLanguage(loaded),
                  mode,
                  Number(convert),
                  0x0409,
                  0x041e,
                  tag || "root",
                  hex(current.GetNumDecimalSep()),
                  hex(current.GetNumThousandSep()),
                  hex(current.GetDateSep()),
                  hex(loc.getTimeSep()),
                  hex(loc.getTime100SecSep()),
                  hex(loc.getCurrSymbol()),
                  hex(loc.getCurrBankSymbol()),
                  hex(mapped.Code),
                  hex(loc.getTrueWord()),
                  hex(loc.getFalseWord()),
                  currencies.length,
                ];
              for (const row of currencies)
                prefix.push(
                  hex(row.symbol),
                  hex(row.bankSymbol),
                  Number(row.usedInCompatibleFormatCodes),
                );
              inputs.push([...prefix, hex(pattern)].join(" "));
              expected.push(out.join(" "));
              inputs.push(["G", ...prefix.slice(1), hex(pattern)].join(" "));
              const calendarPosition = [0],
                calendarIndex = [0],
                calendarCount = [scanner["nStringsCnt"]],
                calendarStatus = scanner["FinalScanGetCalendar"](
                  calendarPosition,
                  calendarIndex,
                  calendarCount,
                ),
                calendarOut = [
                  calendarStatus,
                  calendarPosition[0],
                  calendarIndex[0],
                  calendarCount[0],
                ];
              for (let i = 0; i < scanner["nStringsCnt"]; ++i)
                calendarOut.push(scanner["nTypeArray"][i], hex(scanner["sStrArray"][i]));
              for (let i = 0; i + 2 < scanner["nStringsCnt"]; ++i)
                calendarOut.push(
                  Number(scanner["IsDateFragment"](i, i + 2)),
                  Number(scanner["IsDateFragment"](i + 2, i)),
                );
              if (scanner["nStringsCnt"]) {
                scanner["SwapArrayElements"](0, scanner["nStringsCnt"] - 1);
                scanner["SwapArrayElements"](0, 0);
              }
              for (let i = 0; i < scanner["nStringsCnt"]; ++i)
                calendarOut.push(scanner["nTypeArray"][i], hex(scanner["sStrArray"][i]));
              expected.push(calendarOut.join(" "));
            } finally {
              value.dispose();
            }
          }
    } finally {
      mapped.dispose();
      loaded.dispose();
      current.dispose();
    }
  }
} finally {
  mapper.dispose();
}
for (const value of [
  "",
  '"x"',
  'a"x"',
  "abc",
  'a\\"x"',
  '"a""b"',
  'a"USD"0',
  'a"USD',
  '\u0000"x"',
]) {
  const v = unicode(value);
  try {
    for (let position = -1; position <= value.length + 1; ++position) {
      inputs.push(`Q ${hex(value)} ${position}`);
      expected.push(String(GetQuoteEnd(v, position)));
      if (position >= 0)
        for (const [quote, inside, outside] of [
          [34, 0, 92],
          [34, 92, 92],
          [39, 0, 92],
          [34, 0, 0],
        ]) {
          inputs.push(`B ${hex(value)} ${position} ${quote} ${inside} ${outside}`);
          expected.push(String(Number(IsInQuote(v, position, quote, inside, outside))));
        }
    }
  } finally {
    v.dispose();
  }
}
const insertionMapper = new NumberFormatCodeMapper(),
  insertionOwner = new SvNFLanguageData(insertionMapper, 0x0409),
  insertionScanner = insertionOwner.GetFormatScanner();
try {
  for (const count of [0, 1, 3, 98, 99, 100])
    for (const empty of [false, true])
      for (const positionValue of [0, 1, 2, count, count + 1])
        for (const sourceIndex of [-1, 0, 1, 2]) {
          const position = [positionValue],
            literal = unicode("insert"),
            before = ["I", count, 65535, positionValue, sourceIndex, -7];
          insertionScanner.Reset();
          insertionScanner["nStringsCnt"] = count;
          insertionScanner["nResultStringsCnt"] = 65535;
          try {
            for (let i = 0; i < 100; ++i) {
              const value = unicode(`slot${i}`);
              try {
                insertionScanner["sStrArray"][i].assign(value);
              } finally {
                value.dispose();
              }
              insertionScanner["nTypeArray"][i] = empty && i === positionValue - 1 ? -10 : -1;
              before.push(insertionScanner["nTypeArray"][i], hex(insertionScanner["sStrArray"][i]));
            }
            before.push(hex(literal));
            const inserted = insertionScanner["InsertSymbol"](
                position,
                -7,
                sourceIndex < 0 ? literal : insertionScanner["sStrArray"][sourceIndex],
              ),
              out = [
                Number(inserted),
                position[0],
                insertionScanner["nStringsCnt"],
                insertionScanner["nResultStringsCnt"],
              ];
            for (let i = 0; i < 100; ++i)
              out.push(insertionScanner["nTypeArray"][i], hex(insertionScanner["sStrArray"][i]));
            inputs.push(before.join(" "));
            expected.push(out.join(" "));
          } finally {
            literal.dispose();
          }
        }
} finally {
  insertionOwner.dispose();
  insertionMapper.dispose();
}
const actual = execFileSync(`${build}/format-scan-witness`, [`${icu}/data/in`], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64e6,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Scan length ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`Scan ${i}: ${inputs[i]}\nnative ${actual[i]}\nlocal ${expected[i]}`);
console.log(
  `Matched ${actual.length} unchanged keyword/lexer/type/neighbor/quote method cases across ${requested.length} requested language IDs and all3 keyword policies.`,
);
