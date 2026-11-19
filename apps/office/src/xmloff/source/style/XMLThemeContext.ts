/** @fileoverview Named ODF theme colors shared by the native import and export streams. */
import { ColorSet } from "../../../docmodel/inc/theme/ColorSet";
import { Theme } from "../../../docmodel/inc/theme/Theme";
import {
  convertToThemeColorType,
  ThemeColorType,
} from "../../../docmodel/inc/theme/ThemeColorType";
import { Converter } from "../../../sax/source/tools/converter";
import { Color } from "../../../tools/inc/color";
import { escapeXml } from "../text/txtparae";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";

/** ODF theme types in document-model order. */
export const themeColorNames = [
  "dark1",
  "light1",
  "dark2",
  "light2",
  "accent1",
  "accent2",
  "accent3",
  "accent4",
  "accent5",
  "accent6",
  "hyperlink",
  "followed-hyperlink",
] as const;

/** Reads the original theme name and optional color-set payload. */
export class XMLThemeContext extends SvXMLImportContext {
  private readonly theme: Theme;

  /** Binds the consumer of the actual native theme. @param attributes - ODF theme attributes. @param install - Theme owner callback. @returns Context. */
  constructor(
    attributes: FastAttributeList,
    private readonly install: (theme: Theme) => void,
  ) {
    super();
    this.theme = new Theme(attributes.get(XMLToken.LOEXT_NAME) ?? "");
  }

  /** Selects the original named theme colors collection. @param element - Child token. @param attributes - Child attributes. @returns Selected context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.LOEXT_THEME_COLORS) return null;
    const name = attributes.get(XMLToken.LOEXT_NAME);
    if (name === null) return null;
    const colors = new ColorSet(name);
    this.theme.colorSet = colors;
    return new XMLThemeColorsContext(colors);
  }

  /** Installs the theme when its named collection has been read. @returns Nothing. */
  override endFastElement(): void {
    if (this.theme.colorSet) this.install(this.theme);
  }
}

/** Populates the actual named palette. */
class XMLThemeColorsContext extends SvXMLImportContext {
  /** Binds the document-model palette. @param colors - Actual theme colors. @returns Context. */
  constructor(private readonly colors: ColorSet) {
    super();
  }

  /** Reads a recognized palette slot. @param element - Child token. @param attributes - Slot attributes. @returns Leaf context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.LOEXT_COLOR) return null;
    const type = convertToThemeColorType(
      themeColorNames.findIndex(
        /** Finds the original slot name. @param name - Lookup candidate. @returns Match. */
        (name) => name === attributes.get(XMLToken.LOEXT_NAME),
      ),
    );
    const value: [number] = [0];
    if (type !== ThemeColorType.Unknown) {
      Converter.convertColor(value, attributes.get(XMLToken.LOEXT_COLOR) ?? "");
      this.colors.add(type, new Color(value[0]));
    }
    return new SvXMLImportContext();
  }
}

/** Writes the shared native ODF theme element in named styles. @param theme - Workbook theme. @returns XML or absence. */
export function ExportThemeElement(theme: Theme | undefined): string {
  if (!theme) return "";
  const name = theme.name ? ` loext:name="${escapeXml(theme.name)}"` : "";
  const colors = theme.colorSet;
  if (!colors) return `<loext:theme${name}/>`;
  const paletteName = colors.name ? ` loext:name="${escapeXml(colors.name)}"` : "";
  let xml = `<loext:theme${name}><loext:theme-colors${paletteName}>`;
  for (const [index, name] of themeColorNames.entries()) {
    const value = colors.getColor(convertToThemeColorType(index));
    xml += `<loext:color loext:name="${name}" loext:color="#${value.GetRGBColor().toUInt32().toString(16).padStart(6, "0")}"/>`;
  }
  return xml + "</loext:theme-colors></loext:theme>";
}
