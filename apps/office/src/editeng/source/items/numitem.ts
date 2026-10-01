/** @fileoverview Owns implemented numbering marker and independent position state from pinned SvxNumberFormat. */

/** Native position-and-space selection. */
export type SvxNumPositionAndSpaceMode = "label-width-and-position" | "label-alignment";

/** Numeric values are core Twips, or native MM100 at an explicit conversion boundary. */
export interface NumberingPositionProperties {
  readonly absLSpace?: number;
  readonly firstLineOffset?: number;
  readonly charTextDistance?: number;
  readonly firstLineIndent?: number;
  readonly indentAt?: number;
  readonly labelFollowedBy?: "listtab" | "nothing" | "space";
  readonly listTabPosition?: number;
  readonly positionAndSpaceMode?: SvxNumPositionAndSpaceMode;
}

/** Raw shared marker state for independent Writer copies and the Worker graph boundary. */
export interface NumberingMarkerProperties {
  readonly includeUpperLevels?: number;
  readonly prefix?: string;
  readonly start?: number;
  readonly suffix?: string;
  readonly listFormat?: string;
}

/** Retains both native geometry groups independently; the active mode determines legacy getter results. */
export class SvxNumberFormat {
  private position: Required<NumberingPositionProperties>;
  private includeUpperLevels: number;
  private prefix: string;
  private start: number;
  private suffix: string;
  private listFormat: string | undefined;
  /** Initializes the native zero geometry and legacy mode. @param properties - Explicit field overrides. @returns Format. */
  public constructor(properties: NumberingPositionProperties & NumberingMarkerProperties = {}) {
    this.includeUpperLevels = (properties.includeUpperLevels ?? 1) & 255;
    this.prefix = properties.prefix ?? "";
    this.start = (properties.start ?? 1) & 65535;
    this.suffix = properties.suffix ?? "";
    this.listFormat = properties.listFormat;
    this.position = {
      absLSpace: (properties.absLSpace ?? 0) | 0,
      firstLineOffset: (properties.firstLineOffset ?? 0) | 0,
      charTextDistance: ((properties.charTextDistance ?? 0) << 16) >> 16,
      firstLineIndent: properties.firstLineIndent ?? 0,
      indentAt: properties.indentAt ?? 0,
      labelFollowedBy: properties.labelFollowedBy ?? "listtab",
      listTabPosition: properties.listTabPosition ?? 0,
      positionAndSpaceMode: properties.positionAndSpaceMode ?? "label-width-and-position",
    };
  }
  /** Compares all implemented base-format marker and position fields without conflating active geometry or optional patterns. @param other - Const base format. @returns Implemented value equality. */
  public Equals(
    other: Pick<SvxNumberFormat, "GetPositionProperties" | "GetMarkerProperties">,
  ): boolean {
    const position = this.GetPositionProperties(),
      otherPosition = other.GetPositionProperties();
    const marker = this.GetMarkerProperties(),
      otherMarker = other.GetMarkerProperties();
    return (
      (Object.keys(position) as (keyof typeof position)[]).every(
        /** Compares one independently stored geometry field. @param key - Field. @returns Equality. */
        (key) => position[key] === otherPosition[key],
      ) &&
      marker.includeUpperLevels === otherMarker.includeUpperLevels &&
      marker.start === otherMarker.start &&
      marker.prefix === otherMarker.prefix &&
      marker.suffix === otherMarker.suffix &&
      marker.listFormat === otherMarker.listFormat
    );
  }
  /** Returns the stored compatibility count. @returns Unsigned byte. */
  public GetIncludeUpperLevels(): number {
    return this.includeUpperLevels;
  }
  /** Changes the compatibility count without invalidating a pattern. @param count - Native byte value. @returns Nothing. */
  public SetIncludeUpperLevels(count: number): void {
    this.includeUpperLevels = count & 255;
  }
  /** Returns the compatibility prefix. @returns Prefix. */
  public GetPrefix(): string {
    return this.prefix;
  }
  /** Replaces the prefix and invalidates ListFormat. @param prefix - New prefix. @returns Nothing. */
  public SetPrefix(prefix: string): void {
    this.listFormat = undefined;
    this.prefix = prefix;
  }
  /** Returns the unsigned starting value. @returns Start. */
  public GetStart(): number {
    return this.start;
  }
  /** Stores a native unsigned start. @param start - New starting value. @returns Nothing. */
  public SetStart(start: number): void {
    this.start = start & 65535;
  }
  /** Returns the compatibility suffix. @returns Suffix. */
  public GetSuffix(): string {
    return this.suffix;
  }
  /** Replaces the suffix and invalidates ListFormat. @param suffix - New suffix. @returns Nothing. */
  public SetSuffix(suffix: string): void {
    this.listFormat = undefined;
    this.suffix = suffix;
  }
  /** Reports presence independently of an empty pattern. @returns Whether a pattern is stored. */
  public HasListFormat(): boolean {
    return this.listFormat !== undefined;
  }
  /** Returns the pattern, optionally stripping its compatibility affixes. @param includePrefixSuffix - Include affixes. @returns Pattern. */
  public GetListFormat(includePrefixSuffix = true): string {
    if (this.listFormat === undefined) throw new Error("Numbering ListFormat is absent.");
    return includePrefixSuffix
      ? this.listFormat
      : this.listFormat.slice(this.prefix.length, this.listFormat.length - this.suffix.length);
  }
  /** Applies a pattern and derives the native compatibility fields. @param format - Optional pattern. @returns Nothing. */
  public SetListFormat(format?: string): void;
  /** Generates an older ODT pattern from affixes and included levels. @param prefix - Prefix. @param suffix - Suffix. @param level - Zero-based level. @returns Nothing. */
  public SetListFormat(prefix: string, suffix: string, level: number): void;
  /** Implements the pinned optional-pattern and generation overloads. @param format - Pattern or prefix. @param suffix - Generation suffix. @param level - Generation level. @returns Nothing. */
  public SetListFormat(format?: string, suffix?: string, level?: number): void {
    if (suffix !== undefined) {
      this.prefix = format as string;
      this.suffix = suffix;
      this.listFormat = this.prefix;
      for (let index = 1; index <= this.includeUpperLevels; index++) {
        const levelId = (level as number) - this.includeUpperLevels + index;
        if (levelId < 0) continue;
        this.listFormat += `%${levelId + 1}%`;
        if (index !== this.includeUpperLevels) this.listFormat += ".";
      }
      this.listFormat += suffix;
      return;
    }
    this.prefix = "";
    this.suffix = "";
    this.listFormat = format;
    if (format === undefined) return;
    let first = format.indexOf("%");
    while (
      first !== -1 &&
      first < format.length - 1 &&
      (format.charAt(first + 1) < "1" || format.charAt(first + 1) > "9")
    )
      first = format.indexOf("%", first + 1);
    let last = first === -1 ? -1 : format.lastIndexOf("%");
    while (last > 0 && (format.charAt(last - 1) < "0" || format.charAt(last - 1) > "9"))
      last = format.lastIndexOf("%", last - 1);
    if (last < first) last = first;
    else last++;
    if (first > 0) this.prefix = format.slice(0, first);
    if (last >= 0 && last < format.length) this.suffix = format.slice(last);
    let percents = 0;
    for (let index = first > 0 ? first : 0; index < last; index++)
      if (format[index] === "%") percents = (percents + 1) & 255;
    this.includeUpperLevels = Math.max(1, Math.trunc(percents / 2));
  }
  /** Copies raw state without re-deriving compatibility fields from the pattern. @returns Independent marker properties. */
  public GetMarkerProperties(): NumberingMarkerProperties {
    return {
      includeUpperLevels: this.includeUpperLevels,
      prefix: this.prefix,
      start: this.start,
      suffix: this.suffix,
      ...(this.listFormat === undefined ? {} : { listFormat: this.listFormat }),
    };
  }
  /** Returns mode-dependent absolute left spacing. @returns Twips. */
  public GetAbsLSpace(): number {
    return this.position.positionAndSpaceMode === "label-width-and-position"
      ? this.position.absLSpace
      : (this.position.firstLineIndent + this.position.indentAt) | 0;
  }
  /** Returns mode-dependent first-line offset. @returns Twips. */
  public GetFirstLineOffset(): number {
    return this.position.positionAndSpaceMode === "label-width-and-position"
      ? this.position.firstLineOffset
      : this.position.firstLineIndent | 0;
  }
  /** Returns legacy character/text distance, or zero in alignment mode. @returns Twips. */
  public GetCharTextDistance(): number {
    return this.position.positionAndSpaceMode === "label-width-and-position"
      ? this.position.charTextDistance
      : 0;
  }
  /** Returns the independent alignment first-line indent. @returns Twips. */
  public GetFirstLineIndent(): number {
    return this.position.firstLineIndent;
  }
  /** Returns the independent alignment body indent. @returns Twips. */
  public GetIndentAt(): number {
    return this.position.indentAt;
  }
  /** Returns the stored alignment separator. @returns Separator. */
  public GetLabelFollowedBy(): "listtab" | "nothing" | "space" {
    return this.position.labelFollowedBy;
  }
  /** Returns the independent alignment tab position. @returns Twips. */
  public GetListtabPos(): number {
    return this.position.listTabPosition;
  }
  /** Returns the active native mode. @returns Mode. */
  public GetPositionAndSpaceMode(): SvxNumPositionAndSpaceMode {
    return this.position.positionAndSpaceMode;
  }
  /** Changes the active mode without rewriting either geometry group. @param mode - New mode. @returns Nothing. */
  public SetPositionAndSpaceMode(mode: SvxNumPositionAndSpaceMode): void {
    this.position = { ...this.position, positionAndSpaceMode: mode };
  }
  /** Copies raw fields for Writer copy construction and the browser snapshot port, including inactive geometry. @returns Independent property record. */
  public GetPositionProperties(): Required<NumberingPositionProperties> {
    return { ...this.position };
  }
}
