/** @fileoverview Original RTF table row buffer ownership and depth-based replay. */
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { VertOrientation } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { createRtfBorder } from "./rtfdocumentimpl.border";
import type {
  RtfCellBorder,
  RtfDocumentImplContext,
  RtfParagraph,
  RtfState,
  RtfTableCellContent,
  RtfTableRow,
} from "./rtfdocumentimpl.context";
import { RTFConflictPolicy, RTFSprms } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { RTF_MAX_NESTING_DEPTH, RtfSyntaxError } from "./rtftokenizer";

/** TableRowBuffer separates the active row's definition from its ordered content. */
export class TableRowBuffer {
  readonly cells: RtfTableCellContent[][] = [];
  readonly cell: RtfTableCellContent[] = [];
  readonly boundaries: number[] = [];
  readonly cellSprms: RTFSprms[] = [];
  readonly verticals: (VertOrientation | undefined)[] = [];
  readonly borders: Map<SvxBoxItemLine, RtfCellBorder>[] = [];
  readonly paddings: Map<SvxBoxItemLine, number>[] = [];
  defaultPaddings = new Map<SvxBoxItemLine, number>();
  nextCellVertical: VertOrientation | undefined;
  nextCellBorders = new Map<SvxBoxItemLine, RtfCellBorder>();
  nextCellPaddings = new Map<SvxBoxItemLine, number>();
  activeBorder: RtfCellBorder | undefined;
  alignment: "left" | "center" | "right" = "left";
  left = 0;
  height = 0;
  split = true;
  header = false;

  /** Resets the row definition without discarding content already buffered. @returns Nothing. */
  ResetProperties(): void {
    this.boundaries.length = 0;
    for (const list of this.cellSprms.splice(0)) list.dispose();
    this.verticals.length = 0;
    this.borders.length = 0;
    this.paddings.length = 0;
    this.defaultPaddings = new Map();
    this.nextCellVertical = undefined;
    this.nextCellBorders = new Map();
    this.nextCellPaddings = new Map();
    this.activeBorder = undefined;
    this.alignment = "left";
    this.left = 0;
    this.height = 0;
    this.split = true;
    this.header = false;
  }

  /** Transfers the live cell content and property snapshots to a completed row. @param state - Current group state. @returns Actual completed row. */
  FinishRow(state: RtfState): RtfTableRow {
    return {
      cells: this.cells.splice(0),
      header: this.header,
      boundaries: this.boundaries.splice(0),
      rowSprms: new RTFSprms(state.tableRowSprms),
      cellSprms: this.cellSprms.splice(0),
      alignment: this.alignment,
      left: this.left,
      height: this.height,
      split: this.split,
      verticals: this.verticals.splice(0),
      borders: this.borders.splice(0),
      paddings: this.paddings.splice(0),
      defaultPaddings: this.defaultPaddings,
    };
  }

  /** Collects unfinished and completed cell property ownership for cleanup. @param lists - Actual property lists. @returns Nothing. */
  CollectSprms(lists: Set<RTFSprms>): void {
    for (const list of this.cellSprms) lists.add(list);
    for (const cell of this.cells) CollectTableCellSprms(lists, cell);
    CollectTableCellSprms(lists, this.cell);
  }
}

/** Collects actual parsed paragraph sprm owners. @param lists - Actual property lists. @param paragraph - Original paragraph. @returns Nothing. */
export function CollectParagraphSprms(lists: Set<RTFSprms>, paragraph: RtfParagraph): void {
  for (const run of paragraph.runs) lists.add(run.characterSprms);
  if (paragraph.paragraphSprms) lists.add(paragraph.paragraphSprms);
  if (paragraph.marker) lists.add(paragraph.marker.characterSprms);
}

/** Collects cell properties recursively through original nested rows. @param lists - Actual property lists. @param cell - Original cell content. @returns Nothing. */
function CollectTableCellSprms(lists: Set<RTFSprms>, cell: readonly RtfTableCellContent[]): void {
  for (const item of cell) {
    if ("rows" in item) CollectTableRowSprms(lists, item.rows);
    else CollectParagraphSprms(lists, item);
  }
}

/** Collects actual completed row property owners. @param lists - Actual property lists. @param rows - Original rows. @returns Nothing. */
export function CollectTableRowSprms(lists: Set<RTFSprms>, rows: readonly RtfTableRow[]): void {
  for (const row of rows) {
    lists.add(row.rowSprms);
    for (const list of row.cellSprms) lists.add(list);
    for (const cell of row.cells) CollectTableCellSprms(lists, cell);
  }
}

