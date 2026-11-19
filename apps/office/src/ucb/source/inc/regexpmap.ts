/** @fileoverview Original RegexpMap template, three ordered vectors/default entry and cached iterator projection. VM arrays lower vector storage; native iterator invalidation/physical ABI remain unqualified. */
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Regexp, Kind } from "./regexp";
/** Actual declared Val copy/destruction operations supplied after C++ template erasure, without a value or provider factory. */
export interface RegexpMapValue<Val> {
  copy(value: Val): Val;
  destroy(value: Val): void;
}
/** Original iterator projection owns its canonical pattern but borrows the map's value pointer. */
export class RegexpMapEntry<Val> {
  /** Original value constructor; regexp ownership is transferred. @param m_aRegexp - Owned canonical pattern. @param m_pValue - Borrowed value pointer. @returns Projection. */
  constructor(
    private readonly m_aRegexp: OUString,
    private m_pValue: Val | null,
  ) {}
  /** Original copy constructor copies the string and value pointer. @returns Owned projection copy. */
  copy(): RegexpMapEntry<Val> {
    return new RegexpMapEntry(new OUString(this.m_aRegexp), this.m_pValue);
  }
  /** Original implicit copy assignment. @param other - Existing projection. @returns This projection. */
  assign(other: RegexpMapEntry<Val>): this {
    if (this !== other) {
      this.m_aRegexp.assign(other.m_aRegexp);
      this.m_pValue = other.m_pValue;
    }
    return this;
  }
  /** Original implicit move assignment keeps the member address stable and moves its string value. @param other - Temporary projection. @returns This projection. */
  moveAssign(other: RegexpMapEntry<Val>): this {
    this.m_aRegexp.moveAssign(other.m_aRegexp);
    this.m_pValue = other.m_pValue;
    return this;
  }
  /** Original string-member destruction; the mapped value is borrowed. @returns Nothing. */
  dispose(): void {
    this.m_aRegexp.dispose();
  }
  /** Original const canonical key reference. @returns Borrowed string. */
  getRegexp(): OUStringConstReference {
    return this.m_aRegexp;
  }
  /** Original const/nonconst value dereference; valid iterator is the producer precondition. @returns Borrowed mapped value. */
  getValue(): Val {
    return this.m_pValue as Val;
  }
}
/** Original owning regexp/value pair. */
class Entry<Val> {
  /** Original moved constructor inputs. @param m_aRegexp - Owned parsed expression. @param m_aValue - Copied value. @returns Entry. */
  constructor(
    readonly m_aRegexp: Regexp,
    readonly m_aValue: Val,
  ) {}
  /** Original reverse member destruction with declared Val operations. @param value - Compile-time Val operations. @returns Nothing. */
  dispose(value: RegexpMapValue<Val>): void {
    value.destroy(this.m_aValue);
    this.m_aRegexp.dispose();
  }
}
/** Original const iterator, including default, begin/end, indexed and copy constructors. */
export class RegexpMapConstIter<Val> {
  private readonly m_aEntry = new RegexpMapEntry<Val>(new OUString(), null);
  private m_aIndex = 0;
  private m_pMap: RegexpMap<Val> | null = null;
  private m_nList = -1;
  private m_bEntrySet = false;
  /** Original erased constructor overloads. @param args - Original map/begin, map/list/index or iterator value. @returns Iterator. */
  constructor(
    ...args:
      | []
      | [map: RegexpMap<Val>, begin: boolean]
      | [map: RegexpMap<Val>, list: number, index: number]
      | [other: RegexpMapConstIter<Val>]
  ) {
    if (args.length === 1) {
      const other = args[0];
      this.m_aEntry.assign(other.m_aEntry);
      this.m_pMap = other.m_pMap;
      this.m_nList = other.m_nList;
      this.m_bEntrySet = other.m_bEntrySet;
      if (this.m_nList !== -1) this.m_aIndex = other.m_aIndex;
    } else if (args.length === 2 || args.length === 3) {
      const map = args[0];
      this.m_pMap = map;
      if (args.length === 3) {
        this.m_nList = args[1];
        this.m_aIndex = args[2];
      } else if (args[1]) {
        if (!map["m_pDefault"]) this.increment();
      } else {
        this.m_nList = Kind.KIND_DOMAIN;
        this.m_aIndex = map["m_aList"][Kind.KIND_DOMAIN].length;
      }
    }
  }
  /** Original iterator-member destructor. @returns Nothing. */
  dispose(): void {
    this.m_aEntry.dispose();
  }
  /** Original iterator assignment preserves cached projection and source cursor. @param other - Existing iterator. @returns This iterator. */
  assign(other: RegexpMapConstIter<Val>): this {
    if (this !== other) {
      this.m_aEntry.assign(other.m_aEntry);
      this.m_pMap = other.m_pMap;
      this.m_nList = other.m_nList;
      this.m_bEntrySet = other.m_bEntrySet;
      this.m_aIndex = this.m_nList === -1 ? 0 : other.m_aIndex;
    }
    return this;
  }
  /** Original preincrement visits default then prefix/authority/domain vectors; incrementing end stays at end. @returns This iterator. */
  increment(): this {
    const map = this.m_pMap as RegexpMap<Val>;
    if (
      this.m_nList === Kind.KIND_DOMAIN &&
      this.m_aIndex === (map["m_aList"][this.m_nList] as Entry<Val>[]).length
    )
      return this;
    if (this.m_nList !== -1) {
      ++this.m_aIndex;
      if (
        this.m_nList === Kind.KIND_DOMAIN ||
        this.m_aIndex !== (map["m_aList"][this.m_nList] as Entry<Val>[]).length
      ) {
        this.m_bEntrySet = false;
        return this;
      }
    }
    do {
      ++this.m_nList;
      this.m_aIndex = 0;
    } while (
      this.m_nList < Kind.KIND_DOMAIN &&
      (map["m_aList"][this.m_nList] as Entry<Val>[]).length === 0
    );
    this.m_bEntrySet = false;
    return this;
  }
  /** Original lazy canonical-pattern/value projection, cached until increment or assignment. @returns Borrowed projection. */
  protected get(): RegexpMapEntry<Val> {
    if (!this.m_bEntrySet) {
      const map = this.m_pMap as RegexpMap<Val>,
        entry = (
          this.m_nList === -1
            ? map["m_pDefault"]
            : (map["m_aList"][this.m_nList] as Entry<Val>[])[this.m_aIndex]
        ) as Entry<Val>;
      const temporary = new RegexpMapEntry(entry.m_aRegexp.getRegexp(), entry.m_aValue);
      try {
        this.m_aEntry.moveAssign(temporary);
      } finally {
        temporary.dispose();
      }
      this.m_bEntrySet = true;
    }
    return this.m_aEntry;
  }
  /** Original const arrow dereference. @returns Borrowed cached entry. */
  operatorArrow(): RegexpMapEntry<Val> {
    return this.get();
  }
  /** Original equality compares map/list and, outside default position, vector iterator. @param other - Compared cursor. @returns Equality. */
  equals(other: RegexpMapConstIter<Val>): boolean {
    return (
      this.m_pMap === other.m_pMap &&
      this.m_nList === other.m_nList &&
      (this.m_nList === -1 || this.m_aIndex === other.m_aIndex)
    );
  }
}
/** Original mutable iterator derives from the const iterator and changes arrow constness alone. */
export class RegexpMapIter<Val> extends RegexpMapConstIter<Val> {
  /** Original nonconst arrow overload. @returns Borrowed mutable entry. */
  override operatorArrow(): RegexpMapEntry<Val> {
    return this.get();
  }
}
/** Original ordered regexp-to-value container; value operations are the explicit erased Val specialization. */
export class RegexpMap<Val> {
  private readonly m_aList: [Entry<Val>[], Entry<Val>[], Entry<Val>[]] = [[], [], []];
  private m_pDefault: Entry<Val> | null = null;
  /** Compiler binding of Val's original copy/destruction, without introducing a value/default provider. @param value - Declared Val operations. @returns Empty map. */
  constructor(private readonly value: RegexpMapValue<Val>) {}
  /** Original default entry then reverse array/vector member destruction. @returns Nothing. */
  dispose(): void {
    this.m_pDefault?.dispose(this.value);
    for (let list = Kind.KIND_DOMAIN; list >= Kind.KIND_PREFIX; --list)
      for (let index = this.m_aList[list].length - 1; index >= 0; --index)
        this.m_aList[list][index]?.dispose(this.value);
  }
  /** Original duplicate-preserving insertion, with parsed-pattern equality and a separate default. @param key - Native pattern. @param value - Borrowed source value. @returns Nothing. */
  add(key: OUStringConstReference, value: Val): void {
    const regexp = Regexp.parse(key);
    let retained = false;
    try {
      if (regexp.isDefault()) {
        if (this.m_pDefault) return;
        this.m_pDefault = new Entry(regexp, this.value.copy(value));
      } else {
        const list = this.m_aList[regexp.getKind()] as Entry<Val>[];
        for (const entry of list) if (entry.m_aRegexp.equals(regexp)) return;
        list.push(new Entry(regexp, this.value.copy(value)));
      }
      retained = true;
    } finally {
      if (!retained) regexp.dispose();
    }
  }
  /** Original exact parsed-pattern lookup, distinct from URL matching. @param key - Pattern key. @returns Owned iterator. */
  find(key: OUStringConstReference): RegexpMapIter<Val> {
    const regexp = Regexp.parse(key);
    try {
      if (regexp.isDefault()) {
        if (this.m_pDefault) return new RegexpMapIter(this, true);
      } else {
        const list = this.m_aList[regexp.getKind()] as Entry<Val>[];
        for (let index = 0; index < list.length; ++index)
          if ((list[index] as Entry<Val>).m_aRegexp.equals(regexp))
            return new RegexpMapIter(this, regexp.getKind(), index);
      }
      return new RegexpMapIter(this, false);
    } finally {
      regexp.dispose();
    }
  }
  /** Original friend iterator erase; foreign-map cursors are ignored in the release profile. @param position - Valid existing position. @returns Nothing. */
  erase(position: RegexpMapIter<Val>): void {
    if (position["m_pMap"] === this) {
      if (position["m_nList"] === -1) {
        this.m_pDefault?.dispose(this.value);
        this.m_pDefault = null;
      } else {
        const list = this.m_aList[position["m_nList"]] as Entry<Val>[],
          entry = list[position["m_aIndex"]] as Entry<Val>;
        entry.dispose(this.value);
        list.splice(position["m_aIndex"], 1);
      }
    }
  }
  /** Original mutable begin. @returns Owned iterator. */
  begin(): RegexpMapIter<Val> {
    return new RegexpMapIter(this, true);
  }
  /** Original const begin overload after constness erasure. @returns Owned iterator. */
  cbegin(): RegexpMapConstIter<Val> {
    return new RegexpMapConstIter(this, true);
  }
  /** Original mutable end. @returns Owned iterator. */
  end(): RegexpMapIter<Val> {
    return new RegexpMapIter(this, false);
  }
  /** Original const end overload after constness erasure. @returns Owned iterator. */
  cend(): RegexpMapConstIter<Val> {
    return new RegexpMapConstIter(this, false);
  }
  /** Original default plus three vector lengths. @returns Unsigned32 count. */
  size(): number {
    return (
      ((this.m_pDefault ? 1 : 0) +
        this.m_aList[0].length +
        this.m_aList[1].length +
        this.m_aList[2].length) >>>
      0
    );
  }
  /** Original domain/authority/prefix precedence, stable insertion order, then default. @param url - Borrowed counted candidate. @returns Borrowed mapped value or null. */
  map(url: OUStringConstReference): Val | null {
    for (let kind = Kind.KIND_DOMAIN; kind >= Kind.KIND_PREFIX; --kind)
      for (const item of this.m_aList[kind]) if (item.m_aRegexp.matches(url)) return item.m_aValue;
    if (this.m_pDefault && this.m_pDefault.m_aRegexp.matches(url)) return this.m_pDefault.m_aValue;
    return null;
  }
}
