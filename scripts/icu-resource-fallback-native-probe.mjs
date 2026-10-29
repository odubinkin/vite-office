/** @fileoverview Native source witness for ICU78.3 private resource fallback helpers and cached entry loading. Includes the entire unchanged original uresbund.cpp rather than reconstructing private native behavior. */
import { execFileSync } from "node:child_process";
import { writeIcuObservations } from "./icu-fixture-observations.mjs";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { format, resolveConfig } from "prettier";
const source = resolve("vendor/icu-reference/source"),
  build = resolve(process.env.VITE_OFFICE_ICU_NATIVE_BUILD ?? "output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/resource-fallback-witness.cc`,
  String.raw`
#include "${source}/common/uresbund.cpp"
#include <iostream>
#include <vector>
#include <string>
std::string unhex(std::string s){if(s=="-")return {};std::string o;for(size_t i=0;i<s.size();i+=2)o+=char(std::stoi(s.substr(i,2),nullptr,16));return o;}
std::string hex(const char*s){if(!s)return "~";std::string out;const char*t="0123456789abcdef";while(*s){uint8_t c=*s++;out+=t[c>>4];out+=t[c&15];}return out.empty()?"-":out;}
void text(std::ostream&out,const char*s,int n){out<<'"';for(int i=0;i<n;++i){unsigned c=uint8_t(s[i]);if(c=='"'||c=='\\')out<<'\\'<<char(c);else if(c<32||c>=127){const char*t="0123456789abcdef";out<<"\\u00"<<t[c>>4]<<t[c&15];}else out<<char(c);}out<<'"';}
void table(std::ostream&out,const int32_t*t,int n){out<<'[';for(int i=0;i<n;++i){if(i)out<<',';out<<t[i];}out<<']';}
uint64_t hashValue=14695981039346656037ULL;
void mix(uint32_t v){for(int i=0;i<4;++i){hashValue^=(v>>(i*8))&255;hashValue*=1099511628211ULL;}}
void hashResource(ResourceData&data,Resource raw){ResourceDataValue value;value.setData(data);value.setResource(raw,ResourceTracer());UErrorCode e=U_ZERO_ERROR;int type=value.getType();mix(type);if(type==URES_STRING||type==URES_ALIAS){int32_t n;auto*p=type==URES_STRING?value.getString(n,e):value.getAliasString(n,e);mix(n);for(int i=0;i<n;++i)mix(p[i]);}else if(type==URES_INT)mix(uint32_t(value.getInt(e)));else if(type==URES_BINARY){int32_t n;auto*p=value.getBinary(n,e);mix(n);for(int i=0;i<n;++i)mix(p[i]);}else if(type==URES_INT_VECTOR){int32_t n;auto*p=value.getIntVector(n,e);mix(n);for(int i=0;i<n;++i)mix(uint32_t(p[i]));}else if(type==URES_ARRAY){auto a=value.getArray(e);mix(a.getSize());for(int i=0;i<a.getSize();++i){a.getValue(i,value);hashResource(data,value.getResource());}}else{auto t=value.getTable(e);mix(t.getSize());for(int i=0;i<t.getSize();++i){const char*key=nullptr;t.getKeyAndValue(i,key,value);mix(std::strlen(key));for(const unsigned char*c=reinterpret_cast<const unsigned char*>(key);*c;++c)mix(*c);hashResource(data,value.getResource());}}if(U_FAILURE(e))std::exit(6);}
void snapshot(UResourceDataEntry*r){std::vector<UResourceDataEntry*>line;for(auto*p=r;p;p=p->fParent)line.push_back(p);std::cout<<line.size();for(auto*p:line)std::cout<<' '<<hex(p->fName)<<' '<<p->fCountExisting<<' '<<int(p->fBogus)<<' '<<int(p->fData.noFallback)<<' '<<int(p->fData.usesPoolBundle)<<' '<<int(p->fData.isPoolBundle)<<' '<<hex(p->fPool?p->fPool->fName:nullptr)<<' '<<(p->fPool?int64_t(p->fPool->fCountExisting):int64_t(-1));}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);if(argc>2){std::cout<<"{\"scriptCodeChars\":";text(std::cout,scriptCodeChars,sizeof(scriptCodeChars));std::cout<<",\"dsLocaleIDChars\":";text(std::cout,dsLocaleIDChars,sizeof(dsLocaleIDChars));std::cout<<",\"defaultScriptTable\":";table(std::cout,defaultScriptTable,UPRV_LENGTHOF(defaultScriptTable));std::cout<<",\"parentLocaleChars\":";text(std::cout,parentLocaleChars,sizeof(parentLocaleChars));std::cout<<",\"parentLocaleTable\":";table(std::cout,parentLocaleTable,UPRV_LENGTHOF(parentLocaleTable));std::cout<<"}\n";return 0;}char op;while(std::cin>>op){if(op=='S'){std::string n;std::cin>>n;auto name=unhex(n);UErrorCode e=U_ZERO_ERROR;uloc_setDefault(name.c_str(),&e);std::cout<<int(e);}else if(op=='E'){int mode,initial,isnull,increase,flush;std::string n;std::cin>>mode>>initial>>isnull>>increase>>flush>>n;auto name=unhex(n);UErrorCode e=UErrorCode(initial);auto*r=mode==2?entryOpenDirect(nullptr,isnull?nullptr:name.c_str(),&e):entryOpen(nullptr,name.c_str(),UResOpenType(mode),&e);std::cout<<int(e)<<' ';snapshot(r);if(increase&&r){entryIncrease(r);std::cout<<' ';snapshot(r);entryClose(r);}entryClose(r);std::cout<<' ';snapshot(r);std::cout<<' '<<(flush?ures_flushCache():-1);}
else if(op=='V'){int initial,isnull;std::string n;std::cin>>initial>>isnull>>n;auto name=unhex(n);ResourceData data{};UErrorCode e=UErrorCode(initial);res_load(&data,nullptr,isnull?nullptr:name.c_str(),&e);std::cout<<int(e)<<' '<<int(data.data!=nullptr)<<' '<<int(data.noFallback)<<' '<<int(data.usesPoolBundle)<<' '<<int(data.isPoolBundle)<<' '<<int(res_getPublicType(data.rootRes));if(U_SUCCESS(e)){ResourceData pool{};if(data.usesPoolBundle){UErrorCode local=U_ZERO_ERROR;res_load(&pool,nullptr,"pool",&local);if(U_FAILURE(local))return 5;const int32_t*indexes=pool.pRoot+1;data.poolBundleKeys=reinterpret_cast<const char*>(indexes+(indexes[URES_INDEX_LENGTH]&255));data.poolBundleStrings=pool.p16BitUnits;}hashValue=14695981039346656037ULL;hashResource(data,data.rootRes);std::cout<<' '<<hashValue;res_unload(&pool);}else std::cout<<" ~";res_unload(&data);std::cout<<' '<<int(data.data==nullptr)<<' '<<int(data.noFallback);}
else if(op=='T'){ResourceData a{},b{};UErrorCode e=U_ZERO_ERROR;res_load(&a,nullptr,"en",&e);res_load(&b,nullptr,"en",&e);std::cout<<int(a.data!=b.data)<<' '<<int(a.rootRes==b.rootRes);res_unload(&a);res_unload(&b);}
else if(op=='O'){UResourceDataEntry local{};entryClose(&local);std::cout<<local.fCountExisting<<' ';entryIncrease(&local);std::cout<<local.fCountExisting;}
else if(op=='I'){UErrorCode e=U_ZERO_ERROR;initCache(&e);auto*r=init_entry("no_NO",nullptr,&e);auto*t=r;char name[157]="no";bool ok=loadParentsExceptRoot(t,name,157,false,nullptr,&e);std::cout<<int(e)<<' '<<int(ok)<<' '<<int(t->fParent==t)<<' '<<t->fCountExisting<<' '<<hex(name);r->fParent=nullptr;entryClose(r);entryClose(r);std::cout<<' '<<ures_flushCache();}
else if(op=='D'){std::string a,b;std::cin>>a>>b;auto x=unhex(a),y=unhex(b);UErrorCode e=U_ZERO_ERROR;auto result=getDefaultScript(CharString(x.data(),int32_t(x.size()),e),CharString(y.data(),int32_t(y.size()),e));std::cout<<hex(result.data());}else if(op=='P'){int mode;std::string a,b;std::cin>>mode>>a>>b;auto x=unhex(a),y=unhex(b);char name[512]={};std::memcpy(name,x.data(),x.size());bool result=getParentLocaleID(name,y.c_str(),UResOpenType(mode));std::cout<<int(result)<<' '<<hex(name);}else{std::string a;std::cin>>a;auto x=unhex(a);char name[512]={};std::memcpy(name,x.data(),x.size());if(op=='C'){bool result=chopLocale(name);std::cout<<int(result)<<' '<<hex(name);}else if(op=='H')std::cout<<int(hasVariant(name));else std::cout<<int(mayHaveParent(name));}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/resource-fallback-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/resource-fallback-witness`,
  ],
  { stdio: "inherit" },
);
const tables = JSON.parse(
  execFileSync(`${build}/resource-fallback-witness`, [`${source}/data/in`, "tables"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024,
  }),
);
const target = resolve("apps/office/src/external/icu/source/common/localefallback_data.json"),
  bytes = await format(
    JSON.stringify({
      source: {
        icuVersion: "78.3",
        sourceSha256: createHash("sha256")
          .update(readFileSync(`${source}/common/localefallback_data.h`))
          .digest("hex"),
      },
      ...tables,
    }),
    { ...(await resolveConfig(target)), parser: "json" },
  );
