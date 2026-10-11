/** @fileoverview Captures complete original UNO destruction and true type/ownership fields using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-destr-native";
const fixture = "apps/office/src/cppu/source/uno/native-destr-cases.json";
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
#include "destr.hxx"
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
void cleanup(void*p,R*r){uno_type_destructData(p,r,nullptr);}
void destroy(int mode,void*p,R*r,D*d,uno_ReleaseFunc release){if(mode==0)cppu::_destructData(p,r,nullptr,release);else if(mode==1)cppu::_destructData(p,r,d,release);else if(mode==2)uno_type_destructData(p,r,release);else uno_destructData(p,d,release);}
void construct(int mode,void*p,R*r,D*d){if(mode==0)cppu::_defaultConstructData(p,r,nullptr);else if(mode==1)cppu::_defaultConstructData(p,r,d);else if(mode==2)uno_type_constructData(p,r);else uno_constructData(p,d);}
void scalars(){for(int c=0;c<=22;c++){if(c>14&&c!=22)continue;R*r=*typelib_static_type_getByTypeClass(static_cast<C>(c));D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int m=0;m<4;m++){void*p=std::malloc(24);std::memset(p,0xa5,24);prepare(p,r);emit({c,m});ref(r);construct(m,p,r,d);observe(p,r);ref(r);destroy(m,p,r,d,nullptr);ref(r);std::free(p);}typelib_typedescription_release(d);}}
D*makeEnum(){rtl::OUString name=rtl::OUString::createFromAscii("default.Enum"),low=rtl::OUString::createFromAscii("Low"),high=rtl::OUString::createFromAscii("High");rtl_uString*names[]={low.pData,high.pData};sal_Int32 values[]={-23,19};D*d=nullptr;typelib_typedescription_newEnum(&d,name.pData,-23,2,names,values);typelib_typedescription_register(&d);return d;}
D*makeSequence(){rtl::OUString name=rtl::OUString::createFromAscii("[]byte");D*d=nullptr;typelib_typedescription_new(&d,typelib_TypeClass_SEQUENCE,name.pData,*typelib_static_type_getByTypeClass(typelib_TypeClass_BYTE),0,nullptr);typelib_typedescription_register(&d);return d;}
D*makeCompound(char const*label,C cls,D*base,std::vector<R*>const&types){rtl::OUString name=rtl::OUString::createFromAscii(label);std::vector<rtl::OUString>names;names.reserve(types.size());for(size_t i=0;i<types.size();i++){std::string n="m"+std::to_string(i);names.push_back(rtl::OUString::createFromAscii(n.c_str()));}std::vector<typelib_CompoundMember_Init>members;for(size_t i=0;i<types.size();i++)members.push_back({types[i]->eTypeClass,types[i]->pTypeName,names[i].pData});D*d=nullptr;typelib_typedescription_new(&d,cls,name.pData,base?base->pWeakRef:nullptr,types.size(),members.data());typelib_typedescription_register(&d);return d;}
void fields(void*p,P*d,int action){if(d->pBaseTypeDescription)fields(p,d->pBaseTypeDescription,action);for(int i=d->nMembers;i--;){void*v=static_cast<char*>(p)+d->pMemberOffsets[i];R*r=d->ppTypeRefs[i];if(r->eTypeClass==typelib_TypeClass_STRUCT||r->eTypeClass==typelib_TypeClass_EXCEPTION){D*sub=nullptr;typelib_typedescriptionreference_getDescription(&sub,r);if(action==1){emit({i,d->pMemberOffsets[i],r->eTypeClass});ref(r);}fields(v,reinterpret_cast<P*>(sub),action);typelib_typedescription_release(sub);}else if(action==0)prepare(v,r);else if(action==1){emit({i,d->pMemberOffsets[i],r->eTypeClass});observe(v,r);}else cleanup(v,r);}}
void records(){D*e=makeEnum(),*seq=makeSequence();auto type=[](C c){return *typelib_static_type_getByTypeClass(c);};D*base=makeCompound("default.Base",typelib_TypeClass_STRUCT,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_TYPE),type(typelib_TypeClass_ANY)});D*derived=makeCompound("default.Derived",typelib_TypeClass_STRUCT,base,{seq->pWeakRef,e->pWeakRef});D*nested=makeCompound("default.Nested",typelib_TypeClass_STRUCT,nullptr,{derived->pWeakRef,type(typelib_TypeClass_INTERFACE),type(typelib_TypeClass_BOOLEAN)});D*exc=makeCompound("default.Exception",typelib_TypeClass_EXCEPTION,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_INTERFACE)});D*subExc=makeCompound("default.DerivedException",typelib_TypeClass_EXCEPTION,exc,{type(typelib_TypeClass_ANY),type(typelib_TypeClass_LONG)});D*empty=makeCompound("default.Empty",typelib_TypeClass_STRUCT,nullptr,{});D*baseOnly=makeCompound("default.BaseOnly",typelib_TypeClass_STRUCT,base,{});
for(D*d:{e,base,derived,nested,exc,subExc,empty,baseOnly})for(int m=0;m<4;m++){void*p=std::malloc(d->nSize);std::memset(p,0xa5,d->nSize);auto*compound=reinterpret_cast<P*>(d);if(d!=e)fields(p,compound,0);emit({m});ref(d->pWeakRef);desc(d);construct(m,p,d->pWeakRef,d);if(d==e)observe(p,d->pWeakRef);else fields(p,compound,1);ref(d->pWeakRef);desc(d);destroy(m,p,d->pWeakRef,d,nullptr);ref(d->pWeakRef);desc(d);std::free(p);}for(D*d:{baseOnly,empty,subExc,exc,nested,derived,base,seq,e})typelib_typedescription_release(d);}
struct W{uno_Interface i;sal_Int32 id,count;};
void acquire(uno_Interface*p){auto*w=reinterpret_cast<W*>(p);++w->count;}
void released(uno_Interface*p){auto*w=reinterpret_cast<W*>(p);emit({w->id,--w->count});}
void release(void*p){released(static_cast<uno_Interface*>(p));}
R*type(C c){return *typelib_static_type_getByTypeClass(c);}
extern "C" void typelib_typedescription_newEmpty(D**,C,rtl_uString*) noexcept;
R*typeDef(){rtl::OUString n=rtl::OUString::createFromAscii("destroy.Typedef");D*d=nullptr;typelib_typedescription_newEmpty(&d,typelib_TypeClass_TYPEDEF,n.pData);return reinterpret_cast<R*>(d);}
void anyValues(){D*e=makeEnum(),*seq=makeSequence(),*compound=makeCompound("destroy.AnyStruct",typelib_TypeClass_STRUCT,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_INTERFACE)}),*exception=makeCompound("destroy.AnyException",typelib_TypeClass_EXCEPTION,nullptr,{type(typelib_TypeClass_STRING),type(typelib_TypeClass_INTERFACE)});R*td=typeDef();cppu::_destructData(&marker,td,nullptr,nullptr);for(int c=0;c<=22;c++){if((c>19&&c!=20&&c!=22)||c==18)continue;R*r=c==15?e->pWeakRef:c==17?compound->pWeakRef:c==19?exception->pWeakRef:c==16?td:c==20?seq->pWeakRef:type(static_cast<C>(c));if(c==20)r=seq->pWeakRef;for(int m=0;m<3;m++)for(int cb=0;cb<2;cb++)for(int nonnull=0;nonnull<2;nonnull++){rtl::OUString hold=rtl::OUString::createFromAscii("held");R*held=type(typelib_TypeClass_BYTE);W w={{acquire,released,nullptr},73,10};uno_Any a={r,nullptr,&marker};typelib_typedescriptionreference_acquire(r);a.pData=&a.pReserved;
switch(c){case 12:a.pReserved=hold.pData;rtl_uString_acquire(hold.pData);break;case 13:a.pReserved=held;typelib_typedescriptionreference_acquire(held);break;case 14:{auto*n=static_cast<uno_Any*>(std::malloc(sizeof(uno_Any)));*n={type(typelib_TypeClass_STRING),nullptr,hold.pData};n->pData=&n->pReserved;typelib_typedescriptionreference_acquire(n->pType);rtl_uString_acquire(hold.pData);a.pData=n;break;}case 17:case 19:{D*d=c==17?compound:exception;void*p=std::malloc(d->nSize);uno_constructData(p,d);auto*q=reinterpret_cast<P*>(d);if(nonnull)*reinterpret_cast<void**>(static_cast<char*>(p)+q->pMemberOffsets[1])=&w;a.pData=p;break;}case 20:a.pReserved=cppu::createEmptySequence();break;case 22:a.pReserved=nonnull?static_cast<void*>(&w):nullptr;break;default:break;}
void*oldData=a.pData;void*oldReserved=a.pReserved;emit({c,m,cb,nonnull});ref(r);text(hold.pData);ref(held);if(m==0)cppu::_destructAny(&a,cb?release:nullptr);else if(m==1)uno_any_destruct(&a,cb?release:nullptr);else uno_any_clear(&a,cb?release:nullptr);ref(r);text(hold.pData);ref(held);emit({w.count,a.pData==&a,a.pData==oldData,a.pReserved==oldReserved,a.pType==(m==2?cppu::g_pVoidType:r)});if(m==2){ref(a.pType);uno_any_destruct(&a,nullptr);}}
}typelib_typedescriptionreference_release(td);for(D*d:{exception,compound,seq,e})typelib_typedescription_release(d);}
void elements(){D*e=makeEnum(),*seq=makeSequence();D*base=makeCompound("destroy.ElementBase",typelib_TypeClass_STRUCT,nullptr,{type(typelib_TypeClass_INTERFACE),type(typelib_TypeClass_INTERFACE)});D*derived=makeCompound("destroy.ElementDerived",typelib_TypeClass_STRUCT,base,{type(typelib_TypeClass_INTERFACE),type(typelib_TypeClass_INTERFACE)});D*exception=makeCompound("destroy.ElementException",typelib_TypeClass_EXCEPTION,nullptr,{type(typelib_TypeClass_INTERFACE),type(typelib_TypeClass_STRING)});R*td=typeDef();for(int c=0;c<=22;c++){if((c>19&&c!=20&&c!=22)||c==18)continue;R*r=c==15?e->pWeakRef:c==17?derived->pWeakRef:c==19?exception->pWeakRef:c==16?td:c==20?seq->pWeakRef:type(static_cast<C>(c));D*d=nullptr;if(c!=16)typelib_typedescriptionreference_getDescription(&d,r);int size=c==16?0:d->nSize;for(int cb=0;cb<2;cb++)for(int empty=0;empty<2;empty++){void*p=std::malloc(size*5+1);std::memset(p,0,size*5+1);rtl::OUString held=rtl::OUString::createFromAscii("element");W w[5];for(int i=0;i<5;i++){w[i]={{acquire,released,nullptr},i,10};void*v=static_cast<char*>(p)+size*i;switch(c){case 12:*static_cast<rtl_uString**>(v)=held.pData;rtl_uString_acquire(held.pData);break;case 13:*static_cast<R**>(v)=type(typelib_TypeClass_BYTE);typelib_typedescriptionreference_acquire(type(typelib_TypeClass_BYTE));break;case 14:{auto*a=static_cast<uno_Any*>(v);*a={type(typelib_TypeClass_INTERFACE),nullptr,i==2?nullptr:&w[i]};a->pData=&a->pReserved;typelib_typedescriptionreference_acquire(a->pType);break;}case 17:{uno_constructData(v,d);auto*pd=reinterpret_cast<P*>(d);auto*pb=pd->pBaseTypeDescription;for(int j=0;j<2;j++){*reinterpret_cast<void**>(static_cast<char*>(v)+pb->pMemberOffsets[j])=&w[i];*reinterpret_cast<void**>(static_cast<char*>(v)+pd->pMemberOffsets[j])=&w[i];}break;}case 19:{uno_constructData(v,d);*reinterpret_cast<void**>(static_cast<char*>(v)+reinterpret_cast<P*>(d)->pMemberOffsets[0])=&w[i];break;}case 20:*static_cast<uno_Sequence**>(v)=cppu::createEmptySequence();break;case 22:*static_cast<void**>(v)=i==2?nullptr:&w[i];break;default:break;}}
emit({c,cb,empty});ref(r);text(held.pData);ref(type(typelib_TypeClass_BYTE));int result=cppu::idestructElements(p,r,empty?3:1,empty?3:4,cb?release:nullptr);emit({result});ref(r);text(held.pData);ref(type(typelib_TypeClass_BYTE));for(auto const&a:w)emit({a.id,a.count});if(empty)cppu::idestructElements(p,r,0,5,cb?release:nullptr);else{cppu::idestructElements(p,r,0,1,cb?release:nullptr);cppu::idestructElements(p,r,4,5,cb?release:nullptr);}std::free(p);}if(d)typelib_typedescription_release(d);}typelib_typedescriptionreference_release(td);for(D*d:{exception,derived,base,seq,e})typelib_typedescription_release(d);}
D*sequenceOf(C c){rtl::OUString n=rtl::OUString::Concat("[]")+rtl::OUString(type(c)->pTypeName);D*d=nullptr;typelib_typedescription_new(&d,typelib_TypeClass_SEQUENCE,n.pData,type(c),0,nullptr);typelib_typedescription_register(&d);return d;}
void sequences(){for(C c:{typelib_TypeClass_BYTE,typelib_TypeClass_STRING,typelib_TypeClass_INTERFACE}){D*d=sequenceOf(c);for(int count:{0,3})for(int mode=0;mode<4;mode++){int size=c==typelib_TypeClass_BYTE?1:8;auto*s=static_cast<uno_Sequence*>(std::malloc(8+size*count));s->nRefCount=2;s->nElements=count;rtl::OUString held=rtl::OUString::createFromAscii("sequence");W w[3];for(int i=0;i<count;i++){w[i]={{acquire,released,nullptr},i,10};if(c==typelib_TypeClass_STRING){reinterpret_cast<rtl_uString**>(s->elements)[i]=held.pData;rtl_uString_acquire(held.pData);}else if(c==typelib_TypeClass_INTERFACE)reinterpret_cast<void**>(s->elements)[i]=i==1?nullptr:&w[i];else s->elements[i]=i;}
emit({c,count,mode,s->nRefCount});ref(d->pWeakRef);text(held.pData);cppu::idestructSequence(s,d->pWeakRef,mode==1?d:nullptr,nullptr);emit({s->nRefCount});text(held.pData);if(mode==2){s->nRefCount=0;cppu::idestroySequence(s,d->pWeakRef,d,release);}else if(mode==3){s->nRefCount=0;uno_type_sequence_destroy(s,d->pWeakRef,release);}else cppu::destructSequence(s,d->pWeakRef,mode==1?d:nullptr,release);text(held.pData);ref(d->pWeakRef);}typelib_typedescription_release(d);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="scalars")scalars();else if(mode=="records")records();else if(mode=="any")anyValues();else if(mode=="elements")elements();else if(mode=="sequences")sequences();else if(mode=="assert-null")cppu::idestroySequence(nullptr,nullptr,nullptr,nullptr);else if(mode=="assert-count"){uno_Sequence s={1,0,{0}};cppu::idestroySequence(&s,nullptr,nullptr,nullptr);}else return 2;return 0;}

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
for (const mode of ["scalars", "records", "any", "elements", "sequences"]) {
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
const assertions = {};
for (const mode of ["assert-null", "assert-count"]) {
  for (const binary of [normal, sanitized]) {
    const r = capture(binary, mode);
    if (r.signal !== "SIGABRT" || !r.stderr.toString().includes("Assertion failed"))
      throw new Error("Original invariant did not abort: " + mode + " " + r.stderr);
  }
  assertions[mode] = { signal: "SIGABRT", normal: true, sanitized: true };
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
    "Complete original destr.hxx normal LP64 destruction and actual data.cxx/any.cxx/sequence.cxx destruction/clear wrappers, all72 full unchanged SAL/CPPU translation units normal and ASan/UBSan. All initialized scalar/default/enum/compound/derived/nested/exception/empty/base-only values, caller-initialized Any records including nested Any and normal diagnostic-only TYPEDEF, every element class, subranges/empty ranges, ascending element and base-first/reverse member callbacks, reference/string count/description/name fields, held sequence reference transitions, provided/temporary descriptions and actual zero-count C destruction are compared as complete streams. Native assertions are observed as original aborts. Allocated storage free uses browser GC without synthetic field clearing; caller scalar/pointer cells and source byte-offset addressed compound/element maps do not claim a physical JS binary ABI. Existing live atomic count adaptation owns one field only. Any/Sequence copy/construction/assignment/queryInterface/Reference/default RuntimeException/case/service/UI consumers, 32-bit/debug1 configuration, malformed storage, physical pointer/object lifetime/ABI, native threading/shutdown and full upstream QA remain unfinished or unverified. Normal diagnostic-only unexpected nested Any/TYPEDEF/unsupported element branches are observed without claiming valid generic producer behavior. System libraries uninstrumented; leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO destruction observations");
console.log(
  `Original UNO destruction observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
