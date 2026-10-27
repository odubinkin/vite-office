/** @fileoverview Exercises real Markdown list ownership with valid user-supplied bullet configuration. */
import { afterEach, assert, expect, it, vi } from "vitest";
import nativeConfig from "../../core/doc/number-bullet-data.json";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { MD_BLOCKTYPE } from "../../../../external/md4c/src/md4c.h";
afterEach(
  /** Restores the real pinned configuration. @returns Nothing. */ () => {
    vi.doUnmock("../../core/doc/number-bullet-data.json");
    vi.resetModules();
  },
);
it("applies user font fields to used and synthesized bullet levels", /** Verifies valid configuration overlay. @returns Nothing. */ async () => {
  vi.resetModules();
  vi.doMock(
    "../../core/doc/number-bullet-data.json",
    /** Supplies valid user configuration values. @returns Resource module. */ () => ({
      default: {
        ...nativeConfig,
        values: ["User Symbol", 150, 2, ...nativeConfig.values.slice(3)],
      },
    }),
  );
  const { MarkdownReader } = await import("./swmd"),
    { GetDefBulletFont } = await import("../../core/doc/number-bullet");
  const doc = new MarkdownReader().Read(new TextEncoder().encode("- bullet"));
  try {
    const rule = doc.paragraphs[0]?.GetNumRule();
    assert(rule);
    for (let level = 0; level < 10; level++)
      expect(rule.Get(level).GetBulletFont()?.GetFamilyName()).toBe("User Symbol");
    expect(GetDefBulletFont()).toBe(GetDefBulletFont());
  } finally {
    doc.Dispose();
  }
});
it("retains configured non-default starts on reused depth and normalizes bitmap continuation formats", /** Verifies actual existing-rule branches. @returns Nothing. */ async () => {
  const { SwMarkdownParser } = await import("./swmd"),
    { SwDoc } = await import("../../core/doc/doc"),
    { SwPosition, SwPaM } = await import("../../core/crsr/pam");
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const position = new SwPosition(first),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwMarkdownParser(doc, pam);
  try {
    for (let level = 0; level < 10; level++)
      parser.StartNumberedBulletList(MD_BLOCKTYPE.MD_BLOCK_UL);
    const rule = parser.GetTextNode().GetNumRule();
    assert(rule);
    const format = rule.Get(9).clone();
    format.SetStart(5);
    rule.Set(9, format);
    parser.StartNumberedBulletList(MD_BLOCKTYPE.MD_BLOCK_UL);
    parser.StartNumberedBulletListItem({ is_task: 0, task_mark: 0, task_mark_offset: 0 });
    expect(parser.GetTextNode().IsListRestart()).toBe(true);
    expect(parser.GetTextNode().GetAttrListRestartValue()).toBe(1);
    for (let level = 0; level < 11; level++) parser.EndNumberedBulletList();
    parser.StartNumberedBulletList(MD_BLOCKTYPE.MD_BLOCK_UL);
    const last = doc.GetNumRuleTable().at(-1);
    assert(last);
    const bitmap = last.Get(0).clone();
    bitmap.SetNumberingType(SvxNumType.SVX_NUM_BITMAP);
    last.Set(0, bitmap);
    parser.EndNumberedBulletList();
    expect(last.Get(1).GetNumberingType()).toBe(SvxNumType.SVX_NUM_CHAR_SPECIAL);
  } finally {
    pam.Dispose();
    doc.Dispose();
  }
});
