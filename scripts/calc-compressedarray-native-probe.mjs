/** @fileoverview Replays complete unchanged compressed-array templates and genuine o3tl flag operators under ASan/UBSan; portable fixtures require no native compiler. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference",
  pinned = "9bc445578031fecf56086729d8e4940c77e14d65",
  target = "output/playwright/calc-native",
  fixture = "apps/office/src/sc/source/core/data/native-compressedarray-cases.json";
/** Reads original pinned bytes without editing bodies. @param file - Path. @returns Source. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    source !==
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" })
  )
    throw new Error(`Changed original:${file}`);
  return source;
}
/** Extracts complete original groups. @param source - Bytes. @param first - Start. @param last - End. @returns Group. */
function interval(source, first, last) {
  const a = source.indexOf(first),
    b = source.indexOf(last, a + first.length);
  if (a < 0 || b < a) throw new Error(`Missing group:${first}`);
  return source.slice(a, b);
}
/** Hashes original bytes. @param source - Bytes. @returns Digest. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
const sources = {
  header: original("sc/inc/compressedarray.hxx"),
  source: original("sc/source/core/data/compressedarray.cxx"),
  global: original("sc/inc/global.hxx"),
  flags: original("include/o3tl/typed_flags_set.hxx"),
  underlying: original("include/o3tl/underlyingenumvalue.hxx"),
  config: original("include/sal/config.h"),
  long: original("include/tools/long.hxx"),
};
const groups = {
  classes: interval(
    sources.header,
    "template< typename A, typename D > class ScCompressedArray",
    "/* vim:",
  ),
  definitions: interval(
    sources.source,
    "template< typename A, typename D >\nScCompressedArray<A,D>::ScCompressedArray",
    "// === Force instantiation",
  ),
  flags: interval(sources.global, "enum class CRFlags", "enum class ScBreakType"),
};
const cases = [];
/** Adds original public operations. @param kind - Native specialization. @param operations - Commands. @param max - Maximum. @param value - Default. @returns Nothing. */
function add(kind, operations, max = 7, value = 3) {
  cases.push({ kind, max, value, operations });
}
const seed = [
  ["M", 0, 2, 4, 8],
  ["M", 0, 5, 5, 1],
  ["M", 1, 0, 1, 15],
  ["M", 1, 4, 6, 0],
];
for (let kind = 0; kind < 4; ++kind) {
  for (const first of [-2, -1, 0, 1, 2, 3, 4, 6, 7, 8, 9])
    for (const last of [-2, -1, 0, 1, 2, 3, 4, 6, 7, 8, 9])
      for (const value of [0, 1, 3, 8, 15]) add(kind, [...seed, ["M", 0, first, last, value]]);
  for (const first of [0, 1, 2, 3, 4, 5, 6, 7])
    for (const count of ["0", "1", "2", "3", "7", "20"]) {
      add(kind, [...seed, ["D", 0, first, count]]);
      add(kind, [...seed, ["F", 0, first, count, 0]]);
    }
  for (const first of [-1, 0, 1, 2, 3, 5, 7, 8])
    for (const count of ["0", "1", "2", "7", "20", "4294967296", "4294967297", "-1"])
      add(kind, [...seed, ["I", 0, first, count]]);
  for (const first of [0, 1, 2, 3, 5, 7])
    for (const count of ["0", "1", "2", "4"]) add(kind, [...seed, ["J", 0, first, count, 1]]);
  for (const first of [0, 1, 2, 4, 7])
    for (const last of [0, 1, 2, 4, 7])
      for (const src of [0, 1, 2, 4, 7])
        if (first > last || last - first + src <= 7)
          add(kind, [...seed, ["C", 0, first, last, src]]);
  for (const first of [0, 2, 5, 7])
    for (const last of [0, 2, 5, 7]) add(kind, [...seed, ["H", 0, first, last]]);
  for (const first of [0, 1, 2, 4, 7])
    add(kind, [...seed, ["S", 0, first, 0], ["S", 0, first, 15], ["R", 0, 9], ["R", 0, 0]]);
  for (const first of [0, 1, 2, 4, 7])
    for (const offset of [0, 1, 2, 4, 7])
      if (first + offset <= 7)
        add(kind, [...seed, ["G", 0, first, offset], ["M", 0, 0, 7, 1], ["G", 0, 0, 7]]);
  add(kind, [
    ["M", 0, 0, 0, 1],
    ["M", 0, 1, 1, 0],
    ["M", 0, 2, 2, 1],
    ["D", 0, 1, "1"],
    ["I", 0, 1, "1"],
    ["M", 0, 0, 7, 3],
  ]);
  add(kind, [
    ["M", 0, 0, 1, 0],
    ["M", 0, 2, 3, 1],
    ["M", 0, 4, 5, 0],
    ["M", 0, 6, 7, 1],
    ["D", 0, 2, "20"],
  ]);
  add(kind, [
    ["S", 0, 4294967298, 65537],
    ["Q", 0, -1],
    ["V", 0, 9],
    ["N", 0, 100],
  ]);
  for (const first of [0, 1]) add(kind, [...seed, ["Z", 0, first, 7]]);
  for (const value of kind < 2 ? [-1, 65536, 65537] : [0, 15, 255]) add(kind, [], 7, value);
}
for (const kind of [2, 3]) {
  for (const first of [-1, 0, 1, 2, 4, 7, 8, 9])
    for (const last of [-1, 0, 1, 2, 4, 7, 8, 9])
      for (const mask of [0, 1, 3, 8, 15])
        for (const op of ["A", "O"]) {
          if (first > 7 && first <= last) continue; // Original invalid-start update can make no cursor progress.
          add(kind, [...seed, [op, 0, first, last, mask]]);
        }
  for (const first of [-1, 0, 2, 5, 7, 9])
    for (const mask of [0, 1, 3, 8, 15])
      for (const op of ["a", "o"]) add(kind, [...seed, [op, 0, first, mask]]);
  for (const first of [0, 1, 3, 7])
    for (const last of [0, 1, 3, 7])
      for (const mask of [0, 1, 3, 8, 15]) add(kind, [...seed, ["B", 0, first, last, mask]]);
}
const driver = `
#include <algorithm>
#include <cassert>
#include <cstring>
#include <cstddef>
#include <cstdint>
#include <limits>
#include <memory>
#include <iostream>
#include <string>
#include <vector>
#include <type_traits>
#include <o3tl/typed_flags_set.hxx>
using sal_uInt8=std::uint8_t; using sal_uInt16=std::uint16_t;
using SCROW=std::int32_t; using SCCOL=std::int16_t;
namespace tools { using Long=long; }
#define SC_DLLPUBLIC
${groups.flags}
${groups.classes}
${groups.definitions}
template<class A,class D> using Native=std::conditional_t<std::is_same_v<D,CRFlags>,ScBitMaskCompressedArray<A,D>,ScCompressedArray<A,D>>;
template<class A,class D> struct Observed:ScCompressedArray<A,D> {
 static void snapshot(Native<A,D>& x){
  const auto nCount=x.*(&Observed::nCount), nLimit=x.*(&Observed::nLimit);
  const auto nMaxAccess=x.*(&Observed::nMaxAccess);
  const auto& pData=x.*(&Observed::pData);
  std::cout<<'['<<nCount<<','<<nLimit<<','<<nMaxAccess<<",[";
  for(size_t i=0;i<nCount;++i){if(i)std::cout<<',';std::cout<<'['<<pData[i].nEnd<<','<<int(pData[i].aValue)<<']';}
  std::cout<<"],[";
  for(int p=-2;p<=10;++p){if(p!=-2)std::cout<<',';auto d=x.GetRangeData(A(p));std::cout<<'['<<x.Search(A(p))<<','<<int(x.GetValue(A(p)))<<','<<d.mnRow1<<','<<d.mnRow2<<','<<int(d.maValue)<<']';}
  std::cout<<"],[";
  for(size_t i=0;i<nCount+2;++i){if(i)std::cout<<',';size_t j=i;A end=-71;auto val=x.GetNextValue(j,end);std::cout<<'['<<int(val)<<','<<j<<','<<end<<']';}
  std::cout<<"],[";
  if constexpr(std::is_same_v<D,CRFlags>){int masks[]={0,1,2,4,8,15};for(int i=0;i<6;++i){if(i)std::cout<<',';std::cout<<x.GetLastAnyBitAccess(D(masks[i]));}}
  std::cout<<"]]";
 }
};
template<class A,class D>void run(int max,int value,int commands){
 Native<A,D> owners[]={Native<A,D>(A(max),D(value)),Native<A,D>(A(max),D(value))};
 std::cout<<'[';
 for(int i=0;i<std::max(1,commands);++i){if(i)std::cout<<',';std::cout<<'[';
  std::string op;int t;long long a=0,b=0,v=0;std::string count;
  if(commands){std::cin>>op>>t;auto& x=owners[t];
   if(op=="M"){std::cin>>a>>b>>v;x.SetValue(A(a),A(b),D(v));std::cout<<"null";}
   else if(op=="S"){std::cin>>a>>v;x.SetValue(A(a),D(v));std::cout<<"null";}
   else if(op=="R"){std::cin>>v;x.Reset(D(v));std::cout<<"null";}
   else if(op=="I"){std::cin>>a>>count;std::cout<<int(x.Insert(A(a),std::stoull(count)));}
   else if(op=="J"){std::cin>>a>>count>>v;x.InsertPreservingSize(A(a),std::stoull(count),D(v));std::cout<<"null";}
   else if(op=="D"){std::cin>>a>>count;x.Remove(A(a),std::stoull(count));std::cout<<"null";}
   else if(op=="F"){std::cin>>a>>count>>v;x.RemovePreservingSize(A(a),std::stoull(count),D(v));std::cout<<"null";}
   else if(op=="C"){std::cin>>a>>b>>v;x.CopyFrom(owners[1-t],A(a),A(b),A(v));std::cout<<"null";}
   else if(op=="H"){std::cin>>a>>b;x.CopyFrom(owners[1-t],A(a),A(b));std::cout<<"null";}
   else if(op=="Q"){std::cin>>a;auto d=x.GetRangeData(A(a));std::cout<<'['<<d.mnRow1<<','<<d.mnRow2<<','<<int(d.maValue)<<']';}
   else if(op=="V"){std::cin>>a;size_t j=123;A end=-71;auto val=x.GetValue(A(a),j,end);std::cout<<'['<<int(val)<<','<<j<<','<<end<<']';}
   else if(op=="N"){std::cin>>a;size_t j=a;A end=-71;auto val=x.GetNextValue(j,end);std::cout<<'['<<int(val)<<','<<j<<','<<end<<']';}
   else if(op=="Z"){std::cin>>a>>v;auto it=x.begin()+a;x.Reset(D(v));std::cout<<'['<<int(*it)<<']';}
   else if(op=="G"){std::cin>>a>>b;auto it=x.begin();for(int j=0;j<a;++j)++it;auto other=it+b;std::cout<<'['<<int(*it)<<','<<int(*other)<<']';}
   else if constexpr(std::is_same_v<D,CRFlags>){
    if(op=="A"){std::cin>>a>>b>>v;x.AndValue(A(a),A(b),D(v));}
    else if(op=="O"){std::cin>>a>>b>>v;x.OrValue(A(a),A(b),D(v));}
    else if(op=="a"){std::cin>>a>>v;x.AndValue(A(a),D(v));}
    else if(op=="o"){std::cin>>a>>v;x.OrValue(A(a),D(v));}
    else if(op=="B"){std::cin>>a>>b>>v;x.CopyFromAnded(owners[1-t],A(a),A(b),D(v));}
    else std::abort();std::cout<<"null";
   }else std::abort();
  }else std::cout<<"null";
  std::cout<<',';Observed<A,D>::snapshot(owners[0]);std::cout<<',';Observed<A,D>::snapshot(owners[1]);std::cout<<']';
 }std::cout<<']';
}
int main(int argc,char**argv){
 if(argc>1){std::string mode=argv[1];ScBitMaskCompressedArray<SCROW,CRFlags>x(7,CRFlags::NONE);if(mode=="self")x.CopyFrom(x,0,7);else if(mode=="flag")x.OrValue(0,CRFlags(16));else std::abort();return 0;}
 int total;std::cin>>total;std::cout<<'[';
 for(int i=0;i<total;++i){if(i)std::cout<<',';int kind,max,value,count;std::cin>>kind>>max>>value>>count;
  if(kind==0)run<SCROW,sal_uInt16>(max,value,count);else if(kind==1)run<SCCOL,sal_uInt16>(max,value,count);else if(kind==2)run<SCROW,CRFlags>(max,value,count);else run<SCCOL,CRFlags>(max,value,count);
 }std::cout<<"]\\n";
}
`;
writeFileSync(`${target}/compressedarray-original.cpp`, driver);
const binary = path.resolve(`${target}/compressedarray-original`);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    "-I",
    `${upstream}/include`,
    `${target}/compressedarray-original.cpp`,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
