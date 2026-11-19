/** @fileoverview Original DrawingML theme fragment routing for the consumed color scheme. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { ColorSet } from "../../../docmodel/inc/theme/ColorSet";
import { convertToThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import { FontScheme, Theme } from "../../../docmodel/inc/theme/Theme";
import { Color } from "../../../tools/inc/color";
import { FragmentHandler, type FragmentContext } from "../core/fragmenthandler";
import { getSystemColor } from "../helper/graphichelper";

/** Original DrawingML namespace for the written workbook theme. */
export const drawingNamespace = "http://schemas.openxmlformats.org/drawingml/2006/main";
const drawingStrictNamespace = "http://purl.oclc.org/ooxml/drawingml/main";

/** DrawingML indexes follow the document model, before the separate Excel index permutation. */
export const colorSchemeNames = [
  "dk1",
  "lt1",
  "dk2",
  "lt2",
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
  "accent6",
  "hlink",
  "folHlink",
] as const;

/** Reads an unqualified DrawingML attribute. @param attributes - Expanded attributes. @param name - Source name. @returns Lexical value. */
function attribute(attributes: readonly SaxesAttributeNS[], name: string): string {
  return (
    attributes.find(
      /** Matches the unqualified source attribute. @param item - XML attribute. @returns Match. */
      (item) => item.uri === "" && item.local === name,
    )?.value ?? ""
  );
}

/** Native DrawingML theme owner for relationship-based workbook import. */
export class ThemeFragmentHandler extends FragmentHandler {
  private readonly elements: string[] = [];
  theme: Theme | undefined;

  /** Selects the original theme and its base color entries. @param tag - Expanded XML name. @returns Active context. */
  override createFastChildContext(tag: SaxesTagNS): FragmentContext | null {
    if (tag.uri !== drawingNamespace && tag.uri !== drawingStrictNamespace) return null;
    switch (this.elements.length) {
      case 0:
        return tag.local === "theme" ? this : null;
      case 1:
        return tag.local === "themeElements" ? this : null;
      case 2:
        return tag.local === "clrScheme" || tag.local === "fontScheme" ? this : null;
      case 3:
        if (this.elements.at(-1) === "fontScheme")
          return tag.local === "majorFont" || tag.local === "minorFont" ? this : null;
        return colorSchemeNames.some(
          /** Matches a native DrawingML palette slot. @param name - Schema token. @returns Match. */
          (name) => name === tag.local,
        )
          ? this
          : null;
      case 4:
        if (this.elements.at(-2) === "fontScheme")
          return ["latin", "ea", "cs", "font"].includes(tag.local) ? this : null;
        return tag.local === "srgbClr" || tag.local === "sysClr" ? this : null;
      default:
        return null;
    }
  }

  /** Populates the ordinary native palette from literal RGB and system-color fallback. @param tag - Expanded element. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    const theme = this.theme;
    const name = attribute(attributes, "name");
    if (tag.local === "theme") this.theme = new Theme(name);
    else if (tag.local === "clrScheme" && theme) theme.colorSet = new ColorSet(name);
    else if (tag.local === "fontScheme" && theme) theme.fontScheme = new FontScheme(name);
    else if (tag.local === "srgbClr" || tag.local === "sysClr") {
      const type = convertToThemeColorType(
        colorSchemeNames.findIndex(
          /** Locates the enclosing theme slot. @param name - Palette token. @returns Match. */
          (name) => name === this.elements.at(-1),
        ),
      );
      const rgb = attribute(attributes, tag.local === "sysClr" ? "lastClr" : "val");
      const literal = /^[\da-f]{6}$/i.test(rgb) ? new Color(Number.parseInt(rgb, 16)) : undefined;
      const color =
        tag.local === "sysClr" ? getSystemColor(attribute(attributes, "val"), literal) : literal;
      if (color) theme?.colorSet?.add(type, color);
    } else if (theme) {
      const collection = this.elements.at(-1);
      if (collection === "majorFont" || collection === "minorFont") {
        const typeface = attribute(attributes, "typeface");
        if (tag.local === "font") {
          const supplemental =
            collection === "majorFont"
              ? theme.fontScheme.majorSupplemental
              : theme.fontScheme.minorSupplemental;
          supplemental.push({ script: attribute(attributes, "script"), typeface });
        } else if (tag.local === "latin" || tag.local === "ea" || tag.local === "cs") {
          const pitchFamily = attribute(attributes, "pitchFamily");
          const charset = attribute(attributes, "charset");
          theme.fontScheme[collection].set(tag.local, {
            typeface,
            panose: attribute(attributes, "panose"),
            pitchFamily: /^\d+$/.test(pitchFamily) ? Number(pitchFamily) & 255 : 0,
            charset: /^-?\d+$/.test(charset) ? Number(charset) : 1,
          });
        }
      }
    }
    this.elements.push(tag.local);
  }

  /** Returns to the enclosing theme context. @returns Nothing. */
  override endFastElement(): void {
    this.elements.pop();
  }
}
