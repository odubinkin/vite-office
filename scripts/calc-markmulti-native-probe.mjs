/** @fileoverview Reproduces unchanged pinned multi-selection and real dependency mechanisms; portable fixtures require no native compiler or upstream. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, openSync, closeSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference",
  pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/calc-native",
  fixture = "apps/office/src/sc/source/core/data/native-multi-selection-cases.json";
/** Reads exact pinned Git bytes. @param file - Original path. @returns Source. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    source
  )
    throw new Error(`Changed pinned original: ${file}`);
  return source;
}
/** Extracts a complete unchanged interval. @param source - Original text. @param first - Start. @param last - End. @returns Group. */
function interval(source, first, last) {
  const start = source.indexOf(first),
    end = source.indexOf(last, start + first.length);
  if (start < 0 || end < start) throw new Error(`Missing original group: ${first}`);
  return source.slice(start, end);
}
/** Hashes exact bytes. @param source - Bytes. @returns SHA256. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Requires the pinned LibreOffice checkout.");
// Reuse original bool extraction and genuine archive/patch/header verification.
execFileSync("node", ["scripts/calc-bool-segments-native-probe.mjs", "--check"], {
  stdio: "inherit",
});
const boolPrefix = readFileSync(`${target}/bool-segments-original.cpp`, "utf8").split(
  "void rowRange(",
)[0];
const sources = {
  header: original("sc/inc/markmulti.hxx"),
  source: original("sc/source/core/data/markmulti.cxx"),
  markHeader: original("sc/inc/markarr.hxx"),
  markSource: original("sc/source/core/data/markarr.cxx"),
  limits: original("sc/inc/sheetlimits.hxx"),
  address: original("sc/inc/address.hxx"),
  listHeader: original("sc/inc/rangelst.hxx"),
  listSource: original("sc/source/core/tool/rangelst.cxx"),
  refHeader: original("include/tools/ref.hxx"),
  refSource: original("tools/source/ref/ref.cxx"),
  types: original("include/sal/types.h"),
  global: original("sc/inc/global.hxx"),
  grammar: original("include/formula/grammar.hxx"),
  tests: original("sc/qa/unit/mark_test.cxx"),
};
const originals = {
  classes: interval(sources.header, "class SC_DLLPUBLIC ScMultiSel", "/* vim:"),
  methods: interval(sources.source, "ScMultiSel::ScMultiSel(", "/* vim:"),
  markClasses: interval(sources.markHeader, "struct ScMarkEntry", "/* vim:"),
  markMethods: interval(sources.markSource, "ScMarkArray::ScMarkArray(", "/* vim:"),
  limitFields: interval(sources.limits, "    const SCCOL mnMaxCol", "    SC_DLLPUBLIC static"),
  limitValidRow: interval(
    sources.limits,
    "    [[nodiscard]] bool ValidRow",
    "    [[nodiscard]] bool ValidColRow",
  ),
  limitCount: interval(
    sources.limits,
    "    SCROW GetMaxRowCount()",
    "    // equivalent of MAXCOLCOUNT",
  ),
  validRow: interval(
    sources.address,
    "[[nodiscard]] constexpr bool ValidRow(",
    "[[nodiscard]] constexpr bool ValidTab(",
  ),
  addressInline: interval(
    sources.address,
    "    constexpr ScAddress() :",
    "    /**\n        @param  pSheetEndPos",
  ),
  rangeInline: interval(sources.address, "    ScRange() :", "    inline bool Contains("),
  rangeOrder: interval(
    sources.address,
    "    void PutInOrder() { aStart.PutInOrder(aEnd); }",
    "\n\n",
  ),
  refClass: interval(
    sources.refHeader,
    "class TOOLS_DLLPUBLIC SvRefBase",
    "template<typename T>\nclass SvCompatWeakBase;",
  ),
  refDestructor: interval(
    sources.refSource,
    "SvRefBase::~SvRefBase()",
    "tools::WeakBase::~WeakBase()",
  ),
  listClass: interval(
    sources.listHeader,
    "class SAL_WARN_UNUSED SC_DLLPUBLIC ScRangeList",
    "typedef tools::SvRef<ScRangeList>",
  ),
  listConstructors: interval(
    sources.listSource,
    "ScRangeList::ScRangeList()",
    "ScRangeList& ScRangeList::operator=(const ScRangeList&",
  ),
  listDestructor: interval(
    sources.listSource,
    "ScRangeList::~ScRangeList()",
    "ScRefFlags ScRangeList::Parse(",
  ),
  listAppend: interval(
    sources.listSource,
    "void ScRangeList::push_back(",
    "void ScRangeList::swap(",
  ),
  cast: interval(
    sources.types,
    "template< typename T1, typename T2 > inline T1 static_int_cast",
    "\n\n}",
  ),
  updateMode: interval(sources.global, "enum UpdateRefMode", "enum FillDir"),
  convention: interval(sources.grammar, "    enum AddressConvention{", "    enum Grammar"),
};
const cases = [];
/** Adds one defined sequence. @param operations - Commands. @param limits - Explicit column/row maxima. @param cols - Public query columns. @param otherLimits - Second owner's explicit maxima. @returns Nothing. */
function add(
  operations,
  limits = [5, 7],
  cols = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  otherLimits = limits,
) {
  cases.push({ operations, limits, otherLimits, cols });
}
for (const full of [false, true])
  for (const first of [0, 1, 2, 4, 7])
    for (const last of [first, 7])
      for (const begin of [0, 1, 2, 4, 7])
        for (const end of [begin, 7])
          for (const mark of [0, 1])
            add([
              ["M", 0, full ? 0 : 1, full ? 5 : 3, first, last, 1],
              ["M", 0, 1, 2, begin, end, mark],
            ]);
