/** @fileoverview Compares unchanged pinned numerical ScRangeList bodies; saved portable fixtures need no native compiler or upstream checkout. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/tool/native-range-list-cases.json";
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
using sal_Int32=int32_t; using sal_Int16=int16_t; using sal_uInt64=uint64_t; using sal_Unicode=char16_t;
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
class ScDocument;
enum class ScRefFlags : uint16_t {};
enum UpdateRefMode { URM_INSDEL };
namespace formula { struct FormulaGrammar { enum AddressConvention { CONV_OOO }; }; }
struct SvRefBase { SvRefBase()=default; SvRefBase(const SvRefBase&)=default; virtual ~SvRefBase()=default; };
${originals.listClass}
${originals.queryHelpers}
${originals.destructor}
${originals.joins}
${originals.edits}
ScRange readRange() { int c1,r1,t1,c2,r2,t2; std::cin>>c1>>r1>>t1>>c2>>r2>>t2; return ScRange(c1,r1,t1,c2,r2,t2); }
void range(const ScRange& r) { std::cout<<'['<<r.aStart.Col()<<','<<r.aStart.Row()<<','<<r.aStart.Tab()<<','<<r.aEnd.Col()<<','<<r.aEnd.Row()<<','<<r.aEnd.Tab()<<']'; }
void list(const ScRangeList& l) { std::cout<<'['; bool first=true; for(const auto& r:l) { if(!first)std::cout<<',';first=false;range(r); } std::cout<<']'; }
void snapshot(const ScRangeList& l,int changed) {
 ScRange query(1,1,0,3,3,0);
 std::cout<<"{\\"ranges\\":";list(l);std::cout<<",\\"count\\":\\""<<l.GetCellCount()<<"\\",\\"combine\\":";range(l.Combine());
 auto corner=l.GetTopLeftCorner(); std::cout<<",\\"corner\\":["<<corner.Col()<<','<<corner.Row()<<','<<corner.Tab()<<"]";
 std::cout<<",\\"intersects\\":"<<l.Intersects(query)<<",\\"contains\\":"<<l.Contains(query)<<",\\"find\\":";
 const auto* found=l.Find(query.aStart); int index=-1; for(size_t i=0;i<l.size();++i)if(&l[i]==found)index=i;std::cout<<index;
 std::cout<<",\\"intersection\\":";list(l.GetIntersectedRange(query));std::cout<<",\\"changed\\":"<<changed<<'}';
}
int main() {
 size_t scenarios; std::cin>>scenarios;std::cout<<std::boolalpha<<'[';
 for(size_t s=0;s<scenarios;++s) {
  if(s)std::cout<<',';ScRangeList l;size_t n;std::cin>>n;for(size_t i=0;i<n;++i)l.push_back(readRange());
  size_t steps;std::cin>>steps;std::cout<<'[';
  for(size_t step=0;step<steps;++step) {
   if(step)std::cout<<',';int kind;std::cin>>kind; auto arg=readRange();
   SCCOL c1,c2;SCROW r1,r2;SCTAB t1,t2;arg.GetVars(c1,r1,t1,c2,r2,t2);int changed=-1;
   switch(kind) {
    case 0:l.Join(arg);break;
    case 1:l.AddAndPartialCombine(arg);break;
    case 2:changed=l.DeleteArea(c1,r1,t1,c2,r2,t2);break;
    case 3:l.InsertRow(t1,c1,c2,r1,r2);break;
    case 4:l.InsertCol(t1,r1,r2,c1,c2);break;
    case 5:l.InsertCol(t1,c1);break;
    case 6:l.Join(l[c1],true);break;
    case 7:l.Remove(c1);break;
    case 8:l.RemoveAll();break;
    case 9:{ScRangeList copy(l);l=copy;}break;
    case 10:{ScRangeList other(arg);l.swap(other);}break;
    case 12:l.push_back(arg);break;
    case 13:{std::vector<ScRange> values{ScRange(r1,t1,c2,r2,t2,0)};l.insert(l.begin()+c1,values.begin(),values.end());}break;
   }
   snapshot(l,changed);
  }
  std::cout<<']';
 }
 std::cout<<']';
}
`;
/** Forms a numerical range tuple. @param c1 - First column. @param r1 - First row. @param c2 - Last column. @param r2 - Last row. @param t1 - First sheet. @param t2 - Last sheet. @returns Native coordinates. */
function rectangle(c1, r1, c2, r2, t1 = 0, t2 = t1) {
  return [c1, r1, t1, c2, r2, t2];
}
const scenarios = [];
/** Adds independent initial storage and a deterministic operation sequence. @param initial - Raw ranges. @param operations - Kind and six coordinates. @returns Nothing. */
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
];
const boxes = [];
for (const [c1, c2] of spans)
  for (const [r1, r2] of spans)
    for (const tab of [0, 1]) boxes.push(rectangle(c1, r1, c2, r2, tab));
