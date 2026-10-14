/** @fileoverview Normal-only original external reference/name token classes over genuine formula/address/reference headers; no runtime memory manager. */
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
const target = "output/playwright/calc-external-token-native";
const fixture = "apps/office/src/sc/source/core/tool/native-external-token-cases.json";
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
const externalClasses = scope(
  header,
  "class SC_DLLPUBLIC ScExternalToken",
  "/** Special token to remember",
);
const externalDefinitions = scope(
  source,
  "ScExternalToken::ScExternalToken(",
  "ScTableRefToken::ScTableRefToken(",
);
const caller = String.raw`
${referencePrefix}
${externalClasses}
${externalDefinitions}
svl::SharedString name(int mode){if(mode==0)return {};if(mode==1)return svl::SharedString(OUString(u"",0));if(mode==2)return svl::SharedString(OUString(u"Sheet\0One",9));if(mode==3)return svl::SharedString(OUString(u"\u03b1\U0001F600",3));OUString original(u"Mixed",5),folded(u"MIXED",5);return svl::SharedString(original.pData,folded.pData);}
void stringState(const svl::SharedString& s){std::cout<<" "<<s.isValid()<<" "<<s.isEmpty()<<" "<<s.getLength()<<" "<<(s.getData()==nullptr)<<" "<<(s.getDataIgnoreCase()==nullptr);for(auto&v:{s.getString(),s.getIgnoreCaseString()}){std::cout<<" |";for(sal_Int32 i=0;i<v.getLength();++i)std::cout<<" "<<unsigned(v[i]);}}
ScSingleRefData reference(unsigned f){ScSingleRefData a;a.InitAddress(-1,5,3);a.SetColRel(f&1);a.SetColDeleted(f&2);a.SetRowRel(f&4);a.SetRowDeleted(f&8);a.SetTabRel(f&16);a.SetTabDeleted(f&32);a.SetFlag3D(f&64);a.SetRelName(f&128);return a;}
void data(const ScSingleRefData&a){auto b=a;b.SetColDeleted(false);b.SetRowDeleted(false);b.SetTabDeleted(false);std::cout<<" "<<b.Col()<<" "<<b.Row()<<" "<<b.Tab()<<" "<<unsigned(a.FlagValue());}
void state(const char*label,const ScExternalSingleRefToken&a){std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode())<<" "<<a.GetFileId();data(a.GetSingleRef());stringState(a.GetTableName());std::cout<<"\n";}
void state(const char*label,const ScExternalDoubleRefToken&a){std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode())<<" "<<a.GetFileId();data(a.GetSingleRef());data(a.GetSingleRef2());std::cout<<" "<<a.GetDoubleRef().bTrimToData;stringState(a.GetTableName());std::cout<<"\n";}
void state(const char*label,const ScExternalNameToken&a){std::cout<<label<<" "<<int(a.GetType())<<" "<<int(a.GetOpCode())<<" "<<a.GetFileId();stringState(a.GetName());std::cout<<"\n";}
void compare(const char*label,const FormulaToken&a,const FormulaToken&b){std::cout<<label<<" "<<(a==b)<<" "<<a.TextEqual(b)<<" "<<(b==a)<<" "<<b.TextEqual(a)<<"\n";}
int main(){FormulaDoubleToken number(2.5);for(int id:{-65537,-1,0,1,65535,65536,65537})for(int mode=0;mode<5;++mode)for(unsigned f:{0,1,2,4,8,16,32,64,128,255}){
 auto input=name(mode);auto ref=reference(f);ScComplexRefData range;range.Ref1=ref;range.Ref2=ref;range.Ref2.InitAddress(4,6,7);range.bTrimToData=(f&1)!=0;
 ScExternalSingleRefToken a(static_cast<sal_uInt16>(id),input,ref),copy(a);FormulaTokenRef clone(a.Clone());auto&cl=static_cast<ScExternalSingleRefToken&>(*clone);state("single",a);state("singlecopy",copy);state("singleclone",cl);compare("singleequal",a,copy);compare("singlecloneequal",a,cl);compare("singlebase",a,number);
 ScExternalSingleRefToken file(static_cast<sal_uInt16>(id+1),input,ref),different(static_cast<sal_uInt16>(id),name(2),reference(f^128));compare("singlefile",a,file);compare("singledifferent",a,different);ScExternalSingleRefToken named(static_cast<sal_uInt16>(id),svl::SharedString(OUString(u"Other",5)),ref);compare("singlename",a,named);
 auto*member=&a.GetTableName();auto*refmember=&a.GetSingleRef();auto*oldData=a.GetTableName().getData();ScExternalSingleRefToken moved(std::move(a));state("singlemoved",moved);state("singlesource",a);std::cout<<"singleidentity "<<(member==&a.GetTableName())<<" "<<(member!=&moved.GetTableName())<<" "<<(oldData==moved.GetTableName().getData())<<" "<<(refmember==&a.GetSingleRef())<<" "<<(refmember!=&moved.GetSingleRef())<<"\n";input=svl::SharedString(OUString(u"Changed",7));ref.InitAddress(8,9,10);state("singleinputchanged",moved);copy.GetSingleRef().InitAddress(11,12,13);state("singlechanged",copy);state("singlecloneretained",cl);
 auto rvalue=name(mode);ScExternalSingleRefToken rv(static_cast<sal_uInt16>(id),std::move(rvalue),ref);state("singlervalue",rv);std::cout<<"singlervalueinput";stringState(rvalue);std::cout<<"\n";
 input=name(mode);ScExternalDoubleRefToken d(static_cast<sal_uInt16>(id),input,range),dc(d);FormulaTokenRef dclone(d.Clone());auto&dcl=static_cast<ScExternalDoubleRefToken&>(*dclone);state("double",d);state("doublecopy",dc);state("doubleclone",dcl);compare("doubleequal",d,dc);compare("doublecloneequal",d,dcl);compare("doublebase",d,number);compare("doublekind",d,copy);ScExternalDoubleRefToken df(static_cast<sal_uInt16>(id+1),input,range),dn(static_cast<sal_uInt16>(id),svl::SharedString(OUString(u"Other",5)),range);compare("doublefile",d,df);compare("doublename",d,dn);auto changed=range;changed.Ref2.InitAddress(14,15,16);ScExternalDoubleRefToken dx(static_cast<sal_uInt16>(id),input,changed);compare("doubledata",d,dx);changed=range;changed.bTrimToData=!changed.bTrimToData;ScExternalDoubleRefToken trim(static_cast<sal_uInt16>(id),input,changed);compare("doubletrim",d,trim);
 auto*dm=&d.GetDoubleRef();auto*sm=&d.GetTableName();oldData=d.GetTableName().getData();ScExternalDoubleRefToken dmoved(std::move(d));state("doublemoved",dmoved);state("doublesource",d);std::cout<<"doubleidentity "<<(dm==&d.GetDoubleRef())<<" "<<(dm!=&dmoved.GetDoubleRef())<<" "<<(&dmoved.GetSingleRef()==&dmoved.GetDoubleRef().Ref1)<<" "<<(&dmoved.GetSingleRef2()==&dmoved.GetDoubleRef().Ref2)<<" "<<(sm==&d.GetTableName())<<" "<<(sm!=&dmoved.GetTableName())<<" "<<(oldData==dmoved.GetTableName().getData())<<"\n";range.InitRange(8,9,10,11,12,13);input=svl::SharedString(OUString(u"Changed",7));state("doubleinputchanged",dmoved);dc.GetDoubleRef().Ref2.InitAddress(17,18,19);state("doublechanged",dc);state("doublecloneretained",dcl);rvalue=name(mode);ScExternalDoubleRefToken drv(static_cast<sal_uInt16>(id),std::move(rvalue),range);state("doublervalue",drv);std::cout<<"doublervalueinput";stringState(rvalue);std::cout<<"\n";
 input=name(mode);ScExternalNameToken n(static_cast<sal_uInt16>(id),input),nc(n);FormulaTokenRef nclone(n.Clone());auto&ncl=static_cast<ScExternalNameToken&>(*nclone);state("name",n);state("namecopy",nc);state("nameclone",ncl);compare("nameequal",n,nc);compare("namecloneequal",n,ncl);compare("namebase",n,number);compare("namekind",n,dmoved);ScExternalNameToken nf(static_cast<sal_uInt16>(id+1),input),nn(static_cast<sal_uInt16>(id),svl::SharedString(OUString(u"Other",5)));compare("namefile",n,nf);compare("namedifferent",n,nn);auto*nm=&n.GetName();oldData=n.GetName().getData();ScExternalNameToken nmoved(std::move(n));state("namemoved",nmoved);state("namesource",n);std::cout<<"nameidentity "<<(nm==&n.GetName())<<" "<<(nm!=&nmoved.GetName())<<" "<<(oldData==nmoved.GetName().getData())<<"\n";input=svl::SharedString(OUString(u"Changed",7));state("nameinputchanged",nmoved);state("namecloneretained",ncl);rvalue=name(mode);ScExternalNameToken nrv(static_cast<sal_uInt16>(id),std::move(rvalue));state("namervalue",nrv);std::cout<<"namervalueinput";stringState(rvalue);std::cout<<"\n";
}}
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
    externalClasses: hash(externalClasses),
    externalDefinitions: hash(externalDefinitions),
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
