/**
 * @fileoverview Reimplements bounded paragraph-alignment, tab-stop, and line-spacing values from pinned `editeng/source/items/paraitem.cxx`.
 */

import { getSystemDecimalSeparator } from "../../../unotools/source/misc/syslocale";
import { SortedVector } from "../../../o3tl/inc/sorted_vector";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import type { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxPoolItem } from "../../../svl/source/items/poolitem";

/** Pinned `SvxTabAdjust` order from `include/editeng/svxenum.hxx`. */
export enum SvxTabAdjust {
  Left,
  Right,
  Decimal,
  Center,
  Default,
  End,
}

/** Original const borrowed tab value; mutable-reference overloads are intentionally absent. */
export interface SvxTabStopConstReference {
  /** Original const position. @returns Twips. */
  GetTabPos(): number;
  /** Original const adjustment. @returns Adjustment. */
  GetAdjustment(): SvxTabAdjust;
  /** Original const decimal unit. @returns One UTF16 unit. */
  GetDecimal(): string;
  /** Original const fill unit. @returns One UTF16 unit. */
  GetFill(): string;
}
/** Original tab value with independent copied fields; JS char values are single UTF16-unit strings. */
export class SvxTabStop implements SvxTabStopConstReference {
  private readonly position: [number] = [0];
  private readonly adjustment: [SvxTabAdjust] = [SvxTabAdjust.Left];
  private readonly decimal: [string] = ["\0"];
  private readonly fill: [string] = [" "];
  /** Original default/position/copy forms. Copy preserves a previously resolved decimal without querying the host again. @param args - Native arguments. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: SvxTabStopConstReference]
      | [position: number, adjustment?: SvxTabAdjust, decimal?: string, fill?: string]
  ) {
    if (typeof args[0] === "object") {
      const source = args[0] as SvxTabStop;
      this.position[0] = source.position[0];
      this.adjustment[0] = source.adjustment[0];
      this.decimal[0] = source.decimal[0];
      this.fill[0] = source.fill[0];
    } else {
      const [position = 0, adjustment = SvxTabAdjust.Left, decimal = "\0", fill = " "] = args as [
        number?,
        SvxTabAdjust?,
        string?,
        string?,
      ];
      if (!Number.isInteger(position) || position < -2147483648 || position > 2147483647)
        throw new Error("SvxTabStop position is invalid.");
      if (!Number.isInteger(adjustment)) throw new Error("SvxTabStop adjustment is invalid.");
      if (decimal.length !== 1 || fill.length !== 1)
        throw new Error("SvxTabStop characters must contain one character.");
      this.position[0] = position;
      this.adjustment[0] = adjustment;
      this.decimal[0] = decimal;
      this.fill[0] = fill;
      this.fillDecimal();
    }
  }
  /** Original const position. @returns Twips. */
  GetTabPos(): number;
  /** Native nonconst-reference syntax binding, sharing the existing field. @param mutable - Selects the nonconst form. @returns Stable field cell. */
  GetTabPos(mutable: true): [number];
  /** Selects the original const/nonconst getter. @param mutable - Optional reference form. @returns Scalar or original field cell. */
  GetTabPos(mutable?: true): number | [number] {
    return mutable === true ? this.position : this.position[0];
  }
  /** Original const adjustment. @returns Adjustment. */
  GetAdjustment(): SvxTabAdjust;
  /** Original mutable adjustment reference. @param mutable - Nonconst form. @returns Field cell. */
  GetAdjustment(mutable: true): [SvxTabAdjust];
  /** Original const/nonconst adjustment binding. @param mutable - Optional reference form. @returns Value or field. */
  GetAdjustment(mutable?: true): SvxTabAdjust | [SvxTabAdjust] {
    return mutable === true ? this.adjustment : this.adjustment[0];
  }
  /** Original const decimal char. @returns Unit. */
  GetDecimal(): string;
  /** Original mutable decimal reference. @param mutable - Nonconst form. @returns Field cell. */
  GetDecimal(mutable: true): [string];
  /** Original const/nonconst decimal binding; writing nul does not rerun fillDecimal. @param mutable - Optional reference form. @returns Unit or field. */
  GetDecimal(mutable?: true): string | [string] {
    return mutable === true ? this.decimal : this.decimal[0];
  }
  /** Original const fill char. @returns Unit. */
  GetFill(): string;
  /** Original mutable fill reference. @param mutable - Nonconst form. @returns Field cell. */
  GetFill(mutable: true): [string];
  /** Original const/nonconst fill binding. @param mutable - Optional reference form. @returns Unit or field. */
  GetFill(mutable?: true): string | [string] {
    return mutable === true ? this.fill : this.fill[0];
  }
  /** Original full field comparison. @param other - Other tab. @returns Equal value. */
  equals(other: SvxTabStopConstReference): boolean {
    const source = other as SvxTabStop;
    return (
      this.position[0] === source.position[0] &&
      this.adjustment[0] === source.adjustment[0] &&
      this.decimal[0] === source.decimal[0] &&
      this.fill[0] === source.fill[0]
    );
  }
  /** Original implicit memberwise assignment, preserving existing field identities and nonvirtual base-value copying. @param other - Actual const borrowed source. @returns Recipient. */
  assign(other: SvxTabStopConstReference): this {
    const source = other as SvxTabStop;
    this.position[0] = source.position[0];
    this.adjustment[0] = source.adjustment[0];
    this.decimal[0] = source.decimal[0];
    this.fill[0] = source.fill[0];
    return this;
  }
  /** Original inequality. @param other - Other tab. @returns Different fields. */
  notEquals(other: SvxTabStopConstReference): boolean {
    return !SvxTabStop.prototype.equals.call(this, other);
  }
  /** Original position-only strict order over actual fields, without virtual getter dispatch. @param other - Other tab. @returns Ordered positions. */
  lessThan(other: SvxTabStopConstReference): boolean {
    return this.position[0] < (other as SvxTabStop).position[0];
  }
  /** Original constructor-only default decimal resolution. @returns Nothing. */
  private fillDecimal(): void {
    if (this.decimal[0] === "\0") this.decimal[0] = getSystemDecimalSeparator();
  }
}

