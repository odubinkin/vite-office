/** @fileoverview Compiles unchanged pinned ScRefUpdate ordinary updates and original numeric helpers for portable differential fixtures. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
const upstream = "vendor/libreoffice-reference";
const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/calc-native";
const fixture = "apps/office/src/sc/source/core/tool/native-ref-update-cases.json";
if (
  execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pinned
)
  throw new Error("Reference update requires pinned native HEAD.");
/** Reads exact pinned original bytes. @param file - Upstream path. @returns Source. */
function original(file) {
  const source = readFileSync(`${upstream}/${file}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`], { encoding: "utf8" }) !==
    source
  )
    throw new Error(`Original reference update differs from pinned blob: ${file}`);
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
const header = original("sc/source/core/inc/refupdat.hxx");
const source = original("sc/source/core/tool/refupdat.cxx");
const global = original("sc/inc/global.hxx");
const types = original("sc/inc/types.hxx");
const originals = {
  header: interval(header, "enum ScRefUpdateRes", "/* vim:set"),
  mode: interval(global, "enum UpdateRefMode", "enum FillDir"),
  helpers: interval(
    source,
    "template< typename R, typename S, typename U >",
    "template< typename R, typename U >",
  ),
  expansion: interval(
    source,
    "template< typename R, typename S, typename U >\nstatic bool IsExpand",
    "static bool lcl_IsWrapBig",
  ),
  update: interval(
    source,
    "ScRefUpdateRes ScRefUpdate::Update( const ScDocument&",
    "// simple UpdateReference",
  ),
};
const driver = `
${header.slice(0, header.indexOf("#pragma once"))}
#include <cstdint>
#include <iostream>
#define OSL_ENSURE(...)
using sal_Int16=int16_t;using sal_Int32=int32_t;using sal_Int64=int64_t;
namespace sal { template<typename T,typename U> T static_int_cast(U v) { return static_cast<T>(v); } }
${interval(types, "typedef sal_Int32 SCROW;", "typedef ::boost::intrusive_ptr<ScMatrix>")}
class ScDocument { SCCOL col;SCROW row;SCTAB count;bool expand;public:
 ScDocument(SCCOL c,SCROW r,SCTAB t,bool e):col(c),row(r),count(t),expand(e){}
 SCCOL MaxCol() const {return col;}SCROW MaxRow() const {return row;}SCTAB GetTableCount() const{return count;}bool IsExpandRefs() const{return expand;}
};
class ScBigRange;struct ScComplexRefData;class ScAddress;class ScRange;
${originals.mode}
${originals.header}
${originals.helpers}
${originals.expansion}
${originals.update}
int main() { size_t n;std::cin>>n;std::cout<<'[';for(size_t i=0;i<n;++i) {
 if(i)std::cout<<',';int mc,mr,t,e,m;std::cin>>mc>>mr>>t>>e>>m;ScDocument doc(mc,mr,t,e);
 int c1,r1,t1,c2,r2,t2,dx,dy,dz;std::cin>>c1>>r1>>t1>>c2>>r2>>t2>>dx>>dy>>dz;
 int ac1,ar1,at1,ac2,ar2,at2;std::cin>>ac1>>ar1>>at1>>ac2>>ar2>>at2;
 SCCOL x1=ac1,x2=ac2;SCROW y1=ar1,y2=ar2;SCTAB z1=at1,z2=at2;
 auto result=ScRefUpdate::Update(doc,static_cast<UpdateRefMode>(m),c1,r1,t1,c2,r2,t2,dx,dy,dz,x1,y1,z1,x2,y2,z2);
 std::cout<<'['<<result<<','<<x1<<','<<y1<<','<<z1<<','<<x2<<','<<y2<<','<<z2<<']';
 }std::cout<<']';}
`;
const cases = [];
/** Appends a native initialized raw-parameter invocation. @param bounds - Document getters. @param expand - Expansion policy. @param mode - Native update mode. @param where - Affected area. @param delta - Displacements. @param what - Receiving coordinates. @returns Nothing. */
function add(bounds, expand, mode, where, delta, what) {
  cases.push({ bounds, expand, args: [mode, ...where, ...delta, ...what] });
}
const bounds = [7, 9, 10];
for (const axis of [0, 1, 2])
  for (const mode of [0, 1, 2, 3])
    for (const expand of [false, true])
      for (const deltaValue of [-5, -3, -1, 0, 1, 3, 5])
        for (const start of [0, 1, 3, 7]) {
          const max = bounds[axis] - (axis === 2 ? 1 : 0);
          for (const first of [-1, 0, 2, 4, max, max + 1])
            for (const last of [-1, 0, 2, 4, max, max + 1]) {
              const where = [0, 0, 0, 7, 9, 9],
                what = [0, 0, 0, 0, 0, 0],
                delta = [0, 0, 0];
              where[axis] = start;
              where[axis + 3] = start + 2;
              what[axis] = first;
              what[axis + 3] = last;
              delta[axis] = deltaValue;
              add(bounds, expand, mode, where, delta, what);
            }
        }