if (process.argv.includes("--check")) {
  if (readFileSync(target, "utf8") !== bytes) throw Error("Pinned localefallback tables differ");
} else writeFileSync(target, bytes);
if (process.argv.includes("--export-only")) {
  console.log("Exported original localefallback_data.h tables");
  process.exit(0);
}
const { chopLocale, hasVariant, getDefaultScript, getParentLocaleID, mayHaveParent } =
  await import("../apps/office/src/external/icu/source/common/uresbund.fallback.ts");
/** Narrow transport. @param text - C or counted storage. @returns Hex. */
function hex(text) {
  return Buffer.from(text, "latin1").toString("hex") || "-";
}
/** Source C transport. @param text - Storage. @returns Prefix transport. */
function cHex(text) {
  return hex(text.split("\0")[0]);
}
const input = [],
  expected = [],
  counts = {};
/** Appends an actual native helper query. @param op - Operation. @param args - Arguments. @param result - Local observation. @returns Nothing. */
function add(op, args, result) {
  input.push([op, ...args].join(" "));
  expected.push(result.join(" "));
  counts[op] = (counts[op] ?? 0) + 1;
}
const names = new Set([
  "",
  "root",
  "und",
  "en",
  "en_US",
  "en_Latn_US",
  "en_Cyrl_US",
  "en_US_POSIX",
  "ru",
  "ru_Latn_RU",
  "zh_TW",
  "zh_Hant_TW",
  "zh_Hans_TW",
  "sr_ME",
  "az_IR",
  "az_Latn_IR",
  "az_Arab_IR",
  "nb",
  "nn",
  "n",
  "b",
  "b n",
  " ",
  "no",
  "non",
  "en_",
  "en__",
  "en___X",
  "en@calendar=gregorian",
  "en-u-ca-gregory",
  "abcde",
  "abcdefghijk",
  "abcdefghijkl",
  "en_US_123456789",
  "en\0_US",
  "zh\0x",
  "az\0x",
]);
for (const s of tables.dsLocaleIDChars.split("\0")) names.add(s);
for (const s of tables.parentLocaleChars.split("\0")) names.add(s);
const packageData = JSON.parse(
  readFileSync("apps/office/src/external/icu/source/data/in/icudt78l.resources.json", "utf8"),
);
for (const name of Object.keys(packageData.bundles)) names.add(name);
for (const language of ["en", "ru", "zh", "sr", "az", "und", "zz", "qaa", "", "abcd"])
  for (const script of ["", "Latn", "Cyrl", "Arab", "Hant", "Qaaa"])
    for (const region of ["", "US", "RU", "CN", "TW", "IR", "001", "ZZ"])
      for (const variant of ["", "_POSIX", "_123456789", "_"])
        names.add(language + (script ? "_" + script : "") + (region ? "_" + region : "") + variant);
