/** @fileoverview Normal-only original range matrix/cell-state and matrix-range token values over genuine formula/address/reference headers; no runtime memory manager. */
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
const target = "output/playwright/calc-range-matrix-native";
const fixture = "apps/office/src/sc/source/core/tool/native-range-matrix-cases.json";
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

const previousFixture = JSON.parse(
  readFileSync("apps/office/src/sc/source/core/tool/native-reference-token-cases.json", "utf8"),
);
const previousDriver = readFileSync(
  "output/playwright/calc-reference-token-native/driver.cpp",
  "utf8",
);
if (hash(previousDriver) !== previousFixture.driverHash)
  throw Error("Changed genuine reference caller");
for (const [path, expected] of Object.entries(previousFixture.sourceHashes)) {
  loadUnicodeOriginal(native.sources, path);
  if (hash(native.sources[path]) !== expected)
    throw Error("Changed actual reference dependency " + path);
}
const end = previousDriver.indexOf("ScSingleRefData reference(");
if (end < 0) throw Error("Missing genuine reference source prefix");
const referencePrefix = previousDriver.slice(0, end);
const header = native.sources["sc/inc/token.hxx"],
  source = native.sources["sc/source/core/tool/token.cxx"];
for (const path of [
  "sc/inc/scmatrix.hxx",
  "sc/inc/mtvelements.hxx",
  "sc/source/core/tool/scmatrix.cxx",
  "sc/source/core/data/types.cxx",
])
  loadUnicodeOriginal(native.sources, path);
/** Selects a complete original class/function body without rewriting it. @param source - Original text. @param signature - Unique prefix. @returns Whole scope. */
function definition(source, signature) {
  const start = source.indexOf(signature);
  if (start < 0) throw Error("Missing original " + signature);
  let end = source.indexOf("{", start) + 1,
    depth = 1;
  while (depth && end < source.length) {
    if (source[end] === "{") ++depth;
    else if (source[end] === "}") --depth;
    ++end;
  }
  if (depth) throw Error("Incomplete original scope");
  return source.slice(start, end);
}
const elementSource = native.sources["sc/inc/mtvelements.hxx"];
const elementDeclarations = [
  "const mdds::mtv::element_t element_type_string =",
  "typedef mdds::mtv::default_element_block<element_type_string, svl::SharedString> string_block;",
  "typedef mdds::mtv::uint16_element_block uint16_block;",
]
  .map(
    /** Selects complete original required element declarations. @param prefix - Unique declaration start. @returns Original line. */ (
      prefix,
    ) => {
      const line = elementSource
        .split("\n")
        .find(
          /** Matches source line. @param value - Line. @returns Match. */ (value) =>
            value.startsWith(prefix),
        );
      if (!line) throw Error("Missing original declaration " + prefix);
      return line;
    },
  )
  .join("\n");
const elementCallbacks = scope(
  elementSource,
  "namespace svl {",
  "namespace sc {\n\nclass CellStoreEvent",
);
const matrixSource = native.sources["sc/source/core/tool/scmatrix.cxx"];
const matrixTraits = scope(
  matrixSource,
  "namespace {\n\n/**",
  "namespace {\n\ndouble convertStringToValue",
);
const matrixImplClass = definition(matrixSource, "class ScMatrixImpl\n") + ";";
const matrixGlobals = scope(
  matrixSource,
  "static std::once_flag bElementsMaxFetched;",
  "ScMatrixImpl::ScMatrixImpl(",
);
const matrixDefinitions = [
  "ScMatrixImpl::ScMatrixImpl(SCSIZE nC, SCSIZE nR)",
  "ScMatrixImpl::ScMatrixImpl(SCSIZE nC, SCSIZE nR, double",
  "ScMatrixImpl::~ScMatrixImpl()",
  "void ScMatrixImpl::Clear()",
  "void ScMatrixImpl::GetDimensions(",
  "SCSIZE ScMatrixImpl::GetElementCount()",
  "void ScMatrix::IncRef() const",
  "void ScMatrix::DecRef() const",
  "bool ScMatrix::IsSizeAllocatable(",
  "ScMatrix::ScMatrix( SCSIZE nC, SCSIZE nR)",
  "ScMatrix::ScMatrix(SCSIZE nC, SCSIZE nR, double",
  "ScMatrix::~ScMatrix()",
  "void ScMatrix::GetDimensions(",
  "SCSIZE ScMatrix::GetElementCount()",
]
  .map(
    /** Selects exact needed doc-free real peer method. @param signature - Prefix. @returns Body. */ (
      signature,
    ) => definition(matrixSource, signature),
  )
  .join("\n");
