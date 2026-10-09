/** @fileoverview Compares unchanged pinned ScRangePair and ScRangePairList numerical bodies; saved portable fixtures need no native compiler or upstream checkout. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/tool/native-range-pair-cases.json";
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
const updateSource = original("sc/source/core/tool/refupdat.cxx"),
  updateHeader = original("sc/source/core/inc/refupdat.hxx"),
  global = original("sc/inc/global.hxx");
const originals = {
  pairClass: interval(address, "class SAL_WARN_UNUSED ScRangePair final", "//  ScRefAddress"),
  listClass: interval(
    header,
    "class SC_DLLPUBLIC ScRangePairList final",
    "typedef tools::SvRef<ScRangePairList>",
  ),
  listOperations: interval(
    source,
    "ScRangePairList::~ScRangePairList()",
    "namespace {\n\nclass ScRangePairList_sortNameCompare",
  ),
  joins: interval(
    source,
    "void ScRangePairList::Join(",
    "std::vector<const ScRangePair*> ScRangePairList::CreateNameSortedArray(",
  ),
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
  mode: interval(global, "enum UpdateRefMode", "enum FillDir"),
  updateHeader: interval(updateHeader, "enum ScRefUpdateRes", "/* vim:set"),
  helpers: interval(
    updateSource,
    "template< typename R, typename S, typename U >",
    "template< typename R, typename U >",
  ),
  expansion: interval(
    updateSource,
    "template< typename R, typename S, typename U >\nstatic bool IsExpand",
    "static bool lcl_IsWrapBig",
  ),
  scalarUpdate: interval(
    updateSource,
    "ScRefUpdateRes ScRefUpdate::Update( const ScDocument&",
    "// simple UpdateReference",
  ),
};
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
using sal_uInt16=uint16_t; using sal_Int64=int64_t; using sal_Int32=int32_t; using sal_Int16=int16_t; using sal_uInt64=uint64_t; using sal_Unicode=char16_t;
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



struct SvRefBase { SvRefBase()=default; SvRefBase(const SvRefBase&)=default; virtual ~SvRefBase()=default; };
${originals.pairClass}
${originals.listClass}
${originals.listOperations}
${originals.joins}

ScRange readRange(){int c1,r1,t1,c2,r2,t2;std::cin>>c1>>r1>>t1>>c2>>r2>>t2;return ScRange(c1,r1,t1,c2,r2,t2);}
ScRangePair readPair(){auto first=readRange();auto second=readRange();return ScRangePair(first,second);}
void range(const ScRange& r){std::cout<<'['<<r.aStart.Col()<<','<<r.aStart.Row()<<','<<r.aStart.Tab()<<','<<r.aEnd.Col()<<','<<r.aEnd.Row()<<','<<r.aEnd.Tab()<<']';}
int findIndex(ScRangePairList& l,const ScRangePair* found){for(size_t i=0;i<l.size();++i)if(&l[i]==found)return i;return -1;}
void snapshot(ScRangePairList& l){std::cout<<"{\\"pairs\\":[";for(size_t i=0;i<l.size();++i){if(i)std::cout<<',';std::cout<<'[';range(l[i].GetRange(0));std::cout<<',';range(l[i].GetRange(1));std::cout<<']';}std::cout<<"],\\"address\\":"<<findIndex(l,l.Find(ScAddress(1,1,0)))<<",\\"range\\":"<<findIndex(l,l.Find(ScRange(1,1,0,3,3,0)))<<'}';}
int main(){size_t cases;std::cin>>cases;std::cout<<'[';for(size_t s=0;s<cases;++s){if(s)std::cout<<',';ScRangePairList l;size_t count;std::cin>>count;for(size_t i=0;i<count;++i)l.Append(readPair());size_t steps;std::cin>>steps;std::cout<<'[';for(size_t i=0;i<steps;++i){if(i)std::cout<<',';int kind,index;std::cin>>kind;switch(kind){
 case 0:l.Append(readPair());break;
 case 1:{int flag;std::cin>>flag;auto p=readPair();l.Join(p,flag);}break;
 case 2:std::cin>>index;l.Join(l[index],true);break;
 case 3:std::cin>>index;l.Remove(index);break;
 case 4:std::cin>>index;l.Remove(l[index]);break;
 case 5:{auto p=readPair();l.Remove(p);}break;
 case 6:std::cin>>index;l.DeleteOnTab(index);break;
 case 7:{auto* copy=l.Clone();l=*copy;delete copy;}break;
 case 8:{int mc,mr,t,e,m,alias;int64_t dx,dy,dz;std::cin>>mc>>mr>>t>>e>>m>>alias;auto w=readRange();std::cin>>dx>>dy>>dz;ScDocument doc(mc,mr,t,e);const ScRange& where=alias<0?w:l[alias/2].GetRange(alias%2);l.UpdateReference(static_cast<UpdateRefMode>(m),doc,where,dx,dy,dz);}break;
 case 9:std::cin>>index;l[index]=readPair();break;
 case 10:{ScRangePairList copy(l);l=copy;}break;
 case 11:std::cin>>index;l[0].GetRange(index)=readRange();break;
 case 12:l=l;break;
 }if(!std::cin)return 2;snapshot(l);}std::cout<<']';}std::cout<<']';}
`;
/** Forms native range coordinates. @param c1 - First column. @param r1 - First row. @param c2 - Last column. @param r2 - Last row. @param t1 - First sheet. @param t2 - Last sheet. @returns Raw tuple. */
function rect(c1, r1, c2, r2, t1 = 0, t2 = t1) {
  return [c1, r1, t1, c2, r2, t2];
}
const scenarios = [];
/** Adds original owned initial values and an operation sequence. @param initial - Pairs. @param operations - Native operations. @returns Nothing. */
function add(initial, operations) {
  scenarios.push({ initial, operations });
}
const spans = [
    [0, 0],
    [0, 2],
    [1, 3],
    [2, 4],
    [3, 3],
    [4, 6],
  ],
  boxes = [];
