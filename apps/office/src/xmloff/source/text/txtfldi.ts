/** @fileoverview Imports the ODF annotation field and range end through Writer's text content service. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLAnnotationTextContent, XMLTextContent, XMLTextCursor } from "../../inc/txtimp";
import { type FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLCharacterStyleLayer, XMLTextImportHelper } from "./txtimp";
import type { OdfCharacterProperties, OdfHyperlink } from "./txtparae";
import { xmlTextString } from "./txtprmap";
import { ReferenceFieldPart } from "../../../offapi/com/sun/star/text/ReferenceFieldPart";
import { referenceFieldFormats, type XMLDocInfoField, type XMLReferenceField } from "./txtflde";
import { toBoolean } from "../../../sal/rtl/strtmpl";
import { approxFloor } from "../../../sal/inc/rtl/math";
import { convertDurationToDays } from "../../../sax/source/tools/converter.duration";

/** Original time field context, also used as the base for date fields. */
export class XMLTimeFieldImportContext extends SvXMLImportContext {
  protected isDate = false;
  protected readonly value = new DateTime();
  protected valueValid = false;
  private readonly fixed: [boolean] = [false];
  private adjust = 0;
  private format: { key: number; systemLanguage: boolean } | undefined;

  /** Binds the date/time service to the active styled text range. @param helper - Import owner. @param properties - Direct formatting. @param hyperlink - Optional link. @param characterStyles - Applied styles. */
  public constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly properties: OdfCharacterProperties,
    private readonly hyperlink: OdfHyperlink | undefined,
    private readonly characterStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
  }

  /** Collects the source field properties in authored order. @param _element - Field token. @param attributes - Source field attributes. */
  public override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    for (const [token, value] of attributes) this.ProcessAttribute(token, value);
  }

  /** Processes time properties or those shared with date fields. @param token - Attribute token. @param value - Lexical value. */
  protected ProcessAttribute(token: XMLToken, value: string): void {
    switch (token) {
      case XMLToken.TEXT_TIME_VALUE:
      case XMLToken.OFFICE_TIME_VALUE:
        if (Converter.parseTimeOrDateTime(this.value, value)) this.valueValid = true;
        break;
      case XMLToken.TEXT_FIXED:
        Converter.convertBool(this.fixed, value);
        break;
      case XMLToken.STYLE_DATA_STYLE_NAME: {
        const format = this.helper.GetDataStyleKey(value);
        if (format) this.format = format;
        break;
      }
      case XMLToken.TEXT_TIME_ADJUST: {
        const days: [number] = [0];
        if (convertDurationToDays(days, value)) this.adjust = approxFloor(days[0] * 60 * 24) | 0;
        break;
      }
    }
  }

  /** Initializes the original fixed state, calendar value, adjustment and data style. @param field - Detached native descriptor. */
  private PrepareField(field: XMLTextContent): void {
    this.helper.SetProperty(field, "IsFixed", this.fixed[0]);
    this.helper.SetProperty(field, "IsDate", this.isDate);
    this.helper.SetProperty(field, "Adjust", this.adjust, "sal_Int32");
    if (this.fixed[0] && this.valueValid) {
      const name = xmlTextString("DateTimeValue");
      const value = new Any(this.value, cppu_detail_getUnoType_DateTime);
      try {
        field.setPropertyValue(name, value);
      } finally {
        value.dispose();
        name.dispose();
      }
    }
    if (this.format) {
      this.helper.SetProperty(field, "NumberFormat", this.format.key, "sal_Int32");
      this.helper.SetProperty(field, "IsFixedLanguage", !this.format.systemLanguage);
    }
  }

  /** Attaches the original system field, leaving source presentation to its value owner. */
  public override endFastElement(): void {
    this.helper.InsertTextField(
      "DateTime",
      this.PrepareField.bind(this),
      this.properties,
      this.hyperlink,
      this.characterStyles,
    );
  }
}

/** Date context accepts the date-specific value and adjustment attributes. */
export class XMLDateFieldImportContext extends XMLTimeFieldImportContext {
  protected override isDate = true;

