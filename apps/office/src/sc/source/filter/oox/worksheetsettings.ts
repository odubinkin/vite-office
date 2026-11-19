/** @fileoverview WorksheetSettings import of sheet-wide SpreadsheetML settings. */
import type { SaxesAttributeNS } from "saxes";
import { XlsColor, type ExcelGraphicHelper } from "./stylesbuffer.color";
import type { ScDocument } from "../../../inc/document";
import { ScTableProtection } from "../../core/data/tabprotection";
import type { AttributeList } from "../../../../oox/source/helper/attributelist";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { sheetProtectionOptions } from "../inc/sheetprotection";
import type { ScEnhancedProtection, ScOoxPasswordHash } from "../../../inc/tabprotection";
import { ScRange } from "../../../inc/address";
import { ScRangeList } from "../../../inc/rangelst";
import { AddressConverter } from "./addressconverter";

/** Copies a native attribute's string value. @param attributes - Source attributes. @param name - Attribute name. @returns Value or the empty default. */
function readString(attributes: AttributeList, name: string): string {
  const value = attributes.getStringDefaulted(token(name));
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Reads the original OOXML verifier metadata. @param attributes - SpreadsheetML attributes. @returns Verifier. */
function readPasswordHash(attributes: AttributeList): ScOoxPasswordHash {
  return {
    algorithmName: readString(attributes, "algorithmName"),
    hashValue: readString(attributes, "hashValue"),
    saltValue: readString(attributes, "saltValue"),
    spinCount: attributes.getUnsigned(token("spinCount"), 0),
  };
}

/** Retains worksheet settings until the fragment has finished reading. */
export class WorksheetSettings {
  private tabColor = new XlsColor();
  private sheetProtection: ScTableProtection | undefined;
  private readonly enhancedProtection: ScEnhancedProtection[] = [];

  /** Reads the native color source before resolving its theme and tint. @param attributes - SpreadsheetML color attributes. @returns Nothing. */
  importTabColor(attributes: readonly SaxesAttributeNS[]): void {
    this.tabColor = XlsColor.importColor(attributes);
  }

  /** Reads the original sheet flag, permissions and both password hash representations. @param attributes - SpreadsheetML attributes. @returns Nothing. */
  importSheetProtection(attributes: AttributeList): void {
    this.sheetProtection = undefined;
    if (!attributes.getBool(token("sheet"), false)) return;
    const protection = new ScTableProtection();
    protection.setProtected(true);
    protection.setOoxPasswordHash(readPasswordHash(attributes));
    const password = attributes.getIntegerHex(token("password"), 0);
    if (password > 0 && password <= 0xffff) protection.setXlPasswordHash(password);
    for (const [option, name, fallback] of sheetProtectionOptions)
      protection.setOption(option, !attributes.getBool(token(name), fallback));
    this.sheetProtection = protection;
  }

  /** Reads the original enhanced exception record, preserving attributes even without an admitted range. @param attributes - Verifier, title and sqref. @param document - Workbook. @param tab - Destination tab. @returns Nothing. */
  importProtectedRange(attributes: AttributeList, document: ScDocument, tab: number): void {
    const ranges = new ScRangeList();
    for (const reference of readString(attributes, "sqref").split(" ")) {
      const range = new ScRange();
      if (AddressConverter.convertToCellRangeUnchecked(range, reference, tab, document))
        ranges.push_back(range);
    }
    this.enhancedProtection.push({
      ranges,
      title: readString(attributes, "name"),
      securityDescriptor: readString(attributes, "securityDescriptor"),
      passwordVerifier: attributes.getIntegerHex(token("password"), 0) >>> 0,
      passwordHash: readPasswordHash(attributes),
    });
  }

  /** Applies sheet settings after the worksheet import. @param document - Workbook. @param tab - Destination sheet. @param graphics - Color resolver. @returns Nothing. */
  finalizeImport(document: ScDocument, tab: number, graphics: ExcelGraphicHelper): void {
    if (this.sheetProtection) {
      this.sheetProtection.setEnhancedProtection(this.enhancedProtection);
      document.SetTabProtection(tab, this.sheetProtection);
    }
    if (!this.tabColor.isAuto()) document.SetTabBgColor(tab, this.tabColor.getColor(graphics));
  }
}
