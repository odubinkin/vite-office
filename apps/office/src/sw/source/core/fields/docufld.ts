/** @fileoverview Native document annotation field values retained by Writer text hints. */
import type { SwFormatField } from "../../../inc/fmtfld";
import { RES_TXTATR_ANNOTATION } from "../../../inc/hintids";
import { isAnnotationTextField } from "../../../inc/txtfld";
import type { SwDoc } from "../doc/doc";
import type { SwRootFrame } from "../layout/newfrm";
import type { EditTextObject } from "../../../../editeng/source/editeng/editobj";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import { Date as ToolsDate } from "../../../../tools/source/datetime/tdate";
import { Time } from "../../../../tools/source/datetime/ttime";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { convertLanguageToLocale } from "../../../../i18nlangtag/source/isolang/mslangid";
import { LocaleDataWrapper } from "../../../../unotools/source/i18n/localedatawrapper";
import { getProcessComponentContext } from "../../../../comphelper/inc/processfactory";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { XPropertySet } from "../../../../udkapi/com/sun/star/beans/XPropertySet";
import { Converter } from "../../../../udkapi/com/sun/star/script/Converter";
import { TypeClass } from "../../../../udkapi/com/sun/star/uno/TypeClass";
import type { XComponentContext } from "../../../../udkapi/com/sun/star/uno/XComponentContext";
import {
  Date as UnoDate,
  cppu_detail_getUnoType_Date,
} from "../../../../offapi/com/sun/star/util/Date";
import {
  DateTime as UnoDateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../../offapi/com/sun/star/util/DateTime";
import {
  Duration,
  cppu_detail_getUnoType_Duration,
} from "../../../../offapi/com/sun/star/util/Duration";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import type { SwField } from "../../../inc/fldbas";
import { STR_DURATION_FORMAT } from "../../../inc/strings";
import { SwDateTimeField } from "./flddat";
import { SwValueFieldType } from "./fldbas";
import { SvxNumberType } from "../../../../editeng/source/items/numitem";
import { SvxNumType } from "../../../../editeng/inc/svxenum";

/** Original document statistic subtype order. */
export enum SwDocStatSubType {
  Page,
  PageRange,
  Paragraph,
  Word,
  Character,
  Table,
  Graphic,
  OLE,
}

/** Writer statistic field service to native subtype mapping. */
export const docStatServiceSubTypes = {
  PageCount: SwDocStatSubType.Page,
  PageCountRange: SwDocStatSubType.PageRange,
  ParagraphCount: SwDocStatSubType.Paragraph,
  WordCount: SwDocStatSubType.Word,
  CharacterCount: SwDocStatSubType.Character,
  TableCount: SwDocStatSubType.Table,
  GraphicObjectCount: SwDocStatSubType.Graphic,
  EmbeddedObjectCount: SwDocStatSubType.OLE,
} as const;

/** Document-owned type for all count fields. */
export class SwDocStatFieldType {
  /** Binds the original statistic owner. @param document - Actual Writer document. @returns The initialized SwDocStatFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the original document for native point insertion. @returns Writer document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Updates range fields from the first body frame of each anchor. @param layout - Newly formatted Writer root. @returns Nothing. */
  public UpdateRangeFields(layout: SwRootFrame): void {
    for (const node of this.document.GetNodes().entries()) {
      const paragraph = node.GetTextNode();
      const fields = paragraph?.GetpSwpHints()?.GetDocStatFields();
      if (!paragraph || !fields?.length) continue;
      for (const hint of fields) {
        const field = hint.GetAttr().GetField();
        if (field.GetSubType() !== SwDocStatSubType.PageRange) continue;
        const count = layout.GetVirtPageCount(paragraph);
        if (count !== undefined) field.ChangeExpansion(count);
      }
    }
  }

  /** Reads the statistic or page range and applies the original signed-short formatting limit. @param subtype - Native count kind. @param format - Native numbering type. @param virtualPages - Count in the anchor range. @returns Current expansion. */
  public Expand(subtype: SwDocStatSubType, format: SvxNumType, virtualPages: number): string {
    const statistics = this.document.getIDocumentStatistics();
    const stats = statistics.GetDocStat();
    const count =
      [
        subtype === SwDocStatSubType.Page ? statistics.GetPageCount() : stats.nPage,
        virtualPages,
        stats.nPara,
        stats.nWord,
        stats.nChar,
        stats.nTable,
        stats.nGrf,
        stats.nOLE,
      ][subtype] ?? 0;
    return count > 0x7fff || format === SvxNumType.SVX_NUM_PAGEDESC
      ? String(count)
      : new SvxNumberType(format).GetNumStr(count);
  }
}

/** Native count field and the layout-supplied state for a virtual page range. */
export class SwDocStatField implements SwField<SwDocStatField> {
  /** Initializes the count or virtual page field. @param type - Original system type. @param subtype - Statistic kind. @param format - Numbering type. @param virtualPages - Last calculated range count. @returns The initialized SwDocStatField instance. */
  public constructor(
    private readonly type: SwDocStatFieldType,
    private readonly subtype: SwDocStatSubType,
    private readonly format: SvxNumType,
    private virtualPages = 0,
  ) {}

  /** Borrows the original system field type. @returns Native statistic field type. */
  public GetTyp(): SwDocStatFieldType {
    return this.type;
  }

  /** Reads the registered statistic kind. @returns Native subtype. */
  public GetSubType(): SwDocStatSubType {
    return this.subtype;
  }

  /** Reads the original numbering format. @returns Native numbering enumeration. */
  public GetFormat(): SvxNumType {
    return this.format;
  }

  /** Retains the last calculated range count for copying and Worker transport. @returns Page count. */
  public GetVirtPageCount(): number {
    return this.virtualPages;
  }

  /** Receives the actual first body frame’s count. @param count - Layout count. @returns Nothing. */
  public ChangeExpansion(count: number): void {
    this.virtualPages = count;
  }

  /** Expands the active native count. @returns Readable field value. */
  public Expand(): string {
    return this.type.Expand(this.subtype, this.format, this.virtualPages);
  }

  /** Copies the original values. @returns Independent field. */
  public Copy(): SwDocStatField {
    return new SwDocStatField(this.type, this.subtype, this.format, this.virtualPages);
  }

  /** Rebinds the field to the destination statistic owner. @param document - Destination Writer document. @returns Detached copy. */
  public CopyToDocument(document: SwDoc): SwDocStatField {
    return new SwDocStatField(
      document.getIDocumentFieldsAccess().GetDocStatFieldType(),
      this.subtype,
      this.format,
      this.virtualPages,
    );
  }

  /** Releases field-specific state. @returns Nothing. */
  public Dispose(): void {}
}

/** Original document information subtype and flag values. */
export enum SwDocInfoSubType {
  Title = 0,
  Subject = 1,
  Keys = 2,
  Comment = 3,
  Create = 4,
  Change = 5,
  Print = 6,
  DocNo = 7,
  Edit = 8,
  Custom = 9,
  LowerMask = 0x00ff,
  SubMask = 0x0f00,
  SubAuthor = 0x0100,
  SubTime = 0x0200,
  SubDate = 0x0300,
  SubFixed = 0x1000,
}

/** Native DocInfo subtypes admitted from the represented UNO services. */
export const docInfoServiceSubTypes = {
  "DocInfo.Title": SwDocInfoSubType.Title,
  "DocInfo.Subject": SwDocInfoSubType.Subject,
  "DocInfo.KeyWords": SwDocInfoSubType.Keys,
  "DocInfo.Description": SwDocInfoSubType.Comment,
  "DocInfo.CreateAuthor": SwDocInfoSubType.Create | SwDocInfoSubType.SubAuthor,
  "DocInfo.ChangeAuthor": SwDocInfoSubType.Change | SwDocInfoSubType.SubAuthor,
  "DocInfo.PrintAuthor": SwDocInfoSubType.Print | SwDocInfoSubType.SubAuthor,
  "DocInfo.Revision": SwDocInfoSubType.DocNo,
  "DocInfo.CreateDateTime": SwDocInfoSubType.Create | SwDocInfoSubType.SubDate,
  "DocInfo.ChangeDateTime": SwDocInfoSubType.Change | SwDocInfoSubType.SubDate,
  "DocInfo.PrintDateTime": SwDocInfoSubType.Print | SwDocInfoSubType.SubDate,
  "DocInfo.EditTime": SwDocInfoSubType.Edit | SwDocInfoSubType.SubTime,
  "DocInfo.Custom": SwDocInfoSubType.Custom,
} as const;

/** Converts an owned string from the native document properties service. @param value - Owned result. @returns Text. */
function readDocInfoString(value: OUString): string {
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}

/** Converts the custom property through Writer's original UNO service. @param value - Borrowed value. @returns Presentation text. */
function convertCustomProperty(value: Any): string {
  const converter = Converter.create(getProcessComponentContext() as Reference<XComponentContext>);
  try {
    const converted = converter.operatorStar().convertToSimpleType(value, TypeClass.STRING);
    const string = new OUString();
    try {
      converted.extract(string, "OUString");
      return text(string);
    } finally {
      string.dispose();
      converted.dispose();
    }
  } finally {
    converter.dispose();
  }
}

/** System field type that expands metadata through its actual document owner. */
export class SwDocInfoFieldType extends SwValueFieldType {
  /** Expands the original property identified by the subtype. @param subtype - Native subtype and flags. @param format - Document number format. @param language - Field language. @param name - Custom property name. @returns Property presentation. */
  public Expand(subtype: number, format = 0, language = LANGUAGE_SYSTEM, name = ""): string {
    const properties = this.GetDoc().documentProperties.GetDocumentProperties();
    switch (subtype & SwDocInfoSubType.LowerMask) {
      case SwDocInfoSubType.Title:
        return readDocInfoString(properties.getTitle());
      case SwDocInfoSubType.Subject:
        return readDocInfoString(properties.getSubject());
      case SwDocInfoSubType.Comment:
        return readDocInfoString(properties.getDescription());
      case SwDocInfoSubType.DocNo:
        return String(properties.getEditingCycles());
      case SwDocInfoSubType.Edit: {
        const duration = properties.getEditingDuration();
        if (format) return this.ExpandValue(duration / Number(Time.secondPerDay), format, language);
        const seconds = duration % 60;
        return this.FormatClock(
          new Time(Math.trunc(duration / 3600), Math.trunc((duration % 3600) / 60), seconds),
          false,
          seconds > 0,
          language,
        );
      }
      case SwDocInfoSubType.Custom:
        return this.ReadCustomProperty(name, convertCustomProperty) ?? "";
      case SwDocInfoSubType.Keys: {
        const keywords = properties.getKeywords();
        try {
          const values: string[] = [];
          for (let index = 0; index < keywords.getLength(); index++) {
            const value = OUString.unacquired(
              keywords.operatorIndex(index) as unknown as rtl_uStringSlot,
            );
            values.push(text(value));
          }
          return values.join(", ");
        } finally {
          keywords.dispose();
        }
      }
      case SwDocInfoSubType.Create:
        return this.ExpandStamp(
          subtype,
          new DateTime(properties.getCreationDate()),
          format,
          language,
          /** Reads the author stored in document properties. @returns Author text. */ () =>
            properties.getAuthor(),
        );
      case SwDocInfoSubType.Change:
        return this.ExpandStamp(
          subtype,
          new DateTime(properties.getModificationDate()),
          format,
          language,
          /** Reads the last editor stored in document properties. @returns Last editor text. */ () =>
            properties.getModifiedBy(),
        );
      case SwDocInfoSubType.Print:
        return this.ExpandStamp(
          subtype,
          new DateTime(properties.getPrintDate()),
          format,
          language,
          /** Reads the last print operator stored in document properties. @returns Print operator text. */ () =>
            properties.getPrintedBy(),
        );
      default:
        return "";
    }
  }

  /** Updates a live field from its typed property. @param name - Custom property name. @param format - Document format. @param language - Field language. @returns Updated presentation when a value is available. */
  public ExpandCustom(
    name: string,
    format: number,
    language = LANGUAGE_SYSTEM,
  ): string | undefined {
    return this.ReadCustomProperty(
      name,
      /** Expands a UNO date or time from the custom document property. @param value - UNO property value. @returns Formatted field text. */ (
        value,
      ) => {
        const date = new UnoDate();
        if (value.extract(date, cppu_detail_getUnoType_Date))
          return this.ExpandValue(this.DateToDays(date), format, language);
        const stamp = new UnoDateTime();
        if (value.extract(stamp, cppu_detail_getUnoType_DateTime))
          return this.ExpandValue(
            this.DateToDays(stamp) + new Time(stamp).GetTimeInDays(),
            format,
            language,
          );
        const duration = new Duration();
        if (value.extract(duration, cppu_detail_getUnoType_Duration)) {
          const components = [
            duration.Years,
            duration.Months,
            duration.Days,
            duration.Hours,
            duration.Minutes,
            duration.Seconds,
          ];
          return (
            (duration.Negative ? "-" : "+") +
            STR_DURATION_FORMAT.replace(
              /%([1-6])/gu,
              /** Substitutes an indexed date component into the field pattern. @param _ - Matched placeholder. @param index - One-based component index. @returns Formatted component text. */ (
                _,
                index: string,
              ) => String(components[Number(index) - 1]),
            )
          );
        }
        return convertCustomProperty(value);
      },
    );
  }

  /** Resolves the actual UNO document property, retaining the caller's cache on a missing or unavailable value. @param name - Authored field name. @param present - Property conversion. @returns Presentation, if available. */
  private ReadCustomProperty(name: string, present: (value: Any) => string): string | undefined {
    const key = unicode(name);
    try {
      const bag = this.GetDoc()
        .documentProperties.GetDocumentProperties()
        .getUserDefinedProperties();
      try {
        const set = new Reference<XPropertySet>(bag, UNO_QUERY_THROW, XPropertySet.static_type);
        try {
          const info = set.operatorStar().getPropertySetInfo();
          try {
            if (!info.operatorStar().hasPropertyByName(key)) return undefined;
          } finally {
            info.dispose();
          }
          const value = set.operatorStar().getPropertyValue(key);
          try {
            return value.hasValue() ? present(value) : undefined;
          } finally {
            value.dispose();
          }
        } finally {
          set.dispose();
        }
      } finally {
        bag.dispose();
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      return undefined;
    } finally {
      key.dispose();
    }
  }

  /** Returns the native day count relative to the document formatter's null date. @param value - UNO calendar fields. @returns Serial day. */
  private DateToDays(value: UnoDate | UnoDateTime): number {
    return (
      new ToolsDate(value.Day, value.Month, value.Year).GetAsNormalizedDays() -
      this.GetDoc().GetNumberFormatter().GetNullDate().GetAsNormalizedDays()
    );
  }

  /** Expands a valid timestamp or its author according to the original subtype. @param subtype - Native flags. @param stamp - Calendar value. @param format - Number format. @param language - Field language. @param author - Owned author property. @returns Field text. */
  private ExpandStamp(
    subtype: number,
    stamp: DateTime,
    format: number,
    language: number,
    author: () => OUString,
  ): string {
    if (!stamp.IsValidAndGregorian()) return "";
    const display = subtype & SwDocInfoSubType.SubMask;
    if (display === SwDocInfoSubType.SubAuthor) return readDocInfoString(author());
    if (!display) return "";
    if (format)
      return this.ExpandValue(SwDateTimeField.GetDateTime(this.GetDoc(), stamp), format, language);
    return this.FormatClock(stamp, display === SwDocInfoSubType.SubDate, false, language);
  }

  /** Formats a date or a clock with the original locale owner. @param time - Native calendar or clock. @param date - Whether to show the date. @param seconds - Whether to include clock seconds. @param language - Field language. @returns Date or time presentation. */
  private FormatClock(
    time: DateTime | Time,
    date: boolean,
    seconds: boolean,
    language: number,
  ): string {
    const locale = convertLanguageToLocale(language, false);
    try {
      const data = new LocaleDataWrapper(locale);
      try {
        return readDocInfoString(
          date && time instanceof DateTime ? data.getDate(time) : data.getTime(time, seconds),
        );
      } finally {
        data.dispose();
      }
    } finally {
      locale.dispose();
    }
  }
}

/** Native text document-information field and its expansion state. */
export class SwDocInfoField implements SwField<SwDocInfoField> {
  private content: string;
  private automaticLanguage = true;

  /** Initializes the original expansion from document properties. @param type - System field type. @param subtype - Native subtype and flags. @param content - Stored presentation. @param format - Document number-format key. @param name - Custom property name. @returns The initialized SwDocInfoField instance. */
  public constructor(
    private readonly type: SwDocInfoFieldType,
    private readonly subtype: number,
    content?: string,
    private readonly format = 0,
    private readonly name = "",
  ) {
    this.content = content ?? type.Expand(subtype, format, LANGUAGE_SYSTEM, name);
  }

  /** Borrows the original system field type. @returns Field type. */
  public GetTyp(): SwDocInfoFieldType {
    return this.type;
  }

  /** Reads the original subtype including its fixed flag. @returns Native subtype and flags. */
  public GetSubType(): number {
    return this.subtype;
  }

  /** Reads whether the native field retains its authored presentation. @returns Fixed flag. */
  public IsFixed(): boolean {
    return Boolean(this.subtype & SwDocInfoSubType.SubFixed);
  }

  /** Reads the original number-format key. @returns Document format. */
  public GetFormat(): number {
    return this.format;
  }

  /** Returns the native custom property name. @returns Name. */
  public GetName(): string {
    return this.name;
  }

  /** Reads whether the field follows automatic language selection. @returns Native flag. */
  public IsAutomaticLanguage(): boolean {
    return this.automaticLanguage;
  }

  /** Sets the native automatic language flag. @param automatic - Whether language follows the field context. @returns Nothing. */
  public SetAutomaticLanguage(automatic: boolean): void {
    this.automaticLanguage = automatic;
  }

  /** Updates the native stored presentation. @param content - Current presentation. @returns Nothing. */
  public SetExpansion(content: string): void {
    this.content = content;
  }

  /** Expands live metadata and retains the presentation of fixed fields. @returns Current text. */
  public Expand(): string {
    if (!this.IsFixed() && this.type.GetDoc().documentProperties.GetPendingXml() === undefined) {
      this.content =
        (this.subtype & SwDocInfoSubType.LowerMask) === SwDocInfoSubType.Custom
          ? (this.type.ExpandCustom(this.name, this.format) ?? this.content)
          : this.type.Expand(this.subtype, this.format);
    }
    return this.content;
  }

  /** Copies field and stored expansion. @returns Copy for the same owner. */
  public Copy(): SwDocInfoField {
    return this.CopyWithType(this.type, this.format);
  }

  /** Copies the field into its destination's original system field type. @param document - Destination model. @returns Detached copy. */
  public CopyToDocument(document: SwDoc): SwDocInfoField {
    if (document === this.type.GetDoc()) return this.Copy();
    return this.CopyWithType(
      document.getIDocumentFieldsAccess().GetDocInfoFieldType(),
      this.type.CopyFormatToDocument(this.format, document),
    );
  }

  /** Releases field-specific state. @returns Nothing. */
  public Dispose(): void {}

  /** Copies native state after choosing the destination type and format. @param type - Destination system type. @param format - Destination format. @returns Detached field. */
  private CopyWithType(type: SwDocInfoFieldType, format: number): SwDocInfoField {
    const result = new SwDocInfoField(type, this.subtype, this.content, format, this.name);
    result.SetAutomaticLanguage(this.automaticLanguage);
    return result;
  }
}

let nextPostItId = 1;

/** Original annotation field type carries the document that owns the fields. */
export class SwPostItFieldType {
  /** Finds the document's system annotation field type. @param document - Owning document. @returns Canonical field type. */
  static Get(document: SwDoc): SwPostItFieldType {
    return document.getIDocumentFieldsAccess().GetPostItFieldType();
  }

  /** Associates the annotation type with one Writer document. @param document - Owning document. @returns Field type. */
  public constructor(private readonly document: SwDoc) {}

  /** Enumerates live format owners in model order. @returns Annotation formats. */
  *GatherFields(): IterableIterator<SwFormatField> {
    for (const node of this.document.GetNodes().entries()) {
      const hints = node.GetTextNode()?.GetpSwpHints();
      if (!hints) continue;
      for (
        let index = hints.GetFirstPosSortedByWhichAndStart(RES_TXTATR_ANNOTATION);
        index < hints.Count();
        index++
      ) {
        const hint = hints.GetSortedByWhichAndStart(index);
        if (!isAnnotationTextField(hint)) break;
        yield hint.GetAttr();
      }
    }
  }

  /** Resolves an annotation restored by document history. @param id - Retained field identifier. @returns Live annotation value. */
  FindField(id: number): SwPostItField | undefined {
    return this.FindFormat(id)?.GetField();
  }

  /** Resolves the attached format after undo has recreated it. @param id - Retained field identifier. @returns Live annotation format. */
  FindFormat(id: number): SwFormatField | undefined {
    for (const format of this.GatherFields())
      if (format.GetField().GetPostItId() === id) return format;
    return undefined;
  }

  /** Returns the document associated with the field type. @returns Owning document. */
  GetDoc(): SwDoc {
    return this.document;
  }
}

/** Stored author, thread, and content data for one annotation. */
export interface SwPostItFieldData {
  readonly author: string;
  readonly text: string;
  readonly initials: string;
  readonly name: string;
  readonly dateTime: DateTime;
  readonly resolved?: boolean;
  readonly id?: number;
  readonly parentId?: number;
  readonly paraId?: number;
  readonly parentPostItId?: number;
  readonly parentName?: string;
  readonly textObject?: EditTextObject;
}

/** Owns the source comment payload and an optional rich-text object snapshot. */
export class SwPostItField {
  private data: SwPostItFieldData;
  private textObject: EditTextObject | undefined;

  /** Creates the source field with the original defaults for independent comments. @param type - Document field type. @param data - Native comment content and thread data. @returns Field. */
  constructor(
    private readonly type: SwPostItFieldType,
    data: SwPostItFieldData,
  ) {
    const { textObject, ...values } = data;
    const id = data.id || nextPostItId;
    nextPostItId = Math.max(nextPostItId, id + 1);
    this.data = {
      ...values,
      dateTime: new DateTime(data.dateTime),
      id,
      resolved: data.resolved ?? false,
      parentId: data.parentId ?? 0,
      paraId: data.paraId ?? 0,
      parentPostItId: data.parentPostItId ?? 0,
      parentName: data.parentName ?? "",
    };
    this.textObject = textObject?.Clone();
  }

  /** Reads the original owner type. @returns Document field type. */
  GetTyp(): SwPostItFieldType {
    return this.type;
  }

  /** Returns the native field identity retained through undo and redo. @returns Annotation ID. */
  GetPostItId(): number {
    return this.data.id ?? 0;
  }

  /** Reads the persisted resolution state of this annotation. @returns Whether resolved. */
  IsResolved(): boolean {
    return this.data.resolved === true;
  }

  /** Sets the original resolution member. @param value - Whether resolved. @returns Nothing. */
  SetResolved(value: boolean): void {
    this.data = { ...this.data, resolved: value };
  }

  /** Reads the annotation name used to join its point and range. @returns Annotation name. */
  GetName(): string {
    return this.data.name;
  }

  /** Assigns the generated name when the incoming annotation has none. @param name - Field name. @returns Nothing. */
  SetName(name: string): void {
    this.data = { ...this.data, name };
  }

  /** Assigns the paragraph ID used by replies. @param paraId - Native paragraph identifier. @returns Nothing. */
  SetParaId(paraId: number): void {
    this.data = { ...this.data, paraId };
  }

  /** Clears the original parent link when a reply becomes a root. @returns Nothing. */
  ClearParent(): void {
    this.data = { ...this.data, parentId: 0, parentPostItId: 0, parentName: "" };
  }

  /** Reads the plain text fallback used by the original sidebar. @returns Comment text. */
  GetPar2(): string {
    return this.data.text;
  }

  /** Updates the plain text fallback published by the annotation editor. @param value - Current editor text. @returns Nothing. */
  SetPar2(value: string): void {
    this.data = { ...this.data, text: value };
  }

  /** Stores an independent native editor snapshot. @param value - Current rich text. @returns Nothing. */
  SetTextObject(value: EditTextObject | undefined): void {
    const previous = this.textObject;
    this.textObject = value?.Clone();
    previous?.dispose();
  }

  /** Reads the current native rich text snapshot. @returns Optional borrowed edit text. */
  GetTextObject(): EditTextObject | undefined {
    return this.textObject;
  }

  /** Returns value metadata for the comment. @returns An independent metadata value. */
  GetData(): Omit<SwPostItFieldData, "textObject"> {
    return { ...this.data, dateTime: new DateTime(this.data.dateTime) };
  }

  /** Makes an independent field with the same content and native identifier. @param type - Destination field type. @returns Field copy. */
  Copy(type = this.type): SwPostItField {
    return new SwPostItField(type, {
      ...this.data,
      ...(this.textObject ? { textObject: this.textObject } : {}),
    });
  }

  /** Copies the annotation to the original field type of another document. @param document - Destination. @returns Owned field. */
  CopyToDocument(document: SwDoc): SwPostItField {
    return this.Copy(SwPostItFieldType.Get(document));
  }

  /** Releases the native editor snapshot. @returns Nothing. */
  Dispose(): void {
    this.textObject?.dispose();
    this.textObject = undefined;
  }
}

/** Native system type shared by conditional text and hidden text. */
export class SwHiddenTextFieldType {
  /** Initializes the document-wide hidden-text setting. @param document - Native document. @param hidden - Hide text according to its condition. @returns The initialized SwHiddenTextFieldType instance. */
  public constructor(
    private readonly document: SwDoc,
    private readonly hidden = true,
  ) {}

  /** Borrows the document that owns this field type. @returns Native document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the native hidden-text mode. @returns Whether conditions control visibility. */
  public GetHiddenFlag(): boolean {
    return this.hidden;
  }
}

/** Original conditional or hidden text field parameters and calculated state. */
export interface SwHiddenTextFieldData {
  readonly conditional: boolean;
  readonly condition: string;
  readonly trueContent: string;
  readonly falseContent: string;
  readonly hidden: boolean;
  readonly currentPresentation?: string;
}

/** Original inline field behind both ConditionalText and HiddenText services. */
export class SwHiddenTextField implements SwField<SwHiddenTextField> {
  private hidden: boolean;
  private currentPresentation: string | undefined;

  /** Constructs a detached field from its original parameters. @param type - Document system type. @param data - Native field parameters. @returns The initialized SwHiddenTextField instance. */
  public constructor(
    private readonly type: SwHiddenTextFieldType,
    private readonly data: SwHiddenTextFieldData,
  ) {
    this.hidden = data.hidden;
    this.currentPresentation = data.currentPresentation;
  }

  /** Borrows the original shared system type. @returns Document field type. */
  public GetTyp(): SwHiddenTextFieldType {
    return this.type;
  }

  /** Returns the condition used by the expression pass. @returns Original expression. */
  public GetPar1(): string {
    return this.data.condition;
  }

  /** Stores the original inverse of the calculated boolean. @param hidden - Native field flag. @returns Nothing. */
  public SetValue(hidden: boolean): void {
    this.hidden = hidden;
  }

  /** Refreshes the conditional presentation for quoted literal branches. @returns Nothing. */
  public Evaluate(): void {
    if (!this.data.conditional) return;
    const value = this.GetBranch();
    this.currentPresentation =
      value.length > 1 && value.startsWith('"') && value.endsWith('"')
        ? value.slice(1, -1)
        : undefined;
  }

  /** Reads the original conditional branch when there is no cached presentation. @returns Selected branch. */
  private GetBranch(): string {
    return this.data.condition && !this.hidden ? this.data.trueContent : this.data.falseContent;
  }

  /** Expands the field for layout, text extraction and ODF. @returns Current presentation. */
  public Expand(): string {
    if (this.data.conditional) return this.currentPresentation ?? this.GetBranch();
    if (!this.type.GetHiddenFlag() || (this.data.condition && this.hidden))
      return this.data.trueContent;
    return this.data.falseContent;
  }

  /** Snapshots the original parameters along with the live field values. @returns Independent values. */
  public GetData(): SwHiddenTextFieldData {
    const { conditional, condition, trueContent, falseContent } = this.data;
    return {
      conditional,
      condition,
      trueContent,
      falseContent,
      hidden: this.hidden,
      ...(this.currentPresentation === undefined
        ? {}
        : { currentPresentation: this.currentPresentation }),
    };
  }

  /** Copies the original field values under the current system type. @returns Independent field. */
  public Copy(): SwHiddenTextField {
    return new SwHiddenTextField(this.type, this.GetData());
  }

  /** Binds the copied field to its destination system type. @param doc - Destination document. @returns Independent field. */
  public CopyToDocument(doc: SwDoc): SwHiddenTextField {
    return new SwHiddenTextField(
      doc.getIDocumentFieldsAccess().GetHiddenTextFieldType(),
      this.GetData(),
    );
  }

  /** Disposes the field, whose parameter storage is owned by JavaScript. @returns Nothing. */
  public Dispose(): void {}
}

/** Native document-owned hidden paragraph field type. */
export class SwHiddenParaFieldType {
  /** Binds the canonical document. @param document - Source model. @returns The initialized SwHiddenParaFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Borrows the original document owner. @returns Native document. */
  public GetDoc(): SwDoc {
    return this.document;
  }
}

/** Original paragraph condition and its current hidden flag. */
export class SwHiddenParaField implements SwField<SwHiddenParaField> {
  /** Creates a native hidden paragraph field. @param type - Document type. @param condition - Writer expression. @param hidden - Hidden value. @returns The initialized SwHiddenParaField instance. */
  public constructor(
    private readonly type: SwHiddenParaFieldType,
    private readonly condition: string,
    private hidden = false,
  ) {}

  /** Borrows the system field type. @returns Document field type. */
  public GetTyp(): SwHiddenParaFieldType {
    return this.type;
  }

  /** Reads the native condition. @returns Writer expression. */
  public GetPar1(): string {
    return this.condition;
  }

  /** Reads the current native hidden flag. @returns Whether the field hides its paragraph. */
  public IsHidden(): boolean {
    return this.hidden;
  }

  /** Updates the original cached visibility. @param hidden - Calculated state. @returns Nothing. */
  public SetHidden(hidden: boolean): void {
    this.hidden = hidden;
  }

  /** Hidden paragraph fields always have an empty presentation. @returns Empty text. */
  public Expand(): string {
    return "";
  }

  /** Copies the field under its current system type. @returns Detached field. */
  public Copy(): SwHiddenParaField {
    return new SwHiddenParaField(this.type, this.condition, this.hidden);
  }

  /** Binds the field to its destination document. @param doc - Destination model. @returns Detached field. */
  public CopyToDocument(doc: SwDoc): SwHiddenParaField {
    return new SwHiddenParaField(
      doc.getIDocumentFieldsAccess().GetHiddenParaFieldType(),
      this.condition,
      this.hidden,
    );
  }

  /** Disposes the scalar field parameters. @returns Nothing. */
  public Dispose(): void {}
}
