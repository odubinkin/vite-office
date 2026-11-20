/** @fileoverview Native Calc outline entries, level collections and sheet ownership. */
export const SC_OL_MAXDEPTH = 7;

/** One inclusive outline interval and its independent collapsed and control visibility flags. */
export class ScOutlineEntry {
  /** Constructs a native inclusive interval. @param start - First index. @param end - Last index. @param hidden - Collapsed state. @returns Group. */
  constructor(
    readonly start: number,
    readonly end: number,
    public hidden = false,
  ) {}
  visible = true;
}

/** One axis of a sheet outline with start-ordered, nonoverlapping entries per level. */
export class ScOutlineArray {
  private readonly collections: ScOutlineEntry[][] = [];

  /** Reads the stored maximum level count. @returns Depth. */
  GetDepth(): number {
    return this.collections.length;
  }

  /** Borrows one level in native start order. @param level - Zero-based level. @returns Entries. */
  GetEntries(level: number): readonly ScOutlineEntry[] {
    return this.collections[level] ?? [];
  }

  /** Copies the tree at its existing levels, including transient visibility. @param source - Source groups. @returns Nothing. */
  Assign(source: ScOutlineArray): void {
    if (source === this) return;
    this.collections.length = 0;
    for (let level = 0; level < source.GetDepth(); level++) {
      this.collections[level] = source.GetEntries(level).map(
        /** Copies one independently owned entry. @param entry - Source entry. @returns Copy. */
        (entry) =>
          Object.assign(new ScOutlineEntry(entry.start, entry.end, entry.hidden), {
            visible: entry.visible,
          }),
      );
    }
  }

  /** Removes overlapping entries at the deepest touched level, promoting their descendants. @param start - First index. @param end - Last index. @returns Whether changed. */
  Remove(start: number, end: number): boolean {
    const level = this.FindTouchedLevel(start, end) ?? 0;
    const removed = this.GetEntries(level).filter(
      /** Selects overlapping groups. @param entry - Group. @returns Whether it overlaps. */
      (entry) => start <= entry.end && end >= entry.start,
    );
    if (!removed.length) return false;
    const deleted = new Set(removed);
    this.collections[level] = this.GetEntries(level).filter(
      /** Keeps groups outside the marked span. @param entry - Group. @returns Whether retained. */
      (entry) => !deleted.has(entry),
    );
    for (const parent of removed) {
      for (let depth = level + 1; depth < this.GetDepth(); depth++) {
        const retained: ScOutlineEntry[] = [];
        for (const child of this.GetEntries(depth)) {
          if (parent.start <= child.start && child.end <= parent.end)
            this.insertAtLevel(child, depth - 1);
          else retained.push(child);
        }
        this.collections[depth] = retained;
      }
    }
    while (this.collections.length && !this.collections.at(-1)?.length) this.collections.pop();
    return true;
  }

  /** Finds the entry containing a position by the last preceding start. @param level - Level. @param position - Row or column. @returns Containing entry. */
  GetEntryByPos(level: number, position: number): ScOutlineEntry | undefined {
    const entries = this.GetEntries(level);
    let low = 0,
      high = entries.length;
    while (low < high) {
      const middle = (low + high) >>> 1;
      if ((entries[middle] as ScOutlineEntry).start <= position) low = middle + 1;
      else high = middle;
    }
    const entry = entries[low - 1];
    return entry && position <= entry.end ? entry : undefined;
  }

  /** Finds the deepest level containing either endpoint. @param start - First endpoint. @param end - Second endpoint. @returns Zero-based level or absence. */
  FindTouchedLevel(start: number, end: number): number | undefined {
    for (let level = this.GetDepth() - 1; level >= 0; --level)
      if (this.GetEntryByPos(level, start) || this.GetEntryByPos(level, end)) return level;
    return undefined;
  }

  /** Finds the highest containing entry below the insertion ceiling. @param position - Endpoint. @param ceiling - Exclusive level bound. @returns Next level and containing entry. */
  private FindEntry(
    position: number,
    ceiling = this.GetDepth(),
  ): readonly [number, ScOutlineEntry?] {
    for (let level = Math.min(ceiling, this.GetDepth()) - 1; level >= 0; --level) {
      const entry = this.GetEntryByPos(level, position);
      if (entry) return [level + 1, entry];
    }
    return [0];
  }

