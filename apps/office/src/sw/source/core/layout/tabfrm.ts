/** @fileoverview Formats represented horizontal table print areas from native SwTabFrame::Format. */
import type { SwTable, SwTableBox, SwTableLine } from "../table/swtable";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { SwFrameSize } from "../../../inc/fmtfsize";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import type { SwFrameFormat } from "./atrfrm";

/** Owns represented flat-row height over its original native line. */
export class SwRowFrame extends SwClient {
  /** Binds the actual row owner. @param line - Original native line. @returns Nothing. */
  public constructor(private readonly line: SwTableLine) {
    super();
    this.RegisterToFormat(line.GetFrameFormat());
  }
  /** Reads the registered native frame format. @returns Current native owner. */
  public GetFormat(): SwFrameFormat {
    return this.GetRegisteredIn() as SwFrameFormat;
  }
  /** Registers this native frame at another format. @param format - New native owner. @returns Nothing. */
  public RegisterToFormat(format: SwFrameFormat): void {
    this.RegisterToModify(format);
  }
  /** Releases the frame and deletes its format only when no represented clients remain. @returns Nothing. */
  public DestroyImpl(): void {
    const format = this.GetRegisteredIn();
    super.Dispose();
    if (format !== undefined && !format.HasListeners()) format.DisposeModify();
  }
  /** Ends native frame lifetime through the original destruction body. @returns Nothing. */
  public override Dispose(): void {
    this.DestroyImpl();
  }
  /** Follows only original-row change and history movement hints. @param source - Emitting native owner. @param hint - Typed native notification. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    if (hint.kind === "model-transaction") {
      for (const nested of hint.hints) this.SwClientNotify(source, nested);
    } else if (hint.kind === "table-line-format-changed") {
      if (hint.m_rTabLine === this.line) this.RegisterToFormat(hint.m_rNewFormat);
    } else if (hint.kind === "move-table-line") {
      if (hint.m_rTableLine === this.line) this.RegisterToFormat(hint.m_rNewFormat);
    } else super.SwClientNotify(source, hint);
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
export class SwTabFrame {
  /** Binds this layout frame to its original table. @param table - Canonical table. @param mouseGeometry - Optional live device frames. @returns Nothing. */
  public constructor(
    private readonly table: SwTable,
    public readonly mouseGeometry?: SwTableMouseGeometry,
  ) {}

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
    return wished === 0
      ? 0
      : (box.GetFrameSize().GetWidth() * this.Format(upperWidth).width) / wished;
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
