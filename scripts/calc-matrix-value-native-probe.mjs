/** @fileoverview Captures the complete original ScMatValType and ScMatrixValue inline scopes over reused whole genuine SharedString/SAL native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { loadUnicodeOriginal, hash, pin, scope, upstream } from "./rtl-ustring-native-sources.mjs";

const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-matrix-value-native";
const fixture = "apps/office/src/sc/source/core/tool/native-matrix-value-cases.json";
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const path of [
  "include/svl/sharedstring.hxx",
  "svl/source/misc/sharedstring.cxx",
  "include/formula/errorcodes.hxx",
  "sc/inc/types.hxx",
  "sc/inc/scmatrix.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const typeDeclaration = scope(
  native.sources["sc/inc/types.hxx"],
  "enum class ScMatValType",
  "namespace o3tl{",
);
const declaration = scope(
  native.sources["sc/inc/scmatrix.hxx"],
  "struct ScMatrixValue",
  "/**\n * Matrix data type",
);
const caller = String.raw`
#include <svl/sharedstring.hxx>
#include <formula/errorcodes.hxx>
#include <bit>
#include <iomanip>
#include <iostream>
#include <string>
#include <utility>
${typeDeclaration}
${declaration}
using F=ScMatrixValue;
void value(const F&f){std::cout<<unsigned(f.nType)<<" "<<std::hex<<std::setw(16)<<std::setfill('0')<<std::bit_cast<std::uint64_t>(f.fVal)<<std::dec<<" "<<unsigned(f.GetError())<<" "<<f.GetBoolean()<<" "<<f.GetString().isValid()<<" "<<f.GetString().isEmpty()<<" "<<f.GetString().getLength();}
int main(int argc,char**argv){if(argc!=2)return 2;std::string mode=argv[1];
 if(mode=="scalar"){
  F d;std::cout<<"types "<<unsigned(ScMatValType::Value)<<" "<<unsigned(ScMatValType::Boolean)<<" "<<unsigned(ScMatValType::String)<<" "<<unsigned(ScMatValType::Empty)<<" "<<unsigned(ScMatValType::EmptyPath)<<" "<<unsigned(ScMatValType::NonvalueMask)<<"\ndefault ";value(d);std::cout<<"\n";
  OUString a(u"A",1),b(u"B",1);svl::SharedString sa(a),sb(b);
  for(unsigned type=0;type<=255;++type)for(double v:{0.0,-0.0,2.5,-2.5,std::numeric_limits<double>::denorm_min(),std::numeric_limits<double>::max(),std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity(),CreateDoubleError(FormulaError::DivisionByZero)}){
   F t;t.nType=static_cast<ScMatValType>(type);t.fVal=v;t.aStr=sa;F copy(t),number(t),string(t),other(t);number.fVal=1;string.aStr=sb;other.nType=static_cast<ScMatValType>((type+1)%256);
   std::cout<<type<<" ";value(copy);std::cout<<" "<<(t==copy)<<" "<<(t!=copy)<<" "<<(t==number)<<" "<<(t==string)<<" "<<(t==other)<<"\n";
  }
  for(unsigned n=0;n<=65535;++n){F v;v.fVal=CreateDoubleError(static_cast<FormulaError>(n));std::cout<<"error "<<n<<" "<<unsigned(v.GetError())<<" "<<v.GetBoolean()<<"\n";}
 }else if(mode=="owned"){
  OUString x(u"A\0B",3),y(u"a\0b",3);
  auto data=[&](const F&f){std::cout<<" "<<(f.aStr.getData()==nullptr?-1:f.aStr.getData()==x.pData?1:2)<<" "<<(f.aStr.getDataIgnoreCase()==nullptr?-1:f.aStr.getDataIgnoreCase()==x.pData?1:2)<<" "<<x.pData->refCount<<" "<<y.pData->refCount;};
  auto snap=[&](const char*label,const F&f){std::cout<<label<<" ";value(f);data(f);std::cout<<"\n";};
  for(int pattern=0;pattern<5;++pattern){std::cout<<"case "<<pattern<<"\n";
   {svl::SharedString s(pattern==1||pattern==3||pattern==4?x.pData:nullptr,pattern==2||pattern==3?y.pData:pattern==4?x.pData:nullptr);F a;auto*member=&a.aStr;a.aStr=s;a.nType=ScMatValType::String;a.fVal=-2.5;snap("a",a);
    {F c(a);snap("copy",c);F r(std::move(a));snap("rvalue_copy",r);snap("source_after",a);F assigned;auto*assignedMember=&assigned.aStr;std::cout<<"return "<<(&(assigned=c)==&assigned)<<"\n";snap("assigned",assigned);std::cout<<"self_return "<<(&(c=c)==&c)<<"\n";snap("self",c);std::cout<<"rvalue_return "<<(&(assigned=std::move(r))==&assigned)<<"\n";snap("rvalue_assigned",assigned);snap("rvalue_source",r);std::cout<<"member_identity "<<(&a.aStr==member)<<" "<<(&assigned.aStr==assignedMember)<<" "<<(&a.GetString()==member)<<"\n";}
    snap("after_scope",a);a.aStr=a.aStr;snap("self_string",a);
   }std::cout<<"clear "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
  }
 }else if(mode=="fields"){
  for(int n:{-65537,-65536,-1,0,1,2,3,4,255,256,257,65535,65536,65537,std::numeric_limits<int>::min(),std::numeric_limits<int>::max()}){F a;a.nType=static_cast<ScMatValType>(n);a.fVal=n+0.5;F c(a),b;b=c;std::cout<<n<<" ";value(a);std::cout<<" | ";value(b);std::cout<<" "<<(a==b)<<"\n";}
 }else return 3;
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-I" + upstream + "/include",
  upstream + "/svl/source/misc/sharedstring.cxx",
]);
const captures = {};
for (const mode of ["scalar", "owned", "fields"]) {
  const bytes = native.run(binary, [mode], "value-" + mode).stdout;
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
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Records complete source identities. @param entry - Pinned source. @returns Hash entry. */
      ([path, bytes]) => [path, hash(bytes)],
    ),
  ),
  scopes: { declaration: hash(declaration), typeDeclaration: hash(typeDeclaration) },
  captures,
};
native.manifest.valueScopes = {
  typeDeclaration: { original: "sc/inc/types.hxx", sha256: hash(typeDeclaration) },
  declaration: { original: "sc/inc/scmatrix.hxx", sha256: hash(declaration) },
  reason:
    "Complete genuine inline enum and value struct only; no ScMatrix/container/token/interpreter stand-in.",
};
native.save();
if (write) writeFileSync(fixture, JSON.stringify(data, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Original whole ScMatrixValue streams changed");
native.manifest.state = "captured";
native.manifest.driverHash = data.driverHash;
native.manifest.captures = Object.fromEntries(
  Object.entries(captures).map(
    /** Records terminal complete-output identities. @param entry - Capture pair. @returns Length and digest pair. */ ([
      mode,
      capture,
    ]) => [mode, { byteLength: capture.byteLength, sha256: capture.sha256 }],
  ),
);
native.save();
console.log(
  JSON.stringify({
    normalOnly: true,
    scalarTypes: 256,
    errorCases: 65536,
    ownedCases: 5,
    captures: Object.fromEntries(
      Object.entries(captures).map(
        /** Reports output identity without its full bytes. @param entry - Complete capture. @returns Metadata. */
        ([mode, capture]) => [mode, { bytes: capture.byteLength, sha256: capture.sha256 }],
      ),
    ),
  }),
);
