/** @fileoverview Original page header/footer item and frame-section lifecycle. */
import { SwFormatLineNumber } from "./fmtline";
import { assert, expect, it } from "vitest";
import { SwDoc } from "../source/core/doc/doc";
import { SwPageDesc, UseOnPage } from "../source/core/layout/pagedesc";
import { SwTextNode } from "../source/core/txtnode/ndtxt";
import { SwFrameFormat } from "../source/core/layout/atrfrm";
import { SwFormatFooter, SwFormatHeader } from "./fmthdft";
import { RES_FOOTER, RES_HEADER, RES_LINENUMBER, RES_PARATR_TABSTOP } from "./hintids";
import { SwStartNodeType } from "./ndtyp";
import { SwPoolFormatId } from "./poolfmt";
import { RndStdIds } from "../../svx/inc/swframetypes";
import { SfxItemSet } from "../../svl/source/items/itemset";
import { SfxBoolItem } from "../../svl/source/items/cenumitm";
import { SvxAdjust } from "../../editeng/inc/adjustitem";
import { SvxTabAdjust, SvxTabStopItem } from "../../editeng/inc/tstpitem";
import { SwXHeadFootText } from "../source/core/unocore/unotext";
import { unicode } from "../source/core/unocore/unocrsrhelper";

it("distinguishes a null frame from an active frame without a content index", /** Exercises both native pointer constructor cases and frame-only deletion. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const frame = new SwFrameFormat(doc.GetAttrPool(), "Right header");
  const empty = new SwFormatHeader(null);
  const item = new SwFormatHeader(frame);
  try {
    expect(empty.equals(new SwFormatHeader(false))).toBe(true);
    expect(empty.equals(new SwFormatHeader(true))).toBe(false);
    expect(empty.equals(new SfxBoolItem(RES_HEADER, false))).toBe(false);
    expect(item.IsActive()).toBe(true);
    expect(
      /** Requires an existing section when obtaining the frame's UNO text. @returns Current text owner. */
      () => SwXHeadFootText.CreateXHeadFootText(frame),
    ).toThrow();
  } finally {
    empty.Dispose();
    item.Dispose();
    doc.Dispose();
  }
  expect(frame.IsDisposed()).toBe(true);
});

