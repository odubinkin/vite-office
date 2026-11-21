/** @fileoverview WorkbookFragment worksheet order and relationship IDs from the SpreadsheetML workbook part. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { DefinedNamesBuffer } from "./defnamesbuffer";
import { ExternalLinkBuffer } from "./externallinkbuffer";
import { WorkbookSettings } from "./workbooksettings";
import { FragmentHandler } from "../../../../oox/source/core/fragmenthandler";
import { ViewSettings } from "./viewsettings";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { AttributeList } from "../../../../oox/source/helper/attributelist";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import {
  OFFICE_DOCUMENT_RELATION,
  STRICT_OFFICE_DOCUMENT_RELATION,
} from "../../../../oox/source/core/relations";

export const spreadsheetNamespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
export const strictSpreadsheetNamespace = "http://purl.oclc.org/ooxml/spreadsheetml/main";

/** Recognizes Strict and Transitional SpreadsheetML. @param tag - Expanded element name. @returns Namespace admission. */
export function isSpreadsheetTag(tag: SaxesTagNS): boolean {
  return tag.uri === spreadsheetNamespace || tag.uri === strictSpreadsheetNamespace;
}

/** Retrieves an admitted plain SpreadsheetML attribute. @param attributes - Element attributes. @param name - Local attribute name. @returns Lexical value. */
export function attribute(attributes: readonly SaxesAttributeNS[], name: string): string {
  for (const item of attributes) if (item.local === name && item.uri === "") return item.value;
  return "";
}

/** Retrieves a strict or transitional relationship ID. @param attributes - SpreadsheetML attributes. @returns Relation identifier. */
export function relationshipId(attributes: readonly SaxesAttributeNS[]): string {
  for (const item of attributes)
    if (
      item.local === "id" &&
      (item.uri + "/" === OFFICE_DOCUMENT_RELATION ||
        item.uri + "/" === STRICT_OFFICE_DOCUMENT_RELATION)
    )
      return item.value;
  return "";
}

/** Original workbook sheet model carries its name and resolved relationship identity. */
export class WorkbookFragment extends FragmentHandler {
  readonly sheets: { name: string; relationshipId: string; state: string }[] = [];
  readonly definedNames = new DefinedNamesBuffer();
  readonly externalLinks = new ExternalLinkBuffer();
  readonly settings = new WorkbookSettings();
  readonly views = new ViewSettings();
  private readonly elementStack: string[] = [];
  private readonly tokenHandler = new FastTokenHandler();

  /** Resolves the first workbook view against the imported sheet index mapping. @returns Active native tab. */
  getActiveCalcSheet(): number {
    const tab = this.views.getActiveTab();
    return this.sheets[tab] ? tab : 0;
  }

  /** Original workbook, sheets and sheet context selection. @param tag - Current element. @returns Admitted context. */
  override createFastChildContext(tag: SaxesTagNS): WorkbookFragment | null {
    if (!isSpreadsheetTag(tag)) return null;
    const parent = this.elementStack.at(-1);
    return (parent === undefined && tag.local === "workbook") ||
      (parent === "workbook" && tag.local === "sheets") ||
      (parent === "workbook" && tag.local === "bookViews") ||
      (parent === "bookViews" && tag.local === "workbookView") ||
      (parent === "workbook" && tag.local === "workbookPr") ||
      (parent === "workbook" && tag.local === "definedNames") ||
      (parent === "workbook" && tag.local === "externalReferences") ||
      (parent === "externalReferences" && tag.local === "externalReference") ||
      (parent === "definedNames" && tag.local === "definedName") ||
      (parent === "sheets" && tag.local === "sheet")
      ? this
      : null;
  }
  /** Retains original workbook sheet order and relationship IDs. @param tag - Current element. @param attributes - Native lexical attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    this.elementStack.push(tag.local);
    if (tag.local === "workbookView") this.importWorkbookView(attributes);
    if (tag.local === "workbookPr")
      this.settings.importWorkbookPr(
        attributes.find(
          /** Identifies the unqualified date mode. @param entry - XML attribute. @returns Match. */
          (entry) => entry.local === "date1904" && entry.uri === "",
        )?.value,
      );
    if (tag.local === "definedName")
      this.definedNames.importDefinedName(
        /** Reads an admitted workbook attribute. @param name - XML name. @returns Lexical value. */
        (name) => attribute(attributes, name),
      );
    if (tag.local === "externalReference")
      this.externalLinks.importExternalReference(relationshipId(attributes));
    if (tag.local !== "sheet") return;
    const id = relationshipId(attributes);
    if (!id) throw new Error("Workbook sheet relationship is missing.");
    this.sheets.push({
      name: attribute(attributes, "name"),
      relationshipId: id,
      state: attribute(attributes, "state") || "visible",
    });
  }
  /** Delivers native typed attributes to the Calc view settings owner. @param attributes - Unqualified spreadsheet attributes. @returns Nothing. */
  private importWorkbookView(attributes: readonly SaxesAttributeNS[]): void {
    const fast = new FastAttributeList(this.tokenHandler);
    const reference = new Reference(fast);
    const values = new AttributeList(reference);
    try {
      for (const item of attributes) if (item.uri === "") fast.add(token(item.local), item.value);
      this.views.importWorkbookView(values);
    } finally {
      values.dispose();
      reference.dispose();
    }
  }
  /** Releases the current workbook context. @returns Nothing. */
  override endFastElement(): void {
    if (this.elementStack.pop() === "definedName") this.definedNames.finishDefinedName();
  }
  /** Collects the active workbook name formula. @param value - Source text. @returns Nothing. */
  override characters(value: string): void {
    this.definedNames.appendFormula(value);
  }
}
