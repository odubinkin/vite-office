/** @fileoverview Writer's UNO Annotation descriptor and attachment to the native text field. */
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
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
  type SwTextDocStatField,
  type SwTextReferenceField,
  type SwTextPageNumberField,
  type SwTextChapterField,
  type SwTextDropDownField,
  type SwTextHiddenTextField,
  type SwTextHiddenParaField,
  type SwTextJumpEditField,
  type SwTextSequenceField,
  type SwTextGetExpField,
  type SwTextUserField,
} from "../../../inc/txtfld";
import { SwFormatField } from "../../../inc/fmtfld";
import { SwDateTimeSubType } from "../../../inc/fldbas";
import {
  PageNumberType,
  cppu_detail_getUnoType_PageNumberType,
} from "../../../../offapi/com/sun/star/text/PageNumberType";
import { ChapterFormat } from "../../../../offapi/com/sun/star/text/ChapterFormat";
import {
  SwGetExpField,
  SwGetSetExpType,
  SwSetExpField,
  type SwSetExpFieldType,
} from "../fields/expfld";
import { SwUserField, type SwUserFieldType } from "../fields/usrfld";
import { SwJumpEditField, SwJumpEditFormat } from "../fields/docufld.jumpedit";
import { SwDropDownField, type SwDropDownFieldData } from "../fields/flddropdown";
import { PutChapterFormat, SwChapterField } from "../fields/chpfld";
import { SwPageNumberField, SwPageNumSubType } from "../fields/docufld.pagenumber";
import { SvxNumType } from "../../../../editeng/inc/svxenum";
import { SwDateTimeField } from "../fields/flddat";
import { RES_TXTATR_FIELD } from "../../../inc/hintids";
import { RefFieldFormat } from "../../../inc/reffld";
import { ReferencesSubtype } from "../../../inc/reffldsubtype";
import { ReferenceFieldSource } from "../../../../offapi/com/sun/star/text/ReferenceFieldSource";
import { SwPaM, SwPosition } from "../crsr/pam";
import {
  SwDocInfoField,
  SwDocStatField,
  SwHiddenTextField,
  SwHiddenParaField,
  type SwHiddenTextFieldData,
  type SwDocStatSubType,
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

  /** Assigns original UNO reference field properties on the descriptor. @param name - Native property. @param input - Typed UNO value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    const property = text(name);
    if (this.hint) {
      const field = this.hint.GetAttr().GetField();
      if (property === "SourceName") field.SetSetRefName(stringValue(input));
      else if (property === "SequenceNumber") field.SetSeqNo(scalar(input, "sal_Int16") as number);
      else invalid("Writer reference field is attached.");
      return;
    }
    switch (property) {
      case "SourceName":
        this.data = { ...this.data, name: stringValue(input) };
        break;
      case "SequenceNumber":
        this.data = {
          ...this.data,
          sequenceNumber: (scalar(input, "sal_Int16") as number) & 0xffff,
        };
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
          source !== ReferenceFieldSource.BOOKMARK &&
          source !== ReferenceFieldSource.SEQUENCE_FIELD
        )
          illegal(property);
        this.data = {
          ...this.data,
          source:
            source === ReferenceFieldSource.BOOKMARK
              ? ReferencesSubtype.Bookmark
              : source === ReferenceFieldSource.SEQUENCE_FIELD
                ? ReferencesSubtype.SequenceField
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

  /** Attaches the native field to the current text position. @param range - Actual Writer range. @returns Nothing. */
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

  /** Removes the attached native field point. @returns Nothing. */
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

  /** Binds the subtype selected by the UNO service. @param subtype - Native document information subtype. @returns The initialized SwXDocInfoField instance. */
  public constructor(private readonly subtype: number) {}

  /** Assigns the original importer properties on the detached descriptor. @param name - UNO property name. @param input - Typed UNO property value. @returns Nothing. */
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

  /** Attaches the document's native field to the current text point. @param range - Writer text range. @returns Nothing. */
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

  /** Disposes the native field by removing its point from the document. @returns Nothing. */
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

/** UNO property owner for a text sequence master. */
export class SwXSetExpFieldMaster {
  /** Borrows the document's native field type. @param type - Numbered sequence master. @returns The initialized SwXSetExpFieldMaster instance. */
  public constructor(private readonly type: SwSetExpFieldType) {}

  /** Borrows the actual named field type. @returns Sequence master. */
  public GetType(): SwSetExpFieldType {
    return this.type;
  }

  /** Updates the typed sequence master properties. @param name - UNO property name. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    const property = text(name);
    switch (property) {
      case "SubType":
        this.type.SetType(
          scalar(input, "sal_Int16") === 3 ? SwGetSetExpType.String : SwGetSetExpType.Expr,
        );
        break;
      case "ChapterNumberingLevel":
        this.type.SetOutlineLvl(scalar(input, "sal_Int8") as number);
        break;
      case "NumberingSeparator":
        this.type.SetDelimiter(stringValue(input));
        break;
      default:
        unknown(property);
    }
  }
}

/** UNO SetExpression attachment for a native numbered sequence. */
export class SwXSetExpField {
  private master: SwSetExpFieldType | undefined;
  private hint: SwTextSequenceField | undefined;

  /** Binds the original dependent field to its sequence master. @param master - Native field master. @returns Nothing. */
  public attachTextFieldMaster(master: unknown): void {
    if (this.hint) invalid("Writer sequence field is already attached.");
    if (!(master instanceof SwXSetExpFieldMaster))
      illegal("Writer SetExpression master is invalid.");
    this.master = master.GetType();
  }

  /** Sets sequence properties after native field attachment. @param name - UNO property name. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    const field = this.hint?.GetAttr().GetField();
    if (!field) invalid("Writer sequence field is detached.");
    const property = text(name);
    switch (property) {
      case "Content":
        field.SetFormula(stringValue(input));
        break;
      case "CurrentPresentation":
        field.ChgExpStr(stringValue(input));
        break;
      case "NumberingType":
        field.SetFormat(scalar(input, "sal_Int16") as SvxNumType);
        break;
      case "NumberFormat":
        field.SetFormat(scalar(input, "sal_Int32") as number);
        break;
      case "SubType":
        field
          .GetTyp()
          .SetType(
            scalar(input, "sal_Int16") === 3 ? SwGetSetExpType.String : SwGetSetExpType.Expr,
          );
        break;
      case "Input":
        field.SetInput(scalar(input, "bool") as boolean);
        break;
      case "Hint":
        field.SetPromptText(stringValue(input));
        break;
      case "IsVisible":
        field.SetVisible(scalar(input, "bool") as boolean);
        break;
      case "IsShowFormula":
        field.SetShowFormula(scalar(input, "bool") as boolean);
        break;
      default:
        unknown(property);
    }
  }

  /** Reads the sequence reference identity used by ODF backpatching. @param name - UNO property. @returns Typed UNO value. */
  public getPropertyValue(name: OUStringConstReference): Any {
    const field = this.hint?.GetAttr().GetField();
    if (!field) invalid("Writer sequence field is detached.");
    if (text(name) !== "SequenceValue") unknown(text(name));
    return new Any([(field.GetSeqNumber() << 16) >> 16], "sal_Int16");
  }

  /** Attaches the original owned field point to its document. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer sequence field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node || !this.master || this.master.GetDoc() !== node.GetDoc())
      illegal("Writer sequence field requires a master in the same document.");
    const field = new SwSetExpField(this.master, "");
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer sequence field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached native point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** UNO master properties for a document-owned User field. */
export class SwXUserFieldMaster {
  /** Borrows the native field master. @param type - Named document field type. @returns The initialized SwXUserFieldMaster instance. */
  public constructor(public readonly type: SwUserFieldType) {}

  /** Applies the original master properties. @param name - UNO property name. @param input - Typed property. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    const property = text(name);
    switch (property) {
      case "IsExpression":
        this.type.expression = scalar(input, "bool") as boolean;
        break;
      case "Content":
        this.type.content = stringValue(input);
        break;
      case "Value":
        this.type.SetValue(scalar(input, "double") as number);
        break;
      default:
        unknown(property);
    }
  }
}

/** UNO User field attachment and original occurrence properties. */
export class SwXUserField {
  private master: SwUserFieldType | undefined;
  private hint: SwTextUserField | undefined;

  /** Binds the original dependent field to its named master. @param master - Native master. @returns Nothing. */
  public attachTextFieldMaster(master: unknown): void {
    if (this.hint) invalid("Writer User field is already attached.");
    if (!(master instanceof SwXUserFieldMaster)) illegal("Writer User field master is invalid.");
    this.master = master.type;
  }

  /** Sets occurrence properties after attachment. @param name - UNO property name. @param input - Typed property. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    const field = this.hint?.GetAttr().GetField();
    if (!field) invalid("Writer User field is detached.");
    const property = text(name);
    switch (property) {
      case "NumberFormat":
        field.format = scalar(input, "sal_Int32") as number;
        break;
      case "IsVisible":
        field.visible = scalar(input, "bool") as boolean;
        break;
      case "IsShowFormula":
        field.showFormula = scalar(input, "bool") as boolean;
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches a User field to its actual text object. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer User field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node || !this.master || this.master.GetDoc() !== node.GetDoc())
      illegal("Writer User field requires a master in the same document.");
    const field = new SwUserField(this.master, 0, true, false);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer User field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached native text point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** UNO GetExpression descriptor before attachment to its text point. */
export class SwXGetExpField {
  private formula = "";
  private subtype = SwGetSetExpType.Expr;
  private format = 0;
  private command = true;
  private presentation = "";
  private value = 0;
  private hint: SwTextGetExpField | undefined;

  /** Sets the original expression descriptor properties. @param name - UNO property name. @param input - Typed property. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer GetExpression field is already attached.");
    const property = text(name);
    switch (property) {
      case "Content":
        this.formula = stringValue(input);
        break;
      case "SubType": {
        const value = scalar(input, "sal_Int16");
        this.subtype =
          value === 3
            ? SwGetSetExpType.String
            : value === 2
              ? SwGetSetExpType.Formula
              : SwGetSetExpType.Expr;
        break;
      }
      case "NumberFormat":
        this.format = scalar(input, "sal_Int32") as number;
        break;
      case "IsShowFormula":
        this.command = scalar(input, "bool") as boolean;
        break;
      case "CurrentPresentation":
        this.presentation = stringValue(input);
        break;
      case "Value":
        this.value = scalar(input, "double") as number;
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the expression occurrence using the document's native system owner. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer GetExpression field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer GetExpression field requires a text node.");
    const fields = node.GetDoc().getIDocumentFieldsAccess();
    const subtype =
      this.subtype === SwGetSetExpType.Expr &&
      fields.FindSetExpFieldType(this.formula)?.GetType() === SwGetSetExpType.String
        ? SwGetSetExpType.String
        : this.subtype;
    const field = new SwGetExpField(
      fields.GetGetExpFieldType(),
      this.formula,
      subtype,
      this.format,
      this.command,
      this.presentation,
      this.value,
    );
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer GetExpression field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached native point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** UNO HiddenParagraph descriptor and original point field attachment. */
export class SwXHiddenParaField {
  private condition = "";
  private hidden = false;
  private hint: SwTextHiddenParaField | undefined;

  /** Sets the original paragraph condition or cached visibility. @param name - UNO property. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer hidden paragraph field is attached.");
    const property = text(name);
    if (property === "Condition") this.condition = stringValue(input);
    else if (property === "IsHidden") this.hidden = scalar(input, "bool") as boolean;
    else unknown(property);
  }

  /** Attaches the original field dummy. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer hidden paragraph field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer hidden paragraph field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetHiddenParaFieldType();
    const field = new SwHiddenParaField(type, this.condition, this.hidden);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer hidden paragraph field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** UNO descriptor for the two original inline condition field services. */
export class SwXHiddenTextField {
  private data: SwHiddenTextFieldData;
  private hint: SwTextHiddenTextField | undefined;

  /** Selects the native UNO service. @param conditional - Whether to use ConditionalText. @returns The initialized SwXHiddenTextField instance. */
  public constructor(conditional: boolean) {
    this.data = { conditional, condition: "", trueContent: "", falseContent: "", hidden: false };
  }

  /** Sets the original field properties before attaching. @param name - UNO property name. @param input - Typed UNO value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer condition field is attached.");
    const property = text(name);
    switch (property) {
      case "Condition":
        this.data = { ...this.data, condition: stringValue(input) };
        return;
      case "TrueContent":
      case "Content":
        if ((property === "TrueContent") !== this.data.conditional) break;
        this.data = { ...this.data, trueContent: stringValue(input) };
        return;
      case "FalseContent":
        if (!this.data.conditional) break;
        this.data = { ...this.data, falseContent: stringValue(input) };
        return;
      case "IsConditionTrue":
      case "IsHidden":
        if ((property === "IsConditionTrue") !== this.data.conditional) break;
        this.data = { ...this.data, hidden: scalar(input, "bool") as boolean };
        return;
      case "CurrentPresentation":
        if (!this.data.conditional) break;
        this.data = { ...this.data, currentPresentation: stringValue(input) };
        return;
    }
    unknown(property);
  }

  /** Attaches the original point field. @param range - Writer insertion range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer condition field is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer condition field must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetHiddenTextFieldType();
    const field = new SwHiddenTextField(type, this.data);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer condition field could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

/** UNO JumpEdit descriptor and its text attribute attachment. */
export class SwXJumpEditField {
  private format = SwJumpEditFormat.Text;
  private placeholder = "";
  private help = "";
  private hint: SwTextJumpEditField | undefined;

  /** Sets the typed native descriptor properties. @param name - UNO property. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer placeholder is attached.");
    const property = text(name);
    switch (property) {
      case "PlaceholderType":
        this.format = scalar(input, "sal_Int16") as SwJumpEditFormat;
        break;
      case "Placeholder":
        this.placeholder = stringValue(input);
        break;
      case "Hint":
        this.help = stringValue(input);
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the original field dummy. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer placeholder is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer placeholder must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetJumpEditFieldType();
    const field = new SwJumpEditField(type, this.format, this.placeholder, this.help);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer placeholder could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

const DropDownItems = Sequence.specialize<rtl_uStringSlot>("OUString", 8);

/** UNO DropDown descriptor and its text attribute attachment. */
export class SwXDropDownField {
  private data: SwDropDownFieldData = {
    items: [],
    selectedItem: "",
    name: "",
    help: "",
    toolTip: "",
  };
  private hint: SwTextDropDownField | undefined;

  /** Sets the typed native descriptor properties. @param name - UNO property. @param input - Typed value. @returns Nothing. */
  public setPropertyValue(name: OUStringConstReference, input: Any): void {
    if (this.hint) invalid("Writer drop-down is attached.");
    const property = text(name);
    switch (property) {
      case "Items": {
        const sequence = new DropDownItems();
        const items: string[] = [];
        try {
          if (!input.extract(sequence.getAddress(), ["Sequence", "OUString"]))
            illegal("Expected a sequence of Writer drop-down items.");
          for (let index = 0; index < sequence.getLength(); index++)
            items.push(text(OUString.unacquired(sequence.operatorIndex(index))));
        } finally {
          sequence.dispose();
        }
        this.data = { ...this.data, items };
        break;
      }
      case "SelectedItem":
        this.data = { ...this.data, selectedItem: stringValue(input) };
        break;
      case "Name":
        this.data = { ...this.data, name: stringValue(input) };
        break;
      case "Help":
        this.data = { ...this.data, help: stringValue(input) };
        break;
      case "Tooltip":
        this.data = { ...this.data, toolTip: stringValue(input) };
        break;
      default:
        unknown(property);
    }
  }

  /** Attaches the original field dummy. @param range - Writer range. @returns Nothing. */
  public attach(range: SwXTextRange): void {
    if (this.hint) invalid("Writer drop-down is already attached.");
    const position = range.GetPaM().Start();
    const node = position.GetNode().GetTextNode();
    if (!node) illegal("Writer drop-down must be in text.");
    const type = node.GetDoc().getIDocumentFieldsAccess().GetDropDownFieldType();
    const field = new SwDropDownField(type, this.data);
    const hint = new SwTextField(
      new SwFormatField(field, RES_TXTATR_FIELD),
      position.GetContentIndex(),
    );
    if (!node.InsertHint(hint)) invalid("Writer drop-down could not be inserted.");
    this.hint = hint;
  }

  /** Removes the attached point. @returns Nothing. */
  public dispose(): void {
    const hint = this.hint;
    this.hint = undefined;
    if (hint) hint.GetTextNode()?.EraseText(hint.GetStart(), 1);
  }
}

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
