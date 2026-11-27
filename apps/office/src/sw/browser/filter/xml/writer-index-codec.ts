/** @fileoverview Native Writer contents-index form and source in the detached worker graph. */
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import type { SwDoc } from "../../../source/core/doc/doc";
import {
  FormTokenType,
  MAXLEVEL,
  SwCaptionDisplay,
  SwTOOElements,
  SwChapterFormat,
  SwFormToken,
  SwTOXBase,
  TOXTypes,
} from "../../../source/core/tox/tox";

/** Value-only TOC descriptor record, with its structural children carried by the section codec. */
export interface WriterIndexRecord {
  readonly type?:
    TOXTypes.Index | TOXTypes.User | TOXTypes.Tables | TOXTypes.Illustrations | TOXTypes.Objects;
  readonly caption?: {
    readonly fromObjectNames: boolean;
    readonly sequenceName: string;
    readonly display: SwCaptionDisplay;
  };
  readonly objectOptions?: SwTOOElements;
  readonly typeName?: string;
  readonly levelFromChapter?: boolean;
  readonly alphabetical?: {
    readonly mainEntryCharStyle: string;
    readonly languageTag: string;
    readonly sortAlgorithm: string;
    readonly flags: number;
    readonly commaSeparated: boolean;
  };
  readonly title: string;
  readonly level: number;
  readonly fromChapter: boolean;
  readonly protected: boolean;
  readonly createType: number;
  readonly relativeTabs: boolean;
  readonly form: readonly {
    readonly style: string;
    readonly fields: readonly Readonly<SwFormToken>[];
  }[];
  readonly sourceStyles: readonly string[];
}

/** Matches the currently represented native index type identities. @param type - Index enum value. @returns Whether the type has a native form in this document. */
function isStoredIndexType(
  type: TOXTypes,
): type is NonNullable<WriterIndexRecord["type"]> | TOXTypes.Content {
  return (
    type === TOXTypes.Content ||
    type === TOXTypes.User ||
    type === TOXTypes.Index ||
    type === TOXTypes.Tables ||
    type === TOXTypes.Illustrations ||
    type === TOXTypes.Objects
  );
}

/** Encodes just the native TOC values. @param tox - Attached index descriptor. @returns Detached record. */
export function encodeIndex(tox: SwTOXBase): WriterIndexRecord {
  const form = [];
  const sourceStyles = [];
  for (let level = 0; level < tox.form.GetFormMax(); level++) {
    form.push({
      style: tox.form.GetTemplate(level),
      fields: tox.form.GetPattern(level).map(
        /** Detaches an original token. @param token - Native token. @returns Cloneable token fields. */
        (token) => ({ ...token }),
      ),
    });
    if (level > 0) sourceStyles.push(tox.GetStyleNames(level - 1));
  }
  const type = tox.type.type;
  if (!isStoredIndexType(type))
    throw new Error("Writer index type is not represented in the Worker graph.");
  const tag = new LanguageTag(tox.language);
  let languageTag: string;
  try {
    languageTag = text(tag.getBcp47(false));
  } finally {
    tag.dispose();
  }
  return {
    ...(type === TOXTypes.Content ? {} : { type, typeName: tox.type.name }),
    ...(type === TOXTypes.User ? { levelFromChapter: tox.levelFromChapter } : {}),
    ...(type === TOXTypes.Index
      ? {
          alphabetical: {
            mainEntryCharStyle: tox.mainEntryCharStyle,
            languageTag,
            sortAlgorithm: tox.sortAlgorithm,
            flags: tox.indexOptions,
            commaSeparated: tox.form.IsCommaSeparated(),
          },
        }
      : {}),
    ...(type === TOXTypes.Tables || type === TOXTypes.Illustrations
      ? {
          caption: {
            fromObjectNames: tox.fromObjectNames,
            sequenceName: tox.sequenceName,
            display: tox.captionDisplay,
          },
        }
      : {}),
    ...(type === TOXTypes.Objects ? { objectOptions: tox.objectOptions } : {}),
    title: tox.title,
    level: tox.level,
    fromChapter: tox.fromChapter,
    protected: tox.protected,
    createType: tox.createType,
    relativeTabs: tox.form.IsRelTabPos(),
    form,
    sourceStyles,
  };
}

