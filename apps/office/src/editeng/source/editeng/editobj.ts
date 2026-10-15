/** @fileoverview Original XEditAttribute and ContentInfo values from editobj.cxx. Full EditTextObject, portion layout and normalization await their actual owners; no provider facade is supplied. */
import { SfxItemSet, SfxPoolItemHolder } from "../../../svl/inc/itemset";
import { SfxPoolItem } from "../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../svl/inc/itempool";
import { SharedString, type SharedStringConstReference } from "../../../svl/inc/sharedstring";
import { SfxStyleFamily } from "../../../svl/inc/style";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import { EE_PARA_START, EE_CHAR_END, EE_FEATURE_START, EE_FEATURE_END } from "../../inc/eeitem";
import { WrongList, type WrongListConstReference } from "./edtspell";

/** Original character-format value association and independent signed32 span, without native memory-management machinery. */
export class XEditAttribute {
  private readonly maItemHolder: SfxPoolItemHolder;
  private readonly nStart: [number];
  private readonly nEnd: [number];
  /** Original pool/item/span and compiler-generated copy forms. @param args - Native value arguments. @returns Attribute. */
  constructor(
    ...args:
      | [pool: SfxItemPool, item: SfxPoolItem, start: number, end: number]
      | [source: Readonly<XEditAttribute>]
  ) {
    const source = args.length === 1 ? args[0] : undefined;
    this.maItemHolder =
      source === undefined
        ? new SfxPoolItemHolder(args[0] as SfxItemPool, args[1] as SfxPoolItem)
        : new SfxPoolItemHolder(source.GetItemHolder());
    this.nStart = [source === undefined ? (args[2] as number) : source.GetStart()];
    this.nEnd = [source === undefined ? (args[3] as number) : source.GetEnd()];
  }
  /** Original const item pointer. @returns Actual associated value or null after explicit holder assignment. */
  GetItem(): SfxPoolItem | null {
    return this.maItemHolder.getItem();
  }
  /** Original mutable holder reference. @returns Stable pool/value association. */
  GetItemHolder(): SfxPoolItemHolder {
    return this.maItemHolder;
  }
  /** Original const start position. @returns Position. */
  GetStart(): number;
  /** Erased mutable sal_Int32 lvalue. @param mutable - Mutable overload selector. @returns Original scalar cell. */
  GetStart(mutable: true): [number];
  /** Original scalar/reference overload binding. @param mutable - Mutable source selector. @returns Value or stable lvalue. */
  GetStart(mutable?: true): number | [number] {
    return mutable === true ? this.nStart : this.nStart[0];
  }
  /** Original const end position. @returns Position. */
  GetEnd(): number;
  /** Erased mutable sal_Int32 lvalue. @param mutable - Mutable overload selector. @returns Original scalar cell. */
  GetEnd(mutable: true): [number];
  /** Original scalar/reference overload binding. @param mutable - Mutable source selector. @returns Value or stable lvalue. */
  GetEnd(mutable?: true): number | [number] {
    return mutable === true ? this.nEnd : this.nEnd[0];
  }
  /** Original signed subtraction; native producers provide the defined signed32 domain. @returns Span length. */
  GetLen(): number {
    return this.nEnd[0] - this.nStart[0];
  }
  /** Original inclusive feature-Which classification; a present item is the native caller precondition. @returns Feature predicate. */
  IsFeature(): boolean {
    const which = (this.GetItem() as SfxPoolItem).Which();
    return which >= EE_FEATURE_START && which <= EE_FEATURE_END;
  }
  /** Original assignment from a pool-bound value association, preserving span. @param pool - Target pool. @param item - Native const item. @returns Nothing. */
  SetItem(pool: SfxItemPool, item: SfxPoolItem): void {
    this.maItemHolder.assign(new SfxPoolItemHolder(pool, item));
  }
  /** Original span plus concrete item value equality. @param other - Compared attribute. @returns Equality. */
  equals(other: Readonly<XEditAttribute>): boolean {
    return (
      this.nStart[0] === other.GetStart() &&
      this.nEnd[0] === other.GetEnd() &&
      SfxPoolItem.areSame(this.GetItem(), other.GetItem())
    );
  }
}

