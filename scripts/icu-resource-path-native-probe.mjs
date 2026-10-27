/** @fileoverview Compares raw resource/path primitives and original horizontal-inheritance helpers with the entire unchanged ICU78.3 uresbund.cpp translation unit. No native lookup, fallback or path algorithm is reconstructed in the witness. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  ResourceData,
  res_load,
} from "../apps/office/src/external/icu/source/common/uresdata.package.ts";
import {
  resPointer,
  resCString,
  res_findResource,
  res_getArrayItem,
  res_getTableItemByIndex,
  res_getTableItemByKey,
} from "../apps/office/src/external/icu/source/common/uresdata.path.ts";
import {
  getTableItemByKeyPath,
  createPath,
} from "../apps/office/src/external/icu/source/common/uresbund.path.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/resource-path-witness.cc`,
  String.raw`
#include "${source}/common/uresbund.cpp"
#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
std::string unhex(std::string s){if(s=="-")return {};std::string out;for(size_t i=0;i<s.size();i+=2)out+=char(std::stoi(s.substr(i,2),nullptr,16));return out;}
std::string hex(const char*s,int n){if(!s)return "~";if(n==0)return "-";std::string out;const char*t="0123456789abcdef";for(int i=0;i<n;++i){uint8_t c=s[i];out+=t[c>>4];out+=t[c&15];}return out;}
std::string cHex(const char*s){return hex(s,s?std::strlen(s):0);}
void mix(uint32_t&h,uint32_t v){for(int i=0;i<4;++i){h^=(v>>(8*i))&255;h*=16777619;}}
std::map<std::pair<const void*,Resource>,uint32_t> hashes;
uint32_t hash(ResourceData&data,Resource r){if(r==RES_BOGUS)return 0;auto id=std::make_pair(static_cast<const void*>(data.pRoot),r);auto found=hashes.find(id);if(found!=hashes.end())return found->second;ResourceDataValue value;value.setData(data);value.setResource(r,ResourceTracer());UErrorCode e=U_ZERO_ERROR;int type=value.getType();uint32_t h=2166136261;mix(h,type);if(type==URES_STRING||type==URES_ALIAS){int32_t n;auto*p=type==URES_ALIAS?value.getAliasString(n,e):value.getString(n,e);mix(h,n);for(int i=0;i<n;++i)mix(h,p[i]);}else if(type==URES_INT)mix(h,value.getInt(e));else if(type==URES_BINARY){int32_t n;auto*p=value.getBinary(n,e);mix(h,n);for(int i=0;i<n;++i)mix(h,p[i]);}else if(type==URES_INT_VECTOR){int32_t n;auto*p=value.getIntVector(n,e);mix(h,n);for(int i=0;i<n;++i)mix(h,p[i]);}else if(type==URES_ARRAY){auto a=value.getArray(e);mix(h,a.getSize());for(int i=0;i<a.getSize();++i){a.getValue(i,value);mix(h,hash(data,value.getResource()));}}else{auto t=value.getTable(e);mix(h,t.getSize());for(int i=0;i<t.getSize();++i){const char*k=nullptr;t.getKeyAndValue(i,k,value);mix(h,std::strlen(k));for(const char*p=k;*p;++p)mix(h,uint8_t(*p));mix(h,hash(data,value.getResource()));}}if(U_FAILURE(e))std::exit(3);return hashes[id]=h;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);ResourceData pool{};UErrorCode e=U_ZERO_ERROR;res_load(&pool,nullptr,"pool",&e);std::map<std::string,std::unique_ptr<ResourceData>> data;char op;while(std::cin>>op){if(op=='P'){std::string a,b,c;int na,nb,initial;std::cin>>a>>na>>b>>nb>>c>>initial;a=unhex(a);b=unhex(b);c=unhex(c);UErrorCode status=UErrorCode(initial);CharString path("old",status);createPath(a.data(),na,b.data(),nb,c.c_str(),path,&status);std::cout<<int(status)<<' '<<hex(path.data(),path.length())<<'\n';continue;}
std::string name,base,q;std::cin>>name>>base>>q;name=unhex(name);base=unhex(base);q=unhex(q);auto&ptr=data[name];if(!ptr){ptr=std::make_unique<ResourceData>();e=U_ZERO_ERROR;res_load(ptr.get(),nullptr,name.c_str(),&e);if(U_FAILURE(e))return 4;if(ptr->usesPoolBundle){const int32_t*indexes=pool.pRoot+1;ptr->poolBundleKeys=reinterpret_cast<const char*>(indexes+(indexes[URES_INDEX_LENGTH]&255));ptr->poolBundleStrings=pool.p16BitUnits;}}
auto&d=*ptr;char*p=base.data();const char*key="incoming";Resource r=res_findResource(&d,d.rootRes,&p,&key);key="incoming";if(op=='F'){q+='\0';p=q.data();r=res_findResource(&d,r,&p,&key);std::cout<<hash(d,r)<<' '<<cHex(key)<<' '<<(p-q.data())<<' '<<hex(q.data(),q.size());}else if(op=='K')std::cout<<hash(d,getTableItemByKeyPath(&d,r,q.c_str()));else if(op=='T'){int32_t index=0;key=q.c_str();r=res_getTableItemByKey(&d,r,&index,&key);std::cout<<hash(d,r)<<' '<<cHex(key);}else{int index=std::stoi(q);if(op=='I')r=res_getTableItemByIndex(&d,r,index,&key);else r=res_getArrayItem(&d,r,index);std::cout<<hash(d,r)<<' '<<cHex(key);}std::cout<<'\n';}for(auto&it:data)res_unload(it.second.get());res_unload(&pool);}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/resource-path-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/resource-path-witness`,
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
const input = [],
  expected = [],
  counts = {};
/** Adds a source query and independent local observation. @param op - Operation. @param name - File. @param base - Raw starting path. @param q - Argument. @param r - Local raw starting node. @returns Nothing. */
function add(op, name, base, q, r) {
  input.push([op, hex(name), hex(base), hex(q)].join(" "));
  counts[op] = (counts[op] ?? 0) + 1;
  const key = ["incoming"];
  let result;
  if (op === "F") {
    const p = [resPointer(q)];
    result = res_findResource(r, p, key);
    expected.push(
      [hash(result), cHex(key[0]), p[0].offset, Buffer.from(p[0].bytes).toString("hex")].join(" "),
    );
  } else if (op === "K") expected.push(String(hash(getTableItemByKeyPath(r, q))));
  else if (op === "T") {
    key[0] = q;
    result = res_getTableItemByKey(r, key);
    expected.push([hash(result), cHex(key[0])].join(" "));
  } else {
    result =
      op === "I" ? res_getTableItemByIndex(r, Number(q), key) : res_getArrayItem(r, Number(q));
    expected.push([hash(result), cHex(key[0])].join(" "));
  }
}
const graph = JSON.parse(
  readFileSync("apps/office/src/external/icu/source/data/in/icudt78l.resources.json", "utf8"),
);
for (const name of Object.keys(graph.bundles)) {
  const data = new ResourceData();
  res_load(data, null, name, [0]);
  const root = data.rootRes;
  add("F", name, "", "", root);
  add("K", name, "", "", root);
  if (root.type !== 2) continue;
  for (const key of root.keys) {
    add("F", name, "", key, root);
    add("K", name, "", key, root);
    add("T", name, "", key + "\0ignored", root);
    const child = root.value[key];
    if (child.type === 2) {
      for (const next of child.keys.slice(0, 4)) {
        add("F", name, "", key + "/" + next, root);
        add("K", name, "", key + "/" + next, root);
      }
    } else if (child.type === 8) {
      for (const index of [
        "0",
        "-0",
        " 0",
        "+0",
        "4294967296",
        "-4294967296",
        "-9223372036854775809",
        "9223372036854775808",
        "2147483648",
        "1x",
        "0/extra",
        "/0",
        "0//x",
        "",
        "0\0/extra",
      ]) {
        add("F", name, key, index, child);
        add("K", name, key, index, child);
      }
      for (const i of [-1, 0, child.value.length - 1, child.value.length]) {
        add("A", name, key, String(i), child);
        add("I", name, key, String(i), child);
      }
    }
  }
  for (const i of [-1, 0, root.keys.length - 1, root.keys.length])
    add("I", name, "", String(i), root);
  for (const q of [
    "/",
    "//",
    "missing/after",
    "\0ignored",
    "calendar/",
    "calendar//",
    "calendar/gregorian/AmPmMarkers/0",
    "calendar/gregorian/AmPmMarkers/0/unused",
  ]) {
    add("F", name, "", q, root);
    add("K", name, "", q, root);
  }
}
// Reach nested arrays/tables through the native raw walker, including calendar and zone resources.
for (const name of [
  "root",
  "en",
  "ru",
  "zh",
  "de",
  "ar",
  "he",
  "supplementalData",
  "zoneinfo64",
  "keyTypeData",
  "langInfo",
  "timezoneTypes",
]) {
  const data = new ResourceData();
  res_load(data, null, name, [0]);
  const seen = new Set();
  let arrays = 0,
    tables = 0;
  /** Visits native-addressable nested containers once per raw identity. @param r - Node. @param base - Raw path. @returns Nothing. */
  function visit(r, base) {
    if (seen.has(r)) return;
    seen.add(r);
    if (r.type === 8) {
      if (arrays++ < 64) {
        for (const q of [
          "",
          "0",
          "-0",
          " 0",
          "+0",
          "4294967296",
          "-4294967296",
          "-9223372036854775809",
          "9223372036854775808",
          "2147483648",
          "1x",
          "0/extra",
          "/0",
          "0//x",
          "0\0/extra",
        ]) {
          add("F", name, base, q, r);
          add("K", name, base, q, r);
        }
        for (const i of [-1, 0, r.value.length - 1, r.value.length]) {
          add("A", name, base, String(i), r);
          add("I", name, base, String(i), r);
        }
      }
      r.value.forEach(
        /** Descends a native raw array index. @param child - Node. @param i - Index. @returns Nothing. */ (
          child,
          i,
        ) => visit(child, base + "/" + i),
      );
    } else if (r.type === 2) {
      if (tables++ < 64) {
        for (const q of [
          "",
          "missing",
          "/",
          "0",
          ...r.keys
            .slice(0, 2)
            .flatMap(
              /** Generates source key and early-stop suffix cases. @param k - Key. @returns Queries. */ (
                k,
              ) => [k, k + "/extra", k + "\0ignored"],
            ),
        ]) {
          add("F", name, base, q, r);
          add("K", name, base, q, r);
          add("T", name, base, q, r);
        }
      }
      for (const k of r.keys)
        if (k !== "" && !k.includes("/")) visit(r.value[k], base ? base + "/" + k : k);
    }
  }
  visit(data.rootRes, "");
}
// Bounded exhaustive narrow-byte paths include embedded NUL and slash mutation.
const root = new ResourceData();
res_load(root, null, "root", [0]);
for (let i = 0; i < 256; ++i)
  for (const q of [String.fromCharCode(i), "calendar/" + String.fromCharCode(i) + "/tail"]) {
    add("F", "root", "", q, root.rootRes);
    add("K", "root", "", q, root.rootRes);
  }