for (const name of names) {
  const chopped = [name];
  add("C", [hex(name)], [Number(chopLocale(chopped)), cHex(chopped[0])]);
  add("H", [hex(name)], [Number(hasVariant(name))]);
  add("N", [hex(name)], [Number(mayHaveParent(name))]);
  for (const mode of [0, 1, 2])
    for (const original of [name, "und", "en_Cyrl_US", "zh_Hant_TW"]) {
      const target = [name];
      add(
        "P",
        [mode, hex(name), hex(original)],
        [Number(getParentLocaleID(target, original, mode)), cHex(target[0])],
      );
    }
}
for (const name of names)
  for (const region of ["", "US", "RU", "TW", "IR", "ZZ", "001", "\0US"])
    add("D", [hex(name), hex(region)], [cHex(getDefaultScript(name, region))]);
// Complete narrow input alphabet in bounded, source-readable requested locale positions.
for (let c = 0; c < 256; ++c)
  for (const name of [
    String.fromCharCode(c),
    "en_" + String.fromCharCode(c),
    "en_" + String.fromCharCode(c) + "A",
    "en_Latn_" + String.fromCharCode(c) + "A",
    "en_US_" + String.fromCharCode(c),
  ]) {
    add("H", [hex(name)], [Number(hasVariant(name))]);
    for (const mode of [0, 1]) {
      const target = [name];
      add(
        "P",
        [mode, hex(name), hex(name)],
        [Number(getParentLocaleID(target, name, mode)), cHex(target[0])],
      );
    }
  }
