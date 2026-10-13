/** @fileoverview Normal-only original reference token classes over genuine formula/address/reference headers; no runtime memory manager. */
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
const target = "output/playwright/calc-reference-token-native";
const fixture = "apps/office/src/sc/source/core/tool/native-reference-token-cases.json";
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

const tokenFixture = JSON.parse(
  readFileSync("apps/office/src/formula/inc/native-token-cases.json", "utf8"),
);
const tokenDriver = readFileSync("output/playwright/formula-token-native/driver.cpp", "utf8");
if (hash(tokenDriver) !== tokenFixture.driverHash) throw Error("Changed genuine token caller");
for (const [path, expected] of Object.entries(tokenFixture.sourceHashes)) {
  loadUnicodeOriginal(native.sources, path);
  if (hash(native.sources[path]) !== expected) throw Error("Changed token dependency " + path);
}
const prefixEnd = tokenDriver.indexOf("void value(");
if (prefixEnd < 0) throw Error("Missing genuine token definitions");
const tokenPrefix = tokenDriver.slice(0, prefixEnd);
for (const path of [
  "sc/inc/token.hxx",
  "sc/source/core/tool/token.cxx",
  "sc/inc/refdata.hxx",
  "sc/source/core/tool/refdata.cxx",
  "sc/inc/address.hxx",
  "sc/inc/sheetlimits.hxx",
])
  loadUnicodeOriginal(native.sources, path);
/** Selects one complete unchanged source definition. @param source - Original text. @param signature - Unique prefix. @returns Original function. */
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
  if (depth) throw Error("Incomplete source body");
  return source.slice(start, end);
}
const classes = scope(
  native.sources["sc/inc/token.hxx"],
  "class SAL_DLLPUBLIC_RTTI ScSingleRefToken",
  "class SAL_DLLPUBLIC_RTTI ScMatrixToken",
);
const source = native.sources["sc/source/core/tool/token.cxx"];
const helper = definition(source, "bool checkTextEqual(");
const methods = scope(source, "bool ScSingleRefToken::TextEqual(", "const ScRefList*");
loadUnicodeOriginal(native.sources, "salhelper/source/simplereferenceobject.cxx");
const refSource = native.sources["sc/source/core/tool/refdata.cxx"];
const refDefinitions = [
  "void ScSingleRefData::InitAddress( const ScAddress&",
  "void ScSingleRefData::InitAddress( SCCOL",
  "void ScSingleRefData::SetColDeleted(",
  "void ScSingleRefData::SetRowDeleted(",
  "void ScSingleRefData::SetTabDeleted(",
  "ScAddress ScSingleRefData::toAbs( const ScSheetLimits&",
  "SCROW ScSingleRefData::Row()",
  "SCCOL ScSingleRefData::Col()",
  "SCTAB ScSingleRefData::Tab()",
  "bool ScSingleRefData::operator==(",
  "ScRange ScComplexRefData::toAbs( const ScSheetLimits&",
]
  .map(
    /** Extracts doc-free original bodies. @param signature - Source prefix. @returns Whole function. */ (
      signature,
    ) => definition(refSource, signature),
  )
  .join("\n");
