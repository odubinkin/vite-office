/** @fileoverview Imports the ODF annotation field and range end through Writer's text content service. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime,
} from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "../../../sax/source/tools/converter";
import type { XMLNamedTextContent } from "../../inc/txtimp";
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
  private readonly paragraphs: string[] = [];

  /** Routes one annotation declaration through the current text importer. @param helper - Original text import owner. @returns Context. */
  constructor(private readonly helper: XMLTextImportHelper) {
    super();
  }

  /** Reads the original annotation attributes. @param element - Opening or closing annotation token. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    attributes.assertOnly(
      element === XMLToken.OFFICE_ANNOTATION_END
        ? [XMLToken.OFFICE_NAME]
        : [XMLToken.OFFICE_NAME, XMLToken.LOEXT_PARENT_NAME, XMLToken.LOEXT_RESOLVED],
      "annotation",
    );
    this.name = attributes.get(XMLToken.OFFICE_NAME) ?? "";
    this.parentName = attributes.get(XMLToken.LOEXT_PARENT_NAME) ?? "";
    const resolved = attributes.get(XMLToken.LOEXT_RESOLVED);
    if (resolved !== null) Converter.convertBool(this.resolved, resolved);
  }

  /** Imports metadata and one paragraph of comment content without writing into the body cursor. @param element - Child token. @returns Child context. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
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
      case XMLToken.TEXT_P:
      case XMLToken.TEXT_H: {
        const index = this.paragraphs.push("") - 1;
        return new AnnotationStringContext(
          /** Appends content without losing empty paragraphs. @param chunk - Decoded text. @returns Nothing. */ (
            chunk,
          ) => {
            this.paragraphs[index] += chunk;
          },
        );
      }
      default:
        return null;
    }
  }

  /** Prepares the original UNO annotation properties before attaching. @param field - Detached field descriptor. @returns Nothing. */
  private PrepareField(field: XMLNamedTextContent): void {
    this.helper.SetProperty(field, "Author", this.author);
    this.helper.SetProperty(field, "Initials", this.initials);
    this.helper.SetProperty(field, "Resolved", this.resolved[0]);
    if (this.parentName) this.helper.SetProperty(field, "ParentName", this.parentName);
    this.helper.SetProperty(field, "Content", this.paragraphs.join("\n"));
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
    if (element === XMLToken.OFFICE_ANNOTATION_END) this.helper.EndAnnotation(this.name);
    else
      this.helper.InsertAnnotation(
        this.name,
        /** Applies field properties before moving the body cursor. @param field - Descriptor. @returns Nothing. */ (
          field,
        ) => this.PrepareField(field),
      );
  }
}

/** Captures the supported annotation text content, including ODF whitespace controls. */
class AnnotationStringContext extends SvXMLImportContext {
  /** Uses a buffer owned by the field context. @param append - Text receiver. @returns Context. */
  constructor(private readonly append: (value: string) => void) {
    super();
  }

  /** Adds decoded SAX characters. @param value - Text chunk. @returns Nothing. */
  override characters(value: string): void {
    this.append(value);
  }

  /** Uses the same buffer for nested text spans and explicit whitespace. @param element - Inline token. @param attributes - Inline attributes. @returns Child or null. */
  override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_SPAN || element === XMLToken.TEXT_A) return this;
    if (element === XMLToken.TEXT_TAB) this.append("\t");
    else if (element === XMLToken.TEXT_LINE_BREAK) this.append("\n");
    else if (element === XMLToken.TEXT_S) {
      const count = Number(attributes.get(XMLToken.TEXT_C) ?? "1");
      if (!Number.isInteger(count) || count < 1 || count > 100_000)
        throw new Error("ODF annotation space count is invalid.");
      this.append(" ".repeat(count));
    } else return null;
    return new SvXMLImportContext();
  }
}
