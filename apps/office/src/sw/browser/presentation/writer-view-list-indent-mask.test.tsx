/** @fileoverview Checks live native list-indent ownership independently on both axes. */
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SvxFirstLineIndentItem,
  SvxTextLeftMarginItem,
} from "../../../editeng/source/items/frmitems";
import { RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT, RES_PARATR_NUMRULE } from "../../inc/hintids";
import { createWriterNumFormat } from "../../source/core/doc/number";
import { SwFormatColl } from "../../source/core/doc/fmtcol";
import { createWriterDocument } from "../../source/core/doc/doc";
import { ListLevelIndents, SwNumRuleItem } from "../../source/core/para/paratr";
import { resolveSwListParagraphIndents } from "../../source/core/txtnode/ndtxt-list-indent";
import { projectSwTextPrintBounds } from "../../source/core/layout/newfrm";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterEditableParagraph } from "../editor/WriterEditableParagraph";
import { WriterViewStore } from "./writer-view-projection";

/** Requires actual owned fixture state. @param value - Optional owner. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing owned mask fixture");
  return value;
}

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases browser descendants and current Writer owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Creates a bound actual rule with independent authored alignment geometry. @param inherited - Apply the rule through a style. @param followedBy - Supported separator. @returns Actual owners. */
function fixture(inherited = false, followedBy: "listtab" | "nothing" = "listtab") {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  shell.Insert("MaskLayoutProof");
  const rule = doc.EnsureNumRule("MaskRule", "numbered");
  rule.Set(
    0,
    createWriterNumFormat("numbered", "", {
      positionAndSpaceMode: "label-alignment",
      indentAt: 720,
      firstLineIndent: -360,
      listTabPosition: 720,
      labelFollowedBy: followedBy,
      suffix: ".",
    }),
  );
  const node = shell.GetActiveParagraph();
  if (inherited) {
    const style = doc.GetTextFormatColl("text-body");
    style.ResetFormatAttr(RES_MARGIN_FIRSTLINE);
    style.ResetFormatAttr(RES_MARGIN_TEXTLEFT);
    style.SetFormatAttr(new SwNumRuleItem("MaskRule"));
    node.ChgFormatColl(style);
  } else node.SetNumRule("MaskRule");
  node.AddToList();
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, doc, node, rule, store };
}

