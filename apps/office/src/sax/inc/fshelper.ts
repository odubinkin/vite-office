/** @fileoverview Native FastSerializerHelper token/attribute and mark forwarding over the actual serializer; component-service acquisition is an explicit injected lexical handler binding. */
import { FastAttributeList } from "../source/tools/fastattribs";
import {
  FastSaxSerializer,
  TokenValue,
  type FastTokenHandler,
} from "../source/tools/fastserializer";
import type { OutputStream } from "../source/tools/CachedOutputStream";
/** Original mark merge discriminants. */
export enum MergeMarks {
  APPEND = 0,
  PREPEND = 1,
  POSTPONE = 2,
}
/** Original namespace/local token composition uses lexical namespace tokens, not parser namespace registrations. @param namespace - Namespace lexical token. @param element - Local token. @returns Combined token. */
export function FSNS(namespace: number, element: number): number {
  return (namespace << 16) | element;
}
/** Native variadic attribute/value pairs; null models a missing optional/char pointer. */
type Attributes = readonly (number | string | Uint8Array | null)[];
/** Native attribute-list overload or variadic pairs. */
type ElementAttributes = Attributes | readonly [FastAttributeList];
/** Original convenience owner, with consumed text/byte overloads; native floating conversion remain separate responsibilities. */
export class FastSerializerHelper {
  /** Original export-side factory supplies a null token handler. @returns Empty native attribute list. */
  static createAttrList(): FastAttributeList {
    return new FastAttributeList(null);
  }
  private mpSerializer: FastSaxSerializer | undefined;
  /** Original header flag plus explicit binding of its acquired token service. @param output - Actual output stream. @param writeHeader - Original declaration flag. @param tokens - Actual native lexical handler. @returns Helper. */
  constructor(output: OutputStream, writeHeader: boolean, tokens: FastTokenHandler) {
    this.mpSerializer = new FastSaxSerializer(output, tokens);
    if (writeHeader) this.startDocument();
  }
  /** Dereferencing the native moved/null owner violates the caller precondition. @returns Actual serializer. */ private serializer(): FastSaxSerializer {
    if (!this.mpSerializer) throw Error("FastSerializerHelper document has ended.");
    return this.mpSerializer;
  }
  /** Original start forwarding. @returns Nothing. */ startDocument(): void {
    this.serializer().startDocument();
  }
  /** Original owner moves out before endDocument, including an output failure. @returns Nothing. */ endDocument(): void {
    const serializer = this.serializer();
    this.mpSerializer = undefined;
    serializer.endDocument();
  }
  /** Explicit native destructor binding, retaining release-build unfinished-document flush. @returns Nothing. */ dispose(): void {
    if (this.mpSerializer) this.endDocument();
  }
  /** Original attribute push retains a borrowed UTF8 view; encoded host string storage lives through immediate emission. @param attribute - Combined token. @param value - UTF8 input or host text. @returns Nothing. */ private pushAttributeValue(
    attribute: number,
    value: string | Uint8Array,
  ): void {
    this.serializer()
      .getTokenValueList()
      .push(
        new TokenValue(
          attribute,
          typeof value === "string" ? new TextEncoder().encode(value) : value,
        ),
      );
  }
  /** Compiler-erased native variadic calls preserve ordered pushes and optional-value omission. @param attributes - Alternating token/value arguments. @returns Nothing. */
  private push(attributes: Attributes): void {
    if (attributes.length % 2) throw Error("FastSerializerHelper attribute pairs are incomplete.");
    for (let index = 0; index < attributes.length; index += 2) {
      const attribute = attributes[index],
        value = attributes[index + 1];
      if (
        typeof attribute !== "number" ||
        (value !== null && typeof value !== "string" && !ArrayBuffer.isView(value))
      )
        throw Error("FastSerializerHelper attribute argument type is invalid.");
      if (value !== null) this.pushAttributeValue(attribute, value);
    }
  }
  /** Original variadic start. @param token - Element token. @param attributes - Native pairs. @returns Nothing. */ startElement(
    token: number,
    ...attributes: ElementAttributes
  ): void {
    if (attributes[0] instanceof FastAttributeList)
      this.serializer().startFastElement(token, attributes[0]);
    else {
      this.push(attributes as Attributes);
      this.serializer().startFastElement(token);
    }
  }
  /** Original namespace start. @param namespace - Lexical namespace token. @param token - Local token. @param attributes - Native pairs. @returns Nothing. */ startElementNS(
    namespace: number,
    token: number,
    ...attributes: ElementAttributes
  ): void {
    this.startElement(FSNS(namespace, token), ...attributes);
  }
  /** Original variadic single element. @param token - Token. @param attributes - Native pairs. @returns Nothing. */ singleElement(
    token: number,
    ...attributes: ElementAttributes
  ): void {
    if (attributes[0] instanceof FastAttributeList)
      this.serializer().singleFastElement(token, attributes[0]);
    else {
      this.push(attributes as Attributes);
      this.serializer().singleFastElement(token);
    }
  }
  /** Original namespace empty element. @param namespace - Namespace token. @param token - Local token. @param attributes - Native pairs. @returns Nothing. */ singleElementNS(
    namespace: number,
    token: number,
    ...attributes: ElementAttributes
  ): void {
    this.singleElement(FSNS(namespace, token), ...attributes);
  }
  /** Original close forwarding. @param token - Token. @returns Nothing. */ endElement(
    token: number,
  ): void {
    this.serializer().endFastElement(token);
  }
  /** Original namespace close. @param namespace - Namespace token. @param token - Local token. @returns Nothing. */ endElementNS(
    namespace: number,
    token: number,
  ): void {
    this.endElement(FSNS(namespace, token));
  }
  /** Original unescaped text forwarding returns this helper. @param value - Text or UTF8. @returns Same helper. */ write(
    value: string | Uint8Array,
  ): this {
    this.serializer().write(value);
    return this;
  }
  /** Original escaped forwarding returns this helper. @param value - Text or UTF8. @returns Same helper. */ writeEscaped(
    value: string | Uint8Array,
  ): this {
    this.serializer().write(value, true);
    return this;
  }
  /** Original token write returns this helper. @param token - Token. @returns Same helper. */ writeId(
    token: number,
  ): this {
    this.serializer().writeId(token);
    return this;
  }
  /** Original stream getter. @returns Actual stream. */ getOutputStream(): OutputStream {
    return this.serializer().getOutputStream();
  }
  /** Original mark forwarding. @param tag - Debug tag. @param order - Optional schema order. @returns Nothing. */ mark(
    tag: number,
    order: readonly number[] = [],
  ): void {
    this.serializer().mark(tag, order);
  }
  /** Original merge forwarding. @param tag - Debug tag. @param mode - Original merge mode. @returns Nothing. */ mergeTopMarks(
    tag: number,
    mode = MergeMarks.APPEND,
  ): void {
    this.serializer().mergeTopMarks(tag, mode);
  }
  /** Original invalid character escaping switch. @param value - Flag. @returns Nothing. */ setAllowXEscape(
    value: boolean,
  ): void {
    this.serializer().setAllowXEscape(value);
  }
}
