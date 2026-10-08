/** @fileoverview Owns native frame registration and linked layout children from wsfrm.cxx and ssfrm.cxx. */
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwFormat } from "../attr/format";
import type { SwFrameFormat } from "./atrfrm";
/** Shared native frame registration and original sibling links. */
export class SwFrame extends SwClient {
  private mpUpper: SwLayoutFrame | undefined;
  private mpNext: SwFrame | undefined;
  private mpPrev: SwFrame | undefined;
  /** Registers an original frame. @param format - Native modify owner. @returns Nothing. */
  protected constructor(format: SwModify) {
    super();
    this.RegisterToModify(format);
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
