/** @fileoverview ScInputHandler input-mode subset from inputhdl.cxx/inputhdl.hxx. Local reference selection uses the actual borrowed browser draft/caret;complete EditEngine,protection,reference dialogs and VCL view synchronization remain unported. */
import { ScAddress, ScRange, ScRefFlags } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScTabViewShell } from "../inc/tabvwsh";
import { ESelection } from "../../../../editeng/inc/ESelection";
import { ScInputMode } from "../../../inc/global";
/** Borrowed browser edit binding for the active single-line view;this is not a replacement EditEngine or EditView. */
export interface ScInputReferenceInput {
  GetText(): string;
  GetSelection(): ESelection;
  SetSelection(selection: ESelection): void;
  InsertText(text: string, select: boolean): void;
}
/** Native mode owner used by the active scalar input binding. */
export class ScInputHandler {
  private pReferenceInput: ScInputReferenceInput | null = null;
  private pActiveViewSh: ScTabViewShell | null = null;
  private aCursorPos = new ScAddress();
  private bSelIsRef = false;
  /** Borrows the actual active browser edit view and native edit-origin position. @param input - Browser binding or absent view. @param cursor - Original editing cell. @param view - Actual active native view shell or absent view. @returns Nothing. */
  BindReferenceInput(
    input: ScInputReferenceInput | null,
    cursor: ScAddress,
    view: ScTabViewShell | null,
  ): void {
    this.pActiveViewSh = view;
    this.pReferenceInput = input;
    this.aCursorPos.assign(cursor);
  }
  /** Original selection collapse preserves the end endpoint. @returns Nothing. */
  RemoveSelection(): void {
    const input = this.pReferenceInput;
    if (!input) return;
    const selection = input.GetSelection();
    selection.CollapseToEnd();
    input.SetSelection(selection);
  }
  /** Browser projection of original KeyInput/Command removal of a pointer-selected reference before text editing. @returns Nothing. */
  PrepareReferenceInput(): void {
    if (this.bSelIsRef) {
      this.RemoveSelection();
      this.bSelIsRef = false;
    }
  }
  /** Original selected-reference state projection used for painting and DOM selection synchronization. @returns Selected reference. */
  IsReferenceSelection(): boolean {
    return this.bSelIsRef;
  }
  /** Browser caret changes end the native pointer-selection state. @returns Nothing. */
  ReferenceSelectionChanged(): void {
    this.bSelIsRef = false;
  }
  /** Original AddRefEntry retains native separator and whole-text trailing-space rules. @returns Nothing. */
  AddRefEntry(): void {
    const input = this.pReferenceInput;
    if (!input) return;
    this.RemoveSelection();
    const value = input.GetText();
    let index = value.length - 1;
    while (index >= 0 && value[index] === " ") --index;
    const last = value[index];
    if (last !== "(" && last !== ";" && last !== "=") input.InsertText(";", false);
    this.SetModified();
    this.UpdateInputState(input.GetText());
  }
  /** Original same-document SetReference replaces the active adjusted selection and never overwrites equals. @param reference - Actual pointer range. @param doc - Document whose reference is inserted. @returns Nothing. */
  SetReference(reference: ScRange, doc: ScDocument): void {
    const input = this.pReferenceInput;
    if (!input) return;
    const selection = input.GetSelection();
    selection.Adjust();
    if (selection.start.nIndex === 0) return;
    if (!this.pActiveViewSh || doc !== this.pActiveViewSh.GetViewData().GetDocument())
      throw new Error("External or inactive document reference input is not implemented");
    if (
      reference.aStart.Tab() !== this.aCursorPos.Tab() ||
      reference.aStart.Tab() !== reference.aEnd.Tab()
    )
      throw new Error("Sheet-qualified formula reference input is not implemented");
    input.SetSelection(selection);
    const value = reference.Format(doc, ScRefFlags.VALID);
    try {
      input.InsertText(String.fromCharCode(...value.getStr().subarray(0, value.getLength())), true);
    } finally {
      value.dispose();
    }
    this.SetModified();
    this.UpdateInputState(input.GetText());
    this.bSelIsRef = true;
  }
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
    this.bSelIsRef = false;
  }
  /** Explicit browser lifecycle projection of native accepted/cancelled/replaced input state resets. @returns Nothing. */
  ResetInputState(): void {
    this.ResetModified();
    this.bSelIsRef = false;
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
