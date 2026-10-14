/** @fileoverview Original conditional-index and page-scale attribute value families from attrib.hxx/cxx; localization/diagnostics remain separate pending scopes. */
import { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SfxItemPool } from "../../../../svl/source/items/itempool";
import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import { hash_combine } from "../../../../o3tl/inc/hash_combine";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { UnoType } from "../../../../cppu/inc/unotype";
import { ATTR_CONDITIONAL, ATTR_PAGE_SCALETO } from "../../../inc/scitems";
/** Original unsigned index ordering. @param left - First index. @param right - Second index. @returns Less flag. */
function lessIndex(left: number, right: number): boolean {
  return left < right;
}
/** Original typedef binds the actual shared constructor, including its scalar initializer-list form. */
export const ScCondFormatIndexes = (SortedVector<number>).bind(null, lessIndex);
/** Actual native unsigned index vector owner. */
export type ScCondFormatIndexes = InstanceType<typeof ScCondFormatIndexes>;
/** Erased const reference over the same actual vector, with mutators absent at the type boundary. */
export type ScCondFormatIndexesConstReference = Pick<
  ScCondFormatIndexes,
  | "size"
  | "empty"
  | "at"
  | "front"
  | "back"
  | "find"
  | "lower_bound"
  | "upper_bound"
  | typeof Symbol.iterator
