/** @fileoverview Connects Writer chapter, page, count and date/time UNO descriptors to native document fields. */
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import {
  DateTime as UnoDateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../../offapi/com/sun/star/util/DateTime";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import {
  PageNumberType,
  cppu_detail_getUnoType_PageNumberType,
} from "../../../../offapi/com/sun/star/text/PageNumberType";
import { ChapterFormat } from "../../../../offapi/com/sun/star/text/ChapterFormat";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwDateTimeSubType } from "../../../inc/fldbas";
import { SwFormatField } from "../../../inc/fmtfld";
import { RES_TXTATR_FIELD } from "../../../inc/hintids";
import {
  SwTextField,
  type SwTextChapterField,
  type SwTextDateTimeField,
  type SwTextDocStatField,
  type SwTextPageNumberField,
} from "../../../inc/txtfld";
import { PutChapterFormat, SwChapterField } from "../fields/chpfld";
import { SwDocStatField, type SwDocStatSubType } from "../fields/docufld";
import { SwPageNumberField, SwPageNumSubType } from "../fields/docufld.pagenumber";
import { SwDateTimeField } from "../fields/flddat";
import type { SwXTextRange } from "./unoobj2";
import { illegal, invalid, scalar, stringValue, text, unknown } from "./unocrsrhelper";

/** Original Chapter UNO descriptor and native text field attachment. */
export class SwXChapterField {
  private format: number = ChapterFormat.NAME;
  private level = 0;
  private hint: SwTextChapterField | undefined;

  /** Sets the original typed chapter properties. @param name - UNO property name. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer chapter field is attached.");
    const property = text(name);
    switch (property) {
      case "ChapterFormat":
        this.format = scalar(input, "sal_Int16") as number;
        break;
      case "Level":
        this.level = (scalar(input, "sal_Int8") as number) & 0xff;
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the native field and its dummy character. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer chapter field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer chapter field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetChapterFieldType();
    const field = new SwChapterField(type, PutChapterFormat(this.format), this.level);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer chapter field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached native point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** Native PageNumber UNO descriptor shared with continuation strings. */
export class SwXPageNumberField {
  private subtype = SwPageNumSubType.Previous;
  private format = SvxNumType.SVX_NUM_CHARS_UPPER_LETTER;
  private offset = 0;
  private userText = "";
  private hint: SwTextPageNumberField | undefined;

  /** Reads the original PageNumber descriptor properties. @param name - UNO field property. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer page number field is attached.");
    const property = text(name);
    switch (property) {
      case "SubType": {
        const selection: [number] = [0];
        if (
          !input.extract(selection, cppu_detail_getUnoType_PageNumberType) &&
          !input.extract(selection, "sal_Int32")
        )
          illegal("Invalid page number field selection.");
        switch (selection[0]) {
          case PageNumberType.PREV:
            this.subtype = SwPageNumSubType.Previous;
            break;
          case PageNumberType.CURRENT:
            this.subtype = SwPageNumSubType.Random;
            break;
          case PageNumberType.NEXT:
            this.subtype = SwPageNumSubType.Next;
            break;
          default:
            illegal("Invalid page number field selection.");
        }
        break;
      }
      case "NumberingType":
        this.format = scalar(input, "sal_Int16") as SvxNumType;
        break;
      case "Offset":
        this.offset = scalar(input, "sal_Int16") as number;
        break;
      case "UserText":
        this.userText = stringValue(input);
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the original native field and its dummy character. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer page number field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer page number field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetPageNumberFieldType();
    const field = new SwPageNumberField(
      type,
      this.subtype,
      this.format,
      this.offset,
      this.userText,
    );
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer page number field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached native point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** Original UNO count field descriptor and its attachment. */
export class SwXDocStatField {
  private format = SvxNumType.SVX_NUM_CHARS_UPPER_LETTER;
  private hint: SwTextDocStatField | undefined;

  /** Selects the native subtype for this service. @param subtype - Count kind. @returns The initialized SwXDocStatField instance. */
  public constructor(private readonly subtype: SwDocStatSubType) {}

  /** Sets the original sal_Int16 NumberingType. @param name - UNO property name. @param input - Typed source value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    const property = text(name);
    if (property !== "NumberingType") unknown(property);
    this.format = scalar(input, "sal_Int16") as SvxNumType;
  }

  /** Attaches the original count field to its document and text point. @param range - Native text range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer statistic field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer statistic field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetDocStatFieldType();
    const field = new SwDocStatField(type, this.subtype, this.format);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer statistic field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached text point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** Original DateTime UNO descriptor over the Writer field owner. */
export class SwXDateTimeField {
  private subtype = SwDateTimeSubType.Time;
  private automaticLanguage = true;
  private format = 0;
  private offset = 0;
  private value: DateTime | undefined;
  private hint: SwTextDateTimeField | undefined;

  /** Assigns original date/time properties. @param name - UNO property name. @param input - Typed property value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer date/time field is attached.");
    const property = text(name);
    switch (property) {
      case "IsFixed":
        this.subtype =
          (this.subtype & ~SwDateTimeSubType.Fixed) |
          (scalar(input, "bool") ? SwDateTimeSubType.Fixed : SwDateTimeSubType.None);
        break;
      case "IsDate":
        this.subtype =
          (this.subtype & ~(SwDateTimeSubType.Date | SwDateTimeSubType.Time)) |
          (scalar(input, "bool") ? SwDateTimeSubType.Date : SwDateTimeSubType.Time);
        break;
      case "NumberFormat":
        this.format = (scalar(input, "sal_Int32") as number) >>> 0;
        break;
      case "IsFixedLanguage":
        this.automaticLanguage = !scalar(input, "bool");
        break;
      case "Adjust":
        this.offset = scalar(input, "sal_Int32") as number;
        break;
      case "DateTimeValue": {
        const value = new UnoDateTime();
        if (!input.extract(value, cppu_detail_getUnoType_DateTime)) illegal(property);
        this.value = new DateTime(value);
        break;
      }
      default:
        unknown(property);
    }
  }

  /** Attaches the date/time field at the original dummy position. @param range - Current range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer date/time field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer date/time field must be in text.");
    const field = new SwDateTimeField(
      node.GetDoc().getIDocumentFieldsAccess().GetDateTimeFieldType(),
      this.subtype,
      this.format,
    );
    if (this.value) field.SetDateTime(this.value);
    field.SetOffset(this.offset);
    field.SetAutomaticLanguage(this.automaticLanguage);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer date/time field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached point through the document text model. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}
