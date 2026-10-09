/** @fileoverview Formats represented horizontal table print areas from native SwTabFrame::Format. */
import type { SwTable, SwTableBox, SwTableLine } from "../table/swtable";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { LegacyModifyHint, BroadcastingModify, type SwModify } from "../../../inc/calbck";
import { SwFrame, SwLayoutFrame, SwFrameType } from "./wsfrm";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { RES_FRM_SIZE, RES_ROW_SPLIT, RES_VERT_ORIENT } from "../../../inc/hintids";
import type { SwModelHint } from "../../../inc/hints";

/** Owns represented flat-row height over its original native line. */
export class SwRowFrame extends SwLayoutFrame {
  /** Binds the actual row owner. @param line - Original native line. @returns Nothing. */
  public constructor(private readonly line: SwTableLine) {
    super(line.GetFrameFormat());
    this.mnFrameType = SwFrameType.Row;
    let previous: SwCellFrame | undefined;
    for (const box of line.GetTabBoxes()) {
      const frame = new SwCellFrame(box);
      frame.InsertBehind(this, previous);
      previous = frame;
    }
  }
  /** Releases the frame and deletes its format only when no represented clients remain. @returns Nothing. */
  public override DestroyImpl(): void {
    const format = this.GetRegisteredIn();
    super.Dispose();
    if (format !== undefined && !format.HasWriterListeners()) format.DisposeModify();
    super.DestroyImpl();
  }
  /** Ends native frame lifetime through the original destruction body. @returns Nothing. */
  public override Dispose(): void {
    this.DestroyImpl();
  }
  /** Forwards the exact native size/split item to the layout frame. @param item - Borrowed accepted pool item. @returns Nothing. */
  protected OnFrameSize(item: SfxPoolItem): void {
    const table = this.FindTabFrame();
    if (table && !this.GetNext()) table.InvalidatePos();
    const source = new BroadcastingModify();
    super.SwClientNotify(source, new LegacyModifyHint(undefined, item));
  }
  /** Follows only original-row change and history movement hints. @param source - Emitting native owner. @param hint - Typed native notification. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "model-transaction") {
      for (const nested of hint.hints) this.SwClientNotify(source, nested);
    } else if (hint.kind === "table-line-format-changed") {
      if (hint.m_rTabLine !== this.line) return;
      this.RegisterToFormat(hint.m_rNewFormat);
      this.InvalidateSize();
      this.InvalidatePrt_();
      this.SetCompletePaint();
      this.ReinitializeFrameSizeAttrFlags();
    } else if (hint.kind === "move-table-line") {
      if (hint.m_rTableLine !== this.line) return;
      this.RegisterToFormat(hint.m_rNewFormat);
      this.InvalidateAll();
      this.ReinitializeFrameSizeAttrFlags();
    } else if (hint.kind === "attr-set-change") {
      const changed = hint.m_pNew?.GetChgSet();
      const item =
        changed?.GetItemIfSet(RES_FRM_SIZE, false) ?? changed?.GetItemIfSet(RES_ROW_SPLIT, false);
      if (item) this.OnFrameSize(item);
      else super.SwClientNotify(source, hint);
    } else if (hint.kind === "legacy-modify") {
      if (!hint.m_pNew) super.SwClientNotify(source, hint);
      else if (hint.m_pNew.Which() === RES_FRM_SIZE || hint.m_pNew.Which() === RES_ROW_SPLIT)
        this.OnFrameSize(hint.m_pNew);
    }
  }
  /** Reads the original row owner. @returns Native line. */
  public GetTabLine(): SwTableLine {
    return this.line;
  }
  /** Reads the native fixed-height flag. @returns Whether fixed. */
  public HasFixSize(): boolean {
    return this.GetFormat().GetFrameSize().GetHeightSizeType() === SwFrameSize.Fixed;
  }
  /** Resolves represented native row height from the complete item and device content extent. @param contentHeight - Measured content height in twips. @returns Authored fixed height, minimum floor or natural content height. */
  public Format(contentHeight: number): number {
    const size = this.GetFormat().GetFrameSize();
    if (size.GetHeightSizeType() === SwFrameSize.Fixed) return size.GetHeight();
    return size.GetHeightSizeType() === SwFrameSize.Minimum
      ? Math.max(size.GetHeight(), contentHeight)
      : contentHeight;
  }
}

