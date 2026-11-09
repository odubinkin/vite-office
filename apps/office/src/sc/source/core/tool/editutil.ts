/** @fileoverview Original ScEditEngineDefaulter text and attribute-default operations. */
import { EditTextObject } from "../../../../editeng/inc/editobj";
import { EditEngine } from "../../../../editeng/inc/editeng";
import { DocumentImpEditEngine } from "../../../../editeng/source/editeng/impedit2.document";
import { EEControlBits } from "../../../../editeng/inc/editstat";
import { EditPaM } from "../../../../editeng/inc/EditPaM";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { ScGlobal } from "../../../inc/global";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  SvxURLFormat,
  type SvxFieldDataConstReference,
  type SvxFieldItem,
  type SvxTableField,
  type SvxURLField,
} from "../../../../editeng/inc/flditem";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import * as FieldType from "../../../../offapi/com/sun/star/text/textfield/Type";
import type { Color } from "../../../../tools/inc/color";
import { FontLineStyle } from "../../../../tools/inc/fontenum";
import { Date } from "../../../../tools/source/datetime/tdate";
import { LocaleDataWrapper } from "../../../../unotools/source/i18n/localedatawrapper";
import { getSystemLocale } from "../../../../unotools/source/misc/syslocale";
import type { ScDocument } from "../../../inc/document";
import { SfxItemSet } from "../../../../svl/source/items/itemset";

import { GetDocumentShell } from "../data/documen2";

/** Document callers use the text-object and text operations of the no-view editor. */
export type DocumentEditEngine = Pick<
  ScFieldEditEngine,
  "SetText" | "SetTextCurrentDefaults" | "CreateTextObject" | "GetText" | "GetParagraphText"
>;

/** Original Calc editor layer owns optional paragraph defaults and applies them without recording undo. */
class ScEditEngineDefaulter extends EditEngine {
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

  /** Original destruction of the owned optional item set. @returns Nothing. */
  protected disposeDefaults(): void {
    this.m_oDefaults?.Dispose();
    this.m_oDefaults = null;
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

  /** Releases Calc-owned defaults and the base engine. @returns Nothing. */
  Dispose(): void {
    this.disposeDefaults();
    this.getImpl().Dispose();
  }
}

/** Original text evaluation for field classes admitted by the Calc document editor. @param field - Borrowed field. @param doc - Actual document. @param lineStyle - Optional underline output. @returns Owned field representation. */
function GetCellFieldValue(
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
