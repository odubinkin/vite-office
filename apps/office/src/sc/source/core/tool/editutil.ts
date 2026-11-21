/** @fileoverview Original ScEditEngineDefaulter text and attribute-default operations. */
import type { ESelection } from "../../../../editeng/inc/ESelection";
import type { EPaM } from "../../../../editeng/inc/EPaM";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { EditTextObject } from "../../../../editeng/inc/editobj";
import { EditEngine } from "../../../../editeng/inc/editeng";
import { DocumentImpEditEngine } from "../../../../editeng/source/editeng/impedit2.document";
import { EEControlBits } from "../../../../editeng/inc/editstat";
import { EditPaM } from "../../../../editeng/inc/EditPaM";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { ScGlobal } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  SvxExtFileField,
  SvxFileFormat,
  SvxURLFormat,
  type SvxFieldDataConstReference,
  type SvxFieldItem,
  type SvxTableField,
  type SvxURLField,
} from "../../../../editeng/inc/flditem";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import * as FieldType from "../../../../offapi/com/sun/star/text/textfield/Type";
import type { Color } from "../../../../tools/inc/color";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { Date } from "../../../../tools/source/datetime/tdate";
import { LocaleDataWrapper } from "../../../../unotools/source/i18n/localedatawrapper";
import { getSystemLocale } from "../../../../unotools/source/misc/syslocale";
import type { ScDocument } from "../../../inc/document";
import { SfxItemSet } from "../../../../svl/source/items/itemset";

import { GetDocumentShell } from "../data/documen2";

/** Original ScEditUtil::GetString resolves fields through Calc's field editor. @param edit - Actual cell text. @param document - Workbook that resolves fields. @returns Owned multiline value. */
export function GetString(edit: EditTextObject, document: ScDocument): OUString {
  if (!edit.HasField()) return edit.GetText();
  const engine = document.GetEditEngine();
  engine.SetText(edit);
  return engine.GetText();
}

/** Document callers use the text-object and text operations of the no-view editor. */
export type DocumentEditEngine = Pick<
  ScFieldEditEngine,
  | "SetText"
  | "SetTextCurrentDefaults"
  | "CreateTextObject"
  | "GetText"
  | "GetParagraphText"
  | "GetEmptyItemSet"
  | "QuickSetAttribs"
  | "QuickInsertField"
  | "IsUndoEnabled"
  | "EnableUndo"
>;

/** Original Calc editor layer owns optional paragraph defaults and applies them without recording undo. */
export class ScEditEngineDefaulter extends EditEngine {
  private readonly implementation: DocumentImpEditEngine;
  private m_oDefaults: SfxItemSet | null = null;

  /** Original engine initialization and Calc edit-language assignment. @param pool - Borrowed edit-engine item pool. @returns Editor. */
  constructor(pool: SfxItemPool) {
    super();
    this.implementation = new DocumentImpEditEngine(this, pool);
    this.SetDefaultLanguage(ScGlobal.GetEditDefaultLanguage());
  }

  /** Original reference to the actual inner engine. @returns Internal editor. */
  getImpl(): DocumentImpEditEngine {
    return this.implementation;
  }
  /** Paragraph-connection undo is outside the document editor boundary. @returns Never. */
  ConnectContents(): never {
    throw new Error("Document EditEngine requires disabled undo");
  }

  /** Original paragraph split of the given node and offset. @param paragraph - Native paragraph. @param position - Source offset. @returns Resulting position. */
  SplitContent(paragraph: number, position: number): EditPaM {
    const engine = this.getImpl();
    return engine.ImpInsertParaBreak(
      new EditPaM(engine.GetEditDoc().GetObject(paragraph), position),
    );
  }

  /** Original text-object overload completes the ordinary layout/notification dispatch. @param input - Native literal or rich text. @returns Nothing. */
  override SetText(input: OUStringConstReference | EditTextObject): void {
    if (input instanceof EditTextObject) {
      const engine = this.getImpl();
      engine.SetTextObject(input);
      engine.FormatAndLayout();
    } else super.SetText(input);
  }

  /** Original temporary undo and layout suppression while applying defaults. @param items - Actual new default set. @returns Nothing. */
  private ApplyDefaults(items: SfxItemSet): void {
    const undo = this.IsUndoEnabled();
    this.EnableUndo(false);
    const layout = this.SetUpdateLayout(false);
    const count = this.GetParagraphCount();
    for (let paragraph = 0; paragraph < count; ++paragraph) this.SetParaAttribs(paragraph, items);
    if (layout) this.SetUpdateLayout(true);
    if (undo) this.EnableUndo(true);
  }

