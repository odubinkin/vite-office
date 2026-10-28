/** @fileoverview Compares unchanged pinned zforlist.cxx builtin table/index/default-search bodies with actual local table owners. The native fixture supplies only scalar entry metadata methods and std::map storage; format parsing, locale generation and output are not certified by this witness. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  SvNFFormatData,
  SvNumberFormatter,
} from "../apps/office/src/svl/source/numbers/zforlist.ts";
import { OUString } from "../apps/office/src/sal/inc/rtl/ustring.ts";
import { SvNumberformat } from "../apps/office/src/svl/source/numbers/zformat.ts";
import {
  ImpGetFormatIndex,
  GetIndexTableOffset,
  ImpGetSearchOffset,
  ImpGetDefaultFormat,
} from "../apps/office/src/svl/source/numbers/zforlist.index.ts";
import { SvNumFormatType as T } from "../apps/office/src/svl/inc/zforlist.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = readFileSync("vendor/libreoffice-reference/svl/source/numbers/zforlist.cxx", "utf8"),
  header = readFileSync("vendor/libreoffice-reference/include/svl/zforlist.hxx", "utf8");
/** Extracts an unchanged source function whose body has no brace-bearing literals. @param signature - Exact original declaration prefix. @returns Complete original function. */
function body(signature) {
  const start = source.indexOf(signature);
  if (start < 0) throw Error(signature);
  const brace = source.indexOf("{", start);
  let depth = 1,
    end = brace + 1;
  for (; depth && end < source.length; ++end) {
    if (source[end] === "{") depth++;
    else if (source[end] === "}") depth--;
  }
  if (depth) throw Error("Unclosed " + signature);
  return source.slice(start, end);
}
const enumStart = header.indexOf("enum NfIndexTableOffset\n{"),
  enumEnd = header.indexOf("};", enumStart) + 2,
  definesStart = source.indexOf("// Constants for type offsets"),
  definesEnd = source.indexOf("static_assert(", definesStart),
  tableStart = source.indexOf("sal_uInt32 const indexTable["),
  tableEnd = source.indexOf("};", tableStart) + 2;