let seed = 0x346ac117;
/** Samples a reproducible independent numerical boundary profile. @param values - Domain. @returns Selected value. */
function pick(values) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return values[seed % values.length];
}
for (let i = 0; i < 8192; i++) {
  const points = [-1, 0, 1, 2, 3, 4, 7, 9, 10],
    delta = [pick([-3, 0, 3]), pick([-3, 0, 3]), pick([-3, 0, 3])];
  const what = Array.from(
    { length: 6 },
    /** Samples an endpoint independently. @returns Raw coordinate. */ () => pick(points),
  );
  const where = Array.from(
    { length: 6 },
    /** Samples an area independently. @returns Raw coordinate. */ () => pick(points),
  );
  add(bounds, i % 2 === 0, i % 4, where, delta, what);
}
for (const mode of [0, 1, 2, 3])
  for (const expand of [false, true])
    for (const delta of [
      [1, 0, 0],
      [-1, 0, 0],
      [0, 1, 0],
      [0, -1, 0],
      [0, 0, 1],
      [0, 0, -1],
      [1, 1, 1],
      [-1, -1, -1],
    ])
      for (const what of [
        [0, 0, 0, 16383, 1048575, 9],
        [1, 1, 1, 16383, 1048575, 9],
        [32767, 1048575, 9, 32767, 1048575, 9],
        [-32768, -1, -1, -32768, -1, -1],
        [16382, 1048574, 8, 16383, 1048575, 9],
      ])
        add([16383, 1048575, 10], expand, mode, [0, 0, 0, 32767, 1048576, 20], delta, what);
const input = [String(cases.length)];
for (const c of cases) input.push([...c.bounds, Number(c.expand), ...c.args].join(" "));
mkdirSync(target, { recursive: true });
const cpp = path.join(target, "refupdate-probe.cxx"),
  binary = path.join(target, "refupdate-probe");
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
    global: digest(global),
    types: digest(types),
  },
  extractedHashes: Object.fromEntries(
    Object.entries(originals).map(
      /** Hashes original intervals. @param entry - Named interval. @returns Hash pair. */ ([
        name,
        text,
      ]) => [name, digest(text)],
    ),
  ),
  cases: cases.map(
    /** Attaches original native results. @param state - Initialized input. @param index - Native order. @returns Fixture state. */ (
      state,
      index,
    ) => ({ ...state, output: outputs[index] }),
  ),
};
const mode = process.argv[2];
if (mode === "--write") writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (mode === "--check") {
  if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
    throw new Error("Ordinary reference-update fixture differs.");
} else throw new Error("Usage: --write|--check");
console.log(
  `Pinned ordinary ScRefUpdate Update: ${cases.length} cases; unchanged original helpers/body; ASan/UBSan clean; ${mode}.`,
);
