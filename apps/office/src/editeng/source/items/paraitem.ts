/**
 * @fileoverview Reimplements the bounded SvxAdjustItem paragraph-alignment value from pinned `editeng/source/items/paraitem.cxx`.
 */

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

/** One positioned tab with its adjustment and leader characters. */
export class SvxTabStop {
  /** Creates a pinned Writer tab stop. @param position - Twip position. @param adjustment - Tab adjustment. @param decimal - Decimal separator. @param fill - Leader character. @returns Nothing. */
  public constructor(
    private readonly position: number,
    private readonly adjustment: SvxTabAdjust = SvxTabAdjust.Left,
    private readonly decimal = "\0",
    private readonly fill = " ",
  ) {
    if (!Number.isInteger(position) || position < 0 || position > 2147483647)
      throw new Error("SvxTabStop position is invalid.");
    if (
      !Number.isInteger(adjustment) ||
      adjustment < SvxTabAdjust.Left ||
      adjustment >= SvxTabAdjust.End
    )
      throw new Error("SvxTabStop adjustment is invalid.");
    if (decimal.length !== 1 || fill.length !== 1)
      throw new Error("SvxTabStop characters must contain one character.");
  }

  /** Returns the tab position in twips. @returns Position. */
  public GetTabPos(): number {
    return this.position;
  }
  /** Returns the tab adjustment. @returns Adjustment. */
  public GetAdjustment(): SvxTabAdjust {
    return this.adjustment;
  }
  /** Returns the decimal separator. @returns Separator. */
  public GetDecimal(): string {
    return this.decimal;
  }
  /** Returns the leader character. @returns Fill. */
  public GetFill(): string {
    return this.fill;
  }
  /** Compares all tab stop fields. @param other - Candidate. @returns Equality. */
  public equals(other: SvxTabStop): boolean {
    return (
      this.position === other.position &&
      this.adjustment === other.adjustment &&
      this.decimal === other.decimal &&
      this.fill === other.fill
    );
  }
}

