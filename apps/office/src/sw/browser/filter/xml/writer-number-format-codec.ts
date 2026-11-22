/** @fileoverview Projects complete represented native numbering fields at the browser graph boundary. */
import { SvxBrushItem, SvxGraphicPosition } from "../../../../editeng/source/items/frmitems.brush";
import { RES_BACKGROUND } from "../../../inc/hintids";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import { Size } from "../../../../tools/inc/gen";
import type { SwDoc } from "../../../source/core/doc/doc";
import {
  SvxNumType,
  type SwNumFormat,
  getWriterNumFormatBullet,
  getWriterNumFormatKind,
  type ConstSwNumFormat,
} from "../../../source/core/doc/number";
import type { WriterParagraphListKind } from "../../../source/core/doc/list";
import {
  encodeFontMetadata,
  type FontMetadataRecord,
} from "../../../../vcl/browser/font-metadata-codec";
import { encodeCharacterStyleReference } from "./writer-character-style-codec";
/** Optional primitive graphic-format fields, including native independent size and orientation. */
interface WriterNumberGraphicRecord {
  readonly width: number;
  readonly height: number;
  readonly orientation: number;
  readonly brush?: Readonly<{
    readonly bytes: Uint8Array;
    readonly mediaType: string;
    readonly preferredWidth: number;
    readonly preferredHeight: number;
    readonly position: SvxGraphicPosition;
  }>;
}

/** Primitive graph record for one numbering level. */
export interface WriterNumberFormatRecord {
  readonly characterStyle?: number;
  readonly graphic?: WriterNumberGraphicRecord;
  readonly nativeNumberingType?: number;
  readonly numAdjust?: number;
  readonly isLegal?: boolean;
  readonly bulletFont: string;
  readonly bulletFontPresent?: boolean;
  readonly bulletFontMetadata?: FontMetadataRecord;
  readonly bulletGlyph?: number;
  readonly showSymbol?: boolean;
  readonly numberingType?: "arabic" | "char-special" | "none";
  readonly bulletChar?: string;
  readonly firstLineIndent: number;
  readonly indentAt: number;
  readonly includeUpperLevels: number;
  readonly kind: Exclude<WriterParagraphListKind, "none">;
  readonly labelFollowedBy: "listtab" | "nothing" | "space";
  readonly listTabPosition: number;
  readonly positionAndSpaceMode: "label-alignment" | "label-width-and-position";
  readonly absLSpace?: number;
  readonly firstLineOffset?: number;
  readonly charTextDistance?: number;
  readonly listFormat?: string;
  readonly prefix: string;
  readonly start: number;
  readonly suffix: string;
}

/** Encodes a native numbering format without flattening character style registration. @param document - Native document. @param format - Native level. @returns Primitive record. */
export function encodeNumberFormat(
  document: SwDoc,
  format: ConstSwNumFormat,
): WriterNumberFormatRecord {
  const font = format.GetBulletFont();
  const characterStyle = encodeCharacterStyleReference(document, format.GetCharFormat());
  const graphic = encodeNumberGraphic(format);
  return {
    ...(characterStyle === undefined ? {} : { characterStyle }),
    ...(graphic === undefined ? {} : { graphic }),
    nativeNumberingType: format.GetNumberingType(),
    numAdjust: format.GetNumAdjust(),
    isLegal: format.GetIsLegal(),
    ...format.GetPositionProperties(),
    bulletFont: font?.GetFamilyName() ?? "",
    ...(font === undefined
      ? {}
      : {
          bulletFontMetadata: encodeFontMetadata(font),
        }),
    numberingType:
      format.GetNumberingType() === SvxNumType.SVX_NUM_NUMBER_NONE
        ? "none"
        : format.GetNumberingType() === SvxNumType.SVX_NUM_CHAR_SPECIAL
          ? "char-special"
          : "arabic",
    bulletFontPresent: format.GetBulletFont() !== undefined,
    bulletGlyph: format.GetBulletChar(),
    showSymbol: format.IsShowSymbol(),
    bulletChar: format.GetBulletChar() <= 0x10ffff ? getWriterNumFormatBullet(format) : "",
    firstLineIndent: format.GetFirstLineIndent(),
    indentAt: format.GetIndentAt(),
    includeUpperLevels: format.GetIncludeUpperLevels(),
    ...(format.HasListFormat() ? { listFormat: format.GetListFormat() } : {}),
    kind: getWriterNumFormatKind(format),
    labelFollowedBy: format.GetLabelFollowedBy(),
    listTabPosition: format.GetListtabPos(),
    positionAndSpaceMode: format.GetPositionAndSpaceMode(),
    prefix: format.GetPrefix(),
    start: format.GetStart(),
    suffix: format.GetSuffix(),
  };
}

/** Transfers the native brush and independent geometry across the Worker boundary. @param format - Native level. @returns Primitive graphic-format record. */
function encodeNumberGraphic(format: ConstSwNumFormat): WriterNumberGraphicRecord | undefined {
  const brush = format.GetBrush();
  const image = brush?.GetGraphic();
  const size = format.GetGraphicSize();
  const width = size.Width();
  const height = size.Height();
  const orientation = format.GetVertOrient();
  if (image === undefined && width === 0 && height === 0 && orientation === 0) return undefined;
  const preferred = image?.GetPrefSize();
  return {
    width,
    height,
    orientation,
    ...(brush && image && preferred
      ? {
          brush: {
            bytes: image.GetNativeData(),
            mediaType: image.mediaType,
            preferredWidth: preferred.Width(),
            preferredHeight: preferred.Height(),
            position: brush.GetGraphicPos(),
          },
        }
      : {}),
  };
}

/** Restores one embedded numbering graphic; old Worker records omit it. @param format - Mutable native level. @param stored - Persisted graphic record. @returns Nothing. */
export function decodeNumberGraphic(
  format: SwNumFormat,
  stored: WriterNumberGraphicRecord | undefined,
): void {
  if (stored === undefined) return;
  if (
    !stored ||
    !Number.isSafeInteger(stored.width) ||
    !Number.isSafeInteger(stored.height) ||
    !Number.isInteger(stored.orientation) ||
    stored.orientation < -32768 ||
    stored.orientation > 32767
  )
    throw new Error("Stored Writer numbering graphic geometry is invalid.");
  const value = stored.brush;
  let brush: SvxBrushItem | undefined;
  if (value !== undefined) {
    if (
      !value ||
      !ArrayBuffer.isView(value.bytes) ||
      Object.prototype.toString.call(value.bytes) !== "[object Uint8Array]" ||
      value.bytes.length === 0 ||
      typeof value.mediaType !== "string" ||
      !/^image\/[\w.+-]+$/u.test(value.mediaType) ||
      !Number.isSafeInteger(value.preferredWidth) ||
      !Number.isSafeInteger(value.preferredHeight) ||
      !Number.isInteger(value.position) ||
      value.position <= SvxGraphicPosition.GPOS_NONE ||
      value.position > SvxGraphicPosition.GPOS_TILED
    )
      throw new Error("Stored Writer numbering graphic brush is invalid.");
    brush = new SvxBrushItem(
      new Graphic(
        value.bytes,
        value.mediaType,
        new Size(value.preferredWidth, value.preferredHeight),
      ),
      value.position,
      RES_BACKGROUND,
    );
  }
  format.SetGraphicBrush(brush, new Size(stored.width, stored.height), stored.orientation);
}
