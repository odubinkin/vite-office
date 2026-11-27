/** @fileoverview Native named and anonymous Calc database range data and ownership. */
import { ScRange } from "../../../inc/address";
import { GetCollator } from "./queryentry";
import { ScQueryParam } from "./queryparam";

/** Native scope discriminator for the three distinct database range containers. */
export enum ScDBRangeType {
  GlobalNamed,
  GlobalAnonymous,
  SheetAnonymous,
}

/** Owns a database range, the source flags and the native query descriptor. */
export class ScDBData {
  private readonly aUpper: string;
  private readonly area: ScRange;
  private query = new ScQueryParam();
  private advancedSource: ScRange | null = null;
  private nIndex = 0;
  private bAutoFilter = false;
  private bKeepFmt = false;
  private bDoSize = false;
  private bStripData = false;
  private bDBSelection = false;

  /** Creates the original range with its orientation and header flags. @param name - Database name. @param range - Area. @param byRow - Row-oriented data. @param hasHeader - Header flag. @param hasTotals - Totals flag. */
  constructor(
    private readonly name: string,
    range: ScRange,
    private readonly byRow = true,
    private readonly hasHeader = true,
    private readonly hasTotals = false,
  ) {
    this.aUpper = name.toUpperCase();
    this.area = new ScRange(range);
    this.area.SetTab(range.aStart.Tab());
  }

  /** Publishes the database range name. @returns Original name. */
  GetName(): string {
    return this.name;
  }

  /** Publishes the original lookup key. @returns Uppercase name. */
  GetUpperName(): string {
    return this.aUpper;
  }

  /** Writes the owned area into the requested range. @param output - Optional destination. @returns The copied range. */
  GetArea(output = new ScRange()): ScRange {
    return output.assign(this.area);
  }

  /** Publishes the container-assigned index. @returns Formula token index. */
  GetIndex(): number {
    return this.nIndex;
  }

  /** Sets the original unsigned16 index. @param index - Formula token index. */
  SetIndex(index: number): void {
    this.nIndex = index & 0xffff;
  }

  /** Publishes copied native query data with the owning area. @returns Independent query. */
  GetQueryParam(): ScQueryParam {
    const copy = this.query.Clone();
    copy.bByRow = this.byRow;
    copy.bHasHeader = this.hasHeader;
    copy.bHasTotals = this.hasTotals;
    copy.nTab = this.area.aStart.Tab();
    copy.nCol1 = this.area.aStart.Col();
    copy.nRow1 = this.area.aStart.Row();
    copy.nCol2 = this.area.aEnd.Col();
    copy.nRow2 = this.area.aEnd.Row();
    return copy;
  }

  /** Stores independent query data. @param query - Source query. */
  SetQueryParam(query: ScQueryParam): void {
    this.query = query.Clone();
    this.advancedSource = null;
  }

  /** Borrows the optional advanced source as an independent range. @returns Source area. */
  GetAdvancedQuerySource(): ScRange | null {
    return this.advancedSource && new ScRange(this.advancedSource);
  }

  /** Sets the advanced filter source. @param source - Optional source. */
  SetAdvancedQuerySource(source: ScRange | null): void {
    this.advancedSource = source && new ScRange(source);
  }

  /** Reads auto-filter button visibility. @returns Flag. */
  HasAutoFilter(): boolean {
    return this.bAutoFilter;
  }
  /** Sets auto-filter button visibility. @param flag - Source flag. */
  SetAutoFilter(flag: boolean): void {
    this.bAutoFilter = flag;
  }
  /** Reads the original format retention flag. @returns Flag. */
  IsKeepFmt(): boolean {
    return this.bKeepFmt;
  }
  /** Sets format retention. @param flag - Source flag. */
  SetKeepFmt(flag: boolean): void {
    this.bKeepFmt = flag;
  }
  /** Reads whether the range can grow or shrink by moving cells. @returns Flag. */
  IsDoSize(): boolean {
    return this.bDoSize;
  }
  /** Sets the move-on-size flag. @param flag - Source flag. */
  SetDoSize(flag: boolean): void {
    this.bDoSize = flag;
  }
  /** Reads whether export suppresses transient database data. @returns Flag. */
  IsStripData(): boolean {
    return this.bStripData;
  }
  /** Sets the transient database data flag. @param flag - Source flag. */
  SetStripData(flag: boolean): void {
    this.bStripData = flag;
  }
  /** Reads the import selection flag. @returns Flag. */
  HasImportSelection(): boolean {
    return this.bDBSelection;
  }
  /** Sets the import selection flag. @param flag - Source flag. */
  SetImportSelection(flag: boolean): void {
    this.bDBSelection = flag;
  }
}