const arrayPath = "calendar/gregorian/AmPmMarkersAbbr",
  array = getTableItemByKeyPath(root.rootRes, arrayPath);
for (let i = 0; i < 256; ++i)
  for (const q of [
    String.fromCharCode(i) + "0",
    "0" + String.fromCharCode(i),
    String.fromCharCode(i),
    "+" + String.fromCharCode(i),
  ]) {
    add("F", "root", arrayPath, q, array);
    add("K", "root", arrayPath, q, array);
  }
const paths = [
  "",
  "a",
  "a/",
  "a/b",
  "a/b/",
  "/",
  "//",
  "a//b/",
  "x/y/z/",
  "a\0/b/",
  "\0/",
  "a".repeat(160) + "/",
];
for (const a of paths)
  for (const b of paths)
    for (const c of ["", "k", "k/l/m", "/k", "k//l/", "\0x"])
      for (const initial of [0, -127, 1]) {
        const out = ["old"],
          status = [initial];
        createPath(a, a.length, b, b.length, c, out, status);
        input.push(["P", hex(a), a.length, hex(b), b.length, hex(c), initial].join(" "));
        expected.push([status[0], hex(out[0])].join(" "));
        counts.P = (counts.P ?? 0) + 1;
      }
const lines = execFileSync(`${build}/resource-path-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (lines.length !== expected.length)
  throw Error(`Native output count ${lines.length} != ${expected.length}`);
for (let i = 0; i < lines.length; ++i)
  if (lines[i] !== expected[i])
    throw Error(`Mismatch ${i} ${input[i]}\nnative ${lines[i]}\nlocal ${expected[i]}`);
console.log(
  JSON.stringify({
    cases: input.length,
    counts,
    result: "all match unchanged ICU78.3 source",
    scope:
      "Full raw content digests, C keys, caller pointer offsets, all mutated path bytes, counted inheritance paths and sticky statuses",
  }),
);
