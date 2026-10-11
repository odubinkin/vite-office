/** @fileoverview Captures complete original generated weak/service interface type owners over genuine shared libraries and complete pinned cppumaker headers. */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { unoNativeValueCaller } from "./uno-native-value-caller.mjs";
import { prepareCaseNative } from "./casefolding-native-build.mjs";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";

const write = process.argv.length === 3 && process.argv[2] === "--write";
const check = process.argv.length === 3 && process.argv[2] === "--check";
if (!write && !check) throw new Error("Use exactly --write or --check");
const target = "output/playwright/cppu-generated-interface-native";
const fixture = "apps/office/src/cppu/inc/com/sun/star/uno/native-generated-interface-cases.json";
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
  "lang/XServiceInfo",
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
const driver = String.raw`${unoNativeValueCaller}

#include <com/sun/star/uno/XWeak.hpp>
#include <com/sun/star/uno/XAdapter.hpp>
#include <com/sun/star/uno/XReference.hpp>
#include <com/sun/star/uno/XAggregation.hpp>
#include <com/sun/star/lang/XServiceInfo.hpp>
#include <com/sun/star/uno/Any.hxx>
#include <com/sun/star/uno/Sequence.hxx>
#include <string>
using InterfaceTD=typelib_InterfaceTypeDescription;using Mtd=typelib_InterfaceMethodTypeDescription;using T=css::uno::Type;
template<typename X>T const& access(int kind){switch(kind){case 0:return cppu::UnoType<X>::get();case 1:return X::static_type();case 2:return getCppuType(static_cast<css::uno::Reference<X>const*>(nullptr));case 3:return cppu::UnoType<css::uno::Reference<X>>::get();default:return cppu_detail_getUnoType(static_cast<X const*>(nullptr));}}
T const& get(int index,int kind){switch(index){case 0:return access<css::uno::XWeak>(kind);case 1:return access<css::uno::XAdapter>(kind);case 2:return access<css::uno::XReference>(kind);case 3:return access<css::uno::XAggregation>(kind);default:return access<css::lang::XServiceInfo>(kind);}}
void iface(InterfaceTD*i){desc(&i->aBase);emit({i->nMembers,i->nAllMembers,i->nBaseTypes,i->ppBaseTypes==nullptr,i->pBaseTypeDescription==nullptr,i->ppMembers==nullptr,i->ppAllMembers==nullptr});emit({static_cast<sal_Int32>(i->aUik.m_Data1),i->aUik.m_Data2,i->aUik.m_Data3,static_cast<sal_Int32>(i->aUik.m_Data4),static_cast<sal_Int32>(i->aUik.m_Data5)});if(i->nBaseTypes)emit({i->pBaseTypeDescription==i->ppBaseTypes[0]});for(int k=0;k<i->nBaseTypes;++k)desc(&i->ppBaseTypes[k]->aBase);for(int k=0;k<i->nMembers;++k){emit({i->ppMembers[k]==i->ppAllMembers[i->nAllMembers-i->nMembers+k]});ref(i->ppMembers[k]);}for(int k=0;k<i->nAllMembers;++k)ref(i->ppAllMembers[k]);if(i->aBase.bComplete){emit({i->pMapMemberIndexToFunctionIndex==nullptr,i->nMapFunctionIndexToMemberIndex,i->pMapFunctionIndexToMemberIndex==nullptr});for(int k=0;k<i->nAllMembers;++k)emit({i->pMapMemberIndexToFunctionIndex[k]});for(int k=0;k<i->nMapFunctionIndexToMemberIndex;++k)emit({i->pMapFunctionIndexToMemberIndex[k]});}}
void method(Mtd*m,InterfaceTD*owner){desc(&m->aBase.aBase);emit({m->aBase.nPosition});text(m->aBase.pMemberName);ref(m->pReturnTypeRef);emit({m->nParams,m->pParams==nullptr,m->nExceptions,m->ppExceptions==nullptr,m->bOneWay,m->pInterface==owner,m->pBaseRef==nullptr,m->nIndex});desc(&m->pInterface->aBase);ref(m->pBaseRef);for(int k=0;k<m->nParams;++k){text(m->pParams[k].pName);ref(m->pParams[k].pTypeRef);emit({m->pParams[k].bIn,m->pParams[k].bOut});}for(int k=0;k<m->nExceptions;++k)ref(m->ppExceptions[k]);}
void observe(T const&t){ref(t.getTypeLibType());emit({static_cast<sal_Int32>(t.getTypeClass())});{auto n=t.getTypeName();text(n.pData);}D*d=nullptr;t.getDescription(&d);iface(reinterpret_cast<InterfaceTD*>(d));auto*i=reinterpret_cast<InterfaceTD*>(d);for(int k=0;k<i->nAllMembers;++k){emit({k});D*m=nullptr;typelib_typedescriptionreference_getDescription(&m,i->ppAllMembers[k]);emit({m==nullptr});if(m){method(reinterpret_cast<Mtd*>(m),i);typelib_typedescription_release(m);}ref(i->ppAllMembers[k]);}emit({typelib_typedescription_complete(&d)});iface(reinterpret_cast<InterfaceTD*>(d));typelib_typedescription_release(d);ref(t.getTypeLibType());{T copy(t);emit({copy==t,copy!=t,&copy==&t});ref(copy.getTypeLibType());}ref(t.getTypeLibType());{void*p=nullptr;css::uno::Any a(&p,t);anyValue(&a);emit({a.hasValue(),static_cast<sal_Int32>(a.getValueTypeClass())});}ref(t.getTypeLibType());}
void run(std::vector<int>const&order){for(int index:order){emit({7,index});auto const&t=get(index,0);observe(t);for(int kind=1;kind<5;++kind){auto const&v=get(index,kind);emit({kind,&v==&t,v.getTypeLibType()==t.getTypeLibType()});ref(v.getTypeLibType());}}for(int index:order){emit({8,index});observe(get(index,0));}}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];if(mode=="forward")run({0,1,2,3,4});else if(mode=="reverse")run({4,3,2,1,0});else if(mode.size()==5&&mode.substr(0,4)=="cold"&&mode[4]>='0'&&mode[4]<='4')run({mode[4]-'0'});else return 2;return 0;}
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
for (const mode of ["cold0", "cold1", "cold2", "cold3", "cold4", "forward", "reverse"]) {
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
    "Complete original normal comprehensive cppumaker XWeak/XAdapter/XReference/XAggregation/XServiceInfo ADL/static/deprecated metadata, real typelib registration/initialized interface/base/member/parameter/exception/count/value/alias ownership and cold/hot/order; no virtual implementation/provider substitution. Complete unchanged72original translation units with full normal-ASan/UBSan initialized observations; standard SDK/physical binary/native threading/resources and complete consumer QA unverified.",
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(result, null, 2) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw Error("Changed complete original generated interface observations");
console.log(
  `Original generated interface observations ${write ? "written" : "verified"}: ${Object.keys(native.sources).length} complete sources, ${Object.keys(result.generatedHashes).length} genuine generated files, ` +
    Object.entries(captures)
      .map(
        /** Reports complete bytes. @param entry - Mode pair. @returns Byte total. */ ([
          name,
          value,
        ]) => `${name}=${value.byteLength}`,
      )
      .join(", "),
);
