/** @fileoverview Original field data, pooled item and locale-independent URL/page/table values from flditem.cxx. UNO field factory/date-time formatting and diagnostic XML await their actual owners; no fake provider or native lifetime manager is supplied. */
import { SfxPoolItem } from "../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../svl/inc/itempool";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_ustr_hashCode_WithLength } from "../../../sal/inc/rtl/ustring.h";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import * as FieldType from "../../../offapi/com/sun/star/text/textfield/Type";
/** Original const field reference, borrowing the real polymorphic value with no wrapper/ownership protocol. */
export type SvxFieldDataConstReference = Readonly<Omit<SvxFieldData, "assign">>;
/** Original empty base value and virtual field contract; native type-index numeric hash is runtime opaque, not document bytes. */
export class SvxFieldData {
  static readonly CLASS_ID: number = FieldType.UNSPECIFIED;
  /** Original default/implicit-copy constructor; the base carries no stored fields. @param source - Optional actual copied field. @returns Base value. */
  constructor(source?: SvxFieldDataConstReference) {
    void source;
  }
  /** Original base class ID, independent of subclass reflection. @returns UNSPECIFIED. */
  GetClassId(): number {
    return SvxFieldData.CLASS_ID;
  }
  /** Original implicit base assignment copies no state. @param source - Native base reference. @returns This value. */
  assign(source: SvxFieldDataConstReference): this {
    void source;
    return this;
  }
  /** Original base virtual Clone creates a genuine empty base rather than inventing polymorphic state. @returns Independent base value. */
  Clone(): SvxFieldData | null {
    return new SvxFieldData();
  }
  /** Original release base comparison always succeeds; native debug-only different-type diagnosis is not a value restriction. @param other - Actual field value. @returns True. */
  equals(other: SvxFieldDataConstReference): boolean {
    void other;
    return true;
  }
  /** Original opaque dynamic-type hash contract, bound to JS class reflection and existing SAL UTF16 hashing. Native std::type_index numeric bits vary per executable/runtime and are deliberately not reproduced. @returns Unsigned64 opaque hash. */
  hashCode(): bigint {
    const name = this.constructor.name,
      units = Uint16Array.from(
        { length: name.length },
        /** Reads one reflected class-name code unit, without an identity/ownership registry. @param _ - Unused value. @param index - Unit index. @returns Unit. */ (
          _,
          index,
        ) => name.charCodeAt(index),
      );
    return BigInt.asUintN(64, BigInt(rtl_ustr_hashCode_WithLength(units, units.length)));
  }
}
/** Original field item owns a logical field value. GC replaces unique_ptr lifetime; the true overload selector only distinguishes reference-copy from explicit reference adoption. */
export class SvxFieldItem extends SfxPoolItem {
  private readonly mpField: SvxFieldData | null;
  /** Original const-field, unique_ptr and implicit-copy forms. No memory owner object is emulated. @param args - Selected original form; adopt=true erases unique_ptr constructor syntax. @returns Item. */
  constructor(
    ...args:
      | [field: SvxFieldDataConstReference, which: number]
      | [field: SvxFieldData | null, which: number, adopt: true]
      | [source: Readonly<SvxFieldItem>]
  ) {
    super(args.length === 1 ? args[0].Which() : args[1]);
    if (args.length === 1) {
      const field = args[0].GetField();
      this.mpField = field === null ? null : field.Clone();
    } else if (args.length === 3) this.mpField = args[0];
    else this.mpField = args[0].Clone();
  }
  /** Original stable borrowed const field pointer. @returns Actual field or null. */
  GetField(): SvxFieldDataConstReference | null {
    return this.mpField;
  }
  /** Original concrete polymorphic field copy. @param pool - Unused native pool. @returns Independent item. */
  override Clone(pool?: SfxItemPool): SvxFieldItem {
    void pool;
    return new SvxFieldItem(this);
  }
  /** Original pointer/null/dynamic-type/value comparison; Which participates only in areSame. @param other - Actual pooled item. @returns Payload equality. */
  override equals(other: SfxPoolItem): boolean {
    if (!(other instanceof SvxFieldItem)) return false;
    const field = other.mpField;
    if (this.mpField === field) return true;
    if (this.mpField === null || field === null) return false;
    return this.mpField.constructor === field.constructor && this.mpField.equals(field);
  }
  /** Original explicit hash support. @returns True. */
  supportsHashCode(): boolean {
    return true;
  }
  /** Original field hash delegation and null0. @returns Hash. */
  hashCode(): bigint {
    return this.mpField === null ? 0n : this.mpField.hashCode();
  }
}
/** Original stored URL presentation selector, not URL validation or an I/O action. */
export enum SvxURLFormat {
  AppDefault = 0,
  Url = 1,
  Repr = 2,
}
/** Original const URL field view. */
export type SvxURLFieldConstReference = Readonly<Omit<SvxURLField, `Set${string}` | "assign">>;
/** Original complete URL field value, including copied Name omitted by native equality/hash. */
export class SvxURLField extends SvxFieldData {
  static override readonly CLASS_ID: number = FieldType.URL;
  private eFormat = SvxURLFormat.Url;
  private readonly aURL = new OUString();
  private readonly aRepresentation = new OUString();
  private readonly aTargetFrame = new OUString();
  private readonly m_Name = new OUString();
  /** Original default/value/implicit-copy forms; rvalue syntax is erased without resetting input strings. @param args - Native form. @returns URL field. */
  constructor(
    ...args:
      | []
      | [source: SvxURLFieldConstReference]
      | [url: OUStringConstReference, representation: OUStringConstReference, format?: SvxURLFormat]
  ) {
    super();
    if (args.length === 1) SvxURLField.prototype.assign.call(this, args[0]);
    else if (args.length >= 2) {
      this.aURL.assign(args[0] as OUStringConstReference);
      this.aRepresentation.assign(args[1] as OUStringConstReference);
      this.eFormat = (args[2] ?? SvxURLFormat.Url) | 0;
    }
  }
  /** Original URL field class ID. @returns URL. */
  override GetClassId(): number {
    return SvxURLField.CLASS_ID;
  }
  /** Original generated fieldwise assignment, retaining Unicode member identities. @param source - Native URL value. @returns This value. */
  override assign(source: SvxURLFieldConstReference): this {
    this.eFormat = source.GetFormat();
    this.aURL.assign(source.GetURL());
    this.aRepresentation.assign(source.GetRepresentation());
    this.aTargetFrame.assign(source.GetTargetFrame());
    this.m_Name.assign(source.GetName());
    return this;
  }
  /** Original URL const member reference. @returns Stable view. */
  GetURL(): OUStringConstReference {
    return this.aURL;
  }
  /** Original Unicode member assignment. @param value - URL value. @returns Nothing. */
  SetURL(value: OUStringConstReference): void {
    this.aURL.assign(value);
  }
  /** Original representation const member reference. @returns Stable view. */
  GetRepresentation(): OUStringConstReference {
    return this.aRepresentation;
  }
  /** Original representation assignment. @param value - Display value. @returns Nothing. */
  SetRepresentation(value: OUStringConstReference): void {
    this.aRepresentation.assign(value);
  }
  /** Original Name const member reference. @returns Stable view. */
  GetName(): OUStringConstReference {
    return this.m_Name;
  }
  /** Original Name assignment. @param value - Alternative text. @returns Nothing. */
  SetName(value: OUStringConstReference): void {
    this.m_Name.assign(value);
  }
  /** Original target-frame const member reference. @returns Stable view. */
  GetTargetFrame(): OUStringConstReference {
    return this.aTargetFrame;
  }
  /** Original target-frame assignment. @param value - Target. @returns Nothing. */
  SetTargetFrame(value: OUStringConstReference): void {
    this.aTargetFrame.assign(value);
  }
  /** Original selector getter. @returns Stored value. */
  GetFormat(): SvxURLFormat {
    return this.eFormat;
  }
  /** Original enum assignment; no range restriction beyond the declared integer domain. @param value - Selector. @returns Nothing. */
  SetFormat(value: SvxURLFormat): void {
    this.eFormat = value | 0;
  }
  /** Original complete concrete copy, including Name. @returns Independent URL field. */
  override Clone(): SvxURLField {
    return new SvxURLField(this);
  }
  /** Original exact dynamic-type and format/URL/representation/target comparison; Name does not participate. @param other - Native field. @returns Equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    if (other.constructor !== this.constructor) return false;
    const field = other as SvxURLFieldConstReference;
    return (
      this.eFormat === field.GetFormat() &&
      this.aURL.equals(field.GetURL()) &&
      this.aRepresentation.equals(field.GetRepresentation()) &&
      this.aTargetFrame.equals(field.GetTargetFrame())
    );
  }
  /** Original combine order and Name omission; uses actual shared Unicode hashes, independent of the opaque base type hash. @returns Unsigned64 hash. */
  override hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.eFormat);
    hash_combine(seed, this.aURL.hashCode());
    hash_combine(seed, this.aRepresentation.hashCode());
    hash_combine(seed, this.aTargetFrame.hashCode());
    return seed[0];
  }
}

