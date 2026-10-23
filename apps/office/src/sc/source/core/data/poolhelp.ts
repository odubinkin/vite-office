/** @fileoverview Consumed native ScPoolHelper allocation and source lifetime from poolhelp.cxx; number-formatter and edit-engine services remain unported. */
import { ScDocOptions, type ScDocOptionsConstReference } from "../../../inc/docoptio";
import { ScDocumentPool } from "./docpool";
import { ScStyleSheetPool } from "../../../inc/stlpool";
import type { ScDocument } from "../../../inc/document";

/** Actual native shared resource owner; managed references retain the same helper identity. */
export class ScPoolHelper {
  private readonly aOpt: ScDocOptions;
  private readonly pDocPool = new ScDocumentPool();
  private readonly mxStylePool: ScStyleSheetPool;
  /** Allocates document and style pools in native order. @param source - Actual source document. @returns Helper. */
  constructor(source: ScDocument) {
    this.aOpt = new ScDocOptions(source.GetDocOptions());
    this.mxStylePool = new ScStyleSheetPool(this.pDocPool, source);
  }
  /** Borrows the actual item pool. @returns Pool. */
  GetDocPool(): ScDocumentPool {
    return this.pDocPool;
  }
  /** Borrows the actual style pool. @returns Pool. */
  GetStylePool(): ScStyleSheetPool {
    return this.mxStylePool;
  }
  /** Retains formatter options by value without allocating the original lazy formatter. @param options - Source options. @returns Nothing. */
  SetFormTableOpt(options: ScDocOptionsConstReference): void {
    this.aOpt.assign(options);
  }
  /** Clears the consumed source binding. No number formatter exists in this profile. @returns Nothing. */
  SourceDocumentGone(): void {
    this.mxStylePool.SetDocument(null);
  }
}
