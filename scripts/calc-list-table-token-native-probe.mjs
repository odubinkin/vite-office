/** @fileoverview Normal-only original list/table reference token classes over genuine formula/address/reference headers; no runtime memory manager. */
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
const target = "output/playwright/calc-list-table-token-native";
const fixture = "apps/office/src/sc/source/core/tool/native-list-table-token-cases.json";
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
const listClass = scope(header, "class ScRefListToken final", "class ScEmptyCellToken final");
const tableClass = scope(
  header,
  "class ScTableRefToken final",
  "// Only created from within the interpreter",
);
const listDefinitions = scope(
  source,
  "const ScRefList*        ScRefListToken::GetRefList()",
  "ScMatrixToken::ScMatrixToken(",
);
const tableDefinitions = scope(
  source,
  "ScTableRefToken::ScTableRefToken(",
  "ScJumpMatrixToken::ScJumpMatrixToken(",
);
const listAlias = scope(
  header,
  "typedef ::std::vector< ScComplexRefData > ScRefList;",
  "#if DEBUG_FORMULA_COMPILER",
);
const caller = String.raw`
${referencePrefix}
${listAlias}
${listClass}
${tableClass}
${listDefinitions}
${tableDefinitions}
void data(const ScComplexRefData& a){std::cout<<" "<<a.Ref1.Col()<<" "<<a.Ref1.Row()<<" "<<a.Ref1.Tab()<<" "<<unsigned(a.Ref1.FlagValue())<<" "<<a.Ref2.Col()<<" "<<a.Ref2.Row()<<" "<<a.Ref2.Tab()<<" "<<unsigned(a.Ref2.FlagValue())<<" "<<a.bTrimToData;}
void state(const char*label,const ScRefListToken&a){std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode())<<" "<<a.IsArrayResult()<<" "<<a.GetRefList()->size();for(auto&ref:*a.GetRefList())data(ref);std::cout<<"\n";}
void state(const char*label,const ScTableRefToken&a,const FormulaToken*expected=nullptr){auto*area=a.GetAreaRefRPN();std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode())<<" "<<a.GetIndex()<<" "<<int(a.GetItem())<<" "<<(area==expected)<<" "<<(area?int(area->GetType()):-1);if(area&&area->GetType()==svDouble)std::cout<<" "<<std::bit_cast<uint64_t>(static_cast<const FormulaDoubleToken*>(area)->GetDouble());if(area&&area->GetType()==svRefList){auto&r=static_cast<const ScRefListToken&>(*area);std::cout<<" "<<r.IsArrayResult()<<" "<<r.GetRefList()->size();}std::cout<<"\n";}
void compare(const char*label,const FormulaToken&a,const FormulaToken&b){std::cout<<label<<" "<<(a==b)<<" "<<a.TextEqual(b)<<" "<<(b==a)<<" "<<b.TextEqual(a)<<"\n";}
int main(){FormulaTokenRef number(new FormulaDoubleToken(2.5)),otherNumber(new FormulaDoubleToken(4.5)),equalNumber(new FormulaDoubleToken(2.5));ScSheetLimits limits(20,30);ScComplexRefData ref;ref.InitRange(1,2,3,4,5,6);ScRefListToken defaultList;state("defaultlist",defaultList);
 for(bool flag:{false,true})for(int size=0;size<4;++size){ScRefListToken a(flag);for(int i=0;i<size;++i){ref.InitRange(i,i+1,i+2,i+3,i+4,i+5);ref.bTrimToData=(i&1)!=0;a.GetRefList()->push_back(ref);}ScRefListToken copy(a);FormulaTokenRef clone(a.Clone());auto&cl=static_cast<ScRefListToken&>(*clone);state("list",a);state("listcopy",copy);state("listclone",cl);compare("listself",a,a);compare("listequal",a,copy);compare("listcloneequal",a,cl);compare("listbase",a,*number);auto*member=a.GetRefList();const ScComplexRefData*element=size?&member->front():nullptr;ScRefListToken moved(std::move(a));state("listmoved",moved);state("listsource",a);std::cout<<"listidentity "<<(member==a.GetRefList())<<" "<<(member!=moved.GetRefList())<<" "<<(size?element==&moved.GetRefList()->front():true)<<"\n";if(size){moved.GetRefList()->front().Ref1.InitAddress(9,10,11);state("listchanged",moved);state("listcopyretained",copy);cl.GetRefList()->back().Ref2.InitAddress(12,13,14);state("listclonechanged",cl);}ref.InitRange(2,3,4,5,6,7);a.GetRefList()->push_back(ref);state("listsourceappend",a);moved.GetRefList()->clear();state("listcleared",moved);}
 FormulaTokenRef list(new ScRefListToken(true));static_cast<ScRefListToken&>(*list).GetRefList()->push_back(ref);ScSingleRefData sr;sr.InitAddress(1,2,3);FormulaTokenRef single(new ScSingleRefToken(limits,sr));
 for(int index:{-65537,-1,0,1,65535,65536})for(auto item:{ScTableRefToken::TABLE,ScTableRefToken::ALL,ScTableRefToken::HEADERS,ScTableRefToken::DATA,ScTableRefToken::TOTALS,ScTableRefToken::THIS_ROW,ScTableRefToken::HEADERS_DATA,ScTableRefToken::DATA_TOTALS})for(auto area:{FormulaTokenRef(),number,list,single}){ScTableRefToken a(static_cast<sal_uInt16>(index),item);a.SetAreaRefRPN(area.get());ScTableRefToken copy(a);FormulaTokenRef clone(a.Clone());auto&cl=static_cast<ScTableRefToken&>(*clone);state("table",a,area.get());state("tablecopy",copy,area.get());state("tableclone",cl,area.get());compare("tableself",a,a);compare("tablecopyequal",a,copy);compare("tablecloneequal",a,cl);compare("tablebase",a,*number);
 ScTableRefToken di(static_cast<sal_uInt16>(index+1),item),dit(static_cast<sal_uInt16>(index),static_cast<ScTableRefToken::Item>(item^16)),da(static_cast<sal_uInt16>(index),item);di.SetAreaRefRPN(area.get());dit.SetAreaRefRPN(area.get());da.SetAreaRefRPN(area?nullptr:number.get());compare("tableindex",a,di);compare("tableitem",a,dit);compare("tablenullarea",a,da);ScTableRefToken left(static_cast<sal_uInt16>(index),item),right(static_cast<sal_uInt16>(index),item);left.SetAreaRefRPN(number.get());right.SetAreaRefRPN(otherNumber.get());compare("tableareaunequal",left,right);right.SetAreaRefRPN(equalNumber.get());compare("tableareaequal",left,right);
 for(auto added:{ScTableRefToken::HEADERS,ScTableRefToken::DATA,ScTableRefToken::TOTALS,ScTableRefToken::THIS_ROW})a.AddItem(added);a.SetIndex(static_cast<sal_uInt16>(index+1));state("tablechanged",a,area.get());state("tablecopyretained",copy,area.get());a.SetAreaRefRPN(nullptr);state("tablecleared",a);}
 ScTableRefToken aliased(2,ScTableRefToken::DATA);aliased.SetAreaRefRPN(number.get());ScTableRefToken independent(aliased);FormulaTokenRef cloned(aliased.Clone());static_cast<FormulaDoubleToken&>(*number).SetDouble(9.5);state("tablealiaschanged",aliased,number.get());state("tableindependent",independent,number.get());state("tableindependentclone",static_cast<const ScTableRefToken&>(*cloned),number.get());
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
    referencePrefix: hash(referencePrefix),
    listAlias: hash(listAlias),
    listClass: hash(listClass),
    tableClass: hash(tableClass),
    listDefinitions: hash(listDefinitions),
    tableDefinitions: hash(tableDefinitions),
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
