/** @fileoverview Original SvxTabStopItem sorted value and typed property contracts from paraitem.cxx; translated presentation and diagnostic XML remain deferred. */
import { SfxPoolItem, CONVERT_TWIPS } from "../../../svl/inc/poolitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { SortedVector } from "../../../o3tl/inc/sorted_vector";
import { hash_combine } from "../../../o3tl/inc/hash_combine";
import { convertTwipToMm100 } from "../../../tools/inc/UnitConversion";
import { toTwips, Length } from "../../../o3tl/inc/unit_conversion";
import { SvxTabStop, type SvxTabStopConstReference } from "./paraitem";
import { SvxTabAdjust } from "../../inc/svxenum";
import { MID_TABSTOPS, MID_STD_TAB, MID_TABSTOP_DEFAULT_DISTANCE } from "../../inc/memberids";
import {
  TabAlign,
  cppu_detail_getUnoType_TabAlign as alignType,
} from "../../../offapi/com/sun/star/style/TabAlign";
import { cppu_detail_getUnoType_TabStop as stopType } from "../../../offapi/com/sun/star/style/TabStop";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../cppu/inc/uno/sequence2";
import type { UnoTypeArgument } from "../../../cppu/inc/unotype";
import { OUString } from "../../../sal/inc/rtl/ustring";
/** Original default stop count. */
export const SVX_TAB_DEFCOUNT = 10;
/** Original two-centimeter distance in twips. */
export const SVX_TAB_DEFDIST = 1134;
/** Original unsigned16 not-found sentinel. */
export const SVX_TAB_NOTFOUND = 65535;
/** Original declared compound fields at the shared type's member offsets. */
type StopAddress = { get(offset: 0 | 4 | 8 | 10): [number] };
/** Original compiler-emitted Sequence<TabStop> binding, sharing the existing value/type owners. */
const Stops = Sequence.specialize<StopAddress>(stopType, 12);
/** Original Sequence<Sequence<Any>> binding; inner logical addresses remain borrowed. */
const Rows = Sequence.specialize<[uno_Sequence]>(["Sequence", "Any"], 8);
/** Original full tab-list value, with independent default spacing. */
export class SvxTabStopItem extends SfxPoolItem {
  private readonly maTabStops = new SortedVector<SvxTabStop>(
    /** Original position-only strict order. @param left - First value. @param right - Second value. @returns Order. */
    (left, right) => left.lessThan(right),
  );
  private mnDefaultDistance = 0;
  /** Original Which/counted/copy forms. Numeric inputs use the checked declared unsigned16 host domain. @param args - Native form. @returns Item. */
  constructor(
    ...args:
      | [which: number]
      | [count: number, distance: number, adjustment: SvxTabAdjust, which: number]
      | [source: Readonly<SvxTabStopItem>]
  ) {
    const source = typeof args[0] === "object" ? (args[0] as SvxTabStopItem) : undefined;
    super(
      source === undefined ? (args.length === 4 ? args[3] : (args[0] as number)) : source.Which(),
    );
    if (source !== undefined) {
      this.mnDefaultDistance = source.mnDefaultDistance;
      for (const stop of source.maTabStops) this.maTabStops.insert(new SvxTabStop(stop));
    } else {
      const count = args.length === 4 ? args[0] : SVX_TAB_DEFCOUNT,
        distance = args.length === 4 ? args[1] : SVX_TAB_DEFDIST,
        adjust = args.length === 4 ? args[2] : SvxTabAdjust.Default;
      if (
        !Number.isInteger(count) ||
        count < 0 ||
        count > 65535 ||
        !Number.isInteger(distance) ||
        distance < 0 ||
        distance > 65535 ||
        !Number.isInteger(adjust)
      )
        throw new Error("SvxTabStopItem constructor is invalid.");
      // The original int-promoted product must be representable as signed32.
      for (let i = 0; i < count; i += 1)
        this.maTabStops.insert(new SvxTabStop((i + 1) * distance, adjust));
    }
  }
  /** Original default ten-stop/Which0 factory. @returns Item. */
  static CreateDefault(): SvxTabStopItem {
    return new SvxTabStopItem(0);
  }
  /** Original full concrete value copy. @param pool - Unused pool. @returns Independent item. */
  override Clone(pool?: SfxItemPool): SvxTabStopItem {
    void pool;
    return new SvxTabStopItem(this);
  }
  /** Original unsigned16 count conversion. @returns Count. */
  Count(): number {
    return this.maTabStops.size() & 65535;
  }
  /** Original const borrowed indexed value; valid indexes are the native producer precondition. @param index - Unsigned16 index. @returns Stored tab. */
  At(index: number): SvxTabStopConstReference {
    return this.maTabStops.at(index & 65535) as SvxTabStop;
  }
  /** Original position-only lookup and unsigned16 result. @param value - Key or const value. @returns Index or sentinel. */
  GetPos(value: number | SvxTabStopConstReference): number {
    const key = typeof value === "number" ? new SvxTabStop(value) : new SvxTabStop(value);
    const index = this.maTabStops.find(key);
    return index < 0 ? SVX_TAB_NOTFOUND : index & 65535;
  }
  /** Original copied insertion. @param value - Value. @returns Insertion result. */
  Insert(value: SvxTabStopConstReference): boolean;
  /** Original two-pass list insertion. @param value - Source item, including original live self-insertion behavior. @returns Nothing. */
  Insert(value: SvxTabStopItem): void;
  /** Native replacement/merge over the shared sorted vector with explicit value-copy binding. @param value - Selected native form. @returns Bool for one value, void for lists. */
  Insert(value: SvxTabStopConstReference | SvxTabStopItem): boolean | void {
    if (value instanceof SvxTabStopItem) {
      for (let i = 0; i < value.Count(); i += 1) {
        const position = this.GetPos(value.At(i));
        if (position !== SVX_TAB_NOTFOUND) this.Remove(position);
      }
      for (let i = 0; i < value.Count(); i += 1)
        this.maTabStops.insert(new SvxTabStop(value.At(i)));
    } else {
      const copy = new SvxTabStop(value),
        position = this.GetPos(value);
      if (position !== SVX_TAB_NOTFOUND) this.Remove(position);
      return this.maTabStops.insert(copy)[1];
    }
  }
  /** Original unsigned16 range erase; invalid ranges are outside the native precondition. @param position - First index. @param length - Count. @returns Nothing. */
  Remove(position: number, length = 1): void {
    for (let i = 0; i < (length & 65535); i += 1) this.maTabStops.erase_at(position & 65535);
  }
  /** Original direct signed32 setter, allowing negative values unlike the property. @param distance - Declared signed32 value. @returns Nothing. */
  SetDefaultDistance(distance: number): void {
    if (!Number.isInteger(distance) || distance < -2147483648 || distance > 2147483647)
      throw new Error("SvxTabStopItem default distance is invalid.");
    this.mnDefaultDistance = distance;
  }
  /** Original direct distance. @returns Signed32 twips. */
  GetDefaultDistance(): number {
    return this.mnDefaultDistance;
  }
  /** Original payload equality, including both characters but excluding Which. @param other - Candidate. @returns Equality. */
  override equals(other: SfxPoolItem): boolean {
    if (
      !(other instanceof SvxTabStopItem) ||
      this.mnDefaultDistance !== other.mnDefaultDistance ||
      this.Count() !== other.Count()
    )
      return false;
    for (let i = 0; i < this.Count(); i += 1) if (this.At(i).notEquals(other.At(i))) return false;
    return true;
  }
  /** Original hash support. @returns True. */
  supportsHashCode(): boolean {
    return true;
  }
  /** Original hash folds distance and all stored positions/adjustments, omitting both characters. @returns Logical unsigned64 hash. */
  hashCode(): bigint {
    const seed: [bigint] = [0n];
    hash_combine(seed, this.mnDefaultDistance);
    for (const stop of this.maTabStops) {
      hash_combine(seed, stop.GetTabPos());
      hash_combine(seed, stop.GetAdjustment());
    }
    return seed[0];
  }
  /** Inherited unsupported host query; browser JSON belongs to the Writer codec. @returns Undefined. */
  override QueryValue(): undefined;
  /** Original typed property query. @param output - Actual Any. @param member - Unsigned8 member. @returns True. */
  override QueryValue(output: Any, member?: number): boolean;
  /** Original sequence/first/default-distance property dispatch. First-tab access requires nonempty native storage. @param output - Optional Any. @param member - Selector. @returns True or inherited host undefined. */
  override QueryValue(output?: Any, member = 0): boolean | undefined {
    if (output === undefined) return undefined;
    const convert = (member & 255 & CONVERT_TWIPS) !== 0;
    switch (member & 255 & ~CONVERT_TWIPS) {
      case MID_TABSTOPS: {
        const sequence = new Stops(this.Count());
        try {
          for (let i = 0; i < this.Count(); i += 1) {
            const stop = this.At(i),
              fields = sequence.operatorIndex(i);
            fields.get(0)[0] = convert
              ? Number(BigInt.asIntN(32, convertTwipToMm100(BigInt(stop.GetTabPos()))))
              : stop.GetTabPos();
            const adjust = stop.GetAdjustment();
            fields.get(4)[0] =
              adjust === SvxTabAdjust.Left
                ? TabAlign.LEFT
                : adjust === SvxTabAdjust.Right
                  ? TabAlign.RIGHT
                  : adjust === SvxTabAdjust.Decimal
                    ? TabAlign.DECIMAL
                    : adjust === SvxTabAdjust.Center
                      ? TabAlign.CENTER
                      : TabAlign.DEFAULT;
            fields.get(8)[0] = stop.GetDecimal().charCodeAt(0);
            fields.get(10)[0] = stop.GetFill().charCodeAt(0);
          }
          output.insert(sequence.getAddress(), ["Sequence", stopType]);
        } finally {
          sequence.dispose();
        }
        break;
      }
      case MID_STD_TAB: {
        const stop = this.maTabStops.front() as SvxTabStop;
        output.insert(
          [
            convert
              ? Number(BigInt.asIntN(32, convertTwipToMm100(BigInt(stop.GetTabPos()))))
              : stop.GetTabPos(),
          ],
          "sal_Int32",
        );
        break;
      }
      case MID_TABSTOP_DEFAULT_DISTANCE:
        output.insert(
          [
            convert
              ? Number(BigInt.asIntN(32, convertTwipToMm100(BigInt(this.mnDefaultDistance))))
              : this.mnDefaultDistance,
          ],
          "sal_Int32",
        );
        break;
    }
    return true;
  }
  /** Original typed sequence/legacy nested Any/long property writes and source validation order. @param input - Actual Any. @param member - Unsigned8 selector. @returns Success. */
  override PutValue(input: unknown, member: number): boolean {
    const convert = (member & 255 & CONVERT_TWIPS) !== 0;
    switch (member & 255 & ~CONVERT_TWIPS) {
      case MID_TABSTOPS: {
        if (!(input instanceof Any)) return false;
        const sequence = new Stops();
        try {
          if (!input.extract(sequence.getAddress(), ["Sequence", stopType])) {
            const rows = new Rows();
            try {
              if (!input.extract(rows.getAddress(), ["Sequence", ["Sequence", "Any"]]))
                return false;
              sequence.realloc(rows.getLength());
              for (let i = 0; i < rows.getLength(); i += 1) {
                const row = rows.operatorIndex(i)[0];
                if (row.nElements !== 4) return false;
                const fields = sequence.operatorIndex(i),
                  data = row.elements as Pick<ReadonlyMap<number, unknown>, "get">;
                if (!extract(data.get(0), fields.get(0), "sal_Int32")) return false;
                if (
                  !extract(data.get(24), fields.get(4), alignType) &&
                  !extract(data.get(24), fields.get(4), "sal_Int32")
                )
                  return false;
                if (
                  !extractChar(data.get(48), fields.get(8)) ||
                  !extractChar(data.get(72), fields.get(10))
                )
                  return false;
              }
            } finally {
              rows.dispose();
            }
          }
          this.maTabStops.clear();
          for (let i = 0; i < sequence.getLength(); i += 1) {
            const fields = sequence.operatorIndex(i),
              alignment = fields.get(4)[0];
            const adjust =
              alignment === TabAlign.LEFT
                ? SvxTabAdjust.Left
                : alignment === TabAlign.CENTER
                  ? SvxTabAdjust.Center
                  : alignment === TabAlign.RIGHT
                    ? SvxTabAdjust.Right
                    : alignment === TabAlign.DECIMAL
                      ? SvxTabAdjust.Decimal
                      : SvxTabAdjust.Default;
            const position = convert
              ? Number(BigInt.asIntN(32, toTwips(BigInt(fields.get(0)[0]), Length.mm100)))
              : fields.get(0)[0];
            this.Insert(
              new SvxTabStop(
                position,
                adjust,
                String.fromCharCode(fields.get(8)[0]),
                String.fromCharCode(fields.get(10)[0]),
              ),
            );
          }
        } finally {
          sequence.dispose();
        }
        break;
      }
      case MID_STD_TAB:
      case MID_TABSTOP_DEFAULT_DISTANCE: {
        const value: [number] = [0];
        if (!(input instanceof Any) || !input.extract(value, "sal_Int32")) return false;
        const position = convert
          ? Number(BigInt.asIntN(32, toTwips(BigInt(value[0]), Length.mm100)))
          : value[0];
        if ((member & 255 & ~CONVERT_TWIPS) === MID_STD_TAB) {
          if (position <= 0) return false;
          const old = this.maTabStops.front() as SvxTabStop,
            newTab = new SvxTabStop(position, old.GetAdjustment(), old.GetDecimal(), old.GetFill());
          this.Remove(0);
          this.Insert(newTab);
        } else {
          if (position < 0) return false;
          this.mnDefaultDistance = position;
        }
        break;
      }
    }
    return true;
  }
}
/** Original nonowning method call on an actual Any value inside Sequence<Any>; no copied/fabricated Any owner. @param value - Existing initialized native record. @param output - Declared destination lvalue. @param type - Original declared type. @returns Extraction result. */
function extract(value: unknown, output: unknown, type: Exclude<UnoTypeArgument, "Any">): boolean {
  return Any.prototype.extract.call(value as Any, output, type);
}
/** Original char or single-unit OUString fallback. @param value - Borrowed actual Any. @param output - Char cell. @returns Success. */
function extractChar(value: unknown, output: [number]): boolean {
  if (extract(value, output, "UnoCharType")) return true;
  const text = new OUString();
  try {
    if (!extract(value, text, "OUString") || text.getLength() !== 1) return false;
    output[0] = text.getStr()[0] as number;
    return true;
  } finally {
    text.dispose();
  }
}
