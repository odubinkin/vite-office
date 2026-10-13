/** @fileoverview Captures the complete original environment descriptor source/header over full unchanged native dependencies and initialized string owners. */
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
const target = "output/playwright/uno-envdcp-native",
  fixture = "apps/office/src/cppu/source/uno/native-envdcp-cases.json",
  native = prepareCaseNative(target);
for (const path of [
  "cppu/source/uno/EnvDcp.cxx",
  "include/uno/EnvDcp.h",
  "include/cppu/EnvDcp.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const inputs = [
  [],
  [58],
  [58, 58],
  [103, 99, 99, 51],
  [117, 110, 111],
  [103, 99, 99, 51, 58],
  [103, 99, 99, 51, 58, 97, 58, 98],
  [0],
  [103, 0, 99],
  [103, 0, 99, 58, 112],
  [103, 58, 0, 99],
  [0, 58, 0],
  [0xd83d, 0xde00, 58, 0xd800, 0xdc00],
  [0xd800],
  [0xffff, 58, 0, 0xffff],
];
for (let n = 0; n < 24; n++) {
  const row = Array.from(
    { length: n },
    /** Generates caller input only, never an upstream result/provider. @param _ - Unused array value. @param i - Unit position. @returns Explicit UTF16 unit. */ (
      _,
      i,
    ) => [97, 58, 0, 0x432, 0xd800, 0xdc00][(i + n) % 6],
  );
  inputs.push(row);
}
const caller = String.raw`#include <cppu/EnvDcp.hxx>
#include <uno/EnvDcp.h>
#include <rtl/ustring.hxx>
#include <cstdio>
#include <cstdlib>
#include <vector>
#include <string>
void emit(std::initializer_list<sal_Int32>r){if(std::fwrite(r.begin(),4,r.size(),stdout)!=r.size())std::exit(3);}
void text(rtl_uString*p){emit({p==nullptr});if(p){emit({p->refCount,p->length});for(int i=0;i<=p->length;i++)emit({p->buffer[i]});}}
std::vector<std::vector<sal_Unicode>>inputs={${inputs
  .map(
    /** Materializes complete caller input units. @param row - Explicit input. @returns C++ initializer. */ (
      row,
    ) => "{" + row.join(",") + "}",
  )
  .join(",")}};
void functions(bool alias){int n=0;for(auto row:inputs){row.push_back(0);rtl::OUString input(row.data(),static_cast<sal_Int32>(row.size()-1));for(int purpose:{0,1}){emit({10,n,purpose,alias});rtl_uString*out=nullptr;rtl_uString*old=nullptr;if(alias){out=input.pData;rtl_uString_acquire(out);}else{rtl_uString_newFromAscii(&out,"old output");old=out;rtl_uString_acquire(old);}text(input.pData);text(old);if(purpose)uno_EnvDcp_getPurpose(input.pData,&out);else uno_EnvDcp_getTypeName(input.pData,&out);text(input.pData);text(out);text(old);emit({out==input.pData,out==old});if(old)rtl_uString_release(old);rtl_uString_release(out);text(input.pData);}++n;}}
void wrappers(){int n=0;for(auto row:inputs){row.push_back(0);rtl::OUString input(row.data(),static_cast<sal_Int32>(row.size()-1));emit({20,n++});text(input.pData);{auto type=cppu::EnvDcp::getTypeName(input);text(type.pData);text(input.pData);auto purpose=cppu::EnvDcp::getPurpose(input);text(type.pData);text(purpose.pData);text(input.pData);emit({type.pData==input.pData,purpose.pData==input.pData,type.pData==purpose.pData});}text(input.pData);}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="functions")functions(false);else if(mode=="aliases")functions(true);else if(mode=="wrappers")wrappers();else return 2;emit({90});}
`;
writeFileSync(`${target}/driver.cpp`, caller);
/** Records all complete original includes from the real compiler dependency file. @param path - Native dependency file. @returns Nothing. */
function dependencies(path) {
  for (const file of readFileSync(path, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(native.sources, originalDependency(file));
}
/** Builds the full original descriptor source and genuine dependency owners. @param sanitized - Matching native instrumentation. @returns Original executable. */
function build(sanitized) {
  const label = sanitized ? "asan" : "normal",
    objects = native.libraries(sanitized),
    flags = [
      ...native.flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
    ],
    object = `${target}/${label}-EnvDcp.o`,
    dependency = object + ".d",
    binary = `${target}/${label}-caller`;
  native.run(
    "clang++",
    [
      ...flags,
      "-DCPPU_DLLIMPLEMENTATION",
      "-MMD",
      "-MF",
      dependency,
      "-c",
      `${upstream}/cppu/source/uno/EnvDcp.cxx`,
      "-o",
      object,
    ],
    label + "-complete-EnvDcp",
  );
  dependencies(dependency);
  objects.push(object);
  native.run(
    "clang++",
    [
      ...flags,
      "-MMD",
      "-MF",
      `${target}/${label}-caller.d`,
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
  dependencies(`${target}/${label}-caller.d`);
  return binary;
}
/** Captures the whole native initialized stream with terminal status/diagnostics. @param binary - Original executable. @param mode - Complete caller mode. @returns Actual terminal output. */
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
for (const mode of ["functions", "aliases", "wrappers"]) {
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
    throw Error("Original EnvDcp " + mode + " failed");
  captures[mode] = {
    byteLength: a.stdout.length,
    digest: hash(a.stdout),
    gzipBase64: gzipSync(a.stdout).toString("base64"),
  };
}
const result = {
  pin,
  driverHash: hash(caller),
  inputs,
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Hashes each whole original source blob. @param entry - Original pair. @returns Complete provenance. */ ([
        p,
        v,
      ]) => [p, hash(v)],
    ),
  ),
  generatedHashes: native.manifest.generatedHashes,
  configurations: native.manifest.configurations,
  captures,
  scope:
    "Complete original EnvDcp.cxx and published C/C++ header wrappers over whole genuine SAL/typelib dependency units. Explicit initialized UTF16 descriptors, empty/delimiter/NUL/Unicode/surrogate inputs, old-output replacement, retained source aliases and actual OUString result fields/lifetimes. No string/environment/mapping/interface/type/default provider or extracted original body. Normal-ASan/UBSan whole streams; physical ABI/system runtime/leaks/native thread/shutdown/full environment/mapping/exception consumers and upstream QA unverified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), result))
  throw Error("Changed complete original EnvDcp observations");
console.log(
  "Original environment descriptor observations " +
    (write ? "written" : "verified") +
    ": " +
    Object.keys(native.sources).length +
    " complete sources; " +
    Object.entries(captures)
      .map(
        /** Reports whole stream lengths only. @param entry - Complete mode. @returns Bounded summary. */ ([
          mode,
          v,
        ]) => mode + "=" + v.byteLength,
      )
      .join(", "),
);