  /** Original const-set overload replaces the owned defaults and applies them. @param items - Borrowed source default set. @returns Nothing. */
  SetDefaults(items: SfxItemSet): void {
    const defaults = new SfxItemSet(items);
    this.m_oDefaults?.Dispose();
    this.m_oDefaults = defaults;
    this.ApplyDefaults(defaults);
  }

  /** Original text overloads set literal or rich text with the current optional defaults. @param input - Original text. @returns Nothing. */
  SetTextCurrentDefaults(input: OUStringConstReference | EditTextObject): void {
    const layout = this.SetUpdateLayout(false);
    this.SetText(input);
    if (this.m_oDefaults !== null) this.ApplyDefaults(this.m_oDefaults);
    if (layout) this.SetUpdateLayout(true);
  }

  /** Releases Calc-owned defaults and the base engine. @returns Nothing. */
  Dispose(): void {
    this.m_oDefaults?.Dispose();
    this.m_oDefaults = null;
    this.getImpl().Dispose();
  }
}

/** Source document editor initialized for field marking and literal-text transfer. */
export class ScFieldEditEngine extends ScEditEngineDefaulter {
  /** Sets the source field-editor control flags while the engine is unformatted. @param mpDoc - Borrowed Calc document. @param pool - Borrowed edit-engine item pool. @returns Editor. */
  constructor(
    private readonly mpDoc: ScDocument,
    pool: SfxItemPool,
  ) {
    super(pool);
    this.getImpl().GetStatus().GetControlWord()[0] =
      (this.GetControlWord() | EEControlBits.MARKFIELDS) & ~EEControlBits.RTFSTYLESHEETS;
  }

  /** Original Calc field text dispatch used by the document editor. @param item - Borrowed field item. @param _paragraph - Native paragraph. @param _position - Native position. @param _textColor - Unused display output in the document text slice. @param _fieldColor - Unused display output in the document text slice. @param lineStyle - Optional underline output. @returns Owned representation. */
  override CalcFieldValue(
    item: SvxFieldItem,
    _paragraph: number,
    _position: number,
    _textColor: [Color | null],
    _fieldColor: [Color | null],
    lineStyle: [FontLineStyle | null],
  ): OUString {
    const field = item.GetField();
    return field ? GetCellFieldValue(field, this.mpDoc, lineStyle) : unicode(" ");
  }
}

/** Original text evaluation for field classes admitted by the Calc document editor. @param field - Borrowed field. @param doc - Actual document. @param lineStyle - Optional underline output. @returns Owned field representation. */
export function GetCellFieldValue(
  field: SvxFieldDataConstReference,
  doc: ScDocument,
  lineStyle: [FontLineStyle | null],
): OUString {
  let result: OUString;
  switch (field.GetClassId()) {
    case FieldType.URL: {
      const url = field as SvxURLField;
      const format = url.GetFormat();
      if (format === SvxURLFormat.AppDefault || format === SvxURLFormat.Repr)
        result = new OUString(url.GetRepresentation());
      else if (format === SvxURLFormat.Url) result = new OUString(url.GetURL());
      else result = new OUString();
      lineStyle[0] = FontLineStyle.LINESTYLE_SINGLE;
      break;
    }
    case FieldType.DATE: {
      const locale = getSystemLocale();
      try {
        const data = new LocaleDataWrapper(locale);
        try {
          result = data.getDate(new Date(Date.SYSTEM));
        } finally {
          data.dispose();
        }
      } finally {
        locale.dispose();
      }
      break;
    }
    case FieldType.DOCINFO_TITLE:
      result = unicode(GetDocumentShell.call(doc)?.GetTitle() || "?");
      break;
    case FieldType.TABLE:
      result = new OUString();
      if (!doc.GetName((field as SvxTableField).GetTab(), result)) {
        result.dispose();
        result = unicode("?");
      }
      break;
    default:
      result = unicode("?");
  }
  if (!result.isEmpty()) return result;
  result.dispose();
  return unicode(" ");
}

/** View-owned values captured when Calc opens a header or footer editor. */
export interface ScHeaderFieldData {
  readonly date: globalThis.Date;
  readonly title: string;
  readonly shortName: string;
  readonly longName: string;
  readonly sheet: string;
  readonly page: number;
  readonly pages: number;
}

