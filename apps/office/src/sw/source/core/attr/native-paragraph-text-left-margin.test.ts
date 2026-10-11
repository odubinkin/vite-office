/** @fileoverview Verifies native text-left paragraph item ownership/history and the existing scalar browser persistence boundary. */
import { expect, it } from "vitest";
import { SwClient } from "../../../inc/calbck";
import {
  SvxTextLeftMarginItem,
  SvxIndentValue,
  SvxFontUnitMetrics,
} from "../../../../editeng/inc/lrspitem";
import { MeasureUnit as U } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import type { SwTextNode } from "../txtnode/ndtxt";
import { createWriterDocument } from "../doc/doc";
import { RES_MARGIN_TEXTLEFT } from "../../../inc/hintids";
import { encodeSfxPoolItem, decodeSfxPoolItem } from "../../../browser/filter/xml/item-codec";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import {
  createOdtWriterTransfer,
  restoreOdtWriterTransfer,
} from "../../../browser/filter/xml/odt-transfer";

it.each([U.TWIP, U.FONT_EM, U.FONT_CJK_ADVANCE])(
  "native text-left unit%s preserves original item/node/cursor/style client through three UndoRedo cycles",
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
      const before = new SvxTextLeftMarginItem(new SvxIndentValue(1.25, unit), RES_MARGIN_TEXTLEFT);
      before.SetTextLeft(before.GetTextLeft(), 65535);
      node.SetAttr(before);
      doc.GetUndoManager().Clear();
      const after = new SvxTextLeftMarginItem(new SvxIndentValue(2.5, unit), RES_MARGIN_TEXTLEFT);
      after.PutValue(32768, 6);
      expect(shell.SetParagraphItem(after)).toBe(true);
      expect(shell.SetParagraphItem(after)).toBe(false);
      expect(node.GetAttr(RES_MARGIN_TEXTLEFT)).not.toBe(after);
      expect((node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).GetTextLeft()).not.toBe(
        after.GetTextLeft(),
      );
      after.ScaleMetrics(4);
      expect(after.GetTextLeft().m_dValue).toBe(10);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        const old = node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem;
        expect(old.equals(before)).toBe(true);
        expect(old.GetPropLeft()).toBe(65535);
        expect(old.GetTextLeft()).not.toBe(before.GetTextLeft());
        expect(shell.Redo()).toBe(true);
        const current = node.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem;
        expect(current.GetTextLeft()).toEqual(new SvxIndentValue(2.5, unit));
        expect(current.GetPropLeft()).toBe(32768);
        expect(current.ResolveTextLeft(new SvxFontUnitMetrics(120, 180))).toBe(
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

it.each([0, -72, 720])(
  "legacy text-left TWIP%s retains scalar item/graph/JSON/Worker records",
  /** Preserves existing wire records. @param value - Legacy text-left margin. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument(),
      node = doc.paragraphs[0] as SwTextNode;
    const item = new SvxTextLeftMarginItem(SvxIndentValue.twips(value), RES_MARGIN_TEXTLEFT);
    node.SetAttr(item);
    expect(encodeSfxPoolItem(item)).toEqual({ which: RES_MARGIN_TEXTLEFT, value });
    const graph = encodeWriterDocument(doc);
    const json = decodeWriterDocument(JSON.parse(JSON.stringify(graph)));
    const worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc)));
    for (const restored of [json, worker]) {
      const margin = (restored.paragraphs[0] as SwTextNode).GetAttr(
        RES_MARGIN_TEXTLEFT,
      ) as SvxTextLeftMarginItem;
      expect(margin.GetTextLeft()).toEqual(SvxIndentValue.twips(value));
      expect(margin.GetPropLeft()).toBe(100);
      expect(encodeWriterDocument(restored)).toEqual(graph);
    }
  },
);

it.each([false, true, "72", [72], [], "", -72])(
  "legacy text-left scalar%s retains existing numeric coercion",
  /** Uses the actual document pool boundary. @param value - Existing wire input. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument();
    const item = decodeSfxPoolItem(doc.GetAttrPool(), {
      which: RES_MARGIN_TEXTLEFT,
      value,
    }) as SvxTextLeftMarginItem;
    expect(item.GetTextLeft()).toEqual(SvxIndentValue.twips(Number(value)));
    expect(item.GetPropLeft()).toBe(100);
  },
);

it.each([0.5, Infinity, "invalid", [1, 2], {}])(
  "invalid legacy text-left scalar%s rejects at pool boundary",
  /** Retains original scalar rejection. @param value - Malformed scalar. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument();
    expect(
      /** Decodes malformed legacy state. @returns Candidate item. */ () =>
        decodeSfxPoolItem(doc.GetAttrPool(), { which: RES_MARGIN_TEXTLEFT, value }),
    ).toThrow("SvxTextLeftMarginItem value is invalid.");
  },
);

it.each([
  [1.25, U.FONT_EM, 100],
  [2, U.TWIP, 51],
  [0.5, U.TWIP, 100],
  [Infinity, U.TWIP, 100],
] as const)(
  "unrepresented native text-left state%s/%s/%s rejects without flattening",
  /** Makes the current wire limitation explicit. @param value - Native double. @param unit - Native unit. @param prop - Native metadata. @returns Nothing. */ (
    value,
    unit,
    prop,
  ) => {
    const item = new SvxTextLeftMarginItem(new SvxIndentValue(value, unit), RES_MARGIN_TEXTLEFT);
    item.PutValue(prop, 6);
    const before = item.Clone();
    expect(
      /** Encodes an unrepresented native state. @returns Candidate record. */ () =>
        encodeSfxPoolItem(item),
    ).toThrow("SvxTextLeftMarginItem is not persistence-safe.");
    expect(item.equals(before)).toBe(true);
  },
);
