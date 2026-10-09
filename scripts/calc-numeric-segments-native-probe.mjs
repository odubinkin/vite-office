/** @fileoverview Compares unchanged original UInt16 row segments/templates with genuine mdds/Boost and original safeint numerical bodies; portable fixtures need no upstream or compiler. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference",
  pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/calc-native",
  fixture = "apps/office/src/sc/source/core/data/native-numeric-segment-cases.json";
/** Reads exact original source bytes. @param file - Pinned file. @returns Source. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    source !==
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" })
  )
    throw new Error(`Changed original:${file}`);
  return source;
}
/** Extracts complete original groups without replacing method bodies. @param source - Bytes. @param first - First marker. @param last - End marker. @returns Group. */
function interval(source, first, last) {
  const a = source.indexOf(first),
    b = source.indexOf(last, a + first.length);
  if (a < 0 || b < a) throw new Error(`Missing group:${first}`);
  return source.slice(a, b);
}
/** Hashes original bytes. @param source - Bytes. @returns SHA256. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
execFileSync("node", ["scripts/calc-bool-segments-native-probe.mjs", "--check"], {
  stdio: "inherit",
});
const sources = {
  header: original("sc/inc/segmenttree.hxx"),
  source: original("sc/source/core/data/segmenttree.cxx"),
  safeint: original("include/o3tl/safeint.hxx"),
  salTypes: original("include/sal/types.h"),
};
const groups = {
  declaration: interval(sources.header, "class ScFlatUInt16SegmentsImpl;", "/* vim:"),
  specialization: interval(
    sources.source,
    "class ScFlatUInt16SegmentsImpl :",
    "class ScFlatBoolSegmentsImpl :",
  ),
  numericTemplates: interval(
    sources.source,
    "template<typename ValueType_, typename ExtValueType_>\nvoid ScFlatSegmentsImpl<ValueType_, ExtValueType_>::setValueIf",
    "template<typename ValueType_, typename ExtValueType_>\nbool ScFlatSegmentsImpl<ValueType_, ExtValueType_>::getRangeData(",
  ),
  methods: interval(
    sources.source,
    "ScFlatUInt16RowSegments::ForwardIterator::ForwardIterator",
    "OString ScFlatUInt16RowSegments::dumpAsString",
  ),
  saturatingAdd: interval(
    sources.safeint,
    "template <typename T> inline constexpr T saturating_add",
    "template <typename T> inline constexpr T saturating_sub",
  ),
  checkedIntrinsics: interval(
    sources.safeint.slice(sources.safeint.indexOf("#elif (defined __GNUC__")),
    "template<typename T> inline bool checked_multiply",
    "#else",
  ),
};
const prefix = readFileSync(`${target}/bool-segments-original.cpp`, "utf8").split(
  "void rowRange(",
)[0];
const cases = [];
/** Adds an initialized numeric sequence. @param operations - Original calls. @param max - Explicit maximum. @param value - Explicit default. @returns Nothing. */
function add(operations, max = 7, value = 3) {
  cases.push({ max, value, operations });
}
for (const first of [-2, -1, 0, 1, 2, 3, 5, 7, 8, 9])
  for (const last of [-2, -1, 0, 1, 2, 4, 6, 7, 8, 9]) {
    if (first < 0 && last === -1) continue; // Original zero-length clipped insertion dereferences a null node.
    for (const indexed of [0, 1]) {
      add([
        ["E", 0, indexed],
        ["M", 0, 2, 4, 9],
        ["M", 0, first, last, 65537],
        ["P", 1, 0],
      ]);
      add([
        ["E", 0, indexed],
        ["M", 0, 1, 5, 65535],
        ["L", 0, first, last],
        ["P", 1, 0],
      ]);
    }
  }
for (const pos of [-1, 0, 1, 2, 3, 7, 8, 9])
  for (const count of [-1, 0, 1, 2, 7, 20])
    for (const indexed of [0, 1])
      add([
        ["E", 0, indexed],
        ["M", 0, 2, 4, 9],
        ["R", 0, pos, count],
        ["Q", 0, 3],
        ["P", 1, 0],
      ]);
for (const indexed of [0, 1])
  for (const first of [0, 1, 2, 4, 7])
    for (const last of [0, 2, 4, 6, 7])
      for (const pred of [0, 1, 2, 3])
        add([
          ["E", 0, indexed],
          ["M", 0, 2, 4, 8],
          ["M", 0, 5, 5, 2],
          ["C", 0, first, last, 8, pred],
          ["P", 1, 0],
        ]);
