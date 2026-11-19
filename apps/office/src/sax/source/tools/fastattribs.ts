/** @fileoverview Original FastAttributeList native UNO facets, unknown/fast attribute sequences, chunk storage and iteration. Byte/Unicode views erase native pointers; vector capacity and physical C++ allocation remain unqualified. */
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XFastTokenHandler } from "../../../offapi/com/sun/star/xml/sax/XFastTokenHandler";
import {
  Sequence,
  type SequenceConstReference,
  type SequenceElements,
} from "../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  Reference,
  type ReferenceConstParameter,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { SAXException } from "../../../cppu/inc/com/sun/star/xml/sax/SAXException";
import { XFastAttributeList } from "../../../offapi/com/sun/star/xml/sax/XFastAttributeList";
import { XCloneable } from "../../../offapi/com/sun/star/util/XCloneable";
import {
  type Attribute,
  cppu_detail_getUnoType_Attribute,
} from "../../../offapi/com/sun/star/xml/Attribute";
import {
  type FastAttribute,
  cppu_detail_getUnoType_FastAttribute,
} from "../../../offapi/com/sun/star/xml/FastAttribute";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OString, type OStringConstReference } from "../../../sal/inc/rtl/string";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { rtl_str_toBoolean } from "../../../sal/inc/rtl/string.h";
import { RTL_TEXTENCODING_UTF8 } from "../../../sal/inc/rtl/textenc";
import { toInt32, toDouble } from "../../../o3tl/inc/string_view";

/** Original Attribute pointer over actual initialized generated member cells. */
type AttributeAddress = Pick<ReadonlyMap<number, unknown>, "get">;
/** Original byte/Unicode view overload witnesses; strings bind existing host UTF16 input. */
type AttributeValue = string | Uint8Array | Uint16Array | OUStringConstReference;
const Attributes = Sequence.specialize<Attribute>(cppu_detail_getUnoType_Attribute, 24);
const FastAttributes = Sequence.specialize<FastAttribute>(cppu_detail_getUnoType_FastAttribute, 16);

