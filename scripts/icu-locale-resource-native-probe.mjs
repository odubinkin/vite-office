/** @fileoverview Differential evidence for original ICU78.3 ResourceDataValue/table/array views on actual langInfo and UniqueCharStrings over all UTF16 units. Invalid raw resources/pointers, native allocator/lifetime/ABI and debug assertions remain uncertified. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { ResourceDataValue } from "../apps/office/src/external/icu/source/common/uresdata.ts";
import { UniqueCharStrings } from "../apps/office/src/external/icu/source/common/uniquecharstr.ts";
import {
  ures_openDirect,
  ures_getByKey,
  ures_getByIndex,
} from "../apps/office/src/external/icu/source/common/uresbund.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/locale-resource-witness.cc`,
  String.raw`
#include "uresimp.h"
#include "uresdata.h"
#include "resource.h"
#include "uniquecharstr.h"
#include "unicode/putil.h"
#include <iostream>
#include <string>
#include <vector>
using namespace icu;
std::string narrow(const char*s){if(!s)return "~";std::string r;const char*t="0123456789abcdef";while(*s){uint8_t c=*s++;r+=t[c>>4];r+=t[c&15];}return r.empty()?"-":r;}
void string(const char16_t*p,int32_t len){if(!p){std::cout<<"~";return;}if(len==0){std::cout<<'-';return;}const char*t="0123456789abcdef";for(int i=0;i<len;++i){unsigned c=p[i];std::cout<<t[(c>>12)&15]<<t[(c>>8)&15]<<t[(c>>4)&15]<<t[c&15];}}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode init=U_ZERO_ERROR;auto*root=ures_openDirect(nullptr,"langInfo",&init);if(U_FAILURE(init))return 2;char op;while(std::cin>>op){if(op=='P'){int cp;std::cin>>cp;UErrorCode e=U_ZERO_ERROR;UniqueCharStrings pool(e);char16_t text[]={char16_t(cp),0};int i=pool.add(text,e),first=int(e);int d=pool.addByValue(UnicodeString(text),e);std::cout<<i<<' '<<first<<' '<<d<<' '<<int(e)<<' ';e=U_ZERO_ERROR;pool.freeze();std::cout<<narrow(pool.get(i))<<' ';int frozen=pool.add(text,e);std::cout<<frozen<<' '<<int(e)<<' ';auto*storage=pool.orphanCharStrings();std::cout<<storage->length();delete storage;}else{std::string path;int initial;std::cin>>path>>initial;UErrorCode e=U_ZERO_ERROR;auto*b=ures_copyResb(nullptr,root,&e);if(path!="-"){size_t start=0;for(;;){auto end=path.find('/',start);auto part=path.substr(start,end==std::string::npos?std::string::npos:end-start);if(ures_getType(b)==URES_ARRAY)ures_getByIndex(b,std::stoi(part),b,&e);else ures_getByKey(b,part.c_str(),b,&e);if(end==std::string::npos)break;start=end+1;}}if(U_FAILURE(e))return 3;ResourceDataValue value;value.setData(b->getResData());value.setResource(b->fRes,ResourceTracer());std::cout<<int(value.getType());for(int method=0;method<5;++method){e=UErrorCode(initial);int32_t len=77;if(method==0){auto*p=value.getString(len,e);std::cout<<' '<<int(e)<<' '<<len<<' ';string(p,p?len:0);}else if(method==1){auto*p=value.getBinary(len,e);std::cout<<' '<<int(e)<<' '<<len<<' ';if(p){if(len==0)std::cout<<'-';for(int i=0;i<len;++i){if(i)std::cout<<',';std::cout<<int(p[i]);}}else std::cout<<'~';}else if(method==2){auto*p=value.getIntVector(len,e);std::cout<<' '<<int(e)<<' '<<len<<' ';if(p){if(len==0)std::cout<<'-';for(int i=0;i<len;++i){if(i)std::cout<<',';std::cout<<p[i];}}else std::cout<<'~';}else if(method==3){auto a=value.getArray(e);std::cout<<' '<<int(e)<<' '<<a.getSize();for(int i:std::vector<int>{-1,0,a.getSize()-1,a.getSize()}){ResourceDataValue out;out.setData(b->getResData());out.setResource(b->fRes,ResourceTracer());std::cout<<' '<<int(a.getValue(i,out))<<' '<<int(out.getType());}}else{auto t=value.getTable(e);std::cout<<' '<<int(e)<<' '<<t.getSize();for(int i:std::vector<int>{-1,0,t.getSize()-1,t.getSize()}){const char*key="sentinel";ResourceDataValue out;out.setData(b->getResData());out.setResource(b->fRes,ResourceTracer());bool found=t.getKeyAndValue(i,key,out);std::cout<<' '<<int(found)<<' '<<narrow(key)<<' '<<int(out.getType());}ResourceDataValue out;out.setData(b->getResData());out.setResource(b->fRes,ResourceTracer());std::cout<<' '<<int(t.findValue("absent",out))<<' '<<int(out.getType());}}ures_close(b);}std::cout<<'\n';}ures_close(root);}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/locale-resource-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/locale-resource-witness`,
  ],
  { stdio: "inherit" },
);
/** Narrow C prefix transport. @param text - Storage/null. @returns Hex. */
function narrow(text) {
  return text === null ? "~" : Buffer.from(text.split("\0")[0], "latin1").toString("hex") || "-";
}
/** Full counted UTF16 transport. @param text - Text/null. @returns Units. */
function wide(text) {
  if (text === null) return "~";
  let out = "";
  for (let i = 0; i < text.length; ++i) out += text.charCodeAt(i).toString(16).padStart(4, "0");
  return out || "-";
}
const input = [],
  expected = [],
  data = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/misc/langInfo.json", "utf8"),
  ).resource,
  paths = [];
