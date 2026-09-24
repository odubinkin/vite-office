/** @fileoverview Verifies Writer shell paragraph dialog and ruler command boundaries. */
import { describe, expect, it } from "vitest";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SfxBoolItem } from "../../../../svl/source/items/poolitem";
import {
  SvxLineSpacingItem,
  SvxTabAdjust,
  SvxTabStop,
  SvxTabStopItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  RES_KEEP,
  RES_LINENUMBER,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
} from "../../../inc/hintids";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh";
import {
  fixtureSplitParagraph,
  setTestCursor,
  setTestSelection,
} from "../../../../test/wrtsh-test-helpers";

/** Creates a shell fixture. @param text - Initial text. @returns Writer shell. */
function createShell(text: string): SwWrtShell {
  const document = createWriterDocument();
  document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(
    new SwDocShell(
      document,
      createDocument({ id: "ruler-document", suiteId: "writer", title: "Ruler document" }),
    ),
  );
}

describe("Writer paragraph dialog and ruler shell", /** Registers command-boundary tests. @returns Nothing. */ () => {
  it("applies paragraph drafts across a mixed selection while preserving each tab's metadata", /** Verifies per-paragraph tab metadata and one undo group. @returns Nothing. */ () => {
    const shell = createShell("firstsecond");
    const secondId = fixtureSplitParagraph(shell, "p-1", 5);
    const first = shell.GetDoc().paragraphs[0] as SwTextNode;
    const second = shell.GetDoc().paragraphs[1] as SwTextNode;
    setTestCursor(shell, "p-1", 0);
    expect(
      shell.SetParagraphItem(
        SvxTabStopItem.FromStops(
          RES_PARATR_TABSTOP,
          [new SvxTabStop(720, SvxTabAdjust.Right, ".", "_")],
          1134,
        ),
      ),
    ).toBe(true);
    setTestCursor(shell, secondId, 0);
    expect(
      shell.SetParagraphItem(
        SvxTabStopItem.FromStops(
          RES_PARATR_TABSTOP,
          [new SvxTabStop(720, SvxTabAdjust.Decimal, ",", ".")],
          1134,
        ),
      ),
    ).toBe(true);
    setTestSelection(shell, {
      mark: { paragraphId: "p-1", offset: 1 },
      point: { paragraphId: secondId, offset: 1 },
    });
    const before = shell.GetDocShell().GetUndoManager().GetUndoActionCount();
    const draft = {
      upperPt: 6,
      lowerPt: 3,
      contextual: true,
      lineMode: "fixed" as const,
      lineValue: 240,
      fontIndependent: true,
      tabStopsPt: [36, 72],
      keepWithNext: true,
      countLineNumbers: false,
    };
    expect(shell.ApplyParagraphFormat(draft)).toBe(true);
    expect(shell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(before + 1);
    for (const paragraph of [first, second]) {
      expect((paragraph.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(120);
      expect((paragraph.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
      expect((paragraph.GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue()).toBe(false);
    }
    expect((first.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetFill()).toBe("_");
    expect((second.GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetAdjustment()).toBe(
      SvxTabAdjust.Decimal,
    );
    expect(shell.ApplyParagraphFormat(draft)).toBe(false);
    expect(shell.Undo()).toBe(true);
    expect((first.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(false);
    expect((second.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(false);
    expect(shell.Redo()).toBe(true);
    expect((second.GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
  });

  it("rejects invalid paragraph drafts and preserves ruler tab metadata through moves", /** Verifies validation and ruler tab transitions. @returns Nothing. */ () => {
    const shell = createShell("Body");
    const draft = {
      upperPt: 0,
      lowerPt: 0,
      contextual: false,
      lineMode: "proportional" as const,
      lineValue: 100,
      fontIndependent: false,
      tabStopsPt: [36],
      keepWithNext: false,
      countLineNumbers: true,
    };
    const before = shell.GetDocShell().GetUndoManager().GetUndoActionCount();
    expect(shell.ApplyParagraphFormat({ ...draft, upperPt: -1 })).toBe(false);
    expect(shell.ApplyParagraphFormat({ ...draft, tabStopsPt: [Infinity] })).toBe(false);
    expect(shell.SetLineSpacingPercent(-1)).toBe(false);
    expect(shell.SetTabStopPositions([32768])).toBe(false);
    expect(shell.SetTabStopPositions([0])).toBe(false);
    expect(shell.GetDocShell().GetUndoManager().GetUndoActionCount()).toBe(before);
    expect(shell.SetTabStopPositions([720])).toBe(true);
    expect(shell.SetParagraphItems([new SvxLineSpacingItem(150, RES_PARATR_LINESPACING)])).toBe(
      true,
    );
    expect(
      shell.SetParagraphItem(
        SvxTabStopItem.FromStops(
          RES_PARATR_TABSTOP,
          [new SvxTabStop(720, SvxTabAdjust.Right, ".", "_"), new SvxTabStop(1440)],
          1134,
        ),
      ),
    ).toBe(true);
    expect(shell.MoveRulerTabStop(0, 120)).toBe(true);
    expect(shell.MoveRulerTabStop(-1, 10)).toBe(false);
    expect(shell.MoveRulerTabStop(99, 10)).toBe(false);
    expect(shell.MoveRulerTabStop(0, Infinity)).toBe(false);
    expect(shell.MoveRulerTabStop(0, 32768)).toBe(false);
    const tabs = shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem;
    expect([
      tabs.At(0).GetTabPos(),
      tabs.At(0).GetAdjustment(),
      tabs.At(0).GetFill(),
      tabs.GetDefaultDistance(),
    ]).toEqual([840, SvxTabAdjust.Right, "_", 1134]);
    expect(shell.Undo()).toBe(true);
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).At(0).GetTabPos(),
    ).toBe(720);
    expect(shell.MoveRulerTabStop(0, -1000)).toBe(true);
    expect((shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SvxTabStopItem).Count()).toBe(
      1,
    );
  });
  it("commits page and paragraph ruler deltas through undoable shell actions", /** Verifies shell-owned ruler bounds and history. @returns Nothing. */ () => {
    const shell = createShell("Body");
    const page = shell.GetDoc().GetPageDesc().GetValue();
    expect(shell.AdjustPageMargin("left", NaN)).toBe(false);
    expect(shell.AdjustPageMargin("left", 120)).toBe(true);
    expect(shell.AdjustPageMargin("right", 120)).toBe(true);
    expect(shell.AdjustPageMargin("top", 120)).toBe(true);
    expect(shell.AdjustPageMargin("bottom", 120)).toBe(true);
    const changed = shell.GetDoc().GetPageDesc().GetValue();
    expect(changed).toMatchObject({
      leftMargin: page.leftMargin + 120,
      rightMargin: page.rightMargin - 120,
      topMargin: page.topMargin + 120,
      bottomMargin: page.bottomMargin - 120,
    });
    expect(shell.AdjustParagraphRulerIndent("left", NaN)).toBe(false);
    expect(shell.AdjustParagraphRulerIndent("left", 120)).toBe(true);
    expect(shell.AdjustParagraphRulerIndent("firstLine", 60)).toBe(true);
    expect(shell.AdjustParagraphRulerIndent("right", -80)).toBe(true);
    const paragraph = shell.GetActiveParagraph();
    expect([
      paragraph.GetParagraphTextLeftMargin(),
      paragraph.GetParagraphFirstLineIndent(),
      paragraph.GetParagraphRightMargin(),
    ]).toEqual([120, 60, 80]);
    expect(shell.Undo()).toBe(true);
    expect(paragraph.GetParagraphRightMargin()).toBe(0);
    expect(shell.Redo()).toBe(true);
    expect(paragraph.GetParagraphRightMargin()).toBe(80);
  });
});
