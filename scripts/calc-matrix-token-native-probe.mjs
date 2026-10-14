/** @fileoverview Normal-only original matrix result token scopes over genuine formula headers and verified real matrix constructors; no runtime memory manager. */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import { verifyMddsSources } from "./mdds-native-source.mjs";
import { gzipSync } from "node:zlib";
import { format, resolveConfig } from "prettier";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, scope, upstream, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";

const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-token-native";
const fixture = "apps/office/src/sc/source/core/tool/native-matrix-token-cases.json";
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
for (const path of ["sc/inc/token.hxx", "sc/source/core/tool/token.cxx", "sc/inc/scdllapi.h"])
  loadUnicodeOriginal(native.sources, path);
const matrixClass = scope(
  native.sources["sc/inc/token.hxx"],
  "class SAL_DLLPUBLIC_RTTI ScMatrixToken",
  "/**\n * Token storing matrix",
);
const resultClasses = scope(
  native.sources["sc/inc/token.hxx"],
  "class ScMatrixCellResultToken",
  "class ScHybridCellToken final",
);
const matrixDefinitions = scope(
  native.sources["sc/source/core/tool/token.cxx"],
  "ScMatrixToken::ScMatrixToken(",
  "ScMatrixRangeToken::ScMatrixRangeToken(",
);
const resultDefinitions = scope(
  native.sources["sc/source/core/tool/token.cxx"],
  "ScMatrixCellResultToken::ScMatrixCellResultToken(",
  "ScHybridCellToken::ScHybridCellToken(",
);
const matrixFixture = JSON.parse(
  readFileSync("apps/office/src/sc/source/core/tool/native-matrix-facade-cases.json", "utf8"),
);
const matrixManifest = JSON.parse(
  readFileSync("output/playwright/calc-matrix-facade-native/manifest.json", "utf8"),
);
const matrixDriver = readFileSync("output/playwright/calc-matrix-facade-native/driver.cpp", "utf8");
if (
  hash(matrixDriver) !== matrixFixture.callerHash ||
  hash(JSON.stringify(matrixManifest.sourceHashes)) !== matrixFixture.sourceDigest
)
  throw Error("Matrix source context differs from verified original fixture");
for (const [path, expected] of Object.entries(matrixManifest.sourceHashes)) {
  loadUnicodeOriginal(native.sources, path);
  if (hash(native.sources[path]) !== expected) throw Error("Changed original matrix input " + path);
}
const mdds = verifyMddsSources();
if (!isDeepStrictEqual(mdds.archiveHashes, matrixFixture.mddsArchiveHashes))
  throw Error("Changed mdds archives");
for (const [path, expected] of Object.entries(matrixFixture.mddsSourceHashes))
  if (hash(readFileSync(mdds.reference + "/include/mdds/" + path)) !== expected)
    throw Error("Changed mdds header " + path);
let matrixPrefix = matrixDriver.slice(0, matrixDriver.indexOf("void observe("));
if (!matrixPrefix) throw Error("Missing original matrix prefix");
matrixPrefix = matrixPrefix.replace(
  "static bool IsSizeAllocatable(SCSIZE,SCSIZE);",
  "void IncRef() const;void DecRef() const;static bool IsSizeAllocatable(SCSIZE,SCSIZE);",
);
const matrixHeader = native.sources["sc/inc/scmatrix.hxx"],
  matrixSource = native.sources["sc/source/core/tool/scmatrix.cxx"];
const matrixRefDefinitions =
  scope(matrixSource, "void ScMatrix::IncRef() const", "bool ScMatrix::IsSizeAllocatable(") +
  scope(matrixHeader, "inline void intrusive_ptr_add_ref", "/* vim:");
