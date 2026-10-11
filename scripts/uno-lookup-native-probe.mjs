/** @fileoverview Captures original complete CPPU lookup/factory ownership and SAL reverse ASCII search using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-lookup-native";
const fixture = "apps/office/src/cppu/source/typelib/native-lookup-cases.json";
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
#include <uno/any2.h>
#include <array>
#include <initializer_list>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>
#include "typelib.cxx"
static_assert(sizeof(void*)==8 && sizeof(uno_Any)==24 && alignof(double)==8);
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using C=typelib_TypeClass;
void emit(std::initializer_list<sal_Int32>row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void observe(D*d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pTypeName->refCount,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pWeakRef==reinterpret_cast<R*>(d),d->bOnDemand});}
D*get(rtl::OUString const&name){D*d=nullptr;typelib_typedescription_getByName(&d,name.pData);return d;}
std::array<C,15>classes={typelib_TypeClass_TYPE,typelib_TypeClass_VOID,typelib_TypeClass_BOOLEAN,typelib_TypeClass_CHAR,typelib_TypeClass_BYTE,typelib_TypeClass_STRING,typelib_TypeClass_SHORT,typelib_TypeClass_UNSIGNED_SHORT,typelib_TypeClass_LONG,typelib_TypeClass_UNSIGNED_LONG,typelib_TypeClass_HYPER,typelib_TypeClass_UNSIGNED_HYPER,typelib_TypeClass_FLOAT,typelib_TypeClass_DOUBLE,typelib_TypeClass_ANY};
std::array<rtl::OUString,15>names={u"type"_ustr,u"void"_ustr,u"boolean"_ustr,u"char"_ustr,u"byte"_ustr,u"string"_ustr,u"short"_ustr,u"unsigned short"_ustr,u"long"_ustr,u"unsigned long"_ustr,u"hyper"_ustr,u"unsigned hyper"_ustr,u"float"_ustr,u"double"_ustr,u"any"_ustr};
void compound(D*d){auto*p=reinterpret_cast<typelib_CompoundTypeDescription*>(d);observe(d);emit({p->pBaseTypeDescription!=nullptr,p->nMembers,p->pMemberOffsets==nullptr,p->ppTypeRefs==nullptr,p->ppMemberNames==nullptr});for(int i=0;i<p->nMembers;i++)emit({p->pMemberOffsets[i],p->ppTypeRefs[i]->eTypeClass,p->ppTypeRefs[i]->nRefCount,p->ppMemberNames[i]->refCount});if(d->eTypeClass==typelib_TypeClass_STRUCT){auto*s=reinterpret_cast<typelib_StructTypeDescription*>(d);emit({s->pParameterizedTypes==nullptr});if(s->pParameterizedTypes)for(int i=0;i<p->nMembers;i++)emit({s->pParameterizedTypes[i]});}sal_Int32 original=d->nSize;d->nSize=0;for(int offset:{0,1,7,16}){sal_Int32 align=-99;emit({typelib_typedescription_getAlignedUnoSize(d,offset,align),align});}d->nSize=original;}
void SAL_CALL provider(void*context,D**out,rtl_uString*name){int*count=static_cast<int*>(context);(*count)++;rtl::OUString const&n=rtl::OUString::unacquired(&name);if(n.indexOf(u"CalcProvided")!=0&&n!=u"CalcAlias")return;if(n==u"CalcAlias"){typelib_typedescription_newEmpty(out,typelib_TypeClass_SEQUENCE,name);auto*q=reinterpret_cast<typelib_IndirectTypeDescription*>(*out);D*d=get(u"long"_ustr);q->pType=d->pWeakRef;typelib_typedescriptionreference_acquire(q->pType);typelib_typedescription_release(d);(*out)->eTypeClass=typelib_TypeClass_TYPEDEF;}else {sal_Int32 value=0;rtl_uString*enumNames[]={name};typelib_typedescription_newEnum(out,name,7,0,enumNames,&value);}}
int main(int argc,char**argv){std::string mode=argc==2?argv[1]:"";
if(mode=="basic"){for(size_t i=0;i<names.size();i++){D*d=get(names[i]);observe(d);D*again=get(names[i]);emit({again==d,d->nRefCount});typelib_typedescription_release(again);R*r=d->pWeakRef;D*resolved=nullptr;typelib_typedescriptionreference_getDescription(&resolved,r);emit({resolved==d,d->nRefCount});TYPELIB_DANGER_GET(&again,r);emit({again==d,d->nRefCount});TYPELIB_DANGER_RELEASE(again);typelib_typedescription_release(resolved);typelib_typedescription_release(d);}return 0;}
if(mode=="factory"){D*integer=get(u"long"_ustr);for(C c:classes){rtl::OUString name(u"CalcFactory",11);D*d=nullptr;typelib_typedescription_new(&d,c,name.pData,nullptr,0,nullptr);observe(d);for(int offset=0;offset<17;offset++){sal_Int32 align=-99;emit({typelib_typedescription_getAlignedUnoSize(d,offset,align),align});}typelib_typedescription_release(d);emit({name.pData->refCount});}
for(C cls:{typelib_TypeClass_INTERFACE_METHOD,typelib_TypeClass_INTERFACE_ATTRIBUTE}){rtl::OUString name(u"CalcWeakFactory",15);D*d=nullptr;typelib_typedescription_new(&d,cls,name.pData,nullptr,0,nullptr);observe(d);D*parent=nullptr;typelib_typedescription_new(&parent,typelib_TypeClass_INTERFACE,name.pData,nullptr,0,nullptr);if(cls==typelib_TypeClass_INTERFACE_METHOD){auto*m=reinterpret_cast<typelib_InterfaceMethodTypeDescription*>(d);m->pInterface=reinterpret_cast<typelib_InterfaceTypeDescription*>(parent);m->aBase.pMemberName=name.pData;rtl_uString_acquire(name.pData);}else reinterpret_cast<typelib_InterfaceAttributeTypeDescription*>(d)->pInterface=reinterpret_cast<typelib_InterfaceTypeDescription*>(parent);typelib_typedescription_release(d);emit({name.pData->refCount});}
for(int count=0;count<=3;count+=3){rtl::OUString name(u"CalcEnum",8),a(u"A",1),b(u"B\0C",3),c(u"D",1);rtl_uString*enumNames[]={a.pData,b.pData,c.pData};sal_Int32 values[]={-2147483647,0,2147483647};D*d=nullptr;typelib_typedescription_newEnum(&d,name.pData,19,count,enumNames,values);auto*e=reinterpret_cast<typelib_EnumTypeDescription*>(d);observe(d);emit({e->nDefaultEnumValue,e->nEnumValues,e->ppEnumNames!=nullptr,e->pEnumValues!=nullptr,e->pEnumValues!=values});for(int i=0;i<count;i++)emit({e->ppEnumNames[i]==enumNames[i],e->ppEnumNames[i]->refCount,e->pEnumValues[i]});values[0]=8;emit({count==0?0:e->pEnumValues[0]});typelib_typedescription_release(d);emit({name.pData->refCount,a.pData->refCount,b.pData->refCount,c.pData->refCount});}
rtl::OUString seqName(u"[]long",6);D*seq=nullptr;typelib_typedescription_new(&seq,typelib_TypeClass_SEQUENCE,seqName.pData,integer->pWeakRef,0,nullptr);observe(seq);emit({reinterpret_cast<typelib_IndirectTypeDescription*>(seq)->pType==integer->pWeakRef,integer->nRefCount});typelib_typedescription_release(seq);emit({integer->nRefCount});
std::array<rtl::OUString,4>memberNames={rtl::OUString(u"a",1),rtl::OUString(u"b",1),rtl::OUString(u"c",1),rtl::OUString(u"self",4)};rtl::OUString recursive(u"[]CalcStruct",12);typelib_CompoundMember_Init members[]={{typelib_TypeClass_BYTE,names[4].pData,memberNames[0].pData},{typelib_TypeClass_DOUBLE,names[13].pData,memberNames[1].pData},{typelib_TypeClass_LONG,names[8].pData,memberNames[2].pData},{typelib_TypeClass_SEQUENCE,recursive.pData,memberNames[3].pData}};
for(C cls:{typelib_TypeClass_STRUCT,typelib_TypeClass_EXCEPTION})for(int count:{0,1,3,4}){rtl::OUString name(u"CalcStruct",10);D*d=nullptr;typelib_typedescription_new(&d,cls,name.pData,nullptr,count,members);compound(d);typelib_typedescription_release(d);emit({name.pData->refCount});for(auto const&n:memberNames)emit({n.pData->refCount});}
rtl::OUString baseName(u"CalcBaseStruct",14);D*base=nullptr;typelib_typedescription_new(&base,typelib_TypeClass_STRUCT,baseName.pData,nullptr,3,members);typelib_typedescription_register(&base);rtl::OUString derivedName(u"CalcDerived",11);D*derived=nullptr;typelib_typedescription_new(&derived,typelib_TypeClass_STRUCT,derivedName.pData,base->pWeakRef,1,members);compound(derived);emit({base->nRefCount});typelib_typedescription_release(derived);emit({base->nRefCount});
for(bool poly:{false,true}){rtl::OUString name(poly?u"CalcPoly<long>":u"CalcPlain",poly?14:9);typelib_StructMember_Init sm[]={{members[0],true},{members[2],false}};D*d=nullptr;typelib_typedescription_newStruct(&d,name.pData,nullptr,2,sm);compound(d);typelib_typedescription_release(d);emit({name.pData->refCount});}
D*alias=nullptr;typelib_typedescription_newEmpty(&alias,typelib_TypeClass_LONG,derivedName.pData);typelib_typedescription_new(&alias,typelib_TypeClass_TYPEDEF,derivedName.pData,integer->pWeakRef,0,nullptr);emit({alias==integer,integer->nRefCount,derivedName.pData->refCount});typelib_typedescription_release(alias);typelib_typedescription_release(base);typelib_typedescription_release(integer);return 0;}
if(mode=="lookup"){int calls=0;typelib_typedescription_registerCallback(&calls,provider);std::vector<rtl::OUString>inputs={rtl::OUString(u"CalcAbsent",10),rtl::OUString(u"[]long",6),rtl::OUString(u"[xlong",6),rtl::OUString(u"[][]long",8),rtl::OUString(u"[]",2),rtl::OUString(u"[",1),rtl::OUString(u"[]Unknown",9),rtl::OUString(u"Calc:@0",7),rtl::OUString(u"Calc:@0,1",9),rtl::OUString(u"Calc:@0,1:Missing",17),rtl::OUString(u"CalcProvided",12),rtl::OUString(u"CalcAlias",9)};D*d=nullptr;for(auto const&name:inputs){int before=calls;typelib_typedescription_getByName(&d,name.pData);emit({d!=nullptr,calls-before,name.pData->refCount});if(d){observe(d);if(d->eTypeClass==typelib_TypeClass_SEQUENCE){auto*q=reinterpret_cast<typelib_IndirectTypeDescription*>(d);emit({q->pType->eTypeClass,q->pType->nRefCount});}}}if(d)typelib_typedescription_release(d);
for(int i=0;i<258;i++){std::string text="CalcProvided"+std::to_string(i);rtl::OUString name=rtl::OUString::createFromAscii(text.c_str());D*v=get(name);observe(v);emit({calls,reinterpret_cast<typelib_EnumTypeDescription*>(v)->nEnumValues});typelib_typedescription_release(v);}rtl::OUString first(u"CalcProvided0",13);R*r=nullptr;typelib_typedescriptionreference_getByName(&r,first.pData);emit({r==nullptr});if(r)typelib_typedescriptionreference_release(r);typelib_typedescription_revokeCallback(&calls,provider);return 0;}
if(mode=="derivedrefs"){
D*integer=get(u"long"_ustr);rtl::OUString ifaceName(u"CalcIface",9);D*iface=nullptr;typelib_typedescription_new(&iface,typelib_TypeClass_INTERFACE,ifaceName.pData,nullptr,0,nullptr);typelib_typedescription_register(&iface);
for(C kind:{typelib_TypeClass_INTERFACE_METHOD,typelib_TypeClass_INTERFACE_ATTRIBUTE,typelib_TypeClass_ENUM}){
rtl::OUString baseName(kind==typelib_TypeClass_INTERFACE_METHOD?u"CalcMethodBase":kind==typelib_TypeClass_INTERFACE_ATTRIBUTE?u"CalcAttributeBase":u"CalcEnumBase",kind==typelib_TypeClass_INTERFACE_METHOD?14:kind==typelib_TypeClass_INTERFACE_ATTRIBUTE?17:12);D*base=nullptr;
if(kind==typelib_TypeClass_ENUM){sal_Int32 v=0;rtl_uString*ns[]={baseName.pData};typelib_typedescription_newEnum(&base,baseName.pData,13,0,ns,&v);}else{typelib_typedescription_newEmpty(&base,kind,baseName.pData);auto*m=reinterpret_cast<typelib_InterfaceMemberTypeDescription*>(base);m->nPosition=0;m->pMemberName=baseName.pData;rtl_uString_acquire(m->pMemberName);typelib_typedescription_acquire(iface);if(kind==typelib_TypeClass_INTERFACE_METHOD){auto*t=reinterpret_cast<typelib_InterfaceMethodTypeDescription*>(base);t->bOneWay=false;t->pReturnTypeRef=integer->pWeakRef;typelib_typedescriptionreference_acquire(t->pReturnTypeRef);t->pInterface=reinterpret_cast<typelib_InterfaceTypeDescription*>(iface);}else{auto*t=reinterpret_cast<typelib_InterfaceAttributeTypeDescription*>(base);t->bReadOnly=true;t->pAttributeTypeRef=integer->pWeakRef;typelib_typedescriptionreference_acquire(t->pAttributeTypeRef);t->pInterface=reinterpret_cast<typelib_InterfaceTypeDescription*>(iface);}}
typelib_typedescription_register(&base);std::string prefix=kind==typelib_TypeClass_INTERFACE_METHOD?"CalcMethodBase":kind==typelib_TypeClass_INTERFACE_ATTRIBUTE?"CalcAttributeBase":"CalcEnumBase";
for(auto suffix:{":@1,2:CalcIface",":@-2147483649, 3:CalcIface",":@0,1:MissingIface"}){rtl::OUString name=rtl::OUString::createFromAscii((prefix+suffix).c_str());D*d=get(name);emit({d!=nullptr,name.pData->refCount});if(d){observe(d);auto*m=reinterpret_cast<typelib_InterfaceMemberTypeDescription*>(d);emit({m->nPosition,m->pMemberName==baseName.pData});if(kind==typelib_TypeClass_INTERFACE_METHOD){auto*t=reinterpret_cast<typelib_InterfaceMethodTypeDescription*>(d);emit({t->nIndex,t->pInterface==reinterpret_cast<typelib_InterfaceTypeDescription*>(iface),t->pBaseRef==base->pWeakRef,t->nParams,t->pParams!=nullptr,t->nExceptions,t->ppExceptions!=nullptr,t->bOneWay});}else{auto*t=reinterpret_cast<typelib_InterfaceAttributeTypeDescription*>(d);emit({t->nIndex,t->pInterface==reinterpret_cast<typelib_InterfaceTypeDescription*>(iface),t->pBaseRef==base->pWeakRef,t->bReadOnly,t->ppGetExceptions!=nullptr,t->ppSetExceptions!=nullptr});}typelib_typedescription_release(d);}emit({base->nRefCount,base->pWeakRef->nRefCount,iface->nRefCount,integer->nRefCount});}
D*resolved=get(u"void"_ustr);typelib_typedescriptionreference_getDescription(&resolved,base->pWeakRef);emit({resolved==base,base->nRefCount});typelib_typedescription_release(resolved);resolved=nullptr;TYPELIB_DANGER_GET(&resolved,base->pWeakRef);emit({resolved==base,base->nRefCount});TYPELIB_DANGER_RELEASE(resolved);emit({base->nRefCount});
if(kind==typelib_TypeClass_INTERFACE_METHOD){int original=base->nRefCount;R*ref=base->pWeakRef;base->nRefCount=0;resolved=nullptr;typelib_typedescriptionreference_getDescription(&resolved,ref);emit({resolved==nullptr,base->nRefCount,ref->pType==nullptr});base->nRefCount=original;ref->pType=base;}
typelib_typedescription_release(base);}
for(auto value:{u"CalcMissing:@0,1:CalcIface",u"CalcUnresolved:@0,1:CalcIface"}){rtl::OUString name(value);R*ref=nullptr;if(name.indexOf(u"CalcUnresolved")==0)typelib_typedescriptionreference_new(&ref,typelib_TypeClass_INTERFACE_METHOD,u"CalcUnresolved"_ustr.pData);D*d=get(name);emit({d==nullptr,iface->nRefCount});if(d)typelib_typedescription_release(d);if(ref)typelib_typedescriptionreference_release(ref);}
int calls=0;typelib_typedescription_registerCallback(&calls,provider);
for(auto name:{u"CalcProvidedRef",u"CalcAbsentRef"}){rtl::OUString value(name);R*ref=nullptr;typelib_typedescriptionreference_new(&ref,typelib_TypeClass_ENUM,value.pData);D*d=nullptr;TYPELIB_DANGER_GET(&d,ref);emit({d!=nullptr,ref->nRefCount,ref->pType!=nullptr,calls});if(d){observe(d);TYPELIB_DANGER_RELEASE(d);}else {TYPELIB_DANGER_GET(&d,ref);emit({d==nullptr,ref->pType==nullptr,calls});}typelib_typedescriptionreference_release(ref);}
typelib_typedescription_revokeCallback(&calls,provider);
rtl::OUString structure(u"CalcInterfaceStruct",19),member(u"iface",5);typelib_CompoundMember_Init m={typelib_TypeClass_INTERFACE,ifaceName.pData,member.pData};D*d=nullptr;typelib_typedescription_new(&d,typelib_TypeClass_STRUCT,structure.pData,nullptr,1,&m);compound(d);typelib_typedescription_release(d);emit({iface->nRefCount});typelib_typedescription_release(iface);typelib_typedescription_release(integer);return 0;}
if(mode=="sizes"){for(int cls=0;cls<32;cls++){if(cls==typelib_TypeClass_STRUCT||cls==typelib_TypeClass_EXCEPTION||cls==typelib_TypeClass_TYPEDEF)continue;for(int size:{0,1,3,16,24})for(int alignment:{1,2,4,8,16})for(int offset:{0,1,3,7,16,31}){D d{};d.eTypeClass=static_cast<C>(cls);d.nSize=size;d.nAlignment=alignment;sal_Int32 integral=-1;emit({typelib_typedescription_getAlignedUnoSize(&d,offset,integral),integral});}}for(int alignment:{1,2,4,8,16,32})for(int offset=0;offset<17;offset++)emit({adjustAlignment(alignment),newAlignedSize(offset,3,alignment)});return 0;}
if(mode=="ascii"){std::array<char,2>needle={':','@'};for(int unit=0;unit<65536;unit++){std::array<sal_Unicode,6>data={':','@',static_cast<sal_Unicode>(unit),':','@',0};for(int length=0;length<=5;length++)for(int count=0;count<=2;count++)emit({rtl_ustr_lastIndexOfAscii_WithLength(data.data(),length,needle.data(),count)});}for(int byte=0;byte<256;byte++){char needleByte=static_cast<char>(byte);sal_Unicode wide=static_cast<sal_Unicode>(static_cast<signed char>(byte));std::array<sal_Unicode,2>data={wide,0};emit({rtl_ustr_lastIndexOfAscii_WithLength(data.data(),1,&needleByte,1)});}return 0;}
if(mode.starts_with("factory-invariant-")){int id=std::stoi(mode.substr(18));rtl::OUString name=id==0?u"CalcPoly<long>"_ustr:u"CalcAssert"_ustr;rtl::OUString member(u"part",4),missing(u"CalcAbsent",10);typelib_CompoundMember_Init initializer={id==0?typelib_TypeClass_LONG:typelib_TypeClass_TYPEDEF,id==0?u"long"_ustr.pData:missing.pData,member.pData};D*d=nullptr;typelib_typedescription_new(&d,typelib_TypeClass_STRUCT,name.pData,nullptr,1,&initializer);return 5;}
if(mode.starts_with("ascii-invariant-")){int id=std::stoi(mode.substr(16));rtl_ustr_lastIndexOfAscii_WithLength(nullptr,id==0||id==2?-1:0,nullptr,id==1||id==2?-1:0);return 5;}
return 2;}
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
for (const mode of ["basic", "factory", "lookup", "sizes", "ascii", "derivedrefs"]) {
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
for (let index = 0; index < 3; index++) {
  const mode = `ascii-invariant-${index}`;
  const first = capture(normal, mode),
    second = capture(sanitized, mode);
  const diagnostic = first.stderr.toString();
  const expression = diagnostic.match(/Assertion failed: \(([\s\S]*?)\), function /)?.[1];
  if (
    first.signal !== "SIGABRT" ||
    second.signal !== "SIGABRT" ||
    first.stdout.length !== 0 ||
    second.stdout.length !== 0 ||
    !expression ||
    diagnostic !== second.stderr.toString() ||
    /AddressSanitizer|runtime error:/.test(diagnostic)
  )
    throw new Error(`Missing identical original ASCII assertion ${index}`);
  assertions.push({ index, signal: first.signal, expression, diagnostic });
}
const factoryAssertions = [];
for (let index = 0; index < 2; index++) {
  const mode = `factory-invariant-${index}`,
    first = capture(normal, mode),
    second = capture(sanitized, mode);
  const diagnostic = first.stderr.toString(),
    expression = diagnostic.match(/Assertion failed: \(([\s\S]*?)\), function /)?.[1];
  if (
    first.signal !== "SIGABRT" ||
    second.signal !== "SIGABRT" ||
    first.stdout.length !== 0 ||
    second.stdout.length !== 0 ||
    !expression ||
    diagnostic !== second.stderr.toString() ||
    /AddressSanitizer|runtime error:/.test(diagnostic)
  )
    throw new Error(`Missing identical original factory assertion ${index}`);
  factoryAssertions.push({ index, signal: first.signal, expression, diagnostic });
}
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Retains all full unchanged source inputs. @param entry - Actual original source. @returns Name and complete hash. */
      ([path, value]) => [path, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  logicalLayout: { pointer: 8, any: 24, maxAlignment: 8 },
  captures,
  assertions,
  factoryAssertions,
  scope:
    "Full unchanged SAL/CPPU owners: original basic lookup, plain/struct/enum/sequence/typedef factory and logical LP64 sizes, provider/cache/sequence lookup including source-only CALC042 candidate, and full reverse ASCII corpus. Initialized provider records do not verify unported interface factories/completion/static_types/UNO Type/Any/Reference/default exceptions; native ABI/pointers, concurrency/shutdown, post-assert recovery and full consumer QA remain unverified. Full dependencies are instrumented under ASan/UBSan; system frameworks/libc are not. No original source method is patched or replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original lookup observations");
console.log(
  `Original lookup observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports each complete captured stream. @param entry - Name and complete capture. @returns Complete size summary. */ ([
        name,
        value,
      ]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
