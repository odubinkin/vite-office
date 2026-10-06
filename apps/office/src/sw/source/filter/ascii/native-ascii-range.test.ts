/** @fileoverview Checks native ASCII selection, numbering visibility and margin contracts on real Writer owners. */
import { afterEach, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { GetBulletChar, SwNumRule } from "../../core/doc/number";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwASCWriter } from "./wrtasc";
const documents: ReturnType<typeof createWriterDocument>[] = [];
afterEach(
  /** Releases native fixtures. @returns Nothing. */ () => {
    for (const doc of documents.splice(0)) doc.Dispose();
  },
);
/** Builds native connected paragraphs. @returns Native owners. */
function fixture() {
  const doc = createWriterDocument();
  documents.push(doc);
  const first = doc.paragraphs[0] as SwTextNode,
    second = doc.nodes.MakeTextNode("Omega");
  first.SetText("Alpha");
  return { doc, first, second };
}
/** Writes a native range with retained endpoints. @param first - Start owner. @param second - End owner. @param start - Initial offset. @param end - Final offset. @param reverse - Point direction. @param writer - Native writer options. @returns ASCII text. */
function write(
  first: SwTextNode,
  second: SwTextNode,
  start = 0,
  end = second.Len(),
  reverse = false,
  writer = new SwASCWriter(),
): string {
  const a = new SwPosition(first, start),
    b = new SwPosition(second, end),
    pam = new SwPaM(reverse ? a : b, reverse ? b : a);
  try {
    const point = pam.GetPoint(),
      mark = pam.GetMark(),
      result = writer.Write(pam);
    expect(pam.GetPoint()).toBe(point);
    expect(pam.GetMark()).toBe(mark);
    return result;
  } finally {
    pam.Dispose();
  }
}
/** Creates the native clipboard writer. @returns Writer with native clipboard flag. */
function clipboard(): SwASCWriter {
  const writer = new SwASCWriter();
  writer.m_bWriteClipboardDoc = true;
  return writer;
}
it.each([false, true])(
  "uses original native node span reverse=%s for a partial last item",
  /** Checks complete-list heuristics are absent. @param reverse - Direction. @returns Nothing. */ (
    reverse,
  ) => {
    const { first, second } = fixture();
    applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(second, { kind: "numbered", level: 0 });
    expect(write(first, second, 0, 2, reverse, clipboard())).toBe("    1. Alpha\n    2. Om");
    expect(write(first, second, 1, 2, reverse, clipboard())).toBe("lpha\n    2. Om");
  },
);
it("exports one list item next to ordinary text and suppresses same-node labels", /** Checks selection-node count and writer defaults. @returns Nothing. */ () => {
  const { first, second } = fixture(),
    writer = clipboard();
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  expect(write(first, second, 0, 5, false, writer)).toBe("    1. Alpha\nOmega");
  expect(write(first, first, 0, 5, false, writer)).toBe("Alpha");
  writer.m_bExportParagraphNumbering = false;
  expect(write(first, second, 0, 5, false, writer)).toBe("Alpha\nOmega");
});
it("retains native ListFormat and prefix/suffix instead of inventing a number", /** Checks actual native vector formatting. @returns Nothing. */ () => {
  const { first, second } = fixture();
  applyWriterParagraphList(first, { kind: "numbered", level: 0, styleId: "Pattern" });
  applyWriterParagraphList(second, { kind: "numbered", level: 1, styleId: "Pattern" });
  const rule = first.GetNumRule() as SwNumRule,
    format = rule.Get(1).clone();
  format.SetListFormat("[%1%/%2%/%1%]");
  rule.Set(1, format);
  expect(second.GetNumberVector()).toEqual([1, 1]);
  expect(second.GetNumString()).toBe("[1/1/1]");
  expect(write(first, second, 0, 5, false, clipboard())).toBe(
    "    1. Alpha\n        [1/1/1] Omega",
  );
  format.SetPrefix("(");
  format.SetSuffix(")");
  format.SetIncludeUpperLevels(2);
  rule.Set(1, format);
  expect(second.GetNumString()).toBe("(1.1)");
  format.SetListFormat("");
  rule.Set(1, format);
  expect(second.GetNumString()).toBe("");
  expect(second.HasVisibleNumberingOrBullet()).toBe(true);
  expect(write(first, second, 0, 5, false, clipboard())).toBe("    1. Alpha\n         Omega");
});
it.each([0, 1, 2, 9])(
  "uses configured default bullet at native level %s rather than the custom display glyph",
  /** Checks bullet config ownership. @param level - Native level. @returns Nothing. */ (level) => {
    const { first, second } = fixture();
    applyWriterParagraphList(first, { kind: "bullet", level });
    const rule = first.GetNumRule() as SwNumRule,
      format = rule.Get(level).clone();
    format.SetBulletChar(0x2605);
    rule.Set(level, format);
    expect(first.GetListLabel()).toBe("★");
    expect(first.GetNumString()).toBe("");
    expect(first.HasVisibleNumberingOrBullet()).toBe(true);
    const literal = [
      "    • Alpha\nOmega",
      "        ◦ Alpha\nOmega",
      "            ▪ Alpha\nOmega",
      "                                        • Alpha\nOmega",
    ];
    expect(write(first, second, 0, 5, false, clipboard())).toBe(
      literal[[0, 1, 2, 9].indexOf(level)],
    );
  },
);
it("narrows default bullet configuration to native unsigned byte and last level", /** Checks actual configuration boundaries. @returns Nothing. */ () => {
  expect([
    GetBulletChar(0),
    GetBulletChar(1),
    GetBulletChar(2),
    GetBulletChar(10),
    GetBulletChar(255),
    GetBulletChar(256),
  ]).toEqual([0x2022, 0x25e6, 0x25aa, 0x2022, 0x2022, 0x2022]);
});
it.each(["bullet", "numbered"] as const)(
  "preserves source blanks for uncounted %s without a fake marker",
  /** Checks actual counted-state admission. @param kind - Native format. @returns Nothing. */ (
    kind,
  ) => {
    const { first, second } = fixture();
    applyWriterParagraphList(first, { kind, level: 0 });
    first.SetCountedInList(false);
    expect(first.GetNumString()).toBe("");
    expect(first.HasVisibleNumberingOrBullet()).toBe(false);
    expect(write(first, second, 0, 5, false, clipboard())).toBe(
      kind === "bullet" ? "      Alpha\nOmega" : "       Alpha\nOmega",
    );
  },
);
it("retains NONE literal labels and distinguishes absent labels from absent rules", /** Checks native visibility default. @returns Nothing. */ () => {
  const { first, second } = fixture();
  expect(first.GetNumString()).toBe("");
  expect(first.HasVisibleNumberingOrBullet()).toBe(false);
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  const rule = first.GetNumRule() as SwNumRule,
    format = rule.Get(0).clone();
  format.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
  format.SetListFormat("");
  rule.Set(0, format);
  expect(first.GetNumString()).toBe("");
  expect(first.HasVisibleNumberingOrBullet()).toBe(false);
  expect(write(first, second, 0, 5, false, clipboard())).toBe("       Alpha\nOmega");
  format.SetListFormat("§");
  rule.Set(0, format);
  expect(first.GetNumString()).toBe("§");
  expect(first.HasVisibleNumberingOrBullet()).toBe(true);
  expect(write(first, second, 0, 5, false, clipboard())).toBe("    § Alpha\nOmega");
});
it("uses reserved outline identity and suppresses empty outline labels without spaces", /** Checks actual document rule identity. @returns Nothing. */ () => {
  const { first, second } = fixture();
  applyWriterParagraphList(first, {
    kind: "numbered",
    level: 0,
    styleId: SwNumRule.GetOutlineRuleName(),
  });
  expect(write(first, second, 0, 5, false, clipboard())).toBe("1. Alpha\nOmega");
  const rule = first.GetNumRule() as SwNumRule,
    format = rule.Get(0).clone();
  format.SetListFormat("");
  rule.Set(0, format);
  expect(write(first, second, 0, 5, false, clipboard())).toBe("Alpha\nOmega");
});
it("omits nonoutline indentation only for zero native heading margins", /** Checks heading exclusion and tab ownership. @returns Nothing. */ () => {
  const { first, second } = fixture();
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  first.SetAttrOutlineLevel(1);
  first.SetParagraphTextLeftMargin(0);
  first.SetParagraphFirstLineIndent(0);
  expect([first.GetLeftMarginWithNum(), first.GetLeftMarginForTabCalculation()]).toEqual([0, 0]);
  expect(write(first, second, 0, 5, false, clipboard())).toBe("1. Alpha\nOmega");
  first.SetParagraphTextLeftMargin(100);
  expect(write(first, second, 0, 5, false, clipboard())).toBe("    1. Alpha\nOmega");
});
it("resolves native independently masked alignment and raw margins", /** Checks direct axes and ordinary defaults. @returns Nothing. */ () => {
  const { first } = fixture();
  expect(first.GetLeftMarginWithNum()).toBe(0);
  expect(first.GetLeftMarginForTabCalculation()).toBe(0);
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  const rule = first.GetNumRule() as SwNumRule,
    format = rule.Get(0).clone();
  format.SetIndentAt(800);
  format.SetFirstLineIndent(-200);
  rule.Set(0, format);
  expect([
    first.GetLeftMarginWithNum(),
    first.GetLeftMarginWithNum(true),
    first.GetLeftMarginForTabCalculation(),
  ]).toEqual([600, 800, 800]);
  first.SetParagraphTextLeftMargin(300);
  expect([
    first.GetLeftMarginWithNum(),
    first.GetLeftMarginWithNum(true),
    first.GetLeftMarginForTabCalculation(),
  ]).toEqual([-200, 0, 300]);
  first.SetParagraphFirstLineIndent(-100);
  expect([first.GetLeftMarginWithNum(), first.GetLeftMarginWithNum(true)]).toEqual([0, 0]);
});
it("resolves native legacy outer/text-left and absolute spacing independently", /** Checks negative, zero and positive legacy branches. @returns Nothing. */ () => {
  const { first } = fixture();
  applyWriterParagraphList(first, { kind: "numbered", level: 0 });
  const rule = first.GetNumRule() as SwNumRule,
    format = rule.Get(0).clone();
  format.SetPositionAndSpaceMode("label-width-and-position");
  format.SetAbsLSpace(500);
  format.SetFirstLineOffset(-200);
  rule.Set(0, format);
  expect([
    first.GetLeftMarginWithNum(),
    first.GetLeftMarginWithNum(true),
    first.GetLeftMarginForTabCalculation(),
  ]).toEqual([300, 500, 0]);
  first.SetParagraphTextLeftMargin(100);
  first.SetParagraphFirstLineIndent(-20);
  rule.SetAbsSpaces(true);
  expect([first.GetLeftMarginWithNum(), first.GetLeftMarginWithNum(true)]).toEqual([220, 420]);
  format.SetFirstLineOffset(-600);
  rule.Set(0, format);
  expect(first.GetLeftMarginWithNum()).toBe(-80);
  format.SetFirstLineOffset(0);
  rule.Set(0, format);
  expect(first.GetLeftMarginWithNum()).toBe(-80);
});
it("keeps native clipboard breaks, empty paragraphs and nonclipboard end flags", /** Checks actual writer defaults and bounded text endings. @returns Nothing. */ () => {
  const { first, second } = fixture(),
    writer = new SwASCWriter();
  expect([
    writer.m_bExportParagraphNumbering,
    writer.m_bWriteClipboardDoc,
    writer.m_bASCII_NoLastLineEnd,
  ]).toEqual([true, false, false]);
  expect(write(first, second, 0, 5, false, writer)).toBe("Alpha\nOmega\n");
  writer.m_bASCII_NoLastLineEnd = true;
  expect(write(first, second, 0, 5, false, writer)).toBe("Alpha\nOmega");
  writer.m_bASCII_NoLastLineEnd = false;
  expect(write(first, second, 0, 2, false, writer)).toBe("Alpha\nOm");
  second.SetText("");
  expect(write(first, second, 0, 0, false, clipboard())).toBe("Alpha\n");
});