/** Restores the native TOC properties under the receiving document type. @param document - Receiving model. @param name - Connected section identity. @param record - Detached values. @returns Native TOC descriptor. */
export function decodeIndex(document: SwDoc, name: string, record: WriterIndexRecord): SwTOXBase {
  const type = record.type ?? TOXTypes.Content;
  if (
    !isStoredIndexType(type) ||
    (record.typeName !== undefined && typeof record.typeName !== "string") ||
    (record.levelFromChapter !== undefined && typeof record.levelFromChapter !== "boolean")
  )
    throw new Error("Stored Writer index type is invalid.");
  const tox = new SwTOXBase(document.GetTOXType(type, record.typeName));
  const max = tox.form.GetFormMax();
  if (
    typeof record.title !== "string" ||
    !Number.isInteger(record.level) ||
    record.level < 1 ||
    record.level > MAXLEVEL ||
    typeof record.fromChapter !== "boolean" ||
    typeof record.protected !== "boolean" ||
    !Number.isInteger(record.createType) ||
    record.createType < 0 ||
    record.createType > 0x7f ||
    typeof record.relativeTabs !== "boolean" ||
    !Array.isArray(record.form) ||
    record.form.length !== max ||
    !Array.isArray(record.sourceStyles) ||
    record.sourceStyles.length !== max - 1
  )
    throw new Error("Stored Writer index is invalid.");
  if (type === TOXTypes.Index) {
    const alpha = record.alphabetical;
    if (
      !alpha ||
      typeof alpha.mainEntryCharStyle !== "string" ||
      typeof alpha.languageTag !== "string" ||
      typeof alpha.sortAlgorithm !== "string" ||
      !Number.isInteger(alpha.flags) ||
      alpha.flags < 0 ||
      alpha.flags > 0x7f ||
      typeof alpha.commaSeparated !== "boolean"
    )
      throw new Error("Stored Writer alphabetical index is invalid.");
    const bcp47 = unicode(alpha.languageTag);
    const tag = new LanguageTag(bcp47);
    try {
      tox.language = tag.getLanguageType(false);
    } finally {
      tag.dispose();
      bcp47.dispose();
    }
    tox.indexOptions = alpha.flags;
    tox.mainEntryCharStyle = alpha.mainEntryCharStyle;
    tox.sortAlgorithm = alpha.sortAlgorithm;
    tox.form.SetCommaSeparated(alpha.commaSeparated);
  }
  if (type === TOXTypes.Tables || type === TOXTypes.Illustrations) {
    const caption = record.caption;
    if (
      !caption ||
      typeof caption.fromObjectNames !== "boolean" ||
      typeof caption.sequenceName !== "string" ||
      !Number.isInteger(caption.display) ||
      caption.display < SwCaptionDisplay.Complete ||
      caption.display > SwCaptionDisplay.Text
    )
      throw new Error("Stored Writer caption index is invalid.");
    tox.fromObjectNames = caption.fromObjectNames;
    tox.sequenceName = caption.sequenceName;
    tox.captionDisplay = caption.display;
  }
  if (type === TOXTypes.Objects) {
    const options = record.objectOptions;
    const mask =
      SwTOOElements.Math |
      SwTOOElements.Chart |
      SwTOOElements.Calc |
      SwTOOElements.DrawImpress |
      SwTOOElements.Other;
    if (options === undefined || !Number.isInteger(options) || (options & mask) !== options)
      throw new Error("Stored Writer object index is invalid.");
    tox.objectOptions = options;
  }
  tox.levelFromChapter = record.levelFromChapter ?? false;
  tox.name = name;
  tox.title = record.title;
  tox.level = record.level;
  tox.fromChapter = record.fromChapter;
  tox.protected = record.protected;
  tox.createType = record.createType;
  tox.form.SetRelTabPos(record.relativeTabs);
  for (const [level, entry] of record.form.entries()) {
    if (typeof entry.style !== "string" || !Array.isArray(entry.fields))
      throw new Error("Stored Writer index form is invalid.");
    tox.form.SetTemplate(level, entry.style);
    const tokens: SwFormToken[] = [];
    for (const field of entry.fields as readonly Readonly<SwFormToken>[]) {
      if (
        !Number.isInteger(field.eTokenType) ||
        field.eTokenType < FormTokenType.EntryNo ||
        field.eTokenType > FormTokenType.LinkEnd ||
        typeof field.sCharStyleName !== "string" ||
        typeof field.sText !== "string" ||
        !Number.isInteger(field.nTabStopPosition) ||
        field.nTabStopPosition < 0 ||
        (field.eTabAlign !== SvxTabAdjust.Left && field.eTabAlign !== SvxTabAdjust.End) ||
        !Number.isInteger(field.nChapterFormat) ||
        field.nChapterFormat < SwChapterFormat.Number ||
        field.nChapterFormat > SwChapterFormat.NumberNoPrePostAndTitle ||
        !Number.isInteger(field.nOutlineLevel) ||
        field.nOutlineLevel < 1 ||
        field.nOutlineLevel > MAXLEVEL ||
        typeof field.cTabFillChar !== "string" ||
        field.cTabFillChar.length !== 1 ||
        typeof field.bWithTab !== "boolean"
      )
        throw new Error("Stored Writer index token is invalid.");
      tokens.push(Object.assign(new SwFormToken(field.eTokenType), field));
    }
    tox.form.SetPattern(level, tokens);
  }
  for (const [level, styles] of record.sourceStyles.entries()) {
    if (typeof styles !== "string") throw new Error("Stored Writer index styles are invalid.");
    tox.SetStyleNames(styles, level);
  }
  return tox;
}
