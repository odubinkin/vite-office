/** @fileoverview Native Writer contents-index form and source in the detached worker graph. */
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import type { SwDoc } from "../../../source/core/doc/doc";
import {
  FormTokenType,
  MAXLEVEL,
  SwChapterFormat,
  SwFormToken,
  SwTOXBase,
} from "../../../source/core/tox/tox";

/** Value-only TOC descriptor record, with its structural children carried by the section codec. */
export interface WriterIndexRecord {
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
  return {
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
  if (
    typeof record.title !== "string" ||
    !Number.isInteger(record.level) ||
    record.level < 1 ||
    record.level > MAXLEVEL ||
    typeof record.fromChapter !== "boolean" ||
    typeof record.protected !== "boolean" ||
    !Number.isInteger(record.createType) ||
    record.createType < 0 ||
    record.createType > 7 ||
    typeof record.relativeTabs !== "boolean" ||
    !Array.isArray(record.form) ||
    record.form.length !== MAXLEVEL + 1 ||
    !Array.isArray(record.sourceStyles) ||
    record.sourceStyles.length !== MAXLEVEL
  )
    throw new Error("Stored Writer index is invalid.");
  const tox = new SwTOXBase(document.GetTOXType());
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
        (field.nChapterFormat !== SwChapterFormat.Number &&
          field.nChapterFormat !== SwChapterFormat.NumberNoPrePostAndTitle) ||
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
