/** @fileoverview Captures original full OUString and complete cached-key structs with unchanged native lifetime dependencies. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import {
  upstream,
  pin,
  hash,
  scope,
  loadUnicodeNativeSources,
  loadUnicodeOriginal,
  configureUnicodeNativeHeaders,
  unicodeNativeLifetimePrefix,
} from "./rtl-ustring-native-sources.mjs";
const target = "output/playwright/rtl-string-key-native";
const fixture = "apps/office/src/svl/source/misc/native-string-key-cases.json";
const { sources, scopes } = loadUnicodeNativeSources();
const { types, global } = configureUnicodeNativeHeaders(target, sources);
const pool = loadUnicodeOriginal(sources, "svl/source/misc/sharedstringpool.cxx");
const key = scope(pool, "/** create a key class", "namespace svl");
const reverse = scope(
  sources["sal/rtl/strtmpl.hxx"],
  "template <typename C1, typename C2, class Compare>\nsal_Int32 reverseCompare_WithLengths",
  "template <typename C> sal_Int32 hashCode_WithLength",
);
const reverseWrapper = scope(
  sources["sal/rtl/ustring.cxx"],
  "sal_Int32 SAL_CALL rtl_ustr_reverseCompare_WithLength",
  "sal_Int32 SAL_CALL rtl_ustr_compareIgnoreAsciiCase(",
);
const driver = String.raw`${unicodeNativeLifetimePrefix(scopes, reverse, reverseWrapper)}
${key}
static_assert(sizeof(std::size_t)==8);
static_assert(std::is_copy_constructible_v<StringWithHash> && std::is_move_constructible_v<StringWithHash>);
static_assert(std::is_copy_assignable_v<StringWithHash> && std::is_move_assignable_v<StringWithHash>);
struct Live {rtl_uString* p;std::size_t bytes;};
std::map<int,Live> live;std::map<rtl_uString*,int> ids;int nextId=1;
std::vector<std::vector<long long>> events;
void* captureAlloc(std::size_t bytes){auto p=(rtl_uString*)malloc(bytes);assert(p);int id=nextId++;ids[p]=id;live[id]={p,bytes};events.push_back({0,id,(long long)bytes});return p;}
void captureFree(void* data){auto p=(rtl_uString*)data;auto found=ids.find(p);assert(found!=ids.end());int id=found->second;auto capacity=(live.at(id).bytes-10)/2;std::vector<long long> event={1,id,p->refCount,p->length,(long long)capacity};for(int i=0;i<=p->length;i++)event.push_back(p->buffer[i]);event.push_back(p->buffer[capacity]);events.push_back(event);live.erase(id);ids.erase(found);free(data);}
constexpr rtl::OUStringLiteral L(u"A\0B");OUString cppEmpty;
int identify(rtl_uString const* p){if(!p)return -1;if(p==cppEmpty.pData)return -2;if(p==&L.str)return -3;if(p==&rtl::str::EmptyStringImpl<rtl_uString>::data)return 0;return ids.at(const_cast<rtl_uString*>(p));}
void dataRow(int id,rtl_uString const* p,int capacity){std::cout<<'['<<id<<','<<p->refCount<<','<<p->length<<','<<capacity<<",[";for(int i=0;i<=p->length;i++){if(i)std::cout<<',';std::cout<<(unsigned)p->buffer[i];}std::cout<<"],"<<(unsigned)p->buffer[capacity]<<']';}
void snapshot(std::vector<std::unique_ptr<OUString>> const& o,std::vector<std::unique_ptr<StringWithHash>> const& k,std::vector<std::string> const& result){
std::cout<<R"({"ou":[)";bool c=false;for(auto const& p:o){if(c)std::cout<<',';c=true;std::cout<<(p?identify(p->pData):-4);}
std::cout<<R"(],"keys":[)";c=false;for(auto const& p:k){if(c)std::cout<<',';c=true;if(!p)std::cout<<"null";else std::cout<<'['<<identify(p->str.pData)<<','<<p->hashCode<<']';}
std::cout<<R"(],"live":[)";dataRow(-2,cppEmpty.pData,0);std::cout<<',';dataRow(-3,&L.str,L.getLength());std::cout<<',';dataRow(0,&rtl::str::EmptyStringImpl<rtl_uString>::data,0);for(auto [id,p]:live){std::cout<<',';dataRow(id,p.p,(p.bytes-10)/2);}
std::cout<<R"(],"events":[)";c=false;for(auto const& e:events){if(c)std::cout<<',';c=true;std::cout<<'[';for(unsigned i=0;i<e.size();i++){if(i)std::cout<<',';std::cout<<e[i];}std::cout<<']';}events.clear();
std::cout<<R"(],"result":[)";for(unsigned i=0;i<result.size();i++){if(i)std::cout<<',';std::cout<<'"'<<result[i]<<'"';}std::cout<<"]}";
}
int main(int argc,char** argv){rtl_allocateString=captureAlloc;rtl_freeString=captureFree;
if(argc>1){rtl_uString* slot=nullptr;auto const& view=OUString::unacquired(&slot);std::cerr<<"before-invalid-reference-hash\n";volatile auto value=view.hashCode();(void)value;return 0;}
std::vector<std::unique_ptr<OUString>> o(8);std::vector<std::unique_ptr<StringWithHash>> k(8);std::string op;int a,b,n;bool comma=false;std::cout<<'[';
while(std::cin>>op>>a>>b>>n){std::vector<sal_Unicode> units(n);unsigned x;for(auto& c:units){std::cin>>x;c=x;}std::vector<std::string> result;
if(op=="on")o[a]=std::make_unique<OUString>(units.data(),n);
else if(op=="od")o[a]=std::make_unique<OUString>();
else if(op=="ol")o[a]=std::make_unique<OUString>(L);
else if(op=="oc")o[a]=std::make_unique<OUString>(*o[b]);
else if(op=="ox")o[a].reset();
else if(op=="kn")k[a]=std::make_unique<StringWithHash>(*o[b]);
else if(op=="knm")k[a]=std::make_unique<StringWithHash>(std::move(*o[b]));
else if(op=="kc")k[a]=std::make_unique<StringWithHash>(*k[b]);
else if(op=="km")k[a]=std::make_unique<StringWithHash>(std::move(*k[b]));
else if(op=="ka")result.push_back(std::to_string(&(*k[a]=*k[b])==k[a].get()));
else if(op=="kma")result.push_back(std::to_string(&(*k[a]=std::move(*k[b]))==k[a].get()));
else if(op=="kx")k[a].reset();
else if(op=="keq")result={std::to_string(*k[a]==*k[b]),std::to_string(std::hash<StringWithHash>()(*k[a])),std::to_string(std::hash<StringWithHash>()(*k[b]))};
else if(op=="cache")k[a]->hashCode=b;
else if(op=="ks")k[a]->str=*o[b];
else if(op=="cmp"){auto const& x=*o[a];auto const& y=*o[b];result={std::to_string(x.compareTo(y)),std::to_string(x.reverseCompareTo(y)),std::to_string(x.equals(y)),std::to_string(x==y),std::to_string(x!=y),std::to_string(x<y),std::to_string(x>y),std::to_string(x<=y),std::to_string(x>=y),std::to_string(x.hashCode()),std::to_string(y.hashCode()),std::to_string(rtl::OUStringHash()(x)),std::to_string(rtl::OUStringHash()(y))};}
else if(op=="borrow"){auto const& x=OUString::unacquired(&k[a]->str.pData);auto const& y=OUString::unacquired(&k[b]->str.pData);result={std::to_string(x.compareTo(y)),std::to_string(x.reverseCompareTo(y)),std::to_string(x.equals(y)),std::to_string(x.hashCode()),std::to_string(rtl::OUStringHash()(x))};}
else {std::cerr<<"Unknown caller";return 2;}
if(comma)std::cout<<',';comma=true;snapshot(o,k,result);
}
std::cout<<']';for(auto& p:k)p.reset();for(auto& p:o)p.reset();assert(live.empty());
}
`;
const flags = [
  "-std=c++20",
  "-DLIBO_INTERNAL_ONLY",
  "-DMACOSX",
  `-I${target}/headers`,
  `-I${upstream}/include`,
  "-pthread",
];
writeFileSync(`${target}/driver.cpp`, driver);
const build = spawnSync("clang++", [...flags, `${target}/driver.cpp`, "-o", `${target}/driver`], {
  encoding: "utf8",
});
writeFileSync(`${target}/compile.stderr`, build.stderr);
if (build.status !== 0) throw new Error(build.stderr);
const calls = [];
/** Emits actual caller input only. @param op - Original operation selector. @param a - Destination. @param b - Source/scalar. @param units - Original UTF16 input. @returns Nothing. */
function call(op, a = 0, b = 0, units = []) {
  calls.push({ op, a, b, units });
}
const buffers = [
  [],
  [0],
  [65],
  [97],
  [65, 100],
  [66, 63],
  [65, 0, 66],
  [65, 66],
  [66, 65],
  [65535, 0, 55296, 56320],
  [65, 65, 65, 65, 65, 65, 65, 65],
  [65535, 65535, 65535, 65535, 65535, 65535, 65535, 65535],
  [55296],
  [56320],
  [0, 0],
];
for (const first of buffers)
  for (const second of buffers) {
    call("on", 0, 0, first);
    call("on", 1, 0, second);
    call("on", 2, 0, first);
    call("oc", 3, 0);
    call("cmp", 0, 1);
    call("cmp", 1, 0);
    call("cmp", 0, 0);
    call("cmp", 0, 2);
    call("cmp", 0, 3);
    call("kn", 0, 0);
    call("kn", 1, 1);
    call("kn", 2, 2);
    call("kc", 3, 0);
    call("keq", 0, 1);
    call("keq", 1, 0);
    call("keq", 0, 0);
    call("keq", 0, 2);
    call("keq", 0, 3);
    call("borrow", 0, 1);
    call("km", 4, 0);
    call("keq", 0, 4);
    call("ka", 0, 4);
    call("ka", 0, 0);
    call("kma", 0, 1);
    call("kma", 0, 0);
    call("keq", 0, 1);
    call("borrow", 0, 1);
    for (let i = 0; i < 5; i++) call("kx", i);
    for (let i = 0; i < 4; i++) call("ox", i);
  }