/** Native named database ranges, ordered by the original uppercase collation. */
class NamedDBs {
  private readonly ranges: ScDBData[] = [];
  private nEntryIndex = 1;

  /** Adopts a new range and assigns an index even if its name is rejected. @param range - Candidate definition. @returns Whether inserted. */
  insert(range: ScDBData): boolean {
    if (!range.GetIndex()) range.SetIndex(this.nEntryIndex++);
    const compare = GetCollator().compare;
    const key = range.GetUpperName();
    let first = 0;
    let last = this.ranges.length;
    while (first < last) {
      const mid = (first + last) >>> 1;
      const candidate = this.ranges[mid] as ScDBData;
      if (compare(candidate.GetUpperName(), key) < 0) first = mid + 1;
      else last = mid;
    }
    const at = this.ranges[first];
    if (at && compare(at.GetUpperName(), key) === 0) return false;
    this.ranges.splice(first, 0, range);
    return true;
  }

  /** Finds the original uppercase query identity. @param name - Uppercase name. @returns Definition or null. */
  findByUpperName(name: string): ScDBData | null {
    return (
      this.ranges.find(
        /** Checks the original uppercase identity. @param entry - Database range. @returns Match. */
        (entry) => entry.GetUpperName() === name,
      ) ?? null
    );
  }

  /** Resolves a compiled database range index. @param index - Native index. @returns Definition or null. */
  findByIndex(index: number): ScDBData | null {
    return (
      this.ranges.find(
        /** Checks the owned index. @param entry - Database range. @returns Match. */
        (entry) => entry.GetIndex() === index,
      ) ?? null
    );
  }

  /** Borrows the ordered contents. @returns Native iterator. */
  [Symbol.iterator](): IterableIterator<ScDBData> {
    return this.ranges.values();
  }

  /** Reads the next native index for detached document transfer. @returns Next index. */
  GetNextIndex(): number {
    return this.nEntryIndex;
  }

  /** Restores the native index counter with the document. @param index - Snapshot index. */
  SetNextIndex(index: number): void {
    this.nEntryIndex = index;
  }

  /** Releases the named ranges. */
  clear(): void {
    this.ranges.length = 0;
  }
}

/** Native anonymous database ranges in insertion order. */
class AnonDBs {
  private readonly ranges: ScDBData[] = [];

  /** Adopts an anonymous definition. @param range - Range data. */
  insert(range: ScDBData): void {
    this.ranges.push(range);
  }

  /** Borrows the ordered contents. @returns Native iterator. */
  [Symbol.iterator](): IterableIterator<ScDBData> {
    return this.ranges.values();
  }

  /** Releases the anonymous ranges. */
  clear(): void {
    this.ranges.length = 0;
  }
}

/** Document-owned native database range collections. */
export class ScDBCollection {
  private readonly maNamedDBs = new NamedDBs();
  private readonly maAnonDBs = new AnonDBs();

  /** Borrows globally named ranges. @returns Native named container. */
  getNamedDBs(): NamedDBs {
    return this.maNamedDBs;
  }

  /** Borrows globally anonymous ranges. @returns Native anonymous container. */
  getAnonDBs(): AnonDBs {
    return this.maAnonDBs;
  }

  /** Releases contained data at document teardown. */
  clear(): void {
    this.maNamedDBs.clear();
    this.maAnonDBs.clear();
  }
}
