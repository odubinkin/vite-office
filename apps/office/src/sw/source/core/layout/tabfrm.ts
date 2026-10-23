/** @fileoverview Formats represented horizontal table print areas from native SwTabFrame::Format. */
import { SwFrameAreaDefinition } from "../inc/frame";
import type { SwDoc } from "../doc/doc";
import { SwTableNode } from "../docnode/node";
import type { SwTable, SwTableBox, SwTableLine } from "../table/swtable";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize, type SwFormatFrameSize } from "../../../inc/fmtfsize";
import {
  LegacyModifyHint,
  BroadcastingModify,
  type SwModify,
  SwClient,
  SwIterator,
} from "../../../inc/calbck";
import { SwFlowFrame } from "./flowfrm";
import { SwFrame, SwLayoutFrame, SwFrameType } from "./wsfrm";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import {
  RES_FRM_SIZE,
  RES_ROW_SPLIT,
  RES_VERT_ORIENT,
  RES_BOX,
  RES_COLLAPSING_BORDERS,
  RES_HORI_ORIENT,
  RES_UL_SPACE,
  RES_BREAK,
  RES_LAYOUT_SPLIT,
} from "../../../inc/hintids";
import { AttrSetChangeHint, SwAttrSetChg, type SwModelHint } from "../../../inc/hints";
import type { SwFormatLayoutSplit } from "../../../inc/fmtlsplt";
import type { SfxBoolItem } from "../../../../svl/source/items/cenumitm";

/** Native table invalidation mask from tabfrm.hxx; root browse-width propagation remains unrepresented. */
export enum SwTabFrameInvFlags {
  NONE = 0x00,
  InvalidatePrt = 0x02,
  InvalidateIndNextPrt = 0x04,
  InvalidatePrevPrt = 0x08,
  SetIndNextCompletePaint = 0x10,
  InvalidateBrowseWidth = 0x20,
  InvalidatePos = 0x40,
  InvalidateNextPos = 0x80,
}

/** Invalidates original layout lowers for native collapsing-border recalculation. @param frame - Original layout owner. @returns Nothing. */
function lcl_InvalidateAllLowersPrt(frame: SwLayoutFrame): void {
  frame.InvalidatePrt_();
  frame.InvalidateSize_();
  frame.SetCompletePaint();
  for (let lower = frame.Lower(); lower !== undefined; lower = lower.GetNext()) {
    if (lower instanceof SwLayoutFrame) lcl_InvalidateAllLowersPrt(lower);
    else {
      lower.InvalidatePrt_();
      lower.InvalidateSize_();
      lower.SetCompletePaint();
    }
  }
}

