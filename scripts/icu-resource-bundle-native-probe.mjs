/** @fileoverview Native differential witness for original ICU78.3 public bundle ownership, aliases, nested/root fallback, locales, path buffers, copy and scalar/iterator contracts. Compiles the entire unchanged uresbund.cpp. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { ResourceDataValue } from "../apps/office/src/external/icu/source/common/uresdata.ts";
import * as R from "../apps/office/src/external/icu/source/common/uresbund.ts";
import { init_resb_result } from "../apps/office/src/external/icu/source/common/uresbund.alias.ts";
import { ures_appendResPath } from "../apps/office/src/external/icu/source/common/uresbund.lifecycle.ts";
import {
  resPointer,
  res_findResource,
} from "../apps/office/src/external/icu/source/common/uresdata.path.ts";
import { ures_flushCache } from "../apps/office/src/external/icu/source/common/uresbund.entries.ts";
import { resCString } from "../apps/office/src/external/icu/source/common/uresdata.path.ts";
import { locale_set_default_internal } from "../apps/office/src/external/icu/source/common/locid.default.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/resource-bundle-witness.cc`,
  String.raw`
#include "${source}/common/uresbund.cpp"
#include <iostream>
#include <map>
#include <string>
std::string unhex(std::string s){if(s=="-")return {};std::string out;for(size_t i=0;i<s.size();i+=2)out+=char(std::stoi(s.substr(i,2),nullptr,16));return out;}
std::string hex(const char*s,int n){if(!s)return "~";if(n==0)return "-";std::string out;const char*t="0123456789abcdef";for(int i=0;i<n;++i){uint8_t c=s[i];out+=t[c>>4];out+=t[c&15];}return out;}
std::string cHex(const char*s){return hex(s,s?std::strlen(s):0);}
void mix(uint32_t&h,uint32_t v){for(int i=0;i<4;++i){h^=(v>>(8*i))&255;h*=16777619;}}
std::map<std::pair<const void*,Resource>,uint32_t> hashes;
uint32_t hash(ResourceData&data,Resource r){if(r==RES_BOGUS)return 0;auto id=std::make_pair(static_cast<const void*>(data.pRoot),r);auto found=hashes.find(id);if(found!=hashes.end())return found->second;ResourceDataValue value;value.setData(data);value.setResource(r,ResourceTracer());UErrorCode e=U_ZERO_ERROR;int type=value.getType();uint32_t h=2166136261;mix(h,type);if(type==URES_STRING||type==URES_ALIAS){int32_t n;auto*p=type==URES_ALIAS?value.getAliasString(n,e):value.getString(n,e);mix(h,n);for(int i=0;i<n;++i)mix(h,p[i]);}else if(type==URES_INT)mix(h,value.getInt(e));else if(type==URES_BINARY){int32_t n;auto*p=value.getBinary(n,e);mix(h,n);for(int i=0;i<n;++i)mix(h,p[i]);}else if(type==URES_INT_VECTOR){int32_t n;auto*p=value.getIntVector(n,e);mix(h,n);for(int i=0;i<n;++i)mix(h,p[i]);}else if(type==URES_ARRAY){auto a=value.getArray(e);mix(h,a.getSize());for(int i=0;i<a.getSize();++i){a.getValue(i,value);mix(h,hash(data,value.getResource()));}}else{auto t=value.getTable(e);mix(h,t.getSize());for(int i=0;i<t.getSize();++i){const char*k=nullptr;t.getKeyAndValue(i,k,value);mix(h,std::strlen(k));for(const char*p=k;*p;++p)mix(h,uint8_t(*p));mix(h,hash(data,value.getResource()));}}if(U_FAILURE(e))std::exit(3);return hashes[id]=h;}

void line(UResourceDataEntry*e){if(!e){std::cout<<"~";return;}bool first=true;for(;e;e=e->fParent){if(!first)std::cout<<',';first=false;std::cout<<cHex(e->fName)<<':'<<e->fCountExisting<<':'<<(e->fPool?int64_t(e->fPool->fCountExisting):-1);}}
void snap(UResourceBundle*b){if(!b){std::cout<<"~";return;}std::cout<<cHex(b->fKey)<<' '<<cHex(b->fData?b->fData->fName:nullptr)<<' '<<cHex(b->fValidLocaleDataEntry?b->fValidLocaleDataEntry->fName:nullptr)<<' '<<int(b->fHasFallback)<<' '<<int(b->fIsTopLevel)<<' '<<b->fIndex<<' '<<b->fSize<<' '<<res_getPublicType(b->fRes)<<' '<<cHex(b->fResPath)<<' '<<b->fResPathLen<<' '<<int(b->fResPath==b->fResBuf)<<' '<<hex(b->fResBuf,64)<<' '<<hex(b->fResPath,b->fResPath?b->fResPathLen+1:0)<<' '<<int(ures_isStackObject(b))<<' '<<(b->fData?hash(b->fData->fData,b->fRes):0)<<' ';line(b->fData);}
std::string uhex(const char16_t*s,int32_t len){if(!s)return "~";std::string out;const char*t="0123456789abcdef";for(int32_t i=0;i<len;++i){uint16_t c=s[i];for(int j=12;j>=0;j-=4)out+=t[(c>>j)&15];}return out.empty()?"-":out;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode e=U_ZERO_ERROR;uloc_setDefault("en_US",&e);int mode,initial,fillMode,prime;std::string n,b,q;char op;while(std::cin>>mode>>prime>>n>>b>>op>>q>>initial>>fillMode){bool nullName=n=="~";if(!nullName)n=unhex(n);b=unhex(b);q=unhex(q);if(prime){e=U_ZERO_ERROR;ures_close(ures_open(nullptr,n.c_str(),&e));}e=op=='O'?UErrorCode(initial):U_ZERO_ERROR;UResourceBundle opened;ures_initStackObject(&opened);UResourceBundle*root;if(mode==3){UErrorCode x=U_ZERO_ERROR;auto*old=ures_openDirect(nullptr,"root",&x);ures_copyResb(&opened,old,&x);ures_close(old);root=&opened;ures_openFillIn(root,nullptr,nullName?nullptr:n.c_str(),&e);}else root=mode==2?ures_openDirect(nullptr,nullName?nullptr:n.c_str(),&e):mode==1?ures_openNoDefault(nullptr,nullName?nullptr:n.c_str(),&e):ures_open(nullptr,nullName?nullptr:n.c_str(),&e);std::cout<<int(e)<<' ';UResourceBundle*base=root;if(U_SUCCESS(e)&&!b.empty())base=ures_getByKeyWithFallback(root,b.c_str(),nullptr,&e);std::cout<<int(e)<<' ';UResourceBundle fill;ures_initStackObject(&fill);UResourceBundle*dest=fillMode==0?nullptr:fillMode==2?base:&fill;if(fillMode==3&&root){UErrorCode x=U_ZERO_ERROR;ures_copyResb(&fill,root,&x);}UResourceBundle*result=dest;std::string scalar="~";int32_t length=77;if(U_SUCCESS(e)){e=UErrorCode(initial);if(op=='V'){ResourceDataValue value;UErrorCode local=U_ZERO_ERROR;ures_getValueWithFallback(base,"",dest,value,local);ures_getValueWithFallback(base,q.c_str(),dest,value,e);scalar=std::to_string(value.getType())+":"+std::to_string(hash(const_cast<ResourceData&>(value.getData()),value.getResource()))+":"+cHex(value.getValidLocaleDataEntry()?value.getValidLocaleDataEntry()->fName:nullptr)+":"+std::to_string(&value.getData()==&base->getResData())+":"+std::to_string(dest&&dest->fData&&&value.getData()==&dest->getResData());}else if(op=='D'){auto sep=q.find('/');int depth=std::stoi(q.substr(0,sep));auto path=q.substr(sep+1);char*p=path.data();const char*key=nullptr;Resource raw=res_findResource(&base->fData->fData,base->fRes,&p,&key);result=init_resb_result(base->fData,raw,key,-1,base->fValidLocaleDataEntry,base->fResPath,depth,dest,&e);}else if(op=='A'){result=ures_copyResb(dest,base,&e);if(U_SUCCESS(e)){auto sep=q.find('/');auto text=q.substr(sep+1);ures_appendResPath(result,text.c_str(),std::stoi(q.substr(0,sep)),&e);}}else if(op=='F')result=ures_getByKeyWithFallback(base,q.c_str(),dest,&e);else if(op=='R')result=ures_getByKey(base,q.c_str(),dest,&e);else if(op=='I')result=ures_getByIndex(base,std::stoi(q),dest,&e);else if(op=='C')result=ures_copyResb(dest,base,&e);else if(op=='N')result=ures_getNextResource(base,dest,&e);else if(op=='S'){auto*s=ures_getStringByKey(base,q.c_str(),&length,&e);scalar=uhex(s,s?length:0);}else if(op=='G'){auto*s=ures_getStringByKeyWithFallback(base,q.c_str(),&length,&e);scalar=uhex(s,s?length:0);}else if(op=='s'){auto*s=ures_getStringByIndex(base,std::stoi(q),&length,&e);scalar=uhex(s,s?length:0);}else if(op=='L')scalar=cHex(ures_getLocaleByType(base,ULocDataLocaleType(std::stoi(q)),&e));}std::cout<<int(e)<<' '<<length<<' '<<scalar<<' ';snap(result);std::cout<<" | ";snap(base);std::cout<<" | ";line(root?root->fData:nullptr);std::cout<<'\n';if(result&&result!=base&&result!=root&&result!=&fill)ures_close(result);if(base!=root)ures_close(base);ures_close(root);ures_close(&fill);ures_flushCache();}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/resource-bundle-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/resource-bundle-witness`,
  ],
  { stdio: "inherit" },
);
const hashes = new WeakMap();
/** Full immutable content hash, memoized by raw node identity. @param r - Node/bogus. @returns Native uint32 digest. */
function hash(r) {
  if (r === null) return 0;
  if (hashes.has(r)) return hashes.get(r);
  let h = 2166136261;
  /** Adds one canonical uint32 in little-endian order. @param v - Value. @returns Nothing. */
  function mix(v) {
    for (let i = 0; i < 4; ++i) {
      h ^= (v >>> (8 * i)) & 255;
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  mix(r.type);
  if (r.type === 0 || r.type === 3) {
    mix(r.value.length);
    for (let i = 0; i < r.value.length; ++i) mix(r.value.charCodeAt(i));
  } else if (r.type === 7) mix(r.value);
  else if (r.type === 1 || r.type === 14) {
    mix(r.value.length);
    for (const n of r.value) mix(n);
  } else if (r.type === 8) {
    mix(r.value.length);
    for (const child of r.value) mix(hash(child));
  } else {
    mix(r.keys.length);
    for (const k of r.keys) {
      mix(k.length);
      for (let i = 0; i < k.length; ++i) mix(k.charCodeAt(i));
      mix(hash(r.value[k]));
    }
  }
  hashes.set(r, h);
  return h;
}
/** Narrow transport retains counted NUL. @param s - Storage. @returns Hex. */
function hex(s) {
  return Buffer.from(s, "latin1").toString("hex") || "-";
}
/** C key transport. @param s - Key/null. @returns Hex. */
function cHex(s) {
  return s === null ? "~" : hex(resCString(s));
}
/** Native complete retained entry line, including pool references. @param e - Entry/null. @returns Snapshot. */
function line(e) {
  if (e === null) return "~";
  const items = [];
  for (; e !== null; e = e.fParent)
    items.push([hex(e.fName), e.fCountExisting, e.fPool?.fCountExisting ?? -1].join(":"));
  return items.join(",");
}
/** Exact initialized logical bundle fields and source-valid path bytes. @param b - Bundle/null. @returns Snapshot. */
function snap(b) {
  if (b === null) return "~";
  return [
    cHex(b.fKey),
    cHex(b.fData?.fName ?? null),
    cHex(b.fValidLocaleDataEntry?.fName ?? null),
    Number(b.fHasFallback),
    Number(b.fIsTopLevel),
    b.fIndex,
    b.fSize,
    R.ures_getType(b),
    b.fResPath === null ? "~" : cHex(resCString(b.fResPath)),
    b.fResPathLen,
    Number(b.fResPath === b.fResBuf),
    Buffer.from(b.fResBuf).toString("hex"),
    b.fResPath === null
      ? "~"
      : Buffer.from(b.fResPath.subarray(0, b.fResPathLen + 1)).toString("hex"),
    Number(b.isStackObject),
    b.fData === null ? 0 : hash(b.fRes),
    line(b.fData),
  ].join(" ");
}
/** Source UTF16 buffer transport, including counted NUL. @param s - String/null. @returns Hex. */
function uhex(s) {
  if (s === null) return "~";
  let out = "";
  for (let i = 0; i < s.length; ++i) out += s.charCodeAt(i).toString(16).padStart(4, "0");
  return out || "-";
}
locale_set_default_internal("en_US", [0]);
const graph = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/in/icudt78l.resources.json", "utf8"),
  ),
  input = [],
  expected = [],
  counts = {};
/** Appends a complete public API query, observations and balanced source close boundaries. @param mode - Open mode. @param name - Locale/file. @param basePath - Nested source. @param op - API. @param q - Argument. @param initial - Status. @param fillMode - Result reuse. @returns Nothing. */
function add(mode, name, basePath, op, q, initial = 0, fillMode = 0) {
  const raw = graph.bundles[name],
    rootNode = raw === undefined ? null : graph.nodes[raw[0]],
    prime = Number(
      mode === 2 &&
        rootNode?.[0] === 2 &&
        rootNode[1].some(
          /** Identifies the raw source whole-bundle alias metadata for finite priming. @param i - Key index. @returns Alias metadata. */ (
            i,
          ) => graph.strings[i] === "%%ALIAS",
        ),
    );
  input.push(
    [
      mode,
      prime,
      name === null ? "~" : hex(name),
      hex(basePath),
      op,
      hex(q),
      initial,
      fillMode,
    ].join(" "),
  );
  counts[op] = (counts[op] ?? 0) + 1;
  if (prime) R.ures_close(R.ures_open(null, name, [0]));
  const status = [op === "O" ? initial : 0],
    root =
      mode === 3
        ? openFill(name, status)
        : mode === 2
          ? R.ures_openDirect(null, name, status)
          : mode === 1
            ? R.ures_openNoDefault(null, name, status)
            : R.ures_open(null, name, status),
    opening = status[0];
  let base = root;
  if (status[0] <= 0 && basePath !== "")
    base = R.ures_getByKeyWithFallback(root, basePath, null, status);
  const baseStatus = status[0],
    fill = new R.UResourceBundle(),
    dest = fillMode === 0 ? null : fillMode === 2 ? base : fill;
  if (fillMode === 3 && root !== null) R.ures_copyResb(fill, root, [0]);
  let result = dest,
    scalar = "~";
  const length = [77];
  if (status[0] <= 0) {
    status[0] = initial;
    if (op === "V") {
      const value = new ResourceDataValue();
      R.ures_getValueWithFallback(base, "", dest, value, [0]);
      R.ures_getValueWithFallback(base, q, dest, value, status);
      scalar = [
        value.getType(),
        hash(value.getResource()),
        cHex(value.getValidLocaleDataEntry()?.fName ?? null),
        Number(value.getData() === base.fData?.fData),
        Number(dest !== null && dest.fData !== null && value.getData() === dest.fData.fData),
      ].join(":");
    } else if (op === "D") {
      const sep = q.indexOf("/"),
        key = [null],
        path = [resPointer(q.slice(sep + 1))],
        raw = res_findResource(base.fRes, path, key);
      result = init_resb_result(
        base.fData,
        raw,
        key[0],
        -1,
        base.fValidLocaleDataEntry,
        base.fResPath,
        Number(q.slice(0, sep)),
        dest,
        status,
      );
    } else if (op === "A") {
      result = R.ures_copyResb(dest, base, status);
      if (status[0] <= 0) {
        const sep = q.indexOf("/");
        ures_appendResPath(result, q.slice(sep + 1), Number(q.slice(0, sep)), status);
      }
    } else if (op === "F") result = R.ures_getByKeyWithFallback(base, q, dest, status);
    else if (op === "R") result = R.ures_getByKey(base, q, dest, status);
    else if (op === "I") result = R.ures_getByIndex(base, Number(q), dest, status);
    else if (op === "C") result = R.ures_copyResb(dest, base, status);
    else if (op === "N") result = R.ures_getNextResource(base, dest, status);
    else if (op === "S") scalar = uhex(R.ures_getStringByKey(base, q, length, status));
    else if (op === "G") scalar = uhex(R.ures_getStringByKeyWithFallback(base, q, length, status));
    else if (op === "s") scalar = uhex(R.ures_getStringByIndex(base, Number(q), length, status));
    else if (op === "L") scalar = cHex(R.ures_getLocaleByType(base, Number(q), status));
  }
  expected.push(
    [
      opening,
      baseStatus,
      status[0],
      length[0],
      scalar,
      snap(result),
      "|",
      snap(base),
      "|",
      line(root?.fData ?? null),
    ].join(" "),
  );
  if (result !== null && result !== base && result !== root && result !== fill)
    R.ures_close(result);
  if (base !== root) R.ures_close(base);
  R.ures_close(root);
  R.ures_close(fill);
  ures_flushCache();
}
/** Original fill-in open reuses an already-owned stack handle. @param name - Locale/default. @param status - Status. @returns Stack result. */
function openFill(name, status) {
  const root = new R.UResourceBundle(),
    old = R.ures_openDirect(null, "root", [0]);
  R.ures_copyResb(root, old, [0]);
  R.ures_close(old);
  R.ures_openFillIn(root, null, name, status);
  return root;
}
for (const name of [
  "root",
  "en",
  "en_GB",
  "en_US",
  "ru",
  "ru_RU",
  "de",
  "fr",
  "ar",
  "he",
  "zh_TW",
  "ja",
  "sr_Latn_RS",
  "zz",
  "e",
  "keyTypeData",
  "langInfo",
  "supplementalData",
  "zoneinfo64",
  "no_NO",
  "sh",
])
  for (const mode of [0, 1, 2]) {
    for (const [op, q] of [
      ["F", "calendar/gregorian/monthNames/format/wide"],
      ["F", "calendar/gregorian/AmPmMarkers/0"],
      ["F", "calendar/gregorian/AmPmMarkers"],
      ["F", "calendar/islamic-civil/monthNames/format/wide"],
      ["F", "missing/path"],
      ["R", "calendar"],
      ["R", "calendar\0suffix"],
      ["S", "Version"],
      ["S", "calendar"],
      ["G", "calendar/gregorian/AmPmMarkers/0"],
      ["G", "calendar/gregorian/AmPmMarkers"],
      ["s", "0"],
      ["I", "0"],
      ["I", "-1"],
      ["I", "2147483647"],
      ["C", ""],
      ["N", ""],
      ["L", "0"],
      ["L", "1"],
      ["L", "2"],
    ])
      for (const fill of [0, 1, 2, 3]) add(mode, name, "", op, q, 0, fill);
    for (const base of [
      "calendar",
      "calendar/gregorian",
      "calendar/gregorian/AmPmMarkersAbbr",
      "calendar/gregorian/monthNames",
    ])
      for (const [op, q] of [
        ["F", "AmPmMarkers"],
        ["F", "monthNames/format/wide"],
        ["F", "format/abbreviated"],
        ["R", "AmPmMarkers"],
        ["I", "0"],
        ["s", "0"],
        ["C", ""],
        ["N", ""],
        ["L", "0"],
        ["L", "1"],
      ])
        for (const fill of [0, 1, 2]) add(mode, name, base, op, q, 0, fill);
  }
for (const name of [
  "en-US",
  "en_US@calendar=gregorian",
  "en_US.UTF-8",
  "EN_us",
  "zz_ZZ",
  "",
  "en-u-ca-gregory",
])
  for (const mode of [0, 1, 2])
    for (const op of ["R", "F", "G"])
      for (const initial of [-128, 1, 17])
        for (const fill of [0, 1, 2, 3]) add(mode, name, "", op, "calendar", initial, fill);
for (const name of ["keyTypeData", "timezoneTypes"])
  for (const base of ["typeMap", "typeAlias", "bcpTypeAlias", "ianaMap"])
    for (const op of ["R", "F", "S", "G"])
      for (const fill of [0, 1, 2]) add(2, name, base, op, "timezone", 0, fill);
for (const name of [null, "en_US", "root", "en-u-ca-gregory"])
  for (const mode of [0, 1, 2, 3])
    for (const initial of [0, -128, 1, 17])
      for (const fill of [0, 1, 3]) add(mode, name, "", "O", "", initial, fill);
for (const name of ["root", "en", "ru", "zh", "keyTypeData"]) {
  const paths = [];
  /** Traverses actual raw source paths, retaining every alias occurrence and long path. @param id - Node index. @param path - Raw path. @returns Nothing. */
  function visit(id, path) {
    const node = graph.nodes[id];
    if (node[0] === 3) for (const fill of [0, 1, 2]) add(2, name, "", "F", path, 0, fill);
    if (path.length >= 63) paths.push(path);
    if (node[0] === 2)
      for (let i = 0; i < node[1].length; ++i) {
        const key = graph.strings[node[1][i]];
        if (key !== "" && !key.includes("/")) visit(node[2][i], path ? path + "/" + key : key);
      }
    else if (node[0] === 8)
      for (let i = 0; i < node[1].length; ++i) visit(node[1][i], path + "/" + i);
  }
  visit(graph.bundles[name][0], "");
  for (const path of paths.slice(0, 12))
    for (const fill of [0, 1, 2, 3]) {
      add(2, name, "", "F", path, 0, fill);
      add(2, name, path, "C", "", 0, fill);
    }
}
for (const depth of [-1, 0, 254, 255, 256, 257])
  for (const initial of [0, -128, 1])
    for (const fill of [0, 1, 2, 3])
      add(2, "root", "", "D", depth + "/calendar/gregorian/AmPmMarkers", initial, fill);
for (const base of ["", "calendar/gregorian"])
  for (const n of [0, 1, 40, 43, 44, 62, 63, 64, 65, 128])
    for (const fill of [0, 1, 2, 3]) add(2, "root", base, "A", n + "/" + "x".repeat(n), 0, fill);
for (const name of Object.keys(graph.bundles))
  for (const op of ["O", "L"]) add(2, name, "", op, op === "L" ? "1" : "", 0, 0);
for (const name of ["root", "en_GB", "keyTypeData", "langInfo"])
  for (const base of ["", "calendar", "calendar/gregorian"])
    for (const key of [
      "",
      "calendar/gregorian/AmPmMarkers",
      "monthNames/format/wide",
      "typeMap/timezone",
      "likely",
      "missing",
      "\0ignored",
    ])
      for (const initial of [0, -128, 1])
        for (const fill of [1, 2, 3]) add(2, name, base, "V", key, initial, fill);
const output = execFileSync(`${build}/resource-bundle-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (output.length !== expected.length) throw Error(`Count ${output.length} != ${expected.length}`);
for (let i = 0; i < output.length; ++i)
  if (output[i] !== expected[i])
    throw Error(`Mismatch ${i} ${input[i]}\nnative ${output[i]}\nlocal ${expected[i]}`);
console.log(
  JSON.stringify({
    cases: input.length,
    counts,
    result: "all match unchanged ICU78.3 source",
    scope:
      "Public open/fallback/alias/scalar/copy/iterator/locale APIs, complete content digests, path bytes, fill reuse and retained references",
  }),
);
