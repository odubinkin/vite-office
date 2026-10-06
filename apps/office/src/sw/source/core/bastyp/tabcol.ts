/** @fileoverview Owns native SwTabCols separator data, copied values and edge defaults from tabcol.cxx. */

/** One native separator; coordinates are relative to the left-most document reference. */
export interface SwTabColsEntry {
  nPos: number;
  nMin: number;
  nMax: number;
  bHidden: boolean;
}

/** Native mutable column geometry; source reserve capacity does not create separators. */
export class SwTabCols {
  private leftMin = 0;
  private left = 0;
  private right = 0;
  private rightMax = 0;
  private lastRowAllowedToChange = true;
  private data: SwTabColsEntry[] = [];

  /** Constructs empty reserved data or an independent native copy. @param source - Reserve hint or original geometry. @returns Nothing. */
  public constructor(source: number | SwTabCols = 0) {
    if (source instanceof SwTabCols) this.Assign(source);
  }
  /** Assigns all native values without sharing entries. @param source - Original geometry. @returns This geometry owner. */
  public Assign(source: SwTabCols): this {
    this.leftMin = source.GetLeftMin();
    this.left = source.GetLeft();
    this.right = source.GetRight();
    this.rightMax = source.GetRightMax();
    this.lastRowAllowedToChange = source.IsLastRowAllowedToChange();
    this.data = source.data.map(
      /** Copies one mutable separator. @param entry - Original entry. @returns Independent value. */
      (entry) => ({ ...entry }),
    );
    return this;
  }
  /** Returns separator count. @returns Number of entries. */
  public Count(): number {
    return this.data.length;
  }
  /** Returns the actual native mutable entry. @param index - Separator index. @returns Original entry. */
  public GetEntry(index: number): SwTabColsEntry {
    return this.data[index] as SwTabColsEntry;
  }
  /** Reads hidden state. @param index - Separator index. @returns Hidden flag. */
  public IsHidden(index: number): boolean {
    return this.GetEntry(index).bHidden;
  }
  /** Changes hidden state without replacing its entry. @param index - Separator index. @param hidden - New hidden flag. @returns Nothing. */
  public SetHidden(index: number, hidden: boolean): void {
    this.GetEntry(index).bHidden = hidden;
  }
  /** Inserts an unconstrained native separator. @param position - Coordinate. @param hidden - Hidden flag. @param index - Insertion index. @returns Nothing. */
  public Insert(position: number, hidden: boolean, index: number): void;
  /** Inserts a constrained native separator. @param position - Coordinate. @param minimum - Minimum coordinate. @param maximum - Maximum coordinate. @param hidden - Hidden flag. @param index - Insertion index. @returns Nothing. */
  public Insert(
    position: number,
    minimum: number,
    maximum: number,
    hidden: boolean,
    index: number,
  ): void;
  /** Implements the two native insertion overloads. @param position - Coordinate. @param minimumOrHidden - Minimum or hidden flag. @param maximumOrIndex - Maximum or insertion index. @param hidden - Constrained hidden flag. @param index - Constrained insertion index. @returns Nothing. */
  public Insert(
    position: number,
    minimumOrHidden: number | boolean,
    maximumOrIndex: number,
    hidden?: boolean,
    index?: number,
  ): void {
    const simple = typeof minimumOrHidden === "boolean";
    this.data.splice(simple ? maximumOrIndex : (index as number), 0, {
      nPos: position,
      nMin: simple ? 0 : minimumOrHidden,
      nMax: simple ? Number(0x7fffffffffffffffn) : maximumOrIndex,
      bHidden: simple ? minimumOrHidden : (hidden as boolean),
    });
  }
  /** Removes native contiguous entries. @param index - First separator. @param count - Number to remove. @returns Nothing. */
  public Remove(index: number, count = 1): void {
    this.data.splice(index, count);
  }
  /** Reads document reference coordinate. @returns Left-most frame reference. */
  public GetLeftMin(): number {
    return this.leftMin;
  }
  /** Reads table left edge. @returns Relative left coordinate. */
  public GetLeft(): number {
    return this.left;
  }
  /** Reads table right edge. @returns Relative right coordinate. */
  public GetRight(): number {
    return this.right;
  }
  /** Reads maximum right edge. @returns Relative maximum coordinate. */
  public GetRightMax(): number {
    return this.rightMax;
  }
  /** Sets document reference. @param value - New coordinate. @returns Nothing. */
  public SetLeftMin(value: number): void {
    this.leftMin = value;
  }
  /** Sets table left edge. @param value - New coordinate. @returns Nothing. */
  public SetLeft(value: number): void {
    this.left = value;
  }
  /** Sets table right edge. @param value - New coordinate. @returns Nothing. */
  public SetRight(value: number): void {
    this.right = value;
  }
  /** Sets maximum right edge. @param value - New coordinate. @returns Nothing. */
  public SetRightMax(value: number): void {
    this.rightMax = value;
  }
  /** Reads native split-last-row admission flag. @returns Whether the last row can change. */
  public IsLastRowAllowedToChange(): boolean {
    return this.lastRowAllowedToChange;
  }
  /** Sets split-last-row admission flag. @param value - New flag. @returns Nothing. */
  public SetLastRowAllowedToChange(value: boolean): void {
    this.lastRowAllowedToChange = value;
  }
}