/** Sorted tab stops with the pinned `SvxTabStopItem` item identity. */
export class SvxTabStopItem extends SfxPoolItem {
  private readonly stops = new SortedVector<SvxTabStop>(
    /** Original SvxTabStop operator< orders only position. @param left - First tab. @param right - Second tab. @returns Strict order. */
    (left, right) => left.lessThan(right),
  );
  private defaultDistance = 0;

  /** Creates ten default stops, or a counted Writer pool default. @param countOrWhich - Count for the four-argument form, otherwise WhichId. @param distance - Twip spacing. @param adjustment - Adjustment for generated stops. @param which - WhichId for the four-argument form. @returns Nothing. */
  public constructor(
    countOrWhich: number,
    distance?: number,
    adjustment?: SvxTabAdjust,
    which?: number,
  ) {
    super(which ?? countOrWhich);
    const count = which === undefined ? 10 : countOrWhich;
    const spacing = which === undefined ? 1134 : distance;
    const align = which === undefined ? SvxTabAdjust.Default : adjustment;
    if (
      !Number.isInteger(count) ||
      count < 0 ||
      count > 65535 ||
      !Number.isInteger(spacing) ||
      (spacing as number) < 0 ||
      align === undefined ||
      !Number.isInteger(align)
    )
      throw new Error("SvxTabStopItem constructor is invalid.");
    for (let index = 1; index <= count; index += 1)
      this.stops.insert(new SvxTabStop(index * (spacing as number), align));
  }

  /** Creates an item from explicit stops. @param which - WhichId. @param stops - Tab stops. @param defaultDistance - Default spacing. @returns Item. */
  public static FromStops(
    which: number,
    stops: readonly SvxTabStopConstReference[],
    defaultDistance = 0,
  ): SvxTabStopItem {
    const item = new SvxTabStopItem(0, 0, SvxTabAdjust.Default, which);
    item.SetDefaultDistance(defaultDistance);
    for (const stop of stops) item.Insert(stop);
    return item;
  }