/** Original internal paragraph value. Friend-only construction is exposed only at the internal editobj2 boundary, not as an EditTextObject factory. */
export class ContentInfo {
  private readonly maText = new SharedString();
  private readonly aStyle = new OUString();
  private readonly maCharAttribs: XEditAttribute[] = [];
  private eFamily = SfxStyleFamily.Para;
  private readonly aParaAttribs: SfxItemSet;
  private mpWrongs: WrongList | null = null;
  /** Original pool and source/target-pool forms. A native producer calls SetText before querying its raw text data. @param args - Native friend constructor form. @returns Paragraph value. */
  constructor(...args: [pool: SfxItemPool] | [source: Readonly<ContentInfo>, pool: SfxItemPool]) {
    const source = args.length === 2 ? (args[0] as ContentInfo) : undefined;
    const pool = source === undefined ? (args[0] as SfxItemPool) : (args[1] as SfxItemPool);
    this.aParaAttribs = new SfxItemSet(pool, [[EE_PARA_START, EE_CHAR_END]]);
    if (source !== undefined) {
      this.maText.assign(source.maText);
      this.aStyle.assign(source.aStyle);
      this.eFamily = source.eFamily;
      this.aParaAttribs.Set(source.aParaAttribs);
      for (const attribute of source.maCharAttribs)
        this.maCharAttribs.push(
          new XEditAttribute(
            pool,
            attribute.GetItem() as SfxPoolItem,
            attribute.GetStart(),
            attribute.GetEnd(),
          ),
        );
      if (source.mpWrongs !== null) this.mpWrongs = source.mpWrongs.Clone();
    }
  }
  /** Original stable const shared-string member reference. @returns Actual member. */
  GetSharedString(): SharedStringConstReference {
    return this.maText;
  }
  /** Original by-value Unicode string. Initialized text data is the native producer precondition. @returns Independent string handle. */
  GetText(): OUString {
    return new OUString(this.maText.getData() as rtl_uString);
  }
  /** Original raw-data length; SetText is a producer precondition. @returns UTF16 unit length. */
  GetTextLen(): number {
    return (this.maText.getData() as rtl_uString).length;
  }
  /** Original shared value assignment retains original data and clears case-normalized data. @param value - Native Unicode string. @returns Nothing. */
  SetText(value: OUStringConstReference): void {
    const copy = new SharedString(value.pData, null);
    this.maText.assign(copy);
    copy.dispose();
  }
  /** Original mutable/const vector access at its internal boundary. @returns Actual character values. */
  GetCharAttribs(): XEditAttribute[] {
    return this.maCharAttribs;
  }
  /** Original stable const style-string member reference. @returns Actual style view. */
  GetStyle(): OUStringConstReference {
    return this.aStyle;
  }
  /** Original style family. @returns Native family. */
  GetFamily(): SfxStyleFamily {
    return this.eFamily;
  }
  /** Original Unicode member assignment retains its reference identity. @param value - New style name. @returns Nothing. */
  SetStyle(value: OUStringConstReference): void {
    this.aStyle.assign(value);
  }
  /** Original direct family assignment. @param value - Native family. @returns Nothing. */
  SetFamily(value: SfxStyleFamily): void {
    this.eFamily = value;
  }
  /** Original mutable/const paragraph set access. @returns Actual fixed-range value set. */
  GetParaAttribs(): SfxItemSet {
    return this.aParaAttribs;
  }
  /** Original borrowed const spell-state pointer. @returns Actual value or null. */
  GetWrongList(): WrongListConstReference | null {
    return this.mpWrongs;
  }
  /** Original adoption of an existing spell-state value; JS GC owns lifetime. @param value - Native state or null. @returns Nothing. */
  SetWrongList(value: WrongList | null): void {
    this.mpWrongs = value;
  }
  /** Original separate spelling comparison, including pointer/null fast paths. @param other - Compared paragraph. @returns Spell-state equality. */
  isWrongListEqual(other: Readonly<ContentInfo>): boolean {
    if (this.mpWrongs === other.GetWrongList()) return true;
    if (this.mpWrongs === null || other.GetWrongList() === null) return false;
    return this.mpWrongs.equals(other.GetWrongList() as WrongListConstReference);
  }
  /** Original text/style/family/set/ordered-character equality deliberately excludes spelling state. @param other - Compared content. @param comparePool - Include pool/parent identity. @returns Payload equality. */
  Equals(other: Readonly<ContentInfo>, comparePool: boolean): boolean {
    return (
      this.maText.equals(other.GetSharedString()) &&
      this.aStyle.equals(other.GetStyle()) &&
      this.eFamily === other.GetFamily() &&
      this.aParaAttribs.Equals(other.GetParaAttribs(), comparePool) &&
      this.maCharAttribs.length === other.GetCharAttribs().length &&
      this.maCharAttribs.every(
        /** Compares corresponding actual native values. @param value - Local attribute. @param index - Native vector index. @returns Equality. */
        (value, index) => value.equals(other.GetCharAttribs()[index] as XEditAttribute),
      )
    );
  }
}
