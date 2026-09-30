/** @fileoverview Compares supported list pipeline scalars with the compiled pinned C++ oracle. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Converter } from "../../../apps/office/src/sax/source/tools/converter.ts";
import { numberingLabelAlignmentToTwips, numberingLabelAlignmentToMM100 } from "../../../apps/office/src/sw/source/core/unocore/unosett.ts";
const cases=JSON.parse(readFileSync(".agentplane/tasks/202609302034-1CZ8BR/native-results.json","utf8"));
for(const test of cases) {
  let result;
  if(test.kind==="export") result=Converter.convertMeasureToXML(test.value,test.unit);
  else if(test.kind==="parse") result=String(Converter.convertMeasure(test.value,"mm100",test.minimum,32767)??0);
  else {
    const core=numberingLabelAlignmentToTwips({indentAt:test.value});
    result=`${core.indentAt} ${numberingLabelAlignmentToMM100(core).indentAt}`;
  }
  assert.equal(result,test.expected,JSON.stringify(test));
}
console.log(`${cases.length} scalar comparisons pass against the unmodified pinned C++ bodies; the harness supplies platform aliases and native ratios for only the selected units.`);