  /** Uses the original strict date-time parser and ignores time-only attributes. @param token - Attribute token. @param value - Lexical value. */
  protected override ProcessAttribute(token: XMLToken, value: string): void {
    switch (token) {
      case XMLToken.TEXT_DATE_VALUE:
      case XMLToken.OFFICE_DATE_VALUE:
        if (Converter.parseDateTime(this.value, value)) this.valueValid = true;
        break;
      case XMLToken.TEXT_DATE_ADJUST:
        super.ProcessAttribute(XMLToken.TEXT_TIME_ADJUST, value);
        break;
      case XMLToken.TEXT_TIME_VALUE:
      case XMLToken.OFFICE_TIME_VALUE:
      case XMLToken.TEXT_TIME_ADJUST:
        break;
      default:
        super.ProcessAttribute(token, value);
    }
  }
}

/** Original simple document information field importer. */
export class XMLSimpleDocInfoImportContext extends SvXMLImportContext {
  protected readonly fixed: [boolean] = [false];
  protected content = "";
  private format: { key: number; systemLanguage: boolean } | undefined;

  /** Binds the native field service chosen by the element. @param helper - Text importer. @param field - Original service mapping. @param properties - Direct formatting. @param hyperlink - Optional link. @param characterStyles - Applied styles. */
  public constructor(
    protected readonly helper: XMLTextImportHelper,
    protected readonly field: XMLDocInfoField,
    private readonly properties: OdfCharacterProperties,
    private readonly hyperlink: OdfHyperlink | undefined,
    private readonly characterStyles: readonly XMLCharacterStyleLayer[],
  ) {
    super();
  }

  /** Reads text:fixed with the original converter. @param _element - Opening token. @param attributes - Field attributes. */
  public override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    const fixed = attributes.get(XMLToken.TEXT_FIXED);
    if (fixed !== null) Converter.convertBool(this.fixed, fixed);
  }

  /** Appends original field presentation text. @param value - Character data. */
  public override characters(value: string): void {
    this.content += value;
  }

  /** Prepares the fixed presentation before attaching the native field. */
  public override endFastElement(): void {
    this.helper.InsertTextField(
      this.field[2],
      this.PrepareField.bind(this),
      this.properties,
      this.hyperlink,
      this.characterStyles,
    );
  }

  /** Sets the native simple DocInfo properties. @param field - Detached UNO text field. */
  protected PrepareField(field: XMLTextContent): void {
    this.helper.SetProperty(field, "IsFixed", this.fixed[0]);
    if (!this.fixed[0]) return;
    const property = this.field[3];
    if (property) this.helper.SetProperty(field, property, this.content);
    this.helper.SetProperty(field, "CurrentPresentation", this.content);
  }

  /** Inserts the original presentation when a field has no valid descriptor. */
  protected InsertFallback(): void {
    this.helper.InsertString(this.content, this.properties, this.hyperlink, this.characterStyles);
  }

  /** Resolves the authored number style for a numeric DocInfo service. @param attributes - Field attributes. */
  protected ReadNumberFormat(attributes: FastAttributeList): void {
    const style = attributes.get(XMLToken.STYLE_DATA_STYLE_NAME);
    if (style !== null) this.format = this.helper.GetDataStyleKey(style);
  }

  /** Applies an admitted number style to a numeric DocInfo service. @param field - Detached field. */
  protected PrepareNumberFormat(field: XMLTextContent): void {
    if (!this.format) return;
    this.helper.SetProperty(field, "NumberFormat", this.format.key, "sal_Int32");
    this.helper.SetProperty(field, "IsFixedLanguage", !this.format.systemLanguage);
  }
}

/** Native revision field importer also supplies a parsed revision to the descriptor. */
export class XMLRevisionDocInfoImportContext extends XMLSimpleDocInfoImportContext {
  /** Prepares the fixed revision's additional numeric value. @param field - Detached UNO text field. */
  protected override PrepareField(field: XMLTextContent): void {
    super.PrepareField(field);
    if (!this.fixed[0]) return;
    const revision: [number] = [0];
    if (Converter.convertNumber(revision, this.content))
      this.helper.SetProperty(field, "Revision", revision[0], "sal_Int32");
  }
}

