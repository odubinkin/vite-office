/** @fileoverview Native FastAttributeList token/value chunk owner and consumed Unicode value query. UTF8 byte views bind native string_view/pointers; parser token conversion and UNO interfaces are not admitted here. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
/** Original contiguous NUL-terminated attribute storage and token vector. */
export class FastAttributeList {
  private mnChunkLength = 58;
  private mpChunk = new Uint8Array(this.mnChunkLength);
  private maAttributeValues = [0];
  private maAttributeTokens: number[] = [];
  /** Original export construction uses a null token handler; copy construction clones the complete allocated chunk. @param source - Original null export handler or copy source. @returns Attribute list. */
  constructor(source: FastAttributeList | null = null) {
    if (source) {
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
}
