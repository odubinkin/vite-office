/** @fileoverview Captures original type assignability, exact table/equality and ASCII/assignment reference ownership using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-assignability-native";
const fixture = "apps/office/src/cppu/source/typelib/native-assignability-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include <typelib/typedescription.h>
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <initializer_list>
#include <string>
#include <vector>
#include "typelib.cxx"
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using I=typelib_InterfaceTypeDescription;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
struct Node{R*r;bool owned;};
void matrix(){std::vector<Node>nodes{{nullptr,false}};for(int j=0;j<15;j++){R*r=*typelib_static_type_getByTypeClass(static_cast<typelib_TypeClass>(j));D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);typelib_typedescription_release(d);nodes.push_back({r,false});}R*root=*typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE);
 auto compound=[&](typelib_TypeClass c,char const*n,R*b){D*d=nullptr;typelib_typedescription_new(&d,c,rtl::OUString::createFromAscii(n).pData,b,0,nullptr);R*r=d->pWeakRef;nodes.push_back({r,true});return r;};
 compound(typelib_TypeClass_ENUM,"matrix.EnumA",nullptr);compound(typelib_TypeClass_ENUM,"matrix.EnumB",nullptr);
 R*alias=nullptr;typelib_typedescriptionreference_newByAsciiName(&alias,typelib_TypeClass_LONG,"matrix.LongAlias");nodes.push_back({alias,true});
 for(auto c:{typelib_TypeClass_STRUCT,typelib_TypeClass_EXCEPTION}){std::string prefix=c==typelib_TypeClass_STRUCT?"matrix.Struct":"matrix.Exception";R*a=compound(c,(prefix+"A").c_str(),nullptr);compound(c,(prefix+"B").c_str(),nullptr);R*d=compound(c,(prefix+"Child").c_str(),a);compound(c,(prefix+"Grandchild").c_str(),d);}
 for(auto e:{nodes[7].r,nodes[12].r}){R*r=nullptr;typelib_static_sequence_type_init(&r,e);nodes.push_back({r,false});}
 auto iface=[&](char const*n,std::initializer_list<R*>bs){std::vector<R*>bases(bs);I*i=nullptr;typelib_typedescription_newMIInterface(&i,rtl::OUString::createFromAscii(n).pData,0,0,0,0,0,bases.size(),bases.data(),0,nullptr);R*r=i->aBase.pWeakRef;nodes.push_back({r,true});return r;};
 nodes.push_back({root,false});R*ia=iface("matrix.IA",{root});R*ib=iface("matrix.IB",{root});R*ic=iface("matrix.IC",{ia});iface("matrix.ID",{ia,ib});iface("matrix.IE",{ib,ic});
 for(auto c:{typelib_TypeClass_INTERFACE_METHOD,typelib_TypeClass_INTERFACE_ATTRIBUTE})for(auto suffix:{"A","B"}){R*r=nullptr;typelib_typedescriptionreference_newByAsciiName(&r,c,(std::string("matrix.Weak")+std::to_string(c)+suffix).c_str());nodes.push_back({r,true});}
 sal_Unicode a[]={101,113,0,65},b[]={101,113,0,66};for(auto*p:{a,b}){D*d=nullptr;rtl::OUString n(p,4);typelib_typedescription_newEnum(&d,n.pData,0,0,nullptr,nullptr);nodes.push_back({d->pWeakRef,true});}
 emit({static_cast<sal_Int32>(nodes.size())});for(auto&n:nodes)ref(n.r);for(int i=0;i<11;i++)for(int j=0;j<11;j++)emit({i,j,s_aAssignableFromTab[i][j]});
 for(size_t i=0;i<nodes.size();i++)for(size_t j=0;j<nodes.size();j++){auto*a=nodes[i].r,*b=nodes[j].r;bool value=typelib_typedescriptionreference_isAssignableFrom(a,b);int descriptions=-1,equal=-1;if(a&&b&&a->pType&&b->pType){descriptions=typelib_typedescription_isAssignableFrom(a->pType,b->pType);equal=typelib_typedescription_equals(a->pType,b->pType);}emit({static_cast<sal_Int32>(i),static_cast<sal_Int32>(j),value,descriptions,equal});ref(a);ref(b);}
 for(auto it=nodes.rbegin();it!=nodes.rend();++it)if(it->owned)typelib_typedescriptionreference_release(it->r);
}
void asciiNames(){R*r=nullptr;for(int byte=0;byte<=127;byte++){std::string n=byte?std::string("ascii.")+static_cast<char>(byte)+".End":std::string();typelib_typedescriptionreference_newByAsciiName(&r,typelib_TypeClass_ENUM,n.c_str());emit({byte});ref(r);R*copy=nullptr;typelib_typedescriptionreference_newByAsciiName(&copy,typelib_TypeClass_STRING,n.c_str());emit({copy==r});ref(r);ref(copy);typelib_typedescriptionreference_release(copy);ref(r);}char stopped[]={'a','s','c','i','i','.','S','t','o','p',0,'X',0};typelib_typedescriptionreference_newByAsciiName(&r,typelib_TypeClass_ENUM,stopped);ref(r);R*retained=r;typelib_typedescriptionreference_acquire(retained);typelib_typedescriptionreference_newByAsciiName(&r,typelib_TypeClass_TYPEDEF,"missing.Alias");emit({r==nullptr});ref(retained);typelib_typedescriptionreference_release(retained);}
void assignment(){rtl::OUString an=rtl::OUString::createFromAscii("assign.A"),bn=rtl::OUString::createFromAscii("assign.B");R*a=nullptr,*b=nullptr;typelib_typedescriptionreference_new(&a,typelib_TypeClass_ENUM,an.pData);typelib_typedescriptionreference_new(&b,typelib_TypeClass_ENUM,bn.pData);ref(a);ref(b);text(an.pData);text(bn.pData);typelib_typedescriptionreference_assign(&a,b);emit({a==b});ref(a);ref(b);text(an.pData);text(bn.pData);typelib_typedescriptionreference_assign(&a,b);ref(a);ref(b);typelib_typedescriptionreference_release(a);ref(b);typelib_typedescriptionreference_release(b);text(an.pData);text(bn.pData);R*nil=nullptr;typelib_typedescriptionreference_assign(&nil,nullptr);emit({nil==nullptr});
 rtl::OUString en=rtl::OUString::createFromAscii("assign.Element"),sn=rtl::OUString::createFromAscii("assign.Sequence");R*element=nullptr;typelib_typedescriptionreference_new(&element,typelib_TypeClass_ENUM,en.pData);D*sequence=nullptr;typelib_typedescription_new(&sequence,typelib_TypeClass_SEQUENCE,sn.pData,element,0,nullptr);R*dest=sequence->pWeakRef;typelib_typedescriptionreference_release(element);ref(dest);ref(element);text(en.pData);text(sn.pData);typelib_typedescriptionreference_assign(&dest,element);emit({dest==element});ref(dest);text(en.pData);text(sn.pData);typelib_typedescriptionreference_release(dest);text(en.pData);text(sn.pData);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="matrix")matrix();else if(mode=="ascii-names")asciiNames();else if(mode=="assignment")assignment();else if(mode=="bad-ascii-name"){R*r=nullptr;char n[]={static_cast<char>(128),0};typelib_typedescriptionreference_newByAsciiName(&r,typelib_TypeClass_ENUM,n);}else return 2;return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized).filter(
    /** Avoids linking typelib twice because the observation caller includes its complete unchanged source. @param path - Genuine object path. @returns Whether its full owner is linked separately. */
    (path) => !path.endsWith("cppu_source_typelib_typelib.cxx.o"),
  );
  const binary = `${target}/${sanitized ? "asan" : "normal"}-caller`;
  const dependency = `${binary}.d`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/typelib",
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
for (const mode of ["matrix", "ascii-names", "assignment"]) {
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
const assertions = [];
for (const mode of ["bad-ascii-name"]) {
  const result = capture(normal, mode);
  if (result.signal !== "SIGABRT" || !/Assertion failed/.test(result.stderr.toString()))
    throw new Error(`Original ASCII wrapper guard failed: ${mode}`);
  assertions.push({ mode, signal: result.signal, stderr: result.stderr.toString() });
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
  assertions,
  scope:
    "Full unchanged original typelib.cxx and SAL/CPPU dependency owners, normal and ASan/UBSan. Complete original primitive compatibility table, nullable reference predicate, ANY/identity/name shortcuts, scalar bounds, struct/exception and multiple-interface ancestry, exact description-prefix equality, sequence distinctions, original ASCII wrapper ownership/registry replacement/typedef miss, self assignment and acquire-before-release of an element owned only by its old sequence destination. Every initialized name/count/common record is retained; no freed or uninitialized field is read. Distinct same-class scalar aliases and embedded-zero names are initialized synthetic native callers, not ordinary generated producers. Actual data conversion/value ranges, physical pointer ABI, native mutex/thread scheduling/shutdown, nonidentical null assignment, malformed JS inputs and full consumer QA remain unverified; system libraries are not instrumented and leak detection is disabled. No original source method/body is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original static type observations");
console.log(
  `Original assignability observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
