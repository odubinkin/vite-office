/** @fileoverview Ports consumed OOXMLValue variants, OOXMLProperty/PropertySet resolution and OOXMLTable from pinned OOXMLPropertySet.cxx; native RTL/SAX/unit owners provide lexical conversion. */
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { rtl_math_stringToDouble } from "../../../../sal/inc/rtl/math.h";
import { toUInt32 } from "../../../../o3tl/inc/string_view";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import { Converter } from "../../../../sax/source/tools/converter";
import { COL_AUTO } from "../../../../tools/inc/color";
import type { Id, Properties, Reference, Sprm, Table, Value } from "../inc/dmapper/resourcemodel";

/** Original consumed std::variant alternatives; UTF16 content is immutable host transport until an actual OUString is queried. */
type Variant =
  | { readonly kind: "empty" }
  | { readonly kind: "bool"; readonly value: boolean }
  | { readonly kind: "integer" | "universal" | "percent" | "hex"; readonly value: number }
  | { readonly kind: "string"; readonly value: string }
  | { readonly kind: "properties"; readonly value: OOXMLPropertySet };

/** Binds a native XML byte string to the original o3tl::toDouble UTF8 overload. @param value - XML lexeme. @returns Binary64 prefix value. */
function decimal(value: string): number {
  const bytes = new TextEncoder().encode(value);
  return rtl_math_stringToDouble(bytes, bytes.length, 46, 0, null, null);
}
/** Binds immutable UTF16 text to an actual owned OUString return value. @param value - Text. @returns String. */
function unicode(value: string): OUString {
  return new OUString(
    Uint16Array.from(
      value.split(""),
      /** Reads one UTF16 unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0),
    ),
    value.length,
  );
}
/** Native floating-to-int casts have no defined result outside signed32; do not invent wrap/saturation for that domain. @param value - Rounded/truncated value. @returns Defined signed32 result. */
function definedInt(value: number): number {
  if (!Number.isFinite(value) || value < -2147483648 || value > 2147483647)
    throw new RangeError(
      "OOXML native floating-to-int result is outside its defined signed32 domain.",
    );
  return value === 0 ? 0 : value;
}

/** Original ON/OFF lexical admission, including only the two explicitly accepted initial-capital forms. @param value - XML value. @returns Native boolean. */
export function GetBooleanValue(value: string): boolean {
  return value === "true" || value === "True" || value === "1" || value === "on" || value === "On";
}

/** Variant-backed native value. Unsupported native shape/binary/service alternatives are not constructed. */
export class OOXMLValue implements Value {
  private data: Variant = { kind: "empty" };
  /** Original default/copy constructors preserve property-set reference sharing. @param source - Optional copied value. @returns Value. */
  constructor(source?: OOXMLValue) {
    if (source) this.data = source.data;
  }
  /** Constructs one variant without changing its native alternative. @param data - Alternative. @returns Value. */
  private static from(data: Variant): OOXMLValue {
    const result = new OOXMLValue();
    result.data = data;
    return result;
  }
  /** Original bool and byte-string overloads. @param value - Boolean or XML lexeme. @returns Value. */
  static createBoolean(value: boolean | string): OOXMLValue {
    return OOXMLValue.from({
      kind: "bool",
      value: typeof value === "boolean" ? value : GetBooleanValue(value),
    });
  }
  /** Original declared signed32 factory. @param value - Integer. @returns Value. */
  static createInteger(value: number): OOXMLValue {
    return OOXMLValue.from({ kind: "integer", value: value | 0 });
  }
  /** Original unsigned32/hex-lexeme overloads use the shared native parser. @param value - Packed value or XML text. @returns Value. */
  static createHex(value: number | string): OOXMLValue {
    return OOXMLValue.from({
      kind: "hex",
      value:
        typeof value === "number" ? value >>> 0 : toUInt32(new TextEncoder().encode(value), 16),
    });
  }
  /** Native auto/hash/plain hexadecimal color handling, including invalid-hash fallback. @param value - XML color. @returns Value. */
  static createHexColor(value: string): OOXMLValue {
    let color = COL_AUTO.toInt32() >>> 0;
    if (value !== "auto") {
      color = toUInt32(new TextEncoder().encode(value), 16);
      if (color === 0 && value.length > 1 && value[0] === "#") {
        const out: [number] = [COL_AUTO.toInt32()];
        if (value.length === 7) Converter.convertColor(out, value);
        color = out[0] >>> 0;
      }
    }
    return OOXMLValue.from({ kind: "hex", value: color });
  }
  /** Native universal measure conversion and std::round, including negative ties away from zero. @param value - XML text. @param unitsPerPoint - Original unsigned32 scale. @returns Value. */
  static createUniversalMeasure(value: string, unitsPerPoint: number): OOXMLValue {
    let amount = decimal(value);
    const scale = unitsPerPoint >>> 0;
    if (value.endsWith("pt")) amount *= scale;
    else if (value.endsWith("cm")) amount = convert(amount, Length.cm, Length.pt) * scale;
    else if (value.endsWith("mm")) amount = convert(amount, Length.mm, Length.pt) * scale;
    else if (value.endsWith("in")) amount = convert(amount, Length.in, Length.pt) * scale;
    else if (value.endsWith("pc") || value.endsWith("pi"))
      amount = convert(amount, Length.pc, Length.pt) * scale;
    const rounded = amount < 0 ? -Math.round(-amount) : Math.round(amount);
    return OOXMLValue.from({ kind: "universal", value: definedInt(rounded) });
  }
  /** Original EMU scale. @param value - XML text. @returns Value. */
  static createEmuMeasure(value: string): OOXMLValue {
    return this.createUniversalMeasure(value, 12700);
  }
  /** Original twip scale. @param value - XML text. @returns Value. */
  static createTwipsMeasure(value: string): OOXMLValue {
    return this.createUniversalMeasure(value, 20);
  }
  /** Original half-point scale. @param value - XML text. @returns Value. */
  static createHpsMeasure(value: string): OOXMLValue {
    return this.createUniversalMeasure(value, 2);
  }
  /** Original percent values truncate at fiftieth-percent scale; ordinary measures round through twips. @param value - XML text. @returns Value. */
  static createMeasurementOrPercent(value: string): OOXMLValue {
    const result =
      value.length > 1 && value.endsWith("%")
        ? definedInt(Math.trunc(decimal(value) * 50))
        : this.createTwipsMeasure(value).getInt();
    return OOXMLValue.from({ kind: "percent", value: result });
  }
  /** Copies original UTF16 content by value, independent of the caller's string lifetime. @param value - Native string. @returns Value. */
  static createString(value: OUStringConstReference): OOXMLValue {
    let text = "";
    for (let i = 0; i < value.getLength(); ++i)
      text += String.fromCharCode(value.getStr()[i] as number);
    return OOXMLValue.from({ kind: "string", value: text });
  }
  /** Retains the original shared property-set reference. @param value - Properties. @returns Value. */
  static createPropertySet(value: OOXMLPropertySet): OOXMLValue {
    return OOXMLValue.from({ kind: "properties", value });
  }
  /** Original monostate test. @returns Whether nonempty. */
  hasValue(): boolean {
    return this.data.kind !== "empty";
  }
  /** Native debug precondition is an explicit host error rather than an invented empty-value conversion. @returns Nothing. */
  private requireValue(): void {
    if (!this.hasValue()) throw new Error("this OOXMLValue is empty");
  }
  /** Original integer projection returns zero for nonnumeric alternatives and narrows hexadecimal uint32 to int. @returns Signed32. */
  getInt(): number {
    this.requireValue();
    switch (this.data.kind) {
      case "bool":
        return this.data.value ? 1 : 0;
      case "integer":
      case "universal":
      case "percent":
      case "hex":
        return this.data.value | 0;
      default:
        return 0;
    }
  }
  /** Original by-value native string projection. @returns String or empty string. */
  getString(): OUString {
    this.requireValue();
    return unicode(this.data.kind === "string" ? this.data.value : "");
  }
  /** Only native bool/int/string alternatives produce Any in the consumed variant slice; measures/hex/properties remain void. @returns Any value. */
  getAny(): Any {
    this.requireValue();
    if (this.data.kind === "bool") return new Any([this.data.value], "bool");
    if (this.data.kind === "integer") return new Any([this.data.value], "sal_Int32");
    if (this.data.kind === "string") {
      const text = this.getString();
      try {
        return new Any([text.pData], "OUString");
      } finally {
        text.dispose();
      }
    }
    return new Any();
  }
  /** Original reference projection returns null for other variants. @returns Property set or null. */
  getProperties(): OOXMLPropertySet | null {
    this.requireValue();
    return this.data.kind === "properties" ? this.data.value : null;
  }
  /** Original value copy retains referenced property-set identity. @returns Clone. */
  clone(): OOXMLValue {
    return new OOXMLValue(this);
  }
}

/** Native property discriminant. */
export enum OOXMLPropertyType {
  SPRM = 0,
  ATTRIBUTE = 1,
}
/** One native property keeps its copied value and distinguishes attribute delivery from nested modifiers. */
export class OOXMLProperty implements Sprm {
  private readonly value: OOXMLValue;
  private readonly id: Id;
  /** Copies the original value. @param id - Generated ID. @param value - Value. @param type - Native kind. @returns Property. */
  constructor(
    id: Id,
    value: OOXMLValue,
    private readonly type: OOXMLPropertyType,
  ) {
    this.id = id >>> 0;
    this.value = value.clone();
  }
  /** Original ID. @returns ID. */ getId(): Id {
    return this.id;
  }
  /** Original nullable value access. @returns Value or null. */ getValue(): OOXMLValue | null {
    return this.value.hasValue() ? this.value : null;
  }
  /** Original nullable nested properties. @returns Properties or null. */ getProps(): OOXMLPropertySet | null {
    return this.value.hasValue() ? this.value.getProperties() : null;
  }
  /** Original modifier ID-zero guard and attribute delivery. @param receiver - Handler. @returns Nothing. */
  resolve(receiver: Properties): void {
    if (this.type === OOXMLPropertyType.SPRM) {
      if (this.id !== 0) receiver.sprm(this);
    } else if (this.type === OOXMLPropertyType.ATTRIBUTE) {
      if (!this.value.hasValue())
        throw new Error(
          "OOXML attribute value is empty; native dereference has no defined result.",
        );
      receiver.attribute(this.id, this.value);
    }
  }
}

/** Ordered native property references; duplicate IDs and shared cloned references are intentional. */
export class OOXMLPropertySet implements Reference<Properties> {
  private readonly properties: OOXMLProperty[];
  /** Original empty/copy vector construction. @param source - Optional copied set. @returns Set. */
  constructor(source?: OOXMLPropertySet) {
    this.properties = source ? [...source.properties] : [];
  }
  /** Adds a native ID/value/type property. @param id - ID. @param value - Value. @param type - Native discriminant. @returns Nothing. */
  add(id: Id, value: OOXMLValue, type: OOXMLPropertyType): void;
  /** Appends shared references from another set. @param source - Set or null. @returns Nothing. */
  add(source: OOXMLPropertySet | null): void;
  /** Implements native vector append without deduplication. @param first - Set or ID. @param value - Value. @param type - Native kind. @returns Nothing. */
  add(first: Id | OOXMLPropertySet | null, value?: OOXMLValue, type?: OOXMLPropertyType): void {
    if (typeof first === "number") {
      if (first >>> 0 !== 0)
        this.properties.push(
          new OOXMLProperty(first, value as OOXMLValue, type as OOXMLPropertyType),
        );
    } else if (first) {
      const count = first.properties.length;
      for (let i = 0; i < count; ++i) this.properties.push(first.properties[i] as OOXMLProperty);
    }
  }
  /** Removes all original matching properties. @param id - ID. @returns Nothing. */
  erase(id: Id): void {
    for (let i = this.properties.length - 1; i >= 0; --i)
      if ((this.properties[i] as OOXMLProperty).getId() === id >>> 0) this.properties.splice(i, 1);
  }
  /** Uses the original dynamic-size loop, so a callback may append properties during resolution. @param receiver - Handler. @returns Nothing. */
  resolve(receiver: Properties): void {
    for (let i = 0; i < this.properties.length; ++i) {
      const property = this.properties[i] as OOXMLProperty;
      property.resolve(receiver);
    }
  }
  /** Native begin/end range binds directly to a host iterator. @returns Iterator. */
  [Symbol.iterator](): Iterator<OOXMLProperty> {
    return this.properties[Symbol.iterator]();
  }
  /** Original copied vector shares the native property objects. @returns Clone. */ clone(): OOXMLPropertySet {
    return new OOXMLPropertySet(this);
  }
}

/** Original value table retains positions of non-property values even though no entry callback is emitted for them. */
export class OOXMLTable implements Reference<Table> {
  private readonly values: OOXMLValue[];
  /** Original empty/copy construction. @param source - Optional table. @returns Table. */
  constructor(source?: OOXMLTable) {
    this.values = source
      ? source.values.map(
          /** Copies one value. @param value - Value. @returns Copy. */ (value) => value.clone(),
        )
      : [];
  }
  /** Original ignores empty values and copies admitted ones. @param value - Value. @returns Nothing. */
  add(value: OOXMLValue): void {
    if (value.hasValue()) this.values.push(value.clone());
  }
  /** Resolves property-set values at their actual original positions. @param receiver - Receiver. @returns Nothing. */
  resolve(receiver: Table): void {
    for (let i = 0; i < this.values.length; ++i) {
      const properties = (this.values[i] as OOXMLValue).getProperties();
      if (properties) receiver.entry(i, properties);
    }
  }
  /** Native copied value table. @returns Clone. */ clone(): OOXMLTable {
    return new OOXMLTable(this);
  }
}
