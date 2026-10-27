/** @fileoverview Compares consumed direct resource getters against unchanged ICU78.3 on every node of both pinned snapshots, including sticky statuses and native buffer sharing. Run with tsx after the native build. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import * as R from "../apps/office/src/external/icu/source/common/uresbund.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/resource-witness.cc`,
  String.raw`
#include "unicode/ures.h"
#include "unicode/putil.h"
#include <iostream>
#include <map>
#include <memory>
using Handle=std::unique_ptr<UResourceBundle,decltype(&ures_close)>;
std::map<const void*,int> buffers;
int storage(const void* p){if(!p)return 0;auto found=buffers.find(p);if(found!=buffers.end())return found->second;int id=int(buffers.size())+1;buffers[p]=id;return id;}
void walk(UResourceBundle* r){auto key=ures_getKey(r);std::cout<<ures_getType(r)<<' '<<ures_getSize(r)<<' ';if(key){int n=0;while(key[n])n++;std::cout<<n<<' ';for(int i=0;i<n;i++)std::cout<<int(key[i])<<' ';}else std::cout<<-1<<' ';
 for(int incoming:{-128,0,1}){
  UErrorCode s=UErrorCode(incoming);int32_t len=77;auto integer=ures_getInt(r,&s);std::cout<<integer<<' '<<int(s)<<' ';
  s=UErrorCode(incoming);auto str=ures_getString(r,&len,&s);std::cout<<int(s)<<' '<<len<<' '<<int(str!=nullptr)<<' ';if(str)for(int i=0;i<len;i++)std::cout<<int(str[i])<<' ';
  s=UErrorCode(incoming);len=77;auto vec=ures_getIntVector(r,&len,&s);std::cout<<int(s)<<' '<<len<<' '<<storage(vec)<<' ';if(vec)for(int i=0;i<len;i++)std::cout<<vec[i]<<' ';
  s=UErrorCode(incoming);len=77;auto bytes=ures_getBinary(r,&len,&s);std::cout<<int(s)<<' '<<len<<' '<<storage(bytes)<<' ';if(bytes)for(int i=0;i<len;i++)std::cout<<int(bytes[i])<<' ';
  s=UErrorCode(incoming);len=77;auto byIndex=ures_getStringByIndex(r,0,&len,&s);std::cout<<int(s)<<' '<<len<<' '<<int(byIndex!=nullptr)<<' ';if(byIndex)for(int i=0;i<len;i++)std::cout<<int(byIndex[i])<<' ';
  s=UErrorCode(incoming);len=77;auto missing=ures_getStringByKey(r,"__missing__",&len,&s);std::cout<<int(s)<<' '<<len<<' '<<int(missing!=nullptr)<<' ';
 }
 if(ures_getType(r)==URES_TABLE)for(int i=0;i<ures_getSize(r);i++){UErrorCode s=U_ZERO_ERROR;Handle child(ures_getByIndex(r,i,nullptr,&s),ures_close);for(int incoming:{-128,0,1}){s=UErrorCode(incoming);int32_t len=77;auto str=ures_getStringByKey(r,ures_getKey(child.get()),&len,&s);std::cout<<int(s)<<' '<<len<<' '<<int(str!=nullptr)<<' ';if(str)for(int j=0;j<len;j++)std::cout<<int(str[j])<<' ';}}
 std::cout<<'\n';
 if(ures_getType(r)==URES_TABLE||ures_getType(r)==URES_ARRAY)for(int i=0;i<ures_getSize(r);i++){UErrorCode s=U_ZERO_ERROR;Handle child(ures_getByIndex(r,i,nullptr,&s),ures_close);if(U_FAILURE(s))std::exit(3);if(ures_getType(r)==URES_TABLE){Handle keyed(ures_getByKey(r,ures_getKey(child.get()),nullptr,&s),ures_close);if(U_FAILURE(s)||ures_getType(keyed.get())!=ures_getType(child.get()))std::exit(4);}walk(child.get());}
}
int main(int argc,char**argv){if(argc!=2)return 1;u_setDataDirectory(argv[1]);for(auto name:{"zoneinfo64","keyTypeData"}){UErrorCode s=U_ZERO_ERROR;Handle root(ures_openDirect(nullptr,name,&s),ures_close);if(U_FAILURE(s))return 2;walk(root.get());}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/resource-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/resource-witness`,
  ],
  { stdio: "inherit" },
);
const rows = [],
  buffers = new Map();
/** Stable first-observation IDs preserve native pointer sharing without exposing addresses. @param value - Borrowed buffer. @returns ID or null sentinel. */
function storage(value) {
  if (value === null) return 0;
  if (!buffers.has(value)) buffers.set(value, buffers.size + 1);
  return buffers.get(value);
}
/** Encodes complete UTF16 output. @param value - Borrowed string. @returns Code units. */
function units(value) {
  const out = [];
  if (value !== null) for (let i = 0; i < value.length; ++i) out.push(value.charCodeAt(i));
  return out;
}
/** Observes the production reader through the same native operations. @param bundle - Actual handle. @returns Nothing. */
function walk(bundle) {
  const key = R.ures_getKey(bundle),
    row = [
      R.ures_getType(bundle),
      R.ures_getSize(bundle),
      key === null ? -1 : key.length,
      ...units(key),
    ];
  for (const incoming of [-128, 0, 1]) {
    const s = [incoming],
      len = [77],
      integer = R.ures_getInt(bundle, s);
    row.push(integer, s[0]);
    s[0] = incoming;
    const str = R.ures_getString(bundle, len, s);
    row.push(s[0], len[0], Number(str !== null), ...units(str));
    s[0] = incoming;
    len[0] = 77;
    const vec = R.ures_getIntVector(bundle, len, s);
    row.push(s[0], len[0], storage(vec), ...(vec ?? []));
    s[0] = incoming;
    len[0] = 77;
    const bytes = R.ures_getBinary(bundle, len, s);
    row.push(s[0], len[0], storage(bytes), ...(bytes ?? []));
    s[0] = incoming;
    len[0] = 77;
    const indexed = R.ures_getStringByIndex(bundle, 0, len, s);
    row.push(s[0], len[0], Number(indexed !== null), ...units(indexed));
    s[0] = incoming;
    len[0] = 77;
    const missing = R.ures_getStringByKey(bundle, "__missing__", len, s);
    row.push(s[0], len[0], Number(missing !== null));
  }
  if (R.ures_getType(bundle) === 2)
    for (let i = 0; i < R.ures_getSize(bundle); ++i) {
      const child = R.ures_getByIndex(bundle, i, null, [0]);
      for (const incoming of [-128, 0, 1]) {
        const s = [incoming],
          len = [77],
          str = R.ures_getStringByKey(bundle, R.ures_getKey(child), len, s);
        row.push(s[0], len[0], Number(str !== null), ...units(str));
      }
    }
  rows.push(row);
  if ([2, 8].includes(R.ures_getType(bundle)))
    for (let i = 0; i < R.ures_getSize(bundle); ++i) {
      const s = [0],
        child = R.ures_getByIndex(bundle, i, null, s);
      if (s[0] > 0) throw Error("indexed lookup failed");
      if (R.ures_getType(bundle) === 2) {
        const keyed = R.ures_getByKey(bundle, R.ures_getKey(child), null, s);
        if (s[0] > 0 || keyed.resource !== child.resource) throw Error("keyed lookup differs");
      }
      walk(child);
    }
}
for (const name of ["zoneinfo64", "keyTypeData"]) walk(R.ures_openDirect(null, name, [0]));
const actual = execFileSync(`${build}/resource-witness`, [`${source}/data/in`], {
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== rows.length)
  throw Error(`Resource row count differs ${actual.length}/${rows.length}`);
for (let i = 0; i < rows.length; ++i) {
  const native = actual[i].trim().split(" ").map(Number),
    expected = rows[i];
  if (
    native.length !== expected.length ||
    native.some(
      /** Compares every scalar. @param value - Native value. @param j - Column. @returns Mismatch. */ (
        value,
        j,
      ) => value !== expected[j],
    )
  )
    throw Error(
      `Resource row ${i} differs: native ${native.slice(0, 80)}; port ${expected.slice(0, 80)}`,
    );
}
const report = {
  result: "pass",
  nodes: rows.length,
  statusVariants: [-128, 0, 1],
  bufferIdentities: buffers.size,
  dataSha256: createHash("sha256")
    .update(readFileSync(`${source}/data/in/icudt78l.dat`))
    .digest("hex"),
  sourceSha256: Object.fromEntries(
    ["common/uresbund.cpp", "common/uresdata.cpp", "common/uresimp.h"].map(
      /** Records the unchanged native implementation identity. @param path - Source path. @returns Hash pair. */ (
        path,
      ) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Complete direct resource trees and consumed getters, error lengths, sticky status, resolved alias getter paths and shared binary/vector storage. Locale fallback, dynamic alias resolution beyond the pinned snapshots, arbitrary packages, allocation/lifetime/ABI and timezone factory integration remain outside this witness.",
};
writeFileSync(`${build}/resource-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
