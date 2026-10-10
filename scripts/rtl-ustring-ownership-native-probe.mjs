/** @fileoverview Captures unchanged pinned RTL Unicode ownership and intern-pool bodies with full initialized caller observations. */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const upstream = "vendor/libreoffice-reference";
const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const target = "output/playwright/rtl-ustring-ownership-native";
const fixture = "apps/office/src/sal/rtl/native-ustring-ownership-cases.json";
/** Hashes original bytes. @param value - Exact source. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
/** Extracts a complete original interval. @param source - Pinned file. @param first - Inclusive marker. @param last - Following marker. @returns Unchanged interval. */
function scope(source, first, last) {
  const start = source.indexOf(first),
    end = source.indexOf(last, start + first.length);
  if (start < 0 || end < start) throw new Error(`Missing original interval: ${first}`);
  return source.slice(start, end);
}
const files = [
  "sal/rtl/strtmpl.hxx",
  "sal/rtl/ustring.cxx",
  "sal/rtl/hash.cxx",
  "sal/rtl/hash.hxx",
  "sal/rtl/strimp.hxx",
  "sal/rtl/strimp.cxx",
  "include/rtl/ustring.h",
  "include/rtl/string.h",
  "include/osl/interlck.h",
  "include/osl/diagnose.h",
  "sal/osl/unx/mutex.cxx",
  "include/rtl/character.hxx",
  "include/o3tl/safeint.hxx",
];
if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw new Error("Expected pinned baseline");
const sources = Object.fromEntries(
  files.map(
    /** Reads verified full blobs. @param path - Original path. @returns File pair. */ (path) => {
      const value = readFileSync(`${upstream}/${path}`, "utf8");
      if (
        execFileSync("git", ["-C", upstream, "show", `${pin}:${path}`], { encoding: "utf8" }) !==
        value
      )
        throw new Error(`Modified original file: ${path}`);
      return [path, value];
    },
  ),
);
const tmpl = sources[files[0]],
  unicode = sources[files[1]],
  mutex = sources[files[10]];