it("uses inactive WhichId defaults and materializes independent page sections on activation", /** Exercises typed page-format retrieval and real UNO text ownership. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const master = doc.GetPageDesc().GetMaster(),
      nodes = doc.GetNodes();
    expect(master.GetHeader()).toBe(doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_HEADER));
    expect(master.GetFooter()).toBe(doc.GetAttrPool().GetUserOrPoolDefaultItem(RES_FOOTER));
    expect(master.GetHeader().IsActive()).toBe(false);
    expect(master.GetFooter().IsActive()).toBe(false);
    expect(master.GetHeader().GetHeaderFormat()).toBeNull();
    expect(master.GetFooter().GetFooterFormat()).toBeNull();
    master.SetFormatAttr(new SwFormatHeader(true));
    master.SetFormatAttr(new SwFormatFooter(true));
    const header = master.GetHeader().GetHeaderFormat(),
      footer = master.GetFooter().GetFooterFormat();
    assert(header && footer);
    expect(header.GetName()).toBe("Right header");
    expect(footer.GetName()).toBe("Right footer");
    expect(header.DerivedFrom()).toBe(doc.GetDfltFrameFormat());
    expect(footer.DerivedFrom()).toBe(doc.GetDfltFrameFormat());
    const headerStart = header.GetContent().GetContentIdx()?.GetNode();
    const footerStart = footer.GetContent().GetContentIdx()?.GetNode();
    assert(headerStart?.IsStartNode() && footerStart?.IsStartNode());
    expect(headerStart.GetStartNodeType()).toBe(SwStartNodeType.SwHeaderStartNode);
    expect(footerStart.GetStartNodeType()).toBe(SwStartNodeType.SwFooterStartNode);
    expect(footerStart.GetIndex()).toBeLessThan(nodes.GetEndOfAutotext().GetIndex());
    const footerText = SwXHeadFootText.CreateXHeadFootText(footer);
    expect(SwXHeadFootText.CreateXHeadFootText(footer)).toBe(footerText);
    const value = unicode("Footer");
    try {
      footerText.setString(value);
      expect(footerText.GetTextNodes()[0]?.GetText()).toBe("Footer");
      expect(
        doc.paragraphs.map(
          /** Reads body text independently of the extra section. @param paragraph - Body node. @returns Text. */
          (paragraph) => paragraph.GetText(),
        ),
      ).toEqual([""]);
    } finally {
      value.dispose();
      footerText.dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("uses real pool style ancestry, tabs and line numbering for page format variants", /** Covers default, left and right requests with an actual attribute override. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const manager = doc.getIDocumentLayoutAccess();
  const master = doc.GetPageDesc().GetMaster();
  const set = new SfxItemSet(doc.GetAttrPool(), master.GetAttrSet().GetRanges());
  try {
    const width =
      master.GetFrameSize().GetWidth() -
      master.GetLRSpace().ResolveLeft() -
      master.GetLRSpace().ResolveRight();
    for (const [request, id] of [
      [RndStdIds.HEADERL, SwPoolFormatId.COLL_HEADERL],
      [RndStdIds.HEADERR, SwPoolFormatId.COLL_HEADERR],
    ] as const) {
      set.Put(new SwFormatFooter(false));
      const item = new SwFormatHeader(manager.MakeLayoutFormat(request, set));
      try {
        const frame = item.GetHeaderFormat();
        const start = frame?.GetContent().GetContentIdx()?.GetNode();
        assert(start);
        expect(frame?.GetAttrSet().GetItemIfSet(RES_FOOTER, false)).toBeInstanceOf(SwFormatFooter);
        const node = doc.GetNodes().at(start.GetIndex() + 1);
        assert(node instanceof SwTextNode);
        const style = node.GetTextFormatColl();
        expect(style.GetPoolFormatId()).toBe(id);
        expect(style.DerivedFrom()?.GetPoolFormatId()).toBe(SwPoolFormatId.COLL_HEADER);
        expect(style.GetAttrSet().GetAdjust().GetAdjust()).toBe(
          request === RndStdIds.HEADERR
            ? SvxAdjust.Right
            : doc.GetDfltTextFormatColl().GetAttrSet().GetAdjust().GetAdjust(),
        );
        expect((style.GetAttrSet().Get(RES_LINENUMBER) as SwFormatLineNumber).IsCount()).toBe(
          false,
        );
        const tabs = style.GetAttrSet().Get(RES_PARATR_TABSTOP);
        assert(tabs instanceof SvxTabStopItem);
        expect(tabs.Count()).toBe(2);
        expect([tabs.At(0).GetTabPos(), tabs.At(0).GetAdjustment()]).toEqual([
          Math.trunc(width / 2),
          SvxTabAdjust.Center,
        ]);
        expect([tabs.At(1).GetTabPos(), tabs.At(1).GetAdjustment()]).toEqual([
          width,
          SvxTabAdjust.Right,
        ]);
      } finally {
        item.Dispose();
      }
    }
  } finally {
    set.Dispose();
    doc.Dispose();
  }
});

it("retains one shared footer until all native page owners release it", /** Checks item clone equality, batched resets and section deletion without undo. @returns Nothing. */ () => {
  const doc = new SwDoc();
  const page = doc.GetPageDesc(),
    master = page.GetMaster(),
    left = page.GetLeft();
  let copy: SwPageDesc | undefined;
  try {
    master.SetFormatAttr(new SwFormatFooter(true));
    const footer = master.GetFooter();
    const frame = footer.GetFooterFormat();
    assert(frame);
    const section = frame.GetContent().GetContentIdx()?.GetNode();
    assert(section);
    const footerText = SwXHeadFootText.CreateXHeadFootText(frame);
    const item = footer.Clone();
    const header = new SwFormatHeader(frame);
    try {
      expect(item.equals(footer)).toBe(true);
      expect(item.equals(new SwFormatFooter(true))).toBe(false);
      expect(item.equals(header)).toBe(false);
      left.SetFormatAttr(item);
    } finally {
      header.Dispose();
      item.Dispose();
    }
    copy = new SwPageDesc(page);
    expect(copy.GetMaster().GetFooter().GetFooterFormat()).toBe(frame);
    expect(left.GetFooter().GetFooterFormat()).toBe(frame);
    expect(page.IsFooterShared()).toBe(true);
    expect(page.IsHeaderShared()).toBe(true);
    page.ChgFooterShare(false);
    page.ChgHeaderShare(false);
    expect(page.IsFooterShared()).toBe(false);
    expect(page.IsHeaderShared()).toBe(false);
    expect(page.GetUseOn()).toBe(UseOnPage.All);
    page.ChgFooterShare(true);
    page.ChgHeaderShare(true);
    copy.DisposeModify();
    copy = undefined;
    master.ResetFormatAttr(RES_FOOTER);
    expect(doc.GetNodes().indexOfOrUndefined(section)).toBeDefined();
    const enabled = doc.GetUndoManager().DoesUndo();
    left.RunNotificationTransaction(
      /** Keeps the registered old section alive until the attribute broadcast completes. @returns Nothing. */
      () => {
        left.ResetFormatAttr(RES_FOOTER);
        expect(doc.GetNodes().indexOfOrUndefined(section)).toBeDefined();
      },
    );
    expect(doc.GetNodes().indexOfOrUndefined(section)).toBeUndefined();
    expect(frame.IsDisposed()).toBe(true);
    expect(
      /** Uses the original UNO failure on an acquired text when the frame dies. @returns Section start. */
      () => footerText.GetStartNode(),
    ).toThrow();
    footerText.dispose();
    expect(doc.GetUndoManager().DoesUndo()).toBe(enabled);
  } finally {
    copy?.DisposeModify();
    doc.Dispose();
  }
});
