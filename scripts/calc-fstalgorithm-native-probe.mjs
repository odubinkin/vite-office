/** @fileoverview Reproduces unchanged fstalgorithm templates on genuine pinned mdds with original numerical span values. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference",
  pinned = "9bc445578031fecf56086729d8e4940c77e14d65",
  target = "output/playwright/calc-native",
  fixture = "apps/office/src/sc/inc/native-span-cases.json";
/** Reads verified original bytes. @param file - Source. @returns Exact text. */
function original(file) {
  const s = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !== s
  )
    throw new Error(`Changed source: ${file}`);
  return s;
}
/** Extracts original adjacent mechanisms. @param source - Text. @param first - First. @param last - Last. @returns Group. */
function interval(source, first, last) {
  const a = source.indexOf(first),
    b = source.indexOf(last, a + first.length);
  if (a < 0 || b < a) throw new Error(`Missing original: ${first}`);
  return source.slice(a, b);
}
/** Hashes source bytes. @param source - Text. @returns Digest. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
execFileSync("node", ["scripts/mdds-flat-segment-native-probe.mjs", "--check"], {
  stdio: "inherit",
});
const sources = {
  algorithm: original("sc/inc/fstalgorithm.hxx"),
  spanHeader: original("sc/inc/columnspanset.hxx"),
  spanSource: original("sc/source/core/data/columnspanset.cxx"),
};
const groups = {
  spans: interval(sources.spanHeader, "struct RowSpan", "/**\n * Structure that stores"),
  constructors: interval(
    sources.spanSource,
    "RowSpan::RowSpan(",
    "ColumnSpanSet::ColumnType::ColumnType(",
  ),
};
const driver = `
#include <iostream>
#include <cstdint>
#define SC_DLLPUBLIC
using SCROW=int32_t;using SCCOLROW=int32_t;
#include "${path.resolve(upstream, "sc/inc/fstalgorithm.hxx")}"
namespace sc {${groups.spans}${groups.constructors}}
// Test-only template consumer, not a replacement upstream engine.
struct ValueSpan {int start,end,value;ValueSpan(int a,int b,int v):start(a),end(b),value(v){}};
void spans(const std::vector<sc::ColRowSpan>& values){std::cout<<"[";bool first=true;for(auto s:values){if(!first)std::cout<<",";first=false;std::cout<<"["<<s.mnStart<<","<<s.mnEnd<<"]";}std::cout<<"]";}
void values(const std::vector<ValueSpan>& values){std::cout<<"[";bool first=true;for(auto s:values){if(!first)std::cout<<",";first=false;std::cout<<"["<<s.start<<","<<s.end<<","<<s.value<<"]";}std::cout<<"]";}
int main(){std::cout<<"[";for(int mask=0;mask<256;++mask){if(mask)std::cout<<",";mdds::flat_segment_tree<int,bool> tree(0,8,false);auto pos=tree.begin();for(int r=0;r<8;++r)pos=tree.insert(pos,r,r+1,mask&(1<<r)).first;
std::cout<<"[";spans(sc::toSpanArray<int,sc::ColRowSpan>(tree));std::cout<<",";spans(sc::toSpanArray<int,sc::ColRowSpan>(tree,2));tree.build_tree();std::cout<<",[";for(int r=-2;r<=9;++r){if(r!=-2)std::cout<<",";spans(sc::toSpanArray<int,sc::ColRowSpan>(tree,r));}std::cout<<"],";
std::vector<sc::ColRowSpan> result{sc::ColRowSpan(-7,-6)};auto begin=tree.begin();sc::buildSpan<int,sc::ColRowSpan>(result,begin,tree.end(),nullptr);spans(result);std::cout<<","<<(begin==tree.begin()?1:0)<<",";
tree.insert_front(0,8,false);spans(sc::toSpanArray<int,sc::ColRowSpan>(tree,0));std::cout<<"]";}std::cout<<"],[";
for(int seed=0;seed<64;++seed){if(seed)std::cout<<",";mdds::flat_segment_tree<int,int> tree(-2,7,seed%3-1);auto pos=tree.begin();for(int r=-2;r<7;++r)pos=tree.insert(pos,r,r+1,(seed+r+66)%5-2).first;values(sc::toSpanArrayWithValue<int,int,ValueSpan>(tree));}std::cout<<"]";}
`;
writeFileSync(`${target}/span-original.cpp`, driver);
const binary = path.resolve(`${target}/span-original`);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    "-I",
    "vendor/mdds-reference/include",
    "-I",
    "output/playwright/mdds-native/boost_1_91_0",
    `${target}/span-original.cpp`,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
// Full native output is small enough to capture without truncation.
const output = execFileSync(binary, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
// The driver emits two adjacent top-level arrays; wrap without changing records.
const result = {
  baselineCommit: pinned,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes originals. @param entry - Name/text. @returns Pair. */ ([k, v]) => [k, digest(v)],
    ),
  ),
  groupHashes: Object.fromEntries(
    Object.entries(groups).map(
      /** Hashes original groups. @param entry - Name/text. @returns Pair. */ ([k, v]) => [
        k,
        digest(v),
      ],
    ),
  ),
  output: JSON.parse(`[${output}]`),
};
if (process.argv[2] === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (process.argv[2] === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Span fixture differs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Original fstalgorithm:256 bool/64 numerical owners; all original overloads; genuine mdds; ASan/UBSan;${process.argv[2]}.`,
);
