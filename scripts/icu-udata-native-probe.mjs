/** @fileoverview Original ICU78.3 UDataMemory/header/real mapped-close and RBBIDataWrapper data-handle constructor witness. Full numeric fields compare live; no source methods, mapper, TOC callbacks or providers are replaced. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { observeUData, frame } from "./icu-udata-observe.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/udatamem-witness`;
const original = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/rbbidata.native-observations.json",
    "utf8",
  ),
);
const binaries = original.binaries.map(
  /** Decodes original compiled rules. @param x - Native binary. @returns Real bytes. */ (x) =>
    Uint8Array.from(Buffer.from(x.binary, "base64")),
);
const harness = readFileSync("scripts/icu-rbbidata-owner-native-probe.mjs", "utf8");
const observers = harness.slice(harness.indexOf("void value("), harness.indexOf("int main("));
const cpp =
  String.raw`
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstdlib>
#include <cstring>
#include "unicode/unistr.h"
#include "unicode/stringpiece.h"
#include "unicode/ucptrie.h"
#include "udatamem.h"
#include "ucmndata.h"
#include "umapfile.h"
#define private public
#include "rbbidata.h"
#undef private
using namespace std;using namespace icu;
` +
  observers +
  String.raw`
int64_t off(const void*p,const uint8_t*b){return p?reinterpret_cast<const uint8_t*>(p)-b:-1;}
void memory(UDataMemory*d,const uint8_t*b){if(!d){cout<<" -1";return;}cout<<' '<<int(d->vFuncs!=nullptr)<<' '<<off(d->pHeader,b)<<' '<<off(d->toc,b)<<' '<<int(d->heapAllocated)<<' '<<off(d->mapAddr,b)<<' '<<off(d->map,b)<<' '<<d->length<<' '<<int(UDataMemory_isLoaded(d))<<' '<<off(udata_getRawMemory(d),b)<<' '<<off(udata_getMemory(d),b)<<' '<<udata_getLength(d);if(d->pHeader){cout<<' '<<udata_getHeaderSize(d->pHeader)<<' '<<udata_getInfoSize(&d->pHeader->info);auto p=reinterpret_cast<const uint8_t*>(d->pHeader);for(int i=0;i<64;++i)cout<<' '<<uint32_t(p[i]);}}
vector<uint8_t> frame(int pre,int size,int info,int endian,const vector<uint8_t>&raw={},int variant=0,int cap=131072){vector<uint8_t>b(cap,0);auto h=reinterpret_cast<DataHeader*>(b.data()+pre);h->dataHeader.headerSize=size;h->dataHeader.magic1=0xda;h->dataHeader.magic2=0x27;h->info.size=info;h->info.reservedWord=0x1234;h->info.isBigEndian=endian;h->info.charsetFamily=0;h->info.sizeofUChar=2;h->info.reservedByte=0x56;uint8_t fmt[]={0x42,0x72,0x6b,0x20},ver[]={6,0,0,0},data[]={1,2,3,4};memcpy(h->info.dataFormat,fmt,4);memcpy(h->info.formatVersion,ver,4);memcpy(h->info.dataVersion,data,4);if(raw.size())memcpy(b.data()+pre+(size<20?32:size),raw.data(),raw.size());if(variant==6)h->info.charsetFamily=1;if(variant==7)h->info.sizeofUChar=4;if(variant==8)h->info.dataFormat[3]=0;if(variant==9)h->info.formatVersion[0]=7;if(variant==10)h->info.formatVersion[1]=255;if(variant==12)*reinterpret_cast<uint32_t*>(b.data()+pre+size)=0;if(variant==13)h->dataHeader.magic1=0;return b;}
UDataMemory* descriptor(int heap,UDataMemory&stack){if(heap){UErrorCode ec=U_ZERO_ERROR;return UDataMemory_createNewInstance(&ec);}UDataMemory_init(&stack);return &stack;}
int main(int argc,char**argv){cout<<"P "<<sizeof(void*)<<' '<<sizeof(UDataMemory)<<' '<<sizeof(DataHeader)<<' '<<sizeof(UDataInfo)<<' '<<U_IS_BIG_ENDIAN<<' '<<U_CHARSET_FAMILY<<' '<<MAP_IMPLEMENTATION<<'\n';char op;while(cin>>op){cout<<op;
 if(op=='S'){int size,info,endian;cin>>size>>info>>endian;auto b=frame(0,size,info,endian,{},0,32);auto h=reinterpret_cast<const DataHeader*>(b.data());cout<<' '<<h->dataHeader.headerSize<<' '<<h->info.size<<' '<<int(h->info.isBigEndian)<<' '<<udata_getHeaderSize(h)<<' '<<udata_getInfoSize(&h->info);for(int i=0;i<24;++i)cout<<' '<<uint32_t(b[i]);}
 if(op=='Z'){udata_close(nullptr);cout<<' '<<udata_getHeaderSize(nullptr)<<' '<<udata_getInfoSize(nullptr)<<' '<<int(udata_getMemory(nullptr)==nullptr)<<' '<<udata_getLength(nullptr)<<' '<<int(udata_getRawMemory(nullptr)==nullptr)<<' '<<int(UDataMemory_normalizeDataPointer(nullptr)==nullptr);}
 if(op=='N'){int initial;cin>>initial;UErrorCode ec=UErrorCode(initial);auto d=UDataMemory_createNewInstance(&ec);cout<<' '<<int(ec);memory(d,nullptr);udata_close(d);}
 if(op=='H'){int size,info,endian,len,pre;cin>>size>>info>>endian>>len>>pre;auto b=frame(pre,size,info,endian);UDataMemory d;UDataMemory_init(&d);UDataMemory_setData(&d,b.data());d.length=len;memory(&d,b.data());UDataMemory_setData(&d,nullptr);memory(&d,b.data());udata_close(&d);memory(&d,b.data());}
 if(op=='M'){UDataMemory d;UDataMemory_init(&d);UErrorCode ec=U_ZERO_ERROR;bool mapped=uprv_mapFile(&d,argv[1],&ec);if(!mapped||U_FAILURE(ec))return 2;auto b=reinterpret_cast<const uint8_t*>(d.mapAddr);cout<<' '<<int(mapped);memory(&d,b);udata_close(&d);memory(&d,b);}
 if(op=='A'){int sh,dh,len,mapped;cin>>sh>>dh>>len>>mapped;UDataMemory sstore,dstore;auto s=descriptor(sh,sstore),d=descriptor(dh,dstore);auto bytes=frame(0,32,20,0);const uint8_t*b=bytes.data();if(mapped){UErrorCode ec=U_ZERO_ERROR;if(!uprv_mapFile(s,argv[1],&ec)||U_FAILURE(ec))return 3;b=reinterpret_cast<const uint8_t*>(s->mapAddr);}else{UDataMemory_setData(s,b);s->length=len;}s->toc=b+48;d->toc=b+96;d->length=777;memory(s,b);memory(d,b);UDatamemory_assign(d,s);memory(d,b);cout<<' '<<int(d->pHeader==s->pHeader)<<' '<<int(d->toc==s->toc)<<' '<<int(d->vFuncs==s->vFuncs)<<' '<<int(d->map==s->map)<<' '<<int(d->mapAddr==s->mapAddr);udata_close(d);s->map=nullptr;s->mapAddr=nullptr;s->pHeader=nullptr;udata_close(s);if(mapped&&sh)free(s);}
 if(op=='R'){string path;int variant,initial,heap;cin>>path>>variant>>initial>>heap;ifstream f(path,ios::binary);vector<uint8_t>raw((istreambuf_iterator<char>(f)),{});int pre=variant==1?8:variant==16?16:0,size=variant==2?20:variant==3?19:variant==4?0:variant==15?24:32;auto b=frame(pre,size,variant==11?0:20,variant==5?1:0,raw,variant);UDataMemory store;auto d=variant==14?nullptr:descriptor(heap,store);if(d){if(variant==13)d->pHeader=reinterpret_cast<DataHeader*>(b.data()+pre);else UDataMemory_setData(d,b.data());}memory(d,b.data());UErrorCode ec=UErrorCode(initial);auto w=new RBBIDataWrapper(d,ec);const void*p=d&&d->pHeader?reinterpret_cast<const uint8_t*>(d->pHeader)+d->pHeader->dataHeader.headerSize:b.data()+32;state(*w,ec,p);cout<<' '<<int(w->fUDataMem==d);memory(d,b.data());bool adopted=w->fUDataMem!=nullptr;if(U_SUCCESS(ec)){cout<<' '<<int(w->addReference()==w);state(*w,ec,p);w->removeReference();state(*w,ec,p);w->removeReference();if(!heap)memory(d,b.data());}else{w->removeReference();state(*w,ec,p);memory(d,b.data());cleanup(w);}if(!adopted)udata_close(d);}
 cout<<'\n';}}
`;
writeFileSync(`${prefix}.cpp`, cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${prefix}.cpp`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
writeFileSync(`${prefix}-mapped.bin`, frame(0, 32, 20, 0));
const paths = binaries.map(
  /** Writes native raw inputs. @param b - Actual bytes. @param i - Input index. @returns File path. */ (
    b,
    i,
  ) => {
    const path = `${prefix}-raw-${i}.bin`;
    writeFileSync(path, b);
    return path;
  },
);
/** Full-row hash, after direct comparison. @param row - Actual fields. @returns SHA256. */
function digest(row) {
  return createHash("sha256").update(JSON.stringify(row)).digest("hex");
}
/** Executes unchanged native APIs and compares every initialized numeric field. @param cases - Real descriptors. @returns Full-row fingerprints. */
function compare(cases) {
  const input =
    cases
      .map(
        /** Serializes an original API call. @param c - Input descriptor. @returns Command. */ (
          c,
        ) =>
          `${c.kind} ${c.kind === "R" ? `${paths[c.args[0]]} ${c.args.slice(1).join(" ")}` : c.args.join(" ")}`,
      )
      .join("\n") + "\n";
  const lines = execFileSync(prefix, [`${prefix}-mapped.bin`], {
    input,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  })
    .trimEnd()
    .split("\n");
  const profile = lines.shift();
  if (profile !== "P 8 56 24 20 0 0 2") throw Error(`Profile changed: ${profile}`);
  if (lines.length !== cases.length) throw Error(`Count ${lines.length} != ${cases.length}`);
  return cases.map(
    /** Compares full observations. @param c - Input. @param i - Original row index. @returns Native fingerprint. */ (
      c,
      i,
    ) => {
      const expected = lines[i].slice(2).split(" ").map(Number),
        actual = observeUData(c, binaries);
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        const at = expected.findIndex(
          /** Finds the first differing field. @param v - Native value. @param j - Field index. @returns Different. */ (
            v,
            j,
          ) => v !== actual[j],
        );
        throw Error(
          `Mismatch ${JSON.stringify(c)} field ${at}: ${expected[at]} vs ${actual[at]}, lengths ${expected.length}/${actual.length}`,
        );
      }
      return digest(expected);
    },
  );
}
const scalar = [];
for (const endian of [0, 1, 2]) {
  const cases = [];
  for (let size = 0; size < 65536; ++size)
    cases.push({ kind: "S", args: [size, size ^ 0x5aa5, endian] });
  const hashes = compare(cases);
  scalar.push({ endian, count: cases.length, hash: digest(hashes) });
  console.log(`Native endian=${endian}: ${cases.length} complete header rows matched`);
}
const cases = [
  { kind: "Z", args: [] },
  { kind: "M", args: [] },
];
for (const s of [0, -124, -128, 1, 7]) cases.push({ kind: "N", args: [s] });
for (const size of [0, 1, 19, 20, 24, 32, 255, 256, 65535])
  for (const endian of [0, 1, 2])
    for (const len of [-2, -1, 0, 19, 32, 65536])
      for (const pre of [0, 8, 16])
        cases.push({ kind: "H", args: [size, size ^ 0x5aa5, endian, len, pre] });
for (const sh of [0, 1])
  for (const dh of [0, 1])
    for (const len of [-1, 0, 31, 65536])
      for (const mapped of [0, 1]) cases.push({ kind: "A", args: [sh, dh, len, mapped] });
for (let i = 0; i < binaries.length; ++i)
  for (const status of [0, -124, 7])
    for (const heap of [0, 1]) cases.push({ kind: "R", args: [i, 0, status, heap] });
for (let variant = 1; variant <= 16; ++variant)
  for (const status of variant === 14 ? [7] : [0, -124, 7])
    for (const heap of [0, 1]) cases.push({ kind: "R", args: [0, variant, status, heap] });
const hashes = compare(cases);
/** Actual artifact digest. @param file - Repository path. @returns SHA256. */
function sha(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}
const sourceHashes = Object.fromEntries(
  [
    "udatamem.cpp",
    "udatamem.h",
    "ucmndata.cpp",
    "ucmndata.h",
    "umapfile.cpp",
    "umapfile.h",
    "unicode/udata.h",
    "unicode/platform.h",
    "rbbidata.cpp",
    "rbbidata.h",
  ].map(
    /** Hashes pinned source. @param p - Source-relative path. @returns Digest pair. */ (p) => [
      p,
      sha(`${source}/common/${p}`),
    ],
  ),
);
const artifacts = Object.fromEntries(
  [
    "lib/libicuuc.a",
    "lib/libicui18n.a",
    "stubdata/libicudata.a",
    "udatamem-witness.cpp",
    "udatamem-witness",
  ].map(
    /** Hashes original native artifacts. @param p - Build-relative path. @returns Digest pair. */ (
      p,
    ) => [p, sha(`${build}/${p}`)],
  ),
);
writeFileSync(
  "apps/office/src/external/icu/source/common/udatamem.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      profile: [8, 56, 24, 20, 0, 0, 2],
      scope:
        "Original binary fields/endian queries, real initialized UDataMemory helpers, actual POSIX mapped-file close, and UDataMemory-taking RBBIDataWrapper constructors/ref transitions. Full rows compare live. Managed bytes retain source pointer/field contracts; OS munmap, allocation failure, physical ABI/thread effects and heap access after close are unverified. Native mapping uses original uprv_mapFile; no local file mapper, TOC lookup, public iterator or service substitute is installed. Failed-owner scratch cleanup resets counters only after observations.",
      sourceHashes,
      artifacts,
      observerHarnessHash: sha("scripts/icu-rbbidata-owner-native-probe.mjs"),
      scalar,
      binaries: original.binaries,
      cases,
      hashes,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Matched ${cases.length} full descriptor/constructor traces plus 196608 endian/header rows`,
);