for (const first of boxes)
  for (const second of boxes) for (const kind of [0, 1]) add([first], [[kind, ...second]]);
for (let c1 = -1; c1 <= 7; ++c1)
  for (let c2 = c1; c2 <= 7; ++c2)
    for (let r1 = -1; r1 <= 7; ++r1)
      for (let r2 = r1; r2 <= 7; ++r2)
        add(
          [rectangle(2, 2, 5, 5)],
          [
            [2, ...rectangle(c1, r1, c2, r2)],
            [0, ...rectangle(2, 6, 5, 7)],
          ],
        );
for (const tab of [-1, 0, 1, 2])
  for (const pos of [-1, 0, 3, 5, 7])
    for (const low of [-1, 0, 2, 6])
      for (const high of [-1, 3, 5, 8])
        for (const size of [0, 1, 3]) {
          add(
            [rectangle(1, 1, 4, 4), rectangle(2, 1, 5, 4, 1)],
            [
              [3, low, pos, tab, high, size, tab],
              [4, pos, low, tab, size, high, tab],
              [5, pos, 0, tab, 0, 0, tab],
            ],
          );
        }
for (const deleting of boxes)
  add([rectangle(0, 0, 5, 5, 0, 2), rectangle(7, 0, 8, 5)], [[2, ...deleting]]);
add(
  [],
  [
    [0, ...rectangle(1, 1, 3, 3)],
    [0, ...rectangle(4, 1, 6, 3)],
    [12, ...rectangle(7, 1, 9, 3)],
    [6, 1, 0, 0, 0, 0, 0],
    [9, 0, 0, 0, 0, 0, 0],
    [7, 10, 0, 0, 0, 0, 0],
    [7, 0, 0, 0, 0, 0, 0],
    [0, ...rectangle(1, 1, 3, 3)],
    [10, ...rectangle(9, 9, 10, 10)],
    [8, 0, 0, 0, 0, 0, 0],
    [1, ...rectangle(1, 1, 3, 3)],
    [1, ...rectangle(1, 4, 3, 5)],
  ],
);
add(
  [],
  [
    [13, 0, 1, 1, 0, 3, 3],
    [0, ...rectangle(1, 4, 3, 5)],
    [7, 0, 0, 0, 0, 0, 0],
    [0, ...rectangle(1, 6, 3, 6)],
  ],
);
add([rectangle(0, 0, 4, 4), rectangle(8, 0, 10, 4)], [[0, ...rectangle(5, 0, 9, 4)]]);
add([rectangle(1, 1, 3, 3), rectangle(1, 1, 3, 3)], [[6, 1, 0, 0, 0, 0, 0]]);
add([rectangle(1, 1, 3, 3), rectangle(4, 1, 6, 3), rectangle(7, 1, 9, 3)], [[6, 2, 0, 0, 0, 0, 0]]);
add([rectangle(0, 0, 32767, 2147483646, 0, 32767), rectangle(5, 5, 1, 1)], [[9, 0, 0, 0, 0, 0, 0]]);
add(
  Array.from(
    { length: 9 },
    /** Creates independent input tuples for unsigned64 accumulation. @returns Large bounded range. */ () =>
      rectangle(0, 0, 32767, 2147483646, 0, 32767),
  ),
  [[9, 0, 0, 0, 0, 0, 0]],
);
const input = [String(scenarios.length)];
for (const scenario of scenarios) {
  input.push(
    String(scenario.initial.length),
    ...scenario.initial.map(
      /** Serializes native input. @param range - Raw range. @returns Whitespace coordinates. */ (
        range,
      ) => range.join(" "),
    ),
    String(scenario.operations.length),
    ...scenario.operations.map(
      /** Serializes operation. @param operation - Kind and values. @returns Whitespace numbers. */ (
        operation,
      ) => operation.join(" "),
    ),
  );
}
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "rangelst-probe.cxx"),
  binary = path.join(target, "rangelst-probe");
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
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes each unchanged body group. @param entry - Name and source. @returns Hash entry. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  scenarios: scenarios.map(
    /** Attaches actual native outcomes. @param scenario - Inputs. @param index - Original order. @returns Differential case. */ (
      scenario,
      index,
    ) => ({ ...scenario, outputs: outputs[index] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Range-list fixture differs from pinned native execution.");
} else throw new Error("Usage: node scripts/calc-rangelst-native-probe.mjs --write|--check");
console.log(
  `Pinned Calc range-list probe: ${scenarios.length} operation sequences; unchanged native bodies; ASan/UBSan clean; ${mode}.`,
);
