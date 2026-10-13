/** @fileoverview Captures the complete original FormulaResultValue struct and constructor scopes over reused whole genuine SharedString/SAL native dependencies, normal-only. */
import { readFileSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { loadUnicodeOriginal, hash, pin, scope, upstream } from "./rtl-ustring-native-sources.mjs";

const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-formularesult-value-native";
const fixture = "apps/office/src/sc/source/core/tool/native-formularesult-value-cases.json";
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
  "sc/inc/formularesult.hxx",
  "sc/source/core/tool/formularesult.cxx",
])
  loadUnicodeOriginal(native.sources, path);
const declaration = scope(
  native.sources["sc/inc/formularesult.hxx"],
  "namespace sc {",
  "/** Store a variable formula cell result",
);
const definitions = scope(
  native.sources["sc/source/core/tool/formularesult.cxx"],
  "namespace sc {",
  "ScFormulaResult::ScFormulaResult()",
);
const caller = String.raw`
#include <svl/sharedstring.hxx>
#include <formula/errorcodes.hxx>
#include <bit>
#include <iomanip>
#include <iostream>
#include <string>
#include <type_traits>
#include <utility>
${declaration}
${definitions}
using F=sc::FormulaResultValue;
static_assert(std::is_copy_constructible_v<F> && std::is_move_constructible_v<F>);
static_assert(std::is_copy_assignable_v<F> && std::is_move_assignable_v<F>);
void value(const F& f) {
 std::cout<<unsigned(f.meType)<<" "<<std::hex<<std::setw(16)<<std::setfill('0')<<std::bit_cast<std::uint64_t>(f.mfValue)<<std::dec<<" "<<f.mbMultiLine<<" "<<unsigned(f.mnError)<<" "<<f.maString.isValid()<<" "<<f.maString.isEmpty()<<" "<<f.maString.getLength();
}
int main(int argc,char**argv) {
 if(argc!=2)return 2;std::string mode=argv[1];
 if(mode=="scalar") {
  std::cout<<"types "<<unsigned(F::Invalid)<<" "<<unsigned(F::Value)<<" "<<unsigned(F::String)<<" "<<unsigned(F::Error)<<"\n";
  F zero;std::cout<<"default ";value(zero);std::cout<<"\n";
  for(unsigned n=0;n<=65535;++n){F e(static_cast<FormulaError>(n)),v{double(n)},nan{CreateDoubleError(static_cast<FormulaError>(n))};std::cout<<n<<" E ";value(e);std::cout<<" V ";value(v);std::cout<<" N ";value(nan);std::cout<<"\n";}
  for(double n:{-0.0,-2.5,3.141592653589793,std::numeric_limits<double>::denorm_min(),std::numeric_limits<double>::max(),std::numeric_limits<double>::lowest(),std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity()}){F v(n),c(v),m(std::move(v));std::cout<<"special ";value(c);std::cout<<" | ";value(m);std::cout<<" | ";value(v);std::cout<<"\n";}
 } else if(mode=="owned") {
  sal_Unicode raw[]={65,0,66},fold[]={97,0,98};OUString x(raw,3),y(fold,3);
  auto strings=[&](svl::SharedString const&s){std::cout<<" "<<(s.getData()==nullptr?-1:s.getData()==x.pData?1:2)<<" "<<(s.getDataIgnoreCase()==nullptr?-1:s.getDataIgnoreCase()==x.pData?1:2);};
  auto snap=[&](const char*name,const F&f){std::cout<<name<<" ";value(f);strings(f.maString);std::cout<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";};
  auto source=[&](int pattern){return svl::SharedString(pattern==1||pattern==3||pattern==4?x.pData:nullptr,pattern==2||pattern==3?y.pData:pattern==4?x.pData:nullptr);};
  for(int pattern=0;pattern<5;++pattern)for(bool multi:{false,true})for(bool moved:{false,true}){
   std::cout<<"case "<<pattern<<" "<<multi<<" "<<moved<<"\n";
   {auto s=source(pattern);{
    F a=moved?F(std::move(s),multi):F(s,multi);snap("a",a);std::cout<<"input";strings(s);std::cout<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
    {F copy(a);snap("copy",copy);F transfer(std::move(a));snap("transfer",transfer);snap("moved",a);F assign(17.0);std::cout<<"copy_return "<<(&(assign=copy)==&assign)<<"\n";snap("assigned",assign);std::cout<<"self_copy "<<(&(copy=copy)==&copy)<<"\n";snap("self",copy);std::cout<<"move_return "<<(&(assign=std::move(transfer))==&assign)<<"\n";snap("move_assigned",assign);snap("source_after",transfer);}
    snap("after_scope",a);
   }std::cout<<"after_value";strings(s);std::cout<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";}
   std::cout<<"clear "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
  }
  auto make=[&](int kind){if(kind==0)return F();if(kind==1)return F(-2.5);if(kind==2)return F(source(3),true);return F(FormulaError::DivisionByZero);};
  for(int from=0;from<4;++from)for(int to=0;to<4;++to)for(bool move:{false,true}){
   std::cout<<"assign_case "<<from<<" "<<to<<" "<<move<<"\n";
   {F a=make(from),b=make(to);snap("from",a);snap("to",b);if(move)b=std::move(a);else b=a;snap("after_from",a);snap("after_to",b);}
   std::cout<<"clear "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
  }
  F empty;std::cout<<"empty_self_move "<<(&(empty=std::move(empty))==&empty)<<"\n";snap("empty",empty);
 } else if(mode=="fields") {
  sal_Unicode raw[]={65,0,66},fold[]={97,0,98};OUString x(raw,3),y(fold,3);svl::SharedString s(x.pData,y.pData);
  for(int n:{-65537,-65536,-1,0,1,2,3,4,255,256,257,65535,65536,65537,std::numeric_limits<int>::min(),std::numeric_limits<int>::max()}){
   F f;auto member=&f.maString;f.mfValue=n+0.5;f.meType=static_cast<F::Type>(n);f.mnError=static_cast<FormulaError>(n);f.mbMultiLine=bool(n%2);f.maString=s;
   std::cout<<"field "<<n<<" ";value(f);std::cout<<" "<<(member==&f.maString)<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
   f.maString=f.maString;F c(f);F m(std::move(f));std::cout<<"members ";value(f);std::cout<<" | ";value(c);std::cout<<" | ";value(m);std::cout<<" "<<(member==&f.maString)<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
  }
  std::cout<<"clear "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
 } else return 3;
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
  scopes: { declaration: hash(declaration), definitions: hash(definitions) },
  captures,
};
native.manifest.valueScopes = {
  declaration: { original: "sc/inc/formularesult.hxx", sha256: hash(declaration) },
  definitions: { original: "sc/source/core/tool/formularesult.cxx", sha256: hash(definitions) },
  reason:
    "Complete genuine independent named struct and all four actual constructors only; absent token/matrix/document graph is not compiled, replaced or certified.",
};
native.save();
if (write) writeFileSync(fixture, JSON.stringify(data, null, 2) + "\n");
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Original whole FormulaResultValue streams changed");
console.log(
  JSON.stringify({
    normalOnly: true,
    scalarCases: 65536,
    ownedCases: 52,
    captures: Object.fromEntries(
      Object.entries(captures).map(
        /** Reports output identity without its full bytes. @param entry - Complete capture. @returns Metadata. */
        ([mode, capture]) => [mode, { bytes: capture.byteLength, sha256: capture.sha256 }],
      ),
    ),
  }),
);
