/** @fileoverview Writes the represented DOCX table, row and cell formatting. */
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FastSerializerHelper, FSNS } from "../../../../sax/inc/fshelper";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SvxBoxItemLine, type SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { RES_FRMATR_GRABBAG, RES_KEEP, RES_LAYOUT_SPLIT } from "../../../inc/hintids";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import type { SwTable, SwTableBox, SwTableLine } from "../../core/table/swtable";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { DocxAttributeOutput } from "./docxattributeoutput";
import type { GrabBagValueConstReference, SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { stringValue } from "../../core/unocore/unocrsrhelper";
import { forEachProperty } from "../../writerfilter/dmapper/SettingsTable.compat";

const w = token("w"),
  widthAttribute = FSNS(w, w),
  typeAttribute = FSNS(w, token("type"));

/** Returns the original first-cell distances used as the table defaults. @param table - Actual Writer table. @returns Borrowed default box. */
export function TableDefaultCellMargins(table: SwTable): Readonly<SvxBoxItem> {
  return (
    table.GetTabLines()[0]?.GetTabBoxes()[0]?.GetFrameFormat().GetBox() ??
    table.GetFrameFormat().GetBox()
  );
}

const tableLookFlags = [
  "firstRow",
  "lastRow",
  "firstColumn",
  "lastColumn",
  "noHBand",
  "noVBand",
] as const;

/** Borrows the table frame's original interoperability item. @param table - Native table. @returns Native properties. */
function TableGrabBag(table: SwTable): ReturnType<SfxGrabBagItem["GetGrabBag"]> {
  const item = table.GetFrameFormat().GetAttrSet().Get(RES_FRMATR_GRABBAG) as SfxGrabBagItem;
  return item.GetGrabBag();
}

/** Writes table look after geometry and margins in the native property order. @param serializer - Active XML serializer. @param look - Native table look sequence. @returns Nothing. */
function TableLook(
  serializer: FastSerializerHelper,
  look: GrabBagValueConstReference | undefined,
): void {
  if (!look) return;
  const attrs = FastSerializerHelper.createAttrList();
  try {
    forEachProperty(
      look,
      /** Writes only native table look flags. @param name - Native name. @param value - Value. @returns Nothing. */ (
        name,
        value,
      ) => {
        if (name === "val")
          attrs
            .operatorArrow()
            .add(
              FSNS(w, token("val")),
              (value.get("sal_Int32") >>> 0).toString(16).padStart(4, "0"),
            );
        else if (
          tableLookFlags.some(
            /** Matches a named flag. @param flag - Known flag. @returns Match. */ (flag) =>
              flag === name,
          )
        )
          attrs.operatorArrow().add(FSNS(w, token(name)), value.get("sal_Int32") ? "1" : "0");
      },
    );
    serializer.singleElementNS(w, token("tblLook"), attrs);
  } finally {
    attrs.dispose();
  }
}

/** Original check for an attached, enabled style with an exported conditional header. @param output - Attribute output. @param table - Native table. @returns Whether explicit false is needed. */
function HasTblHeaderFromStyle(output: DocxAttributeOutput, table: SwTable): boolean {
  const properties = TableGrabBag(table);
  const style = properties.get("TableStyleName");
  const look = properties.get("TableStyleLook");
  if (!style || !look) return false;
  let mask = 0;
  forEachProperty(
    look,
    /** Reads the normalized legacy mask. @param name - Field. @param value - Native value. @returns Nothing. */ (
      name,
      value,
    ) => {
      if (name === "val") mask = value.get("sal_Int32");
    },
  );
  return (
    (mask & 0x020) !== 0 && output.m_pTableStyleExport.FirstRowHasTblHeader(stringValue(style))
  );
}

/** Writes the original Word dimensions, alignment, indent and default cell distances. @param output - Active DOCX owner. @param table - Original Writer table. @returns Nothing. */
export function TableDefinition(output: DocxAttributeOutput, table: SwTable): void {
  const serializer = output.GetSerializer();
  const exporter = output.GetExport();
  const ecma = exporter.GetVersion() === OoxmlVersion.ECMA_376_1ST_EDITION;
  const frame = table.GetFrameFormat();
  const size = frame.GetFrameSize();
  const orientation = frame.GetHoriOrient().GetHoriOrient();
  const percentage = size.GetWidthPercent() || (orientation === HoriOrientation.FULL ? 100 : 0);
  const widthType = percentage ? "pct" : size.GetWidth() > 0 ? "dxa" : "auto";
  const preferredWidth = percentage ? percentage * 50 : size.GetWidth();
  const marginBox = TableDefaultCellMargins(table);
  const justification =
    orientation === HoriOrientation.CENTER
      ? "center"
      : orientation === HoriOrientation.RIGHT
        ? ecma
          ? "right"
          : "end"
        : ecma
          ? "left"
          : "start";
  let indent = 0;
  if (justification === "left" || justification === "start") {
    indent = frame.GetLRSpace().ResolveLeft();
    const mode = exporter.GetWordCompatibilityMode();
    if (mode > 0 && mode <= 14 && !table.GetTableNode().FindTableBoxStartNode())
      indent += marginBox.GetDistance(SvxBoxItemLine.LEFT);
    else indent -= Math.trunc(marginBox.CalcLineWidth(SvxBoxItemLine.LEFT) / 2);
  }

  serializer.startElementNS(w, token("tblPr"));
  const grabBag = TableGrabBag(table);
  const styleName = grabBag.get("TableStyleName");
  if (styleName)
    serializer.singleElementNS(w, token("tblStyle"), FSNS(w, token("val")), stringValue(styleName));
  if (exporter.TrueFrameDirection(frame) === SvxFrameDirection.Horizontal_RL_TB)
    serializer.singleElementNS(w, token("bidiVisual"), FSNS(w, token("val")), "true");
  serializer.singleElementNS(
    w,
    token("tblW"),
    widthAttribute,
    String(preferredWidth),
    typeAttribute,
    widthType,
  );
  serializer.singleElementNS(w, token("jc"), FSNS(w, token("val")), justification);
  serializer.singleElementNS(
    w,
    token("tblInd"),
    widthAttribute,
    String(indent),
    typeAttribute,
    "dxa",
  );
  serializer.singleElementNS(w, token("tblLayout"), typeAttribute, "fixed");
  ImplCellMargins(output, marginBox, "tblCellMar");
  TableLook(serializer, grabBag.get("TableStyleLook"));
  serializer.endElementNS(w, token("tblPr"));
}

/** Writes default or differing cell distances in the source order. @param output - Active DOCX owner. @param box - Original cell box. @param name - Margin element. @param defaults - Table defaults for cell overrides. @returns Nothing. */
export function ImplCellMargins(
  output: DocxAttributeOutput,
  box: Readonly<SvxBoxItem>,
  name: "tblCellMar" | "tcMar",
  defaults?: Readonly<SvxBoxItem>,
): void {
  const serializer = output.GetSerializer();
  const ecma = output.GetExport().GetVersion() === OoxmlVersion.ECMA_376_1ST_EDITION;
  const tag = token(name);
  let written = false;
  for (const [name, edge] of [
    ["top", SvxBoxItemLine.TOP],
    [ecma ? "left" : "start", SvxBoxItemLine.LEFT],
    ["bottom", SvxBoxItemLine.BOTTOM],
    [ecma ? "right" : "end", SvxBoxItemLine.RIGHT],
  ] as const) {
    const distance = box.GetDistance(edge);
    if (defaults?.GetDistance(edge) === distance) continue;
    if (!written) serializer.startElementNS(w, tag);
    serializer.singleElementNS(
      w,
      token(name),
      widthAttribute,
      String(distance),
      typeAttribute,
      "dxa",
    );
    written = true;
  }
  if (written) serializer.endElementNS(w, tag);
}

/** Writes the original row height only for nonzero fixed and minimum heights. @param output - Native DOCX writer. @param line - Actual row. @returns Nothing. */
function TableHeight(output: DocxAttributeOutput, line: SwTableLine): void {
  const size = line.GetFrameFormat().GetFrameSize();
  const rule = size.GetHeightSizeType();
  const height = size.GetHeight();
  if (!height || (rule !== SwFrameSize.Fixed && rule !== SwFrameSize.Minimum)) return;
  output
    .GetSerializer()
    .singleElementNS(
      w,
      token("trHeight"),
      FSNS(w, token("val")),
      String(height),
      FSNS(w, token("hRule")),
      rule === SwFrameSize.Fixed ? "exact" : "atLeast",
    );
}

/** Writes the source split flag and the one-row table emulation. @param output - Native DOCX writer. @param table - Actual table. @param line - Actual row. @returns Nothing. */
function TableCanSplit(output: DocxAttributeOutput, table: SwTable, line: SwTableLine): void {
  const items = table.GetFrameFormat().GetAttrSet();
  const keep = (items.Get(RES_KEEP) as SfxBoolItem).GetValue();
  const split = (items.Get(RES_LAYOUT_SPLIT) as SwFormatLayoutSplit).GetValue();
  const singleRow =
    !keep &&
    !split &&
    table.GetTabLines().length === 1 &&
    !line.GetUpper() &&
    line.GetTabBoxes()[0]?.GetContentNodes()[0] instanceof SwTextNode;
  if (singleRow || !line.GetFrameFormat().GetRowSplit().GetValue())
    output.GetSerializer().singleElementNS(w, token("cantSplit"));
}

/** Opens the native row and emits its represented properties in original order. @param output - Native DOCX writer. @param table - Actual table. @param line - Actual row. @param index - Row index in the table. @returns Nothing. */
export function StartTableRow(
  output: DocxAttributeOutput,
  table: SwTable,
  line: SwTableLine,
  index: number,
): void {
  const serializer = output.GetSerializer();
  serializer.startElementNS(w, token("tr"));
  serializer.startElementNS(w, token("trPr"));
  if (table.GetRowsToRepeat() > index)
    serializer.singleElementNS(w, token("tblHeader"), FSNS(w, token("val")), "true");
  else if (index === 0 && HasTblHeaderFromStyle(output, table))
    serializer.singleElementNS(w, token("tblHeader"), FSNS(w, token("val")), "false");
  TableHeight(output, line);
  TableCanSplit(output, table, line);
  serializer.endElementNS(w, token("trPr"));
}

/** Projects native cell direction and vertical orientation after the cell margins. @param output - Native DOCX writer. @param box - Actual cell. @returns Nothing. */
export function TableVerticalCell(output: DocxAttributeOutput, box: SwTableBox): void {
  const format = box.GetFrameFormat(),
    serializer = output.GetSerializer();
  const direction = output.GetExport().TrueFrameDirection(format);
  const val = FSNS(w, token("val"));
  if (direction === SvxFrameDirection.Vertical_RL_TB)
    serializer.singleElementNS(w, token("textDirection"), val, "tbRl");
  else if (direction === SvxFrameDirection.Vertical_LR_BT)
    serializer.singleElementNS(w, token("textDirection"), val, "btLr");
  const alignment = format.GetVertOrient().GetVertOrient();
  if (alignment === VertOrientation.CENTER)
    serializer.singleElementNS(w, token("vAlign"), val, "center");
  else if (alignment === VertOrientation.BOTTOM)
    serializer.singleElementNS(w, token("vAlign"), val, "bottom");
}
