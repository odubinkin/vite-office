/** @fileoverview Represents native itratr.cxx hint traversal for one unmerged text node without a filter-run conversion. */
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwAttrHandler } from "./atrstck";

/** Traverses actual native start/end maps and maintains character stacks for the current text position. */
export class SwAttrIter {
  private readonly m_aAttrHandler = new SwAttrHandler();
  private m_nStartIndex = 0;
  private m_nEndIndex = 0;
  private m_nPosition = 0;

  /** Initializes the iterator over the actual node and inherited paragraph items. @param m_pTextNode - Canonical owner. @returns Nothing. */
  public constructor(private readonly m_pTextNode: SwTextNode) {
    this.m_aAttrHandler.Init(m_pTextNode.GetSwAttrSet());
  }

  /** Exposes the existing native handler for the platform item formatter. @returns Owned handler. */
  public GetAttrHandler(): SwAttrHandler {
    return this.m_aAttrHandler;
  }

  /** Reports native hint-container presence, including an allocated empty container. @returns Whether hints may exist. */
  public MaybeHasHints(): boolean {
    return this.m_pTextNode.GetpSwpHints() !== undefined;
  }

  /** Seeks a character position, resetting backward/zero seeks before end-first forward traversal. Font/device change reporting remains unrepresented. @param position - UTF-16 node position. @returns Nothing. */
  public Seek(position: number): void {
    if (!Number.isInteger(position) || position < 0 || position > this.m_pTextNode.Len())
      throw new Error("SwAttrIter position is outside its text node.");
    const hints = this.m_pTextNode.GetpSwpHints();
    if (hints !== undefined && (position === 0 || position < this.m_nPosition)) {
      this.m_aAttrHandler.Reset();
      this.m_nStartIndex = 0;
      this.m_nEndIndex = 0;
      this.m_nPosition = 0;
    }
    if (hints !== undefined) {
      while (
        this.m_nEndIndex < hints.Count() &&
        hints.GetSortedByEnd(this.m_nEndIndex).GetAnyEnd() <= position
      ) {
        const hint = hints.GetSortedByEnd(this.m_nEndIndex++);
        if (this.m_nStartIndex !== 0 && hint.GetStart() <= this.m_nPosition)
          this.m_aAttrHandler.PopAndChg(hint);
      }
      while (
        this.m_nStartIndex < hints.Count() &&
        hints.Get(this.m_nStartIndex).GetStart() <= position
      ) {
        const hint = hints.Get(this.m_nStartIndex++);
        if (hint.GetAnyEnd() > position) this.m_aAttrHandler.PushAndChg(hint);
      }
    }
    this.m_nPosition = position;
  }

  /** Finds the next nonignored start/end boundary in the represented native ranged families. Field/merged/redline breaks remain unrepresented. @returns UTF-16 offset or native node-length sentinel. */
  public GetNextAttr(): number {
    let next = this.m_pTextNode.Len();
    const hints = this.m_pTextNode.GetpSwpHints();
    if (hints !== undefined) {
      for (let index = this.m_nStartIndex; index < hints.Count(); index++) {
        const hint = hints.Get(index);
        if (!hint.IsFormatIgnoreStart()) {
          next = hint.GetStart();
          break;
        }
      }
      for (let index = this.m_nEndIndex; index < hints.Count(); index++) {
        const hint = hints.GetSortedByEnd(index);
        if (!hint.IsFormatIgnoreEnd()) {
          next = Math.min(next, hint.GetAnyEnd());
          break;
        }
      }
    }
    return next;
  }
}