/** Original stateless PAGE field value; display evaluation belongs to the actual text engine. */
export class SvxPageField extends SvxFieldData {
  /** Original native field ID. @returns Field ID. */
  override GetClassId(): number {
    return FieldType.PAGE;
  }
  /** Original empty concrete copy. @returns Field. */
  override Clone(): SvxPageField {
    return new SvxPageField();
  }
  /** Original dynamic-cast type comparison. @param other - Native field. @returns Type equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    return other instanceof SvxPageField;
  }
}

/** Original stateless PAGES field value; display evaluation belongs to the actual text engine. */
export class SvxPagesField extends SvxFieldData {
  static override readonly CLASS_ID: number = FieldType.PAGES;
  /** Original native field ID. @returns Field ID. */
  override GetClassId(): number {
    return SvxPagesField.CLASS_ID;
  }
  /** Original empty concrete copy. @returns Field. */
  override Clone(): SvxPagesField {
    return new SvxPagesField();
  }
  /** Original dynamic-cast type comparison. @param other - Native field. @returns Type equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    return other instanceof SvxPagesField;
  }
}

/** Original stateless PAGE_NAME field value; display evaluation belongs to the actual text engine. */
export class SvxPageTitleField extends SvxFieldData {
  static override readonly CLASS_ID: number = FieldType.PAGE_NAME;
  /** Original native field ID. @returns Field ID. */
  override GetClassId(): number {
    return SvxPageTitleField.CLASS_ID;
  }
  /** Original empty concrete copy. @returns Field. */
  override Clone(): SvxPageTitleField {
    return new SvxPageTitleField();
  }
  /** Original dynamic-cast type comparison. @param other - Native field. @returns Type equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    return other instanceof SvxPageTitleField;
  }
}

/** Original stateless TIME field value; display evaluation belongs to the actual text engine. */
export class SvxTimeField extends SvxFieldData {
  static override readonly CLASS_ID: number = FieldType.TIME;
  /** Original native field ID. @returns Field ID. */
  override GetClassId(): number {
    return SvxTimeField.CLASS_ID;
  }
  /** Original empty concrete copy. @returns Field. */
  override Clone(): SvxTimeField {
    return new SvxTimeField();
  }
  /** Original dynamic-cast type comparison. @param other - Native field. @returns Type equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    return other instanceof SvxTimeField;
  }
}

/** Original stateless DOCINFO_TITLE field value; display evaluation belongs to the actual text engine. */
export class SvxFileField extends SvxFieldData {
  static override readonly CLASS_ID: number = FieldType.DOCINFO_TITLE;
  /** Original native field ID. @returns Field ID. */
  override GetClassId(): number {
    return SvxFileField.CLASS_ID;
  }
  /** Original empty concrete copy. @returns Field. */
  override Clone(): SvxFileField {
    return new SvxFileField();
  }
  /** Original dynamic-cast type comparison. @param other - Native field. @returns Type equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    return other instanceof SvxFileField;
  }
}

/** Original sheet/table field value; its inherited opaque hash intentionally hashes only its dynamic type. */
export class SvxTableField extends SvxFieldData {
  static override readonly CLASS_ID: number = FieldType.TABLE;
  private mnTab: number;
  /** Original default/int/implicit-copy forms. @param source - Native table index or copied value. @returns Field. */
  constructor(source: number | Readonly<SvxTableField> = 0) {
    super();
    this.mnTab = typeof source === "number" ? source | 0 : source.GetTab();
  }
  /** Original native field ID. @returns TABLE. */
  override GetClassId(): number {
    return SvxTableField.CLASS_ID;
  }
  /** Original generated int value copy assignment. @param source - Copied field. @returns This field. */
  override assign(source: Readonly<SvxTableField>): this {
    this.mnTab = source.GetTab();
    return this;
  }
  /** Original integer assignment. @param index - Sheet/table index. @returns Nothing. */
  SetTab(index: number): void {
    this.mnTab = index | 0;
  }
  /** Original stored integer. @returns Index. */
  GetTab(): number {
    return this.mnTab;
  }
  /** Original field value clone. @returns Concrete copied field. */
  override Clone(): SvxTableField {
    return new SvxTableField(this.mnTab);
  }
  /** Original type gate then index comparison. @param other - Native field. @returns Equality. */
  override equals(other: SvxFieldDataConstReference): boolean {
    return other instanceof SvxTableField && this.mnTab === other.GetTab();
  }
}
