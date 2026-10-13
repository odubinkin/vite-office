/** @fileoverview Normal-only original formula token caller over whole pinned headers, complete real member scopes and verified cached Boost/SAL owners. */
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
const target = "output/playwright/formula-token-native";
const fixture = "apps/office/src/formula/inc/native-token-cases.json";
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
using namespace formula;
void value(const FormulaToken& t) {
 std::cout<<unsigned(t.GetType())<<" "<<unsigned(t.GetOpCode())<<" "<<t.GetRef()<<" "<<unsigned(t.GetRefCntPolicy())<<" "<<t.IsFunction()<<" "<<unsigned(t.GetParamCount())<<" "<<t.IsRef()<<" "<<t.IsExternalRef()<<" "<<unsigned(t.GetInForceArray())<<" "<<t.IsInForceArray();
}
void copied(const FormulaToken& t) { auto*p=t.Clone();value(t);std::cout<<" | ";value(*p);std::cout<<" "<<(t==*p)<<" "<<t.TextEqual(*p)<<"\n";p->DeleteIfZeroRef(); }
int main(int argc,char**argv) {
 if(argc!=2)return 2;std::string mode=argv[1];
 if(mode=="classification") {
  for(unsigned n=0;n<=65535;++n){auto op=static_cast<OpCode>(n);std::cout<<n<<" "<<FormulaCompiler::IsOpCodeJumpCommand(op);for(unsigned b:{0u,1u,255u}){if(op==ocWhitespace){FormulaSpaceToken t(b,32);std::cout<<" | ";value(t);}else{FormulaByteToken t(op,b);std::cout<<" | ";value(t);}}std::cout<<"\n";}
 } else if(mode=="string-param") {
  svl::SharedString s;
  for(unsigned n=0;n<=65535;++n){std::cout<<n;for(unsigned b:{0u,1u,255u}){FormulaStringOpToken t(static_cast<OpCode>(n),s);t.SetByte(b);std::cout<<" "<<unsigned(t.GetParamCount());}std::cout<<"\n";}
 } else if(mode=="stack") {
  for(unsigned n=0;n<=255;++n){auto type=static_cast<StackVar>(n);FormulaToken t(type);std::cout<<n<<" "<<StackVarEnumToString(type)<<" ";copied(t);}
 } else if(mode=="values") {
  FormulaToken base(svUnknown,ocBad);copied(base);
  FormulaSpaceToken space(255,0x3000);copied(space);
  FormulaByteToken byte(ocSum,3,ForceArray);copied(byte);
  FormulaDoubleToken number(-0.0);copied(number);
  FormulaTypedDoubleToken typed(2.5,-7);copied(typed);
  svl::SharedString string(OUString(u"A\0B",3));
  FormulaStringToken str(string);copied(str);
  FormulaStringOpToken strOp(ocStringXML,string);strOp.SetByte(3);strOp.SetInForceArray(ForceArray);copied(strOp);
  FormulaStringNameToken name(svStringName,string);copied(name);
  FormulaIndexToken index(ocName,65535);copied(index);
  FormulaExternalToken external(ocExternal,3,OUString(u"External",8));copied(external);
  FormulaMissingToken missing;copied(missing);
  short jumps[]={3,1,-7,32000};FormulaJumpToken jump(ocChoose,jumps);copied(jump);
  FormulaUnknownToken unknown(ocBad);copied(unknown);
  FormulaErrorToken error;copied(error);FormulaErrorToken rhs(FormulaError::DivisionByZero);error.IncRef();error.SetRefCntPolicy(RefCntPolicy::UnsafeRef);error=rhs;copied(error);
 } else if(mode=="fields") {
  for(int n:{-65537,-65536,-1,0,1,127,128,255,256,257,32767,32768,65535,65536,2147483647,-2147483647-1}) {
   FormulaSpaceToken space(n,n);auto*s=static_cast<FormulaSpaceToken*>(space.Clone());
   FormulaByteToken byte(ocSum);byte.SetByte(n);byte.SetInForceArray(static_cast<ParamClass>(n));auto*b=static_cast<FormulaByteToken*>(byte.Clone());
   FormulaTypedDoubleToken typed(double(n)/2,n);auto*t=static_cast<FormulaTypedDoubleToken*>(typed.Clone());typed.SetDoubleType(static_cast<sal_Int16>(static_cast<unsigned>(n)+1));
   FormulaIndexToken index(ocName,n);index.SetIndex(static_cast<unsigned>(n)+1);index.SetSheet(n);auto*i=static_cast<FormulaIndexToken*>(index.Clone());
   FormulaErrorToken error(static_cast<FormulaError>(n));error.SetError(static_cast<FormulaError>(static_cast<unsigned>(n)+1));auto*e=static_cast<FormulaErrorToken*>(error.Clone());
   std::cout<<n<<" "<<unsigned(s->GetByte())<<" "<<unsigned(s->GetChar())<<" "<<unsigned(b->GetByte())<<" "<<unsigned(b->GetInForceArray())<<" "<<t->GetDoubleType()<<" "<<typed.GetDoubleType()<<" "<<i->GetIndex()<<" "<<i->GetSheet()<<" "<<unsigned(e->GetError())<<"\n";
   delete s;delete b;delete t;delete i;delete e;
  }
  for(double n:{0.0,-0.0,2.5,-2.5,std::numeric_limits<double>::denorm_min(),std::numeric_limits<double>::max(),std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity(),CreateDoubleError(FormulaError::DivisionByZero)}){
   FormulaDoubleToken a(n);auto*c=static_cast<FormulaDoubleToken*>(a.Clone());std::cout<<"double "<<std::hex<<std::setw(16)<<std::setfill('0')<<std::bit_cast<std::uint64_t>(c->GetDouble())<<std::dec<<" "<<c->GetDoubleType()<<" "<<(a==*c);a.SetDouble(17.25);std::cout<<" "<<a.GetDouble()<<"\n";delete c;
  }
  for(short count:{short(0),short(1),short(3)}){short p[]={count,1,-7,32000};FormulaJumpToken j(ocIf,p);j.SetInForceArray(ReferenceOrForceArray);auto*c=static_cast<FormulaJumpToken*>(j.Clone());std::cout<<"jump "<<count;for(int n=0;n<=count;++n)std::cout<<" "<<c->GetJump()[n];std::cout<<" "<<(j==*c)<<" "<<(j.GetJump()==c->GetJump())<<" "<<unsigned(c->GetInForceArray());if(count)c->GetJump()[1]=-8;std::cout<<" "<<(j==*c)<<"\n";delete c;}
 } else if(mode=="strings") {
  OUString x(u"A\0B",3),y(u"a\0b",3);
  auto data=[&](const svl::SharedString&s){std::cout<<" "<<(s.getData()==nullptr?-1:s.getData()==x.pData?1:2)<<" "<<(s.getDataIgnoreCase()==nullptr?-1:s.getDataIgnoreCase()==x.pData?1:2);};
  for(int pattern=0;pattern<5;++pattern)for(int kind=0;kind<3;++kind)for(bool moved:{false,true}){
   std::cout<<"case "<<pattern<<" "<<kind<<" "<<moved<<"\n";
   {svl::SharedString s(pattern==1||pattern==3||pattern==4?x.pData:nullptr,pattern==2||pattern==3?y.pData:pattern==4?x.pData:nullptr);
    FormulaToken*t=kind==0?(moved?static_cast<FormulaToken*>(new FormulaStringToken(std::move(s))):new FormulaStringToken(s)):kind==1?(moved?static_cast<FormulaToken*>(new FormulaStringOpToken(ocStringName,std::move(s))):new FormulaStringOpToken(ocStringName,s)):(moved?static_cast<FormulaToken*>(new FormulaStringNameToken(svStringName,std::move(s))):new FormulaStringNameToken(svStringName,s));
    auto member=[&](const FormulaToken*t)->const svl::SharedString&{return kind==2?static_cast<const FormulaStringNameToken*>(t)->GetString():static_cast<const FormulaStringToken*>(t)->GetString();};
    auto snap=[&](const char*name,const FormulaToken*t){std::cout<<name;data(member(t));std::cout<<" "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";};
    snap("token",t);std::cout<<"source";data(s);std::cout<<"\n";
    auto*c=t->Clone();snap("clone",c);std::cout<<"equal "<<(*t==*c)<<" "<<t->TextEqual(*c)<<"\n";
    if(kind!=2){auto*str=static_cast<FormulaStringToken*>(t);auto*address=&str->GetString();str->SetString(str->GetString());snap("self_string",t);std::cout<<"same_member "<<(address==&str->GetString())<<"\n";svl::SharedString replacement(y.pData,x.pData);str->SetString(replacement);snap("assigned_string",t);std::cout<<"after_assign_equal "<<(*t==*c)<<"\n";}
    delete c;snap("clone_end",t);delete t;std::cout<<"token_end "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
   }std::cout<<"source_end "<<x.pData->refCount<<" "<<y.pData->refCount<<"\n";
  }
 } else if(mode=="ownership") {
  auto*original=new FormulaDoubleToken(9);FormulaTokenRef a(original);
  auto emit=[&](const char*label){std::cout<<label<<" "<<original->GetRef()<<" "<<(a.get()==original)<<"\n";};
  emit("raw");{FormulaTokenRef b(a);emit("copy");a=a;emit("self_copy");a=original;emit("raw_assign");FormulaTokenRef m(std::move(b));emit("move");std::cout<<"moved_null "<<(b.get()==nullptr)<<"\n";m=std::move(m);emit("self_move");a=std::move(m);emit("move_assign");auto*p=a.detach();emit("detach");a.reset(p,false);emit("adopt");a.reset(original);emit("same_reset");{FormulaConstTokenRef c(a);emit("const");}emit("const_end");{FormulaFAPToken f(ocSum,2,original);emit("fap");auto*c=f.Clone();emit("fap_copy");std::cout<<"fap_equal "<<(f==*c)<<"\n";delete c;emit("fap_copy_end");}emit("fap_end");}emit("copy_scope_end");a.reset();std::cout<<"reset_null "<<(a.get()==nullptr)<<"\n";
 } else return 3;
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
for (const mode of [
  "classification",
  "string-param",
  "stack",
  "values",
  "fields",
  "strings",
  "ownership",
]) {
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
