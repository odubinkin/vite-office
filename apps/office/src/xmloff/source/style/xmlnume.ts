/** @fileoverview Owns supported ODF 1.3 list label-alignment serialization from pinned xmlnume.cxx. */
import type { OdfListLevelLayout } from "../text/txtparae";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { exportFamilyName } from "./XMLFontStylesContext";

/** Native-style UNO properties for one supported numbering level at the XML export boundary. */
export interface XMLListLevelExport extends OdfListLevelLayout {
  readonly kind: "bullet" | "numbered";
  /** Native sal_Int16 UNO NumberingType: ARABIC=4, NUMBER_NONE=5, CHAR_SPECIAL=6. */
  readonly numberingType?: number;
  readonly bulletChar?: string;
  /** Represented Name member of the native BulletFont descriptor. */
  readonly bulletFont?: Readonly<{ name: string }>;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly startWith?: number;
  readonly parentNumbering?: number;
}

/** Source-owned standard ODF numbering exporter with an XML attribute encoding port. */
export class SvxXMLNumRuleExport {
  /** Binds XML encoding and borrowed font declarations. @param escapeValue - XML encoding. @param fontFaceName - Existing font pool lookup; does not register fonts. @returns Exporter. */
  public constructor(
    private readonly escapeValue: (value: string) => string,
    private readonly fontFaceName?: (familyName: string) => string | undefined,
  ) {}
  /** Exports one native numbering property sequence. @param level - Zero-based level. @param properties - Level properties. @returns Standard ODF 1.3 XML. */
  public exportLevelStyle(level: number, properties: XMLListLevelExport): string {
    const attributes = [`text:level="${level + 1}"`];
    const type = properties.numberingType ?? (properties.kind === "bullet" ? 6 : 4);
    if (properties.prefix)
      attributes.push(`style:num-prefix="${this.escapeValue(properties.prefix)}"`);
    if (properties.suffix)
      attributes.push(`style:num-suffix="${this.escapeValue(properties.suffix)}"`);
    const element = type === 6 ? "text:list-level-style-bullet" : "text:list-level-style-number";
    if (type === 6) {
      let bullet = properties.bulletChar ?? "\uF095";
      if (bullet.length !== 0 && (bullet.codePointAt(0) as number) < 32) bullet = "\uF095";
      attributes.push(`text:bullet-char="${this.escapeValue(bullet)}"`);
    } else {
      attributes.push(
        `style:num-format="${new SvXMLUnitConverter("mm100").convertNumFormat(type)}"`,
      );
      const start = properties.startWith ?? 1;
      if (start !== 1) attributes.push(`text:start-value="${start}"`);
      const display = Math.min(properties.parentNumbering ?? 1, level + 1);
      if (display > 1 && type !== 5) attributes.push(`text:display-levels="${display}"`);
    }
    const family = type === 6 ? (properties.bulletFont?.name ?? "") : "";
    let fontProperties = "";
    if (family !== "") {
      const face = this.fontFaceName?.(family);
      const attribute =
        face === undefined || face === ""
          ? `fo:font-family="${this.escapeValue(exportFamilyName(family))}"`
          : `style:font-name="${this.escapeValue(face)}"`;
      fontProperties = `<style:text-properties ${attribute}/>`;
    }
    return `<${element} ${attributes.join(" ")}>${exportListLevelLayout(properties)}${fontProperties}</${element}>`;
  }
}

/** Emits native mode and conditional label-alignment attributes. @param layout - Native UNO MM100 properties, or no supported alignment. @returns List-level XML. */
export function exportListLevelLayout(layout: OdfListLevelLayout | undefined): string {
  if (layout === undefined) return "";
  const converter = new SvXMLUnitConverter("mm100");
  if (layout.positionAndSpaceMode !== "label-alignment") {
    const before = (layout.absLSpace ?? 0) + (layout.firstLineOffset ?? 0);
    const width = -(layout.firstLineOffset ?? 0);
    const distance = layout.charTextDistance ?? 0;
    const attributes: string[] = [];
    if (before !== 0)
      attributes.push(`text:space-before="${converter.convertMeasureToXML(before)}"`);
    if (width !== 0)
      attributes.push(`text:min-label-width="${converter.convertMeasureToXML(width)}"`);
    if (distance > 0)
      attributes.push(`text:min-label-distance="${converter.convertMeasureToXML(distance)}"`);
    return `<style:list-level-properties${attributes.length === 0 ? "" : ` ${attributes.join(" ")}`}></style:list-level-properties>`;
  }
  const follow = layout.labelFollowedBy ?? "listtab";
  const tabPosition = layout.listTabPosition ?? 0;
  const firstLineIndent = layout.firstLineIndent ?? 0;
  const indentAt = layout.indentAt ?? 0;
  const attributes = [`text:label-followed-by="${follow}"`];
  if (follow === "listtab" && tabPosition > 0)
    attributes.push(`text:list-tab-stop-position="${converter.convertMeasureToXML(tabPosition)}"`);
  if (firstLineIndent !== 0)
    attributes.push(`fo:text-indent="${converter.convertMeasureToXML(firstLineIndent)}"`);
  if (indentAt !== 0)
    attributes.push(`fo:margin-left="${converter.convertMeasureToXML(indentAt)}"`);
  return `<style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment ${attributes.join(" ")}/></style:list-level-properties>`;
}
