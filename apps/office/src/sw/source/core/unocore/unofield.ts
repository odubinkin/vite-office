/** @fileoverview Writer's UNO Annotation descriptor and attachment to the native text field. */
import type { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import {
  DateTime as UnoDateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../../offapi/com/sun/star/util/DateTime";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { DateTime } from "../../../../tools/source/datetime/datetime";
import {
  SwTextField,
  type SwTextDateTimeField,
  type SwTextDocInfoField,
  type SwTextReferenceField,
} from "../../../inc/txtfld";
import { SwFormatField } from "../../../inc/fmtfld";
import { SwDateTimeSubType } from "../../../inc/fldbas";
import { SwDateTimeField } from "../fields/flddat";
import { RES_TXTATR_FIELD } from "../../../inc/hintids";
import { RefFieldFormat } from "../../../inc/reffld";
import { ReferencesSubtype } from "../../../inc/reffldsubtype";
import { ReferenceFieldSource } from "../../../../offapi/com/sun/star/text/ReferenceFieldSource";
import { SwPaM, SwPosition } from "../crsr/pam";
import {
  SwDocInfoField,
  SwDocInfoSubType,
  SwPostItField,
  SwPostItFieldType,
  type SwPostItFieldData,
} from "../fields/docufld";
import { SwGetRefField, type SwGetRefFieldData } from "../fields/reffld";
import { SwTextAPIObject } from "../fields/textapi";
import { SwXTextRange, type SwXTextOwner } from "./unoobj2";
import { illegal, invalid, scalar, stringValue, text, unicode, unknown } from "./unocrsrhelper";

/** Implements the annotation service's descriptor and borrowed attached text field. */
export class SwXTextField {
  private data: SwPostItFieldData = {
    author: "",
    initials: "",
    text: "",
    name: "",
    dateTime: new DateTime(DateTime.EMPTY),
  };
  private hint: SwTextField | undefined;
  private parent: SwXTextOwner | undefined;
  private textRange: SwTextAPIObject | undefined;

  /** Supplies the original annotation TextRange text source. @returns Actual annotation text. */
  getTextRange(): SwTextAPIObject {
    if (!this.textRange) {
      this.textRange = new SwTextAPIObject();
      const field = this.hint?.GetAttr().GetField();
      const object = field?.GetTextObject();
      if (object) this.textRange.GetEditSource().SetText(object);
      else {
        const value = unicode(field?.GetPar2() ?? this.data.text);
        try {
          this.textRange.GetEditSource().SetText(value);
        } finally {
          value.dispose();
        }
      }
    }
    return this.textRange;
  }

  /** Sets the annotation descriptor's native name. @param name - Field name. @returns Nothing. */
  setName(name: OUStringConstReference): void {
    this.data = { ...this.data, name: text(name) };
    this.hint?.GetAttr().GetField().SetName(this.data.name);
  }

  /** Reads and writes the consumed descriptor properties before attachment. @param key - Native property name. @param input - Typed UNO value. @returns Nothing. */
  setPropertyValue(key: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Annotation descriptor is attached");
    const propertyName = text(key);
    switch (propertyName) {
      case "Author":
        this.data = { ...this.data, author: stringValue(input) };
        break;
      case "Initials":
        this.data = { ...this.data, initials: stringValue(input) };
        break;
      case "Content":
        this.data = { ...this.data, text: stringValue(input) };
        break;
      case "Name":
        this.data = { ...this.data, name: stringValue(input) };
        break;
      case "ParentName":
        this.data = { ...this.data, parentName: stringValue(input) };
        break;
      case "Resolved":
        this.data = { ...this.data, resolved: scalar(input, "bool") as boolean };
        break;
      case "DateTimeValue": {
        const date = new UnoDateTime();
        if (!input.extract(date, cppu_detail_getUnoType_DateTime)) illegal(propertyName);
        this.data = { ...this.data, dateTime: new DateTime(date) };
        break;
      }
      default:
        unknown(propertyName);
    }
  }

  /** Inserts at the selection end, retaining the selected text as an annotation mark. @param range - Registered insertion or selected range. @returns Nothing. */
  attach(range: SwXTextRange): void {
    const doc = range.GetDoc();
    const oldHint = this.hint;
    const oldNode = oldHint?.GetTextNode();
    if (oldHint && oldNode?.GetDoc() !== doc) illegal("Annotation belongs to another document");
    const oldField = oldHint?.GetAttr().GetField();
    const value = oldField ?? new SwPostItField(SwPostItFieldType.Get(doc), this.data);
    try {
      if (!oldField && this.textRange) {
        const source = this.textRange.GetEditSource();
        const plain = source.GetText();
        const editText = source.CreateTextObject();
        try {
          value.SetPar2(text(plain));
          value.SetTextObject(editText);
        } finally {
          editText.dispose();
          plain.dispose();
          this.textRange.dispose();
          this.textRange = undefined;
        }
      }
      doc.RunModelTransaction(
        /** Attaches the current range and releases the earlier annotation point. @returns Nothing. */ () => {
          const format = doc
            .GetDocumentContentOperationsManager()
            .InsertPostItField(range.GetPaM(), value);
          if (oldHint && oldNode) oldNode.EraseText(oldHint.GetStart(), 1);
          this.hint = format.GetTextField();
          this.parent = range.getText();
        },
      );
    } finally {
      if (!oldField) value.Dispose();
    }
  }

  /** Returns the annotation mark or the one-character point range. @returns Registered anchor. */
  getAnchor(): SwXTextRange {
    const hint = this.hint;
    const node = hint?.GetTextNode();
    if (!hint || !node || !this.parent) return invalid("Annotation is detached");
    const mark = node.GetDoc().GetIDocumentMarkAccess().GetAnnotationMark(hint.GetAttr());
    const first = mark?.GetMarkStart() ?? new SwPosition(node, hint.GetStart());
    const last = mark?.GetMarkEnd() ?? new SwPosition(node, hint.GetStart() + 1);
    const anchor = new SwPaM(first, last);
    try {
      return new SwXTextRange(anchor, this.parent);
    } finally {
      anchor.Dispose();
      if (!mark) {
        first.Dispose();
        last.Dispose();
      }
    }
  }

  /** Erases the attached annotation and its range. @returns Nothing. */
  dispose(): void {
    const hint = this.hint;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
    this.hint = undefined;
    this.parent = undefined;
    this.textRange?.dispose();
    this.textRange = undefined;
  }
}

/** Consumed native GetReference descriptor over the same field attachment boundary as annotations. */
export class SwXGetReferenceField {
  private data: SwGetRefFieldData = {
    name: "",
    format: RefFieldFormat.Page,
    source: ReferencesSubtype.SetRefAttr,
    language: "",
    flags: 0,
    presentation: "",
  };
  private hint: SwTextReferenceField | undefined;

  /** Assigns original UNO reference field properties on the descriptor. @param name - Native property. @param input - Typed UNO value. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer reference field is attached.");
    const property = text(name);
    switch (property) {
      case "SourceName":
        this.data = { ...this.data, name: stringValue(input) };
        break;
      case "ReferenceFieldPart": {
        const format = scalar(input, "sal_Int16") as number;
        this.data = {
          ...this.data,
          format: RefFieldFormat[format] === undefined ? RefFieldFormat.Page : format,
        };
        break;
      }
      case "ReferenceFieldSource": {
        const source = scalar(input, "sal_Int16") as number;
        if (
          source !== ReferenceFieldSource.REFERENCE_MARK &&
          source !== ReferenceFieldSource.BOOKMARK
        )
          illegal(property);
        this.data = {
          ...this.data,
          source:
            source === ReferenceFieldSource.BOOKMARK
              ? ReferencesSubtype.Bookmark
              : ReferencesSubtype.SetRefAttr,
        };
        break;
      }
      case "ReferenceFieldLanguage":
        this.data = { ...this.data, language: stringValue(input) };
        break;
      case "ReferenceFieldFlags":
        this.data = { ...this.data, flags: (scalar(input, "sal_Int16") as number) & 0xffff };
        break;
      case "CurrentPresentation":
        this.data = { ...this.data, presentation: stringValue(input) };
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the native field to the current text position. @param range - Actual Writer range. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer reference field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer reference field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetReferenceFieldType();
    const field = new SwGetRefField(type, this.data);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer reference field could not be inserted.");
    this.hint = hint;
  }

  /** Returns the original field name or cached expansion. @param showCommand - Whether to show the field command. @returns Field presentation. */
  public getPresentation(showCommand: boolean): OUStringConstReference {
    const field = this.hint?.GetAttr().GetField();
    if (!field) invalid("Writer reference field is detached.");
    return unicode(showCommand ? `Reference ${field.GetData().name}` : field.Expand());
  }

  /** Removes the attached native field point. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** Native descriptor for the represented document information services. */
export class SwXDocInfoField {
  private fixed = false;
  private name = "";
  private date = false;
  private automaticLanguage = true;
  private format = 0;
  private presentation = "";
  private hint: SwTextDocInfoField | undefined;

  /** Binds the subtype selected by the UNO service. @param subtype - Native document information subtype. */
  public constructor(private readonly subtype: number) {}

  /** Assigns the original importer properties on the detached descriptor. @param name - UNO property name. @param input - Typed UNO property value. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer document information field is attached.");
    const property = text(name);
    switch (property) {
      case "IsFixed":
        this.fixed = scalar(input, "bool") as boolean;
        break;
      case "CurrentPresentation":
        this.presentation = stringValue(input);
        break;
      case "Content":
      case "Author":
        stringValue(input);
        break;
      case "Revision":
        scalar(input, "sal_Int32");
        break;
      case "Name":
        if (this.subtype !== SwDocInfoSubType.Custom) unknown(property);
        this.name = stringValue(input);
        break;
      case "IsDate":
        if (!this.HasDateTime()) unknown(property);
        this.date = scalar(input, "bool") as boolean;
        break;
      case "NumberFormat":
        if (!this.HasNumberFormat()) unknown(property);
        this.format = (scalar(input, "sal_Int32") as number) >>> 0;
        break;
      case "IsFixedLanguage":
        if (!this.HasNumberFormat()) unknown(property);
        this.automaticLanguage = !(scalar(input, "bool") as boolean);
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the document's native field to the current text point. @param range - Writer text range. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer document information field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer document information field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetDocInfoFieldType();
    let subtype = this.subtype;
    if (this.HasDateTime())
      subtype =
        (subtype & SwDocInfoSubType.LowerMask) |
        (this.date ? SwDocInfoSubType.SubDate : SwDocInfoSubType.SubTime);
    const field = new SwDocInfoField(
      type,
      subtype | (this.fixed ? SwDocInfoSubType.SubFixed : 0),
      undefined,
      this.format,
      this.name,
    );
    if (this.presentation) field.SetExpansion(this.presentation);
    field.SetAutomaticLanguage(this.automaticLanguage);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer document information field could not be inserted.");
    this.hint = hint;
  }

  /** Disposes the native field by removing its point from the document. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }

  /** Tests whether the service exposes the native IsDate property. @returns Calendar or clock service. */
  private HasDateTime(): boolean {
    return (this.subtype & SwDocInfoSubType.SubMask) === SwDocInfoSubType.SubDate;
  }

  /** Tests whether the original service exposes numeric formatting. @returns Format property availability. */
  private HasNumberFormat(): boolean {
    return (
      this.HasDateTime() ||
      (this.subtype & SwDocInfoSubType.LowerMask) === SwDocInfoSubType.Edit ||
      this.subtype === SwDocInfoSubType.Custom
    );
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

  /** Assigns original date/time properties. @param name - UNO property name. @param input - Typed property value. */
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

  /** Attaches the date/time field at the original dummy position. @param range - Current range. */
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

  /** Removes the attached point through the document text model. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}
