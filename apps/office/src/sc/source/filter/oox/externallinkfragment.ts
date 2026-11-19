/** @fileoverview Internal externalLink part reader for XLSX workbook link metadata. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { AttributeConversion } from "../../../../oox/source/helper/attributelist";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { FragmentHandler, type FragmentFilter } from "../../../../oox/source/core/fragmenthandler";
import type { Relations } from "../../../../oox/source/core/relations";
import type { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import type { ExternalLink, ExternalLinkBuffer } from "./externallinkbuffer";
import { attribute, isSpreadsheetTag, relationshipId } from "./workbookfragment";

const childElements: Readonly<Record<string, string>> = {
  "": "externalLink",
  externalLink: "externalBook",
  externalBook: "sheetNames",
  sheetNames: "sheetName",
};

/** Limits the callbacks to the represented external book and sheet name contexts. */
export class ExternalLinkFragment extends FragmentHandler {
  private readonly stack: string[] = [];

  /** Binds one internal OPC part and its external workbook model. @param filter - Package filter. @param path - Internal part. @param relations - Its relationship table. @param link - Workbook link model. @returns Fragment. */
  constructor(
    filter: FragmentFilter,
    path: string,
    private readonly relationsModel: Relations,
    private readonly link: ExternalLink,
  ) {
    super(filter, path, relationsModel);
  }

  /** Selects the exact SpreadsheetML child context. @param tag - Expanded element name. @returns Active context or null. */
  override createFastChildContext(tag: SaxesTagNS): ExternalLinkFragment | null {
    return isSpreadsheetTag(tag) && childElements[this.stack.at(-1) ?? ""] === tag.local
      ? this
      : null;
  }

  /** Collects typed relation metadata and decoded sheet names. @param tag - Expanded element name. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    this.stack.push(tag.local);
    if (tag.local === "externalBook")
      this.link.importExternalBook(this.relationsModel, relationshipId(attributes));
    else if (tag.local === "sheetName") {
      const value = unicode(attribute(attributes, "val"));
      const decoded = AttributeConversion.decodeXString(value);
      try {
        this.link.importSheetName(text(decoded));
      } finally {
        decoded.dispose();
        value.dispose();
      }
    }
  }

  /** Releases the current lexical context. @returns Nothing. */
  override endFastElement(): void {
    this.stack.pop();
  }
}

/** Loads workbook link fragments using only package-internal part paths. @param filter - Open package. @param workbookRelations - Workbook part relationships. @param links - Workbook link slots in source order. @returns Completion. */
export async function importExternalLinkFragments(
  filter: XmlFilterBase,
  workbookRelations: Relations,
  links: ExternalLinkBuffer,
): Promise<void> {
  const relations = workbookRelations.getRelationsFromTypeFromOfficeDoc("externalLink");
  for (const link of links) {
    const path = relations.getFragmentPathFromRelId(link.relationshipId);
    if (!path) continue;
    await filter.importFragment(
      new ExternalLinkFragment(filter, path, await filter.importRelations(path), link),
    );
  }
}
