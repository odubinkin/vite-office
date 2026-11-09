/** @fileoverview Original RTF table row buffer ownership and depth-based replay. */
import { MINLAY } from "../../../inc/swtypes";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { ClearCellBorders, DispatchCellBorder } from "./rtfdocumentimpl.border";
import { stringValue } from "./rtfdocumentimpl.character";
import { putNestedAttribute } from "./rtfdocumentimpl.properties";
import type {
  RtfBlock,
  RtfDocumentImplContext,
  RtfParagraph,
  RtfState,
  RtfTableCellContent,
  RtfTableRow,
  RtfTableRowDefinition,
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
  left = 0;

  /** Resets the row definition without discarding content already buffered. @returns Nothing. */
  ResetProperties(): void {
    this.boundaries.length = 0;
    for (const list of this.cellSprms.splice(0)) list.dispose();
    this.left = 0;
  }

  /** Transfers the current row definition separately from its buffered content. @param state - Current group. @returns Native row definition. */
  TakeDefinition(state: RtfState): RtfTableRowDefinition {
    return {
      boundaries: this.boundaries.splice(0),
      rowSprms: new RTFSprms(state.tableRowSprms),
      cellSprms: this.cellSprms.splice(0),
      left: this.left,
    };
  }

  /** Restores the original cell and row geometry from a retained definition. @param definition - Saved row definition. @returns Nothing. */
  RestoreCellDefinition(definition: RtfTableRowDefinition): void {
    for (const list of this.cellSprms.splice(0)) list.dispose();
    this.boundaries.splice(0, this.boundaries.length, ...definition.boundaries);
    for (const list of definition.cellSprms) this.cellSprms.push(new RTFSprms(list));
    this.left = definition.left;
  }

  /** Transfers cell contents and definitions to the completed row. @param state - Current group. @returns Completed row. */
  FinishRow(state: RtfState): RtfTableRow {
    return { ...this.TakeDefinition(state), cells: this.cells.splice(0) };
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
  for (const { shape } of paragraph.frames ?? []) CollectBlockSprms(lists, shape.blocks ?? []);
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
    CollectRowDefinitionSprms(lists, row);
    for (const cell of row.cells) CollectTableCellSprms(lists, cell);
  }
}

/** Collects the original row and cell property snapshots. @param lists - Property owners. @param row - Original row definition. @returns Nothing. */
export function CollectRowDefinitionSprms(lists: Set<RTFSprms>, row: RtfTableRowDefinition): void {
  lists.add(row.rowSprms);
  for (const list of row.cellSprms) lists.add(list);
}

/** Collects completed paragraph and table events in an owned native text section. @param lists - Property owners. @param blocks - Original text stream. @returns Nothing. */
export function CollectBlockSprms(lists: Set<RTFSprms>, blocks: readonly RtfBlock[]): void {
  for (const block of blocks)
    if (block.kind === "paragraph") CollectParagraphSprms(lists, block.paragraph);
    else CollectTableRowSprms(lists, block.rows);
}

/** Adds the native borderless grid-after cell and copies the preceding cell's last character size. @param this - Native reader. @param state - Current group. @param row - Buffered top-level row. @returns Nothing. */
function AppendWidthAfterCell(
  this: RtfDocumentImplContext,
  state: RtfState,
  row: TableRowBuffer,
): void {
  const previous = row.cells.at(-1);
  let run;
  for (const content of previous ?? [])
    if (!("rows" in content)) run = content.marker ?? content.runs.at(-1) ?? run;
  this["CommitParagraph"](state, true);
  const paragraph = row.cell.pop();
  if (paragraph && !("rows" in paragraph)) {
    paragraph.paragraphSprms?.erase(N.LN_CT_PPrBase_spacing);
    if (run && paragraph.marker) {
      for (const id of [N.LN_EG_RPrBase_sz, N.LN_EG_RPrBase_szCs]) {
        const size = run.characterSprms.find(id);
        try {
          if (size.is()) paragraph.marker.characterSprms.set(id, size);
        } finally {
          size.dispose();
        }
      }
    }
    row.cells.push([
      {
        ...paragraph,
        state: { ...paragraph.state, beforeSet: false, afterSet: false, contextualSet: false },
      },
    ]);
  }
  row.boundaries.push((row.boundaries.at(-1) ?? 0) + state.tableRowWidthAfter);
  const index = row.cells.length - 1;
  if (row.cellSprms.length <= index) row.cellSprms.push(new RTFSprms(state.tableCellSprms));
  const cell = row.cellSprms[index];
  if (cell) ClearCellBorders(cell);
  state.tableRowWidthAfter = 0;
}

