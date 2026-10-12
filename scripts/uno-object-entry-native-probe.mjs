/** @fileoverview Captures complete original lbenv.cxx ObjectEntry operations and initialized value/callback/map lifetimes over full genuine desktop dependencies. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { prepareExceptionNative } from "./cppuhelper-exception-native-build.mjs";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { hash, pin, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/uno-object-entry-native",
  fixture = "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  native = prepareExceptionNative(target);
loadUnicodeOriginal(native.sources, "cppu/source/uno/lbenv.cxx");
const caller = String.raw`${unoNativeValueCaller}
#include "lbenv.cxx"
#include <utility>
#include <limits>
#include <vector>
using OEType=typelib_InterfaceTypeDescription;
std::vector<OEType*> types;std::vector<void*> pointers;std::vector<ObjectEntry*> objects;
int typeidof(OEType*p){for(size_t i=0;i<types.size();++i)if(types[i]==p)return i;return -1;}
int ptrid(void*p){if(!p)return -1;for(size_t i=0;i<pointers.size();++i)if(pointers[i]==p)return i;return -2;}
int objid(ObjectEntry*p){if(!p)return -1;for(size_t i=0;i<objects.size();++i)if(objects[i]==p)return i;return -2;}
void freeProxy(uno_ExtEnvironment*,void*){}
struct Caller{int label,count=100;};
uno_DefaultEnvironment*expectedEnv=nullptr;
void acquire(uno_ExtEnvironment*e,void*p){auto*c=static_cast<Caller*>(p);auto*v=static_cast<uno_DefaultEnvironment*>(e);emit({30,c->label,++c->count,v==expectedEnv,static_cast<int>(v->aPtr2ObjectMap.size()),v->aPtr2ObjectMap.find(p)!=v->aPtr2ObjectMap.end()});}
void release(uno_ExtEnvironment*,void*p){auto*c=static_cast<Caller*>(p);emit({31,c->label,--c->count});}
OEType*make(char const*name,std::vector<OEType*>const&bases,bool reg=true){rtl::OUString n=rtl::OUString::createFromAscii(name);std::vector<R*>refs;for(auto*b:bases)refs.push_back(b->aBase.pWeakRef);OEType*d=nullptr;typelib_typedescription_newMIInterface(&d,n.pData,0,0,0,0,0,refs.size(),refs.empty()?nullptr:refs.data(),0,nullptr);if(reg)typelib_typedescription_register(reinterpret_cast<D**>(&d));types.push_back(d);return d;}
void setup(){OEType*root=nullptr;typelib_typedescriptionreference_getDescription(reinterpret_cast<D**>(&root),*typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE));types.push_back(root);OEType*a=make("entry.A",{root});OEType*b=make("entry.B",{root});OEType*mi=make("entry.Multi",{a,b});make("entry.Child",{mi});make("entry.A",{root},false);make("entry.C",{root});make("entry.Long",{root});}
void snapshot(ObjectEntry const&e){emit({70,e.nRef,e.mixedObject,static_cast<int>(e.aInterfaces.size())});text(e.oid.pData);for(auto const&i:e.aInterfaces){emit({i.refCount,ptrid(i.pInterface),i.fpFreeProxy==freeProxy,typeidof(i.pTypeDescr)});desc(&i.pTypeDescr->aBase);}}
void cleanup(uno_DefaultEnvironment&e,ObjectEntry&o){for(auto const&i:o.aInterfaces){typelib_typedescription_release(&i.pTypeDescr->aBase);if(!i.fpFreeProxy)release(&e,i.pInterface);}e.aPtr2ObjectMap.clear();}
void constructors(){rtl::OUString id=rtl::OUString::createFromAscii("object id");{ObjectEntry a(id);snapshot(a);text(id.pData);a.nRef=-7;a.mixedObject=true;ObjectEntry b(a);snapshot(a);snapshot(b);ObjectEntry c(std::move(b));snapshot(b);snapshot(c);ObjectEntry d(rtl::OUString::createFromAscii("different"));snapshot(d);d=a;snapshot(d);d=d;snapshot(d);d=std::move(c);snapshot(d);snapshot(c);d=std::move(d);snapshot(d);}text(id.pData);rtl::OUString value=rtl::OUString::createFromAscii("rvalue");{ObjectEntry e(std::move(value));snapshot(e);text(value.pData);}text(value.pData);}
void appends(){setup();rtl::OUString label=rtl::OUString::createFromAscii("caller"),id=rtl::OUString::createFromAscii("oid");uno_DefaultEnvironment env(label,nullptr);env.acquireInterface=acquire;env.releaseInterface=release;expectedEnv=&env;Caller a{0},b{1};pointers={&a,&b};ObjectEntry e(id);objects={&e};snapshot(e);e.append(&env,&a,types[1],nullptr);snapshot(e);emit({71,objid(env.aPtr2ObjectMap[&a]),a.count,b.count});e.append(&env,&a,types[2],freeProxy);snapshot(e);emit({71,objid(env.aPtr2ObjectMap[&a]),a.count,b.count});e.append(&env,&b,types[3],nullptr);snapshot(e);emit({71,objid(env.aPtr2ObjectMap[&b]),a.count,b.count});cleanup(env,e);for(auto*t:types)desc(&t->aBase);}
void lookup(){setup();rtl::OUString label=rtl::OUString::createFromAscii("caller"),id=rtl::OUString::createFromAscii("oid");uno_DefaultEnvironment env(label,nullptr);env.acquireInterface=acquire;env.releaseInterface=release;expectedEnv=&env;Caller a{0},b{1},c{2};pointers={&a,&b,&c};ObjectEntry e(id);objects={&e};emit({80,e.find(types[0])==nullptr,e.find(&a,0)});e.append(&env,&a,types[4],freeProxy);for(int n=0;n<8;++n){auto*p=e.find(types[n]);emit({81,n,p?static_cast<int>(p-e.aInterfaces.data()):-1});}emit({82,typelib_typedescriptionreference_isAssignableFrom(types[2]->aBase.pWeakRef,types[4]->aBase.pWeakRef)});e.append(&env,&b,types[2],freeProxy);e.append(&env,&a,types[1],freeProxy);for(int n=0;n<8;++n){auto*p=e.find(types[n]);emit({83,n,p?static_cast<int>(p-e.aInterfaces.data()):-1});}for(auto*p:pointers)for(size_t n:{size_t(0),size_t(1),size_t(2),size_t(3),std::numeric_limits<size_t>::max()})emit({84,ptrid(p),static_cast<int>(n),e.find(p,n)});snapshot(e);cleanup(env,e);}
void values(){setup();rtl::OUString label=rtl::OUString::createFromAscii("caller"),id=rtl::OUString::createFromAscii("oid");uno_DefaultEnvironment env(label,nullptr);env.acquireInterface=acquire;env.releaseInterface=release;expectedEnv=&env;Caller a{0},b{1};pointers={&a,&b};ObjectEntry e(id),empty(id);objects={&e,&empty};e.append(&env,&a,types[1],freeProxy);e.append(&env,&b,types[2],freeProxy);e.nRef=23;e.mixedObject=true;{ObjectEntry c(e);snapshot(c);emit({90,c.aInterfaces.data()==e.aInterfaces.data(),c.aInterfaces[0].pInterface==e.aInterfaces[0].pInterface});ObjectEntry m(std::move(c));snapshot(m);snapshot(c);ObjectEntry d(id);d=empty;snapshot(d);d=e;snapshot(d);auto*slot=d.find(types[1]);d=e;emit({91,slot==d.find(types[1]),d.find(types[1])==&d.aInterfaces[0]});snapshot(d);d=d;snapshot(d);d=std::move(m);snapshot(d);snapshot(m);d=std::move(d);snapshot(d);}snapshot(e);cleanup(env,e);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="construct")constructors();else if(mode=="append")appends();else if(mode=="find")lookup();else if(mode=="values")values();else return 2;return 0;}
`;
writeFileSync(target + "/driver.cpp", caller);
/** Captures all initialized original observations and terminal diagnostics. @param binary - Genuine process. @param mode - Complete scenario. @returns Full process result. */
function capture(binary, mode) {
  const r = spawnSync(binary, [mode], {
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
  });
  writeFileSync(binary + "." + mode, r.stdout ?? "");
  writeFileSync(binary + "." + mode + ".stderr", r.stderr ?? "");
  native.manifest.commands.push({
    tool: binary,
    argv: [mode],
    exitCode: r.status,
    signal: r.signal,
  });
  native.save();
  return r;
}
const normal = native.build(false),
  sanitized = native.build(true),
  captures = {};