for (const indexed of [0, 1]) {
  add([
    ["E", 0, indexed],
    ["M", 0, 2, 4, 8],
    ["G", 0, 3],
    ["M", 0, 2, 4, 9],
    ["G", 0, 2],
    ["G", 0, 5],
    ["G", 0, 8],
    ["G", 0, 2],
  ]);
  add([
    ["E", 0, indexed],
    ["G", 0, 8],
    ["G", 0, 0],
  ]);
  add([
    ["E", 0, indexed],
    ["M", 0, 0, 7, -1],
    ["U", 0, 0, 9],
    ["U", 0, 3, 2],
    ["V", 0, -1],
    ["V", 0, 8],
    ["T", 0],
    ["T", 0],
  ]);
  add([
    ["E", 0, indexed],
    ["M", 0, 4294967298, 4294967300, 65536],
    ["Q", 0, 4294967298],
  ]);
  add(
    [
      ["E", 0, indexed],
      ["U", 0, 0, 2147483646],
      ["U", 0, 0, 2147483647],
      ["V", 0, 2147483646],
    ],
    2147483646,
    65535,
  );
}
add([]);
add([], 0, 65537);
add([], -1, -1);
add([], 7, 0);
add([], 7, 65535);
add([
  ["E", 0, 0],
  ["B", 0, 1],
  ["V", 0, 3],
  ["U", 0, 1, 5],
  ["Q", 0, 3],
  ["G", 0, 3],
  ["G", 0, 6],
  ["B", 0, 0],
  ["E", 0, 1],
  ["T", 0],
]);
add([
  ["T", 0],
  ["B", 0, 1],
  ["V", 0, 3],
  ["U", 0, 1, 5],
  ["Q", 0, 3],
  ["B", 0, 0],
]);
add([
  ["M", 0, 2, 4, 8],
  ["G", 0, 3],
  ["M", 0, 5, 7, 9],
  ["B", 0, 1],
  ["G", 0, 6],
  ["B", 0, 0],
]);
const driver = `${prefix}
using sal_uInt16=uint16_t;using sal_uInt32=uint32_t;
// Numerical type/constant declarations only; logging and RTL allocation are not certified.
#define SAL_MAX_INT64 (int64_t(0x7FFFFFFFFFFFFFFF))
#define SAL_WARN(...) ((void)0)
namespace o3tl {${groups.saturatingAdd}${groups.checkedIntrinsics}}
${groups.declaration}
${groups.numericTemplates}
${groups.specialization}
${groups.methods}
void snapshot(ScFlatUInt16RowSegments& owner) {
 ScFlatUInt16RowSegments copy(owner);copy.enableTreeSearch(false);ScFlatUInt16RowSegments::RangeData d{-71,-72,777};
 std::cout<<"[[";bool first=true;int32_t p=0;
 while(copy.getRangeData(p,d)){if(!first)std::cout<<",";first=false;std::cout<<"["<<d.mnRow1<<","<<d.mnRow2<<","<<d.mnValue<<"]";p=d.mnRow2+1;}
 std::cout<<"],["<<copy.findLastTrue(0)<<","<<copy.findLastTrue(3)<<","<<copy.findLastTrue(65535)<<"],[";
 for(int p=-2;p<=11;++p){if(p!=-2)std::cout<<",";d={-71,-72,777};bool found=copy.getRangeData(p,d);std::cout<<"["<<found<<","<<d.mnRow1<<","<<d.mnRow2<<","<<d.mnValue<<","<<copy.getValue(p)<<"]";}
 std::cout<<"],[";first=true;
 for(int a=-2;a<=9;++a)for(int b=a;b<=9;++b){if(!first)std::cout<<",";first=false;std::cout<<char(34)<<copy.getSumValue(a,b)<<char(34);}
 std::cout<<"]]";
}
int main(int argc,char** argv) {
 std::cout<<std::boolalpha;
 if(argc>1){ScFlatUInt16RowSegments s(7,3);ScGlobal::bThreadedGroupCalcInProgress=true;ScFlatUInt16RowSegments::RangeData d;ScFlatUInt16RowSegments::ForwardIterator f(s);
  char op=argv[1][0];if(op=='V')s.getValue(0);else if(op=='U')s.getSumValue(0,7);else if(op=='Q')s.getRangeData(0,d);else if(op=='T'){s.enableTreeSearch(false);s.makeReady();}else f.getValue(0,d.mnValue);return 0;}
 size_t total;std::cin>>total;std::cout<<"[";
 for(size_t i=0;i<total;++i){int max;int64_t def;size_t count;std::cin>>max>>def>>count;
 std::unique_ptr<ScFlatUInt16RowSegments> r[2]={std::make_unique<ScFlatUInt16RowSegments>(max,def),std::make_unique<ScFlatUInt16RowSegments>(max,def)};
 ScFlatUInt16RowSegments::ForwardIterator f(*r[0]);if(i)std::cout<<",";std::cout<<"[";
 for(size_t j=0;j<count;++j){char op;int t;std::cin>>op>>t;if(j)std::cout<<",";std::cout<<"[";
 if(op=='M'){int64_t a,b,v;std::cin>>a>>b>>v;r[t]->setValue(a,b,v);std::cout<<"null";}
 else if(op=='C'){int a,b,v,k;std::cin>>a>>b>>v>>k;std::vector<unsigned> calls;
  r[t]->setValueIf(a,b,v,[&](sal_uInt16 x){calls.push_back(x);return k==0?false:k==1?true:k==2?(x%2==0):(x>=3);});std::cout<<"[";for(size_t n=0;n<calls.size();++n){if(n)std::cout<<",";std::cout<<calls[n];}std::cout<<"]";}
 else if(op=='L'||op=='R'||op=='U'){int64_t a,b;std::cin>>a>>b;if(op=='L'){r[t]->removeSegment(a,b);std::cout<<"null";}else if(op=='R'){r[t]->insertSegment(a,b);std::cout<<"null";}else std::cout<<char(34)<<r[t]->getSumValue(a,b)<<char(34);}
 else if(op=='E'||op=='B'){bool x;std::cin>>x;if(op=='E')r[t]->enableTreeSearch(x);else ScGlobal::bThreadedGroupCalcInProgress=x;std::cout<<"null";}
 else if(op=='P'){int s;std::cin>>s;r[t]=std::make_unique<ScFlatUInt16RowSegments>(*r[s]);std::cout<<"null";}
 else if(op=='T'){r[t]->makeReady();std::cout<<"null";}
 else if(op=='Q'){int64_t p;std::cin>>p;ScFlatUInt16RowSegments::RangeData d{-71,-72,777};bool found=r[t]->getRangeData(p,d);std::cout<<"["<<found<<","<<d.mnRow1<<","<<d.mnRow2<<","<<d.mnValue<<"]";}
 else if(op=='V'){int64_t p;std::cin>>p;std::cout<<r[t]->getValue(p);}
 else if(op=='G'){int64_t p;std::cin>>p;sal_uInt16 v=876;bool found=f.getValue(p,v);std::cout<<"["<<found<<","<<v<<","<<f.getLastPos()<<"]";}
 else return 3;
 std::cout<<",";snapshot(*r[0]);std::cout<<",";snapshot(*r[1]);std::cout<<"]";}
 if(!count){std::cout<<"[null,";snapshot(*r[0]);std::cout<<",";snapshot(*r[1]);std::cout<<"]";}
 ScGlobal::bThreadedGroupCalcInProgress=false;std::cout<<"]";}
 std::cout<<"]";
}
`;
writeFileSync(`${target}/numeric-segments-original.cpp`, driver);
const binary = path.resolve(`${target}/numeric-segments-original`);
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
    `${target}/numeric-segments-original.cpp`,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
