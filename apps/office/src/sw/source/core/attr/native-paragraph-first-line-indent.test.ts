/** @fileoverview Verifies native first-line paragraph item ownership/history and the existing scalar browser persistence boundary. */
import { expect, it } from "vitest";
import { SwClient } from "../../../inc/calbck";
import {
  SvxFirstLineIndentItem,
  SvxIndentValue,
  SvxFontUnitMetrics,
} from "../../../../editeng/inc/lrspitem";
import { MeasureUnit as U } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import type { SwTextNode } from "../txtnode/ndtxt";
import { createWriterDocument } from "../doc/doc";
import { RES_MARGIN_FIRSTLINE } from "../../../inc/hintids";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "../../../browser/filter/xml/item-codec";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";

it("sets an imported first-line indent through the native paragraph item", /** Checks the RTF-facing setter retains the signed item value. @returns Nothing. */ () => {
  const document = createWriterDocument();
  try {
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Missing paragraph.");
    paragraph.SetParagraphFirstLineIndent(-120);
    expect(paragraph.GetParagraphFirstLineIndent()).toBe(-120);
    expect(
      (
        paragraph.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
      ).ResolveTextFirstLineOffset(),
    ).toBe(-120);
  } finally {
    document.Dispose();
  }
});

it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE])(
  "native first-line unit%s preserves original item/node/cursor/style client through three UndoRedo cycles",
  /** Mutates the original paragraph ItemSet and history. @param unit - Native unit. @returns Nothing. */ (
    unit,
  ) => {
    const session = createWriterDocumentSession(),
      doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell();
    try {
      const node = shell.GetActiveParagraph(),
        cursor = shell.GetCursor(),
        style = node.GetFormatColl(),
        client = new SwClient(),
        nodes = [...doc.nodes.entries()];
      client.RegisterToModify(style);
      const before = new SvxFirstLineIndentItem(
        new SvxIndentValue(1.25, unit),
        RES_MARGIN_FIRSTLINE,
      );
      before.SetTextFirstLineOffset(before.GetTextFirstLineOffset(), 65535);
      before.SetAutoFirst(true);
      node.SetAttr(before);
      doc.GetUndoManager().Clear();
      const after = new SvxFirstLineIndentItem(new SvxIndentValue(2.5, unit), RES_MARGIN_FIRSTLINE);
      after.PutValue(32768, 9);
      after.SetAutoFirst(true);
      expect(shell.SetParagraphItem(after)).toBe(true);
      expect(shell.SetParagraphItem(after)).toBe(false);
      expect(node.GetAttr(RES_MARGIN_FIRSTLINE)).not.toBe(after);
      expect(
        (node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem).GetTextFirstLineOffset(),
      ).not.toBe(after.GetTextFirstLineOffset());
      after.SetAutoFirst(false);
      after.ScaleMetrics(4);
      expect(after.GetTextFirstLineOffset().m_dValue).toBe(10);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        const old = node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
        expect(old.equals(before)).toBe(true);
        expect(old.GetPropTextFirstLineOffset()).toBe(65535);
        expect(old.GetTextFirstLineOffset()).not.toBe(before.GetTextFirstLineOffset());
        expect(shell.Redo()).toBe(true);
        const current = node.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem;
        expect(current.GetTextFirstLineOffset()).toEqual(new SvxIndentValue(2.5, unit));
        expect(current.GetPropTextFirstLineOffset()).toBe(32768);
        expect(current.IsAutoFirst()).toBe(true);
        expect(current.ResolveTextFirstLineOffset(new SvxFontUnitMetrics(120, 180))).toBe(
          unit === U.TWIP ? 3 : unit === U.FONT_EM ? 300 : 450,
        );
        expect(shell.GetCursor()).toBe(cursor);
        expect(shell.GetActiveParagraph()).toBe(node);
        expect(node.GetFormatColl()).toBe(style);
        expect(client.GetRegisteredIn()).toBe(style);
        expect(doc.nodes.entries()).toEqual(nodes);
      }
      expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    } finally {
      session.Close();
    }
  },
);

it.each([
  [0, false],
  [-72, false],
  [720, false],
  [0, true],
  [-72, true],
  [720, true],
] as const)(
  "legacy first-line TWIP%s/auto%s retains scalar item/graph/JSON/Worker records",
  /** Preserves existing wire records. @param value - Legacy right margin. @param auto - Mode. @returns Nothing. */ (
    value,
    auto,
  ) => {
    const doc = createWriterDocument(),
      node = doc.paragraphs[0] as SwTextNode;
    const item = new SvxFirstLineIndentItem(SvxIndentValue.twips(value), RES_MARGIN_FIRSTLINE);
    item.SetAutoFirst(auto);
    node.SetAttr(item);
    expect(encodeSfxPoolItem(item)).toEqual({
      which: RES_MARGIN_FIRSTLINE,
      value: auto ? [value, 1] : value,
    });
    const graph = encodeWriterDocument(doc);
    const json = decodeWriterDocument(JSON.parse(JSON.stringify(graph)));
    const worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc)));
    for (const restored of [json, worker]) {
      const margin = (restored.paragraphs[0] as SwTextNode).GetAttr(
        RES_MARGIN_FIRSTLINE,
      ) as SvxFirstLineIndentItem;
      expect(margin.GetTextFirstLineOffset()).toEqual(SvxIndentValue.twips(value));
      expect(margin.GetPropTextFirstLineOffset()).toBe(100);
      expect(margin.IsAutoFirst()).toBe(auto);
      expect(encodeWriterDocument(restored)).toEqual(graph);
    }
  },
);

it.each([false, true, "72", [72], "", -72])(
  "legacy first-line scalar%s retains existing numeric coercion",
  /** Uses the actual document pool boundary. @param value - Existing wire input. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument();
    const item = decodeSfxPoolItem(doc.GetAttrPool(), {
      which: RES_MARGIN_FIRSTLINE,
      value,
    }) as SvxFirstLineIndentItem;
    expect(item.GetTextFirstLineOffset()).toEqual(SvxIndentValue.twips(Number(value)));
    expect(item.GetPropTextFirstLineOffset()).toBe(100);
  },
);

it.each([0.5, Infinity, "invalid", [], {}])(
  "invalid legacy first-line scalar%s rejects at pool boundary",
  /** Retains original scalar rejection. @param value - Malformed scalar. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument();
    expect(
      /** Decodes malformed legacy state. @returns Candidate item. */ () =>
        decodeSfxPoolItem(doc.GetAttrPool(), { which: RES_MARGIN_FIRSTLINE, value }),
    ).toThrow("SvxFirstLineIndentItem value is invalid.");
  },
);

it.each([
  [1.25, U.FONT_EM, 100],
  [2, U.TWIP, 51],
  [0.5, U.TWIP, 100],
  [Infinity, U.TWIP, 100],
] as const)(
  "unrepresented native first-line state%s/%s/%s rejects without flattening",
  /** Makes the current wire limitation explicit. @param value - Native double. @param unit - Native unit. @param prop - Native metadata. @returns Nothing. */ (
    value,
    unit,
    prop,
  ) => {
    const item = new SvxFirstLineIndentItem(new SvxIndentValue(value, unit), RES_MARGIN_FIRSTLINE);
    item.PutValue(prop, 9);
    const before = item.Clone();
    expect(
      /** Encodes an unrepresented native state. @returns Candidate record. */ () =>
        encodeSfxPoolItem(item),
    ).toThrow("SvxFirstLineIndentItem is not persistence-safe.");
    expect(item.equals(before)).toBe(true);
  },
);
