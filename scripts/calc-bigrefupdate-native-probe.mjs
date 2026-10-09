/** @fileoverview Executes unchanged pinned signed64 big-reference update overload and saves exact portable comparison fixtures. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/tool/native-big-ref-update-cases.json";
const target = "output/playwright/calc-native";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Calc big-range probe requires the exact pinned checkout.");
/** Reads exact original bytes checked against pinned Git. @param file - Upstream path. @returns Original text. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    source
  )
    throw new Error(`Native big-range source differs from pinned Git: ${file}`);
  return source;
}
/** Extracts one complete unchanged body interval. @param source - Text. @param first - Inclusive marker. @param last - Exclusive marker. @returns Original interval. */
function interval(source, first, last) {
  const begin = source.indexOf(first),
    end = source.indexOf(last, begin + first.length);
  if (begin < 0 || end < begin) throw new Error(`Missing original big-range interval: ${first}`);
  return source.slice(begin, end);
}
/** Hashes original bytes. @param source - Text. @returns SHA256. */
function digest(source) {
  return createHash("sha256").update(source).digest("hex");
}
const header = original("sc/inc/bigrange.hxx"),
  source = original("sc/source/core/data/bigrange.cxx"),
  address = original("sc/inc/address.hxx"),
  types = original("sc/inc/types.hxx");
const originals = {
  owners: interval(header, "class ScBigAddress", "/* vim:set"),
  validity: interval(source, "bool ScBigAddress::IsValid(", "/* vim:set"),
  addressInline: interval(
    address,
    "    constexpr ScAddress() :",
    "    /**\n        @param  pSheetEndPos",
  ),
  rangeInline: interval(address, "    ScRange() :", "    inline bool Contains("),
  rangeOrder: interval(address, "    void PutInOrder() { aStart.PutInOrder(aEnd); }", "\n\n"),
};
const updateHeader = original("sc/source/core/inc/refupdat.hxx");
const updateSource = original("sc/source/core/tool/refupdat.cxx");
const global = original("sc/inc/global.hxx");
originals.updateHeader = interval(updateHeader, "enum ScRefUpdateRes", "/* vim:set");
originals.mode = interval(global, "enum UpdateRefMode", "enum FillDir");
originals.helpers = interval(
  updateSource,
  "static bool lcl_IsWrapBig(",
  "ScRefUpdateRes ScRefUpdate::Update( const ScDocument&",
);
originals.update = interval(
  updateSource,
  "ScRefUpdateRes ScRefUpdate::Update( UpdateRefMode",
  "void ScRefUpdate::MoveRelWrap(",
);
const driver = `
${header.slice(0, header.indexOf("#pragma once"))}
#include <algorithm>
#include <cstdint>
#include <iostream>
#include <limits>
#include <string>
#define SAL_WARN_UNUSED
#define SC_DLLPUBLIC
using sal_Int64=int64_t; using sal_Int32=int32_t; using sal_Int16=int16_t;
${interval(types, "typedef sal_Int32 SCROW;", "typedef ::boost::intrusive_ptr<ScMatrix>")}
${interval(address, "constexpr SCROW MAXROWCOUNT =", "constexpr OUString MAXROW_STRING")}
${interval(address, "template <typename T> constexpr void PutInOrder", "// The result of ConvertRef()")}
class ScAddress { SCROW nRow; SCCOL nCol; SCTAB nTab; public:
 enum Uninitialized { UNINITIALIZED }; enum InitializeInvalid { INITIALIZE_INVALID };
 ${originals.addressInline}
};
class ScRange { public: ScAddress aStart,aEnd;
 ${originals.rangeInline}
 ${originals.rangeOrder}
};
class ScDocument { SCCOL col;SCROW row;SCTAB count;public:ScDocument(SCCOL c,SCROW r,SCTAB n):col(c),row(r),count(n){} SCCOL MaxCol() const {return col;} SCROW MaxRow() const {return row;} SCTAB GetTableCount() const {return count;} };
${originals.owners}
${originals.validity}
ScBigAddress readAddress() { sal_Int64 c,r,t;std::cin>>c>>r>>t;return ScBigAddress(c,r,t); }
ScBigRange readRange() { auto a=readAddress(),b=readAddress();return ScBigRange(a.Col(),a.Row(),a.Tab(),b.Col(),b.Row(),b.Tab()); }
void bigAddress(const ScBigAddress& a) { sal_Int64 c,r,t;a.GetVars(c,r,t); std::cout<<"[\\""<<c<<"\\",\\""<<r<<"\\",\\""<<t<<"\\"]"; }
void bigRange(const ScBigRange& r) {sal_Int64 c1,r1,t1,c2,r2,t2;r.GetVars(c1,r1,t1,c2,r2,t2);std::cout<<"[\\""<<c1<<"\\",\\""<<r1<<"\\",\\""<<t1<<"\\",\\""<<c2<<"\\",\\""<<r2<<"\\",\\""<<t2<<"\\"]";}
void ordinary(const ScAddress& a) {std::cout<<'['<<a.Col()<<','<<a.Row()<<','<<a.Tab()<<']';}
void ordinaryRange(const ScRange& r) {std::cout<<'['<<r.aStart.Col()<<','<<r.aStart.Row()<<','<<r.aStart.Tab()<<','<<r.aEnd.Col()<<','<<r.aEnd.Row()<<','<<r.aEnd.Tab()<<']';}
class ScComplexRefData;
${originals.mode}
${originals.updateHeader}
${originals.helpers}
${originals.update}
int main() {size_t n;std::cin>>n;std::cout<<'[';for(size_t i=0;i<n;++i) {
 if(i)std::cout<<',';int mode,dx,dy,dz,alias;std::cin>>mode>>dx>>dy>>dz>>alias;auto where=readRange(),what=readRange();
 auto result=ScRefUpdate::Update(static_cast<UpdateRefMode>(mode),alias?what:where,dx,dy,dz,what);
 std::cout<<'['<<result<<',';bigRange(what);std::cout<<',';bigRange(alias?what:where);std::cout<<']';
 }std::cout<<']';}
`;
const minimum = -(1n << 63n),
  maximum = (1n << 63n) - 1n,
  precise = 9007199254740993n;