describe("Writer independent live list-indent masks", /** Groups literal ownership and layout transitions. @returns Nothing. */ () => {
  it("retains native alignment without a list tab follower", /** Checks effective primitive selection independently of tab rendering. @returns Nothing. */ function projectsNoTabFollower() {
    const owner = fixture(false, "nothing");
    const paragraph = owner.store.GetSnapshot().activeParagraph;
    render(
      <WriterEditableParagraph
        index={0}
        isActive
        paragraph={paragraph}
        listMarker={paragraph.listMarker}
        retainElement={/** Retains no model references. @returns Nothing. */ () => undefined}
      />,
    );
    expect(screen.getByTestId(`writer-list-marker-${paragraph.id}`).parentElement).toHaveStyle({
      marginInlineStart: "18pt",
    });
  });
  for (const inherited of [false, true])
    for (const profile of [
      { left: undefined, first: undefined, mask: 3, textLeft: 720, offset: -360 },
      { left: 1680, first: undefined, mask: 1, textLeft: 1680, offset: -360 },
      { left: undefined, first: 120, mask: 2, textLeft: 720, offset: 120 },
      { left: 1680, first: 120, mask: 0, textLeft: 1680, offset: 120 },
      { left: 0, first: undefined, mask: 1, textLeft: 0, offset: -360 },
      { left: undefined, first: 0, mask: 2, textLeft: 720, offset: 0 },
      { left: 0, first: 0, mask: 0, textLeft: 0, offset: 0 },
      { left: 1680, first: 65537, mask: 0, textLeft: 1680, offset: 1 },
      { left: undefined, first: -65537, mask: 2, textLeft: 720, offset: -1 },
    ] as const)
      it(`selects mask=${profile.mask} left=${profile.left} first=${profile.first} inherited=${inherited}`, /** Checks independent native literals, complete ownership, frozen browser geometry and print inputs. @returns Nothing. */ function selectsIndependentMask() {
        const owner = fixture(inherited);
        if (profile.left !== undefined)
          owner.node.SetAttr(new SvxTextLeftMarginItem(profile.left, RES_MARGIN_TEXTLEFT));
        if (profile.first !== undefined)
          owner.node.SetAttr(new SvxFirstLineIndentItem(profile.first, RES_MARGIN_FIRSTLINE));
        const before = encodeWriterDocument(owner.doc),
          history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
        expect(owner.node.AreListLevelIndentsApplicable()).toBe(profile.mask);
        expect(resolveSwListParagraphIndents(owner.node)).toEqual({
          textLeft: profile.textLeft,
          firstLine: profile.offset,
          listLevelIndents: profile.mask,
        });
        const projected = owner.store.GetSnapshot().activeParagraph;
        expect(Object.isFrozen(projected)).toBe(true);
        expect(projected.computedStyle.firstLineIndentPt).toBe((profile.first ?? 0) / 20);
        const decoded = decodeWriterDocument(before);
        expect(decoded.paragraphs[0]?.AreListLevelIndentsApplicable()).toBe(profile.mask);
        expect(resolveSwListParagraphIndents(required(decoded.paragraphs[0]))).toEqual(
          resolveSwListParagraphIndents(owner.node),
        );
        expect(encodeWriterDocument(owner.doc)).toEqual(before);
        expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
      });

  it("recomputes after grouped edits and restores direct absence through Undo and Redo", /** Checks stored metadata cannot override live independent items or history. @returns Nothing. */ function tracksLiveMaskHistory() {
    const owner = fixture();
    owner.node.SetListGeometryWins(true);
    const before = encodeWriterDocument(owner.doc),
      retained = owner.store.GetSnapshot().activeParagraph;
    const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
    expect(
      owner.shell.SetParagraphItems([new SvxTextLeftMarginItem(1680, RES_MARGIN_TEXTLEFT)]),
    ).toBe(true);
    const leftOnly = encodeWriterDocument(owner.doc);
    expect(owner.node.AreListLevelIndentsApplicable()).toBe(ListLevelIndents.FirstLine);
    expect(resolveSwListParagraphIndents(owner.node)).toEqual({
      textLeft: 1680,
      firstLine: -360,
      listLevelIndents: ListLevelIndents.FirstLine,
    });
    expect(
      owner.shell.SetParagraphItems([new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE)]),
    ).toBe(true);
    const both = encodeWriterDocument(owner.doc);
    expect(owner.node.AreListLevelIndentsApplicable()).toBe(0);
    expect(resolveSwListParagraphIndents(owner.node)?.firstLine).toBe(120);
    expect(
      owner.shell.SetParagraphItems([new SvxFirstLineIndentItem(120, RES_MARGIN_FIRSTLINE)]),
    ).toBe(false);
    expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 2);
    expect(owner.shell.Undo()).toBe(true);
    expect(encodeWriterDocument(owner.doc)).toEqual(leftOnly);
    expect(owner.shell.Undo()).toBe(true);
    expect(encodeWriterDocument(owner.doc)).toEqual(before);
    expect(owner.node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false)).toBeUndefined();
    expect(owner.node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_TEXTLEFT, false)).toBeUndefined();
    expect(owner.shell.Redo()).toBe(true);
    expect(encodeWriterDocument(owner.doc)).toEqual(leftOnly);
    expect(owner.shell.Redo()).toBe(true);
    expect(encodeWriterDocument(owner.doc)).toEqual(both);
    expect(retained.computedStyle.firstLineIndentPt).toBe(0);
    expect(retained.textLeftMargin).toBe(0);
    const destination = decodeWriterDocument(before);
    expect(owner.node.CloneTo(destination.GetNodes()).AreListLevelIndentsApplicable()).toBe(0);
  });

  for (const axis of [RES_MARGIN_FIRSTLINE, RES_MARGIN_TEXTLEFT])
    it(`honors style indent-before-rule precedence for axis ${axis}`, /** Checks nearest owning style, intermediate style and direct rule override. @returns Nothing. */ function selectsStyleHierarchy() {
      const owner = fixture(true);
      const parent = owner.doc.GetTextFormatColl("text-body"),
        child = owner.doc.GetTextFormatColl("heading");
      child.ResetFormatAttr(RES_MARGIN_FIRSTLINE);
      child.ResetFormatAttr(RES_MARGIN_TEXTLEFT);
      child.ResetFormatAttr(RES_PARATR_NUMRULE);
      child.SetDerivedFrom(parent);
      owner.node.ChgFormatColl(child);
      expect(owner.node.AreListLevelIndentsApplicable()).toBe(3);
      const item =
        axis === RES_MARGIN_FIRSTLINE
          ? new SvxFirstLineIndentItem(120, axis)
          : new SvxTextLeftMarginItem(1680, axis);
      parent.SetFormatAttr(item);
      expect(owner.node.AreListLevelIndentsApplicable()).toBe(
        axis === RES_MARGIN_FIRSTLINE ? 2 : 1,
      );
      parent.ResetFormatAttr(axis);
      child.SetFormatAttr(item);
      expect(owner.node.AreListLevelIndentsApplicable()).toBe(
        axis === RES_MARGIN_FIRSTLINE ? 2 : 1,
      );
      owner.node.SetNumRule("MaskRule");
      expect(owner.node.AreListLevelIndentsApplicable()).toBe(3);
    });

  it("retains native root-completion and non-text parent fallthrough", /** Checks transitory bound-record traversal without fabricating ordinary command state. @returns Nothing. */ function checksNativeTraversalFallback() {
    const owner = fixture();
    // The native function has a true fallback for a retained bound record
    // during attribute replacement, before its style rule is reachable.
    required(owner.node.GetpSwAttrSet()).ClearItem(RES_PARATR_NUMRULE);
    const style = owner.node.GetTextFormatColl();
    style.ResetFormatAttr(RES_MARGIN_FIRSTLINE);
    style.ResetFormatAttr(RES_MARGIN_TEXTLEFT);
    style.SetDerivedFrom(undefined);
    expect(owner.node.AreListLevelIndentsApplicable()).toBe(3);
    style.SetDerivedFrom(new SwFormatColl(owner.doc.GetAttrPool(), "NonText"));
    expect(owner.node.AreListLevelIndentsApplicable()).toBe(3);
  });

  it("keeps absent, unbound and legacy rules outside alignment resolution", /** Checks source bound-rule policy rather than effective rule guesses. @returns Nothing. */ function bypassesOtherRuleStates() {
    const doc = createWriterDocument(),
      node = required(doc.paragraphs[0]);
    expect(node.AreListLevelIndentsApplicable()).toBe(0);
    expect(resolveSwListParagraphIndents(node)).toBeUndefined();
    const owner = fixture();
    const record = required(owner.node.GetNum());
    const spy = vi.spyOn(record, "GetNumRule").mockReturnValue(undefined);
    expect(owner.node.AreListLevelIndentsApplicable()).toBe(0);
    expect(resolveSwListParagraphIndents(owner.node)).toBeUndefined();
    spy.mockRestore();
    owner.rule.Set(
      0,
      createWriterNumFormat("numbered", "", {
        positionAndSpaceMode: "label-width-and-position",
        absLSpace: 720,
        firstLineOffset: -360,
      }),
    );
    expect(resolveSwListParagraphIndents(owner.node)).toBeUndefined();
    expect(projectSwTextPrintBounds(owner.node, owner.doc.GetPageDesc().GetValue()).left).toBe(360);
  });

  for (const counted of [false, true])
    for (const ignore of [false, true])
      it(`applies counted=${counted} ignore=${ignore} to a paragraph-owned first offset`, /** Checks counted bypass, existing compatibility flag and literal signed-short inputs. @returns Nothing. */ function selectsCountedCompatibility() {
        const owner = fixture();
        owner.node.SetAttr(new SvxFirstLineIndentItem(65537, RES_MARGIN_FIRSTLINE, true));
        owner.node.SetCountedInList(counted);
        owner.doc.GetDocumentSettingManager().set("IGNORE_FIRST_LINE_INDENT_IN_NUMBERING", ignore);
        expect(resolveSwListParagraphIndents(owner.node)?.firstLine).toBe(
          counted && !ignore ? 1 : 0,
        );
      });

  for (const level of [-1, 17])
    it(`bounds actual alignment level ${level}`, /** Checks native list-level bounding against real rule slots. @returns Nothing. */ function boundsActualLevel() {
      const owner = fixture();
      owner.rule.Set(
        9,
        createWriterNumFormat("numbered", "", {
          positionAndSpaceMode: "label-alignment",
          indentAt: 1680,
          firstLineIndent: -120,
          labelFollowedBy: "nothing",
        }),
      );
      vi.spyOn(owner.node, "GetActualListLevel").mockReturnValue(level);
      const resolved = required(resolveSwListParagraphIndents(owner.node));
      expect(resolved.textLeft).toBe(level < 0 ? 720 : 1680);
      expect(resolved.firstLine).toBe(level < 0 ? -360 : -120);
    });
});