  /** Inserts a native group and demotes the covered groups that were already present. @param start - First position. @param end - Last position. @param hidden - Original collapsed flag. @returns Inserted group or absence. */
  Insert(start: number, end: number, hidden = false): ScOutlineEntry | undefined {
    if (start > end) return undefined;
    let [startLevel, startEntry] = this.FindEntry(start);
    let [endLevel, endEntry] = this.FindEntry(end);
    let ceiling = Math.max(startLevel, endLevel);
    while (startLevel !== endLevel || startEntry !== endEntry || startLevel >= SC_OL_MAXDEPTH) {
      if (ceiling === 0) return undefined;
      --ceiling;
      if (startEntry?.start === start) [startLevel, startEntry] = this.FindEntry(start, ceiling);
      if (endEntry?.end === end) [endLevel, endEntry] = this.FindEntry(end, ceiling);
    }
    for (let level = this.GetDepth() - 1; level >= startLevel; --level) {
      const entries = this.GetEntries(level);
      const move = entries.filter(
        /** Finds descendants within the inserted range. @param entry - Existing group. @returns Move flag. */
        (entry) => start <= entry.start && entry.start <= end,
      );
      if (move.length === 0) continue;
      if (level + 1 >= SC_OL_MAXDEPTH) return undefined;
      this.collections[level] = entries.filter(
        /** Retains the other groups at their current level. @param entry - Existing group. @returns Keep flag. */
        (entry) => entry.start < start || entry.start > end,
      );
      for (const entry of move) this.insertAtLevel(entry, level + 1);
    }
    const entry = new ScOutlineEntry(start, end, hidden);
    this.insertAtLevel(entry, startLevel);
    return entry;
  }

  /** Adds an entry in start order, with native first-wins duplicate starts. @param entry - New group. @param level - Target level. @returns Nothing. */
  private insertAtLevel(entry: ScOutlineEntry, level: number): void {
    const entries = (this.collections[level] ??= []);
    const index = entries.findIndex(
      /** Locates the first entry at or after the new start. @param existing - Existing entry. @returns Match. */
      (existing) => existing.start >= entry.start,
    );
    if (index < 0) entries.push(entry);
    else if (entries[index]?.start !== entry.start) entries.splice(index, 0, entry);
  }

  /** Sets subordinate control visibility using the first visible path when hidden groups must be skipped. @param level - Parent level. @param parent - Parent group. @param visible - Control visibility. @param skipHidden - Keep descendants of collapsed children closed. @returns Nothing. */
  SetVisibleBelow(
    level: number,
    parent: ScOutlineEntry,
    visible: boolean,
    skipHidden = false,
  ): void {
    for (let childLevel = level + 1; childLevel < this.GetDepth(); ++childLevel) {
      for (const child of this.GetEntries(childLevel)) {
        if (parent.start > child.start || child.end > parent.end) continue;
        child.visible = visible;
        if (skipHidden && !child.hidden) this.SetVisibleBelow(childLevel, child, visible, true);
      }
      if (skipHidden) break;
    }
  }

  /** Reconciles ODS row collapse flags with the native hidden row spans. @param lastHidden - Resolves the end of the hidden span starting here. @returns Nothing. */
  finalizeImport(lastHidden: (start: number) => number): void {
    for (let level = 0; level < this.GetDepth(); ++level)
      for (const entry of this.GetEntries(level)) {
        if (!entry.hidden) continue;
        entry.hidden = entry.end <= lastHidden(entry.start);
        this.SetVisibleBelow(level, entry, !entry.hidden, !entry.hidden);
      }
  }
}

/** Native sheet outline table keeps column and row levels independent. */
export class ScOutlineTable {
  private readonly columns = new ScOutlineArray();
  private readonly rows = new ScOutlineArray();
  /** Constructs an outline table or a detached copy for undo history. @param source - Optional source outline. @returns Table. */
  constructor(source?: ScOutlineTable) {
    if (source) {
      this.columns.Assign(source.columns);
      this.rows.Assign(source.rows);
    }
  }
  /** Borrows outline columns. @returns Column outline. */
  GetColArray(): ScOutlineArray {
    return this.columns;
  }
  /** Borrows outline rows. @returns Row outline. */
  GetRowArray(): ScOutlineArray {
    return this.rows;
  }
}
