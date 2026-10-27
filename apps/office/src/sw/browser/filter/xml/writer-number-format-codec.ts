/** @fileoverview Projects complete represented native numbering fields at the browser graph boundary. */
import type { SwDoc } from "../../../source/core/doc/doc";
import {
  SvxNumType,
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
/** Primitive graph record for one numbering level. */
export interface WriterNumberFormatRecord {
  readonly characterStyle?: number;
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
  return {
    ...(characterStyle === undefined ? {} : { characterStyle }),
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
