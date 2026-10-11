/** @fileoverview Captures complete original weak reference listener/helper/template lifecycle over genuine unchanged shared libraries, actual weak.cxx and complete pinned generated headers. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/cppuhelper-weakref-native";
const fixture = "apps/office/src/cppuhelper/source/native-weakref-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const selected = [
  "uno/XWeak",
  "uno/XAdapter",
  "uno/XReference",
  "uno/XAggregation",
  "lang/DisposedException",
];
for (const name of [
  "uno/Exception",
  "uno/RuntimeException",
  "uno/XInterface",
  "uno/TypeClass",
  ...selected,
]) {
  const relative = `com/sun/star/${name}.idl`;
  const destination = `${target}/idl/${relative}`;
  mkdirSync(destination.slice(0, destination.lastIndexOf("/")), { recursive: true });
  writeFileSync(destination, loadUnicodeOriginal(native.sources, `udkapi/${relative}`));
}
native.run(
  "output/playwright/task39-native-types/cppumaker",
  [
    "-nD",
    "-T",
    selected
      .map(
        /** Original declared interface target. @param name - IDL path. @returns Original complete name. */ (
          name,
        ) => "com.sun.star." + name.replaceAll("/", "."),
      )
      .join(";"),
    "-O",
    resolve(`${target}/generated`),
    pathToFileURL(resolve(`${target}/idl`)).href,
  ],
  "original-interface-type-generation",
);
for (const name of selected)
  for (const extension of ["hdl", "hpp"]) {
    const path = `${target}/generated/com/sun/star/${name}.${extension}`;
    native.manifest.generatedHashes[path] = hash(readFileSync(path));
  }
// Original internal template overload rejection is compiler binding behavior, not an executed weak owner body.
const invalidTemplate =
  "#include <cppuhelper/weakref.hxx>\n#include <com/sun/star/uno/XWeak.hpp>\ncss::uno::WeakReference<css::uno::XWeak> value;\n";
const invalidPath = `${target}/invalid-weak-template.cpp`;
writeFileSync(invalidPath, invalidTemplate);
const invalidArgv = [...native.flags, `-I${target}/generated`, "-fsyntax-only", invalidPath];
const invalidResult = spawnSync("clang++", invalidArgv, {
  encoding: "utf8",
  maxBuffer: 4 * 1024 * 1024,
});
writeFileSync(`${target}/invalid-template.stdout`, invalidResult.stdout ?? "");
writeFileSync(`${target}/invalid-template.stderr`, invalidResult.stderr ?? "");
if (
  invalidResult.status !== 1 ||
  invalidResult.signal !== null ||
  !invalidResult.stderr.includes(
    "multiple overloads of 'operator=' instantiate to the same signature",
  )
)
  throw Error("Changed original internal WeakReference<XWeak> compiler restriction");
