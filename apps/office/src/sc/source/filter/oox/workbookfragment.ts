/** @fileoverview WorkbookFragment worksheet order and relationship IDs from the SpreadsheetML workbook part. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { DefinedNamesBuffer } from "./defnamesbuffer";
import { WorkbookSettings } from "./workbooksettings";
import { FragmentHandler } from "../../../../oox/source/core/fragmenthandler";
import { toInt32 } from "../../../../o3tl/inc/string_view";
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

/** Original workbook sheet model carries its name and resolved relationship identity. */
export class WorkbookFragment extends FragmentHandler {
  readonly sheets: { name: string; relationshipId: string; state: string }[] = [];
  readonly definedNames = new DefinedNamesBuffer();
  readonly settings = new WorkbookSettings();
  private readonly elementStack: string[] = [];
  private activeTab: number | undefined;

  /** Resolves the first workbook view against the imported sheet index mapping. @returns Active native tab. */
  getActiveCalcSheet(): number {
    const tab = this.activeTab ?? 0;
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
      (parent === "definedNames" && tag.local === "definedName") ||
      (parent === "sheets" && tag.local === "sheet")
      ? this
      : null;
  }
  /** Retains original workbook sheet order and relationship IDs. @param tag - Current element. @param attributes - Native lexical attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    this.elementStack.push(tag.local);
    if (tag.local === "workbookView" && this.activeTab === undefined)
      this.activeTab = toInt32(attribute(attributes, "activeTab"));
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
    if (tag.local !== "sheet") return;
    for (const item of attributes) {
      if (
        item.local === "id" &&
        (item.uri + "/" === OFFICE_DOCUMENT_RELATION ||
          item.uri + "/" === STRICT_OFFICE_DOCUMENT_RELATION)
      ) {
        this.sheets.push({
          name: attribute(attributes, "name"),
          relationshipId: item.value,
          state: attribute(attributes, "state") || "visible",
        });
        return;
      }
    }
    throw new Error("Workbook sheet relationship is missing.");
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
