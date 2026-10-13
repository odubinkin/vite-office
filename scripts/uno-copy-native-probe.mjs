/** @fileoverview Captures complete original UNO copy/default construction and true type/ownership fields using full unchanged native dependency owners. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
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
const driver = String.raw`${unoNativeValueCaller}void data(){Types t;for(int c=0;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);for(int m=0;m<8;m++)for(int v=0;v<3;v++){rtl::OUString held=rtl::OUString::createFromAscii("owned");W w={{acquired,released,nullptr},41,10},target={{acquired,released,nullptr},91,10};M mapRecord={{nullptr,nullptr,map},&target,v==1};void*src=sample(r,d,t,held.pData,&w,v),*dst=std::malloc(d->nSize?d->nSize:4);std::memset(dst,0xa5,d->nSize?d->nSize:4);emit({c,m,v});ref(r);text(held.pData);copyData(m,dst,src,r,d,&mapRecord.m);value(dst,r);ref(r);text(held.pData);emit({w.count,target.count});uno_type_destructData(dst,r,release);uno_type_destructData(src,r,release);emit({w.count,target.count});ref(r);text(held.pData);std::free(dst);std::free(src);}typelib_typedescription_release(d);}}
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