call("od");
call("ol", 1);
call("cmp", 0, 1);
call("kn", 0, 0);
call("kn", 1, 1);
call("borrow", 0, 1);
call("km", 2, 0);
call("keq", 0, 2);
for (let i = 0; i < 3; i++) call("kx", i);
call("ox", 0);
call("ox", 1);
call("on", 0, 0, [65, 0, 66]);
call("od", 1);
call("knm", 0, 0);
call("cmp", 0, 1);
call("knm", 1, 0);
call("keq", 0, 1);
call("borrow", 0, 1);
call("kx", 0);
call("kx", 1);
call("ox", 0);
call("ox", 1);
call("on", 0, 0, [65]);
call("on", 1, 0, [65]);
call("kn", 0, 0);
call("kn", 1, 1);
call("cache", 0, -2147483648);
call("keq", 0, 1);
call("cache", 1, -2147483648);
call("keq", 0, 1);
call("kc", 2, 0);
call("keq", 2, 0);
call("ks", 2, 1);
call("keq", 2, 0);
call("cache", 1, 2147483647);
call("keq", 0, 1);
for (let i = 0; i < 3; i++) call("kx", i);
call("ox", 0);
call("ox", 1);
const input =
  calls
    .map(
      /** Serializes only genuine caller input. @param c - Call. @returns Driver input line. */ (
        c,
      ) => [c.op, c.a, c.b, c.units.length, ...c.units].join(" "),
    )
    .join("\n") + "\n";
