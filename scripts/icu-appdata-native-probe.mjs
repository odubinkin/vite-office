/** @fileoverview Genuine original ICU78.3 app-data cache/UInitOnce/cleanup witness. Includes unchanged udata.cpp only to observe its actual static records; no native functions, allocators, mutexes or providers are replaced. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { observeAppData } from "./icu-appdata-observe.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/appdata-witness`,
  dir = `${build}/ucmndata-data`;
const previous = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/ucmndata.native-observations.json",
    "utf8",
  ),
);
const names = [
  "count_word",
  "dict_word_hu",
  "dict_word_prepostdash",
  "dict_word",
  "edit_word_hu",
  "edit_word",
  "line",
  "line_cj",
];
const cpp = String.raw`
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstring>
#include <atomic>
#include <condition_variable>
#include <mutex>
#include <type_traits>
#include "unicode/utypes.h"
#include "unicode/uclean.h"
#include "uassert.h"
#include "unicode/uobject.h"
#include "putilimp.h"
#define private public
#include "umutex.h"
#undef private
#include "ucln_cmn.h"
#include "ucln.h"
#include "${source}/common/udata.cpp"
#include "${source}/common/unifiedcache.cpp"
using namespace std;using namespace icu;
extern "C" const char OpenOffice_dat[];
vector<const uint8_t*>packages,canonical;vector<int>logs;int calls;UInitOnce*active;int written,inside,insideError;
void initError(UErrorCode&ec){++calls;inside=active->fState.load();insideError=active->fErrCode;ec=UErrorCode(written);}void initPlain(){++calls;inside=active->fState.load();insideError=active->fErrCode;}
UBool cb0(){logs.push_back(0);return true;}UBool cb1(){logs.push_back(1);return false;}UBool cb2(){logs.push_back(2);return true;}UBool cb3(){logs.push_back(3);return false;}UBool cb4(){logs.push_back(4);return true;}UBool cb5(){logs.push_back(5);return false;}UBool cb6(){logs.push_back(6);return true;}UBool cb7(){logs.push_back(7);return false;}UBool cb8(){logs.push_back(8);return true;}UBool cb9(){logs.push_back(9);return false;}cleanupFunc*callbacks[]={cb0,cb1,cb2,cb3,cb4,cb5,cb6,cb7,cb8,cb9};
void key(const char*s){int n=strlen(s);cout<<' '<<n;for(int i=0;i<n;++i)cout<<' '<<unsigned(uint8_t(s[i]));}
void memory(const UDataMemory*d){if(!d){cout<<" -1";return;}int id=-1;if(d->pHeader)for(size_t i=0;i<canonical.size();++i)if(reinterpret_cast<const uint8_t*>(d->pHeader)==canonical[i])id=i;int toc=-1;if(d->toc&&d->pHeader)toc=reinterpret_cast<const uint8_t*>(d->toc)-packages[id];cout<<' '<<id<<' '<<int(d->heapAllocated)<<' '<<d->length<<' '<<int(d->map!=nullptr)<<' '<<int(d->mapAddr!=nullptr)<<' '<<int(d->vFuncs!=nullptr)<<' '<<toc<<' '<<udata_getLength(d);if(d->pHeader){cout<<' '<<udata_getHeaderSize(d->pHeader);auto h=reinterpret_cast<const uint8_t*>(d->pHeader);for(int i=0;i<24;++i)cout<<' '<<unsigned(h[i]);}}
void cache(){auto t=gCommonDataCache;cout<<' '<<int(gCommonDataCacheInitOnce.isReset())<<' '<<gCommonDataCacheInitOnce.fState.load()<<' '<<int(gCommonDataCacheInitOnce.fErrCode)<<' '<<gHaveTriedToLoadCommonData.load()<<' '<<int(t==nullptr)<<' '<<gCacheInitOnce.fState.load()<<' '<<int(gCacheInitOnce.fErrCode)<<' '<<int(gCache==nullptr)<<' '<<(gCache?gCache->keyCount():-1);if(!t)return;cout<<' '<<int(t->primeIndex)<<' '<<t->length<<' '<<t->count<<' '<<t->highWaterMark<<' '<<int(t->keyHasher==uhash_hashChars)<<' '<<int(t->keyComparator==uhash_compareChars)<<' '<<int(t->keyDeleter!=nullptr)<<' '<<int(t->valueDeleter!=nullptr);for(int i=0;i<t->length;++i){auto&e=t->elements[i];cout<<' '<<e.hashcode;if(e.hashcode>=0){key(static_cast<const char*>(e.key.pointer));auto el=static_cast<const DataCacheElement*>(e.value.pointer);key(el->name);memory(el->item);}}}
int main(int argc,char**argv){ifstream f(argv[1],ios::binary);vector<uint8_t>file((istreambuf_iterator<char>(f)),{});vector<vector<uint64_t>>storage(5,vector<uint64_t>(131072,0));auto pt=reinterpret_cast<const uint8_t*>(OpenOffice_dat);uint32_t count=*reinterpret_cast<const uint32_t*>(pt+32);int size=40+16*count;packages.push_back(pt);for(int i=1;i<6;++i){auto b=reinterpret_cast<uint8_t*>(storage[i-1].data());if(i==2||i==3)memcpy(b,file.data(),file.size());else{memcpy(b+(i==4?8:0),pt,size);if(i==5)b[2]=0;}packages.push_back(b);}for(auto p:packages)canonical.push_back(reinterpret_cast<const uint8_t*>(UDataMemory_normalizeDataPointer(p)));cout<<"P "<<UCLN_COMMON_COUNT<<' '<<UCLN_COMMON<<' '<<U_FILE_SEP_CHAR<<'\n';UInitOnce once{};active=&once;
 string op;while(cin>>op){int a[4],n,b;for(auto&x:a)cin>>x;cin>>n;vector<char>p(n+1,0);for(int i=0;i<n;++i){cin>>b;p[i]=b;}cin>>n;vector<char>q(n+1,0);for(int i=0;i<n;++i){cin>>b;q[i]=b;}if(op=="Z"){ucln_lib_cleanup();once.~UInitOnce();new(&once)UInitOnce{};active=&once;calls=0;logs.clear();continue;}UErrorCode ec=UErrorCode(a[1]);cout<<"R";
 if(op=="S"){udata_setAppData(a[2]&2?nullptr:p.data(),a[0]<0?nullptr:packages[a[0]],a[2]&1?nullptr:&ec);cout<<' '<<int(ec);}
 if(op=="K"){UDataMemory item;UDataMemory_init(&item);if(a[0]>=0){UDataMemory_setData(&item,packages[a[0]]);if(!a[3]){UErrorCode good=U_ZERO_ERROR;udata_checkCommonData(&item,&good);}}item.length=a[2];memory(udata_cacheDataItem(p.data(),&item,&ec));cout<<' '<<int(ec);}
 if(op=="F"){memory(udata_findCachedData(p.data(),ec));cout<<' '<<int(ec);}
 if(op=="C")cout<<' '<<int(ucln_lib_cleanup());if(op=="D")cout<<' '<<int(udata_cleanup());
 if(op=="B"){auto cb=a[2]<0?nullptr:callbacks[a[2]];if(a[0]==0)ucln_registerCleanup(ECleanupLibraryType(a[1]),cb);else ucln_common_registerCleanup(ECleanupCommonType(a[1]),cb);}if(op=="L")ucln_cleanupOne(ECleanupLibraryType(a[0]));
 if(op=="H"){UHashTok x,y;x.pointer=a[0]&1?nullptr:p.data();y.pointer=a[0]&4?x.pointer:a[0]&2?nullptr:q.data();cout<<' '<<uhash_hashChars(x)<<' '<<uhash_hashChars(y)<<' '<<int(uhash_compareChars(x,y));}
 if(op=="U"){auto before=gCache;auto value=UnifiedCache::getInstance(ec);cout<<' '<<int(ec)<<' '<<int(value==nullptr)<<' '<<(before?int(value==before):-1);}
 if(op=="O"){int before=once.isReset(),priorState=once.fState.load(),priorError=once.fErrCode,result=-1;inside=-1;insideError=-1;written=a[2];if(a[0]==2)once.reset();else if(a[0]==3)result=umtx_initImplPreInit(once);else if(a[0]==4)umtx_initImplPostInit(once);else if(a[0]==1)umtx_initOnce(once,initPlain);else umtx_initOnce(once,initError,ec);cout<<' '<<before<<' '<<priorState<<' '<<priorError<<' '<<calls<<' '<<inside<<' '<<insideError<<' '<<result<<' '<<int(ec)<<' '<<int(once.isReset())<<' '<<once.fState.load()<<' '<<int(once.fErrCode);}
 cache();cout<<' '<<logs.size();for(int id:logs)cout<<' '<<id;cout<<'\n';}ucln_lib_cleanup();}
`;
writeFileSync(`${prefix}.cpp`, cpp);
const objects = [
  ...names.map(
    /** Resolves actual generated native C objects. @param n - Rule name. @returns Object path. */ (
      n,
    ) => `${dir}/${n}_brk.o`,
  ),
  `${dir}/OpenOffice_tmp.o`,
];
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${prefix}.cpp`,
    ...objects,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
/** Binds original narrow test paths to bytes. @param s - Narrow text. @returns Bytes. */
function bytes(s) {
  return Array.from(Buffer.from(s, "latin1"));
}
const sequences = [];
for (const format of [0, 2, 4])
  for (const path of [
    "OpenOffice",
    "folder/OpenOffice",
    "/one/two/OpenOffice",
    "OpenOffice/",
    "",
    "folder//OpenOffice",
    "OpenOffice\0/ignored",
  ])
    sequences.push([
      { op: "S", args: [format, 0, 0, 0], path: bytes(path) },
      { op: "S", args: [format === 0 ? 1 : 3, 0, 0, 0], path: bytes(path) },
      { op: "F", args: [0, 0, 0, 0], path: bytes("OpenOffice") },
      { op: "S", args: [1, 0, 0, 0], path: bytes("OpenOffice") },
      { op: "F", args: [0, 0, 0, 0], path: bytes(path) },
      { op: "D", args: [0, 0, 0, 0] },
      { op: "F", args: [0, 0, 0, 0], path: bytes(path) },
      { op: "C", args: [0, 0, 0, 0] },
    ]);
for (const initial of [0, -124, 7])
  for (const id of [-1, 0, 2, 5])
    for (const flags of [0, 1, 2, 3]) {
      if (id >= 0 && flags === 2 && initial <= 0) continue;
      sequences.push([
        { op: "S", args: [id, initial, flags, 0], path: bytes("OpenOffice") },
        { op: "F", args: [0, initial, 0, 0], path: bytes("OpenOffice") },
        { op: "C", args: [0, 0, 0, 0] },
      ]);
    }
for (const initial of [0, -124, 7])
  for (const id of [-1, 0, 2, 5])
    for (const skip of [0, 1])
      sequences.push([
        { op: "K", args: [id, initial, 12345, skip], path: bytes("a/Private") },
        { op: "K", args: [1, initial, -1, 0], path: bytes("Private") },
        { op: "F", args: [0, 0, 0, 0], path: bytes("x/Private") },
        { op: "C", args: [0, 0, 0, 0] },
      ]);
const growth = [];
for (let i = 0; i < 140; ++i)
  growth.push({ op: "S", args: [i % 4, 0, 0, 0], path: bytes(`Root/package${i}`) });
growth.push({ op: "C", args: [0, 0, 0, 0] });
sequences.push(growth);
sequences.push([
  { op: "B", args: [0, 1, 3, 0] },
  { op: "B", args: [0, 7, 1, 0] },
  { op: "B", args: [1, 0, 4, 0] },
  { op: "B", args: [1, 24, 5, 0] },
  { op: "S", args: [0, 0, 0, 0], path: bytes("OpenOffice") },
  { op: "L", args: [1, 0, 0, 0] },
  { op: "C", args: [0, 0, 0, 0] },
  { op: "C", args: [0, 0, 0, 0] },
]);
const once = [];
for (const written of [0, -124, 7]) {
  once.push(
    { op: "O", args: [2, 0, 0, 0] },
    { op: "O", args: [0, 0, written, 0] },
    { op: "O", args: [0, 0, 0, 0] },
    { op: "O", args: [0, -124, 0, 0] },
    { op: "O", args: [2, 0, 0, 0] },
    { op: "O", args: [1, 0, 0, 0] },
    { op: "O", args: [0, 0, 0, 0] },
  );
}
once.push(
  { op: "O", args: [2, 0, 0, 0] },
  { op: "O", args: [3, 0, 0, 0] },
  { op: "O", args: [4, 0, 0, 0] },
  { op: "O", args: [3, 0, 0, 0] },
);
sequences.push(once);
sequences.push([
  { op: "U", args: [0, 7, 0, 0] },
  { op: "U", args: [0, -124, 0, 0] },
  { op: "S", args: [0, 0, 0, 0], path: bytes("OpenOffice") },
  { op: "U", args: [0, 0, 0, 0] },
  { op: "U", args: [0, 7, 0, 0] },
  { op: "C", args: [0, 0, 0, 0] },
  { op: "U", args: [0, 0, 0, 0] },
  { op: "C", args: [0, 0, 0, 0] },
]);
const hashes = [];
for (let len of [0, 1, 2, 31, 32, 33, 63, 64, 65, 100, 1024])
  for (let value of [0, 1, 65, 127, 128, 255])
    for (let flags of [0, 1, 2, 3, 4])
      hashes.push({
        op: "H",
        args: [flags, 0, 0, 0],
        path: Array(len).fill(value),
        other: [...Array(len).fill(value), 1],
      });
sequences.push(hashes);
/** Fingerprints every compared field. @param row - Full snapshot. @returns SHA256. */
function digest(row) {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
/** Serializes actual native method inputs. @param o - Input. @returns Native command. */
function command(o) {
  return `${o.op} ${o.args.join(" ")} ${(o.path ?? []).length} ${(o.path ?? []).join(" ")} ${(o.other ?? []).length} ${(o.other ?? []).join(" ")}`;
}
const input =
  sequences
    .map(
      /** Delimits fresh standalone once records while retaining the original process cache status across cleanup. @param ops - Sequence. @returns Native commands. */ (
        ops,
      ) => ["Z 0 0 0 0 0 0", ...ops.map(command)].join("\n"),
    )
    .join("\n") + "\n";
const nativeLines = execFileSync(prefix, [`${dir}/OpenOffice.dat`], {
  input,
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (nativeLines.shift() !== "P 29 8 /") throw Error("Native cleanup/profile changed");
let cursor = 0;
const rowHashes = sequences.map(
  /** Compares original sequences in process order. @param ops - Inputs. @param i - Sequence index. @returns Native fingerprints. */ (
    ops,
    i,
  ) => {
    const actual = observeAppData(ops, previous.pkg);
    return actual.map(
      /** Compares all initialized fields. @param row - Actual local state. @param j - Operation. @returns Native fingerprint. */ (
        row,
        j,
      ) => {
        const expected = nativeLines[cursor++].slice(2).split(" ").map(Number);
        if (JSON.stringify(expected) !== JSON.stringify(row)) {
          const at = expected.findIndex(
            /** Locates the first differing field. @param v - Native field. @param k - Index. @returns Different. */ (
              v,
              k,
            ) => v !== row[k],
          );
          throw Error(
            `Mismatch sequence ${i}, op ${j} ${JSON.stringify(ops[j])} field ${at}: ${expected[at]} vs ${row[at]} (${expected.length}/${row.length})`,
          );
        }
        return digest(expected);
      },
    );
  },
);
if (cursor !== nativeLines.length) throw Error("Native row count");
/** Hashes original inputs and executable artifacts. @param p - Actual file. @returns SHA256. */
function sha(p) {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}
writeFileSync(
  "apps/office/src/external/icu/source/common/udata.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      profile: [29, 8, "/"],
      scope:
        "Unchanged original application-data registration/cache internals, represented full live hash slots/keys/descriptor fields, original public/status/null/duplicate/cleanup behavior and consumed noncontended UInitOnce/string hash. Original udata.cpp and unifiedcache.cpp inclusion exposes actual static records; private UInitOnce visibility is opened only for initialized-field observation. No source/method/allocator/mutex is replaced. ESM exports expose actual source records read-only; native locks and wait/wakeup/thread/allocation/free ABI and automatic/full heap/tracing cleanup remain unverified. Native original cleanup executes actual registered data callbacks and original mutex cleanup; managed registry has source callback order, without no-op mutex functions or a replacement public u_cleanup. udata_open, production package/iterator/engine/service installation remain pending.",
      sourceHashes: Object.fromEntries(
        [
          "udata.cpp",
          "unifiedcache.cpp",
          "uhash.cpp",
          "uhash.h",
          "umutex.h",
          "umutex.cpp",
          "ucln.h",
          "ucln_cmn.h",
          "ucln_cmn.cpp",
          "ustring.cpp",
          "ustr_imp.h",
        ].map(
          /** Hashes pinned original source. @param p - Source path. @returns Digest pair. */ (
            p,
          ) => [p, sha(`${source}/common/${p}`)],
        ),
      ),
      artifacts: Object.fromEntries(
        [
          `${prefix}.cpp`,
          prefix,
          `${build}/lib/libicuuc.a`,
          `${build}/stubdata/libicudata.a`,
          ...objects,
        ].map(
          /** Hashes unchanged libraries and actual witness objects. @param p - File. @returns Digest pair. */ (
            p,
          ) => [p.slice(build.length + 1), sha(p)],
        ),
      ),
      commonFixtureHash: sha(
        "apps/office/src/external/icu/source/common/ucmndata.native-observations.json",
      ),
      sequences,
      rowHashes,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Matched ${sequences.length} original sequences / ${sequences.reduce(/** Counts original operations. @param n - Prior count. @param s - Sequence. @returns Total. */ (n, s) => n + s.length, 0)} complete cache, once, cleanup and hash snapshots`,
);
