/** @fileoverview Normal-only complete original ScFormulaResult over genuine token/matrix/value dependencies; value-state observations only, no JS memory manager. */
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
const target = "output/playwright/calc-formula-result-native";
const fixture = "apps/office/src/sc/source/core/tool/native-formula-result-cases.json";
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
for (const path of ["sc/inc/formularesult.hxx", "sc/source/core/tool/formularesult.cxx"])
  loadUnicodeOriginal(native.sources, path);
const tokenFixture = JSON.parse(
  readFileSync("apps/office/src/sc/source/core/tool/native-matrix-token-cases.json", "utf8"),
);
const tokenManifest = JSON.parse(
  readFileSync("output/playwright/calc-matrix-token-native/manifest.json", "utf8"),
);
const tokenDriver = readFileSync("output/playwright/calc-matrix-token-native/driver.cpp", "utf8");
if (hash(tokenDriver) !== tokenFixture.driverHash)
  throw Error("Changed verified original token context");
for (const [path, expected] of Object.entries(tokenManifest.sourceHashes)) {
  loadUnicodeOriginal(native.sources, path);
  if (hash(native.sources[path]) !== expected) throw Error("Changed token input " + path);
}
const tokenPrefix = tokenDriver.slice(0, tokenDriver.indexOf("void state("));
if (!tokenPrefix) throw Error("Missing complete original token prefix");
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
const resultHeader = scope(native.sources["sc/inc/formularesult.hxx"], "namespace sc {", "/* vim:");
const resultSource = scope(
  native.sources["sc/source/core/tool/formularesult.cxx"],
  "namespace sc {",
  "/* vim:",
);
const caller = String.raw`
${tokenPrefix}
${emptyClass}
${hybridClass}
${emptyDefinition}
${hybridDefinitions}
${resultHeader}
${resultSource}
std::vector<FormulaTokenRef> inputs;
ScMatrixRef ma,mb;
int tokenid(const FormulaToken*p){if(!p)return -1;for(size_t i=0;i<inputs.size();++i)if(inputs[i].get()==p)return int(i);return 999;}
void text(const OUString&s){std::cout<<s.getLength();for(int i=0;i<s.getLength();++i)std::cout<<","<<unsigned(s[i]);}
void string(const svl::SharedString&s){std::cout<<s.isValid()<<",";text(s.getString());}
void state(const char*label,ScFormulaResult&v){auto r=v.GetResult();auto m=v.GetMatrix();auto f=v.GetMatrixFormulaCellToken();std::cout<<label<<" "<<int(v.GetType())<<" "<<int(v.GetCellResultType())<<" "<<v.IsEmptyDisplayedAsString()<<" "<<v.IsValue()<<" "<<v.IsValueNoError()<<" "<<v.IsMultiline()<<" "<<int(v.GetResultError())<<" "<<std::bit_cast<uint64_t>(v.GetDouble())<<" "<<tokenid(v.GetToken().get())<<" "<<tokenid(v.GetCellResultToken().get())<<" "<<(m==nullptr?0:m.get()==ma.get()?1:m.get()==mb.get()?2:3)<<" | ";string(v.GetString());std::cout<<" | ";text(v.GetHybridFormula());std::cout<<" | ";if(f)std::cout<<f->GetMatCols()<<","<<f->GetMatRows()<<","<<int(f->GetUpperLeftType());else std::cout<<"-";std::cout<<" | "<<int(r.meType)<<","<<int(r.mnError)<<","<<std::bit_cast<uint64_t>(r.mfValue)<<","<<r.mbMultiLine<<",";string(r.maString);for(auto seed:{FormulaError::NONE,FormulaError::DivisionByZero}){auto err=seed;double value=-13.5;bool ok=v.GetErrorOrDouble(err,value);std::cout<<" | "<<ok<<","<<int(err)<<","<<std::bit_cast<uint64_t>(value);}std::cout<<"\n";}
int main(){ma=new ScMatrix(2,3,2.5);mb=new ScMatrix(1,1,4.5);OUString ta(u"A\0\u03a9",3),tl(u"A\nB",3),tr(u"A\rB",3),formula(u"=A1",3);svl::SharedString sa(ta),sl(tl),sr(tr),empty=svl::SharedString::getEmptyString();
 inputs.emplace_back(new FormulaDoubleToken(2.5));inputs.emplace_back(new FormulaDoubleToken(-0.0));inputs.emplace_back(new FormulaDoubleToken(CreateDoubleError(FormulaError::MatrixSize)));inputs.emplace_back(new FormulaErrorToken(FormulaError::NONE));inputs.emplace_back(new FormulaErrorToken(FormulaError::DivisionByZero));inputs.emplace_back(new ScEmptyCellToken(false,false));inputs.emplace_back(new ScEmptyCellToken(true,true));inputs.emplace_back(new FormulaStringToken(sa));inputs.emplace_back(new FormulaStringToken(sl));inputs.emplace_back(new FormulaStringToken(sr));inputs.emplace_back(new FormulaUnknownToken(ocBad));inputs.emplace_back(new FormulaMissingToken());inputs.emplace_back(new ScHybridCellToken(2.5,sa,formula,false));inputs.emplace_back(new ScHybridCellToken(0,empty,formula,true));inputs.emplace_back(new ScMatrixFormulaCellToken(7,8,mb,inputs[0].get()));inputs.emplace_back(new ScMatrixToken(ma));inputs.emplace_back(new FormulaToken(svMatrixCell));inputs.emplace_back(new ScMatrixCellResultToken(mb,inputs[0].get()));
 ScFormulaResult initial;state("default",initial);ScFormulaResult initialcopy(initial);state("defaultcopy",initialcopy);ScFormulaResult null(nullptr);state("null",null);initial.HandleStuffAfterParallelCalculation();state("parallel",initial);
 for(int i=0;i<16;++i)for(auto err:{FormulaError::NONE,FormulaError::IllegalArgument}){std::cout<<"input "<<i<<" "<<int(err)<<"\n";ScFormulaResult v(inputs[i].get());v.SetResultError(err);state("source",v);ScFormulaResult c(v);state("copy",c);std::cout<<"copy_identity "<<(v.GetToken()==c.GetToken())<<"\n";c.Assign(c);state("self",c);for(int target=0;target<5;++target){ScFormulaResult d;if(target==1)d.SetDouble(4.5);if(target==2)d.SetToken(inputs[7].get());if(target>=3)d.SetMatrix(target==3?2:0,3,ma,nullptr);d=v;state("assigned",d);d.SetResultError(FormulaError::NONE);state("clearerror",d);d.SetDouble(-3.5);state("setdouble",d);d.SetToken(nullptr);state("setnull",d);}}
 for(auto dims:std::vector<std::pair<int,int>>{{2,3},{0,3},{2,0}}){ScFormulaResult v;v.SetMatrix(dims.first,dims.second,ma,nullptr);for(int i=0;i<18;++i){if(i==14||i==16||i==17||i==0||i==4||i==6||i==7||i==8||i==11||i==15){std::cout<<"matrix_input "<<dims.first<<" "<<dims.second<<" "<<i<<"\n";v.SetToken(inputs[i].get());state("matrix_updated",v);v.SetResultError(FormulaError::DivisionByZero);state("matrix_error",v);v.SetResultError(FormulaError::NONE);state("matrix_clear",v);}}v.SetToken(nullptr);state("matrix_null",v);v.SetHybridDouble(9.5);state("matrix_hybrid_double",v);}
 for(int kind=0;kind<4;++kind){std::cout<<"hybrid "<<kind<<"\n";ScFormulaResult v;if(kind==1)v.SetDouble(4.5);if(kind==2)v.SetToken(inputs[7].get());if(kind==3)v.SetToken(inputs[12].get());v.SetHybridDouble(2.5);state("hybrid_double",v);v.SetHybridString(sl);state("hybrid_string",v);v.SetHybridFormula(formula);state("hybrid_formula",v);v.SetHybridDouble(-0.0);state("hybrid_again",v);v.SetHybridString(empty);v.SetHybridEmptyDisplayedAsString();state("hybrid_empty",v);v.HandleStuffAfterParallelCalculation();state("hybrid_parallel",v);}
 ScFormulaResult cached(inputs[7].get());state("cache_before",cached);static_cast<FormulaStringToken*>(inputs[7].get())->SetString(sl);state("cache_after_mutation",cached);cached.SetToken(inputs[7].get());state("cache_reset",cached);static_cast<FormulaStringToken*>(inputs[7].get())->SetString(sa);
 ScFormulaResult matrixcopy;matrixcopy.SetMatrix(2,3,ma,inputs[0].get());ScFormulaResult other(matrixcopy);other.GetMatrixFormulaCellTokenNonConst()->SetMatColsRows(5,6);other.SetDouble(9.5);state("copy_matrix_source",matrixcopy);state("copy_matrix_target",other);
 for(int i:{3,4,5,6}){ScFormulaResult v;v.SetMatrix(2,3,ma,inputs[i].get());state("upper_special",v);}
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
    tokenPrefix: hash(tokenPrefix),
    emptyClass: hash(emptyClass),
    hybridClass: hash(hybridClass),
    emptyDefinition: hash(emptyDefinition),
    hybridDefinitions: hash(hybridDefinitions),
    resultHeader: hash(resultHeader),
    resultSource: hash(resultSource),
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