/** Collects all native-exported paths rather than deriving coverage from the local reader. @param resource - Decoded node. @param path - Direct path. @returns Nothing. */
function walk(resource, path) {
  paths.push(path);
  if (resource.type === 2)
    for (const key of resource.keys) walk(resource.value[key], [...path, key]);
  else if (resource.type === 8)
    for (let i = 0; i < resource.value.length; ++i) walk(resource.value[i], [...path, String(i)]);
}
walk(data, []);
for (const path of paths)
  for (const initial of [0, -128, 1]) {
    const s = [0];
    let b = ures_openDirect(null, "langInfo", s);
    for (const part of path)
      b =
        b.resource.type === 8
          ? ures_getByIndex(b, Number(part), b, s)
          : ures_getByKey(b, part, b, s);
    if (s[0] !== 0) throw Error(`Path ${path} ${s}`);
    const value = new ResourceDataValue();
    value.setResource(b.resource);
    const row = [value.getType()];
    for (let method = 0; method < 5; ++method) {
      const status = [initial],
        length = [77];
      if (method === 0) {
        const str = value.getString(length, status);
        row.push(status[0], length[0], wide(str));
      } else if (method === 1 || method === 2) {
        const p =
          method === 1 ? value.getBinary(length, status) : value.getIntVector(length, status);
        row.push(status[0], length[0], p === null ? "~" : p.join(",") || "-");
      } else if (method === 3) {
        const a = value.getArray(status);
        row.push(status[0], a.getSize());
        for (const i of [-1, 0, a.getSize() - 1, a.getSize()]) {
          const out = new ResourceDataValue();
          out.setResource(b.resource);
          row.push(Number(a.getValue(i, out)), out.getType());
        }
      } else {
        const t = value.getTable(status);
        row.push(status[0], t.getSize());
        for (const i of [-1, 0, t.getSize() - 1, t.getSize()]) {
          const out = new ResourceDataValue(),
            key = ["sentinel"];
          out.setResource(b.resource);
          row.push(Number(t.getKeyAndValue(i, key, out)), narrow(key[0]), out.getType());
        }
        const out = new ResourceDataValue();
        out.setResource(b.resource);
        row.push(Number(t.findValue("absent", out)), out.getType());
      }
    }
    input.push(`V ${path.join("/") || "-"} ${initial}`);
    expected.push(row.join(" "));
  }
for (let cp = 0; cp < 65536; ++cp) {
  const s = [0],
    pool = new UniqueCharStrings(s),
    text = String.fromCharCode(cp),
    i = pool.add(text, s),
    first = s[0],
    d = pool.addByValue(text, s),
    row = [i, first, d, s[0]];
  s[0] = 0;
  pool.freeze();
  row.push(narrow(pool.get(i)));
  const frozen = pool.add(text, s);
  row.push(frozen, s[0], pool.orphanCharStrings().length - 1);
  input.push(`P ${cp}`);
  expected.push(row.join(" "));
}
const native = execFileSync(`${build}/locale-resource-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (native.length !== expected.length) throw Error(`Rows ${native.length}/${expected.length}`);
for (let i = 0; i < native.length; ++i)
  if (native[i].trim() !== expected[i])
    throw Error(`Row ${i} ${input[i]} native ${native[i]} port ${expected[i]}`);
const report = {
  result: "pass",
  cases: expected.length,
  resourceNodes: paths.length,
  utf16Units: 65536,
  sources: Object.fromEntries(
    [
      "common/resource.h",
      "common/uresdata.cpp",
      "common/uresdata.h",
      "common/uniquecharstr.h",
      "common/charstr.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Records pinned source/data. @param path - Source. @returns Pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Actual original ResourceDataValue scalar/view methods on every direct langInfo node with incoming success/warning/failure, all valid scalar contents, failed view bounds/key outputs and UniqueCharStrings add/duplicate/invariant errors/freeze/get/orphan across all65536 UTF16 units. Physical raw resources/tracers/allocator/invalid pointer/ABI and debug assertions remain uncertified.",
};
writeFileSync(`${build}/locale-resource-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
