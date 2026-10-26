/** @fileoverview Markdown numbering completion starts from the first explicit native level. */
import { assert, expect, it } from "vitest";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { createWriterDocument } from "../../core/doc/doc";
import { SwMdNumRuleInfo } from "./mdnum";

it("fills following levels while leaving earlier uninitialized levels untouched", /** Checks direct list callback state when an outer list starts beyond level zero. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const rules = new SwMdNumRuleInfo();
  try {
    rules.Finish();
    const node = doc.paragraphs[0];
    assert(node);
    rules.Apply(node, { kind: "bullet", level: 2, id: "Nested callback" });
    const rule = node.GetNumRule();
    assert(rule);
    expect(rule.GetNumFormat(0)).toBeUndefined();
    expect(rule.GetNumFormat(1)).toBeUndefined();
    rules.Finish();
    expect(rule.GetNumFormat(0)).toBeUndefined();
    expect(rule.GetNumFormat(1)).toBeUndefined();
    for (let level = 2; level < 10; level++) {
      const format = rule.GetNumFormat(level);
      assert(format);
      expect(format.GetNumberingType()).toBe(SvxNumType.SVX_NUM_CHAR_SPECIAL);
      expect(format.GetBulletChar()).toBe(0x2022);
    }
  } finally {
    doc.Dispose();
  }
});