  /** Restores the complete item value after a filter or Worker transfer. @param which - WhichId. @param value - Persisted record. @returns Item. */
  public static FromValue(which: number, value: unknown): SvxTabStopItem {
    if (typeof value !== "object" || value === null || Array.isArray(value))
      throw new Error("SvxTabStopItem value is invalid.");
    const record = value as Record<string, unknown>;
    if (!Array.isArray(record.stops) || !Number.isInteger(record.defaultDistance))
      throw new Error("SvxTabStopItem value is invalid.");
    const stops = record.stops.map(
      /** Restores one tab value. @param entry - Candidate tab record. @returns Tab stop. */
      (entry): SvxTabStop => {
        if (typeof entry !== "object" || entry === null || Array.isArray(entry))
          throw new Error("SvxTabStopItem tab value is invalid.");
        const tab = entry as Record<string, unknown>;
        if (
          typeof tab.position !== "number" ||
          typeof tab.adjustment !== "number" ||
          typeof tab.decimal !== "string" ||
          typeof tab.fill !== "string"
        )
          throw new Error("SvxTabStopItem tab value is invalid.");
        return new SvxTabStop(tab.position, tab.adjustment, tab.decimal, tab.fill);
      },
    );
    return SvxTabStopItem.FromStops(which, stops, record.defaultDistance as number);
  }

  /** Returns the number of explicit stops. @returns Count. */
  public Count(): number {
    return this.stops.size();
  }
  /** Returns one stop. @param index - Sorted index. @returns Stop. */
  public At(index: number): SvxTabStopConstReference {
    const stop = this.stops.at(index);
    if (stop === undefined) throw new Error("SvxTabStopItem index is invalid.");
    return stop;
  }
  /** Returns a read-only stop snapshot. @returns Stops. */
  public GetStops(): readonly SvxTabStop[] {
    return Array.from(
      this.stops,
      /** Explicit browser snapshot copies real tab values. @param stop - Source. @returns Detached copy. */
      (stop) => new SvxTabStop(stop),
    );
  }
  /** Finds a stop by position. @param stop - Position or stop. @returns Index or pinned not-found value. */
  public GetPos(stop: number | SvxTabStopConstReference): number {
    const key = typeof stop === "number" ? new SvxTabStop(stop) : new SvxTabStop(stop);
    const index = this.stops.find(key);
    return index < 0 ? 65535 : index;
  }
  /** Original replacement insertion value-copies its argument at the vector binding. @param stop - Source tab. @returns Insertion success. */
  public Insert(stop: SvxTabStopConstReference): boolean {
    const index = this.GetPos(stop);
    const value = new SvxTabStop(stop);
    if (index !== 65535) this.Remove(index);
    return this.stops.insert(value)[1];
  }

  /** Removes a run of stops by sorted index. @param index - First index. @param length - Count. @returns Nothing. */
  public Remove(index: number, length = 1): void {
    for (let offset = 0; offset < length; offset += 1) this.stops.erase_at(index);
  }
  /** Sets spacing for tabs without an explicit stop. @param distance - Twips. @returns Nothing. */
  public SetDefaultDistance(distance: number): void {
    if (!Number.isInteger(distance) || distance < -2147483648 || distance > 2147483647)
      throw new Error("SvxTabStopItem default distance is invalid.");
    this.defaultDistance = distance;
  }
  /** Returns the default tab spacing. @returns Twips. */
  public GetDefaultDistance(): number {
    return this.defaultDistance;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxTabStopItem {
    return SvxTabStopItem.FromStops(this.Which(), [...this.stops], this.defaultDistance);
  }
  /** Compares item identity, spacing and every stop field. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxTabStopItem &&
      other.defaultDistance === this.defaultDistance &&
      other.Count() === this.Count() &&
      [...this.stops].every(
        /** Compares one sorted tab. @param stop - Local tab. @param index - Sorted index. @returns Equality. */
        (stop, index) => stop.equals(other.At(index)),
      )
    );
  }
  /** Exposes the complete persistence-safe tab contract. @returns Tab record. */
  public override QueryValue(): {
    readonly defaultDistance: number;
    readonly stops: readonly {
      readonly position: number;
      readonly adjustment: SvxTabAdjust;
      readonly decimal: string;
      readonly fill: string;
    }[];
  } {
    return {
      defaultDistance: this.defaultDistance,
      stops: [...this.stops].map(
        /** Encodes one tab. @param stop - Tab stop. @returns Tab record. */
        (stop) => ({
          position: stop.GetTabPos(),
          adjustment: stop.GetAdjustment(),
          decimal: stop.GetDecimal(),
          fill: stop.GetFill(),
        }),
      ),
    };
  }
}

