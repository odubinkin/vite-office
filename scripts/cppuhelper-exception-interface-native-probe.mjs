/** @fileoverview Captures complete original generated XExceptionThrower interface type owner over genuine shared libraries and complete pinned cppumaker headers. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import {
  unoNativeInterfaceTypes,
  unoNativeInterfaceCaller,
} from "./uno-native-interface-caller.mjs";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/cppuhelper-exception-interface-native";
const fixture = "apps/office/src/cppuhelper/inc/detail/native-exception-interface-cases.json";
const native = prepareCaseNative(target);
for (const path of [
  "cppu/source/typelib/typelib.cxx",
  "include/typelib/typedescription.h",
  "sal/rtl/ustring.cxx",
  "include/rtl/ustring.hxx",
  "include/o3tl/string_view.hxx",
])
  loadUnicodeOriginal(native.sources, path);
for (const relative of [
  "com/sun/star/uno/Exception.idl",
  "com/sun/star/uno/RuntimeException.idl",
  "com/sun/star/uno/XInterface.idl",
  "com/sun/star/uno/TypeClass.idl",
  "cppuhelper/detail/XExceptionThrower.idl",
]) {
  const destination = `${target}/idl/${relative}`;
  mkdirSync(destination.slice(0, destination.lastIndexOf("/")), { recursive: true });
  writeFileSync(
    destination,
    loadUnicodeOriginal(
      native.sources,
      relative.startsWith("cppuhelper/") ? "cppuhelper/unotypes/" + relative : "udkapi/" + relative,
    ),
  );
}
native.run(
  "output/playwright/task39-native-types/cppumaker",
  [
    "-C",
    "-nD",
    "-T",
    "cppuhelper.detail.XExceptionThrower",
    "-O",
    resolve(`${target}/generated`),
    pathToFileURL(resolve(`${target}/idl`)).href,
  ],
  "original-exception-interface-generation",
);
for (const extension of ["hdl", "hpp"]) {
  const p = `${target}/generated/cppuhelper/detail/XExceptionThrower.${extension}`;
  native.manifest.generatedHashes[p] = hash(readFileSync(p));
}
const driver = String.raw`${unoNativeValueCaller}

#include <cppuhelper/detail/XExceptionThrower.hpp>
#include <com/sun/star/uno/RuntimeException.hpp>
#include <com/sun/star/uno/Exception.hpp>
#include <com/sun/star/uno/Any.hxx>
#include <com/sun/star/uno/Sequence.hxx>
#include <string>
${unoNativeInterfaceTypes}template<typename X>T const& access(int kind){switch(kind){case 0:return cppu::UnoType<X>::get();case 1:return X::static_type();case 2:return getCppuType(static_cast<css::uno::Reference<X>const*>(nullptr));case 3:return cppu::UnoType<css::uno::Reference<X>>::get();default:return cppu_detail_getUnoType(static_cast<X const*>(nullptr));}}
T const& get(int index,int kind){(void)index;return access<cppuhelper::detail::XExceptionThrower>(kind);}
${unoNativeInterfaceCaller}void run(std::vector<int>const&order){for(int index:order){emit({7,index});auto const&t=get(index,0);observe(t);for(int kind=1;kind<5;++kind){auto const&v=get(index,kind);emit({kind,&v==&t,v.getTypeLibType()==t.getTypeLibType()});ref(v.getTypeLibType());}}for(int index:order){emit({8,index});observe(get(index,0));}}
void pending(){rtl::OUString name=rtl::OUString::createFromAscii("cppuhelper.qa.Pending"),member=rtl::OUString::createFromAscii("cppuhelper.qa.Pending::later");InterfaceTD*pTD=nullptr;R*r=nullptr;typelib_typedescriptionreference_new(&r,typelib_TypeClass_INTERFACE_METHOD,member.pData);R*base=cppu::UnoType<css::uno::XInterface>::get().getTypeLibType();typelib_typedescription_newMIInterface(&pTD,name.pData,0,0,0,0,0,1,&base,1,&r);typelib_typedescription_register(reinterpret_cast<D**>(&pTD));typelib_typedescriptionreference_release(r);typelib_typedescription_release(&pTD->aBase);T type(css::uno::TypeClass_INTERFACE,name);observe(type);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="root"){observe(cppu::UnoType<css::uno::XInterface>::get());return 0;}else if(mode=="pending"){pending();return 0;}else if(mode=="runtime-first"){emit({90});ref(cppu::UnoType<css::uno::RuntimeException>::get().getTypeLibType());}else if(mode=="exception-first"){emit({91});ref(cppu::UnoType<css::uno::Exception>::get().getTypeLibType());}else if(mode!="cold")return 2;run({5});return 0;}
`;
const caller = driver;
writeFileSync(`${target}/driver.cpp`, caller);
/** Rebuilds all original owners and compiles this pure observation caller with matching instrumentation. @param sanitized - Full dependency sanitization. @returns Actual executable. */
function build(sanitized) {
  const objects = native.libraries(sanitized);
  for (const unit of ["any", "data", "sequence"]) {
    const relative =
      unit === "supportsservice"
        ? "cppuhelper/source/supportsservice.cxx"
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
for (const mode of ["cold", "runtime-first", "exception-first", "root", "pending"]) {
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
  captures,
  scope:
    "Complete original cppuhelper/detail/XExceptionThrower IDL and generated comprehensive interface owner; actual shared RuntimeException/Exception/Type/Any/Reference/OUString/typelib initialized metadata, fields, counts, inherited/own methods, parameters, declared exceptions, map completion, cold/runtime-first/exception-first order and all ADL/static/deprecated getters. Full unchanged native dependencies normal-ASan/UBSan with complete source/generated/config/caller hashes. No virtual exception/environment/mapping/default/type/library provider, source extraction or unresolved suppression. Physical ABI/native threading/resources/leaks/shutdown/full exception engine/consumer QA unverified; leak detection disabled.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw Error("Changed complete original exception interface observations");
console.log(
  `Original exception interface observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.keys(result.generatedHashes).length} genuine generated files, ` +
    Object.entries(captures)
      .map(
        /** Reports complete bytes. @param entry - Mode pair. @returns Byte total. */ ([
          name,
          value,
        ]) => `${name}=${value.byteLength}`,
      )
      .join(", "),
);