const run = spawnSync(`${target}/driver`, [], {
  encoding: "utf8",
  input,
  maxBuffer: 128 * 1024 * 1024,
});
writeFileSync(`${target}/output.json`, run.stdout);
writeFileSync(`${target}/run.stderr`, run.stderr);
if (run.status !== 0) throw new Error(run.stderr);
const states = JSON.parse(run.stdout);
if (states.length !== calls.length) throw new Error("Incomplete native capture");
const deps = execFileSync("clang++", [...flags, "-MM", `${target}/driver.cpp`], {
  encoding: "utf8",
})
  .split(/\s+/)
  .filter(
    /** Selects actual upstream header paths. @param path - Compiler dependency. @returns Original path flag. */ (
      path,
    ) => path.startsWith(upstream + "/"),
  );
for (const path of new Set(deps)) loadUnicodeOriginal(sources, path.slice(upstream.length + 1));
const asan = spawnSync(
  "clang++",
  [
    ...flags,
    "-fsanitize=address,undefined",
    "-fno-omit-frame-pointer",
    "-g",
    `${target}/driver.cpp`,
    "-o",
    `${target}/driver-asan`,
  ],
  { encoding: "utf8" },
);
writeFileSync(`${target}/asan-compile.stderr`, asan.stderr);
if (asan.status !== 0) throw new Error(asan.stderr);
const env = { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" };
const valid = spawnSync(`${target}/driver-asan`, [], {
  encoding: "utf8",
  input,
  maxBuffer: 128 * 1024 * 1024,
  env,
});
writeFileSync(`${target}/valid-asan.stderr`, valid.stderr);
if (valid.status !== 0 || valid.stdout !== run.stdout)
  throw new Error("Sanitized defined capture differs: " + valid.stderr);
const invalid = spawnSync(`${target}/driver-asan`, ["invalid"], { encoding: "utf8", env });
writeFileSync(`${target}/invalid.stderr`, invalid.stderr);
if (
  invalid.status === 0 ||
  !invalid.stderr.includes("before-invalid-reference-hash") ||
  !invalid.stderr.includes("null pointer")
)
  throw new Error("Missing original invalid-reference diagnostic: " + invalid.stderr);
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources)
      .sort()
      .map(
        /** Records full pinned blobs. @param pair - Original bytes. @returns Digest pair. */ ([
          path,
          bytes,
        ]) => [path, hash(bytes)],
      ),
  ),
  scopeHashes: Object.fromEntries(
    Object.entries({ ...scopes, reverse, reverseWrapper, key }).map(
      /** Records unchanged original scopes. @param pair - Scope. @returns Digest pair. */ ([
        name,
        bytes,
      ]) => [name, hash(bytes)],
    ),
  ),
  configuration: { flags, typesHash: hash(types), globalHash: hash(global), sizeTBits: 64 },
  driverHash: hash(driver),
  statesHash: hash(run.stdout),
  calls,
  states,
  diagnostics: [
    { marker: "before-invalid-reference-hash", diagnostic: "null pointer", definedResult: false },
  ],
};
const check = process.argv.includes("--check"),
  write = process.argv.includes("--write");
if (check === write) throw new Error("Use exactly --write or --check");
if (write) writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native string key fixture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    calls: calls.length,
    files: Object.keys(sources).length,
    scopes: Object.keys(record.scopeHashes).length,
    driverHash: record.driverHash,
  }),
);