/** Original vector element with actual native strings; call-parameter copies followed by moves leave one owned copy per member. */
export class UnknownAttribute {
  readonly maNamespaceURL: OUString;
  readonly maName: OString;
  readonly maValue: OString;
  /** Original two constructor overloads. @param args - Borrowed caller operands copied into by-value parameters. @returns Owned element. */
  constructor(
    ...args:
      | [name: OStringConstReference, value: OStringConstReference]
      | [
          namespace: OUStringConstReference,
          name: OStringConstReference,
          value: OStringConstReference,
        ]
  ) {
    this.maNamespaceURL = args.length === 3 ? new OUString(args[0]) : new OUString();
    this.maName = new OString(args.length === 3 ? args[1] : args[0]);
    this.maValue = new OString(args.length === 3 ? args[2] : args[1]);
  }
  /** Original optional-pointer fill, in declaration assignment order, over native generated struct cells. @param target - Actual initialized Attribute address or null. @returns Nothing. */
  FillAttribute(target: AttributeAddress | null): void {
    if (target === null) return;
    const name = new OUString(this.maName.getStr(), this.maName.getLength(), RTL_TEXTENCODING_UTF8);
    try {
      rtl_uString_assign(target.get(0) as rtl_uStringSlot, name.pData);
    } finally {
      name.dispose();
    }
    rtl_uString_assign(target.get(8) as rtl_uStringSlot, this.maNamespaceURL.pData);
    const value = new OUString(
      this.maValue.getStr(),
      this.maValue.getLength(),
      RTL_TEXTENCODING_UTF8,
    );
    try {
      rtl_uString_assign(target.get(16) as rtl_uStringSlot, value.pData);
    } finally {
      value.dispose();
    }
  }
  /** Original implicit member destruction. @returns Nothing. */
  dispose(): void {
    this.maValue.dispose();
    this.maName.dispose();
    this.maNamespaceURL.dispose();
  }
}
/** Original native direct-token interface and actual WeakImplHelper XFastTokenHandler base; UTF8 byte/string views erase std::string_view. */
export abstract class FastTokenHandlerBase
  extends WeakImplHelper.specialize(XFastTokenHandler)
  implements XFastTokenHandler
{
  /** Original inherited pure UNO byte-identifier lookup. @param identifier - Borrowed native signed-byte sequence. @returns Token identity. */
  abstract getTokenFromUTF8(identifier: SequenceConstReference<number>): number;
  /** Original inherited pure UNO identifier result. @param token - Native token. @returns Owned native signed-byte sequence. */
  abstract getUTF8Identifier(token: number): Sequence<number>;
  /** Original pure direct lookup. @param token - Native UTF8 view. @returns Token identity. */
  abstract getTokenDirect(token: string | Uint8Array): number;
  /** Original helper directly calls the required borrowed handler; null is outside its valid caller domain. @param handler - Actual native handler. @param token - Native view. @returns Token. */
  static getTokenFromChars(handler: FastTokenHandlerBase, token: string | Uint8Array): number {
    return handler.getTokenDirect(token);
  }
}
/** Original contiguous NUL-terminated attribute storage and token vector. */
export class FastAttributeList
  extends WeakImplHelper.specialize(XFastAttributeList, XCloneable)
  implements XFastAttributeList, XCloneable
{
  private readonly mpTokenHandler: FastTokenHandlerBase | null;
  private mnChunkLength = 58;
  private mpChunk = new Uint8Array(this.mnChunkLength);
  private maAttributeValues = [0];
  private maAttributeTokens: number[] = [];
  private readonly maUnknownAttributes: UnknownAttribute[] = [];
  /** Original construction borrows its token handler, nullable for export; copy construction clones the complete allocated chunk and preserves the handler pointer. @param source - Actual handler, null export handler or copy source. @returns Attribute list. */
  constructor(
    source:
      FastAttributeList | FastTokenHandlerBase | ReferenceConstParameter<XFastAttributeList> | null,
  ) {
    super();
    const original =
      source === null || source instanceof FastTokenHandlerBase
        ? null
        : source instanceof FastAttributeList
          ? source
          : castToFastAttributeList(source);
    this.mpTokenHandler =
      original === null ? (source as FastTokenHandlerBase | null) : original.mpTokenHandler;
    if (original !== null) {
      this.mnChunkLength = original.mnChunkLength;
      this.mpChunk = original.mpChunk.slice();
      this.maAttributeValues = original.maAttributeValues.slice();
      this.maAttributeTokens = original.maAttributeTokens.slice();
      for (const attribute of original.maUnknownAttributes)
        this.maUnknownAttributes.push(
          new UnknownAttribute(attribute.maNamespaceURL, attribute.maName, attribute.maValue),
        );
    }
  }
  /** Native clone delegates to copy construction. @returns Independent owner. */
  createClone(): Reference<XCloneable> {
    return new Reference<XCloneable>(new FastAttributeList(this));
  }
  /** Original destructor frees its chunk, then destroys members before the weak base. Physical malloc/free remains a host allocation binding. @returns Nothing. */
  protected override destroy(): void {
    for (const attribute of this.maUnknownAttributes) attribute.dispose();
    this.maUnknownAttributes.length = 0;
    super.destroy();
  }
  /** Original clear retains chunk capacity and initial offset. @returns Nothing. */
  clear(): void {
    this.maAttributeTokens.length = 0;
    this.maAttributeValues.length = 1;
    if (this.maAttributeValues[0] !== 0) throw new Error("assert(maAttributeValues[0] == 0)");
    for (const attribute of this.maUnknownAttributes) attribute.dispose();
    this.maUnknownAttributes.length = 0;
  }
  /** Original vector capacity hint; the host primitive-vector binding has no exposed reserve operation. No logical element or chunk storage changes. @param count - Requested token capacity. @returns Nothing. */
  reserve(count: number): void {
    void count;
  }
  /** Original list/native-reference append overload. @param list - Borrowed actual source. @returns Nothing. */
  add(list: FastAttributeList | ReferenceConstParameter<XFastAttributeList>): void;
  /** Original value and variadic overloads. @param token - Token identity. @param value - Declared byte/Unicode value. @param rest - Remaining native pairs. @returns Nothing. */
  add(token: number, value: AttributeValue, ...rest: (number | AttributeValue)[]): void;
  /** Lowers the selected original append/view/variadic call while preserving source order and native Unicode temporaries. @param first - Original selected list or token operand. @param value - Declared value operand when token is selected. @param rest - Remaining native pairs. @returns Nothing. */
  add(
    first: number | FastAttributeList | ReferenceConstParameter<XFastAttributeList>,
    value?: AttributeValue,
    ...rest: (number | AttributeValue)[]
  ): void {
    if (typeof first !== "number") {
      const other = first instanceof FastAttributeList ? first : castToFastAttributeList(first);
      for (let i = 0; i < other.maAttributeTokens.length; ++i)
        this.add(other.maAttributeTokens[i] as number, other.getAsViewByIndex(i));
      for (const attribute of other.maUnknownAttributes)
        this.addUnknown(attribute.maNamespaceURL, attribute.maName, attribute.maValue);
      return;
    }
    const token = first;
    if (!(ArrayBuffer.isView(value) && value.BYTES_PER_ELEMENT === 1)) {
      let view: Uint16Array;
      if (typeof value === "string") {
        view = new Uint16Array(value.length);
        for (let i = 0; i < value.length; ++i) view[i] = value.charCodeAt(i);
      } else
        view = ArrayBuffer.isView(value)
          ? (value as Uint16Array)
          : (value as OUStringConstReference)
              .getStr()
              .subarray(0, (value as OUStringConstReference).getLength());
      const converted = new OString(view, view.length, RTL_TEXTENCODING_UTF8);
      try {
        this.add(token, converted.getStr().subarray(0, converted.getLength()));
      } finally {
        converted.dispose();
      }
    } else this.addBytes(token, value as Uint8Array);
    if (rest.length !== 0) this.add(rest[0] as number, rest[1] as AttributeValue, ...rest.slice(2));
  }
  /** Original string_view insertion body; callers retain the input during the copy. @param token - Token. @param bytes - Borrowed exact bytes. @returns Nothing. */
  private addBytes(token: number, bytes: Uint8Array): void {
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
  addNS(namespace: number, token: number, value: AttributeValue): void {
    this.add((namespace << 16) | token, value);
  }
  /** Original unknown-attribute overloads retain native values, including prefixed names and duplicates. @param args - Source namespace/name/value or name/value. @returns Nothing. */
  addUnknown(
    ...args:
      | [name: OStringConstReference, value: OStringConstReference]
      | [
          namespace: OUStringConstReference,
          name: OStringConstReference,
          value: OStringConstReference,
        ]
  ): void {
    if (args.length === 3)
      this.maUnknownAttributes.push(new UnknownAttribute(args[0], args[1], args[2]));
    else this.maUnknownAttributes.push(new UnknownAttribute(args[0], args[1]));
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
  /** Original required token lookup throws native SAXException on absence. @param token - Attribute identity. @returns Tokenized value. */
  getValueToken(token: number): number {
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) return this.getValueTokenByIndex(i);
    return this.throwUnknown("getValueToken", token);
  }
  /** Original required Unicode value lookup. @param token - Attribute identity. @returns Owned value. */
  getValue(token: number): OUString {
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) return this.getValueByIndex(i);
    return this.throwUnknown("getValue", token);
  }
  /** Original optional Unicode lookup returns an empty native value for absence. @param token - Attribute identity. @returns Owned value. */
  getOptionalValue(token: number): OUString {
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) return this.getValueByIndex(i);
    return new OUString();
  }
  /** Lowers native exception-expression temporaries and their destruction without changing the source message, context or wrapped Any. @param method - Original source method literal. @param token - Missing native signed32 token. @returns Never. */
  private throwUnknown(method: "getValue" | "getValueToken", token: number): never {
    const prefix = `FastAttributeList::${method}: unknown token `,
      message = new OUString(
        Uint8Array.from(
          prefix + "\0",
          /** Original ASCII source literal byte. @param c - Character. @returns Byte. */ (c) =>
            c.charCodeAt(0),
        ),
      ),
      number = new OUString(OUString.number(token)),
      context = new Reference(),
      wrapped = new Any();
    try {
      message.append(number);
      throw new SAXException(message, context, wrapped);
    } finally {
      wrapped.dispose();
      context.dispose();
      number.dispose();
      message.dispose();
    }
  }
  /** Original initialized native Attribute sequence; duplicate unknown names and their source order are retained. @returns Owned native sequence. */
  getUnknownAttributes(): Sequence<Attribute> {
    if (this.maUnknownAttributes.length === 0) return new Attributes();
    const result = new Attributes(this.maUnknownAttributes.length);
    try {
      const fields = result.getArray() as SequenceElements;
      for (let i = 0; i < this.maUnknownAttributes.length; ++i)
        (this.maUnknownAttributes[i] as UnknownAttribute).FillAttribute(
          fields.get(i * 24) as SequenceElements,
        );
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
  /** Original initialized native FastAttribute sequence in insertion order. @returns Owned native sequence. */
  getFastAttributes(): Sequence<FastAttribute> {
    const result = new FastAttributes(this.maAttributeTokens.length);
    try {
      const fields = result.getArray() as SequenceElements;
      for (let i = 0; i < this.maAttributeTokens.length; ++i) {
        const element = fields.get(i * 16) as SequenceElements;
        (element.get(0) as [number])[0] = this.maAttributeTokens[i] as number;
        const value = this.getValueByIndex(i);
        try {
          rtl_uString_assign(element.get(8) as rtl_uStringSlot, value.pData);
        } finally {
          value.dispose();
        }
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    }
  }
  /** Original iterator starts at the first token. @returns Native borrowed iterator. */
  begin(): FastAttributeIter {
    return new FastAttributeIter(this, 0);
  }
  /** Original end iterator uses token count rather than size() offset count. @returns End iterator. */
  end(): FastAttributeIter {
    return new FastAttributeIter(this, this.maAttributeTokens.length);
  }
  /** Original first-match iterator lookup. @param token - Token identity. @returns Matching iterator or end. */
  find(token: number): FastAttributeIter {
    for (let i = 0; i < this.maAttributeTokens.length; ++i)
      if (this.maAttributeTokens[i] === token) return new FastAttributeIter(this, i);
    return this.end();
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

/** Original nested FastAttributeIter borrows its owner; host method spellings erase C++ operators. */
export class FastAttributeIter {
  /** Original owner/index constructor. @param mrList - Borrowed list. @param mnIdx - Initial token index. @returns Iterator. */
  constructor(
    private readonly mrList: FastAttributeList,
    private mnIdx: number,
  ) {}
  /** Original prefix increment. @returns This iterator. */
  operatorIncrement(): this {
    ++this.mnIdx;
    return this;
  }
  /** Original inequality compares indices only; callers supply iterators from the same valid range. @param other - Same-range iterator. @returns Inequality. */
  operatorNotEquals(other: FastAttributeIter): boolean {
    return this.mnIdx !== other.mnIdx;
  }
  /** Original dereference returns its existing iterator. @returns This borrowed iterator. */
  operatorStar(): this {
    return this;
  }
  /** Original repeated debug assertion at each element accessor. @returns Nothing. */
  private assertIndex(): void {
    if (!(this.mnIdx < this.mrList.getFastAttributeTokens().length))
      throw new Error("assert(mnIdx < mrList.maAttributeTokens.size())");
  }
  /** Original token accessor. @returns Token. */
  getToken(): number {
    this.assertIndex();
    return this.mrList.getFastAttributeTokens()[this.mnIdx] as number;
  }
  /** Original empty value query. @returns Empty. */
  isEmpty(): boolean {
    this.assertIndex();
    return this.mrList.AttributeValueLength(this.mnIdx) < 1;
  }
  /** Original bounded signed32 conversion. @returns Integer. */
  toInt32(): number {
    this.assertIndex();
    return this.mrList.getAsIntegerByIndex(this.mnIdx);
  }
  /** Original bounded native double conversion. @returns Double. */
  toDouble(): number {
    this.assertIndex();
    return toDouble(this.mrList.getAsViewByIndex(this.mnIdx));
  }
  /** Original terminated SAL boolean conversion; no trimming or end-of-string check is added. @returns Boolean. */
  toBoolean(): boolean {
    this.assertIndex();
    return rtl_str_toBoolean(this.mrList.getFastAttributeValue(this.mnIdx));
  }
  /** Original owned Unicode conversion. @returns Value. */
  toString(): OUString {
    this.assertIndex();
    return this.mrList.getValueByIndex(this.mnIdx);
  }
  /** Original borrowed terminated pointer. @returns Chunk view. */
  toCString(): Uint8Array {
    this.assertIndex();
    return this.mrList.getFastAttributeValue(this.mnIdx);
  }
  /** Original byte length, excluding terminator. @returns Length. */
  getLength(): number {
    this.assertIndex();
    return this.mrList.AttributeValueLength(this.mnIdx);
  }
  /** Original counted view. @returns Borrowed bytes. */
  toView(): Uint8Array {
    this.assertIndex();
    return this.mrList.getAsViewByIndex(this.mnIdx);
  }
  /** Original strcmp equality over two actual terminated byte pointers; bytes after the first NUL are ignored. @param text - Terminated source bytes. @returns Equality. */
  isString(text: Uint8Array): boolean {
    this.assertIndex();
    const value = this.mrList.getFastAttributeValue(this.mnIdx);
    for (let i = 0; ; ++i) {
      if (text[i] !== value[i]) return false;
      if (text[i] === 0) return true;
    }
  }
}

/** Original checked native dynamic cast over the actual UNO object identity. @param reference - Nonempty XFastAttributeList reference to the native concrete owner. @returns Borrowed actual list. */
export function castToFastAttributeList(
  reference: ReferenceConstParameter<XFastAttributeList>,
): FastAttributeList {
  const value = reference.get();
  if (!(value instanceof FastAttributeList))
    throw new Error("assert(dynamic_cast<FastAttributeList*>(xAttrList.get()) != nullptr)");
  return value;
}
