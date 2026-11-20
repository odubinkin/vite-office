/** @fileoverview Model-text script iteration from Writer txatritr.cxx. */
import { WEAK } from "../../../../offapi/com/sun/star/i18n/ScriptType";
import { g_pBreakIt } from "../bastyp/breakit";

/** Traverses native Writer script boundaries in either search direction. */
export class SwScriptIterator {
  private readonly breaker = g_pBreakIt.GetBreakIter();
  private script: number;
  private change: number;

  /** Initializes the native directional script cursor. @param text - Counted UTF-16 text. @param start - Search position. @param forward - Direction. @returns Script iterator. */
  public constructor(
    private readonly text: Uint16Array,
    start: number,
    private readonly forward: boolean,
  ) {
    if (!forward && start !== 0) --start;
    this.script = this.breaker.getScriptType(text, start);
    if (this.script === WEAK && start !== 0) {
      const weakStart = this.breaker.beginOfScript(text, start, this.script);
      if (weakStart > 0 && weakStart < text.length) {
        start = weakStart - 1;
        this.script = this.breaker.getScriptType(text, start);
      }
    }
    this.change = this.Boundary(start);
  }

  /** Returns the native directional script transition. @returns UTF-16 position. */
  public GetScriptChgPos(): number {
    return this.change;
  }

  /** Returns the script on the current side of the transition. @returns Native script identity. */
  public GetCurrScript(): number {
    return this.script;
  }

  /** Advances to the next script when one is available. @returns Nothing. */
  public Next(): void {
    if (this.forward ? this.change >= 0 && this.change < this.text.length : this.change > 0) {
      const position = this.forward ? this.change : this.change - 1;
      this.script = this.breaker.getScriptType(this.text, position);
      this.change = this.Boundary(position);
    }
  }

  /** Finds the end of this script run in the traversal direction. @param position - Current unit. @returns Native boundary. */
  private Boundary(position: number): number {
    return this.forward
      ? this.breaker.endOfScript(this.text, position, this.script)
      : this.breaker.beginOfScript(this.text, position, this.script);
  }
}
