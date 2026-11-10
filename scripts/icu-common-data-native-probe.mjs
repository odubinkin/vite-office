/** @fileoverview Genuine ICU78.3 gencmn/genccode/genbrk package and unchanged common-data dispatch witness. Both source ToCP and CmnD stay distinct; no native headers/methods/providers are replaced. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { observeCommonData } from "./icu-common-data-observe.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  dir = `${build}/ucmndata-data`,
  prefix = `${build}/ucmndata-witness`;
mkdirSync(dir, { recursive: true });
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
for (const name of names) {
  execFileSync(`${build}/bin/genbrk`, [
    "-i",
    `${source}/data/in`,
    "-r",
    resolve(`vendor/libreoffice-reference/i18npool/source/breakiterator/data/${name}.txt`),
    "-o",
    `${dir}/${name}.brk`,
  ]);
  execFileSync(`${build}/bin/genccode`, ["-n", "OpenOffice", "-d", dir, `${dir}/${name}.brk`]);
}
writeFileSync(
  `${dir}/rules.lst`,
  names
    .map(/** Lists original rule filenames. @param n - Rule. @returns File. */ (n) => `${n}.brk`)
    .join("\n") + "\n",
);
execFileSync(
  `${build}/bin/gencmn`,
  ["-n", "OpenOffice", "-t", "tmp", "-S", "-d", dir, "0", `${dir}/rules.lst`],
  { cwd: dir },
);
execFileSync(
  `${build}/bin/gencmn`,
  ["-n", "OpenOffice", "-s", dir, "-d", dir, "0", `${dir}/rules.lst`],
  { cwd: dir },
);
const objects = [];
for (const name of [
  ...names.map(
    /** Lists generated original C symbol files. @param n - Rule. @returns Basename. */ (n) =>
      `${n}_brk`,
  ),
  "OpenOffice_tmp",
]) {
  const object = `${dir}/${name}.o`;
  execFileSync("clang", [
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    "-c",
    `${dir}/${name}.c`,
    "-o",
    object,
  ]);
  objects.push(object);
}
const cpp = String.raw`
#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <cstring>
#include "udatamem.h"
#include "ucmndata.h"
using namespace std;
extern "C" const char OpenOffice_dat[];
struct PE{const char*name;const DataHeader*data;};struct PT{uint32_t count,reserved;PE entry[1];};
int64_t off(const void*p,const uint8_t*b){return p?reinterpret_cast<const uint8_t*>(p)-b:-1;}
void bytes(const void*p,int n){auto b=reinterpret_cast<const uint8_t*>(p);for(int i=0;i<n;++i)cout<<' '<<unsigned(b[i]);}
int main(int argc,char**argv){ifstream f(argv[1],ios::binary);vector<uint8_t>offset((istreambuf_iterator<char>(f)),{});int originalHeaderSize=udata_getHeaderSize(reinterpret_cast<const DataHeader*>(offset.data()));auto native=reinterpret_cast<const uint8_t*>(OpenOffice_dat);auto pt=reinterpret_cast<const PT*>(native+32);cout<<"P "<<sizeof(void*)<<' '<<sizeof(PE)<<' '<<pt->count<<'\n';cout<<"H";bytes(native,32);cout<<'\n';for(uint32_t i=0;i<pt->count;++i){auto raw=reinterpret_cast<const uint8_t*>(pt->entry[i].data);auto h=UDataMemory_normalizeDataPointer(raw);auto body=reinterpret_cast<const uint32_t*>(reinterpret_cast<const uint8_t*>(h)+udata_getHeaderSize(h));int len=udata_getHeaderSize(h)+body[2]+(reinterpret_cast<const uint8_t*>(h)-raw);cout<<"B "<<strlen(pt->entry[i].name)+1;bytes(pt->entry[i].name,strlen(pt->entry[i].name)+1);cout<<' '<<len;bytes(raw,len);cout<<'\n';}
 cout<<"D";for(const char*name:{"folder/OpenOffice","folder/OpenOffice","OpenOffice"}){UErrorCode ec=U_ZERO_ERROR;udata_setAppData(name,OpenOffice_dat,&ec);cout<<' '<<int(ec);}cout<<'\n';
 int format,variant,initial,len,n;while(cin>>format>>variant>>initial>>len>>n){vector<uint8_t>key(n);int c;for(auto&b:key){cin>>c;b=c;}int pre=variant==19?8:variant==20?16:0,size=variant==10?24:variant==11?64:format?32:originalHeaderSize,ta=pre+size;vector<uint64_t>storage(131072,0);auto b=reinterpret_cast<uint8_t*>(storage.data());memcpy(b+pre,format?native:offset.data(),format?32:originalHeaderSize);if(format)memcpy(b+ta,native+32,8+pt->count*sizeof(PE));else memcpy(b+ta,offset.data()+originalHeaderSize,offset.size()-originalHeaderSize);auto h=reinterpret_cast<DataHeader*>(b+pre);h->dataHeader.headerSize=size;UDataMemory store;UDataMemory_init(&store);auto d=variant==13?nullptr:&store;if(d){UDataMemory_setData(d,b);if(variant==12)d->pHeader=nullptr;}if(variant==23)*reinterpret_cast<uint32_t*>(b+ta)=0;if(variant==14){UErrorCode good=U_ZERO_ERROR;udata_checkCommonData(d,&good);}if(variant==1)h->dataHeader.magic1=0;if(variant==2)h->dataHeader.magic2=0;if(variant==3)h->info.isBigEndian=1;if(variant==4)h->info.charsetFamily=1;if(variant==5)h->info.sizeofUChar=4;if(variant==6)h->info.size=0;if(variant==7)h->info.formatVersion[0]=2;if(variant==8)h->info.formatVersion[1]=255;if(variant==9||variant==14)h->info.dataFormat[0]=0;UErrorCode ec=UErrorCode(initial);udata_checkCommonData(d,&ec);
 if(d&&d->vFuncs){if(variant==15)d->toc=nullptr;if(variant==16)*reinterpret_cast<uint32_t*>(b+ta)=0;if(variant==17)*reinterpret_cast<uint32_t*>(b+ta)=1;if(variant==18){if(format){auto t=reinterpret_cast<PT*>(b+ta);for(uint32_t i=0;i<pt->count/2;++i)swap(t->entry[i],t->entry[pt->count-1-i]);}else{auto t=reinterpret_cast<UDataOffsetTOC*>(b+ta);for(uint32_t i=0;i<pt->count/2;++i)swap(t->entry[i],t->entry[pt->count-1-i]);}}if(variant==22&&!format){auto t=reinterpret_cast<UDataOffsetTOC*>(b+ta);t->entry[1].dataOffset=t->entry[0].dataOffset-16;}if(variant==21)d->length=offset.size();}
 cout<<"R "<<int(ec);if(!d){cout<<" -1\n";continue;}cout<<' '<<int(d->vFuncs!=nullptr)<<' '<<off(d->pHeader,b)<<' '<<off(d->toc,b)<<' '<<int(d->heapAllocated)<<' '<<d->length<<' '<<int(d->map!=nullptr)<<' '<<int(d->mapAddr!=nullptr)<<' '<<udata_getLength(d);if(d->pHeader){cout<<' '<<udata_getHeaderSize(d->pHeader)<<' '<<udata_getInfoSize(&d->pHeader->info);bytes(d->pHeader,24);}if(d->vFuncs){if(variant==24){cout<<' '<<d->vFuncs->NumEntries(d);udata_close(d);cout<<'\n';continue;}int32_t out=len;UErrorCode lookup=UErrorCode(initial);auto found=d->vFuncs->Lookup(d,reinterpret_cast<const char*>(key.data()),&out,&lookup);int id=-1;if(found){if(found==d->pHeader)id=-2;else if(format){for(uint32_t i=0;i<pt->count;++i)if(UDataMemory_normalizeDataPointer(pt->entry[i].data)==found)id=i;}else{auto original=reinterpret_cast<const UDataOffsetTOC*>(offset.data()+originalHeaderSize);for(uint32_t i=0;i<original->count;++i)if(reinterpret_cast<const uint8_t*>(found)==b+ta+original->entry[i].dataOffset)id=i;}}cout<<' '<<d->vFuncs->NumEntries(d)<<' '<<out<<' '<<int(lookup)<<' '<<id<<' '<<int(found!=nullptr);if(found){cout<<' '<<udata_getHeaderSize(found)<<' '<<udata_getInfoSize(&found->info);bytes(found,id>=0?64:24);}}udata_close(d);cout<<'\n';}}
`;
writeFileSync(`${prefix}.cpp`, cpp);
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
const startup = execFileSync(prefix, [`${dir}/OpenOffice.dat`], {
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (startup.shift() !== "P 8 16 8") throw Error("Native pointer package profile changed");
const pkg = {
  offset: readFileSync(`${dir}/OpenOffice.dat`).toString("base64"),
  pointerHeader: startup.shift().slice(2).split(" ").map(Number),
  entries: startup
    .filter(
      /** Selects original relocated pointer entries. @param line - Native row. @returns Entry. */ (
        line,
      ) => line.startsWith("B "),
    )
    .map(
      /** Reads actual relocated native static entries. @param line - Full native fields. @returns Input bytes and name. */ (
        line,
      ) => {
        const a = line.slice(2).split(" ").map(Number),
          len = a.shift(),
          name = a.splice(0, len),
          count = a.shift();
        if (a.length !== count) throw Error("Rule byte count");
        return { name, data: Buffer.from(a).toString("base64") };
      },
    ),
};
const duplicateCacheStatuses = startup
  .find(
    /** Selects native-only cache-key observations. @param line - Native row. @returns Cache row. */ (
      line,
    ) => line.startsWith("D "),
  )
  .slice(2)
  .split(" ")
  .map(Number);
if (JSON.stringify(duplicateCacheStatuses) !== "[0,0,-127]")
  throw Error(`Original cache key behavior changed: ${duplicateCacheStatuses}`);
const keys = [[], [0], [255, 0], [128, 0], [47, 0], [79, 0], [122, 0]];
for (const e of pkg.entries) {
  for (let i = 0; i < e.name.length; ++i) keys.push([...e.name.slice(0, i), 0]);
  keys.push([...e.name, 255, 0]);
}
const cases = [];
for (const format of [0, 1])
  for (const status of [0, -124, 7])
    for (const key of keys)
      cases.push({ format, variant: 0, status, length: 123, key: key.length ? key : [0] });
for (const format of [0, 1])
  for (let variant = 1; variant <= 24; ++variant)
    for (const status of [0, -124, 7])
      for (const key of [pkg.entries[0].name, pkg.entries[3].name, pkg.entries[7].name, [255, 0]])
        cases.push({ format, variant, status, length: -2, key });
const input =
  cases
    .map(
      /** Serializes original method inputs. @param c - Input. @returns Native command. */ (c) =>
        `${c.format} ${c.variant} ${c.status} ${c.length} ${c.key.length} ${c.key.join(" ")}`,
    )
    .join("\n") + "\n";
writeFileSync(`${prefix}-inputs.txt`, input);
writeFileSync(`${prefix}-cases.json`, JSON.stringify(cases));
let stdout;
try {
  stdout = execFileSync(prefix, [`${dir}/OpenOffice.dat`], {
    input,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (e) {
  writeFileSync(`${prefix}-partial.txt`, e.stdout ?? "");
  const complete = (e.stdout ?? "")
    .split("\n")
    .filter(
      /** Selects full observation rows. @param l - Native output. @returns Is row. */ (l) =>
        l.startsWith("R "),
    ).length;
  throw Error(`Native ${e.signal}: around row ${complete}, ${JSON.stringify(cases[complete])}`, {
    cause: e,
  });
}
const rows = stdout
  .trimEnd()
  .split("\n")
  .filter(
    /** Selects full observation rows. @param l - Native output. @returns Is row. */ (l) =>
      l.startsWith("R "),
  );
if (rows.length !== cases.length) throw Error("Native row count");
const hashes = cases.map(
  /** Compares complete live native and local fields. @param c - Input. @param i - Index. @returns Full-row SHA256. */ (
    c,
    i,
  ) => {
    const expected = rows[i].slice(2).split(" ").map(Number),
      actual = observeCommonData(c, pkg);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      const at = expected.findIndex(
        /** Finds first mismatching field. @param v - Native value. @param j - Index. @returns Different. */ (
          v,
          j,
        ) => v !== actual[j],
      );
      throw Error(
        `Mismatch ${JSON.stringify(c)} field ${at}: ${expected[at]} vs ${actual[at]} (${expected.length}/${actual.length})`,
      );
    }
    return createHash("sha256").update(JSON.stringify(expected)).digest("hex");
  },
);
/** Hashes actual pinned source or executable bytes. @param p - File. @returns SHA256. */
function sha(p) {
  return createHash("sha256").update(readFileSync(p)).digest("hex");
}
const sourceHashes = Object.fromEntries(
  [
    "common/ucmndata.cpp",
    "common/ucmndata.h",
    "common/udatamem.cpp",
    "common/udata.cpp",
    "tools/toolutil/pkg_gencmn.cpp",
    "tools/toolutil/pkg_genc.cpp",
    "tools/toolutil/unewdata.cpp",
    "tools/gencmn/gencmn.c",
    "tools/genccode/genccode.c",
    "tools/genbrk/genbrk.cpp",
  ].map(
    /** Hashes original source inputs. @param p - Relative source. @returns Digest pair. */ (p) => [
      p,
      sha(`${source}/${p}`),
    ],
  ),
);
const loSourceHashes = Object.fromEntries(
  [
    "i18npool/CustomTarget_breakiterator.mk",
    ...names.map(
      /** Resolves original rule source paths. @param n - Rule. @returns Source path. */ (n) =>
        `i18npool/source/breakiterator/data/${n}.txt`,
    ),
  ].map(
    /** Hashes pinned LibreOffice generation inputs. @param p - Original path. @returns Digest pair. */ (
      p,
    ) => [p, sha(resolve(`vendor/libreoffice-reference/${p}`))],
  ),
);
const artifacts = Object.fromEntries(
  [
    `${prefix}.cpp`,
    prefix,
    `${dir}/OpenOffice_tmp.c`,
    `${dir}/OpenOffice.dat`,
    `${build}/bin/gencmn`,
    `${build}/bin/genccode`,
    `${build}/bin/genbrk`,
    `${build}/lib/libicutu.a`,
    `${build}/lib/libicuuc.a`,
    ...objects,
  ].map(
    /** Hashes real generator and linked witness artifacts. @param p - Actual file. @returns Digest pair. */ (
      p,
    ) => [p.slice(build.length + 1), sha(p)],
  ),
);
writeFileSync(
  "apps/office/src/external/icu/source/common/ucmndata.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      profile: [8, 16, 8],
      scope:
        "Original generator-produced LibreOffice ToCP static package with genuine pointer targets/alignment prefixes and CmnD file. Unchanged original checkCommonData and installed NumEntries/Lookup callbacks compare full initialized descriptor/return/header states. Native pointer relocations are direct managed references keyed by real table byte address, not fake providers or format conversion. Physical pointer ABI/native allocation/mapping, unreadable pointer spans and data outside the supplied relocation binding are unverified. Application-data cache/udata_open and iterator/service installation remain pending.",
      sourceHashes,
      loSourceHashes,
      duplicateCacheStatuses,
      artifacts,
      pkg,
      cases,
      hashes,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Matched ${cases.length} complete original common-data dispatch/lookup traces across both formats`,
);
