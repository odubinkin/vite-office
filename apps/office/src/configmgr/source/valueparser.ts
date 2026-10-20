/** @fileoverview Original complete configmgr ValueParser text/it/unicode automaton over actual configuration nodes, XMLReader, Pad, Any and Sequence. Local OString separator syntax uses an owned exact byte value. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { assert } from "../../sal/inc/cassert";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import { Sequence, asNonConstRange } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { type UnoTypeArgument } from "../../cppu/inc/unotype";
import { type rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import { OUString, type OUStringConstReference } from "../../sal/inc/rtl/ustring";
import { rtl_str_toUInt64 } from "../../sal/inc/rtl/string.h";
import { rtl_math_stringToDouble } from "../../sal/inc/rtl/math.h";
import { toInt32, toInt64, toUInt32 } from "../../o3tl/inc/string_view";
import { convertToHex } from "../../o3tl/inc/numeric";
import { Span, type ByteView } from "../../xmlreader/inc/span";
import { Type, elementType, isListType } from "./type";
import { XmlReader, Text } from "../../xmlreader/inc/xmlreader";
import { Pad } from "../../xmlreader/inc/pad";
import { Data } from "./data";
import { Node } from "./node";
import { LocalizedValueNode } from "./localizedvaluenode";
import { PropertyNode } from "./propertynode";
import { NAMESPACE_OOR } from "./parsemanager";
/** Original literal RuntimeException construction; local UTF16 concatenation syntax is erased. @param message - Exact message. @returns Actual exception. */
export function valueError(message: string): RuntimeException {
  const units = new Uint16Array(message.length);
  for (let i = 0; i < message.length; ++i) units[i] = message.charCodeAt(i);
  return new RuntimeException(new OUString(units, units.length), new Reference());
}
/** Borrows byte-backed spans or materializes an equivalent logical view for existing ArrayLike pointer bindings. @param text - Present native span. @returns Exact bytes without decoding or normalization. */
function bytes(text: Span): Uint8Array {
  assert(text.is(), "text.is()");
  if (text.begin instanceof Uint8Array) return text.begin.subarray(0, text.length);
  const result = new Uint8Array(text.length);
  for (let i = 0; i < text.length; ++i) result[i] = (text.begin as ByteView)[i] as number;
  return result;
}
/** Original first-two-byte shortened case-insensitive prefix check. @param text - Native lexical bytes. @returns Whether hexadecimal prefix is present at offset zero. */
function hexPrefix(text: Uint8Array): boolean {
  return text.length >= 2 && text[0] === 48 && (text[1] === 88 || text[1] === 120);
}
/** Original seven concrete parseSingleValue<T>/convertItems<T> instantiations; unsupported runtime schema types are rejected by the outer dispatcher. */
type ScalarType =
  | Type.TYPE_BOOLEAN
  | Type.TYPE_SHORT
  | Type.TYPE_INT
  | Type.TYPE_LONG
  | Type.TYPE_DOUBLE
  | Type.TYPE_STRING
  | Type.TYPE_HEXBINARY;
