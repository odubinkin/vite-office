/** @fileoverview Verifies supported Writer MoveLeftMargin transitions against pinned edattr.cxx and docfmt.cxx. */

import { describe, expect, it } from "vitest";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { SvxTabStop, SvxTabStopItem } from "../../../../editeng/source/items/paraitem";
import { RES_PARATR_TABSTOP } from "../../../inc/hintids";
import { SwDocShell } from "../app/docsh";
import { SwWrtShell } from "./wrtsh";
import {
  fixtureSplitParagraph,
  setTestCursor,
  setTestSelection,
} from "../../../../test/wrtsh-test-helpers";

/** Creates one Writer shell fixture. @param text - Initial text. @returns Writer shell. */
function createShell(text: string): SwWrtShell {
  const document = createWriterDocument();
  document.paragraphs[0]?.InsertText(text, 0);
  return new SwWrtShell(
    new SwDocShell(
      document,
      createDocument({
        id: "indent-document",
        suiteId: "writer",
        title: "Indent document",
      }),
    ),
  );
}

describe("Writer MoveLeftMargin", /** Registers upstream-backed indent cases. @returns Nothing. */ () => {
  it("moves all selected list nodes as one numbering undo unit", /** Checks the supported non-outline SwDoc::NumUpDown range. @returns Nothing. */ () => {
    const shell = createShell("firstsecond");
    const secondId = fixtureSplitParagraph(shell, "p-1", 5);
    setTestCursor(shell, "p-1", 0);
    expect(shell.SetParagraphListKind("numbered")).toBe(true);
    setTestCursor(shell, secondId, 0);
    expect(shell.SetParagraphListKind("numbered")).toBe(true);
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: secondId },
    });
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    const paragraphs = shell.GetDoc().paragraphs;
    expect(paragraphs[0]?.GetAttrListLevel()).toBe(1);
    expect(paragraphs[1]?.GetAttrListLevel()).toBe(1);
    expect(shell.Undo()).toBe(true);
    expect(paragraphs[0]?.GetAttrListLevel()).toBe(0);
    expect(paragraphs[1]?.GetAttrListLevel()).toBe(0);
  });
  it("uses document-default tabs across the selected paragraph range as one undo action", /** Checks pinned docfmt and edattr behavior beyond the active paragraph. @returns Nothing. */ () => {
    const shell = createShell("firstsecond");
    const secondId = fixtureSplitParagraph(shell, "p-1", 5);
    const paragraphs = shell.GetDoc().paragraphs;
    const tabs = shell
      .GetDoc()
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
    tabs.Remove(0, tabs.Count());
    tabs.Insert(new SvxTabStop(720));
    setTestSelection(shell, {
      mark: { offset: 2, paragraphId: "p-1" },
      point: { offset: 3, paragraphId: secondId },
    });
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    expect(
      paragraphs.map(
        /** Reads one margin. @param node - Text node. @returns Twips. */ (node) =>
          node.GetParagraphTextLeftMargin(),
      ),
    ).toEqual([720, 720]);
    expect(shell.Undo()).toBe(true);
    expect(
      paragraphs.map(
        /** Reads one margin. @param node - Text node. @returns Twips. */ (node) =>
          node.GetParagraphTextLeftMargin(),
      ),
    ).toEqual([0, 0]);
    expect(shell.Redo()).toBe(true);
    expect(
      paragraphs.map(
        /** Reads one margin. @param node - Text node. @returns Twips. */ (node) =>
          node.GetParagraphTextLeftMargin(),
      ),
    ).toEqual([720, 720]);
    expect(shell.ChangeParagraphIndent(false)).toBe(true);
    expect(
      paragraphs.map(
        /** Reads one margin. @param node - Text node. @returns Twips. */ (node) =>
          node.GetParagraphTextLeftMargin(),
      ),
    ).toEqual([0, 0]);
  });

  it("honors unsnapped indent requests and the upstream frame-width guard", /** Checks modifier semantics and increase availability. @returns Nothing. */ () => {
    const shell = createShell("Body");
    const paragraph = shell.GetActiveParagraph();
    const tabs = shell
      .GetDoc()
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
    tabs.Remove(0, tabs.Count());
    tabs.Insert(new SvxTabStop(720));
    expect(shell.SetParagraphRulerIndents({ firstLine: 0, left: 300, right: 0 })).toBe(true);
    expect(shell.ChangeParagraphIndent(true, false)).toBe(true);
    expect(paragraph.GetParagraphTextLeftMargin()).toBe(1020);
    expect(shell.ChangeParagraphIndent(false, false)).toBe(true);
    expect(paragraph.GetParagraphTextLeftMargin()).toBe(300);
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    expect(paragraph.GetParagraphTextLeftMargin()).toBe(720);
    const page = shell.GetDoc().GetPageDesc().GetValue();
    expect(
      shell.SetParagraphRulerIndents({
        firstLine: 0,
        left: page.width - page.leftMargin - page.rightMargin - 500,
        right: 0,
      }),
    ).toBe(true);
    expect(shell.CanChangeParagraphIndent(true)).toBe(false);
    expect(shell.ChangeParagraphIndent(true)).toBe(false);
  });

  it("uses the upstream fallback only when the default tab item has no stops", /** Checks the 1134 twip fallback and invalid zero stop. @returns Nothing. */ () => {
    const shell = createShell("Body");
    const tabs = shell
      .GetDoc()
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
    tabs.Remove(0, tabs.Count());
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    expect(shell.GetActiveParagraph().GetParagraphTextLeftMargin()).toBe(1134);
    tabs.Insert(new SvxTabStop(0));
    expect(shell.CanChangeParagraphIndent(true)).toBe(false);
    expect(shell.ChangeParagraphIndent(true)).toBe(false);
  });

  it("skips unchanged selected nodes while decreasing the other nodes", /** Checks one grouped request with a no-op member. @returns Nothing. */ () => {
    const shell = createShell("firstsecond");
    const secondId = fixtureSplitParagraph(shell, "p-1", 5);
    const tabs = shell
      .GetDoc()
      .GetAttrPool()
      .GetUserOrPoolDefaultItem(RES_PARATR_TABSTOP) as SvxTabStopItem;
    tabs.Remove(0, tabs.Count());
    tabs.Insert(new SvxTabStop(720));
    setTestCursor(shell, secondId, 0);
    expect(shell.ChangeParagraphIndent(true)).toBe(true);
    setTestSelection(shell, {
      mark: { offset: 0, paragraphId: "p-1" },
      point: { offset: 0, paragraphId: secondId },
    });
    expect(shell.ChangeParagraphIndent(false)).toBe(true);
    expect(shell.GetDoc().paragraphs[0]?.GetParagraphTextLeftMargin()).toBe(0);
    expect(shell.GetDoc().paragraphs[1]?.GetParagraphTextLeftMargin()).toBe(0);
  });
});
