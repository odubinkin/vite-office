/** @fileoverview Compares original ICU data-directory and path-iterator execution, including actual module statics. Native source methods are included unchanged; private visibility is opened only for initialized field observation. Browser absent environment/build-directory inputs are reproduced by clearing the two variables in the child and compiling original source without installation-directory defines. No mapper or source function is replaced. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { observeDataPaths } from "./icu-data-path-observe.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/data-path-witness`;
const cpp = String.raw`
#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <memory>
#include <cstring>
#include <atomic>
#include <condition_variable>
#include <mutex>
#include <type_traits>
#include "unicode/utypes.h"
#include "unicode/uclean.h"
#include "unicode/unistr.h"
#include "unicode/uobject.h"
#include "putilimp.h"
#define private public
#include "umutex.h"
#include "cmemory.h"
#include "charstr.h"
#include "${source}/common/udata.cpp"
#undef private
#include "${source}/common/putil.cpp"
using namespace std;using namespace icu;
void span(const char*p){if(!p){cout<<" -1";return;}int n=strlen(p);cout<<' '<<n;for(int i=0;i<=n;++i)cout<<' '<<unsigned(uint8_t(p[i]));}
void chars(const CharString*p){if(!p){cout<<" -1";return;}auto&b=p->buffer;cout<<' '<<p->length()<<' '<<b.getCapacity()<<' '<<int(b.needToRelease)<<' '<<int(b.ptr==b.stackArray);for(int i=0;i<=p->length();++i)cout<<' '<<unsigned(uint8_t(p->data()[i]));}
vector<char> input(){int n,x;cin>>n;if(n<0)return {};vector<char>p(n+8,0);for(int i=0;i<n;++i){cin>>x;p[i]=x;}return p;}
const char*ptr(vector<char>&p){return p.empty()?nullptr:p.data();}
int main(){cout<<"P "<<U_FILE_SEP_CHAR<<' '<<U_PATH_SEP_CHAR<<' '<<UCLN_COMMON_PUTIL<<'\n';unique_ptr<UDataPathIterator>iter;vector<char>ip,pkg,item,suffix;string op;while(cin>>op){if(op=="R"){iter.reset();putil_cleanup();continue;}int error;cin>>error;auto p=input();auto q=input();auto r=input();auto s=input();int check;cin>>check;UErrorCode ec=UErrorCode(error);cout<<"V";
if(op=="D")u_setDataDirectory(ptr(p));if(op=="G")span(u_getDataDirectory());if(op=="T")u_setTimeZoneFilesDirectory(ptr(p),&ec);if(op=="Z")span(u_getTimeZoneFilesDirectory(&ec));if(op=="C")cout<<' '<<int(putil_cleanup());if(op=="P")cout<<' '<<int(uprv_pathIsAbsolute(ptr(p)));
if(op=="I"){ip=std::move(p);pkg=std::move(q);item=std::move(r);suffix=std::move(s);iter=make_unique<UDataPathIterator>(ptr(ip),ptr(pkg),ptr(item),ptr(suffix),bool(check),&ec);}if(op=="N")span(iter->next(&ec));
cout<<' '<<int(ec)<<' '<<gDataDirInitOnce.fState.load()<<' '<<int(gDataDirInitOnce.fErrCode);span(gDataDirectory);cout<<' '<<gTimeZoneFilesInitOnce.fState.load()<<' '<<int(gTimeZoneFilesInitOnce.fErrCode);chars(gTimeZoneFilesDirectory);cout<<' '<<int(bool(iter));if(iter){auto&t=*iter;span(t.path);span(t.nextPath);span(t.basename);cout<<' '<<t.basenameLen<<' '<<t.suffix.length();span(t.suffix.data());cout<<' '<<int(t.checkLastFour);chars(&t.itemPath);chars(&t.pathBuffer);chars(&t.packageStub);cout<<' '<<int(t.nextPath==t.itemPath.data())<<' '<<(t.nextPath&&uintptr_t(t.nextPath)>=uintptr_t(t.path)&&uintptr_t(t.nextPath)<=uintptr_t(t.path)+strlen(t.path)?t.nextPath-t.path:-1);}cout<<'\n';}putil_cleanup();}
`;
writeFileSync(`${prefix}.cpp`, cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    "-DU_COMMON_IMPLEMENTATION",
    `-I${source}/common`,
    `${prefix}.cpp`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
/** Encodes test narrow characters without a host path parser. @param value - Text/null. @returns Actual bytes/null. */
function bytes(value) {
  return value === null ? null : Array.from(Buffer.from(value, "latin1"));
}
/** Builds one native operation. @param op - Opcode. @param error - Status. @param path - Narrow path/null. @returns Operation. */
function command(op, error = 0, path = null) {
  return { op, error, path: bytes(path) };
}
const sequences = [];
for (const path of [null, "", "a", "/", "/a", "a/b", "a\\b", ":a::b:", "a\0/b", "a".repeat(80)])
  for (const error of [0, -124, 7])
    sequences.push([
      command("P", error, path),
      command("D", 0, path),
      command("G"),
      command("G"),
      command("T", error, path),
      command("Z", error),
      command("Z"),
      command("C"),
      command("G"),
      command("Z"),
    ]);
