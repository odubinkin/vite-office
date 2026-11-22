/** @fileoverview Consumed XMLAnnotationImportContext metadata and point annotation text. */
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import { Converter } from "../../../sax/source/tools/converter";
import { FastAttributeList, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken as T } from "../core/xmltoken";
import type { OdfCharacterProperties } from "./txtparae.types";

/** Native character properties supplied to an annotation's edit paragraph. */
export interface XMLAnnotationSpan {
  readonly text: string;
  readonly properties: Partial<OdfCharacterProperties>;
}

/** Point annotation data produced by the shared text field context. */
export interface XMLAnnotation {
  readonly name: string;
  readonly parentName: string;
  readonly resolved: boolean;
  readonly author: string;
  readonly initials: string;
  readonly dateTime?: DateTime;
  readonly paragraphs: readonly (readonly XMLAnnotationSpan[])[];
}

/** Resolves a source character style through the active ODF style catalogue. */
type ResolveTextStyle = (name: string) => Partial<OdfCharacterProperties>;
/** Closes an annotation paragraph with its original text portions. */
type CommitParagraph = (spans: readonly XMLAnnotationSpan[]) => void;

/** Reads original annotation child metadata and collects its separate text section. */
export class XMLAnnotationImportContext extends SvXMLImportContext {
  private author = "";
  private initials = "";
  private date = "";
  private readonly paragraphs: (readonly XMLAnnotationSpan[])[] = [];

  /** Creates the native annotation element context. @param attributes - Element attributes. @param resolveStyle - Current document text styles. @param commit - Field sink. @returns Context. */
  public constructor(
    private readonly attributes: FastAttributeList,
    private readonly resolveStyle: ResolveTextStyle,
    private readonly commit: (annotation: XMLAnnotation) => void,
  ) {
    super();
    attributes.assertOnly([T.OFFICE_NAME, T.LOEXT_PARENT_NAME, T.LOEXT_RESOLVED], "annotation");
  }

  /** Resolves metadata and annotation text without modifying the outer cursor. @param element - Child token. @param attributes - Child attributes. @returns Child context. */
  public override createFastChildContext(
    element: T,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (
      element === T.DC_CREATOR ||
      element === T.DC_DATE ||
      element === T.META_CREATOR_INITIALS ||
      element === T.LOEXT_SENDER_INITIALS ||
      element === T.TEXT_SENDER_INITIALS
    )
      return new XMLAnnotationCharacters(
        /** Appends to the original metadata buffer. @param text - Original characters. @returns Nothing. */
        (text) => {
          if (element === T.DC_CREATOR) this.author += text;
          else if (element === T.DC_DATE) this.date += text;
          else this.initials += text;
        },
      );
    return annotationBlockContext(
      element,
      attributes,
      this.resolveStyle,
      /** Retains the separate annotation paragraph. @param spans - Original text runs. @returns Nothing. */
      (spans) => this.paragraphs.push(spans),
    );
  }

  /** Publishes a complete annotation at its original outer text position. @returns Nothing. */
  public override endFastElement(): void {
    const resolved: [boolean] = [false];
    const raw = this.attributes.get(T.LOEXT_RESOLVED);
    if (raw !== null) Converter.convertBool(resolved, raw);
    const dateTime = new DateTime();
    this.commit({
      name: this.attributes.get(T.OFFICE_NAME) ?? "",
      parentName: this.attributes.get(T.LOEXT_PARENT_NAME) ?? "",
      resolved: resolved[0],
      author: this.author,
      initials: this.initials,
      ...(Converter.parseDateTime(dateTime, this.date) ? { dateTime } : {}),
      paragraphs: this.paragraphs,
    });
  }
}