const scopes = {
  unsignedConversion: scope(
    sources[files[12]],
    "template <std::signed_integral T> constexpr std::make_unsigned_t<T> make_unsigned",
    "template <std::unsigned_integral T1",
  ),
  unicodeData: scope(sources[files[6]], "typedef struct _rtl_uString\n", "/** @endcond */"),
  byteData: scope(sources[files[7]], "typedef struct _rtl_String\n", "/** @endcond */"),
  flags: scope(
    sources[files[4]],
    "#define SAL_STRING_INTERN_FLAG",
    "rtl_uString* rtl_uString_ImplAlloc",
  ),
  allocationDeclarations: scope(sources[files[4]], 'extern "C" {', "void alloc_preInit"),
  allocationDefaults: scope(
    sources[files[5]],
    "rtl_allocateStringFn rtl_allocateString = malloc;",
    'extern "C" {',
  ),
  unsigned: scope(tmpl, "template <typename C> auto UChar(C c)", "// Wrappers"),
  lengthWrapper: scope(
    tmpl,
    "template <typename C> struct with_length",
    "template <bool (&fApplicable)",
  ),
  copy: scope(tmpl, "template <typename C> void Copy(", "template <typename C> void CopyBackward"),
  length: scope(
    tmpl,
    "template <typename T> sal_Int32 getLength",
    "/* ----------------------------------------------------------------------- */",
  ),
  comparator: scope(
    tmpl,
    "template <typename C> void warnIfCharAndNotAscii",
    "struct CompareIgnoreAsciiCase",
  ),
  noShortening: scope(tmpl, "struct NoShortening", "template <class S1"),
  forward: scope(
    tmpl,
    "template <typename C>\nsal_Int32 compare(with_length",
    "template <typename C1, typename C2, class Compare>\nsal_Int32 compare(with_length",
  ),
  hash: scope(
    tmpl,
    "template <typename C> sal_Int32 hashCode_WithLength",
    "template <typename C> sal_Int32 hashCode(",
  ),
  storage: scope(
    tmpl,
    "template <class rtl_tString> using Char_T",
    "template <typename rtl_tString>\nvoid newFromSubString",
  ),
  getStr: scope(tmpl, "template <typename rtl_tString> auto* getStr", "enum ThrowPolicy"),
  forwardWrapper: scope(
    unicode,
    "sal_Int32 SAL_CALL rtl_ustr_compare_WithLength",
    "sal_Int32 SAL_CALL rtl_ustr_shortenedCompare_WithLength",
  ),
  hashWrapper: scope(
    unicode,
    "sal_Int32 SAL_CALL rtl_ustr_hashCode_WithLength",
    "sal_Int32 SAL_CALL rtl_ustr_indexOfChar(",
  ),
  storageWrappers: scope(
    unicode,
    "rtl_uString* rtl_uString_ImplAlloc",
    "void SAL_CALL rtl_uString_newFromSubString",
  ),
  assignAndGet: scope(
    unicode,
    "void SAL_CALL rtl_uString_assign",
    "void SAL_CALL rtl_uString_newConcat",
  ),
  lifecycleAndIntern: scope(
    unicode,
    "namespace {\n\nenum StrLifecycle",
    "static int rtl_canGuessUOutputLength",
  ),
  internRelease: scope(
    unicode,
    "void internRelease (rtl_uString *pThis)",
    "sal_uInt32 SAL_CALL rtl_uString_iterateCodePoints",
  ),
  hashTable: scope(sources[files[2]], "namespace {", "/* vim:"),
  mutexCreate: scope(mutex, "typedef struct _oslMutexImpl", "void SAL_CALL osl_destroyMutex"),
  mutexAcquire: scope(
    mutex,
    "sal_Bool SAL_CALL osl_acquireMutex",
    "sal_Bool SAL_CALL osl_tryToAcquireMutex",
  ),
  mutexRelease: scope(mutex, "sal_Bool SAL_CALL osl_releaseMutex", "/* vim:"),
  ascii: scope(
    sources[files[11]],
    "inline SAL_CONSTEXPR bool isUnicodeCodePoint",
    "\n#if defined LIBO_INTERNAL_ONLY\nbool isAscii",
  ),
  atomicIncrement: sources[files[8]].match(
    /#\s+define osl_atomic_increment\(p\)\s+__sync_add_and_fetch\(\(p\), 1\)/,
  )?.[0],
  atomicDecrement: sources[files[8]].match(
    /#\s+define osl_atomic_decrement\(p\)\s+__sync_sub_and_fetch\(\(p\), 1\)/,
  )?.[0],
};
if (
  Object.values(scopes).some(
    /** Rejects missing declarations. @param value - Scope bytes. @returns Missing flag. */ (
      value,
    ) => !value,
  )
)
  throw new Error("Incomplete original extraction");
