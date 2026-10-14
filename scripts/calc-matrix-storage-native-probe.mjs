/** @fileoverview Ordinary original matrix storage/lifetime observations over complete pinned mdds headers and genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { verifyMddsSources, digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-storage-native";
const fixture = "apps/office/src/sc/source/core/tool/native-matrix-storage-cases.json";
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
/** Selects one complete unchanged source definition including its constructor initializer list. @param signature - Exact source prefix. @returns Definition. */
function definition(signature) {
  const start = matrixSource.indexOf(signature);
  if (start < 0) throw Error("Missing original definition " + signature);
  const body = matrixSource.indexOf("{", start);
  let depth = 1,
    end = body + 1;
  while (depth && end < matrixSource.length) {
    if (matrixSource[end] === "{") ++depth;
    else if (matrixSource[end] === "}") --depth;
    ++end;
  }
  if (depth) throw Error("Unterminated original definition");
  return matrixSource.slice(start, end);
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
].map(definition);
const caller = String.raw`
#include <mdds/multi_type_matrix.hpp>
#include <svl/sharedstring.hxx>
#include <o3tl/deleter.hxx>
#include <atomic>
#include <iostream>
#include <vector>
namespace sc { ${selected.slice(0, 3).join("\n")} }
namespace svl { ${selected[3]} }
namespace { ${traits.join("\n")} }
using MatrixImplType = mdds::multi_type_matrix<matrix_traits>;
using MatrixFlagImplType = mdds::multi_type_matrix<matrix_flag_traits>;
using SCSIZE = size_t;
class ScInterpreter;
static std::atomic<size_t> nElementsMax{536870912};
// Declaration scaffold for selected unchanged definitions. Public storage is caller-only observation access.
class ScMatrixImpl {
public:
 MatrixImplType maMat;
 MatrixFlagImplType maMatFlag;
 ScInterpreter* pErrorInterpreter;
 ScMatrixImpl(SCSIZE,SCSIZE);
 ScMatrixImpl(SCSIZE,SCSIZE,double);
 ScMatrixImpl(size_t,size_t,const std::vector<double>&);
 void Clear();
 void GetDimensions(SCSIZE&,SCSIZE&) const;
 SCSIZE GetElementCount() const;
 bool ValidColRow(SCSIZE,SCSIZE) const;
 bool ValidColRowReplicated(SCSIZE&,SCSIZE&) const;
 bool ValidColRowOrReplicated(SCSIZE&,SCSIZE&) const;
 bool IsNumeric() const;
};
${definitions.join("\n")}
void observe(const char*label,ScMatrixImpl&m){
 size_t c=99,r=99;m.GetDimensions(c,r);
 std::cout<<label<<" "<<c<<" "<<r<<" "<<m.GetElementCount()<<" "<<m.IsNumeric()<<"\n";
 for(size_t x=0;x<c;++x)for(size_t y=0;y<r;++y)
  std::cout<<"cell "<<x<<" "<<y<<" "<<int(m.maMat.get_type(y,x))<<" "<<m.maMat.get_numeric(y,x)<<" "<<int(m.maMatFlag.get_type(y,x))<<"\n";
 for(size_t x=0;x<=4;++x)for(size_t y=0;y<=4;++y){size_t a=x,b=y;
  bool rep=m.ValidColRowReplicated(a,b);size_t u=x,v=y;bool either=m.ValidColRowOrReplicated(u,v);
  std::cout<<"coord "<<x<<" "<<y<<" "<<m.ValidColRow(x,y)<<" "<<rep<<" "<<a<<" "<<b<<" "<<either<<" "<<u<<" "<<v<<"\n";
 }
}
int main(){
 for(size_t c=0;c<=3;++c)for(size_t r=0;r<=3;++r){
  std::cout<<"shape "<<c<<" "<<r<<"\n";
  ScMatrixImpl empty(c,r),filled(c,r,2.5);std::vector<double>values;for(size_t i=0;i<c*r;++i)values.push_back(i+.5);
  ScMatrixImpl ranged(c,r,values);if(!values.empty())values[0]=99;
  observe("empty",empty);observe("filled",filled);observe("vector",ranged);
  ranged.Clear();observe("cleared",ranged);
 }
 ScMatrixImpl typed(1,1);typed.maMat.set(0,0,uint16_t(65535));typed.maMatFlag.set(0,0,uint8_t(255));
 std::cout<<"traits "<<typed.maMat.get_integer(0,0)<<" "<<int(typed.maMatFlag.get_integer(0,0))<<"\n";
 typed.Clear();
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-I" + mdds.reference + "/include",
  upstream + "/svl/source/misc/sharedstring.cxx",
]);
const captures = {};
for (const mode of ["storage"]) {
  const result = native.run(binary, [], mode);
  if (result.stderr.length) throw Error("Unexpected native diagnostics");
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
