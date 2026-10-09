/** @fileoverview Executes unchanged pinned signed64 big-address/range bodies and saves exact portable comparison fixtures. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const fixture = "apps/office/src/sc/source/core/data/native-big-range-cases.json";
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
int main() {
 std::cout<<std::boolalpha<<"{\\"addresses\\":[";
 size_t n;std::cin>>n;for(size_t i=0;i<n;++i) {if(i)std::cout<<',';int c,r,t;std::cin>>c>>r>>t;ScDocument doc(c,r,t);auto a=readAddress();std::cout<<'[';bigAddress(a);std::cout<<','<<a.IsValid(doc)<<',';ordinary(a.MakeAddress(doc));std::cout<<']';}
 std::cout<<"],\\"ranges\\":[";
 std::cin>>n;for(size_t i=0;i<n;++i) {if(i)std::cout<<',';int c,r,t;std::cin>>c>>r>>t;ScDocument doc(c,r,t);auto first=readRange(),second=readRange();auto point=readAddress();std::cout<<'[';bigRange(first);std::cout<<','<<first.IsValid(doc)<<',';ordinaryRange(first.MakeRange(doc));std::cout<<','<<first.Contains(second)<<','<<first.Contains(point)<<','<<first.Intersects(second)<<','<<(first==second)<<','<<(first!=second)<<']';}
 std::cout<<"],\\"mutations\\":[";
 ScBigAddress a;bigAddress(a);a.Set(9007199254740993LL,-9007199254740993LL,9007199254740995LL);std::cout<<',';bigAddress(a);a.IncCol();a.IncRow();a.IncTab();std::cout<<',';bigAddress(a);
 a.IncCol(-17);a.IncRow(23);a.IncTab(-29);std::cout<<',';bigAddress(a);
 a.SetCol(std::numeric_limits<sal_Int64>::min());a.SetRow(std::numeric_limits<sal_Int64>::max());a.SetTab(-1);std::cout<<',';bigAddress(a);
 a=ScAddress(32767,2147483647,-1);std::cout<<',';bigAddress(a);ScBigAddress b(a);a.Set(1,2,3);std::cout<<',';bigAddress(b);b=a;std::cout<<',';bigAddress(b);
 std::cout<<"],\\"rangeMutations\\":[";ScBigRange range;bigRange(range);range.Set(9,8,7,1,2,3);std::cout<<',';bigRange(range);ScBigRange copy(range);range.Set(1,1,1,2,2,2);std::cout<<',';bigRange(copy);copy=range;std::cout<<',';bigRange(copy);
 ScRange normal(4,3,2,1,0,-1);ScBigRange from(normal);std::cout<<',';bigRange(from);ScBigAddress small(normal.aStart);std::cout<<"],\\"fromOrdinary\\":";bigAddress(small);
 std::cout<<",\\"equalities\\":["<<(a==b)<<',';b.IncCol();std::cout<<(a==b)<<',';b=a;b.IncRow();std::cout<<(a==b)<<',';b=a;b.IncTab();std::cout<<(a==b)<<','<<(a!=b)<<','<<(range==copy)<<',';copy.aStart.IncCol();std::cout<<(range==copy)<<',';copy=range;copy.aEnd.IncCol();std::cout<<(range==copy)<<"]}";
}
`;
const minimum = -(1n << 63n),
  maximum = (1n << 63n) - 1n;
const columns = [
  minimum,
  -9007199254740993n,
  -2n,
  -1n,
  0n,
  1n,
  7n,
  8n,
  16383n,
  16384n,
  9007199254740992n,
  9007199254740993n,
  maximum,
];
const rows = [
  minimum,
  -9007199254740993n,
  -2n,
  -1n,
  0n,
  1n,
  11n,
  12n,
  1048575n,
  1048576n,
  16777215n,
  16777216n,
  9007199254740993n,
  maximum,
];
const sheets = [
  minimum,
  -9007199254740993n,
  -2n,
  -1n,
  0n,
  1n,
  2n,
  3n,
  9999n,
  10000n,
  9007199254740993n,
  maximum,
];
const documents = [
  [16383, 1048575, 3],
  [16383, 16777215, 2],
  [7, 11, 0],
];
const addresses = [];
for (const doc of documents)
  for (const col of columns)
    for (const row of rows)
      for (const tab of sheets) addresses.push({ doc, values: [col, row, tab].map(String) });
const candidates = [
  [0n, 0n, 0n, 0n, 0n, 0n],
  [1n, 1n, 1n, 3n, 3n, 2n],
  [3n, 3n, 2n, 1n, 1n, 1n],
  [minimum, minimum, minimum, maximum, maximum, maximum],
  [-1n, -1n, -1n, 0n, 0n, 0n],
  [0n, 0n, 0n, 16383n, 1048575n, 2n],
  [0n, 0n, 0n, 16384n, 1048576n, 3n],
  [0n, 0n, 0n, 7n, 11n, 0n],
  [0n, 0n, 0n, 8n, 12n, 0n],
  [minimum, 0n, 0n, maximum, 3n, 2n],
  [0n, minimum, 0n, 3n, maximum, 2n],
  [0n, 0n, minimum, 3n, 3n, maximum],
  [
    9007199254740992n,
    9007199254740992n,
    9007199254740992n,
    9007199254740993n,
    9007199254740993n,
    9007199254740993n,
  ],
  [maximum, maximum, maximum, minimum, minimum, minimum],
  [-5n, 1n, 0n, 2n, 8n, 1n],
  [2n, 5n, 0n, 8n, 6n, 1n],
  [2n, 2n, 5n, 8n, 3n, 6n],
];
const ranges = [];
for (const doc of documents)
  for (const first of candidates)
    for (const second of candidates)
      for (const point of [
        [1n, 1n, 1n],
        [minimum, maximum, 0n],
        [maximum, minimum, maximum],
        [9007199254740993n, 9007199254740993n, 9007199254740993n],
      ])
        ranges.push({
          doc,
          first: first.map(String),
          second: second.map(String),
          point: point.map(String),
        });
const input = [String(addresses.length)];
for (const a of addresses) input.push(a.doc.join(" "), a.values.join(" "));
input.push(String(ranges.length));
for (const r of ranges)
  input.push(r.doc.join(" "), r.first.join(" "), r.second.join(" "), r.point.join(" "));
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "bigrange-probe.cxx"),
  binary = path.join(target, "bigrange-probe");
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
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes unchanged body groups. @param entry - Name and original interval. @returns Hash entry. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  addresses: addresses.map(
    /** Attaches actual native outputs. @param a - Inputs. @param index - Order. @returns Address case. */ (
      a,
      index,
    ) => ({ ...a, output: outputs.addresses[index] }),
  ),
  ranges: ranges.map(
    /** Attaches actual native outputs. @param r - Inputs. @param index - Order. @returns Range case. */ (
      r,
      index,
    ) => ({ ...r, output: outputs.ranges[index] }),
  ),
  mutations: outputs.mutations,
  rangeMutations: outputs.rangeMutations,
  fromOrdinary: outputs.fromOrdinary,
  equalities: outputs.equalities,
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Big range fixture differs from pinned native execution.");
} else throw new Error("Usage: node scripts/calc-bigrange-native-probe.mjs --write|--check");
console.log(
  `Pinned Calc big-range probe: ${addresses.length} addresses, ${ranges.length} range relations; original bodies unchanged; ASan/UBSan clean; ${mode}.`,
);
