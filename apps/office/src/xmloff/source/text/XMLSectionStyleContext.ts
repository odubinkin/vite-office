/** @fileoverview The represented section-family properties in the xmloff text style map. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";
import { importWritingDirection } from "../style/prhdlfac";

/** Section properties backed by existing Writer frame items. */
export interface XMLSectionStyle {
  readonly marginLeft?: number | undefined;
  readonly marginRight?: number | undefined;
  readonly background?: string | undefined;
  readonly writingMode?: number | undefined;
}

/** Imports a section-family style referenced by a regular text section. */
export class XMLSectionStyleContext extends SvXMLImportContext {
  private style: XMLSectionStyle = {};

  /** Holds the style until its section-property child has been parsed. @param name - Automatic style name. @param register - Automatic style registrar. @returns Context. */
  public constructor(
    private readonly name: string,
    private readonly register: (name: string, style: XMLSectionStyle) => void,
  ) {
    super();
  }

  /** Parses supported properties using the native XML converters. @param element - Child token. @param attributes - Property attributes. @returns No deeper context for scalar values. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_SECTION_PROPERTIES) return null;
    const units = new SvXMLUnitConverter("twip");
    const left = attributes.get(XMLToken.FO_MARGIN_LEFT);
    const right = attributes.get(XMLToken.FO_MARGIN_RIGHT);
    const background = attributes.get(XMLToken.FO_BACKGROUND_COLOR);
    const direction = attributes.get(XMLToken.STYLE_WRITING_MODE);
    const color: [number] = [0];
    const formatted: [string] = [""];
    if (background === "transparent") formatted[0] = background;
    else if (background !== null && Converter.convertColor(color, background))
      Converter.convertColor(formatted, color[0]);
    this.style = {
      marginLeft: left === null ? undefined : (units.convertMeasureToCore(left) ?? undefined),
      marginRight: right === null ? undefined : (units.convertMeasureToCore(right) ?? undefined),
      background: formatted[0] || undefined,
      writingMode: direction === null ? undefined : importWritingDirection(direction),
    };
    return new SvXMLImportContext();
  }

  /** Registers the complete section-family property set. @returns Nothing. */
  public override endFastElement(): void {
    this.register(this.name, this.style);
  }
}
