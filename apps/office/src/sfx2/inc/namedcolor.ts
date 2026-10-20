/** @fileoverview Native NamedColor value and theme conversion from include/sfx2/namedcolor.hxx. */
import { Color } from "../../tools/inc/color";
import { OUString } from "../../sal/inc/rtl/ustring";
import { ComplexColor } from "../../docmodel/inc/color/ComplexColor";
import { ThemeColorType, convertToThemeColorType } from "../../docmodel/inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../../docmodel/inc/color/Transformation";
/** Original public value fields; explicit disposal replaces the native OUString destructor. */
export class NamedColor {
  m_aColor = new Color();
  m_aName: OUString;
  m_nThemeIndex = -1;
  m_nLumMod = 10000;
  m_nLumOff = 0;
  /** Original default/value and implicit-copy forms. @param args - Native default,color/name pair,or copied value. @returns Owned value. */
  constructor(...args: [] | [color: Readonly<Color>, name: OUString] | [source: NamedColor]) {
    const color = args[0],
      name = args[1];
    if (color instanceof NamedColor) {
      this.m_aColor.assign(color.m_aColor);
      this.m_aName = new OUString(color.m_aName);
      this.m_nThemeIndex = color.m_nThemeIndex;
      this.m_nLumMod = color.m_nLumMod;
      this.m_nLumOff = color.m_nLumOff;
    } else {
      if (color !== undefined) this.m_aColor.assign(color);
      this.m_aName = name === undefined ? new OUString() : new OUString(name);
    }
  }
  /** Returns the original independent theme/RGB complex value. @returns Native complex color. */
  getComplexColor(): ComplexColor {
    const result = new ComplexColor(),
      theme = convertToThemeColorType(this.m_nThemeIndex);
    if (theme !== ThemeColorType.Unknown) {
      result.setThemeColor(theme);
      if (this.m_nLumMod !== 10000)
        result.addTransformation(new Transformation(TransformationType.LumMod, this.m_nLumMod));
      if (this.m_nLumOff !== 0)
        result.addTransformation(new Transformation(TransformationType.LumOff, this.m_nLumOff));
      result.setFinalColor(this.m_aColor);
    } else result.setColor(this.m_aColor);
    return result;
  }
  /** Releases the native string member at the explicit managed destructor boundary. @returns Nothing. */
  Dispose(): void {
    this.m_aName.dispose();
  }
}
