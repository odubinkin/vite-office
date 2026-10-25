/** @fileoverview Native document defaults use actual pool metadata, default format clients, undo and UNO properties; page-mode asymmetries remain source-owned. */
import { expect, it } from "vitest";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwDoc } from "./doc";
import { SwTextGridItem, SwTextGrid } from "../../../inc/tgrditem";
import {
  isDrawingLayerAttribute,
  RES_TEXTGRID,
  RES_PARATR_TABSTOP,
  RES_CHRATR_FONTSIZE,
} from "../../../inc/hintids";
import { SwUndoDefaultAttr } from "../undo/unattr";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { unicode, text } from "../unocore/unocrsrhelper";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import { SvxTabStopItem, SvxTabStop, SvxTabAdjust } from "../../../../editeng/inc/tstpitem";
import { lcl_SetNewDefTabStops } from "./docfmt";
import { SwClient } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";

it("changes native pool/master/left mode, preserves authored first-page modes and only undoes the pool default", /** Exercises actual shell undo with the source's deliberate frame/default asymmetry. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const page = doc.GetPageDesc(),
      grid = new SwTextGridItem();
    grid.SetGridType(SwTextGrid.LinesAndChars);
    grid.SetBaseHeight(600);
    grid.SetRubyHeight(300);
    page.GetMaster().SetFormatAttr(grid);
    page.GetFirstMaster().SetFormatAttr(grid);
    page.GetFirstLeft().SetFormatAttr(grid);
    const other = doc.MakePageDesc("Another", page);
    doc.GetUndoManager().Clear();
    expect(doc.IsSquaredPageMode()).toBe(true);
    doc.SetDefaultPageMode(false);
    expect(doc.IsSquaredPageMode()).toBe(false);
    expect(session.docShell.IsModified()).toBe(true);
    expect(doc.GetDefault(RES_TEXTGRID)).toBe(doc.GetAttrPool().GetUserDefaultItem(RES_TEXTGRID));
    expect(doc.GetUndoManager().GetUndoAction()).toBeInstanceOf(SwUndoDefaultAttr);
    expect(doc.GetUndoManager().GetUndoAction()?.GetComment()).toBe("Modify default values");
    for (const descriptor of [page, other]) {
      expect(descriptor.GetMaster().GetTextGrid().IsSquaredMode()).toBe(false);
      expect(descriptor.GetLeft().GetTextGrid().equals(descriptor.GetMaster().GetTextGrid())).toBe(
        true,
      );
      expect(descriptor.GetMaster().GetTextGrid().GetBaseHeight()).toBe(900);
      expect(descriptor.GetFirstMaster().GetTextGrid().IsSquaredMode()).toBe(true);
      expect(descriptor.GetFirstLeft().GetTextGrid().IsSquaredMode()).toBe(true);
    }
    const revision = doc.GetDocumentStateManager().GetModelRevision();
    doc.SetDefaultPageMode(false);
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    expect(shell.Undo()).toBe(true);
    expect(doc.IsSquaredPageMode()).toBe(true);
    expect(page.GetMaster().GetTextGrid().IsSquaredMode()).toBe(false);
    expect(shell.Redo()).toBe(true);
    expect(doc.IsSquaredPageMode()).toBe(false);
    expect(doc.GetDfltTextFormatColl().GetRegisteredIn()).toBeUndefined();
    expect(doc.GetDfltGrfFormatColl().GetRegisteredIn()).toBeUndefined();
    expect(doc.GetDfltFrameFormat().GetRegisteredIn()).toBeUndefined();
  } finally {
    session.Close();
  }
});

it("uses actual default-format old/new hints and source style/character default routing without redundant state", /** Empty sets do nothing; genuine height defaults retain typed items and undo through the native helper. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    hints: SwModelHint[] = [];
  const client = new SwClient(
    /** Observes the actual root. @param source - Root owner. @param hint - Original hint. @returns Nothing. */ (
      _source,
      hint,
    ) => hints.push(hint),
  );
  client.RegisterToModify(doc.GetDfltCharFormat());
  try {
    const before = doc.GetDefault(RES_CHRATR_FONTSIZE).Clone() as SvxFontHeightItem,
      value = new SvxFontHeightItem(360, 100, RES_CHRATR_FONTSIZE),
      revision = doc.GetDocumentStateManager().GetModelRevision();
    doc.SetDefault(new SfxItemSet(doc.GetAttrPool(), [[RES_CHRATR_FONTSIZE, RES_CHRATR_FONTSIZE]]));
    expect(doc.GetDocumentStateManager().GetModelRevision()).toBe(revision);
    doc.SetDefault(value);
    expect((doc.GetDefault(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(360);
    expect(
      hints.some(
        /** Finds the original typed hint. @param hint - Hint. @returns Match. */ (hint) =>
          hint.kind === "attr-set-change",
      ),
    ).toBe(true);
    expect(shell.Undo()).toBe(true);
    expect(doc.GetDefault(RES_CHRATR_FONTSIZE).equals(before)).toBe(true);
    expect(shell.Redo()).toBe(true);
    expect(doc.GetDefault(RES_CHRATR_FONTSIZE).equals(value)).toBe(true);
    expect(doc.GetDfltCharFormat().GetRegisteredIn()).toBeUndefined();
  } finally {
    client.Dispose();
    session.Close();
  }
});

it("preserves UNO page-mode false fallback on failed bool extraction and exposes only the document property map", /** Original native extraction failure is deliberately not converted into an exception. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    model = new SwXTextDocument(doc),
    key = unicode("DefaultPageMode"),
    unknown = unicode("Absent"),
    mode = new Any(true),
    wrong = new Any([1], "sal_Int32");
  try {
    expect(
      model
        .getPropertySetInfo()
        .getProperties()
        .map(
          /** Reads actual metadata. @param item - Entry. @returns Name. */ (item) =>
            text(item.Name),
        ),
    ).toEqual(["DefaultPageMode"]);
    const current = model.getPropertyValue(key);
    expect(current.hasValue()).toBe(true);
    current.dispose();
    model.setPropertyValue(key, wrong);
    expect(doc.IsSquaredPageMode()).toBe(false);
    model.setPropertyValue(key, mode);
    expect(doc.IsSquaredPageMode()).toBe(true);
    expect(
      /** Rejects absent dispatch. @returns Never. */ () => model.getPropertyValue(unknown),
    ).toThrow();
    expect(
      /** Rejects absent dispatch. @returns Never. */ () => model.setPropertyValue(unknown, mode),
    ).toThrow();
    model.dispose();
    expect(
      /** Ends property lifetime with its actual model. @returns Never. */ () =>
        model.getPropertySetInfo(),
    ).toThrow();
  } finally {
    key.dispose();
    unknown.dispose();
    mode.dispose();
    wrong.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("retains native tab-stop removal boundaries and visits authored inherited items in node/style order", /** No surrogate registry or secondary graph is introduced. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    style = doc.MakeTextFormatColl("Tabs"),
    node = doc.paragraphs[0];
  if (!node) throw Error("Missing actual tab node");
  const tabs = new SvxTabStopItem(RES_PARATR_TABSTOP);
  tabs.Insert(new SvxTabStop(100, SvxTabAdjust.Left));
  tabs.Insert(new SvxTabStop(200, SvxTabAdjust.Default));
  tabs.Insert(new SvxTabStop(300, SvxTabAdjust.Default));
  style.SetFormatAttr(tabs);
  node.ChgFormatColl(style);
  node.SetAttr(new SvxFontHeightItem(240, 100, RES_CHRATR_FONTSIZE));
  const visited: SvxTabStopItem[] = [];
  doc.ForEachParaAtrTabStopItem(
    /** Borrows the actual item. @param item - Authored item. @returns Continue. */ (item) => {
      visited.push(item);
      return true;
    },
  );
  expect(visited).toHaveLength(2);
  expect(visited[0]).toBe(visited[1]);
  const authored = visited[0];
  if (!authored) throw Error("Missing actual inherited tabs");
  expect(lcl_SetNewDefTabStops(100, 200, authored)).toBe(true);
  expect(authored.Count()).toBe(2);
  expect(authored.At(1).GetTabPos()).toBe(200);
  expect(lcl_SetNewDefTabStops(100, 200, authored)).toBe(true);
  expect(authored.Count()).toBe(2);
  expect(lcl_SetNewDefTabStops(200, 200, authored)).toBe(false);
  expect(
    lcl_SetNewDefTabStops(
      100,
      200,
      new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP),
    ),
  ).toBe(false);
  let count = 0;
  doc.ForEachParaAtrTabStopItem(
    /** Stops at first visited item. @returns Stop. */ () => {
      ++count;
      return false;
    },
  );
  expect(count).toBe(1);
  doc.Dispose();
});