for (const [c1, c2] of spans) for (const [r1, r2] of spans) boxes.push(rect(c1, r1, c2, r2));
const data = rect(7, 10, 9, 12);
for (const first of boxes)
  for (const second of boxes) {
    for (const other of [
      data,
      rect(second[0] + 6, second[1] + 9, second[3] + 6, second[4] + 9),
      rect(7, 11, 9, 13),
      rect(8, 10, 10, 12),
      rect(7, 10, 9, 12, 1),
    ]) {
      add([[first, data]], [{ kind: 1, pair: [second, other], flag: false }, { kind: 7 }]);
    }
  }
// Parallel row/column adjacency must hold independently for labels and associated data.
for (const axis of [0, 1])
  for (const direction of [-1, 1])
    for (const dataShift of [-4, -3, -2, 0, 2, 3, 4])
      for (const tab of [0, 1]) {
        const label = rect(4, 4, 6, 6),
          assoc = rect(10, 10, 12, 12),
          otherLabel = label.slice(),
          otherData = assoc.slice();
        otherLabel[axis] += 3 * direction;
        otherLabel[axis + 3] += 3 * direction;
        otherData[axis] += dataShift;
        otherData[axis + 3] += dataShift;
        otherData[2] = tab;
        otherData[5] = tab;
        add([[label, assoc]], [{ kind: 1, pair: [otherLabel, otherData], flag: false }]);
      }
const pair = [rect(1, 1, 3, 3), data];
for (const index of [0, 1, 65536, 65537, -65536, -65535])
  add(
    [pair],
    [
      { kind: 11, index, range: rect(5, 5, 6, 6) },
      { kind: 10 },
      { kind: 12 },
      { kind: 3, index: -1 },
    ],
  );
// Duplicates, original borrowed-source positions, multi-merge restarts and release identity assertion behavior.
for (const index of [0, 1, 2]) {
  add([pair, pair, pair], [{ kind: 2, index }]);
  add(
    [pair, pair, pair],
    [{ kind: 4, index }, { kind: 5, pair }, { kind: 3, index: 20 }, { kind: 7 }],
  );
}
add(
  [
    [rect(1, 1, 3, 1), rect(7, 10, 9, 10)],
    [rect(1, 3, 3, 3), rect(7, 12, 9, 12)],
  ],
  [{ kind: 1, pair: [rect(1, 2, 3, 2), rect(7, 11, 9, 11)], flag: false }],
);
add(
  [[rect(1, 1, 3, 3, 0, 1), data], pair, [rect(1, 1, 3, 3, 1), data]],
  [
    { kind: 6, index: 0 },
    { kind: 6, index: 1 },
    { kind: 0, pair },
    { kind: 9, index: 0, pair: [rect(4, 4, 6, 6), rect(10, 10, 12, 12)] },
    { kind: 7 },
  ],
);
add([pair], [{ kind: 1, pair, flag: true }]);
add(
  [],
  [
    { kind: 7 },
    { kind: 3, index: 0 },
    { kind: 5, pair },
    { kind: 6, index: 0 },
    { kind: 1, pair, flag: false },
  ],
);
// Independent initialized document profiles exercise both references, every native mode and alias snapshots.
const initials = [
  [],
  [pair],
  [[rect(0, 0, 20, 30), rect(1, 1, 19, 29)]],
  [pair, [rect(4, 4, 6, 6, 1), rect(10, 10, 12, 12, 1)]],
  [[rect(2, 2, 2, 2), rect(7, 10, 7, 10)]],
];
for (const initial of initials)
  for (const mode of [0, 1, 2, 3])
    for (const expand of [false, true])
      for (const axis of [0, 1, 2])
        for (const value of [-3, -1, 0, 1, 3])
          for (const start of [0, 1, 3, 7, 10, 20]) {
            const where = rect(0, 0, 20, 30, 0, 4),
              delta = [0, 0, 0];
            where[axis] = start;
            delta[axis] = value;
            add(initial, [
              { kind: 8, bounds: [20, 30, 5], expand, mode, alias: -1, where, delta },
              { kind: 7 },
            ]);
          }