/** Matches the pinned SvxAdjust enumeration order. */
export enum SvxAdjust {
  Left,
  Right,
  Block,
  Center,
  BlockLine,
  ParaStart,
  ParaEnd,
  End,
}

/** Stores one paragraph adjustment item. */
export class SvxAdjustItem extends SfxPoolItem {
  /** Creates a paragraph adjustment item. @param adjust - Paragraph adjustment value. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly adjust: SvxAdjust,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(adjust) || adjust < SvxAdjust.Left || adjust >= SvxAdjust.End)
      throw new Error("SvxAdjustItem value is invalid.");
  }

  /** Returns the paragraph adjustment value. @returns SvxAdjust value. */
  public GetAdjust(): SvxAdjust {
    return this.adjust;
  }

  /** Creates an independent adjustment item. @returns Cloned item. */
  public Clone(): SvxAdjustItem {
    return new SvxAdjustItem(this.adjust, this.Which());
  }

  /** Compares adjustment item identity and value. @param other - Candidate item. @returns True for an equal adjustment item. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxAdjustItem &&
      other.Which() === this.Which() &&
      other.adjust === this.adjust
    );
  }

  /** Creates a persisted adjustment item record. @returns Item snapshot. */
  public override QueryValue(): SvxAdjust {
    return this.adjust;
  }
}

/** Original Asian paragraph boolean value owner. */
export class SvxScriptSpaceItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxScriptSpaceItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxScriptSpaceItem {
    void pool;
    return new SvxScriptSpaceItem(this);
  }
}

/** Original Asian paragraph boolean value owner. */
export class SvxHangingPunctuationItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(
    ...args: [value: boolean, which: number] | [source: Readonly<SvxHangingPunctuationItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxHangingPunctuationItem {
    void pool;
    return new SvxHangingPunctuationItem(this);
  }
}

/** Original Asian paragraph boolean value owner. */
export class SvxForbiddenRuleItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy forms. @param args - Selected native form. @returns Item. */
  constructor(...args: [value: boolean, which: number] | [source: Readonly<SvxForbiddenRuleItem>]) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original copy-based Clone. @param pool - Unused pool. @returns Independent item. */
  public override Clone(pool?: SfxItemPool): SvxForbiddenRuleItem {
    void pool;
    return new SvxForbiddenRuleItem(this);
  }
}

/** Original automatic paragraph writing-direction bool attribute. */
export class SvxAutoFrameDirectionItem extends SfxBoolItem {
  /** Original bool/Which and implicit-copy constructors. @param args - Original arguments. @returns Item. */
  public constructor(
    ...args: [enabled: boolean, which: number] | [source: Readonly<SvxAutoFrameDirectionItem>]
  ) {
    if (args.length === 1) super(args[0]);
    else super(args[1], args[0]);
  }
  /** Original independent concrete copy clone. @param pool - Unused pool. @returns Item. */
  public override Clone(pool?: SfxItemPool): SvxAutoFrameDirectionItem {
    void pool;
    return new SvxAutoFrameDirectionItem(this);
  }
}
