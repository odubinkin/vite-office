/** @fileoverview Reproduces unchanged pinned Calc boolean segment mechanisms with genuine shared mdds; ordinary tests use portable snapshots. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference",
  pinned = "9bc445578031fecf56086729d8e4940c77e14d65",
  target = "output/playwright/calc-native";
const fixture = "apps/office/src/sc/source/core/data/native-bool-segment-cases.json";
/** Verifies original pinned bytes. @param file - Original path. @returns Source. */
function original(file) {
  const text = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    text
  )
    throw new Error(`Changed original source:${file}`);
  return text;
}
/** Extracts an unchanged complete group. @param source - Original text. @param first - Start marker. @param last - End marker. @returns Group. */
function interval(source, first, last) {
  const start = source.indexOf(first),
    end = source.indexOf(last, start + first.length);
  if (start < 0 || end < start) throw new Error(`Missing group:${first}`);
  return source.slice(start, end);
}
/** Hashes original complete bytes. @param text - Bytes. @returns SHA256. */
function digest(text) {
  return createHash("sha256").update(text).digest("hex");
}
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Requires exact pinned LibreOffice checkout.");
// Reuse the dependency verifier: actual archives, patch, every mdds/Boost header,
// and shared native fixture are checked; no native tree or pointer substitutes.
execFileSync("node", ["scripts/mdds-flat-segment-native-probe.mjs", "--check"], {
  stdio: "inherit",
});
const sources = {
  header: original("sc/inc/segmenttree.hxx"),
  source: original("sc/source/core/data/segmenttree.cxx"),
  globalHeader: original("sc/inc/global.hxx"),
  globalSource: original("sc/source/core/data/global.cxx"),
  types: original("sc/inc/types.hxx"),
  tests: original("sc/qa/unit/mark_test.cxx"),
  rtl: original("include/rtl/string.hxx"),
};
const originals = {
  declarations: interval(
    sources.header,
    "class ScFlatBoolSegmentsImpl;",
    "class ScFlatUInt16SegmentsImpl;",
  ),
  storageDeclaration: interval(
    sources.source,
    "namespace {",
    "template<typename ValueType_, typename ExtValueType_>\nScFlatSegmentsImpl",
  ),
  constructorsAndSet: interval(
    sources.source,
    "template<typename ValueType_, typename ExtValueType_>\nScFlatSegmentsImpl",
    "template<typename ValueType_, typename ExtValueType_>\nvoid ScFlatSegmentsImpl",
  ),
  booleanStorage: interval(
    sources.source,
    "template<typename ValueType_, typename ExtValueType_>\nbool ScFlatSegmentsImpl<ValueType_, ExtValueType_>::getRangeData(",
    "class ScFlatUInt16SegmentsImpl",
  ),
  booleanSpecialization: interval(
    sources.source,
    "class ScFlatBoolSegmentsImpl :",
    "ScFlatBoolRowSegments::ForwardIterator::ForwardIterator",
  ),
  rowMethods: interval(
    sources.source,
    "ScFlatBoolRowSegments::ForwardIterator::ForwardIterator",
    "OString ScFlatBoolRowSegments::dumpAsString",
  ),
  columnMethods: interval(
    sources.source,
    "ScFlatBoolColSegments::ScFlatBoolColSegments",
    "OString ScFlatBoolColSegments::dumpAsString",
  ),
  globalDeclaration: sources.globalHeader.match(
    /SC_DLLPUBLIC static bool bThreadedGroupCalcInProgress;/,
  )?.[0],
  globalDefinition: sources.globalSource.match(
    /bool ScGlobal::bThreadedGroupCalcInProgress = false;/,
  )?.[0],
};
if (!originals.globalDeclaration || !originals.globalDefinition)
  throw new Error("Missing original global state.");
const cases = [];
/** Adds a defined row/column operation sequence. @param operations - Commands. @param limits - Explicit maxima. @returns Nothing. */
function add(operations, limits = [7, 9]) {
  cases.push({ operations, limits });
}
for (const start of [-2, -1, 0, 1, 2, 3, 4, 6, 7, 8, 9])
  for (const end of [-2, -1, 0, 1, 2, 3, 4, 6, 7, 8, 9]) {
    if (start < 0 && end === -1) continue; // Original clipped-zero-span null access.
    for (const marked of [0, 1])
      add([
        ["M", 0, 1, 4, 1],
        ["T", 0],
        ["M", 0, start, end, marked],
      ]);
    add([
      ["M", 0, 2, 6, 1],
      ["L", 0, start, end],
    ]);
  }
for (const pos of [-1, 0, 1, 2, 3, 4, 6, 7, 8, 9])
  for (const size of [-1, 0, 1, 2, 7, 9, 20])
    add([
      ["M", 0, 2, 4, 1],
      ["R", 0, pos, size],
      ["Q", 0, 3],
      ["P", 1, 0],
    ]);
