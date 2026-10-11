/** @fileoverview Captures original complete CPPU two-stage description completion and interface call tables using unchanged full native dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-complete-native";
const fixture = "apps/office/src/cppu/source/typelib/native-complete-cases.json";
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
using D=typelib_TypeDescription;using R=typelib_TypeDescriptionReference;using I=typelib_InterfaceTypeDescription;using A=typelib_InterfaceAttributeTypeDescription;
void emit(std::initializer_list<sal_Int32> row){if(std::fwrite(row.begin(),4,row.size(),stdout)!=row.size())std::exit(3);}
void observe(D*d){emit({d->nRefCount,d->nStaticRefCount,d->eTypeClass,d->pTypeName->refCount,d->pSelf==d,d->bComplete,d->nSize,d->nAlignment,d->pWeakRef==nullptr,d->bOnDemand});}
D*empty(typelib_TypeClass c,rtl_uString*n){D*d=nullptr;typelib_typedescription_newEmpty(&d,c,n);return d;}
void tables(){
 OUString names[]={u"complete.Method"_ustr,u"complete.ReadOnly"_ustr,u"complete.ReadWrite"_ustr,u"complete.Missing"_ustr};
 D*anchor=empty(typelib_TypeClass_INTERFACE,u"complete.Anchor"_ustr.pData);R*refs[4]={};D*attrs[2]={};
 for(int i=0;i<4;i++)typelib_typedescriptionreference_new(&refs[i],i==0?typelib_TypeClass_INTERFACE_METHOD:typelib_TypeClass_INTERFACE_ATTRIBUTE,names[i].pData);
 for(int i=0;i<2;i++){attrs[i]=empty(typelib_TypeClass_INTERFACE_ATTRIBUTE,names[i+1].pData);auto*a=reinterpret_cast<A*>(attrs[i]);a->bReadOnly=i==0;a->pInterface=reinterpret_cast<I*>(anchor);typelib_typedescription_acquire(anchor);typelib_typedescription_register(&attrs[i]);}
 for(int n=0;n<=4;n++){int count=1;for(int i=0;i<n;i++)count*=4;for(int code=0;code<count;code++){
  D*d=empty(typelib_TypeClass_INTERFACE,u"complete.Tables"_ustr.pData);auto*t=reinterpret_cast<I*>(d);d->bComplete=false;t->nAllMembers=n;t->ppAllMembers=new R*[n];int v=code;
  for(int i=0;i<n;i++){t->ppAllMembers[i]=refs[v%4];typelib_typedescriptionreference_acquire(t->ppAllMembers[i]);v/=4;}
  emit({n,code,complete(&d,false),d->bComplete,t->pMapMemberIndexToFunctionIndex==nullptr,t->pMapFunctionIndexToMemberIndex==nullptr});
  emit({typelib_typedescription_complete(&d)});observe(d);emit({t->nMapFunctionIndexToMemberIndex});
  for(int i=0;i<n;i++)emit({t->pMapMemberIndexToFunctionIndex[i]});for(int i=0;i<t->nMapFunctionIndexToMemberIndex;i++)emit({t->pMapFunctionIndexToMemberIndex[i]});
  auto*m=t->pMapMemberIndexToFunctionIndex;auto*f=t->pMapFunctionIndexToMemberIndex;typelib_typedescription_initTables(d);emit({m==t->pMapMemberIndexToFunctionIndex,f==t->pMapFunctionIndexToMemberIndex});
  emit({attrs[0]->nRefCount,attrs[1]->nRefCount,anchor->nRefCount});for(auto*r:refs)emit({r->nRefCount});typelib_typedescription_release(d);for(auto*r:refs)emit({r->nRefCount});
 }}
 for(auto*a:attrs)typelib_typedescription_release(a);for(auto*r:refs)typelib_typedescriptionreference_release(r);observe(anchor);typelib_typedescription_release(anchor);
}
struct Provider{int kind;int calls;};
void callback(void*context,D**out,rtl_uString*name){auto*p=static_cast<Provider*>(context);p->calls++;if(p->kind==0 || OUString::unacquired(&name)==u"complete.AbsentTarget")return;
 if(p->kind==1)typelib_typedescription_newEnum(out,name,17,0,nullptr,nullptr);
 else if(p->kind==2){*out=empty(typelib_TypeClass_INTERFACE,name);(*out)->bComplete=false;auto*i=reinterpret_cast<I*>(*out);i->aUik={0,0,0,0,0};i->ppAllMembers=new R*[0];}
 else{OUString target=p->kind==3?OUString(name):u"complete.AbsentTarget"_ustr;R*r=nullptr;typelib_typedescriptionreference_new(&r,typelib_TypeClass_ENUM,target.pData);*out=empty(typelib_TypeClass_SEQUENCE,name);(*out)->eTypeClass=typelib_TypeClass_TYPEDEF;reinterpret_cast<typelib_IndirectTypeDescription*>(*out)->pType=r;}
}
void provider(){Provider p{0,0};typelib_typedescription_registerCallback(&p,callback);
 for(int k=0;k<260;k++){OUString name=OUString::Concat(u"complete.Enum")+OUString::number(k);R*r=nullptr;typelib_typedescriptionreference_new(&r,typelib_TypeClass_ENUM,name.pData);D*d=r->pType;typelib_typedescription_acquire(d);observe(d);int calls=p.calls;emit({typelib_typedescription_complete(&d),p.calls-calls});observe(d);p.kind=1;calls=p.calls;D*old=d;emit({typelib_typedescription_complete(&d),p.calls-calls,d==old});observe(d);emit({static_cast<sal_Int32>(Init().maCache.size())});calls=p.calls;emit({complete(&d,false),p.calls-calls});typelib_typedescription_release(d);emit({r->nRefCount});typelib_typedescriptionreference_release(r);p.kind=0;}
 for(bool init:{false,true}){p.kind=2;R*r=nullptr;OUString name=init?u"complete.InterfaceTrue"_ustr:u"complete.InterfaceFalse"_ustr;typelib_typedescriptionreference_new(&r,typelib_TypeClass_INTERFACE,name.pData);D*d=r->pType;typelib_typedescription_acquire(d);D*old=d;int calls=p.calls;emit({complete(&d,init),p.calls-calls,d==old});observe(d);auto*i=reinterpret_cast<I*>(d);emit({i->ppAllMembers!=nullptr,i->pMapMemberIndexToFunctionIndex!=nullptr,i->pMapFunctionIndexToMemberIndex!=nullptr,i->nMapFunctionIndexToMemberIndex});typelib_typedescription_release(d);typelib_typedescriptionreference_release(r);}
 for(int kind:{3,4}){p.kind=1;OUString name=kind==3?u"complete.Alias"_ustr:u"complete.AliasMissing"_ustr;D*target=nullptr;if(kind==3){typelib_typedescription_newEnum(&target,name.pData,9,0,nullptr,nullptr);typelib_typedescription_register(&target);}D*d=empty(typelib_TypeClass_ENUM,name.pData);d->bComplete=false;D*old=d;p.kind=kind;int calls=p.calls;emit({complete(&d,true),p.calls-calls,d==old});observe(d);typelib_typedescription_release(d);if(target)typelib_typedescription_release(target);}
 typelib_typedescription_revokeCallback(&p,callback);
}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="tables")tables();else if(mode=="provider")provider();else return 2;return 0;}
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
for (const mode of ["tables", "provider"]) {
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
    "Original complete/initTables with true unchanged full SAL/CPPU dependency owners. Synthetic initialized original allocator inputs isolate all table compositions, callbacks/typedef resolution/cache eviction and acquired counts. Interface/member factories, ordinary consumer reachability, physical ABI, concurrency, shutdown and full QA remain unverified. Full dependency owners instrumented under ASan/UBSan; system libraries are not. No original method is replaced.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original completion observations");
console.log(
  `Original completion observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
