/** @fileoverview Captures complete original UNO assignment and true type/ownership fields using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { unoNativeQueryCaller } from "./uno-native-query-caller.mjs";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-assignment-native";
const fixture = "apps/office/src/cppu/source/uno/native-assignment-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const driver = String.raw`${unoNativeValueCaller}
#include "assign.hxx"
#include "../typelib/typelib.hxx"
#include <limits>
${unoNativeQueryCaller}
bool assign(int api,void*a,R*ar,D*ad,void*b,R*br,D*bd,uno_QueryInterfaceFunc q,uno_AcquireFunc ac,uno_ReleaseFunc re){return api==0?cppu::_assignData(a,ar,nullptr,b,br,nullptr,q,ac,re):api==1?cppu::_assignData(a,ar,ad,b,br,bd,q,ac,re):api==2?uno_type_assignData(a,ar,b,br,q,ac,re):uno_assignData(a,ad,b,bd,q,ac,re);}
void*assignQuery(void*p,R*r){ref(r);return queried(p,r);}
void assignDispatch(uno_Interface*p,D const*d,void*out,void**args,uno_Any**exc){ref(*static_cast<R**>(args[0]));dispatch(p,d,out,args,exc);}
D*iface(char const*label,R*base){rtl::OUString n=rtl::OUString::createFromAscii(label);typelib_InterfaceTypeDescription*i=nullptr;typelib_typedescription_newMIInterface(&i,n.pData,0,0,0,0,0,1,&base,0,nullptr);D*d=&i->aBase;typelib_typedescription_register(&d);return d;}
void numeric(){union N{sal_Int8 b;sal_Int16 s;sal_uInt16 us;sal_Int32 l;sal_uInt32 ul;sal_Int64 h;sal_uInt64 uh;float f;double d;};sal_uInt64 seeds[]={0,127,128,65535,0xffffffffULL,0xffffffffffffffffULL,0x8000000000000000ULL,0x7fffffffffffffffULL};auto set=[](N&v,int c,sal_uInt64 n,int k){switch(c){case 3:v.b=n;break;case 4:v.s=n;break;case 5:v.us=n;break;case 6:v.l=n;break;case 7:v.ul=n;break;case 8:v.h=n;break;case 9:v.uh=n;break;case 10:v.f=k==8?std::numeric_limits<float>::quiet_NaN():k==9?-0.5f:k==10?0.5f:k==11?-0.0f:k==12?std::numeric_limits<float>::infinity():static_cast<float>(static_cast<sal_Int32>(n));break;case 11:v.d=k==8?std::numeric_limits<double>::quiet_NaN():k==9?-0.5:k==10?0.5:k==11?-0.0:k==12?std::numeric_limits<double>::infinity():static_cast<double>(static_cast<sal_Int32>(n));break;}};
for(int ac=3;ac<=11;ac++)for(int bc=3;bc<=11;bc++){R*ar=type(static_cast<C>(ac)),*br=type(static_cast<C>(bc));D*ad=nullptr,*bd=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);typelib_typedescriptionreference_getDescription(&bd,br);for(int k=0;k<13;k++)for(int api=0;api<4;api++){N a,b;set(a,ac,17,0);set(b,bc,k<8?seeds[k]:0,k);emit({ac,bc,k,api});value(&a,ar);value(&b,br);emit({assign(api,&a,ar,ad,&b,br,bd,nullptr,nullptr,nullptr)});value(&a,ar);value(&b,br);}typelib_typedescription_release(bd);typelib_typedescription_release(ad);}}
void matrix(){Types t;dispatchTypes=&t;W root={{acquired,released,nullptr},91,1000};QW a={{{acquired,released,assignDispatch},41,1000},&root,0},b={{{acquired,released,assignDispatch},42,1000},&root,0};for(int ac=0;ac<=22;ac++){if(ac==16||ac==18||ac==21)continue;R*ar=t.get(ac);D*ad=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);for(int bc=0;bc<=22;bc++){if(bc==16||bc==18||bc==21)continue;R*br=t.get(bc);D*bd=nullptr;typelib_typedescriptionreference_getDescription(&bd,br);for(int v=0;v<3;v++)for(int api=0;api<4;api++){rtl::OUString ah=rtl::OUString::createFromAscii("Aa"),bh=rtl::OUString::createFromAscii(v==2?"Bb":"Aa");void*av=sample(ar,ad,t,ah.pData,&a.w,1),*bv=sample(br,bd,t,bh.pData,&b.w,v);emit({ac,bc,v,api});emit({uno_type_isAssignableFromData(ar,bv,br,assignQuery,release)});emit({assign(api,av,ar,ad,bv,br,bd,assignQuery,acquire,release)});value(av,ar);value(bv,br);ref(ar);ref(br);text(ah.pData);text(bh.pData);emit({a.w.count,b.w.count,root.count});uno_type_destructData(bv,br,release);uno_type_destructData(av,ar,release);std::free(bv);std::free(av);}typelib_typedescription_release(bd);}for(int api=0;api<4;api++){rtl::OUString h=rtl::OUString::createFromAscii("Aa");void*av=sample(ar,ad,t,h.pData,&a.w,1);emit({ac,api,assign(api,av,ar,ad,nullptr,ar,ad,assignQuery,acquire,release)});value(av,ar);text(h.pData);uno_type_destructData(av,ar,release);std::free(av);}typelib_typedescription_release(ad);}}
void compounds(){Types t;D*other=compound("assign.Other",typelib_TypeClass_STRUCT,nullptr,{type(typelib_TypeClass_LONG)});W a={{acquired,released,nullptr},41,1000},b={{acquired,released,nullptr},42,1000};D*types[]={t.base,t.record,t.exc,other};for(int ac=0;ac<4;ac++)for(int bc=0;bc<4;bc++)for(int api=0;api<4;api++){D*ad=types[ac],*bd=types[bc];R*ar=ad->pWeakRef,*br=bd->pWeakRef;rtl::OUString ah=rtl::OUString::createFromAscii("Aa"),bh=rtl::OUString::createFromAscii("Bb");void*av=sample(ar,ad,t,ah.pData,&a,1),*bv=sample(br,bd,t,bh.pData,&b,2);emit({ac,bc,api,assign(api,av,ar,ad,bv,br,bd,nullptr,acquire,release)});value(av,ar);value(bv,br);ref(ar);ref(br);emit({a.count,b.count});uno_type_destructData(bv,br,release);uno_type_destructData(av,ar,release);std::free(bv);std::free(av);}
for(int c=0;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);rtl::OUString h=rtl::OUString::createFromAscii("Aa");void*p=sample(r,d,t,h.pData,&a,1);emit({c,cppu::_assignData(p,r,d,p,r,d,nullptr,acquire,release),cppu::_assignData(p,r,d,p,type(c==typelib_TypeClass_TYPE?typelib_TypeClass_STRING:typelib_TypeClass_TYPE),nullptr,nullptr,acquire,release)});value(p,r);uno_type_destructData(p,r,release);std::free(p);typelib_typedescription_release(d);}
D*sd=sequence(type(typelib_TypeClass_BOOLEAN));uno_Sequence*av=nullptr,*bv=nullptr;uno_type_sequence_construct(&av,t.seq->pWeakRef,nullptr,0,nullptr);uno_type_sequence_construct(&bv,sd->pWeakRef,nullptr,0,nullptr);emit({av==bv,uno_type_assignData(&av,t.seq->pWeakRef,&bv,sd->pWeakRef,nullptr,nullptr,nullptr),uno_type_assignData(&av,t.seq->pWeakRef,&bv,t.seq->pWeakRef,nullptr,nullptr,nullptr)});value(&av,t.seq->pWeakRef);value(&bv,sd->pWeakRef);cppu::destructSequence(bv,sd->pWeakRef,sd,nullptr);cppu::destructSequence(av,t.seq->pWeakRef,t.seq,nullptr);typelib_typedescription_release(sd);typelib_typedescription_release(other);}
void interfaces(bool unsafe){Types t;dispatchTypes=&t;D*root=nullptr;typelib_typedescriptionreference_getDescription(&root,type(typelib_TypeClass_INTERFACE));D*i=iface("assign.I",root->pWeakRef),*j=iface("assign.J",root->pWeakRef);D*descs[]={root,i,j};W identity={{acquired,released,nullptr},91,10000};QW a={{{acquired,released,assignDispatch},41,10000},&identity,0},b={{{acquired,released,assignDispatch},42,10000},&identity,0};for(int ac=0;ac<3;ac++)for(int bc=0;bc<3;bc++)for(int cb=0;cb<2;cb++)for(int mode=0;mode<3;mode++)for(int api=0;api<4;api++){bool undefined=(api==1||api==3)&&ac!=bc&&ac!=0&&mode!=0;if(undefined!=unsafe)continue;R*ar=descs[ac]->pWeakRef,*br=descs[bc]->pWeakRef;void*av=&a,*bv=mode==0?nullptr:&b;b.root=mode==2?nullptr:&identity;emit({ac,bc,cb,mode,api});emit({assign(api,&av,ar,descs[ac],&bv,br,descs[bc],cb?assignQuery:nullptr,cb?acquire:nullptr,cb?release:nullptr)});value(&av,ar);value(&bv,br);ref(ar);ref(br);emit({a.w.count,b.w.count,identity.count});if(!unsafe){emit({uno_type_isAssignableFromData(ar,&bv,br,cb?assignQuery:nullptr,cb?release:nullptr),uno_type_isAssignableFromData(ar,nullptr,br,cb?assignQuery:nullptr,cb?release:nullptr)});bv=nullptr;emit({uno_type_isAssignableFromData(ar,&bv,br,cb?assignQuery:nullptr,cb?release:nullptr)});}}
if(!unsafe){emit({cppu::_queryInterface(nullptr,i->pWeakRef,assignQuery)==nullptr});for(int mode=0;mode<4;mode++){b.mode=mode;b.root=&identity;void*av=&a,*bv=&b;emit({mode,uno_type_assignData(&av,i->pWeakRef,&bv,j->pWeakRef,nullptr,nullptr,nullptr)});value(&av,i->pWeakRef);value(&bv,j->pWeakRef);emit({a.w.count,b.w.count,identity.count});}}
typelib_typedescription_release(j);typelib_typedescription_release(i);typelib_typedescription_release(root);}
void diagnostics(){Types t;rtl::OUString n=rtl::OUString::createFromAscii("assign.Typedef");D*rd=nullptr;typelib_typedescription_newEmpty(&rd,typelib_TypeClass_TYPEDEF,n.pData);R*r=reinterpret_cast<R*>(rd);sal_Int32 a[2]={17,19},b[2]={31,37};sal_Int32 offset=4;P bad{};bad.nMembers=1;bad.pMemberOffsets=&offset;bad.ppTypeRefs=&r;P head{};head.pBaseTypeDescription=&bad;P empty{};bad.pBaseTypeDescription=&empty;emit({cppu::_assignStruct(a,b,&bad,nullptr,nullptr,nullptr)});bad.pBaseTypeDescription=nullptr;emit({cppu::_assignStruct(a,b,&head,nullptr,nullptr,nullptr),cppu::_assignStruct(a,b,&bad,nullptr,nullptr,nullptr),cppu::_assignData(a,r,nullptr,b,r,nullptr,nullptr,nullptr,nullptr),a[0],a[1],b[0],b[1]});uno_Any alias;sal_Unicode c=0xd800;uno_type_any_construct(&alias,&c,type(typelib_TypeClass_CHAR),nullptr);emit({uno_type_assignData(alias.pData,type(typelib_TypeClass_SHORT),&alias,type(typelib_TypeClass_ANY),nullptr,nullptr,nullptr)});anyValue(&alias);uno_any_destruct(&alias,nullptr);typelib_typedescriptionreference_release(r);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="numeric")numeric();else if(mode=="matrix")matrix();else if(mode=="compounds")compounds();else if(mode=="interfaces")interfaces(false);else if(mode=="diagnostics")diagnostics();else if(mode=="interface-chain")interfaces(true);else return 2;return 0;}
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
for (const mode of ["numeric", "matrix", "compounds", "interfaces", "diagnostics"]) {
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
const normalChain = capture(normal, "interface-chain"),
  sanitizedChain = capture(sanitized, "interface-chain");
if (normalChain.status !== 0) throw new Error("Normal interface-chain observation failed");
const chainRejected =
  sanitizedChain.status !== 0 &&
  /assign\.hxx[^\n]*runtime error: member access within null pointer/.test(
    sanitizedChain.stderr.toString(),
  );
if (
  !chainRejected &&
  (sanitizedChain.status !== 0 || !normalChain.stdout.equals(sanitizedChain.stdout))
)
  throw new Error("Unexpected interface-chain sanitizer result");
captures["interface-chain"] = {
  byteLength: normalChain.stdout.length,
  digest: hash(normalChain.stdout),
  gzipBase64: gzipSync(normalChain.stdout).toString("base64"),
};
const chainSanitizer = {
  rejected: chainRejected,
  exitCode: sanitizedChain.status,
  signal: sanitizedChain.signal,
  originalOwner: "cppu/source/uno/assign.hxx",
  observedNullMemberAccess: chainRejected,
};
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
  chainSanitizer,
  scope:
    "Complete unchanged original assign.hxx/data assignment/value compatibility and full any/data/sequence units with69 genuine SAL/CPPu dependencies. Defined numeric/scalar/Any/default/self/compound/sequence/interface/query/compatibility histories preserve all initialized values/type/name/common counts/ordered callbacks; full normal-ASan/UBSan streams identical. Separately named interface-chain normal capture and exact sanitizer status/null-member rejection record original zero-offset null base-member address expression, never defined/UB parity or unsupported producer certification. Initialized unsupported typedef/member diagnostic descriptors are caller inputs only, not type/runtime factory substitutes. Physical ABI/allocation/OOM, arbitrary NaN payloads, native debug/thread/shutdown/full consumer QA remain unverified; system libraries uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO assignment observations");
console.log(
  `Original UNO assignment observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