for (const start of [0, 1, 3, 5, 6])
  for (const end of [start, 6])
    for (const marked of [0, 1])
      add([
        ["M", 0, 0, 5, 1, 2, 1],
        ["M", 0, 0, 5, 4, 5, 1],
        ["M", 0, start, end, 0, 7, marked],
      ]);
for (const start of [0, 1, 3, 5, 6, 8])
  for (const offset of [-20, -5, -2, -1, 0, 1, 3])
    add([
      ["M", 0, 1, 3, 2, 4, 1],
      ["X", 0, start, offset],
    ]);
for (const start of [-1, 0, 2, 7, 8])
  for (const offset of [-1, 0, 1, 3, 9, 536870912])
    add([
      ["M", 0, 0, 5, 2, 4, 1],
      ["M", 0, 1, 3, 5, 6, 1],
      ["H", 0, start, offset],
    ]);
for (const mode of ["P", "A", "V", "W"])
  for (const targetOwner of [0, 1])
    add([
      ["M", 0, 0, 5, 1, 2, 1],
      ["M", 0, 1, 3, 4, 5, 1],
      ["M", 1, 1, 2, 0, 1, 1],
      [mode, targetOwner, 0],
      ["M", targetOwner, 0, 5, 6, 7, 1],
    ]);
for (const ranges of [
  [],
  [[1, 2, 2, 4]],
  [[1, 0, 2, 4]],
  [
    [1, 2, 2, 4],
    [1, 4, 2, 6],
  ],
  [
    [1, 0, 2, 2],
    [1, 0, 2, 4],
  ],
  [
    [0, 1, 5, 2],
    [1, 3, 3, 4],
  ],
  [
    [3, 5, 3, 6],
    [1, 1, 1, 2],
    [1, 3, 1, 3],
  ],
  [[0, 0, 5, 7]],
  [
    [1, 1, 1, 2],
    [3, 1, 3, 2],
  ],
  [
    [1, 1, 1, 2],
    [1, 5, 1, 6],
  ],
])
  add([["S", 0, ranges]]);
for (const mode of ["P", "A", "V", "W"])
  add(
    [
      ["M", 0, 0, 5, 1, 2, 1],
      ["M", 0, 1, 2, 4, 5, 1],
      ["M", 1, 1, 1, 8, 9, 1],
      [mode, 1, 0],
      ["H", 1, 0, 2],
      ["B", 1, 7, 8],
    ],
    [5, 7],
    [0, 1, 2, 3, 4, 5, 6],
    [3, 9],
  );