// Only type/platform/diagnostic and caller IO plumbing surrounds the unchanged source bodies.
const driver = `#include <concepts>
#include <cstdint>
#include <cstdlib>
#include <cstddef>
#include <cassert>
#include <algorithm>
#include <limits>
#include <type_traits>
#include <string_view>
#include <vector>
#include <map>
#include <iostream>
#include <pthread.h>
using sal_Int32=std::int32_t;using sal_uInt32=std::uint32_t;using sal_Unicode=char16_t;using oslInterlockedCount=sal_Int32;using sal_Bool=bool;
#define SAL_CALL
#define SAL_CONSTEXPR constexpr
#define SAL_WARN_IF(...)
#define SAL_WARN(...)
#define SAL_UNLIKELY(x) (x)
#define OSL_ASSERT(c) do{if(!(c))std::cerr<<"OSL_ASSERT: "<<#c<<'\\n';}while(false)
#define RTL_LOG_STRING_NEW(...)
#define RTL_LOG_STRING_DELETE(...)
#define RTL_LOG_STRING_INTERN_NEW(...)
#define RTL_LOG_STRING_INTERN_DELETE(...)
${scopes.atomicIncrement}
${scopes.atomicDecrement}
namespace o3tl { ${scopes.unsignedConversion} }
namespace rtl { ${scopes.ascii} }
${scopes.unicodeData}
${scopes.byteData}
${scopes.flags}
${scopes.allocationDeclarations}
${scopes.allocationDefaults}
struct _oslMutexImpl;using oslMutex=_oslMutexImpl*;
${scopes.mutexCreate}
${scopes.mutexAcquire}
${scopes.mutexRelease}
void internRelease(rtl_uString*);
void rtl_uString_acquire(rtl_uString*) noexcept;
void rtl_uString_release(rtl_uString*) noexcept;
void rtl_uString_newFromString(rtl_uString**,const rtl_uString*) noexcept;
sal_Int32 rtl_ustr_hashCode_WithLength(const sal_Unicode*,sal_Int32) noexcept;
sal_Int32 rtl_ustr_compare_WithLength(const sal_Unicode*,sal_Int32,const sal_Unicode*,sal_Int32) noexcept;
namespace rtl::str { ${scopes.unsigned} ${scopes.lengthWrapper} ${scopes.copy} ${scopes.length} ${scopes.comparator} ${scopes.noShortening} ${scopes.forward} ${scopes.hash} ${scopes.storage} ${scopes.getStr} }
${scopes.forwardWrapper}
${scopes.hashWrapper}
${scopes.storageWrappers}
${scopes.assignAndGet}
${scopes.hashTable}
${scopes.lifecycleAndIntern}
${scopes.internRelease}
struct Live {rtl_uString* p;std::size_t bytes;};
std::map<int,Live> live;std::map<rtl_uString*,int> ids;int nextId=1;bool failNext=false;
std::vector<std::vector<long long>> events;
void* captureAlloc(std::size_t bytes){if(failNext){failNext=false;events.push_back({2,(long long)bytes});return nullptr;}auto p=(rtl_uString*)malloc(bytes);assert(p);int id=nextId++;ids[p]=id;live[id]={p,bytes};events.push_back({0,id,(long long)bytes});return p;}
void captureFree(void* data){auto p=(rtl_uString*)data;auto found=ids.find(p);assert(found!=ids.end());int id=found->second;auto capacity=(live.at(id).bytes-10)/2;std::vector<long long> event={1,id,p->refCount,p->length,(long long)capacity};for(int i=0;i<=p->length;i++)event.push_back(p->buffer[i]);event.push_back(p->buffer[capacity]);events.push_back(event);live.erase(id);ids.erase(found);free(data);}
int identify(rtl_uString* p){if(!p)return -1;if(p==&rtl::str::EmptyStringImpl<rtl_uString>::data)return 0;return ids.at(p);}
void snapshot(const std::vector<rtl_uString*>& h,const std::vector<long long>& result){
std::cout<<"{\\"handles\\":[";bool comma=false;for(auto p:h){if(comma)std::cout<<',';comma=true;std::cout<<identify(p);}std::cout<<"],\\"live\\":[";
auto printData=[&](int id,rtl_uString* p,int capacity){std::cout<<'['<<id<<','<<p->refCount<<','<<rtl_uString_getLength(p)<<','<<capacity<<",[";auto chars=rtl_uString_getStr(p);for(int i=0;i<=p->length;i++){if(i)std::cout<<',';std::cout<<(unsigned)chars[i];}std::cout<<"],"<<(unsigned)chars[capacity]<<']';};
printData(0,&rtl::str::EmptyStringImpl<rtl_uString>::data,0);for(auto [id,v]:live){std::cout<<',';printData(id,v.p,(v.bytes-10)/2);}std::cout<<"],\\"events\\":[";
comma=false;for(auto e:events){if(comma)std::cout<<',';comma=true;std::cout<<'[';for(unsigned i=0;i<e.size();i++){if(i)std::cout<<',';std::cout<<e[i];}std::cout<<']';}events.clear();
auto table=getHashTable();std::cout<<"],\\"pool\\":["<<table->nSize<<','<<table->nEntries<<",[";comma=false;for(unsigned i=0;i<table->nSize;i++)if(table->pData[i]){if(comma)std::cout<<',';comma=true;std::cout<<'['<<i<<','<<identify(table->pData[i])<<']';}std::cout<<"]],\\"result\\":[";for(unsigned i=0;i<result.size();i++){if(i)std::cout<<',';std::cout<<result[i];}std::cout<<"]}";
}
int main(int argc,char** argv){rtl_allocateString=captureAlloc;rtl_freeString=captureFree;std::vector<rtl_uString*> h(1400,nullptr);sal_Unicode z[]={0};
if(argc>1){int guard=std::atoi(argv[1]);switch(guard){
case 0:rtl_uString_new(nullptr);break;case 1:rtl_uString_alloc(-1);break;
case 2:rtl_uString_new_WithLength(nullptr,1);break;case 3:rtl_uString_new_WithLength(&h[0],-1);break;
case 4:rtl_uString_newFromStr_WithLength(nullptr,z,0);break;case 5:rtl_uString_newFromStr_WithLength(&h[0],z,-1);break;case 6:rtl_uString_newFromStr_WithLength(&h[0],nullptr,1);break;
case 7:rtl::str::newFromStr_WithLength(&h[0],z,0,-1);break;case 8:rtl_uString_newFromString(&h[0],nullptr);break;case 9:rtl_uString_assign(nullptr,&rtl::str::EmptyStringImpl<rtl_uString>::data);break;
case 10:rtl_uString_getLength(nullptr);break;case 11:rtl_uString_getStr(nullptr);break;case 12:rtl_uString_intern(nullptr,&rtl::str::EmptyStringImpl<rtl_uString>::data);break;case 13:rtl_uString_intern(&h[0],nullptr);break;
case 14:rtl_ustr_hashCode_WithLength(z,-1);break;case 15:rtl_ustr_compare_WithLength(z,-1,z,0);break;
case 16:failNext=true;rtl_uString_new_WithLength(&h[0],3);break;case 17:failNext=true;rtl_uString_newFromStr_WithLength(&h[0],z,1);break;case 18:rtl_ustr_compare_WithLength(z,0,z,-1);break;case 19:rtl_uString_ImplAlloc(-1);break;}return 0;}
std::string op;int a,b,n;bool comma=false;std::cout<<'[';
while(std::cin>>op>>a>>b>>n){std::vector<sal_Unicode> units(n);unsigned x;for(auto& c:units){std::cin>>x;c=x;}std::vector<long long> result;
if(op=="new")rtl_uString_newFromStr_WithLength(&h[a],units.data(),n);
else if(op=="extra")rtl::str::newFromStr_WithLength(&h[a],units.data(),n,b);
else if(op=="empty")rtl_uString_new(&h[a]);
else if(op=="null")rtl_uString_newFromStr_WithLength(&h[a],nullptr,0);
else if(op=="reserve")rtl_uString_new_WithLength(&h[a],b);
else if(op=="alloc"){h[a]=rtl_uString_alloc(n);std::copy(units.begin(),units.end(),h[a]->buffer);}
else if(op=="implalloc"){h[a]=rtl_uString_ImplAlloc(n);std::copy(units.begin(),units.end(),h[a]->buffer);}
else if(op=="failalloc"){failNext=true;h[a]=rtl_uString_alloc(b);result.push_back(h[a]==nullptr);}
else if(op=="copy")rtl_uString_newFromString(&h[a],h[b]);
else if(op=="alias")rtl_uString_newFromStr_WithLength(&h[a],h[b]->buffer+b%2,h[b]->length-b%2);
else if(op=="assign")rtl_uString_assign(&h[a],h[b]);
else if(op=="acquire")rtl_uString_acquire(h[a]);
else if(op=="release"){rtl_uString_release(h[a]);h[a]=nullptr;}
else if(op=="intern")rtl_uString_intern(&h[a],h[b]);
else if(op=="rawintern")h[a]=rtl_str_hash_intern(h[b],CAN_RETURN);
else if(op=="return"){auto p=h[b];h[b]=nullptr;rtl_ustring_intern_internal(&h[a],p,CAN_RETURN);}
else if(op=="static")h[a]->refCount=SAL_STRING_STATIC_FLAG;
else if(op=="remove")rtl_str_hash_remove(h[a]);
else if(op=="hash")result.push_back(rtl_ustr_hashCode_WithLength(units.data(),n));
else if(op=="compare")result.push_back(rtl_ustr_compare_WithLength(h[a]->buffer,h[a]->length,h[b]->buffer,h[b]->length));
else if(op=="size")result.push_back(getNextSize((sal_uInt32)b));
else if(op=="table"){rtl_str_hash_free(nullptr);auto p=rtl_str_hash_new(b);result={p->nSize,p->nEntries};rtl_str_hash_free(p);}
else if(op=="cstring"){units.push_back(0);rtl_uString_newFromStr(&h[a],units.data());}
else {std::cerr<<"Unknown caller op";return 2;}
if(comma)std::cout<<',';comma=true;snapshot(h,result);
}
std::cout<<']';
// Caller cleanup after recording: retains original fast-path displaced allocations in the evidence, then avoids probe-only process leaks.
for(auto [id,v]:live)free(v.p);
}
`;
const calls = [];
/** Appends caller input only. @param op - Original call selector. @param a - Destination. @param b - Source or scalar. @param units - Initialized UTF16 input. @returns Original operation result. */
function call(op, a = 0, b = 0, units = []) {
  calls.push({ op, a, b, units });
}
call("empty");
call("acquire");
call("release");
call("alloc", 0, 0, [65, 0, 65535]);
call("assign", 1, 0);
call("assign", 0, 0);
call("copy", 2, 0);
call("compare", 0, 2);
call("alias", 2, 2);
call("alias", 1, 1);
call("release", 0);
call("release", 1);
call("release", 2);
call("reserve", 0, 7);
call("extra", 1, 4, [55296, 56320, 0, 32768]);
call("copy", 0, 1);
call("new", 0, 0, [66]);
call("cstring", 2, 0, [65, 0, 66]);
call("copy", 2, 2);
call("reserve", 2, 7);
call("reserve", 2, 0);
call("implalloc", 3, 0, []);
call("failalloc", 4, 5);
call("release", 0);
call("release", 1);
call("release", 2);
call("release", 3);
call("null", 0);
call("extra", 0, 3, []);
call("release", 0);
call("table", 0, 1024);
for (const units of [
  [],
  [0],
  [1],
  [65],
  [65535],
  [65, 0, 66],
  [55296, 56320],
  Array.from(
    { length: 64 },
    /** Enumerates caller UInt16 units only. @param ignored - Array placeholder. @param i - Caller index. @returns Initialized source unit. */ (
      _,
      i,
    ) => (i * 997) & 65535,
  ),
])
  call("hash", 0, 0, units);
