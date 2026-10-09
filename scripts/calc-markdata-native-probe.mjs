/** @fileoverview Compares complete unchanged pinned ScMarkData with real selection/range/span mechanisms; saved portable fixtures require no compiler or upstream. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference",
  pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/calc-native",
  fixture = "apps/office/src/sc/source/core/data/native-mark-data-cases.json";
/** Reads exact original bytes. @param file - Original path. @returns Source. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    source
  )
    throw new Error(`Changed original: ${file}`);
  return source;
}
/** Extracts complete original mechanisms unchanged. @param source - Original bytes. @param first - First marker. @param last - Last marker. @returns Group. */
function interval(source, first, last) {
  const a = source.indexOf(first),
    b = source.indexOf(last, a + first.length);
  if (a < 0 || b < a) throw new Error(`Missing group: ${first}`);
  return source.slice(a, b);
}
/** Hashes exact bytes. @param source - Text. @returns SHA256. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
execFileSync("node", ["scripts/calc-markmulti-native-probe.mjs", "--check"], { stdio: "inherit" });
const sources = {
  header: original("sc/inc/markdata.hxx"),
  source: original("sc/source/core/data/markdata.cxx"),
  spans: original("sc/inc/columnspanset.hxx"),
  spanSource: original("sc/source/core/data/columnspanset.cxx"),
  algorithm: original("sc/inc/fstalgorithm.hxx"),
  address: original("sc/inc/address.hxx"),
  addressSource: original("sc/source/core/tool/address.cxx"),
  listSource: original("sc/source/core/tool/rangelst.cxx"),
  document: original("sc/inc/document.hxx"),
  tests: original("sc/qa/unit/mark_test.cxx"),
};
const groups = {
  classes: interval(sources.header, "class ScMarkData\n", "/* vim:"),
  methods: interval(sources.source, "ScMarkData::ScMarkData(", "/* vim:"),
  spans: interval(sources.spans, "struct RowSpan", "/**\n * Structure that stores"),
  spanMethods: interval(
    sources.spanSource,
    "RowSpan::RowSpan(",
    "ColumnSpanSet::ColumnType::ColumnType(",
  ),
  algorithm: interval(sources.algorithm, "namespace sc {", "/* vim:"),
  addressComparison: interval(
    sources.address,
    "    constexpr bool operator==(const ScAddress&",
    "    size_t hash() const",
  ),
  rangeGeometry: interval(
    sources.address,
    "inline void ScRange::GetVars(",
    "inline size_t ScRange::hashArea()",
  ),
  rangeShift: interval(
    sources.addressSource,
    "void ScRange::IncColIfNotLessThan(",
    "bool ScRange::IsEndColSticky(",
  ),
  joins: interval(
    sources.listSource,
    "void ScRangeList::Join(",
    "bool ScRangeList::UpdateReference(",
  ),
  listAssignments: interval(
    sources.listSource,
    "ScRangeList& ScRangeList::operator=(const ScRangeList&",
    "bool ScRangeList::Intersects(",
  ),
  listEdits: interval(
    sources.listSource,
    "void ScRangeList::Remove(size_t",
    "void ScRangeList::push_back(",
  ),
  docGetters: interval(
    sources.document,
    "    SC_DLLPUBLIC SCCOL MaxCol() const",
    "    SC_DLLPUBLIC SCCOL GetMaxColCount() const",
  ),
};
let prefix = readFileSync(`${target}/multi-selection-original.cpp`, "utf8").split(
  "// Use the original friend solely",
)[0];
prefix = prefix.replace("class ScAddress {", "class ScDocument;\nclass ScAddress {");
prefix = prefix.replace(
  "class ScRange {public:ScAddress aStart,aEnd;",
  `class ScRange {public:ScAddress aStart,aEnd;
 inline void GetVars(SCCOL&,SCROW&,SCTAB&,SCCOL&,SCROW&,SCTAB&) const;
 inline bool operator==(const ScRange&) const; inline bool operator!=(const ScRange&) const; inline bool operator<(const ScRange&) const; inline bool operator<=(const ScRange&) const;
 inline bool Contains(const ScAddress&) const; inline bool Contains(const ScRange&) const; inline bool Intersects(const ScRange&) const;
 void IncColIfNotLessThan(const ScDocument&,SCCOL,SCCOL);void IncRowIfNotLessThan(const ScDocument&,SCROW,SCROW);`,
);
const addressEnd = prefix.indexOf("};\nclass ScRange {");
if (addressEnd < 0) throw new Error("Missing exact address declaration boundary.");
prefix = prefix.slice(0, addressEnd) + groups.addressComparison + prefix.slice(addressEnd);
const cases = [];
/** Adds an initialized owner sequence. @param operations - Original calls. @param initial - Optional optimized ranges. @returns Nothing. */
function add(operations, initial = null) {
  cases.push({ initial, operations });
}
const rectangles = [
  [0, 0, 0, 5, 7, 0],
  [1, 2, 1, 3, 4, 1],
  [0, 2, 0, 5, 3, 0],
  [2, 0, 0, 2, 7, 0],
  [0, 0, 2, 0, 0, 2],
  [4, 6, 0, 5, 7, 0],
];
add([]);
add([
  ["M", 0, 1, 2, 0, 1, 4, 0, 1],
  ["M", 0, 3, 2, 0, 4, 4, 0, 1],
  ["E", 0],
]);
add([["E", 0]], []);
add([["E", 0]], [[1, 2, 0, 3, 4, 0]]);
add([
  ["M", 0, 1, 1, 0, 4, 6, 0, 1],
  ["M", 0, 4, 6, 0, 1, 2, 0, 1],
  ["E", 0],
]);
add([
  ["M", 0, 4, 6, 0, 1, 2, 0, 1],
  ["E", 0],
]);
add([
  ["S", 0, 1, 2, 0, 3, 4, 0],
  ["S", 0, 2, 3, 0, 4, 5, 0],
  ["E", 0],
]);
add([
  ["F", 0, 1, [[1, 2, 0, 3, 4, 0]]],
  [
    "F",
    0,
    1,
    [
      [0, 1, 0, 2, 3, 0],
      [4, 5, 2, 5, 6, 2],
    ],
  ],
]);
// Native release numeric owners accept stored columns beyond explicit sheet
// limits; vector indices remain defined and bool envelopes clip independently.
add([
  ["M", 0, 7, 2, 0, 7, 4, 0, 1],
  ["E", 0],
]);
for (const rectangle of rectangles)
  for (const negative of [0, 1])
    for (const marking of [0, 1]) {
      add([
        ["S", 0, ...rectangle],
        ["G", 0, negative],
        ["B", 0, marking],
        ["T", 0],
        ["E", 0],
        ["E", 0],
        ["B", 0, 0],
        ["T", 0],
        ["L", 0],
        ["R", 0],
      ]);
      add([
        ["M", 0, ...rectangle, 1],
        ["S", 0, 1, 1, 0, 3, 5, 0],
        ["G", 0, negative],
        ["B", 0, marking],
        ["L", 0],
        ["B", 0, 0],
        ["L", 0],
        ["E", 0],
      ]);
    }
