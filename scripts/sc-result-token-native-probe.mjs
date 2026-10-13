/** @fileoverview Normal-only original Calc empty/hybrid class scopes over complete genuine formula headers and shared string owners; full Calc token header/matrix graph is not claimed. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { gzipSync } from "node:zlib";
import { format, resolveConfig } from "prettier";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, scope, upstream, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";

const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
const target = "output/playwright/sc-result-token-native";
const fixture = "apps/office/src/sc/source/core/tool/native-result-token-cases.json";
const boostRoot = "output/playwright/mdds-native/boost_1_91_0";
const archive = "output/playwright/mdds-native/boost_1_91_0.tar.xz";
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const path of [
  "download.lst",
  "include/formula/token.hxx",
  "include/formula/types.hxx",
  "include/formula/FormulaCompiler.hxx",
  "formula/source/core/api/token.cxx",
  "formula/source/core/api/FormulaCompiler.cxx",
  "offapi/com/sun/star/sheet/FormulaLanguage.idl",
])
  loadUnicodeOriginal(native.sources, path);
const archiveHash = hash(readFileSync(archive));
if (native.sources["download.lst"].match(/BOOST_SHA256SUM\s*:=\s*(\w+)/u)?.[1] !== archiveHash)
  throw Error("Boost archive differs from original download.lst");
const idl = target + "/idl/com/sun/star/sheet/FormulaLanguage.idl";
mkdirSync(idl.slice(0, idl.lastIndexOf("/")), { recursive: true });
writeFileSync(idl, native.sources["offapi/com/sun/star/sheet/FormulaLanguage.idl"]);
native.run(
  "output/playwright/task39-native-types/cppumaker",
  [
    "-nD",
    "-T",
    "com.sun.star.sheet.FormulaLanguage",
    "-O",
    resolve(target + "/generated"),
    pathToFileURL(resolve(target + "/idl")).href,
  ],
  "original-language-generation",
);
for (const extension of ["hdl", "hpp"]) {
  const file = target + "/generated/com/sun/star/sheet/FormulaLanguage." + extension;
  native.manifest.generatedHashes[file] = hash(readFileSync(file));
}
const definitions = scope(
  native.sources["formula/source/core/api/token.cxx"],
  "FormulaToken::FormulaToken(",
  "bool FormulaTokenArray::AddFormulaToken(",
);
const scalarDefinitions = scope(
  native.sources["formula/source/core/api/token.cxx"],
  "sal_Int16 FormulaDoubleToken::GetDoubleType()",
  "} // formula",
);
const jumpDefinition = scope(
  native.sources["formula/source/core/api/FormulaCompiler.cxx"],
  "bool FormulaCompiler::IsOpCodeJumpCommand(",
  "// Remove quotes, escaped quotes are unescaped.",
);
for (const path of ["sc/inc/token.hxx", "sc/source/core/tool/token.cxx"])
  loadUnicodeOriginal(native.sources, path);
const emptyClass = scope(
  native.sources["sc/inc/token.hxx"],
  "class ScEmptyCellToken final",
  "/**  Transports the result from the interpreter",
);
const hybridClass = scope(
  native.sources["sc/inc/token.hxx"],
  "class ScHybridCellToken final",
  "// Simplify argument passing",
);
const emptyDefinition = scope(
  native.sources["sc/source/core/tool/token.cxx"],
  "bool ScEmptyCellToken::operator==",
  "ScMatrixCellResultToken::ScMatrixCellResultToken",
);
const hybridDefinitions = scope(
  native.sources["sc/source/core/tool/token.cxx"],
  "ScHybridCellToken::ScHybridCellToken(",
  "bool ScTokenArray::AddFormulaToken(",
);
const caller = String.raw`
#include <formula/token.hxx>
#include <formula/FormulaCompiler.hxx>
#include <iostream>
#include <string>
#include <limits>
#include <bit>
#include <iomanip>
namespace formula {
${definitions}
${scalarDefinitions}
${jumpDefinition}
}
${emptyClass}
${hybridClass}
using namespace formula;
${emptyDefinition}
${hybridDefinitions}
void base(const FormulaToken&t){std::cout<<unsigned(t.GetType())<<" "<<unsigned(t.GetOpCode())<<" "<<t.GetRef()<<" "<<unsigned(t.GetRefCntPolicy());}
void text(const OUString&s){std::cout<<" "<<s.getLength();for(int i=0;i<s.getLength();++i)std::cout<<" "<<unsigned(s[i]);}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];
 if(mode=="empty"){
  for(bool inherited:{false,true})for(bool displayed:{false,true}){
   ScEmptyCellToken a(inherited,displayed);a.IncRef();a.SetRefCntPolicy(RefCntPolicy::UnsafeRef);
   auto*c=static_cast<ScEmptyCellToken*>(a.Clone());base(a);std::cout<<" | ";base(*c);std::cout<<" "<<c->IsInherited()<<" "<<c->IsDisplayedAsString();
   for(bool ri:{false,true})for(bool rd:{false,true}){ScEmptyCellToken b(ri,rd);std::cout<<" "<<(a==b)<<" "<<a.TextEqual(b);}
   FormulaDoubleToken other(0);std::cout<<" "<<a.operator==(static_cast<const FormulaToken&>(other))<<"\n";delete c;
  }
 }else if(mode=="hybrid"){
  OUString x(u"A\0B",3),y(u"a\0b",3),formula(u"=A1",3);
  for(int pattern=0;pattern<5;++pattern)for(bool moved:{false,true})for(bool flag:{false,true}){
   std::cout<<"case "<<pattern<<" "<<moved<<" "<<flag<<"\n";
   {svl::SharedString s(pattern==1||pattern==3||pattern==4?x.pData:nullptr,pattern==2||pattern==3?y.pData:pattern==4?x.pData:nullptr);OUString input(formula);
    auto*t=moved?new ScHybridCellToken(0,s,std::move(input),flag):new ScHybridCellToken(0,s,input,flag);
    auto data=[&](const char*label,const ScHybridCellToken&t){std::cout<<label<<" ";base(t);std::cout<<" "<<t.GetDouble()<<" "<<t.IsEmptyDisplayedAsString()<<" "<<(t.GetString().getData()==nullptr?-1:t.GetString().getData()==x.pData?1:2)<<" "<<(t.GetString().getDataIgnoreCase()==nullptr?-1:t.GetString().getDataIgnoreCase()==x.pData?1:2)<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<" "<<formula.pData->refCount;text(t.GetFormula());std::cout<<"\n";};
    data("token",*t);std::cout<<"source";text(input);std::cout<<"\n";
    t->IncRef();t->SetRefCntPolicy(RefCntPolicy::UnsafeRef);auto*c=static_cast<ScHybridCellToken*>(t->Clone());data("clone",*c);std::cout<<"equal "<<(*t==*c)<<" "<<t->TextEqual(*c)<<"\n";
    {ScHybridCellToken opposite(0,s,formula,!flag);std::cout<<"flag_equal "<<(*t==opposite)<<"\n";}
    delete c;data("clone_end",*t);t->DecRef();std::cout<<"token_end "<<x.pData->refCount<<" "<<y.pData->refCount<<" "<<formula.pData->refCount<<"\n";
   }std::cout<<"source_end "<<x.pData->refCount<<" "<<y.pData->refCount<<" "<<formula.pData->refCount<<"\n";
  }
 }else if(mode=="equality"){
  OUString fa(u"=A1",3),fb(u"=A2",3),a(u"A",1),b(u"B",1);svl::SharedString sa(a),sb(b);
  for(double v:{0.0,-0.0,2.5,-2.5,std::numeric_limits<double>::denorm_min(),std::numeric_limits<double>::max(),std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity(),CreateDoubleError(FormulaError::DivisionByZero)}){
   ScHybridCellToken t(v,sa,fa,false);auto*c=static_cast<ScHybridCellToken*>(t.Clone());
   ScHybridCellToken number(1,sa,fa,false),string(v,sb,fa,false),formula(v,sa,fb,false);FormulaDoubleToken other(v);
   std::cout<<std::hex<<std::setw(16)<<std::setfill('0')<<std::bit_cast<std::uint64_t>(c->GetDouble())<<std::dec<<" "<<(t==*c)<<" "<<(t==number)<<" "<<(t==string)<<" "<<(t==formula)<<" "<<t.operator==(static_cast<const FormulaToken&>(other))<<"\n";delete c;
  }
 }else return 3;
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-DNDEBUG",
  "-I" + target + "/generated",
  "-I" + boostRoot,
  "-I" + upstream + "/include",
  upstream + "/svl/source/misc/sharedstring.cxx",
]);
// A compiler invocation containing two translation units overwrites -MF with the last unit.
// Record the complete actual token caller separately rather than mistaking the SharedString dependency list for it.
const link = native.manifest.commands.find(
  /** Selects the actual native caller compiler. @param command - Recorded command. @returns Matching compiler predicate. */ (
    command,
  ) => command.tool === "clang++",
);
if (!link) throw Error("Missing original compiler invocation");
native.run(
  link.tool,
  [
    ...link.argv.slice(0, link.argv.indexOf("-MMD")),
    "-DNDEBUG",
    "-I" + target + "/generated",
    "-MMD",
    "-MF",
    target + "/token.d",
    "-c",
    target + "/driver.cpp",
    "-o",
    target + "/token.o",
  ],
  "whole-token-header-dependencies",
);
const allDependencies = readFileSync(target + "/token.d", "utf8")
  .replaceAll("\\\n", " ")
  .split(/\s+/u)
  .slice(1)
  .filter(Boolean);
