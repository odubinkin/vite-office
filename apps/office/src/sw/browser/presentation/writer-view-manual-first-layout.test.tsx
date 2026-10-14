/** @fileoverview Checks native signed-short layout separately from full authored first-line items. */
import { cleanup, render, screen } from "@testing-library/react";
import { SvxIndentValue } from "../../../editeng/inc/lrspitem";
import { afterEach, describe, expect, it } from "vitest";
import { SvxFirstLineIndentItem } from "../../../editeng/source/items/frmitems";
import { SvxFontHeightItem } from "../../../editeng/source/items/textitem";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { RES_CHRATR_FONTSIZE, RES_MARGIN_FIRSTLINE } from "../../inc/hintids";
import { createWriterDocument } from "../../source/core/doc/doc";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterEditableParagraph } from "../editor/WriterEditableParagraph";
import { WriterViewStore } from "./writer-view-projection";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const stores: WriterViewStore[] = [];
afterEach(
  /** Releases mounted descendants before canonical owners. @returns Nothing. */ () => {
    cleanup();
    for (const store of stores.splice(0)) store.Close();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Creates direct or inherited authored manual state. @param raw - Complete authored offset. @param inherited - Whether the style owns the item. @returns Actual Writer owners. */
function fixture(raw: number, inherited: boolean) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const shell = session.view.GetWrtShell();
  shell.Insert("ManualBoundaryProof");
  const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(raw), RES_MARGIN_FIRSTLINE);
  if (inherited) session.docShell.GetDoc().GetDfltTextFormatColl().SetFormatAttr(item);
  else shell.SetParagraphItems([item]);
  const store = new WriterViewStore(session.view);
  stores.push(store);
  return { session, shell, store };
}

