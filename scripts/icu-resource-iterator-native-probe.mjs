/** @fileoverview Compares actual ICU78.3 iterator and bundle-copy behavior on every pinned direct resource, including scalar cursor copies, sticky failures and self fillIn. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import * as R from "../apps/office/src/external/icu/source/common/uresbund.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/resource-iterator-witness.cc`,
  String.raw`
#include "unicode/ures.h"
#include "unicode/putil.h"
#include "uresimp.h"
#include <iostream>
void snap(UResourceBundle*r){const char*k=ures_getKey(r);std::cout<<ures_getType(r)<<' '<<ures_getSize(r)<<' '<<int(ures_hasNext(r))<<' ';if(k){int n=0;while(k[n])n++;std::cout<<n<<' ';for(int i=0;i<n;i++)std::cout<<int(static_cast<unsigned char>(k[i]))<<' ';}else std::cout<<-1<<' ';UErrorCode s=U_ZERO_ERROR;auto*copy=ures_copyResb(nullptr,r,&s);std::cout<<int(s)<<' '<<int(ures_hasNext(copy))<<' ';ures_close(copy);if(r){s=U_ZERO_ERROR;auto*indexed=ures_getByIndex(r,0,nullptr,&s);std::cout<<int(s)<<' '<<int(ures_hasNext(indexed))<<' ';ures_close(indexed);}else std::cout<<-1<<' '<<-1<<' ';}
void walk(UResourceBundle*r){for(int incoming:{-128,0,1}){ures_resetIterator(r);UResourceBundle*fill=nullptr;for(int i=0;i<ures_getSize(r)+2;i++){UErrorCode s=UErrorCode(incoming);std::cout<<int(ures_hasNext(r))<<' ';fill=ures_getNextResource(r,fill,&s);std::cout<<int(s)<<' ';snap(fill);std::cout<<'\n';}ures_close(fill);}ures_resetIterator(r);UErrorCode s=U_ZERO_ERROR;auto*self=ures_copyResb(nullptr,r,&s);for(int i=0;i<2;i++){s=U_ZERO_ERROR;self=ures_getNextResource(self,self,&s);std::cout<<int(s)<<' ';snap(self);std::cout<<'\n';}ures_close(self);if(ures_getType(r)==URES_TABLE||ures_getType(r)==URES_ARRAY)for(int i=0;i<ures_getSize(r);i++){s=U_ZERO_ERROR;auto*child=ures_getByIndex(r,i,nullptr,&s);walk(child);ures_close(child);}}
int main(int argc,char**argv){if(argc!=2)return 2;u_setDataDirectory(argv[1]);for(auto name:{"zoneinfo64","keyTypeData"}){UErrorCode s=U_ZERO_ERROR;auto*root=ures_openDirect(nullptr,name,&s);if(U_FAILURE(s))return 3;walk(root);ures_close(root);}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/resource-iterator-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/resource-iterator-witness`,
  ],
  { stdio: "inherit" },
);
const rows = [];
let nodes = 0;
/** Encodes borrowed resource key. @param value - Key/null. @returns Native units. */
function key(value) {
  const out = [];
  if (value === null) return [-1];
  for (let i = 0; i < value.length; ++i) out.push(value.charCodeAt(i));
  return [value.length, ...out];
}
/** Observes scalar cursor copies versus freshly initialized child cursors. @param r - Actual handle/null. @returns Snapshot. */
function snap(r) {
  const s = [0],
    copy = R.ures_copyResb(null, r, s),
    row = [
      R.ures_getType(r),
      R.ures_getSize(r),
      Number(R.ures_hasNext(r)),
      ...key(R.ures_getKey(r)),
      s[0],
      Number(R.ures_hasNext(copy)),
    ];
  if (r !== null) {
    s[0] = 0;
    const indexed = R.ures_getByIndex(r, 0, null, s);
    row.push(s[0], Number(R.ures_hasNext(indexed)));
  } else row.push(-1, -1);
  return row;
}
/** Iterates each original resource and replays ownership-sensitive API paths. @param r - Actual pinned handle. @returns Nothing. */
function walk(r) {
  ++nodes;
  for (const incoming of [-128, 0, 1]) {
    R.ures_resetIterator(r);
    let fill = null;
    for (let i = 0; i < R.ures_getSize(r) + 2; ++i) {
      const s = [incoming],
        before = Number(R.ures_hasNext(r));
      fill = R.ures_getNextResource(r, fill, s);
      rows.push([before, s[0], ...snap(fill)].join(" "));
    }
  }
  R.ures_resetIterator(r);
  let self = R.ures_copyResb(null, r, [0]);
  for (let i = 0; i < 2; ++i) {
    const s = [0];
    self = R.ures_getNextResource(self, self, s);
    rows.push([s[0], ...snap(self)].join(" "));
  }
  if (R.ures_getType(r) === 2 || R.ures_getType(r) === 8)
    for (let i = 0; i < R.ures_getSize(r); ++i) walk(R.ures_getByIndex(r, i, null, [0]));
}
for (const name of ["zoneinfo64", "keyTypeData"]) walk(R.ures_openDirect(null, name, [0]));
const actual = execFileSync(`${build}/resource-iterator-witness`, [`${source}/data/in`], {
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== rows.length) throw Error(`Rows ${actual.length}/${rows.length}`);
for (let i = 0; i < actual.length; ++i)
  if (actual[i].trim() !== rows[i]) throw Error(`Row ${i}: native ${actual[i]}, port ${rows[i]}`);
const report = {
  result: "pass",
  nodes,
  cases: rows.length,
  sources: Object.fromEntries(
    ["common/uresbund.cpp", "data/in/icudt78l.dat"].map(
      /** Records original source and data identities. @param path - Source. @returns Hash pair. */ (
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
    "Unchanged ICU78.3 resource APIs over all pinned zoneinfo64/keyTypeData nodes: iterator reset/next/exhaustion, three incoming statuses, reused fillIn, scalar/child cursor state, copy/indexed-copy, null and self fillIn. Native alias engine, paths/refcounts/lifetime/allocator/mutex/ABI and general locale fallback remain uncertified.",
};
writeFileSync(`${build}/resource-iterator-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
