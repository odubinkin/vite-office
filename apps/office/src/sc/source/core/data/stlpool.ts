/** @fileoverview Native ScStyleSheetPool allocation and source-document binding from stlpool.cxx; Calc style factories and standard-style population remain unported. */
import { SfxStyleSheetPool } from "../../../../svl/source/items/style-sheet";
import type { SfxStyleSheetBase } from "../../../../svl/source/items/style-model";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import type { SfxStyleFamily, SfxStyleSearchBits } from "../../../../svl/inc/style-values";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import type { ScDocument } from "../../../inc/document";

/** Actual shared style-pool base with the native Calc document pointer. */
export class ScStyleSheetPool extends SfxStyleSheetPool {
  /** Creates the actual native pool without populating standard styles. @param pool - Owned document item pool. @param pDoc - Source document. @returns Pool. */
  constructor(
    pool: SfxItemPool,
    private pDoc: ScDocument | null,
  ) {
    super(pool);
  }
  /** Rebinds the native source pointer, including observable source destruction. @param document - Source or null. @returns Nothing. */
  SetDocument(document: ScDocument | null): void {
    this.pDoc = document;
  }
  /** Borrows the native source pointer. @returns Source or null. */
  GetDocument(): ScDocument | null {
    return this.pDoc;
  }
  /** Calc factories must create ScStyleSheet, never the shared base type. @param args - Original factory arguments. @returns No style until the Calc factory is ported. */
  protected override Create(
    ...args:
      | [source: SfxStyleSheetBase]
      | [
          name: OUStringConstReference,
          family: SfxStyleFamily,
          mask: SfxStyleSearchBits,
          parent: OUStringConstReference | undefined,
        ]
  ): SfxStyleSheetBase {
    void args;
    throw new Error("ScStyleSheetPool::Create: native Calc style factory is not ported");
  }
}
