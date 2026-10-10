/** @fileoverview Reproduces unchanged pinned row-mark classes and methods under ASan/UBSan; committed snapshots keep ordinary tests portable. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/data/native-mark-array-cases.json";
const target = "output/playwright/calc-native";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Mark array probe requires the exact pinned checkout.");
/** Checks complete original bytes against the pinned Git blob. @param file - Upstream path. @returns Original bytes. */
function original(file) {
  const text = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    text
  )
    throw new Error(`Original mark array blob changed: ${file}`);
  return text;
}
/** Extracts a complete unchanged group. @param text - Original bytes. @param first - Inclusive marker. @param last - Exclusive marker. @returns Native group. */
function interval(text, first, last) {
  const begin = text.indexOf(first),
    end = text.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing mark array interval: ${first}`);
  return text.slice(begin, end);
}
/** Hashes exact original bytes. @param text - Bytes. @returns SHA256. */
function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}
const sources = {
  header: original("sc/inc/markarr.hxx"),
  source: original("sc/source/core/data/markarr.cxx"),
  limits: original("sc/inc/sheetlimits.hxx"),
  address: original("sc/inc/address.hxx"),
  long: original("include/tools/long.hxx"),
  tests: original("sc/qa/unit/mark_test.cxx"),
};
const originals = {
  classes: interval(sources.header, "struct ScMarkEntry", "/* vim:"),
  definitions: interval(sources.source, "ScMarkArray::ScMarkArray(", "/* vim:"),
};
const cases = [];
/** Records initialized operations and output query rows. @param operations - Native commands. @param limits - Both owner maxima. @param rows - Query rows. @returns Nothing. */
function add(operations, limits = [7, 9], rows = [-100, -1, 0, 1, 3, 5, 7, 8, 9, 10]) {
  cases.push({ limits, rows, operations });
}
/** Builds normalized alternating initialized bitfield entries from an eight-row mask. @param mask - Bits. @returns Set command. */
function maskSet(mask) {
  const data = [];
  let previous = Boolean(mask & 1);
  for (let row = 1; row <= 7; row++) {
    const marked = Boolean((mask >> row) & 1);
    if (marked !== previous) {
      data.push([row - 1, previous]);
      previous = marked;
    }
  }
  data.push([7, previous]);
  return ["S", 0, data];
}
for (const mask of [0, 255, 1, 128, 15, 240, 85, 170, 24, 36, 60, 126, 129, 66, 18, 90]) {
  for (let start = 0; start <= 7; start++)
    for (let end = start; end <= 7; end++) {
      for (const marked of [false, true]) add([maskSet(mask), ["M", 0, start, end, marked]]);
    }
  for (const start of [-1, 0, 1, 3, 7, 8])
    for (const offset of [
      -20,
      -7,
      -2,
      -1,
      0,
      1,
      2,
      7,
      20,
      "536870912",
      "1073741824",
      "4294967296",
      "9007199254740993",
    ]) {
      add([maskSet(mask), ["H", 0, start, String(offset)]]);
    }
}
for (const marked of [false, true]) {
  add([
    ["R", 0, marked, 8],
    ["M", 0, -1, 2, !marked],
  ]);
  add([
    ["R", 0, marked, 1],
    ["M", 0, 0, 8, !marked],
  ]);
  add([
    ["R", 0, marked, 1],
    ["M", 0, 4294967296, 4294967303, !marked],
  ]);
}
for (const data of [
  [],
  [
    [3, false],
    [7, false],
  ],
  [
    [1, true],
    [2, true],
    [7, false],
  ],
  [
    [1, false],
    [3, false],
    [7, false],
  ],
  [
    [1, false],
    [3, true],
    [4, false],
    [7, true],
  ],
  [[536870912, true]],
  [
    [1073741823, false],
    [2147483647, true],
  ],
])
  add([["S", 0, data]]);
for (const op of ["C", "A", "V", "W"]) {
  add([
    ["M", 0, 2, 4, true],
    [op, 1, 0],
    ["R", 0, true, 2],
  ]);
  add([
    ["M", 0, 2, 4, true],
    [op, 1, 0],
    ["R", 1, true, 1],
  ]);
  add([
    ["M", 0, 2, 4, true],
    [op, 0, 0],
  ]);
}
// Native mark_test Search contracts, using standard bounds without module defaults.
const standardRows = [
  -100, -1, 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 19, 20, 21, 22, 25, 35, 55, 100, 200, 1048575,
  1048576,
];
for (const operations of [
  [],
  [["M", 0, 10, 20, true]],
  [
    ["M", 0, 10, 20, true],
    ["M", 0, 21, 30, true],
    ["M", 0, 50, 100, true],
  ],
  [
    ["M", 0, 4, 4, true],
    ["M", 0, 6, 6, true],
    ["M", 0, 8, 8, true],
  ],
  [["M", 0, 10, 1048575, true]],
])
  add(operations, [1048575, 1048575], standardRows);
let seed = 117;
/** Produces deterministic bounded states. @param bound - Exclusive maximum. @returns Next integer. */
function random(bound) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % bound;
}
for (let i = 0; i < 384; i++) {
  const operations = [];
  for (let j = 0; j < 16; j++) {
    const start = random(8),
      end = start + random(8 - start);
    operations.push(["M", 0, start, end, Boolean(random(2))]);
  }
  add(operations);
}
const driver = `
#include <algorithm>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <memory>
#include <vector>
#include <utility>
using SCROW = int32_t;
using SCSIZE = size_t;
namespace tools { using Long = int64_t; }
namespace sal { template<typename T, typename U> T static_int_cast(U v) { return static_cast<T>(v); } }
#define SC_DLLPUBLIC
struct ScSheetLimits {
 SCROW mnMaxRow;
 bool ValidRow(SCROW row) const { return row >= 0 && row <= mnMaxRow; }
 SCROW GetMaxRowCount() const { return mnMaxRow+1; }
};
${originals.classes}
${originals.definitions}
// Original friend is used only to inspect stored entries in the probe.
class ScDocument { public: static const auto& data(const ScMarkArray& a) { return a.mvData; } };
void snapshot(const ScMarkArray& a, const std::vector<SCROW>& rows) {
 const auto& data=ScDocument::data(a);
 std::cout << "[[";
 for(size_t i=0;i<data.size();++i){ if(i)std::cout<<","; std::cout<<"["<<data[i].nRow<<","<<data[i].bMarked<<"]"; }
 SCROW x=-71,y=-72; bool one=a.HasOneMark(x,y);
 std::cout << "],"<<a.HasMarks()<<",["<<one<<","<<x<<","<<y<<"],[";
 ScMarkArrayIter it(&a); bool found; bool first=true;
 do { x=-81;y=-82;found=it.Next(x,y);if(!first)std::cout<<",";first=false;std::cout<<"["<<found<<","<<x<<","<<y<<"]"; } while(found);
 x=-81;y=-82;found=it.Next(x,y);std::cout<<",["<<found<<","<<x<<","<<y<<"]";
 it.reset(nullptr); x=-91;y=-92;std::cout<<",["<<it.Next(x,y)<<","<<x<<","<<y<<"]";
 it.reset(&a);x=-81;y=-82;found=it.Next(x,y);std::cout<<",["<<found<<","<<x<<","<<y<<"]],[";
 if(!data.empty())for(size_t k=0;k<rows.size();++k) {
  SCROW r=rows[k];SCSIZE index=555;bool ok=a.Search(r,index);bool marked=a.GetMark(r);
  if(k)std::cout<<",";std::cout<<"["<<ok<<","<<index<<","<<marked<<","<<a.GetNextMarked(r,true)<<","<<a.GetNextMarked(r,false);
  if(marked)std::cout<<","<<a.GetMarkEnd(r,true)<<","<<a.GetMarkEnd(r,false);else std::cout<<",null,null";
  std::cout<<"]";
 }
 std::cout<<"],[";
 if(!data.empty())for(size_t k=0;k<rows.size();++k){if(k)std::cout<<",";std::cout<<a.IsAllMarked(rows[k],rows[(k+1)%rows.size()]);}
 std::cout<<"]]";
}
int main() {
 std::cout<<std::boolalpha;
 size_t total; std::cin>>total; std::cout<<"[";
 for(size_t c=0;c<total;++c){
  int32_t max0,max1;size_t count;std::cin>>max0>>max1>>count;
  ScSheetLimits limits[2]={{max0},{max1}};
  std::vector<SCROW> rows(count);for(auto& row:rows){int64_t wide;std::cin>>wide;row=static_cast<SCROW>(wide);}
  std::unique_ptr<ScMarkArray> a[2]={std::make_unique<ScMarkArray>(limits[0]),std::make_unique<ScMarkArray>(limits[1])};
  std::cin>>count;
  for(size_t j=0;j<count;++j){char op;int t;std::cin>>op>>t;
   if(op=='M'){int64_t s,e;bool m;std::cin>>s>>e>>m;a[t]->SetMarkArea(s,e,m);}
   else if(op=='R'){bool m;SCSIZE needed;std::cin>>m>>needed;a[t]->Reset(m,needed);}
   else if(op=='S'){size_t n;std::cin>>n;std::vector<ScMarkEntry> v;for(size_t k=0;k<n;++k){int64_t r;bool m;std::cin>>r>>m;v.push_back({static_cast<SCROW>(r),m});}a[t]->Set(std::move(v));}
   else if(op=='H'){int64_t s,delta;std::cin>>s>>delta;a[t]->Shift(s,delta);}
   else {int s;std::cin>>s;if(op=='C')a[t]=std::make_unique<ScMarkArray>(*a[s]);else if(op=='V')a[t]=std::make_unique<ScMarkArray>(std::move(*a[s]));else if(op=='A')*a[t]=*a[s];else if(op=='W')*a[t]=std::move(*a[s]);else return 3;}
   if(!std::cin)return 4;
  }
  if(c)std::cout<<",";std::cout<<"[";snapshot(*a[0],rows);std::cout<<",";snapshot(*a[1],rows);std::cout<<","<<(*a[0]==*a[1])<<"]";
 }
 std::cout<<"]";
}
`;
mkdirSync(target, { recursive: true });
const cpp = `${target}/markarr-original.cpp`,
  binary = `${target}/markarr-original`;
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
const input = [String(cases.length)];
for (const state of cases) {
  input.push(
    [...state.limits, state.rows.length, ...state.rows, state.operations.length].join(" "),
  );
  for (const operation of state.operations) {
    if (operation[0] === "S")
      input.push(
        [operation[0], operation[1], operation[2].length, ...operation[2].flat()]
          .map(
            /** Serializes native bool and numerical fields. @param value - Input. @returns Native word. */
            (value) => (typeof value === "boolean" ? Number(value) : value),
          )
          .join(" "),
      );
    else
      input.push(
        operation
          .map(
            /** Serializes a native command argument. @param value - Argument. @returns Native word. */
            (value) => (typeof value === "boolean" ? Number(value) : value),
          )
          .join(" "),
      );
  }
}
const outputs = JSON.parse(
  execFileSync(path.resolve(binary), {
    encoding: "utf8",
    input: input.join("\n"),
    maxBuffer: 64 * 1024 * 1024,
  }),
);
const result = {
  baselineCommit: pinned,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes original source blobs. @param entry - Named source. @returns Name and digest. */
      ([name, text]) => [name, digest(text)],
    ),
  ),
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes complete unchanged groups. @param entry - Named group. @returns Name and digest. */
      ([name, text]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Attaches compiled snapshots to initialized inputs. @param state - Inputs. @param i - Native index. @returns Portable state. */
    (state, i) => ({ ...state, output: outputs[i] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Mark array fixture differs from unchanged pinned native outputs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned ScMarkArray: ${cases.length} sequences; unchanged complete classes/definitions; ASan/UBSan clean; ${mode}.`,
);
