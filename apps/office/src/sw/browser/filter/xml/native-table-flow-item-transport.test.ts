/** @fileoverview Verifies original native table split/border items and direct absence across graph/JSON/Worker, legacy ingress and atomic invalid admission. */
import { expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { RES_LAYOUT_SPLIT, RES_COLLAPSING_BORDERS } from "../../../inc/hintids";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import { createOdtWriterTransfer, restoreOdtWriterTransfer } from "./odt-transfer";
import {
  encodeTableFormat,
  restoreTableFlow,
  type WriterTableFlowRecord,
} from "./writer-table-item-codec";
/** Requires a native graph owner. @param value - Candidate. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native flow owner");
  return value;
}
it.each([
  [undefined, undefined],
  [undefined, false],
  [undefined, true],
  [false, undefined],
  [false, false],
  [false, true],
  [true, undefined],
  [true, false],
  [true, true],
] as const)(
  "native split%s border%s presence survives graph/JSON/Worker and conflicting scalars",
  /** Retains direct native item ownership and source values. @param split - Direct split policy. @param borders - Direct border policy. @returns Nothing. */ (
    split,
    borders,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeFlow", { width: 3000 });
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1),
      frame = table.GetFrameFormat();
    required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText("Original flow cell");
    if (split !== undefined) frame.SetFormatAttr(new SwFormatLayoutSplit(split));
    if (borders !== undefined)
      frame.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, borders));
    try {
      const record = encodeWriterDocument(doc),
        original = required(record.tables?.[0]);
      expect(original.format).not.toHaveProperty("layoutSplit");
      expect(original.format).not.toHaveProperty("borderModel");
      expect(original.format.nativeFlow).toEqual({
        layoutSplit: split === undefined ? undefined : { which: RES_LAYOUT_SPLIT, value: split },
        collapsingBorders:
          borders === undefined ? undefined : { which: RES_COLLAPSING_BORDERS, value: borders },
      });
      const conflict = {
        ...record,
        tables: [
          {
            ...original,
            format: {
              ...original.format,
              layoutSplit: !(split ?? true),
              borderModel: borders === true ? ("separating" as const) : ("collapsing" as const),
            },
          },
        ],
      };
      const clones = [
        decodeWriterDocument(structuredClone(record)),
        decodeWriterDocument(JSON.parse(JSON.stringify(record))),
        restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))),
        decodeWriterDocument(conflict),
      ];
      for (const restored of clones)
        try {
          const native = required(restored.GetTables()[0]),
            set = native.GetFrameFormat().GetAttrSet();
          expect(
            (
              set.GetItemIfSet(RES_LAYOUT_SPLIT, false) as SwFormatLayoutSplit | undefined
            )?.GetValue(),
          ).toBe(split);
          expect(
            (
              set.GetItemIfSet(RES_COLLAPSING_BORDERS, false) as SfxBoolItem | undefined
            )?.GetValue(),
          ).toBe(borders);
          if (split !== undefined)
            expect(set.GetItemIfSet(RES_LAYOUT_SPLIT, false)).toBeInstanceOf(SwFormatLayoutSplit);
          expect(native.GetFormat()).not.toHaveProperty("nativeFlow");
          expect(
            required(
              required(required(native.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
            ).GetText(),
          ).toBe("Original flow cell");
          expect(encodeWriterDocument(restored)).toEqual(record);
        } finally {
          restored.Dispose();
        }
      expect(encodeWriterDocument(doc)).toEqual(record);
    } finally {
      doc.Dispose();
    }
  },
);
it.each([
  [false, false],
  [false, true],
  [true, false],
  [true, true],
] as const)(
  "old geometry%s spacing%s markers retain legacy table flow admission",
  /** Keeps older protocol ages independent. @param geometry - Older geometry presence. @param spacing - Older spacing presence. @returns Nothing. */ (
    geometry,
    spacing,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("LegacyFlow", { width: 3000 });
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1);
    try {
      const record = encodeWriterDocument(doc),
        original = required(record.tables?.[0]),
        format = {
          layoutSplit: false,
          borderModel: "collapsing" as const,
          ...(geometry ? { nativeGeometry: original.format.nativeGeometry } : {}),
          ...(spacing ? { nativeSpacing: original.format.nativeSpacing } : {}),
        };
      const restored = decodeWriterDocument({ ...record, tables: [{ ...original, format }] });
      try {
        const native = required(restored.GetTables()[0]),
          current = encodeTableFormat(native);
        expect(current.nativeFlow).toEqual({
          layoutSplit: { which: RES_LAYOUT_SPLIT, value: false },
          collapsingBorders: { which: RES_COLLAPSING_BORDERS, value: true },
        });
        expect(native.GetFormat().layoutSplit).toBe(false);
        expect(native.GetFormat().borderModel).toBe("collapsing");
        expect(current).not.toHaveProperty("layoutSplit");
        expect(current).not.toHaveProperty("borderModel");
      } finally {
        restored.Dispose();
      }
    } finally {
      doc.Dispose();
    }
  },
);
it("absent legacy flow marker leaves both original items untouched", /** Verifies no write on older marker absence. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    frame = doc.nodes
      .MakeTableNode("UntouchedFlow", { layoutSplit: false, borderModel: "collapsing" })
      .GetFrameFormat(),
    set = frame.GetAttrSet();
  try {
    const split = set.GetItemIfSet(RES_LAYOUT_SPLIT, false),
      border = set.GetItemIfSet(RES_COLLAPSING_BORDERS, false);
    restoreTableFlow(frame, undefined);
    expect(set.GetItemIfSet(RES_LAYOUT_SPLIT, false)).toBe(split);
    expect(set.GetItemIfSet(RES_COLLAPSING_BORDERS, false)).toBe(border);
  } finally {
    doc.Dispose();
  }
});
it.each([
  { value: null },
  { value: [] },
  { value: false },
  { value: 0 },
  { value: "flow" },
  { value: { layoutSplit: null } },
  { value: { layoutSplit: [] } },
  { value: { layoutSplit: false } },
  { value: { layoutSplit: { which: RES_COLLAPSING_BORDERS, value: true } } },
  { value: { layoutSplit: { which: RES_LAYOUT_SPLIT, value: 0 } } },
  { value: { layoutSplit: { which: RES_LAYOUT_SPLIT, value: "false" } } },
  { value: { layoutSplit: { which: RES_LAYOUT_SPLIT, value: null } } },
  { value: { layoutSplit: { which: RES_LAYOUT_SPLIT, value: [] } } },
  { value: { layoutSplit: { which: RES_LAYOUT_SPLIT, value: true }, collapsingBorders: null } },
  {
    value: {
      layoutSplit: { which: RES_LAYOUT_SPLIT, value: true },
      collapsingBorders: { which: RES_LAYOUT_SPLIT, value: false },
    },
  },
  {
    value: {
      layoutSplit: { which: RES_LAYOUT_SPLIT, value: true },
      collapsingBorders: { which: RES_COLLAPSING_BORDERS, value: "false" },
    },
  },
])(
  "bad native flow $value rejects before mutating either original item",
  /** Validates both native items before original frame writes. @param row - Malformed record. @returns Nothing. */ ({
    value,
  }) => {
    const doc = new SwDoc(),
      frame = doc.nodes
        .MakeTableNode("InvalidFlow", { layoutSplit: false, borderModel: "collapsing" })
        .GetFrameFormat(),
      set = frame.GetAttrSet();
    try {
      const split = set.GetItemIfSet(RES_LAYOUT_SPLIT, false),
        border = set.GetItemIfSet(RES_COLLAPSING_BORDERS, false);
      expect(
        /** Restores malformed input. @returns Nothing. */ () =>
          restoreTableFlow(frame, value as unknown as WriterTableFlowRecord),
      ).toThrow("invalid");
      expect(set.GetItemIfSet(RES_LAYOUT_SPLIT, false)).toBe(split);
      expect(set.GetItemIfSet(RES_COLLAPSING_BORDERS, false)).toBe(border);
    } finally {
      doc.Dispose();
    }
  },
);
