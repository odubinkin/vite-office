/** @fileoverview Applies represented table dialog attributes through native ItemSetToTableParam ownership from tabsh.cxx. */
import { SvxIndentValue } from "../../../../editeng/inc/lrspitem";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { createWriterInterface } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import type { SwWrtShell } from "../wrtsh/wrtsh1";
import type { SwFEShell } from "../../core/frmedt/fetab";
import { SwFormatHoriOrient } from "../../../inc/fmtornt";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SvxLRSpaceItem } from "../../../../editeng/source/items/frmitems";
import { RES_LR_SPACE, RES_FRM_SIZE, RES_HORI_ORIENT } from "../../../inc/hintids";
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
  SID_ATTR_TABLE_ROW_HEIGHT,
  SID_ATTR_TABLE_COLUMN_WIDTH,
  SID_ATTR_TABLE_ALIGNMENT,
  SID_ATTR_TABLE_LEFT_SPACE,
  SID_ATTR_TABLE_RIGHT_SPACE,
  FN_TABLE_REP,
  FN_PARAM_TABLE_NAME,
  FN_PARAM_TABLE_HEADLINE,
  FN_TABLE_SET_VERT_ALIGN,
} from "../../../inc/cmdid";
import { SwPtrItem } from "../utlui/uiitems";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { SfxInt32Item, SfxUInt32Item, SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SwTableFUNC } from "../table/tablemgr";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { importBoxProperties } from "../../filter/xml/xmlimpit";

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
    [RES_UL_SPACE, RES_UL_SPACE],
    [RES_BOX, RES_BOX],
    [RES_LAYOUT_SPLIT, RES_LAYOUT_SPLIT],
    [RES_ROW_SPLIT, RES_ROW_SPLIT],
    [RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
    [FN_PARAM_TABLE_HEADLINE, FN_PARAM_TABLE_HEADLINE],
  ]);
  const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  info.SetDist(true);
  info.SetMinDist(true);
  info.SetDefDist(28);
  const tableNode = shell.IsCursorInTable();
  if (tableNode === undefined) {
    value.Put(info);
    return value;
  }
  value.Put(tableNode.GetTable().GetFrameFormat().GetULSpace());
  value.Put(new SfxUInt16Item(FN_PARAM_TABLE_HEADLINE, tableNode.GetTable().GetRowsToRepeat()));
  value.Put(tableNode.GetTable().GetFrameFormat().GetAttrSet().Get(RES_LAYOUT_SPLIT));
  value.Put(tableNode.GetTable().GetFrameFormat().GetAttrSet().Get(RES_COLLAPSING_BORDERS));
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
        const rowSplit = shell.GetRowSplit();
        if (rowSplit !== undefined) value.Put(rowSplit);
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
        if (headline instanceof SfxUInt16Item) shell.SetRowsToRepeat(headline.GetValue());
        const vertical = input.GetItemIfSet(FN_TABLE_SET_VERT_ALIGN, false);
        if (vertical instanceof SfxUInt16Item) shell.SetBoxAlign(vertical.GetValue());
        const name = input.GetItemIfSet(FN_PARAM_TABLE_NAME, false);
        if (name instanceof SfxStringItem)
          shell.SetTableName(table.GetFrameFormat(), name.GetValue());
        const pointer = input.GetItemIfSet(FN_TABLE_REP, false);
        const representation = pointer instanceof SwPtrItem ? pointer.GetValue() : undefined;
        const attributeSet = new SfxItemSet(input.GetPool(), [
          [RES_FRM_SIZE, RES_FRM_SIZE],
          [RES_LR_SPACE, RES_UL_SPACE],
          [RES_HORI_ORIENT, RES_HORI_ORIENT],
          [RES_LAYOUT_SPLIT, RES_LAYOUT_SPLIT],
          [RES_COLLAPSING_BORDERS, RES_COLLAPSING_BORDERS],
        ]);
        if (representation instanceof SwTableRep) {
          const lr = new SvxLRSpaceItem(RES_LR_SPACE);
          lr.SetLeft(SvxIndentValue.twips(representation.left));
          lr.SetRight(SvxIndentValue.twips(representation.right));
          attributeSet.Put(lr);
          if (representation.align !== HoriOrientation.FULL)
            attributeSet.Put(new SwFormatFrameSize(SwFrameSize.Variable, representation.width));
          attributeSet.Put(new SwFormatHoriOrient(0, representation.align));
        }
        for (const which of [RES_LAYOUT_SPLIT, RES_UL_SPACE, RES_COLLAPSING_BORDERS])
          if (input.GetItemState(which, false) === SfxItemState.SET)
            attributeSet.Put(input.Get(which, false));
        if (representation instanceof SwTableRep && representation.HasColsChanged()) {
          const columns = new SwTabCols();
          shell.GetTabCols(columns);
          const singleRow = representation.FillTabCols(columns);
          shell.SetTabCols(columns, singleRow);
        }
        if (attributeSet.Count() !== 0) shell.SetTableAttr(attributeSet);
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
        shell.SetRowsToRepeat(value.repeatHeaderRows ? value.headerRows : 0);
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
      createWriterInterface([
        ...[
          WRITER_COMMAND_IDS.tableRowHeight,
          WRITER_COMMAND_IDS.tableColumnWidth,
          WRITER_COMMAND_IDS.tableAlignment,
          WRITER_COMMAND_IDS.tableLeftSpace,
          WRITER_COMMAND_IDS.tableRightSpace,
        ].map(
          /** Binds native table metrics and state-only spacing. @param id - Native slot URL. @returns Handler. */
          (id) => ({
            id,
            capabilityId: "CAP-0137" as const,
            /** Applies typed native arguments. @param _context - Owning shell. @param items - Actual request items. @returns Whether applied. */
            execute: (_context: unknown, items: readonly SfxPoolItem[]) =>
              this.ExecuteMetrics(id, items),
            /** Reads the native current item. @returns Native state item. */
            getStateValue: () => this.GetMetricState(id),
            /** Tests current table context. @returns Whether available. */
            isEnabled: () => this.wrtShell.IsCursorInTable() !== undefined,
            /** Leaves mixed row height blank. @returns Whether unset. */
            isMixed: () =>
              id === WRITER_COMMAND_IDS.tableRowHeight &&
              this.wrtShell.GetRowHeight() === undefined,
          }),
        ),
        ...[
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
      ]),
    );
    this.commandShell.GetInterface().RegisterPopupMenu("table");
  }
  /** Queries the exact typed sidebar item from native Table GetState. @param id - Native command. @returns Owned state item or absent mixed row height. */
  private GetMetricState(id: string): SfxPoolItem | undefined {
    const table = this.wrtShell.IsCursorInTable()?.GetTable();
    if (table === undefined) return undefined;
    if (id === WRITER_COMMAND_IDS.tableRowHeight) {
      const height = this.wrtShell.GetRowHeight();
      return height === undefined
        ? undefined
        : new SfxUInt32Item(SID_ATTR_TABLE_ROW_HEIGHT, height.GetHeight());
    }
    if (id === WRITER_COMMAND_IDS.tableColumnWidth) {
      const manager = new SwTableFUNC(this.wrtShell);
      manager.InitTabCols();
      return new SfxUInt32Item(
        SID_ATTR_TABLE_COLUMN_WIDTH,
        manager.GetColWidth(manager.GetCurColNum()),
      );
    }
    const format = table.GetFrameFormat(),
      alignment = format.GetHoriOrient().GetHoriOrient();
    if (id === WRITER_COMMAND_IDS.tableAlignment)
      return new SfxUInt16Item(SID_ATTR_TABLE_ALIGNMENT, alignment);
    const columns = new SwTabCols();
    this.wrtShell.GetTabCols(columns);
    const space = columns.GetRightMax(),
      lr = format.GetLRSpace();
    let left = lr.ResolveLeft(),
      right = lr.ResolveRight();
    const size = format.GetFrameSize(),
      percent = size.GetWidthPercent();
    let width =
      alignment === HoriOrientation.FULL
        ? columns.GetRight()
        : [
              HoriOrientation.LEFT_AND_WIDTH,
              HoriOrientation.LEFT,
              HoriOrientation.RIGHT,
              HoriOrientation.CENTER,
            ].includes(alignment)
          ? size.GetWidth()
          : space - left - right;
    if (percent) width = Math.trunc((space * percent) / 100);
    if (alignment !== HoriOrientation.FULL) {
      const remainder = space - width;
      if (alignment === HoriOrientation.CENTER) left = right = Math.trunc(remainder / 2);
      else if (alignment === HoriOrientation.LEFT) {
        left = 0;
        right = remainder;
      } else if (alignment === HoriOrientation.RIGHT) {
        left = remainder;
        right = 0;
      } else if (alignment === HoriOrientation.LEFT_AND_WIDTH) right = remainder - left;
    }
    return id === WRITER_COMMAND_IDS.tableLeftSpace
      ? new SfxInt32Item(SID_ATTR_TABLE_LEFT_SPACE, left)
      : new SfxInt32Item(SID_ATTR_TABLE_RIGHT_SPACE, right);
  }

  /** Executes consumed native table sidebar slots without untyped ingress. @param id - Native command. @param items - Request items. @returns Whether a typed request was accepted. */
  private ExecuteMetrics(id: string, items: readonly SfxPoolItem[]): boolean {
    if (this.wrtShell.IsCursorInTable() === undefined) return false;
    const which =
      id === WRITER_COMMAND_IDS.tableRowHeight
        ? SID_ATTR_TABLE_ROW_HEIGHT
        : id === WRITER_COMMAND_IDS.tableColumnWidth
          ? SID_ATTR_TABLE_COLUMN_WIDTH
          : SID_ATTR_TABLE_ALIGNMENT;
    const item = items.find(
      /** Finds the exact native request item. @param candidate - Request item. @returns Whether targeted. */
      (candidate) => candidate.Which() === which,
    );
    if (id === WRITER_COMMAND_IDS.tableRowHeight && item instanceof SfxUInt32Item) {
      const height = this.wrtShell.GetRowHeight();
      if (height === undefined) return false;
      if (height.GetHeightSizeType() === SwFrameSize.Variable)
        height.SetHeightSizeType(SwFrameSize.Minimum);
      height.SetHeight(item.GetValue());
      return this.wrtShell.SetRowHeight(height);
    }
    if (id === WRITER_COMMAND_IDS.tableColumnWidth && item instanceof SfxUInt32Item) {
      const manager = new SwTableFUNC(this.wrtShell);
      manager.InitTabCols();
      return manager.SetColWidth(manager.GetCurColNum(), item.GetValue());
    }
    if (
      id !== WRITER_COMMAND_IDS.tableAlignment ||
      !(item instanceof SfxUInt16Item) ||
      item.GetValue() > HoriOrientation.LEFT_AND_WIDTH
    )
      return false;
    const alignment = item.GetValue();
    const leftItem = items.find(
        /** Resolves the optional native left item. @param candidate - Request item. @returns Whether left. */
        (candidate) => candidate.Which() === SID_ATTR_TABLE_LEFT_SPACE,
      ),
      rightItem = items.find(
        /** Resolves the optional native right item. @param candidate - Request item. @returns Whether right. */
        (candidate) => candidate.Which() === SID_ATTR_TABLE_RIGHT_SPACE,
      );
    let left = leftItem instanceof SfxInt32Item ? leftItem.GetValue() : 0,
      right = rightItem instanceof SfxInt32Item ? rightItem.GetValue() : 0;
    const columns = new SwTabCols();
    this.wrtShell.GetTabCols(columns);
    const space = columns.GetRightMax();
    let width = space;
    switch (alignment) {
      case HoriOrientation.LEFT:
        if (23 < space - right) width = space - right;
        else {
          width = 23;
          right = space - 23;
        }
        left = 0;
        break;
      case HoriOrientation.RIGHT:
        if (23 < space - left) width = space - left;
        else {
          width = 23;
          left = space - 23;
        }
        right = 0;
        break;
      case HoriOrientation.LEFT_AND_WIDTH:
        right = 0;
        left = Math.min(left, space);
        break;
      case HoriOrientation.FULL:
        left = right = 0;
        break;
      case HoriOrientation.CENTER:
        if (23 < space - 2 * left) width = space - 2 * left;
        else {
          width = 23;
          left = right = Math.trunc((space - 23) / 2);
        }
        break;
      case HoriOrientation.NONE:
        if (23 < space - left - right) width = space - left - right;
        else {
          width = 23;
          left = right = Math.trunc((space - 23) / 2);
        }
        break;
    }
    const attributes = new SfxItemSet(this.wrtShell.GetDoc().GetAttrPool(), [
      [RES_FRM_SIZE, RES_FRM_SIZE],
      [RES_LR_SPACE, RES_LR_SPACE],
      [RES_HORI_ORIENT, RES_HORI_ORIENT],
    ]);
    attributes.Put(new SwFormatFrameSize(SwFrameSize.Variable, width));
    const lr = new SvxLRSpaceItem(RES_LR_SPACE);
    lr.SetLeft(SvxIndentValue.twips(left));
    lr.SetRight(SvxIndentValue.twips(right));
    attributes.Put(lr);
    attributes.Put(new SwFormatHoriOrient(0, alignment));
    return this.wrtShell.RunNotificationTransaction(
      /** Groups table frame attributes in native history. @returns Whether applied. */
      () => {
        const undo = this.wrtShell.GetDoc().GetUndoManager();
        undo.StartUndo("Table Properties");
        try {
          return this.wrtShell.SetTableAttr(attributes);
        } finally {
          undo.EndUndo();
        }
      },
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
