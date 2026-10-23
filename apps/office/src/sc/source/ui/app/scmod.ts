/** @fileoverview Original normal-input ScModule reference dispatch;active-view lookup is an explicit browser host borrow. Reference dialogs and edit-command services remain unported. */
import { ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import type { ScInputHandler } from "../inc/inputhdl";
/** Actual module-owned reference-input receiver,scoped to one browser Calc host rather than a process-global window singleton. */
export class ScModule {
  private m_pRefInputHandler: ScInputHandler | null = null;
  /** Borrows the actual active-view lookup. @param activeInput - Active native input handler. @returns Module. */
  constructor(private readonly activeInput: () => ScInputHandler | null) {}
  /** Original reference receiver takes precedence over the active view when requested. @param useRef - Consult reference handler. @returns Receiver. */
  GetInputHdl(useRef = true): ScInputHandler | null {
    return useRef && this.m_pRefInputHandler ? this.m_pRefInputHandler : this.activeInput();
  }
  /** Original borrowed reference handler assignment. @param handler - Receiver or null. @returns Nothing. */
  SetRefInputHdl(handler: ScInputHandler | null): void {
    this.m_pRefInputHandler = handler;
  }
  /** Original ordinary-input formula-mode dispatch. @returns Formula mode. */
  IsFormulaMode(): boolean {
    return this.GetInputHdl()?.IsFormulaMode() ?? false;
  }
  /** Original ScModule always orders both range endpoints before dispatching to the actual input handler. @param reference - Pointer range. @param doc - Reference document. @returns Nothing. */
  SetReference(reference: ScRange, doc: ScDocument): void {
    const ordered = new ScRange(reference);
    ordered.PutInOrder();
    this.GetInputHdl()?.SetReference(ordered, doc);
  }
  /** Original ordinary-input reference continuation dispatch. @returns Nothing. */
  AddRefEntry(): void {
    this.GetInputHdl()?.AddRefEntry();
  }
}
