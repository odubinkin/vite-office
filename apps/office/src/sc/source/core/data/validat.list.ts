/** @fileoverview Native Calc validation list ownership from validat.cxx. */
import type {
  RefUpdateDeleteTabContext,
  RefUpdateInsertTabContext,
} from "../../../inc/refupdatecontext";
import type { ScValidationData } from "./validat";

/** The document-owned ordered table of native validation identities. */
export class ScValidationDataList {
  private readonly entries = new Map<number, ScValidationData>();

  /** Finds a rule by its actual cell pattern key. @param key - Native validation identity. @returns Borrowed rule, if present. */
  public GetData(key: number): ScValidationData | undefined {
    return this.entries.get(key);
  }

  /** Transfers a document-owned rule into the list. @param rule - Connected validation rule. @returns Nothing. */
  public InsertNew(rule: ScValidationData): void {
    const key = rule.GetKey();
    if (this.entries.has(key)) throw new Error("Duplicate Calc validation key");
    this.entries.set(key, rule);
  }

  /** Updates every native rule before an existing tab is shifted. @param context - Sheet insertion. @returns Nothing. */
  public UpdateInsertTab(context: RefUpdateInsertTabContext): void {
    for (const rule of this.entries.values()) rule.UpdateInsertTab(context);
  }

  /** Updates every native rule before the sheet is removed. @param context - Sheet deletion. @returns Nothing. */
  public UpdateDeleteTab(context: RefUpdateDeleteTabContext): void {
    for (const rule of this.entries.values()) rule.UpdateDeleteTab(context);
  }

  /** Iterates the document's allocation order. @returns Borrowed rules. */
  public [Symbol.iterator](): IterableIterator<ScValidationData> {
    return this.entries.values();
  }

  /** Releases the owned native rule tokens. @returns Nothing. */
  public Dispose(): void {
    for (const rule of this.entries.values()) rule.Dispose();
    this.entries.clear();
  }
}
