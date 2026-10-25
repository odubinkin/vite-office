/** @fileoverview Native paragraph FillPreview flattens actual owned/factory styles without materializing document state, dirtying the document or changing history. */
import { MapUnit } from "../../../../tools/inc/mapunit";
import { Size } from "../../../../tools/inc/gen";
import { setupStylePreviewFonts } from "../../../../svx/source/tbxctrls/tbcontrl.stylepreview";
import { afterEach, expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { flattenSwFormatForPreview, getParagraphStyleItemSetForPreview } from "./docstyle";
import {
  SvxFontHeightItem,
  SvxWeightItem,
  SvxFontItem,
} from "../../../../editeng/source/items/textitem";
import { RES_CHRATR_FONT, RES_CHRATR_FONTSIZE, RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { Font } from "../../../../vcl/source/font/font";
import {
  setStylePreviewFontName,
  setStylePreviewFontStyle,
} from "../../../../svx/source/tbxctrls/tbcontrl.stylepreview";
import * as slot from "../../../../editeng/inc/editids";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases actual frame/document ownership. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Creates actual source owners, without a style provider facade. @returns Frame and document. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  return { ...session, document: session.docShell.GetDoc() };
}

it("supplies actual flattened Writer items to each native style preview font group", /** Crosses the actual document pool, temporary builtin resolution and SVX slot consumers. @returns Nothing. */ () => {
  const f = fixture(),
    doc = f.document;
  const before = [...doc.GetTextFormatColls()];
  const set = getParagraphStyleItemSetForPreview(doc, "heading-1");
  if (set === undefined) throw new Error("Expected the actual builtin preview item set.");
  for (const [fontSlot, postureSlot, weightSlot] of [
    [slot.SID_ATTR_CHAR_FONT, slot.SID_ATTR_CHAR_POSTURE, slot.SID_ATTR_CHAR_WEIGHT],
    [slot.SID_ATTR_CHAR_CJK_FONT, slot.SID_ATTR_CHAR_CJK_POSTURE, slot.SID_ATTR_CHAR_CJK_WEIGHT],
    [slot.SID_ATTR_CHAR_CTL_FONT, slot.SID_ATTR_CHAR_CTL_POSTURE, slot.SID_ATTR_CHAR_CTL_WEIGHT],
  ] as const) {
    const font = new Font();
    setStylePreviewFontStyle(set, postureSlot, weightSlot, font);
    expect(setStylePreviewFontName(set, fontSlot, font)).toBe(true);
    expect(font.GetFamilyName()).not.toBe("");
    expect(font.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  }
  expect(doc.GetTextFormatColls()).toEqual(before);
  expect(doc.FindTextFormatColl("heading-1")).toBeUndefined();
});

it("copies existing parent sets root-first and keeps child overrides independent", /** Verifies real SwFormat inheritance and actual pooled item copies. @returns Nothing. */ () => {
  const f = fixture(),
    doc = f.document;
  const parent = doc.MakeTextFormatColl("Parent", doc.GetDfltTextFormatColl(), "parent");
  parent.SetFormatAttr(new SvxFontHeightItem(400, 100, RES_CHRATR_FONTSIZE));
  parent.SetFormatAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
  const child = doc.MakeTextFormatColl("Child", parent, "child");
  child.SetFormatAttr(new SvxFontHeightItem(600, 100, RES_CHRATR_FONTSIZE));
  const before = [...doc.GetTextFormatColls()];
  const revision = doc.GetDocumentStateManager().GetModelRevision();
  const preview = getParagraphStyleItemSetForPreview(doc, "child");
  expect(preview?.GetParent()).toBeUndefined();
  expect(preview?.GetPool()).toBe(doc.GetAttrPool());
  expect((preview?.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(600);
  expect((preview?.Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect((preview?.Get(RES_CHRATR_FONT) as SvxFontItem).GetFamilyName()).toBe(
    (doc.GetDfltTextFormatColl().GetAttrSet().Get(RES_CHRATR_FONT) as SvxFontItem).GetFamilyName(),
  );
  preview?.Put(new SvxWeightItem(FontWeight.WEIGHT_NORMAL, RES_CHRATR_WEIGHT));
  expect((child.GetAttrSet().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect((parent.GetAttrSet().Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect(doc.GetTextFormatColls()).toEqual(before);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
});

it("temporarily resolves unused builtin ancestry and follow styles without publishing edits", /** Checks clean document state and stable native table identity after actual pool construction. @returns Nothing. */ () => {
  const f = fixture(),
    doc = f.document;
  expect(doc.FindTextFormatColl("heading-1")).toBeUndefined();
  const before = [...doc.GetTextFormatColls()];
  const revision = doc.GetDocumentStateManager().GetModelRevision();
  const modified = f.docShell.IsModified();
  const undo = doc.GetUndoManager(),
    undoCount = undo.GetUndoActionCount(),
    redoCount = undo.GetRedoActionCount();
  const preview = getParagraphStyleItemSetForPreview(doc, "heading-1");
  expect((preview?.Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(360);
  expect((preview?.Get(RES_CHRATR_WEIGHT) as SvxWeightItem).GetWeight()).toBe(
    FontWeight.WEIGHT_BOLD,
  );
  expect(preview?.GetParent()).toBeUndefined();
  expect(doc.FindTextFormatColl("heading-1")).toBeUndefined();
  expect(doc.GetTextFormatColls()).toEqual(before);
  expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
  expect(f.docShell.IsModified()).toBe(modified);
  expect([undo.GetUndoActionCount(), undo.GetRedoActionCount(), undo.DoesUndo()]).toEqual([
    undoCount,
    redoCount,
    true,
  ]);
  // The flattened data remains usable after every temporary style has been destroyed.
  expect((preview?.Get(RES_CHRATR_FONT) as SvxFontItem).GetFamilyName()).not.toBe("");
});

it("preserves actual pending redo and an already disabled recording flag", /** Uses real Writer history and repeats the pool preview operation. @returns Nothing. */ () => {
  const f = fixture(),
    doc = f.document,
    shell = f.view.GetWrtShell();
  shell.Insert("Real history");
  shell.Undo();
  const undo = doc.GetUndoManager();
  const before = [undo.GetUndoActionCount(), undo.GetRedoActionCount()];
  expect(before[1]).toBeGreaterThan(0);
  undo.DoUndo(false);
  expect(getParagraphStyleItemSetForPreview(doc, "heading-4")).toBeDefined();
  expect(getParagraphStyleItemSetForPreview(doc, "heading-4")).toBeDefined();
  expect(undo.DoesUndo()).toBe(false);
  expect([undo.GetUndoActionCount(), undo.GetRedoActionCount()]).toEqual(before);
  undo.DoUndo(true);
  shell.Redo();
  expect(shell.GetActiveParagraph().GetText()).toBe("Real history");
});

it("returns no preview for an unknown identity and flattens the actual root without a synthetic parent", /** Covers the native unknown-style lookup and real root format. @returns Nothing. */ () => {
  const f = fixture(),
    doc = f.document;
  const before = [...doc.GetTextFormatColls()];
  expect(getParagraphStyleItemSetForPreview(doc, "Absent style")).toBeUndefined();
  const root = flattenSwFormatForPreview(doc.GetDfltTextFormatColl());
  expect(root.GetParent()).toBeUndefined();
  expect(root.GetPool()).toBe(doc.GetAttrPool());
  expect(doc.GetTextFormatColls()).toEqual(before);
});

it("uses the actual Writer shell's twip unit with pool preview sizes without changing document state", /** Crosses the real shell,temporary native style pool and generic SetupEntry font projection. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.docShell.GetMapUnit()).toBe(MapUnit.MapTwip);
  const before = f.docShell.GetDocumentState();
  const set = getParagraphStyleItemSetForPreview(f.document, "heading-1");
  if (set === undefined) throw new Error("Expected native heading style.");
  const result = setupStylePreviewFonts(
    set,
    {},
    f.docShell.GetMapUnit(),
    /** Supplies an explicit device conversion for the real source height. @param size - Native twip size. @param unit - Actual owner map unit. @returns Device pixels. */
    (size, unit) => {
      expect(unit).toBe(MapUnit.MapTwip);
      return new Size(0, size.Height() / 15);
    },
  );
  expect(result.latin?.GetFontHeight()).toBe(24);
  expect(result.latin?.GetWeight()).toBe(FontWeight.WEIGHT_BOLD);
  expect(result.asian?.GetFontHeight()).toBeGreaterThan(0);
  expect(result.complex?.GetFontHeight()).toBeGreaterThan(0);
  expect(f.docShell.GetDocumentState()).toEqual(before);
  expect(f.document.FindTextFormatColl("heading-1")).toBeUndefined();
});