/** Original cell/row controls through the active table buffer. @param this - Native reader. @param name - Source control. @param parameter - Optional source value. @param state - Original group. @returns Whether consumed. */
export function DispatchTableControl(
  this: RtfDocumentImplContext,
  name: string,
  parameter: number | undefined,
  state: RtfState,
): boolean {
  const text = this["m_aTextBuffer"];
  const buffers = text.m_aTableBufferStack;
  if (name === "itap") {
    const depth = parameter ?? 1;
    state.paragraphSprms.set(N.LN_tblDepth, new RTFValue(depth), RTFConflictPolicy.ReplaceAtStart);
    if (depth > 0) {
      if (depth > RTF_MAX_NESTING_DEPTH) throw new RtfSyntaxError("RTF table nesting is too deep.");
      if (depth > buffers.length && text.HasParagraphContent()) this["CommitParagraph"](state);
      while (buffers.length < depth) buffers.push(new TableRowBuffer());
      DispatchTableControl.call(this, "intbl", undefined, state);
    }
    return true;
  }
  const row = this["tableBuffer"];
  if (name === "intbl") {
    this["m_aTextBuffer"].inTable = true;
    state.tableBuffer = row;
    state.paragraphSprms.set(N.LN_inTbl, new RTFValue(1));
    return true;
  }
  if (name === "trowd") {
    const topLevel = buffers[0] as TableRowBuffer;
    if (row === topLevel && topLevel.boundaries.at(-1)) {
      const previousBackup = text.m_BackupTopLevelTableRow;
      if (previousBackup) {
        previousBackup.rowSprms.dispose();
        for (const list of previousBackup.cellSprms) list.dispose();
      }
      text.m_BackupTopLevelTableRow = topLevel.TakeDefinition(state);
    }
    text.m_bNeedPap = true;
    this["m_aTextBuffer"].inTable = true;
    state.tableBuffer = row;
    row.ResetProperties();
    state.tableRowSprms.clear();
    return true;
  }
  if (name === "cell" || name === "nestcell") {
    if (text.HasParagraphContent() || row.cell.length === 0) this["CommitParagraph"](state);
    row.cells.push(row.cell.splice(0));
    this["m_aTextBuffer"].terminatedParagraph = true;
    return true;
  }
  if (name === "row" || name === "nestrow") {
    const nested = name === "nestrow";
    if (nested && (buffers.length === 1 || !state.tableBuffer))
      throw new RtfSyntaxError("Mismatch between ITAP and NESTROW.");
    if (!nested && buffers.length > 1) {
      const abandoned = new Set<RTFSprms>();
      const abandonedRows = buffers.splice(1);
      for (const buffer of abandonedRows) buffer.CollectSprms(abandoned);
      for (const list of abandoned) list.dispose();
      for (const group of this["states"]) {
        if (group.tableBuffer && abandonedRows.includes(group.tableBuffer))
          group.tableBuffer = buffers[0];
      }
    }
    const active = this["tableBuffer"];
    if (active.cell.length > 0 || text.HasParagraphContent()) {
      if (text.HasParagraphContent()) this["CommitParagraph"](state);
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
      this["m_aTextBuffer"].m_bNeedPap = true;
    } else {
      if (state.tableRowWidthAfter > 0) AppendWidthAfterCell.call(this, state, active);
      const backup = text.m_BackupTopLevelTableRow;
      const restored = !active.boundaries.at(-1) && !!backup;
      if (restored) {
        active.RestoreCellDefinition(backup);
        state.tableRowSprms.dispose();
        state.tableRowSprms = new RTFSprms(backup.rowSprms);
      } else if (active.boundaries.length === 0 && text.m_PreviousTopLevelTableRow) {
        active.RestoreCellDefinition(text.m_PreviousTopLevelTableRow);
      }
      const currentX = active.boundaries.at(-1);
      if (currentX !== undefined && text.nCellXMax - currentX >= MINLAY)
        active.boundaries[active.boundaries.length - 1] = text.nCellXMax;
      if (active.cells.length > 0) {
        const completed = active.FinishRow(state);
        text.tableRows.push(completed);
        if (completed.boundaries.length) text.m_PreviousTopLevelTableRow = completed;
      }
      active.ResetProperties();
      text.m_aDefaultTableCellSprms.clear();
      state.tableCellSprms.clear();
      if (restored) state.tableRowSprms.clear();
      for (const group of this["states"])
        if (group.tableBuffer === active) group.tableBuffer = undefined;
      text.inTable = false;
      text.m_bNeedPap = true;
      text.m_bNeedFinalPar = true;
    }
    this["m_aTextBuffer"].terminatedParagraph = true;
    return true;
  }
  if (DispatchCellBorder(state.tableCellSprms, name)) {
    delete state.paragraphBorder;
    state.cellBorder = true;
    return true;
  }
  if (name === "clvertalt" || name === "clvertalc" || name === "clvertalb") {
    const alignment =
      name === "clvertalc"
        ? N.LN_Value_ST_VerticalJc_center
        : name === "clvertalb"
          ? N.LN_Value_ST_VerticalJc_bottom
          : N.LN_Value_ST_VerticalJc_top;
    state.tableCellSprms.set(N.LN_CT_TcPrBase_vAlign, new RTFValue(alignment));
    return true;
  }
  if (name === "trrh") {
    const height = parameter ?? 0;
    putNestedAttribute(
      state.tableRowSprms,
      N.LN_CT_TrPrBase_trHeight,
      N.LN_CT_Height_val,
      new RTFValue(Math.abs(height) | 0),
    );
    putNestedAttribute(
      state.tableRowSprms,
      N.LN_CT_TrPrBase_trHeight,
      N.LN_CT_Height_hRule,
      stringValue(height < 0 ? "exact" : height > 0 ? "atLeast" : "auto"),
    );
    return true;
  }
  if (name === "trkeep" || name === "trhdr") {
    state.tableRowSprms.set(
      name === "trkeep" ? N.LN_CT_TrPrBase_cantSplit : N.LN_CT_TrPrBase_tblHeader,
      new RTFValue(1),
    );
    return true;
  }
  if (name === "trql" || name === "trqc" || name === "trqr") {
    state.tableRowSprms.set(
      N.LN_CT_TrPrBase_jc,
      new RTFValue(
        name === "trqc"
          ? N.LN_Value_ST_Jc_center
          : name === "trqr"
            ? N.LN_Value_ST_Jc_right
            : N.LN_Value_ST_Jc_left,
      ),
    );
    return true;
  }
  if (name === "trwWidthA") {
    state.tableRowWidthAfter = parameter ?? 0;
    return true;
  }
  if (name === "trleft") {
    row.left = parameter ?? 0;
    return true;
  }
  if (name === "cellx") {
    if (parameter !== undefined) {
      row.boundaries.push(parameter);
      if (row === buffers[0]) text.nCellXMax = Math.max(parameter, text.nCellXMax);
      row.cellSprms.push(new RTFSprms(state.tableCellSprms));
      state.tableCellSprms.dispose();
      state.tableCellSprms = new RTFSprms(text.m_aDefaultTableCellSprms);
    }
    return true;
  }
  return false;
}