for (const first of [[], [0], [65535], [65, 66], [65, 0, 66]])
  for (const second of [[], [0], [65535], [65, 66], [65, 0, 66]]) {
    call("new", 0, 0, first);
    call("new", 1, 0, second);
    call("compare", 0, 1);
    call("release", 0);
    call("release", 1);
  }
for (const size of [0, 1020, 1021, 1024, 2039, 4093, 134217688, 134217689, 2147483647, -1])
  call("size", 0, size);
call("new", 0, 0, [65, 66]);
call("intern", 1, 0);
call("intern", 1, 0);
call("intern", 2, 0);
call("intern", 3, 1);
call("assign", 1, 1);
call("copy", 4, 1);
call("intern", 4, 1);
call("rawintern", 5, 1);
call("release", 0);
call("release", 1);
call("release", 2);
call("release", 3);
call("release", 4);
call("release", 5);
call("new", 0, 0, [1234]);
call("return", 1, 0);
call("new", 0, 0, [1234]);
call("return", 2, 0);
call("release", 1);
call("release", 2);
call("empty", 0);
call("intern", 1, 0);
call("release", 0);
call("release", 1);
// These one-unit inputs collide at the last initial table slot, exercising wrap and removal reinsertion.
for (let i = 0; i < 5; i++) {
  call("new", 0, 0, [2001 + i * 2039]);
  call("return", 10 + i, 0);
}
call("new", 0, 0, [2001 + 6 * 2039]);
call("remove", 0);
call("release", 0);
call("release", 11);
call("release", 10);
call("release", 12);
call("release", 14);
call("release", 13);
for (let i = 0; i < 4; i++) {
  call("new", 0, 0, [1999 + i * 2039]);
  call("return", 10 + i, 0);
}
for (let i = 0; i < 4; i++) call("release", 10 + i);
call("new", 0, 0, [18]);
call("remove", 0);
call("release", 0);
call("new", 0, 0, [0, 1340]);
call("return", 10, 0);
call("implalloc", 0, 0, []);
call("intern", 11, 0);
call("remove", 11);
call("release", 11);
call("release", 0);
call("release", 10);
call("new", 0, 0, [7, 8]);
call("static", 0);
call("return", 1, 0);
call("intern", 2, 1);
call("release", 1);
call("release", 2);
// Retain enough distinct strings to execute the original load-factor threshold and double next-prime growth.
for (let i = 0; i < 1030; i++) {
  call("new", 0, 0, [i + 200, 42]);
  call("return", 20 + i, 0);
}
for (let i = 0; i < 1030; i++) call("release", 20 + ((i * 37) % 1030));
const expressions = [
  "ppThis",
  "nLen >= 0",
  "ppThis",
  "nLen >= 0",
  "ppThis",
  "nLen >= 0",
  "pCharStr || nLen == 0",
  "allocExtra >= 0",
  "pStr",
  "ppThis",
  "pStr",
  "pThis",
  "newStr",
  "str",
  "nLen >= 0",
  "len >= 0",
  "*ppThis != nullptr",
  "*ppThis != nullptr",
  "len >= 0",
  "value >= 0",
];
mkdirSync(target, { recursive: true });
writeFileSync(`${target}/driver.cpp`, driver);
execFileSync(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-g",
    "-fsanitize=address,undefined",
    "-pthread",
    `${target}/driver.cpp`,
    "-o",
    `${target}/driver`,
  ],
  { timeout: 30000, stdio: "pipe" },
);
const input = calls
  .map(
    /** Serializes calls without computing outcomes. @param entry - Caller input. @returns IO line. */ ({
      op,
      a,
      b,
      units,
    }) => [op, a, b, units.length, ...units].join(" "),
  )
  .join("\n");