add([]);
add([], [-1, -1]);
add([], [0, 0]);
add([
  ["M", 0, 0, 7, 1],
  ["P", 1, 0],
  ["M", 0, 2, 4, 0],
]);
add([
  ["M", 0, 2, 4, 1],
  ["F", 0],
  ["N", 1],
  ["Q", 0, 3],
  ["N", 0],
  ["N", 1],
  ["N", 0],
  ["N", 0],
]);
add([
  ["M", 0, 2, 4, 1],
  ["G", 0, 3],
  ["M", 0, 2, 4, 0],
  ["G", 0, 2],
  ["G", 0, -1],
  ["G", 0, 5],
  ["G", 0, 8],
  ["G", 0, 3],
]);
add([
  ["M", 0, 65538, 65540, 1],
  ["M", 0, 4294967298, 4294967300, 1],
  ["Q", 0, 65538],
  ["Q", 0, 4294967298],
]);
add([
  ["M", 0, 0, 7, 1],
  ["M", 0, 2, 6, 0],
  ["F", 0],
  ["N", 1],
  ["P", 1, 0],
  ["N", 0],
  ["Q", 1, 3],
  ["N", 1],
]);
// Initialized standard-bound sequence; upstream mark tests include this owner.
add(
  [
    ["M", 0, 2, 5, 1],
    ["M", 0, 9, 12, 1],
    ["L", 0, 3, 10],
    ["R", 0, 2, 4],
  ],
  [1048575, 16383],
);
const driver = `
#include <mdds/flat_segment_tree.hpp>
#include <functional>
#include <limits>
#include <memory>
#include <vector>
#include <cstdint>
using SCROW=int32_t;using SCCOL=int16_t;using SCCOLROW=int32_t;using sal_uInt64=uint64_t;
#define SC_DLLPUBLIC
// Actual opaque RTL type only; diagnostic methods are unlinked, not replaced.
namespace rtl { class OString; } using rtl::OString;
class ScGlobal { public:${originals.globalDeclaration} };
${originals.globalDefinition}
${originals.declarations}
${originals.storageDeclaration}
${originals.constructorsAndSet}
${originals.booleanStorage}
${originals.booleanSpecialization}
${originals.rowMethods}
${originals.columnMethods}
void rowRange(ScFlatBoolRowSegments& rows) {
 ScFlatBoolRowSegments copy(rows);ScFlatBoolRowSegments::RangeIterator it(copy);ScFlatBoolRowSegments::RangeData data{-71,-72,true};
 std::cout<<"[";bool found=it.getFirst(data);bool first=true;
 while(found){if(!first)std::cout<<",";first=false;std::cout<<"["<<data.mnRow1<<","<<data.mnRow2<<","<<data.mbValue<<"]";found=it.getNext(data);}
 std::cout<<"]";
}
void snapshot(ScFlatBoolRowSegments& rows,ScFlatBoolColSegments& cols) {
 std::cout<<"[";rowRange(rows);std::cout<<","<<rows.findLastTrue()<<",[";
 ScFlatBoolRowSegments r(rows);ScFlatBoolColSegments c(cols);
 for(int p=-2;p<=11;++p){if(p!=-2)std::cout<<",";ScFlatBoolRowSegments::RangeData a{-71,-72,true},b=a;ScFlatBoolColSegments::RangeData d{-61,-62,true};
 bool x=r.getRangeData(p,a),y=r.getRangeDataLeaf(p,b),z=c.getRangeData(p,d);
 std::cout<<"[["<<x<<","<<a.mnRow1<<","<<a.mnRow2<<","<<a.mbValue<<"],["<<y<<","<<b.mnRow1<<","<<b.mnRow2<<","<<b.mbValue<<"],["<<z<<","<<d.mnCol1<<","<<d.mnCol2<<","<<d.mbValue<<"]]";
 }
 std::cout<<"]]";
}
int main(int argc,char**) {
 std::cout<<std::boolalpha;
 if(argc>1){ScGlobal::bThreadedGroupCalcInProgress=true;ScFlatBoolRowSegments s(7);s.makeReady();return 0;}
 size_t total;std::cin>>total;std::cout<<"[";
 for(size_t i=0;i<total;++i){int maxRow,maxCol;size_t count;std::cin>>maxRow>>maxCol>>count;
 std::unique_ptr<ScFlatBoolRowSegments> r[2]={std::make_unique<ScFlatBoolRowSegments>(maxRow),std::make_unique<ScFlatBoolRowSegments>(maxRow)};
 std::unique_ptr<ScFlatBoolColSegments> c[2]={std::make_unique<ScFlatBoolColSegments>(maxCol),std::make_unique<ScFlatBoolColSegments>(maxCol)};
 ScFlatBoolRowSegments::ForwardIterator forward(*r[0]);ScFlatBoolRowSegments::RangeIterator a(*r[0]),b(*r[0]);
 if(i)std::cout<<",";std::cout<<"[";
 for(size_t j=0;j<count;++j){char op;int t;std::cin>>op>>t;if(j)std::cout<<",";std::cout<<"[";
 if(op=='M'){int64_t first,last;bool mark;std::cin>>first>>last>>mark;bool x=mark?r[t]->setTrue(first,last):r[t]->setFalse(first,last),y=mark?c[t]->setTrue(first,last):c[t]->setFalse(first,last);std::cout<<"["<<x<<","<<y<<"]";}
 else if(op=='L'||op=='R'){int64_t x,y;std::cin>>x>>y;if(op=='L'){r[t]->removeSegment(x,y);c[t]->removeSegment(x,y);}else{r[t]->insertSegment(x,y);c[t]->insertSegment(x,y);}std::cout<<"null";}
 else if(op=='T'){r[t]->makeReady();c[t]->makeReady();std::cout<<"null";}
 else if(op=='P'){int source;std::cin>>source;r[t]=std::make_unique<ScFlatBoolRowSegments>(*r[source]);c[t]=std::make_unique<ScFlatBoolColSegments>(*c[source]);std::cout<<"null";}
 else if(op=='Q'){int64_t p;std::cin>>p;ScFlatBoolRowSegments::RangeData d{-71,-72,true};bool found=r[t]->getRangeData(p,d);std::cout<<"["<<found<<","<<d.mnRow1<<","<<d.mnRow2<<","<<d.mbValue<<"]";}
 else if(op=='G'){int64_t p;bool v=true;std::cin>>p;bool found=forward.getValue(p,v);std::cout<<"["<<found<<","<<v<<","<<forward.getLastPos()<<"]";}
 else if(op=='F'||op=='N'){ScFlatBoolRowSegments::RangeData d{-71,-72,true};auto& it=t?b:a;bool found=op=='F'?it.getFirst(d):it.getNext(d);std::cout<<"["<<found<<","<<d.mnRow1<<","<<d.mnRow2<<","<<d.mbValue<<"]";}
 else return 3;
 std::cout<<",";snapshot(*r[0],*c[0]);std::cout<<",";snapshot(*r[1],*c[1]);std::cout<<"]";
 }
 if(!count){std::cout<<"[null,";snapshot(*r[0],*c[0]);std::cout<<",";snapshot(*r[1],*c[1]);std::cout<<"]";}
 std::cout<<"]";
 }
 std::cout<<"]";
}
`;
// Snapshots build copied indexes. The thread assertion is isolated in its own
// process so snapshot-only copies cannot trigger unrelated preconditions.
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/bool-segments-original.cpp`, driver);
const binary = `${target}/bool-segments-original`;
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
    `${target}/bool-segments-original.cpp`,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
const input = [String(cases.length)];
for (const state of cases) {
  input.push([...state.limits, state.operations.length].join(" "));
  for (const op of state.operations) input.push(op.join(" "));
}
writeFileSync(`${target}/bool-segments-input.txt`, input.join("\n"));
const inp = openSync(`${target}/bool-segments-input.txt`, "r"),
  out = openSync(`${target}/bool-segments-output.json`, "w");
try {
  execFileSync(path.resolve(binary), { stdio: [inp, out, "inherit"] });
} finally {
  closeSync(inp);
  closeSync(out);
}
const outputs = JSON.parse(readFileSync(`${target}/bool-segments-output.json`, "utf8"));
const result = {
  baselineCommit: pinned,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes source bytes. @param item - Named source. @returns Pair. */ ([name, text]) => [
        name,
        digest(text),
      ],
    ),
  ),
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes complete unchanged groups. @param item - Named group. @returns Pair. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Attaches native snapshots. @param state - Inputs. @param i - Native index. @returns Fixture case. */ (
      state,
      i,
    ) => ({ ...state, output: outputs[i] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Boolean segment fixture differs from original native outputs.");
} else if (mode === "--thread-assertion") {
  try {
    execFileSync(path.resolve(binary), ["thread"], { stdio: "pipe" });
    throw new Error("Expected native debug assertion missing.");
  } catch (error) {
    if (!error.stderr?.toString().includes("!ScGlobal::bThreadedGroupCalcInProgress")) throw error;
    writeFileSync(`${target}/bool-segments-thread-assertion.log`, error.stderr);
  }
} else throw new Error("Usage: --write|--check|--thread-assertion");
console.log(
  `Original Calc bool segments: ${cases.length} defined sequences; complete unchanged bool groups; genuine mdds; ASan/UBSan; ${mode}. RTL diagnostics not native-linked.`,
);