if (process.argv[2] === "--nontermination") {
  for (const [op, value, mask] of [
    ["A", 3, 0],
    ["O", 0, 1],
  ]) {
    const input = `1\n2 7 ${value} 1\n${op} 0 8 8 ${mask}\n`;
    try {
      execFileSync(binary, { input, timeout: 1000, stdio: "pipe" });
      throw new Error(`Expected original non-progress loop:${op}`);
    } catch (error) {
      if (error.code !== "ETIMEDOUT" || error.signal !== "SIGTERM") throw error;
      writeFileSync(
        `${target}/compressedarray-${op}-nontermination.json`,
        JSON.stringify({ input, code: error.code, signal: error.signal, timeoutMs: 1000 }) + "\n",
      );
    }
  }
  console.log(
    "Original range-bit invalid-start non-progress loops reproduced separately; no successful result assigned.",
  );
  process.exit(0);
}
if (process.argv[2] === "--assertions") {
  for (const mode of ["self", "flag"]) {
    try {
      execFileSync(binary, [mode], { stdio: "pipe" });
      throw new Error(`Missing original assertion:${mode}`);
    } catch (error) {
      const stderr = error.stderr?.toString();
      if (!stderr?.includes(mode === "self" ? "cannot copy self->self" : "value & ~M")) throw error;
      writeFileSync(`${target}/compressedarray-${mode}-assertion.log`, stderr);
    }
  }
  console.log("Original compressed-array self-copy and genuine o3tl mask assertions reproduced.");
  process.exit(0);
}
const input = [String(cases.length)];
for (const c of cases) {
  input.push([c.kind, c.max, c.value, c.operations.length].join(" "));
  for (const op of c.operations) input.push(op.join(" "));
}
writeFileSync(`${target}/compressedarray-input.txt`, input.join("\n"));
const inp = openSync(`${target}/compressedarray-input.txt`, "r"),
  out = openSync(`${target}/compressedarray-output.json`, "w");