/** Original sal_Int32 parseValue overload, whose lexical TODO deliberately accepts invalid prefixes as zero. @param data - Exact original lexical bytes. @returns Parsed signed32 value. */
function parseInt32Value(data: Uint8Array): number {
  return hexPrefix(data) ? toUInt32(data.subarray(2), 16) | 0 : toInt32(data);
}
/** Source template arguments and sizeof(T), never inferred from values. @param type - Scalar native schema type. @returns Actual compiler binding. */
function binding(type: ScalarType): readonly [Exclude<UnoTypeArgument, "Any">, number] {
  switch (type) {
    case Type.TYPE_BOOLEAN:
      return ["sal_Bool", 1];
    case Type.TYPE_SHORT:
      return ["sal_Int16", 2];
    case Type.TYPE_INT:
      return ["sal_Int32", 4];
    case Type.TYPE_LONG:
      return ["sal_Int64", 8];
    case Type.TYPE_DOUBLE:
      return ["double", 8];
    case Type.TYPE_STRING:
      return ["OUString", 8];
    case Type.TYPE_HEXBINARY:
      return [["Sequence", "sal_Int8"], 8];
  }
}
/** Original typed scalar parsing followed by Any(val); numeric lexical TODOs deliberately remain permissive. @param text - Native lexical span. @param type - Scalar schema type. @returns Actual typed Any. */
function parseSingleValue(text: Span, type: ScalarType): Any {
  const data = bytes(text);
  switch (type) {
    case Type.TYPE_BOOLEAN:
      if (
        text.operatorEquals(new Uint8Array([116, 114, 117, 101, 0])) ||
        text.operatorEquals(new Uint8Array([49, 0]))
      )
        return new Any([1], "sal_Bool");
      if (
        text.operatorEquals(new Uint8Array([102, 97, 108, 115, 101, 0])) ||
        text.operatorEquals(new Uint8Array([48, 0]))
      )
        return new Any([0], "sal_Bool");
      throw valueError("invalid value");
    case Type.TYPE_SHORT: {
      const n = hexPrefix(data) ? toUInt32(data.subarray(2), 16) | 0 : toInt32(data);
      if (n < -32768 || n > 32767) throw valueError("invalid value");
      return new Any([n], "sal_Int16");
    }
    case Type.TYPE_INT:
      return new Any([parseInt32Value(data)], "sal_Int32");
    case Type.TYPE_LONG: {
      let n: bigint;
      if (hexPrefix(data)) {
        // Erases the local OString suffix constructor; its terminating NUL matters to toUInt64.
        const suffix = new Uint8Array(data.length - 1);
        suffix.set(data.subarray(2));
        n = BigInt.asIntN(64, rtl_str_toUInt64(suffix, 16));
      } else n = toInt64(data);
      return new Any([n], "sal_Int64");
    }
    case Type.TYPE_DOUBLE:
      return new Any([rtl_math_stringToDouble(data, data.length, 46, 0)], "double");
    case Type.TYPE_STRING: {
      const string = text.convertFromUtf8();
      try {
        return new Any(string.getDataAddress(), "OUString");
      } finally {
        string.dispose();
      }
    }
    case Type.TYPE_HEXBINARY: {
      if ((data.length & 1) !== 0) throw valueError("invalid value");
      const cells = new Map<number, [number]>();
      for (let i = 0; i < data.length; i += 2) {
        const high = convertToHex(data[i] as number),
          low = convertToHex(data[i + 1] as number);
        if (high < 0 || low < 0) throw valueError("invalid value");
        cells.set(i / 2, [(((high << 4) | low) << 24) >> 24]);
      }
      const Bytes = Sequence.specialize<[number]>("sal_Int8", 1),
        value = new Bytes(cells, cells.size);
      try {
        return new Any(value.getAddress(), ["Sequence", "sal_Int8"]);
      } finally {
        value.dispose();
      }
    }
  }
}
/** Original convertItems<T> initialized Sequence and Any extraction; also erases containerToSequence of the parsed typed list. @param items - Actual scalar Any values. @param type - Native list type. @returns Actual sequence-valued Any. */
function sequenceValue(items: readonly Any[], type: Type): Any {
  const [argument, size] = binding(elementType(type) as ScalarType),
    Values = Sequence.specialize(argument, size),
    seq = new Values(items.length);
  try {
    const range = asNonConstRange(seq);
    for (let i = 0; i < seq.getLength(); ++i) {
      const cell = range.operatorIndex(i, size);
      // Original mutable OUString& refers to the already-constructed sequence element's pointer field.
      const destination =
        argument === "OUString" ? (OUString.unacquired(cell as rtl_uStringSlot) as OUString) : cell;
      const ok = (items[i] as Any).extract(destination, argument);
      assert(ok, "ok");
    }
    return new Any(seq.getAddress(), ["Sequence", argument]);
  } finally {
    seq.dispose();
  }
}
/** Original raw delimiter find does not decode Unicode, merge empty tokens or trim values. @param data - Remaining lexical bytes. @param separator - Nonempty separator. @returns Offset or minus one. */
function findSeparator(data: Uint8Array, separator: Uint8Array): number {
  for (let i = 0; i <= data.length - separator.length; ++i) {
    let j = 0;
    while (j < separator.length && data[i + j] === separator[j]) ++j;
    if (j === separator.length) return i;
  }
  return -1;
}
/** Original complete scalar/list dispatcher; unknown/any/nil types retain native exceptions. @param separator - Owned OString byte projection, empty selects a single ASCII space. @param text - Present native lexical span. @param type - Schema type. @returns Typed actual Any value. */
export function parseValue(separator: Uint8Array, text: Span, type: Type): Any {
  if (type === Type.TYPE_ANY) throw valueError("invalid value of type any");
  if (type >= Type.TYPE_BOOLEAN && type <= Type.TYPE_HEXBINARY)
    return parseSingleValue(text, type as ScalarType);
  if (type < Type.TYPE_BOOLEAN_LIST || type > Type.TYPE_HEXBINARY_LIST)
    throw valueError("this cannot happen");
  const items: Any[] = [],
    sep = separator.length === 0 ? new Uint8Array([32]) : separator;
  try {
    let data = bytes(text);
    if (data.length !== 0)
      for (;;) {
        const index = findSeparator(data, sep),
          length = index === -1 ? data.length : index;
        items.push(parseSingleValue(new Span(data, length), elementType(type) as ScalarType));
        if (index < 0) break;
        data = data.subarray(index + sep.length);
      }
    return sequenceValue(items, type);
  } finally {
    for (const item of items) item.dispose();
  }
}

