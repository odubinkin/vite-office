/** @fileoverview ScInputHandler input-mode subset from inputhdl.cxx/inputhdl.hxx. EditEngine,protection,reference input and VCL view synchronization remain unported;the browser adapter supplies the current scalar draft and focus. */
import { ScInputMode } from "../../../inc/global";
/** Native mode owner used by the active scalar input binding. */
export class ScInputHandler {
  private eMode = ScInputMode.SC_INPUT_NONE;
  private bModified = false;
  private bFormulaMode = false;
  private mbEditingExistingContent = false;
  /** Original formula-mode predicate over the represented native state. @returns Whether formula input is active. */
  IsFormulaMode(): boolean {
    return this.bFormulaMode;
  }
  /** Original StartsLikeFormula:existing content admits equals,new typing also admits plus/minus. @param rStr - UTF16 input view. @returns Whether formula-like. */
  private StartsLikeFormula(rStr: string): boolean {
    return (
      rStr.length > 0 &&
      (rStr[0] === "=" || (!this.mbEditingExistingContent && (rStr[0] === "+" || rStr[0] === "-")))
    );
  }
  /** Explicit browser projection of native StartTable context and UpdateFormulaMode text;EditEngine/protection/highlight/reference services remain unported. @param text - Actual shared draft. @param existingContent - New input context,omitted on subsequent changes. @returns Nothing. */
  UpdateInputState(text: string, existingContent?: boolean): void {
    if (existingContent !== undefined) this.mbEditingExistingContent = existingContent;
    this.bFormulaMode = this.StartsLikeFormula(text);
  }
  /** Explicit browser lifecycle projection of native accepted/cancelled/replaced input state resets. @returns Nothing. */
  ResetInputState(): void {
    this.ResetModified();
    this.bFormulaMode = false;
    this.mbEditingExistingContent = false;
  }
  /** Original inputhdl.hxx SetModified marks actual input changes,independent of final value equality. @returns Nothing. */
  SetModified(): void {
    this.bModified = true;
  }
  /** Browser read boundary for the native EnterHandler2 bOldMod guard;not an upstream public method. @returns Whether input changed. */
  IsModified(): boolean {
    return this.bModified;
  }
  /** Browser lifecycle boundary for native EnterHandler2,CancelHandler and input-state replacement resets;not a complete native handler. @returns Nothing. */
  ResetModified(): void {
    this.bModified = false;
  }
  /** Reads the current native mode. @returns Input mode. */
  GetMode(): ScInputMode {
    return this.eMode;
  }
  /** Changes the mode;native EditEngine/view side effects are outside this bounded mode subset. @param eNewMode - Native input mode. @returns Nothing. */
  SetMode(eNewMode: ScInputMode): void {
    this.eMode = eNewMode;
  }
  /** Toggles TABLE to TYPE and all other modes to TABLE,as inputhdl.cxx. @returns Nothing. */
  StartOrToggleEditMode(): void {
    this.SetMode(
      this.eMode === ScInputMode.SC_INPUT_TABLE
        ? ScInputMode.SC_INPUT_TYPE
        : ScInputMode.SC_INPUT_TABLE,
    );
  }
  /** Reports any pending input. @returns Whether input is active. */
  IsInputMode(): boolean {
    return this.eMode !== ScInputMode.SC_INPUT_NONE;
  }
  /** Reports modes that own caret navigation. @returns Whether editing in place or in input line. */
  IsEditMode(): boolean {
    return this.eMode !== ScInputMode.SC_INPUT_NONE && this.eMode !== ScInputMode.SC_INPUT_TYPE;
  }
  /** Reports formula-line editing. @returns Whether top mode. */
  IsTopMode(): boolean {
    return this.eMode === ScInputMode.SC_INPUT_TOP;
  }
}
