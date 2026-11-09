/** @fileoverview Implements the bounded style-pool manager from pinned LibreOffice `sw/source/core/doc/DocumentStylePoolManager.cxx`. */

import { getWriterMaterializedParagraphStyleDefinition } from "../../../inc/poolfmt";
import type { SwAttrPool } from "../attr/swatrset";
import { createWriterTextFormatColl, SwTextFormatColl, type WriterParagraphStyle } from "./fmtcol";
import { GetPageDescFromPool } from "./poolfmt-page";
import { applyWriterParagraphStyleDefaults } from "./poolfmt-defaults";

import { SwCharFormat } from "../../../inc/charfmt";
import {
  WRITER_CHARACTER_STYLE_POOL,
  POOLGRP_CHARFMT,
  COLL_GET_RANGE_BITS,
  POOLGRP_NOCOLLID,
  POOLGRP_FRAMEFMT,
  SwPoolFormatId,
} from "../../../inc/poolfmt";
import { applyWriterCharacterStyleDefaults } from "./poolfmt-char";
import { ApplyFrameFormatPoolDefaults } from "./poolfmt-frame";
import { SwFrameFormat } from "../layout/atrfrm";

const framePoolNames = [
  "Frame",
  "Graphics",
  "OLE",
  "Formula",
  "Marginalia",
  "Watermark",
  "Labels",
  "Inline Heading",
] as const;

/** Owns document paragraph-style collections and their parent/follow graph. */
export class DocumentStylePoolManager {
  private readonly characters: SwCharFormat[] = [];
  private readonly collections: SwTextFormatColl[] = [];
  private readonly collectionsById = new Map<string, SwTextFormatColl>();

  /** Creates the manager and materializes Writer's default collection. @param attrPool - Document pool. @returns Nothing. */
  public constructor(private readonly attrPool: SwAttrPool) {
    this.GetTextFormatColl("default");
  }

  /** Native consumed page-pool entry using the actual document page collection. @param id - Native pool ID. @param regardLanguage - Original creation flag. @returns Borrowed page owner. */
  public GetPageDescFromPool(id: number, regardLanguage = true) {
    return GetPageDescFromPool(this.attrPool.GetDoc(), id, regardLanguage);
  }

  /** Original frame-format pool lookup scans special formats before ordinary formats and creates the native named style only if absent. @param id - Source pool identity. @returns Actual pooled frame style or undefined outside its family. */
  public GetFrameFormatFromPool(id: number): SwFrameFormat | undefined {
    id &= 65535;
    if ((id & (COLL_GET_RANGE_BITS + POOLGRP_NOCOLLID)) !== POOLGRP_FRAMEFMT) return undefined;
    if (id < SwPoolFormatId.FRM_BEGIN || id >= SwPoolFormatId.FRM_END)
      id = SwPoolFormatId.FRM_BEGIN;
    const doc = this.attrPool.GetDoc();
    for (const formats of [doc.GetSpzFrameFormats(), doc.GetFrameFormats()])
      for (const format of formats) if (format.GetPoolFormatId() === id) return format;
    const name = framePoolNames[id - SwPoolFormatId.FRM_BEGIN];
    if (name === undefined) throw new Error("assert(Writer frame pool name)");
    const format = new SwFrameFormat(this.attrPool, name, undefined, doc.GetDfltFrameFormat());
    doc.GetFrameFormats().push_back(format);
    format.SetPoolFormatId(id);
    format.SetAuto(false);
    ApplyFrameFormatPoolDefaults(format);
    return format;
  }

  /** Returns the original stable character table, including its default format. @returns Native character owners. */
  public GetCharFormats(): readonly SwCharFormat[] {
    if (this.characters.length === 0)
      this.characters.push(this.attrPool.GetDoc().GetDfltCharFormat());
    return this.characters;
  }
  /** Constructs one named character format and registers its actual parent. The document API owns modified/undo publication. @param name - UI name. @param parent - Native parent. @returns Owned character style. */
  public MakeCharFormat(name: string, parent: SwCharFormat | undefined): SwCharFormat {
    this.GetCharFormats();
    const format = new SwCharFormat(this.attrPool, name, parent);
    format.SetAuto(false);
    this.characters.push(format);
    return format;
  }
  /** Source GetFormatFromPool character branch preserves invalid in-family IDs while using the first UI name, and returns null outside the family. @param id - Original pool identity. @returns Existing/new character format or undefined. */
  public GetCharFormatFromPool(id: number): SwCharFormat | undefined {
    id &= 0xffff;
    if ((id & (COLL_GET_RANGE_BITS + POOLGRP_NOCOLLID)) !== POOLGRP_CHARFMT) return undefined;
    const existing = this.GetCharFormats().find(
      /** Locates the native pool identity independently of its name. @param format - Owner. @returns Match. */ (
        format,
      ) => format.GetPoolFormatId() === id,
    );
    if (existing !== undefined) return existing;
    const definition =
      WRITER_CHARACTER_STYLE_POOL.find(
        /** Looks up the original normal or HTML range. @param entry - Native metadata. @returns Match. */ (
          entry,
        ) => entry.poolId === id,
      ) ?? WRITER_CHARACTER_STYLE_POOL[0];
    /* istanbul ignore if -- B8TCAE-W01: the readonly pinned character pool always has its validated first entry. */
    if (definition === undefined) throw new Error("Writer character pool has no default entry.");
    else {
      /* Keep the genuine owned-value alternative visible to source mapping. */
    }
    const format = this.MakeCharFormat(
      definition.uiName,
      this.attrPool.GetDoc().GetDfltCharFormat(),
    );
    format.SetPoolFormatId(id);
    applyWriterCharacterStyleDefaults(format);
    return format;
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

  /** Registers a newly created document-owned named collection. @param collection - New collection. @returns Registered collection. */
  public AddTextFormatColl(collection: SwTextFormatColl): SwTextFormatColl {
    if (this.collectionsById.has(collection.id))
      throw new Error(`Duplicate SwTextFormatColl: ${collection.id}`);
    this.collectionsById.set(collection.id, collection);
    this.collections.push(collection);
    return collection;
  }

  /** Removes an owned collection from the native table before format destruction. @param collection - Original owner. @returns Nothing. */
  public RemoveTextFormatColl(collection: SwTextFormatColl): void {
    this.collections.splice(this.collections.indexOf(collection), 1);
    this.collectionsById.delete(collection.id);
  }

  /** Finds or creates a supported collection with pinned parent/follow links. @param id - Programmatic identity. @returns Document-owned collection. */
  public GetTextFormatColl(id: WriterParagraphStyle): SwTextFormatColl {
    const existing = this.FindTextFormatColl(id);
    if (existing !== undefined) return existing;
    const definition = getWriterMaterializedParagraphStyleDefinition(id);
    if (definition === undefined) throw new Error(`Unsupported SwTextFormatColl: ${id}`);
    const parent =
      definition.parentId === undefined ? undefined : this.GetTextFormatColl(definition.parentId);
    const collection = createWriterTextFormatColl(this.attrPool, definition, parent);
    applyWriterParagraphStyleDefaults(collection);
    this.collectionsById.set(id, collection);
    this.collections.push(collection);
    collection.SetNextTextFormatColl(
      definition.followId === id ? collection : this.GetTextFormatColl(definition.followId),
    );
    return collection;
  }
}