/** Owns represented flat-row height over its original native line. */
export class SwRowFrame extends SwLayoutFrame {
  /** Binds the actual row owner and original root-bearing sibling. @param line - Original native line. @param sibling - Existing native layout frame. @returns Nothing. */
  public constructor(
    private readonly line: SwTableLine,
    sibling?: SwFrame,
  ) {
    super(line.GetFrameFormat(), sibling);
    this.mnFrameType = SwFrameType.Row;
    let previous: SwCellFrame | undefined;
    for (const box of line.GetTabBoxes()) {
      const frame = new SwCellFrame(box, this);
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
    const height =
      size.GetHeightSizeType() === SwFrameSize.Fixed
        ? size.GetHeight()
        : size.GetHeightSizeType() === SwFrameSize.Minimum
          ? Math.max(size.GetHeight(), contentHeight)
          : contentHeight;
    const area = new SwFrameAreaDefinition.FrameAreaWriteAccess(this.areaDefinition);
    try {
      area.Height(height);
    } finally {
      area.Dispose();
    }
    const print = new SwFrameAreaDefinition.FramePrintAreaWriteAccess(this.areaDefinition);
    try {
      print.Left(0);
      print.Top(0);
      print.Width(this.getFrameArea().Width());
      print.Height(height);
    } finally {
      print.Dispose();
    }
    return height;
  }
}

/** Native cell frame retains and registers its original model box. */
export class SwCellFrame extends SwLayoutFrame {
  /** Registers at the original native box format with its root-bearing sibling. @param box - Original cell model. @param sibling - Existing native layout frame. @returns Nothing. */
  public constructor(
    private readonly box: SwTableBox,
    sibling?: SwFrame,
  ) {
    super(box.GetFrameFormat(), sibling);
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
      const table = this.FindTabFrame();
      if (table?.IsCollapsingBorders()) {
        const row = this.GetUpper() as SwLayoutFrame;
        row.InvalidateSize_();
        row.InvalidatePrt_();
      }
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
      const box =
        hint.kind === "legacy-modify"
          ? hint.m_pNew?.Which() === RES_BOX
            ? hint.m_pNew
            : undefined
          : hint.kind === "attr-set-change"
            ? hint.m_pNew?.GetChgSet().GetItemIfSet(RES_BOX, false)
            : undefined;
      if (box) {
        let row = this.GetUpper();
        while (row?.GetUpper() && !row.GetUpper()?.IsTabFrame()) row = row.GetUpper();
        const table = row?.GetUpper();
        if (table?.IsTabFrame() && (table as SwTabFrame).IsCollapsingBorders()) {
          lcl_InvalidateAllLowersPrt(row as SwLayoutFrame);
          const next = row?.GetNext();
          if (next) lcl_InvalidateAllLowersPrt(next as SwRowFrame);
          else table.InvalidatePrt();
        }
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
  /** Optional browser device geometry, supplied independently of the native constructor. */
  public mouseGeometry: SwTableMouseGeometry | undefined;
  private readonly table: SwTable;
  private readonly flow: SwFlowFrame;
  /** Binds an original table master or inserts an original native follow without lower copying. @param table - Model table or original table frame. @param sibling - Root-bearing original frame for master construction. @returns Nothing. */
  public constructor(table: SwTable | SwTabFrame, sibling?: SwFrame) {
    super(
      table instanceof SwTabFrame ? table.GetFormat() : table.GetFrameFormat(),
      table instanceof SwTabFrame ? table : sibling,
    );
    this.table = table instanceof SwTabFrame ? table.GetTable() : table;
    this.flow = new SwFlowFrame(this);
    this.mnFrameType = SwFrameType.Tab;
    if (table instanceof SwTabFrame) {
      this.SetFollow(table.GetFollow());
      table.SetFollow(this);
    } else {
      let previous: SwRowFrame | undefined;
      for (const line of table.GetTabLines()) {
        const row = new SwRowFrame(line, this);
        if (row.Lower()) {
          row.InsertBehind(this, previous);
          previous = row;
        } else SwFrame.DestroyFrame(row);
      }
    }
  }
  /** Reads the next original native table flow frame. @returns Original follow or absent. */
  public GetFollow(): SwTabFrame | undefined {
    return this.flow.GetFollow()?.m_rThis as SwTabFrame | undefined;
  }
  /** Reads the original native predecessor. @returns Original preceding table frame or absent. */
  public GetPrecede(): SwTabFrame | undefined {
    return this.flow.GetPrecede()?.m_rThis as SwTabFrame | undefined;
  }
  /** Tests original native follow ownership. @returns Whether a follow exists. */
  public HasFollow(): boolean {
    return this.flow.HasFollow();
  }
  /** Classifies original native predecessor ownership. @returns Whether this is a follow. */
  public IsFollow(): boolean {
    return this.flow.IsFollow();
  }
  /** Re-chains original table frames through the existing native flow component. @param follow - Original next table flow frame. @returns Nothing. */
  public SetFollow(follow: SwTabFrame | undefined): void {
    this.flow.SetFollow(follow?.flow);
  }
  /** Finds the original registered table predecessor or the first native master in its actual chain. @param firstMaster - Follow source first-master mode instead of immediate predecessor. @returns Original master or lost link. */
  public FindMaster(firstMaster = false): SwTabFrame | undefined {
    let result: SwTabFrame | undefined;
    writerClients0: for (const client of new SwIterator(SwClient, this.table.GetFrameFormat())) {
      if (!(client instanceof SwTabFrame)) continue writerClients0;
      if (firstMaster) {
        if (!client.IsFollow()) {
          for (
            let next: SwTabFrame | undefined = client;
            next !== undefined;
            next = next.GetFollow()
          ) {
            if (next.GetFollow() === this) {
              result = client;
              break writerClients0;
            }
          }
        }
      } else if (client.GetFollow() === this) {
        result = client;
        break writerClients0;
      }
      continue writerClients0;
    }
    return result;
  }
  /** Releases original lowers and registration, then detaches flow neighbors without stitching. @returns Nothing. */
  public override DestroyImpl(): void {
    super.DestroyImpl();
    this.flow.DestroyImpl();
  }
  /** Releases the complete native table lower hierarchy. @returns Nothing. */
  public override Dispose(): void {
    this.DestroyImpl();
  }

  /** Reads the native effective collapsing-border item. @returns Owned, inherited or pooled bool. */
  public IsCollapsingBorders(): boolean {
    return (this.GetFormat().GetAttrSet().Get(RES_COLLAPSING_BORDERS) as SfxBoolItem).GetValue();
  }

  /** Routes native table deltas through copied consumption before generic residual handling. @param source - Original broadcaster. @param hint - Borrowed notification. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "model-transaction") {
      for (const nested of hint.hints) this.SwClientNotify(source, nested);
    } else if (hint.kind === "attr-set-change") {
      let flags = SwTabFrameInvFlags.NONE;
      if (hint.m_pOld && hint.m_pNew) {
        const oldItems = hint.m_pOld.GetChgSet().entries(),
          newItems = hint.m_pNew.GetChgSet().entries(),
          oldSet = new SwAttrSetChg(hint.m_pOld),
          newSet = new SwAttrSetChg(hint.m_pNew);
        let index = 0;
        do {
          flags = this.UpdateAttr_(oldItems[index], newItems[index], flags, oldSet, newSet);
          index += 1;
        } while (index < newItems.length);
        if (oldSet.Count() || newSet.Count())
          super.SwClientNotify(source, new AttrSetChangeHint(oldSet, newSet));
      }
      this.Invalidate(flags);
    } else if (hint.kind === "legacy-modify") {
      this.Invalidate(this.UpdateAttr_(hint.m_pOld, hint.m_pNew, SwTabFrameInvFlags.NONE));
    }
  }

  /** Accumulates represented native table reactions and consumes only copy-owned deltas. @param oldItem - Original previous item. @param newItem - Original accepted item. @param flags - Table mask. @param oldSet - Optional copied old descriptor. @param newSet - Optional copied new descriptor. @returns Updated table mask. */
  protected UpdateAttr_(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    flags: SwTabFrameInvFlags,
    oldSet?: SwAttrSetChg,
    newSet?: SwAttrSetChg,
  ): SwTabFrameInvFlags {
    const which = oldItem ? oldItem.Which() : newItem ? newItem.Which() : 0;
    switch (which) {
      case RES_FRM_SIZE:
      case RES_HORI_ORIENT:
        flags |= SwTabFrameInvFlags.InvalidatePrt | SwTabFrameInvFlags.InvalidateBrowseWidth;
        break;
      case RES_BREAK:
        flags |= SwTabFrameInvFlags.InvalidatePos | SwTabFrameInvFlags.InvalidateNextPos;
        break;
      case RES_LAYOUT_SPLIT:
        if (!this.IsFollow()) flags |= SwTabFrameInvFlags.InvalidatePos;
        break;
      case RES_COLLAPSING_BORDERS:
        flags |= SwTabFrameInvFlags.InvalidatePrt;
        lcl_InvalidateAllLowersPrt(this);
        break;
      case RES_UL_SPACE:
        return (
          flags |
          SwTabFrameInvFlags.InvalidateIndNextPrt |
          SwTabFrameInvFlags.InvalidatePrevPrt |
          SwTabFrameInvFlags.SetIndNextCompletePaint
        );
      default:
        return flags;
    }
    if (oldSet || newSet) {
      oldSet?.ClearItem(which);
      newSet?.ClearItem(which);
    } else super.SwClientNotify(new BroadcastingModify(), new LegacyModifyHint(oldItem, newItem));
    return flags;
  }

  /** Applies native table flags over original flat siblings; page/content/root/section propagation remains unrepresented. @param flags - Native table mask. @returns Nothing. */
  protected Invalidate(flags: SwTabFrameInvFlags): void {
    if (flags === SwTabFrameInvFlags.NONE) return;
    this.InvalidatePage();
    if (flags & SwTabFrameInvFlags.InvalidatePrt) this.InvalidatePrt_();
    if (flags & SwTabFrameInvFlags.InvalidatePos) this.InvalidatePos_();
    const next = this.GetNext();
    if (next) {
      if (flags & SwTabFrameInvFlags.InvalidateIndNextPrt) next.InvalidatePrt_();
      if (flags & SwTabFrameInvFlags.SetIndNextCompletePaint) next.SetCompletePaint();
    }
    if (flags & SwTabFrameInvFlags.InvalidatePrevPrt) this.GetPrev()?.InvalidatePrt_();
    if (flags & SwTabFrameInvFlags.InvalidateNextPos) next?.InvalidatePos();
  }

  /** Returns the canonical table represented by this frame. @returns Actual owner. */
  public GetTable(): SwTable {
    return this.table;
  }

  /** Resolves an actual box reference width against this table's print area. @param box - Original box. @param upperWidth - Upper print width. @returns Device-neutral print width in twips. */
  public GetBoxPrintWidth(box: SwTableBox, upperWidth: number): number {
    const wished =
      (
        this.GetFormat().GetAttrSet().GetItemIfSet(RES_FRM_SIZE) as SwFormatFrameSize | undefined
      )?.GetWidth() ??
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

  /** Resolves the represented horizontal cell-frame position from original row lowers and print widths. @param box - Original current box. @param upperWidth - Upper print width in twips. @returns Cell left relative to table print area, or absent for a foreign box. */
  public GetBoxPrintOffset(box: SwTableBox, upperWidth: number): number | undefined {
    for (let row = this.Lower(); row !== undefined; row = row.GetNext()) {
      let offset = 0;
      for (let lower = (row as SwRowFrame).Lower(); lower !== undefined; lower = lower.GetNext()) {
        const cell = lower as SwCellFrame;
        if (cell.GetTabBox() === box) return Math.trunc(offset);
        offset += this.GetBoxPrintWidth(cell.GetTabBox(), upperWidth);
      }
    }
    return undefined;
  }

  /** Reads the native table-frame split item with its true default. @returns Whether table rows may occupy follow frames. */
  public IsLayoutSplitAllowed(): boolean {
    return (this.GetFormat().GetAttrSet().Get(RES_LAYOUT_SPLIT) as SwFormatLayoutSplit).GetValue();
  }

  /** Resolves native orientation spacing without fly or outer-border offsets. @param upperWidth - Actual upper print width. @returns Table print area. */
  public Format(upperWidth: number): SwTablePrintArea {
    const lr = this.GetFormat().GetLRSpace();
    const wished = Math.min(
      65535,
      Math.max(
        this.table.GetColumnWidths().length * 23,
        this.GetFormat().GetFrameSize().GetWidth(),
      ),
    );
    let left = 0;
    let right = 0;
    const orient = this.GetFormat().GetHoriOrient().GetHoriOrient();
    if (orient === HoriOrientation.NONE) {
      left = lr.ResolveLeft();
      right = lr.ResolveRight();
    } else {
      switch (orient) {
        case HoriOrientation.LEFT_AND_WIDTH:
          left = lr.ResolveLeft();
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

/** Temporary browser-device hierarchy freshness admission while native structural frame invalidation is unported; it borrows original links without another state map. @param frame - Existing original layout object. @param table - Current original model. @returns Whether its represented hierarchy remains current. */
export function isSwTableFrameModelCurrent(frame: SwTabFrame, table: SwTable): boolean {
  if (
    frame.IsInDtor() ||
    frame.GetTable() !== table ||
    frame.GetRegisteredIn() !== table.GetFrameFormat()
  )
    return false;
  let row = frame.Lower();
  for (const line of table.GetTabLines()) {
    if (line.GetTabBoxes().length === 0) continue;
    if (
      !(row instanceof SwRowFrame) ||
      row.GetTabLine() !== line ||
      row.GetRegisteredIn() !== line.GetFrameFormat()
    )
      return false;
    let cell = row.Lower();
    for (const box of line.GetTabBoxes()) {
      if (
        !(cell instanceof SwCellFrame) ||
        cell.GetTabBox() !== box ||
        cell.GetRegisteredIn() !== box.GetFrameFormat()
      )
        return false;
      cell = cell.GetNext();
    }
    if (cell !== undefined) return false;
    row = row.GetNext();
  }
  return row === undefined;
}

/** Device measured table rows; the core owns their placement. */
export interface SwTableFrameMeasurement {
  readonly tableName: string;
  readonly rowHeights: readonly number[];
}

/** Canonical table and its position relative to body text nodes. */
export interface SwTableFrameInput extends SwTableFrameMeasurement {
  readonly nativeFrame?: SwTabFrame;
  readonly table: SwTable;
  readonly afterParagraphIndex: number;
}

/** Pairs measured rows with tables in the canonical body order. @param document - Writer document. @param measurements - Browser table-row measurements. @param takeFrame - Original root-owned native master resolver. @returns Ordered table inputs. */
export function createSwTableFrameInputs(
  document: SwDoc,
  measurements: readonly SwTableFrameMeasurement[],
  takeFrame: (table: SwTable) => SwTabFrame,
): readonly SwTableFrameInput[] {
  const byName = new Map(
    measurements.map(
      /** map handles this value. @param entry - Input 1. @returns The result. */ (entry) =>
        [entry.tableName, entry] as const,
    ),
  );
  const tables: SwTableFrameInput[] = [];
  let paragraphIndex = -1;
  for (const node of document.nodes.getBodyContent()) {
    if (node instanceof SwTableNode) {
      const table = node.GetTable();
      const measured = byName.get(table.GetName());
      const nativeFrame = takeFrame(table);
      tables.push({
        nativeFrame,
        table,
        tableName: table.GetName(),
        afterParagraphIndex: paragraphIndex,
        rowHeights: table.GetTabLines().map(
          /** map handles this value. @param row - Input 1. @param index - Input 2. @returns The result. */ (
            row,
            index,
          ) => {
            let frame = nativeFrame.Lower() as SwRowFrame | undefined;
            while (frame !== undefined && frame.GetTabLine() !== row)
              frame = frame.GetNext() as SwRowFrame | undefined;
            return frame?.Format(measured?.rowHeights[index] ?? 240) ?? 0;
          },
        ),
      });
    } else paragraphIndex += 1;
  }
  return tables;
}
