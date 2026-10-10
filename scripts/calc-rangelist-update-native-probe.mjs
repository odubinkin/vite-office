/** @fileoverview Compares unchanged pinned ScRangeList UpdateReference pipeline; saved portable fixtures need no native compiler or upstream checkout. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/tool/native-range-list-update-cases.json";
const target = "output/playwright/calc-native";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Calc range-list probe requires the exact pinned checkout.");
/** Reads exact original bytes checked against Git. @param file - Upstream path. @returns Original text. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    source
  )
    throw new Error(`Native range-list source differs from pinned Git: ${file}`);
  return source;
}
/** Extracts a complete unchanged source interval. @param source - Original text. @param first - Inclusive marker. @param last - Exclusive marker. @returns Unchanged interval. */
function interval(source, first, last) {
  const begin = source.indexOf(first),
    end = source.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing original range-list interval: ${first}`);
  return source.slice(begin, end);
}
/** Hashes exact original bytes. @param source - Text. @returns SHA256. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
const header = original("sc/inc/rangelst.hxx"),
  source = original("sc/source/core/tool/rangelst.cxx");
const address = original("sc/inc/address.hxx"),
  types = original("sc/inc/types.hxx");
const originals = {
  listClass: interval(
    header,
    "class SAL_WARN_UNUSED SC_DLLPUBLIC ScRangeList",
    "typedef tools::SvRef<ScRangeList>",
  ),
  destructor: interval(source, "ScRangeList::~ScRangeList()", "ScRefFlags ScRangeList::Parse("),
  queryHelpers: interval(source, "namespace {", "//  ScRangeList"),
  joins: interval(source, "void ScRangeList::Join(", "bool ScRangeList::UpdateReference("),
  edits: interval(source, "void ScRangeList::InsertRow(", "//  ScRangePairList"),
  addressInline: interval(
    address,
    "    constexpr ScAddress() :",
    "    /**\n        @param  pSheetEndPos",
  ),
  addressComparison: interval(
    address,
    "    constexpr bool operator==(const ScAddress&",
    "    size_t hash() const",
  ),
  rangeInline: interval(address, "    ScRange() :", "    inline bool Contains("),
  rangeOrder: interval(address, "    void PutInOrder() { aStart.PutInOrder(aEnd); }", "\n\n"),
  rangeGeometry: interval(
    address,
    "inline void ScRange::GetVars(",
    "inline size_t ScRange::hashArea()",
  ),
};

const updateSource = original("sc/source/core/tool/refupdat.cxx");
const updateHeader = original("sc/source/core/inc/refupdat.hxx");
const global = original("sc/inc/global.hxx");
originals.listUpdate = interval(
  source,
  "bool ScRangeList::UpdateReference(",
  "void ScRangeList::InsertRow(",
);
originals.mode = interval(global, "enum UpdateRefMode", "enum FillDir");
originals.updateHeader = interval(updateHeader, "enum ScRefUpdateRes", "/* vim:set");
originals.helpers = interval(
  updateSource,
  "template< typename R, typename S, typename U >",
  "template< typename R, typename U >",
);
originals.expansion = interval(
  updateSource,
  "template< typename R, typename S, typename U >\nstatic bool IsExpand",
  "static bool lcl_IsWrapBig",
);
originals.scalarUpdate = interval(
  updateSource,
  "ScRefUpdateRes ScRefUpdate::Update( const ScDocument&",
  "// simple UpdateReference",
);
const driver = `
${header.slice(0, header.indexOf("#pragma once"))}
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#include <string_view>
#include <tuple>
#include <utility>
#include <vector>
#define SAL_WARN_UNUSED
#define SC_DLLPUBLIC
#define OSL_ENSURE(...)
#define SAL_WARN_IF(...)
using sal_Int64=int64_t; using sal_Int32=int32_t; using sal_Int16=int16_t; using sal_uInt64=uint64_t; using sal_Unicode=char16_t;
using OUString=std::string; using SCSIZE=size_t;
${interval(types, "typedef sal_Int32 SCROW;", "typedef ::boost::intrusive_ptr<ScMatrix>")}
${interval(address, "template <typename T> constexpr void PutInOrder", "// The result of ConvertRef()")}
class ScAddress { SCROW nRow; SCCOL nCol; SCTAB nTab; public:
 enum Uninitialized { UNINITIALIZED }; enum InitializeInvalid { INITIALIZE_INVALID };
 ${originals.addressInline}
 ${originals.addressComparison}
};
class ScRange { public: ScAddress aStart,aEnd;
 ${originals.rangeInline}
 ${originals.rangeOrder}
 inline void GetVars(SCCOL&,SCROW&,SCTAB&,SCCOL&,SCROW&,SCTAB&) const;
 inline bool operator==(const ScRange&) const;
 inline bool operator!=(const ScRange&) const;
 inline bool operator<(const ScRange&) const;
 inline bool operator<=(const ScRange&) const;
 inline bool Contains(const ScAddress&) const;
 inline bool Contains(const ScRange&) const;
 inline bool Intersects(const ScRange&) const;
};
${originals.rangeGeometry}
namespace sal { template<typename T,typename U> T static_int_cast(U v) { return static_cast<T>(v); } }
class ScDocument { SCCOL col;SCROW row;SCTAB count;bool expand;public:
 ScDocument(SCCOL c,SCROW r,SCTAB t,bool e):col(c),row(r),count(t),expand(e){}
 SCCOL MaxCol() const{return col;}SCROW MaxRow() const{return row;}SCTAB GetTableCount() const{return count;}bool IsExpandRefs() const{return expand;}
};
class ScBigRange;struct ScComplexRefData;
${originals.mode}
${originals.updateHeader}
${originals.helpers}
${originals.expansion}
${originals.scalarUpdate}
enum class ScRefFlags : uint16_t {};

namespace formula { struct FormulaGrammar { enum AddressConvention { CONV_OOO }; }; }
struct SvRefBase { SvRefBase()=default; SvRefBase(const SvRefBase&)=default; virtual ~SvRefBase()=default; };
${originals.listClass}
${originals.queryHelpers}
${originals.destructor}
${originals.joins}
${originals.edits}
${originals.listUpdate}
ScRange readRange() { int c1,r1,t1,c2,r2,t2;std::cin>>c1>>r1>>t1>>c2>>r2>>t2;return ScRange(c1,r1,t1,c2,r2,t2); }
void range(const ScRange& r) { std::cout<<'['<<r.aStart.Col()<<','<<r.aStart.Row()<<','<<r.aStart.Tab()<<','<<r.aEnd.Col()<<','<<r.aEnd.Row()<<','<<r.aEnd.Tab()<<']'; }
void list(const ScRangeList& l) { std::cout<<'[';bool first=true;for(const auto& r:l){if(!first)std::cout<<',';first=false;range(r);}std::cout<<']'; }
int main() { size_t n;std::cin>>n;std::cout<<std::boolalpha<<'[';for(size_t i=0;i<n;++i){
 if(i)std::cout<<',';ScRangeList l;size_t initial;std::cin>>initial;for(size_t j=0;j<initial;++j)l.push_back(readRange());
 int mc,mr,t,e,m;std::cin>>mc>>mr>>t>>e>>m;ScDocument doc(mc,mr,t,e);auto where=readRange();int64_t dx,dy,dz;std::cin>>dx>>dy>>dz;if(!std::cin)return 2;
 bool changed=l.UpdateReference(static_cast<UpdateRefMode>(m),doc,where,dx,dy,dz);
 std::cout<<"{\\"changed\\":"<<changed<<",\\"ranges\\":";list(l);std::cout<<",\\"count\\":\\""<<l.GetCellCount()<<"\\",\\"joined\\":[";
 size_t joins;std::cin>>joins;for(size_t j=0;j<joins;++j){if(j)std::cout<<',';l.Join(readRange());list(l);}if(!std::cin)return 2;std::cout<<"]}";
 }std::cout<<']';}
`;
/** Forms an unchanged six-coordinate numerical range. @param c1 - First column. @param r1 - First row. @param c2 - Last column. @param r2 - Last row. @param t1 - First sheet. @param t2 - Last sheet. @returns Native coordinates. */
function rect(c1, r1, c2, r2, t1 = 0, t2 = t1) {
  return [c1, r1, t1, c2, r2, t2];
}
const cases = [];
/** Adds independent initial storage, a native update and public cache-sensitive follow-ups. @param initial - Ordered values. @param mode - Native mode. @param where - Update area. @param delta - Displacement. @param expand - Policy getter. @param bounds - Other document getters. @param joins - Following joins. @returns Nothing. */
function add(
  initial,
  mode,
  where,
  delta,
  expand = false,
  bounds = [7, 9, 4],
  joins = [rect(1, 5, 4, 6), rect(0, 10, 7, 11)],
) {
  cases.push({ initial, bounds, expand, mode, where, delta, joins });
}
const initials = [
  [],
  [rect(1, 1, 4, 4)],
  [rect(0, 0, 7, 9)],
  [rect(2, 2, 2, 2)],
  [rect(2, 2, 2, 8), rect(4, 2, 4, 8)],
  [rect(1, 1, 4, 2), rect(1, 3, 4, 4), rect(1, 5, 4, 6)],
  [rect(1, 1, 3, 3), rect(1, 1, 3, 3), rect(2, 2, 4, 4)],
  [rect(1, 1, 4, 4, 0, 2), rect(5, 5, 7, 9, 1)],
];
for (const axis of [0, 1, 2])
  for (const mode of [0, 1, 2, 3])
    for (const expand of [false, true])
      for (const first of [0, 1, 2, 3, 4, 8, 10])
        for (const value of [-3, -1, 0, 1, 3])
          for (const initial of initials) {
            const where = rect(0, 0, 7, 9, 0, 3),
              delta = [0, 0, 0];
            where[axis] = first;
            where[axis + 3] = Math.max(first, axis === 0 ? 7 : axis === 1 ? 9 : 3);
            if (axis !== 2) where[5] = 0;
            delta[axis] = value;
            add(initial, mode, where, delta, expand);
          }
let seed = 0x49ce1713;
/** Samples a deterministic native input profile independently of the port. @param values - Domain. @returns Selected value. */
function pick(values) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return values[seed % values.length];
}
for (let i = 0; i < 8192; ++i) {
  const where = rect(
    pick([-1, 0, 1, 3, 5, 7]),
    pick([-1, 0, 2, 3, 5, 9]),
    pick([0, 3, 7, 10]),
    pick([0, 4, 9, 12]),
    pick([0, 1]),
    pick([0, 1, 3]),
  );
  add(
    pick(initials),
    pick([0, 1, 2, 3]),
    where,
    [pick([-3, -1, 0, 1, 3]), pick([-3, -1, 0, 1, 3]), pick([-1, 0, 1])],
    i % 2 === 0,
  );
}
// Original ucalc_rangelst deletion assertions, complete deletion, native changed overwrite and backward multi-item Join protection.
add([rect(1, 1, 4, 4)], 0, rect(0, 3, 7, 9), [0, -1, 0]);
add([rect(2, 2, 2, 2)], 0, rect(0, 3, 7, 9), [0, -1, 0]);
add([rect(2, 2, 2, 8), rect(4, 2, 4, 8)], 0, rect(2, 5, 7, 9), [0, -1, 0]);
add([rect(0, 0, 7, 9)], 0, rect(14, 3, 7, 7), [0, -2, 0]);
add([rect(1, 1, 4, 4)], 0, rect(0, 4, 7, 4), [0, -1, 0]);
add([rect(1, 1, 4, 4)], 0, rect(3, 0, 7, 9), [-1, 0, 0]);
add([rect(2, 3, 2, 3), rect(0, 0, 0, 0)], 0, rect(3, 3, 7, 9), [-1, -1, 0]);
add([rect(1, 1, 4, 2), rect(1, 3, 4, 4), rect(1, 5, 4, 6)], 0, rect(10, 10, 12, 12), [-1, 0, 0]);
// Native parameter conversion for signed16 columns/sheets and defined signed32 rows.
for (const mode of [0, 1, 2, 3])
  for (const delta of [
    [65535, 0, 0],
    [65536, 0, 0],
    [0, 0, 65535],
    [0, 4294967296, 0],
  ])
    add([rect(1, 1, 4, 4)], mode, rect(3, 3, 7, 9), delta);
for (const col of [-32768, 32767]) add([rect(0, 0, 1, 1)], 0, rect(col, 0, col, 9), [-1, 0, 0]);
const input = [String(cases.length)];
for (const c of cases) {
  input.push(String(c.initial.length));
  for (const r of c.initial) input.push(r.join(" "));
  input.push(
    [...c.bounds, Number(c.expand), c.mode, ...c.where, ...c.delta, c.joins.length].join(" "),
  );
  for (const r of c.joins) input.push(r.join(" "));
}
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "rangelist-update-probe.cxx"),
  binary = path.join(target, "rangelist-update-probe");
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
const outputs = JSON.parse(
  execFileSync(path.resolve(binary), {
    encoding: "utf8",
    input: input.join("\n"),
    maxBuffer: 64 * 1024 * 1024,
  }),
);
const result = {
  baselineCommit: pinned,
  sourceHashes: {
    header: digest(header),
    source: digest(source),
    address: digest(address),
    types: digest(types),
    updateHeader: digest(updateHeader),
    updateSource: digest(updateSource),
    global: digest(global),
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes exact unchanged source groups. @param entry - Name and body. @returns Hash pair. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Attaches original compiled outputs. @param state - Initialized inputs. @param index - Native order. @returns Fixture case. */ (
      state,
      index,
    ) => ({ ...state, output: outputs[index] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Range-list update fixture differs from pinned native outputs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned ScRangeList UpdateReference: ${cases.length} cases; unchanged original pipeline; ASan/UBSan clean; ${mode}.`,
);