const caller = String.raw`
${tokenPrefix}
#include <address.hxx>
#include <refdata.hxx>
#include <sheetlimits.hxx>
#include <cassert>
${classes}
${refDefinitions}
namespace { ${helper} }
${methods}
ScSingleRefData reference(int c,int r,int t,unsigned f){ScSingleRefData a;a.InitAddress(c,r,t);a.SetColRel(f&1);a.SetColDeleted(f&2);a.SetRowRel(f&4);a.SetRowDeleted(f&8);a.SetTabRel(f&16);a.SetTabDeleted(f&32);a.SetFlag3D(f&64);a.SetRelName(f&128);return a;}
void data(const ScSingleRefData& a){auto b=a;b.SetColDeleted(false);b.SetRowDeleted(false);b.SetTabDeleted(false);std::cout<<" "<<b.Col()<<" "<<b.Row()<<" "<<b.Tab()<<" "<<unsigned(a.FlagValue());}
void state(const char*label,const ScSingleRefToken&a){std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode());data(a.GetSingleRef());std::cout<<"\n";}
void state(const char*label,const ScDoubleRefToken&a){std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode());data(a.GetSingleRef());data(a.GetSingleRef2());std::cout<<" "<<a.GetDoubleRef().bTrimToData<<"\n";}
void compare(const char*label,const FormulaToken&a,const FormulaToken&b){std::cout<<label<<" "<<(a==b)<<" "<<a.TextEqual(b)<<" "<<(b==a)<<" "<<b.TextEqual(a)<<"\n";}
int main(){ScSheetLimits limits(20,30),small(1,1);FormulaDoubleToken number(2.5);
for(unsigned f=0;f<256;++f)for(auto coords:{std::array<int,3>{-1,-1,-1},{0,0,0},{4,5,3},{100,200,10000}})for(auto op:{ocPush,ocColRowName}){
 auto a=reference(coords[0],coords[1],coords[2],f),original=a;ScSingleRefToken s(limits,a,op),copy(s);formula::FormulaTokenRef clone(s.Clone());auto& sc=static_cast<ScSingleRefToken&>(*clone);state("single",s);state("singlecopy",copy);state("singleclone",sc);compare("singleequal",s,copy);compare("singlecloneequal",s,sc);compare("singlebase",s,number);
 auto different=reference(coords[0],coords[1]+1,coords[2],f);ScSingleRefToken ds(limits,different,op),fs(limits,reference(coords[0],coords[1],coords[2],f^64),op),os(limits,original,op==ocPush?ocColRowName:ocPush);compare("singlecoords",s,ds);compare("singleflags",s,fs);compare("singleopcode",s,os);
 a.InitAddress(8,9,10);state("singleinput",s);auto* member=&s.GetSingleRef();s.GetSingleRef().InitAddress(11,12,13);state("singlemutated",s);state("singlecopyretained",copy);sc.GetSingleRef().InitAddress(14,15,16);state("singleclonemutated",sc);std::cout<<"singleidentity "<<(&s.GetSingleRef()==member)<<" "<<(&copy.GetSingleRef()!=member)<<" "<<(&sc.GetSingleRef()!=member)<<"\n";
 ScComplexRefData range;range.Ref1=original;range.Ref2=different;range.bTrimToData=(f&1)!=0;ScDoubleRefToken d(limits,range,op),dc(d);formula::FormulaTokenRef dclone(d.Clone());auto& dcl=static_cast<ScDoubleRefToken&>(*dclone);state("double",d);state("doublecopy",dc);state("doubleclone",dcl);compare("doubleequal",d,dc);compare("doublecloneequal",d,dcl);compare("doublebase",d,number);compare("doublekind",d,copy);
 auto changed=range;changed.Ref1=reference(coords[0]+1,coords[1],coords[2],f);ScDoubleRefToken dx(limits,changed,op);compare("doublecoords",d,dx);changed=range;changed.Ref1=reference(coords[0],coords[1],coords[2],f^64);ScDoubleRefToken df(limits,changed,op);compare("doublefirstflags",d,df);changed=range;changed.Ref2=reference(coords[0],coords[1]+1,coords[2],f^128);ScDoubleRefToken d2(limits,changed,op);compare("doublesecondflags",d,d2);changed=range;changed.bTrimToData=!changed.bTrimToData;ScDoubleRefToken dt(limits,changed,op);compare("doubletrim",d,dt);ScDoubleRefToken dop(limits,range,op==ocPush?ocColRowName:ocPush);compare("doubleopcode",d,dop);
 range.InitRange(7,8,9,10,11,12);state("doubleinput",d);auto* dm=&d.GetDoubleRef();d.GetSingleRef().InitAddress(11,12,13);d.GetSingleRef2().InitAddress(14,15,16);state("doublemutated",d);state("doublecopyretained",dc);dcl.GetDoubleRef().InitRange(17,18,19,20,21,22);state("doubleclonemutated",dcl);std::cout<<"doubleidentity "<<(&d.GetDoubleRef()==dm)<<" "<<(&d.GetSingleRef()==&dm->Ref1)<<" "<<(&d.GetSingleRef2()==&dm->Ref2)<<" "<<(&dc.GetDoubleRef()!=dm)<<" "<<(&dcl.GetDoubleRef()!=dm)<<"\n";
}
ScSingleRefToken defaultSingle(limits,reference(1,2,3,0));ScComplexRefData normal,reversed;normal.InitRange(1,2,3,4,5,6);reversed.InitRange(4,5,6,1,2,3);ScDoubleRefToken defaultDouble(limits,normal),reverse(limits,reversed);state("defaultsingle",defaultSingle);state("defaultdouble",defaultDouble);compare("normalized",defaultDouble,reverse);
ScSingleRefToken left(small,reference(4,4,0,0)),right(limits,reference(5,5,0,0)),leftcopy(left);formula::FormulaTokenRef lc(left.Clone());compare("bounds",left,right);compare("copybounds",leftcopy,right);compare("clonebounds",*lc,right);
}
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
    tokenPrefix: hash(tokenPrefix),
    classes: hash(classes),
    helper: hash(helper),
    methods: hash(methods),
    refDefinitions: hash(refDefinitions),
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