for (const start of [0, 1, 2, 3])
  for (const offset of [-3, -1, 0, 1, 2, 3])
    add(
      [
        ["M", 0, 0, 5, 1, 2, 1],
        ["M", 0, 1, 2, 4, 5, 1],
        ["M", 1, 1, 1, 8, 9, 1],
        ["X", 1, 0, 3],
        ["X", 1, 0, -3],
        ["A", 1, 0],
        ["X", 1, start, offset],
      ],
      [5, 7],
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      [3, 9],
    );
add([
  ["M", 0, 1, 2, 2, 4, 1],
  ["M", 0, 0, 5, 4, 5, 1],
  ["M", 0, 0, 5, 2, 3, 0],
]);
add([
  ["M", 0, 0, 5, 1, 2, 1],
  ["M", 0, 0, 5, 4, 6, 1],
  ["M", 0, 1, 2, 0, 5, 0],
]);
add([]);
add([
  ["M", 0, 3, 3, 1, 2, 0],
  ["C", 0],
]);
add([
  ["B", 0, 1, 3],
  ["X", 0, 0, 3],
  ["B", 0, 4, 5],
]);
add([
  ["M", 0, 0, 5, 2, 3, 1],
  ["K", 0, 1],
  ["M", 0, 0, 5, 5, 6, 1],
  ["N", 0],
  ["N", 0],
  ["N", 0],
  ["N", 0],
]);
add([
  ["M", 0, 1, 1, 2, 3, 1],
  ["K", 0, 1],
  ["M", 0, 1, 1, 5, 6, 1],
  ["N", 0],
  ["N", 0],
  ["N", 0],
]);
add([
  ["M", 0, 0, 5, 2, 3, 1],
  ["M", 0, 1, 1, 5, 6, 1],
  ["K", 0, 1],
  ["M", 0, 0, 5, 0, 7, 1],
  ["N", 0],
  ["Q", 0, 4],
  ["N", 0],
  ["N", 0],
  ["N", 0],
]);
add([
  ["K", 0, 1],
  ["M", 0, 1, 1, 2, 4, 1],
  ["N", 0],
]);
add([
  ["M", 0, 0, 5, 2, 3, 1],
  ["M", 0, 1, 1, 0, 0, 1],
  ["M", 0, 1, 1, 6, 6, 1],
]);
// Original testMultiMark_FourRanges first rectangle and negative-marking coordinates.
add([["M", 0, 10, 20, 5, 10, 1]], [16383, 1048575], [9, 10, 15, 16, 20, 21, 26]);
add(
  [
    ["M", 0, 0, 16383, 5, 5, 1],
    ["M", 0, 10, 25, 8, 20, 1],
    ["M", 0, 0, 16383, 12, 12, 1],
    ["M", 0, 17, 20, 5, 5, 0],
  ],
  [16383, 1048575],
  [6, 10, 13, 16, 17, 18, 20, 25, 30, 16383, 16384],
);
const driver = `
${boolPrefix}
#include <string_view>
#define SAL_WARN_UNUSED
#define TOOLS_DLLPUBLIC
#define COVERITY_NOEXCEPT_FALSE
using SCTAB=int16_t;using sal_Int32=int32_t;using sal_Int16=int16_t;using sal_Unicode=char16_t;using SCSIZE=size_t;
namespace tools { using Long=int64_t; }
namespace sal { ${originals.cast} }
constexpr SCROW MAXROW=1048575,MAXROW_JUMBO=16777215;
${originals.validRow}
// Exact original fields/constructor and needed bound methods; intrusive lifetime
// services are outside this borrowed explicit-bounds comparison.
struct ScSheetLimits { ${originals.limitFields} ${originals.limitValidRow} ${originals.limitCount} };
${interval(sources.address, "template <typename T> constexpr void PutInOrder", "// The result of ConvertRef()")}
class ScAddress { SCROW nRow;SCCOL nCol;SCTAB nTab;public:
enum Uninitialized {UNINITIALIZED};enum InitializeInvalid {INITIALIZE_INVALID};
${originals.addressInline}
};
class ScRange {public:ScAddress aStart,aEnd;${originals.rangeInline}${originals.rangeOrder}};
namespace rtl {class OUString;} using rtl::OUString;
enum class ScRefFlags:uint16_t;
${originals.updateMode}
namespace formula {struct FormulaGrammar {${originals.convention}};}
class ScDocument;
${originals.refClass}
${originals.refDestructor}
${originals.listClass}
${originals.listConstructors}
${originals.listDestructor}
${originals.listAppend}
${originals.markClasses}
${originals.markMethods}
${originals.classes}
${originals.methods}
// Use the original friend solely for native stored-entry observations.
class ScDocument {public:static const auto& entries(const ScMarkArray& a){return a.mvData;}static auto maxRow(const ScMarkArray& a){return a.mrSheetLimits.mnMaxRow;}};
void array(const ScMarkArray& a){std::cout<<"["<<ScDocument::maxRow(a)<<",[";bool first=true;for(const auto& e:ScDocument::entries(a)){if(!first)std::cout<<",";first=false;std::cout<<"["<<e.nRow<<","<<e.bMarked<<"]";}std::cout<<"]]";}
void snapshot(const ScMultiSel& s,const ScSheetLimits& limits,const std::vector<SCCOL>& cols){
 std::cout<<"["<<s.IsEmpty()<<","<<s.HasAnyMarks()<<","<<s.GetMultiSelectionCount()<<",";array(s.GetRowSelArray());std::cout<<",[";
 bool first=true;for(auto col:cols){if(!first)std::cout<<",";first=false;SCROW a=-71,b=-72;bool one=s.HasOneMark(col,a,b);auto raw=s.GetMultiSelArray(col);
 std::cout<<"["<<s.HasMarks(col)<<",["<<one<<","<<a<<","<<b<<"],";if(raw)array(*raw);else std::cout<<"null";
 std::cout<<",[";ScMultiSelIter iter(s,col);bool next;bool initial=true;do{a=-81;b=-82;next=iter.Next(a,b);if(!initial)std::cout<<",";initial=false;std::cout<<"["<<next<<","<<a<<","<<b<<"]";}while(next);a=-81;b=-82;std::cout<<",["<<iter.Next(a,b)<<","<<a<<","<<b<<"]],";
 auto normalized=s.GetMarkArray(col);array(normalized);std::cout<<",[";
 for(int row=-1;row<=9;++row){if(row!=-1)std::cout<<",";std::cout<<"["<<s.GetMark(col,row)<<","<<s.GetNextMarked(col,row,true)<<","<<s.GetNextMarked(col,row,false)<<","<<s.IsAllMarked(col,row,row)<<","<<s.IsAllMarked(col,row,row+2)<<"]";}
 std::cout<<"]]";
 }
 std::cout<<"],[";first=true;for(auto a:cols)for(auto b:cols){if(!first)std::cout<<",";first=false;std::cout<<s.HasEqualRowsMarked(a,b);}
 std::cout<<"],[";first=true;for(auto col:cols)for(auto min:cols){if(!first)std::cout<<",";first=false;std::cout<<s.GetStartOfEqualColumns(col,min);}
 std::cout<<"],[";for(int row=-1;row<=9;++row){if(row!=-1)std::cout<<",";std::cout<<"["<<s.IsRowMarked(row)<<","<<s.IsRowRangeMarked(row,row+2)<<"]";}std::cout<<"]]";
}
int main(int argc,char** argv){
 std::cout<<std::boolalpha;
 if(argc>1 && std::string_view(argv[1])=="profile"){
  ScSheetLimits limits(16383,1048575);ScMarkArray value(limits);std::vector<ScMarkArray> v,other;
  std::cout<<R"({"library":")";
#ifdef _LIBCPP_VERSION
  std::cout<<"libc++"<<_LIBCPP_VERSION;
#else
  std::cout<<"libstdc++"<<__GLIBCXX__;
#endif
  std::cout<<R"(","trace":[)";bool first=true;auto emit=[&](){if(!first)std::cout<<",";first=false;std::cout<<"["<<v.size()<<","<<v.capacity()<<"]";};
  v.resize(2,value);emit();v.resize(3,value);emit();v.resize(1,value);emit();v.resize(5,value);emit();other.resize(2,value);v=other;emit();other.resize(9,value);v=other;emit();v.clear();emit();v.resize(1,value);emit();v.insert(v.begin(),10,value);emit();v.erase(v.begin(),v.begin()+4);emit();v=std::move(v);emit();std::cout<<"]}";return 0;
 }
 if(argc>1){ScSheetLimits limits(16383,1048575);ScMultiSel s(limits);ScMultiSelIter i(s,1);ScFlatBoolRowSegments::RangeData data{};i.GetRangeData(0,data);return 0;}
 size_t total;std::cin>>total;std::cout<<"[";
 for(size_t i=0;i<total;++i){int maxCol,maxRow,otherCol,otherRow;size_t colCount,count;std::cin>>maxCol>>maxRow>>otherCol>>otherRow>>colCount;
 ScSheetLimits limits(maxCol,maxRow),otherLimits(otherCol,otherRow);std::vector<SCCOL> cols(colCount);for(auto& c:cols){int x;std::cin>>x;c=x;}std::cin>>count;
 std::unique_ptr<ScMultiSel> s[2]={std::make_unique<ScMultiSel>(limits),std::make_unique<ScMultiSel>(otherLimits)};std::unique_ptr<ScMultiSelIter> iter;
 if(i)std::cout<<",";std::cout<<"[";
 for(size_t j=0;j<std::max(size_t(1),count);++j){char op='Z';int t=0;if(count)std::cin>>op>>t;if(j)std::cout<<",";std::cout<<"[";
 if(op=='M'){int64_t a,b,c,d;bool marked;std::cin>>a>>b>>c>>d>>marked;s[t]->SetMarkArea(a,b,c,d,marked);std::cout<<"null";}
 else if(op=='B'){int a,b;std::cin>>a>>b;s[t]->MarkAllCols(a,b);std::cout<<"null";}
 else if(op=='C'){s[t]->Clear();std::cout<<"null";}
 else if(op=='X'||op=='H'){int a,b;std::cin>>a>>b;if(op=='X')s[t]->ShiftCols(a,b);else s[t]->ShiftRows(a,b);std::cout<<"null";}
 else if(op=='S'){size_t n;std::cin>>n;ScRangeList list;while(n--){int a,b,c,d;std::cin>>a>>b>>c>>d;list.push_back(ScRange(a,b,0,c,d,0));}s[t]->Set(list);std::cout<<"null";}
 else if(op=='P'||op=='A'){int from;std::cin>>from;if(op=='P')s[t]=std::make_unique<ScMultiSel>(*s[from]);else *s[t]=*s[from];std::cout<<"null";}
 else if(op=='V'||op=='W'){int from;std::cin>>from;if(op=='V'){auto moved=std::make_unique<ScMultiSel>(std::move(*s[from]));std::cout<<"["<<s[from]->IsEmpty()<<","<<s[from]->HasAnyMarks()<<","<<s[from]->GetMultiSelectionCount()<<"]";s[from]->Clear();s[t]=std::move(moved);}else{*s[t]=std::move(*s[from]);std::cout<<"["<<s[from]->IsEmpty()<<","<<s[from]->HasAnyMarks()<<","<<s[from]->GetMultiSelectionCount()<<"]";s[from]->Clear();}}
 else if(op=='K'){int col;std::cin>>col;iter=std::make_unique<ScMultiSelIter>(*s[t],col);std::cout<<"null";}
 else if(op=='N'){SCROW a=-71,b=-72;bool found=iter->Next(a,b);std::cout<<"["<<found<<","<<a<<","<<b<<"]";}
 else if(op=='Q'){int row;std::cin>>row;ScFlatBoolRowSegments::RangeData data{-71,-72,true};bool found=iter->GetRangeData(row,data);std::cout<<"["<<found<<","<<data.mnRow1<<","<<data.mnRow2<<","<<data.mbValue<<"]";}
 else if(op=='Z')std::cout<<"null";else return 3;
 std::cout<<",";snapshot(*s[0],limits,cols);std::cout<<",";snapshot(*s[1],otherLimits,cols);std::cout<<"]";
 }
 std::cout<<"]";
 }
 std::cout<<"]";
}
`;
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/multi-selection-original.cpp`, driver);
const binary = path.resolve(`${target}/multi-selection-original`),
  mode = process.argv[2];
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-fsanitize=address,undefined",
    "-fno-sanitize-recover=all",
    ...(mode === "--debug-assertion" ? [] : ["-DNDEBUG"]),
    "-I",
    "vendor/mdds-reference/include",
    "-I",
    "output/playwright/mdds-native/boost_1_91_0",
    `${target}/multi-selection-original.cpp`,
    "-o",
    binary,
  ],
  { stdio: "inherit" },
);
if (mode === "--debug-assertion") {
  try {
    execFileSync(binary, ["assert"], { stdio: "pipe" });
    throw new Error("Missing native GetRangeData assertion.");
  } catch (error) {
    if (!error.stderr?.toString().includes("pRowSegs")) throw error;
    writeFileSync(`${target}/multi-selection-assertion.log`, error.stderr);
  }
} else {
  const input = [String(cases.length)];
  for (const state of cases) {
    input.push(
      [
        ...state.limits,
        ...state.otherLimits,
        state.cols.length,
        ...state.cols,
        state.operations.length,
      ].join(" "),
    );
    for (const command of state.operations) {
      const [op, t, ...args] = command;
      if (op === "S") input.push([op, t, args[0].length, ...args[0].flat()].join(" "));
      else input.push(command.join(" "));
    }
  }
  writeFileSync(`${target}/multi-selection-input.txt`, input.join("\n"));
  const inp = openSync(`${target}/multi-selection-input.txt`, "r"),
    out = openSync(`${target}/multi-selection-output.json`, "w");
  try {
    execFileSync(binary, { stdio: [inp, out, "inherit"] });
  } finally {
    closeSync(inp);
    closeSync(out);
  }
  const outputs = JSON.parse(readFileSync(`${target}/multi-selection-output.json`, "utf8"));
  // Intern whole observations without dropping any command or owner comparison.
  const snapshots = [],
    indexes = new Map();
  /** Interns a complete native observation. @param value - Output. @returns Stable fixture index. */
  function index(value) {
    const text = JSON.stringify(value);
    let i = indexes.get(text);
    if (i === undefined) {
      i = snapshots.length;
      indexes.set(text, i);
      snapshots.push(value);
    }
    return i;
  }
  const result = {
    baselineCommit: pinned,
    vectorRuntime: JSON.parse(execFileSync(binary, ["profile"], { encoding: "utf8" })),
    buildMode: "NDEBUG custom explicit bounds; separate unchanged debug assertion",
    sourceHashes: Object.fromEntries(
      Object.entries(sources).map(
        /** Hashes original bytes. @param pair - Source name/text. @returns Pair. */ ([
          name,
          text,
        ]) => [name, digest(text)],
      ),
    ),
    extractedHashes: Object.fromEntries(
      Object.entries({ ...originals, boolPrefix }).map(
        /** Hashes unchanged groups. @param pair - Group name/text. @returns Pair. */ ([
          name,
          text,
        ]) => [name, digest(text)],
      ),
    ),
    snapshots,
    cases: cases.map(
      /** Retains every native command output and both owner observations. @param state - Inputs. @param i - Index. @returns Fixture case. */ (
        state,
        i,
      ) => ({
        ...state,
        output: outputs[i].map(
          /** Interns both owners. @param step - Native step. @returns Encoded step. */ (step) => [
            step[0],
            index(step[1]),
            index(step[2]),
          ],
        ),
      }),
    ),
  };
  if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
  else if (mode === "--check") {
    if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
      throw new Error("Multi-selection native fixture differs.");
  } else throw new Error("Usage: --write|--check|--debug-assertion");
  console.log(
    `Original ScMultiSel: ${cases.length} sequences/${snapshots.length} complete observations; unchanged actual owners; real mdds/ScRangeList/SvRefBase; ASan/UBSan; ${mode}.`,
  );
}
