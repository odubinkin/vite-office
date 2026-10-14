/** @fileoverview Original xmlreader pull API over browser-loaded bytes; ordinary JS references replace file mapping lifetime. */
import { OUString } from "../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { Span } from "../inc/span";
import { Pad } from "../inc/pad";
import { State, Text, Result, literal, span, assign } from "./xmlreader.state";
import type { ReaderState, NamespaceData, ElementData, AttributeData } from "./xmlreader.state";
import {
  getNamespaceId,
  handleStartTag,
  handleEndTag,
  handleElementEnd,
  handleSkippedText,
} from "./xmlreader.tags";
import { handleAttributeValue } from "./xmlreader.references";
import { handleRawText, handleNormalizedText } from "./xmlreader.text";
export { Text, Result };
/** Shared reader: native synchronous file mapping is bound to already-loaded, privately copied bytes. */
export class XmlReader {
  public static readonly NAMESPACE_NONE = -2;
  public static readonly NAMESPACE_UNKNOWN = -1;
  public static readonly NAMESPACE_XML = 0;
  public static readonly Text = Text;
  public static readonly Result = Result;
  protected readonly fileUrl_: OUString;
  protected readonly bytes_: Uint8Array;
  protected readonly view_: DataView;
  protected readonly namespaceIris_: Span[] = [
    new Span(literal("http://www.w3.org/XML/1998/namespace"), 36),
  ];
  protected readonly namespaces_: NamespaceData[] = [
    { prefix: new Span(literal("xml"), 3), nsId: 0 },
  ];
  protected readonly elements_: ElementData[] = [];
  protected pos_ = 0;
  protected readonly end_: number;
  protected state_ = State.Content;
  protected readonly attributes_: AttributeData[] = [];
  declare protected currentAttribute_: number;
  protected firstAttribute_ = true;
  protected readonly pad_ = new Pad();
  /** Browser I/O binding; URL is a value copy, bytes are a private input copy. @param fileUrl - Source URL. @param bytes - Loaded document bytes. @returns Reader. */
  constructor(fileUrl: OUStringConstReference, bytes: Uint8Array) {
    this.fileUrl_ = new OUString(fileUrl);
    this.bytes_ = new Uint8Array(bytes);
    this.view_ = new DataView(this.bytes_.buffer);
    this.end_ = this.bytes_.length;
  }
  /** Erased helper view refers to this actual object. @returns Reader state. */
  private state(): ReaderState {
    return this as unknown as ReaderState;
  }
  /** Original registration, including the legacy implicit xsi prefix. @param iri - Stable IRI bytes. @returns New namespace id. */
  public registerNamespaceIri(iri: Span): number {
    const id = this.namespaceIris_.length | 0;
    this.namespaceIris_.push(new Span(iri));
    if (iri.equals(literal("http://www.w3.org/2001/XMLSchema-instance"), 41))
      this.namespaces_.push({ prefix: new Span(literal("xsi"), 3), nsId: id });
    return id;
  }
  /** Original event dispatch and unused-output timing. @param reportText - Text mode. @param data - Name/text output. @param nsId - Namespace output. @returns Event. */
  public nextItem(reportText: Text, data: Span, nsId: [number]): Result {
    const r = this.state();
    switch (this.state_) {
      case State.Content:
        switch (reportText) {
          case Text.NONE:
            return handleSkippedText(r, data, nsId);
          case Text.Raw:
            return handleRawText(r, data);
          default:
            return handleNormalizedText(r, data);
        }
      case State.StartTag:
        return handleStartTag(r, nsId, data);
      case State.EndTag:
        return handleEndTag(r);
      case State.EmptyElementTag:
        handleElementEnd(r);
        return Result.End;
      default:
        return Result.Done;
    }
  }
  /** Original attribute iterator; querying again after false is outside its native valid domain. @param nsId - Namespace output. @param localName - Name output. @returns Attribute present. */
  public nextAttribute(nsId: [number], localName: Span): boolean {
    if (this.firstAttribute_) {
      this.currentAttribute_ = 0;
      this.firstAttribute_ = false;
    } else ++this.currentAttribute_;
    if (this.currentAttribute_ === this.attributes_.length) return false;
    const attr = this.attributes_[this.currentAttribute_] as AttributeData,
      r = this.state();
    if (attr.nameColon === null) {
      nsId[0] = -2;
      assign(localName, span(r, attr.nameBegin, attr.nameEnd));
    } else {
      nsId[0] = getNamespaceId(r, span(r, attr.nameBegin, attr.nameColon));
      assign(localName, span(r, attr.nameColon + 1, attr.nameEnd));
    }
    return true;
  }
  /** Original current-attribute normalization. @param fullyNormalize - Collapse literal whitespace. @returns Borrowed value. */
  public getAttributeValue(fullyNormalize: boolean): Span {
    const attr = this.attributes_[this.currentAttribute_] as AttributeData;
    return handleAttributeValue(this.state(), attr.valueBegin, attr.valueEnd, fullyNormalize);
  }
  /** Original reverse prefix lookup. @param prefix - Prefix bytes. @returns Namespace id. */
  public getNamespaceId(prefix: Span): number {
    return getNamespaceId(this.state(), prefix);
  }
  /** Original stable borrowed URL value. @returns URL. */
  public getUrl(): OUStringConstReference {
    return this.fileUrl_;
  }
}
