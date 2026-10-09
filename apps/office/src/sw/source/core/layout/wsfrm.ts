/** @fileoverview Owns native frame registration and linked layout children from wsfrm.cxx and ssfrm.cxx. */
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwFormat } from "../attr/format";
import type { SwFrameFormat } from "./atrfrm";
import { SwFrameSize } from "../../../inc/fmtfsize";
/** Native represented frame type bits from frame.hxx. */
export enum SwFrameType {
  None = 0,
  Row = 0x1000,
  Cell = 0x2000,
}
/** Native invalidation hook discriminators from SwFrame. */
export enum InvalidationType {
  INVALID_SIZE,
  INVALID_PRTAREA,
  INVALID_POS,
  INVALID_LINENUM,
  INVALID_ALL,
}
/** Shared native frame registration and original sibling links. */
export class SwFrame extends SwClient {
  protected mnFrameType = SwFrameType.None;
  private mbFrameAreaPositionValid = false;
  private mbFrameAreaSizeValid = false;
  private mbFramePrintAreaValid = false;
  private mbCompletePaint = true;
  private mpUpper: SwLayoutFrame | undefined;
  private mpNext: SwFrame | undefined;
  private mpPrev: SwFrame | undefined;
  /** Registers an original frame. @param format - Native modify owner. @returns Nothing. */
  protected constructor(format: SwModify) {
    super();
    this.RegisterToModify(format);
  }
  /** Reads represented native frame type bits. @returns Frame type. */
  public GetType(): SwFrameType {
    return this.mnFrameType;
  }
  /** Reads native position validity. @returns Whether positioned. */
  public isFrameAreaPositionValid(): boolean {
    return this.mbFrameAreaPositionValid;
  }
  /** Reads native size validity. @returns Whether sized. */
  public isFrameAreaSizeValid(): boolean {
    return this.mbFrameAreaSizeValid;
  }
  /** Reads native print-area validity. @returns Whether calculated. */
  public isFramePrintAreaValid(): boolean {
    return this.mbFramePrintAreaValid;
  }
  /** Reads complete native area validity. @returns Whether all geometry is valid. */
  public isFrameAreaDefinitionValid(): boolean {
    return (
      this.isFrameAreaPositionValid() && this.isFrameAreaSizeValid() && this.isFramePrintAreaValid()
    );
  }
  /** Sets native position validity. @param value - New flag. @returns Nothing. */
  public setFrameAreaPositionValid(value: boolean): void {
    if (this.mbFrameAreaPositionValid !== value) this.mbFrameAreaPositionValid = value;
  }
  /** Sets native size validity. @param value - New flag. @returns Nothing. */
  public setFrameAreaSizeValid(value: boolean): void {
    if (this.mbFrameAreaSizeValid !== value) this.mbFrameAreaSizeValid = value;
  }
  /** Sets native print-area validity. @param value - New flag. @returns Nothing. */
  public setFramePrintAreaValid(value: boolean): void {
    if (this.mbFramePrintAreaValid !== value) this.mbFramePrintAreaValid = value;
  }
  /** Requests complete native painting. @returns Nothing. */
  public SetCompletePaint(): void {
    this.mbCompletePaint = true;
  }
  /** Clears complete native painting after paint. @returns Nothing. */
  public ResetCompletePaint(): void {
    this.mbCompletePaint = false;
  }
  /** Reads complete native paint state. @returns Whether requested. */
  public IsCompletePaint(): boolean {
    return this.mbCompletePaint;
  }
  /** Applies native default invalidation permission. @param type - Invalidation kind. @returns Whether allowed. */
  protected InvalidationAllowed(type: InvalidationType): boolean {
    void type;
    return true;
  }
  /** Applies native default post-invalidation action. @param type - Invalidation kind. @returns Nothing. */
  protected ActionOnInvalidation(type: InvalidationType): void {
    void type;
  }
  /** Detached represented frames have no native page to invalidate. @returns Nothing. */
  protected InvalidatePage(): void {}
  /** Invalidates a valid size and its native page. @returns Nothing. */
  public InvalidateSize(): void {
    if (this.isFrameAreaSizeValid()) this.ImplInvalidateSize();
  }
  /** Applies native size invalidation after its permission hook. @returns Nothing. */
  public ImplInvalidateSize(): void {
    if (this.InvalidationAllowed(InvalidationType.INVALID_SIZE)) {
      this.setFrameAreaSizeValid(false);
      this.InvalidatePage();
      this.ActionOnInvalidation(InvalidationType.INVALID_SIZE);
    }
  }
  /** Invalidates a valid print area and its native page. @returns Nothing. */
  public InvalidatePrt(): void {
    if (this.isFramePrintAreaValid()) this.ImplInvalidatePrt();
  }
  /** Applies native print-area invalidation after its permission hook. @returns Nothing. */
  public ImplInvalidatePrt(): void {
    if (this.InvalidationAllowed(InvalidationType.INVALID_PRTAREA)) {
      this.setFramePrintAreaValid(false);
      this.InvalidatePage();
      this.ActionOnInvalidation(InvalidationType.INVALID_PRTAREA);
    }
  }
  /** Invalidates a valid position and its native page. @returns Nothing. */
  public InvalidatePos(): void {
    if (this.isFrameAreaPositionValid()) this.ImplInvalidatePos();
  }
  /** Applies native position invalidation after its permission hook. @returns Nothing. */
  public ImplInvalidatePos(): void {
    if (!this.InvalidationAllowed(InvalidationType.INVALID_POS)) return;
    this.setFrameAreaPositionValid(false);
    this.InvalidatePage();
    this.ActionOnInvalidation(InvalidationType.INVALID_POS);
  }
  /** Invalidates size without notifying a page, once per valid state. @returns Nothing. */
  public InvalidateSize_(): void {
    if (this.isFrameAreaSizeValid() && this.InvalidationAllowed(InvalidationType.INVALID_SIZE)) {
      this.setFrameAreaSizeValid(false);
      this.ActionOnInvalidation(InvalidationType.INVALID_SIZE);
    }
  }
  /** Invalidates print area without notifying a page, once per valid state. @returns Nothing. */
  public InvalidatePrt_(): void {
    if (
      this.isFramePrintAreaValid() &&
      this.InvalidationAllowed(InvalidationType.INVALID_PRTAREA)
    ) {
      this.setFramePrintAreaValid(false);
      this.ActionOnInvalidation(InvalidationType.INVALID_PRTAREA);
    }
  }
  /** Invalidates position without notifying a page, once per valid state. @returns Nothing. */
  public InvalidatePos_(): void {
    if (this.isFrameAreaPositionValid() && this.InvalidationAllowed(InvalidationType.INVALID_POS)) {
      this.setFrameAreaPositionValid(false);
      this.ActionOnInvalidation(InvalidationType.INVALID_POS);
    }
  }
  /** Invalidates all geometry locally only if some geometry is valid. @returns Nothing. */
  public InvalidateAll_(): void {
    if (
      (this.isFrameAreaSizeValid() ||
        this.isFramePrintAreaValid() ||
        this.isFrameAreaPositionValid()) &&
      this.InvalidationAllowed(InvalidationType.INVALID_ALL)
    ) {
      this.setFrameAreaSizeValid(false);
      this.setFrameAreaPositionValid(false);
      this.setFramePrintAreaValid(false);
      this.ActionOnInvalidation(InvalidationType.INVALID_ALL);
    }
  }
  /** Invalidates all geometry with native complete-validity page notification semantics. @returns Nothing. */
  public InvalidateAll(): void {
    if (this.InvalidationAllowed(InvalidationType.INVALID_ALL)) {
      if (this.isFrameAreaDefinitionValid()) this.ImplInvalidatePos();
      this.setFrameAreaSizeValid(false);
      this.setFrameAreaPositionValid(false);
      this.setFramePrintAreaValid(false);
      this.ActionOnInvalidation(InvalidationType.INVALID_ALL);
    }
  }
  /** Reinitializes represented natural/minimum row lowers; physical fixed geometry and content frames remain unrepresented. @returns Nothing. */
  public ReinitializeFrameSizeAttrFlags(): void {
    const size = (this.GetDep() as SwFrameFormat).GetFrameSize();
    if (
      (size.GetHeightSizeType() === SwFrameSize.Variable ||
        size.GetHeightSizeType() === SwFrameSize.Minimum) &&
      this.GetType() === SwFrameType.Row
    ) {
      for (
        let lower = (this as unknown as SwLayoutFrame).Lower();
        lower !== undefined;
        lower = lower.GetNext()
      ) {
        lower.InvalidateSize_();
        lower.InvalidatePrt_();
      }
    }
  }
  /** Reads native registration without a format copy. @returns Original owner or absent. */
  protected GetDep(): SwModify | undefined {
    return this.GetRegisteredIn();
  }
  /** Tests exact native format identity. @param format - Candidate owner. @returns Whether registered. */
  public KnowsFormat(format: SwFormat): boolean {
    return this.GetRegisteredIn() === format;
  }
  /** Moves registration to an original format. @param format - New owner. @returns Nothing. */
  public RegisterToFormat(format: SwFormat): void {
    this.RegisterToModify(format);
  }
  /** Reads the original parent frame. @returns Parent or absent. */
  public GetUpper(): SwLayoutFrame | undefined {
    return this.mpUpper;
  }
  /** Reads the next original sibling. @returns Sibling or absent. */
  public GetNext(): SwFrame | undefined {
    return this.mpNext;
  }
  /** Reads the previous original sibling. @returns Sibling or absent. */
  public GetPrev(): SwFrame | undefined {
    return this.mpPrev;
  }
  /** Inserts into the original native sibling chain. @param parent - Native layout parent. @param before - Original preceding sibling. @returns Nothing. */
  public InsertBehind(parent: SwLayoutFrame, before?: SwFrame): void {
    this.mpUpper = parent;
    this.mpPrev = before;
    if (before !== undefined) {
      this.mpNext = before.mpNext;
      if (this.mpNext !== undefined) this.mpNext.mpPrev = this;
      before.mpNext = this;
    } else {
      this.mpNext = parent.Lower();
      if (this.mpNext !== undefined) this.mpNext.mpPrev = this;
      parent.m_pLower = this;
    }
  }
  /** Removes only native layout links. @returns Nothing. */
  public RemoveFromLayout(): void {
    if (this.mpPrev !== undefined) this.mpPrev.mpNext = this.mpNext;
    else if (this.mpUpper !== undefined) this.mpUpper.m_pLower = this.mpNext;
    if (this.mpNext !== undefined) this.mpNext.mpPrev = this.mpPrev;
    this.mpNext = undefined;
    this.mpPrev = undefined;
    this.mpUpper = undefined;
  }
  /** Releases the original registration after represented destruction. @returns Nothing. */
  public DestroyImpl(): void {
    super.Dispose();
  }
  /** Dispatches destruction through the actual native frame subtype. @param frame - Original frame. @returns Nothing. */
  public static DestroyFrame(frame: SwFrame): void {
    frame.DestroyImpl();
  }
}
/** Native layout frame owns a linked sequence of original lower frames. */
export class SwLayoutFrame extends SwFrame {
  /** Native lower pointer; public within this module to model C++ SwFrame friendship without a side map. */
  public m_pLower: SwFrame | undefined;
  /** Binds the original frame format. @param format - Native frame owner. @returns Nothing. */
  protected constructor(format: SwFrameFormat) {
    super(format);
  }
  /** Reads the registered original frame format. @returns Native owner. */
  public GetFormat(): SwFrameFormat {
    return this.GetDep() as SwFrameFormat;
  }
  /** Reads the original first child. @returns Lower frame or absent. */
  public Lower(): SwFrame | undefined {
    return this.m_pLower;
  }
  /** Removes and destroys original flat lower frames before ending registration. @returns Nothing. */
  public override DestroyImpl(): void {
    while (this.m_pLower !== undefined) {
      const frame = this.m_pLower;
      frame.RemoveFromLayout();
      SwFrame.DestroyFrame(frame);
    }
    super.DestroyImpl();
  }
}
