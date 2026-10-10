/** @fileoverview Checks original XML table items, native header ownership and ordinary package import without scalar replay. */
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTable, SwTableLine, SwTableBox } from "../../core/table/swtable";
import { SwXMLTableImport } from "./xmltbli";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SvxLRSpaceItem, SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import {
  RES_LR_SPACE,
  RES_UL_SPACE,
  RES_HORI_ORIENT,
  RES_FRM_SIZE,
  RES_LAYOUT_SPLIT,
  RES_COLLAPSING_BORDERS,
} from "../../../inc/hintids";
import type { OdfTableStyle } from "../../../../xmloff/source/table/XMLTableImport";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Requires a connected original owner. @param value - Candidate. @returns Concrete owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native imported owner");
  return value;
}

it("closing imported headers changes only the native count and retains complete original items", /** Checks full LR proportions, orientation, size and unchanged owners. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    importer = new SwXMLTableImport(doc);
  try {
    importer.registerTableStyle("table", {
      family: "table",
      width: 3000,
      align: "left",
      marginLeft: 120,
      layoutSplit: false,
      borderModel: "collapsing",
    });
    importer.beginTable("ImportedHeader", "table");
    importer.addTableColumn("");
    importer.beginTableHeaderRows();
    importer.beginTableRow("");
    importer.beginTableCell("");
    importer.endTableCell();
    importer.endTableRow();
    const table = required(doc.GetTables()[0]),
      frame = table.GetFrameFormat(),
      row = required(table.GetTabLines()[0]),
      box = required(row.GetTabBoxes()[0]);
    const lr = new SvxLRSpaceItem(RES_LR_SPACE);
    lr.SetLeft(SvxIndentValue.twips(240), 50);
    lr.SetRight(SvxIndentValue.twips(480), 75);
    lr.SetTextFirstLineOffset(SvxIndentValue.twips(-80), 125);
    lr.SetAutoFirst(true);
    lr.SetExplicitZeroMarginValLeft(true);
    lr.SetGutterMargin(30);
    lr.SetRightGutterMargin(45);
    const size = new SwFormatFrameSize(SwFrameSize.Minimum, 3000, 900);
    size.SetWidthSizeType(SwFrameSize.Minimum);
    size.SetWidthPercent(60);
    size.SetHeightPercent(80);
    size.SetWidthPercentRelation(7);
    size.SetHeightPercentRelation(8);
    frame.SetFormatAttr(lr);
    frame.SetFormatAttr(size);
    frame.SetFormatAttr(new SwFormatHoriOrient(720, H.LEFT_AND_WIDTH, 7, true));
    frame.SetFormatAttr(new SvxULSpaceItem(120, 240, RES_UL_SPACE, true));
    const ids = [
        RES_LR_SPACE,
        RES_UL_SPACE,
        RES_HORI_ORIENT,
        RES_FRM_SIZE,
        RES_LAYOUT_SPLIT,
        RES_COLLAPSING_BORDERS,
      ],
      items = ids.map(
        /** Captures exact borrowed complete native items. @param which - Native identity. @returns Borrowed item. */ (
          which,
        ) => required(frame.GetAttrSet().GetItemIfSet(which, false)),
      );
    const get = vi.spyOn(table, "GetFormat"),
      set = vi.spyOn(table, "SetFormat");
    try {
      importer.endTableHeaderRows();
      importer.endTable();
      expect(table.GetRowsToRepeat()).toBe(1);
      for (let i = 0; i < ids.length; i++)
        expect(frame.GetAttrSet().GetItemIfSet(required(ids[i]), false)).toBe(items[i]);
      expect(frame.GetLRSpace().GetPropLeft()).toBe(50);
      expect(frame.GetLRSpace().GetPropRight()).toBe(75);
      expect(frame.GetHoriOrient().GetPos()).toBe(720);
      expect(frame.GetHoriOrient().IsPosToggle()).toBe(true);
      expect(frame.GetFrameSize()).toEqual(size);
      expect(frame.GetULSpace().GetContext()).toBe(true);
      expect(table.GetTabLines()[0]).toBe(row);
      expect(row.GetTabBoxes()[0]).toBe(box);
      expect(get).not.toHaveBeenCalled();
      expect(set).not.toHaveBeenCalled();
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  } finally {
    doc.Dispose();
  }
});

