/** @fileoverview Original OOXML theme-index and last-luminance-transform tint/shade export conversions. */
import type { ComplexColor } from "../../../docmodel/inc/color/ComplexColor";
import { TransformationType } from "../../../docmodel/inc/color/Transformation";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
/** Original last LumMod/LumOff wins; positive offset takes precedence over modulation. @param color - Actual source color. @returns Native tint/shade. */
export function convertColorTransformsToTintOrShade(color: Readonly<ComplexColor>): number {
  let modulation = 10000,
    offset = 0;
  for (const transform of color.getTransformations()) {
    if (transform.meType === TransformationType.LumMod)
      modulation = (transform.mnValue << 16) >> 16;
    if (transform.meType === TransformationType.LumOff) offset = (transform.mnValue << 16) >> 16;
  }
  if (modulation === 10000 && offset === 0) return 0;
  return offset > 0 ? offset / 10000 : -(10000 - modulation) / 10000;
}
/** Original Excel theme permutation; invalid non-enum values remain the source caller precondition. @param type - Original theme type. @returns Export index or minus one for Unknown. */
export function convertThemeColorTypeToExcelThemeNumber(type: ThemeColorType): number {
  if (type === ThemeColorType.Unknown) return -1;
  return [1, 0, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11][type] as number;
}
