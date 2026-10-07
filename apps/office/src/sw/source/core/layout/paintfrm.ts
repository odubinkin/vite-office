/** @fileoverview Owns native collapsing-border overlap arbitration over represented flat cell frames. */
import { Style } from "../../../../svx/source/dialog/framelink";
import type { SwTable } from "../table/swtable";

/** Native overlap classification for two line intervals. */
export enum OverlapType {
  NO_OVERLAP,
  OVERLAP1,
  OVERLAP2,
  OVERLAP3,
}
/** Owns one native line interval and copied frame Style. */
export class SwLineEntry {
  public readonly maAttribute: Style;
  /** Copies one source line entry. @param mnKey - Shared coordinate. @param mnStartPos - Interval start. @param mnEndPos - Interval end. @param mbOuter - Outer boundary. @param attribute - Native style. @returns Nothing. */
  public constructor(
    public readonly mnKey: number,
    public mnStartPos: number,
    public mnEndPos: number,
    public readonly mbOuter: boolean,
    attribute: Style,
  ) {
    this.maAttribute = attribute.Clone();
  }
  /** Classifies all source overlap arrangements. @param next - New interval. @returns Native overlap ID. */
  public Overlaps(next: SwLineEntry): OverlapType {
    if (this.mnStartPos >= next.mnEndPos || this.mnEndPos <= next.mnStartPos)
      return OverlapType.NO_OVERLAP;
    if (this.mnEndPos < next.mnEndPos) return OverlapType.OVERLAP1;
    if (this.mnStartPos <= next.mnStartPos) return OverlapType.OVERLAP2;
    return OverlapType.OVERLAP3;
  }
}
/** Resolves original native flat cell boundaries before the browser paint device sees them. */
export class SwTabFramePainter {
  private readonly maVertLines = new Map<number, SwLineEntry[]>();
  private readonly maHoriLines = new Map<number, SwLineEntry[]>();
  /** Traverses source cell ownership in row order; grid coordinates adapt existing flat frames. @param table - Original native table. @returns Nothing. */
  public constructor(table: SwTable) {
    for (const [r, row] of table.GetTabLines().entries()) {
      for (const [c, cell] of row.GetTabBoxes().entries()) {
        const box = cell.GetBox(),
          left = new Style(box.GetLeft()),
          right = new Style(box.GetRight()),
          top = new Style(box.GetTop()),
          bottom = new Style(box.GetBottom());
        right.MirrorSelf();
        bottom.MirrorSelf();
        this.Insert(new SwLineEntry(c, r, r + 1, c === 0, left), false);
        this.Insert(
          new SwLineEntry(c + 1, r, r + 1, c === row.GetTabBoxes().length - 1, right),
          false,
        );
        this.Insert(new SwLineEntry(r, c, c + 1, r === 0, top), true);
        this.Insert(
          new SwLineEntry(r + 1, c, c + 1, r === table.GetTabLines().length - 1, bottom),
          true,
        );
      }
    }
  }
  /** Performs native ordered-set splitting; std::max(new,old) keeps the new style on a tie. @param input - Original interval. @param horizontal - Native line family. @returns Nothing. */
  public Insert(input: SwLineEntry, horizontal: boolean): void {
    const map = horizontal ? this.maHoriLines : this.maVertLines;
    let entries = map.get(input.mnKey);
    if (entries === undefined) {
      entries = [];
      map.set(input.mnKey, entries);
    }
    const next = input;
    for (let i = 0; i < entries.length && next.mnStartPos < next.mnEndPos;) {
      const old = entries[i] as SwLineEntry,
        overlap = old.Overlaps(next);
      const winner = next.maAttribute.lessThan(old.maAttribute)
        ? old.maAttribute
        : next.maAttribute;
      if (overlap === OverlapType.NO_OVERLAP) {
        i++;
        continue;
      }
      const replacements: SwLineEntry[] = [];
      if (overlap === OverlapType.OVERLAP1) {
        replacements.push(
          new SwLineEntry(
            next.mnKey,
            old.mnStartPos,
            next.mnStartPos,
            old.mbOuter,
            old.maAttribute,
          ),
          new SwLineEntry(next.mnKey, next.mnStartPos, old.mnEndPos, old.mbOuter, winner),
        );
        next.mnStartPos = old.mnEndPos;
      } else if (overlap === OverlapType.OVERLAP2) {
        replacements.push(
          new SwLineEntry(
            next.mnKey,
            old.mnStartPos,
            next.mnStartPos,
            old.mbOuter,
            old.maAttribute,
          ),
          new SwLineEntry(next.mnKey, next.mnStartPos, next.mnEndPos, old.mbOuter, winner),
          new SwLineEntry(next.mnKey, next.mnEndPos, old.mnEndPos, old.mbOuter, old.maAttribute),
        );
        next.mnStartPos = next.mnEndPos;
      } else {
        replacements.push(
          new SwLineEntry(
            next.mnKey,
            next.mnStartPos,
            old.mnStartPos,
            old.mbOuter,
            next.maAttribute,
          ),
          new SwLineEntry(next.mnKey, old.mnStartPos, next.mnEndPos, old.mbOuter, winner),
          new SwLineEntry(next.mnKey, next.mnEndPos, old.mnEndPos, old.mbOuter, old.maAttribute),
        );
        next.mnStartPos = next.mnEndPos;
      }
      entries.splice(
        i,
        1,
        ...replacements.filter(
          /** Omits native zero-length intervals. @param line - Split entry. @returns Whether nonempty. */
          (line) => line.mnStartPos < line.mnEndPos,
        ),
      );
      entries.sort(
        /** Uses native start-coordinate set ordering. @param a - First interval. @param b - Second interval. @returns Ordering. */
        (a, b) => a.mnStartPos - b.mnStartPos,
      );
      if (overlap === OverlapType.OVERLAP1) i = 0;
      else break;
    }
    if (next.mnStartPos < next.mnEndPos)
      entries.push(
        new SwLineEntry(next.mnKey, next.mnStartPos, next.mnEndPos, next.mbOuter, next.maAttribute),
      );
    entries.sort(
      /** Orders the final native intervals. @param a - First entry. @param b - Second entry. @returns Ordering. */
      (a, b) => a.mnStartPos - b.mnStartPos,
    );
  }
  /** Sends independent resolved entries to the paint device; never publishes mutable cached owners. @param paint - Browser paint boundary. @returns Nothing. */
  public PaintLines(paint: (line: SwLineEntry, horizontal: boolean) => void): void {
    for (const [horizontal, map] of [
      [false, this.maVertLines],
      [true, this.maHoriLines],
    ] as const)
      for (const entries of map.values())
        for (const line of entries)
          paint(
            new SwLineEntry(
              line.mnKey,
              line.mnStartPos,
              line.mnEndPos,
              line.mbOuter,
              line.maAttribute,
            ),
            horizontal,
          );
  }
}