it("swaps actual default tabs independently through repeated undo/redo and clears newly introduced style items with INVALID history", /** Exercises both native history paths over genuine pool and collection owners. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  try {
    const original = doc.GetDefault(RES_PARATR_TABSTOP).Clone() as SvxTabStopItem;
    const tabs = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, RES_PARATR_TABSTOP);
    tabs.Insert(new SvxTabStop(720, SvxTabAdjust.Default));
    doc.SetDefault(tabs);
    for (let cycle = 0; cycle < 3; ++cycle) {
      expect(shell.Undo()).toBe(true);
      expect(doc.GetDefault(RES_PARATR_TABSTOP).equals(original)).toBe(true);
      expect(shell.Redo()).toBe(true);
      expect(doc.GetDefault(RES_PARATR_TABSTOP).equals(tabs)).toBe(true);
    }
    const style = doc.MakeTextFormatColl("Native style delta"),
      incoming = new SfxItemSet(doc.GetAttrPool(), style.GetAttrSet().GetRanges());
    incoming.Put(new SvxFontHeightItem(360, 100, RES_CHRATR_FONTSIZE));
    doc.ChgFormat(style, incoming);
    expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_FONTSIZE, false)).toBeDefined();
    expect(shell.Undo()).toBe(true);
    expect(style.GetAttrSet().GetItemIfSet(RES_CHRATR_FONTSIZE, false)).toBeUndefined();
    expect(shell.Redo()).toBe(true);
    expect((style.GetAttrSet().Get(RES_CHRATR_FONTSIZE) as SvxFontHeightItem).GetHeight()).toBe(
      360,
    );
  } finally {
    session.Close();
  }
});

it("retains the original strict drawing upper bound even though XATTR_END names the inclusive last attribute", /** Pins native admission without correcting its boundary. @returns Nothing. */ () => {
  expect([999, 1000, 1046, 1047, 1048].map(isDrawingLayerAttribute)).toEqual([
    false,
    true,
    true,
    false,
    false,
  ]);
});
