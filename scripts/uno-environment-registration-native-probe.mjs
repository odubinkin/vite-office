/** @fileoverview Captures original default-environment registration, proxy exchange, lookup and revoke callbacks from the complete unchanged lbenv.cxx TU with genuine desktop dependencies. */
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
const target = "output/playwright/uno-environment-registration-native",
  fixture = "apps/office/src/cppu/source/uno/native-environment-registration-cases.json",
  native = prepareExceptionNative(target);
loadUnicodeOriginal(native.sources, "cppu/source/uno/lbenv.cxx");
const caller = String.raw`${unoNativeValueCaller}
#include "lbenv.cxx"
#include <vector>
#include <string>
using TD=typelib_InterfaceTypeDescription;
struct Caller { int label,count=100,frees=0; };
std::vector<TD*> types;std::vector<Caller*> pointers;
uno_DefaultEnvironment* expected=nullptr;void**activeOut=nullptr;sal_Int32*activeLength=nullptr;
int pointerid(void*p){if(!p)return -1;for(size_t i=0;i<pointers.size();++i)if(pointers[i]==p)return i;return -2;}
int typeidof(TD*p){for(size_t i=0;i<types.size();++i)if(types[i]==p)return i;return -1;}
void event(int kind,uno_ExtEnvironment*env,Caller*p,int count){auto*e=static_cast<uno_DefaultEnvironment*>(env);emit({kind,p->label,count,e==expected,static_cast<int>(e->aOId2ObjectMap.size()),static_cast<int>(e->aPtr2ObjectMap.size()),activeOut?pointerid(*activeOut):-1,activeLength?*activeLength:-1});for(auto*t:types)desc(&t->aBase);}
void envAcquire(uno_ExtEnvironment*e,void*p){auto*c=static_cast<Caller*>(p);event(30,e,c,++c->count);}
void envRelease(uno_ExtEnvironment*e,void*p){auto*c=static_cast<Caller*>(p);event(31,e,c,--c->count);}
void envFree(uno_ExtEnvironment*e,void*p){auto*c=static_cast<Caller*>(p);event(32,e,c,++c->frees);}
void compute(uno_ExtEnvironment*e,rtl_uString**out,void*p){auto*c=static_cast<Caller*>(p);emit({35,c->label,*out==nullptr,static_cast<int>(static_cast<uno_DefaultEnvironment*>(e)->aOId2ObjectMap.size()),static_cast<int>(static_cast<uno_DefaultEnvironment*>(e)->aPtr2ObjectMap.size())});rtl::OUString value=rtl::OUString::createFromAscii("computed");rtl_uString_assign(out,value.pData);}
TD*make(char const*label,std::vector<TD*>const&bases,bool reg=true){rtl::OUString name=rtl::OUString::createFromAscii(label);std::vector<R*>refs;for(auto*b:bases)refs.push_back(b->aBase.pWeakRef);TD*out=nullptr;typelib_typedescription_newMIInterface(&out,name.pData,0,0,0,0,0,refs.size(),refs.empty()?nullptr:refs.data(),0,nullptr);if(reg)typelib_typedescription_register(reinterpret_cast<D**>(&out));types.push_back(out);return out;}
void setup(){TD*root=nullptr;typelib_typedescriptionreference_getDescription(reinterpret_cast<D**>(&root),*typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE));types.push_back(root);auto*a=make("registration.A",{root});make("registration.B",{root});make("registration.Child",{a});make("registration.A",{root},false);make("registration.C",{root});}
void snapshot(uno_DefaultEnvironment&e){emit({70,static_cast<int>(e.aOId2ObjectMap.size()),static_cast<int>(e.aPtr2ObjectMap.size())});for(auto*c:pointers){auto it=e.aPtr2ObjectMap.find(c);emit({71,c->label,c->count,c->frees,it!=e.aPtr2ObjectMap.end()});if(it!=e.aPtr2ObjectMap.end()){auto&o=*it->second;emit({72,o.nRef,o.mixedObject,static_cast<int>(o.aInterfaces.size())});text(o.oid.pData);for(auto const&i:o.aInterfaces){emit({73,i.refCount,pointerid(i.pInterface),typeidof(i.pTypeDescr),i.fpFreeProxy==envFree});desc(&i.pTypeDescr->aBase);}}}}
void original(uno_DefaultEnvironment&e,Caller*p,rtl::OUString const&oid,int t){void*out=p;activeOut=&out;defenv_registerInterface(&e,&out,oid.pData,types[t]);emit({80,pointerid(out)});activeOut=nullptr;snapshot(e);}
void proxy(uno_DefaultEnvironment&e,Caller*p,rtl::OUString const&oid,int t){void*out=p;activeOut=&out;defenv_registerProxyInterface(&e,&out,envFree,oid.pData,types[t]);emit({81,pointerid(out)});activeOut=nullptr;snapshot(e);}
void revoke(uno_DefaultEnvironment&e,Caller*p){defenv_revokeInterface(&e,p);snapshot(e);}
void*allocate(size_t bytes){emit({90,static_cast<sal_Int32>(bytes),activeLength?*activeLength:-1});return std::malloc(bytes?bytes:1);}
void enumerate(uno_DefaultEnvironment&e){void**out=nullptr;sal_Int32 length=-3;activeLength=&length;defenv_getRegisteredInterfaces(&e,&out,&length,allocate);emit({91,length,out!=nullptr});for(int i=0;i<length;++i){emit({92,pointerid(out[i])});envRelease(&e,out[i]);}activeLength=nullptr;std::free(out);}
void query(uno_DefaultEnvironment&e,void**out,rtl::OUString const&oid,int t){activeOut=out;defenv_getRegisteredInterface(&e,out,oid.pData,types[t]);emit({82,pointerid(*out)});activeOut=nullptr;}
void run(std::string const&mode){setup();rtl::OUString label=rtl::OUString::createFromAscii("uno"),oid=rtl::OUString::createFromAscii("registered"),missing=rtl::OUString::createFromAscii("missing");uno_DefaultEnvironment env(label,nullptr);expected=&env;env.acquireInterface=envAcquire;env.releaseInterface=envRelease;env.computeObjectIdentifier=compute;Caller a{0},b{1},c{2};pointers={&a,&b,&c};
if(mode=="original"){enumerate(env);original(env,&a,oid,3);original(env,&a,oid,3);original(env,&b,oid,1);void*out=&c;query(env,&out,oid,4);query(env,&out,oid,2);query(env,&out,missing,0);rtl::OUString seed=rtl::OUString::createFromAscii("old output");rtl_uString*id=seed.pData;rtl_uString_acquire(id);defenv_getObjectIdentifier(&env,&id,&a);text(id);defenv_getObjectIdentifier(&env,&id,&b);text(id);rtl_uString_release(id);text(seed.pData);enumerate(env);revoke(env,&a);revoke(env,&a);revoke(env,&a);enumerate(env);}
else if(mode=="proxy"){proxy(env,&a,oid,1);proxy(env,&a,oid,1);proxy(env,&b,oid,4);proxy(env,&b,oid,2);revoke(env,&a);revoke(env,&b);revoke(env,&a);}
else if(mode=="mixed"){original(env,&a,oid,1);proxy(env,&b,oid,2);proxy(env,&b,oid,2);proxy(env,&b,oid,5);revoke(env,&b);revoke(env,&b);revoke(env,&b);revoke(env,&a);}
else std::exit(2);
snapshot(env);for(auto*t:types)desc(&t->aBase);
}
int main(int argc,char**argv){if(argc!=2)return 2;run(argv[1]);return 0;}
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
for (const mode of ["original", "proxy", "mixed"]) {
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
    throw Error(
      "Original environment registration " + mode + " failed: " + a.stderr + " " + b.stderr,
    );
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
    "Complete original lbenv.cxx TU and genuine normal-ASan/UBSan desktop dependencies. Original register/proxy/getOID/getRegisteredInterface/getRegisteredInterfaces and invoked revoke callee are observed through real native DefaultEnvironment and C typelib factories. Caller-owned late-bound interface callbacks/pointer labels remain enclosing input, not portable production providers. Original proxy versus original exchange/count rules, mixed-proxy removal and final reverse cleanup, callback map/type/value lifetimes and zero/one-pointer enumeration are replayed in full. Native constructor/Environment_invoke/thread/bridge/public bootstrap and unspecified multi-pointer hash enumeration are not certified by the portable borrowed-record callee projection; physical allocator/ABI/leaks/shutdown and whole consumer QA remain unverified. Leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed whole original environment registration observations");
console.log(
  "Original environment registration observations " +
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
