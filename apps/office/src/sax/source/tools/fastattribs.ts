/** @fileoverview Native FastAttributeList token/value chunk owner and consumed Unicode, numeric, view and real direct-token queries. UTF8 byte views bind native string_view/pointers; full parser/UNO interfaces remain unported. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { toInt32, toDouble } from "../../../o3tl/inc/string_view";
/** Original native direct-token interface; existing UTF8 byte/string views erase std::string_view. Full WeakImplHelper/UNO service ownership remains unported. */
export abstract class FastTokenHandlerBase {
  /** Original pure direct lookup. @param token - Native UTF8 view. @returns Token identity. */
  abstract getTokenDirect(token: string | Uint8Array): number;
  /** Original helper directly calls the required borrowed handler; null is outside its valid caller domain. @param handler - Actual native handler. @param token - Native view. @returns Token. */
  static getTokenFromChars(handler: FastTokenHandlerBase, token: string | Uint8Array): number {
    return handler.getTokenDirect(token);
  }
}
/** Original contiguous NUL-terminated attribute storage and token vector. */
export class FastAttributeList {
  private readonly mpTokenHandler: FastTokenHandlerBase | null;
  private mnChunkLength = 58;
  private mpChunk = new Uint8Array(this.mnChunkLength);
  private maAttributeValues = [0];
  private maAttributeTokens: number[] = [];
  /** Original construction borrows its token handler, nullable for export; copy construction clones the complete allocated chunk and preserves the handler pointer. @param source - Actual handler, null export handler or copy source. @returns Attribute list. */
  constructor(source: FastAttributeList | FastTokenHandlerBase | null = null) {
    this.mpTokenHandler = source instanceof FastAttributeList ? source.mpTokenHandler : source;
    if (source instanceof FastAttributeList) {
      this.mnChunkLength = source.mnChunkLength;
      this.mpChunk = source.mpChunk.slice();
      this.maAttributeValues = source.maAttributeValues.slice();
      this.maAttributeTokens = source.maAttributeTokens.slice();
    }
  }
  /** Native clone delegates to copy construction. @returns Independent owner. */
  createClone(): FastAttributeList {
    return new FastAttributeList(this);
  }
  /** Original clear retains chunk capacity and initial offset. @returns Nothing. */
  clear(): void {
    this.maAttributeTokens.length = 0;
    this.maAttributeValues.length = 1;
  }
  /** Original insertion appends offsets before growing the contiguous chunk. @param token - Native token. @param value - UTF8 view or UTF16 host input. @returns Nothing. */
  add(token: number, value: string | Uint8Array): void {
    const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
    if (token === -1 || token === 0 || bytes.length >= 0x7fffffff)
      throw Error("FastAttributeList add precondition violated.");
    this.maAttributeTokens.push(token);
    const position = this.maAttributeValues.at(-1) as number;
    const end = position + bytes.length + 1;
    this.maAttributeValues.push(end);
    if (end > this.mnChunkLength) {
      const length = Math.max(this.mnChunkLength * 2, end);
      const chunk = new Uint8Array(length);
      chunk.set(this.mpChunk);
      this.mnChunkLength = length;
      this.mpChunk = chunk;
    }
    this.mpChunk.set(bytes, position);
    this.mpChunk[position + bytes.length] = 0;
  }
  /** Native namespace token composition. @param namespace - Prefix token. @param token - Local token. @param value - Attribute value. @returns Nothing. */
  addNS(namespace: number, token: number, value: string | Uint8Array): void {
    this.add((namespace << 16) | token, value);
  }
  /** Original borrowed token vector. @returns Tokens. */
  getFastAttributeTokens(): readonly number[] {
    return this.maAttributeTokens;
  }
  /** Original pointer starts at the value and extends through remaining allocation. @param index - Attribute index. @returns Borrowed chunk view. */
  getFastAttributeValue(index: number): Uint8Array {
    return this.mpChunk.subarray(this.maAttributeValues[index]);
  }
  /** Native lengths exclude the terminating NUL. @param index - Attribute index. @returns Byte length. */
  AttributeValueLength(index: number): number {
    return (
      (this.maAttributeValues[index + 1] as number) - (this.maAttributeValues[index] as number) - 1
    );
  }
  /** Original size counts offsets, including the initial offset. @returns Offset count. */
  size(): number {
    return this.maAttributeValues.length;
  }
  /** Original bounded string view preserves embedded NUL bytes. @param index - Attribute index. @returns Borrowed value bytes. */
  getAsViewByIndex(index: number): Uint8Array {
    return this.getFastAttributeValue(index).subarray(0, this.AttributeValueLength(index));
  }
  /** Original counted UTF8-to-Unicode conversion preserves embedded NUL. @param index - Valid native attribute index. @returns Owned actual Unicode value. */
  getValueByIndex(index: number): OUString {
    const view = this.getAsViewByIndex(index);
    return new OUString(view, view.length, RTL_TEXTENCODING_UTF8);
  }
  /** Native first-match lookup preserves duplicate entries. @param token - Identity. @returns First index or minus one. */
  getAttributeIndex(token: number): number {
    return this.maAttributeTokens.indexOf(token);
  }
  /** Original membership lookup. @param token - Identity. @returns Membership. */
  hasAttribute(token: number): boolean {
    return this.getAttributeIndex(token) !== -1;
  }
  /** Original direct token lookup over an existing index. Caller supplies a nonnull original handler for token queries. @param index - Valid attribute index. @returns Value token, including unknown. */
  getValueTokenByIndex(index: number): number {
    return FastTokenHandlerBase.getTokenFromChars(
      this.mpTokenHandler as FastTokenHandlerBase,
      this.getAsViewByIndex(index),
    );
  }
  /** Original missing-only default; present unknown values retain their invalid token. @param token - Attribute identity. @param fallback - Default token. @returns Value token or missing default. */
  getOptionalValueToken(token: number, fallback: number): number {
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) return this.getValueTokenByIndex(i);
    return fallback;
  }
  /** Original bounded integer conversion by valid index. @param index - Index. @returns Parsed signed32 prefix, zero on invalid/overflow. */
  getAsIntegerByIndex(index: number): number {
    return toInt32(this.getAsViewByIndex(index));
  }
  /** Original presence query resets output even on missing input; malformed present text succeeds with converted zero. @param token - Attribute. @param output - Native signed32 reference. @returns Presence. */
  getAsInteger(token: number, output: [number]): boolean {
    output[0] = 0;
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) {
        output[0] = this.getAsIntegerByIndex(i);
        return true;
      }
    return false;
  }
  /** Original double presence query uses byte-view RTL conversion. @param token - Attribute. @param output - Native double reference. @returns Presence. */
  getAsDouble(token: number, output: [number]): boolean {
    output[0] = 0;
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) {
        output[0] = toDouble(this.getAsViewByIndex(i));
        return true;
      }
    return false;
  }
  /** Original missing view leaves the output reference untouched. @param token - Attribute. @param output - Native borrowed view output. @returns Presence. */
  getAsView(token: number, output: [Uint8Array]): boolean {
    for (let i = 0; i < this.maAttributeTokens.length; ++i) {
      if (this.maAttributeTokens[i] !== token) continue;
      output[0] = this.getAsViewByIndex(i);
      return true;
    }
    return false;
  }
}
