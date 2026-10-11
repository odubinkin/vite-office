/** @fileoverview Captures original complete CPPU interface factories, inherited ordering and source-defined ownership using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-interface-factories-native";
const fixture = "apps/office/src/cppu/source/typelib/native-interface-factories-cases.json";
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
#include <vector>
#include "typelib.cxx"
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using I=typelib_InterfaceTypeDescription;
void emit(std::initializer_list<sal_Int32> row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void text(rtl_uString*s){emit({s->refCount,s->length});for(int i=0;i<s->length;i++)emit({s->buffer[i]});emit({s->buffer[s->length]});}
void reference(R*r){emit({r->nRefCount,r->nStaticRefCount,r->eTypeClass,r->pType!=nullptr});text(r->pTypeName);}
void observe(I*i){auto*d=&i->aBase;emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==reinterpret_cast<R*>(d),d->bOnDemand});text(d->pTypeName);emit({i->nMembers,i->nAllMembers,i->nBaseTypes,i->ppBaseTypes==nullptr,i->pBaseTypeDescription==nullptr,i->ppMembers==nullptr,i->ppAllMembers==nullptr,i->pMapMemberIndexToFunctionIndex==nullptr,i->nMapFunctionIndexToMemberIndex,i->pMapFunctionIndexToMemberIndex==nullptr,static_cast<sal_Int32>(i->aUik.m_Data1),i->aUik.m_Data2,i->aUik.m_Data3,static_cast<sal_Int32>(i->aUik.m_Data4),static_cast<sal_Int32>(i->aUik.m_Data5)});
 if(i->nBaseTypes)emit({i->pBaseTypeDescription==i->ppBaseTypes[0]});
 for(int j=0;j<i->nBaseTypes;j++){emit({i->ppBaseTypes[j]->aBase.nRefCount});text(i->ppBaseTypes[j]->aBase.pTypeName);}
 if(i->nMembers)emit({i->ppMembers==i->ppAllMembers+(i->nAllMembers-i->nMembers)});
 for(int j=0;j<i->nAllMembers;j++)reference(i->ppAllMembers[j]);
 BaseList list(i);emit({list.getBaseMembers(),static_cast<sal_Int32>(list.getList().size())});for(auto const&e:list.getList()){emit({e.memberOffset,e.directBaseIndex,e.directBaseMemberOffset});text(e.base->aBase.pTypeName);}
}
std::vector<R*> members(OUString const&name,int count){std::vector<R*> result(count);for(int j=0;j<count;j++){OUString n=name+"::M"+OUString::number(j);typelib_typedescriptionreference_new(&result[j],j%2?typelib_TypeClass_INTERFACE_ATTRIBUTE:typelib_TypeClass_INTERFACE_METHOD,n.pData);}return result;}
I*make(OUString const&name,std::vector<R*>const&bases,std::vector<R*>const&own,bool single=false,I*old=nullptr){I*i=old;if(single){typelib_typedescription_newInterface(&i,name.pData,17,18,19,20,21,bases.empty()?nullptr:bases[0],own.size(),own.empty()?nullptr:const_cast<R**>(own.data()));}else typelib_typedescription_newMIInterface(&i,name.pData,17,18,19,20,21,bases.size(),bases.empty()?nullptr:const_cast<R**>(bases.data()),own.size(),own.empty()?nullptr:const_cast<R**>(own.data()));return i;}
void refs(std::vector<R*>const&v){for(auto*r:v)emit({r->nRefCount});}
void release(std::vector<R*>const&v){for(auto*r:v)typelib_typedescriptionreference_release(r);}
void simple(){for(bool single:{false,true})for(bool old:{false,true})for(int count:{0,1,3}){OUString name(u"factory.Simple",14),prior(u"factory.Prior",13);auto own=members(name,count),previous=members(prior,2);I*i=old?make(prior,{},previous):nullptr;emit({single,old,count,name.pData->refCount,prior.pData->refCount});refs(own);refs(previous);i=make(name,{},own,single,i);observe(i);emit({name.pData->refCount,prior.pData->refCount});refs(own);refs(previous);typelib_typedescription_release(&i->aBase);emit({name.pData->refCount,prior.pData->refCount});refs(own);refs(previous);release(own);release(previous);}}
void diamond(){OUString rn(u"factory.Root",12),ln(u"factory.Left",12),qn(u"factory.Right",13),dn(u"factory.Derived",15);auto rm=members(rn,2),lm=members(ln,1),qm=members(qn,2),dm=members(dn,3);I*r=make(rn,{},rm),*l=make(ln,{r->aBase.pWeakRef},lm),*q=make(qn,{r->aBase.pWeakRef},qm);std::vector<std::vector<R*>> paths={{l->aBase.pWeakRef,q->aBase.pWeakRef},{q->aBase.pWeakRef,l->aBase.pWeakRef},{l->aBase.pWeakRef,l->aBase.pWeakRef},{q->aBase.pWeakRef,l->aBase.pWeakRef,q->aBase.pWeakRef},{r->aBase.pWeakRef,l->aBase.pWeakRef,q->aBase.pWeakRef}};
 for(int path=0;path<5;path++)for(int count:{0,1,3}){std::vector<R*>own(dm.begin(),dm.begin()+count);emit({path,count});I*d=make(dn,paths[path],own);observe(d);emit({r->aBase.nRefCount,l->aBase.nRefCount,q->aBase.nRefCount});refs(rm);refs(lm);refs(qm);refs(dm);
 if(count){int offset=d->nAllMembers-d->nMembers;R*a=d->ppMembers[0],*b=d->ppAllMembers[offset];d->ppMembers[0]=dm[2];emit({d->ppAllMembers[offset]==dm[2]});d->ppAllMembers[offset]=b;emit({d->ppMembers[0]==a});}
 typelib_typedescription_release(&d->aBase);emit({r->aBase.nRefCount,l->aBase.nRefCount,q->aBase.nRefCount});refs(dm);}
 I*s=make(dn,{l->aBase.pWeakRef},dm,true);observe(s);typelib_typedescription_release(&s->aBase);typelib_typedescription_release(&q->aBase);typelib_typedescription_release(&l->aBase);typelib_typedescription_release(&r->aBase);refs(rm);refs(lm);refs(qm);refs(dm);release(rm);release(lm);release(qm);release(dm);}
void emptyBase(){OUString bn(u"factory.EmptyBase",17),dn(u"factory.EmptyDerived",20);I*b=make(bn,{},{});b->aBase.bComplete=true;I*d=make(dn,{b->aBase.pWeakRef},{});observe(d);emit({b->aBase.nRefCount});typelib_typedescription_release(&d->aBase);emit({b->aBase.nRefCount});typelib_typedescription_release(&b->aBase);}
void unicode(){for(unsigned unit=0;unit<65536;unit++){sal_Unicode buf[]={u'F',u'.',static_cast<sal_Unicode>(unit),u'X'};OUString bn(buf,4),dn(u"factory.Unicode",15);auto own=members(bn,2);I*b=make(bn,{},own);I*d=make(dn,{b->aBase.pWeakRef},{});emit({static_cast<sal_Int32>(unit)});observe(d);emit({b->aBase.nRefCount,bn.pData->refCount,dn.pData->refCount});refs(own);typelib_typedescription_release(&d->aBase);typelib_typedescription_release(&b->aBase);emit({bn.pData->refCount,dn.pData->refCount});refs(own);release(own);}}
void failure(){for(bool old:{false,true})for(bool missing:{false,true}){OUString bn(u"factory.Unavailable",19),dn(u"factory.Failure",15),pn(u"factory.Previous",16);R*b=nullptr;if(missing)typelib_typedescriptionreference_new(&b,typelib_TypeClass_INTERFACE_METHOD,bn.pData);else b=make(bn,{},{})->aBase.pWeakRef;auto own=members(pn,1);I*d=old?make(pn,{},own):nullptr;emit({old,missing,b->nRefCount,bn.pData->refCount,dn.pData->refCount,pn.pData->refCount});refs(own);d=make(dn,{b},{},false,d);emit({d==nullptr,b->nRefCount,bn.pData->refCount,dn.pData->refCount,pn.pData->refCount});refs(own);typelib_typedescriptionreference_release(b);emit({bn.pData->refCount,dn.pData->refCount,pn.pData->refCount});refs(own);release(own);}}
void nested(){OUString rn(u"nested.Root",11),ln(u"nested.Left",11),qn(u"nested.Right",12),dn(u"nested.Diamond",14),en(u"nested.Deep",11);auto rm=members(rn,2),lm=members(ln,1),qm=members(qn,1),dm=members(dn,1),em=members(en,2);I*r=make(rn,{},rm),*l=make(ln,{r->aBase.pWeakRef},lm),*q=make(qn,{r->aBase.pWeakRef},qm),*d=make(dn,{l->aBase.pWeakRef,q->aBase.pWeakRef},dm);R*placeholder=nullptr;typelib_typedescriptionreference_new(&placeholder,typelib_TypeClass_INTERFACE,en.pData);auto*target=placeholder->pType;I*e=make(en,{d->aBase.pWeakRef},em);emit({&e->aBase==target});observe(e);typelib_typedescription_register(reinterpret_cast<D**>(&e));emit({&e->aBase==target,e->aBase.pWeakRef==placeholder});observe(e);R*a=e->ppMembers[0],*b=e->ppAllMembers[e->nAllMembers-e->nMembers];e->ppMembers[0]=em[1];emit({e->ppAllMembers[e->nAllMembers-e->nMembers]==em[1]});e->ppAllMembers[e->nAllMembers-e->nMembers]=b;emit({e->ppMembers[0]==a});emit({typelib_typedescription_complete(reinterpret_cast<D**>(&e))});observe(e);for(int j=0;j<e->nAllMembers;j++)emit({e->pMapMemberIndexToFunctionIndex[j]});for(int j=0;j<e->nMapFunctionIndexToMemberIndex;j++)emit({e->pMapFunctionIndexToMemberIndex[j]});typelib_typedescription_release(&e->aBase);emit({placeholder->nRefCount});typelib_typedescriptionreference_release(placeholder);emit({d->aBase.nRefCount});typelib_typedescription_release(&d->aBase);typelib_typedescription_release(&q->aBase);typelib_typedescription_release(&l->aBase);typelib_typedescription_release(&r->aBase);refs(rm);refs(lm);refs(qm);refs(dm);refs(em);release(rm);release(lm);release(qm);release(dm);release(em);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="simple")simple();else if(mode=="diamond")diamond();else if(mode=="empty-base")emptyBase();else if(mode=="unicode")unicode();else if(mode=="failure")failure();else if(mode=="nested")nested();else return 2;return 0;}
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
for (const mode of ["simple", "diamond", "empty-base", "unicode", "failure", "nested"]) {
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
    "Full unchanged SAL/CPPU original interface factories and BaseList under normal and ASan/UBSan. Complete initialized fields, exact diamond/direct-base ordering and duplicate-base offsets, nested diamond deduplication, canonical registration transfer and completion with original call maps, derived names for all65536 UTF16 units, original pointer-array alias reads/writes, output replacement and acquired reference/name counts through destruction and early failure. Failure callers deliberately provide unavailable base descriptions; ordinary failing-producer reachability, native ABI, cross-thread scheduling/shutdown and full consumer QA remain unverified; system libraries are not instrumented and leak detection is disabled for original persistent registries and source-defined failure retention. No original source method is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original interface factory observations");
console.log(
  `Original interface factory observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
