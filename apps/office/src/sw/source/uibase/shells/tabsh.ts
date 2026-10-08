/** @fileoverview Applies represented table dialog attributes through native ItemSetToTableParam ownership from tabsh.cxx. */
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { createWriterInterface } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import type { SwFEShell } from "../../core/frmedt/fetab";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SwTableRep } from "../table/swtablerep";
import { PopMode } from "../../core/crsr/trvltbl";
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
} from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { SfxItemSet, SfxItemState } from "../../../../svl/source/items/itemset";
import { SID_ATTR_BORDER_INNER } from "../../../../svx/inc/svxids";
import {
  RES_BOX,
  RES_COLLAPSING_BORDERS,
  RES_UL_SPACE,
  RES_LAYOUT_SPLIT,
  RES_ROW_SPLIT,
} from "../../../inc/hintids";
import {
  FN_TABLE_REP,
  FN_PARAM_TABLE_NAME,
  FN_PARAM_TABLE_HEADLINE,
  FN_TABLE_SET_VERT_ALIGN,
} from "../../../inc/cmdid";
import { SwPtrItem } from "../utlui/uiitems";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import type { SwTableFormat } from "../../core/table/swtable";
import { importBoxProperties } from "../../../../xmloff/source/style/bordrhdl";

/** Represented table-property inputs in native twips; original model owners remain in the shell. */
export interface SwTableProperties {
  readonly name?: string;
  readonly width: number;
  readonly horiOrient?: HoriOrientation;
  readonly marginLeft?: number;
  readonly marginRight?: number;
  readonly marginTop?: number;
  readonly marginBottom?: number;
  readonly columnWidths: readonly number[];
  /** Shared accepted native dialog owner; explicit width-vector ingress remains available. */
  readonly tableRep?: SwTableRep;
  readonly padding?: number | undefined;
  readonly border?: string | undefined;
  readonly borderItems?: SfxItemSet | undefined;
  readonly verticalAlign?: number | undefined;
  readonly headerRows: number;
  readonly repeatHeaderRows: boolean;
  readonly layoutSplit?: boolean;
  readonly rowSplit?: boolean;
}