if (process.argv[2] === "--thread-assertion") {
  for (const op of ["V", "U", "Q", "T", "G"]) {
    try {
      execFileSync(binary, [op], { stdio: "pipe" });
      throw new Error(`Expected assertion:${op}`);
    } catch (error) {
      if (!error.stderr?.toString().includes("!ScGlobal::bThreadedGroupCalcInProgress"))
        throw error;
      writeFileSync(`${target}/numeric-segments-thread-${op}.log`, error.stderr);
    }
  }
  console.log(
    "Original UInt16 segments:five separate original thread assertion diagnostics reproduced.",
  );
  process.exit(0);
}
const input = [String(cases.length)];
for (const c of cases) {
  input.push([c.max, c.value, c.operations.length].join(" "));
  for (const op of c.operations) input.push(op.join(" "));
}
writeFileSync(`${target}/numeric-segments-input.txt`, input.join("\n"));
const inp = openSync(`${target}/numeric-segments-input.txt`, "r"),
  out = openSync(`${target}/numeric-segments-output.json`, "w");
try {
  execFileSync(binary, { stdio: [inp, out, "inherit"] });
} finally {
  closeSync(inp);
  closeSync(out);
}
const outputs = JSON.parse(readFileSync(`${target}/numeric-segments-output.json`, "utf8"));
const snapshots = [],
  snapshotIndices = new Map();
/** Interns a complete observation without changing its contents. @param value - Original snapshot. @returns Snapshot index. */
function internSnapshot(value) {
  const key = JSON.stringify(value);
  if (!snapshotIndices.has(key)) {
    snapshotIndices.set(key, snapshots.length);
    snapshots.push(value);
  }
  return snapshotIndices.get(key);
}
const result = {
  baselineCommit: pinned,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes original files. @param entry - Named bytes. @returns Pair. */ ([k, v]) => [
        k,
        digest(v),
      ],
    ),
  ),
  groupHashes: Object.fromEntries(
    Object.entries({ ...groups, prefix }).map(
      /** Hashes unchanged mechanisms. @param entry - Named group. @returns Pair. */ ([k, v]) => [
        k,
        digest(v),
      ],
    ),
  ),
  cases: cases.map(
    /** Keeps every command/both-owner output. @param c - Inputs. @param i - Index. @returns Case. */ (
      c,
      i,
    ) => ({
      ...c,
      output: outputs[i].map(
        /** Retains the command result and both complete owner observations. @param output - Native output. @returns Lossless references. */
        ([value, first, second]) => [value, internSnapshot(first), internSnapshot(second)],
      ),
    }),
  ),
  snapshots,
};
if (process.argv[2] === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (process.argv[2] === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Numeric segment fixture differs.");
} else throw new Error("Usage: --write|--check|--thread-assertion");
console.log(
  `Original UInt16 segments:${cases.length} sequences; complete unchanged numeric/templates, original safeint, genuine mdds/Boost; ASan/UBSan;${process.argv[2]}. RTL/log allocation unlinked.`,
);
