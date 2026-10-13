/** @fileoverview Captures the complete original binary interface holder over full unchanged SAL/typelib dependencies and genuine caller callbacks. */
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
const target = "output/playwright/uno-dispatcher-native",
  fixture = "apps/office/src/cppu/inc/uno/native-dispatcher-cases.json",
  native = prepareCaseNative(target);
for (const p of ["include/uno/dispatcher.hxx", "include/uno/dispatcher.h"])
  loadUnicodeOriginal(native.sources, p);
const caller = String.raw`#include <uno/dispatcher.hxx>
#include <typelib/typedescription.h>
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <utility>
using namespace com::sun::star::uno;
void emit(std::initializer_list<sal_Int32> r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
struct Caller:uno_Interface{int id,count=100;Caller(int);};
Caller a(1),b(2);UnoInterfaceReference*watch=nullptr;
int ident(uno_Interface*p){return p==nullptr?0:static_cast<Caller*>(p)->id;}
void SAL_CALL acquire(uno_Interface*p){auto*c=static_cast<Caller*>(p);emit({1,c->id,++c->count,ident(watch==nullptr?nullptr:watch->get())});}
void SAL_CALL release(uno_Interface*p){auto*c=static_cast<Caller*>(p);emit({2,c->id,--c->count,ident(watch==nullptr?nullptr:watch->get())});}
typelib_TypeDescription*member=nullptr;void*returned=nullptr;void**arguments=nullptr;uno_Any**exception=nullptr;
void SAL_CALL dispatch(uno_Interface*p,typelib_TypeDescription const*d,void*r,void*args[],uno_Any**exc){emit({3,ident(p),d==member,r==returned,args==arguments,exc==exception,*exc==nullptr});if(r)*static_cast<int*>(r)=71;if(args)*static_cast<int*>(args[0])=72;*exc=nullptr;}
Caller::Caller(int n):id(n){uno_Interface::acquire=::acquire;uno_Interface::release=::release;pDispatcher=::dispatch;}
void observe(int n,UnoInterfaceReference const&h){emit({10,n,ident(h.get()),h.is(),a.count,b.count});}
void ownership(){UnoInterfaceReference empty;observe(0,empty);{UnoInterfaceReference c(empty);observe(1,c);} {UnoInterfaceReference h(&a);watch=&h;observe(2,h);emit({&h.set(&b)==&h});observe(3,h);h.set(&b);observe(4,h);h.set(nullptr);observe(5,h);h.set(nullptr);observe(6,h);a.acquire(&a);h.set(&a,SAL_NO_ACQUIRE);observe(7,h);b.acquire(&b);emit({&h.set(&b,SAL_NO_ACQUIRE)==&h});observe(8,h);h.set(nullptr,SAL_NO_ACQUIRE);observe(9,h);h.clear();observe(10,h);h.set(&a);observe(11,h);h.clear();observe(12,h);h.set(&a);{UnoInterfaceReference c(h);observe(13,c);emit({&(c=h)==&c});observe(14,c);emit({&(c=&b)==&c});observe(15,c);}observe(16,h);emit({&(h=h)==&h});observe(17,h);h=&a;observe(18,h);}watch=nullptr;a.acquire(&a);{UnoInterfaceReference h(&a,SAL_NO_ACQUIRE);watch=&h;observe(19,h);}watch=nullptr;{UnoInterfaceReference h(nullptr,SAL_NO_ACQUIRE);observe(20,h);}emit({90,a.count,b.count});}
void moves(){UnoInterfaceReference source(&a);watch=&source;UnoInterfaceReference moved(std::move(source));observe(0,source);observe(1,moved);UnoInterfaceReference dest(&b);watch=&dest;emit({&(dest=std::move(moved))==&dest});observe(2,dest);observe(3,moved);emit({&(dest=std::move(dest))==&dest});observe(4,dest);UnoInterfaceReference empty(std::move(source));observe(5,empty);dest=std::move(empty);observe(6,dest);observe(7,empty);watch=nullptr;emit({90,a.count,b.count});}
void dispatches(){typelib_TypeDescriptionReference**root=typelib_static_type_getByTypeClass(typelib_TypeClass_INTERFACE);(void)root;rtl::OUString name=rtl::OUString::createFromAscii("com.sun.star.uno.XInterface::queryInterface");typelib_typedescription_getByName(&member,name.pData);if(member==nullptr)std::exit(4);{UnoInterfaceReference h(&a);watch=&h;int result=0,arg=0;void*args[]={&arg};uno_Any mem{};uno_Any*exc=&mem;returned=&result;arguments=args;exception=&exc;h.dispatch(member,&result,args,&exc);emit({11,result,arg,exc==nullptr});returned=nullptr;arguments=nullptr;exc=nullptr;h.dispatch(member,nullptr,nullptr,&exc);emit({12,exc==nullptr});}watch=nullptr;typelib_typedescription_release(member);emit({90,a.count,b.count});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="ownership")ownership();else if(mode=="moves")moves();else if(mode=="dispatch")dispatches();else return 2;}
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
for (const mode of ["ownership", "moves", "dispatch"]) {
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
    throw Error("Original dispatcher " + mode + " failed");
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
    "Complete original internal UnoInterfaceReference header over whole genuine SAL/typelib dependencies; initialized caller C callback records and original real typelib member, all ownership/move/publication and borrowed dispatch address observations. No interface/type/default/library provider or extracted body. Normal and ASan/UBSan whole streams; system runtime/leaks/physical ABI/thread/shutdown and complete exception/environment/mapping/full QA remain unverified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed complete original dispatcher observations");
console.log(
  "Original binary dispatcher observations " +
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
