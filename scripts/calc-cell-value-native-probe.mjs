/** @fileoverview Ordinary original matrix storage/lifetime observations over complete pinned mdds headers and genuine shared strings. */
import { readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { reuseExceptionNative } from "./uno-exception-native-reuse.mjs";
import { digest } from "./mdds-native-source.mjs";
import { loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
const write = process.argv[2] === "--write",
  check = process.argv[2] === "--check";
if (process.argv.length !== 3 || (!write && !check)) throw Error("Use exactly --write or --check");
const target = "output/playwright/calc-cell-value-native";
const fixture = "apps/office/src/sc/source/core/data/native-cell-value-cases.json";
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
  "ScCellValue::ScCellValue()",
  "ScCellValue::ScCellValue( double fValue )",
  "ScCellValue::ScCellValue( const svl::SharedString& rString )",
  "void ScCellValue::reset_to_empty()",
  "ScCellValue::ScCellValue(ScCellValue&& r)",
  "ScCellValue::~ScCellValue()",
  "CellType ScCellValue::getType()",
  "void ScCellValue::clear()",
  "void ScCellValue::set( double fValue )",
  "void ScCellValue::set( const svl::SharedString& rStr )",
  "bool ScCellValue::isEmpty()",
  "ScCellValue& ScCellValue::operator=(ScCellValue&& rCell)",
  "void ScCellValue::swap(",
].map(
  /** Selects complete scalar source scopes. @param signature - Prefix. @returns Original definition. */ (
    signature,
  ) => definition(signature),
);
const cellType = globalHeader.match(/enum CellType\s*\{[^}]*\};/u)?.[0];
const variant = header.match(/std::variant<[^;]+maData;/u)?.[0];
const getters = [
  "double getDouble()",
  "const svl::SharedString* getSharedString()",
  "EditTextObject* getEditText()",
  "ScFormulaCell* getFormula()",
].map(
  /** Selects complete unchanged inline getters, with pointer getters declared only for original clear compilation. @param signature - Prefix. @returns Inline definition. */ (
    signature,
  ) => {
    const start = header.indexOf(signature),
      end = header.indexOf("}", start);
    if (start < 0 || end < 0) throw Error("Missing getter");
    return header.slice(start, end + 1);
  },
);
if (!cellType || !variant) throw Error("Missing original type/data declarations");
const caller = String.raw`
#include <svl/sharedstring.hxx>
#include <formula/errorcodes.hxx>
#include <o3tl/deleter.hxx>
#include <variant>
#include <cassert>
#include <cmath>
#include <iostream>
#include <limits>
#include <vector>
${cellType}
// Genuine original forward declarations; no object of either unported pointer family is instantiated or dereferenced.
class EditTextObject;class ScFormulaCell;
class ScCellValue{
 ${variant}
 void reset_to_empty();
public:
 ScCellValue();ScCellValue(double);ScCellValue(const svl::SharedString&);ScCellValue(ScCellValue&&) noexcept;~ScCellValue();
 void clear() noexcept;void set(double);void set(const svl::SharedString&);CellType getType() const;bool isEmpty() const;void swap(ScCellValue&);ScCellValue& operator=(ScCellValue&&) noexcept;
 ${getters.join("\n")}
};
${definitions.join("\n")}
void state(const char*label,const ScCellValue&v){std::cout<<label<<" "<<int(v.getType())<<" "<<v.isEmpty();if(v.getType()==CELLTYPE_VALUE){auto x=v.getDouble();auto error=GetDoubleErrorValue(x);std::cout<<" | "<<int(error)<<" "<<std::signbit(x)<<" "<<(error==FormulaError::NONE?x:0);}if(v.getType()==CELLTYPE_STRING){auto s=v.getSharedString();std::cout<<" | "<<s->getLength();auto d=s->getData();if(d)for(sal_Int32 i=0;i<d->length;++i)std::cout<<" "<<int(d->buffer[i]);}std::cout<<"\n";try{v.getDouble();std::cout<<"double ok\n";}catch(const std::bad_variant_access&e){std::cout<<"double "<<e.what()<<"\n";}try{v.getSharedString();std::cout<<"string ok\n";}catch(const std::bad_variant_access&e){std::cout<<"string "<<e.what()<<"\n";}}
int main(){sal_Unicode raw[]={65,0,937};OUString text(raw,3);svl::SharedString s(text);
 ScCellValue empty;state("default",empty);empty.clear();state("clear",empty);
 for(double number:std::vector<double>{0.0,-0.0,2.5,-3.5,std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity(),CreateDoubleError(FormulaError::MatrixSize)}){ScCellValue value(number);state("number",value);ScCellValue moved(std::move(value));state("movesource",value);state("moved",moved);ScCellValue target(s);target=std::move(moved);state("assignsource",moved);state("assigned",target);target=std::move(target);state("selfmove",target);}
 ScCellValue string(s);state("string",string);s=svl::SharedString();state("retained",string);ScCellValue moved(std::move(string));state("stringsource",string);state("stringmoved",moved);ScCellValue other(9.5);other.swap(moved);state("swapleft",other);state("swapright",moved);other.swap(other);state("selfswap",other);moved.set(*other.getSharedString());other.clear();state("setcopied",moved);state("clearedsource",other);moved.set(4.5);state("setnumber",moved);svl::SharedString null; moved .set(null);state("nullstring",moved);svl::SharedString literal=svl::SharedString::getEmptyString();moved.set(literal);state("emptystring",moved);ScCellValue target;target=std::move(moved);state("stringassignsource",moved);state("stringassigned",target);target=std::move(target);state("stringselfmove",target);target.clear();state("finalclear",target);
}
`;
writeFileSync(target + "/driver.cpp", caller);
const binary = native.build(false, [upstream + "/svl/source/misc/sharedstring.cxx", "-DNDEBUG"]);
const result = native.run(binary, [], "scalar");
const captures = { scalar: result.stdout.toString("utf8") };
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
  throw Error("Original cell scalar evidence changed");
console.log("Original cell scalar stream", Buffer.byteLength(captures.scalar));
