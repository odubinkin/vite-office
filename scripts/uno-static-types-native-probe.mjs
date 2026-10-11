/** @fileoverview Captures original complete static-type bootstrap, initializer records and source-defined reference ownership using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-static-types-native";
const fixture = "apps/office/src/cppu/source/typelib/native-static-types-cases.json";
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
#include "static_types.cxx"
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using I=typelib_InterfaceTypeDescription;using P=typelib_CompoundTypeDescription;using M=typelib_InterfaceMethodTypeDescription;using E=typelib_EnumTypeDescription;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
void compound(P*p,bool flags=false){desc(&p->aBase);emit({p->pBaseTypeDescription==nullptr,p->nMembers,p->pMemberOffsets==nullptr,p->ppTypeRefs==nullptr,p->ppMemberNames==nullptr});if(p->pBaseTypeDescription)desc(&p->pBaseTypeDescription->aBase);for(int i=0;i<p->nMembers;i++){emit({p->pMemberOffsets[i]});ref(p->ppTypeRefs[i]);if(p->ppMemberNames)text(p->ppMemberNames[i]);}if(flags){auto*s=reinterpret_cast<typelib_StructTypeDescription*>(p);emit({s->pParameterizedTypes==nullptr});if(s->pParameterizedTypes)for(int i=0;i<p->nMembers;i++)emit({s->pParameterizedTypes[i]});}}
void iface(I*i){desc(&i->aBase);emit({i->nBaseTypes,i->nMembers,i->nAllMembers,i->pBaseTypeDescription==nullptr,i->ppBaseTypes==nullptr,i->ppMembers==nullptr,i->ppAllMembers==nullptr,i->pMapMemberIndexToFunctionIndex==nullptr,i->nMapFunctionIndexToMemberIndex,i->pMapFunctionIndexToMemberIndex==nullptr});for(int n=0;n<i->nBaseTypes;n++)desc(&i->ppBaseTypes[n]->aBase);if(i->ppAllMembers){emit({static_cast<sal_Int32>(i->aUik.m_Data1),i->aUik.m_Data2,i->aUik.m_Data3,static_cast<sal_Int32>(i->aUik.m_Data4),static_cast<sal_Int32>(i->aUik.m_Data5)});for(int n=0;n<i->nAllMembers;n++)ref(i->ppAllMembers[n]);}}
void method(M*m){desc(&m->aBase.aBase);emit({m->aBase.nPosition,m->bOneWay,m->nParams,m->pParams==nullptr,m->nExceptions,m->ppExceptions==nullptr,m->pBaseRef==nullptr,m->nIndex});text(m->aBase.pMemberName);ref(m->pReturnTypeRef);for(int n=0;n<m->nParams;n++){auto&p=m->pParams[n];text(p.pName);ref(p.pTypeRef);emit({p.bIn,p.bOut});}for(int n=0;n<m->nExceptions;n++)ref(m->ppExceptions[n]);iface(m->pInterface);}
void bootstrap(int first){if(first>=0){auto c=static_cast<typelib_TypeClass>(first);R**a=typelib_static_type_getByTypeClass(c);emit({first,a==typelib_static_type_getByTypeClass(c)});ref(*a);}for(int j=0;j<15;j++){auto c=static_cast<typelib_TypeClass>(j);R**a=typelib_static_type_getByTypeClass(c);emit({j,a==typelib_static_type_getByTypeClass(c)});ref(*a);R*same=*a;*a=same;emit({*typelib_static_type_getByTypeClass(c)==same});}
 for(auto c:{typelib_TypeClass_INTERFACE,typelib_TypeClass_EXCEPTION}){R**a=typelib_static_type_getByTypeClass(c);emit({c,a==typelib_static_type_getByTypeClass(c)});ref(*a);if(c==typelib_TypeClass_INTERFACE){auto*i=reinterpret_cast<I*>((*a)->pType);iface(i);for(int n=0;n<3;n++){D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,i->ppAllMembers[n]);method(reinterpret_cast<M*>(d));typelib_typedescription_release(d);}}else compound(reinterpret_cast<P*>((*a)->pType));}
 D*r=nullptr;typelib_typedescription_getByName(&r,u"com.sun.star.uno.RuntimeException"_ustr.pData);compound(reinterpret_cast<P*>(r));typelib_typedescription_release(r);
}
void initializers(){R*longType=*typelib_static_type_getByTypeClass(typelib_TypeClass_LONG);R*doubleType=*typelib_static_type_getByTypeClass(typelib_TypeClass_DOUBLE);R*strType=*typelib_static_type_getByTypeClass(typelib_TypeClass_STRING);R*root=*typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE);
 R*t=nullptr;typelib_static_type_init(&t,typelib_TypeClass_LONG,"long");ref(t);typelib_static_type_init(&t,typelib_TypeClass_STRING,"ignored");ref(t);R*seq=nullptr,*seq2=nullptr;typelib_static_sequence_type_init(&seq,longType);ref(seq);typelib_static_sequence_type_init(&seq,longType);ref(seq);typelib_static_sequence_type_init(&seq2,longType);emit({seq==seq2});ref(seq2);
 R*members[]={longType,doubleType,strType};R*s=nullptr,*s2=nullptr;typelib_static_compound_type_init(&s,typelib_TypeClass_STRUCT,"static.Plain",nullptr,3,members);compound(reinterpret_cast<P*>(s->pType),true);typelib_static_compound_type_init(&s,typelib_TypeClass_STRUCT,"ignored",nullptr,0,nullptr);compound(reinterpret_cast<P*>(s->pType),true);typelib_static_compound_type_init(&s2,typelib_TypeClass_STRUCT,"static.Plain",nullptr,0,nullptr);emit({s==s2});compound(reinterpret_cast<P*>(s2->pType),true);
 R*child=nullptr;sal_Bool flags[]={true,false};typelib_static_struct_type_init(&child,"static.Child",s,2,members,flags);compound(reinterpret_cast<P*>(child->pType),true);typelib_static_struct_type_init(&child,"ignored",nullptr,0,nullptr,nullptr);compound(reinterpret_cast<P*>(child->pType),true);R*empty=nullptr;typelib_static_struct_type_init(&empty,"static.Empty",nullptr,0,nullptr,flags);compound(reinterpret_cast<P*>(empty->pType),true);R*ex=nullptr;typelib_static_compound_type_init(&ex,typelib_TypeClass_EXCEPTION,"static.Exception",nullptr,0,nullptr);compound(reinterpret_cast<P*>(ex->pType));
 R*i=nullptr,*i2=nullptr;typelib_static_interface_type_init(&i,"static.Single",nullptr);iface(reinterpret_cast<I*>(i->pType));typelib_static_interface_type_init(&i,"ignored",root);iface(reinterpret_cast<I*>(i->pType));typelib_static_mi_interface_type_init(&i2,"static.Single",0,nullptr);emit({i==i2});iface(reinterpret_cast<I*>(i2->pType));R*other=nullptr;typelib_static_interface_type_init(&other,"static.Other",root);iface(reinterpret_cast<I*>(other->pType));R*bs[]={i,other};R*multi=nullptr;typelib_static_mi_interface_type_init(&multi,"static.Multi",2,bs);iface(reinterpret_cast<I*>(multi->pType));typelib_static_mi_interface_type_init(&multi,"ignored",0,nullptr);iface(reinterpret_cast<I*>(multi->pType));
 R*e=nullptr,*e2=nullptr;typelib_static_enum_type_init(&e,"static.Enum",-2147483647-1);ref(e);emit({reinterpret_cast<E*>(e->pType)->nDefaultEnumValue});typelib_static_enum_type_init(&e,"ignored",7);ref(e);typelib_static_enum_type_init(&e2,"static.Enum",9);emit({e==e2});ref(e2);emit({reinterpret_cast<E*>(e2->pType)->nDefaultEnumValue});
 auto*old=doubleType->pType;auto alignment=old->nAlignment;old->nAlignment=16;R*aligned=nullptr;typelib_static_struct_type_init(&aligned,"static.Aligned",nullptr,1,&doubleType,nullptr);compound(reinterpret_cast<P*>(aligned->pType),true);old->nAlignment=alignment;
}
void uninitialized(){R*r=nullptr;typelib_static_type_init(&r,typelib_TypeClass_ENUM,"static.Uninitialized");ref(r);R*s=nullptr;typelib_static_enum_type_init(&s,"static.Uninitialized",3);emit({r==s});ref(r);ref(s);}
void cacheReentry(){R**i=typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE);R**e=typelib_static_type_getByTypeClass(typelib_TypeClass_EXCEPTION);R*retained=*e;emit({i==typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE),e==typelib_static_type_getByTypeClass(typelib_TypeClass_EXCEPTION)});ref(*i);ref(retained);*e=nullptr;R**again=typelib_static_type_getByTypeClass(typelib_TypeClass_EXCEPTION);emit({again==e,*again==nullptr});ref(retained);ref(*i);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="basic")bootstrap(-1);else if(mode=="interface-first")bootstrap(typelib_TypeClass_INTERFACE);else if(mode=="exception-first")bootstrap(typelib_TypeClass_EXCEPTION);else if(mode=="initializers")initializers();else if(mode=="uninitialized")uninitialized();else if(mode=="cache-reentry")cacheReentry();else if(mode=="bad-kind"){R*r=nullptr;typelib_static_compound_type_init(&r,typelib_TypeClass_ENUM,"bad",nullptr,0,nullptr);}else if(mode=="bad-typedef"){R*r=nullptr;typelib_static_type_init(&r,typelib_TypeClass_TYPEDEF,"bad");}else if(mode=="bad-base"){R*b=nullptr,*r=nullptr;typelib_typedescriptionreference_new(&b,typelib_TypeClass_INTERFACE_METHOD,u"bad.Base"_ustr.pData);typelib_static_compound_type_init(&r,typelib_TypeClass_STRUCT,"bad",b,0,nullptr);}else if(mode=="bad-void"){R*v=*typelib_static_type_getByTypeClass(typelib_TypeClass_VOID),*r=nullptr;typelib_static_compound_type_init(&r,typelib_TypeClass_STRUCT,"bad",nullptr,1,&v);}else if(mode=="bad-interface"){R*b=nullptr,*r=nullptr;typelib_typedescriptionreference_new(&b,typelib_TypeClass_INTERFACE_METHOD,u"bad.Base"_ustr.pData);typelib_static_mi_interface_type_init(&r,"bad",1,&b);}else return 2;return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);

/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized).filter(
    /** Avoids linking static_types twice because the observation caller includes its complete unchanged source. @param path - Genuine object path. @returns Whether its full owner is linked separately. */
    (path) => !path.endsWith("cppu_source_typelib_static_types.cxx.o"),
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
for (const mode of [
  "basic",
  "interface-first",
  "exception-first",
  "initializers",
  "uninitialized",
  "cache-reentry",
]) {
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
for (const mode of ["bad-kind", "bad-typedef", "bad-base", "bad-void", "bad-interface"]) {
  const result = capture(normal, mode);
  if (result.signal !== "SIGABRT" || !/Assertion failed/.test(result.stderr.toString()))
    throw new Error(`Original static guard failed: ${mode}`);
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
    "Full unchanged original static_types.cxx and SAL/CPPU dependency owners under normal and ASan/UBSan. Complete initialized bootstrap/basic/interface/exception/method records and owned names/refcounts, mutable cache-cell identity, all static initializer kinds, existing-cell/initialized-name/uninitialized-name reuse, layouts/flags, sequences, auto-XInterface/MI bases, default enum and original checked guards. Synthetic caller clearing the returned Exception cache cell observes reentry with an existing XInterface without claiming an ordinary producer or native interleaving. Synthetic initialized member alignment16 observes the source clamp without claiming an ordinary compiled ABI. Uninitialized Uik/list/member fields are not read or guessed. Thread scheduling, mutex interleavings, native shutdown, physical pointer ABI, malformed JS inputs and full consumer QA remain unverified; system libraries are not instrumented. No original method/body is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original static type observations");
console.log(
  `Original static type observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