/** Original DocInfo calendar and duration importer. The native descriptor accepts a presentation and format. */
export class XMLDateTimeDocInfoImportContext extends XMLSimpleDocInfoImportContext {
  /** Collects native fixed and data style attributes. @param element - Field token. @param attributes - Source field attributes. */
  public override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    super.startFastElement(element, attributes);
    this.ReadNumberFormat(attributes);
  }

  /** Prepares the format and date discriminator for the detached field. @param field - Native UNO descriptor. */
  protected override PrepareField(field: XMLTextContent): void {
    super.PrepareField(field);
    const date = this.field[4];
    if (date !== undefined) this.helper.SetProperty(field, "IsDate", date);
    this.PrepareNumberFormat(field);
  }
}

/** Original named document information import over the custom field service. */
export class XMLUserDocInfoImportContext extends XMLSimpleDocInfoImportContext {
  private name: string | null = null;

  /** Reads the required name alongside the original format and fixed flag. @param element - Field token. @param attributes - Field attributes. */
  public override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    super.startFastElement(element, attributes);
    this.name = attributes.get(XMLToken.TEXT_NAME);
    this.ReadNumberFormat(attributes);
  }

  /** Leaves the original text in place when there is no authored property name. */
  public override endFastElement(): void {
    if (this.name === null) this.InsertFallback();
    else super.endFastElement();
  }

  /** Binds the native property name before applying the field's authored presentation. @param field - Detached UNO field. */
  protected override PrepareField(field: XMLTextContent): void {
    if (this.name) this.helper.SetProperty(field, "Name", this.name);
    this.PrepareNumberFormat(field);
    super.PrepareField(field);
  }
}

/** Original named GetReference field import and remembered presentation. */
export class XMLReferenceFieldImportContext extends SvXMLImportContext {
  private name: string | null = null;
  private part: number = ReferenceFieldPart.PAGE_DESC;
  private language = "";
  private flags = 0;
  private presentation = "";

  /** Binds the original field context to the active text stream. @param helper - Text importer. @param source - Named field source. */
  constructor(
    private readonly helper: XMLTextImportHelper,
    private readonly source: XMLReferenceField["source"],
  ) {
    super();
  }

  /** Collects the named reference properties. @param _element - Opening token. @param attributes - Authored ODF attributes. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    for (const [token, value] of attributes) {
      switch (token) {
        case XMLToken.TEXT_REF_NAME:
          this.name = value;
          break;
        case XMLToken.TEXT_REFERENCE_FORMAT: {
          const part = referenceFieldFormats.find(
            /** Finds the matching ODF token. @param format - Native part and ODF token. @returns Match. */
            ([, format]) => format === value,
          )?.[0];
          if (
            part !== undefined &&
            part !== ReferenceFieldPart.CATEGORY_AND_NUMBER &&
            part !== ReferenceFieldPart.ONLY_CAPTION &&
            part !== ReferenceFieldPart.ONLY_SEQUENCE_NUMBER
          )
            this.part = part;
          break;
        }
        case XMLToken.TEXT_REFERENCE_LANGUAGE:
        case XMLToken.LOEXT_REFERENCE_LANGUAGE:
          this.language = value;
          break;
        case XMLToken.TEXT_REFERENCE_HIDE_NON_NUMERICAL:
        case XMLToken.LOEXT_REFERENCE_HIDE_NON_NUMERICAL:
        case XMLToken.TEXT_REFERENCE_FROM_BOTTOM:
        case XMLToken.LOEXT_REFERENCE_FROM_BOTTOM: {
          const lexical = xmlTextString(value);
          try {
            if (toBoolean(lexical.getStr()))
              this.flags |=
                token === XMLToken.TEXT_REFERENCE_FROM_BOTTOM ||
                token === XMLToken.LOEXT_REFERENCE_FROM_BOTTOM
                  ? 0xc100
                  : 0xc200;
          } finally {
            lexical.dispose();
          }
          break;
        }
      }
    }
  }

  /** Appends a presentation text callback. @param value - Original characters. */
  override characters(value: string): void {
    this.presentation += value;
  }

  /** Attaches the field or inserts its fallback text for a missing source name. */
  override endFastElement(): void {
    if (this.name === null) this.helper.InsertString(this.presentation);
    else
      this.helper.InsertReferenceField({
        name: this.name,
        source: this.source,
        part: this.part,
        language: this.language,
        flags: this.flags,
        presentation: this.presentation,
      });
  }
}

