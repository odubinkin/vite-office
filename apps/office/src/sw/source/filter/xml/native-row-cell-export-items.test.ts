/** @fileoverview Verifies native direct row/cell items and exact orientation tokens through real XML and ODT packages. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SwFormatVertOrient, SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { RES_BOX, RES_VERT_ORIENT, RES_FRM_SIZE, RES_ROW_SPLIT } from "../../../inc/hintids";
import { exportContentXml } from "./xmlexp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
/** Requires an original owner or parsed property. @param value - Candidate. @returns Concrete value. */
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) throw Error("Missing original XML owner");
  return value;
}
/** Builds original connected row and box owners with native geometry. @returns Native graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("RowBoxItems", { width: 3000 });
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  node.SetText("Original native cell");
  return { doc, table, row, box, node };
}
/** Reads one actual native property block. @param xml - Exported content. @param family - Property family. @returns Attribute string. */
function properties(xml: string, family: "row" | "cell"): string {
  return required(required(xml.match(new RegExp(`<style:table-${family}-properties([^>]*)/>`)))[1]);
}
it.each([
  [V.NONE, "", V.NONE],
  [V.TOP, "top", V.TOP],
  [V.CENTER, "middle", V.CENTER],
  [V.BOTTOM, "bottom", V.BOTTOM],
  [V.CHAR_TOP, "", V.NONE],
] as const)(
  "native vertical orientation%s exports token%s and reopens%s",
  /** Checks native enum table and i8855 empty representation. @param orient - Native enum. @param token - ODF token. @param restored - Imported enum. @returns Completion. */ async (
    orient,
    token,
    restored,
  ) => {
    const f = fixture(),
      original = new SwFormatVertOrient(720, orient, 7);
    f.box.GetFrameFormat().SetFormatAttr(original);
    const rowProjection = vi.spyOn(f.row, "GetFormat"),
      boxProjection = vi.spyOn(f.box, "GetFormat");
    try {
      const xml = exportContentXml(f.doc);
      expect(properties(xml, "cell")).toContain(`style:vertical-align="${token}"`);
      const doc = (
        await readOdtDocument(writeOdtDocument(f.doc, { title: "Orientation" }), {
          title: "Orientation",
        })
      ).document;
      const box = required(
        required(required(doc.GetTables()[0]).GetTabLines()[0]).GetTabBoxes()[0],
      );
      expect(box.GetVertOrient().GetVertOrient()).toBe(restored);
      expect(
        (
          box
            .GetFrameFormat()
            .GetAttrSet()
            .GetItemIfSet(RES_VERT_ORIENT, false) as SwFormatVertOrient
        ).GetVertOrient(),
      ).toBe(restored);
      expect(properties(exportContentXml(doc), "cell")).toContain(
        `style:vertical-align="${token}"`,
      );
      expect(f.box.GetFrameFormat().GetVertOrient()).toEqual(original);
      expect(required(box.GetParagraphs()[0]).GetText()).toBe("Original native cell");
      expect(rowProjection).not.toHaveBeenCalled();
      expect(boxProjection).not.toHaveBeenCalled();
    } finally {
      rowProjection.mockRestore();
      boxProjection.mockRestore();
    }
  },
);
it.each([false, true])(
  "normal row and cell properties omit inherited and pool items parent=%s",
  /** Verifies direct admission without flattening parent formats. @param inherited - Explicit parent context. @returns Nothing. */ (
    inherited,
  ) => {
    const f = fixture(),
      rowParent = f.doc.MakeTableLineFormat(),
      boxParent = f.doc.MakeTableBoxFormat();
    const rowFormat = f.row.GetFrameFormat(),
      boxFormat = f.box.GetFrameFormat();
    try {
      if (inherited) {
        rowParent.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900));
        rowParent.SetFormatAttr(new SwFormatRowSplit(false));
        boxParent.SetFormatAttr(new SwFormatVertOrient(0, V.CENTER));
        const borders = new SvxBoxItem(RES_BOX);
        borders.SetAllDistances(120);
        boxParent.SetFormatAttr(borders);
      }
      rowFormat.SetDerivedFrom(rowParent);
      rowFormat.ResetFormatAttr(RES_FRM_SIZE);
      rowFormat.ResetFormatAttr(RES_ROW_SPLIT);
      boxFormat.SetDerivedFrom(boxParent);
      boxFormat.ResetFormatAttr(RES_BOX);
      boxFormat.ResetFormatAttr(RES_VERT_ORIENT);
      const xml = exportContentXml(f.doc);
      expect(properties(xml, "row")).toBe("");
      expect(properties(xml, "cell")).toBe("");
      expect(rowFormat.GetFrameSize().GetHeight()).toBe(inherited ? 900 : 0);
      expect(boxFormat.GetVertOrient().GetVertOrient()).toBe(inherited ? V.CENTER : V.NONE);
    } finally {
      rowFormat.SetDerivedFrom();
      boxFormat.SetDerivedFrom();
      rowParent.DisposeModify();
      boxParent.DisposeModify();
    }
  },
);
it.each([SwFrameSize.Variable, SwFrameSize.Fixed, SwFrameSize.Minimum])(
  "own row height mode%s and split flag survive ODT",
  /** Checks source height admission and native split inversion. @param mode - Native height mode. @returns Completion. */ async (
    mode,
  ) => {
    const f = fixture(),
      split = mode !== SwFrameSize.Fixed;
    f.row.GetFrameFormat().SetFormatAttr(new SwFormatFrameSize(mode, 0, 720));
    f.row.GetFrameFormat().SetFormatAttr(new SwFormatRowSplit(split));
    const xml = exportContentXml(f.doc),
      attrs = properties(xml, "row");
    expect(attrs.includes('style:row-height="1.27cm"')).toBe(mode === SwFrameSize.Fixed);
    expect(attrs.includes('style:min-row-height="1.27cm"')).toBe(mode === SwFrameSize.Minimum);
    expect(attrs).toContain(`fo:keep-together="${split ? "auto" : "always"}"`);
    const row = required(
      required(
        (
          await readOdtDocument(writeOdtDocument(f.doc, { title: "Height" }), { title: "Height" })
        ).document.GetTables()[0],
      ).GetTabLines()[0],
    );
    expect(row.GetFrameSize().GetHeightSizeType()).toBe(mode);
    expect(row.GetFrameSize().GetHeight()).toBe(mode === SwFrameSize.Variable ? 0 : 720);
    expect(row.GetRowSplit().GetValue()).toBe(split);
  },
);
it("own four-edge box values serialize from the original item without scalar cloning", /** Checks exact independent edges and original item ownership. @returns Completion. */ async () => {
  const f = fixture(),
    borders = new SvxBoxItem(RES_BOX);
  for (const edge of [0, 1, 2, 3]) borders.SetDistance((edge + 1) * 120, edge);
  borders.SetLine(new SvxBorderLine(0, 20), 0);
  f.box.GetFrameFormat().SetFormatAttr(borders);
  const projection = vi.spyOn(f.box, "GetFormat");
  try {
    const attrs = properties(exportContentXml(f.doc), "cell");
    expect(attrs).toContain('fo:padding-top="0.2117cm"');
    expect(attrs).toContain('fo:padding-bottom="0.4233cm"');
    expect(attrs).toContain('fo:padding-left="0.635cm"');
    expect(attrs).toContain('fo:padding-right="0.8467cm"');
    expect(attrs).toContain('fo:border-top="0.99pt solid #000000"');
    const box = required(
      required(
        required(
          (
            await readOdtDocument(writeOdtDocument(f.doc, { title: "Edges" }), { title: "Edges" })
          ).document.GetTables()[0],
        ).GetTabLines()[0],
      ).GetTabBoxes()[0],
    );
    expect(box.GetBox()).toEqual(borders);
    expect(projection).not.toHaveBeenCalled();
  } finally {
    projection.mockRestore();
  }
});
it("native unknown horizontal token exports empty and opens with no authored orientation", /** Checks normal mapper empty output and failed enum import admission. @returns Completion. */ async () => {
  const f = fixture();
  f.table.GetFrameFormat().SetFormatAttr(new SwFormatHoriOrient(0, H.INSIDE));
  expect(exportContentXml(f.doc)).toContain('table:align=""');
  const table = required(
    (
      await readOdtDocument(writeOdtDocument(f.doc, { title: "Empty" }), { title: "Empty" })
    ).document.GetTables()[0],
  );
  expect(table.GetHoriOrient()).toBe(H.FULL);
  expect(
    required(required(table.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0]?.GetText(),
  ).toBe("Original native cell");
});
