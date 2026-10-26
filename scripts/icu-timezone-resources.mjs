/** @fileoverview Exports complete pinned ICU78.3 zoneinfo64, keyTypeData and langInfo resources through unchanged native APIs. Run after the existing AQF9AG ICU native build; --check compares deterministic resource bytes. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";

const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  output = resolve("apps/office/src/external/icu/source/data/misc");
writeFileSync(
  `${build}/timezone-resource-export.cc`,
  String.raw`
#include "unicode/ures.h"
#include "unicode/putil.h"
#include "unicode/uscript.h"
#include "uresimp.h"
#include <iostream>
#include <iomanip>
#include <memory>
#include <cstdlib>
#include <map>
using Handle=std::unique_ptr<UResourceBundle,decltype(&ures_close)>;
std::map<const void*,int> storageIDs;
int storageID(const void* p){auto found=storageIDs.find(p);if(found!=storageIDs.end())return found->second;int id=int(storageIDs.size())+1;storageIDs[p]=id;return id;}
void check(UErrorCode s){if(U_FAILURE(s)){std::cerr<<u_errorName(s)<<'\n';std::exit(2);}}
void quote(const char16_t* p,int32_t n){std::cout<<'"';for(int i=0;i<n;i++){
 unsigned c=p[i];if(c=='"'||c=='\\')std::cout<<'\\'<<char(c);else if(c<32||c>=127){std::cout<<"\\u"<<std::hex<<std::setfill('0')<<std::setw(4)<<c<<std::dec;}else std::cout<<char(c);
}std::cout<<'"';}
void ascii(const char* p){std::cout<<'"';while(*p){if(*p=='"'||*p=='\\')std::cout<<'\\';std::cout<<*p++;}std::cout<<'"';}
void dump(UResourceBundle* r){UErrorCode s=U_ZERO_ERROR;auto t=ures_getType(r);std::cout<<"{\"type\":"<<int(t);
 if(t==URES_TABLE){std::cout<<",\"keys\":[";for(int i=0;i<ures_getSize(r);i++){if(i)std::cout<<',';Handle child(ures_getByIndex(r,i,nullptr,&s),ures_close);check(s);ascii(ures_getKey(child.get()));}std::cout<<']';}
 if(t==URES_TABLE||t==URES_ARRAY){std::cout<<",\"aliasIndices\":[";bool first=true;for(int i=0;i<ures_getSize(r);i++){const char* key=nullptr;auto raw=t==URES_TABLE?res_getTableItemByIndex(&r->getResData(),r->fRes,i,&key):res_getArrayItem(&r->getResData(),r->fRes,i);if(RES_GET_TYPE(raw)==URES_ALIAS){if(!first)std::cout<<',';first=false;std::cout<<i;}}std::cout<<']';}
 if(t==URES_BINARY||t==URES_INT_VECTOR){int32_t n;const void* p=t==URES_BINARY?static_cast<const void*>(ures_getBinary(r,&n,&s)):static_cast<const void*>(ures_getIntVector(r,&n,&s));check(s);std::cout<<",\"storage\":"<<storageID(p);}std::cout<<",\"value\":";
 if(t==URES_TABLE||t==URES_ARRAY){std::cout<<(t==URES_TABLE?'{':'[');for(int i=0;i<ures_getSize(r);i++){if(i)std::cout<<',';Handle child(ures_getByIndex(r,i,nullptr,&s),ures_close);check(s);if(t==URES_TABLE){ascii(ures_getKey(child.get()));std::cout<<':';}dump(child.get());}std::cout<<(t==URES_TABLE?'}':']');}
 else if(t==URES_STRING){int32_t n;auto p=ures_getString(r,&n,&s);check(s);quote(p,n);}
 else if(t==URES_INT){auto n=ures_getInt(r,&s);check(s);std::cout<<n;}
 else if(t==URES_INT_VECTOR){int32_t n;auto p=ures_getIntVector(r,&n,&s);check(s);std::cout<<'[';for(int i=0;i<n;i++){if(i)std::cout<<',';std::cout<<p[i];}std::cout<<']';}
 else if(t==URES_BINARY){int32_t n;auto p=ures_getBinary(r,&n,&s);check(s);std::cout<<'[';for(int i=0;i<n;i++){if(i)std::cout<<',';std::cout<<int(p[i]);}std::cout<<']';}
 else{std::cerr<<"Unsupported resource type "<<int(t)<<'\n';std::exit(3);}std::cout<<'}';
}
int main(int argc,char**argv){if(argc!=2)return 1;u_setDataDirectory(argv[1]);UErrorCode s=U_ZERO_ERROR;
 Handle zone(ures_openDirect(nullptr,"zoneinfo64",&s),ures_close);check(s);std::cout<<"{\"zoneinfo64\":";dump(zone.get());
 Handle keys(ures_openDirect(nullptr,"keyTypeData",&s),ures_close);check(s);std::cout<<",\"keyTypeData\":";dump(keys.get());
 Handle lang(ures_openDirect(nullptr,"langInfo",&s),ures_close);check(s);std::cout<<",\"langInfo\":";dump(lang.get());
 std::cout<<",\"scriptShortNames\":[";for(int i=0;i<USCRIPT_CODE_LIMIT;++i){if(i)std::cout<<',';const char* name=uscript_getShortName(UScriptCode(i));if(name)ascii(name);else std::cout<<"null";}std::cout<<"]}\n";
}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/timezone-resource-export.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/timezone-resource-export`,
  ],
  { stdio: "inherit" },
);
const resources = JSON.parse(
    execFileSync(`${build}/timezone-resource-export`, [`${source}/data/in`], {
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
    }),
  ),
  dataHash = createHash("sha256")
    .update(readFileSync(`${source}/data/in/icudt78l.dat`))
    .digest("hex");
mkdirSync(output, { recursive: true });
for (const name of ["zoneinfo64", "keyTypeData", "langInfo"]) {
  const artifact = {
      source: {
        icuVersion: "78.3",
        dataSha256: dataHash,
        resource: name,
        scope: "Complete direct resource",
      },
      resource: resources[name],
    },
    bytes = await format(JSON.stringify(artifact), {
      ...(await resolveConfig(`${output}/${name}.json`)),
      parser: "json",
    }),
    path = `${output}/${name}.json`;
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== bytes) throw Error(`Pinned resource differs: ${path}`);
  } else writeFileSync(path, bytes);
  console.log(`${name}: ${Buffer.byteLength(bytes)} bytes; pinned data sha256 ${dataHash}`);
}

const scriptNamesPath = `${output}/scriptShortNames.json`;
const scriptNamesBytes = await format(
  JSON.stringify({
    source: {
      icuVersion: "78.3",
      dataSha256: dataHash,
      scope: "Complete UScriptCode short-name data projection from original property alias service",
    },
    value: resources.scriptShortNames,
  }),
  { ...(await resolveConfig(scriptNamesPath)), parser: "json" },
);
if (process.argv.includes("--check")) {
  if (readFileSync(scriptNamesPath, "utf8") !== scriptNamesBytes)
    throw Error(`Pinned script names differ: ${scriptNamesPath}`);
} else writeFileSync(scriptNamesPath, scriptNamesBytes);