for (const path of [
  null,
  "",
  ":",
  "a:b",
  ":a::b:",
  "/a/OpenOffice:/a/OpenOffice/",
  "/a/other.dat:/a/OpenOffice.dat:/b/",
  "/a/pkg.dat:/a/other.dat",
  "/x/y/",
  "x\\y:z",
  "a\0:ignored",
  "x".repeat(80),
])
  for (const item of ["OpenOffice", "/explicit/OpenOffice", "dir/OpenOffice", "dir/", "pkg"])
    for (const suffix of [null, "", ".dat", ".res", "name.brk", "tree/name.res"])
      for (const check of [false, true]) {
        const count = path === null ? 4 : Math.max(5, path.split(":").length + 3);
        const ops = [
          command("D", 0, "/default:/fallback"),
          {
            op: "I",
            error: 0,
            path: bytes(path),
            pkg: bytes("OpenOffice"),
            item: bytes(item),
            suffix: bytes(suffix),
            check,
          },
        ];
        for (let i = 0; i < count; ++i) ops.push(command("N"));
        sequences.push(ops);
      }
for (const error of [-124, 7])
  sequences.push([
    {
      op: "I",
      error,
      path: bytes("a:b"),
      pkg: bytes("OpenOffice"),
      item: bytes("dir/item"),
      suffix: bytes(".dat"),
      check: true,
    },
    command("N", error),
  ]);
const rows = observeDataPaths(sequences);
/** Serializes one nullable readable span. @param p - Bytes/null/undefined. @returns Protocol fields. */
function encode(p) {
  return p === null || p === undefined ? "-1" : `${p.length} ${p.join(" ")}`;
}
let protocol = "";
for (const ops of sequences) {
  protocol += "R\n";
  for (const op of ops)
    protocol += `${op.op} ${op.error} ${encode(op.path)} ${encode(op.pkg)} ${encode(op.item)} ${encode(op.suffix)} ${Number(op.check ?? false)}\n`;
}
const env = { ...process.env };
delete env.ICU_DATA;
delete env.ICU_TIMEZONE_FILES_DIR;
const lines = execFileSync(prefix, {
  input: protocol,
  encoding: "utf8",
  env,
  maxBuffer: 64 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (lines.shift() !== "P / : 24") throw Error("Native separator/cleanup enum profile changed");
/** Hashes all fields in order. @param row - Full snapshot. @returns SHA256. */
function digest(row) {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
let index = 0;
const hashes = [];
for (let i = 0; i < rows.length; ++i) {
  const group = [];
  for (let j = 0; j < rows[i].length; ++j) {
    const expected = lines[index++].slice(2).split(" ").map(Number),
      actual = rows[i][j];
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      let field = 0;
      while (expected[field] === actual[field] && field < expected.length) ++field;
      throw Error(
        `Mismatch sequence${i} op${j} field${field}: ${expected[field]}/${actual[field]} lengths${expected.length}/${actual.length}; input${JSON.stringify(sequences[i][j])}`,
      );
    }
    group.push(digest(expected));
  }
  hashes.push(group);
}
if (index !== lines.length) throw Error("Native row count differs");
/** Hashes actual source and binary artifacts. @param p - Path. @returns SHA256. */
function sha(p) {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}
writeFileSync(
  "apps/office/src/external/icu/source/common/udata.paths.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      scope:
        "Original unchanged udata.cpp/putil.cpp directory and path iterator methods with actual statics, original CharString/MaybeStackArray. POSIX separators, absent OS environment and undefined build installation directory reproduce browser process inputs; original file-access policy is unchanged. No physical allocator/free/thread ABI, undefined/uninitialized inputs, invalidated borrows, actual mapper, udata_open integration or production service completion is certified.",
      sourceHashes: {
        "udata.cpp": sha(`${source}/common/udata.cpp`),
        "putil.cpp": sha(`${source}/common/putil.cpp`),
      },
      artifacts: {
        cpp: sha(`${prefix}.cpp`),
        executable: sha(prefix),
        icuuc: sha(`${build}/lib/libicuuc.a`),
      },
      sequences,
      hashes,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Matched ${rows.length} original directory/path sequences / ${index} complete initialized snapshots`,
);
