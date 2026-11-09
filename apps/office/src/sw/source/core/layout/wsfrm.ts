/** @fileoverview Owns native frame registration and linked layout children from wsfrm.cxx and ssfrm.cxx. */
import { SvxFrameDirection } from "../../../../editeng/inc/frmdir";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { PrepareHint } from "../../../inc/swtypes";
import {
  RES_BOX,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_TEXTLEFT,
  RES_MARGIN_RIGHT,
  RES_UL_SPACE,
  RES_KEEP,
  RES_FRM_SIZE,
} from "../../../inc/hintids";
import type { SwFormat } from "../attr/format";
import type { SwFrameFormat } from "./atrfrm";
import { SwFrameSize } from "../../../inc/fmtfsize";
import type { SwTabFrame } from "./tabfrm";
import type { SwRootFrame } from "./newfrm";
import { SwFrameAreaDefinition } from "../inc/frame";
import type { ReadonlySwRect } from "../../../inc/swrect";
/** Native represented frame type bits from frame.hxx. */
export enum SwFrameType {
  None = 0,
  Root = 0x0001,
  Tab = 0x0800,
  Row = 0x1000,
  Cell = 0x2000,
  Txt = 0x4000,
}
/** Native invalidation hook discriminators from SwFrame. */
export enum InvalidationType {
  INVALID_SIZE,
  INVALID_PRTAREA,
  INVALID_POS,
  INVALID_LINENUM,
  INVALID_ALL,
}
/** Native frame invalidation bits from frame.hxx. */
export enum SwFrameInvFlags {
  NONE = 0,
  InvalidatePrt = 1,
  InvalidateSize = 2,
  InvalidatePos = 4,
  SetCompletePaint = 8,
  NextInvalidatePos = 16,
  NextSetCompletePaint = 32,
}
/** Shared native frame registration and original sibling links. */
export class SwFrame extends SwClient {
  protected mnFrameType = SwFrameType.None;
  private mbInDtor = false;
  private mbInvalidR2L = true;
  private mbDerivedR2L = false;
  private mbRightToLeft = false;
  private mbInvalidVert = true;
  private mbDerivedVert = false;
  private mbVertical = false;
  private mbVertLR = false;
  private mbVertLRBT = false;