/** Native cell frame retains and registers its original model box. */
export class SwCellFrame extends SwLayoutFrame {
  /** Registers at the original native box format. @param box - Original cell model. @returns Nothing. */
  public constructor(private readonly box: SwTableBox) {
    super(box.GetFrameFormat());
    this.mnFrameType = SwFrameType.Cell;
  }
  /** Reads the original cell identity. @returns Native box. */
  public GetTabBox(): SwTableBox {
    return this.box;
  }
  /** Releases this frame and any represented lowers, deleting only a final-client format. @returns Nothing. */
  public override DestroyImpl(): void {
    const format = this.GetRegisteredIn();
    super.Dispose();
    if (format !== undefined && !format.HasWriterListeners()) format.DisposeModify();
    super.DestroyImpl();
  }
  /** Ends native frame lifetime through its destruction body. @returns Nothing. */
  public override Dispose(): void {
    this.DestroyImpl();
  }
  /** Follows only hints naming its original native cell. @param source - Original emitting format. @param hint - Native notification. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "model-transaction") {
      for (const nested of hint.hints) this.SwClientNotify(source, nested);
    } else if (hint.kind === "table-box-format-changed") {
      if (hint.m_rTableBox !== this.box) return;
      this.RegisterToFormat(hint.m_rNewFormat);
      this.InvalidateSize();
      this.InvalidatePrt_();
      this.SetCompletePaint();
    } else if (hint.kind === "move-table-box") {
      if (hint.m_rTableBox !== this.box) return;
      this.RegisterToFormat(hint.m_rNewFormat);
      this.InvalidateAll();
      this.ReinitializeFrameSizeAttrFlags();
    } else {
      const orientation =
        hint.kind === "legacy-modify"
          ? hint.m_pNew?.Which() === RES_VERT_ORIENT
            ? hint.m_pNew
            : undefined
          : hint.kind === "attr-set-change"
            ? hint.m_pNew?.GetChgSet().GetItemIfSet(RES_VERT_ORIENT, false)
            : undefined;
      if (orientation) {
        this.SetCompletePaint();
        this.InvalidatePrt();
      }
      super.SwClientNotify(source, hint);
    }
  }
}

/** Table print bounds relative to its upper frame, in twips. */
export interface SwTablePrintArea {
  readonly left: number;
  readonly right: number;
  readonly width: number;
}

/** Physical frame bounds measured by the device, never a document content projection. */
export interface SwTableMouseRect {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}
/** Device cell frame retains its actual native box owner. */
export interface SwTableMouseCell {
  readonly box: SwTableBox;
  readonly rect: SwTableMouseRect;
  readonly repeatedHeadline?: boolean;
}
/** One master or follow frame's physical device geometry. */
export interface SwTableMouseGeometry {
  /** Actual device page-frame origin for native relative row coordinates. */
  readonly pageTop?: number;
  /** Native split-last-row flag; represented whole rows have no follow flow line. */
  readonly hasFollowFlowLine?: boolean;
  readonly rect: SwTableMouseRect;
  readonly cells: readonly SwTableMouseCell[];
  readonly previous?: SwTableMouseRect;
}

/** Owns horizontal print geometry over the actual canonical table. */
export class SwTabFrame extends SwLayoutFrame {
  /** Binds this layout frame to its original table. @param table - Canonical table. @param mouseGeometry - Optional live device frames. @returns Nothing. */
  public constructor(
    private readonly table: SwTable,
    public readonly mouseGeometry?: SwTableMouseGeometry,
  ) {
    super(table.GetFrameFormat());
    this.mnFrameType = SwFrameType.Tab;
    let previous: SwRowFrame | undefined;
    for (const line of table.GetTabLines()) {
      const row = new SwRowFrame(line);
      if (row.Lower()) {
        row.InsertBehind(this, previous);
        previous = row;
      } else SwFrame.DestroyFrame(row);
    }
  }
  /** Releases the complete native table lower hierarchy. @returns Nothing. */
  public override Dispose(): void {
    this.DestroyImpl();
  }

  /** Returns the canonical table represented by this frame. @returns Actual owner. */
  public GetTable(): SwTable {
    return this.table;
  }

  /** Resolves an actual box reference width against this table's print area. @param box - Original box. @param upperWidth - Upper print width. @returns Device-neutral print width in twips. */
  public GetBoxPrintWidth(box: SwTableBox, upperWidth: number): number {
    const wished =
      this.table.GetFormat().width ??
      this.table
        .GetColumnWidths()
        .reduce(
          /** Adds original native reference widths. @param sum - Prior width. @param width - Box width. @returns Total. */ (
            sum,
            width,
          ) => sum + width,
          0,
        );
    for (let row = this.Lower(); row !== undefined; row = row.GetNext())
      for (let lower = (row as SwRowFrame).Lower(); lower !== undefined; lower = lower.GetNext()) {
        const cell = lower as SwCellFrame;
        if (cell.GetTabBox() === box)
          return wished === 0
            ? 0
            : (cell.GetFormat().GetFrameSize().GetWidth() * this.Format(upperWidth).width) / wished;
      }
    return 0;
  }

  /** Reads the native table-frame split item with its true default. @returns Whether table rows may occupy follow frames. */
  public IsLayoutSplitAllowed(): boolean {
    return this.table.GetFormat().layoutSplit ?? true;
  }

  /** Resolves native orientation spacing without fly or outer-border offsets. @param upperWidth - Actual upper print width. @returns Table print area. */
  public Format(upperWidth: number): SwTablePrintArea {
    const format = this.table.GetFormat();
    const wished = Math.min(
      65535,
      Math.max(this.table.GetColumnWidths().length * 23, format.width ?? 0),
    );
    let left = 0;
    let right = 0;
    const orient = this.table.GetHoriOrient();
    if (orient === HoriOrientation.NONE) {
      left = format.marginLeft ?? 0;
      right = format.marginRight ?? 0;
    } else {
      switch (orient) {
        case HoriOrientation.LEFT_AND_WIDTH:
          left = format.marginLeft ?? 0;
          right = upperWidth - left - wished;
          break;
        case HoriOrientation.LEFT:
          right = upperWidth - wished;
          break;
        case HoriOrientation.CENTER:
          left = right = Math.trunc((upperWidth - wished) / 2);
          break;
        case HoriOrientation.RIGHT:
          left = upperWidth - wished;
          break;
      }
    }
    if (upperWidth - 23 < left + right) left = right = 0;
    return Object.freeze({ left, right, width: upperWidth - left - right });
  }
}
