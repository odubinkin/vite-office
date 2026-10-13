/** @fileoverview Captures complete original UNO equality and true type/ownership fields using full unchanged native dependency owners. */
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
const target = "output/playwright/uno-equality-native";
const fixture = "apps/office/src/cppu/source/uno/native-equality-cases.json";
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
#include "eq.hxx"
#include <limits>
#include <cmath>
${unoNativeQueryCaller}bool compare(int api,void*a,R*ar,D*ad,void*b,R*br,D*bd,uno_QueryInterfaceFunc query,uno_ReleaseFunc rel){return api==0?cppu::_equalData(a,ar,nullptr,b,br,query,rel):api==1?uno_type_equalData(a,ar,b,br,query,rel):uno_equalData(a,ad,b,bd,query,rel);}
const sal_uInt64 seeds[]={0,1,2,127,128,255,32767,32768,65535,0x7fffffffULL,0xffffffffULL,0xffffffffffffffffULL,0x8000000000000000ULL,0x7fffffffffffffffULL,0x20000000000001ULL,0x4000004000000001ULL,0x4000004000000000ULL,0x4000004000000002ULL,0x400000c000000000ULL,0xbfffff4000000000ULL,0x4000014000000000ULL};
union N{sal_Int8 b;sal_Int16 s;sal_uInt16 us;sal_Int32 l;sal_uInt32 ul;sal_Int64 h;sal_uInt64 uh;float f;double d;};
void set(N&v,int c,int k){sal_uInt64 n=k<21?seeds[k]:0;switch(c){case 3:v.b=n;break;case 4:v.s=n;break;case 5:v.us=n;break;case 6:v.l=n;break;case 7:v.ul=n;break;case 8:v.h=n;break;case 9:v.uh=n;break;case 10:v.f=k==21?std::numeric_limits<float>::quiet_NaN():k==22?0.5f:k==23?-0.5f:k==24?-0.0f:k==25?std::numeric_limits<float>::infinity():static_cast<float>(static_cast<sal_Int64>(n));break;case 11:v.d=k==21?std::numeric_limits<double>::quiet_NaN():k==22?0.5:k==23?-0.5:k==24?-0.0:k==25?std::numeric_limits<double>::infinity():static_cast<double>(static_cast<sal_Int64>(n));break;}}
bool safe(N&a,int ac,N&b,int bc){if(ac==9&&bc==10&&b.f>=std::ldexp(1.0,64))return false;if(ac==9&&bc==11&&b.d>=std::ldexp(1.0,64))return false;if(bc==9&&ac==10&&a.f>=std::ldexp(1.0,64))return false;if(bc==9&&ac==11&&a.d>=std::ldexp(1.0,64))return false;return true;}
void numeric(){for(int ac=3;ac<=11;ac++)for(int bc=3;bc<=11;bc++){R*ar=type(static_cast<C>(ac)),*br=type(static_cast<C>(bc));D*ad=nullptr,*bd=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);typelib_typedescriptionreference_getDescription(&bd,br);for(int ak=0;ak<26;ak++)for(int bk=0;bk<26;bk++){N a,b;set(a,ac,ak);set(b,bc,bk);if(!safe(a,ac,b,bc))continue;emit({ac,bc,ak,bk});value(&a,ar);value(&b,br);for(int api=0;api<3;api++)emit({compare(api,&a,ar,ad,&b,br,bd,nullptr,nullptr)});}typelib_typedescription_release(bd);typelib_typedescription_release(ad);}}
void scalars(){Types t;W root={{acquired,released,nullptr},91,1000};QW a={{{acquired,released,dispatch},41,1000},&root,0},b={{{acquired,released,dispatch},42,1000},&root,0};for(int ac=0;ac<=22;ac++){if(ac==16||ac==18||ac==21)continue;R*ar=t.get(ac);D*ad=nullptr;typelib_typedescriptionreference_getDescription(&ad,ar);for(int bc=0;bc<=22;bc++){if(bc==16||bc==18||bc==21)continue;R*br=t.get(bc);D*bd=nullptr;typelib_typedescriptionreference_getDescription(&bd,br);for(int v=0;v<3;v++){rtl::OUString ah=rtl::OUString::createFromAscii("Aa"),bh=rtl::OUString::createFromAscii(v==2?"Bb":"Aa");void*av=sample(ar,ad,t,ah.pData,&a.w,v),*bv=sample(br,bd,t,bh.pData,&b.w,v);emit({ac,bc,v});for(int api=0;api<3;api++)emit({compare(api,av,ar,ad,bv,br,bd,queried,release)});value(av,ar);value(bv,br);ref(ar);ref(br);text(ah.pData);text(bh.pData);emit({a.w.count,b.w.count,root.count});uno_type_destructData(bv,br,release);uno_type_destructData(av,ar,release);std::free(av);std::free(bv);}typelib_typedescription_release(bd);}typelib_typedescription_release(ad);}}
void sequences(){Types t;W root={{acquired,released,nullptr},91,1000};QW a={{{acquired,released,dispatch},41,1000},&root,0},b={{{acquired,released,dispatch},42,1000},&root,0};for(int c=1;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);D*sd=sequence(r);for(int n:{0,1,3})for(int variant=0;variant<5;variant++){rtl::OUString ah=rtl::OUString::createFromAscii("Aa"),bh=rtl::OUString::createFromAscii(variant==4&&c!=17?"Bb":"Aa");auto*av=cppu::allocSeq(d->nSize,n),*bv=cppu::allocSeq(d->nSize,variant==3?n+1:n);for(int i=0;i<av->nElements;i++){void*p=av->elements+i*d->nSize;uno_type_constructData(p,r);if(variant)fill(p,r,t,ah.pData,&a.w,1);}for(int i=0;i<bv->nElements;i++){void*p=bv->elements+i*d->nSize;uno_type_constructData(p,r);if(variant==1||variant==4)fill(p,r,t,bh.pData,&b.w,variant==4?2:1);if(variant==2&&c==11)*static_cast<double*>(p)=1;if(variant==4&&c==17)*reinterpret_cast<sal_Int32*>(static_cast<char*>(p)+reinterpret_cast<P*>(d)->pMemberOffsets[reinterpret_cast<P*>(d)->nMembers-1])=17;}emit({c,n,variant,cppu::_equalSequence(av,av,r,queried,release),cppu::_equalSequence(av,bv,r,queried,release),cppu::equalSequence(av,bv,r,queried,release)});for(int api=0;api<3;api++)emit({compare(api,&av,sd->pWeakRef,sd,&bv,sd->pWeakRef,sd,queried,release)});value(&av,sd->pWeakRef);value(&bv,sd->pWeakRef);emit({a.w.count,b.w.count,root.count});cppu::destructSequence(bv,sd->pWeakRef,sd,release);cppu::destructSequence(av,sd->pWeakRef,sd,release);text(ah.pData);text(bh.pData);}typelib_typedescription_release(sd);typelib_typedescription_release(d);}}
void interfaces(){Types t;dispatchTypes=&t;W root={{acquired,released,nullptr},91,1000},other={{acquired,released,nullptr},92,1000};QW a={{{acquired,released,dispatch},41,1000},&root,0},b={{{acquired,released,dispatch},42,1000},&root,0};for(int mode=0;mode<4;mode++){a.mode=mode;auto*p=cppu::binuno_queryInterface(&a,type(typelib_TypeClass_INTERFACE));emit({mode,p==nullptr});if(p){value(&p,type(typelib_TypeClass_INTERFACE));release(p);}emit({a.w.count,root.count,other.count});}
a.mode=0;for(int cb=0;cb<2;cb++)for(int rel=0;rel<2;rel++)for(int kind=0;kind<6;kind++){a.root=kind==3?nullptr:&root;b.root=kind==4?nullptr:kind==5?&other:&root;void*pa=kind==1?nullptr:&a,*pb=kind==0?pa:kind==2?nullptr:&b;emit({cb,rel,kind,cppu::_equalObject(pa,pb,cb?queried:nullptr,rel?release:nullptr),a.w.count,b.w.count,root.count,other.count});}}
extern "C" void typelib_typedescription_newEmpty(D**,C,rtl_uString*) noexcept;
void diagnostics(){Types t;for(int c:{0,16}){D*d=nullptr;R*r;if(c){rtl::OUString name=rtl::OUString::createFromAscii("equality.Typedef");typelib_typedescription_newEmpty(&d,typelib_TypeClass_TYPEDEF,name.pData);r=reinterpret_cast<R*>(d);}else r=type(typelib_TypeClass_VOID);uno_Sequence aa={1,1,{17}},bb={1,1,{17}};auto*a=&aa,*b=&bb;emit({c,cppu::_equalSequence(a,b,r,nullptr,nullptr)});if(c)emit({cppu::_equalData(&marker,r,nullptr,&marker,r,nullptr,nullptr)});if(d)typelib_typedescription_release(d);}
uno_Any inner={type(typelib_TypeClass_LONG),&marker,&marker},outer={type(typelib_TypeClass_ANY),&inner,&marker};R*at=type(typelib_TypeClass_ANY),*lt=type(typelib_TypeClass_LONG);emit({cppu::_equalData(&outer,at,nullptr,&marker,lt,nullptr,nullptr),cppu::_equalData(&marker,lt,nullptr,&outer,at,nullptr,nullptr)});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="numeric")numeric();else if(mode=="scalars")scalars();else if(mode=="sequences")sequences();else if(mode=="interfaces")interfaces();else if(mode=="diagnostics")diagnostics();else return 2;return 0;}
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
for (const mode of ["numeric", "scalars", "sequences", "interfaces", "diagnostics"]) {
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
    "Complete unchanged original eq.hxx and data/any/sequence units with genuine69 SAL/CPPU dependencies. Complete numeric typed pair, generic scalar/Any/enum/compound/sequence/interface observations and ordered callbacks, actual retained binary-query description/FFI/return/exception ownership, initialized type/name/count/value fields. Floating-to-u64 values at or beyond2^64 excluded because original C cast is undefined; physical byte/pointer ABI, allocation/OOM, NaN payload families, filtered SAL logging, unsupported metadata/pointers/ranges, thread/shutdown and full original consumer QA remain unverified. Synthetic initialized TYPEDEF/unsupported element and nested Any diagnostics are bounded source observations, not supported-producer claims. Normal-ASan-UBSan streams identical; system libraries uninstrumented and leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original UNO equality observations");
console.log(
  `Original UNO equality observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.entries(
    captures,
  )
    .map(
      /** Reports complete capture size. @param entry - Captured mode. @returns Complete size. */
      ([name, value]) => `${name}=${value.byteLength}`,
    )
    .join(", ")}`,
);
