/** @fileoverview Original conditional-format manager owns a draft list and returns typed responses. */
import { ScConditionalFormatList, type ScConditionalFormat } from "../../../inc/conditio";
import type { ScDocument } from "../../../inc/document";

/** Response codes from the original manager buttons. */
export type ConditionalManagerResult =
  { readonly kind: "apply" | "add" } | { readonly kind: "edit"; readonly key: number };

/** Original ScCondFormatManagerDlg draft owner. */
export class ScCondFormatManagerDlg {
  private changed = false;
  private list: ScConditionalFormatList | undefined;

  /** Creates an independent session over the live list. @param document - Workbook. @param tab - Active sheet. @returns Manager. */
  constructor(
    readonly document: ScDocument,
    readonly tab: number,
  ) {
    this.list = new ScConditionalFormatList(document.FetchTable(tab)?.GetCondFormList());
  }

  /** Borrows currently staged entries for the source tree. @returns Entries. */
  GetFormats(): readonly ScConditionalFormat[] {
    return this.list ? [...this.list] : [];
  }

  /** Removes a selected format from the staged list. @param key - Stable native identity. @returns Nothing. */
  Remove(key: number): void {
    if (!this.list?.GetFormat(key)) return;
    this.list.erase(key);
    this.changed = true;
  }

  /** Applies a nested Add or Edit result to the draft without changing the sheet. @param key - Old key or zero. @param format - Owned replacement or deletion. @returns Nothing. */
  Edit(key: number, format: ScConditionalFormat | null): void {
    const list = this.list;
    if (!list) {
      format?.Dispose();
      return;
    }
    if (key) list.erase(key);
    if (format) {
      format.SetKey(key || list.getMaxKey() + 1);
      list.InsertNew(format);
    }
    this.changed = true;
  }

  /** Transfers ownership of changed entries to the source document function. @returns Accepted list when modified. */
  TakeResult(): ScConditionalFormatList | undefined {
    if (!this.changed) return undefined;
    const result = this.list;
    this.list = undefined;
    return result;
  }

  /** Disposes the abandoned clone. @returns Nothing. */
  Dispose(): void {
    this.list?.Dispose();
    this.list = undefined;
  }
}