const output = execFileSync(`${target}/driver`, {
  input,
  encoding: "utf8",
  timeout: 60000,
  maxBuffer: 160 * 1024 * 1024,
});
writeFileSync(`${target}/output.json`, output);
const states = JSON.parse(output);
if (states.length !== calls.length) throw new Error("Incomplete native state capture");
// Lossless state deltas encode observations only, never an expected RTL operation. The original full output is retained and hashed.
let previousHandles = [],
  previousLive = new Map(),
  previousPool = new Map();
const deltas = states.map(
  /** Encodes every original observed field without dropping any snapshot. @param state - Complete native observation. @returns Lossless delta. */ (
    state,
  ) => {
    const handles = [];
    for (let i = 0; i < state.handles.length; i++)
      if (previousHandles[i] !== state.handles[i]) handles.push([i, state.handles[i]]);
    const currentLive = new Map(
      state.live.map(
        /** Indexes captured identities. @param row - Full original state. @returns Identity pair. */ (
          row,
        ) => [row[0], row],
      ),
    );
    const live = [];
    for (const [id, row] of currentLive)
      if (JSON.stringify(previousLive.get(id)) !== JSON.stringify(row)) live.push([id, row]);
    for (const id of previousLive.keys()) if (!currentLive.has(id)) live.push([id, null]);
    const currentPool = new Map(state.pool[2]),
      pool = [];
    for (const [slot, id] of currentPool) if (previousPool.get(slot) !== id) pool.push([slot, id]);
    for (const slot of previousPool.keys()) if (!currentPool.has(slot)) pool.push([slot, null]);
    previousHandles = state.handles;
    previousLive = currentLive;
    previousPool = currentPool;
    return [handles, live, state.events, state.pool[0], state.pool[1], pool, state.result];
  },
);
// Independently reconstruct every field before accepting the compact artifact.
const decodedHandles = Array(1400).fill(-1),
  decodedLive = new Map(),
  decodedPool = new Map();
