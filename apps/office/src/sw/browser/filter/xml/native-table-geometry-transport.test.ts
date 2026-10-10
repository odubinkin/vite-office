/** @fileoverview Checks complete original native table geometry across primitive graph and Worker boundaries. */
import { expect, it } from "vitest";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RES_FRM_SIZE, RES_HORI_ORIENT } from "../../../inc/hintids";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";
import { createOdtWriterTransfer, restoreOdtWriterTransfer } from "./odt-transfer";
import { restoreTableGeometry, type WriterTableGeometryRecord } from "./writer-table-item-codec";
import { writeOdtDocument } from "../../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../../source/filter/xml/swxml";
/** Requires an original native graph owner. @param value - Candidate. @returns Present owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native geometry owner");
  return value;
}

it.each([SwFrameSize.Variable, SwFrameSize.Fixed, SwFrameSize.Minimum])(
  "complete native table size/orientation survive primitive and Worker transfer type=%s",
  /** Checks all size fields, independent orientation and raw headline state. @param type - Height mode. @returns Completion. */ async (
    type,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("NativeGeometry", {
        headerRows: 9,
        width: 6000,
        marginTop: 120,
      });
    table.AddColumnWidth(6000);
    const row = doc.nodes.AppendTableRow(table, 1),
      node = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
    node.SetText("Original geometry transfer");
    const size = new SwFormatFrameSize(type, 6000, 720);
    size.SetWidthSizeType(SwFrameSize.Minimum);
    size.SetWidthPercent(255);
    size.SetHeightPercent(65);
    size.SetWidthPercentRelation(7);
    size.SetHeightPercentRelation(-2);
    const orient = new SwFormatHoriOrient(-720, H.LEFT_AND_WIDTH, 7, type === SwFrameSize.Fixed);
    table.GetFrameFormat().SetFormatAttr(size);
    table.GetFrameFormat().SetFormatAttr(orient);
    try {
      const encoded = encodeWriterDocument(doc),
        format = required(encoded.tables?.[0]).format;
      expect(format).not.toHaveProperty("width");
      expect(format).not.toHaveProperty("horiOrient");
      expect(format).not.toHaveProperty("align");
      expect(format.headerRows).toBe(9);
      expect(format.nativeGeometry?.frameSize).toEqual({
        width: 6000,
        height: 720,
        widthType: SwFrameSize.Minimum,
        heightType: type,
        widthPercent: 255,
        heightPercent: 65,
        widthPercentRelation: 7,
        heightPercentRelation: -2,
      });
      expect(format.nativeGeometry?.horiOrient).toEqual({
        position: -720,
        orientation: H.LEFT_AND_WIDTH,
        relation: 7,
        toggle: type === SwFrameSize.Fixed,
      });
      const clones = [
        decodeWriterDocument(structuredClone(encoded)),
        decodeWriterDocument(JSON.parse(JSON.stringify(encoded))),
        restoreOdtWriterTransfer(structuredClone(createOdtWriterTransfer(doc))),
      ];
      for (const restored of clones) {
        try {
          const t = required(restored.GetTables()[0]),
            f = t.GetFrameFormat();
          expect(f.GetFrameSize()).toEqual(size);
          expect(f.GetHoriOrient()).toEqual(orient);
          expect(f.GetFrameSize()).not.toBe(table.GetFrameFormat().GetFrameSize());
          expect(f.GetHoriOrient()).not.toBe(table.GetFrameFormat().GetHoriOrient());
          expect(t.GetFormat().headerRows).toBe(9);
          expect(t.GetRowsToRepeat()).toBe(1);
          expect(t.GetFormat()).not.toHaveProperty("nativeGeometry");
          expect(
            required(
              required(required(t.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
            ).GetText(),
          ).toBe("Original geometry transfer");
          expect(encodeWriterDocument(restored)).toEqual(encoded);
        } finally {
          restored.Dispose();
        }
      }
      const reopened = (
        await readOdtDocument(writeOdtDocument(doc, { title: "Geometry" }), { title: "Geometry" })
      ).document;
      try {
        expect(required(reopened.GetTables()[0]).GetFrameFormat().GetFrameSize().GetWidth()).toBe(
          6000,
        );
        expect(table.GetFrameFormat().GetFrameSize()).toEqual(size);
        expect(table.GetFrameFormat().GetHoriOrient()).toEqual(orient);
      } finally {
        reopened.Dispose();
      }
    } finally {
      doc.Dispose();
    }
  },
);

it("native direct geometry absence survives default construction and conflicting legacy fields", /** Checks own item state and current native precedence. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("AbsentGeometry", { headerRows: 0 });
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  try {
    table.GetFrameFormat().ResetFormatAttr(RES_HORI_ORIENT);
    table.GetFrameFormat().ResetFormatAttr(RES_FRM_SIZE);
    const record = structuredClone(encodeWriterDocument(doc));
    const format = required(record.tables?.[0]).format;
    expect(format.nativeGeometry).toEqual({ frameSize: undefined, horiOrient: undefined });
    const conflicting = {
      ...record,
      tables: [
        {
          ...required(record.tables?.[0]),
          format: { ...format, width: 9000, horiOrient: H.RIGHT, align: "right" as const },
        },
      ],
    };
    for (const value of [record, JSON.parse(JSON.stringify(record)), conflicting]) {
      const restored = decodeWriterDocument(value);
      try {
        const f = required(restored.GetTables()[0]).GetFrameFormat();
        expect(f.GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false)).toBeUndefined();
        expect(f.GetAttrSet().GetItemIfSet(RES_HORI_ORIENT, false)).toBeUndefined();
        expect(f.GetHoriOrient().GetHoriOrient()).toBe(H.NONE);
      } finally {
        restored.Dispose();
      }
    }
  } finally {
    doc.Dispose();
  }
});

it("old scalar geometry enters only legacy ingestion and reencodes complete native items", /** Checks backward storage admission without outgoing scalar duplication. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("LegacyGeometry");
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  try {
    const record = encodeWriterDocument(doc),
      legacy = {
        ...record,
        tables: [
          {
            ...required(record.tables?.[0]),
            format: { width: 4500, horiOrient: H.CENTER, headerRows: 0, marginTop: 120 },
          },
        ],
      },
      restored = decodeWriterDocument(legacy);
    try {
      const t = required(restored.GetTables()[0]);
      expect(t.GetFrameFormat().GetFrameSize().GetWidth()).toBe(4500);
      expect(t.GetHoriOrient()).toBe(H.CENTER);
      expect(t.GetFrameFormat().GetULSpace().GetUpper()).toBe(120);
      const format = required(encodeWriterDocument(restored).tables?.[0]).format;
      expect(format.nativeGeometry?.frameSize?.width).toBe(4500);
      expect(format.nativeGeometry?.horiOrient?.orientation).toBe(H.CENTER);
      expect(format).not.toHaveProperty("width");
    } finally {
      restored.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it("current complete native items win conflicting scalar values", /** Checks precedence and original complete fields during native restoration. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("NativeWins", { width: 3000 });
  table.AddColumnWidth(3000);
  doc.nodes.AppendTableRow(table, 1);
  table.GetFrameFormat().SetFormatAttr(new SwFormatHoriOrient(120, H.LEFT, 7, true));
  try {
    const record = encodeWriterDocument(doc),
      original = required(record.tables?.[0]),
      restored = decodeWriterDocument({
        ...record,
        tables: [{ ...original, format: { ...original.format, width: 9999, horiOrient: H.RIGHT } }],
      });
    try {
      const f = required(restored.GetTables()[0]).GetFrameFormat();
      expect(f.GetFrameSize().GetWidth()).toBe(3000);
      expect(f.GetHoriOrient()).toEqual(new SwFormatHoriOrient(120, H.LEFT, 7, true));
    } finally {
      restored.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});

it.each([null, [], false, 0, "native"])(
  "rejects invalid native geometry record%j before changing original items",
  /** Checks untrusted native container admission. @param value - Invalid payload. @returns Nothing. */ (
    value,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("RejectGeometry", { width: 3000 });
    try {
      expect(
        /** Restores invalid input. @returns Nothing. */ () =>
          restoreTableGeometry(
            table.GetFrameFormat(),
            value as unknown as WriterTableGeometryRecord,
          ),
      ).toThrow("native table geometry is invalid");
      expect(table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(3000);
    } finally {
      doc.Dispose();
    }
  },
);

it.each([
  null,
  [],
  false,
  "horizontal",
  {},
  { position: "0", orientation: H.LEFT, relation: 7, toggle: false },
  { position: NaN, orientation: H.LEFT, relation: 7, toggle: false },
  { position: 0.5, orientation: H.LEFT, relation: 7, toggle: false },
  { position: Number.MAX_SAFE_INTEGER + 1, orientation: H.LEFT, relation: 7, toggle: false },
  { position: 0, orientation: 0.5, relation: 7, toggle: false },
  { position: 0, orientation: -32769, relation: 7, toggle: false },
  { position: 0, orientation: 32768, relation: 7, toggle: false },
  { position: 0, orientation: H.LEFT, relation: 0.5, toggle: false },
  { position: 0, orientation: H.LEFT, relation: -32769, toggle: false },
  { position: 0, orientation: H.LEFT, relation: 32768, toggle: false },
  { position: 0, orientation: H.LEFT, relation: 7, toggle: 0 },
])(
  "rejects invalid complete native horizontal item%j",
  /** Checks each native field without partially changing original geometry. @param value - Invalid item payload. @returns Nothing. */ (
    value,
  ) => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("RejectOrientation", { width: 3000 });
    try {
      expect(
        /** Restores invalid item. @returns Nothing. */ () =>
          restoreTableGeometry(table.GetFrameFormat(), {
            horiOrient: value,
          } as unknown as WriterTableGeometryRecord),
      ).toThrow("horizontal orientation is invalid");
      expect(table.GetFrameFormat().GetFrameSize().GetWidth()).toBe(3000);
      expect(table.GetHoriOrient()).toBe(H.FULL);
    } finally {
      doc.Dispose();
    }
  },
);