const compilerRestriction = {
  tool: "clang++",
  argv: invalidArgv,
  exitCode: invalidResult.status,
  signal: invalidResult.signal,
  source: invalidTemplate,
  sourceHash: hash(invalidTemplate),
  stdout: invalidResult.stdout,
  stderr: invalidResult.stderr,
  diagnosticHash: hash(invalidResult.stderr),
  originalHeaderHash: hash(loadUnicodeOriginal(native.sources, "include/cppuhelper/weakref.hxx")),
};
writeFileSync(
  `${target}/compiler-restriction.json`,
  JSON.stringify(compilerRestriction, null, 2) + "\n",
);
const driver = String.raw`${unoNativeValueCaller}

#include <cppuhelper/weakref.hxx>
#include <cppuhelper/queryinterface.hxx>
#include <com/sun/star/uno/XWeak.hpp>
#include <com/sun/star/uno/XAdapter.hpp>
#include <com/sun/star/uno/XReference.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <map>
#include <stdexcept>
using A=css::uno::Any;using T=css::uno::Type;using H=css::uno::WeakReferenceHelper;
std::map<void*,int> ids;int nextListener=100;
void cppPointerValue(void*p){emit({p==nullptr});if(p)emit({ids.at(p)});}
void fail(int n){if(n==1)throw css::uno::RuntimeException();if(n==2)throw std::logic_error("caller");}
struct Hard;
struct Adapter:css::uno::XAdapter{int id,count=10000,failAdd=0,failRemove=0,failGet=0;bool live=true,retain=true,reenter=false;Hard*target=nullptr;std::vector<css::uno::Reference<css::uno::XReference>> refs;
 explicit Adapter(int v):id(v){ids[this]=id;}
 void SAL_CALL acquire()override{emit({1,id,++count});}void SAL_CALL release()override{emit({2,id,--count});}
 A SAL_CALL queryInterface(T const&t)override{emit({51,id});ref(t.getTypeLibType());return cppu::queryInterface(t,static_cast<css::uno::XAdapter*>(this),static_cast<css::uno::XInterface*>(this));}
 css::uno::Reference<css::uno::XInterface> SAL_CALL queryAdapted()override;
 void SAL_CALL addReference(css::uno::Reference<css::uno::XReference>const&r)override{ids[r.get()]=nextListener++;emit({31,id,ids.at(r.get()),static_cast<int>(refs.size()),retain});fail(failAdd);if(retain)refs.push_back(r);emit({32,id,static_cast<int>(refs.size())});}
 void SAL_CALL removeReference(css::uno::Reference<css::uno::XReference>const&r)override{emit({33,id,ids.at(r.get()),static_cast<int>(refs.size()),reenter});fail(failRemove);if(reenter){r->dispose();}for(auto i=refs.begin();i!=refs.end();++i)if(i->get()==r.get()){refs.erase(i);break;}emit({34,id,static_cast<int>(refs.size())});}
};
struct Hard:css::uno::XWeak{int id,count=10000,failQuery=0,failAdapter=0;bool supports=true,nullAdapter=false;Adapter*adapter;
 Hard(int v,Adapter*a):id(v),adapter(a){ids[this]=id;a->target=this;}
 void SAL_CALL acquire()override{emit({1,id,++count});}void SAL_CALL release()override{emit({2,id,--count});}
 A SAL_CALL queryInterface(T const&t)override{emit({50,id,supports});ref(t.getTypeLibType());fail(failQuery);if(supports)return cppu::queryInterface(t,static_cast<css::uno::XWeak*>(this),static_cast<css::uno::XInterface*>(this));return cppu::queryInterface(t,static_cast<css::uno::XInterface*>(this));}
 css::uno::Reference<css::uno::XAdapter> SAL_CALL queryAdapter()override{emit({30,id,nullAdapter});fail(failAdapter);return nullAdapter?css::uno::Reference<css::uno::XAdapter>():css::uno::Reference<css::uno::XAdapter>(adapter);}
};
css::uno::Reference<css::uno::XInterface> Adapter::queryAdapted(){emit({35,id,live});fail(failGet);return live?css::uno::Reference<css::uno::XInterface>(target):css::uno::Reference<css::uno::XInterface>();}
void state(Hard const&x,Hard const&y,Adapter const&a,Adapter const&b){emit({60,x.count,y.count,a.count,b.count,static_cast<int>(a.refs.size()),static_cast<int>(b.refs.size())});for(auto const&r:a.refs)cppPointerValue(r.get());for(auto const&r:b.refs)cppPointerValue(r.get());}
void hard(css::uno::Reference<css::uno::XInterface>const&r){cppPointerValue(r.get());emit({r.is()});}
void any(A const&a){ref(a.pType);emit({a.hasValue(),static_cast<sal_Int32>(a.getValueTypeClass()),a.pData==&a,a.pData==&a.pReserved});if(a.getValueTypeClass()==css::uno::TypeClass_INTERFACE)cppPointerValue(a.pReserved);}
struct Exposed:H{using H::H;void drop(){auto*p=m_pImpl;m_pImpl=nullptr;reinterpret_cast<css::uno::XReference*>(p)->release();}};
template<typename F>void attempt(int tag,F&&f){emit({70,tag});try{f();emit({90,0});}catch(css::uno::RuntimeException const&){emit({91,1});}catch(std::logic_error const&){emit({91,2});}}
void run(std::string const&mode){Adapter a(20),b(21);Hard x(10,&a),y(11,&b);auto s=[&]{state(x,y,a,b);};
 if(mode=="lifecycle"){{css::uno::Reference<css::uno::XInterface>r(&x),q(&y);H empty,zero(empty),w(r);s();hard(w.get());H copy(w);H moved(std::move(copy));s();hard(copy.get());emit({w==moved,w==empty});moved=moved;moved=std::move(moved);s();hard(moved.get());H other(q);emit({w==other});hard(static_cast<css::uno::Reference<css::uno::XInterface>>(w));for(int k=0;k<3;k++){T const&t=k==0?cppu::UnoType<css::uno::XReference>::get():k==1?cppu::UnoType<css::uno::XInterface>::get():cppu::UnoType<css::uno::XAdapter>::get();auto v=a.refs.at(0)->queryInterface(t);any(v);}a.live=false;hard(w.get());H dead(w);s();a.live=true;empty=w;s();a.reenter=true;w.clear();a.reenter=false;s();empty=zero;other.clear();dead.clear();}s();}
 else if(mode=="overloads"){{css::uno::Reference<css::uno::XInterface>r(&x);css::uno::Reference<css::uno::XWeak>weak(&x);css::uno::Reference<css::uno::XAdapter>adapter(&a),nil;H fast(weak),root(r),none;css::uno::WeakReference<css::uno::XInterface>wr(r),defaultRoot;css::uno::WeakReference<css::uno::XAdapter>ww(adapter),defaultWeak;css::uno::WeakReference<css::uno::XAdapter>wa(adapter),nullAdapter(nil);s();hard(wr.get());{css::uno::Reference<css::uno::XInterface>v(wr);hard(v);}{css::uno::Reference<css::uno::XAdapter>v(ww);hard(v);}{css::uno::Reference<css::uno::XAdapter>v(wa);hard(v);}defaultRoot=r;defaultWeak=weak;wa=weak;s();{css::uno::Reference<css::uno::XAdapter>v(wa);hard(v);}ww=weak;css::uno::WeakReference<css::uno::XAdapter>copied(ww),moved(std::move(copied));moved=ww;defaultWeak=std::move(moved);ww=ww;s();fast=weak;root=r;none=fast;none=std::move(fast);none=std::move(none);wa=adapter;wa=nil;defaultRoot.clear();defaultWeak.clear();ww.clear();wr.clear();wa.clear();root.clear();}s();}
 else if(mode=="nulls"){{css::uno::Reference<css::uno::XInterface>r(&x),nil;css::uno::Reference<css::uno::XWeak>weakNil;H empty(nil),fastNil(weakNil);x.supports=false;H unsupported(r);hard(unsupported.get());unsupported=r;x.supports=true;x.nullAdapter=true;H noAdapter(r);hard(noAdapter.get());noAdapter=empty;empty=weakNil;s();x.nullAdapter=false;}s();}
 else if(mode=="errors"){{css::uno::Reference<css::uno::XInterface>r(&x);css::uno::Reference<css::uno::XWeak>weak(&x);for(int k=1;k<=2;k++){x.failQuery=k;attempt(10+k,[&]{H w(r);hard(w.get());});x.failQuery=0;x.failAdapter=k;attempt(20+k,[&]{H w(r);hard(w.get());});attempt(30+k,[&]{H w(weak);});x.failAdapter=0;a.failAdd=k;attempt(40+k,[&]{H w(r);hard(w.get());});attempt(50+k,[&]{H w(weak);});a.failAdd=0;s();}H w(r);for(int k=1;k<=2;k++){a.failGet=k;attempt(60+k,[&]{hard(w.get());});attempt(70+k,[&]{H copy(w);hard(copy.get());});a.failGet=0;}for(int k=1;k<=2;k++){a.failRemove=k;attempt(80+k,[&]{w.clear();});a.failRemove=0;w.clear();a.refs.clear();w=r;}for(int k=1;k<=2;k++){x.failQuery=k;attempt(90+k,[&]{w=r;});x.failQuery=0;w=r;x.failAdapter=k;attempt(100+k,[&]{w=weak;});x.failAdapter=0;w=r;}s();}a.refs.clear();s();}
 else if(mode=="destructor"){{css::uno::Reference<css::uno::XInterface>r(&x);a.retain=false;{Exposed w(r);w.drop();s();}{Exposed w(r);a.failRemove=1;w.drop();a.failRemove=0;s();}a.retain=true;}s();}
 else throw std::logic_error("mode");
 ref(cppu::UnoType<css::uno::XWeak>::get().getTypeLibType());ref(cppu::UnoType<css::uno::XAdapter>::get().getTypeLibType());ref(cppu::UnoType<css::uno::XReference>::get().getTypeLibType());
}
int main(int argc,char**argv){if(argc!=2)return 2;run(argv[1]);return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);
/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  for (const unit of ["any", "data", "sequence", "weak"]) {
    const relative =
      unit === "weak"
        ? "cppuhelper/source/weak.cxx"
        : unit === "cppu_opt"
          ? "cppu/source/cppu/cppu_opt.cxx"
          : `cppu/source/uno/${unit}.cxx`;
    const source = `${upstream}/${relative}`;
    loadUnicodeOriginal(native.sources, relative);
    const object = `${target}/${sanitized ? "asan" : "normal"}-uno-${unit}.o`;
    const dependency = object + ".d";
    native.run(
      "clang++",
      [
        ...native.flags,
        `-I${target}/generated`,
        ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
        "-DCPPU_DLLIMPLEMENTATION",
        "-DCPPUHELPER_DLLIMPLEMENTATION",
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
      `-I${target}/generated`,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      "-Ivendor/libreoffice-reference/cppu/source/uno",
      "-DCPPU_DLLIMPLEMENTATION",
      "-DCPPUHELPER_DLLIMPLEMENTATION",
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
for (const mode of ["lifecycle", "overloads", "nulls", "errors", "destructor"]) {
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
    throw Error(`Original generated interface ${mode} failed: ${a.stderr} ${b.stderr}`);
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
      /** Hashes complete original source. @param entry - Source pair. @returns Actual source hash. */ ([
        path,
        value,
      ]) => [path, hash(value)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  compilerRestriction,
  captures,
  scope:
    "Complete original OWeakRefListener/WeakReferenceHelper and header WeakReference lifecycle/overloads/copy/move/query/error and initialized actual callback/pointer/list/type ownership streams. Unchanged whole original weak.cxx plus full real normal-ASan/UBSan dependencies; unrelated OWeakObject/OWeakAggObject and C++ exception bridge unreferenced and naturally dead-stripped, not substituted. Controlled virtual callers and protected-pointer destructor diagnostic do not certify arbitrary producers or physical ABI/native threading/resources/full consumer QA.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed complete original generated interface observations");
console.log(
  `Original weak reference observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.keys(result.generatedHashes).length} genuine generated files, ` +
    Object.entries(captures)
      .map(
        /** Reports complete bytes. @param entry - Mode pair. @returns Byte total. */ ([
          name,
          value,
        ]) => `${name}=${value.byteLength}`,
      )
      .join(", "),
);
