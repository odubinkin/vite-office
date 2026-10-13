/** @fileoverview Captures the complete original Enterable callback wrapper over full unchanged SAL/typelib dependencies and genuine caller callbacks. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { gzipSync } from "node:zlib";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/uno-enterable-native",
  fixture = "apps/office/src/cppu/inc/native-enterable-cases.json",
  native = prepareCaseNative(target);
for (const p of [
  "include/cppu/Enterable.hxx",
  "include/uno/Enterable.h",
  "include/uno/environment.h",
])
  loadUnicodeOriginal(native.sources, p);
const caller = String.raw`#include <cppu/Enterable.hxx>
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <string>
void emit(std::initializer_list<sal_Int32>r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
rtl::OUString*expectedReason=nullptr;va_list*expectedCursor=nullptr;
void callee(va_list*p){int a=va_arg(*p,int);double b=va_arg(*p,double);rtl::OUString*r=va_arg(*p,rtl::OUString*);emit({30,a,static_cast<int>(b*100),r==expectedReason,p==expectedCursor||expectedCursor==nullptr});}
struct Caller:cppu::Enterable{
 int count=0;bool valid=false,fail=false;
 void v_enter()override{emit({1,++count});if(fail)throw 42;}
 void v_leave()override{emit({2,++count});}
 void v_callInto_v(uno_EnvCallee*f,va_list*p)override{emit({20,++count,f==callee,p==expectedCursor||expectedCursor==nullptr});f(p);if(fail)throw 42;emit({21,va_arg(*p,int)});}
 void v_callOut_v(uno_EnvCallee*f,va_list*p)override{emit({22,++count,f==callee,p==expectedCursor||expectedCursor==nullptr});f(p);if(fail)throw 42;emit({23,va_arg(*p,int)});}
 bool v_isValid(rtl::OUString*p)override{emit({40,++count,p==expectedReason,valid});text(p->pData);rtl::OUString value=rtl::OUString::createFromAscii(valid?"valid":"invalid");*p=value;text(p->pData);return valid;}
};
void direct(Caller&e,int kind,...){va_list p;va_start(p,kind);expectedCursor=&p;switch(kind){case 0:e.callInto_v(callee,&p);break;case 1:e.callOut_v(callee,&p);break;case 2:e.m_callInto_v(&e,callee,&p);break;default:e.m_callOut_v(&e,callee,&p);}expectedCursor=nullptr;va_end(p);}
void calls(){Caller e;emit({e.m_enter==cppu::Enterable_call_enter,e.m_leave==cppu::Enterable_call_leave,e.m_callInto_v==cppu::Enterable_call_callInto_v,e.m_callOut_v==cppu::Enterable_call_callOut_v,e.m_isValid==cppu::Enterable_call_isValid});e.enter();e.leave();e.m_enter(&e);e.m_leave(&e);rtl::OUString reason=rtl::OUString::createFromAscii("argument");expectedReason=&reason;e.callInto(callee,13,-1.75,&reason,31);e.callOut(callee,-7,2.5,&reason,32);for(int kind=0;kind<4;kind++)direct(e,kind,50+kind,-0.25,&reason,40+kind);emit({90,e.count});}
void reasons(){Caller e;for(int v:{0,1})for(int k:{0,1,2}){emit({10,v,k});rtl::OUString reason=rtl::OUString::createFromAscii("before");rtl_uString*old=reason.pData;rtl_uString_acquire(old);expectedReason=&reason;e.valid=v;int result=k==0?e.isValid(&reason):k==1?e.m_isValid(&e,&reason.pData):cppu::Enterable_call_isValid(&e,&reason.pData);emit({11,result});text(reason.pData);text(old);rtl_uString_release(old);}rtl_uString*raw=nullptr;rtl_uString_newFromAscii(&raw,"raw before");expectedReason=reinterpret_cast<rtl::OUString*>(&raw);e.valid=true;emit({12,e.m_isValid(&e,&raw)});text(raw);rtl_uString_release(raw);emit({90,e.count});}
void throwing(){Caller e;e.fail=true;try{e.enter();emit({-1});}catch(int value){emit({60,value});}rtl::OUString reason=rtl::OUString::createFromAscii("argument");expectedReason=&reason;try{e.callInto(callee,1,-0.5,&reason,31);emit({-1});}catch(int value){emit({60,value});}try{e.callOut(callee,2,0.5,&reason,32);emit({-1});}catch(int value){emit({60,value});}emit({90,e.count});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="calls")calls();else if(mode=="reasons")reasons();else if(mode=="throwing")throwing();else return 2;}
`;
writeFileSync(`${target}/driver.cpp`, caller);
/** Builds the whole genuine header with every dependency owner matched to caller instrumentation. @param sanitized - Native instrumentation. @returns Original executable. */
function build(sanitized) {
  const label = sanitized ? "asan" : "normal",
    objects = native.libraries(sanitized),
    dependency = `${target}/${label}-caller.d`,
    binary = `${target}/${label}-caller`;
  native.run(
    "clang++",
    [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
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
    label + "-caller-link",
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  return binary;
}
/** Captures the complete initialized native process stream and terminal diagnostics. @param binary - Genuine executable. @param mode - Whole caller mode. @returns Terminal output. */
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
for (const mode of ["calls", "reasons", "throwing"]) {
  const a = capture(normal, mode),
    b = capture(sanitized, mode);
  if (
    a.status !== 0 ||
    b.status !== 0 ||
    a.signal !== null ||
    b.signal !== null ||
    !a.stdout.equals(b.stdout) ||
    a.stderr.length ||
    b.stderr.length
  )
    throw Error("Original Enterable " + mode + " failed");
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
      /** Hashes complete original source blobs. @param entry - Original source pair. @returns Full provenance. */ ([
        p,
        v,
      ]) => [p, hash(v)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  scope:
    "Complete original Enterable.hxx and C callback/environment records over full unchanged SAL/typelib dependencies. Actual pure caller-derived virtual bodies observe context/callee/advancing argument cursor, mixed valid variadic/direct argument values, mutable OOString reason field address/object identity, bool-int results and throw propagation. No environment/mapping/string/interface/type/default/library provider or body extraction. Native JS logical iterator/field-address contract only, physical va_list/ABI/system runtime/leaks/native thread/shutdown/full environment/exception/QA unverified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed complete original Enterable observations");
console.log(
  "Original Enterable observations " +
    (write ? "written" : "verified") +
    ": " +
    Object.keys(native.sources).length +
    " complete sources; " +
    Object.entries(captures)
      .map(
        /** Reports whole stream lengths only. @param entry - Captured stream. @returns Bounded summary. */ ([
          mode,
          v,
        ]) => mode + "=" + v.byteLength,
      )
      .join(", "),
);