const typeAliases = scope(
  native.sources["sc/inc/types.hxx"],
  "typedef sal_Int32 SCROW;",
  "namespace formula { class FormulaToken; }",
);
const caller = String.raw`
#include <osl/diagnose.h>
#include <scdllapi.h>
#include <formula/token.hxx>
#include <formula/FormulaCompiler.hxx>
#include <iostream>
#include <string>
#include <limits>
#include <bit>
namespace formula {
${definitions}
${scalarDefinitions}
${jumpDefinition}
}
using namespace formula;
${matrixPrefix}
${matrixRefDefinitions}
${typeAliases}
${matrixClass}
${resultClasses}
${matrixDefinitions}
${resultDefinitions}
void state(const char*label,const ScMatrixCellResultToken&v,const ScMatrix*a,const ScMatrix*b,const FormulaToken*expected=nullptr){auto m=v.GetMatrix();std::cout<<label<<" "<<int(v.GetType())<<" "<<int(v.GetOpCode())<<" "<<(m==nullptr?0:m==a?1:m==b?2:3);if(m){size_t c,r;m->GetDimensions(c,r);std::cout<<" "<<c<<" "<<r;}auto ul=v.GetUpperLeftToken().get();std::cout<<" | "<<int(v.GetUpperLeftType())<<" "<<(ul==expected);if(ul&&ul->GetType()==svDouble)std::cout<<" "<<std::bit_cast<uint64_t>(static_cast<const FormulaDoubleToken*>(ul)->GetDouble());if(auto f=dynamic_cast<const ScMatrixFormulaCellToken*>(&v)){SCCOL c=99;SCROW r=99;f->GetMatColsRows(c,r);std::cout<<" | "<<f->GetMatCols()<<" "<<f->GetMatRows()<<" "<<c<<" "<<r;}std::cout<<"\n";}
int main(){ScMatrixRef a(new ScMatrix(2,3,2.5)),b(new ScMatrix(1,1,4.5));FormulaTokenRef number(new FormulaDoubleToken(2.5)), string(new FormulaStringToken(svl::SharedString(OUString(u"A",1)))), unknown(new FormulaUnknownToken(ocBad)), error(new FormulaErrorToken(FormulaError::DivisionByZero));
 for(auto m:{ScMatrixRef(),a,b}){ScMatrixToken t(m),copy(t);FormulaTokenRef clone(t.Clone());std::cout<<"matrix "<<int(t.GetType())<<" "<<int(t.GetOpCode())<<" "<<(t.GetMatrix()==m.get())<<" "<<copy.operator==(t)<<" "<<t.operator==(*clone)<<" "<<t.IsMatrixRangeToken()<<" "<<t.operator==(*number)<<"\n";}
 ScMatrixToken at(a),bt(b),nt(nullptr);std::cout<<"matrix_distinct "<<(at==bt)<<" "<<(at==nt)<<"\n";
 for(auto m:{ScConstMatrixRef(),ScConstMatrixRef(a),ScConstMatrixRef(b)})for(auto ul:{FormulaConstTokenRef(),FormulaConstTokenRef(number),FormulaConstTokenRef(string),FormulaConstTokenRef(unknown),FormulaConstTokenRef(error)}){ScMatrixCellResultToken v(m,ul.get()),copy(v);FormulaTokenRef clone(v.Clone());state("result",v,a.get(),b.get(),ul.get());state("resultcopy",copy,a.get(),b.get(),ul.get());state("resultclone",static_cast<const ScMatrixCellResultToken&>(*clone),a.get(),b.get(),ul.get());ScMatrixCellResultToken diff(m,ul?nullptr:number.get()),diffmat(m?nullptr:a,nullptr);std::cout<<"result_equal "<<(v==copy)<<" "<<v.operator==(*clone)<<" "<<(v==diff)<<" "<<(v==diffmat)<<" "<<v.operator==(*number)<<"\n";copy.Assign(copy);state("resultself",copy,a.get(),b.get(),ul.get());copy.Assign(diff);state("resultassigned",copy,a.get(),b.get(),diff.GetUpperLeftToken().get());}
 for(auto ul:{FormulaConstTokenRef(),FormulaConstTokenRef(number),FormulaConstTokenRef(string),FormulaConstTokenRef(unknown),FormulaConstTokenRef(error)}){ScMatrixFormulaCellToken v(2,3,a,ul.get()),copy(v);FormulaTokenRef clone(v.Clone());state("formula",v,a.get(),b.get(),ul.get());state("formulacopy",copy,a.get(),b.get(),v.GetUpperLeftToken().get());state("formulaclone",static_cast<const ScMatrixFormulaCellToken&>(*clone),a.get(),b.get(),v.GetUpperLeftToken().get());std::cout<<"formula_equal "<<(v==copy)<<" "<<v.operator==(*clone)<<" "<<v.operator==(*number);ScMatrixCellResultToken base(a,ul.get());std::cout<<" "<<v.operator==(base);ScMatrixFormulaCellToken dimension(copy);dimension.SetMatColsRows(3,3);std::cout<<" "<<copy.operator==(dimension);dimension.SetMatColsRows(2,4);std::cout<<" "<<copy.operator==(dimension)<<"\n";v.SetUpperLeftDouble(4.5);state("formula_changed",v,a.get(),b.get(),ul.get());state("copy_retained",copy,a.get(),b.get(),ul.get());v.ResetResult();state("reset",v,a.get(),b.get());v.SetUpperLeftDouble(-0.0);state("reset_double",v,a.get(),b.get());}
 ScMatrixCellResultToken numeric(a,number.get());ScMatrixFormulaCellToken typed(7,8),generic(7,8);typed.Assign(numeric);generic.Assign(static_cast<const FormulaToken&>(numeric));state("typed",typed,a.get(),b.get(),number.get());state("generic",generic,a.get(),b.get(),number.get());generic.SetUpperLeftDouble(9.5);state("typed_after_alias",typed,a.get(),b.get(),number.get());state("source_after_alias",numeric,a.get(),b.get(),number.get());auto old=typed.GetUpperLeftToken();typed.Assign(static_cast<const ScMatrixCellResultToken&>(typed));state("typed_self",typed,a.get(),b.get(),old.get());old=generic.GetUpperLeftToken();generic.Assign(static_cast<const FormulaToken&>(generic));state("generic_self",generic,a.get(),b.get(),old.get());static_cast<ScMatrixCellResultToken&>(typed).Assign(numeric);state("basequalified",typed,a.get(),b.get(),number.get());
 generic.Assign(static_cast<const FormulaToken&>(at));state("assign_matrix",generic,a.get(),b.get());generic.Assign(static_cast<const FormulaToken&>(*string));state("assign_string",generic,a.get(),b.get(),string.get());generic.Assign(static_cast<const FormulaToken&>(*number));state("assign_number",generic,a.get(),b.get(),number.get());generic.Assign(static_cast<const FormulaToken&>(*unknown));state("assign_unknown",generic,a.get(),b.get(),unknown.get());
 for(int64_t c:{-65537LL,-32769LL,-1LL,0LL,1LL,32767LL,32768LL,65536LL})for(int64_t r:{-2147483649LL,-1LL,0LL,1LL,2147483647LL,2147483648LL}){ScMatrixFormulaCellToken v(static_cast<SCCOL>(c),static_cast<SCROW>(r));state("dimension",v,a.get(),b.get());v.SetMatColsRows(static_cast<SCCOL>(c+1),static_cast<SCROW>(r+1));state("setdimension",v,a.get(),b.get());}
 for(double n:{0.0,-0.0,2.5,std::numeric_limits<double>::infinity(),CreateDoubleError(FormulaError::MatrixSize)}){FormulaTokenRef source(new FormulaDoubleToken(n));ScMatrixFormulaCellToken v(2,3,a,source.get());state("payload",v,a.get(),b.get(),source.get());v.SetUpperLeftDouble(n);state("payloadset",v,a.get(),b.get(),source.get());}
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-DNDEBUG",
  "-I" + target + "/generated",
  "-I" + boostRoot,
  "-I" + mdds.reference + "/include",
  "-I" + upstream + "/sc/inc",
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
    "-I" + boostRoot,
    "-I" + mdds.reference + "/include",
    "-I" + upstream + "/sc/inc",
    "-I" + upstream + "/include",
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
for (const mode of ["results"]) {
  const bytes = native.run(binary, [], mode).stdout;
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
  mddsArchiveHashes: mdds.archiveHashes,
  mddsSourceHashes: matrixFixture.mddsSourceHashes,
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
    matrixClass: hash(matrixClass),
    resultClasses: hash(resultClasses),
    matrixDefinitions: hash(matrixDefinitions),
    resultDefinitions: hash(resultDefinitions),
    matrixPrefix: hash(matrixPrefix),
    matrixRefDefinitions: hash(matrixRefDefinitions),
    typeAliases: hash(typeAliases),
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
