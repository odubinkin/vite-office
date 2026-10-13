/** @fileoverview Ordinary original matrix storage/lifetime observations over complete pinned mdds headers and genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-values-native";
const fixture = "apps/office/src/sc/source/core/tool/native-matrix-values-cases.json";
const mdds = verifyMddsSources();
for (const file of ["multi_type_matrix.hpp", "multi_type_matrix_def.inl", "multi_type_vector.hpp"])
  mdds.sourceHashes[file] = digest(readFileSync(mdds.reference + "/include/mdds/" + file));
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const file of [
  "svl/source/misc/sharedstring.cxx",
  "include/svl/sharedstring.hxx",
  "sc/inc/mtvelements.hxx",
  "sc/source/core/tool/scmatrix.cxx",
])
  loadUnicodeOriginal(native.sources, file);
const original = readFileSync(upstream + "/sc/inc/mtvelements.hxx", "utf8");
const selected = [
  original.match(/const mdds::mtv::element_t element_type_string =[^;]*;/u)?.[0],
  original.match(
    /typedef mdds::mtv::default_element_block<element_type_string, svl::SharedString> string_block;/u,
  )?.[0],
  original.match(/typedef mdds::mtv::uint16_element_block uint16_block;/u)?.[0],
  original.match(
    /MDDS_MTV_DEFINE_ELEMENT_CALLBACKS\(SharedString, sc::element_type_string, SharedString\(\), sc::string_block\)/u,
  )?.[0],
];
loadUnicodeOriginal(native.sources, "include/o3tl/deleter.hxx");
loadUnicodeOriginal(native.sources, "sc/inc/scmatrix.hxx");
loadUnicodeOriginal(native.sources, "sc/inc/address.hxx");
loadUnicodeOriginal(native.sources, "include/formula/errorcodes.hxx");
const matrixSource = readFileSync(upstream + "/sc/source/core/tool/scmatrix.cxx", "utf8");
const traits = ["matrix_traits", "matrix_flag_traits"].map(
  /** Selects the complete unchanged original matrix trait scope. @param name - Trait. @returns Original scope. */ (
    name,
  ) => matrixSource.match(new RegExp("struct " + name + "\\s*\\{[^}]*\\};", "u"))?.[0],
);
if (
  [...selected, ...traits].some(
    /** Rejects an absent original scope. @param scope - Matched source. @returns Missing. */ (
      scope,
    ) => !scope,
  )
)
  throw Error("Original matrix scopes missing");
