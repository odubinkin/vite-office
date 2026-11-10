/** @fileoverview Native frame-format index clearing and represented owning-table teardown, observed on real owners before native lifetime ends. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "./doc";
import { ClearFrameFormatIndices } from "./docnew";
import { SwFrameFormat } from "../layout/atrfrm";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwNodeRange } from "../../../inc/ndindex";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwPosition } from "../crsr/pam";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
/** Creates an actual section and stores real cloned optional index/position items on an actual registered format. @param document - Actual document. @param special - Actual native collection choice. @returns Actual source owners. */
function fixture(document: SwDoc, special = false) {
  const nodes = document.GetNodes(),
    boundary = nodes.GetEndOfAutotext(),
    text = nodes.MakeTextNode(boundary, document.GetDfltTextFormatColl()),
    range = new SwNodeRange(boundary, -1, boundary);
  nodes.SectionDown(range, SwStartNodeType.SwFlyStartNode);
  range.Dispose();
  const format = special
    ? document.MakeFlyFrameFormat("Fly", document.GetDfltFrameFormat())
    : new SwFrameFormat(
        document.GetAttrPool(),
        "Ordinary",
        undefined,
        document.GetDfltFrameFormat(),
      );
  if (!special) document.GetFrameFormats().push_back(format);
  const content = new SwFormatContent(text.StartOfSectionNode()),
    anchor = new SwFormatAnchor(RndStdIds.FLY_AT_PARA),
    body = document.paragraphs[0];
  assert(body);
  const position = new SwPosition(body);
  anchor.SetAnchor(position);
  format.SetFormatAttr(content);
  format.SetFormatAttr(anchor);
  content.Dispose();
  anchor.Dispose();
  position.Dispose();
  return { format, text, start: text.StartOfSectionNode() };
}
it.each([false, true])(
  "clears real owned indices in content-before-anchor order for special=%s",
  /** Original helper mutates actual installed items and preserves format/section identity. @param special - Native table. @returns Nothing. */ (
    special,
  ) => {
    const document = new SwDoc(),
      x = fixture(document, special),
      content = x.format.GetContent(),
      anchor = x.format.GetAnchor(),
      index = content.GetContentIdx(),
      position = anchor.GetContentAnchor();
    assert(index);
    assert(position);
    const releaseContent = vi.spyOn(index, "Dispose"),
      releaseAnchor = vi.spyOn(position, "Dispose");
    const contentClear = vi.spyOn(content, "SetNewContentIdx"),
      anchorClear = vi.spyOn(anchor, "SetAnchor"),
      revision = document.GetDocumentStateManager().GetModelRevision();
    try {
      ClearFrameFormatIndices(document);
      expect(content.GetContentIdx()).toBeNull();
      expect(anchor.GetAnchorNode()).toBeNull();
      expect(contentClear).toHaveBeenCalledExactlyOnceWith(null);
      expect(anchorClear).toHaveBeenCalledExactlyOnceWith(null);
      expect(releaseContent).toHaveBeenCalledTimes(1);
      expect(releaseAnchor).toHaveBeenCalledTimes(1);
      expect(releaseContent.mock.invocationCallOrder[0]).toBeLessThan(
        releaseAnchor.mock.invocationCallOrder[0] as number,
      );
      expect(x.format.GetContent()).toBe(content);
      expect(x.format.GetAnchor()).toBe(anchor);
      expect(x.text.StartOfSectionNode()).toBe(x.start);
      expect(document.GetNodes().at(x.start.GetIndex())).toBe(x.start);
      expect(document.GetDocumentStateManager().GetModelRevision()).toBe(revision);
      ClearFrameFormatIndices(document);
      expect(releaseContent).toHaveBeenCalledTimes(1);
      expect(releaseAnchor).toHaveBeenCalledTimes(1);
    } finally {
      document.Dispose();
    }
  },
);
it("clears inherited effective items in place without replacing or authoring child entries", /** Original const-cast operation targets actual effective item ownership. @returns Nothing. */ () => {
  const document = new SwDoc(),
    x = fixture(document),
    child = new SwFrameFormat(document.GetAttrPool(), "Child", undefined, x.format);
  document.GetFrameFormats().push_back(child);
  const content = x.format.GetContent(),
    anchor = x.format.GetAnchor(),
    clearContent = vi.spyOn(content, "SetNewContentIdx"),
    clearAnchor = vi.spyOn(anchor, "SetAnchor"),
    count = child.GetAttrSet().Count();
  try {
    expect(child.GetContent()).toBe(content);
    expect(child.GetAnchor()).toBe(anchor);
    ClearFrameFormatIndices(document);
    expect(clearContent).toHaveBeenCalledExactlyOnceWith(null);
    expect(clearAnchor).toHaveBeenCalledExactlyOnceWith(null);
    expect(child.GetAttrSet().Count()).toBe(count);
    expect(child.GetContent()).toBe(content);
    expect(child.GetAnchor()).toBe(anchor);
  } finally {
    document.Dispose();
  }
});
it("does not reset an unpositioned PAGE anchor or manufacture a content item", /** Source nullptr guards retain page numbering and default item identity. @returns Nothing. */ () => {
  const document = new SwDoc(),
    format = document.GetDfltFrameFormat(),
    page = new SwFormatAnchor(RndStdIds.FLY_AT_PAGE);
  page.SetPageNum(7);
  format.SetFormatAttr(page);
  page.Dispose();
  const anchor = format.GetAnchor(),
    content = format.GetContent(),
    clearAnchor = vi.spyOn(anchor, "SetAnchor"),
    clearContent = vi.spyOn(content, "SetNewContentIdx");
  try {
    ClearFrameFormatIndices(document);
    expect(clearAnchor).not.toHaveBeenCalled();
    expect(clearContent).not.toHaveBeenCalled();
    expect(anchor.GetPageNum()).toBe(7);
    expect(format.GetContent()).toBe(content);
  } finally {
    document.Dispose();
  }
});
it("clears format indices before page disposal, then deletes special/ordinary tables with default removed", /** Assertions execute only inside call-through spies while actual native owners remain live. @returns Nothing. */ () => {
  const document = new SwDoc(),
    normal = fixture(document),
    fly = fixture(document, true),
    ordinary = document.GetFrameFormats(),
    special = document.GetSpzFrameFormats(),
    defaultFormat = document.GetDfltFrameFormat(),
    undo = document.GetUndoManager(),
    page = document.GetPageDesc(),
    events: string[] = [];
  const disposeUndo = undo.Dispose.bind(undo),
    disposePage = page.DisposeModify.bind(page),
    disposeNormal = normal.format.DisposeModify.bind(normal.format),
    disposeFly = fly.format.DisposeModify.bind(fly.format);
  vi.spyOn(undo, "Dispose").mockImplementation(
    /** Observes actual earlier history release. @returns Nothing. */ () => {
      events.push("undo");
      disposeUndo();
    },
  );
  vi.spyOn(page, "DisposeModify").mockImplementation(
    /** Validates source index cleanup before native page lifetime ends. @returns Nothing. */ () => {
      events.push("page");
      for (const format of [normal.format, fly.format]) {
        expect(format.GetContent().GetContentIdx()).toBeNull();
        expect(format.GetAnchor().GetAnchorNode()).toBeNull();
      }
      expect(document.IsInDtor()).toBe(true);
      disposePage();
    },
  );
  vi.spyOn(fly.format, "DisposeModify").mockImplementation(
    /** Observes source special-format destruction after default removal and before ordinary deletion. @returns Nothing. */ () => {
      events.push("special");
      expect(ordinary.IsAlive(defaultFormat)).toBe(false);
      expect(defaultFormat.m_ffList).toBeNull();
      expect(ordinary.IsAlive(normal.format)).toBe(true);
      disposeFly();
    },
  );
  vi.spyOn(normal.format, "DisposeModify").mockImplementation(
    /** Observes later ordinary-table destruction with the special table already emptied. @returns Nothing. */ () => {
      events.push("ordinary");
      expect(special.empty()).toBe(true);
      disposeNormal();
    },
  );
  const defaultDeath = vi.spyOn(defaultFormat, "DisposeModify");
  document.Dispose();
  expect(events).toEqual(["undo", "page", "special", "ordinary"]);
  // The source table fragment must not delete the separately owned default.
  // Complete default/layout document teardown is a distinct unported responsibility.
  expect(defaultDeath).not.toHaveBeenCalled();
});