>;
/** Original conditional-format index item; copying preserves even initializer-list duplicates. */
export class ScCondFormatItem extends SfxPoolItem {
  private maIndex: ScCondFormatIndexes;
  /** Original default/index/const-vector/implicit-copy forms. @param value - Selected initialized native value. @returns Item. */
  constructor(value?: number | ScCondFormatIndexesConstReference | Readonly<ScCondFormatItem>) {
    super(value instanceof ScCondFormatItem ? value.Which() : ATTR_CONDITIONAL);
    if (typeof value === "number") {
      this.maIndex = new ScCondFormatIndexes();
      this.maIndex.insert(value >>> 0);
    } else if (value instanceof ScCondFormatItem) this.maIndex = SortedVector.copy(value.maIndex);
    else
      this.maIndex =
        value === undefined
          ? new ScCondFormatIndexes()
          : SortedVector.copy(value as ScCondFormatIndexes);
  }
  /** Original index-vector rvalue constructor uses the shared actual vector move. @param indexes - Moved owner. @returns Item over transferred values. */
  public static move(indexes: ScCondFormatIndexes): ScCondFormatItem {
    const result = new ScCondFormatItem();
    result.maIndex = SortedVector.move(indexes);
    return result;
  }
  /** Original stable const reference to the actual index vector. @returns Readonly member view. */
  public GetCondFormatData(): ScCondFormatIndexesConstReference {
    return this.maIndex;
  }
  /** Original same-type value comparison; host cross-type inputs return false outside native assertions. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    if (!(other instanceof ScCondFormatItem)) return false;
    if (this.maIndex.empty() && other.maIndex.empty()) return true;
    if (this.maIndex.size() !== other.maIndex.size()) return false;
    for (let i = 0; i < this.maIndex.size(); i++)
      if (this.maIndex.at(i) !== other.maIndex.at(i)) return false;
    return true;
  }
  /** Original hash support. @returns True. */
  public supportsHashCode(): boolean {
    return true;
  }
  /** Original unsigned-integer hash fold bound to the64bit family; hash values are not persisted ODS data. @returns Unsigned64 logical hash. */
  public hashCode(): bigint {
    const seed: [bigint] = [0n];
    for (const index of this.maIndex) hash_combine(seed, index);
    return seed[0];
  }
  /** Original Clone constructs from the vector, restoring fixed Which154. @param pool - Unused native pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): ScCondFormatItem {
    void pool;
    return new ScCondFormatItem(this.maIndex);
  }
}
/** Original member ID for page width. */
export const SC_MID_PAGE_SCALETO_WIDTH = 1;
/** Original member ID for page height. */
export const SC_MID_PAGE_SCALETO_HEIGHT = 2;
/** Original page-scale dimensions, with public default0,0 distinct from DocPool's explicit1,1. */
export class ScPageScaleToItem extends SfxPoolItem {
  private mnWidth: number;
  private mnHeight: number;
  /** Original default/value/implicit-copy constructors with unsigned16 fields. @param args - Selected native form. @returns Item. */
  constructor(...args: [] | [source: ScPageScaleToItem] | [width: number, height: number]) {
    const source = args.length === 1 ? args[0] : undefined;
    super(source === undefined ? ATTR_PAGE_SCALETO : source.Which());
    if (args.length === 2) {
      this.mnWidth = args[0] & 0xffff;
      this.mnHeight = args[1] & 0xffff;
    } else if (source !== undefined) {
      this.mnWidth = source.mnWidth;
      this.mnHeight = source.mnHeight;
    } else {
      this.mnWidth = 0;
      this.mnHeight = 0;
    }
  }
  /** Original width query. @returns Width. */
  public GetWidth(): number {
    return this.mnWidth;
  }
  /** Original height query. @returns Height. */
  public GetHeight(): number {
    return this.mnHeight;
  }
  /** Original validity requires either dimension. @returns Whether nonzero. */
  public IsValid(): boolean {
    return Boolean(this.mnWidth || this.mnHeight);
  }
  /** Original unsigned16 width assignment. @param width - Native scalar. @returns Nothing. */
  public SetWidth(width: number): void {
    this.mnWidth = width & 0xffff;
  }
  /** Original unsigned16 height assignment. @param height - Native scalar. @returns Nothing. */
  public SetHeight(height: number): void {
    this.mnHeight = height & 0xffff;
  }
  /** Original two-field assignment. @param width - Native width. @param height - Native height. @returns Nothing. */
  public Set(width: number, height: number): void {
    this.SetWidth(width);
    this.SetHeight(height);
  }
  /** Original same-type payload equality. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof ScPageScaleToItem &&
      this.mnWidth === other.mnWidth &&
      this.mnHeight === other.mnHeight
    );
  }
  /** Original implicit-copy Clone retains Which. @param pool - Unused pool. @returns Independent item. */
  public Clone(pool?: SfxItemPool): ScPageScaleToItem {
    void pool;
    return new ScPageScaleToItem(this);
  }
  /** Existing browser scalar query overload. @param member - Unsigned8 member. @returns Dimension or no payload. */
  public override QueryValue(member?: number): number | undefined;
  /** Original native Any output overload. @param output - Actual output Any. @param member - Unsigned8 member. @returns Success. */
  public override QueryValue(output: Any, member?: number): boolean;
  /** Original member selection with unchanged output on failure. @param valueOrMember - Actual Any or browser member. @param member - Native member for Any form. @returns Native success or browser value. */
  public override QueryValue(
    valueOrMember: number | Any = 0,
    member = 0,
  ): boolean | number | undefined {
    const id = (valueOrMember instanceof Any ? member : valueOrMember) & 0xff;
    let value: number;
    switch (id) {
      case SC_MID_PAGE_SCALETO_WIDTH:
        value = this.mnWidth;
        break;
      case SC_MID_PAGE_SCALETO_HEIGHT:
        value = this.mnHeight;
        break;
      default:
        return valueOrMember instanceof Any ? false : undefined;
    }
    if (valueOrMember instanceof Any) {
      valueOrMember.setValue([value], UnoType.get("sal_uInt16"));
      return true;
    }
    return value;
  }
  /** Original Any extraction plus the existing plain unsigned16 scalar browser transport. @param value - Actual Any or scalar. @param member - Native member identifier. @returns Extraction success. */
  public override PutValue(value: unknown, member: number): boolean {
    const id = member & 0xff;
    let result: [number];
    switch (id) {
      case SC_MID_PAGE_SCALETO_WIDTH:
        result = [this.mnWidth];
        break;
      case SC_MID_PAGE_SCALETO_HEIGHT:
        result = [this.mnHeight];
        break;
      default:
        return false;
    }
    if (value instanceof Any) {
      if (!value.extract(result, "sal_uInt16")) return false;
    } else {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 65535)
        return false;
      result[0] = value;
    }
    if (id === SC_MID_PAGE_SCALETO_WIDTH) this.mnWidth = result[0];
    else this.mnHeight = result[0];
    return true;
  }
}
