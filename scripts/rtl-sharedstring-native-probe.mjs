/** @fileoverview Captures original full OUString/SharedString headers and source with unchanged RTL lifetime dependencies. */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import {
  upstream,
  pin,
  hash,
  scope,
  loadUnicodeNativeSources,
} from "./rtl-ustring-native-sources.mjs";
const target = "output/playwright/rtl-sharedstring-native";
const fixture = "apps/office/src/svl/source/misc/native-sharedstring-cases.json";
const { sources, scopes } = loadUnicodeNativeSources();
/** Reads a full original blob and rejects local modifications. @param path - Original path. @returns Pinned bytes. */
function original(path) {
  const text = readFileSync(`${upstream}/${path}`, "utf8");
  if (
    execFileSync("git", ["-C", upstream, "show", `${pin}:${path}`], { encoding: "utf8" }) !== text
  )
    throw new Error(`Modified upstream: ${path}`);
  sources[path] = text;
  return text;
}
const cpp = original("svl/source/misc/sharedstring.cxx");
const configTypes = original("config_host/config_typesizes.h.in");
const configGlobal = original("config_host/config_global.h.in");
const sizes = {
  ALIGNMENT2: "2",
  ALIGNMENT4: "4",
  ALIGNMENT8: "8",
  SIZEOFSHORT: "__SIZEOF_SHORT__",
  SIZEOFINT: "__SIZEOF_INT__",
  SIZEOFLONG: "__SIZEOF_LONG__",
  SIZEOFLONGLONG: "__SIZEOF_LONG_LONG__",
  SIZEOFPOINTER: "__SIZEOF_POINTER__",
};
const types = configTypes.replace(
  /^#undef SAL_TYPES_(\w+)$/gm,
  /** Applies actual compiler type sizes to the original configuration template. @param line - Template line. @param name - Config key. @returns Configured line. */ (
    line,
    name,
  ) => `#define SAL_TYPES_${name} ${sizes[name]}`,
);
const global = configGlobal
  .replace("#define HAVE_GCC_BUILTIN_ATOMIC 0", "#define HAVE_GCC_BUILTIN_ATOMIC 1")
  .replace("#define HAVE_CPP_CONSTEVAL 0", "#define HAVE_CPP_CONSTEVAL 1");