for (let i = 0; i < deltas.length; i++) {
  const [handles, live, events, size, count, pool, result] = deltas[i];
  for (const [index, id] of handles) decodedHandles[index] = id;
  for (const [id, row] of live) {
    if (row === null) decodedLive.delete(id);
    else decodedLive.set(id, row);
  }
  for (const [slot, id] of pool) {
    if (id === null) decodedPool.delete(slot);
    else decodedPool.set(slot, id);
  }
  const decoded = {
    handles: decodedHandles,
    live: [...decodedLive.values()].sort(
      /** Restores original identity order. @param a - First observed row. @param b - Second observed row. @returns Original numeric order. */ (
        a,
        b,
      ) => a[0] - b[0],
    ),
    events,
    pool: [
      size,
      count,
      [...decodedPool].sort(
        /** Restores original slot order. @param a - First slot. @param b - Second slot. @returns Slot order. */ (
          a,
          b,
        ) => a[0] - b[0],
      ),
    ],
    result,
  };
  if (JSON.stringify(decoded) !== JSON.stringify(states[i]))
    throw new Error(`Lossy native capture at ${i}`);
}
const guards = expressions.map(
  /** Captures original fail-fast assertions. @param expression - Native assertion. @param index - Driver selector. @returns Native evidence. */ (
    expression,
    index,
  ) => {
    const result = spawnSync(`${target}/driver`, [String(index)], {
      encoding: "utf8",
      timeout: 30000,
    });
    writeFileSync(`${target}/guard-${index}.stderr`, result.stderr);
    if (result.signal !== "SIGABRT" || !result.stderr.includes(expression))
      throw new Error(`Missing assertion ${index}: ${expression}`);
    return { index, expression, signal: result.signal };
  },
);
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    files.map(
      /** Hashes full pinned files. @param path - Original file. @returns Digest pair. */ (
        path,
      ) => [path, hash(sources[path])],
    ),
  ),
  scopeHashes: Object.fromEntries(
    Object.entries(scopes).map(
      /** Hashes unmodified intervals. @param entry - Original scope. @returns Digest pair. */ ([
        key,
        value,
      ]) => [key, hash(value)],
    ),
  ),
  driverHash: hash(driver),
  statesEncoding: "complete-observation-deltas-v1",
  statesHash: hash(output),
  handleCount: 1400,
  calls,
  deltas,
  guards,
};
const check = process.argv.includes("--check"),
  write = process.argv.includes("--write");
if (check === write) throw new Error("Use exactly --write or --check");
if (write) writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native ownership fixture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    calls: calls.length,
    guards: guards.length,
    sourceFiles: files.length,
    scopes: Object.keys(scopes).length,
    driverHash: record.driverHash,
    bytes: output.length,
  }),
);
