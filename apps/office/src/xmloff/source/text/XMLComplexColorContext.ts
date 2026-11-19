/** @fileoverview Original ODF theme color metadata and its supported ordered transformations. */
import { ComplexColor, ColorType } from "../../../docmodel/inc/color/ComplexColor";
import { Transformation, TransformationType } from "../../../docmodel/inc/color/Transformation";
import {
  convertToThemeColorType,
  ThemeColorType,
} from "../../../docmodel/inc/theme/ThemeColorType";
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { themeColorNames } from "../style/XMLThemeContext";

const transforms = new Map([
  ["tint", TransformationType.Tint],
  ["shade", TransformationType.Shade],
  ["lummod", TransformationType.LumMod],
  ["lumoff", TransformationType.LumOff],
]);

/** Theme portion of a text style used for stable automatic-style keys. */
export interface OdfThemeColor {
  readonly type: ThemeColorType;
  readonly transformations: readonly (readonly [TransformationType, number])[];
}

/** Projects the consumed theme attributes from a native item. @param color - Actual color item metadata. @returns Style payload or absence. */
export function getOdfThemeColor(color: Readonly<ComplexColor>): OdfThemeColor | undefined {
  if (!color.isValidThemeType()) return undefined;
  return {
    type: color.getThemeColorType(),
    transformations: color.getTransformations().map(
      /** Retains source order and exact values. @param entry - Native transformation. @returns Style tuple. */
      (entry) => [entry.meType, entry.mnValue],
    ),
  };
}

/** Creates the native value for the parsed or interned text-style properties. @param source - Parsed style payload. @returns Native color. */
export function createOdfThemeColor(source: OdfThemeColor): ComplexColor {
  const color = ComplexColor.Theme(source.type);
  for (const [type, value] of source.transformations)
    color.addTransformation(new Transformation(type, value));
  return color;
}

/** Adopts the original property complex color after its transformations have read. */
export class XMLComplexColorContext extends SvXMLImportContext {
  private readonly color = new ComplexColor();

  /** Reads the source slots with original attribute order. @param attributes - Complex-color attributes. @param install - Callback receiving the actual color. @returns Context. */
  constructor(
    attributes: FastAttributeList,
    private readonly install: (color: ComplexColor) => void,
  ) {
    super();
    for (const [token, value] of attributes) {
      if (token === XMLToken.LOEXT_COLOR_TYPE && value === "theme")
        this.color.setType(ColorType.Theme);
      if (token === XMLToken.LOEXT_THEME_TYPE) {
        const index = themeColorNames.findIndex(
          /** Looks up the native named slot. @param name - Palette name. @returns Match. */
          (name) => name === value,
        );
        if (index >= 0 || value === "none")
          this.color.setThemeColor(convertToThemeColorType(index));
      }
    }
  }

  /** Reads ordered original transform records. @param element - Child token. @param attributes - Transform attributes. @returns Leaf context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.LOEXT_TRANSFORMATION) return null;
    const type =
      transforms.get(attributes.get(XMLToken.LOEXT_TYPE) ?? "") ?? TransformationType.Undefined;
    const value: [number] = [0];
    Converter.convertNumber(value, attributes.get(XMLToken.LOEXT_VALUE) ?? "", -32768, 32767);
    this.color.addTransformation(new Transformation(type, value[0]));
    return new SvXMLImportContext();
  }

  /** Transfers the actual imported value. @returns Nothing. */
  override endFastElement(): void {
    this.install(this.color);
  }
}

/** Emits the native ODF extension property for a valid theme reference. @param color - Source native item color. @param element - Actual ODF property name. @returns XML or empty. */
export function exportComplexColor(color: Readonly<ComplexColor>, element: string): string {
  const type = color.getThemeColorType();
  if (type === ThemeColorType.Unknown) return "";
  const name = themeColorNames[type];
  let xml = `<loext:${element} loext:theme-type="${name}" loext:color-type="theme">`;
  for (const transform of color.getTransformations())
    for (const [type, id] of transforms)
      if (transform.meType === id)
        xml += `<loext:transformation loext:type="${type}" loext:value="${transform.mnValue}"/>`;
  return xml + `</loext:${element}>`;
}
