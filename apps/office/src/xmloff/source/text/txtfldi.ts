/** @fileoverview Imports the ODF annotation field and range end through Writer's text content service. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLAnnotationTextContent, XMLTextCursor } from "../../inc/txtimp";
import { type FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";
import { xmlTextString } from "./txtprmap";

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
