/** @fileoverview Compiles unchanged pinned ScRefUpdate geometry and original coordinates for portable differential fixtures. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/calc-native";
const fixture = "apps/office/src/sc/source/core/tool/native-ref-update-geometry-cases.json";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Reference geometry requires pinned native HEAD.");
/** Reads exact pinned original bytes. @param file - Upstream path. @returns Source. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    source
  )
    throw new Error(`Original reference geometry differs from pinned blob: ${file}`);
  return source;
}
/** Extracts an unchanged complete original interval. @param source - Text. @param first - Inclusive marker. @param last - Exclusive marker. @returns Original bytes. */
function interval(source, first, last) {
  const begin = source.indexOf(first),
    end = source.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing native interval: ${first}`);
  return source.slice(begin, end);
}
/** Hashes source bytes. @param source - Text. @returns SHA256. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
const header = original("sc/source/core/inc/refupdat.hxx"),
  source = original("sc/source/core/tool/refupdat.cxx"),
  address = original("sc/inc/address.hxx"),
  types = original("sc/inc/types.hxx"),
  global = original("sc/inc/global.hxx");
const originals = {
  updateHeader: interval(header, "enum ScRefUpdateRes", "/* vim:set"),
  geometry: interval(source, "void ScRefUpdate::DoTranspose(", "/* vim:set"),
  addressInline: interval(
    address,
    "    constexpr ScAddress() :",
    "    /**\n        @param  pSheetEndPos",
  ),
  rangeInline: interval(address, "    ScRange() :", "    inline bool Contains("),
  rangeOrder: interval(address, "    void PutInOrder() { aStart.PutInOrder(aEnd); }", "\n\n"),
  contains: interval(
    address,
    "inline bool ScRange::Contains( const ScRange&",
    "inline bool ScRange::Intersects(",
  ),
  mode: interval(global, "enum UpdateRefMode", "enum FillDir"),
};
const driver = `
${header.slice(0, header.indexOf("#pragma once"))}
#include <algorithm>
#include <cstdint>
#include <iostream>
#define SAL_WARN_UNUSED
#define SC_DLLPUBLIC
#define OSL_ENSURE(...)
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_Int64=int64_t;
namespace sal { template<typename T,typename U> T static_int_cast(U v) {return static_cast<T>(v);} }
${interval(types, "typedef sal_Int32 SCROW;", "typedef ::boost::intrusive_ptr<ScMatrix>")}
${interval(address, "template <typename T> constexpr void PutInOrder", "// The result of ConvertRef()")}
class ScAddress {SCROW nRow;SCCOL nCol;SCTAB nTab;public:enum Uninitialized {UNINITIALIZED};enum InitializeInvalid {INITIALIZE_INVALID};${originals.addressInline}};
class ScRange {public:ScAddress aStart,aEnd;${originals.rangeInline}${originals.rangeOrder}bool Contains(const ScRange&) const;};
${originals.contains}
class ScDocument {SCTAB count;public:ScDocument(SCTAB n):count(n){}SCTAB GetTableCount() const{return count;}};
class ScBigRange;struct ScComplexRefData;
${originals.mode}
${originals.updateHeader}
${originals.geometry}
ScAddress readAddress() {int c,r,t;std::cin>>c>>r>>t;return ScAddress(c,r,t);}
ScRange readRange() {auto a=readAddress(),b=readAddress();return ScRange(a.Col(),a.Row(),a.Tab(),b.Col(),b.Row(),b.Tab());}
void emit(const ScRange& r) {std::cout<<'['<<r.aStart.Col()<<','<<r.aStart.Row()<<','<<r.aStart.Tab()<<','<<r.aEnd.Col()<<','<<r.aEnd.Row()<<','<<r.aEnd.Tab()<<']';}
int main() {std::cout<<'[';size_t count;std::cin>>count;for(size_t i=0;i<count;++i) {if(i)std::cout<<',';char op;int tables;std::cin>>op>>tables;ScDocument doc(tables);auto area=readRange(),what=readRange();auto dest=readAddress();int dx,dy;std::cin>>dx>>dy;std::cout<<'[';
 if(op=='D') {SCCOL c=what.aStart.Col();SCROW r=what.aStart.Row();SCTAB t=what.aStart.Tab();ScRefUpdate::DoTranspose(c,r,t,doc,area,dest);std::cout<<'['<<c<<','<<r<<','<<t<<']';}
 else {ScRefUpdateRes result;
 if(op=='T')result=ScRefUpdate::UpdateTranspose(doc,area,dest,what);
 else if(op=='S')result=ScRefUpdate::UpdateTranspose(doc,what,dest,what);
 else if(op=='B')result=ScRefUpdate::UpdateTranspose(doc,area,what.aStart,what);
 else if(op=='E')result=ScRefUpdate::UpdateTranspose(doc,what,what.aEnd,what);
 else if(op=='A')result=ScRefUpdate::UpdateGrow(what,dx,dy,what);
 else result=ScRefUpdate::UpdateGrow(area,dx,dy,what);
 std::cout<<result<<',';emit(what);}
 std::cout<<']';}std::cout<<']';}
`;
const cases = [];
/** Adds one fully initialized native input. @param op - Operation. @param tables - Positive sheet count. @param area - Source/area. @param what - Reference. @param dest - Destination. @param dx - Column growth. @param dy - Row growth. @returns Nothing. */
function add(op, tables, area, what, dest = [0, 0, 0], dx = 0, dy = 0) {
  cases.push({ op, tables, area, what, dest, dx, dy });
}
const area = [1, 1, 1, 3, 3, 3];
let index = 0;
for (const c1 of [0, 1, 2, 3, 4])
  for (const c2 of [0, 1, 2, 3, 4])
    for (const r1 of [0, 1, 2, 3, 4])
      for (const r2 of [0, 1, 2, 3, 4])
        for (const t1 of [0, 1, 2, 3, 4])
          for (const t2 of [0, 1, 2, 3, 4]) {
            const delta = [-2, 0, 3];
            add(
              "G",
              5,
              area,
              [c1, r1, t1, c2, r2, t2],
              [0, 0, 0],
              delta[index % 3],
              delta[Math.floor(index / 3) % 3],
            );
            index++;
          }
for (const dx of [-20, 0, 20])
  for (const dy of [-20, 0, 20])
    for (const op of ["G", "A"])
      add(op, 5, [32760, 100, 0, 32767, 200, 3], [32760, 100, 0, 32767, 200, 3], [0, 0, 0], dx, dy);
const sources = [
  [0, 0, 0, 4, 6, 2],
  [1, 2, 1, 5, 7, 3],
  [4, 6, 2, 0, 0, 0],
  [0, 0, -4, 32767, 100000, 8],
];
const refs = [
  [0, 0, 0, 0, 0, 0],
  [1, 2, 1, 3, 4, 2],
  [1, 3, 2, 3, 5, 3],
  [0, 0, -4, 32767, 99999, 8],
  [4, 6, 2, 0, 0, 0],
  [2, 3, 1, 2, 3, 1],
  [8, 9, 7, 9, 10, 8],
];
for (const tables of [1, 3, 5])
  for (const source of sources)
    for (const ref of refs)
      for (const dest of [
        [0, 0, 0],
        [5, 7, -12],
        [5, 7, 0],
        [5, 7, 14],
        [32767, 100, 3],
      ])
        for (const op of ["T", "S", "B", "E"]) add(op, tables, source, ref, dest);
for (const tables of [1, 3, 5])
  for (const source of sources)
    for (const col of [0, 2, 32767])
      for (const row of [0, 2, 32767, 65536, 100000])
        for (const tab of [-20, 0, 2, 20])
          for (const destTab of [-12, 0, 1, 14])
            add("D", tables, source, [col, row, tab, col, row, tab], [32767, 100, destTab]);
const input = [String(cases.length)];
for (const c of cases)
  input.push(
    `${c.op} ${c.tables}`,
    c.area.join(" "),
    c.what.join(" "),
    c.dest.join(" "),
    `${c.dx} ${c.dy}`,
  );
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "refupdat-geometry-probe.cxx"),
  binary = path.join(target, "refupdat-geometry-probe");
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
    maxBuffer: 32 * 1024 * 1024,
  }),
);
const result = {
  baselineCommit: pinned,
  sourceHashes: {
    header: digest(header),
    source: digest(source),
    address: digest(address),
    types: digest(types),
    global: digest(global),
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes unchanged native groups. @param entry - Name and bytes. @returns Hash pair. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Attaches original native output. @param value - Input. @param index - Native order. @returns Fixture case. */ (
      value,
      index,
    ) => ({ ...value, output: outputs[index] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Reference geometry native fixture differs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned ScRefUpdate geometry: ${cases.length} cases; unchanged original bodies; ASan/UBSan clean; ${mode}.`,
);