for (const left of [0, 1, 2, 4])
  for (const right of [left, 5])
    for (const top of [0, 1, 3, 7])
      for (const bottom of [top, 7]) {
        add([
          ["M", 0, left, top, 0, right, bottom, 0, 1],
          ["E", 0],
          ["M", 0, 1, 2, 0, 4, 5, 0, 0],
          ["E", 0],
          ["L", 0],
        ]);
        add([
          ["S", 0, left, top, 1, right, bottom, 1],
          ["T", 0],
          ["M", 0, 2, 0, 0, 3, 7, 0, 1],
          ["E", 0],
          ["L", 0],
        ]);
      }
for (let a = 0; a < 8; ++a)
  for (let b = 0; b < 8; ++b) {
    add([
      ["M", 0, 1, a, 0, 1, a, 0, 1],
      ["M", 0, 2, b, 0, 2, b, 0, 1],
      ["M", 0, 4, 1, 0, 4, 5, 0, 1],
      ["E", 0],
      ["E", 0],
    ]);
  }
for (const rectangle of rectangles) {
  add([
    ["F", 0, 1, []],
    ["F", 0, 0, [rectangle]],
    [
      "F",
      0,
      0,
      [
        [0, 1, 2, 2, 2, 2],
        [3, 4, 0, 4, 6, 0],
      ],
    ],
    ["F", 0, 1, []],
    ["E", 0],
  ]);
  add(
    [
      ["E", 0],
      ["P", 1, 0],
      ["A", 0, 1],
      ["W", 1, 0],
      ["R", 0],
      ["S", 0, ...rectangle],
      ["V", 1, 0],
      ["R", 0],
      ["A", 0, 1],
    ],
    [rectangle, [2, 5, 0, 4, 6, 0]],
  );
  add([
    ["S", 0, ...rectangle],
    ["P", 1, 0],
    ["A", 0, 0],
    ["W", 1, 0],
    ["R", 1],
  ]);
}
for (const offset of [-2, -1, 0, 1, 2])
  for (const start of [0, 1, 3, 5]) {
    add([
      ["S", 0, 1, 2, 0, 3, 4, 0],
      ["X", 0, start, offset],
      ["H", 0, start, offset],
      ["M", 0, 1, 1, 0, 3, 5, 0, 1],
      ["X", 0, start, offset],
      ["H", 0, start, offset],
      ["E", 0],
    ]);
  }
