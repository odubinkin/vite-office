/** @fileoverview SpreadsheetML workbook external link order and relationship metadata. */
import {
  MS_OFFICE_RELATION,
  OFFICE_DOCUMENT_RELATION,
  STRICT_OFFICE_DOCUMENT_RELATION,
  type Relations,
} from "../../../../oox/source/core/relations";
import { toInt32 } from "../../../../o3tl/inc/string_view";

/** Original external document link types consumed by the XLSX address reader. */
export type ExternalBookType = "unknown" | "document" | "missingDocument" | "special";

/** Owns a single workbook relationship and its associated external book metadata. */
export class ExternalLink {
  private type: ExternalBookType = "unknown";
  private target = "";
  private readonly sheetNames: string[] = [];

  /** Binds the source workbook relationship. @param relationshipId - Workbook relationship ID. @returns Link. */
  constructor(readonly relationshipId: string) {}

  /** Imports the typed relationship from the externalBook part. @param relations - Internal part's relationship table. @param id - Linked book relationship. @returns Nothing. */
  importExternalBook(relations: Relations, id: string): void {
    const relation = relations.getRelationFromRelId(id);
    if (!relation) return;
    const { maType, maTarget } = relation;
    if (
      maType === OFFICE_DOCUMENT_RELATION + "externalLinkPath" ||
      maType === STRICT_OFFICE_DOCUMENT_RELATION + "externalLinkPath"
    ) {
      if (!maTarget) return;
      this.type = "document";
    } else if (
      maType === MS_OFFICE_RELATION + "xlExternalLinkPath/xlPathMissing" ||
      maType === MS_OFFICE_RELATION + "xlExternalLinkPath/xlStartup"
    )
      this.type = "missingDocument";
    else if (maType === MS_OFFICE_RELATION + "xlExternalLinkPath/xlLibrary") this.type = "special";
    else return;
    this.target = maTarget;
  }

  /** Records the sheet key in source order for the document cache. @param name - Decoded native sheet name. @returns Nothing. */
  importSheetName(name: string): void {
    if (this.type === "document" || this.type === "missingDocument") this.sheetNames.push(name);
  }

  /** Reads the link's native type. @returns Current type. */
  getType(): ExternalBookType {
    return this.type;
  }

  /** Reads the original relationship target. @returns Target from the package. */
  getTarget(): string {
    return this.target;
  }

  /** Reads the workbook's sheet keys in original index order. @returns Borrowed keys. */
  getSheetNames(): readonly string[] {
    return this.sheetNames;
  }
}

/** Keeps the original one-based workbook external reference numbering. */
export class ExternalLinkBuffer implements Iterable<ExternalLink> {
  private readonly links: ExternalLink[] = [];

  /** Appends a workspace-independent external link slot. @param id - Workbook relationship ID. @returns Nothing. */
  importExternalReference(id: string): void {
    this.links.push(new ExternalLink(id));
  }

  /** Selects the external link corresponding to an OOXML index. @param index - Positive OOXML index. @returns Link or absence. */
  getExternalLink(index: number): ExternalLink | undefined {
    return this.links[index - 1];
  }

  /** Checks the numeric workbook qualifier as the native defined-name admission does. @param formula - Source name definition. @returns Whether to create a name. */
  isValidDefinedName(formula: string): boolean {
    const qualifier = /^(?:\[(?:'([0-9]+)'|([0-9]+))\]|'\[([0-9]+)\](?:[^']|'')*'(?=[!:]))/u.exec(
      formula,
    );
    const index = toInt32(qualifier?.[1] ?? qualifier?.[2] ?? qualifier?.[3] ?? "");
    if (index <= 0) return true;
    const type = this.getExternalLink(index)?.getType();
    return type === "document" || type === "missingDocument";
  }

  /** Walks workbook relationships in original source order. @returns External link iterator. */
  [Symbol.iterator](): ArrayIterator<ExternalLink> {
    return this.links.values();
  }
}
