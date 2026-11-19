/** @fileoverview Writes the represented DOCX table, row and cell formatting. */
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS } from "../../../../sax/inc/fshelper";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SvxBoxItemLine, type SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { RES_KEEP, RES_LAYOUT_SPLIT } from "../../../inc/hintids";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import type { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import type { SwTable, SwTableBox, SwTableLine } from "../../core/table/swtable";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import type { DocxAttributeOutput } from "./docxattributeoutput";

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
