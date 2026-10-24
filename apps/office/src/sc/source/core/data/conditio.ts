/** @fileoverview Native conditional-format ownership,copy ranges and live value-cache subscriptions;date evaluation,condition formulas and painting remain unported. */
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import type {
  RefUpdateContext,
  RefUpdateInsertTabContext,
  RefUpdateDeleteTabContext,
  RefUpdateMoveTabContext,
} from "../../../inc/refupdatecontext";
import { UpdateRefMode } from "../../../inc/global";
import { SvtListener, type SvtDyingHint } from "../../../../svl/source/notify/listener";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
/** Original ScFormatEntry::Type values. */
export enum ScFormatEntryType {
  Condition,
  ExtCondition,
  Colorscale,
  Databar,
  Iconset,
  Date,
}
/** Original native date-condition values;calendar evaluation is not represented by these copy owners. */
export enum ScCondFormatDateType {
  TODAY,
  YESTERDAY,
  TOMORROW,
  LAST7DAYS,
  THISWEEK,
  LASTWEEK,
  NEXTWEEK,
  THISMONTH,
  LASTMONTH,
  NEXTMONTH,
  THISYEAR,
  LASTYEAR,
  NEXTYEAR,
}
/** Original polymorphic entry owner;concrete date entries supply genuine copy state. */
export abstract class ScFormatEntry {
  static readonly Type = ScFormatEntryType;
  /** Retains the actual native document reference. @param mrDoc - Owner. @returns Entry. */
  constructor(protected readonly mrDoc: ScDocument) {}
  /** Original concrete type contract. @returns Native type. */
  abstract GetType(): ScFormatEntryType;
  /** Original copy contract. @param doc - Destination. @returns Independent owner. */
  abstract Clone(doc: ScDocument): ScFormatEntry;
  /** Original parent binding contract. @param parent - Conditional format. @returns Nothing. */
  abstract SetParent(parent: ScConditionalFormat | null): void;
  /** Original reference-update contract. @param context - Native update. @returns Nothing. */
  abstract UpdateReference(context: RefUpdateContext): void;
  /** Original insertion contract. @param context - Native update. @returns Nothing. */
  abstract UpdateInsertTab(context: RefUpdateInsertTabContext): void;
  /** Original deletion contract. @param context - Native update. @returns Nothing. */
  abstract UpdateDeleteTab(context: RefUpdateDeleteTabContext): void;
  /** Original move contract. @param context - Native update. @returns Nothing. */
  abstract UpdateMoveTab(context: RefUpdateMoveTabContext): void;
  /** Original default is false even for two equal date entries. @param _other - Compared entry. @param _ignore - Ignore source positions. @returns False. */
  IsEqual(_other: ScFormatEntry, _ignore: boolean): boolean {
    void _other;
    void _ignore;
    return false;
  }
  /** Binds original member destruction at explicit managed lifetime exit. @returns Nothing. */
  abstract Dispose(): void;
}
/** Original date-entry copying preserves enum/style state;calendar IsValid and its date cache remain unported. */
export class ScCondDateFormatEntry extends ScFormatEntry {
  private meType: ScCondFormatDateType;
  private readonly maStyleName: OUString;
  /** Binds original ordinary/copy constructors without copying evaluation cache state. @param doc - Actual owner. @param other - Optional source. @returns Entry. */
  constructor(doc: ScDocument, other?: ScCondDateFormatEntry) {
    super(doc);
    this.meType = other ? other.meType : ScCondFormatDateType.TODAY;
    this.maStyleName = other ? new OUString(other.maStyleName) : new OUString();
  }
  /** Original enum setter. @param value - Native date kind. @returns Nothing. */
  SetDateType(value: ScCondFormatDateType): void {
    this.meType = value;
  }
  /** Original enum getter. @returns Kind. */
  GetDateType(): ScCondFormatDateType {
    return this.meType;
  }
  /** Borrows the original style string. @returns Borrowed style. */
  GetStyleName(): OUStringConstReference {
    return this.maStyleName;
  }
  /** Original OUString copy assignment. @param value - Source style. @returns Nothing. */
  SetStyleName(value: OUStringConstReference): void {
    this.maStyleName.assign(value);
  }
  /** Original concrete discriminator. @returns Date. */
  override GetType(): ScFormatEntryType {
    return ScFormatEntryType.Date;
  }
  /** Original document-rebinding copy constructor. @param doc - New document. @returns Independent date entry. */
  override Clone(doc: ScDocument): ScCondDateFormatEntry {
    return new ScCondDateFormatEntry(doc, this);
  }
  /** Original date entries intentionally ignore parents. @param _parent - Native parent. @returns Nothing. */
  override SetParent(_parent: ScConditionalFormat | null): void {
    void _parent;
  }
  /** Original inline date-entry no-op. @param _context - Native update. @returns Nothing. */
  override UpdateReference(_context: RefUpdateContext): void {
    void _context;
  }
  /** Original inline date-entry no-op. @param _context - Native insertion. @returns Nothing. */
  override UpdateInsertTab(_context: RefUpdateInsertTabContext): void {
    void _context;
  }
  /** Original inline date-entry no-op. @param _context - Native deletion. @returns Nothing. */
  override UpdateDeleteTab(_context: RefUpdateDeleteTabContext): void {
    void _context;
  }
  /** Original inline date-entry no-op. @param _context - Native move. @returns Nothing. */
  override UpdateMoveTab(_context: RefUpdateMoveTabContext): void {
    void _context;
  }
  /** Releases the actual OUString member. @returns Nothing. */
  override Dispose(): void {
    this.maStyleName.dispose();
  }
}
/** Original native cache owns independent range values and reciprocal area subscriptions. */
export class ScColorFormatCache extends SvtListener<SfxHint> {
  readonly maRanges: ScRangeList;
  readonly maValues: number[] = [];
  /** Temporary documents retain no live area listeners. @param mrDoc - Owner. @param ranges - Source ranges. @returns Cache. */
  constructor(
    readonly mrDoc: ScDocument,
    ranges: ScRangeList,
  ) {
    super();
    this.maRanges = new ScRangeList(ranges);
    if (mrDoc.IsClipOrUndo()) return;
    for (const range of ranges) mrDoc.StartListeningArea(range, false, this);
  }
  /** Source Dying ends subscriptions;all other hints invalidate values. @param hint - Actual native hint or shared destruction binding. @returns Nothing. */
  override Notify(hint: SfxHint | SvtDyingHint): void {
    if ("kind" in hint || hint.GetId() === SfxHintId.Dying) {
      this.EndListeningAll();
      return;
    }
    this.maValues.length = 0;
  }
  /** Original derived destructor skips temporary area work;the implicit SvtListener base destructor still ends every inherited registration. @returns Nothing. */
  override Dispose(): void {
    if (!this.mrDoc.IsClipOrUndo()) this.EndListeningAll();
    super.Dispose();
  }
}
/** Original lcl_RangeContains checks individual enclosing ranges rather than union coverage. @param outer - Listening ranges. @param inner - Current format ranges. @returns Containment. */
function lcl_RangeContains(outer: ScRangeList, inner: ScRangeList): boolean {
  for (const range of inner) if (!outer.Contains(range)) return false;
  return true;
}
/** Original conditional format owns entries,ranges,key and a real subscribed cache. */
export class ScConditionalFormat {
  private readonly maEntries: ScFormatEntry[] = [];
  private readonly maRanges = new ScRangeList();
  private mpCache: ScColorFormatCache | null = null;
  /** Original unsigned key and document references. @param mnKey - Index in attributes. @param mrDoc - Actual owner. @returns Format. */
  constructor(
    private mnKey: number,
    private readonly mrDoc: ScDocument,
  ) {
    this.mnKey = mnKey >>> 0;
  }
  /** Native copy binds ranges before cloning entries for listener prerequisites. @param doc - Optional destination,null retains original document. @returns Independent owner. */
  Clone(doc: ScDocument | null = null): ScConditionalFormat {
    const result = new ScConditionalFormat(this.mnKey, doc ?? this.mrDoc);
    result.SetRange(this.maRanges);
    for (const entry of this.maEntries) {
      const copy = entry.Clone(doc ?? this.mrDoc);
      result.maEntries.push(copy);
      copy.SetParent(result);
    }
    return result;
  }
  /** Original ownership transfer and parent notification. @param entry - Owned native entry. @returns Nothing. */
  AddEntry(entry: ScFormatEntry): void {
    this.maEntries.push(entry);
    entry.SetParent(this);
  }
  /** Original source range value assignment then cache reset. @param ranges - Native ranges. @returns Nothing. */
  SetRange(ranges: ScRangeList): void {
    this.maRanges.assign(ranges);
    this.ResetCache();
  }
  /** Original borrowed range list. @returns Ranges. */
  GetRange(): ScRangeList {
    return this.maRanges;
  }
  /** Original mutable range-list access. @returns Ranges. */
  GetRangeList(): ScRangeList {
    return this.maRanges;
  }
  /** Original entry count. @returns Count. */
  size(): number {
    return this.maEntries.length;
  }
  /** Original no-entry query. @returns Empty. */
  IsEmpty(): boolean {
    return this.maEntries.length === 0;
  }
  /** Original document reference. @returns Owner. */
  GetDocument(): ScDocument {
    return this.mrDoc;
  }
  /** Original borrowed entry lookup. @param index - Native unsigned16 position. @returns Entry or null. */
  GetEntry(index: number): ScFormatEntry | null {
    return this.maEntries[index & 0xffff] ?? null;
  }
  /** Original attribute index getter. @returns Key. */
  GetKey(): number {
    return this.mnKey;
  }
  /** Original setter is valid before list insertion only. @param key - Native index. @returns Nothing. */
  SetKey(key: number): void {
    this.mnKey = key >>> 0;
  }
  /** Original entry equality intentionally ignores ranges. @param other - Compared owner. @param ignore - Ignore source positions,default false. @returns Equality. */
  EqualEntries(other: ScConditionalFormat, ignore = false): boolean {
    if (this.size() !== other.size()) return false;
    if (
      !this.maEntries.every(
        /** Original std::equal predicate retains entry order and source-position policy. @param entry - Source owner. @param index - Matching position. @returns Native entry equality. */ (
          entry,
          index,
        ) => entry.IsEqual(other.maEntries[index] as ScFormatEntry, ignore),
      )
    )
      return false;
    return true;
  }
  /** Original copy-as-move range update precedes entries;ordinary updates follow entries. @param context - Native context. @param copyAsMove - Original default false. @returns Nothing. */
  UpdateReference(context: RefUpdateContext, copyAsMove = false): void {
    if (context.meMode === UpdateRefMode.URM_COPY && copyAsMove) {
      this.maRanges.UpdateReference(
        UpdateRefMode.URM_MOVE,
        this.mrDoc,
        context.maRange,
        context.mnColDelta,
        context.mnRowDelta,
        context.mnTabDelta,
      );
      for (const entry of this.maEntries) entry.UpdateReference(context);
    } else {
      for (const entry of this.maEntries) entry.UpdateReference(context);
      this.maRanges.UpdateReference(
        context.meMode,
        this.mrDoc,
        context.maRange,
        context.mnColDelta,
        context.mnRowDelta,
        context.mnTabDelta,
      );
    }
    this.ResetCache();
  }
  /** Original sheet-local deletion derives the tab from the first range. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
  DeleteArea(col1: number, row1: number, col2: number, row2: number): void {
    if (this.maRanges.empty()) return;
    const tab = this.maRanges.at(0).aStart.Tab();
    this.maRanges.DeleteArea(col1, row1, tab, col2, row2, tab);
    this.ResetCache();
  }
  /** Original cache retains a listening superset and clears values;replacement constructs the new listener before destroying the old owner. @returns Nothing. */
  ResetCache(): void {
    if (
      this.mpCache &&
      this.mrDoc === this.mpCache.mrDoc &&
      lcl_RangeContains(this.mpCache.maRanges, this.maRanges)
    ) {
      this.mpCache.maValues.length = 0;
      return;
    }
    const next = this.maRanges.empty() ? null : new ScColorFormatCache(this.mrDoc, this.maRanges);
    this.mpCache?.Dispose();
    this.mpCache = next;
  }
  /** Original vector assignment preserves borrowed vector identity,including self-assignment. @param values - Source values. @returns Nothing. */
  SetCache(values: readonly number[]): void {
    if (!this.mpCache) this.ResetCache();
    if (this.mpCache) {
      const copy = Array.from(values);
      this.mpCache.maValues.length = 0;
      for (const value of copy) this.mpCache.maValues.push(value);
    }
  }
  /** Original borrowed vector pointer. @returns Values or null. */
  GetCache(): number[] | null {
    return this.mpCache?.maValues ?? null;
  }
  /** Binds original owned entry/cache member destruction. @returns Nothing. */
  Dispose(): void {
    for (const entry of this.maEntries) entry.Dispose();
    this.maEntries.length = 0;
    this.mpCache?.Dispose();
    this.mpCache = null;
  }
}
/** Native key-ordered unique collection;copy/clone owns real entries and independent subscriptions. */
export class ScConditionalFormatList implements Iterable<ScConditionalFormat> {
  private readonly m_ConditionalFormats = new Map<number, ScConditionalFormat>();
  /** Original public empty/same-document copy constructors. The private destination-copy body is bound inside Clone. @param source - Optional source list. @returns List. */
  constructor(source?: ScConditionalFormatList) {
    if (source) for (const format of source) this.InsertNew(format.Clone());
  }
  /** Original ordered unique-key iteration over the represented copy/check traversal. @returns Owned formats in key order. */
  [Symbol.iterator](): ArrayIterator<ScConditionalFormat> {
    return Array.from(this.m_ConditionalFormats.values())
      .sort(
        /** Original CompareScConditionalFormat key order. @param left - Owner. @param right - Owner. @returns Ordering. */ (
          left,
          right,
        ) => left.GetKey() - right.GetKey(),
      )
      .values();
  }
  /** Original destination-document clone. @param doc - Actual destination. @returns Independent list. */
  Clone(doc: ScDocument): ScConditionalFormatList {
    const copy = new ScConditionalFormatList();
    for (const format of this) copy.InsertNew(format.Clone(doc));
    return copy;
  }
  /** Original unique ownership insertion destroys a duplicate rejected owner. @param format - Owned format. @returns Nothing. */
  InsertNew(format: ScConditionalFormat): void {
    if (this.m_ConditionalFormats.has(format.GetKey())) format.Dispose();
    else this.m_ConditionalFormats.set(format.GetKey(), format);
  }
  /** Original keyed lookup with null when absent. @param key - Native attribute index. @returns Borrowed owner or null. */
  GetFormat(key: number): ScConditionalFormat | null {
    return this.m_ConditionalFormats.get(key >>> 0) ?? null;
  }
  /** Original empty-range validation calls the optional native callback before removing the owner. @param callback - Optional managed Link binding. @returns Whether all original entries were valid. */
  CheckAllEntries(callback: ((format: ScConditionalFormat) => void) | null = null): boolean {
    let valid = true;
    for (const format of this)
      if (format.GetRange().empty()) {
        valid = false;
        callback?.(format);
        this.erase(format.GetKey());
      }
    return valid;
  }
  /** Original list forwarding prunes empty ranges only for insert/delete updates. @param context - Native update inputs. @returns Nothing. */
  UpdateReference(context: RefUpdateContext): void {
    for (const format of this) format.UpdateReference(context);
    if (context.meMode === UpdateRefMode.URM_INSDEL) this.CheckAllEntries();
  }
  /** Original deletion delegates each real owner then removes empty range entries. @param col1 - First column. @param row1 - First row. @param col2 - Last column. @param row2 - Last row. @returns Nothing. */
  DeleteArea(col1: number, row1: number, col2: number, row2: number): void {
    for (const format of this) format.DeleteArea(col1, row1, col2, row2);
    this.CheckAllEntries();
  }
  /** Original union joins native ranges rather than bounding the whole list. @returns Independent range values. */
  GetCombinedRange(): ScRangeList {
    const result = new ScRangeList();
    for (const format of this) for (const range of format.GetRange()) result.Join(range);
    return result;
  }
  /** Original owned key removal. @param key - Native index. @returns Nothing. */
  erase(key: number): void {
    const format = this.m_ConditionalFormats.get(key);
    if (format) {
      this.m_ConditionalFormats.delete(key);
      format.Dispose();
    }
  }
  /** Original collection count. @returns Count. */
  size(): number {
    return this.m_ConditionalFormats.size;
  }
  /** Original empty query. @returns Empty. */
  empty(): boolean {
    return this.m_ConditionalFormats.size === 0;
  }
  /** Original owned container destruction. @returns Nothing. */
  Dispose(): void {
    for (const format of this.m_ConditionalFormats.values()) format.Dispose();
    this.m_ConditionalFormats.clear();
  }
}
