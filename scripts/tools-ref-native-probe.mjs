/** @fileoverview Captures the actual pinned SvRefBase/SvRef/make_ref owners through unchanged full ref.hxx and ref.cxx in normal and ASan/UBSan builds. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { isDeepStrictEqual } from "node:util";
import { format } from "prettier";
import prettierConfig from "../prettier.config.js";
import {
  hash,
  loadUnicodeOriginal,
  pin,
  upstream,
  configureUnicodeNativeHeaders,
} from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write",
  check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/tools-ref-native",
  fixture = "apps/office/src/tools/inc/native-ref-cases.json";
mkdirSync(target, { recursive: true });
const sources = {},
  configurations = configureUnicodeNativeHeaders(target, sources),
  manifest = { pin, state: "building", configurations, commands: [], sourceHashes: {} };
/** Saves only real build commands/configuration and complete original source hashes. @returns Nothing. */
function save() {
  manifest.sourceHashes = Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes a complete verified original blob. @param pair - Source pair. @returns Original hash. */ ([
        path,
        value,
      ]) => [path, hash(value)],
    ),
  );
  writeFileSync(`${target}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
}
const native = {
  sources,
  manifest,
  save,
  flags: [
    "-std=c++20",
    "-O1",
    "-DMACOSX",
    "-DUNX",
    "-DLIBO_INTERNAL_ONLY",
    `-I${target}/headers`,
    `-I${upstream}/include`,
  ],
  /** Runs an actual compiler/linker, preserving all diagnostics and exit state. @param tool - Compiler. @param argv - Exact arguments. @param label - Diagnostic stem. @returns Nothing. */
  run(tool, argv, label) {
    const result = spawnSync(tool, argv, { encoding: "utf8", maxBuffer: 4 * 1024 * 1024 });
    writeFileSync(`${target}/${label}.stdout`, result.stdout ?? "");
    writeFileSync(`${target}/${label}.stderr`, result.stderr ?? "");
    manifest.commands.push({ tool, argv, exitCode: result.status, signal: result.signal });
    if (result.status !== 0) manifest.state = "failed";
    save();
    if (result.status !== 0 || result.signal !== null)
      throw new Error(result.stderr ?? "Compiler failed");
  },
};
const driver = String.raw`#include <tools/ref.hxx>
#include <cstdio>
#include <initializer_list>
#include <string_view>
#include <utility>
void emit(std::initializer_list<unsigned int> values){for(auto value:values)std::printf("%u\n",value);}
struct Probe;
tools::SvRef<Probe>* watch=nullptr;
struct Probe:SvRefBase {
 unsigned int id;
 explicit Probe(unsigned int value):id(value){emit({10,id,GetRefCount()});}
 Probe(Probe const& source):SvRefBase(source),id(source.id+100){emit({10,id,GetRefCount()});}
 ~Probe()override{emit({90,id,GetRefCount(),watch&&watch->get()==this});}
};
void lifecycle(){
 auto* object=new Probe(1);emit({20,object->GetRefCount()});
 tools::SvRef<Probe> p(object);watch=&p;emit({21,object->GetRefCount()});
 {tools::SvRef<Probe> q(p),r(object);emit({22,object->GetRefCount(),p.is(),bool(p),p.get()==object,&*p==object,p.operator->()==object,p==q,p!=q});
 q=q;emit({23,object->GetRefCount()});r.clear();emit({24,object->GetRefCount()});}
 emit({25,object->GetRefCount()});p.clear();emit({26,p.is()});watch=nullptr;
 tools::SvRef<Probe> empty,copy(empty),moved(std::move(copy));emit({27,empty.is(),copy.is(),moved.is(),empty==moved});
 empty=copy;empty=nullptr;copy=std::move(moved);
}
void assignments(){
 {tools::SvRef<Probe> p(new Probe(2)),q(new Probe(3));watch=&p;
 p=std::move(q);emit({30,p->id,p->GetRefCount(),q.is()});q=p;emit({31,p->GetRefCount()});q=std::move(q);emit({32,p->GetRefCount(),q.is()});p=p;emit({33,p->GetRefCount()});
 p=new Probe(4);emit({34,p->GetRefCount()});p=nullptr;emit({35,p.is()});p=tools::make_ref<Probe>(5);emit({36,p->GetRefCount()});}watch=nullptr;
 {tools::SvRef<Probe> p(new Probe(6)),q(new Probe(7));watch=&p;p=q;emit({37,p->id,p->GetRefCount()});q.clear();p.clear();watch=nullptr;}
 {tools::SvRef<Probe> source(new Probe(8));auto moved=tools::SvRef<Probe>(std::move(source));watch=&moved;emit({38,source.is(),moved->GetRefCount()});moved.clear();watch=nullptr;}
}
void copyBase(){
 tools::SvRef<Probe> source(new Probe(9));
 {Probe copy(*source);emit({42,copy.GetRefCount()});emit({43,&(static_cast<SvRefBase&>(copy)=*source)==&copy,copy.GetRefCount()});copy.AddNextRef();copy.ReleaseRef();emit({44,copy.GetRefCount()});}
 Probe object(10);object.AddNextRef();emit({40,object.GetRefCount()});object.ReleaseRef();emit({41,object.GetRefCount()});
 tools::SvRef<SvRefBase> plain(new SvRefBase);emit({45,plain->GetRefCount()});plain.clear();
}
void boundary(){Probe object(11);for(unsigned int i=0;i<(1U<<30);++i)object.AddNextRef();emit({50,object.GetRefCount()});for(unsigned int i=0;i<(1U<<30);++i)object.ReleaseRef();emit({51,object.GetRefCount()});}
int main(int argc,char**argv){if(argc!=2)return 2;std::string_view mode(argv[1]);if(mode=="lifecycle")lifecycle();else if(mode=="assignments")assignments();else if(mode=="base")copyBase();else if(mode=="boundary")boundary();else return 3;}
`;
// Only concrete caller code is authored here; every library body/header stays unchanged.
writeFileSync(`${target}/driver.cpp`, driver);
loadUnicodeOriginal(native.sources, "tools/source/ref/ref.cxx");
loadUnicodeOriginal(native.sources, "include/tools/ref.hxx");
/** Compiles the complete original translation unit and caller with the same instrumentation. @param sanitized - ASan/UBSan mode. @returns Actual binary. */
function build(sanitized) {
  const stem = `${target}/${sanitized ? "asan" : "normal"}`,
    flags = [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
    ],
    dependency = `${stem}.d`;
  native.run(
    "clang++",
    [
      ...flags,
      "-DTOOLS_DLLIMPLEMENTATION",
      "-MMD",
      "-MF",
      dependency,
      "-c",
      `${upstream}/tools/source/ref/ref.cxx`,
      "-o",
      `${stem}.o`,
    ],
    `${sanitized ? "asan" : "normal"}-owner`,
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  native.run(
    "clang++",
    [
      ...flags,
      "-MMD",
      "-MF",
      dependency,
      `${target}/driver.cpp`,
      `${stem}.o`,
      "-Wl,-dead_strip",
      "-o",
      `${stem}-caller`,
    ],
    `${sanitized ? "asan" : "normal"}-link`,
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
  return `${stem}-caller`;
}
const normal = build(false),
  sanitized = build(true),
  captures = {};
for (const mode of ["lifecycle", "assignments", "base", "boundary"]) {
  const outputs = [];
  for (const binary of [normal, sanitized]) {
    const result = spawnSync(binary, [mode], {
      encoding: "utf8",
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
      timeout: 60000,
      maxBuffer: 1024 * 1024,
    });
    native.manifest.commands.push({
      tool: binary,
      argv: [mode],
      exitCode: result.status,
      signal: result.signal,
    });
    writeFileSync(`${binary}.${mode}.stdout`, result.stdout ?? "");
    writeFileSync(`${binary}.${mode}.stderr`, result.stderr ?? "");
    native.save();
    if (result.status !== 0 || result.signal !== null || result.stderr) {
      native.manifest.state = "failed";
      native.save();
      throw new Error(`Original SvRef ${mode} failed: ${result.stderr}`);
    }
    outputs.push(result.stdout);
  }
  if (outputs[0] !== outputs[1]) throw new Error(`Original normal/sanitized SvRef ${mode} differ`);
  captures[mode] = {
    observations: outputs[0].trim().split("\n").map(Number),
    digest: hash(outputs[0]),
  };
}
const result = {
  pin,
  configurations,
  driverHash: hash(driver),
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes complete pinned dependency blobs. @param pair - Source pair. @returns Exact source hash. */ ([
        path,
        value,
      ]) => [path, hash(value)],
    ),
  ),
  captures,
  scope:
    "Complete original SvRefBase/SvRef/make_ref valid ownership streams and live count boundary, normal and ASan/UBSan. LeakSanitizer is unsupported on this platform and disabled; no leak-detection claim. Full unchanged ref.cxx also contains unrelated WeakBase destructor, naturally dead-stripped; compatibility frame wrappers/native allocation/thread/ABI and invalid/post-lifetime behavior are not certified.",
};
if (write)
  writeFileSync(
    fixture,
    await format(JSON.stringify(result), { ...prettierConfig, parser: "json" }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw new Error("Changed original SvRef observations");
native.manifest.state = "captured";
native.save();
console.log(
  `Original SvRef ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources; ` +
    Object.entries(captures)
      .map(
        /** Reports full stream counts. @param entry - Capture pair. @returns Mode length. */ ([
          mode,
          value,
        ]) => `${mode}=${value.observations.length}`,
      )
      .join(", "),
);