for (const mode of [0, 1, 2, 3])
  for (const expand of [false, true])
    for (const alias of [0, 1, 2, 3]) {
      add(
        [pair, pair],
        [
          {
            kind: 8,
            bounds: [20, 30, 5],
            expand,
            mode,
            alias,
            where: rect(0, 0, 0, 0),
            delta: [1, 1, 1],
          },
        ],
      );
    }
for (const delta of [
  [65535, 0, 0],
  [65536, 0, 0],
  [0, 4294967296, 0],
  [0, 0, 65535],
])
  add(
    [pair],
    [
      {
        kind: 8,
        bounds: [20, 30, 5],
        expand: false,
        mode: 0,
        alias: -1,
        where: rect(2, 2, 20, 30),
        delta,
      },
    ],
  );
let seed = 0x529cff37;
/** Samples an independent deterministic coordinate profile. @param values - Domain. @returns Selected value. */
function pick(values) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return values[seed % values.length];
}
for (let i = 0; i < 4096; ++i) {
  const label = rect(
    pick([-1, 0, 1, 3, 6]),
    pick([-1, 0, 1, 3, 6]),
    pick([0, 1, 3, 6]),
    pick([0, 1, 3, 6]),
    pick([0, 1]),
    pick([0, 1]),
  );
  const other = rect(
    pick([6, 7, 8, 9]),
    pick([9, 10, 11, 12]),
    pick([7, 9, 11]),
    pick([10, 12, 14]),
    pick([0, 1]),
    pick([0, 1]),
  );
  add([pair], [{ kind: 1, pair: [label, other], flag: i % 3 === 0 }]);
}
const input = [String(scenarios.length)];
for (const s of scenarios) {
  input.push(String(s.initial.length));
  for (const p of s.initial) input.push(p.flat().join(" "));
  input.push(String(s.operations.length));
  for (const op of s.operations) {
    input.push(String(op.kind));
    if (op.kind === 0 || op.kind === 5) input.push(op.pair.flat().join(" "));
    else if (op.kind === 1) input.push([Number(op.flag), ...op.pair.flat()].join(" "));
    else if ([2, 3, 4, 6].includes(op.kind)) input.push(String(op.index));
    else if (op.kind === 8)
      input.push(
        [...op.bounds, Number(op.expand), op.mode, op.alias, ...op.where, ...op.delta].join(" "),
      );
    else if (op.kind === 9) input.push([op.index, ...op.pair.flat()].join(" "));
    else if (op.kind === 11) input.push([op.index, ...op.range].join(" "));
  }
}
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "rangepair-probe.cxx"),
  binary = path.join(target, "rangepair-probe");
writeFileSync(cpp, driver);
// Native assertions diagnose a later-source Join path even after locating it; compare original release behavior explicitly.
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
    maxBuffer: 64 * 1024 * 1024,
  }),
);
const result = {
  baselineCommit: pinned,
  nativeAssertions: "NDEBUG release behavior; diagnostic assertion enforcement not certified",
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
      /** Hashes unchanged complete original source groups. @param entry - Name and source. @returns Hash entry. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  scenarios: scenarios.map(
    /** Attaches native operation snapshots. @param scenario - Inputs. @param index - Native order. @returns Portable case. */ (
      scenario,
      index,
    ) => ({ ...scenario, outputs: outputs[index] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Range-pair fixture differs from original native execution.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned ScRangePair/List: ${scenarios.length} sequences; unchanged native release bodies; ASan/UBSan clean; ${mode}.`,
);