/** Original cell/row controls through the active table buffer. @param this - Native reader. @param name - Source control. @param parameter - Optional source value. @param state - Original group. @returns Whether consumed. */
export function DispatchTableControl(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  const buffers = this["m_aTableBufferStack"];
  if (name === "itap") {
    const depth = parameter ?? 1;
    state.paragraphSprms.set(N.LN_tblDepth, new RTFValue(depth), RTFConflictPolicy.ReplaceAtStart);
    if (depth > 0) {
      if (depth > RTF_MAX_NESTING_DEPTH) throw new RtfSyntaxError("RTF table nesting is too deep.");
      if (depth > buffers.length && this["runs"].length > 0) this["CommitParagraph"](state);
      while (buffers.length < depth) buffers.push(new TableRowBuffer());
      DispatchTableControl.call(this, "intbl", undefined, state);
    }
    return true;
  }
  const row = this["tableBuffer"];
  if (name === "intbl") {
    this["inTable"] = true;
    state.tableBuffer = row;
    state.paragraphSprms.set(N.LN_inTbl, new RTFValue(1));
    return true;
  }
  if (name === "trowd") {
    this["m_bNeedPap"] = true;
    this["inTable"] = true;
    state.tableBuffer = row;
    row.ResetProperties();
    state.tableRowSprms.clear();
    return true;
  }
  if (name === "cell" || name === "nestcell") {
    if (this["runs"].length > 0 || row.cell.length === 0) this["CommitParagraph"](state);
    row.cells.push(row.cell.splice(0));
    this["terminatedParagraph"] = true;
    return true;
  }
  if (name === "row" || name === "nestrow") {
    const nested = name === "nestrow";
    if (nested && (buffers.length === 1 || !state.tableBuffer))
      throw new RtfSyntaxError("Mismatch between ITAP and NESTROW.");
    if (!nested && buffers.length > 1) {
      const abandoned = new Set<RTFSprms>();
      for (const buffer of buffers.splice(1)) buffer.CollectSprms(abandoned);
      for (const list of abandoned) list.dispose();
      for (const group of this["states"]) {
        if (group.tableBuffer) group.tableBuffer = buffers[0];
      }
    }
    const active = this["tableBuffer"];
    if (active.cell.length > 0 || this["runs"].length > 0) {
      if (this["runs"].length > 0) this["CommitParagraph"](state);
      active.cells.push(active.cell.splice(0));
    }
    if (nested) {
      const row = active.FinishRow(state);
      buffers.pop();
      const parent = this["tableBuffer"];
      for (const group of this["states"])
        if (group.tableBuffer === active) group.tableBuffer = parent;
      const previous = parent.cell.at(-1);
      if (previous && "rows" in previous) previous.rows.push(row);
      else parent.cell.push({ rows: [row] });
      this["m_bNeedPap"] = true;
    } else {
      if (active.cells.length > 0) this["tableRows"].push(active.FinishRow(state));
      this["inTable"] = false;
      this["m_bNeedFinalPar"] = true;
    }
    this["terminatedParagraph"] = true;
    return true;
  }
  if (name === "trpaddt" || name === "trpaddl" || name === "trpaddb" || name === "trpaddr") {
    const edge =
      name === "trpaddt"
        ? SvxBoxItemLine.TOP
        : name === "trpaddl"
          ? SvxBoxItemLine.LEFT
          : name === "trpaddb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    row.defaultPaddings.set(edge, parameter ?? 0);
    return true;
  }
  if (name === "clpadl" || name === "clpadt" || name === "clpadb" || name === "clpadr") {
    const edge =
      name === "clpadl"
        ? SvxBoxItemLine.TOP
        : name === "clpadt"
          ? SvxBoxItemLine.LEFT
          : name === "clpadb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    row.nextCellPaddings.set(edge, parameter ?? 0);
    return true;
  }
  if (name === "clbrdrt" || name === "clbrdrl" || name === "clbrdrb" || name === "clbrdrr") {
    delete state.paragraphBorder;
    const edge =
      name === "clbrdrt"
        ? SvxBoxItemLine.TOP
        : name === "clbrdrl"
          ? SvxBoxItemLine.LEFT
          : name === "clbrdrb"
            ? SvxBoxItemLine.BOTTOM
            : SvxBoxItemLine.RIGHT;
    const border: RtfCellBorder = createRtfBorder();
    row.nextCellBorders.set(edge, border);
    row.activeBorder = border;
    return true;
  }
  if (name === "clvertalt" || name === "clvertalc" || name === "clvertalb") {
    row.nextCellVertical =
      name === "clvertalc"
        ? VertOrientation.CENTER
        : name === "clvertalb"
          ? VertOrientation.BOTTOM
          : VertOrientation.TOP;
    return true;
  }
  if (name === "trrh") {
    row.height = parameter ?? 0;
    return true;
  }
  if (name === "trkeep") {
    row.split = false;
    return true;
  }
  if (name === "trhdr") {
    row.header = true;
    return true;
  }
  if (name === "trql" || name === "trqc" || name === "trqr") {
    row.alignment = name === "trqc" ? "center" : name === "trqr" ? "right" : "left";
    return true;
  }
  if (name === "trleft") {
    row.left = parameter ?? 0;
    return true;
  }
  if (name === "cellx") {
    if (parameter !== undefined) {
      row.boundaries.push(parameter);
      row.cellSprms.push(new RTFSprms(state.tableCellSprms));
      state.tableCellSprms.clear();
      row.verticals.push(row.nextCellVertical);
      row.nextCellVertical = undefined;
      row.borders.push(row.nextCellBorders);
      row.nextCellBorders = new Map();
      row.paddings.push(row.nextCellPaddings);
      row.nextCellPaddings = new Map();
      row.activeBorder = undefined;
    }
    return true;
  }
  return false;
}