for (const mode of ["construct", "append", "find", "values"]) {
  const a = capture(normal, mode),
    b = capture(sanitized, mode);
  if (
    a.status !== 0 ||
    b.status !== 0 ||
    a.signal !== null ||
    b.signal !== null ||
    a.stderr.length ||
    b.stderr.length ||
    !a.stdout.equals(b.stdout)
  )
    throw Error("Original ObjectEntry " + mode + " failed: " + a.stderr + " " + b.stderr);
  captures[mode] = {
    byteLength: a.stdout.length,
    digest: hash(a.stdout),
    gzipBase64: gzipSync(a.stdout).toString("base64"),
  };
}
const result = {
  pin,
  driverHash: hash(caller),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes full original blobs. @param entry - Source pair. @returns Complete hash. */ ([
        p,
        v,
      ]) => [p, hash(v)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  scope:
    "Complete original lbenv.cxx TU and genuine desktop dependencies; direct ObjectEntry explicit and initialized compiler value lifetime observations. Real full native DefaultEnvironment constructor and caller-owned late-initialization callbacks, real C typelib factories and original pointer insertion/vector/member matching. Portable environment record projection is borrowed input, not a runtime engine/provider. Physical vector capacity/allocator/ABI/leaks/native threads/shutdown and complete environment/mapping/exception/consumer QA unverified; leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed whole original ObjectEntry observations");
console.log(
  "Original ObjectEntry observations " +
    (write ? "written" : "verified") +
    ": " +
    Object.keys(result.sourceHashes).length +
    " complete sources; " +
    Object.entries(captures)
      .map(
        /** Reports every whole stream. @param entry - Capture pair. @returns Size. */ ([m, c]) =>
          m + "=" + c.byteLength,
      )
      .join(", "),
);
