/** @fileoverview Verifies original direct table item admission and native LR orientation guards in actual ODT export. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwFrameFormat } from "../../core/layout/atrfrm";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize } from "../../../inc/fmtfsize";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SvxLRSpaceItem, SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { exportContentXml } from "./xmlexp";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
/** Builds a connected table with authored text and no scalar formatting. @returns Original owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("DirectItems");
  table.GetFrameFormat().SetFormatAttr(new SwFormatFrameSize(0, 3000));
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    node = required(required(row.GetTabBoxes()[0]).GetParagraphs()[0]);
  node.SetText("Original item export");
  return { doc, table, format: table.GetFrameFormat(), node };
}
/** Extracts only the table properties, excluding paragraph/column/cell properties. @param doc - Native document. @returns Attribute text. */
function properties(doc: SwDoc): string {
  const result = exportContentXml(doc).match(/<style:table-properties([^>]*)\/>/);
  if (result === null) throw Error("Missing table properties");
  return required(result[1]);
}
/** Requires a concrete original owner or parsed XML field. @param value - Candidate. @returns Present value. */
function required<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) throw Error("Missing native export owner");
  return value;
}

it.each([
  [H.NONE, "margins", true, true],
  [H.FULL, "margins", false, false],
  [H.LEFT, "left", false, false],
  [H.LEFT_AND_WIDTH, "left", true, false],
  [H.CENTER, "center", false, false],
  [H.RIGHT, "right", false, false],
  [H.INSIDE, undefined, false, false],
] as const)(
  "native orientation %s admits only its source-defined margins",
  /** Checks actual XML mapping without reading scalar table projection. @param orient - Native enum. @param token - XML token. @param left - Left admission. @param right - Right admission. @returns Nothing. */ (
    orient,
    token,
    left,
    right,
  ) => {
    const f = fixture(),
      lr = new SvxLRSpaceItem(98);
    lr.SetLeft(120);
    lr.SetRight(240);
    f.format.SetFormatAttr(lr);
    f.format.SetFormatAttr(new SwFormatHoriOrient(0, orient));
    const projection = vi.spyOn(f.table, "GetFormat");
    try {
      const attrs = properties(f.doc);
      if (token === undefined) expect(attrs).not.toContain("table:align");
      else expect(attrs).toContain(`table:align="${token}"`);
      expect(attrs.includes('fo:margin-left="0.2117cm"')).toBe(left);
      expect(attrs.includes('fo:margin-right="0.4233cm"')).toBe(right);
      expect(projection).not.toHaveBeenCalled();
    } finally {
      projection.mockRestore();
    }
  },
);
it.each([false, true])(
  "unset and inherited normal table items are not exported inherited=%s",
  /** Tests original direct state, effective parent values and ODT absence. @param inherited - Whether parent has items. @returns Nothing. */ (
    inherited,
  ) => {
    const f = fixture(),
      parent = new SwFrameFormat(f.doc.GetAttrPool(), "ExportParent");
    try {
      f.format.ResetFormatAttr(90);
      f.format.ResetFormatAttr(110);
      f.format.SetDerivedFrom(parent);
      if (inherited) {
        parent.SetFormatAttr(new SwFormatFrameSize(0, 7200));
        parent.SetFormatAttr(new SwFormatHoriOrient(0, H.CENTER));
        parent.SetFormatAttr(new SvxULSpaceItem(120, 240, 99));
        parent.SetFormatAttr(new SwFormatLayoutSplit(false));
        parent.SetFormatAttr(new SfxBoolItem(132, true));
        const lr = new SvxLRSpaceItem(98);
        lr.SetLeft(360);
        lr.SetRight(480);
        parent.SetFormatAttr(lr);
      }
      const projection = vi.spyOn(f.table, "GetFormat");
      try {
        expect(properties(f.doc)).toBe("");
        expect(f.format.GetAttrSet().GetItemIfSet(99, false)).toBeUndefined();
        expect(f.format.GetULSpace().GetUpper()).toBe(inherited ? 120 : 0);
        expect(projection).not.toHaveBeenCalled();
      } finally {
        projection.mockRestore();
      }
    } finally {
      f.format.SetDerivedFrom();
      parent.DisposeModify();
    }
  },
);
it.each([false, true])(
  "LR guard searches a SET parent orientation but excludes the pool default parent=%s",
  /** Distinguishes special LR guard from normal direct-item mapping. @param inherited - Explicit parent guard. @returns Nothing. */ (
    inherited,
  ) => {
    const f = fixture(),
      parent = new SwFrameFormat(f.doc.GetAttrPool(), "MarginGuard"),
      lr = new SvxLRSpaceItem(98);
    try {
      f.format.SetDerivedFrom(parent);
      f.format.ResetFormatAttr(110);
      if (inherited) parent.SetFormatAttr(new SwFormatHoriOrient(0, H.NONE));
      lr.SetLeft(120);
      lr.SetRight(240);
      f.format.SetFormatAttr(lr);
      const attrs = properties(f.doc);
      expect(attrs).not.toContain("table:align");
      expect(attrs.includes("fo:margin-left=")).toBe(inherited);
      expect(attrs.includes("fo:margin-right=")).toBe(inherited);
      f.format.ResetFormatAttr(98);
      expect(properties(f.doc)).not.toContain("fo:margin-");
    } finally {
      f.format.SetDerivedFrom();
      parent.DisposeModify();
    }
  },
);
it.each([false, true])(
  "original table items survive real ODT open and export borders=%s",
  /** Checks own native values, headline counter and independent ODT reconstruction. @param collapse - Native border model. @returns Completion. */ async (
    collapse,
  ) => {
    const f = fixture();
    f.format.SetFormatAttr(new SvxULSpaceItem(120, 240, 99));
    f.format.SetFormatAttr(new SwFormatHoriOrient(0, H.NONE));
    f.format.SetFormatAttr(new SwFormatLayoutSplit(collapse));
    f.format.SetFormatAttr(new SfxBoolItem(132, collapse));
    f.table.SetRowsToRepeat(0);
    const projection = vi.spyOn(f.table, "GetFormat");
    try {
      const attrs = properties(f.doc);
      expect(attrs).toContain('style:width="5.2917cm"');
      expect(attrs).toContain('fo:margin-top="0.2117cm"');
      expect(attrs).toContain('fo:margin-bottom="0.4233cm"');
      expect(attrs).toContain(`table:border-model="${collapse ? "collapsing" : "separating"}"`);
      expect(attrs).toContain(`style:may-break-between-rows="${collapse}"`);
      expect(exportContentXml(f.doc)).not.toContain("<table:table-header-rows>");
      const reopened = required(
        (
          await readOdtDocument(writeOdtDocument(f.doc, { title: "Items" }), { title: "Items" })
        ).document.GetTables()[0],
      );
      expect(reopened.GetFrameFormat().GetULSpace()).toEqual(f.format.GetULSpace());
      expect(reopened.GetFrameFormat().GetFrameSize().GetWidth()).toBe(3000);
      expect(
        (reopened.GetFrameFormat().GetAttrSet().Get(120) as SwFormatLayoutSplit).GetValue(),
      ).toBe(collapse);
      expect((reopened.GetFrameFormat().GetAttrSet().Get(132) as SfxBoolItem).GetValue()).toBe(
        collapse,
      );
      expect(reopened.GetRowsToRepeat()).toBe(0);
      expect(
        required(
          required(required(reopened.GetTabLines()[0]).GetTabBoxes()[0]).GetParagraphs()[0],
        ).GetText(),
      ).toBe("Original item export");
      expect(projection).not.toHaveBeenCalled();
    } finally {
      projection.mockRestore();
    }
  },
);
