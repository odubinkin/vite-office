/** @fileoverview Executes unchanged pinned ScSingleRefData definitions against bounded native coordinate owners; portable Calc tests consume the generated fixture. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/tool/native-single-reference-cases.json";
const target = "output/playwright/calc-native";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Calc reference probe requires the exact pinned checkout.");
/** Reads and verifies the original bytes against the pinned Git blob. @param file - Upstream path. @returns Unchanged source text. */
function original(file) {
  const text = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    text
  )
    throw new Error(`Native reference source differs from pinned Git: ${file}`);
  return text;
}
/** Extracts an unchanged complete source interval. @param text - Source. @param first - Inclusive marker. @param last - Exclusive marker. @returns Original interval. */
function interval(text, first, last) {
  const begin = text.indexOf(first),
    end = text.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing native interval: ${first}`);
  return text.slice(begin, end);
}
/** Hashes original source bytes. @param text - UTF-8 source. @returns SHA256. */
function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}
const header = original("sc/inc/refdata.hxx"),
  source = original("sc/source/core/tool/refdata.cxx");
const address = original("sc/inc/address.hxx"),
  limits = original("sc/inc/sheetlimits.hxx"),
  types = original("sc/inc/types.hxx");
const referenceClass = interval(
  header,
  "struct SAL_DLLPUBLIC_RTTI ScSingleRefData",
  "/// Complex reference",
);
const definitions = interval(
  source,
  "void ScSingleRefData::InitAddress(",
  "#if DEBUG_FORMULA_COMPILER",
);
if (
  [...definitions.matchAll(/^(?:void|bool|ScAddress|SCROW|SCCOL|SCTAB) ScSingleRefData::/gm)]
    .length !== 30
)
  throw new Error("Expected all thirty complete non-debug single-reference definitions.");
const addressInline = interval(
  address,
  "    constexpr ScAddress() :",
  "    /**\n        @param  pSheetEndPos",
);
const addressEquality = interval(
  address,
  "    constexpr bool operator==(const ScAddress& rAddress)",
  "    constexpr auto operator<=>(const ScAddress& rh)",
);
const refAddressClass = interval(
  address,
  "class SAL_WARN_UNUSED ScRefAddress",
  "// Global functions",
);
const limitsClass = interval(limits, "struct ScSheetLimits final", "/* vim:set");
const driver = `
${header.slice(0, header.indexOf("#pragma once"))}
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <string>
#define SC_DLLPUBLIC
#define SAL_DLLPUBLIC_RTTI
#define SAL_WARN_UNUSED
#define DEBUG_FORMULA_COMPILER 0
using sal_Int32 = int32_t; using sal_Int16 = int16_t; using sal_uInt8 = uint8_t;
using OUString = std::string;
namespace salhelper { struct SimpleReferenceObject {}; }
${interval(types, "typedef sal_Int32 SCROW;", "typedef ::boost::intrusive_ptr<ScMatrix>")}
${interval(address, "constexpr SCROW MAXROWCOUNT =", "constexpr OUString MAXROW_STRING")}
const OUString MAXCOL_STRING = "XFD", MAXCOL_JUMBO_STRING = "XFD";
${interval(address, "[[nodiscard]] constexpr bool ValidCol(", "// The result of ConvertRef()")}
class ScDocument;
class ScAddress { SCROW nRow; SCCOL nCol; SCTAB nTab; public:
 enum Uninitialized { UNINITIALIZED }; enum InitializeInvalid { INITIALIZE_INVALID };
 struct Details {}; static const Details detailsOOOa1;
 ${addressInline}
 ${addressEquality}
};
${interval(address, "[[nodiscard]] constexpr bool ValidAddress(", "//  ScRange")}
struct ScRange { ScAddress aStart, aEnd; };
${interval(address, "[[nodiscard]] inline bool ValidRange(", "//  ScRangePair")}
${refAddressClass}
${limitsClass}
class ScDocument { ScSheetLimits limits{MAXCOL,MAXROW}; public:
 SCCOL MaxCol() const { return limits.MaxCol(); } SCROW MaxRow() const { return limits.MaxRow(); }
 SCTAB GetTableCount() const { return 3; } const ScSheetLimits& GetSheetLimits() const { return limits; }
};
${referenceClass}
${definitions}
void flags(ScSingleRefData& r, unsigned f) {
 r.SetColRel(f&1); r.SetColDeleted(f&2); r.SetRowRel(f&4); r.SetRowDeleted(f&8);
 r.SetTabRel(f&16); r.SetTabDeleted(f&32); r.SetFlag3D(f&64); r.SetRelName(f&128);
}
void raw(const ScSingleRefData& r) {
 ScSingleRefData v=r; v.SetColDeleted(false); v.SetRowDeleted(false); v.SetTabDeleted(false);
 std::cout << v.Col() << ',' << v.Row() << ',' << v.Tab() << ',' << unsigned(r.FlagValue());
}
void addr(const ScAddress& p) { std::cout << p.Col() << ',' << p.Row() << ',' << p.Tab(); }
int main() {
 ScDocument doc; const ScAddress pos(10,20,12);
 const ScAddress profiles[] = { ScAddress(0,0,0), ScAddress(MAXCOL,MAXROW,2),
  ScAddress(-MAXCOL,-MAXROW,-MAXTAB), ScAddress(MAXCOL+1,MAXROW+1,3),
  ScAddress(-MAXCOL-1,-MAXROW-1,-MAXTAB-1), ScAddress(-1,-1,-1),
  ScAddress(-2,7,-2), ScAddress(32760,31,32760) };
 bool first=true; std::cout << std::boolalpha << "{\\"values\\":[";
 for (const auto& p:profiles) for(unsigned f=0;f<256;++f) {
  ScSingleRefData r; r.InitAddress(p); flags(r,f);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; raw(r); std::cout << ','; addr(r.toAbs(doc,pos));
  std::cout << ',' << r.Col() << ',' << r.Row() << ',' << r.Tab() << ','
   << r.ColValid(doc) << ',' << r.RowValid(doc) << ',' << r.TabValid(doc) << ',' << r.Valid(doc) << ',' << r.ValidExternal(doc) << ']';
 }
 const ScAddress updates[] = {ScAddress(4,5,3),ScAddress(-1,MAXROW+1,MAXTAB+1),ScAddress(MAXCOL,MAXROW,MAXTAB),ScAddress(0,0,0)};
 first=true; std::cout << "],\\"addressUpdates\\":[";
 for(const auto& p:updates) for(unsigned f=0;f<256;++f) {
  ScSingleRefData r; r.InitAddress(2,3,1); flags(r,f);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; raw(r); std::cout << ','; addr(p);
  r.SetAddress(doc.GetSheetLimits(),p,pos); std::cout << ','; raw(r); std::cout << ']';
 }
 first=true; std::cout << "],\\"ordering\\":[";
 for(unsigned m1=0;m1<8;++m1) for(unsigned m2=0;m2<8;++m2) for(unsigned name=0;name<4;++name) for(unsigned swap=0;swap<8;++swap) {
  const unsigned f1=((m1&1)?1:0)|((m1&2)?4:0)|((m1&4)?16:0)|((name&1)?128:0)|((swap&1)?2:0)|((swap&2)?8:0)|((swap&4)?32:0)|((m1&1)?64:0);
  const unsigned f2=((m2&1)?1:0)|((m2&2)?4:0)|((m2&4)?16:0)|((name&2)?128:0)|((swap&1)?0:2)|((swap&2)?0:8)|((swap&4)?0:32)|((m2&1)?64:0);
  ScSingleRefData r1,r2;
  r1.InitAddress((m1&1)?2-pos.Col():2,(m1&2)?3-pos.Row():3,(m1&4)?1-pos.Tab():1); flags(r1,f1);
  const ScAddress p((swap&1)?1:4,(swap&2)?2:5,(swap&4)?0:2);
  r2.InitAddress((m2&1)?p.Col()-pos.Col():p.Col(),(m2&2)?p.Row()-pos.Row():p.Row(),(m2&4)?p.Tab()-pos.Tab():p.Tab()); flags(r2,f2);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; raw(r1); std::cout << ','; raw(r2);
  ScSingleRefData::PutInOrder(r1,r2,pos); std::cout << ','; raw(r1); std::cout << ','; raw(r2); std::cout << ']';
 }
 first=true; std::cout << "],\\"initializers\\":[";
 const ScAddress initializers[] = {updates[0],updates[1],updates[2],updates[3],pos};
 for(const auto& p:initializers) for(unsigned m=0;m<8;++m) {
  ScRefAddress input(p.Col(),p.Row(),p.Tab()); input.SetRelCol(m&1); input.SetRelRow(m&2); input.SetRelTab(m&4);
  ScSingleRefData r;
  if(!first) std::cout << ','; first=false;
  std::cout << '['; addr(p); std::cout << ',' << m << ',';
  r.InitFromRefAddress(doc,input,pos); raw(r); std::cout << ',';
  r.InitAddressRel(doc,p,pos); raw(r); std::cout << ']';
 }
 ScSingleRefData r; r.InitAddress(2,3,1); flags(r,255);
 std::cout << "],\\"mutations\\":[["; raw(r); std::cout << ']';
 r.InitFlags(); std::cout << ",["; raw(r); std::cout << ']';
 r.SetAbsCol(9); std::cout << ",["; raw(r); std::cout << ']';
 r.SetRelCol(-2); std::cout << ",["; raw(r); std::cout << ']';
 r.IncCol(1); std::cout << ",["; raw(r); std::cout << ']';
 r.SetAbsRow(11); std::cout << ",["; raw(r); std::cout << ']';
 r.SetRelRow(-3); std::cout << ",["; raw(r); std::cout << ']';
 r.IncRow(2); std::cout << ",["; raw(r); std::cout << ']';
 r.SetAbsTab(3); std::cout << ",["; raw(r); std::cout << ']';
 r.SetRelTab(-4); std::cout << ",["; raw(r); std::cout << ']';
 r.IncTab(3); std::cout << ",["; raw(r); std::cout << ']';
 r.SetAbsCol(32767); r.IncCol(1); std::cout << ",["; raw(r); std::cout << ']';
 ScSingleRefData copy=r;
 std::cout << "],\\"equalities\\":[" << (copy==r) << ',';
 copy.SetFlag3D(true); std::cout << (copy==r) << ',';
 copy=r; copy.IncCol(1); std::cout << (copy==r) << ',';
 copy=r; copy.IncRow(1); std::cout << (copy==r) << ',';
 copy=r; copy.IncTab(1); std::cout << (copy==r) << "]}";
}
`;
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "refdata-probe.cxx"),
  binary = path.join(target, "refdata-probe");
writeFileSync(cpp, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    cpp,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const cases = JSON.parse(
  execFileSync(path.resolve(binary), { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }),
);
const result = {
  baselineCommit: pinned,
  sourceHashes: {
    header: digest(header),
    source: digest(source),
    address: digest(address),
    limits: digest(limits),
    types: digest(types),
  },
  extractedHashes: {
    referenceClass: digest(referenceClass),
    definitions: digest(definitions),
    addressInline: digest(addressInline),
    addressEquality: digest(addressEquality),
    refAddressClass: digest(refAddressClass),
    limitsClass: digest(limitsClass),
  },
  bounds: [16383, 1048575, 3],
  position: [10, 20, 12],
  ...cases,
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, `${JSON.stringify(result, null, 2)}\n`);
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Calc single-reference fixture differs from pinned native execution.");
} else throw new Error("Usage: node scripts/calc-refdata-native-probe.mjs --write|--check");
console.log(
  `Pinned Calc single-reference probe: ${cases.values.length} flag/domain states, ${cases.addressUpdates.length} address updates, ${cases.ordering.length} ordering states; ASan/UBSan clean; ${mode}.`,
);