const romanDigits = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
] as const;

/** Formats native Calc header page numbers, which recognize the basic alphabetic and Roman types. @param value - Page value. @param type - Page style numbering type. @returns Preview string. */
function numberText(value: number, type: SvxNumType): string {
  if (!value) return "0";
  if (type === SvxNumType.SVX_NUM_NUMBER_NONE) return "";
  if (
    type === SvxNumType.SVX_NUM_CHARS_UPPER_LETTER ||
    type === SvxNumType.SVX_NUM_CHARS_LOWER_LETTER
  ) {
    let result = "";
    for (let remaining = value; remaining > 0; remaining = Math.floor((remaining - 1) / 26))
      result = String.fromCharCode(97 + ((remaining - 1) % 26)) + result;
    return type === SvxNumType.SVX_NUM_CHARS_UPPER_LETTER ? result.toUpperCase() : result;
  }
  if (type === SvxNumType.SVX_NUM_ROMAN_UPPER || type === SvxNumType.SVX_NUM_ROMAN_LOWER) {
    if (value >= 4000) return "";
    let result = "";
    for (const [unit, digit] of romanDigits) {
      result += digit.repeat(Math.floor(value / unit));
      value %= unit;
    }
    return type === SvxNumType.SVX_NUM_ROMAN_LOWER ? result.toLowerCase() : result;
  }
  return String(value);
}

/** Evaluates exactly the field classes dispatched by ScHeaderEditEngine. @param item - Actual EditEngine field. @param data - Original view field data. @param type - Page style numbering type. @returns Display string. */
export function HeaderFieldText(
  item: SvxFieldItem,
  data: ScHeaderFieldData,
  type: SvxNumType,
): string {
  const field = item.GetField();
  switch (field?.GetClassId()) {
    case FieldType.PAGE:
      return numberText(data.page, type);
    case FieldType.PAGES:
      return numberText(data.pages, type);
    case FieldType.DOCINFO_TITLE:
      return data.title;
    case FieldType.EXTENDED_FILE:
      return (field as SvxExtFileField).GetFormat() === SvxFileFormat.PathFull
        ? data.longName
        : data.shortName;
    case FieldType.TABLE:
      return data.sheet;
    case FieldType.DATE: {
      const locale = getSystemLocale();
      const wrapper = new LocaleDataWrapper(locale);
      try {
        const value = wrapper.getDate(
          new Date(data.date.getDate(), data.date.getMonth() + 1, data.date.getFullYear()),
        );
        try {
          return text(value);
        } finally {
          value.dispose();
        }
      } finally {
        wrapper.dispose();
        locale.dispose();
      }
    }
    case FieldType.TIME:
    case FieldType.EXTENDED_TIME:
      return new Intl.DateTimeFormat(undefined, { timeStyle: "medium" }).format(data.date);
    default:
      return "?";
  }
}

/** Actual EditEngine for an editable header or footer region. */
export class ScHeaderEditEngine extends ScEditEngineDefaulter {
  /** Starts an independent headless editor over the workbook's EditEngine pool. @param pool - Native edit pool. @param data - Current field values. @param type - Page numbering. @param initial - Existing region, if any. @returns Region editor. */
  constructor(
    pool: SfxItemPool,
    readonly data: ScHeaderFieldData,
    readonly type: SvxNumType,
    initial?: EditTextObject | null,
  ) {
    super(pool);
    this.SetUpdateLayout(false);
    this.EnableUndo(false);
    if (initial) this.SetText(initial);
  }
  /** Resolves original native fields for EditEngine expanded text. @param item - Actual field. @returns Owned field string. */
  override CalcFieldValue(item: SvxFieldItem): OUString {
    return unicode(HeaderFieldText(item, this.data, this.type));
  }
  /** Replaces original selection with text or a feature and returns the resulting source caret. @param range - Source selection. @param value - Literal text or field. @returns Public selection position. */
  Replace(range: ESelection, value: string | SvxFieldItem): EPaM {
    const engine = this.getImpl();
    const selection = engine.CreateNormalizedSel(range);
    if (typeof value === "string") {
      const source = unicode(value);
      try {
        return engine.CreateEPaM(this.InsertText(selection, source));
      } finally {
        source.dispose();
      }
    }
    const start = this.DeleteSelection(selection);
    const result = engine.GetEditDoc().InsertFeature(start, value);
    engine.TextModified();
    engine.UpdateFields();
    return engine.CreateEPaM(result);
  }
}
