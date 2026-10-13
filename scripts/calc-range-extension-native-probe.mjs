/** @fileoverview Normal-only original range-reference logical operation over genuine local/external/list classes over genuine formula/address/reference headers; no runtime memory manager. */
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
const target = "output/playwright/calc-range-extension-native";
const fixture = "apps/office/src/sc/source/core/tool/native-range-extension-cases.json";
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
  readFileSync("apps/office/src/sc/source/core/tool/native-external-token-cases.json", "utf8"),
);
const previousDriver = readFileSync(
  "output/playwright/calc-external-token-native/driver.cpp",
  "utf8",
);
if (hash(previousDriver) !== previousFixture.driverHash)
  throw Error("Changed genuine external caller");
for (const [path, expected] of Object.entries(previousFixture.sourceHashes)) {
  loadUnicodeOriginal(native.sources, path);
  if (hash(native.sources[path]) !== expected)
    throw Error("Changed genuine reference input " + path);
}
const end = previousDriver.indexOf("svl::SharedString name(");
if (end < 0) throw Error("Missing full actual external prefix");
const referencePrefix = previousDriver.slice(0, end),
  header = native.sources["sc/inc/token.hxx"],
  source = native.sources["sc/source/core/tool/token.cxx"],
  refSource = native.sources["sc/source/core/tool/refdata.cxx"];
/** Selects one complete unchanged original function. @param source - Original text. @param signature - Unique prefix. @returns Function. */
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
  if (depth) throw Error("Incomplete original");
  return source.slice(start, end);
}
const listAlias = scope(
  header,
  "typedef ::std::vector< ScComplexRefData > ScRefList;",
  "#if DEBUG_FORMULA_COMPILER",
);
const listClass = scope(header, "class ScRefListToken final", "class ScEmptyCellToken final");
const listDefinitions = scope(
  source,
  "const ScRefList*        ScRefListToken::GetRefList()",
  "ScMatrixToken::ScMatrixToken(",
);
const refDefinitions = [
  "void ScSingleRefData::SetAbsCol(",
  "void ScSingleRefData::SetRelCol(",
  "void ScSingleRefData::SetAbsRow(",
  "void ScSingleRefData::SetRelRow(",
  "void ScSingleRefData::SetAbsTab(",
  "void ScSingleRefData::SetRelTab(",
  "void ScSingleRefData::SetAddress( const ScSheetLimits&",
  "void ScComplexRefData::SetRange( const ScSheetLimits&",
  "ScComplexRefData& ScComplexRefData::Extend( const ScSheetLimits& rLimits, const ScSingleRefData",
  "ScComplexRefData& ScComplexRefData::Extend( const ScSheetLimits& rLimits, const ScComplexRefData",
]
  .map(
    /** Selects original doc-free geometry bodies. @param signature - Prefix. @returns Body. */ (
      signature,
    ) => definition(refSource, signature),
  )
  .join("\n");
const extension = definition(source, "FormulaTokenRef extendRangeReference(");
const caller = String.raw`
${referencePrefix}
${listAlias}
${listClass}
${listDefinitions}
${refDefinitions}
${extension}
ScSingleRefData reference(int seed,unsigned f){ScSingleRefData a;a.InitAddress(seed*2-3,seed*3,seed-1);a.SetColRel(f&1);a.SetColDeleted(f&2);a.SetRowRel(f&4);a.SetRowDeleted(f&8);a.SetTabRel(f&16);a.SetTabDeleted(f&32);a.SetFlag3D(f&64);a.SetRelName(f&128);return a;}
FormulaTokenRef make(int kind,int seed,unsigned f,ScSheetLimits&limits){auto r=reference(seed,f);ScComplexRefData range;range.Ref1=r;range.Ref2=reference(seed+1,f^16);range.bTrimToData=(f&1)!=0;switch(kind){case 0:return new FormulaDoubleToken(2.5);case 1:return new ScSingleRefToken(limits,r);case 2:return new ScDoubleRefToken(limits,range,(f&4)?ocColRowName:ocPush);case 3:{auto*list=new ScRefListToken((f&128)!=0);list->GetRefList()->push_back(range);range.Ref1=reference(seed+2,f^64);list->GetRefList()->push_back(range);return list;}case 4:return new ScRefListToken();case 5:return new ScExternalSingleRefToken(27,svl::SharedString(OUString(u"Sheet",5)),r);case 6:return new ScExternalDoubleRefToken(27,svl::SharedString(OUString(u"Sheet",5)),range);case 7:return new ScExternalNameToken(27,svl::SharedString(OUString(u"Name",4)));default:std::abort();}}
void data(const ScSingleRefData&a){auto b=a;b.SetColDeleted(false);b.SetRowDeleted(false);b.SetTabDeleted(false);std::cout<<" "<<b.Col()<<" "<<b.Row()<<" "<<b.Tab()<<" "<<unsigned(a.FlagValue());}
void range(const ScComplexRefData&a){data(a.Ref1);data(a.Ref2);std::cout<<" "<<a.bTrimToData;}
void state(const char*label,const FormulaToken*p){std::cout<<label;if(!p){std::cout<<" null\n";return;}std::cout<<" "<<int(p->GetType())<<" "<<int(p->GetOpCode());switch(p->GetType()){case svSingleRef:data(static_cast<const ScSingleRefToken&>(*p).GetSingleRef());break;case svDoubleRef:range(static_cast<const ScDoubleRefToken&>(*p).GetDoubleRef());break;case svExternalSingleRef:{const auto&r=static_cast<const ScExternalSingleRefToken&>(*p);std::cout<<" "<<r.GetFileId();data(r.GetSingleRef());break;}case svExternalDoubleRef:{const auto&r=static_cast<const ScExternalDoubleRefToken&>(*p);std::cout<<" "<<r.GetFileId();range(r.GetDoubleRef());break;}case svRefList:{const auto&v=*static_cast<const ScRefListToken&>(*p).GetRefList();std::cout<<" "<<v.size();for(auto&r:v)range(r);break;}default:break;}std::cout<<"\n";}
int main(){ScSheetLimits limits(20,30);for(int pos=0;pos<2;++pos)for(int k1=0;k1<8;++k1)for(int k2=0;k2<8;++k2)for(unsigned f1:{0,1,4,16,64,128,255})for(unsigned f2:{0,1,4,16,64,128,255})for(bool reuse:{false,true}){ScAddress p=pos?ScAddress(2,3,1):ScAddress();auto a=make(k1,1,f1,limits),b=make(k2,2,f2,limits);FormulaTokenRef alias1(a),alias2(b);auto result=extendRangeReference(limits,*a,*b,p,reuse);std::cout<<"case "<<pos<<" "<<k1<<" "<<k2<<" "<<f1<<" "<<f2<<" "<<reuse<<"\n";state("result",result.get());state("left",a.get());state("right",b.get());std::cout<<"identity "<<(result.get()==a.get())<<" "<<(result.get()==b.get())<<"\n";}}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [
  "-DNDEBUG",
  "-DSALHELPER_DLLIMPLEMENTATION",
  "-I" + target + "/generated",
  "-I" + boostRoot,
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
  scopes: {
    referencePrefix: hash(referencePrefix),
    listAlias: hash(listAlias),
    listClass: hash(listClass),
    listDefinitions: hash(listDefinitions),
    refDefinitions: hash(refDefinitions),
    extension: hash(extension),
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