const {
  UResourceDataEntry,
  entryOpen,
  entryOpenDirect,
  entryClose,
  entryIncrease,
  ures_flushCache,
  init_entry,
  loadParentsExceptRoot,
} = await import("../apps/office/src/external/icu/source/common/uresbund.entries.ts");
const { ResourceData, res_load, res_unload } =
  await import("../apps/office/src/external/icu/source/common/uresdata.package.ts");
const { locale_set_default_internal } =
  await import("../apps/office/src/external/icu/source/common/locid.default.ts");
/** Observes the actual cache chain and source pool-reference counts. @param entry - Entry/null. @returns Scalars. */
function snapshot(entry) {
  const line = [];
  for (let p = entry; p !== null; p = p.fParent) line.push(p);
  const row = [line.length];
  for (const p of line)
    row.push(
      hex(p.fName),
      p.fCountExisting,
      p.fBogus,
      Number(p.fData.noFallback),
      Number(p.fData.usesPoolBundle),
      Number(p.fData.isPoolBundle),
      p.fPool === null ? "~" : hex(p.fPool.fName),
      p.fPool === null ? -1 : p.fPool.fCountExisting,
    );
  return row;
}
/** Runs and releases actual source entries, leaving their cache lines for following opens. @param mode - Source open type. @param name - C name/null direct default. @param incoming - Status. @param increase - Extra retain/release. @param flush - Flush after observation. @returns Nothing. */
function entryCase(mode, name, incoming = 0, increase = 0, flush = 0) {
  const status = [incoming],
    entry = mode === 2 ? entryOpenDirect(null, name, status) : entryOpen(null, name, mode, status),
    row = [status[0], ...snapshot(entry)];
  if (increase && entry !== null) {
    entryIncrease(entry);
    row.push(...snapshot(entry));
    entryClose(entry);
  }
  entryClose(entry);
  row.push(...snapshot(entry), flush ? ures_flushCache() : -1);
  add("E", [mode, incoming, Number(name === null), increase, flush, hex(name ?? "")], row);
}
let hashValue = 14695981039346656037n;
/** Canonical event checksum updates the exact uint32 representation, little-byte order. @param value - Event. @returns Nothing. */
function mix(value) {
  value >>>= 0;
  for (let i = 0; i < 4; ++i) {
    hashValue ^= BigInt((value >>> (i * 8)) & 255);
    hashValue = BigInt.asUintN(64, hashValue * 1099511628211n);
  }
}
/** Observes every raw node/key/scalar without resolving any aliases. @param r - Resource. @returns Nothing. */
function hashResource(r) {
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
    for (const child of r.value) hashResource(child);
  } else {
    mix(r.keys.length);
    for (const key of r.keys) {
      mix(key.length);
      for (let i = 0; i < key.length; ++i) mix(key.charCodeAt(i));
      hashResource(r.value[key]);
    }
  }
}
for (const name of [
  ...Object.keys(packageData.bundles),
  "missing_source_bundle",
  "root\0tail",
  "",
  null,
])
  for (const incoming of [0, -128, 1]) {
    const status = [incoming],
      data = new ResourceData();
    res_load(data, null, name, status);
    const row = [
      status[0],
      Number(data.data !== null),
      Number(data.noFallback),
      Number(data.usesPoolBundle),
      Number(data.isPoolBundle),
      data.rootRes.type,
    ];
    if (status[0] <= 0) {
      hashValue = 14695981039346656037n;
      hashResource(data.rootRes);
      row.push(String(hashValue));
    } else row.push("~");
    res_unload(data);
    row.push(Number(data.data === null), Number(data.noFallback));
    add("V", [incoming, Number(name === null), hex(name ?? "")], row);
  }
