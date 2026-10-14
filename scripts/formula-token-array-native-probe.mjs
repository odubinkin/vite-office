/** @fileoverview Normal-only selected original FormulaTokenArray storage/recalc methods over genuine tokens; declaration scaffold is not a native full-class/ABI claim. */
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
const target = "output/playwright/formula-token-array-native";
const fixture = "apps/office/src/formula/inc/native-token-array-cases.json";
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
loadUnicodeOriginal(native.sources, "include/formula/tokenarray.hxx");
const arrayHeader = native.sources["include/formula/tokenarray.hxx"],
  arraySource = native.sources["formula/source/core/api/token.cxx"];
const tokenFixture = JSON.parse(
  readFileSync("apps/office/src/formula/inc/native-token-cases.json", "utf8"),
);
const tokenDriver = readFileSync("output/playwright/formula-token-native/driver.cpp", "utf8");
if (hash(tokenDriver) !== tokenFixture.driverHash) throw Error("Changed genuine token caller");
for (const [path, expected] of Object.entries(tokenFixture.sourceHashes)) {
  loadUnicodeOriginal(native.sources, path);
  if (hash(native.sources[path]) !== expected) throw Error("Changed token dependency " + path);
}
const compilerHeader = native.sources["include/formula/FormulaCompiler.hxx"];
const compilerDecl = compilerHeader.match(/static bool IsOpCodeJumpCommand[^;]+;/u)?.[0];
const limits = compilerHeader
  .split("\n")
  .filter(
    /** Selects exact original formula bounds. @param line - Header line. @returns Bound declaration predicate. */
    (line) => line.startsWith("#define FORMULA_MAX"),
  )
  .join("\n");
if (!compilerDecl) throw Error("Missing original static compiler declaration");
const tokenPrefix = tokenDriver
  .slice(0, tokenDriver.indexOf("void value("))
  .replace(
    "#include <formula/FormulaCompiler.hxx>",
    "#include <osl/diagnose.h>\n#include <o3tl/typed_flags_set.hxx>\n" +
      limits +
      "\nnamespace formula {class FormulaCompiler{public:" +
      compilerDecl +
      "};}",
  );
