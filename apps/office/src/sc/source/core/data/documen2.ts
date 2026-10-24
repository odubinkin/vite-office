/** @fileoverview Consumed native ScDocument observable destructor from documen2.cxx,running on its original instance before GC reclaims physical stores. */
import { ScChartListenerCollection } from "../../../inc/chartlis";
import { ScPoolHelper } from "../inc/poolhelp";
import { ScBroadcastAreaSlotMachine } from "../inc/bcaslot";
import { SharedStringPool } from "../../../../svl/inc/sharedstringpool";
import { uppercase } from "../../../../unotools/inc/charclass";
import type { SvNumberFormatter } from "../../../../svl/source/numbers/zforlist";
import type { ScDocument } from "./document";
import { ScTable } from "../../../inc/table";
import type { ScMarkData } from "../../../inc/markdata";
import { OUString, OUStringLiteral } from "../../../../sal/inc/rtl/ustring";

/** Releases consumed native document observer lifetime,starting with area destruction before formula-cell destruction as in documen2. GC owns physical stores. @param this - Actual document instance. @returns Nothing. */
export function Dispose(this: ScDocument): void {
  this["bInDtorClear"] = true;
  const charts = this["pChartListenerCollection"];
  this["pChartListenerCollection"] = null;
  charts?.Dispose();
  const machine = this["pBASM"];
  this["pBASM"] = null;
  machine?.Dispose();
  this.Clear();
  if (this["mxPoolHelper"] && !this.IsClipOrUndo()) this["mxPoolHelper"].SourceDocumentGone();
  this["mxPoolHelper"]?.release();
  this["mxPoolHelper"] = null;
  this["aDocName"].dispose();
}

/** Releases actual attribute registrations at document closure. @param this - Actual document instance. @returns Nothing. */
export function DisposeAttributes(this: ScDocument): void {
  this["pSelectionAttr"]?.Dispose();
  this["pSelectionAttr"] = undefined;
  for (const table of this["maTabs"]) table?.DisposeAttributes();
}

/** Original clipboard initialization for represented scalar documents;options are actual value copies. @param this - Clipboard. @param source - Source owner. @returns Nothing. */
export function InitClipPtrs(this: ScDocument, source: ScDocument): void {
  this.Clear();
  this.SharePooledResources(source);
  this.SetDocOptions(source.GetDocOptions());
  this.SetViewOptions(source.GetViewOptions());
}
/** Original ResetClip overloads retain null slots and actual sheet indexes. @param this - Clipboard. @param source - Source document. @param selection - Marks,all-source null,or explicit sheet. @returns Nothing. */
export function ResetClip(
  this: ScDocument,
  source: ScDocument,
  selection: ScMarkData | number | null,
): void {
  if (!this.IsClipboard()) return;
  this.InitClipPtrs(source);
  const tabs = this["maTabs"];
  if (typeof selection === "number") {
    while (tabs.length <= selection) tabs.push(null);
    const table = new ScTable(
      this,
      selection,
      new OUString(new OUStringLiteral(new Uint16Array([98, 97, 101, 104, 0]))),
    );
    tabs[selection] = table;
    const original = source.FetchTable(selection);
    if (original) table.SetLayoutRTL(original.IsLayoutRTL());
    return;
  }
  for (let index = 0; index < source.GetTableCount(); ++index) {
    const original = source.FetchTable(index);
    if (!original || (selection && !selection.GetTableSelect(index))) continue;
    while (tabs.length <= index) tabs.push(null);
    const table = new ScTable(this, index, original.GetName());
    tabs[index] = table;
    table.SetLayoutRTL(original.IsLayoutRTL());
  }
}

/** Original documen2 construction of mode-dependent native resources and the independent string pool. @param this - Actual document. @returns Nothing. */
export function InitializeResources(this: ScDocument): void {
  if (this.GetAutoCalc()) {
    const helper = new ScPoolHelper(this);
    helper.acquire(); // Original rtl::Reference assignment from the newly constructed raw pointer.
    this["mxPoolHelper"] = helper;
    this["pBASM"] = new ScBroadcastAreaSlotMachine(this);
    this["pChartListenerCollection"] = new ScChartListenerCollection(this);
  }
  const locale = this["locale"];
  this["mpCellStringPool"] = new SharedStringPool({
    /** Applies the existing real whole-string classifier field binding. @param value - Unicode source. @returns Uppercase value. */
    uppercase(value) {
      return uppercase(value, locale);
    },
  });
}

/** Original documen2 GetFormatTable borrows its actual pool owner. A helper must exist,as required by the native dereference;threaded group calculation is outside this slice. @param this - Actual document. @returns Borrowed actual formatter. */
export function GetFormatTable(this: ScDocument): SvNumberFormatter {
  const helper = this["mxPoolHelper"];
  if (!helper) throw new Error("Document pool helper assertion");
  return helper.GetFormTable();
}
