/** @fileoverview Emits the represented geometry from DocxAttributeOutput::TableDefinition. */
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS } from "../../../../sax/inc/fshelper";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SvxBoxItemLine, type SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import type { SwTable } from "../../core/table/swtable";
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
