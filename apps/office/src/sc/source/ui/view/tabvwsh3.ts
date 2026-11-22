/** @fileoverview Calc tab shell execution for native sheet protection. */
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { FID_PROTECT_TABLE } from "../../../sdi/tabvwsh";
import { ScTableProtectionDlg, type ScSheetProtectionResult } from "../miscdlgs/protectiondlg";
import type { ScTabViewShell } from "./tabvwsh4";

/** View-owned boundary for native protection prompts and host input. */
export interface ScProtectTableHost {
  Configure(dialog: ScTableProtectionDlg): Promise<ScSheetProtectionResult | undefined>;
  RequestPassword(): Promise<string | undefined>;
  ShowIncorrectPassword(): Promise<void>;
  CommitInput(): boolean;
  IsCurrent(): boolean;
}

/** Runs the original FID_PROTECT_TABLE request against the current view. @param view - Actual tab shell. @param request - Source request. @param host - Modal and input host. @returns Whether any protection changed. */
export async function ExecProtectTable(
  view: ScTabViewShell,
  request: SfxRequest,
  host: ScProtectTableHost,
): Promise<boolean> {
  const data = view.GetViewData();
  const doc = data.GetDocument();
  const tab = data.GetTabNumber();
  const old = doc.GetTabProtection(tab);
  const wasProtected = old?.isProtected() ?? false;
  const args = request.GetArgs();
  const arg = args.find(
    /** Reads the native BoolItem Which ID. @param item - Request item. @returns Match. */
    (item) => item.Which() === FID_PROTECT_TABLE,
  );
  if (arg instanceof SfxBoolItem && arg.GetValue() === wasProtected) {
    request.Ignore();
    return false;
  }

  const origin = [...data.GetMarkData()].map(
    /** Captures active sheet identities across modal and digest awaits. @param index - Selected tab. @returns Sheet and its protection. */
    (index) => ({ index, sheet: doc.FetchTable(index), protection: doc.GetTabProtection(index) }),
  );
  /** Tests the original command target after a deferred response. @returns Whether the view and target are current. */
  function isCurrent(): boolean {
    const selected = [...data.GetMarkData()];
    return (
      host.IsCurrent() &&
      data.GetTabNumber() === tab &&
      origin.length === selected.length &&
      origin.every(
        /** Checks unchanged sheet ownership and current marks. @param entry - Original sheet. @param index - Selection index. @returns Match. */
        (entry, index) =>
          entry.index === selected[index] &&
          entry.sheet === doc.FetchTable(entry.index) &&
          entry.protection === doc.GetTabProtection(entry.index),
      )
    );
  }

  const promptPassword = old?.isProtectedWithPass() ?? false;
  const modal = !wasProtected || promptPassword;
  const recorded =
    args.length === 0 && modal
      ? new SfxRequest(request.GetSlot(), [], request.GetCallMode())
      : undefined;
  if (recorded) request.Ignore();

  if (wasProtected) {
    const password = promptPassword ? await host.RequestPassword() : "";
    if (!isCurrent()) return false;
    const result =
      password === undefined
        ? { changed: false, wrongPassword: false }
        : await view.Unprotect(tab, password, isCurrent);
    if (result.wrongPassword) await host.ShowIncorrectPassword();
    const completed = recorded ?? (args.length === 0 ? request : undefined);
    completed?.AppendItem(new SfxBoolItem(FID_PROTECT_TABLE, false));
    completed?.Done();
    return result.changed;
  }

  const dialog = new ScTableProtectionDlg(old);
  const result = await host.Configure(dialog);
  if (!result || !isCurrent() || !host.CommitInput()) return false;
  const protection = await dialog.WriteData(result);
  if (!isCurrent()) return false;
  const changed = view.ProtectSheet(protection);
  recorded?.AppendItem(new SfxBoolItem(FID_PROTECT_TABLE, true));
  recorded?.Done();
  return changed;
}