it.each([
  [{ family: "table" }, H.FULL, false, false],
  [{ family: "table", align: "left" }, H.FULL, false, false],
  [{ family: "table", align: "left", marginRight: 120 }, H.NONE, true, false],
  [{ family: "table", align: "left", width: 3000 }, H.LEFT, false, true],
  [{ family: "table", align: "left", width: 3000, marginLeft: 120 }, H.LEFT_AND_WIDTH, true, true],
  [{ family: "table", align: "center" }, H.FULL, false, false],
  [{ family: "table", align: "center", width: 3000 }, H.CENTER, false, true],
  [{ family: "table", align: "right" }, H.FULL, false, false],
  [{ family: "table", align: "right", width: 3000 }, H.RIGHT, false, true],
  [{ family: "table", align: "margins" }, H.FULL, false, false],
  [{ family: "table", align: "margins", marginRight: 240 }, H.NONE, true, false],
  [
    { family: "table", marginTop: 120, layoutSplit: false, borderModel: "collapsing" },
    H.FULL,
    false,
    false,
  ],
  [
    { family: "table", marginBottom: 240, layoutSplit: true, borderModel: "separating" },
    H.FULL,
    false,
    false,
  ],
] satisfies [Extract<OdfTableStyle, { family: "table" }>, H, boolean, boolean][])(
  "native table import applies style%j with original orientation%s",
  /** Checks authored native attributes and absence/default contracts. @param style - Parsed style. @param orient - Expected native orientation. @param lrSet - Authored LR state. @param sizeSet - Authored width state. @returns Nothing. */ (
    style: Extract<OdfTableStyle, { family: "table" }>,
    orient,
    lrSet,
    sizeSet,
  ) => {
    const doc = new SwDoc(),
      importer = new SwXMLTableImport(doc);
    try {
      importer.registerTableStyle("native", style);
      importer.beginTable("NativeStyle", "native");
      importer.endTable();
      const table = required(doc.GetTables()[0]),
        frame = table.GetFrameFormat();
      expect(table.GetHoriOrient()).toBe(orient);
      expect(table.GetRowsToRepeat()).toBe(0);
      expect(frame.GetAttrSet().GetItemIfSet(RES_LR_SPACE, false) !== undefined).toBe(lrSet);
      expect(frame.GetLRSpace().GetLeft().m_dValue).toBe(style.marginLeft ?? 0);
      expect(frame.GetLRSpace().GetRight().m_dValue).toBe(style.marginRight ?? 0);
      expect(frame.GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false) !== undefined).toBe(sizeSet);
      expect(frame.GetFrameSize().GetWidth()).toBe(style.width ?? 0);
      expect(frame.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
      expect(frame.GetFrameSize().GetWidthSizeType()).toBe(SwFrameSize.Fixed);
      expect(frame.GetULSpace().GetUpper()).toBe(style.marginTop ?? 0);
      expect(frame.GetULSpace().GetLower()).toBe(style.marginBottom ?? 0);
      expect(frame.GetAttrSet().GetItemIfSet(RES_UL_SPACE, false) !== undefined).toBe(
        style.marginTop !== undefined || style.marginBottom !== undefined,
      );
      expect(frame.GetAttrSet().GetItemIfSet(RES_LAYOUT_SPLIT, false) !== undefined).toBe(
        style.layoutSplit !== undefined,
      );
      expect(frame.GetAttrSet().GetItemIfSet(RES_COLLAPSING_BORDERS, false) !== undefined).toBe(
        style.borderModel !== undefined,
      );
    } finally {
      doc.Dispose();
    }
  },
);

it("real ODT import calls scalar setters only at native construction boundaries", /** Checks package styles, original row and box attributes, header count and factory width. @returns Completion. */ async () => {
  const source = new SwDoc(),
    table = source.nodes.MakeTableNode("PackageItems", {
      width: 3000,
      align: "left",
      marginLeft: 120,
      marginTop: 240,
      borderModel: "collapsing",
      layoutSplit: false,
      headerRows: 1,
    });
  table.AddColumnWidth(3000);
  const row = source.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]);
  row.GetFrameFormat().SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 720));
  required(box.GetParagraphs()[0]).SetText("Imported native cell");
  const bytes = writeOdtDocument(source, { title: "Native package" });
  const tableRead = vi.spyOn(SwTable.prototype, "GetFormat"),
    tableWrite = vi.spyOn(SwTable.prototype, "SetFormat"),
    rowWrite = vi.spyOn(SwTableLine.prototype, "SetFormat"),
    boxRead = vi.spyOn(SwTableBox.prototype, "GetFormat"),
    boxWrite = vi.spyOn(SwTableBox.prototype, "SetFormat");
  let imported: SwDoc | undefined;
  try {
    imported = (await readOdtDocument(bytes, { title: "Native package" })).document;
    expect(tableRead).not.toHaveBeenCalled();
    expect(tableWrite).toHaveBeenCalledTimes(1);
    expect(rowWrite).not.toHaveBeenCalled();
    expect(boxRead).not.toHaveBeenCalled();
    expect(boxWrite).toHaveBeenCalledTimes(1);
    const t = required(imported.GetTables()[0]),
      r = required(t.GetTabLines()[0]),
      b = required(r.GetTabBoxes()[0]);
    expect(t.GetHoriOrient()).toBe(H.LEFT_AND_WIDTH);
    expect(t.GetRowsToRepeat()).toBe(1);
    expect(t.GetFrameFormat().GetULSpace().GetUpper()).toBe(240);
    expect(
      (
        required(
          t.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_LAYOUT_SPLIT, false),
        ) as SwFormatLayoutSplit
      ).GetValue(),
    ).toBe(false);
    expect(r.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
    expect(r.GetFrameSize().GetHeight()).toBe(720);
    expect(b.GetFrameSize().GetWidth()).toBe(3000);
    expect(b.GetVertOrient().GetVertOrient()).toBe(V.NONE);
    expect(required(b.GetParagraphs()[0]).GetText()).toBe("Imported native cell");
  } finally {
    vi.restoreAllMocks();
    imported?.Dispose();
    source.Dispose();
  }
});