const recalc = scope(arrayHeader, "enum class ScRecalcMode", "namespace formula\n{");
const range = scope(
  arrayHeader,
  "class FORMULA_DLLPUBLIC FormulaTokenArrayStandardRange",
  "class FORMULA_DLLPUBLIC FormulaTokenArrayReferencesIterator",
);
const fieldsStart = arrayHeader.indexOf("std::unique_ptr<FormulaToken*[]> pCode");
const fields = arrayHeader.slice(fieldsStart, arrayHeader.indexOf("protected:", fieldsStart));
/** Selects a complete unchanged definition. @param signature - Original prefix. @param source - Original definition text. @returns Complete body. */
function definition(signature, source = arraySource) {
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
const arrayDefinitions = [
  "FormulaTokenArray::FormulaTokenArray()",
  "FormulaTokenArray::FormulaTokenArray( const FormulaTokenArray&",
  "FormulaTokenArray::FormulaTokenArray( FormulaTokenArray&&",
  "FormulaTokenArray::~FormulaTokenArray()",
  "void FormulaTokenArray::Finalize()",
  "void FormulaTokenArray::Assign( const FormulaTokenArray&",
  "void FormulaTokenArray::Move(",
  "void FormulaTokenArray::Assign( sal_uInt16",
  "FormulaTokenArray& FormulaTokenArray::operator=( const FormulaTokenArray&",
  "FormulaTokenArray& FormulaTokenArray::operator=( FormulaTokenArray&&",
  "void FormulaTokenArray::Clear()",
  "void FormulaTokenArray::CheckToken(",
  "void FormulaTokenArray::CheckAllRPNTokens()",
  "FormulaToken* FormulaTokenArray::AddToken(",
  "FormulaToken* FormulaTokenArray::MergeArray(",
  "FormulaToken* FormulaTokenArray::ReplaceToken(",
  "FormulaToken* FormulaTokenArray::ReplaceRPNToken(",
  "sal_uInt16 FormulaTokenArray::RemoveToken(",
  "FormulaToken* FormulaTokenArray::Add(",
  "FormulaToken* FormulaTokenArray::AddDouble(",
  "FormulaToken* FormulaTokenArray::AddString( const svl::SharedString&",
  "FormulaToken* FormulaTokenArray::AddError(",
  "void FormulaTokenArray::DelRPN()",
  "FormulaToken* FormulaTokenArray::FirstToken()",
  "FormulaToken* FormulaTokenArray::FirstRPNToken()",
  "FormulaToken* FormulaTokenArray::LastRPNToken()",
  "FormulaToken* FormulaTokenArray::PeekPrev(",
  "bool FormulaTokenArray::HasReferences()",
  "bool FormulaTokenArray::HasExternalRef()",
  "bool FormulaTokenArray::HasOpCode(",
  "bool FormulaTokenArray::HasOpCodeRPN(",
  "bool FormulaTokenArray::HasNameOrColRowName()",
  "bool FormulaTokenArray::HasOpCodes(",
  "void FormulaTokenArray::AddRecalcMode(",
]
  .map(
    /** Selects complete original array source functions. @param signature - Prefix. @returns Definition. */
    (signature) => definition(signature),
  )
  .join("\n");
const inlineNames = [
  "void SetFromRangeName(",
  "bool IsFromRangeName()",
  "void SetShareable(",
  "bool IsShareable()",
  "FormulaToken* TokenAt(",
  "OpCode OpCodeBefore(",
  "void CreateNewRPNArrayFromData(",
  "FormulaToken** GetArray()",
  "FormulaTokenArrayStandardRange Tokens()",
  "FormulaToken** GetCode()",
  "FormulaTokenArrayStandardRange RPNTokens()",
  "sal_uInt16     GetLen()",
  "sal_uInt16     GetCodeLen()",
  "FormulaError   GetCodeError()",
  "void      SetCodeError(",
  "void      SetHyperLink(",
  "bool      IsHyperLink()",
  "void SetDynamicArrayFunction(",
  "bool HasDynamicArrayFunction()",
  "ScRecalcMode    GetRecalcMode()",
  "void            SetCombinedBitsRecalcMode(",
  "ScRecalcMode    GetCombinedBitsRecalcMode()",
  "void            SetMaskedRecalcMode(",
  "void            ClearRecalcMode()",
  "void            SetExclusiveRecalcModeNormal()",
  "void            SetExclusiveRecalcModeAlways()",
  "void            SetRecalcModeForced()",
  "void            SetRecalcModeOnRefMove()",
  "bool            IsRecalcModeNormal()",
  "bool            IsRecalcModeAlways()",
  "bool            IsRecalcModeForced()",
  "bool            IsRecalcModeOnRefMove()",
  "bool            IsRecalcModeMustAfterImport()",
  "void            ClearRecalcModeMustAfterImport()",
];
const inlines = inlineNames
  .map(
    /** Selects original header body. @param signature - Header prefix. @returns Complete inline definition. */
    (signature) => definition(signature, arrayHeader),
  )
  .join("\n");
const outer = definition("inline OpCode FormulaTokenArray::GetOuterFuncOpCode()", arrayHeader);
const replaceMode = arrayHeader.match(/enum ReplaceMode\s*\{[^}]+\};/u)?.[0];
if (!replaceMode) throw Error("Missing original replace modes");
const caller = String.raw`
${tokenPrefix}
#include <sal/log.hxx>
#include <unordered_set>
#include <type_traits>
${recalc}
namespace formula {
${range}
typedef std::unordered_set<OpCode,std::hash<std::underlying_type<OpCode>::type>> unordered_opcode_set;
// Only declaration scaffold for these selected genuine definitions; no full native layout/vtable or unsupported virtual API claim.
class FormulaTokenArray {
protected:
 ${fields}
 void Assign(const FormulaTokenArray&);void Assign(sal_uInt16,FormulaToken**);void Move(FormulaTokenArray&&);FormulaToken* Add(FormulaToken*);
public:
 ${replaceMode}
 FormulaTokenArray();FormulaTokenArray(const FormulaTokenArray&);FormulaTokenArray(FormulaTokenArray&&);virtual~FormulaTokenArray();
 FormulaTokenArray&operator=(const FormulaTokenArray&);FormulaTokenArray&operator=(FormulaTokenArray&&);
 virtual void Clear();void Finalize();void DelRPN();virtual void CheckToken(const FormulaToken&);void CheckAllRPNTokens();virtual FormulaToken*MergeArray();
 FormulaToken*AddToken(const FormulaToken&);FormulaToken*AddDouble(double);FormulaToken*AddString(const svl::SharedString&);FormulaToken*AddError(FormulaError);
 FormulaToken*ReplaceToken(sal_uInt16,FormulaToken*,ReplaceMode);FormulaToken*ReplaceRPNToken(sal_uInt16,FormulaToken*);sal_uInt16 RemoveToken(sal_uInt16,sal_uInt16);
 FormulaToken*FirstToken()const;FormulaToken*FirstRPNToken()const;FormulaToken*LastRPNToken()const;FormulaToken*PeekPrev(sal_uInt16&)const;
 bool HasReferences()const;bool HasExternalRef()const;bool HasOpCode(OpCode)const;bool HasOpCodeRPN(OpCode)const;bool HasNameOrColRowName()const;bool HasOpCodes(const unordered_opcode_set&)const;
 void AddRecalcMode(ScRecalcMode);OpCode GetOuterFuncOpCode()const;
 ${inlines}
};
${arrayDefinitions}
${outer}
}
struct Exposed:FormulaTokenArray{using FormulaTokenArray::Add;using FormulaTokenArray::Assign;using FormulaTokenArray::FormulaTokenArray;bool finalized()const{return mbFinalized;}};
void mode(const char*label,const FormulaTokenArray&v){std::cout<<label<<" "<<int(v.GetRecalcMode())<<" "<<int(v.GetCombinedBitsRecalcMode())<<" "<<v.IsRecalcModeNormal()<<" "<<v.IsRecalcModeAlways()<<" "<<v.IsRecalcModeForced()<<" "<<v.IsRecalcModeOnRefMove()<<" "<<v.IsRecalcModeMustAfterImport()<<"\n";}
void tok(const FormulaToken*t){if(!t){std::cout<<"-";return;}std::cout<<int(t->GetType())<<","<<int(t->GetOpCode());if(auto d=dynamic_cast<const FormulaDoubleToken*>(t))std::cout<<","<<std::bit_cast<uint64_t>(d->GetDouble());}
void state(const char*label,const Exposed&v){std::cout<<label<<" "<<v.GetLen()<<" "<<v.GetCodeLen()<<" "<<int(v.GetCodeError())<<" "<<v.IsHyperLink()<<" "<<v.IsFromRangeName()<<" "<<v.IsShareable()<<" "<<v.HasDynamicArrayFunction()<<" "<<v.finalized()<<" "<<(v.GetArray()!=nullptr)<<" "<<(v.GetCode()!=nullptr)<<" |";for(auto t:v.Tokens()){std::cout<<" ";tok(t);}std::cout<<" |";for(auto t:v.RPNTokens()){std::cout<<" ";tok(t);std::cout<<":";int index=-1;for(int i=0;i<v.GetLen();++i)if(v.TokenAt(i)==t){index=i;break;}std::cout<<index;}std::cout<<" | ";tok(v.FirstToken());std::cout<<" ";tok(v.FirstRPNToken());std::cout<<" ";tok(v.LastRPNToken());std::cout<<" "<<int(v.GetOuterFuncOpCode())<<" | "<<v.HasReferences()<<" "<<v.HasExternalRef()<<" "<<v.HasNameOrColRowName()<<" "<<v.HasOpCodes(unordered_opcode_set{ocSum,ocName})<<" "<<v.HasOpCodes(unordered_opcode_set{ocCos})<<"\n";for(unsigned i:{0u,1u,2u,65535u,65536u}){sal_uInt16 pos=i;auto prev=v.PeekPrev(pos);std::cout<<"query "<<i<<" "<<int(v.OpCodeBefore(i))<<" "<<pos<<" ";tok(prev);std::cout<<" ";tok(v.TokenAt(i));std::cout<<"\n";}std::cout<<"ops "<<v.HasOpCode(ocSum)<<" "<<v.HasOpCode(ocCos)<<" "<<v.HasOpCodeRPN(ocSum)<<" "<<v.HasOpCodeRPN(ocCos)<<"\n";}
void rpn(Exposed&v,std::initializer_list<FormulaToken*> list){std::vector<FormulaToken*>data(list);for(auto*t:data)t->IncRef();v.CreateNewRPNArrayFromData(data.data(),data.size());}
int main(int argc,char**argv){if(argc!=2)return 2;std::string kind=argv[1];
 if(kind=="recalc"){for(int initial:{0,1,2,4,8,16,32,64,127,128,255})for(int bit=0;bit<256;++bit){Exposed v;v.SetMaskedRecalcMode(static_cast<ScRecalcMode>(initial));v.SetCombinedBitsRecalcMode(static_cast<ScRecalcMode>(bit));mode("combined",v);v.SetMaskedRecalcMode(static_cast<ScRecalcMode>(initial));v.AddRecalcMode(static_cast<ScRecalcMode>(bit));mode("added",v);v.ClearRecalcModeMustAfterImport();mode("clearimport",v);v.SetExclusiveRecalcModeAlways();mode("always",v);v.SetRecalcModeForced();v.SetRecalcModeOnRefMove();mode("extra",v);v.SetExclusiveRecalcModeNormal();mode("normal",v);v.ClearRecalcMode();mode("clear",v);}}
 else if(kind=="arrays"){Exposed v;state("default",v);v.Finalize();state("emptyfinal",v);v.SetCodeError(FormulaError::DivisionByZero);v.SetHyperLink(true);v.SetFromRangeName(true);v.SetShareable(false);v.SetDynamicArrayFunction(true);mode("meta",v);v.AddDouble(-0.0);v.AddError(FormulaError::DivisionByZero);svl::SharedString s(OUString(u"A",1));v.AddString(s);v.AddToken(FormulaByteToken(ocSum,2));state("added",v);rpn(v,{v.TokenAt(0),v.TokenAt(3),v.TokenAt(0)});v.CheckAllRPNTokens();state("rpn",v);v.Finalize();state("originalfinal",v);
 Exposed copy(v);state("copy",copy);std::cout<<"same_tokens "<<(copy.TokenAt(0)==v.TokenAt(0))<<"\n";copy.Finalize();state("copyfinal",copy);auto add=copy.AddDouble(9.5);std::cout<<"finaladd "<<(add==nullptr)<<"\n";Exposed moved(std::move(copy));state("moved",moved);state("movesource",copy);std::cout<<"movesourceadd "<<(copy.AddDouble(9.5)==nullptr)<<"\n";Exposed target;target=static_cast<const Exposed&>(v);state("assigned",target);target=target;state("selfcopy",target);target=std::move(target);state("selfmove",target);
 Exposed transfer;transfer=std::move(moved);state("moveassigned",transfer);state("moveassignedsource",moved);transfer.DelRPN();state("delrpn",transfer);transfer.Clear();state("clear",transfer);rpn(transfer,{});transfer.DelRPN();state("zero_rpn",transfer);Exposed zeroCopy(transfer);state("zero_copy",zeroCopy);transfer.Clear();
 FormulaTokenRef sep(new FormulaToken(svSep,ocArrayClose));std::cout<<"merge "<<(transfer.Add(sep.get())==nullptr)<<"\n";state("merged",transfer);
 Exposed xml;FormulaTokenRef placeholder(new FormulaStringOpToken(ocStringXML,s));FormulaToken*data[]={placeholder.get()};xml.Assign(1,data);state("xml",xml);Exposed xmlzero;xmlzero.Assign(0,data);state("xmlzero",xmlzero);
 FormulaTokenRef ref(new FormulaToken(svSingleRef)),ext(new FormulaToken(svExternalDoubleRef)),index(new FormulaIndexToken(ocName,4)),colname(new FormulaByteToken(ocColRowName));for(auto t:{ref,ext,index,colname}){Exposed q;q.Add(t.get());state("predicate",q);}Exposed qrpn;rpn(qrpn,{ref.get()});state("rpnref",qrpn);
 for(int replacement=0;replacement<2;++replacement){Exposed q;q.AddDouble(1);q.AddDouble(2);rpn(q,{q.TokenAt(0),q.TokenAt(0),q.TokenAt(1)});auto oldRange=q.Tokens();FormulaTokenRef next(new FormulaDoubleToken(7));std::cout<<"replace "<<(q.ReplaceToken(0,next.get(),static_cast<FormulaTokenArray::ReplaceMode>(replacement))==next.get())<<"\n";std::cout<<"live_range ";tok(*oldRange.begin());std::cout<<"\n";state("replaced",q);std::cout<<"rpnreplace "<<(q.ReplaceRPNToken(1,next.get())==next.get())<<" "<<(q.ReplaceRPNToken(99,next.get())==nullptr)<<" "<<(q.ReplaceToken(99,next.get(),FormulaTokenArray::CODE_ONLY)==nullptr)<<"\n";state("rpnreplaced",q);}
 for(int adjacency=0;adjacency<3;++adjacency){Exposed q;FormulaTokenRef x(new FormulaDoubleToken(1)),y(new FormulaDoubleToken(2));q.Add(x.get());q.Add(y.get());if(adjacency==0)rpn(q,{x.get(),x.get(),x.get(),y.get()});if(adjacency==1)rpn(q,{x.get(),y.get(),x.get()});if(adjacency==2)rpn(q,{y.get()});std::cout<<"removed "<<q.RemoveToken(0,1)<<"\n";state("removedstate",q);std::cout<<"invalidremove "<<q.RemoveToken(99,1)<<" "<<q.RemoveToken(0,0)<<"\n";state("zeroremove",q);std::cout<<"clampremove "<<q.RemoveToken(0,3)<<"\n";state("clamped",q);}
 Exposed limit;for(int i=0;i<8191;++i)limit.AddDouble(i);std::cout<<"limit "<<limit.GetLen()<<" "<<(limit.AddDouble(9)==nullptr)<<" "<<limit.GetLen()<<" ";tok(limit.TokenAt(8191));std::cout<<" "<<(limit.AddDouble(10)==nullptr)<<" "<<limit.GetLen()<<"\n";
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
for (const mode of ["recalc", "arrays"]) {
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
    tokenPrefix: hash(tokenPrefix),
    recalc: hash(recalc),
    range: hash(range),
    fields: hash(fields),
    arrayDefinitions: hash(arrayDefinitions),
    inlines: hash(inlines),
    outer: hash(outer),
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
