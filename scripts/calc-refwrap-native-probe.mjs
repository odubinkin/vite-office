/** @fileoverview Compares original relative wrapping using unchanged pinned helper, reference data and numerical coordinates. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const mode = process.argv[2];
const fixture = "apps/office/src/sc/source/core/tool/native-relative-wrap-cases.json";
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
const updateHeader = original("sc/source/core/inc/refupdat.hxx");
const updateSource = original("sc/source/core/tool/refupdat.cxx");
const global = original("sc/inc/global.hxx");
const originalWrap = interval(
  updateSource,
  "template< typename R, typename U >",
  "template< typename R, typename S, typename U >\nstatic bool IsExpand",
);
const originalMove = interval(
  updateSource,
  "void ScRefUpdate::MoveRelWrap(",
  "void ScRefUpdate::DoTranspose(",
);
const originalUpdateHeader = interval(updateHeader, "enum ScRefUpdateRes", "/* vim:set");
const originalMode = interval(global, "enum UpdateRefMode", "enum FillDir");
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
using sal_Int64 = int64_t; using sal_Int32 = int32_t; using sal_Int16 = int16_t; using sal_uInt8 = uint8_t;
using OUString = std::string;
namespace sal { template<typename T,typename U> T static_int_cast(U v) { return static_cast<T>(v); } }
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
class ScDocument { ScSheetLimits limits; SCTAB count; public:
 ScDocument(SCCOL c, SCROW r, SCTAB t):limits(c,r),count(t){}
 SCCOL MaxCol() const { return limits.MaxCol(); } SCROW MaxRow() const { return limits.MaxRow(); }
 SCTAB GetTableCount() const { return count; } const ScSheetLimits& GetSheetLimits() const { return limits; }
};
${referenceClass}
${complexClass}
${definitions}
${complexDefinitions}
${originalMode}
class ScBigRange;
${originalUpdateHeader}
${originalWrap}
${originalMove}
void flags(ScSingleRefData& r, unsigned f) {
 r.SetColRel(f&1); r.SetColDeleted(f&2); r.SetRowRel(f&4); r.SetRowDeleted(f&8);
 r.SetTabRel(f&16); r.SetTabDeleted(f&32); r.SetFlag3D(f&64); r.SetRelName(f&128);
}
ScAddress readAddress() { int c,r,t;std::cin>>c>>r>>t;return ScAddress(c,r,t); }
void raw(const ScSingleRefData& r) {
 auto v=r; v.SetColDeleted(false);v.SetRowDeleted(false);v.SetTabDeleted(false);
 std::cout<<v.Col()<<','<<v.Row()<<','<<v.Tab()<<','<<unsigned(r.FlagValue());
}
void emit(const ScComplexRefData& r) { raw(r.Ref1);std::cout<<',';raw(r.Ref2);std::cout<<','<<r.IsTrimToData(); }
int main() { size_t n;std::cin>>n;std::cout<<'[';
 for(size_t i=0;i<n;++i) { if(i)std::cout<<',';int mc,mr,t,xc,xr,f1,f2,trim;std::cin>>mc>>mr>>t>>xc>>xr>>f1>>f2>>trim;
  ScDocument doc(mc,mr,t);auto pos=readAddress(),first=readAddress(),last=readAddress();
  ScComplexRefData ref;ref.InitRange(first.Col(),first.Row(),first.Tab(),last.Col(),last.Row(),last.Tab());flags(ref.Ref1,f1);flags(ref.Ref2,f2);ref.SetTrimToData(trim);
  ScRefUpdate::MoveRelWrap(doc,pos,xc,xr,ref);std::cout<<'[';emit(ref);std::cout<<']';
 }std::cout<<']';
}
`;
const cases = [];
const flagValues = [0, 1, 4, 16, 5, 17, 20, 21, 2, 8, 32, 42, 64, 128, 149, 255];
for (const bounds of [
  [15, 31, 3],
  [2, 4, 1],
  [16383, 1048575, 5],
]) {
  const [col, row, tab] = bounds;
  const profiles = [
    [0, 0, 0, 0, 0, 0],
    [1, 2, 1, 2, 3, 2],
    [2, 3, 2, 1, 2, 0],
    [-1, -1, -1, -1, -1, -1],
    [col, row, tab - 1, col, row, tab - 1],
    [col + 1, row + 1, tab, col + 1, row + 1, tab],
    [-col, -row, -tab, col, row, tab],
    [col, 0, 9, 0, row, 9999],
    [32767, 2147483600, 9999, 0, 0, -1],
    [0, 0, 0, col, row, tab - 1],
  ];
  for (const what of profiles)
    for (const position of [
      [0, 0, 0],
      [1, 2, 1],
    ])
      for (const first of flagValues)
        for (const last of flagValues)
          cases.push({
            bounds,
            mask: [Math.floor(col / 2), Math.floor(row / 2)],
            position,
            what,
            flags: [first, last],
            trim: (first & 128) !== 0,
          });
}
for (let f = 0; f < 256; f++)
  cases.push({
    bounds: [15, 31, 3],
    mask: [0, 0],
    position: [2, 3, 1],
    what: [0, 0, 9, 15, 31, 2],
    flags: [f, 255 - f],
    trim: (f & 128) !== 0,
  });
const input = [String(cases.length)];
for (const c of cases)
  input.push(
    [...c.bounds, ...c.mask, ...c.flags, Number(c.trim), ...c.position, ...c.what].join(" "),
  );
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "refwrap-probe.cxx"),
  binary = path.join(target, "refwrap-probe");
writeFileSync(cpp, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-DNDEBUG",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    cpp,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const outputs = JSON.parse(
  execFileSync(path.resolve(binary), {
    encoding: "utf8",
    input: input.join("\n"),
    maxBuffer: 32 * 1024 * 1024,
  }),
);
const originals = {
  originalWrap,
  originalMove,
  originalUpdateHeader,
  originalMode,
  referenceClass,
  definitions,
  complexClass,
  complexDefinitions,
  addressInline,
  addressEquality,
  refAddressClass,
  limitsClass,
  rangeInline,
  rangeOrder,
};
const result = {
  baselineCommit: pinned,
  sourceHashes: {
    header: digest(header),
    source: digest(source),
    address: digest(address),
    limits: digest(limits),
    types: digest(types),
    updateHeader: digest(updateHeader),
    updateSource: digest(updateSource),
    global: digest(global),
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes unchanged extracted owners. @param entry - Name and bytes. @returns Hash pair. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Pairs input with native output. @param value - Input. @param index - Native order. @returns Fixture record. */ (
      value,
      index,
    ) => ({ ...value, output: outputs[index] }),
  ),
};
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Relative wrapping native fixture differs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned ScRefUpdate MoveRelWrap: ${cases.length} cases; unchanged original bodies; ASan/UBSan clean; ${mode}.`,
);
