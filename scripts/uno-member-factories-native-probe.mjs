/** @fileoverview Captures original complete CPPU method/attribute factories and source-defined ownership using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-member-factories-native";
const fixture = "apps/office/src/cppu/source/typelib/native-member-factories-cases.json";
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
#include <initializer_list>
#include <cstdio>
#include <cstdlib>
#include <string>
#include "typelib.cxx"
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using I=typelib_InterfaceTypeDescription;using M=typelib_InterfaceMethodTypeDescription;using A=typelib_InterfaceAttributeTypeDescription;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*s){emit({s->refCount,s->length});for(int i=0;i<s->length;i++)emit({s->buffer[i]});}
void observe(D*d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->bOnDemand});text(d->pTypeName);}
void reference(R*r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);}
I*iface(){OUString names[]={u"member.IFace::M"_ustr,u"member.IFace::A"_ustr,u"member.IFace::B"_ustr,u"member.IFace::Z"_ustr};R*members[4]={};for(int i=0;i<4;i++)typelib_typedescriptionreference_new(&members[i],i==0?typelib_TypeClass_INTERFACE_METHOD:typelib_TypeClass_INTERFACE_ATTRIBUTE,names[i].pData);I*i=nullptr;typelib_typedescription_newMIInterface(&i,u"member.IFace"_ustr.pData,0,0,0,0,0,0,nullptr,4,members);for(auto*r:members)typelib_typedescriptionreference_release(r);typelib_typedescription_register(reinterpret_cast<D**>(&i));return i;}
void interface(I*i){observe(&i->aBase);emit({i->nMembers,i->nAllMembers,i->pMapMemberIndexToFunctionIndex==nullptr,i->pMapFunctionIndexToMemberIndex==nullptr,i->nMapFunctionIndexToMemberIndex});}
void method(M*m,I*i){observe(&m->aBase.aBase);emit({m->aBase.nPosition});text(m->aBase.pMemberName);emit({m->bOneWay});reference(m->pReturnTypeRef);emit({m->nParams,m->pParams==nullptr});for(int k=0;k<m->nParams;k++){auto&p=m->pParams[k];text(p.pName);reference(p.pTypeRef);emit({p.bIn,p.bOut,p.pTypeRef==m->pReturnTypeRef});}emit({m->nExceptions,m->ppExceptions==nullptr});for(int k=0;k<m->nExceptions;k++)reference(m->ppExceptions[k]);emit({m->pInterface==i,i->aBase.nRefCount,m->pBaseRef==nullptr,m->nIndex});}
void attribute(A*a,I*i){observe(&a->aBase.aBase);emit({a->aBase.nPosition});text(a->aBase.pMemberName);emit({a->bReadOnly});reference(a->pAttributeTypeRef);emit({a->nGetExceptions,a->ppGetExceptions==nullptr});for(int k=0;k<a->nGetExceptions;k++)reference(a->ppGetExceptions[k]);emit({a->nSetExceptions,a->ppSetExceptions==nullptr});for(int k=0;k<a->nSetExceptions;k++)reference(a->ppSetExceptions[k]);emit({a->pInterface==i,i->aBase.nRefCount,a->pBaseRef==nullptr,a->nIndex});}
void success(){I*i=iface();interface(i);OUString p0(u"first",5),p1(u"second",6),p2(u"third",5);typelib_Parameter_Init params[]={{typelib_TypeClass_LONG,u"long"_ustr.pData,p0.pData,false,false},{typelib_TypeClass_LONG,u"long"_ustr.pData,p1.pData,true,false},{typelib_TypeClass_STRING,u"string"_ustr.pData,p2.pData,true,true}};rtl_uString*exceptions[]={u"member.Exception"_ustr.pData,u"member.Exception"_ustr.pData,u"member.OtherException"_ustr.pData};M*m=nullptr;for(int one=0;one<2;one++)for(int r=0;r<2;r++)for(int n=0;n<4;n++)for(int e=0;e<4;e++){typelib_typedescription_newInterfaceMethod(&m,n%4,one,u"member.IFace::M"_ustr.pData,r?typelib_TypeClass_LONG:typelib_TypeClass_VOID,r?u"long"_ustr.pData:u"void"_ustr.pData,n,n?params:nullptr,e,e?exceptions:nullptr);emit({one,r,n,e});method(m,i);interface(i);}typelib_typedescription_release(&m->aBase.aBase);interface(i);
 A*a=nullptr;for(int ro=0;ro<2;ro++)for(int g=0;g<3;g++)for(int s=0;s<3;s++){typelib_typedescription_newExtendedInterfaceAttribute(&a,1,u"member.IFace::A"_ustr.pData,typelib_TypeClass_STRING,u"string"_ustr.pData,ro,g,g?exceptions:nullptr,s,s?exceptions:nullptr);emit({ro,g,s});attribute(a,i);interface(i);}for(int ro=0;ro<2;ro++){typelib_typedescription_newInterfaceAttribute(&a,2,u"member.IFace::B"_ustr.pData,typelib_TypeClass_LONG,u"long"_ustr.pData,ro);emit({ro});attribute(a,i);interface(i);}typelib_typedescription_release(&a->aBase.aBase);interface(i);typelib_typedescription_release(&i->aBase);
}
void unicode(){I*i=iface();for(unsigned unit=0;unit<65536;unit++){OUString name=OUString::Concat(u"member.IFace::")+OUString(static_cast<sal_Unicode>(unit));M*m=nullptr;A*a=nullptr;typelib_typedescription_newInterfaceMethod(&m,0,false,name.pData,typelib_TypeClass_VOID,u"void"_ustr.pData,0,nullptr,0,nullptr);typelib_typedescription_newInterfaceAttribute(&a,1,name.pData,typelib_TypeClass_LONG,u"long"_ustr.pData,true);emit({static_cast<sal_Int32>(unit),m==nullptr,a==nullptr,i->aBase.nRefCount});if(m){emit({m->aBase.pMemberName->length,m->aBase.pMemberName->buffer[0],m->aBase.nPosition,m->nIndex,m->nParams,m->nExceptions,m->pParams==nullptr,m->ppExceptions==nullptr});typelib_typedescription_release(&m->aBase.aBase);}if(a){emit({a->aBase.pMemberName->length,a->aBase.pMemberName->buffer[0],a->aBase.nPosition,a->nIndex,a->nGetExceptions,a->nSetExceptions,a->ppGetExceptions==nullptr,a->ppSetExceptions==nullptr});typelib_typedescription_release(&a->aBase.aBase);}emit({i->aBase.nRefCount});}typelib_typedescription_release(&i->aBase);}
void failure(){I*i=iface();D*wrong=nullptr,*empty=nullptr;typelib_typedescription_newEnum(&wrong,u"member.Enum"_ustr.pData,0,0,nullptr,nullptr);typelib_typedescription_register(&wrong);typelib_typedescription_newEmpty(&empty,typelib_TypeClass_INTERFACE,u"member.Empty"_ustr.pData);empty->bComplete=false;typelib_typedescription_register(&empty);OUString names[]={u""_ustr,u":"_ustr,u"single:colon"_ustr,u"::"_ustr,u"member.Missing::M"_ustr,u"member.Enum::M"_ustr,u"member.Empty::M"_ustr};
 for(bool old:{false,true})for(int n=0;n<7;n++){M*m=nullptr;A*a=nullptr;if(old){typelib_typedescription_newInterfaceMethod(&m,0,false,u"member.IFace::M"_ustr.pData,typelib_TypeClass_VOID,u"void"_ustr.pData,0,nullptr,0,nullptr);typelib_typedescription_newInterfaceAttribute(&a,1,u"member.IFace::A"_ustr.pData,typelib_TypeClass_LONG,u"long"_ustr.pData,true);}emit({old,n,i->aBase.nRefCount,wrong->nRefCount,empty->nRefCount});typelib_typedescription_newInterfaceMethod(&m,0,false,names[n].pData,typelib_TypeClass_VOID,u"void"_ustr.pData,0,nullptr,0,nullptr);emit({m==nullptr,i->aBase.nRefCount,wrong->nRefCount,empty->nRefCount});typelib_typedescription_newInterfaceAttribute(&a,1,names[n].pData,typelib_TypeClass_LONG,u"long"_ustr.pData,true);emit({a==nullptr,i->aBase.nRefCount,wrong->nRefCount,empty->nRefCount});}
 typelib_typedescription_release(wrong);typelib_typedescription_release(empty);typelib_typedescription_release(&i->aBase);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="success")success();else if(mode=="unicode")unicode();else if(mode=="failure")failure();else return 2;return 0;}
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
    maxBuffer: 32 * 1024 * 1024,
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
for (const mode of ["success", "unicode", "failure"]) {
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
    "Full unchanged SAL/CPPU original method/attribute factory owners under normal and ASan/UBSan. Complete initialized member fields, parameters/getter/setter exceptions, name/copy/refcount observations, all65536 UTF16 units and original failure returns. Native setup uses the true original no-base interface factory; portable caller initialization isolates member factories and does not verify the still-unported interface factory. Physical ABI, cross-thread scheduling/shutdown, ordinary failure reachability and full consumer QA remain unverified; system libraries are not instrumented. No original source method is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original member factory observations");
console.log(
  `Original member factory observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
