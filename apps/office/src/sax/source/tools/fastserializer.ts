/** @fileoverview Native FastSaxSerializer UTF8 escaping, token emission and mark/sort owners from fastserializer.cxx; JS byte arrays bind original value sequences and GC erases physical reference counts. */
import { FastAttributeList } from "./fastattribs";
import { MergeMarks } from "../../inc/fshelper";
import { CachedOutputStream, type OutputStream, type ForMergeBase } from "./CachedOutputStream";
/** Native token-handler dependency is supplied by the actual caller in place of component-service construction. */
export interface FastTokenHandler {
  getUTF8Identifier(token: number): Uint8Array;
}
/** Original TokenValue retains a borrowed byte view, not a value snapshot. */
export class TokenValue {
  /** Original scalar/view constructor; the caller owns the referenced input lifetime. @param nToken - Original identity. @param pValue - Borrowed UTF8 view. @returns Attribute entry. */
  constructor(
    public nToken: number,
    public pValue: Uint8Array,
  ) {}
}
/** Original byte sequence concatenation owns its result. @param left - Left input. @param right - Right input. @returns Independent sequence. */
function merge(left: Uint8Array, right: Uint8Array): Uint8Array {
  const data = new Uint8Array(left.length + right.length);
  data.set(left);
  data.set(right, left.length);
  return data;
}
/** Original unsorted mark. */
class ForMerge implements ForMergeBase {
  private maData: Uint8Array = new Uint8Array(0);
  private maPostponed: Uint8Array = new Uint8Array(0);
  /** Retains original debug identity. @param m_Tag - Mark tag. @returns Mark. */ constructor(
    readonly m_Tag: number,
  ) {}
  /** Original base hook is inert. @param token - Element. @returns Nothing. */ setCurrentElement(
    token: number,
  ): void {
    void token;
  }
  /** Original postponed data is appended once on read. @returns Borrowed accumulated bytes. */ getData(): Uint8Array {
    this.maData = merge(this.maData, this.maPostponed);
    this.maPostponed = new Uint8Array(0);
    return this.maData;
  }
  /** Original prepend. @param bytes - Input. @returns Nothing. */ prepend(
    bytes: Uint8Array,
  ): void {
    this.maData = merge(bytes, this.maData);
  }
  /** Original append. @param bytes - Input. @returns Nothing. */ append(bytes: Uint8Array): void {
    this.maData = merge(this.maData, bytes);
  }
  /** Original postponed values remain separate until getData. @param bytes - Input. @returns Nothing. */ postpone(
    bytes: Uint8Array,
  ): void {
    this.maPostponed = merge(this.maPostponed, bytes);
  }
  /** Original sort resets only ordinary data, preserving postponed bytes. @returns Nothing. */ protected resetData(): void {
    this.maData = new Uint8Array(0);
  }
}
/** Original sorted mark retains the last recognized element when an unrecognized token arrives. */
class ForSort extends ForMerge {
  private readonly maDataByElement = new Map<number, Uint8Array>();
  private mnCurrentElement = 0;
  /** Retains original token order as a value. @param tag - Mark identity. @param maOrder - Schema order. @returns Sorted mark. */ constructor(
    tag: number,
    private readonly maOrder: readonly number[],
  ) {
    super(tag);
  }
  /** Original membership check does not clear the current element for unknown tokens. @param token - Element. @returns Nothing. */ override setCurrentElement(
    token: number,
  ): void {
    if (this.maOrder.includes(token)) {
      this.mnCurrentElement = token;
      if (!this.maDataByElement.has(token)) this.maDataByElement.set(token, new Uint8Array(0));
    }
  }
  /** Original sorted prepend deliberately appends. @param bytes - Input. @returns Nothing. */ override prepend(
    bytes: Uint8Array,
  ): void {
    this.append(bytes);
  }
  /** Original data buckets are keyed by the current recognized token, initially zero. @param bytes - Input. @returns Nothing. */ override append(
    bytes: Uint8Array,
  ): void {
    this.maDataByElement.set(
      this.mnCurrentElement,
      merge(this.maDataByElement.get(this.mnCurrentElement) ?? new Uint8Array(0), bytes),
    );
  }
  /** Original sort rebuilds ordinary output in the supplied order, retaining repeated order entries. @returns Nothing. */
  private sort(): void {
    this.resetData();
    for (const token of this.maOrder) {
      const bytes = this.maDataByElement.get(token);
      if (bytes) super.append(bytes);
    }
  }
  /** Original data access sorts before consuming postponed values. @returns Borrowed sorted bytes. */
  override getData(): Uint8Array {
    this.sort();
    return super.getData();
  }
}
/** Original invalid XML10 byte recognition deliberately does not validate all UTF8 sequences. @param bytes - UTF8 bytes. @param index - Current byte. @returns Invalid code point and consumed length or absence. */
export function invalidChar(
  bytes: Uint8Array,
  index: number,
): readonly [number, number] | undefined {
  const c = bytes[index] as number;
  if (c >= 0x20 && c !== 0xef) return;
  if (c === 9 || c === 10 || c === 13) return;
  if (c === 0xef) {
    if (bytes[index + 1] === 0xbf) {
      if (bytes[index + 2] === 0xbe) return [0xfffe, 3];
      if (bytes[index + 2] === 0xbf) return [0xffff, 3];
    }
    return;
  }
  return [c, 1];
}
/** Original ASCII hex predicate. @param c - Byte or out-of-range absence. @returns Hex membership. */
function isHex(c: number): boolean {
  return (c >= 48 && c <= 57) || (c >= 65 && c <= 70) || (c >= 97 && c <= 102);
}
const encoder = new TextEncoder();
const entities = new Map([
  [60, "&lt;"],
  [62, "&gt;"],
  [38, "&amp;"],
  [39, "&apos;"],
  [34, "&quot;"],
  [9, "&#9;"],
  [10, "&#10;"],
  [13, "&#13;"],
]);
/** Original serializer owns actual stream cache, token values and mark stack; debug structural stacks and physical RTL allocation are not simulated. */
export class FastSaxSerializer {
  private readonly maCachedOutputStream: CachedOutputStream;
  private readonly maMarkStack: ForMerge[] = [];
  /** Native independent flag: fallible mark setup can leave it inconsistent with the stack; preserve WRITER111/CALC-289. */
  private mbMarkStackEmpty = true;
  private readonly maTokenValues: TokenValue[] = [];
  private mbXescape = true;
  /** Binds actual stream/token service dependencies. @param output - Native output stream. @param mxFastTokenHandler - Actual lexical handler. @returns Serializer. */
  constructor(
    output: OutputStream,
    private readonly mxFastTokenHandler: FastTokenHandler,
  ) {
    this.maCachedOutputStream = new CachedOutputStream();
    this.maCachedOutputStream.setOutputStream(output);
  }
  /** Original exact declaration. @returns Nothing. */ startDocument(): void {
    this.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n');
  }
  /** Original active marks violate the end precondition; the stream remains caller-owned and open. @returns Nothing. */ endDocument(): void {
    if (!this.mbMarkStackEmpty || this.maMarkStack.length)
      throw Error("FastSaxSerializer has active marks.");
    this.maCachedOutputStream.flush();
  }
  /** Original borrowed output stream. @returns Stream. */ getOutputStream(): OutputStream {
    return this.maCachedOutputStream.getOutputStream() as OutputStream;
  }
  /** Original token/value vector is consumed only by the no-attribute-list element overload. @returns Actual vector. */ getTokenValueList(): TokenValue[] {
    return this.maTokenValues;
  }
  /** Original invalid-character escaping switch. @param value - Switch. @returns Nothing. */ setAllowXEscape(
    value: boolean,
  ): void {
    this.mbXescape = value;
  }
  /** Original namespace/local spelling uses lexical token names, not parser namespace IDs. @param token - Combined token. @returns Nothing. */ writeId(
    token: number,
  ): void {
    if ((token & 0xffff0000) !== 0) {
      this.writeBytes(this.mxFastTokenHandler.getUTF8Identifier(token >> 16));
      this.write(":");
      token &= 0xffff;
    }
    this.writeBytes(this.mxFastTokenHandler.getUTF8Identifier(token));
  }
  /** Original byte-string escaping with native literal x-escape exceptions. Strings are the existing host UTF16-to-UTF8 transport binding; raw byte inputs retain their exact byte values. @param input - Text or UTF8 bytes. @param escape - Escape text. @returns Nothing. */
  write(input: string | Uint8Array, escape = false): void {
    const bytes = typeof input === "string" ? encoder.encode(input) : input;
    if (!escape) {
      this.writeBytes(bytes);
      return;
    }
    let nextXescape = 0;
    for (let index = 0; index < bytes.length; ++index) {
      const c = bytes[index] as number;
      const entity = entities.get(c);
      if (entity !== undefined) {
        this.write(entity);
        continue;
      }
      if (this.mbXescape) {
        if (
          c === 95 &&
          index >= nextXescape &&
          index <= bytes.length - 7 &&
          bytes[index + 6] === 95 &&
          ((bytes[index + 1] as number) | 32) === 120 &&
          [2, 3, 4, 5].every(
            /** Native four independent ASCII hex tests. @param offset - Byte offset. @returns Hex membership. */ (
              offset,
            ) => isHex(bytes[index + offset] as number),
          )
        ) {
          const [c1, c2, c3, c4] = [
            bytes[index + 2],
            bytes[index + 3],
            bytes[index + 4],
            bytes[index + 5],
          ];
          if (!(c1 === 48 && c2 === 48 && c3 === 50 && c4 === 48)) {
            if (
              c1 === 48 &&
              c2 === 48 &&
              c3 === 53 &&
              ((c4 as number) | 32) === 102 &&
              index + 7 <= bytes.length - 6 &&
              bytes[index + 12] === 95 &&
              ((bytes[index + 7] as number) | 32) === 120 &&
              [8, 9, 10, 11].every(
                /** Native already-escaped suffix hex tests. @param offset - Byte offset. @returns Hex membership. */ (
                  offset,
                ) => isHex(bytes[index + offset] as number),
              )
            ) {
              this.writeBytes(bytes.subarray(index, index + 1));
              nextXescape = index + 13;
            } else {
              this.write("_x005F_");
              nextXescape = index + 7;
            }
            continue;
          }
        }
        const invalid = invalidChar(bytes, index);
        if (invalid) {
          this.write("_x" + invalid[0].toString(16).padStart(4, "0") + "_");
          index += invalid[1] - 1;
          continue;
        }
      }
      this.writeBytes(bytes.subarray(index, index + 1));
    }
  }
  /** Original start flushes before updating sorted-mark element identity. @param token - Element token. @param attributes - Optional native full list. @returns Nothing. */
  startFastElement(token: number, attributes: FastAttributeList | null = null): void {
    if (!this.mbMarkStackEmpty) {
      this.maCachedOutputStream.flush();
      (this.maMarkStack.at(-1) as ForMerge).setCurrentElement(token);
    }
    this.write("<");
    this.writeId(token);
    if (attributes) this.writeFastAttributeList(attributes);
    else this.writeTokenValueList();
    this.write(">");
  }
  /** Original single-element path keeps its own token/buffer transition sequence. @param token - Element token. @param attributes - Optional native full list. @returns Nothing. */
  singleFastElement(token: number, attributes: FastAttributeList | null = null): void {
    if (!this.mbMarkStackEmpty) {
      this.maCachedOutputStream.flush();
      (this.maMarkStack.at(-1) as ForMerge).setCurrentElement(token);
    }
    this.write("<");
    this.writeId(token);
    if (attributes) this.writeFastAttributeList(attributes);
    else this.writeTokenValueList();
    this.write("/>");
  }
  /** Original full-list path leaves queued variadic values untouched and preserves the VML raw-prefix exception. @param attributes - Native contiguous list. @returns Nothing. */
  private writeFastAttributeList(attributes: FastAttributeList): void {
    const tokens = attributes.getFastAttributeTokens();
    for (let index = 0; index < tokens.length; ++index) {
      this.write(" ");
      this.writeId(tokens[index] as number);
      this.write('="');
      const value = attributes.getFastAttributeValue(index);
      const prefix = value[0] === 35 ? "#_x0000_t" : "_x0000_t";
      const escape = !prefix
        .split("")
        .every(
          /** Native prefix byte comparison. @param character - ASCII prefix unit. @param offset - Prefix offset. @returns Byte equality. */ (
            character,
            offset,
          ) => value[offset] === character.charCodeAt(0),
        );
      this.write(value.subarray(0, attributes.AttributeValueLength(index)), escape);
      this.write('"');
    }
  }
  /** Original ordered attribute-vector emission consumes all borrowed entries after their immediate writes. @returns Nothing. */
  private writeTokenValueList(): void {
    for (const rTokenValue of this.maTokenValues) {
      this.write(" ");
      const nToken = rTokenValue.nToken;
      this.writeId(nToken);
      this.write('="');
      this.write(rTokenValue.pValue, true);
      this.write('"');
    }
    this.maTokenValues.length = 0;
  }
  /** Original close does not update a sorted mark's current element. @param token - Token. @param attributes - Optional native full list. @returns Nothing. */ endFastElement(
    token: number,
  ): void {
    this.write("</");
    this.writeId(token);
    this.write(">");
  }
  /** Original byte forwarding uses the actual stream cache; native debug-only warning scans are not simulated. @param bytes - Borrowed bytes. @returns Nothing. */
  private writeBytes(bytes: Uint8Array): void {
    this.maCachedOutputStream.writeBytes(bytes);
  }
  /** Original cache flush/destination transition retains the old destination while flushing. @param tag - Debug tag. @param order - Native element order or empty unsorted mode. @returns Nothing. */ mark(
    tag: number,
    order: readonly number[] = [],
  ): void {
    const mark = order.length ? new ForSort(tag, [...order]) : new ForMerge(tag);
    this.maMarkStack.push(mark);
    this.maCachedOutputStream.setOutput(mark);
    this.mbMarkStackEmpty = false;
  }
  /** Original final merge ignores merge mode; inner marks append/prepend/postpone to the surviving owner. The native empty-flag guard remains a release-build no-op even after failed mark setup. @param tag - Debug tag, not a release-build selector. @param mode - Merge mode. @returns Nothing. */ mergeTopMarks(
    tag: number,
    mode = MergeMarks.APPEND,
  ): void {
    void tag;
    if (this.mbMarkStackEmpty) return;
    this.maCachedOutputStream.flush();
    const bytes = (this.maMarkStack.at(-1) as ForMerge).getData();
    this.maMarkStack.pop();
    const parent = this.maMarkStack.at(-1);
    if (!parent) {
      this.mbMarkStackEmpty = true;
      this.maCachedOutputStream.resetOutputToStream();
      this.maCachedOutputStream.writeBytes(bytes);
      return;
    }
    this.maCachedOutputStream.setOutput(parent);
    switch (mode) {
      case MergeMarks.APPEND:
        parent.append(bytes);
        break;
      case MergeMarks.PREPEND:
        parent.prepend(bytes);
        break;
      case MergeMarks.POSTPONE:
        parent.postpone(bytes);
        break;
    }
  }
}
