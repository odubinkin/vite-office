/** @fileoverview Captures original UNO primitive callbacks, sequence-size arithmetic and empty sequence/Any ownership using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-prim-native";
const fixture = "apps/office/src/cppu/source/uno/native-prim-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include "prim.hxx"
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <initializer_list>
#include <limits>
#include <string>
#include <vector>
#if OSL_DEBUG_LEVEL > 0
constexpr sal_Int32 debugBranch=1;
#else
constexpr sal_Int32 debugBranch=0;
#endif
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using I=typelib_InterfaceTypeDescription;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
void layout(){emit({sizeof(sal_Sequence),alignof(sal_Sequence),offsetof(sal_Sequence,nRefCount),offsetof(sal_Sequence,nElements),offsetof(sal_Sequence,elements),SAL_SEQUENCE_HEADER_SIZE,sizeof(uno_Any),alignof(uno_Any),offsetof(uno_Any,pType),offsetof(uno_Any,pData),offsetof(uno_Any,pReserved),sizeof(uno_Interface),offsetof(uno_Interface,acquire),offsetof(uno_Interface,release),offsetof(uno_Interface,pDispatcher),sizeof(uno_Mapping),offsetof(uno_Mapping,acquire),offsetof(uno_Mapping,release),offsetof(uno_Mapping,mapInterface),debugBranch});}
std::vector<sal_Int32> sizes(){return {INT32_MIN,INT32_MIN+1,-65536,-16,-8,-2,-1,0,1,2,3,4,8,12,16,24,32,255,256,65535,65536,0x10000000,0x20000000,0x7ffffff0,INT32_MAX};}
void scalar(){auto v=sizes();emit({static_cast<sal_Int32>(v.size())});auto observe=[](sal_Int32 a,sal_Int32 b){sal_uInt32 n=cppu::calcSeqMemSize(a,b);emit({a,b,static_cast<sal_Int32>(n),n>0x7fffffffU,n==0});};for(auto a:v)for(auto b:v)observe(a,b);for(auto a:v)if(a>0){sal_Int64 limit=(0xffffffffULL-SAL_SEQUENCE_HEADER_SIZE)/a;if(limit>INT32_MAX)limit=INT32_MAX;for(int d=-2;d<=2;d++)if(limit+d>=0&&limit+d<=INT32_MAX)observe(a,limit+d);}}
void seq(){emit({cppu::g_emptySeq.nRefCount,cppu::g_emptySeq.nElements,cppu::g_emptySeq.elements[0]});}
void lifetime(){seq();auto*a=cppu::createEmptySequence();emit({a==&cppu::g_emptySeq});seq();auto*b=cppu::createEmptySequence();emit({a==b});seq();osl_atomic_decrement(&b->nRefCount);seq();osl_atomic_decrement(&a->nRefCount);seq();for(auto n:{INT32_MAX,INT32_MIN,-1,0}){cppu::g_emptySeq.nRefCount=n;emit({cppu::createEmptySequence()==&cppu::g_emptySeq});seq();}cppu::g_emptySeq.nRefCount=1;seq();emit({cppu::g_pVoidType==nullptr});R*v=cppu::_getVoidType();emit({cppu::g_pVoidType==v});ref(v);R*w=cppu::_getVoidType();emit({w==v});ref(v);TYPE_ACQUIRE(v);ref(v);typelib_typedescriptionreference_release(v);typelib_typedescriptionreference_release(w);ref(v);int marker=17;uno_Any first{nullptr,&marker,&marker};cppu::CONSTRUCT_EMPTY_ANY(&first);emit({first.pData==&first,first.pData!=nullptr,first.pReserved==&marker,first.pType==v});ref(v);typelib_typedescriptionreference_release(first.pType);ref(v);uno_Any second{nullptr,nullptr,nullptr};cppu::CONSTRUCT_EMPTY_ANY(&second);emit({second.pData==&second,second.pData!=nullptr,second.pReserved==nullptr,second.pType==v});ref(v);typelib_typedescriptionreference_release(second.pType);typelib_typedescriptionreference_release(v);ref(cppu::g_pVoidType);}
uno_Interface left,right;uno_Mapping mapping;int balance=0;I*known=nullptr;
void acq(uno_Interface*p){emit({1,p==&left});++balance;}
void rel(uno_Interface*p){emit({2,p==&left});--balance;}
void customAcq(void*p){emit({3,p==&left});++balance;}
void customRel(void*p){emit({4,p==&left});--balance;}
void map(uno_Mapping*m,void**out,void*p,I*d){emit({5,m==&mapping,*out==nullptr,p==&left,d==known});desc(&d->aBase);*out=&right;}
void callbacks(){left={acq,rel,nullptr};right={acq,rel,nullptr};mapping={nullptr,nullptr,map};for(bool custom:{false,true}){cppu::_acquire(nullptr,custom?customAcq:nullptr);cppu::_release(nullptr,custom?customRel:nullptr);emit({balance});cppu::_acquire(&left,custom?customAcq:nullptr);emit({balance});cppu::_release(&left,custom?customRel:nullptr);emit({balance});}emit({cppu::_map(nullptr,nullptr,nullptr,nullptr)==nullptr});R*r=*typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);known=reinterpret_cast<I*>(d);ref(r);desc(d);emit({cppu::_map(&left,nullptr,d,&mapping)==&right});ref(r);desc(d);emit({cppu::_map(&left,r,nullptr,&mapping)==&right});ref(r);desc(d);typelib_typedescription_release(d);ref(r);
 R a=*r,b=*r;emit({cppu::_type_equals(&a,&b)});b.eTypeClass=typelib_TypeClass_ENUM;emit({cppu::_type_equals(&a,&b)});b=*r;rtl::OUString n=rtl::OUString::createFromAscii("other");b.pTypeName=n.pData;emit({cppu::_type_equals(&a,&b)});sal_Unicode x[]={65,0,66},y[]={65,0,67};rtl::OUString xn(x,3),yn(y,3);a.pTypeName=xn.pData;b.pTypeName=yn.pData;emit({cppu::_type_equals(&a,&b),cppu::_type_equals(&a,&a),cppu::_type_equals(nullptr,nullptr)});text(xn.pData);text(yn.pData);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="layout")layout();else if(mode=="scalar")scalar();else if(mode=="lifetime")lifetime();else if(mode=="callbacks")callbacks();else return 2;return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  for (const unit of ["any", "data", "sequence"]) {
    const source = `${upstream}/cppu/source/uno/${unit}.cxx`;
    loadUnicodeOriginal(native.sources, `cppu/source/uno/${unit}.cxx`);
    const object = `${target}/${sanitized ? "asan" : "normal"}-uno-${unit}.o`;
    const dependency = object + ".d";
    native.run(
      "clang++",
      [
        ...native.flags,
        ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
        "-DCPPU_DLLIMPLEMENTATION",
        "-MMD",
        "-MF",
        dependency,
        "-c",
        source,
        "-o",
        object,
      ],
      `${sanitized ? "asan" : "normal"}-uno-${unit}`,
    );
    for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
      if (file.startsWith(`${upstream}/`))
        loadUnicodeOriginal(native.sources, originalDependency(file));
    objects.push(object);
  }
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  const dependency = `${binary}.d`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/uno",
      "-DCPPU_DLLIMPLEMENTATION",
      "-MMD",
      "-MF",
      dependency,
      `${target}/driver.cpp`,
      ...objects,
      "-framework",
      "CoreFoundation",
      "-framework",
      "Foundation",
      "-pthread",
      "-lz",
      "-Wl,-dead_strip",
      "-o",
      binary,
    ],
    `link-${sanitized ? "asan" : "normal"}`,
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  return binary;
}
/** Captures complete original process output, including terminal status and all diagnostics. @param binary - Actual original caller. @param mode - Caller mode. @returns Complete process result. */
function capture(binary, mode) {
  const result = spawnSync(binary, [mode], {
    maxBuffer: 128 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(`${binary}.${mode}`, result.stdout ?? "");
  writeFileSync(`${binary}.${mode}.stderr`, result.stderr ?? "");
  native.manifest.commands.push({
    tool: binary,
    argv: [mode],
    exitCode: result.status,
    signal: result.signal,
  });
  native.save();
  return result;
}
const normal = build(false),
  sanitized = build(true),
  captures = {};
for (const mode of ["layout", "scalar", "lifetime", "callbacks"]) {
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  if (
    first.status !== 0 ||
    second.status !== 0 ||
    !first.stdout.equals(second.stdout) ||
    /AddressSanitizer|runtime error:/.test(second.stderr.toString())
  )
    throw new Error(`Original ${mode} capture failed: ${first.stderr}\n${second.stderr}`);
  captures[mode] = {
    byteLength: first.stdout.length,
    digest: hash(first.stdout),
    gzipBase64: gzipSync(first.stdout).toString("base64"),
  };
}
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes every complete original input. @param entry - Original source pair. @returns Full hash entry. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  scope:
    "Full unchanged original prim.hxx operations and 72 full SAL/CPPU native dependency objects including complete original any/data/sequence translation units, normal and ASan/UBSan. Original declarations/native layout inform logical sequence header offset without claiming a JS binary ABI. Signed32 input conversion and unsigned64 wrap/unsigned32 sequence-size results, static empty sequence initial1/count wrap/identity, actual lazy global VOID pointer acquisition and TYPE_ACQUIRE alias, normal OSL_DEBUG_LEVEL0 empty Any self-data/untouched initialized reserved field, callback/null/default C interface slots and mapping temporary danger-description ownership are observed. Caller-supplied callback witnesses only report actual arguments/order/return pointer/count values; they do not implement a generated interface query provider, mapping service or replace native source bodies. Fully initialized copied C reference records are const equality inputs only, not registry/allocation owners. Preserve actual source empty Any reserved-field noninitialization and negative scalar wrap results. Physical pointer/object/data ABI/lifetime, unsupported invalid storage/callbacks/classes, debug1 configuration, native thread scheduling/shutdown and full data/Any/Sequence/Reference/default exceptions/case/UI consumers remain unfinished or unverified; system libraries are uninstrumented and leak detection is disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO primitive observations");
console.log(
  `Original UNO primitive observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
