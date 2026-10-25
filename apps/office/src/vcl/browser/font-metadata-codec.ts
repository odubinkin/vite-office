/** @fileoverview Primitive browser transport for represented native Font values;native Font/Color/Size own defaults and semantics,not the transport schema. */
import { Font, type ConstFont } from "../source/font/font";
import { Color, ColorTransparency } from "../../tools/inc/color";
import { Size } from "../../tools/inc/gen";
/** New stored value group is complete when present;family name remains in the caller's existing name field. */
interface FontStoredValues {
  readonly color: number;
  readonly fillColor: number;
  readonly transparent: boolean;
  readonly alignment: number;
  readonly fontSize: readonly [number, number];
}
/** Stored weight/italic were added after the paint group; older records retain native defaults. */
interface FontFaceValues {
  readonly weight: number;
  readonly italic: number;
}
/** Complete decoration group; absence in older records uses original Font defaults. */
interface FontDecorationValues {
  readonly outline: boolean;
  readonly shadow: boolean;
  readonly underline: number;
  readonly overline: number;
  readonly strikeout: number;
  readonly relief: number;
  readonly emphasisMark: number;
}
/** Original metadata fields plus optional complete new value group for existing persisted browser records. */
export interface FontMetadataRecord
  extends Partial<FontStoredValues>, Partial<FontFaceValues>, Partial<FontDecorationValues> {
  readonly styleName: string;
  readonly family: number;
  readonly pitch: number;
  readonly charSet: number;
}
/** Complete newly encoded represented Font state. */
export type CompleteFontMetadataRecord = FontMetadataRecord &
  FontStoredValues &
  FontFaceValues &
  FontDecorationValues;
/** Reads original represented decoration values without changing native semantics. @param font - Actual native value. @returns Independent transport group. */
function decorationValues(font: ConstFont): FontDecorationValues {
  return {
    outline: font.IsOutline(),
    shadow: font.IsShadow(),
    underline: font.GetUnderline(),
    overline: font.GetOverline(),
    strikeout: font.GetStrikeout(),
    relief: font.GetRelief(),
    emphasisMark: font.GetEmphasisMark(),
  };
}
/** Reads actual native stored values into independent primitive transport. @param font - Real font. @returns Stored fields. */
function storedValues(font: ConstFont): FontStoredValues {
  return {
    color: font.GetColor().toUInt32(),
    fillColor: font.GetFillColor().toUInt32(),
    transparent: font.IsTransparent(),
    alignment: font.GetAlignment(),
    fontSize: [font.GetFontSize().Width(), font.GetFontSize().Height()],
  };
}
/** Encodes all represented fields other than the caller-owned family name. @param font - Actual native value. @returns Complete primitive record. */
export function encodeFontMetadata(font: ConstFont): CompleteFontMetadataRecord {
  return {
    styleName: font.GetStyleName(),
    family: font.GetFamilyType(),
    pitch: font.GetPitch(),
    charSet: font.GetCharSet(),
    weight: font.GetWeight(),
    italic: font.GetItalic(),
    ...storedValues(font),
    ...decorationValues(font),
  };
}
/** Validates an integer host scalar without coercion. @param value - Candidate. @param min - Inclusive bound. @param max - Inclusive bound. @returns Admission. */
function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max;
}
/** Restores validated native values in source-safe setter order;legacy records use actual Font defaults for the absent group. Invalid input never mutates the recipient. @param font - Actual target whose family name is already owned by its caller. @param value - Untrusted browser record. @returns Nothing. */
export function restoreFontMetadata(font: Font, value: unknown): void {
  const bad = /** Builds the boundary validation error. @returns Invalid-record error. */ () =>
    new Error("Stored font metadata is invalid.");
  if (typeof value !== "object" || value === null || Array.isArray(value)) throw bad();
  const record = value as Record<string, unknown>;
  if (
    typeof record.styleName !== "string" ||
    !integer(record.family, -2147483648, 2147483647) ||
    !integer(record.pitch, -2147483648, 2147483647) ||
    !integer(record.charSet, 0, 65535)
  )
    throw bad();
  const faceValues = "weight" in record || "italic" in record;
  if (
    faceValues &&
    (!integer(record.weight, -2147483648, 2147483647) ||
      !integer(record.italic, -2147483648, 2147483647))
  )
    throw bad();
  const complete = ["color", "fillColor", "transparent", "alignment", "fontSize"].some(
    /** Detects a current value group without silently defaulting partial new records. @param key - Field. @returns Presence. */ (
      key,
    ) => key in record,
  );
  const decorations = [
    "outline",
    "shadow",
    "underline",
    "overline",
    "strikeout",
    "relief",
    "emphasisMark",
  ].some(
    /** Any present decoration requires the complete group. @param key - Stored field. @returns Presence. */ (
      key,
    ) => key in record,
  );
  if (
    decorations &&
    (typeof record.outline !== "boolean" ||
      typeof record.shadow !== "boolean" ||
      !integer(record.underline, -2147483648, 2147483647) ||
      !integer(record.overline, -2147483648, 2147483647) ||
      !integer(record.strikeout, -2147483648, 2147483647) ||
      !integer(record.relief, -2147483648, 2147483647) ||
      !integer(record.emphasisMark, -2147483648, 2147483647))
  )
    throw bad();
  if (
    complete &&
    (!integer(record.color, 0, 0xffffffff) ||
      !integer(record.fillColor, 0, 0xffffffff) ||
      typeof record.transparent !== "boolean" ||
      !integer(record.alignment, -2147483648, 2147483647) ||
      !Array.isArray(record.fontSize) ||
      record.fontSize.length !== 2 ||
      !record.fontSize.every(
        /** Admits the represented native integer geometry domain. @param scalar - Coordinate. @returns Admission. */ (
          scalar,
        ) => typeof scalar === "number" && Number.isSafeInteger(scalar),
      ))
  )
    throw bad();
  const data = complete ? (record as unknown as FontStoredValues) : storedValues(new Font());
  font.SetStyleName(record.styleName);
  font.SetFamily(record.family);
  font.SetPitch(record.pitch);
  font.SetCharSet(record.charSet);
  const defaults = new Font();
  const decoration = decorations
    ? (record as unknown as FontDecorationValues)
    : decorationValues(defaults);
  font.SetOutline(decoration.outline);
  font.SetShadow(decoration.shadow);
  font.SetUnderline(decoration.underline);
  font.SetOverline(decoration.overline);
  font.SetStrikeout(decoration.strikeout);
  font.SetRelief(decoration.relief);
  font.SetEmphasisMark(decoration.emphasisMark);
  font.SetWeight(faceValues ? (record.weight as number) : defaults.GetWeight());
  font.SetItalic(faceValues ? (record.italic as number) : defaults.GetItalic());
  font.SetColor(new Color(ColorTransparency, data.color, "ColorTransparencyTag"));
  font.SetFillColor(new Color(ColorTransparency, data.fillColor, "ColorTransparencyTag"));
  // Fill assignment has native side effects;the separately transported flag must be restored afterward.
  font.SetTransparent(data.transparent);
  font.SetAlignment(data.alignment);
  font.SetFontSize(new Size(data.fontSize[0], data.fontSize[1]));
}