/** Sorted tab stops with the pinned `SvxTabStopItem` item identity. */
export class SvxTabStopItem extends SfxPoolItem {
  private stops: SvxTabStop[] = [];
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
      align < SvxTabAdjust.Left ||
      align >= SvxTabAdjust.End
    )
      throw new Error("SvxTabStopItem constructor is invalid.");
    for (let index = 1; index <= count; index += 1)
      this.stops.push(new SvxTabStop(index * (spacing as number), align));
  }

  /** Creates an item from explicit stops. @param which - WhichId. @param stops - Tab stops. @param defaultDistance - Default spacing. @returns Item. */
  public static FromStops(
    which: number,
    stops: readonly SvxTabStop[],
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
    return this.stops.length;
  }
  /** Returns one stop. @param index - Sorted index. @returns Stop. */
  public At(index: number): SvxTabStop {
    const stop = this.stops[index];
    if (stop === undefined) throw new Error("SvxTabStopItem index is invalid.");
    return stop;
  }
  /** Returns a read-only stop snapshot. @returns Stops. */
  public GetStops(): readonly SvxTabStop[] {
    return [...this.stops];
  }
  /** Finds a stop by position. @param stop - Position or stop. @returns Index or pinned not-found value. */
  public GetPos(stop: number | SvxTabStop): number {
    const position = typeof stop === "number" ? stop : stop.GetTabPos();
    const index = this.stops.findIndex(
      /** Checks one position. @param entry - Candidate tab. @returns Whether the position matches. */
      (entry) => entry.GetTabPos() === position,
    );
    return index < 0 ? 65535 : index;
  }
  /** Replaces a stop at the same position and keeps sorted order. @param stop - Tab stop. @returns Whether inserted. */
  public Insert(stop: SvxTabStop): boolean {
    const index = this.GetPos(stop);
    if (index !== 65535) this.stops.splice(index, 1);
    this.stops.push(stop);
    this.stops.sort(
      /** Orders two tabs by position. @param left - First tab. @param right - Second tab. @returns Position difference. */
      (left, right) => left.GetTabPos() - right.GetTabPos(),
    );
    return true;
  }
  /** Removes a run of stops by sorted index. @param index - First index. @param length - Count. @returns Nothing. */
  public Remove(index: number, length = 1): void {
    this.stops.splice(index, length);
  }
  /** Sets spacing for tabs without an explicit stop. @param distance - Twips. @returns Nothing. */
  public SetDefaultDistance(distance: number): void {
    if (!Number.isInteger(distance) || distance < 0)
      throw new Error("SvxTabStopItem default distance is invalid.");
    this.defaultDistance = distance;
  }
  /** Returns the default tab spacing. @returns Twips. */
  public GetDefaultDistance(): number {
    return this.defaultDistance;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxTabStopItem {
    return SvxTabStopItem.FromStops(this.Which(), this.stops, this.defaultDistance);
  }
  /** Compares item identity, spacing and every stop field. @param other - Candidate. @returns Equality. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxTabStopItem &&
      other.Which() === this.Which() &&
      other.defaultDistance === this.defaultDistance &&
      other.Count() === this.Count() &&
      this.stops.every(
        /** Compares one sorted tab. @param stop - Local tab. @param index - Sorted index. @returns Equality. */
        (stop, index) => stop.equals(other.At(index)),
      )
    );
  }
  /** Exposes the complete persistence-safe tab contract. @returns Tab record. */
  public QueryValue(): {
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
      stops: this.stops.map(
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
  public QueryValue(): SvxAdjust {
    return this.adjust;
  }
}

/** Stores Writer's direct text-left margin in twips, matching the bounded `SvxTextLeftMarginItem` role. */
export class SvxTextLeftMarginItem extends SfxPoolItem {
  /** Creates a left-margin item. @param textLeft - Direct text-left margin in twips. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly textLeft: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(textLeft) || textLeft < 0)
      throw new Error("SvxTextLeftMarginItem value is invalid.");
  }

  /** Returns the resolved direct text-left margin in twips. @returns Margin. */
  public ResolveTextLeft(): number {
    return this.textLeft;
  }

  /** Creates an independent left-margin item. @returns Cloned item. */
  public Clone(): SvxTextLeftMarginItem {
    return new SvxTextLeftMarginItem(this.textLeft, this.Which());
  }

  /** Compares item identity and margin value. @param other - Candidate item. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxTextLeftMarginItem &&
      other.Which() === this.Which() &&
      other.textLeft === this.textLeft
    );
  }

  /** Returns the persistence-safe twip margin. @returns Margin. */
  public QueryValue(): number {
    return this.textLeft;
  }
}

/** Stores Writer's first-line indent in twips. */
export class SvxFirstLineIndentItem extends SfxPoolItem {
  /** Creates an indent item. @param value - Signed twip indent. @param which - Item identity. @param autoFirst - Whether Writer computes indent from font height. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
    private readonly autoFirst = false,
  ) {
    super(which);
    if (!Number.isInteger(value)) throw new Error("SvxFirstLineIndentItem value is invalid.");
  }
  /** Returns the signed first-line indent. @returns Twips. */
  public ResolveTextFirstLineOffset(): number {
    return this.value;
  }
  /** Returns upstream automatic first-line mode. @returns Whether font height controls the indent. */
  public IsAutoFirst(): boolean {
    return this.autoFirst;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxFirstLineIndentItem {
    return new SvxFirstLineIndentItem(this.value, this.Which(), this.autoFirst);
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxFirstLineIndentItem &&
      other.Which() === this.Which() &&
      other.value === this.value &&
      other.autoFirst === this.autoFirst
    );
  }
  /** Serializes the indent. @returns Twips. */
  public QueryValue(): number | readonly [number, 1] {
    return this.autoFirst ? [this.value, 1] : this.value;
  }
}

/** Stores Writer's right paragraph margin in twips. */
export class SvxRightMarginItem extends SfxPoolItem {
  /** Creates a margin item. @param value - Non-negative twip margin. @param which - Item identity. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < 0)
      throw new Error("SvxRightMarginItem value is invalid.");
  }
  /** Returns the right margin. @returns Twips. */
  public ResolveRight(): number {
    return this.value;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxRightMarginItem {
    return new SvxRightMarginItem(this.value, this.Which());
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxRightMarginItem &&
      other.Which() === this.Which() &&
      other.value === this.value
    );
  }
  /** Serializes the margin. @returns Twips. */
  public QueryValue(): number {
    return this.value;
  }
}

/** Stores upper and lower paragraph spacing in twips. */
export class SvxULSpaceItem extends SfxPoolItem {
  /** Creates a spacing item. @param upper - Space above. @param lower - Space below. @param which - Item identity. @param contextual - Suppress adjacent spacing for identical styles. @returns Nothing. */
  public constructor(
    private readonly upper: number,
    private readonly lower: number,
    which: number,
    private readonly contextual = false,
  ) {
    super(which);
    if (
      ![upper, lower].every(
        /** Validates one spacing component. @param value - Twip value. @returns Whether valid. */ (
          value,
        ) => Number.isInteger(value) && value >= 0,
      )
    )
      throw new Error("SvxULSpaceItem value is invalid.");
  }
  /** Returns space above. @returns Twips. */
  public GetUpper(): number {
    return this.upper;
  }
  /** Returns space below. @returns Twips. */
  public GetLower(): number {
    return this.lower;
  }
  /** Reports Writer's contextual paragraph-spacing flag. @returns Whether matching styles suppress spacing. */
  public GetContext(): boolean {
    return this.contextual;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxULSpaceItem {
    return new SvxULSpaceItem(this.upper, this.lower, this.Which(), this.contextual);
  }
  /** Compares identity and values. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxULSpaceItem &&
      other.Which() === this.Which() &&
      other.upper === this.upper &&
      other.lower === this.lower &&
      other.contextual === this.contextual
    );
  }
  /** Serializes spacing. @returns Upper/lower tuple. */
  public QueryValue(): readonly [number, number] | readonly [number, number, number] {
    return this.contextual ? [this.upper, this.lower, 1] : [this.upper, this.lower];
  }
}

/** Writer line-spacing modes corresponding to proportional, fixed, minimum, and extra leading. */
export type SvxLineSpacingMode = "proportional" | "fixed" | "minimum" | "leading";

/** Stores the Writer paragraph line-spacing rule in twips or percent. */
export class SvxLineSpacingItem extends SfxPoolItem {
  /** Creates line spacing. @param value - Percent or twips according to mode. @param which - Item identity. @param mode - Writer line-spacing rule. @param fontIndependent - ODF compatibility flag. @returns Nothing. */
  public constructor(
    private readonly value: number,
    which: number,
    private readonly mode: SvxLineSpacingMode = "proportional",
    private readonly fontIndependent = false,
  ) {
    super(which);
    if (!Number.isInteger(value) || value < 0)
      throw new Error("SvxLineSpacingItem value is invalid.");
  }
  /** Returns the Writer rule. @returns Line-spacing mode. */
  public GetMode(): SvxLineSpacingMode {
    return this.mode;
  }
  /** Returns proportional line height. @returns Percent. */
  public GetPropLineSpace(): number {
    return this.mode === "proportional" ? this.value : 0;
  }
  /** Returns the rule's raw percent or twip value. @returns Stored value. */
  public GetValue(): number {
    return this.value;
  }
  /** Reports the imported font-independent setting. @returns ODF compatibility flag. */
  public IsFontIndependent(): boolean {
    return this.fontIndependent;
  }
  /** Creates an independent item. @returns Clone. */
  public Clone(): SvxLineSpacingItem {
    return new SvxLineSpacingItem(this.value, this.Which(), this.mode, this.fontIndependent);
  }
  /** Compares identity and value. @param other - Candidate. @returns Whether equal. */
  public equals(other: SfxPoolItem): boolean {
    return (
      other instanceof SvxLineSpacingItem &&
      other.Which() === this.Which() &&
      other.value === this.value &&
      other.mode === this.mode &&
      other.fontIndependent === this.fontIndependent
    );
  }
  /** Serializes line spacing compatibly with existing percentage records. @returns Percent or rule tuple. */
  public QueryValue(): number | readonly [number, number, number] {
    return this.mode === "proportional" && !this.fontIndependent
      ? this.value
      : [
          ["proportional", "fixed", "minimum", "leading"].indexOf(this.mode),
          this.value,
          Number(this.fontIndependent),
        ];
  }
}