const profiles = [
  [0n, 0n, 0n, 0n, 0n, 0n],
  [-2n, -2n, -2n, 2n, 2n, 2n],
  [0n, 0n, 0n, 3n, 3n, 3n],
  [3n, 3n, 3n, 0n, 0n, 0n],
  [minimum, minimum, minimum, maximum, maximum, maximum],
  [minimum, 0n, 0n, maximum, 3n, 3n],
  [0n, minimum, 0n, 3n, maximum, 3n],
  [0n, 0n, minimum, 3n, 3n, maximum],
  [precise, precise, precise, precise + 2n, precise + 3n, precise + 1n],
  [minimum, minimum, minimum, minimum + 3n, minimum + 3n, minimum + 3n],
  [maximum - 3n, maximum - 3n, maximum - 3n, maximum, maximum, maximum],
  [maximum, maximum, maximum, maximum, maximum, maximum],
  [minimum, minimum, minimum, minimum, minimum, minimum],
  [0n, 0n, 0n, maximum, 3n, 3n],
  [0n, 0n, 0n, 3n, maximum, 3n],
  [0n, 0n, 0n, 3n, 3n, maximum],
];
const sources = [
  profiles[4],
  [-3n, -3n, -3n, 3n, 3n, 3n],
  [1n, 1n, 1n, 4n, 4n, 4n],
  profiles[8],
  profiles[9],
  profiles[10],
  [3n, 3n, 3n, 0n, 0n, 0n],
];
const displacements = [
  [0, 0, 0],
  [1, 1, 1],
  [-1, -1, -1],
  [3, -3, 1],
  [-3, 3, -1],
];
for (const axis of [0, 1, 2])
  for (const value of [-2147483648, -3, -1, 1, 3, 2147483647]) {
    const delta = [0, 0, 0];
    delta[axis] = value;
    displacements.push(delta);
  }
const cases = [];
/** Admits only input arithmetic defined by the unchanged native helper bodies. @param mode - Native mode. @param what - Raw reference. @param delta - Displacement. @returns Whether all possible helper additions are defined or natively protected. */
function defined(mode, what, delta) {
  if (mode !== 0 && mode !== 2) return true;
  for (let axis = 0; axis < 3; axis++) {
    if (what[axis] === minimum && what[axis + 3] === maximum) continue;
    const d = BigInt(delta[axis]);
    for (const value of [what[axis], what[axis + 3]]) {
      if (d < 0n && value + d < minimum) return false;
      if (mode === 2 && d > 0n && value + d > maximum) return false;
    }
  }
  return true;
}
for (const mode of [0, 1, 2, 3])
  for (const alias of [false, true])
    for (const where of sources)
      for (const what of profiles)
        for (const delta of displacements) {
          if (defined(mode, what, delta))
            cases.push({ mode, alias, where: where.map(String), what: what.map(String), delta });
        }
const input = [String(cases.length)];
for (const c of cases)
  input.push([c.mode, ...c.delta, Number(c.alias), ...c.where, ...c.what].join(" "));
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "big-refupdate-probe.cxx"),
  binary = path.join(target, "big-refupdate-probe");
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
    updateHeader: digest(updateHeader),
    updateSource: digest(updateSource),
    global: digest(global),
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes unchanged native intervals. @param entry - Name and source. @returns Hash pair. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Attaches original native outcomes. @param state - Input. @param index - Native order. @returns Fixture case. */ (
      state,
      index,
    ) => ({ ...state, output: outputs[index] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Big-reference update fixture differs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned big ScRefUpdate Update: ${cases.length} defined cases; unchanged original helpers/body; ASan/UBSan clean; ${mode}.`,
);