  /** Original lazy vertical direction query. @returns Physical vertical flag. */
  public IsVertical(): boolean {
    if (this.mbInvalidVert) this.SetDirFlags(true);
    return this.mbVertical;
  }
  /** Original cached vertical column order query. @returns Physical LR flag. */
  public IsVertLR(): boolean {
    return this.mbVertLR;
  }
  /** Original cached bottom-to-top direction query. @returns Physical LRBT flag. */
  public IsVertLRBT(): boolean {
    return this.mbVertLRBT;
  }
  /** Original lazy bidi direction query. @returns Physical RTL flag. */
  public IsRightToLeft(): boolean {
    if (this.mbInvalidR2L) this.SetDirFlags(false);
    return this.mbRightToLeft;
  }
  /** Original direction validation for the represented frame families. @param direction - Effective native item value. @param vertical - Which flag group is requested. @param onlyBiDi - Derive vertical flags even with an explicit item. @param browse - Actual browse-mode admission. @returns Nothing. */
  protected CheckDir(
    direction: SvxFrameDirection,
    vertical: boolean,
    onlyBiDi: boolean,
    browse: boolean,
  ): void {
    if (direction === SvxFrameDirection.Environment || (vertical && onlyBiDi)) {
      this.mbDerivedVert = true;
      if (direction === SvxFrameDirection.Environment) this.mbDerivedR2L = true;
      this.SetDirFlags(vertical);
    } else if (vertical) {
      this.mbInvalidVert = false;
      if (
        direction === SvxFrameDirection.Horizontal_LR_TB ||
        direction === SvxFrameDirection.Horizontal_RL_TB ||
        browse
      ) {
        this.mbVertical = false;
        this.mbVertLR = false;
        this.mbVertLRBT = false;
      } else {
        this.mbVertical = true;
        if (
          direction === SvxFrameDirection.Vertical_RL_TB ||
          direction === SvxFrameDirection.Vertical_RL_TB90
        ) {
          this.mbVertLR = false;
          this.mbVertLRBT = false;
        } else if (
          direction === SvxFrameDirection.Vertical_LR_TB ||
          direction === SvxFrameDirection.Vertical_LR_BT
        ) {
          this.mbVertLR = true;
          this.mbVertLRBT = direction === SvxFrameDirection.Vertical_LR_BT;
        }
      }
    } else {
      this.mbInvalidR2L = false;
      this.mbRightToLeft = direction === SvxFrameDirection.Horizontal_RL_TB;
    }
  }
  /** Original virtual base direction check for represented non-header/footer frames. @param vertical - Which flag group is requested. @returns Nothing. */
  protected CheckDirection(vertical: boolean): void {
    if (vertical) {
      this.mbDerivedVert = true;
      this.SetDirFlags(true);
    } else this.mbDerivedR2L = true;
  }
  /** Revalidates direction flags from the original upper chain. Physical fly-anchor and predecessor-cell owners are separate layout responsibilities. @param vertical - Which flag group is requested. @returns Nothing. */
  private SetDirFlags(vertical: boolean): void {
    if (vertical) {
      if (this.mbDerivedVert) {
        const upper = this.GetUpper();
        if (upper !== undefined) {
          this.mbVertical = upper.IsVertical();
          this.mbVertLR = upper.IsVertLR();
          this.mbVertLRBT = upper.IsVertLRBT();
          if (!upper.mbInvalidVert) this.mbInvalidVert = false;
        }
      } else this.CheckDirection(true);
    } else {
      let invalid = false;
      if (!this.mbDerivedR2L) this.CheckDirection(false);
      if (this.mbDerivedR2L) {
        const upper = this.GetUpper();
        if (upper !== undefined) this.mbRightToLeft = upper.IsRightToLeft();
        if (upper === undefined || upper.mbInvalidR2L) invalid = this.mbInvalidR2L;
      }
      this.mbInvalidR2L = invalid;
    }
  }
  /** Original derived bidi flag setter for a changed item or format. @param value - New flag. @returns Nothing. */
  protected SetDerivedR2L(value: boolean): void {
    this.mbDerivedR2L = value;
  }
  /** Original direction-change ordering and invalidation for the represented text frames. @returns Nothing. */
  protected CheckDirChange(): void {
    const oldVertical = this.mbVertical,
      oldRTL = this.mbRightToLeft;
    this.mbInvalidVert = true;
    this.mbInvalidR2L = true;
    const changedRTL = oldRTL !== this.IsRightToLeft(),
      oldVerticalLR = this.IsVertLR();
    if (this.IsVertical() !== oldVertical || changedRTL || oldVerticalLR !== this.IsVertLR())
      this.InvalidateAll();
  }
  /** Original frame-area base component preserving the native registered frame identity. */
  public readonly areaDefinition = new SwFrameAreaDefinition();
  private mbCompletePaint = true;
  private mpRoot: SwRootFrame | undefined;
  private mpUpper: SwLayoutFrame | undefined;
  private mpNext: SwFrame | undefined;
  private mpPrev: SwFrame | undefined;
  /** Registers an original frame. @param format - Native modify owner. @param sibling - Existing native frame supplying the original root. @returns Nothing. */
  protected constructor(format: SwModify, sibling?: SwFrame) {
    super();
    this.RegisterToModify(format);
    this.mpRoot = sibling?.getRootFrame();
  }
  /** Native base preparation does not require a content-frame action. @param hint - Native preparation kind. @returns False for the base frame. */
  public Prepare(hint = PrepareHint.Clear): boolean {
    void hint;
    return false;
  }
  /** Accumulates represented native item reactions. @param oldItem - Original old item. @param newItem - Original accepted item. @param flags - Accumulated flags. @returns Updated native mask. */
  protected UpdateAttrFrame(
    oldItem: SfxPoolItem | undefined,
    newItem: SfxPoolItem | undefined,
    flags: SwFrameInvFlags,
  ): SwFrameInvFlags {
    const which = oldItem ? oldItem.Which() : newItem ? newItem.Which() : 0;
    switch (which) {
      case RES_BOX:
      case RES_MARGIN_FIRSTLINE:
      case RES_MARGIN_TEXTLEFT:
      case RES_MARGIN_RIGHT:
      case RES_UL_SPACE:
        if (which === RES_BOX) this.Prepare(PrepareHint.FixSizeChanged);
        return (
          flags |
          SwFrameInvFlags.InvalidatePrt |
          SwFrameInvFlags.InvalidateSize |
          SwFrameInvFlags.SetCompletePaint
        );
      case RES_KEEP:
        return flags | SwFrameInvFlags.InvalidatePos;
      case RES_FRM_SIZE:
        this.ReinitializeFrameSizeAttrFlags();
        return (
          flags |
          SwFrameInvFlags.InvalidatePrt |
          SwFrameInvFlags.InvalidateSize |
          SwFrameInvFlags.NextInvalidatePos
        );
      default:
        return flags;
    }
  }
  /** Processes borrowed attribute deltas before native local invalidation. @param source - Original notifying owner. @param hint - Original model notification. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    let flags = SwFrameInvFlags.NONE;
    if (hint.kind === "model-transaction") {
      for (const nested of hint.hints) this.SwClientNotify(source, nested);
      return;
    } else if (hint.kind === "legacy-modify") {
      flags = this.UpdateAttrFrame(hint.m_pOld, hint.m_pNew, flags);
    } else if (hint.kind === "attr-set-change") {
      if (hint.m_pOld && hint.m_pNew) {
        const oldItems = hint.m_pOld.GetChgSet().entries();
        const newItems = hint.m_pNew.GetChgSet().entries();
        let index = 0;
        do {
          flags = this.UpdateAttrFrame(oldItems[index], newItems[index], flags);
          index += 1;
        } while (index < newItems.length);
      }
    } else if (hint.kind === "format-change" || hint.kind === "format-inheritance-changed") {
      flags =
        SwFrameInvFlags.InvalidatePrt |
        SwFrameInvFlags.InvalidateSize |
        SwFrameInvFlags.InvalidatePos |
        SwFrameInvFlags.SetCompletePaint;
    } else return;
    if (flags === SwFrameInvFlags.NONE) return;
    this.InvalidatePage();
    if (flags & SwFrameInvFlags.InvalidatePrt) this.InvalidatePrt_();
    if (flags & SwFrameInvFlags.InvalidateSize) this.InvalidateSize_();
    if (flags & SwFrameInvFlags.InvalidatePos) this.InvalidatePos_();
    if (flags & SwFrameInvFlags.SetCompletePaint) this.SetCompletePaint();
    if (flags & SwFrameInvFlags.NextInvalidatePos) {
      const next = this.GetNext();
      if (next) {
        next.InvalidatePage();
        next.InvalidatePos_();
      }
    }
  }
  /** Reads represented native frame type bits. @returns Frame type. */
  public GetType(): SwFrameType {
    return this.mnFrameType;
  }
  /** Tests the original native table frame type. @returns Whether this is a table frame. */
  public IsTabFrame(): boolean {
    return this.mnFrameType === SwFrameType.Tab;
  }
  /** Tests the original text-frame discriminator. @returns Whether this is a text frame. */
  public IsTextFrame(): boolean {
    return this.mnFrameType === SwFrameType.Txt;
  }
  /** Reads the native destruction guard. @returns Whether base destruction has started. */
  public IsInDtor(): boolean {
    return this.mbInDtor;
  }
  /** Finds the nearest original table in the represented uncached upper chain. @returns Live containing table or absent for detached and destroyed frames. */
  public FindTabFrame(): SwTabFrame | undefined {
    if (!this.GetUpper() || this.IsInDtor()) return undefined;
    if (this.IsTabFrame()) return this as unknown as SwTabFrame;
    let frame: SwFrame | undefined = this.GetUpper();
    while (frame !== undefined) {
      if (frame.IsInDtor()) return undefined;
      if (frame.IsTabFrame()) return frame as SwTabFrame;
      frame = frame.GetUpper();
    }
    return undefined;
  }
  /** Reads native position validity. @returns Whether positioned. */
  public isFrameAreaPositionValid(): boolean {
    return this.areaDefinition.isFrameAreaPositionValid();
  }
  /** Reads native size validity. @returns Whether sized. */
  public isFrameAreaSizeValid(): boolean {
    return this.areaDefinition.isFrameAreaSizeValid();
  }
  /** Reads native print-area validity. @returns Whether calculated. */
  public isFramePrintAreaValid(): boolean {
    return this.areaDefinition.isFramePrintAreaValid();
  }
  /** Reads complete native area validity. @returns Whether all geometry is valid. */
  public isFrameAreaDefinitionValid(): boolean {
    return this.areaDefinition.isFrameAreaDefinitionValid();
  }
  /** Sets native position validity. @param value - New flag. @returns Nothing. */
  public setFrameAreaPositionValid(value: boolean): void {
    this.areaDefinition.setFrameAreaPositionValid(value);
  }
  /** Sets native size validity. @param value - New flag. @returns Nothing. */
  public setFrameAreaSizeValid(value: boolean): void {
    this.areaDefinition.setFrameAreaSizeValid(value);
  }
  /** Sets native print-area validity. @param value - New flag. @returns Nothing. */
  public setFramePrintAreaValid(value: boolean): void {
    this.areaDefinition.setFramePrintAreaValid(value);
  }
  /** Reads the original composed native frame identity. @returns Native ID. */
  public GetFrameId(): number {
    return this.areaDefinition.GetFrameId();
  }
  /** Borrows original absolute frame geometry. @returns Native const area. */
  public getFrameArea(): ReadonlySwRect {
    return this.areaDefinition.getFrameArea();
  }
  /** Borrows original frame-relative print geometry. @returns Native const print area. */
  public getFramePrintArea(): ReadonlySwRect {
    return this.areaDefinition.getFramePrintArea();
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
  /** Reads the source constructor-owned original root. @returns Native root or absent for detached construction. */
  public getRootFrame(): SwRootFrame | undefined {
    return this.mpRoot;
  }
  /** Assigns the original root, as its native constructor does. @param root - Actual root owner. @returns Nothing. */
  protected setRootFrame(root: SwRootFrame): void {
    this.mpRoot = root;
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
    this.mbInDtor = true;
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
  /** Binds the original frame format. @param format - Native frame owner. @param sibling - Existing original root-bearing frame. @returns Nothing. */
  protected constructor(format: SwFrameFormat, sibling?: SwFrame) {
    super(format, sibling);
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
