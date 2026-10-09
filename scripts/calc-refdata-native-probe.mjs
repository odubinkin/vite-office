/** @fileoverview Executes unchanged pinned ScSingleRefData definitions against bounded native coordinate owners; portable Calc tests consume the generated fixture. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const mode = process.argv[2];
const complexMode = mode === "--complex-write" || mode === "--complex-check";
const fixture = complexMode
  ? "apps/office/src/sc/source/core/tool/native-complex-reference-cases.json"
  : "apps/office/src/sc/source/core/tool/native-single-reference-cases.json";
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
const complexClass = interval(header, "struct ScComplexRefData", "/* vim:set");
const complexDefinitions = interval(
  source,
  "void ScComplexRefData::InitFromRefAddresses(",
  "#if DEBUG_FORMULA_COMPILER",
);
if (
  [...complexDefinitions.matchAll(/^(?:void|bool|ScRange|ScComplexRefData&) ScComplexRefData::/gm)]
    .length !== 14
)
  throw new Error("Expected all fourteen complete non-debug complex-reference definitions.");
const rangeInline = interval(address, "    ScRange() :", "    inline bool Contains(");
const rangeOrder = interval(address, "    void PutInOrder() { aStart.PutInOrder(aEnd); }", "\n\n");
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
struct ScRange { ScAddress aStart, aEnd;
 ${rangeInline}
 ${rangeOrder}
};
${interval(address, "[[nodiscard]] inline bool ValidRange(", "//  ScRangePair")}
${refAddressClass}
${limitsClass}
class ScDocument { ScSheetLimits limits{MAXCOL,MAXROW}; public:
 SCCOL MaxCol() const { return limits.MaxCol(); } SCROW MaxRow() const { return limits.MaxRow(); }
 SCTAB GetTableCount() const { return 3; } const ScSheetLimits& GetSheetLimits() const { return limits; }
};
${referenceClass}
${complexClass}
${definitions}
${complexDefinitions}
void flags(ScSingleRefData& r, unsigned f) {
 r.SetColRel(f&1); r.SetColDeleted(f&2); r.SetRowRel(f&4); r.SetRowDeleted(f&8);
 r.SetTabRel(f&16); r.SetTabDeleted(f&32); r.SetFlag3D(f&64); r.SetRelName(f&128);
}
void raw(const ScSingleRefData& r) {
 ScSingleRefData v=r; v.SetColDeleted(false); v.SetRowDeleted(false); v.SetTabDeleted(false);
 std::cout << v.Col() << ',' << v.Row() << ',' << v.Tab() << ',' << unsigned(r.FlagValue());
}
void addr(const ScAddress& p) { std::cout << p.Col() << ',' << p.Row() << ',' << p.Tab(); }

void range(const ScRange& r) { addr(r.aStart); std::cout << ','; addr(r.aEnd); }
void complex(const ScComplexRefData& r) { raw(r.Ref1); std::cout << ','; raw(r.Ref2); std::cout << ',' << r.IsTrimToData(); }
ScSingleRefData at(const ScAddress& p, unsigned f, const ScAddress& pos) {
 ScSingleRefData r; r.InitAddress((f&1)?p.Col()-pos.Col():p.Col(),(f&4)?p.Row()-pos.Row():p.Row(),(f&16)?p.Tab()-pos.Tab():p.Tab()); flags(r,f); return r;
}
void complexCases(const ScDocument& doc, const ScAddress& pos) {
 const auto& limits=doc.GetSheetLimits();
 const unsigned allFlags[]={0,1,4,16,21,64,128,42,2,8,32,255,192,80,132,129};
 const unsigned extensionFlags[]={0,21,16,64,80,85,128,149,42,255};
 const ScRange profiles[]={ScRange(2,3,1,4,5,2),ScRange(8,9,2,1,2,0),
  ScRange(0,0,-1,1,1,-1),ScRange(0,0,-1,1,1,0),ScRange(0,0,0,1,1,-1),
  ScRange(0,0,0,MAXCOL+1,1,1),ScRange(0,-1,0,1,1,1),ScRange(0,0,MAXTAB,1,MAXROW+1,MAXTAB+1),
  ScRange(2,0,0,4,MAXROW,0),ScRange(0,3,0,MAXCOL,5,0),ScRange(0,0,0,MAXCOL,MAXROW,0),ScRange(2,3,1,2,3,1)};
 bool first=true; std::cout << "{\\"properties\\":[";
 for(const auto& p:profiles) for(unsigned f1:allFlags) for(unsigned f2:allFlags) {
  ScComplexRefData r; r.InitRange(p); flags(r.Ref1,f1); flags(r.Ref2,f2); r.SetTrimToData(f1&128);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; complex(r); std::cout << ','; range(r.toAbs(doc,pos));
  std::cout << ',' << r.Valid(doc) << ',' << r.ValidExternal(doc) << ',' << r.IsEntireCol(limits) << ',' << r.IsEntireRow(limits) << ',' << r.IsDeleted() << ',';
  r.PutInOrder(pos); complex(r); std::cout << ']';
 }
 const ScAddress points[]={ScAddress(1,2,0),ScAddress(3,4,1),ScAddress(6,7,3),ScAddress(4,5,2)};
 first=true; std::cout << "],\\"extensions\\":[";
 for(unsigned f1:extensionFlags) for(unsigned f2:extensionFlags) for(unsigned f:allFlags) for(const auto& p:points) {
  ScComplexRefData r; r.Ref1=at(ScAddress(2,3,1),f1,pos); r.Ref2=at(ScAddress(4,5,2),f2,pos); r.SetTrimToData(f&128);
  ScSingleRefData extra=at(p,f,pos);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; complex(r); std::cout << ','; raw(extra);
  r.Extend(limits,extra,pos); std::cout << ','; complex(r); std::cout << ']';
 }
 first=true; std::cout << "],\\"rangeExtensions\\":[";
 for(unsigned f1:extensionFlags) for(unsigned f2:extensionFlags) for(unsigned f:allFlags) {
  ScComplexRefData r,extra; r.Ref1=at(ScAddress(2,3,1),f1,pos); r.Ref2=at(ScAddress(4,5,2),f2,pos); r.SetTrimToData(f1&128);
  extra.Ref1=at(ScAddress(1,2,0),f,pos); extra.Ref2=at(ScAddress(6,7,3),f2,pos); extra.SetTrimToData(f&128);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; complex(r); std::cout << ','; complex(extra);
  r.Extend(limits,extra,pos); std::cout << ','; complex(r); std::cout << ']';
 }
 const ScRange stickyProfiles[]={ScRange(2,3,0,4,5,1),ScRange(2,3,0,MAXCOL,MAXROW,1),
  ScRange(MAXCOL,MAXROW,0,MAXCOL,MAXROW,0),ScRange(2,3,0,MAXCOL+1,MAXROW+1,1),
  ScRange(4,5,1,2,3,0),ScRange(0,0,0,MAXCOL,MAXROW,0),ScRange(2,3,0,32766,MAXROW-1,1)};
 first=true; std::cout << "],\\"sticky\\":[";
 for(const auto& p:stickyProfiles) for(unsigned m1=0;m1<4;++m1) for(unsigned m2=0;m2<4;++m2) for(unsigned deleted:{0,42}) for(unsigned axis:{0,1}) for(int delta:{-3,0,1,3}) {
  ScComplexRefData r; const unsigned f1=((m1&1)?1:0)|((m1&2)?4:0), f2=((m2&1)?1:0)|((m2&2)?4:0)|deleted;
  r.Ref1=at(p.aStart,f1,pos); r.Ref2=at(p.aEnd,f2,pos); r.SetTrimToData(m1&1);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; complex(r); std::cout << ',' << axis << ',' << delta << ',';
  bool changed=axis?r.IncEndRowSticky(doc,delta,pos):r.IncEndColSticky(doc,delta,pos);
  std::cout << changed << ','; complex(r); std::cout << ']';
 }
 const ScRange initializers[]={profiles[0],profiles[1],profiles[7],ScRange(10,20,12,10,20,12)};
 first=true; std::cout << "],\\"initializers\\":[";
 for(const auto& p:initializers) for(unsigned m1=0;m1<8;++m1) for(unsigned m2=0;m2<8;++m2) {
  ScRefAddress a(p.aStart.Col(),p.aStart.Row(),p.aStart.Tab()),b(p.aEnd.Col(),p.aEnd.Row(),p.aEnd.Tab());
  a.SetRelCol(m1&1); a.SetRelRow(m1&2); a.SetRelTab(m1&4);
  b.SetRelCol(m2&1); b.SetRelRow(m2&2); b.SetRelTab(m2&4);
  ScComplexRefData r; r.SetTrimToData(m1&1);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; range(p); std::cout << ',' << m1 << ',' << m2 << ',' << r.IsTrimToData() << ',';
  r.InitFromRefAddresses(doc,a,b,pos); complex(r); std::cout << ']';
 }
 first=true; std::cout << "],\\"rangeInitializers\\":[";
 for(const auto& p:profiles) for(unsigned mode:{0,1,2}) {
  ScComplexRefData r; r.SetTrimToData(true);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; range(p); std::cout << ',' << mode << ',';
  if(mode==0) r.InitRange(p.aStart.Col(),p.aStart.Row(),p.aStart.Tab(),p.aEnd.Col(),p.aEnd.Row(),p.aEnd.Tab());
  else if(mode==1) r.InitRangeRel(doc,p,pos);
  else {r.InitRange(p); flags(r.Ref1,255); flags(r.Ref2,255); r.InitFlags();}
  complex(r); std::cout << ']';
 }
 first=true; std::cout << "],\\"aliasing\\":[";
 for(unsigned f1:extensionFlags) for(unsigned f2:extensionFlags) for(unsigned mode:{0,1,2}) {
  ScComplexRefData r; r.Ref1=at(ScAddress(2,3,1),f1,pos); r.Ref2=at(ScAddress(4,5,2),f2,pos); r.SetTrimToData(true);
  if(!first) std::cout << ','; first=false;
  std::cout << '['; complex(r); std::cout << ',' << mode << ',';
  if(mode==0) r.Extend(limits,r,pos); else if(mode==1) r.Extend(limits,r.Ref1,pos); else r.Extend(limits,r.Ref2,pos);
  complex(r); std::cout << ']';
 }
 ScComplexRefData r; r.InitRange(2,3,1,4,5,2); ScComplexRefData copy=r;
 std::cout << "],\\"equalities\\":[" << (copy==r) << ',';
 copy.SetTrimToData(true); std::cout << (copy==r) << ',';
 copy.Ref1.IncCol(1); std::cout << (copy==r) << ',';
 copy=r; copy.Ref2.IncRow(1); std::cout << (copy==r) << "]}";
}

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
 copy=r; copy.IncTab(1); std::cout << (copy==r) << "],\\"complex\\":"; complexCases(doc,pos); std::cout << "}";
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
    ...(complexMode
      ? {
          complexClass: digest(complexClass),
          complexDefinitions: digest(complexDefinitions),
          rangeInline: digest(rangeInline),
          rangeOrder: digest(rangeOrder),
        }
      : {}),
  },
  bounds: [16383, 1048575, 3],
  position: [10, 20, 12],
  ...(complexMode
    ? cases.complex
    : {
        values: cases.values,
        addressUpdates: cases.addressUpdates,
        ordering: cases.ordering,
        initializers: cases.initializers,
        mutations: cases.mutations,
        equalities: cases.equalities,
      }),
};
if (mode === "--write" || mode === "--complex-write")
  writeFileSync(fixture, `${JSON.stringify(result, null, 2)}\n`);
else if (mode === "--check" || mode === "--complex-check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Calc single-reference fixture differs from pinned native execution.");
} else
  throw new Error(
    "Usage: node scripts/calc-refdata-native-probe.mjs --write|--check|--complex-write|--complex-check",
  );
console.log(
  complexMode
    ? `Pinned Calc complex-reference probe: ${cases.complex.properties.length} properties, ${cases.complex.extensions.length} extensions, ${cases.complex.rangeExtensions.length} range extensions, ${cases.complex.sticky.length} sticky cases; ASan/UBSan clean; ${mode}.`
    : `Pinned Calc single-reference probe: ${cases.values.length} flag/domain states, ${cases.addressUpdates.length} address updates, ${cases.ordering.length} ordering states; ASan/UBSan clean; ${mode}.`,
);
