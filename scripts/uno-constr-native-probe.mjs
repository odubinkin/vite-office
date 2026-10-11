/** @fileoverview Captures complete original UNO default construction and true type/ownership fields using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-constr-native";
const fixture = "apps/office/src/cppu/source/uno/native-constr-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include "constr.hxx"
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <initializer_list>
#include <string>
#include <vector>
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using P=typelib_CompoundTypeDescription;using C=typelib_TypeClass;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
int marker=17;
void prepare(void*p,R*r){if(r->eTypeClass==typelib_TypeClass_ANY)*static_cast<uno_Any*>(p)={nullptr,&marker,&marker};else if(r->eTypeClass==typelib_TypeClass_VOID)*static_cast<sal_Int32*>(p)=marker;}
void observe(void*p,R*r){switch(r->eTypeClass){
case typelib_TypeClass_VOID:emit({*static_cast<sal_Int32*>(p)==marker});break;
case typelib_TypeClass_CHAR:emit({*static_cast<sal_Unicode*>(p)});break;
case typelib_TypeClass_BOOLEAN:emit({*static_cast<sal_Bool*>(p)});break;
case typelib_TypeClass_BYTE:emit({*static_cast<sal_Int8*>(p)});break;
case typelib_TypeClass_SHORT:case typelib_TypeClass_UNSIGNED_SHORT:emit({*static_cast<sal_Int16*>(p)});break;
case typelib_TypeClass_LONG:case typelib_TypeClass_UNSIGNED_LONG:case typelib_TypeClass_ENUM:emit({*static_cast<sal_Int32*>(p)});break;
case typelib_TypeClass_HYPER:case typelib_TypeClass_UNSIGNED_HYPER:case typelib_TypeClass_DOUBLE:{sal_Int32 words[2];std::memcpy(words,p,8);emit({words[0],words[1]});break;}
case typelib_TypeClass_FLOAT:{sal_Int32 word;std::memcpy(&word,p,4);emit({word});break;}
case typelib_TypeClass_STRING:text(*static_cast<rtl_uString**>(p));break;
case typelib_TypeClass_TYPE:ref(*static_cast<R**>(p));break;
case typelib_TypeClass_ANY:{auto*a=static_cast<uno_Any*>(p);emit({a->pData==a,a->pReserved==&marker,a->pType==cppu::g_pVoidType});ref(a->pType);break;}
case typelib_TypeClass_SEQUENCE:{auto*s=*static_cast<uno_Sequence**>(p);emit({s==&cppu::g_emptySeq,s->nRefCount,s->nElements,s->elements[0]});break;}
case typelib_TypeClass_INTERFACE:emit({*static_cast<void**>(p)==nullptr});break;
default:std::exit(4);}}
void cleanup(void*p,R*r){switch(r->eTypeClass){case typelib_TypeClass_STRING:rtl_uString_release(*static_cast<rtl_uString**>(p));break;case typelib_TypeClass_TYPE:typelib_typedescriptionreference_release(*static_cast<R**>(p));break;case typelib_TypeClass_ANY:typelib_typedescriptionreference_release(static_cast<uno_Any*>(p)->pType);break;case typelib_TypeClass_SEQUENCE:osl_atomic_decrement(&(*static_cast<uno_Sequence**>(p))->nRefCount);break;default:break;}}
void construct(int mode,void*p,R*r,D*d){if(mode==0)cppu::_defaultConstructData(p,r,nullptr);else if(mode==1)cppu::_defaultConstructData(p,r,d);else if(mode==2)uno_type_constructData(p,r);else uno_constructData(p,d);}
void scalars(){for(int c=0;c<=22;c++){if(c>14&&c!=22)continue;R*r=*typelib_static_type_getByTypeClass(static_cast<C>(c));D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int m=0;m<4;m++){void*p=std::malloc(24);std::memset(p,0xa5,24);prepare(p,r);emit({c,m});ref(r);construct(m,p,r,d);observe(p,r);ref(r);cleanup(p,r);ref(r);std::free(p);}typelib_typedescription_release(d);}}
D*makeEnum(){rtl::OUString name=rtl::OUString::createFromAscii("default.Enum"),low=rtl::OUString::createFromAscii("Low"),high=rtl::OUString::createFromAscii("High");rtl_uString*names[]={low.pData,high.pData};sal_Int32 values[]={-23,19};D*d=nullptr;typelib_typedescription_newEnum(&d,name.pData,-23,2,names,values);typelib_typedescription_register(&d);return d;}
D*makeSequence(){rtl::OUString name=rtl::OUString::createFromAscii("[]byte");D*d=nullptr;typelib_typedescription_new(&d,typelib_TypeClass_SEQUENCE,name.pData,*typelib_static_type_getByTypeClass(typelib_TypeClass_BYTE),0,nullptr);typelib_typedescription_register(&d);return d;}
D*makeCompound(char const*label,C cls,D*base,std::vector<R*>const&types){rtl::OUString name=rtl::OUString::createFromAscii(label);std::vector<rtl::OUString>names;names.reserve(types.size());for(size_t i=0;i<types.size();i++){std::string n="m"+std::to_string(i);names.push_back(rtl::OUString::createFromAscii(n.c_str()));}std::vector<typelib_CompoundMember_Init>members;for(size_t i=0;i<types.size();i++)members.push_back({types[i]->eTypeClass,types[i]->pTypeName,names[i].pData});D*d=nullptr;typelib_typedescription_new(&d,cls,name.pData,base?base->pWeakRef:nullptr,types.size(),members.data());typelib_typedescription_register(&d);return d;}
void fields(void*p,P*d,int action){if(d->pBaseTypeDescription)fields(p,d->pBaseTypeDescription,action);for(int i=d->nMembers;i--;){void*v=static_cast<char*>(p)+d->pMemberOffsets[i];R*r=d->ppTypeRefs[i];if(r->eTypeClass==typelib_TypeClass_STRUCT||r->eTypeClass==typelib_TypeClass_EXCEPTION){D*sub=nullptr;typelib_typedescriptionreference_getDescription(&sub,r);if(action==1){emit({i,d->pMemberOffsets[i],r->eTypeClass});ref(r);}fields(v,reinterpret_cast<P*>(sub),action);typelib_typedescription_release(sub);}else if(action==0)prepare(v,r);else if(action==1){emit({i,d->pMemberOffsets[i],r->eTypeClass});observe(v,r);}else cleanup(v,r);}}
void records(){D*e=makeEnum(),*seq=makeSequence();auto type=[](C c){return *typelib_static_type_getByTypeClass(c);};D*base=makeCompound("default.Base",typelib_TypeClass_STRUCT,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_TYPE),type(typelib_TypeClass_ANY)});D*derived=makeCompound("default.Derived",typelib_TypeClass_STRUCT,base,{seq->pWeakRef,e->pWeakRef});D*nested=makeCompound("default.Nested",typelib_TypeClass_STRUCT,nullptr,{derived->pWeakRef,type(typelib_TypeClass_INTERFACE),type(typelib_TypeClass_BOOLEAN)});D*exc=makeCompound("default.Exception",typelib_TypeClass_EXCEPTION,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_INTERFACE)});D*subExc=makeCompound("default.DerivedException",typelib_TypeClass_EXCEPTION,exc,{type(typelib_TypeClass_ANY),type(typelib_TypeClass_LONG)});D*empty=makeCompound("default.Empty",typelib_TypeClass_STRUCT,nullptr,{});D*baseOnly=makeCompound("default.BaseOnly",typelib_TypeClass_STRUCT,base,{});
for(D*d:{e,base,derived,nested,exc,subExc,empty,baseOnly})for(int m=0;m<4;m++){void*p=std::malloc(d->nSize);std::memset(p,0xa5,d->nSize);auto*compound=reinterpret_cast<P*>(d);if(d!=e)fields(p,compound,0);emit({m});ref(d->pWeakRef);desc(d);construct(m,p,d->pWeakRef,d);if(d==e)observe(p,d->pWeakRef);else fields(p,compound,1);ref(d->pWeakRef);desc(d);if(d!=e)fields(p,compound,2);ref(d->pWeakRef);desc(d);std::free(p);}for(D*d:{baseOnly,empty,subExc,exc,nested,derived,base,seq,e})typelib_typedescription_release(d);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="scalars")scalars();else if(mode=="records")records();else return 2;return 0;}
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
for (const mode of ["scalars", "records"]) {
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
    "Complete original constr.hxx _defaultConstructData/_defaultConstructStruct and actual data.cxx defaultConstructStruct/C wrappers, with all72 full unchanged SAL/CPPU translation units normal and ASan/UBSan. Full fundamental/default enum/real registered compound/derived/nested/exception/empty/base-only records are observed using actual factories, real descriptions, poisoned unconstructed caller allocations and initialized Any reserved witnesses. Cleanup is caller-selected actual string/reference/atomic release only, not an unported portable destructor substitute or executed full destructor/Any/Sequence engine. Logical source member-offset addressing and caller-owned cells adapt field addresses without binary JS memory/layout or generated struct/provider substitutes. Fundamental initialized values and exact counts/name/full description fields, held/temporary description ownership and complete output hashes are compared. Normal diagnostic-only VOID default no-op is observed separately from a certified supported-default contract. Physical binary ABI/pointer/object lifetime, malformed/uninitialized storage use, full copy/destruction/assignment/Sequence/queryInterface/Any/Reference/default RuntimeException/case/service/UI consumers, debug1/concurrency/shutdown and full upstream QA remain unfinished or unverified; system libraries uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO primitive observations");
console.log(
  `Original UNO default construction observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
