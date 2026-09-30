/** Compares local numbering application with extracted pinned C++ on every level. */
import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { SwNumRule } from "../../../apps/office/src/sw/source/core/doc/number.ts";
import { SwXNumberingRules, NumberingRulePropertyError } from "../../../apps/office/src/sw/source/core/unocore/unosett.ts";
const fixtures = JSON.parse(readFileSync(new URL("native-results.json", import.meta.url), "utf8"));
let comparisons = 0;
for (const { declarations, expected } of fixtures) {
  const rule = new SwNumRule("oracle");
  try {
    for (const [level,kind,bullet,distance,mode,left,offset,first,indent,tab,suffix] of declarations) {
      SwXNumberingRules.SetNumberingRuleByIndex(rule, {
        kind: kind === 1 ? "bullet" : "numbered",
        ...(kind === 1 ? { bulletChar: String.fromCodePoint(bullet) } : {}),
        suffix: suffix === 1 ? "." : "",
        absLSpace: left, firstLineOffset: offset,
        charTextDistance: (distance << 16) >> 16,
        positionAndSpaceMode: mode === 1 ? "label-alignment" : "label-width-and-position",
        firstLineIndent: first, indentAt: indent, listTabPosition: tab, labelFollowedBy: "listtab",
      }, level);
    }
  } catch (error) {
    if (!(error instanceof NumberingRulePropertyError)) throw error;
  }
  for (let level=0;level<10;level++) {
    const format=rule.GetNumFormat(level),position=format.GetPositionProperties();
    const actual=[format.GetKind()==="bullet"?1:0,format.GetBulletChar().codePointAt(0),format.GetSuffix()==="."?1:0,
      position.absLSpace,position.firstLineOffset,position.charTextDistance,
      position.firstLineIndent,position.indentAt,position.listTabPosition,position.positionAndSpaceMode==="label-alignment"?1:0];
    assert.deepEqual(actual,expected[level],JSON.stringify({declarations,level}));
    comparisons++;
  }
}
console.log(`${fixtures.length} ordered native C++ cases / ${comparisons} complete level states matched local Writer application.`);
