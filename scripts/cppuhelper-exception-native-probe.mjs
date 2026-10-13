/** @fileoverview Captures the complete original desktop UNO exception contract, including non-null Context callback ownership. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { prepareExceptionNative } from "./cppuhelper-exception-native-build.mjs";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { hash, pin } from "./rtl-ustring-native-sources.mjs";
const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw Error("Use exactly --write or --check");
const target = "output/playwright/cppuhelper-exception-native",
  fixture = "apps/office/src/cppuhelper/source/native-exception-bridge-cases.json",
  native = prepareExceptionNative(target);
const caller = String.raw`${unoNativeValueCaller}
#include <cppuhelper/exc_hlp.hxx>
#include <com/sun/star/uno/Exception.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <com/sun/star/lang/DisposedException.hpp>
#include <com/sun/star/lang/IllegalArgumentException.hpp>
#include <com/sun/star/uno/Reference.hxx>
#include <com/sun/star/uno/Any.hxx>
using namespace com::sun::star::uno;
using com::sun::star::lang::DisposedException;using com::sun::star::lang::IllegalArgumentException;
struct Caller: XInterface {int count=10000;Any SAL_CALL queryInterface(Type const&t)override{emit({31,count});text(t.getTypeName().pData);if(t==cppu::UnoType<XInterface>::get()){XInterface*p=this;return Any(&p,t);}return Any();}void SAL_CALL acquire()override{emit({1,++count});}void SAL_CALL release()override{emit({2,--count});}};
Caller*c=nullptr;
void observed(Any const&a){ref(a.getValueTypeRef());if(a.getValueTypeClass()!=TypeClass_EXCEPTION){emit({-9});return;}auto*e=static_cast<Exception const*>(a.getValue());text(e->Message.pData);emit({e->Context.is(),e->Context.get()==c,c->count});if(a.getValueType()==cppu::UnoType<IllegalArgumentException>::get())emit({static_cast<IllegalArgumentException const*>(a.getValue())->ArgumentPosition});}
void raised(int kind,rtl::OUString const&m,Reference<XInterface>const&ctx){switch(kind){case 0:throw Exception(m,ctx);case 1:throw RuntimeException(m,ctx);case 2:throw DisposedException(m,ctx);default:throw IllegalArgumentException(m,ctx,42);}}
void captures(){for(int nonnull:{0,1})for(int kind:{0,1,2,3}){emit({10,nonnull,kind});rtl::OUString message=rtl::OUString::createFromAscii("native exception");{Reference<XInterface>context(nonnull?c:nullptr);try{raised(kind,message,context);}catch(Exception&){Any a=cppu::getCaughtException();observed(a);Any b(a);observed(b);a.clear();observed(b);}emit({c->count});}text(message.pData);emit({c->count});}}
void roundtrips(){for(int nonnull:{0,1})for(int kind:{0,1,2,3}){emit({20,nonnull,kind});rtl::OUString message=rtl::OUString::createFromAscii("round trip");{Reference<XInterface>context(nonnull?c:nullptr);Any a;switch(kind){case 0:{Exception e(message,context);a<<=e;break;}case 1:{RuntimeException e(message,context);a<<=e;break;}case 2:{DisposedException e(message,context);a<<=e;break;}default:{IllegalArgumentException e(message,context,42);a<<=e;break;}}observed(a);try{cppu::throwException(a);}catch(IllegalArgumentException&){Any b=cppu::getCaughtException();emit({3});observed(b);}catch(DisposedException&){Any b=cppu::getCaughtException();emit({2});observed(b);}catch(RuntimeException&){Any b=cppu::getCaughtException();emit({1});observed(b);}catch(Exception&){Any b=cppu::getCaughtException();emit({0});observed(b);}observed(a);a.clear();emit({c->count});}text(message.pData);emit({c->count});}}
void nested(){rtl::OUString m=rtl::OUString::createFromAscii("nested");Reference<XInterface>context(c);try{throw RuntimeException(m,context);}catch(RuntimeException&){try{throw DisposedException(m,context);}catch(DisposedException&){Any inner=cppu::getCaughtException();emit({41});observed(inner);}Any outer=cppu::getCaughtException();emit({42});observed(outer);}emit({c->count});}
void rejects(){for(int kind:{0,1,2}){Any a;if(kind==1)a<<=true;if(kind==2)a<<=rtl::OUString::createFromAscii("not exception");try{cppu::throwException(a);emit({-1});}catch(RuntimeException&){Any b=cppu::getCaughtException();emit({50,kind});observed(b);}}}
int main(int argc,char**argv){if(argc!=2)return 2;c=new Caller;std::string mode=argv[1];if(mode=="capture")captures();else if(mode=="roundtrip")roundtrips();else if(mode=="nested")nested();else if(mode=="rejects")rejects();else return 2;emit({90,c->count});}
`;
writeFileSync(`${target}/driver.cpp`, caller);
/** Captures the whole original initialized process stream and terminal diagnostics. @param binary - Genuine executable. @param mode - Complete native scenario. @returns Terminal output. */
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
const normal = native.build(false),
  sanitized = native.build(true),
  captures = {};
for (const mode of ["capture", "roundtrip", "nested", "rejects"]) {
  const a = capture(normal, mode),
    b = capture(sanitized, mode);
  if (
    a.status !== 0 ||
    b.status !== 0 ||
    !a.stdout.equals(b.stdout) ||
    a.stderr.length ||
    b.stderr.length
  )
    throw Error(`Original desktop exception ${mode} failed: ${a.stderr}\n${b.stderr}`);
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
      /** Hashes every complete original source. @param entry - Original source pair. @returns Provenance entry. */ ([
        p,
        value,
      ]) => [p, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  featureProbes: native.manifest.featureProbes,
  loaderProbe: native.manifest.loaderProbe,
  captures,
  scope:
    "Complete genuine original desktop getCaughtException/throwException over full unchanged CPPU environments/mappings, macOS AARCH64 bridge and original SAL/typelib dependencies. Actual generated base/Runtime/Disposed/IllegalArgumentException dynamic types, fields, non-null Context query/acquire/release, Any copy/clear and nested/catch/roundtrip/rejected nonexception behavior. Caller concrete object has positive ownership and is kept alive through process shutdown; no allocator/leak/physical ABI/full consumer or browser parity claim. System runtime uninstrumented, leak detection disabled. No extracted/substitute bodies, fake mapping provider, mobile platform fallback or unresolved-symbol suppression.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed complete original desktop exception observations");
console.log(
  `Original desktop exception observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} sources; ${Object.entries(
    captures,
  )
    .map(
      /** Reports whole stream size. @param entry - Complete captured stream. @returns Bounded summary. */ ([
        mode,
        v,
      ]) => `${mode}=${v.byteLength}`,
    )
    .join(", ")}`,
);