/** Selects the annotation's nested paragraph text contexts. @param element - Child token. @param attributes - Style attributes. @param resolveStyle - Text style resolver. @param commit - Paragraph sink. @returns Context or unknown. */
function annotationBlockContext(
  element: T,
  attributes: FastAttributeList,
  resolveStyle: ResolveTextStyle,
  commit: CommitParagraph,
): SvXMLImportContext | null {
  if (element === T.TEXT_P || element === T.TEXT_H) {
    const spans: XMLAnnotationSpan[] = [];
    const style = attributes.get(T.TEXT_STYLE_NAME);
    return new XMLAnnotationTextContext(
      resolveStyle,
      style ? resolveStyle(style) : {},
      spans,
      /** Sends the complete paragraph after its nested spans. @returns Nothing. */
      () => commit(spans),
    );
  }
  if (element === T.TEXT_LIST || element === T.TEXT_LIST_ITEM || element === T.TEXT_LIST_HEADER)
    return new XMLAnnotationBlocks(resolveStyle, commit);
  return null;
}

/** Reads paragraphs nested in supported annotation text blocks. */
class XMLAnnotationBlocks extends SvXMLImportContext {
  /** Captures the surrounding text section. @param resolveStyle - Text style resolver. @param commit - Paragraph sink. @returns Context. */
  constructor(
    private readonly resolveStyle: ResolveTextStyle,
    private readonly commit: CommitParagraph,
  ) {
    super();
  }

  /** Keeps the original paragraphs in source order. @param element - Child token. @param attributes - Child attributes. @returns Child context. */
  public override createFastChildContext(
    element: T,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    return annotationBlockContext(element, attributes, this.resolveStyle, this.commit);
  }
}

/** Appends original metadata characters. */
class XMLAnnotationCharacters extends SvXMLImportContext {
  /** Sets the metadata buffer. @param append - Buffer sink. @returns Context. */
  constructor(private readonly append: (text: string) => void) {
    super();
  }

  /** Appends original decoded characters. @param text - XML characters. @returns Nothing. */
  public override characters(text: string): void {
    this.append(text);
  }
}

/** Imports the represented paragraph and span formatting of an annotation. */
class XMLAnnotationTextContext extends SvXMLImportContext {
  /** Associates a text portion with the original style state. @param resolveStyle - Style resolver. @param properties - Active text values. @param spans - Shared paragraph sink. @param finish - Optional paragraph completion. @returns Context. */
  constructor(
    private readonly resolveStyle: ResolveTextStyle,
    private readonly properties: Partial<OdfCharacterProperties>,
    private readonly spans: XMLAnnotationSpan[],
    private readonly finish?: () => void,
  ) {
    super();
  }

  /** Collects characters under the active text values. @param text - Original paragraph characters. @returns Nothing. */
  public override characters(text: string): void {
    if (text) this.spans.push({ text, properties: this.properties });
  }

  /** Handles native span and text control tokens within the annotation. @param element - Child token. @param attributes - Child attributes. @returns Child context. */
  public override createFastChildContext(
    element: T,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === T.TEXT_SPAN || element === T.TEXT_A) {
      const name = attributes.get(T.TEXT_STYLE_NAME);
      return new XMLAnnotationTextContext(
        this.resolveStyle,
        name ? { ...this.properties, ...this.resolveStyle(name) } : this.properties,
        this.spans,
      );
    }
    if (element === T.TEXT_S || element === T.TEXT_TAB || element === T.TEXT_LINE_BREAK) {
      const count = element === T.TEXT_S ? Number(attributes.get(T.TEXT_C) ?? "1") : 1;
      if (!Number.isInteger(count) || count < 1 || count > 100_000)
        throw new Error("ODF significant-space count is invalid.");
      this.characters(
        element === T.TEXT_TAB ? "\t" : element === T.TEXT_LINE_BREAK ? "\n" : " ".repeat(count),
      );
      return new SvXMLImportContext();
    }
    return null;
  }

  /** Finishes the root annotation paragraph. @returns Nothing. */
  public override endFastElement(): void {
    this.finish?.();
  }
}