add([
  ["D", 0, [3, 1, -1, 3]],
  ["I", 0, 2],
  ["J", 0, 1],
  ["O", 0, 4],
  ["D", 0, []],
  ["Q", 0, 2, 1],
  ["Q", 0, 2, 0],
  ["D", 0, [4, 0, 2]],
  ["K", 0, 3],
  ["R", 0],
]);
add([
  ["M", 0, 1, 1, 0, 4, 5, 0, 1],
  ["M", 0, 1, 1, 0, 4, 5, 0, 0],
  ["L", 0],
  ["S", 0, 2, 2, 0, 3, 3, 0],
  ["G", 0, 1],
  ["T", 0],
]);
add([
  ["M", 0, 0, 1, 0, 5, 3, 0, 1],
  ["M", 0, 2, 6, 0, 2, 6, 0, 1],
  ["L", 0],
]);
const driver = `
#include <set>
#include <unordered_map>
#include <tuple>
#define OSL_FAIL(x) ((void)0)
${prefix}
${groups.rangeGeometry}
// Getter-only comparison carrier: actual original getter bodies and borrowed
// bounds pointer; no document/cell engine or intrusive lifecycle substitute.
class ScDocument {const ScSheetLimits* mxSheetLimits;public:explicit ScDocument(const ScSheetLimits& limits):mxSheetLimits(&limits){} ${groups.docGetters}};
${groups.rangeShift}
${groups.joins}
${groups.listAssignments}
${groups.listEdits}
namespace sc {${groups.spans}${groups.spanMethods}}
${groups.algorithm}
${groups.classes}
${groups.methods}
ScRange readRange(){int a,b,c,d,e,f;std::cin>>a>>b>>c>>d>>e>>f;return ScRange(a,b,c,d,e,f);}
ScRangeList readList(){size_t n;std::cin>>n;ScRangeList l;while(n--)l.push_back(readRange());return l;}
void range(const ScRange& r){std::cout<<"["<<r.aStart.Col()<<","<<r.aStart.Row()<<","<<r.aStart.Tab()<<","<<r.aEnd.Col()<<","<<r.aEnd.Row()<<","<<r.aEnd.Tab()<<"]";}
void list(const ScRangeList& l){std::cout<<"[";bool first=true;for(const auto& r:l){if(!first)std::cout<<",";first=false;range(r);}std::cout<<"]";}
void spans(const std::vector<sc::ColRowSpan>& v){std::cout<<"[";bool first=true;for(auto s:v){if(!first)std::cout<<",";first=false;std::cout<<"["<<s.mnStart<<","<<s.mnEnd<<"]";}std::cout<<"]";}
void snapshot(const ScMarkData& s){
std::cout<<"["<<s.IsMarked()<<","<<s.IsMultiMarked()<<","<<s.GetMarkingFlag()<<","<<s.IsMarkNegative()<<",[";bool first=true;for(auto t:s){if(!first)std::cout<<",";first=false;std::cout<<t;}
std::cout<<"],["<<s.GetSelectCount()<<","<<s.GetFirstSelected()<<","<<s.GetLastSelected()<<"],";range(s.GetMarkArea());std::cout<<",";range(s.GetMultiMarkArea());std::cout<<",";range(s.GetArea());
std::cout<<",";list(s.GetMarkedRanges());std::cout<<",";list(s.GetMarkedRangesForTab(4));std::cout<<",";spans(s.GetMarkedRowSpans());std::cout<<",";spans(s.GetMarkedColSpans());
std::cout<<",[";for(int c=0;c<8;++c){if(c)std::cout<<",";std::cout<<"["<<s.IsColumnMarked(c)<<","<<s.HasMultiMarks(c)<<",[";for(int r=-1;r<10;++r){if(r!=-1)std::cout<<",";std::cout<<"["<<s.IsCellMarked(c,r)<<","<<s.IsCellMarked(c,r,true)<<","<<s.GetNextMarked(c,r,false)<<","<<s.GetNextMarked(c,r,true)<<"]";}std::cout<<"],[";for(int m=0;m<8;++m){if(m)std::cout<<",";std::cout<<s.GetStartOfEqualColumns(c,m);}std::cout<<"]]";}std::cout<<"],[";
for(int r=-1;r<10;++r){if(r!=-1)std::cout<<",";std::cout<<s.IsRowMarked(r);}std::cout<<"],[";for(int a=0;a<6;++a)for(int b=a;b<6;++b)for(int r=0;r<8;++r){if(a||b||r)std::cout<<",";std::cout<<s.IsAllMarked(ScRange(a,r,0,b,r+1,0));}std::cout<<"],"<<s.HasAnyMultiMarks()<<",[";
for(int t=-1;t<7;++t){if(t!=-1)std::cout<<",";std::cout<<s.GetTableSelect(t);}std::cout<<"],";
list(s.GetTopEnvelope());std::cout<<",";list(s.GetBottomEnvelope());std::cout<<",";list(s.GetLeftEnvelope());std::cout<<",";list(s.GetRightEnvelope());
ScRangeList l(ScRange(1,2,6,3,4,6));s.ExtendRangeListTables(&l);std::cout<<",";list(l);l.push_back(ScRange(1,1,1,1,1,1));s.FillRangeListWithMarks(&l,false,2);std::cout<<",";list(l);s.FillRangeListWithMarks(&l,true);std::cout<<",";list(l);std::cout<<"]";
}
int main(int argc,char**){std::cout<<std::boolalpha;ScSheetLimits limits(5,7);ScDocument doc(limits);if(argc>1){ScMarkData s(limits);s.SelectOneTable(0);s=std::move(s);return 0;}size_t n;std::cin>>n;std::cout<<"[";
for(size_t i=0;i<n;++i){bool optimized;std::cin>>optimized;std::unique_ptr<ScMarkData> s[2];if(optimized){auto l=readList();s[0]=std::make_unique<ScMarkData>(limits,l);}else s[0]=std::make_unique<ScMarkData>(limits);s[1]=std::make_unique<ScMarkData>(limits);size_t count;std::cin>>count;if(i)std::cout<<",";std::cout<<"[";
for(size_t j=0;j<std::max(size_t(1),count);++j){char op='Z';int t=0;if(count)std::cin>>op>>t;if(j)std::cout<<",";std::cout<<"[";
if(op=='S')s[t]->SetMarkArea(readRange());else if(op=='M'){auto r=readRange();bool b;std::cin>>b;s[t]->SetMultiMarkArea(r,b);}else if(op=='R')s[t]->ResetMark();else if(op=='T')s[t]->MarkToMulti();else if(op=='L')s[t]->MarkToSimple();
else if(op=='G'||op=='B'){bool b;std::cin>>b;if(op=='G')s[t]->SetMarkNegative(b);else s[t]->SetMarking(b);}
else if(op=='Q'){int tab;bool b;std::cin>>tab>>b;s[t]->SelectTable(tab,b);}else if(op=='D'){size_t count;std::cin>>count;ScMarkData::MarkedTabsType tabs;while(count--){int tab;std::cin>>tab;tabs.insert(tab);}s[t]->SetSelectedTabs(tabs);}
else if(op=='I'||op=='J'||op=='O'||op=='K'){int tab;std::cin>>tab;if(op=='I')s[t]->InsertTab(tab);else if(op=='J')s[t]->DeleteTab(tab);else if(op=='O')s[t]->SelectOneTable(tab);else s[t]->SetAreaTab(tab);}
else if(op=='F'){bool reset;std::cin>>reset;auto l=readList();s[t]->MarkFromRangeList(l,reset);}
else if(op=='X'||op=='H'){int a,b;std::cin>>a>>b;if(op=='X')s[t]->ShiftCols(doc,a,b);else s[t]->ShiftRows(doc,a,b);}
else if(op=='P'||op=='A'||op=='V'||op=='W'){int from;std::cin>>from;if(op=='P')s[t]=std::make_unique<ScMarkData>(*s[from]);else if(op=='A')*s[t]=*s[from];else if(op=='V'){auto moved=std::make_unique<ScMarkData>(std::move(*s[from]));s[from]->ResetMark();s[t]=std::move(moved);}else {*s[t]=std::move(*s[from]);s[from]->ResetMark();}}
ScRange cover(2,3,4,5,6,7);if(op=='E'){s[t]->GetSelectionCover(cover);range(cover);}else std::cout<<"null";std::cout<<",";snapshot(*s[0]);std::cout<<",";snapshot(*s[1]);std::cout<<"]";}
std::cout<<"]";}std::cout<<"]";}
`;
writeFileSync(`${target}/mark-data-original.cpp`, driver);
const binary = path.resolve(`${target}/mark-data-original`);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-DNDEBUG",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    "-I",
    "vendor/mdds-reference/include",
    "-I",
    "output/playwright/mdds-native/boost_1_91_0",
    `${target}/mark-data-original.cpp`,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