try {
  execFileSync(binary, { stdio: [inp, out, "inherit"] });
} finally {
  closeSync(inp);
  closeSync(out);
}
const outputs = JSON.parse(readFileSync(`${target}/compressedarray-output.json`, "utf8")),
  snapshots = [],
  indices = new Map();
/** Interns complete native observations without changing any field. @param snapshot - Original observation. @returns Index. */
function intern(snapshot) {
  const key = JSON.stringify(snapshot);
  if (!indices.has(key)) {
    indices.set(key, snapshots.length);
    snapshots.push(snapshot);
  }
  return indices.get(key);
}
const result = {
  baselineCommit: pinned,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes original files. @param entry - Bytes. @returns Pair. */ ([k, v]) => [k, digest(v)],
    ),
  ),
  groupHashes: Object.fromEntries(
    Object.entries(groups).map(
      /** Hashes complete unchanged mechanisms. @param entry - Group. @returns Pair. */ ([
        k,
        v,
      ]) => [k, digest(v)],
    ),
  ),
  cases: cases.map(
    /** Keeps every command and both owner observations. @param c - Input. @param i - Index. @returns Case. */ (
      c,
      i,
    ) => ({
      ...c,
      output: outputs[i].map(
        /** Retains complete native output. @param output - Observation. @returns Lossless tuple. */ ([
          value,
          a,
          b,
        ]) => [value, intern(a), intern(b)],
      ),
    }),
  ),
  snapshots,
};
if (process.argv[2] === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (process.argv[2] === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Compressed-array fixture differs.");
} else throw new Error("Usage: --write|--check|--assertions|--nontermination");
console.log(
  `Original compressed arrays:${cases.length} defined sequences/${snapshots.length} complete snapshots; all numeric/flag row/column specializations, unchanged full templates and genuine o3tl operators; ASan/UBSan;${process.argv[2]}.`,
);
