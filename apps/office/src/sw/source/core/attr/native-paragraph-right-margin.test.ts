/** @fileoverview Verifies native right paragraph item ownership/history and the existing scalar browser persistence boundary. */
import { expect, it } from "vitest";
import { SwClient } from "../../../inc/calbck";
import {
  SvxRightMarginItem,
  SvxIndentValue,
  SvxFontUnitMetrics,
} from "../../../../editeng/inc/lrspitem";
import { MeasureUnit as U } from "../../../../offapi/com/sun/star/util/MeasureUnit";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import type { SwTextNode } from "../txtnode/ndtxt";
import { createWriterDocument } from "../doc/doc";
import { RES_MARGIN_RIGHT } from "../../../inc/hintids";
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
  "native right unit%s preserves original item/node/cursor/style client through three UndoRedo cycles",
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
      const before = new SvxRightMarginItem(new SvxIndentValue(1.25, unit), RES_MARGIN_RIGHT);
      before.SetRight(before.GetRight(), 65535);
      node.SetAttr(before);
      doc.GetUndoManager().Clear();
      const after = new SvxRightMarginItem(new SvxIndentValue(2.5, unit), RES_MARGIN_RIGHT);
      after.PutValue(32768, 7);
      expect(shell.SetParagraphItem(after)).toBe(true);
      expect(shell.SetParagraphItem(after)).toBe(false);
      expect(node.GetAttr(RES_MARGIN_RIGHT)).not.toBe(after);
      expect((node.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).GetRight()).not.toBe(
        after.GetRight(),
      );
      after.ScaleMetrics(4);
      expect(after.GetRight().m_dValue).toBe(10);
      for (let cycle = 0; cycle < 3; cycle++) {
        expect(shell.Undo()).toBe(true);
        const old = node.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem;
        expect(old.equals(before)).toBe(true);
        expect(old.GetPropRight()).toBe(65535);
        expect(old.GetRight()).not.toBe(before.GetRight());
        expect(shell.Redo()).toBe(true);
        const current = node.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem;
        expect(current.GetRight()).toEqual(new SvxIndentValue(2.5, unit));
        expect(current.GetPropRight()).toBe(32768);
        expect(current.ResolveRight(new SvxFontUnitMetrics(120, 180))).toBe(
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
  "legacy right TWIP%s retains scalar item/graph/JSON/Worker records",
  /** Preserves existing wire records. @param value - Legacy right margin. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument(),
      node = doc.paragraphs[0] as SwTextNode;
    const item = new SvxRightMarginItem(SvxIndentValue.twips(value), RES_MARGIN_RIGHT);
    node.SetAttr(item);
    expect(encodeSfxPoolItem(item)).toEqual({ which: RES_MARGIN_RIGHT, value });
    const graph = encodeWriterDocument(doc);
    const json = decodeWriterDocument(JSON.parse(JSON.stringify(graph)));
    const worker = restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc)));
    for (const restored of [json, worker]) {
      const margin = (restored.paragraphs[0] as SwTextNode).GetAttr(
        RES_MARGIN_RIGHT,
      ) as SvxRightMarginItem;
      expect(margin.GetRight()).toEqual(SvxIndentValue.twips(value));
      expect(margin.GetPropRight()).toBe(100);
      expect(encodeWriterDocument(restored)).toEqual(graph);
    }
  },
);

it.each([false, true, "72", [72], [], "", -72])(
  "legacy right scalar%s retains existing numeric coercion",
  /** Uses the actual document pool boundary. @param value - Existing wire input. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument();
    const item = decodeSfxPoolItem(doc.GetAttrPool(), {
      which: RES_MARGIN_RIGHT,
      value,
    }) as SvxRightMarginItem;
    expect(item.GetRight()).toEqual(SvxIndentValue.twips(Number(value)));
    expect(item.GetPropRight()).toBe(100);
  },
);

it.each([0.5, Infinity, "invalid", [1, 2], {}])(
  "invalid legacy right scalar%s rejects at pool boundary",
  /** Retains original scalar rejection. @param value - Malformed scalar. @returns Nothing. */ (
    value,
  ) => {
    const doc = createWriterDocument();
    expect(
      /** Decodes malformed legacy state. @returns Candidate item. */ () =>
        decodeSfxPoolItem(doc.GetAttrPool(), { which: RES_MARGIN_RIGHT, value }),
    ).toThrow("SvxRightMarginItem value is invalid.");
  },
);

it.each([
  [1.25, U.FONT_EM, 100],
  [2, U.TWIP, 51],
  [0.5, U.TWIP, 100],
  [Infinity, U.TWIP, 100],
] as const)(
  "unrepresented native right state%s/%s/%s rejects without flattening",
  /** Makes the current wire limitation explicit. @param value - Native double. @param unit - Native unit. @param prop - Native metadata. @returns Nothing. */ (
    value,
    unit,
    prop,
  ) => {
    const item = new SvxRightMarginItem(new SvxIndentValue(value, unit), RES_MARGIN_RIGHT);
    item.PutValue(prop, 7);
    const before = item.Clone();
    expect(
      /** Encodes an unrepresented native state. @returns Candidate record. */ () =>
        encodeSfxPoolItem(item),
    ).toThrow("SvxRightMarginItem is not persistence-safe.");
    expect(item.equals(before)).toBe(true);
  },
);