/** Original private parser states in declaration order. */
enum State {
  Text,
  TextUnicode,
  IT,
  ITUnicode,
}
/** Erases source OUString concatenation for exact diagnostic messages. @param value - Actual string. @returns Exact UTF16 text. */
function text(value: OUStringConstReference): string {
  let out = "";
  for (let i = 0; i < value.getLength(); ++i)
    out += String.fromCharCode(value.getStr()[i] as number);
  return out;
}
/** Original nested value parser, not a replacement schema/configuration provider. */
export class ValueParser {
  public type_ = Type.TYPE_ERROR;
  private separatorValue = new Uint8Array();
  private readonly layer_: number;
  private node_: Node | null = null;
  private readonly localizedName_ = new OUString();
  private state_ = State.Text;
  private readonly pad_ = new Pad();
  private readonly items_: Any[] = [];
  /** Original layer/type/state initialization. @param layer - Signed32 layer. @returns Parser. */
  constructor(layer: number) {
    this.layer_ = layer | 0;
  }
  /** Original owned separator value; native const ownership is a caller contract on a borrowed view. @returns Separator bytes. */
  public get separator_(): Uint8Array {
    return this.separatorValue;
  }
  /** Original OString assignment copies the source value, with no UTF8/normalization policy. @param value - Exact source bytes. @returns Nothing. */
  public set separator_(value: Uint8Array) {
    this.separatorValue = value.slice();
  }
  /** Original private convertItems<T> operation over this parser's item values; explicit schema binding erases only its template argument. @returns Actual typed sequence Any. */
  private convertItems(): Any {
    return sequenceValue(this.items_, this.type_);
  }
  /** Original layer query. @returns Layer. */
  public getLayer(): number {
    return this.layer_;
  }
  /** Original state/type-dependent text reporting; nonempty item sequences suppress inter-item text. @returns Native XML text mode. */
  public getTextMode(): Text {
    if (this.node_ === null) return Text.NONE;
    if (this.state_ === State.Text && this.items_.length !== 0) return Text.NONE;
    if (this.state_ === State.Text || this.state_ === State.IT)
      return this.type_ === Type.TYPE_STRING ||
        this.type_ === Type.TYPE_STRING_LIST ||
        this.separatorValue.length !== 0
        ? Text.Raw
        : Text.Normalized;
    return Text.NONE;
  }