for (const path of allDependencies)
  if (path.startsWith(upstream + "/"))
    loadUnicodeOriginal(native.sources, path.slice(upstream.length + 1));
const dependencies = allDependencies.filter(
  /** Selects actual Boost dependencies. @param path - Compiler dependency. @returns Boost input predicate. */ (
    path,
  ) => path.startsWith(boostRoot + "/"),
);
if (
  !dependencies.some(
    /** Requires the real intrusive pointer header. @param path - Boost dependency. @returns Header predicate. */ (
      path,
    ) => path.endsWith("/smart_ptr/intrusive_ptr.hpp"),
  )
)
  throw Error("Actual Boost intrusive pointer dependency is missing");
const archiveFiles = [...new Set(dependencies)].map(
  /** Restores the verified archive member path. @param path - Actual cached header. @returns Original archive member. */ (
    path,
  ) => path.slice("output/playwright/mdds-native/".length),
);
const extracted = target + "/archive";
mkdirSync(extracted, { recursive: true });
execFileSync("tar", ["-xf", archive, "-C", extracted, ...archiveFiles]);
const boostHashes = {};
for (const file of archiveFiles) {
  const original = readFileSync(extracted + "/" + file);
  if (!original.equals(readFileSync("output/playwright/mdds-native/" + file)))
    throw Error("Changed Boost dependency " + file);
  boostHashes[file] = hash(original);
}
const captures = {};
for (const mode of ["empty", "hybrid", "equality"]) {
  const bytes = native.run(binary, [mode], mode).stdout;
  captures[mode] = {
    gzipBase64: gzipSync(bytes).toString("base64"),
    byteLength: bytes.length,
    sha256: hash(bytes),
  };
}
const data = {
  pin,
  normalOnly: true,
  driverHash: hash(caller),
  archiveHash,
  boostHashes,
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Records complete original source identities. @param entry - Original path and bytes. @returns Whole source hash entry. */ ([
        path,
        bytes,
      ]) => [path, hash(bytes)],
    ),
  ),
  scopes: {
    definitions: hash(definitions),
    scalarDefinitions: hash(scalarDefinitions),
    jumpDefinition: hash(jumpDefinition),
    emptyClass: hash(emptyClass),
    hybridClass: hash(hybridClass),
    emptyDefinition: hash(emptyDefinition),
    hybridDefinitions: hash(hybridDefinitions),
  },
  captures,
};
native.manifest.tokenScopes = data.scopes;
native.manifest.boostArchiveHash = archiveHash;
native.manifest.boostHashes = boostHashes;
native.save();
if (write)
  writeFileSync(
    fixture,
    await format(JSON.stringify(data), { ...(await resolveConfig(fixture)), parser: "json" }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Original whole token streams changed");
native.manifest.state = "captured";
native.manifest.driverHash = data.driverHash;
native.manifest.captures = Object.fromEntries(
  Object.entries(captures).map(
    /** Records terminal whole-output identities without payload duplication. @param entry - Complete native capture. @returns Length and digest pair. */ ([
      mode,
      capture,
    ]) => [mode, { byteLength: capture.byteLength, sha256: capture.sha256 }],
  ),
);
native.save();
console.log(
  JSON.stringify({
    normalOnly: true,
    sourceFiles: Object.keys(data.sourceHashes).length,
    boostFiles: Object.keys(boostHashes).length,
    captures: Object.fromEntries(
      Object.entries(captures).map(
        /** Reports complete capture metadata without its payload. @param entry - Original capture. @returns Length and digest entry. */ ([
          mode,
          capture,
        ]) => [mode, { bytes: capture.byteLength, sha256: capture.sha256 }],
      ),
    ),
  }),
);
