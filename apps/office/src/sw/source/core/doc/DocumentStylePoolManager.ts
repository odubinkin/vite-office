/** @fileoverview Implements the bounded style-pool manager from pinned LibreOffice `sw/source/core/doc/DocumentStylePoolManager.cxx`. */

import { getWriterParagraphStyleDefinition } from "../../../inc/poolfmt";
import type { SwAttrPool } from "../attr/swatrset";
import { createWriterTextFormatColl, SwTextFormatColl, type WriterParagraphStyle } from "./fmtcol";

/** Owns document paragraph-style collections and their parent/follow graph. */
export class DocumentStylePoolManager {
  private readonly collections: SwTextFormatColl[] = [];
  private readonly collectionsById = new Map<string, SwTextFormatColl>();

  /** Creates the manager and materializes Writer's default collection. @param attrPool - Document pool. @returns Nothing. */
  public constructor(private readonly attrPool: SwAttrPool) {
    this.GetTextFormatColl("default");
  }

  /** Returns the default paragraph collection. @returns Default collection. */
  public GetDfltTextFormatColl(): SwTextFormatColl {
    return this.collections[0] as SwTextFormatColl;
  }

  /** Returns collections in creation order. @returns Document-owned collections. */
  public GetTextFormatColls(): readonly SwTextFormatColl[] {
    return this.collections;
  }

  /** Finds a supported collection. @param id - Programmatic identity. @returns Existing collection. */
  public FindTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl | undefined {
    return this.collectionsById.get(id);
  }

  /** Finds or creates a supported collection with pinned parent/follow links. @param id - Programmatic identity. @returns Document-owned collection. */
  public GetTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl {
    const existing = this.FindTextFormatColl(id);
    if (existing !== undefined) return existing;
    const definition = getWriterParagraphStyleDefinition(id);
    if (definition === undefined) throw new Error(`Unknown SwTextFormatColl: ${id}`);
    const parent =
      definition.parentId === undefined ? undefined : this.GetTextFormatColl(definition.parentId);
    const collection = createWriterTextFormatColl(this.attrPool, definition, parent);
    this.collectionsById.set(id, collection);
    this.collections.push(collection);
    collection.SetNextTextFormatColl(
      definition.followId === id ? collection : this.GetTextFormatColl(definition.followId),
    );
    return collection;
  }
}
