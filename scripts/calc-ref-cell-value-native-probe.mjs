/** @fileoverview Ordinary original scalar ScRefCellValue borrowed-reference observations with genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-ref-cell-value-native";
const fixture = "apps/office/src/sc/source/core/data/native-ref-cell-value-cases.json";
const native = reuseExceptionNative(
  target,
  "output/playwright/uno-object-entry-native",
  "apps/office/src/cppu/source/uno/native-object-entry-cases.json",
  { normalOnly: true },
);

for (const file of [
  "svl/source/misc/sharedstring.cxx",
  "include/svl/sharedstring.hxx",
  "sc/inc/cellvalue.hxx",
  "sc/inc/global.hxx",
  "sc/source/core/data/cellvalue.cxx",
  "include/o3tl/deleter.hxx",
  "include/formula/errorcodes.hxx",
])
  loadUnicodeOriginal(native.sources, file);
const source = readFileSync(upstream + "/sc/source/core/data/cellvalue.cxx", "utf8"),
  header = readFileSync(upstream + "/sc/inc/cellvalue.hxx", "utf8"),
  globalHeader = readFileSync(upstream + "/sc/inc/global.hxx", "utf8");
/** Selects one complete unchanged source definition. @param signature - Exact prefix. @returns Original definition. */
function definition(signature) {
  const start = source.indexOf(signature);
  if (start < 0) throw Error("Missing original " + signature);
  const body = source.indexOf("{", start);
  let depth = 1,
    end = body + 1;
  while (depth && end < source.length) {
    if (source[end] === "{") ++depth;
    else if (source[end] === "}") --depth;
    ++end;
  }
  if (depth) throw Error("Incomplete original body");
  return source.slice(start, end);
}
const definitions = [
  "ScRefCellValue::ScRefCellValue()",
  "ScRefCellValue::ScRefCellValue( double fValue )",
  "ScRefCellValue::ScRefCellValue( const svl::SharedString* pString )",
  "void ScRefCellValue::clear()",
  "bool ScRefCellValue::isEmpty()",
].map(
  /** Selects complete scalar definitions. @param signature - Original prefix. @returns Original body. */
  (signature) => definition(signature),
);
const cellType = globalHeader.match(/enum CellType\s*\{[^}]*\};/u)?.[0];
const referenceHeader = header.slice(header.indexOf("struct SAL_DLLPUBLIC_RTTI ScRefCellValue"));
const fields = referenceHeader.match(/CellType meType;\s*union \{[^}]+\};/u)?.[0];
const getters = [
  "CellType getType()",
  "double getDouble()",
  "const svl::SharedString* getSharedString()",
].map(
  /** Selects original inline typed getter. @param signature - Original prefix. @returns Original getter. */
  (signature) => {
    const start = referenceHeader.indexOf(signature),
      end = referenceHeader.indexOf("}", start);
    if (start < 0 || end < 0) throw Error("Missing original getter");
    return referenceHeader.slice(start, end + 1);
  },
);
if (!cellType || !fields) throw Error("Missing original scalar reference declarations");
const caller = String.raw`
#include <svl/sharedstring.hxx>
#include <formula/errorcodes.hxx>
#include <cassert>
#include <cmath>
#include <iostream>
#include <limits>
#include <vector>
${cellType}
class EditTextObject;class ScFormulaCell;
struct ScRefCellValue{
private:
 ${fields}
public:
 ScRefCellValue();ScRefCellValue(double);ScRefCellValue(const svl::SharedString*);
 void clear();bool isEmpty() const;
 ${getters.join("\n")}
};
${definitions.join("\n")}
void state(const char*label,const ScRefCellValue&v,const svl::SharedString*expected=nullptr){std::cout<<label<<" "<<int(v.getType())<<" "<<v.isEmpty();if(v.getType()==CELLTYPE_VALUE){auto x=v.getDouble();auto error=GetDoubleErrorValue(x);std::cout<<" | "<<int(error)<<" "<<std::signbit(x)<<" "<<(error==FormulaError::NONE?x:0);}if(v.getType()==CELLTYPE_STRING){auto s=v.getSharedString();std::cout<<" | "<<(s==expected)<<" "<<(s!=nullptr);if(s){std::cout<<" "<<s->getLength();auto d=s->getData();if(d)for(sal_Int32 i=0;i<d->length;++i)std::cout<<" "<<int(d->buffer[i]);}}std::cout<<"\n";}
int main(){sal_Unicode raw[]={65,0,937};OUString text(raw,3);svl::SharedString s(text);
 ScRefCellValue empty;state("default",empty);ScRefCellValue emptycopy(empty);state("emptycopy",emptycopy);empty.clear();state("clear",empty);
 for(double number:std::vector<double>{0.0,-0.0,2.5,-3.5,std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity(),CreateDoubleError(FormulaError::MatrixSize)}){ScRefCellValue value(number);state("number",value);ScRefCellValue copied(value);state("copied",copied);value.clear();state("clearsource",value);state("retained",copied);ScRefCellValue target(&s);target=copied;state("assigned",target);target=target;state("selfcopy",target);target.clear();state("cleartarget",target);}
 ScRefCellValue string(&s);state("string",string,&s);ScRefCellValue copied(string);state("stringcopy",copied,&s);ScRefCellValue target(4.5);target=string;state("stringassigned",target,&s);target=target;state("stringselfcopy",target,&s);string.clear();state("stringcleared",string);state("stringretained",copied,&s);
 s=svl::SharedString();state("retargeted",copied,&s);state("retargetedassigned",target,&s);s=svl::SharedString(text);state("retargetedback",copied,&s);target.clear();state("finalclear",target);
 ScRefCellValue nullstring(static_cast<const svl::SharedString*>(nullptr));state("nullstring",nullstring);ScRefCellValue nullcopy(nullstring);state("nullcopy",nullcopy);target=nullstring;state("nullassigned",target);auto literal=&svl::SharedString::getEmptyString();ScRefCellValue emptystring(literal);state("emptystring",emptystring,literal);ScRefCellValue emptystringcopy(emptystring);state("emptystringcopy",emptystringcopy,literal);target=empty;state("emptyassigned",target);
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [upstream + "/svl/source/misc/sharedstring.cxx", "-DNDEBUG"]);
const result = native.run(binary, [], "reference");
const captures = { reference: result.stdout.toString("utf8") };
const document = {
  pin,
  dependencyManifestHash: native.manifest.reusedDependencyBuild.manifestHash,
  callerHash: digest(caller),
  sourceDigest: digest(JSON.stringify(native.manifest.sourceHashes)),
  captures,
};
native.manifest.state = "captured";
native.save();
if (write) writeFileSync(fixture, JSON.stringify(document, null, 2) + "\n");
else if (!isDeepStrictEqual(document, JSON.parse(readFileSync(fixture, "utf8"))))
  throw Error("Original scalar cell reference evidence changed");
console.log("Original scalar cell reference stream", Buffer.byteLength(captures.reference));
