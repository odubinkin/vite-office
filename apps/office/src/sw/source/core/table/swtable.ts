/** @fileoverview Implements the bounded SwTable, SwTableLine and SwTableBox graph from pinned swtable.cxx. */

import { SwTableBox, SwTableLine } from "./swtable-boxline";
export { SwTableBox, SwTableLine } from "./swtable-boxline";

import type { SwTableBoxStartNode, SwTableNode } from "../docnode/node";
import type { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwTabCols } from "../bastyp/tabcol";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SwTableBoxFormat as SwNativeTableBoxFormat } from "../../../inc/swtblfmt";
import type { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
import { RES_FRM_SIZE } from "../../../inc/hintids";
import { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
import { RES_BOX } from "../../../inc/hintids";
import { RES_COLLAPSING_BORDERS, RES_LAYOUT_SPLIT } from "../../../inc/hintids";
import { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";

/** Explicit table construction/transport values; geometry is in twips and headlines have a native owner. */
export interface SwTableFormat {
  readonly headerRows?: number | undefined;
  readonly repeatHeaderRows?: boolean | undefined;
  readonly width?: number | undefined;
  readonly horiOrient?: HoriOrientation | undefined;
  readonly align?: "left" | "center" | "right" | "margins" | undefined;
  readonly marginLeft?: number | undefined;
  readonly marginRight?: number | undefined;
  readonly marginTop?: number | undefined;
  readonly marginBottom?: number | undefined;
  readonly borderModel?: "collapsing" | "separating" | undefined;
  readonly layoutSplit?: boolean | undefined;
}

/** Bounded row geometry owned by SwTableLine. */
export interface SwTableLineFormatValue {
  readonly frameSize?: SwFormatFrameSize | undefined;
  readonly rowSplit?: SwFormatRowSplit | undefined;
}

/** Explicit construction/transport values; canonical cells own native SwTableBoxFormat item sets. */
export interface SwTableBoxFormat {
  readonly box?: SvxBoxItem | undefined;
  readonly vertOrient?: SwFormatVertOrient | undefined;
  readonly frameSize?: SwFormatFrameSize | undefined;
}

/** Creates Writer insertion border defaults without a CSS intermediary. @param borders - Default borders enabled. @returns Owned box item. */
export function createWriterTableBoxItem(borders: boolean): SvxBoxItem {
  const item = new SvxBoxItem(RES_BOX);
  item.SetAllDistances(borders ? 55 : 0);
  if (borders) for (const edge of [0, 1, 2, 3]) item.SetLine(new SvxBorderLine(0, 10), edge);
  return item;
}

/** Owns ordered rows, columns and a node-array section like upstream SwTable. */
export class SwTable extends SwClient {
  private m_bModifyLocked = false;
  private format: Omit<
    SwTableFormat,
    "width" | "borderModel" | "layoutSplit" | "headerRows" | "repeatHeaderRows"
  > = {};
  private rowsToRepeat = 1;
  public static readonly SEARCH_NONE = 0;
  public static readonly SEARCH_ROW = 1;
  public static readonly SEARCH_COL = 2;
  private readonly lines: SwTableLine[] = [];
  private readonly declaredColumnWidths: number[] = [];
  private readonly softPageBreakRows: number[] = [];

  /** Creates one table graph at its owning start node. @param tableNode - Node-array owner. @param name - ODF table name. @param format - Physical table geometry. @returns Nothing. */
  public constructor(
    private readonly tableNode: SwTableNode,
    name: string,
    format: SwTableFormat = {},
  ) {
    super();
    this.RegisterToModify(new SwFrameFormat(tableNode.GetDoc().GetAttrPool(), name));
    this.SetFormat(format);
  }

  /** Returns the native frame-format identity. @returns Original frame owner. */
  public GetFrameFormat(): SwFrameFormat {
    return this.GetRegisteredIn() as SwFrameFormat;
  }

  /** Suppresses general size reactions during native separator adjustment. @returns Nothing. */
  public LockModify(): void {
    this.m_bModifyLocked = true;
  }
  /** Completes the paired native table modify lock. @returns Nothing. */
  public UnlockModify(): void {
    this.m_bModifyLocked = false;
  }
  /** Reacts to original frame-size deltas without retaining borrowed items. @param source - Original frame owner. @param hint - Native borrowed hint. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "model-transaction") {
      for (const nested of hint.hints) this.SwClientNotify(source, nested);
      return;
    }
    let oldSize: SwFormatFrameSize | undefined, newSize: SwFormatFrameSize | undefined;
    if (hint.kind === "attr-set-change") {
      if (hint.m_pOld !== undefined && hint.m_pNew !== undefined) {
        newSize = hint.m_pNew.GetChgSet().GetItemIfSet(RES_FRM_SIZE, false) as
          SwFormatFrameSize | undefined;
        if (newSize !== undefined)
          oldSize = hint.m_pOld.GetChgSet().Get(RES_FRM_SIZE) as SwFormatFrameSize;
      }
    } else if (hint.kind === "legacy-modify" && hint.GetWhich() === RES_FRM_SIZE) {
      oldSize = hint.m_pOld as SwFormatFrameSize | undefined;
      newSize = hint.m_pNew as SwFormatFrameSize | undefined;
    } else if (hint.kind === "object-dying") this.CheckRegistration(hint);
    if (oldSize !== undefined && newSize !== undefined && !this.m_bModifyLocked)
      this.AdjustWidths(oldSize.GetWidth(), newSize.GetWidth());
  }
  /** Releases the original table client and only a final-client frame owner. @returns Nothing. */
  public override Dispose(): void {
    const format = this.GetRegisteredIn();
    super.Dispose();
    if (format !== undefined && !format.HasWriterListeners()) format.DisposeModify();
  }

  /** Returns the owning start node. @returns Table node. */
  public GetTableNode(): SwTableNode {
    return this.tableNode;
  }

  /** Returns the stable table name. @returns Name. */
  public GetName(): string {
    return this.GetFrameFormat().GetName();
  }

  /** Projects independent native state for construction, transport and history. @returns Detached boundary values. */
  public GetFormat(): SwTableFormat {
    const size = this.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false) as
      SwFormatFrameSize | undefined;
    const borders = this.GetFrameFormat()
      .GetAttrSet()
      .GetItemIfSet(RES_COLLAPSING_BORDERS, false) as SfxBoolItem | undefined;
    const split = this.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_LAYOUT_SPLIT, false) as
      SwFormatLayoutSplit | undefined;
    return {
      ...this.format,
      ...(size === undefined ? {} : { width: size.GetWidth() }),
      headerRows: this.rowsToRepeat,
      repeatHeaderRows: this.rowsToRepeat !== 0,
      ...(borders === undefined
        ? {}
        : { borderModel: borders.GetValue() ? "collapsing" : "separating" }),
      ...(split === undefined ? {} : { layoutSplit: split.GetValue() }),
    };
  }

  /** Reads native orientation, admitting historical ODF geometry at the table boundary. @returns Frame orientation. */
  public GetHoriOrient(): HoriOrientation {
    const width = this.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false);
    if (this.format.horiOrient !== undefined) return this.format.horiOrient;
    switch (this.format.align) {
      case "left":
        return width === undefined
          ? this.format.marginLeft !== undefined || this.format.marginRight !== undefined
            ? HoriOrientation.NONE
            : HoriOrientation.FULL
          : this.format.marginLeft !== undefined || this.format.marginRight !== undefined
            ? HoriOrientation.LEFT_AND_WIDTH
            : HoriOrientation.LEFT;
      case "center":
        return width === undefined ? HoriOrientation.FULL : HoriOrientation.CENTER;
      case "right":
        return width === undefined ? HoriOrientation.FULL : HoriOrientation.RIGHT;
      case "margins":
        return this.format.marginLeft !== undefined || this.format.marginRight !== undefined
          ? HoriOrientation.NONE
          : HoriOrientation.FULL;
      default:
        return HoriOrientation.FULL;
    }
  }

  /** Publishes represented frame-size changes to row/box width adjustment, as SwClientNotify does. @param value - New values. @returns Nothing. */
  public SetFormat(value: SwTableFormat): void {
    const { width, borderModel, layoutSplit, headerRows, repeatHeaderRows, ...geometry } = value;
    if (headerRows !== undefined || repeatHeaderRows !== undefined)
      this.SetRowsToRepeat(repeatHeaderRows === false ? 0 : (headerRows ?? this.rowsToRepeat));
    this.format = geometry;
    const format = this.GetFrameFormat();
    if (width === undefined) format.ResetFormatAttr(RES_FRM_SIZE);
    else {
      const size = format.GetFrameSize().Clone();
      size.SetWidth(width);
      format.SetFormatAttr(size);
    }
    if (borderModel === undefined) format.ResetFormatAttr(RES_COLLAPSING_BORDERS);
    else
      format.SetFormatAttr(new SfxBoolItem(RES_COLLAPSING_BORDERS, borderModel === "collapsing"));
    if (layoutSplit === undefined) format.ResetFormatAttr(RES_LAYOUT_SPLIT);
    else format.SetFormatAttr(new SwFormatLayoutSplit(layoutSplit));
  }

  /** Returns the native headline count capped by actual table lines. @returns Repeated line count. */
  public GetRowsToRepeat(): number {
    return Math.min(this.lines.length, this.rowsToRepeat);
  }

  /** Stores the native unsigned headline count independently of frame geometry and line count. @param count - Authored count. @returns Nothing. */
  public SetRowsToRepeat(count: number): void {
    this.rowsToRepeat = count & 0xffff;
  }

  /** Appends one defined column width. @param twips - Width in twips. @returns Nothing. */
  public AddColumnWidth(twips: number): void {
    this.declaredColumnWidths.push(twips);
  }

  /** Returns ordered column widths. @returns Widths in twips. */
  public GetColumnWidths(): readonly number[] {
    return this.lines.length === 0
      ? this.declaredColumnWidths
      : (this.lines[0] as SwTableLine).GetTabBoxes().map(
          /** Reads canonical first-row box widths for legacy column declarations. @param box - Original box. @returns Native width. */
          (box) => box.GetFrameSize().GetWidth(),
        );
  }

  /** Fills native flat-table separators using source integer scaling and fuzzy insertion. @param result - Existing frame edges and output entries. @param start - Actual current box. @param refreshHidden - Refresh visibility only. @param currentRowOnly - Omit other-row constraint scan. @returns Whether the box belongs to this table. */
  public GetTabCols(
    result: SwTabCols,
    start: SwTableBox,
    refreshHidden = false,
    currentRowOnly = false,
  ): boolean {
    if (
      !this.lines.some(
        /** Checks actual box ownership. @param line - Native row. @returns Whether connected. */ (
          line,
        ) => line.GetTabBoxes().includes(start),
      )
    )
      return false;
    const left = result.GetLeft(),
      actual = result.GetRight() - left;
    const wished =
      (
        this.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRM_SIZE) as
          SwFormatFrameSize | undefined
      )?.GetWidth() ??
      this.GetColumnWidths().reduce(
        /** Sums canonical box widths. @param sum - Prior width. @param width - Box width. @returns Total. */ (
          sum,
          width,
        ) => sum + width,
        0,
      );
    const positionsFor =
      /** Reads native cumulative box positions. @param line - Original row. @returns Source integer positions. */ (
        line: SwTableLine,
      ): number[] => {
        const positions = [0];
        let sum = 0;
        for (const box of line.GetTabBoxes()) {
          sum += box.GetFrameSize().GetWidth();
          positions.push(wished === 0 ? 0 : Math.trunc((sum * actual) / wished));
        }
        return positions;
      };
    const current = this.lines.find(
        /** Finds the actual current line. @param line - Original row. @returns Whether connected. */ (
          line,
        ) => line.GetTabBoxes().includes(start),
      ) as SwTableLine,
      positions = positionsFor(current);
    if (refreshHidden) {
      for (let i = 0; i < result.Count(); i++) {
        const entry = result.GetEntry(i);
        entry.nPos -= left;
        entry.nMin -= left;
        entry.nMax -= left;
        entry.bHidden = true;
      }
    } else result.Remove(0, result.Count());
    const insert =
      /** Merges source fuzzy visible/hidden boundaries. @param position - Relative native position. @param hidden - Other-row edge. @returns Nothing. */ (
        position: number,
        hidden: boolean,
      ): void => {
        if (refreshHidden) {
          for (let i = 0; i < result.Count(); i++)
            if (Math.abs(position - result.GetEntry(i).nPos) <= 20) {
              result.SetHidden(i, false);
              break;
            }
        } else {
          let index = 0;
          while (index < result.Count() && result.GetEntry(index).nPos < position) index++;
          const before = index > 0 ? result.GetEntry(index - 1).nPos : undefined;
          const after = index < result.Count() ? result.GetEntry(index).nPos : undefined;
          if (
            (before === undefined || position > before + 20) &&
            (after === undefined || position < (after >= 20 ? after - 20 : after))
          )
            result.Insert(position, hidden, index);
        }
      };
    for (const position of positions.slice(0, -1)) insert(position, false);
    if (!refreshHidden && !currentRowOnly) {
      for (const line of this.lines) {
        const edges = positionsFor(line);
        for (const position of edges.slice(0, -1)) insert(position, true);
        for (let column = 0; column < line.GetTabBoxes().length; column++) {
          const position = edges[column] as number,
            minimum = edges[Math.max(0, column - 1)] as number,
            maximum = edges[column + 1] as number;
          for (let i = 0; i < result.Count(); i++) {
            const entry = result.GetEntry(i),
              low = entry.nPos >= 20 ? entry.nPos - 20 : entry.nPos;
            if (position >= low && position <= entry.nPos + 20) {
              entry.nMin = Math.max(entry.nMin, minimum);
              entry.nMax = Math.min(entry.nMax, maximum);
            } else if (maximum >= low && maximum <= entry.nPos + 20)
              entry.nMin = Math.max(entry.nMin, position);
          }
        }
      }
    }
    if (!refreshHidden) result.Remove(0);
    for (let i = 0; i < result.Count(); i++) {
      const entry = result.GetEntry(i);
      entry.nPos += left;
      entry.nMin += left;
      entry.nMax += left;
    }
    return true;
  }

  /** Validates represented separator ingress before any frame normalization or history. @param next - Requested geometry. @param previous - Original geometry. @returns Nothing. */
  public ValidateTabCols(next: SwTabCols, previous: SwTabCols): void {
    const oldWidth = previous.GetRight() - previous.GetLeft(),
      newWidth = next.GetRight() - next.GetLeft();
    if (
      next.Count() !== previous.Count() ||
      !Number.isFinite(oldWidth) ||
      !Number.isFinite(newWidth) ||
      oldWidth <= 0 ||
      newWidth <= 0
    )
      throw new Error("Writer table column width is invalid.");
    let last = next.GetLeft();
    for (let i = 0; i <= next.Count(); i++) {
      const position = i === next.Count() ? next.GetRight() : next.GetEntry(i).nPos;
      if (!Number.isFinite(position) || position <= last)
        throw new Error("Writer table column width is invalid.");
      last = position;
    }
  }

  /** Applies native separator and edge changes to each original flat-table line. @param next - New frame geometry. @param previous - Original frame geometry. @param start - Actual current box. @param currentRowOnly - Adjust only the actual current unspanned line. @returns Whether admitted. */
  public SetTabCols(
    next: SwTabCols,
    previous: SwTabCols,
    start: SwTableBox,
    currentRowOnly: boolean,
  ): boolean {
    if (
      !this.lines.some(
        /** Checks actual box ownership. @param line - Native row. @returns Whether connected. */ (
          line,
        ) => line.GetTabBoxes().includes(start),
      )
    )
      return false;
    this.ValidateTabCols(next, previous);
    const oldWidth = previous.GetRight() - previous.GetLeft(),
      newWidth = next.GetRight() - next.GetLeft();
    const oldWish =
      (
        this.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRM_SIZE) as
          SwFormatFrameSize | undefined
      )?.GetWidth() ??
      this.GetColumnWidths().reduce(
        /** Sums canonical box widths. @param sum - Prior width. @param width - Box width. @returns Total. */ (
          sum,
          width,
        ) => sum + width,
        0,
      );
    let newWish = oldWish;
    if (previous.GetLeft() !== next.GetLeft() || previous.GetRight() !== next.GetRight()) {
      const leftDiff = Math.trunc(((previous.GetLeft() - next.GetLeft()) * oldWish) / oldWidth),
        rightDiff = Math.trunc(((next.GetRight() - previous.GetRight()) * oldWish) / oldWidth);
      newWish += leftDiff + rightDiff;
      if (newWish < 0) newWish = 65535;
      let orient = this.GetHoriOrient();
      if (orient !== HoriOrientation.NONE && orient !== HoriOrientation.CENTER) {
        const leftDistance = next.GetLeft() !== 0,
          rightDistance = next.GetRight() !== next.GetRightMax();
        if (!leftDistance && !rightDistance) orient = HoriOrientation.FULL;
        else if (!rightDistance && next.GetLeft() > 0) orient = HoriOrientation.RIGHT;
        else if (!leftDistance && next.GetRight() < next.GetRightMax())
          orient = HoriOrientation.LEFT;
        else if (orient !== HoriOrientation.FULL || Math.abs(oldWidth - newWidth) > 20)
          orient = HoriOrientation.LEFT_AND_WIDTH;
      }
      this.format = {
        ...this.format,
        marginLeft: next.GetLeft(),
        marginRight: next.GetRightMax() - next.GetRight(),
        horiOrient: orient,
        align: undefined,
      };
      if (newWish !== oldWish) {
        this.LockModify();
        try {
          const size = this.GetFrameFormat().GetFrameSize().Clone();
          size.SetWidth(newWish);
          size.SetWidthPercent(0);
          this.GetFrameFormat().SetFormatAttr(size);
        } finally {
          this.UnlockModify();
        }
      }
    }
    const changes: [number, number][] = [];
    for (let i = 0; i <= previous.Count(); i++) {
      const oldPosition =
        i === previous.Count() ? oldWidth : previous.GetEntry(i).nPos - previous.GetLeft();
      const newPosition = i === next.Count() ? newWidth : next.GetEntry(i).nPos - next.GetLeft();
      const oldBorder = Math.trunc((oldPosition * oldWish) / oldWidth),
        newBorder = Math.trunc((newPosition * newWish) / newWidth);
      if (oldBorder !== newBorder && oldBorder > 0 && newBorder > 0)
        changes.push([oldBorder & 0xffff, newBorder & 0xffff]);
    }
    if (changes.length === 0) return true;
    for (const line of this.lines) {
      if (currentRowOnly && !line.GetTabBoxes().includes(start)) continue;
      let change = 0,
        border = 0,
        rest = 0;
      for (const box of line.GetTabBoxes()) {
        const width = box.GetFrameSize().GetWidth();
        let newBoxWidth = width - rest;
        rest = 0;
        border += width;
        if (change < changes.length && border + 20 >= (changes[change] as [number, number])[0]) {
          border -= 20;
          while (change < changes.length && border > (changes[change] as [number, number])[0])
            change++;
          if (change < changes.length) {
            border += 20;
            if (border + 20 >= (changes[change] as [number, number])[0]) {
              rest = (changes[change] as [number, number])[1] - border;
              newBoxWidth += rest;
              change++;
            }
          }
        }
        if (newBoxWidth !== width) {
          if (newBoxWidth < 0) {
            rest += 1 - newBoxWidth;
            newBoxWidth = 1;
          }
          const size = box.GetFrameSize();
          size.SetWidth(newBoxWidth);
          box.SetFrameSize(size);
        }
      }
    }
    return true;
  }

  /** Changes one existing column's physical width. @param index - Zero-based column. @param twips - Positive width. @returns Nothing. */
  public SetColumnWidth(index: number, twips: number): void {
    if (
      index < 0 ||
      index >= this.GetColumnWidths().length ||
      !Number.isFinite(twips) ||
      twips <= 0
    )
      throw new Error("Writer table column width is invalid.");
    if (this.lines.length === 0) this.declaredColumnWidths[index] = twips;
    for (const line of this.lines) {
      const box = line.GetTabBoxes()[index] as SwTableBox,
        size = box.GetFrameSize();
      size.SetWidth(twips);
      box.SetFrameSize(size);
    }
  }

  /** Adds one row at its native table position. @param line - Row. @param index - Insertion position. @returns Nothing. */
  public AddLine(line: SwTableLine, index = this.lines.length): void {
    const widths = this.GetColumnWidths();
    line.GetTabBoxes().forEach(
      /** Initializes native box size from builder declarations without overwriting authored values. @param box - Native box. @param column - Declaration index. @returns Nothing. */
      (box, column) => {
        if (
          box.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRM_SIZE, false) === undefined &&
          widths[column] !== undefined
        ) {
          const size = box.GetFrameSize();
          size.SetWidth(widths[column] as number);
          box.SetFrameSize(size);
        }
      },
    );
    this.lines.splice(index, 0, line);
  }

  /** Inserts counted flat rows from the selected native edge, as in swnewtable.cxx. @param document - Owning document. @param boxes - Actual selected boxes. @param count - Native unsigned row count. @param behind - Select the trailing edge. @param insertDummy - Native tracked-change policy, unrepresented locally. @returns Whether inserted. */
  public InsertRow(
    document: SwDoc,
    boxes: readonly SwTableBox[],
    count = 1,
    behind = true,
    insertDummy = true,
  ): boolean {
    void insertDummy;
    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 0xffff ||
      boxes.length === 0 ||
      this.tableNode.GetNodes() !== document.GetNodes()
    )
      return false;
    const selected = boxes.map(
      /** Locates an original box in the native row vector. @param box - Selected box. @returns Row index. */
      (box) =>
        this.lines.findIndex(
          /** Tests actual ownership. @param line - Native row. @returns Whether the box belongs. */
          (line) => line.GetTabBoxes().includes(box),
        ),
    );
    if (selected.includes(-1)) return false;
    const row = behind ? Math.max(...selected) : Math.min(...selected),
      source = this.lines[row] as SwTableLine,
      index = row + (behind ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const section = document.GetNodes().PrepareTableRow(this, source);
      source.GetTabBoxes().forEach(
        /** Transfers native TOP border according to row insertion direction. @param box - Original source box. @param column - Actual row coordinate. @returns Nothing. */
        (box, column) => {
          const noTop = box.GetBox();
          if (noTop.GetTop() === undefined) return;
          noTop.SetLine(undefined, 0);
          const target = behind ? (section.line.GetTabBoxes()[column] as SwTableBox) : box;
          target.ClaimFrameFormat().SetFormatAttr(noTop);
        },
      );
      document.GetNodes().InsertTableRow(this, section, index + i);
    }
    return true;
  }

  /** Assigns shared ingress dimensions to the original native box items. @param widths - Reference widths including native zero values. @returns Nothing. */
  public SetColumnWidths(widths: readonly number[]): void {
    if (this.lines.length === 0)
      this.declaredColumnWidths.splice(0, this.declaredColumnWidths.length, ...widths);
    else
      for (const line of this.lines)
        line.GetTabBoxes().forEach(
          /** Assigns native dimensions without applying positive UI width admission. @param box - Original box. @param index - Column. @returns Nothing. */
          (box, index) => {
            const width = widths[index];
            if (width === undefined) return;
            const size = box.GetFrameSize();
            size.SetWidth(width);
            box.SetFrameSize(size);
          },
        );
  }
  /** Scales every native line independently as lcl_ModifyBoxes does. @param oldWidth - Old table width. @param newWidth - Requested width. @returns Nothing. */
  public AdjustWidths(oldWidth: number, newWidth: number): void {
    const sharedFormats = new Set<SwNativeTableBoxFormat>();
    for (const line of this.lines) {
      let originalSum = 0,
        sum = 0;
      for (const box of line.GetTabBoxes()) {
        const format = box.GetFrameFormat(),
          size = format.GetFrameSize();
        originalSum += size.GetWidth();
        let boxWidth = Math.trunc(
          oldWidth === 0 ? size.GetWidth() * newWidth : (size.GetWidth() * newWidth) / oldWidth,
        );
        const wished =
          Math.trunc(
            oldWidth === 0 ? originalSum * newWidth : (originalSum * newWidth) / oldWidth,
          ) - sum;
        if (wished > 0) {
          if (boxWidth === wished) sharedFormats.add(format);
          else {
            boxWidth = wished;
            const claimed = box.ClaimFrameFormat();
            claimed.LockModify();
            try {
              claimed.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, boxWidth, 0));
            } finally {
              claimed.UnlockModify();
            }
          }
        }
        sum += boxWidth;
      }
    }
    for (const format of sharedFormats) {
      const width = format.GetFrameSize().GetWidth();
      const scaled = Math.trunc(oldWidth === 0 ? width * newWidth : (width * newWidth) / oldWidth);
      format.LockModify();
      try {
        format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Variable, scaled, 0));
      } finally {
        format.UnlockModify();
      }
    }
  }
  /** Enters native new-model column insertion. @param document - Owner. @param boxes - Expanded actual column boxes. @param count - Native unsigned count. @param behind - Trailing edge. @param insertDummy - Native redline policy. @returns Whether inserted. */
  public InsertCol(
    document: SwDoc,
    boxes: readonly SwTableBox[],
    count = 1,
    behind = true,
    insertDummy = true,
  ): boolean {
    return this.NewInsertCol(document, boxes, count, behind, insertDummy);
  }
  /** Inserts flat columns while conserving the existing native reference width. @param document - Owner. @param boxes - Actual boxes covering every row. @param count - Native count. @param behind - Trailing edge. @param insertDummy - Redline policy, unrepresented locally. @returns Whether inserted. */
  private NewInsertCol(
    document: SwDoc,
    boxes: readonly SwTableBox[],
    count: number,
    behind: boolean,
    insertDummy: boolean,
  ): boolean {
    void insertDummy;
    if (
      !Number.isInteger(count) ||
      count < 1 ||
      count > 0xffff ||
      boxes.length === 0 ||
      this.lines.length === 0 ||
      this.tableNode.GetNodes() !== document.GetNodes()
    )
      return false;
    const positions: number[] = [];
    let addWidth = 0;
    for (const line of this.lines) {
      const selected: number[] = [];
      line.GetTabBoxes().forEach(
        /** Collects original selected columns and widths. @param box - Actual box. @param column - Native coordinate. @returns Nothing. */
        (box, column) => {
          if (boxes.includes(box)) {
            selected.push(column);
            addWidth += box.GetFrameSize().GetWidth();
          }
        },
      );
      if (selected.length === 0) return false;
      positions.push(behind ? Math.max(...selected) : Math.min(...selected));
    }
    if (
      boxes.some(
        /** Rejects foreign box identities. @param box - Selected box. @returns Whether foreign. */
        (box) =>
          !this.lines.some(
            /** Finds a native original owner. @param line - Row. @returns Whether owned. */
            (line) => line.GetTabBoxes().includes(box),
          ),
      )
    )
      return false;
    const tableWidth = this.GetColumnWidths().reduce(
      /** Adds native reference widths. @param sum - Prior sum. @param width - Native width. @returns Total. */
      (sum, width) => sum + width,
      0,
    );
    addWidth = Math.trunc(addWidth / this.lines.length) * count;
    const resultingWidth = tableWidth + addWidth;
    if (resultingWidth === 0) return false;
    const newBoxWidth = Math.trunc(Math.trunc((addWidth * tableWidth) / resultingWidth) / count);
    addWidth = newBoxWidth * count;
    if (addWidth === 0 || addWidth >= tableWidth) return false;
    this.AdjustWidths(tableWidth, tableWidth - addWidth);
    this.lines.forEach(
      /** Inserts native boxes using each row's source attributes. @param line - Original row. @param row - Coordinate. @returns Nothing. */
      (line, row) => {
        const sourceColumn = positions[row] as number,
          source = line.GetTabBoxes()[sourceColumn] as SwTableBox,
          index = sourceColumn + (behind ? 1 : 0),
          noRightBorder = source.GetBox();
        const hasRightBorder = noRightBorder.GetRight() !== undefined;
        if (hasRightBorder) noRightBorder.SetLine(undefined, 3);
        for (let i = 0; i < count; i++) {
          const section = document.GetNodes().PrepareTableBox(this, source),
            size = section.box.GetFrameSize();
          size.SetWidth(newBoxWidth);
          section.box.SetFrameSize(size);
          if (hasRightBorder && (!behind || i + 1 < count))
            section.box.ClaimFrameFormat().SetFormatAttr(noRightBorder);
          document.GetNodes().InsertTableBox(this, line, section, index + i);
        }
        if (behind && hasRightBorder) source.ClaimFrameFormat().SetFormatAttr(noRightBorder);
      },
    );
    return true;
  }

  /** Removes a retained row during native table history. @param line - Connected row. @returns Nothing. */
  public RemoveLine(line: SwTableLine): void {
    const index = this.lines.indexOf(line);
    if (index < 0) throw new Error("Writer table row is not connected.");
    this.lines.splice(index, 1);
  }

  /** Returns ordered rows. @returns Rows. */
  public GetTabLines(): readonly SwTableLine[] {
    return this.lines;
  }

  /** Resolves a connected native box by its section start index. @param startIndex - Native node coordinate. @returns Actual box or undefined. */
  public GetTableBox(startIndex: number): SwTableBox | undefined {
    for (const line of this.lines)
      for (const box of line.GetTabBoxes())
        if (box.GetStartNode().GetIndex() === startIndex) return box;
    return undefined;
  }

  /** Collects flat cells by native center and majority overlap. @param line - Original row. @param min - Left search border. @param max - Right search border. @param selected - Native identity set. @returns Nothing. */
  private SearchSelection(
    line: SwTableLine,
    min: number,
    max: number,
    selected: Set<SwTableBox>,
  ): void {
    let left = 0,
      right = 0;
    const mid = Math.trunc((max + min) / 2);
    for (const box of line.GetTabBoxes()) {
      right += box.GetFrameSize().GetWidth();
      if (right > min) {
        const add =
          right <= max
            ? left >= min || right >= mid || right - min > min - left
            : left <= mid || right - max < max - left;
        if (add) selected.add(box);
      }
      if (right >= max) break;
      left = right;
    }
  }

  /** Collects original boxes by physical endpoint borders from swnewtable.cxx. @param start - First endpoint section. @param end - Other endpoint section. @param boxes - Replaced sorted selection. @param search - Physical range or complete rows/columns. @returns Nothing. */
  public CreateSelection(
    start: SwTableBoxStartNode,
    end: SwTableBoxStartNode,
    boxes: SwTableBox[],
    search: 0 | 1 | 2,
  ): void {
    boxes.length = 0;
    const endpoints: { row: number; min: number; max: number }[] = [],
      selected = new Set<SwTableBox>();
    for (const [row, line] of this.lines.entries()) {
      let right = 0;
      for (const box of line.GetTabBoxes()) {
        const left = right;
        right += box.GetFrameSize().GetWidth();
        if (box.GetStartNode() === start || box.GetStartNode() === end) {
          boxes.push(box);
          selected.add(box);
          endpoints.push({ row, min: left, max: right });
          if (start === end) endpoints.push({ row, min: left, max: right });
        }
      }
    }
    if (endpoints.length !== 2) return;
    const first = endpoints[0] as { row: number; min: number; max: number },
      last = endpoints[1] as { row: number; min: number; max: number };
    if (search === SwTable.SEARCH_ROW) {
      for (let row = first.row; row <= last.row; row++)
        for (const box of (this.lines[row] as SwTableLine).GetTabBoxes()) selected.add(box);
    } else {
      const minWidth = Math.min(first.max - first.min, last.max - last.min),
        overlap = Math.min(first.max, last.max) - Math.max(first.min, last.min);
      if (first.row === last.row || overlap + overlap < minWidth) {
        first.min = last.min = Math.min(first.min, last.min);
        first.max = last.max = Math.max(first.max, last.max);
      }
      if (search === SwTable.SEARCH_COL)
        for (let row = 0; row < first.row; row++)
          this.SearchSelection(this.lines[row] as SwTableLine, first.min, first.max, selected);
      for (let row = first.row; row <= last.row; row++)
        this.SearchSelection(
          this.lines[row] as SwTableLine,
          Math.min(first.min, last.min),
          Math.max(first.max, last.max),
          selected,
        );
      if (search === SwTable.SEARCH_COL)
        for (let row = last.row + 1; row < this.lines.length; row++)
          this.SearchSelection(this.lines[row] as SwTableLine, last.min, last.max, selected);
    }
    boxes.length = 0;
    for (const line of this.lines)
      for (const box of line.GetTabBoxes()) if (selected.has(box)) boxes.push(box);
  }

  /** Stores the table-owned soft pagination hint. @returns Nothing. */
  public AddSoftPageBreak(): void {
    this.softPageBreakRows.push(this.lines.length);
  }

  /** Returns the table-owned soft pagination hint. @returns Whether present. */
  public GetSoftPageBreakRows(): readonly number[] {
    return this.softPageBreakRows;
  }
}