if (process.argv[2] === "--self-move-diagnostic") {
  try {
    execFileSync(binary, ["self"], { stdio: "pipe" });
    throw new Error("Recorded native self-move failure did not reproduce on this runtime.");
  } catch (error) {
    const diagnostic = error.stderr?.toString();
    if (
      !diagnostic?.includes("heap-use-after-free") ||
      !diagnostic.includes("ScMarkData::operator=")
    )
      throw error;
    writeFileSync(`${target}/mark-data-self-move.log`, diagnostic);
  }
  console.log(
    "Original ScMarkData selected-tab self-move: native libc++ sanitizer diagnostic reproduced; no defined-outcome parity claim.",
  );
  process.exit(0);
}
const input = [String(cases.length)];
for (const c of cases) {
  input.push(c.initial === null ? "0" : [1, c.initial.length, ...c.initial.flat()].join(" "));
  input.push(String(c.operations.length));
  for (const [op, t, ...args] of c.operations) {
    if (op === "F") input.push([op, t, args[0], args[1].length, ...args[1].flat()].join(" "));
    else if (op === "D") input.push([op, t, args[0].length, ...args[0]].join(" "));
    else input.push([op, t, ...args].join(" "));
  }
}
writeFileSync(`${target}/mark-data-input.txt`, input.join("\n"));
const inp = openSync(`${target}/mark-data-input.txt`, "r"),
  out = openSync(`${target}/mark-data-output.json`, "w");