const entryNames = [
  ...Object.keys(packageData.bundles),
  "missing_source_bundle",
  "en_XX",
  "en_Cyrl_XX",
  "zh_Hant_XX",
  "ru_XX",
  "e",
  "n",
  "root\0ignored",
  "",
  "en_" + "A".repeat(153),
  "en_" + "A".repeat(154),
  "en_" + "A".repeat(300),
];
for (const defaultLocale of ["en_US", "ru_RU", "zh_Hant_TW", ""]) {
  const local = [0];
  locale_set_default_internal(defaultLocale, local);
  add("S", [hex(defaultLocale)], [local[0]]);
  const corpus = defaultLocale === "en_US" ? entryNames : entryNames.slice(-13);
  for (const name of [...corpus, "_"]) {
    for (const mode of [0, 1, 2])
      for (const incoming of [0, -128, -124, 1]) entryCase(mode, name, incoming, 1, 0);
    entryCase(0, "root", 0, 0, 1);
  }
  entryCase(2, null, 0, 1, 1);
}
// Fresh direct non-alias entries exercise independent direct parent attachment. Whole-bundle aliases above are first opened via the original fallback path so their cached lines are known finite.
for (const name of Object.keys(packageData.bundles)) {
  const tuple = packageData.bundles[name],
    node = packageData.nodes[tuple[0]];
  const keys =
    node[0] === 2
      ? node[1].map(
          /** Reads raw native keys. @param id - Index. @returns Key. */ (id) =>
            packageData.strings[id],
        )
      : [];
  if (!keys.includes("%%ALIAS") || name === "sh") entryCase(2, name, 0, 1, 1);
}
// Original no_NO alias can establish a self-parent when its target no has no cached line. Observe the original intermediate function, then restore the witness-owned field and references before cleanup; do not invoke the nonterminating outer loop.
entryCase(0, "root", 0, 0, 1);
const status = [0];
const cycleEntry = init_entry("no_NO", null, status),
  current = [cycleEntry],
  name = ["no"],
  ok = loadParentsExceptRoot(current, name, 157, status),
  cycleRow = [
    status[0],
    Number(ok),
    Number(current[0].fParent === current[0]),
    current[0].fCountExisting,
    hex(name[0]),
  ];
cycleEntry.fParent = null;
entryClose(cycleEntry);
entryClose(cycleEntry);
cycleRow.push(ures_flushCache());
add("I", [], cycleRow);
const unsignedEntry = new UResourceDataEntry();
entryClose(unsignedEntry);
const underflow = unsignedEntry.fCountExisting;
entryIncrease(unsignedEntry);
add("O", [], [underflow, unsignedEntry.fCountExisting]);
const firstData = new ResourceData(),
  secondData = new ResourceData(),
  dataStatus = [0];
res_load(firstData, null, "en", dataStatus);
res_load(secondData, null, "en", dataStatus);
add(
  "T",
  [],
  [Number(firstData.data !== secondData.data), Number(firstData.rootRes === secondData.rootRes)],
);
res_unload(firstData);
res_unload(secondData);
const actual = execFileSync(`${build}/resource-fallback-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; ++i)
  if (actual[i].trim() !== expected[i])
    throw Error(`Row ${i} ${input[i]} native ${actual[i]} port ${expected[i]}`);
const report = {
  result: "pass",
  cases: expected.length,
  counts,
  names: names.size,
  sources: Object.fromEntries(
    ["common/uresbund.cpp", "common/localefallback_data.h", "data/in/icudt78l.dat"].map(
      /** Records unchanged source. @param path - Source. @returns Pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Entire unchanged uresbund.cpp compiled in witness, original static generated fallback tables, source chop/variant/default-script/parent-search and substring parent hint. All generated table strings, all982 actual top-level raw files with canonical full-content event checksums and res_load status/reset/unload effects, all open modes/defaults, original requested scripts, variants, NUL and all256 narrow bytes. Entry/cache chains, exact/direct versus fallback search, pool counts, retain/close/flush, uint32 wrap and distinct open-handle/shared-root identities are observed. Whole-bundle aliases use source-primed finite parent lines; the isolated no_NO self-parent is observed only at the native intermediate step and restored by the witness before cleanup. Logical C names are observed; ignored trailing caller bytes, physical allocator/ABI and full resource-result alias/Calendar construction are not certified.",
};
writeFileSync(`${build}/resource-fallback-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));

const entryRows = input.flatMap(
  /** Keeps stateful default/entry operations in their original order; other operations do not change this cache before the entry corpus. @param query - Original native command. @param index - Native result index. @returns Selected original observation. */ (
    query,
    index,
  ) => (/^[SE] /.test(query) ? [[query, actual[index]]] : []),
);
writeIcuObservations(
  "resource-fallback",
  entryRows.map(
    /** Selects original command bytes. @param row - Native pair. @returns Command. */ (row) =>
      row[0],
  ),
  entryRows.map(
    /** Selects compiled original output bytes. @param row - Native pair. @returns Output. */ (
      row,
    ) => row[1],
  ),
  build,
  source,
  [
    "common/uresbund.cpp",
    "common/localefallback_data.h",
    "common/uresdata.cpp",
    "data/in/icudt78l.dat",
  ],
  "common",
);
