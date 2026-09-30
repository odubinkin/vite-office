/** @fileoverview Compares supported list pipeline scalars with the compiled pinned C++ oracle. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Converter } from "../../../apps/office/src/sax/source/tools/converter.ts";
import { numberingPositionToTwips, numberingPositionToMM100 } from "../../../apps/office/src/sw/source/core/unocore/unosett.ts";
const cases=JSON.parse(readFileSync(".agentplane/tasks/202609302111-EA56QR/native-results.json","utf8"));
for(const test of cases) {
  let result;
  if(test.kind==="export") result=Converter.convertMeasureToXML(test.value,test.unit);
  else if(test.kind==="parse") result=String(Converter.convertMeasure(test.value,"mm100",test.minimum,32767)??0);
  else {
    const core=numberingPositionToTwips({indentAt:test.value});
    result=`${core.indentAt} ${numberingPositionToMM100(core).indentAt}`;
  }
  assert.equal(result,test.expected,JSON.stringify(test));
}
console.log(`${cases.length} scalar comparisons pass against the unmodified pinned C++ bodies; the harness supplies platform aliases and native ratios for only the selected units.`);

const {SvxNumberFormat}=await import("../../../apps/office/src/editeng/source/items/numitem.ts");
const positions=JSON.parse(readFileSync(".agentplane/tasks/202609302111-EA56QR/native-position-results.json","utf8"));
for(const test of positions) {
 const [absLSpace,firstLineOffset,charTextDistance,firstLineIndent,indentAt]=test.values;
 const format=new SvxNumberFormat({absLSpace,firstLineOffset,charTextDistance,firstLineIndent,indentAt,positionAndSpaceMode:test.mode===0?"label-width-and-position":"label-alignment"});
 assert.equal(`${format.GetAbsLSpace()} ${format.GetFirstLineOffset()} ${format.GetCharTextDistance()}`,test.expected,JSON.stringify(test));
}
console.log(`${positions.length} independent mode/width comparisons pass against unmodified pinned C++ getter bodies.`);
