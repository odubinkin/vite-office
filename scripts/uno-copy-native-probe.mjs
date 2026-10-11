/** @fileoverview Captures complete original UNO copy/default construction and true type/ownership fields using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-copy-native";
const fixture = "apps/office/src/cppu/source/uno/native-copy-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`#include "copy.hxx"
#include "destr.hxx"
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <initializer_list>
#include <string>
#include <vector>
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using P=typelib_CompoundTypeDescription;using I=typelib_IndirectTypeDescription;using C=typelib_TypeClass;
void emit(std::initializer_list<sal_Int32>r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
void desc(D*d){emit({d==nullptr});if(d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->pUniqueIdentifier==nullptr,d->pReserved==nullptr,d->bOnDemand});text(d->pTypeName);}}
void ref(R*r){emit({r==nullptr});if(r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);if(r->pType)desc(r->pType);}}
R*type(C c){return *typelib_static_type_getByTypeClass(c);}
struct W{uno_Interface i;sal_Int32 id,count;};
void acquired(uno_Interface*p){auto*w=reinterpret_cast<W*>(p);emit({1,w->id,++w->count});}
void released(uno_Interface*p){auto*w=reinterpret_cast<W*>(p);emit({2,w->id,--w->count});}
void acquire(void*p){acquired(static_cast<uno_Interface*>(p));}
void release(void*p){released(static_cast<uno_Interface*>(p));}
struct M{uno_Mapping m;W*target;bool drop;};
void map(uno_Mapping*p,void**out,void*value,typelib_InterfaceTypeDescription*d){auto*m=reinterpret_cast<M*>(p);emit({3,reinterpret_cast<W*>(value)->id,*out==nullptr,d->aBase.eTypeClass,d->nAllMembers});if(m->drop)*out=nullptr;else{*out=m->target;++m->target->count;}}
D*compound(char const*label,C cls,D*base,std::vector<R*>const&types){rtl::OUString n=rtl::OUString::createFromAscii(label);std::vector<rtl::OUString>names;names.reserve(types.size());for(size_t i=0;i<types.size();i++){std::string s="m"+std::to_string(i);names.push_back(rtl::OUString::createFromAscii(s.c_str()));}std::vector<typelib_CompoundMember_Init>members;for(size_t i=0;i<types.size();i++)members.push_back({types[i]->eTypeClass,types[i]->pTypeName,names[i].pData});D*d=nullptr;typelib_typedescription_new(&d,cls,n.pData,base?base->pWeakRef:nullptr,types.size(),members.data());typelib_typedescription_register(&d);return d;}
D*sequence(R*r){rtl::OUString n=rtl::OUString::Concat("[]")+rtl::OUString(r->pTypeName);D*d=nullptr;typelib_typedescription_new(&d,typelib_TypeClass_SEQUENCE,n.pData,r,0,nullptr);typelib_typedescription_register(&d);return d;}
struct Types{D*en,*base,*record,*exc,*seq,*outer;Types(){rtl::OUString n=rtl::OUString::createFromAscii("copy.Enum"),a=rtl::OUString::createFromAscii("Low"),b=rtl::OUString::createFromAscii("High");rtl_uString*names[]={a.pData,b.pData};sal_Int32 v[]={-23,19};en=nullptr;typelib_typedescription_newEnum(&en,n.pData,-23,2,names,v);typelib_typedescription_register(&en);base=compound("copy.Base",typelib_TypeClass_STRUCT,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_TYPE),type(typelib_TypeClass_INTERFACE)});record=compound("copy.Record",typelib_TypeClass_STRUCT,base,{type(typelib_TypeClass_ANY),type(typelib_TypeClass_INTERFACE),en->pWeakRef});exc=compound("copy.Exception",typelib_TypeClass_EXCEPTION,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_INTERFACE)});seq=sequence(type(typelib_TypeClass_INTERFACE));outer=sequence(seq->pWeakRef);}~Types(){for(D*d:{outer,seq,exc,record,base,en})typelib_typedescription_release(d);}R*get(int c){return c==15?en->pWeakRef:c==17?record->pWeakRef:c==19?exc->pWeakRef:c==20?seq->pWeakRef:type(static_cast<C>(c));}};
int marker=17;
void value(void*,R*);
void anyValue(uno_Any*a){ref(a->pType);emit({a->pData==a,a->pData==&a->pReserved});if(a->pType->eTypeClass!=typelib_TypeClass_VOID)value(a->pData,a->pType);}
void fields(void*p,P*d,bool fill,Types&t,rtl_uString*held,W*w,int variant);
void value(void*p,R*r){switch(r->eTypeClass){case typelib_TypeClass_VOID:emit({0});break;case typelib_TypeClass_CHAR:emit({*static_cast<sal_Unicode*>(p)});break;case typelib_TypeClass_BOOLEAN:emit({*static_cast<sal_Bool*>(p)});break;case typelib_TypeClass_BYTE:emit({*static_cast<sal_Int8*>(p)});break;case typelib_TypeClass_SHORT:emit({*static_cast<sal_Int16*>(p)});break;case typelib_TypeClass_UNSIGNED_SHORT:emit({*static_cast<sal_uInt16*>(p)});break;case typelib_TypeClass_LONG:case typelib_TypeClass_ENUM:emit({*static_cast<sal_Int32*>(p)});break;case typelib_TypeClass_UNSIGNED_LONG:emit({static_cast<sal_Int32>(*static_cast<sal_uInt32*>(p))});break;case typelib_TypeClass_HYPER:case typelib_TypeClass_UNSIGNED_HYPER:case typelib_TypeClass_DOUBLE:{sal_Int32 a[2];std::memcpy(a,p,8);emit({a[0],a[1]});break;}case typelib_TypeClass_FLOAT:{sal_Int32 a;std::memcpy(&a,p,4);emit({a});break;}case typelib_TypeClass_STRING:text(*static_cast<rtl_uString**>(p));break;case typelib_TypeClass_TYPE:ref(*static_cast<R**>(p));break;case typelib_TypeClass_ANY:anyValue(static_cast<uno_Any*>(p));break;case typelib_TypeClass_INTERFACE:{auto*w=*static_cast<W**>(p);emit({w==nullptr});if(w)emit({w->id,w->count});break;}case typelib_TypeClass_STRUCT:case typelib_TypeClass_EXCEPTION:{D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);auto*q=reinterpret_cast<P*>(d);if(q->pBaseTypeDescription)value(p,q->pBaseTypeDescription->aBase.pWeakRef);for(int i=q->nMembers;i--;){emit({i,q->pMemberOffsets[i]});value(static_cast<char*>(p)+q->pMemberOffsets[i],q->ppTypeRefs[i]);}typelib_typedescription_release(d);break;}case typelib_TypeClass_SEQUENCE:{auto*s=*static_cast<uno_Sequence**>(p);emit({s==&cppu::g_emptySeq,s->nRefCount,s->nElements});if(s->nElements){D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);R*e=reinterpret_cast<I*>(d)->pType;D*ed=nullptr;typelib_typedescriptionreference_getDescription(&ed,e);for(int i=0;i<s->nElements;i++)value(s->elements+ed->nSize*i,e);typelib_typedescription_release(ed);typelib_typedescription_release(d);}break;}default:std::exit(4);}}
void fill(void*p,R*r,Types&t,rtl_uString*held,W*w,int variant){switch(r->eTypeClass){case typelib_TypeClass_CHAR:*static_cast<sal_Unicode*>(p)=0xd800;break;case typelib_TypeClass_BOOLEAN:*static_cast<sal_Bool*>(p)=variant==0?0:variant==1?2:255;break;case typelib_TypeClass_BYTE:*static_cast<sal_Int8*>(p)=-97;break;case typelib_TypeClass_SHORT:*static_cast<sal_Int16*>(p)=-12345;break;case typelib_TypeClass_UNSIGNED_SHORT:*static_cast<sal_uInt16*>(p)=54321;break;case typelib_TypeClass_LONG:case typelib_TypeClass_ENUM:*static_cast<sal_Int32*>(p)=-123456789;break;case typelib_TypeClass_UNSIGNED_LONG:*static_cast<sal_uInt32*>(p)=0xfedcba98;break;case typelib_TypeClass_HYPER:*static_cast<sal_Int64*>(p)=-0x123456789abcdefLL;break;case typelib_TypeClass_UNSIGNED_HYPER:*static_cast<sal_uInt64*>(p)=0xfedcba9876543210ULL;break;case typelib_TypeClass_FLOAT:*static_cast<float*>(p)=-1.2345f;break;case typelib_TypeClass_DOUBLE:*static_cast<double*>(p)=-0.0;break;case typelib_TypeClass_STRING:rtl_uString_release(*static_cast<rtl_uString**>(p));*static_cast<rtl_uString**>(p)=held;rtl_uString_acquire(held);break;case typelib_TypeClass_TYPE:typelib_typedescriptionreference_release(*static_cast<R**>(p));*static_cast<R**>(p)=type(typelib_TypeClass_BYTE);typelib_typedescriptionreference_acquire(type(typelib_TypeClass_BYTE));break;case typelib_TypeClass_ANY:if(variant==1)uno_type_any_assign(static_cast<uno_Any*>(p),&held,type(typelib_TypeClass_STRING),nullptr,nullptr);else if(variant==2){void*i=w;uno_type_any_assign(static_cast<uno_Any*>(p),&i,type(typelib_TypeClass_INTERFACE),nullptr,nullptr);}break;case typelib_TypeClass_INTERFACE:*static_cast<void**>(p)=variant?static_cast<void*>(w):nullptr;break;case typelib_TypeClass_STRUCT:case typelib_TypeClass_EXCEPTION:{D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);fields(p,reinterpret_cast<P*>(d),true,t,held,w,variant);typelib_typedescription_release(d);break;}case typelib_TypeClass_SEQUENCE:{auto*s=cppu::allocSeq(8,3);for(int i=0;i<3;i++)reinterpret_cast<void**>(s->elements)[i]=i==1?nullptr:w;cppu::destructSequence(*static_cast<uno_Sequence**>(p),r,nullptr,nullptr);*static_cast<uno_Sequence**>(p)=s;break;}default:break;}}
void fields(void*p,P*d,bool fillFlag,Types&t,rtl_uString*held,W*w,int variant){if(d->pBaseTypeDescription)fields(p,d->pBaseTypeDescription,fillFlag,t,held,w,variant);for(int i=d->nMembers;i--;)fill(static_cast<char*>(p)+d->pMemberOffsets[i],d->ppTypeRefs[i],t,held,w,variant);}
void*sample(R*r,D*d,Types&t,rtl_uString*held,W*w,int variant){void*p=std::malloc(d->nSize?d->nSize:4);std::memset(p,0xa5,d->nSize?d->nSize:4);uno_type_constructData(p,r);fill(p,r,t,held,w,variant);return p;}
void copyData(int m,void*out,void*in,R*r,D*d,uno_Mapping*map){switch(m){case 0:cppu::_copyConstructData(out,in,r,nullptr,nullptr,nullptr);break;case 1:cppu::_copyConstructData(out,in,r,d,acquire,nullptr);break;case 2:uno_type_copyData(out,in,r,acquire);break;case 3:uno_copyData(out,in,d,nullptr);break;case 4:cppu::_copyConstructData(out,in,r,nullptr,nullptr,map);break;case 5:cppu::_copyConstructData(out,in,r,d,acquire,map);break;case 6:uno_type_copyAndConvertData(out,in,r,map);break;case 7:uno_copyAndConvertData(out,in,d,map);break;}}
void data(){Types t;for(int c=0;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int m=0;m<8;m++)for(int v=0;v<3;v++){rtl::OUString held=rtl::OUString::createFromAscii("owned");W w={{acquired,released,nullptr},41,10},target={{acquired,released,nullptr},91,10};M mapRecord={{nullptr,nullptr,map},&target,v==1};void*src=sample(r,d,t,held.pData,&w,v),*dst=std::malloc(d->nSize?d->nSize:4);std::memset(dst,0xa5,d->nSize?d->nSize:4);emit({c,m,v});ref(r);text(held.pData);copyData(m,dst,src,r,d,&mapRecord.m);value(dst,r);ref(r);text(held.pData);emit({w.count,target.count});uno_type_destructData(dst,r,release);uno_type_destructData(src,r,release);emit({w.count,target.count});ref(r);text(held.pData);std::free(dst);std::free(src);}typelib_typedescription_release(d);}}
void copyAny(int m,uno_Any*out,void*src,R*r,D*d,uno_Mapping*map){switch(m){case 0:cppu::_copyConstructAny(out,src,r,nullptr,nullptr,nullptr);break;case 1:cppu::_copyConstructAny(out,src,r,d,acquire,map);break;case 2:uno_type_any_construct(out,src,r,nullptr);break;case 3:uno_any_construct(out,src,d,acquire);break;case 4:uno_type_any_constructAndConvert(out,src,r,map);break;case 5:uno_any_constructAndConvert(out,src,d,map);break;case 6:uno_type_any_assign(out,src,r,acquire,release);break;case 7:uno_any_assign(out,src,d,acquire,release);break;}}
void anys(){Types t;for(int c=0;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int m=0;m<8;m++)for(int present=0;present<2;present++)for(int v=0;v<3;v++){rtl::OUString held=rtl::OUString::createFromAscii("any");W w={{acquired,released,nullptr},41,10},target={{acquired,released,nullptr},91,10};M mapping={{nullptr,nullptr,map},&target,v==1};void*src=present?sample(r,d,t,held.pData,&w,v):nullptr;uno_Any dst={nullptr,&marker,&marker};if(m>=6)uno_type_any_construct(&dst,&held.pData,type(typelib_TypeClass_STRING),nullptr);emit({c,m,present,v});ref(r);text(held.pData);copyAny(m,&dst,src,r,d,&mapping.m);anyValue(&dst);ref(r);text(held.pData);emit({w.count,target.count});uno_any_destruct(&dst,release);if(src){uno_type_destructData(src,r,release);std::free(src);}ref(r);text(held.pData);emit({w.count,target.count});}typelib_typedescription_release(d);}
for(int m=2;m<8;m++){rtl::OUString held=rtl::OUString::createFromAscii("null-type");uno_Any a={nullptr,&marker,&marker};if(m>=6)uno_type_any_construct(&a,&held.pData,type(typelib_TypeClass_STRING),nullptr);emit({m});text(held.pData);copyAny(m,&a,nullptr,nullptr,nullptr,nullptr);anyValue(&a);text(held.pData);uno_any_destruct(&a,nullptr);}}
void seqs(){Types t;for(C c:{typelib_TypeClass_BYTE,typelib_TypeClass_STRING,typelib_TypeClass_TYPE,typelib_TypeClass_ENUM,typelib_TypeClass_ANY,typelib_TypeClass_STRUCT,typelib_TypeClass_EXCEPTION,typelib_TypeClass_SEQUENCE,typelib_TypeClass_INTERFACE}){R*r=c==typelib_TypeClass_SEQUENCE?t.seq->pWeakRef:t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);D*sd=sequence(r);for(int n:{0,3})for(int m=0;m<3;m++){rtl::OUString held=rtl::OUString::createFromAscii("sequence");W w={{acquired,released,nullptr},41,10},target={{acquired,released,nullptr},91,10};M mapping={{nullptr,nullptr,map},&target,m==2};auto*src=cppu::allocSeq(d->nSize,n);for(int i=0;i<n;i++){void*p=src->elements+d->nSize*i;uno_type_constructData(p,r);fill(p,r,t,held.pData,&w,i);}emit({c,n,m});ref(r);text(held.pData);auto*dst=cppu::icopyConstructSequence(src,r,nullptr,m?&mapping.m:nullptr);emit({dst==src,dst==&cppu::g_emptySeq});value(&dst,sd->pWeakRef);ref(r);text(held.pData);emit({w.count,target.count});cppu::destructSequence(dst,sd->pWeakRef,sd,release);cppu::destructSequence(src,sd->pWeakRef,sd,release);ref(r);text(held.pData);emit({w.count,target.count});}typelib_typedescription_release(sd);typelib_typedescription_release(d);}}
extern "C" void typelib_typedescription_newEmpty(D**,C,rtl_uString*) noexcept;
void guards(){Types t;for(auto pair:{std::pair<int,int>{0,0},{8,0},{1,3},{2147483647,2147483647}}){auto*s=cppu::allocSeq(pair.first,pair.second);emit({pair.first,pair.second,s==nullptr});if(s){emit({s->nRefCount,s->nElements});std::free(s);}}
rtl::OUString n=rtl::OUString::createFromAscii("copy.Typedef");D*td=nullptr;typelib_typedescription_newEmpty(&td,typelib_TypeClass_TYPEDEF,n.pData);auto*r=reinterpret_cast<R*>(td);uno_Any a={nullptr,&marker,&marker};cppu::_copyConstructAnyFromData(&a,&marker,type(typelib_TypeClass_ANY),nullptr,nullptr,nullptr);emit({a.pData==&marker,a.pReserved==&marker});ref(a.pType);typelib_typedescriptionreference_release(a.pType);for(int mode=0;mode<2;mode++){a={nullptr,&marker,&marker};if(mode)cppu::_copyConstructAny(&a,nullptr,r,nullptr,nullptr,nullptr);else cppu::_copyConstructAnyFromData(&a,&marker,r,nullptr,nullptr,nullptr);emit({mode,a.pData==&marker,a.pReserved==&marker});ref(a.pType);typelib_typedescriptionreference_release(a.pType);}
W w={{acquired,released,nullptr},41,10},target={{acquired,released,nullptr},91,10};M mapping={{nullptr,nullptr,map},&target,false};uno_Sequence header={1,2147483647,{0}};for(R*e:{type(typelib_TypeClass_ANY),t.record->pWeakRef,t.exc->pWeakRef,t.seq->pWeakRef,type(typelib_TypeClass_INTERFACE),r}){ref(e);auto*ret=cppu::icopyConstructSequence(&header,e,nullptr,&mapping.m);emit({ret==nullptr,header.nRefCount});ref(e);}typelib_typedescription_release(td);
void*mem=std::malloc(64);auto*first=static_cast<sal_Int32*>(mem);*first=17;auto*sub=static_cast<char*>(mem)+8;*reinterpret_cast<sal_Int32*>(sub)=29;emit({static_cast<char*>(mem)+0==mem,sub+8==static_cast<char*>(mem)+16,*first,*reinterpret_cast<sal_Int32*>(sub)});auto*pa=reinterpret_cast<uno_Any*>(static_cast<char*>(mem)+24);*pa={type(typelib_TypeClass_BYTE),nullptr,&marker};emit({static_cast<void*>(&pa->pReserved)==static_cast<char*>(mem)+40});pa->pReserved=first;void**reserved=&pa->pReserved;emit({*reserved==first});*reserved=sub;emit({pa->pReserved==sub});std::free(mem);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="data")data();else if(mode=="any")anys();else if(mode=="sequences")seqs();else if(mode=="guards")guards();else return 2;return 0;}
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
for (const mode of ["data", "any", "sequences", "guards"]) {
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
    "Complete original copy.hxx normal LP64 logical copy/default/convert and all original any.cxx C boundaries plus actual data.cxx copy wrappers; all72 full unchanged original native SAL/CPPU owners normal and ASan/UBSan. Complete initialized scalar/default/Any/enum/base/derived/exception/sequence fields, actual type/name/description/string/count ownership, null/source/default/flatten/description/mapping/callback branches and reverse-member/sequence mapping order are compared. Addressed storage uses native JS lazy live byte-offset views and actual Any reserved-field cells without type lookup/default/provider work; physical allocation/ABI/partial reserved bytes, native malloc resource failure,32-bit/debug1/native threads/shutdown/full QA and Any C++/Reference/default exception/case/service/UI consumers remain unfinished or unverified. Synthetic initialized header-only huge counts observe actual allocation range guards without reading nonexistent tail elements; diagnostic-only nested Any/TYPEDEF/unexpected element paths are not supported-producer claims. Normal/sanitized streams agree; system libraries uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO copy/default construction observations");
console.log(
  `Original UNO copy/default construction observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