mkdirSync(`${target}/headers`, { recursive: true });
writeFileSync(`${target}/headers/config_typesizes.h`, types);
writeFileSync(`${target}/headers/config_global.h`, global);
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
const driver = String.raw`#include <svl/sharedstring.hxx>
#include <rtl/character.hxx>
#include <osl/mutex.h>
#include <o3tl/safeint.hxx>
#include <concepts>
#include <limits>
#include <vector>
#include <map>
#include <memory>
#include <iostream>
#include <pthread.h>
#define SAL_WARN_IF(...)
#define SAL_WARN(...)
#undef OSL_ASSERT
#define OSL_ASSERT(c) do{if(!(c))std::cerr<<"OSL_ASSERT: "<<#c<<'\n';}while(false)
#define RTL_LOG_STRING_NEW(...)
#define RTL_LOG_STRING_DELETE(...)
#define RTL_LOG_STRING_INTERN_NEW(...)
#define RTL_LOG_STRING_INTERN_DELETE(...)
${scopes.flags}
${scopes.allocationDeclarations}
${scopes.allocationDefaults}
${scopes.mutexCreate}
${scopes.mutexAcquire}
${scopes.mutexRelease}
void internRelease(rtl_uString*);
namespace rtl::str { ${scopes.unsigned} ${scopes.lengthWrapper} ${scopes.copy} ${scopes.length} ${scopes.comparator} ${scopes.noShortening} ${scopes.forward} ${reverse} ${scopes.hash} ${scopes.storage} ${scopes.getStr} }
${scopes.forwardWrapper}
${reverseWrapper}
${scopes.hashWrapper}
${scopes.storageWrappers}
${scopes.assignAndGet}
${scopes.hashTable}
${scopes.lifecycleAndIntern}
${scopes.internRelease}
${cpp}
static_assert(sizeof(OUString)==sizeof(rtl_uString*));
static_assert(std::is_standard_layout_v<OUString>);
struct Live {rtl_uString* p;std::size_t bytes;};
std::map<int,Live> live;std::map<rtl_uString*,int> ids;int nextId=1;bool failNext=false;
std::vector<std::vector<long long>> events;
void* captureAlloc(std::size_t bytes){if(failNext){failNext=false;events.push_back({2,(long long)bytes});return nullptr;}auto p=(rtl_uString*)malloc(bytes);assert(p);int id=nextId++;ids[p]=id;live[id]={p,bytes};events.push_back({0,id,(long long)bytes});return p;}
void captureFree(void* data){auto p=(rtl_uString*)data;auto found=ids.find(p);assert(found!=ids.end());int id=found->second;auto capacity=(live.at(id).bytes-10)/2;std::vector<long long> event={1,id,p->refCount,p->length,(long long)capacity};for(int i=0;i<=p->length;i++)event.push_back(p->buffer[i]);event.push_back(p->buffer[capacity]);events.push_back(event);live.erase(id);ids.erase(found);free(data);}
constexpr rtl::OUStringLiteral L(u"A\0B");
OUString cppEmpty;
int identify(rtl_uString const* p){if(!p)return -1;if(p==cppEmpty.pData)return -2;if(p==&L.str)return -3;if(p==&rtl::str::EmptyStringImpl<rtl_uString>::data)return 0;return ids.at(const_cast<rtl_uString*>(p));}
std::map<OUString const*,int> viewIds;int nextView=0;
int viewId(OUString const* p){if(!p)return -1;auto [it,inserted]=viewIds.try_emplace(p,nextView);if(inserted)++nextView;return it->second;}
void forgetShared(svl::SharedString* p){if(!p)return;viewIds.erase(reinterpret_cast<OUString const*>(p));viewIds.erase(reinterpret_cast<OUString const*>(reinterpret_cast<rtl_uString* const*>(p)+1));}
void dataRow(int id,rtl_uString const* p,int capacity){std::cout<<'['<<id<<','<<p->refCount<<','<<p->length<<','<<capacity<<",[";for(int i=0;i<=p->length;i++){if(i)std::cout<<',';std::cout<<(unsigned)p->buffer[i];}std::cout<<"],"<<(unsigned)p->buffer[capacity]<<']';}
void snapshot(std::vector<std::unique_ptr<OUString>> const& o,std::vector<std::unique_ptr<svl::SharedString>> const& s,std::vector<OUString const*> const& v,std::vector<rtl_uString*> const& r,std::vector<long long> const& result){
std::cout<<"{\"ou\":[";bool c=false;for(auto const& p:o){if(c)std::cout<<',';c=true;std::cout<<(p?identify(p->pData):-4);}
std::cout<<"],\"shared\":[";c=false;for(auto const& p:s){if(c)std::cout<<',';c=true;if(!p)std::cout<<"null";else std::cout<<'['<<identify(p->getData())<<','<<identify(p->getDataIgnoreCase())<<','<<p->isValid()<<','<<p->isEmpty()<<','<<p->getLength()<<']';}
std::cout<<"],\"raw\":[";c=false;for(auto p:r){if(c)std::cout<<',';c=true;std::cout<<identify(p);}
std::cout<<"],\"views\":[";c=false;for(auto p:v){if(c)std::cout<<',';c=true;if(!p)std::cout<<"null";else std::cout<<'['<<viewId(p)<<','<<identify(p->pData)<<']';}
std::cout<<"],\"live\":[";dataRow(-2,cppEmpty.pData,0);std::cout<<',';dataRow(-3,&L.str,L.getLength());std::cout<<',';dataRow(0,&rtl::str::EmptyStringImpl<rtl_uString>::data,0);for(auto [id,p]:live){std::cout<<',';dataRow(id,p.p,(p.bytes-10)/2);}
std::cout<<"],\"events\":[";c=false;for(auto const& e:events){if(c)std::cout<<',';c=true;std::cout<<'[';for(unsigned i=0;i<e.size();i++){if(i)std::cout<<',';std::cout<<e[i];}std::cout<<']';}events.clear();
std::cout<<"],\"result\":[";for(unsigned i=0;i<result.size();i++){if(i)std::cout<<',';std::cout<<result[i];}std::cout<<"]}";
}
int main(int argc,char** argv){rtl_allocateString=captureAlloc;rtl_freeString=captureFree;
if(argc>1){int g=std::atoi(argv[1]);sal_Unicode buf[]={65,0};switch(g){
case 0:{OUString x(buf,-1);break;}case 1:{OUString x(static_cast<sal_Unicode const*>(nullptr),1);break;}case 2:{OUString x(buf,1);svl::SharedString s(x);x.clear();std::cerr<<"before-self-move\n";s=std::move(s);std::cerr<<"after-self-move-before-length\n";volatile auto n=s.getLength();(void)n;break;}
case 3:{OUString x(buf,1);svl::SharedString a(x);auto const& ref=a.getString();svl::SharedString b(std::move(a));std::cerr<<"before-null-view-length\n";volatile auto n=ref.getLength();(void)n;break;}
case 4:{OUString x(buf,1);std::unique_ptr<svl::SharedString> a=std::make_unique<svl::SharedString>(x);auto const& ref=a->getString();a.reset();std::cerr<<"before-destroyed-view-length\n";volatile auto n=ref.getLength();(void)n;break;}}
return 0;}
std::vector<std::unique_ptr<OUString>> o(16);std::vector<std::unique_ptr<svl::SharedString>> s(16);std::vector<OUString const*> v(32,nullptr);std::vector<rtl_uString*> r(8,nullptr);
std::string op;int a,b,d,n;bool comma=false;std::cout<<'[';
while(std::cin>>op>>a>>b>>d>>n){std::vector<sal_Unicode> units(n);unsigned x;for(auto& c:units){std::cin>>x;c=x;}std::vector<long long> result;
if(op=="od")o[a]=std::make_unique<OUString>();
else if(op=="on")o[a]=std::make_unique<OUString>(units.data(),n);
else if(op=="oz"){units.push_back(0);o[a]=std::make_unique<OUString>(static_cast<sal_Unicode const*>(units.data()));}
else if(op=="oc")o[a]=std::make_unique<OUString>(*o[b]);
else if(op=="om")o[a]=std::make_unique<OUString>(std::move(*o[b]));
else if(op=="ol")o[a]=std::make_unique<OUString>(L);
else if(op=="ou")o[a]=std::make_unique<OUString>(sal_Unicode(b));
else if(op=="ora")o[a]=std::make_unique<OUString>(r[b]);
else if(op=="ort"){o[a]=std::make_unique<OUString>(r[b],SAL_NO_ACQUIRE);r[b]=nullptr;}
else if(op=="ov")o[a]=std::make_unique<OUString>(*v[b]);
else if(op=="oa")result.push_back(&(*o[a]=*o[b])==o[a].get());
else if(op=="oma")result.push_back(&(*o[a]=std::move(*o[b]))==o[a].get());
else if(op=="ocl")o[a]->clear();
else if(op=="ox")o[a].reset();
else if(op=="sd")s[a]=std::make_unique<svl::SharedString>();
else if(op=="so")s[a]=std::make_unique<svl::SharedString>(*o[b]);
else if(op=="sp")s[a]=std::make_unique<svl::SharedString>(b<0?nullptr:r[b],d<0?nullptr:r[d]);
else if(op=="sc")s[a]=std::make_unique<svl::SharedString>(*s[b]);
else if(op=="sm")s[a]=std::make_unique<svl::SharedString>(std::move(*s[b]));
else if(op=="sa")result.push_back(&(*s[a]=*s[b])==s[a].get());
else if(op=="sma")result.push_back(&(*s[a]=std::move(*s[b]))==s[a].get());
else if(op=="sx"){forgetShared(s[a].get());s[a].reset();}
else if(op=="eq")result={*s[a]==*s[b],*s[a]!=*s[b]};
else if(op=="sg"){v[a]=&s[b]->getString();result.push_back(viewId(v[a]));}
else if(op=="si"){v[a]=&s[b]->getIgnoreCaseString();result.push_back(viewId(v[a]));}
else if(op=="se"){auto const& empty=svl::SharedString::getEmptyString();v[a]=&empty.getString();v[d]=&empty.getIgnoreCaseString();result={&empty==&svl::SharedString::getEmptyString(),identify(empty.getData()),identify(empty.getDataIgnoreCase()),empty.isValid(),empty.isEmpty(),empty.getLength(),viewId(v[a]),viewId(v[d])};}
else if(op=="vg"){auto const& x=*v[a];result={x.getLength(),x.isEmpty()};result.push_back(x.getStr()==x.pData->buffer);for(int i=0;i<=x.getLength();i++)result.push_back(x.getStr()[i]);}
else if(op=="og"){auto const& x=*o[a];result={x.getLength(),x.isEmpty(),x.getStr()==x.pData->buffer};for(int i=0;i<=x.getLength();i++)result.push_back(x.getStr()[i]);}
else if(op=="rn")rtl_uString_newFromStr_WithLength(&r[a],units.data(),n);
else if(op=="ri")rtl_uString_intern(&r[a],o[b]->pData);
else if(op=="rx"){rtl_uString_release(r[a]);r[a]=nullptr;}
else if(op=="vd")v[a]=nullptr;
else if(op=="lg"){result={L.getLength(),L.getStr()==L.more.buffer,&L.str==reinterpret_cast<rtl_uString const*>(&L.more)};for(int i=0;i<=L.getLength();i++)result.push_back(L.getStr()[i]);}
else {std::cerr<<"Unknown caller";return 2;}
if(comma)std::cout<<',';comma=true;snapshot(o,s,v,r,result);
}
std::cout<<']';
for(auto& p:s)p.reset();for(auto& p:o)p.reset();for(auto p:r)if(p)rtl_uString_release(p);
assert(live.empty());
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
const compiled = spawnSync(
  "clang++",
  [...flags, `${target}/driver.cpp`, "-o", `${target}/driver`],
  { encoding: "utf8" },
);
writeFileSync(`${target}/compile.stderr`, compiled.stderr);
if (compiled.status !== 0) throw new Error(compiled.stderr);

const calls = [];
/** Appends caller input without implementing a native operation. @param op - Original operation selector. @param a - Destination. @param b - Source or scalar. @param d - Secondary source. @param units - Actual input units. @returns Nothing. */
function call(op, a = 0, b = 0, d = 0, units = []) {
  calls.push({ op, a, b, d, units });
}
call("lg");
call("od");
call("og");
call("oc", 1, 0);
call("om", 2, 0);
call("og", 0);
call("og", 2);
call("oma", 1, 2);
call("oma", 1, 1);
call("oa", 1, 1);
call("ocl", 1);
call("sd");
call("sd", 1);
call("eq", 0, 1);
call("sa", 0, 0);
call("sa", 0, 1);
call("sma", 0, 0);
call("sg", 0, 0);
call("si", 1, 0);
call("vg", 0);
call("sg", 2, 0);
call("se", 3, 0, 4);
call("se", 5, 0, 6);
call("vg", 3);
call("vg", 4);
for (let i = 0; i < 7; i++) call("vd", i);
call("sx", 0);
call("sx", 1);
for (let i = 0; i < 3; i++) call("ox", i);
const buffers = [
  [],
  [0],
  [65],
  [97],
  [65, 0, 66],
  [65535, 0, 55296, 56320],
  [66, 65],
  [65, 65],
  [65, 66, 65],
];
for (const units of buffers) {
  call("on", 0, 0, 0, units);
  call("og", 0);
  call("oc", 1, 0);
  call("om", 2, 0);
  call("og", 0);
  call("og", 2);
  call("oma", 0, 2);
  call("oa", 1, 0);
  call("oa", 1, 1);
  call("so", 0, 0);
  call("sc", 1, 0);
  call("eq", 0, 1);
  call("sg", 0, 0);
  call("sg", 1, 0);
  call("si", 2, 0);
  call("vg", 0);
  call("on", 3, 0, 0, [90, 0]);
  call("so", 2, 3);
  call("sa", 0, 2);
  call("vg", 0);
  call("sg", 3, 0);
  call("vg", 3);
  call("sm", 3, 0);
  call("sg", 4, 0);
  call("vg", 4);
  call("sa", 0, 1);
  call("vg", 0);
  call("sma", 0, 2);
  call("vg", 0);
  call("vg", 2);
  call("eq", 0, 3);
  call("eq", 1, 0);
  for (let i = 0; i < 5; i++) call("vd", i);
  for (let i = 0; i < 4; i++) call("sx", i);
  for (let i = 0; i < 4; i++) call("ox", i);
  call("oz", 0, 0, 0, [...units, 0, 91]);
  call("og", 0);
  call("ox", 0);
}
for (const first of buffers)
  for (const second of buffers) {
    call("rn", 0, 0, 0, first);
    call("rn", 1, 0, 0, second);
    call("rn", 2, 0, 0, [97]);
    call("sp", 0, 0, 2);
    call("sp", 1, 1, 2);
    call("sp", 2, -1, 1);
    call("sp", 3, 0, -1);
    call("sp", 4, -1, -1);
    call("sp", 5, 1, 0);
    call("eq", 0, 1);
    call("eq", 1, 0);
    call("eq", 0, 3);
    call("eq", 2, 4);
    call("eq", 0, 4);
    call("eq", 4, 0);
    call("eq", 1, 5);
    call("eq", 0, 0);
    call("sg", 0, 0);
    call("si", 1, 0);
    call("si", 2, 2);
    call("sg", 3, 2);
    call("vg", 0);
    call("vg", 1);
    call("vg", 2);
    call("vg", 3);
    call("sc", 6, 0);
    call("sm", 7, 1);
    call("sma", 6, 7);
    call("vg", 0);
    call("sa", 0, 6);
    call("vg", 0);
    call("vg", 1);
    call("sma", 0, 4);
    for (let i = 0; i < 4; i++) call("vd", i);
    for (let i = 0; i < 8; i++) call("sx", i);
    for (let i = 0; i < 3; i++) call("rx", i);
  }
call("ol", 0);
call("og", 0);
call("oc", 1, 0);
call("so", 0, 0);
call("sma", 0, 0);
call("sg", 0, 0);
call("vg", 0);
call("ov", 2, 0);
call("og", 2);
call("vd", 0);
call("sx", 0);
for (let i = 0; i < 3; i++) call("ox", i);
for (const unit of [0, 65, 127, 128, 32768, 55296, 65535]) {
  call("ou", 0, unit);
  call("og", 0);
  call("ox", 0);
}
call("rn", 0, 0, 0, [65, 0, 66]);
call("ora", 0, 0);
call("ort", 1, 0);
call("so", 0, 0);
call("sg", 0, 0);
call("ov", 2, 0);
call("vg", 0);
call("og", 2);
call("vd", 0);
call("sx", 0);
for (let i = 0; i < 3; i++) call("ox", i);
call("on", 0, 0, 0, [65, 66]);
call("ri", 0, 0);
call("ri", 1, 0);
call("sp", 0, 0, 1);
call("sc", 1, 0);
call("eq", 0, 1);
call("sg", 0, 0);
call("si", 1, 0);
call("ov", 1, 0);
call("og", 1);
call("sma", 1, 0);
call("vd", 0);
call("vd", 1);
call("sx", 0);
call("sx", 1);
call("ox", 0);
call("ox", 1);
call("rx", 0);
call("rx", 1);
const input =
  calls
    .map(
      /** Serializes initialized caller input only. @param c - Call. @returns Driver line. */ (c) =>
        [c.op, c.a, c.b, c.d, c.units.length, ...c.units].join(" "),
    )
    .join("\n") + "\n";
const run = spawnSync(`${target}/driver`, [], {
  encoding: "utf8",
  input,
  maxBuffer: 128 * 1024 * 1024,
});
writeFileSync(`${target}/output.json`, run.stdout);
writeFileSync(`${target}/run.stderr`, run.stderr);
if (run.status !== 0) throw new Error(`Native driver failed: ${run.signal} ${run.stderr}`);
const states = JSON.parse(run.stdout);
if (states.length !== calls.length) throw new Error("Incomplete capture");
const dependencies = execFileSync("clang++", [...flags, "-MM", `${target}/driver.cpp`], {
  encoding: "utf8",
})
  .split(/\s+/)
  .filter(
    /** Selects original repository header dependencies only. @param path - Compiler dependency. @returns Original source flag. */ (
      path,
    ) => path.startsWith(upstream + "/"),
  );
for (const path of new Set(dependencies)) original(path.slice(upstream.length + 1));
const guardExpressions = ["nLen >= 0", "pCharStr || nLen == 0"];
const guards = guardExpressions.map(
  /** Captures original constructor assertions. @param expression - Native expression. @param index - Driver selector. @returns Native guard. */ (
    expression,
    index,
  ) => {
    const result = spawnSync(`${target}/driver`, [String(index)], { encoding: "utf8" });
    writeFileSync(`${target}/guard-${index}.stderr`, result.stderr);
    if (result.signal !== "SIGABRT" || !result.stderr.includes(expression))
      throw new Error(`Missing native assertion: ${expression}`);
    return { index, expression, signal: result.signal };
  },
);
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
const validSanitized = spawnSync(`${target}/driver-asan`, [], {
  encoding: "utf8",
  input,
  maxBuffer: 128 * 1024 * 1024,
  env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
});
writeFileSync(`${target}/valid-asan.stderr`, validSanitized.stderr);
if (validSanitized.status !== 0 || validSanitized.stdout !== run.stdout)
  throw new Error("Sanitized defined capture differs: " + validSanitized.stderr);
const diagnostics = [
  { index: 2, marker: "after-self-move-before-length", diagnostic: "heap-use-after-free" },
  { index: 3, marker: "before-null-view-length", diagnostic: "member access within null pointer" },
  { index: 4, marker: "before-destroyed-view-length", diagnostic: "heap-use-after-free" },
].map(
  /** Records invalid original lifetime diagnostics without post-UB golden values. @param c - Diagnostic selector. @returns Deterministic pre-UB/diagnostic evidence. */ (
    c,
  ) => {
    const result = spawnSync(`${target}/driver-asan`, [String(c.index)], {
      encoding: "utf8",
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
    });
    writeFileSync(`${target}/invalid-${c.index}.stderr`, result.stderr);
    if (
      result.status === 0 ||
      !result.stderr.includes(c.marker) ||
      !result.stderr.includes(c.diagnostic)
    )
      throw new Error(`Missing lifetime diagnostic ${c.index}: ${result.stderr}`);
    return { ...c, definedResult: false };
  },
);
const compileGuards = [
  {
    name: "unterminated-literal",
    caller: "constexpr char16_t bad[]={65,66}; constexpr rtl::OUStringLiteral invalid(bad);",
    diagnostic: "constant expression",
  },
  {
    name: "deleted-nullptr",
    caller: "void caller(){OUString invalid(nullptr);}",
    diagnostic: "deleted constructor",
  },
  {
    name: "deleted-int",
    caller: "void caller(){OUString invalid(1);}",
    diagnostic: "deleted constructor",
  },
].map(
  /** Captures original compile-time constructor constraints without replacing their bodies. @param c - Original caller. @returns Compiler guard. */ (
    c,
  ) => {
    const path = `${target}/compile-guard-${c.name}.cpp`;
    writeFileSync(path, "#include <svl/sharedstring.hxx>\n" + c.caller + "\n");
    const result = spawnSync("clang++", [...flags, "-fsyntax-only", path], { encoding: "utf8" });
    writeFileSync(`${target}/compile-guard-${c.name}.stderr`, result.stderr);
    if (result.status === 0 || !result.stderr.includes(c.diagnostic))
      throw new Error(`Missing compile guard ${c.name}: ${result.stderr}`);
    return { ...c, accepted: false };
  },
);
const record = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources)
      .sort()
      .map(
        /** Records full original blob digests. @param pair - Original file and bytes. @returns Digest pair. */ ([
          path,
          text,
        ]) => [path, hash(text)],
      ),
  ),
  scopeHashes: Object.fromEntries(
    Object.entries({ ...scopes, reverse, reverseWrapper }).map(
      /** Records unchanged original scopes. @param pair - Scope bytes. @returns Digest pair. */ ([
        key,
        text,
      ]) => [key, hash(text)],
    ),
  ),
  configuration: { flags, typesHash: hash(types), globalHash: hash(global) },
  driverHash: hash(driver),
  statesHash: hash(run.stdout),
  calls,
  states,
  guards,
  diagnostics,
  compileGuards,
};
const check = process.argv.includes("--check"),
  write = process.argv.includes("--write");
if (check === write) throw new Error("Use exactly --check or --write");
if (write) writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native SharedString fixture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    calls: calls.length,
    sourceFiles: Object.keys(sources).length,
    guards: guards.length,
    diagnostics: diagnostics.length,
    driverHash: record.driverHash,
  }),
);
