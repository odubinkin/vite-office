/** @fileoverview Ordinary unchanged ScCalcConfig instance values over full genuine headers and shared dependencies; static service methods are not substituted. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { format, resolveConfig } from "prettier";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { hash, pin, upstream, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-config-native",
  fixture = "apps/office/src/sc/source/core/tool/native-calc-config-cases.json";
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);
for (const path of [
  "sc/inc/calcconfig.hxx",
  "sc/source/core/tool/calcconfig.cxx",
  "include/formula/grammar.hxx",
  "include/o3tl/sorted_vector.hxx",
])
  loadUnicodeOriginal(native.sources, path);
const original = native.sources["sc/source/core/tool/calcconfig.cxx"];
const definitions = original.slice(
  original.indexOf("ScCalcConfig::ScCalcConfig()"),
  original.indexOf("OUString ScOpCodeSetToSymbolicString("),
);
if (
  !definitions.includes("bool ScCalcConfig::operator!=") ||
  definitions.includes("isThreadingEnabled")
)
  throw Error("Invalid complete instance method selection");
const generated =
  "output/playwright/formula-token-array-native/generated/com/sun/star/sheet/FormulaLanguage.";
const prior = JSON.parse(
  readFileSync("output/playwright/formula-token-array-native/manifest.json", "utf8"),
);
const generatedHashes = {};
for (const ext of ["hpp", "hdl"]) {
  const path = generated + ext;
  generatedHashes[path] = hash(readFileSync(path));
  if (prior.generatedHashes[path] !== generatedHashes[path])
    throw Error("Changed original generated FormulaLanguage header");
}
const caller = String.raw`
#include <calcconfig.hxx>
#include <iostream>
#include <string>
${definitions}
void state(const char*name,const ScCalcConfig&q) {
 std::cout<<name<<" "<<q.meStringRefAddressSyntax<<" "<<int(q.meStringConversion)<<" "<<q.mbEmptyStringAsZero<<" "<<q.mbHasStringRefSyntax<<" "<<q.mbOpenCLSubsetOnly<<" "<<q.mbOpenCLAutoSelect<<" "<<q.mnOpenCLMinimumFormulaGroupSize<<" ";
 for(sal_Int32 i=0;i<q.maOpenCLDevice.getLength();++i)std::cout<<int(q.maOpenCLDevice[i])<<",";
 std::cout<<" ";for(auto op:*q.mpOpenCLSubsetOpCodes)std::cout<<int(op)<<",";std::cout<<"\n";
}
int main() {
 std::cout<<"enum "<<RECALC_ALWAYS<<" "<<RECALC_NEVER<<" "<<RECALC_ASK<<" "<<ForceCalculationNone<<" "<<ForceCalculationCore<<" "<<ForceCalculationOpenCL<<" "<<ForceCalculationThreads<<" "<<int(ScCalcConfig::StringConversion::ILLEGAL)<<" "<<int(ScCalcConfig::StringConversion::ZERO)<<" "<<int(ScCalcConfig::StringConversion::UNAMBIGUOUS)<<" "<<int(ScCalcConfig::StringConversion::LOCALE)<<"\n";
 std::cout<<"grammar ";for(auto v:{formula::FormulaGrammar::CONV_UNSPECIFIED,formula::FormulaGrammar::CONV_OOO,formula::FormulaGrammar::CONV_ODF,formula::FormulaGrammar::CONV_XL_A1,formula::FormulaGrammar::CONV_XL_R1C1,formula::FormulaGrammar::CONV_XL_OOX,formula::FormulaGrammar::CONV_LOTUS_A1,formula::FormulaGrammar::CONV_LAST,formula::FormulaGrammar::CONV_A1_XL_A1})std::cout<<int(v)<<",";std::cout<<"\n";
 ScCalcConfig a,b;state("default",a);std::cout<<"shared "<<(a.mpOpenCLSubsetOpCodes==b.mpOpenCLSubsetOpCodes)<<"\n";
 for(int conv=-1;conv<=7;++conv){a.SetStringRefSyntax(static_cast<formula::FormulaGrammar::AddressConvention>(conv));state("syntax",a);}a.reset();state("reset",a);
 a.meStringConversion=ScCalcConfig::StringConversion::ZERO;a.mbEmptyStringAsZero=true;a.SetStringRefSyntax(formula::FormulaGrammar::CONV_ODF);a.mbOpenCLSubsetOnly=false;a.mbOpenCLAutoSelect=false;a.mnOpenCLMinimumFormulaGroupSize=-2147483647;a.maOpenCLDevice=OUString(u"GPU\0\u03b1",5);a.mpOpenCLSubsetOpCodes=std::make_shared<o3tl::sorted_vector<OpCode>>();for(auto op:{ocSum,ocAdd,ocSum,ocDiv})a.mpOpenCLSubsetOpCodes->insert(op);state("custom",a);
 ScCalcConfig copy(a);state("copy",copy);std::cout<<"copyeq "<<(a==copy)<<" "<<(a!=copy)<<" "<<(a.mpOpenCLSubsetOpCodes==copy.mpOpenCLSubsetOpCodes)<<"\n";
 a.maOpenCLDevice=u"changed"_ustr;a.mpOpenCLSubsetOpCodes->insert(ocMul);state("alias",copy);state("source",a);
 b.MergeDocumentSpecific(a);state("merge",b);b.MergeDocumentSpecific(b);state("selfmerge",b);b=a;state("assign",b);b=b;state("selfassign",b);
 b.setOpenCLConfigToDefault();state("partialdefault",b);b.reset();state("resetall",b);
 ScCalcConfig pristine;for(int field=0;field<10;++field){ScCalcConfig q(pristine);switch(field){case 0:q.meStringRefAddressSyntax=formula::FormulaGrammar::CONV_ODF;break;case 1:q.meStringConversion=ScCalcConfig::StringConversion::ILLEGAL;break;case 2:q.mbEmptyStringAsZero=true;break;case 3:q.mbHasStringRefSyntax=true;break;case 4:q.mbOpenCLSubsetOnly=false;break;case 5:q.mbOpenCLAutoSelect=false;break;case 6:q.maOpenCLDevice=u"gpu"_ustr;break;case 7:q.mnOpenCLMinimumFormulaGroupSize=101;break;case 8:q.mpOpenCLSubsetOpCodes=std::make_shared<o3tl::sorted_vector<OpCode>>();break;case 9:q.mpOpenCLSubsetOpCodes=std::make_shared<o3tl::sorted_vector<OpCode>>(*pristine.mpOpenCLSubsetOpCodes);q.mpOpenCLSubsetOpCodes->erase(ocAdd);q.mpOpenCLSubsetOpCodes->insert(ocOffset);break;}std::cout<<"unequal "<<field<<" "<<(pristine==q)<<" "<<(pristine!=q)<<"\n";}
 ScCalcConfig equal(pristine);equal.mpOpenCLSubsetOpCodes=std::make_shared<o3tl::sorted_vector<OpCode>>(*pristine.mpOpenCLSubsetOpCodes);std::cout<<"equalset "<<(pristine==equal)<<" "<<(pristine.mpOpenCLSubsetOpCodes==equal.mpOpenCLSubsetOpCodes)<<"\n";
 // Observe the original mutable static-default set, then restore it for subsequent callers.
 pristine.mpOpenCLSubsetOpCodes->insert(ocOffset);ScCalcConfig later;state("mutateddefault",later);later.reset();state("mutatedreset",later);pristine.mpOpenCLSubsetOpCodes->erase(ocOffset);state("restoreddefault",later);
}
`;
writeFileSync(target + "/driver.cpp", caller);
const executable = native.build(false, [
  "-DNDEBUG",
  "-I" + upstream + "/sc/inc",
  "-I" + upstream + "/include",
  "-Ioutput/playwright/formula-token-array-native/generated",
]);
const output = native.run(executable, [], "whole-instance-values").stdout.toString();
const data = {
  pin,
  normalOnly: true,
  driverHash: hash(caller),
  definitionsHash: hash(definitions),
  generatedHashes,
  sourceHashes: Object.fromEntries(
    Object.entries(native.sources).map(
      /** Captures whole unchanged original input identities. @param entry - Path and bytes. @returns Hash pair. */ ([
        path,
        bytes,
      ]) => [path, hash(bytes)],
    ),
  ),
  byteLength: Buffer.byteLength(output),
  sha256: hash(output),
  output,
};
if (write)
  writeFileSync(
    fixture,
    await format(JSON.stringify(data), { ...(await resolveConfig(fixture)), parser: "json" }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Original complete configuration stream changed");
const grammarFixture = "apps/office/src/formula/inc/native-grammar-cases.json";
const grammarOutput = output
  .split("\n")
  .find(
    /** Selects the original address convention observation. @param line - Native output line. @returns Grammar line predicate. */ (
      line,
    ) => line.startsWith("grammar "),
  );
if (!grammarOutput) throw Error("Missing original grammar observation");
const grammarData = {
  pin,
  driverHash: data.driverHash,
  sourceHash: hash(native.sources["include/formula/grammar.hxx"]),
  output: grammarOutput,
  sha256: hash(grammarOutput),
};
if (write)
  writeFileSync(
    grammarFixture,
    await format(JSON.stringify(grammarData), {
      ...(await resolveConfig(grammarFixture)),
      parser: "json",
    }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(grammarFixture, "utf8")), grammarData))
  throw Error("Original grammar observation changed");
native.manifest.state = "captured";
native.manifest.driverHash = data.driverHash;
native.manifest.generatedHashes = { ...native.manifest.generatedHashes, ...generatedHashes };
native.manifest.capture = { byteLength: data.byteLength, sha256: data.sha256 };
native.save();
console.log(
  JSON.stringify({
    normalOnly: true,
    sourceFiles: Object.keys(data.sourceHashes).length,
    bytes: data.byteLength,
    sha256: data.sha256,
  }),
);