/** Captures the represented native table-properties border input over the source selection scope. @param shell - Original editing shell. @returns Owned native input items. */
export function TableParamToItemSet(shell: SwFEShell): SfxItemSet {
  const value = new SfxItemSet(shell.GetDoc().GetAttrPool(), [
    [RES_BOX, RES_BOX],
    [RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  info.SetDist(true);
  info.SetMinDist(true);
  info.SetDefDist(28);
  if (shell.IsCursorInTable() === undefined) {
    value.Put(info);
    return value;
  }
  value.Put(
    new SfxBoolItem(
      RES_COLLAPSING_BORDERS,
      shell.IsCursorInTable()?.GetTable().GetFormat().borderModel === "collapsing",
    ),
  );
  const selected = shell.IsTableMode();
  return shell.RunNotificationTransaction(
    /** Temporarily selects only for whole-table properties and restores original cursors. @returns Owned native items. */
    () => {
      if (!selected) {
        shell.Push();
        shell.SelTable();
      }
      try {
        const count = [...shell.GetCursor().GetRingContainer()].length;
        info.SetTable((shell.IsTableMode() && count > 1) || !selected);
        info.SetValid(SvxBoxInfoItemValidFlags.DISABLE, !selected || !shell.IsTableMode());
        value.Put(info);
        shell.GetTabBorders(value);
        return value;
      } finally {
        if (!selected) {
          shell.ClearMark();
          shell.Pop(PopMode.DeleteCurrent);
        }
      }
    },
  );
}

/** Applies explicitly published native table items as one source-owned history and notification group. @param shell - Original frame-editing shell. @param input - Native changed items or explicit legacy ingress. @returns Whether a table was targeted. */
export function ItemSetToTableParam(
  shell: SwFEShell,
  input: SfxItemSet | SwTableProperties,
): boolean {
  if (!(input instanceof SfxItemSet)) return ApplyExplicitTableProperties(shell, input);
  const table = shell.IsCursorInTable()?.GetTable();
  if (table === undefined) return false;
  return shell.RunNotificationTransaction(
    /** Consumes only explicitly set items and preserves the borrowed representation. @returns Whether admitted. */ () => {
      const undo = shell.GetDoc().GetUndoManager(),
        cursorState = shell.CaptureCursorState();
      undo.StartUndo("Table Properties");
      try {
        const borders =
          input.GetItemState(RES_BOX, false) === SfxItemState.SET ||
          input.GetItemState(SID_ATTR_BORDER_INNER, false) === SfxItemState.SET;
        const rowSplit = input.GetItemIfSet(RES_ROW_SPLIT, false);
        if (borders || rowSplit instanceof SwFormatRowSplit) {
          const selected = shell.IsTableMode();
          shell.Push();
          try {
            if (!selected) shell.SelTable();
            if (borders) shell.SetTabBorders(input, cursorState);
            if (rowSplit instanceof SwFormatRowSplit) shell.SetRowSplit(rowSplit, cursorState);
          } finally {
            if (!selected) shell.ClearMark();
            shell.Pop(PopMode.DeleteCurrent);
          }
        }
        const headline = input.GetItemIfSet(FN_PARAM_TABLE_HEADLINE, false);
        if (headline instanceof SfxUInt16Item)
          shell.SetRowsToRepeat(headline.GetValue(), headline.GetValue() > 0);
        const vertical = input.GetItemIfSet(FN_TABLE_SET_VERT_ALIGN, false);
        if (vertical instanceof SfxUInt16Item) shell.SetBoxAlign(vertical.GetValue());
        const name = input.GetItemIfSet(FN_PARAM_TABLE_NAME, false);
        if (name instanceof SfxStringItem)
          shell.SetTableName(table.GetFrameFormat(), name.GetValue());
        const pointer = input.GetItemIfSet(FN_TABLE_REP, false);
        const representation = pointer instanceof SwPtrItem ? pointer.GetValue() : undefined;
        let attributes: SwTableFormat = {};
        if (representation instanceof SwTableRep) {
          attributes = {
            ...(representation.align === HoriOrientation.FULL
              ? {}
              : { width: representation.width }),
            horiOrient: representation.align,
            marginLeft: representation.left,
            marginRight: representation.right,
            align: undefined,
          };
          if (representation.HasColsChanged()) {
            const columns = new SwTabCols();
            shell.GetTabCols(columns);
            const singleRow = representation.FillTabCols(columns);
            shell.SetTabCols(columns, singleRow);
          }
        }
        const spacing = input.GetItemIfSet(RES_UL_SPACE, false);
        if (spacing instanceof SvxULSpaceItem)
          attributes = {
            ...attributes,
            marginTop: spacing.GetUpper(),
            marginBottom: spacing.GetLower(),
          };
        const layoutSplit = input.GetItemIfSet(RES_LAYOUT_SPLIT, false);
        if (layoutSplit instanceof SwFormatLayoutSplit)
          attributes = { ...attributes, layoutSplit: layoutSplit.GetValue() };
        const merge = input.GetItemIfSet(RES_COLLAPSING_BORDERS, false);
        if (merge instanceof SfxBoolItem)
          attributes = {
            ...attributes,
            borderModel: merge.GetValue() ? "collapsing" : "separating",
          };
        if (Object.keys(attributes).length !== 0) shell.SetTableAttr(attributes);
        return true;
      } finally {
        undo.EndUndo();
      }
    },
  );
}

/** Applies one accepted dialog as one native history and notification group. @param shell - Actual frame-editing shell. @param value - Accepted attributes. @returns Whether a table was targeted. */
function ApplyExplicitTableProperties(shell: SwFEShell, value: SwTableProperties): boolean {
  const table = shell.IsCursorInTable()?.GetTable();
  if (table === undefined) return false;
  if (
    value.tableRep === undefined &&
    (value.columnWidths.length !== table.GetColumnWidths().length ||
      value.columnWidths.some(
        /** Rejects invalid column attributes before any mutation. @param width - Authored width. @returns Whether invalid. */ (
          width,
        ) => !Number.isFinite(width) || width <= 0,
      ))
  )
    throw new Error("Writer table column width is invalid.");
  return shell.RunNotificationTransaction(
    /** Groups native property mutations. @returns Whether admitted. */ () => {
      const undo = shell.GetDoc().GetUndoManager();
      const cursorState = shell.CaptureCursorState();
      undo.StartUndo("Table Properties");
      try {
        const hasBorders =
          value.borderItems?.GetItemState(RES_BOX, false) === SfxItemState.SET ||
          value.borderItems?.GetItemState(SID_ATTR_BORDER_INNER, false) === SfxItemState.SET ||
          value.padding !== undefined ||
          value.border !== undefined;
        const borders =
          value.borderItems?.Clone() ??
          new SfxItemSet(shell.GetDoc().GetAttrPool(), [
            [RES_BOX, RES_BOX],
            [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
          ]);
        if (hasBorders && value.borderItems === undefined) {
          const current = table
            .GetTabLines()
            .flatMap(
              /** Finds the original current box for omitted ingress fields. @param row - Row. @returns Boxes. */
              (row) => row.GetTabBoxes(),
            )
            .find(
              /** Matches the native current section. @param box - Box. @returns Whether current. */
              (box) =>
                box.GetStartNode() ===
                shell.GetCursor(false).GetPoint().GetNode().StartOfSectionNode(),
            );
          const item = current?.GetBox() ?? new SvxBoxItem(RES_BOX);
          // hasBorders guarantees a represented declaration; invalid values throw at ingress.
          const supplied = importBoxProperties(
            { padding: value.padding, border: value.border },
            RES_BOX,
          ) as SvxBoxItem;
          const box = item;
          if (value.padding !== undefined) box.SetAllDistances(value.padding);
          if (value.border !== undefined)
            for (const edge of [0, 1, 2, 3]) box.SetLine(supplied.GetLine(edge), edge);
          const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
          info.SetTable(true);
          info.SetDist(true);
          if (value.border === undefined) {
            info.SetValid(SvxBoxInfoItemValidFlags.ALL, false);
            info.SetValid(SvxBoxInfoItemValidFlags.DISTANCE);
          } else {
            info.SetLine(supplied.GetTop(), 0);
            info.SetLine(supplied.GetLeft(), 1);
          }
          borders.Put(box);
          borders.Put(info);
        }
        if (hasBorders || value.rowSplit !== undefined) {
          const selected = shell.IsTableMode();
          shell.Push();
          try {
            if (!selected) shell.SelTable();
            if (hasBorders) shell.SetTabBorders(borders, cursorState);
            if (value.rowSplit !== undefined)
              shell.SetRowSplit(new SwFormatRowSplit(value.rowSplit), cursorState);
          } finally {
            if (!selected) shell.ClearMark();
            shell.Pop(PopMode.DeleteCurrent);
          }
        }
        shell.SetRowsToRepeat(value.headerRows, value.repeatHeaderRows);
        if (value.name !== undefined) shell.SetTableName(table.GetFrameFormat(), value.name);
        if (value.verticalAlign !== undefined) shell.SetBoxAlign(value.verticalAlign);
        // Native dialog owners retain hidden intervals and gate separator application.
        if (value.tableRep === undefined || value.tableRep.HasColsChanged()) {
          const columns = new SwTabCols();
          shell.GetTabCols(columns);
          const representation =
            value.tableRep ?? new SwTableRep(table, columns.GetRightMax(), columns);
          if (value.tableRep === undefined) {
            representation.left = value.marginLeft ?? columns.GetLeft();
            representation.right = value.marginRight ?? columns.GetRightMax() - columns.GetRight();
            representation.width = value.width;
            representation.columns.splice(
              0,
              representation.GetAllColCount(),
              ...value.columnWidths.map(
                /** Converts explicit legacy width declarations at ingress. @param width - Authored width. @returns Visible native interval. */
                (width) => ({ nWidth: width, bVisible: true }),
              ),
            );
          }
          const singleRow = representation.FillTabCols(columns);
          shell.SetTabCols(columns, singleRow);
        }
        const merge =
          value.borderItems?.GetItemState(RES_COLLAPSING_BORDERS, false) === SfxItemState.SET
            ? value.borderItems.Get(RES_COLLAPSING_BORDERS)
            : undefined;
        shell.SetTableAttr({
          width: value.width,
          ...(merge instanceof SfxBoolItem
            ? { borderModel: merge.GetValue() ? "collapsing" : "separating" }
            : {}),
          ...(value.layoutSplit === undefined ? {} : { layoutSplit: value.layoutSplit }),
          ...(value.horiOrient === undefined
            ? {}
            : {
                horiOrient: value.horiOrient,
                marginLeft: value.marginLeft,
                marginRight: value.marginRight,
                marginTop: value.marginTop,
                marginBottom: value.marginBottom,
                align: undefined,
              }),
        });
        return true;
      } finally {
        undo.EndUndo();
      }
    },
  );
}

/** Native table context owns represented row insertion slots and state. */
export class SwTableShell {
  private readonly commandShell: SfxShell;
  /** Creates a table slot owner over the actual frame-editing shell. @param wrtShell - Native editing shell. @returns Nothing. */
  public constructor(private readonly wrtShell: SwWrtShell) {
    this.commandShell = createSfxShell(
      this,
      createWriterInterface(
        [
          WRITER_COMMAND_IDS.insertRowsBefore,
          WRITER_COMMAND_IDS.insertRowsAfter,
          WRITER_COMMAND_IDS.insertColumnsBefore,
          WRITER_COMMAND_IDS.insertColumnsAfter,
          WRITER_COMMAND_IDS.entireCell,
          WRITER_COMMAND_IDS.entireRow,
          WRITER_COMMAND_IDS.entireColumn,
          WRITER_COMMAND_IDS.selectTable,
        ].map(
          /** Binds native insertion and selection slots. @param id - Generated command. @returns Slot handler. */
          (id) => ({
            id,
            capabilityId: "CAP-0137" as const,
            /** Executes the native table command. @returns Whether inserted. */
            execute: () =>
              [
                WRITER_COMMAND_IDS.entireCell,
                WRITER_COMMAND_IDS.entireRow,
                WRITER_COMMAND_IDS.entireColumn,
                WRITER_COMMAND_IDS.selectTable,
              ].includes(id)
                ? this.Select(id)
                : this.Execute(
                    id === WRITER_COMMAND_IDS.insertRowsAfter ||
                      id === WRITER_COMMAND_IDS.insertColumnsAfter,
                    id === WRITER_COMMAND_IDS.insertColumnsBefore ||
                      id === WRITER_COMMAND_IDS.insertColumnsAfter,
                  ),
            /** Reads current native table state. @returns Whether available. */
            isEnabled: () => this.wrtShell.IsCursorInTable() !== undefined,
          }),
        ),
      ),
    );
  }
  /** Returns the native dispatcher shell. @returns Command shell. */
  public GetCommandShell(): SfxShell {
    return this.commandShell;
  }
  /** Executes native table selection with upstream standard-mode rules. @param id - Native selection slot. @returns Whether selected. */
  private Select(id: string): boolean {
    return this.wrtShell.RunNotificationTransaction(
      /** Brackets standard reset and final selection. @returns Whether selected. */ () => {
        if (id === WRITER_COMMAND_IDS.entireCell) return this.wrtShell.SelectTableCell();
        this.wrtShell.EnterStdMode();
        if (id === WRITER_COMMAND_IDS.entireRow) return this.wrtShell.SelectTableRow();
        if (id === WRITER_COMMAND_IDS.entireColumn) return this.wrtShell.SelectTableCol();
        return this.wrtShell.SelectTable();
      },
    );
  }
  /** Derives native count from actual selected row/column coordinates. @param behind - Trailing edge. @param columnMode - Native column command. @returns Whether inserted. */
  public Execute(behind: boolean, columnMode = false): boolean {
    const table = this.wrtShell.IsCursorInTable()?.GetTable();
    if (table === undefined) return false;
    const boxes = this.wrtShell.GetTableSel(),
      selected = table.GetTabLines().flatMap(
        /** Resolves rows containing selected native boxes. @param row - Original row. @param index - Row coordinate. @returns Selected coordinate. */
        (row, index) =>
          row.GetTabBoxes().flatMap(
            /** Reads actual selected coordinates. @param box - Native box. @param column - Coordinate. @returns Row or column coordinate. */
            (box, column) => (boxes.includes(box) ? [columnMode ? column : index] : []),
          ),
      );
    return (
      selected.length !== 0 &&
      (columnMode
        ? this.wrtShell.InsertCol(Math.max(...selected) - Math.min(...selected) + 1, behind)
        : this.wrtShell.InsertRow(Math.max(...selected) - Math.min(...selected) + 1, behind))
    );
  }
}