describe("Writer manual signed-short layout", /** Groups literal native boundaries and actual document transport. @returns Nothing. */ () => {
  for (const inherited of [false, true])
    for (const [raw, resolved] of [
      [0, 0],
      [32767, 32767],
      [32768, -32768],
      [32769, -32767],
      [65535, -1],
      [65536, 0],
      [65537, 1],
      [131073, 1],
      [-32768, -32768],
      [-32769, 32767],
      [-65535, 1],
      [-65536, 0],
      [-65537, -1],
      [-131073, -1],
      [2147483647, -1],
      [-2147483648, 0],
    ] as const)
      it(`resolves raw=${raw} inherited=${inherited}`, /** Checks independent signed-short literals without mutating storage, history or ownership. @returns Nothing. */ function resolvesNativeShort() {
        const owner = fixture(raw, inherited);
        const node = owner.shell.GetActiveParagraph();
        const direct = node.GetpSwAttrSet()?.GetItemIfSet(RES_MARGIN_FIRSTLINE, false);
        const before = encodeWriterDocument(owner.session.docShell.GetDoc());
        const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
        const generation = owner.session.docShell.GetContentGeneration();
        const projected = owner.store.GetSnapshot().activeParagraph;
        expect(node.GetParagraphFirstLineIndent()).toBe(resolved);
        expect(firstValues(node.GetAttr(RES_MARGIN_FIRSTLINE))).toBe(raw);
        expect(projected.computedStyle.firstLineIndentPt).toBe(raw / 20);
        expect(projected.computedStyle.resolvedFirstLineIndentPt).toBe(resolved / 20);
        expect(projected.computedStyle.autoFirstLineIndent).toBe(false);
        expect(Object.isFrozen(projected.computedStyle)).toBe(true);
        expect(firstValues(direct)).toBe(inherited || raw === 0 ? undefined : raw);
        expect(
          firstValues(
            node.CloneTo(createWriterDocument().GetNodes()).GetAttr(RES_MARGIN_FIRSTLINE),
          ),
        ).toBe(inherited ? 0 : raw);
        const decoded = decodeWriterDocument(before);
        expect(decoded.paragraphs[0]?.GetParagraphFirstLineIndent()).toBe(resolved);
        expect(firstValues(decoded.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE))).toBe(raw);
        expect(encodeWriterDocument(decoded)).toEqual(before);
        expect(encodeWriterDocument(owner.session.docShell.GetDoc())).toEqual(before);
        expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history);
        expect(owner.session.docShell.GetContentGeneration()).toBe(generation);
      });

  for (const raw of [65537, -65537])
    it(`retains raw ${raw} through real ODT and mode history`, /** Checks full persisted offset while manual and automatic layout remain distinct. @returns Completion. */ async function preservesTransportAndHistory() {
      const owner = fixture(raw, false);
      const before = encodeWriterDocument(owner.session.docShell.GetDoc());
      const retained = owner.store.GetSnapshot().activeParagraph;
      const history = owner.session.docShell.GetUndoManager().GetUndoActionCount();
      const metadata = createDocument({
        id: "manual-boundary",
        suiteId: "writer",
        title: "Manual boundary",
      });
      const imported = await readOdtDocument(
        writeOdtDocument(owner.session.docShell.GetDoc(), metadata),
        metadata,
      );
      expect(firstValues(imported.document.paragraphs[0]?.GetAttr(RES_MARGIN_FIRSTLINE))).toBe(raw);
      expect(imported.document.paragraphs[0]?.GetParagraphFirstLineIndent()).toBe(raw > 0 ? 1 : -1);
      expect(
        owner.shell.SetParagraphItems([
          (
            /** Authors the existing automatic first-line fixture through native setters. @returns Native item. */ () => {
              const item = new SvxFirstLineIndentItem(
                SvxIndentValue.twips(raw),
                RES_MARGIN_FIRSTLINE,
              );
              item.SetAutoFirst(true);
              return item;
            }
          )(),
        ]),
      ).toBe(true);
      expect(
        owner.store.GetSnapshot().activeParagraph.computedStyle.resolvedFirstLineIndentPt,
      ).toBe(24);
      expect(owner.store.GetSnapshot().activeParagraph.computedStyle.firstLineIndentPt).toBe(
        raw / 20,
      );
      expect(
        owner.shell.SetParagraphItems([
          (
            /** Authors the existing automatic first-line fixture through native setters. @returns Native item. */ () => {
              const item = new SvxFirstLineIndentItem(
                SvxIndentValue.twips(raw),
                RES_MARGIN_FIRSTLINE,
              );
              item.SetAutoFirst(true);
              return item;
            }
          )(),
        ]),
      ).toBe(false);
      expect(owner.session.docShell.GetUndoManager().GetUndoActionCount()).toBe(history + 1);
      expect(owner.shell.Undo()).toBe(true);
      expect(encodeWriterDocument(owner.session.docShell.GetDoc())).toEqual(before);
      expect(owner.shell.Redo()).toBe(true);
      expect(firstValues(owner.shell.GetActiveParagraph().GetAttr(RES_MARGIN_FIRSTLINE))).toEqual([
        raw,
        1,
      ]);
      expect(retained.computedStyle.resolvedFirstLineIndentPt).toBe(raw > 0 ? 0.05 : -0.05);
      expect(retained.computedStyle.firstLineIndentPt).toBe(raw / 20);
      expect(owner.shell.Undo()).toBe(true);
      render(
        <WriterEditableParagraph
          index={0}
          isActive
          paragraph={owner.store.GetSnapshot().activeParagraph}
          listMarker={undefined}
          retainElement={
            /** Keeps projection rendering read-only. @returns Nothing. */ () => undefined
          }
        />,
      );
      expect(screen.getByRole("textbox")).toHaveStyle({
        textIndent: raw > 0 ? "0.05pt" : "-0.05pt",
      });
      cleanup();
      render(
        <WriterEditableParagraph
          index={0}
          isActive
          isFollow
          paragraph={owner.store.GetSnapshot().activeParagraph}
          listMarker={undefined}
          retainElement={/** Keeps follow rendering read-only. @returns Nothing. */ () => undefined}
        />,
      );
      expect(screen.getByRole("textbox")).toHaveStyle({ textIndent: "0pt" });
    });

  it("keeps automatic layout in the native long domain", /** Checks manual narrowing is not incorrectly applied to font-computed offsets. @returns Nothing. */ function retainsAutomaticLong() {
    const owner = fixture(65537, false);
    owner.shell.SetParagraphItems([
      (
        /** Authors the existing automatic first-line fixture through native setters. @returns Native item. */ () => {
          const item = new SvxFirstLineIndentItem(
            SvxIndentValue.twips(65537),
            RES_MARGIN_FIRSTLINE,
          );
          item.SetAutoFirst(true);
          return item;
        }
      )(),
      new SvxFontHeightItem(40000, 100, RES_CHRATR_FONTSIZE),
    ]);
    expect(owner.shell.GetActiveParagraph().GetParagraphFirstLineIndent()).toBe(80000);
    expect(owner.store.GetSnapshot().activeParagraph.computedStyle.resolvedFirstLineIndentPt).toBe(
      4000,
    );
    expect(firstValues(owner.shell.GetActiveParagraph().GetAttr(RES_MARGIN_FIRSTLINE))).toEqual([
      65537, 1,
    ]);
  });
});

/** Observes original measure and automatic state through their explicit native members. @param item - Native first-line item or direct absence. @returns Historical authored value with auto marker. */
function firstValues(item: { QueryValue(member?: number): unknown } | undefined): unknown {
  if (item === undefined) return undefined;
  const value = item.QueryValue(8);
  return item.QueryValue(10) === true ? [value, 1] : value;
}
