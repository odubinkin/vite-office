/** @fileoverview Native paragraph first-line inheritance and linked layout lines from porlay.hxx/cxx; full flags and formatting remain unrepresented. */
import { SwLinePortion } from "./porlin";
/** Original native layout line in a paragraph's linked chain. */
export class SwLineLayout extends SwLinePortion {
  private m_pNext: SwLineLayout | undefined;
  private m_nRealHeight = 0;
  private m_bDummy = false;
  /** Reads the following original line. @returns Native line or no successor. */
  public GetNext(): SwLineLayout | undefined {
    return this.m_pNext;
  }
  /** Stores an original line link. @param next - Following line. @returns Nothing. */
  public SetNext(next: SwLineLayout | undefined): void {
    this.m_pNext = next;
  }
  /** Reads the formatted line height. @returns Twips. */
  public GetRealHeight(): number {
    return this.m_nRealHeight;
  }
  /** Stores device-shaped line height. @param height - Twips. @returns Nothing. */
  public SetRealHeight(height: number): void {
    this.m_nRealHeight = height;
  }
  /** Reads native dummy-line status. @returns Whether this is a dummy. */
  public IsDummy(): boolean {
    return this.m_bDummy;
  }
  /** Sets native dummy-line status. @param dummy - New status. @returns Nothing. */
  public SetDummy(dummy: boolean): void {
    this.m_bDummy = dummy;
  }
}
/** Native paragraph object also serving as its original first line. */
export class SwParaPortion extends SwLineLayout {
  /** Sums actual line lengths as the native paragraph does. @returns UTF-16 length. */
  public GetParLen(): number {
    let length = this.GetLen();
    let line = this.GetNext();
    while (line !== undefined) {
      length += line.GetLen();
      line = line.GetNext();
    }
    return length;
  }
}
