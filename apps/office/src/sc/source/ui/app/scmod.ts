/** @fileoverview Original normal-input ScModule reference dispatch;active-view lookup is an explicit browser host borrow. Reference dialogs and edit-command services remain unported. */
import type { Grammar } from "../../../../formula/inc/grammar";
import type { ScCalcConfig } from "../../../inc/calcconfig";
import { ScDocOptions, type ScTpCalcItem } from "../../../inc/docoptio";
import { SetFormulaDirtyContext } from "../../../inc/refupdatecontext";
import { ScInterpreter } from "../../core/tool/interpr4";
import type { ScDocShell } from "../docshell/docsh";
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
  /** Applies the represented source Calculate and Formula items, then updates the source formula tree when required. @param shell - Active document shell. @param item - Changed Calculate item. @param grammar - Changed Formula syntax. @param config - Changed calculation options. @param writeConfig - Changed scope for calculation options. @returns Whether an item changed. */
  ModifyOptions(
    shell: ScDocShell,
    item?: ScTpCalcItem,
    grammar?: Grammar,
    config?: ScCalcConfig,
    writeConfig?: boolean,
  ): boolean {
    if (!item && grammar === undefined && !config && writeConfig === undefined) return false;
    const doc = shell.GetDocument();
    const old = doc.GetDocOptions();
    let recalculate = Boolean(config);
    if (grammar !== undefined) doc.SetGrammar(grammar);
    if (config) {
      doc.GetCalcConfig().MergeDocumentSpecific(config);
      if (writeConfig ?? old.IsWriteCalcConfig())
        ScInterpreter.GetGlobalConfig().MergeDocumentSpecific(config);
    }
    if (item || writeConfig !== undefined) {
      const next = new ScDocOptions(item?.GetDocOptions() ?? old);
      if (writeConfig !== undefined) next.SetWriteCalcConfig(writeConfig);
      if (item)
        recalculate =
          old.IsIter() !== next.IsIter() ||
          old.GetIterCount() !== next.GetIterCount() ||
          old.GetIterEps() !== next.GetIterEps() ||
          old.IsIgnoreCase() !== next.IsIgnoreCase() ||
          old.IsCalcAsShown() !== next.IsCalcAsShown() ||
          (next.IsCalcAsShown() && old.GetStdPrecision() !== next.GetStdPrecision()) ||
          old.IsMatchWholeCell() !== next.IsMatchWholeCell() ||
          old.GetYear2000() !== next.GetYear2000() ||
          old.IsFormulaRegexEnabled() !== next.IsFormulaRegexEnabled() ||
          old.IsFormulaWildcardsEnabled() !== next.IsFormulaWildcardsEnabled();
      doc.SetDocOptions(next);
    }
    if (recalculate) {
      doc.SetAllFormulasDirty(new SetFormulaDirtyContext());
      doc.CalcFormulaTree();
    }
    shell.SetDocumentModified();
    return true;
  }
  /** Original ordinary-input reference continuation dispatch. @returns Nothing. */
  AddRefEntry(): void {
    this.GetInputHdl()?.AddRefEntry();
  }
}