writeFileSync(
  `${build}/format-index-witness.cc`,
  String.raw`
#include <cstdint>
#include <iostream>
#include <map>
#include <memory>
using sal_uInt16=uint16_t;using sal_uInt32=uint32_t;
constexpr sal_uInt32 NUMBERFORMAT_ENTRY_NOT_FOUND=0xffffffff,SV_COUNTRY_LANGUAGE_OFFSET=10000,SV_MAX_COUNT_STANDARD_FORMATS=100;
enum class SvNumFormatType{ALL=0,DEFINED=1,DATE=2,TIME=4,CURRENCY=8,NUMBER=16,SCIENTIFIC=32,FRACTION=64,PERCENT=128,TEXT=256,DATETIME=6,LOGICAL=1024,UNDEFINED=2048,EMPTY=4096,DURATION=8196};
struct SvNumberformat{bool standard;SvNumFormatType type;bool IsStandard()const{return standard;}SvNumFormatType GetMaskedType()const{return type;}};
struct SvNFFormatData{std::map<sal_uInt32,std::unique_ptr<SvNumberformat>>aFTable;};
struct SvNFEngine{static sal_uInt32 ImpGetDefaultFormat(const SvNFFormatData&,SvNumFormatType,sal_uInt32);};
` +
    header.slice(enumStart, enumEnd) +
    source.slice(definesStart, definesEnd) +
    source.slice(tableStart, tableEnd) +
    String.raw`
struct SvNumberFormatter{static NfIndexTableOffset GetIndexTableOffset(sal_uInt32);};
` +
    body("    sal_uInt32 ImpGetFormatIndex(") +
    body("NfIndexTableOffset SvNumberFormatter::GetIndexTableOffset(") +
    body("static sal_uInt32 ImpGetSearchOffset(") +
    body(
      "sal_uInt32 SvNFEngine::ImpGetDefaultFormat(const SvNFFormatData& rFormatData, SvNumFormatType nType,",
    ) +
    String.raw`
int main(){char op;uint32_t key,offset,type,n,standard;while(std::cin>>op>>key){if(op=='I')std::cout<<SvNumberFormatter::GetIndexTableOffset(key);else if(op=='K'){std::cin>>offset;std::cout<<ImpGetFormatIndex(static_cast<NfIndexTableOffset>(key),offset);}else if(op=='S'){std::cin>>offset;std::cout<<ImpGetSearchOffset(static_cast<SvNumFormatType>(key),offset);}else{offset=key;std::cin>>type>>n;SvNFFormatData table;for(uint32_t i=0;i<n;++i){uint32_t t;std::cin>>key>>t>>standard;table.aFTable.emplace(key,std::make_unique<SvNumberformat>(SvNumberformat{bool(standard),static_cast<SvNumFormatType>(t)}));}std::cout<<SvNFEngine::ImpGetDefaultFormat(table,static_cast<SvNumFormatType>(type),offset);}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  ["-std=c++17", `${build}/format-index-witness.cc`, "-o", `${build}/format-index-witness`],
  { stdio: "inherit" },
);
const inputs = [],
  expected = [];
for (let key = 0; key < 30105; ++key) {
  inputs.push("I " + key);
  expected.push(String(GetIndexTableOffset(key)));
}
for (const key of [0xffffffff, 0x80000000, 0xfffffff0]) {
  inputs.push("I " + key);
  expected.push(String(GetIndexTableOffset(key)));
}
for (let key = 0; key < 256; ++key)
  for (const offset of [0, 1, 10000, 20000, 0xffffd8f0, 0xffffffff]) {
    inputs.push(`K ${key} ${offset}`);
    expected.push(String(ImpGetFormatIndex(key, offset)));
  }
const formatter = new SvNumberFormatter(0x0409),
  original = formatter.GetEntry(0),
  types = Object.values(T);
try {
  for (const offset of [0, 10000, 20000, 0xffffd8f0])
    for (const type of types) {
      inputs.push(`S ${type} ${offset}`);
      expected.push(String(ImpGetSearchOffset(type, offset)));
      for (const entries of [
        [],
        [[37, T.DATE, 1]],
        [
          [0, T.NUMBER, 1],
          [37, T.DATE, 1],
        ],
        [
          [0, T.NUMBER, 1],
          [32, T.DATE, 0],
          [37, T.DATE, 1],
        ],
        [
          [0, T.NUMBER, 1],
          [37, T.DATE, 1],
          [32, T.DATE, 1],
        ],
        [
          [0, T.NUMBER, 1],
          [10000, T.DATE, 1],
        ],
        [
          [0, T.NUMBER, 0],
          [60, T.TIME, 0],
        ],
        [
          [0, T.NUMBER, 1],
          [99, T.LOGICAL, 1],
          [100, T.TEXT, 1],
        ],
      ]) {
        const table = new SvNFFormatData(),
          rows = entries.map(
            /** Applies explicit locale-block positions to metadata input. @param entry - Relative key/type/standard. @returns Exact native fields. */ ([
              key,
              t,
              standard,
            ]) => [(offset + key) >>> 0, t, standard],
          );
        try {
          for (const [key, t, standard] of rows) {
            const code = new OUString(original.GetFormatstring()),
              check = [0];
            let entry;
            try {
              entry = new SvNumberformat(
                code,
                original["rScan"],
                original["rScan"].GetCurrentLanguageData().pStringScanner,
                original["rScan"].getColorCallback().GetNatNum(),
                check,
                [0x0409],
              );
              if (check[0] !== 0) throw Error("General fixture did not compile");
            } finally {
              code.dispose();
            }
            entry.SetType(t);
            if (standard) entry.SetStandard();
            table.InsertStandardFormat(key, entry);
          }
          inputs.push(["D", offset, type, rows.length, ...rows.flat()].join(" "));
          expected.push(String(ImpGetDefaultFormat(table, type, offset)));
        } finally {
          table.dispose();
        }
      }
    }
} finally {
  formatter.dispose();
}
const actual = execFileSync(`${build}/format-index-witness`, [], {
  input: inputs.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 4e6,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error("Index witness length");
for (let i = 0; i < actual.length; ++i)
  if (actual[i] !== expected[i])
    throw Error(`Index ${i}: ${inputs[i]}\nnative ${actual[i]},local ${expected[i]}`);
console.log(
  `Matched ${actual.length} unchanged builtin-index, runtime-key, search-offset and exact-start default-selection cases.`,
);