  /** Original start accepts only one active nonnull property; other state fields are intentionally not reset. @param node - Actual ordinary/localized property. @param localizedName - Original empty default. @returns Nothing. */
  public start(node: Node | null, localizedName: OUStringConstReference = new OUString()): void {
    assert(node !== null && this.node_ === null, "node.is() && !node_.is()");
    this.node_ = node;
    this.localizedName_.assign(localizedName);
    this.state_ = State.Text;
  }
  /** Original node-active text append, borrowing source bytes until Pad mutation. @param value - Actual XML span. @returns Nothing. */
  public characters(value: Span): void {
    if (this.node_ !== null) {
      assert(
        this.state_ === State.Text || this.state_ === State.IT,
        "state_ == State::Text || state_ == State::IT",
      );
      this.pad_.add(value.begin as ByteView, value.length);
    }
  }
  /** Original it/unicode transition and scalar whitelist. Namespace indexes come from the actual ParseManager enum. @param reader - Actual XMLReader positioned at begin. @param nsId - Element namespace id. @param name - Borrowed local name. @returns Whether active parser accepted the element. */
  public startElement(reader: XmlReader, nsId: number, name: Span): boolean {
    if (this.node_ === null) return false;
    if (
      this.state_ === State.Text &&
      nsId === XmlReader.NAMESPACE_NONE &&
      name.operatorEquals(new Uint8Array([105, 116, 0])) &&
      isListType(this.type_) &&
      this.separatorValue.length === 0
    ) {
      this.pad_.clear();
      this.state_ = State.IT;
      return true;
    }
    if (
      (this.state_ === State.Text || this.state_ === State.IT) &&
      nsId === XmlReader.NAMESPACE_NONE &&
      name.operatorEquals(new Uint8Array([117, 110, 105, 99, 111, 100, 101, 0])) &&
      (this.type_ === Type.TYPE_STRING || this.type_ === Type.TYPE_STRING_LIST)
    ) {
      let scalar = -1;
      const attrNs: [number] = [0],
        attrName = new Span();
      while (reader.nextAttribute(attrNs, attrName)) {
        if (
          attrNs[0] === NAMESPACE_OOR &&
          attrName.operatorEquals(new Uint8Array([115, 99, 97, 108, 97, 114, 0]))
        ) {
          scalar = parseInt32Value(bytes(reader.getAttributeValue(true)));
          break;
        }
      }
      if (scalar >= 0 && scalar < 32 && scalar !== 9 && scalar !== 10 && scalar !== 13)
        this.pad_.add(new Uint8Array([scalar]), 1);
      else if (scalar === 0xfffe) this.pad_.add(new Uint8Array([0xef, 0xbf, 0xbe]), 3);
      else if (scalar === 0xffff) this.pad_.add(new Uint8Array([0xef, 0xbf, 0xbf]), 3);
      else throw valueError("bad unicode scalar attribute in " + text(reader.getUrl()));
      this.state_ = this.state_ === State.Text ? State.TextUnicode : State.ITUnicode;
      return true;
    }
    const converted = name.convertFromUtf8();
    try {
      throw valueError("bad member <" + text(converted) + "> in " + text(reader.getUrl()));
    } finally {
      converted.dispose();
    }
  }
  /** Original close transition mutates target metadata before parsing; failures retain parser state and any already inserted localized child. @returns Whether a value parser was active. */
  public endElement(): boolean {
    if (this.node_ === null) return false;
    switch (this.state_) {
      case State.Text: {
        let pointer: Any;
        switch (this.node_.kind()) {
          case Node.KIND_PROPERTY:
            pointer = (this.node_ as PropertyNode).getValuePtr(
              this.layer_,
              this.layer_ === Data.NO_LAYER,
            );
            break;
          case Node.KIND_LOCALIZED_PROPERTY: {
            const members = this.node_.getMembers(),
              [entry, inserted] = members.insert({
                first: this.localizedName_,
                second: null,
              });
            let child: LocalizedValueNode;
            if (inserted) {
              child = new LocalizedValueNode(this.layer_);
              entry.second = child;
            } else child = entry.second as LocalizedValueNode;
            pointer = child.getValuePtr(this.layer_, this.layer_ === Data.NO_LAYER);
            break;
          }
          default:
            // Native NDEBUG fallback returns false; the checked compiler binding is fatal.
            assert(false, "false");
        }
        const value =
          this.items_.length === 0
            ? parseValue(this.separatorValue, this.pad_.get(), this.type_)
            : this.convertItems();
        try {
          pointer.assign(value);
        } finally {
          value.dispose();
        }
        if (this.items_.length === 0) this.pad_.clear();
        else {
          for (const item of this.items_) item.dispose();
          this.items_.length = 0;
        }
        this.separatorValue = new Uint8Array();
        this.node_ = null;
        break;
      }
      case State.TextUnicode:
        this.state_ = State.Text;
        break;
      case State.ITUnicode:
        this.state_ = State.IT;
        break;
      case State.IT: {
        const value = parseValue(new Uint8Array(), this.pad_.get(), elementType(this.type_));
        this.items_.push(value);
        this.pad_.clear();
        this.state_ = State.Text;
        break;
      }
    }
    return true;
  }
}
