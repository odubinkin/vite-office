/** @fileoverview Browser-only lossless transport for the existing native ComplexColor value. */
import { ComplexColor, ColorType, SystemColorType } from "../inc/color/ComplexColor";
import { ThemeColorType, ThemeColorUsage } from "../inc/theme/ThemeColorType";
import { Transformation, TransformationType } from "../inc/color/Transformation";
import { Color, ColorTransparency } from "../../tools/inc/color";
/** Cloneable record of every independently owned native field. */
export type ComplexColorRecord = {
  readonly version: 1;
  readonly type: number;
  readonly components: readonly number[];
  readonly system: number;
  readonly last: number;
  readonly theme: number;
  readonly usage: number;
  readonly transformations: readonly { readonly type: number; readonly value: number }[];
  readonly final: number;
};
/** Encodes an actual value without changing its final color or normalizing its discriminator.
 * @param color - Actual native value.
 * @returns Independent cloneable fields.
 */
export function encodeComplexColor(color: Readonly<ComplexColor>): ComplexColorRecord {
  // Native copy/equality includes maLastColor, but exposes no getter. This one
  // read-only layout view stays at the Worker boundary; no core API or default is invented.
  const last = (color as unknown as { readonly maLastColor: Readonly<Color> }).maLastColor;
  return {
    version: 1,
    type: color.getType(),
    components: [color.getRed(), color.getGreen(), color.getBlue()],
    system: color.getSystemColorType(),
    last: last.toUInt32(),
    theme: color.getThemeColorType(),
    usage: color.getThemeColorUsage(),
    final: color.getFinalColor().toUInt32(),
    transformations: color
      .getTransformations()
      .map(
        /** Copies ordered source transformations. @param transformation - Native value. @returns Independent record. */ (
          transformation,
        ) => ({ type: transformation.meType, value: transformation.mnValue }),
      ),
  };
}
/** Restores actual native values through their existing constructors and setters.
 * @param candidate - Untrusted Worker record.
 * @returns Independently owned native value.
 */
export function decodeComplexColor(candidate: unknown): ComplexColor {
  if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate))
    throw new Error("ComplexColor record is invalid.");
  const value = candidate as Record<string, unknown>;
  if (
    value.version !== 1 ||
    !enumValue(value.type, ColorType) ||
    !enumValue(value.system, SystemColorType) ||
    !enumValue(value.theme, ThemeColorType) ||
    !enumValue(value.usage, ThemeColorUsage) ||
    !packedColor(value.last) ||
    !packedColor(value.final) ||
    !Array.isArray(value.components) ||
    value.components.length !== 3 ||
    !value.components.every(
      /** Validates native double components without normalizing them. @param component - Stored value. @returns Whether finite. */ (
        component,
      ) => typeof component === "number" && Number.isFinite(component),
    ) ||
    !Array.isArray(value.transformations)
  )
    throw new Error("ComplexColor record is invalid.");
  const transformations = value.transformations.map(
    /** Validates and restores one owned transformation. @param input - Stored entry. @returns Actual native value. */ (
      input,
    ) => {
      if (input === null || typeof input !== "object" || Array.isArray(input))
        throw new Error("ComplexColor transformation is invalid.");
      const entry = input as Record<string, unknown>;
      if (
        !enumValue(entry.type, TransformationType) ||
        typeof entry.value !== "number" ||
        !Number.isInteger(entry.value) ||
        entry.value < -32768 ||
        entry.value > 32767
      )
        throw new Error("ComplexColor transformation is invalid.");
      return new Transformation(entry.type, entry.value);
    },
  );
  const result = new ComplexColor();
  // These native setters independently retain last-color, raw components and
  // theme index. Restore the original discriminator only after those writes.
  result.setSystemColor(
    value.system,
    new Color(ColorTransparency, value.last, "ColorTransparencyTag").toInt32(),
  );
  result.setCRGB(
    value.components[0] as number,
    value.components[1] as number,
    value.components[2] as number,
  );
  result.setThemeColor(value.theme);
  result.setThemeColorUsage(value.usage);
  result.setType(value.type);
  result.setTransformations(transformations);
  result.setFinalColor(new Color(ColorTransparency, value.final, "ColorTransparencyTag"));
  return result;
}
/** Validates one declared enum value at the browser boundary. @param value - Candidate. @param values - Native enum. @returns Whether declared. */
function enumValue(value: unknown, values: object): value is number {
  return (
    typeof value === "number" && Number.isInteger(value) && Object.values(values).includes(value)
  );
}
/** Validates native unsigned32 color bits at the browser boundary. @param value - Candidate. @returns Whether packed. */
function packedColor(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 0xffffffff;
}