const matrixTokenClasses = scope(
  header,
  "class SAL_DLLPUBLIC_RTTI ScMatrixToken",
  "class SC_DLLPUBLIC ScExternalToken",
);
const matrixTokenDefinitions = scope(
  source,
  "ScMatrixToken::ScMatrixToken(",
  "ScExternalToken::ScExternalToken(",
);
const valueSource = native.sources["sc/source/core/data/types.cxx"];
const valueDefinitions = scope(valueSource, "namespace sc {", "/* vim:");
const mdds = verifyMddsSources();
const caller = String.raw`
#include <functional>
${referencePrefix}
#include <scmatrix.hxx>

#include <mdds/multi_type_matrix.hpp>
#include <o3tl/deleter.hxx>
#include <mutex>
#include <atomic>
#include <sal/log.hxx>
namespace sc { ${elementDeclarations} }
${elementCallbacks}
${matrixTraits}
${matrixImplClass}
${matrixGlobals}
${matrixDefinitions}
${valueDefinitions}
${matrixTokenClasses}
${matrixTokenDefinitions}
void state(const char*label,const sc::RangeMatrix&a,const ScMatrix*x,const ScMatrix*y){std::cout<<label<<" "<<(a.mpMat? a.mpMat.get()==x?1:a.mpMat.get()==y?2:3:0)<<" "<<a.mnCol1<<" "<<a.mnRow1<<" "<<a.mnTab1<<" "<<a.mnCol2<<" "<<a.mnRow2<<" "<<a.mnTab2<<" "<<a.isRangeValid()<<"\n";}
void state(const char*label,const sc::MultiDataCellState&a){std::cout<<label<<" "<<a.mnRow1<<" "<<a.mnCol1<<" "<<unsigned(a.meState)<<"\n";}
void token(const char*label,const ScMatrixRangeToken&a,const ScMatrix*x,const ScMatrix*y){auto*m=a.GetMatrix();const auto&r=a.GetDoubleRef();std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode())<<" "<<a.IsMatrixRangeToken()<<" "<<(m?m==x?1:m==y?2:3:0);if(m){SCSIZE c,r;m->GetDimensions(c,r);std::cout<<" "<<c<<" "<<r;}std::cout<<" | "<<r.Ref1.Col()<<" "<<r.Ref1.Row()<<" "<<r.Ref1.Tab()<<" "<<unsigned(r.Ref1.FlagValue())<<" "<<r.Ref2.Col()<<" "<<r.Ref2.Row()<<" "<<r.Ref2.Tab()<<" "<<unsigned(r.Ref2.FlagValue())<<" "<<r.bTrimToData<<"\n";}
int main(){ScMatrixRef x(new ScMatrix(2,3,2.5)),y(new ScMatrix(1,1,4.5));FormulaDoubleToken number(2.5);sc::RangeMatrix defaults;state("default",defaults,x.get(),y.get());sc::MultiDataCellState defaultCell;state("defaultcell",defaultCell);
 for(auto m:{ScMatrixRef(),x,y}){sc::RangeMatrix a;a.mpMat=m;a.mnCol1=1;a.mnRow1=2;a.mnTab1=3;a.mnCol2=4;a.mnRow2=5;a.mnTab2=6;sc::RangeMatrix copy(a),assigned;assigned=copy;assigned=assigned;sc::RangeMatrix moved(std::move(a));state("valuecopy",copy,x.get(),y.get());state("valueassigned",assigned,x.get(),y.get());state("valuemoved",moved,x.get(),y.get());state("valuesource",a,x.get(),y.get());sc::RangeMatrix target;target.mpMat=y;target=std::move(copy);state("valuemoveassigned",target,x.get(),y.get());state("valueassignsource",copy,x.get(),y.get());target=std::move(target);state("valueselfmove",target,x.get(),y.get());
 ScMatrixRangeToken t(moved),tc(t);FormulaTokenRef clone(t.Clone());auto&cl=static_cast<ScMatrixRangeToken&>(*clone);token("token",t,x.get(),y.get());token("tokencopy",tc,x.get(),y.get());token("tokenclone",cl,x.get(),y.get());auto*ref=&t.GetDoubleRef();moved.mpMat=y;moved.mnCol1=8;token("tokenretained",t,x.get(),y.get());std::cout<<"tokenidentity "<<(ref==&t.GetDoubleRef())<<" "<<(ref!=&tc.GetDoubleRef())<<" "<<(ref!=&cl.GetDoubleRef())<<" "<<(t==tc)<<" "<<t.operator==(*clone)<<" "<<t.operator==(number)<<"\n";sc::RangeMatrix diff(assigned);diff.mnCol1=0;diff.mnRow2=25;ScMatrixRangeToken dt(diff);ScMatrixToken base(m);ScMatrixRangeToken other(defaults);std::cout<<"rangeequal "<<t.operator==(dt)<<" "<<t.TextEqual(dt)<<" "<<t.operator==(base)<<" "<<t.operator==(other)<<"\n";}
 for(int field=0;field<6;++field)for(int64_t n:{-2147483649LL,-65537LL,-1LL,0LL,1LL,32767LL,32768LL,65535LL,65536LL,2147483647LL,2147483648LL}){sc::RangeMatrix a;a.mpMat=x;a.mnCol1=0;a.mnRow1=0;a.mnTab1=0;a.mnCol2=10;a.mnRow2=10;a.mnTab2=10;switch(field){case 0:a.mnCol1=static_cast<sal_Int32>(n);break;case 1:a.mnRow1=static_cast<sal_Int32>(n);break;case 2:a.mnTab1=static_cast<sal_Int32>(n);break;case 3:a.mnCol2=static_cast<sal_Int32>(n);break;case 4:a.mnRow2=static_cast<sal_Int32>(n);break;case 5:a.mnTab2=static_cast<sal_Int32>(n);break;}state("width",a,x.get(),y.get());ScMatrixRangeToken t(a);token("narrowtoken",t,x.get(),y.get());}
 for(int bits=0;bits<512;++bits){sc::RangeMatrix a;a.mnCol1=(bits&1)?-1:0;a.mnRow1=(bits&2)?-1:0;a.mnTab1=(bits&4)?-1:0;a.mnCol2=(bits&8)?-1:(bits&64)?-2:1;a.mnRow2=(bits&16)?-1:(bits&128)?-2:1;a.mnTab2=(bits&32)?-1:(bits&256)?-2:1;state("validity",a,x.get(),y.get());}
 for(int64_t stateValue:{-257LL,-1LL,0LL,1LL,2LL,3LL,4LL,255LL,256LL,257LL})for(int64_t row:{-2147483649LL,-1LL,0LL,2147483647LL,2147483648LL})for(int64_t col:{-65537LL,-32769LL,-1LL,0LL,32767LL,32768LL,65536LL}){sc::MultiDataCellState a(static_cast<sc::MultiDataCellState::StateType>(stateValue));a.mnRow1=static_cast<SCROW>(row);a.mnCol1=static_cast<SCCOL>(col);sc::MultiDataCellState copy(a),assigned;assigned=copy;assigned=assigned;state("cell",a);state("cellcopy",copy);state("cellassigned",assigned);a.mnRow1=5;a.mnCol1=6;a.meState=sc::MultiDataCellState::HasMultipleCells;state("cellchanged",a);state("cellretained",copy);}
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-DNDEBUG",
  "-DSALHELPER_DLLIMPLEMENTATION",
  "-I" + target + "/generated",
  "-I" + boostRoot,
  "-I" + mdds.reference + "/include",
  "-I" + upstream + "/sc/inc",
  "-I" + upstream + "/include",
  upstream + "/svl/source/misc/sharedstring.cxx",
  upstream + "/salhelper/source/simplereferenceobject.cxx",
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
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Records complete original source identities. @param entry - Original path and bytes. @returns Whole source hash entry. */ ([
        path,
        bytes,
      ]) => [path, hash(bytes)],
    ),
  ),
  mddsArchiveHashes: mdds.archiveHashes,
  mddsSourceHashes: Object.fromEntries(
    allDependencies
      .filter(
        /** Selects genuine mdds headers. @param path - Dependency. @returns Match. */ (path) =>
          path.startsWith(mdds.reference + "/include/"),
      )
      .map(
        /** Hashes actual original mdds bytes. @param path - Header. @returns Hash entry. */ (
          path,
        ) => [path.slice((mdds.reference + "/include/").length), hash(readFileSync(path))],
      ),
  ),
  scopes: {
    referencePrefix: hash(referencePrefix),
    elementDeclarations: hash(elementDeclarations),
    elementCallbacks: hash(elementCallbacks),
    matrixTraits: hash(matrixTraits),
    matrixImplClass: hash(matrixImplClass),
    matrixGlobals: hash(matrixGlobals),
    matrixDefinitions: hash(matrixDefinitions),
    valueDefinitions: hash(valueDefinitions),
    matrixTokenClasses: hash(matrixTokenClasses),
    matrixTokenDefinitions: hash(matrixTokenDefinitions),
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
