/** @fileoverview Observes the full unchanged original sequence.cxx engine with genuine SAL/CPPU owners and complete initialized values, callbacks and lifecycle state. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write";
if (!write && !(process.argv.length === 3 && process.argv[2] === "--check"))
  throw new Error("Use exactly --write or --check");
const target = "output/playwright/uno-sequence-native",
  fixture = "apps/office/src/cppu/source/uno/native-sequence-engine-cases.json",
  native = prepareCaseNative(target);
loadUnicodeOriginal(native.sources, "cppu/source/uno/sequence.cxx");
loadUnicodeOriginal(native.sources, "include/uno/sequence2.h");
const driver = String.raw`#include "cppu/source/uno/sequence.cxx"
${unoNativeValueCaller}
extern "C" void typelib_typedescription_newEmpty(D**,C,rtl_uString*) noexcept;
void observe(uno_Sequence*s,D*d){emit({s==nullptr});if(s)value(&s,d->pWeakRef);}
bool construct(int api,uno_Sequence**s,D*d,void*source,int n){return api?uno_sequence_construct(s,d,source,n,acquire):uno_type_sequence_construct(s,d->pWeakRef,source,n,acquire);}
bool resize(int api,uno_Sequence**s,D*d,int n){return api?uno_sequence_realloc(s,d,n,acquire,release):uno_type_sequence_realloc(s,d->pWeakRef,n,acquire,release);}
bool unique(int api,uno_Sequence**s,D*d){return api?uno_sequence_reference2One(s,d,acquire,release):uno_type_sequence_reference2One(s,d->pWeakRef,acquire,release);}
void assign(int api,uno_Sequence**s,uno_Sequence*from,D*d){if(api)uno_sequence_assign(s,from,d,release);else uno_type_sequence_assign(s,from,d->pWeakRef,release);}
void lifecycle(){Types t;for(int c=1;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*d=nullptr;typelib_typedescriptionreference_getDescription(&d,r);D*sd=sequence(r);
for(int variant=0;variant<3;variant++)for(int api=0;api<2;api++)for(int n:{0,1,3})for(int shared:{1,2}){
emit({c,variant,api,n,shared});rtl::OUString held=rtl::OUString::createFromAscii("Ab");W w={{acquired,released,nullptr},41,1000};void*source=nullptr;if(variant){source=std::malloc(n?d->nSize*n:1);for(int i=0;i<n;i++){void*p=static_cast<char*>(source)+i*d->nSize;uno_type_constructData(p,r);fill(p,r,t,held.pData,&w,variant);}}
uno_Sequence*s=nullptr;emit({construct(api,&s,sd,source,n)});observe(s,sd);ref(r);text(held.pData);emit({w.count});uno_Sequence*alias=shared==2?s:nullptr;if(alias)osl_atomic_increment(&alias->nRefCount);
if(variant==2){emit({unique(api,&s,sd)});observe(s,sd);observe(alias,sd);}
for(int size:{n,n+2,1,0,3,3,0}){emit({size,resize(api,&s,sd,size)});observe(s,sd);observe(alias,sd);ref(r);text(held.pData);emit({w.count});}
emit({unique(api,&s,sd)});observe(s,sd);uno_Sequence*other=nullptr;construct(api,&other,sd,nullptr,2);assign(api,&other,s,sd);emit({other==s});observe(s,sd);assign(api,&other,other,sd);observe(other,sd);cppu::destructSequence(other,sd->pWeakRef,sd,release);cppu::destructSequence(s,sd->pWeakRef,sd,release);if(alias)cppu::destructSequence(alias,sd->pWeakRef,sd,release);if(source){for(int i=0;i<n;i++)uno_type_destructData(static_cast<char*>(source)+i*d->nSize,r,release);std::free(source);}ref(r);text(held.pData);emit({w.count});}
typelib_typedescription_release(sd);typelib_typedescription_release(d);}}
void helpers(){Types t;for(int c=1;c<=22;c++){if(c==16||c==18||c==21)continue;R*r=t.get(c);D*sd=sequence(r);uno_Sequence*s=nullptr;emit({c,cppu::idefaultConstructElements(&s,r,0,0,0)});observe(s,sd);emit({cppu::idefaultConstructElements(&s,r,0,0,-1)});observe(s,sd);uno_Sequence*copy=nullptr;emit({cppu::icopyConstructFromElements(&copy,s->elements,r,0,acquire,0)});observe(copy,sd);cppu::destructSequence(copy,sd->pWeakRef,sd,release);cppu::destructSequence(s,sd->pWeakRef,sd,release);typelib_typedescription_release(sd);}
for(int c:{0,16}){D*td=nullptr;R*r;if(c){rtl::OUString name=rtl::OUString::createFromAscii("sequence.Typedef");typelib_typedescription_newEmpty(&td,typelib_TypeClass_TYPEDEF,name.pData);r=reinterpret_cast<R*>(td);}else r=type(typelib_TypeClass_VOID);uno_Sequence*s=cppu::allocSeq(0,0);auto*old=s;emit({c,cppu::idefaultConstructElements(&s,r,0,0,0),s==old,s->nRefCount,s->nElements});emit({cppu::icopyConstructFromElements(&s,&marker,r,0,nullptr,0),s==old,s->nRefCount,s->nElements});std::free(s);if(td)typelib_typedescription_release(td);}}
void guards(){Types t;for(int c=1;c<=22;c++){if(c==2||c==3||c==16||c==18||c==21)continue;R*r=t.get(c);D*sd=sequence(r);for(int api=0;api<2;api++)for(int copying=0;copying<2;copying++){uno_Sequence*s=nullptr;emit({c,api,copying,construct(api,&s,sd,copying?&marker:nullptr,2147483647),s==nullptr});}
for(int api=0;api<2;api++){uno_Sequence header={2,2147483647,{0}};auto*s=&header;emit({c,api,unique(api,&s,sd),s==&header,header.nRefCount,header.nElements});uno_Sequence*valid=nullptr;construct(api,&valid,sd,nullptr,1);emit({resize(api,&valid,sd,2147483647)});observe(valid,sd);cppu::destructSequence(valid,sd->pWeakRef,sd,release);}
typelib_typedescription_release(sd);}
D*sd=sequence(type(typelib_TypeClass_LONG));for(int n:{-1,-2147483647-1}){uno_Sequence*s=nullptr;emit({n,uno_sequence_construct(&s,sd,nullptr,n,nullptr)});observe(s,sd);cppu::destructSequence(s,sd->pWeakRef,sd,release);}typelib_typedescription_release(sd);
// Diagnostic-only initialized metadata: positive allocation-size guard returns null before any element/pointer access; all signed arithmetic stays in range.
D*chars=sequence(type(typelib_TypeClass_CHAR));uno_Sequence header={2,-1,{17}};auto*changed=&header;emit({1,uno_sequence_realloc(&changed,chars,2147483646,acquire,release),changed==&header,header.nRefCount,header.nElements});observe(changed,chars);typelib_typedescription_release(chars);
D*bytes=sequence(type(typelib_TypeClass_BYTE));uno_Sequence*valid=nullptr;uno_sequence_construct(&valid,bytes,nullptr,1,nullptr);auto*alias=valid;osl_atomic_increment(&alias->nRefCount);emit({2,uno_sequence_realloc(&valid,bytes,-1,acquire,release),valid==nullptr,alias->nRefCount,alias->nElements});observe(alias,bytes);cppu::destructSequence(alias,bytes->pWeakRef,bytes,release);typelib_typedescription_release(bytes);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="lifecycle")lifecycle();else if(mode=="helpers")helpers();else if(mode=="guards")guards();else return 2;return 0;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
native.manifest.driverHash = hash(driver);
/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  for (const unit of ["any", "data"]) {
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
      "-Ivendor/libreoffice-reference",
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
for (const mode of ["lifecycle", "helpers", "guards"]) {
  const a = capture(normal, mode),
    b = capture(sanitized, mode);
  if (
    a.status !== 0 ||
    b.status !== 0 ||
    !a.stdout.equals(b.stdout) ||
    /AddressSanitizer|runtime error:/.test(b.stderr.toString())
  )
    throw new Error(`Original ${mode} failed: ${a.stderr} ${b.stderr}`);
  captures[mode] = {
    byteLength: a.stdout.length,
    digest: hash(a.stdout),
    gzipBase64: gzipSync(a.stdout).toString("base64"),
  };
  console.log(`Captured original ${mode}: ${a.stdout.length} bytes, sanitizer-identical`);
}
const result = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Records exact unchanged original content. @param entry - Original source pair. @returns Source path and whole SHA256. */ ([
        p,
        v,
      ]) => [p, hash(v)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  driverHash: hash(driver),
  captures,
  sanitizedIdentical: true,
  scope:
    "Full unchanged original sequence.cxx/data.cxx/any.cxx and genuine SAL/CPPU owners. Complete initialized C construction/reallocation/reference2One/assignment histories, zero/full descriptions, element values/counts/type/string/interface callbacks and supported arithmetic guard observations. Native physical malloc/realloc address/capacity, byte ABI/indeterminate cells/NaN payloads, OOM, general unsupported pointer/header/range/type inputs and full C++ template/service/consumer QA remain unverified. Huge header-only guards do not read tail cells or establish ordinary producer reachability; negative full-description constructor counts observe its actual len>0 condition. Two separately marked diagnostic-only signed-count histories cover original negative-count guards with initialized headers and no element/pointer operations after actual arithmetic allocation guard rejection; they do not establish supported producer reachability, arbitrary malformed-header or full binary alias/ABI parity.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Changed complete original sequence engine observations");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    sources: Object.keys(native.sources).length,
    sanitizedIdentical: true,
  }),
);