/** Selects one complete unchanged source definition including its constructor initializer list. @param signature - Exact source prefix. @param source - Original owner source or header. @returns Definition. */
function definition(signature, source = matrixSource) {
  const start = source.indexOf(signature);
  if (start < 0) throw Error("Missing original definition " + signature);
  const body = source.indexOf("{", start);
  let depth = 1,
    end = body + 1;
  while (depth && end < source.length) {
    if (source[end] === "{") ++depth;
    else if (source[end] === "}") --depth;
    ++end;
  }
  if (depth) throw Error("Unterminated original definition");
  return source.slice(start, end);
}
const definitions = [
  "ScMatrixImpl::ScMatrixImpl(SCSIZE nC, SCSIZE nR) :",
  "ScMatrixImpl::ScMatrixImpl(SCSIZE nC, SCSIZE nR, double fInitVal) :",
  "ScMatrixImpl::ScMatrixImpl( size_t nC, size_t nR, const std::vector<double>& rInitVals ) :",
  "void ScMatrixImpl::Clear()",
  "void ScMatrixImpl::GetDimensions(",
  "SCSIZE ScMatrixImpl::GetElementCount()",
  "bool ScMatrixImpl::ValidColRow(",
  "bool ScMatrixImpl::ValidColRowReplicated(",
  "bool ScMatrixImpl::ValidColRowOrReplicated(",
  "bool ScMatrixImpl::IsNumeric()",
].map(
  /** Selects the original complete body. @param signature - Source prefix. @returns Definition. */ (
    signature,
  ) => definition(signature),
);
const header = readFileSync(upstream + "/sc/inc/scmatrix.hxx", "utf8");
const typesHeader = readFileSync(upstream + "/sc/inc/types.hxx", "utf8");
loadUnicodeOriginal(native.sources, "sc/inc/types.hxx");
const tags = typesHeader.match(/enum class ScMatValType[^}]*\};/u)?.[0];
if (!tags) throw Error("Missing original tags");
const publicDefinitions = [
  "bool ScMatrix::IsSizeAllocatable(",
  "ScMatrix::ScMatrix( SCSIZE nC, SCSIZE nR)",
  "ScMatrix::ScMatrix(SCSIZE nC, SCSIZE nR, double fInitVal)",
  "ScMatrix::ScMatrix( size_t nC, size_t nR, const std::vector<double>& rInitVals )",
  "ScMatrix::~ScMatrix()",
  "void ScMatrix::Resize( SCSIZE nC, SCSIZE nR)",
  "void ScMatrix::Resize(SCSIZE nC, SCSIZE nR, double fVal)",
  "void ScMatrix::GetDimensions(",
  "SCSIZE ScMatrix::GetElementCount()",
  "bool ScMatrix::ValidColRow(",
  "bool ScMatrix::ValidColRowReplicated(",
  "bool ScMatrix::ValidColRowOrReplicated(",
  "void ScMatrixImpl::Resize(SCSIZE nC, SCSIZE nR)",
  "void ScMatrixImpl::Resize(SCSIZE nC, SCSIZE nR, double fVal)",
  "ScMatrixImpl::~ScMatrixImpl()",
  "static size_t GetElementsMax(",
].map(
  /** Selects unchanged public/internal original definitions. @param signature - Prefix. @returns Body. */ (
    signature,
  ) => definition(signature),
);
const classifiers = [
  "IsValueType",
  "IsBooleanType",
  "IsNonValueType",
  "IsRealStringType",
  "IsEmptyType",
  "IsEmptyPathType",
].map(
  /** Selects unchanged inline original classifiers. @param name - Name. @returns Body. */ (name) =>
    definition("static bool " + name + "(", header),
);
const valueStruct = definition("struct ScMatrixValue", header) + ";";
const flagDeclarations = matrixSource.slice(
  matrixSource.indexOf("typedef uint8_t TMatFlag;"),
  matrixSource.indexOf("class ScMatrixImpl"),
);
if (!flagDeclarations.includes("SC_MATFLAG_EMPTYPATH")) throw Error("Missing original flags");
const signatures = [
  "void ScMatrixImpl::PutDouble(double fVal, SCSIZE nC, SCSIZE nR)",
  "void ScMatrixImpl::PutString(const svl::SharedString& rStr, SCSIZE nC, SCSIZE nR)",
  "void ScMatrixImpl::PutEmpty(SCSIZE nC, SCSIZE nR)",
  "void ScMatrixImpl::PutEmptyPath(SCSIZE nC, SCSIZE nR)",
  "void ScMatrixImpl::PutError(",
  "void ScMatrixImpl::PutBoolean(",
  "void ScMatrixImpl::PutEmptyResultVector(",
  "ScMatrixValue ScMatrixImpl::Get(",
  "bool ScMatrixImpl::IsStringOrEmpty( SCSIZE nC, SCSIZE nR )",
  "bool ScMatrixImpl::IsEmpty(",
  "bool ScMatrixImpl::IsEmptyCell(",
  "bool ScMatrixImpl::IsEmptyResult(",
  "bool ScMatrixImpl::IsEmptyPath(",
  "bool ScMatrixImpl::IsValue( SCSIZE nC, SCSIZE nR )",
  "bool ScMatrixImpl::IsValueOrEmpty( SCSIZE nC, SCSIZE nR )",
  "bool ScMatrixImpl::IsBoolean(",
  "void ScMatrix::PutDouble(double fVal, SCSIZE nC, SCSIZE nR)",
  "void ScMatrix::PutString(const svl::SharedString& rStr, SCSIZE nC, SCSIZE nR)",
  "void ScMatrix::PutEmpty(SCSIZE nC, SCSIZE nR)",
  "void ScMatrix::PutEmptyPath(",
  "void ScMatrix::PutError(",
  "void ScMatrix::PutBoolean(",
  "void ScMatrix::PutEmptyResultVector(",
  "ScMatrixValue ScMatrix::Get(",
  "bool ScMatrix::IsStringOrEmpty( SCSIZE nC, SCSIZE nR )",
  "bool ScMatrix::IsEmpty(",
  "bool ScMatrix::IsEmptyCell(",
  "bool ScMatrix::IsEmptyResult(",
  "bool ScMatrix::IsEmptyPath(",
  "bool ScMatrix::IsValue( SCSIZE nC, SCSIZE nR )",
  "bool ScMatrix::IsValueOrEmpty(",
  "bool ScMatrix::IsBoolean(",
  "bool ScMatrix::IsNumeric()",
];
const valueDefinitions = signatures.map(
  /** Selects complete unchanged coordinate definitions. @param signature - Prefix. @returns Body. */ (
    signature,
  ) => definition(signature),
);
const valueDeclarations = String.raw`
 void PutDouble(double,SCSIZE,SCSIZE);void PutString(const svl::SharedString&,SCSIZE,SCSIZE);
 void PutEmpty(SCSIZE,SCSIZE);void PutEmptyPath(SCSIZE,SCSIZE);void PutError(FormulaError,SCSIZE,SCSIZE);void PutBoolean(bool,SCSIZE,SCSIZE);void PutEmptyResultVector(SCSIZE,SCSIZE,SCSIZE);
 ScMatrixValue Get(SCSIZE,SCSIZE) const;
 bool IsStringOrEmpty(SCSIZE,SCSIZE) const;bool IsEmpty(SCSIZE,SCSIZE) const;bool IsEmptyCell(SCSIZE,SCSIZE) const;bool IsEmptyResult(SCSIZE,SCSIZE) const;bool IsEmptyPath(SCSIZE,SCSIZE) const;
 bool IsValue(SCSIZE,SCSIZE) const;bool IsValueOrEmpty(SCSIZE,SCSIZE) const;bool IsBoolean(SCSIZE,SCSIZE) const;
`;
const caller = String.raw`
#include <mdds/multi_type_matrix.hpp>
#include <svl/sharedstring.hxx>
#include <o3tl/deleter.hxx>
#include <atomic>
#include <mutex>
#include <memory>
#include <sal/log.hxx>
#include <formula/errorcodes.hxx>
#include <algorithm>
#include <cassert>
#include <osl/diagnose.h>
#include <iostream>
#include <vector>
namespace sc { ${selected.slice(0, 3).join("\n")} }
namespace svl { ${selected[3]} }
namespace { ${traits.join("\n")} }
using MatrixImplType = mdds::multi_type_matrix<matrix_traits>;
using MatrixFlagImplType = mdds::multi_type_matrix<matrix_flag_traits>;
using SCSIZE = size_t;
class ScInterpreter;
static std::atomic<size_t> nElementsMax;
static std::once_flag bElementsMaxFetched;
constexpr size_t MAXROWCOUNT=1048576;
static size_t GetElementsMax(size_t);
${tags}
constexpr ScMatValType operator&(ScMatValType a,ScMatValType b){return ScMatValType(uint8_t(a)&uint8_t(b));}
${valueStruct}
${flagDeclarations}
// Declaration scaffold for selected unchanged definitions. Public storage is caller-only observation access.
class ScMatrixImpl {
public:
 MatrixImplType maMat;
 MatrixFlagImplType maMatFlag;
 ScInterpreter* pErrorInterpreter;
 ScMatrixImpl(SCSIZE,SCSIZE);
 ScMatrixImpl(SCSIZE,SCSIZE,double);
 ScMatrixImpl(size_t,size_t,const std::vector<double>&);
 ~ScMatrixImpl();
 void Resize(SCSIZE,SCSIZE);
 void Resize(SCSIZE,SCSIZE,double);
 void Clear();
 void GetDimensions(SCSIZE&,SCSIZE&) const;
 SCSIZE GetElementCount() const;
 bool ValidColRow(SCSIZE,SCSIZE) const;
 bool ValidColRowReplicated(SCSIZE&,SCSIZE&) const;
 bool ValidColRowOrReplicated(SCSIZE&,SCSIZE&) const;
 bool IsNumeric() const;
 ${valueDeclarations}
};
class ScMatrix {
public:
 mutable size_t nRefCnt; mutable bool mbCloneIfConst; std::unique_ptr<ScMatrixImpl> pImpl;
 ScMatrix(SCSIZE,SCSIZE);ScMatrix(SCSIZE,SCSIZE,double);ScMatrix(size_t,size_t,const std::vector<double>&);~ScMatrix();
 static bool IsSizeAllocatable(SCSIZE,SCSIZE);
 void Resize(SCSIZE,SCSIZE);void Resize(SCSIZE,SCSIZE,double);
 void GetDimensions(SCSIZE&,SCSIZE&) const;SCSIZE GetElementCount() const;
 bool ValidColRow(SCSIZE,SCSIZE) const;bool ValidColRowReplicated(SCSIZE&,SCSIZE&) const;bool ValidColRowOrReplicated(SCSIZE&,SCSIZE&) const;
 ${classifiers.join("\n")}
 bool IsNumeric() const;
 ${valueDeclarations}
};
${definitions.join("\n")}
${publicDefinitions.join("\n")}
${valueDefinitions.join("\n")}
void observe(const char*label,ScMatrix&m){size_t c=99,r=99;m.GetDimensions(c,r);std::cout<<label<<" "<<c<<" "<<r<<" "<<m.IsNumeric()<<"\n";
 for(size_t x=0;x<4;++x)for(size_t y=0;y<4;++y){auto v=m.Get(x,y);auto err=v.GetError();std::cout<<"value "<<x<<" "<<y<<" "<<int(v.nType)<<" "<<int(err)<<" "<<(err==FormulaError::NONE?v.fVal:0)<<" "<<v.GetString().getLength();auto data=v.GetString().getData();if(data)for(sal_Int32 i=0;i<data->length;++i)std::cout<<" "<<int(data->buffer[i]);std::cout<<" | "<<m.IsStringOrEmpty(x,y)<<" "<<m.IsEmpty(x,y)<<" "<<m.IsEmptyCell(x,y)<<" "<<m.IsEmptyResult(x,y)<<" "<<m.IsEmptyPath(x,y)<<" "<<m.IsValue(x,y)<<" "<<m.IsValueOrEmpty(x,y)<<" "<<m.IsBoolean(x,y)<<"\n";}}
int main(){sal_Unicode raw[]={65,0,937};OUString text(raw,3);svl::SharedString string(text);
 for(auto p:std::vector<std::pair<size_t,size_t>>{{0,0},{1,1},{1,3},{3,1},{2,3}}){ScMatrix m(p.first,p.second);std::cout<<"shape "<<p.first<<" "<<p.second<<"\n";observe("initial",m);
 m.PutDouble(2.5,0,0);observe("number",m);m.PutString(string,0,0);observe("string",m);m.PutBoolean(false,0,0);observe("false",m);m.PutBoolean(true,0,0);observe("true",m);m.PutEmptyPath(0,0);observe("path",m);m.PutDouble(3.5,0,0);observe("numberafterpath",m);m.PutString(string,0,0);observe("stringafterpath",m);m.PutEmptyResultVector(1,0,0);observe("result",m);m.PutEmpty(0,0);observe("empty",m);
 m.PutEmptyResultVector(0,0,0);m.PutEmptyResultVector(1,5,0);m.PutEmptyResultVector(5,0,0);m.PutDouble(99,5,5);m.PutString(string,5,5);m.PutBoolean(true,5,5);m.PutEmptyPath(5,5);m.PutEmpty(5,5);observe("invalidwrites",m);
 if(p.first&&p.second){m.PutError(FormulaError::MatrixSize,0,0);observe("error",m);m.PutEmpty(0,0);auto held=m.Get(0,0);m.PutString(string,0,0);held=m.Get(0,0);m.PutEmpty(0,0);std::cout<<"held "<<held.GetString().getLength()<<" "<<int(held.GetString().getData()->buffer[0])<<"\n";}
 }
 ScMatrix internal(2,2);internal.pImpl->maMat.set(0,0,uint16_t(7));internal.pImpl->maMatFlag.set(1,0,true);observe("internaltypes",internal);internal.PutEmptyResultVector(2,1,0);observe("resultvector",internal);
 ScMatrix bounded(2,2);bounded.PutError(FormulaError::StackOverflow,0,3);observe("uncheckederror",bounded);try{bounded.PutError(FormulaError::StackOverflow,9,0);std::cout<<"errorwrite accepted\n";}catch(const std::exception&e){std::cout<<"errorwrite "<<e.what()<<"\n";}
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-I" + mdds.reference + "/include",
  "-DNDEBUG",
  upstream + "/svl/source/misc/sharedstring.cxx",
]);
const captures = {};
for (const mode of ["storage"]) {
  const result = native.run(binary, [], mode);
  // Original SAL warnings are retained in the manifest; they do not alter value observations.
  captures[mode] = result.stdout.toString("utf8");
}
const document = {
  pin,
  dependencyManifestHash: native.manifest.reusedDependencyBuild.manifestHash,
  mddsArchiveHashes: mdds.archiveHashes,
  mddsSourceHashes: mdds.sourceHashes,
  callerHash: digest(caller),
  sourceDigest: digest(JSON.stringify(native.manifest.sourceHashes)),
  captures,
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(document, null, 2) + "\n");
else if (!isDeepStrictEqual(document, JSON.parse(readFileSync(fixture, "utf8"))))
  throw Error("Original matrix storage evidence changed");
console.log(
  "Original matrix streams",
  Object.fromEntries(
    Object.entries(captures).map(
      /** Records complete ordinary capture lengths. @param entry - Mode and stream. @returns Byte length entry. */ ([
        mode,
        value,
      ]) => [mode, Buffer.byteLength(value)],
    ),
  ),
);