/** Original annotation import with metadata distinct from the editable comment paragraphs. */
export class XMLAnnotationImportContext extends SvXMLImportContext {
  private name = "";
  private parentName = "";
  private readonly resolved: [boolean] = [false];
  private author = "";
  private initials = "";
  private date = "";
  private field: XMLAnnotationTextContent | undefined;
  private cursor: XMLTextCursor | undefined;

  /** Routes one annotation declaration through the current text importer. @param helper - Original text import owner. @returns Context. */
  constructor(private readonly helper: XMLTextImportHelper) {
    super();
    helper.PushAnnotationListContext();
  }

  /** Reads the original annotation attributes. @param element - Opening or closing annotation token. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(_element: XMLToken, attributes: FastAttributeList): void {
    this.name = attributes.get(XMLToken.OFFICE_NAME) ?? "";
    this.parentName = attributes.get(XMLToken.LOEXT_PARENT_NAME) ?? "";
    const resolved = attributes.get(XMLToken.LOEXT_RESOLVED);
    if (resolved !== null) Converter.convertBool(this.resolved, resolved);
  }

  /** Imports metadata and routes note paragraphs through the native TextRange cursor. @param element - Child token. @param attributes - Child attributes. @returns Child context. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    switch (element) {
      case XMLToken.DC_CREATOR:
        return new AnnotationStringContext(
          /** Adds author text. @param chunk - Decoded text. @returns Nothing. */ (chunk) => {
            this.author += chunk;
          },
        );
      case XMLToken.DC_DATE:
        return new AnnotationStringContext(
          /** Adds date text. @param chunk - Decoded text. @returns Nothing. */ (chunk) => {
            this.date += chunk;
          },
        );
      case XMLToken.TEXT_SENDER_INITIALS:
      case XMLToken.LOEXT_SENDER_INITIALS:
      case XMLToken.META_CREATOR_INITIALS:
        return new AnnotationStringContext(
          /** Adds initials. @param chunk - Decoded text. @returns Nothing. */ (chunk) => {
            this.initials += chunk;
          },
        );
      default: {
        this.field ??= this.helper.CreateAnnotation(this.name);
        if (!this.cursor) {
          this.cursor = this.field.getTextRange().createTextCursor();
          this.helper.PushAnnotationCursor(this.cursor);
        }
        return this.helper.CreateTextChildContext(element, attributes, "Annotation");
      }
    }
  }

  /** Prepares the original UNO annotation properties before attaching. @param field - Detached field descriptor. @returns Nothing. */
  private PrepareField(field: XMLAnnotationTextContent): void {
    this.helper.SetProperty(field, "Author", this.author);
    this.helper.SetProperty(field, "Initials", this.initials);
    this.helper.SetProperty(field, "Resolved", this.resolved[0]);
    if (this.parentName) this.helper.SetProperty(field, "ParentName", this.parentName);
    const date = new DateTime();
    if (!Converter.parseDateTime(date, this.date)) return;
    const name = xmlTextString("DateTimeValue");
    const value = new Any(date, cppu_detail_getUnoType_DateTime);
    try {
      field.setPropertyValue(name, value);
    } finally {
      value.dispose();
      name.dispose();
    }
  }

  /** Completes the field or reattaches a named annotation to its expanded range. @param element - Closing token. @returns Nothing. */
  override endFastElement(element: XMLToken): void {
    try {
      if (this.cursor) {
        const empty = xmlTextString("");
        try {
          this.cursor.gotoEnd(false);
          this.cursor.goLeft(1, true);
          this.cursor.setString(empty);
        } finally {
          empty.dispose();
          this.helper.PopAnnotationCursor();
        }
      }
    } finally {
      this.helper.PopAnnotationListContext();
    }
    if (element === XMLToken.OFFICE_ANNOTATION_END) {
      this.helper.EndAnnotation(this.name);
      return;
    }
    const field = this.field ?? this.helper.CreateAnnotation(this.name);
    this.PrepareField(field);
    this.helper.InsertAnnotation(this.name, field);
  }
}

/** Buffers scalar metadata independently of the annotation's editable paragraphs. */
class AnnotationStringContext extends SvXMLImportContext {
  /** Uses an annotation metadata receiver. @param append - Text receiver. @returns Context. */
  constructor(private readonly append: (value: string) => void) {
    super();
  }

  /** Adds decoded SAX characters. @param value - Text chunk. @returns Nothing. */
  override characters(value: string): void {
    this.append(value);
  }
}
