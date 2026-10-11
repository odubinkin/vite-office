/** @fileoverview Native linked SwTextIter traversal and SwTextCursor affinity; register, script, native geometry and intermediate adjuster classes remain unrepresented. */
import type { SwTextFrame } from "./txtfrm";
import type { SwLineLayout } from "./porlay";
import type { SwTextSizeInfo } from "./inftxt";
import { SwAttrIter } from "./itratr";
/** Iterates original paragraph lines over the original native attribute owner. */
export class SwTextIter extends SwAttrIter {
  protected m_pCurr: SwLineLayout;
  protected m_nStart: number;
  private m_pPrev: SwLineLayout | undefined;
  private m_bPrev = true;
  private m_nY = 0;
  private m_nLineNr = 1;
  /** Initializes native iteration at the frame's original paragraph. @param frame - Original frame. @param info - Original paragraph and text information. @returns Iterator. */
  public constructor(
    frame: SwTextFrame,
    protected readonly m_pInf: SwTextSizeInfo,
  ) {
    super(frame.GetTextNodeFirst());
    const paragraph = frame.GetPara();
    if (paragraph === undefined)
      throw new Error("SwTextIter requires the original formatted paragraph.");
    this.m_pCurr = m_pInf.GetParaPortion() as SwLineLayout;
    this.m_nStart = m_pInf.GetTextStart();
  }
  /** Reads the original current line. @returns Native line. */
  public GetCurr(): SwLineLayout {
    return this.m_pCurr;
  }
  /** Reads the next original line. @returns Native line or no successor. */
  public GetNext(): SwLineLayout | undefined {
    return this.m_pCurr.GetNext();
  }
  /** Reads the current text start. @returns UTF-16 offset. */
  public GetStart(): number {
    return this.m_nStart;
  }
  /** Reads the current native length. @returns UTF-16 length. */
  public GetLength(): number {
    return this.m_pCurr.GetLen();
  }
  /** Reads the native line end. @returns UTF-16 offset. */
  public GetEnd(): number {
    return this.GetStart() + this.GetLength();
  }
  /** Reads the represented relative line position. @returns Twips from frame print origin. */
  public Y(): number {
    return this.m_nY;
  }
  /** Reads the native line number including dummy/empty rules. @returns Line number. */
  public GetLineNr(): number {
    return this.m_nLineNr;
  }
  /** Finds and caches the previous original line. @returns Native line or no predecessor. */
  public GetPrev(): SwLineLayout | undefined {
    if (!this.m_bPrev) {
      this.m_pPrev = undefined;
      this.m_bPrev = true;
      let line = this.m_pInf.GetParaPortion() as SwLineLayout;
      if (line !== this.m_pCurr) {
        while (line.GetNext() !== this.m_pCurr) line = line.GetNext() as SwLineLayout;
        this.m_pPrev = line;
      }
    }
    return this.m_pPrev;
  }
  /** Moves to the original previous line. @returns Native line or no predecessor. */
  public Prev(): SwLineLayout | undefined {
    const previous = this.GetPrev();
    if (previous === undefined) return undefined;
    this.m_bPrev = false;
    this.m_pCurr = previous;
    this.m_nStart -= previous.GetLen();
    this.m_nY -= previous.GetRealHeight();
    if (!previous.IsDummy() && --this.m_nLineNr === 0) ++this.m_nLineNr;
    return previous;
  }
  /** Moves to the original following line. @returns Native line or no successor. */
  public Next(): SwLineLayout | undefined {
    const next = this.GetNext();
    if (next === undefined) return undefined;
    this.m_pPrev = this.m_pCurr;
    this.m_bPrev = true;
    this.m_nStart += this.m_pCurr.GetLen();
    this.m_nY += this.m_pCurr.GetRealHeight();
    if (this.m_pCurr.GetLen() || (this.m_nLineNr > 1 && !this.m_pCurr.IsDummy())) ++this.m_nLineNr;
    this.m_pCurr = next;
    return next;
  }
  /** Moves backward past dummy lines with the native all-dummy fallback. @returns Native line or no predecessor. */
  public PrevLine(): SwLineLayout | undefined {
    let previous = this.Prev();
    if (previous === undefined) return undefined;
    let last = previous;
    while (previous !== undefined && previous.IsDummy()) {
      last = previous;
      previous = this.Prev();
    }
    return previous ?? last;
  }
  /** Selects a native line by cumulative paragraph lengths. @param position - UTF-16 position. @returns Nothing. */
  public CharToLine(position: number): void {
    while (this.GetEnd() <= position && this.Next() !== undefined) {
      /* Source forward traversal. */
    }
    while (this.m_nStart > position && this.Prev() !== undefined) {
      /* Source backward traversal. */
    }
  }
}
/** Native visual cursor affinity over actual frame-owned paragraph lines. */
export class SwTextCursor extends SwTextIter {
  private static rightMargin = false;
  /** Reads native right-margin ambiguity. @returns Whether a boundary belongs to its preceding line. */
  public static IsRightMargin(): boolean {
    return this.rightMargin;
  }
  /** Stores native right-margin ambiguity. @param value - New affinity. @returns Nothing. */
  public static SetRightMargin(value: boolean): void {
    this.rightMargin = value;
  }
  /** Resolves a native position including hard-break and dummy-line affinity. @param position - UTF-16 position. @returns Original native line. */
  public CharCursorToLine(position: number): SwLineLayout {
    this.CharToLine(position);
    if (position !== this.m_nStart) SwTextCursor.SetRightMargin(false);
    let previous =
      SwTextCursor.IsRightMargin() &&
      this.m_pCurr.GetLen() !== 0 &&
      this.GetPrev() !== undefined &&
      (this.GetPrev() as SwLineLayout).GetLen() !== 0;
    if (previous && position !== 0 && this.m_pInf.GetChar(position - 1) === "\n") previous = false;
    return previous ? (this.PrevLine() as SwLineLayout) : this.m_pCurr;
  }
}
