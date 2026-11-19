/** @fileoverview XML records exported by the original excrecds.cxx owner. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { XclXmlUtils, type XclExpXmlStream } from "./xestream";
import { COL_AUTO, type Color } from "../../../../tools/inc/color";
import type { ScTableProtection } from "../../core/data/tabprotection";
import { sheetProtectionOptions } from "../inc/sheetprotection";
import type { ScDocument } from "../../../inc/document";
import { ScAddress, ScRefFlags, type ScRange } from "../../../inc/address";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Formats one native OOXML sqref element, including whole-row and whole-column shorthand. @param document - Workbook. @param range - Entry. @returns OOXML address. */
function formatRange(document: ScDocument, range: ScRange): string {
  const value = range.Format(
    document,
    ScRefFlags.VALID,
    new ScAddress.Details(FormulaGrammar.AddressConvention.CONV_XL_OOX),
  );
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Writes the represented worksheet properties in native SpreadsheetML order. */
export class XclExpXmlSheetPr {
  /** Binds worksheet properties. @param tabColor - Canonical sheet color. @param fitToPage - Associated print fitting mode. @returns Worksheet record. */
  constructor(
    private readonly tabColor: Color,
    private readonly fitToPage?: boolean,
  ) {}

  /** Writes a custom color before the other worksheet records. @param stream - Worksheet XML stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    if (this.tabColor.equals(COL_AUTO) && this.fitToPage === undefined) return;
    const writer = stream.GetCurrentStream();
    writer.startElement(token("sheetPr"));
    if (!this.tabColor.equals(COL_AUTO))
      writer.singleElement(token("tabColor"), token("rgb"), XclXmlUtils.ToOString(this.tabColor));
    if (this.fitToPage !== undefined)
      writer.singleElement(token("pageSetUpPr"), token("fitToPage"), String(this.fitToPage));
    writer.endElement(token("sheetPr"));
  }
}

/** Writes the XLSX worksheet protection record and omits its default attributes. */
export class XclExpSheetProtection {
  /** Binds the worksheet protection record. @param document - Workbook. @param protection - Sheet settings. @returns Export record. */
  constructor(
    private readonly document: ScDocument,
    private readonly protection: Readonly<ScTableProtection>,
  ) {}

  /** Writes both available hash forms and the inverse permission flags. @param stream - Workbook XML stream. @returns Nothing. */
  SaveXml(stream: XclExpXmlStream): void {
    const hash = this.protection.getOoxPasswordHash();
    const password = this.protection.getXlPasswordHash();
    const attributes: (number | string | null)[] = [];
    if (hash?.hashValue) {
      attributes.push(
        token("algorithmName"),
        hash.algorithmName || null,
        token("hashValue"),
        hash.hashValue,
        token("saltValue"),
        hash.saltValue || null,
        token("spinCount"),
        hash.spinCount ? String(hash.spinCount) : null,
      );
    }
    attributes.push(
      token("sheet"),
      "true",
      token("password"),
      password ? password.toString(16) : null,
    );
    for (const [option, name, fallback] of sheetProtectionOptions) {
      const disabled = !this.protection.isOptionEnabled(option);
      if (disabled !== fallback) attributes.push(token(name), String(disabled));
    }
    const writer = stream.GetCurrentStream();
    writer.singleElement(token("sheetProtection"), ...attributes);
    const ranges = this.protection.getEnhancedProtection();
    if (!ranges.length) return;
    writer.startElement(token("protectedRanges"));
    for (const entry of ranges) {
      if (entry.ranges.empty()) continue;
      const refs: string[] = [];
      for (const range of entry.ranges) refs.push(formatRange(this.document, range));
      const hash = entry.passwordHash;
      writer.singleElement(
        token("protectedRange"),
        token("name"),
        entry.title || null,
        token("securityDescriptor"),
        entry.securityDescriptor || null,
        token("password"),
        entry.passwordVerifier ? entry.passwordVerifier.toString(16) : null,
        token("algorithmName"),
        hash.algorithmName || null,
        token("hashValue"),
        hash.hashValue || null,
        token("saltValue"),
        hash.saltValue || null,
        token("spinCount"),
        hash.spinCount ? String(hash.spinCount) : null,
        token("sqref"),
        refs.join(" "),
      );
    }
    writer.endElement(token("protectedRanges"));
  }
}
