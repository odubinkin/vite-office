/** @fileoverview Verifies original direct five-field native table UL through graph/JSON/Worker with legacy ingress, absence and atomic invalid admission. */
import { expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_UL_SPACE, RES_FRM_SIZE } from "../../../inc/hintids";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import { createOdtWriterTransfer, restoreOdtWriterTransfer } from "./odt-transfer";
import {
  encodeTableFormat,
  restoreTableSpacing,
  type WriterTableSpacingRecord,
} from "./writer-table-item-codec";
/** Requires an original graph owner. @param value - Candidate. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original spacing owner");
  return value;
}
it.each([
  [100, 100, false],
  [100, 100, true],
  [50, 125, true],
  [0, 65535, false],
] as const)(
  "complete native table UL upper%s lower%s context%s survives graph and Worker",
  /** Preserves all original fields without outgoing scalar duplication. @param upper - Upper scale. @param lower - Lower scale. @param context - Context flag. @returns Nothing. */ (
    upper,
    lower,
    context,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("FullSpacing", { width: 3000 }),
      frame = table.GetFrameFormat();
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 1);
    required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]).SetText("Native complete spacing");
    const item = new SvxULSpaceItem(240, 120, RES_UL_SPACE);
    item.SetPropUpper(upper);
    item.SetPropLower(lower);
    item.SetContextValue(context);
    frame.SetFormatAttr(item);
    try {
      const record = encodeWriterDocument(doc),
        original = required(record.tables?.[0]);
      expect(original.format).not.toHaveProperty("marginTop");
      expect(original.format).not.toHaveProperty("marginBottom");
      expect(original.format.nativeSpacing?.upperLower?.value).toEqual(
        upper !== 100 || lower !== 100
          ? [240, 120, context ? 1 : 0, upper, lower]
          : context
            ? [240, 120, 1]
            : [240, 120],
      );
      const conflicting = {
        ...record,
        tables: [
          { ...original, format: { ...original.format, marginTop: 999, marginBottom: 888 } },
        ],
      };
      const clones = [
        decodeWriterDocument(structuredClone(record)),
        decodeWriterDocument(JSON.parse(JSON.stringify(record))),
        restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))),
        decodeWriterDocument(conflicting),
      ];
      for (const restored of clones)
        try {
          const native = required(restored.GetTables()[0]),
            owner = native.GetFrameFormat();
          expect(owner.GetULSpace()).toEqual(item);
          expect(owner.GetULSpace()).not.toBe(item);
          expect([
            owner.GetULSpace().GetPropUpper(),
            owner.GetULSpace().GetPropLower(),
            owner.GetULSpace().GetContext(),
          ]).toEqual([upper, lower, context]);
          expect(native.GetFormat()).not.toHaveProperty("nativeSpacing");
          expect(
            required(
              required(required(native.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
            ).GetText(),
          ).toBe("Native complete spacing");
          expect(encodeWriterDocument(restored)).toEqual(record);
        } finally {
          restored.Dispose();
        }
      expect(frame.GetULSpace()).toEqual(item);
    } finally {
      doc.Dispose();
    }
  },
);
it("direct native spacing absence overrides conflicting scalar fields across JSON and Worker", /** Keeps absence authored independently of old scalar ingress. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("AbsentSpacing", { width: 3000, marginTop: 120 });
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  table.GetFrameFormat().ResetFormatAttr(RES_UL_SPACE);
  try {
    const record = encodeWriterDocument(doc),
      original = required(record.tables?.[0]);
    expect(original.format.nativeSpacing).toEqual({ upperLower: undefined });
    const conflicting = {
      ...record,
      tables: [{ ...original, format: { ...original.format, marginTop: 900, marginBottom: 800 } }],
    };
    const clones = [
      decodeWriterDocument(structuredClone(record)),
      decodeWriterDocument(JSON.parse(JSON.stringify(record))),
      restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))),
      decodeWriterDocument(conflicting),
    ];
    for (const restored of clones)
      try {
        const frame = required(restored.GetTables()[0]).GetFrameFormat();
        expect(frame.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false)).toBeUndefined();
        expect(frame.GetULSpace()).toEqual(new SvxULSpaceItem(RES_UL_SPACE));
      } finally {
        restored.Dispose();
      }
  } finally {
    doc.Dispose();
  }
});
it.each([false, true])(
  "old scalar spacing retains admission when earlier geometry marker=%s",
  /** Retains scalar ingress independently of geometry protocol age. @param geometry - Whether earlier native geometry exists. @returns Nothing. */ (
    geometry,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("LegacySpacing", { width: 3000 });
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1);
    try {
      const record = encodeWriterDocument(doc),
        original = required(record.tables?.[0]),
        format = {
          width: 3000,
          marginTop: 120,
          marginBottom: 60,
          ...(geometry ? { nativeGeometry: original.format.nativeGeometry } : {}),
        };
      const restored = decodeWriterDocument({ ...record, tables: [{ ...original, format }] });
      try {
        const native = required(restored.GetTables()[0]);
        expect(native.GetFrameFormat().GetULSpace()).toEqual(
          new SvxULSpaceItem(120, 60, RES_UL_SPACE),
        );
        const current = encodeTableFormat(native);
        expect(current.nativeSpacing?.upperLower?.value).toEqual([120, 60]);
        expect(current).not.toHaveProperty("marginTop");
        expect(current).not.toHaveProperty("marginBottom");
      } finally {
        restored.Dispose();
      }
    } finally {
      doc.Dispose();
    }
  },
);
it("undefined legacy marker leaves original five-field native item untouched", /** Verifies no native write on marker-absent ingress. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    frame = doc.nodes.MakeTableNode("LegacyUntouched").GetFrameFormat();
  const item = new SvxULSpaceItem(120, 60, RES_UL_SPACE);
  item.SetPropLower(65535);
  item.SetContextValue(true);
  frame.SetFormatAttr(item);
  try {
    const original = frame.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false);
    restoreTableSpacing(frame, undefined);
    expect(frame.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false)).toBe(original);
  } finally {
    doc.Dispose();
  }
});
it.each([
  { value: null },
  { value: [] },
  { value: false },
  { value: 0 },
  { value: "spacing" },
  { value: { upperLower: null } },
  { value: { upperLower: [] } },
  { value: { upperLower: false } },
  { value: { upperLower: { which: RES_FRM_SIZE, value: [120, 60] } } },
  { value: { upperLower: { which: RES_UL_SPACE, value: [-1, 60] } } },
  { value: { upperLower: { which: RES_UL_SPACE, value: [120, 60, 1, 65536, 50] } } },
])(
  "invalid native spacing $value rejects before mutating original item",
  /** Rejects malformed container/identity/pool payload atomically. @param row - Invalid test record. @returns Nothing. */ ({
    value,
  }) => {
    const doc = new SwDoc(),
      frame = doc.nodes.MakeTableNode("InvalidSpacing").GetFrameFormat(),
      item = new SvxULSpaceItem(120, 60, RES_UL_SPACE);
    item.SetPropUpper(50);
    frame.SetFormatAttr(item);
    try {
      const original = frame.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false);
      expect(
        /** Restores malformed input. @returns Nothing. */ () =>
          restoreTableSpacing(frame, value as unknown as WriterTableSpacingRecord),
      ).toThrow("invalid");
      expect(frame.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false)).toBe(original);
      expect(frame.GetULSpace()).toEqual(item);
    } finally {
      doc.Dispose();
    }
  },
);