try {
  execFileSync(binary, { stdio: [inp, out, "inherit"] });
} finally {
  closeSync(inp);
  closeSync(out);
}
const outputs = JSON.parse(readFileSync(`${target}/mark-data-output.json`, "utf8")),
  snapshots = [],
  indexes = new Map();
/** Interns complete observations without discarding native envelopes or outputs. @param snapshot - Native observation. @returns Index. */
function intern(snapshot) {
  const key = JSON.stringify(snapshot);
  if (!indexes.has(key)) {
    indexes.set(key, snapshots.length);
    snapshots.push(snapshot);
  }
  return indexes.get(key);
}
const result = {
  baselineCommit: pinned,
  buildMode: "NDEBUG custom bounds; unchanged complete methods; ASan/UBSan",
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes originals. @param entry - Group. @returns Pair. */ ([k, v]) => [k, digest(v)],
    ),
  ),
  groupHashes: Object.fromEntries(
    Object.entries({ ...groups, prefix }).map(
      /** Hashes unchanged dependencies. @param entry - Group. @returns Pair. */ ([k, v]) => [
        k,
        digest(v),
      ],
    ),
  ),
  snapshots,
  cases: cases.map(
    /** Retains all commands/both owners. @param c - Case. @param i - Index. @returns Encoded case. */ (
      c,
      i,
    ) => ({
      ...c,
      output: outputs[i].map(
        /** Interns complete owners. @param o - Output. @returns Output/indexes. */ (o) => [
          o[0],
          intern(o[1]),
          intern(o[2]),
        ],
      ),
    }),
  ),
};
if (process.argv[2] === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (process.argv[2] === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Mark-data fixture differs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Original ScMarkData: ${cases.length} sequences/${snapshots.length} complete observations; actual dependencies; ASan/UBSan; ${process.argv[2]}.`,
);
