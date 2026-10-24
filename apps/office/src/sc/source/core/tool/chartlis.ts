/** @fileoverview Native chartlis.cxx ownership,local range listening,UNO event projection and Idle collection scheduling. External-link and drawing-chart loading owners remain unported. */
import { SvtListener } from "../../../../svl/source/notify/listener";
import type { SvtDyingHint } from "../../../../svl/source/notify/listener";
import { SfxHintId, type SfxHint } from "../../../../svl/inc/hint";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { ScRangeList } from "../../../inc/rangelst";
import type { ScTokenRef } from "../../../inc/types";
import {
  getRangeListFromTokens,
  getTokensFromRangeList,
  getRangeFromToken,
  isRef,
  isExternalRef,
} from "../../../inc/reftokenhelper";
import type { FormulaToken } from "../../../../formula/inc/token";
import { Idle } from "../../../../vcl/inc/idle";
import { TaskPriority } from "../../../../vcl/inc/task";
import { isSchedulerInputPending } from "../../../../vcl/inc/scheduler";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Consumed ChartDataChangeEvent.idl fields;the native ALL event has enum value0 and all four short coordinates0. Source is an opaque nullable UNO-reference identity. */
export interface ScChartDataChangeEvent {
  readonly Source: object | null;
  readonly Type: 0;
  readonly StartColumn: 0;
  readonly EndColumn: 0;
  readonly StartRow: 0;
  readonly EndRow: 0;
}
/** Native chartDataChanged callback projection;this interface does not implement a chart renderer or XChartData service. */
export interface ScChartDataChangeListener {
  /** Receives the actual native ALL event. @param event - Changed data. @returns Nothing. */
  chartDataChanged(event: ScChartDataChangeEvent): void;
}
/** Original local ScChartUnoData owns only the listener/source reference identities. */
class ScChartUnoData {
  /** Original reference-value construction. @param xListener - Actual callback. @param xSource - Opaque source reference. @returns Owner. */
  constructor(
    private readonly xListener: ScChartDataChangeListener,
    private readonly xSource: object | null,
  ) {}
  /** Borrows the original listener. @returns Callback identity. */
  GetListener(): ScChartDataChangeListener {
    return this.xListener;
  }
  /** Borrows the original source. @returns Reference identity. */
  GetSource(): object | null {
    return this.xSource;
  }
}

/** Original listener's name,document,token vector and independent used/dirty flags. */
export class ScChartListener extends SvtListener<SfxHint> {
  private readonly maName: OUString;
  private maTokens: ScTokenRef[];
  private bUsed = false;
  private bDirty = false;
  private pUnoData: ScChartUnoData | null = null;

  /** Original range-list and by-value token-vector overloads. Tokens retain their actual native identity under the shared GC adaptation. @param name - Original name value. @param mrDoc - Actual document owner. @param source - Original ranges or copied vector. @returns Listener. */
  constructor(
    name: OUStringConstReference,
    private readonly mrDoc: ScDocument,
    source: ScRangeList | readonly ScTokenRef[],
  ) {
    super();
    this.maName = new OUString(name);
    if (source instanceof ScRangeList) {
      this.maTokens = [];
      getTokensFromRangeList(mrDoc, this.maTokens, source);
    } else this.maTokens = [...source];
  }
  /** Borrows the original stable name member. @returns Const name reference. */
  GetName(): OUStringConstReference {
    return this.maName;
  }
  /** Reads the original unused-by-default state. @returns Used flag. */
  IsUsed(): boolean {
    return this.bUsed;
  }
  /** Stores the original used flag independently of dirtiness. @param used - New value. @returns Nothing. */
  SetUsed(used: boolean): void {
    this.bUsed = used;
  }
  /** Reads original clean-by-default state. @returns Dirty flag. */
  IsDirty(): boolean {
    return this.bDirty;
  }
  /** Stores the original dirty flag without implicitly starting the collection timer. @param dirty - New value. @returns Nothing. */
  SetDirty(dirty: boolean): void {
    this.bDirty = dirty;
  }
  /** Original UNO callback/source reference assignment. @param listener - Actual callback client. @param source - Native opaque source identity. @returns Nothing. */
  SetUno(listener: ScChartDataChangeListener, source: object | null): void {
    this.pUnoData = new ScChartUnoData(listener, source);
  }
  /** Original UNO ownership query. @returns Whether data owner exists. */
  IsUno(): boolean {
    return this.pUnoData !== null;
  }
  /** Original nullable listener query. @returns Actual client or null. */
  GetUnoListener(): ScChartDataChangeListener | null {
    return this.pUnoData?.GetListener() ?? null;
  }
  /** Original nullable source query. @returns Actual reference or null. */
  GetUnoSource(): object | null {
    return this.pUnoData?.GetSource() ?? null;
  }
  /** Original data-change admission ignores all other hints,including the shared broadcaster's native-Dying transport. @param hint - Actual hint. @returns Nothing. */
  override Notify(hint: SfxHint | SvtDyingHint): void {
    if ("GetId" in hint && hint.GetId() === SfxHintId.ScDataChanged) this.SetUpdateQueue();
  }
  /** Original dirty/Idle scheduling order. @returns Nothing. */
  SetUpdateQueue(): void {
    this.bDirty = true;
    (this.mrDoc.GetChartListenerCollection() as ScChartListenerCollection).StartTimer();
  }
  /** Original interpreter deferral,UNO ALL notification and manual-calculation policy. Drawing-backed chart loading remains an explicit unsupported owner. @returns Nothing. */
  Update(): void {
    if (this.mrDoc.IsInInterpreter()) {
      (this.mrDoc.GetChartListenerCollection() as ScChartListenerCollection).StartTimer();
      return;
    }
    if (this.pUnoData) {
      this.bDirty = false;
      this.pUnoData.GetListener().chartDataChanged({
        Source: this.pUnoData.GetSource(),
        Type: 0,
        StartColumn: 0,
        EndColumn: 0,
        StartRow: 0,
        EndRow: 0,
      });
    } else if (this.mrDoc.GetAutoCalc()) {
      this.bDirty = false;
      throw Error("Native chart loading requires the document drawing-layer owner");
    }
  }
  /** Original StartEndListening local-reference dispatch through actual document cell/area broadcasters. @param start - Start or end. @returns Nothing. */
  private StartEndListening(start: boolean): void {
    for (const entry of this.maTokens) {
      const token = entry as FormulaToken;
      if (!isRef(token)) continue;
      if (isExternalRef(token))
        throw Error("External chart listening requires native external-reference ownership");
      const range = new ScRange();
      getRangeFromToken(this.mrDoc, range, token, new ScAddress());
      if (range.aStart.equals(range.aEnd)) {
        if (start) this.mrDoc.StartListeningCell(range.aStart, this);
        else this.mrDoc.EndListeningCell(range.aStart, this);
      } else if (start) this.mrDoc.StartListeningArea(range, false, this);
      else this.mrDoc.EndListeningArea(range, false, this);
    }
  }
  /** Original starts all represented native references. @returns Nothing. */
  StartListeningTo(): void {
    this.StartEndListening(true);
  }
  /** Original ends the same actual cell/area registrations. @returns Nothing. */
  EndListeningTo(): void {
    this.StartEndListening(false);
  }
  /** Original replaces subscriptions and only sets dirtiness when requested. @param ranges - Actual new ranges. @param dirty - Original flag. @returns Nothing. */
  ChangeListening(ranges: ScRangeList, dirty: boolean): void {
    this.EndListeningTo();
    this.SetRangeList(ranges);
    this.StartListeningTo();
    if (dirty) this.SetDirty(true);
  }
  /** Original allocates a fresh list and extracts at the default origin with default internal-reference admission. @returns Independent range values. */
  GetRangeList(): ScRangeList {
    const result = new ScRangeList();
    getRangeListFromTokens(this.mrDoc, result, this.maTokens, new ScAddress());
    return result;
  }
  /** Original converts into a new vector then swaps without changing flags,name or document. @param ranges - Actual source ranges. @returns Nothing. */
  SetRangeList(ranges: ScRangeList): void {
    const tokens: ScTokenRef[] = [];
    getTokensFromRangeList(this.mrDoc, tokens, ranges);
    this.maTokens = tokens;
  }
  /** Original equality compares document,name,flags,emptiness and token pointer identities,not numerical range equality. @param other - Native listener. @returns Equal. */
  equals(other: ScChartListener): boolean {
    const first = this.maTokens.length !== 0,
      second = other.maTokens.length !== 0;
    if (
      this.mrDoc !== other.mrDoc ||
      this.bUsed !== other.bUsed ||
      this.bDirty !== other.bDirty ||
      !this.GetName().equals(other.GetName()) ||
      first !== second
    )
      return false;
    if (!first && !second) return true;
    return (
      this.maTokens.length === other.maTokens.length &&
      this.maTokens.every(
        /** Native intrusive-pointer vector comparison preserves pointee identity. @param token - Actual token. @param index - Position. @returns Same token. */
        (token, index) => token === other.maTokens[index],
      )
    );
  }
  /** Original inequality delegates to equality. @param other - Native listener. @returns Unequal. */
  notEquals(other: ScChartListener): boolean {
    return !this.equals(other);
  }
  /** Original subscriptions end before reference members and the inherited listener are destroyed. @returns Nothing. */
  override Dispose(): void {
    if (this.HasBroadcaster()) this.EndListeningTo();
    this.pUnoData = null;
    this.maName.dispose();
    super.Dispose();
  }
}

/** Original externally owned hidden-range notification client. */
export abstract class ScChartHiddenRangeListener {
  /** Native pure virtual notification. @returns Nothing. */
  abstract notify(): void;
  /** Original empty virtual destructor;the collection never destroys this client. @returns Nothing. */
  Dispose(): void {}
}

/** Original source update state. */
enum UpdateStatus {
  SC_CLCUPDATE_NONE,
  SC_CLCUPDATE_RUNNING,
  SC_CLCUPDATE_MODIFIED,
}

/** Actual native chart-listener collection and repaint-priority Idle;drawing/name allocation and external/UNO service management remain separate unported responsibilities. */
export class ScChartListenerCollection {
  private readonly m_Listeners = new Map<string, ScChartListener>();
  private readonly maHiddenListeners = new Map<ScChartHiddenRangeListener, ScRange[]>();
  private meModifiedDuringUpdate = UpdateStatus.SC_CLCUPDATE_NONE;
  private readonly aIdle = new Idle("sc::ScChartListenerCollection aIdle");
  private readonly rDoc: ScDocument;

  /** Original copy constructor keeps the same document and creates an empty collection,just like the normal constructor's default containers. @param source - Actual document or collection. @returns Collection. */
  constructor(source: ScDocument | ScChartListenerCollection) {
    this.rDoc = source instanceof ScChartListenerCollection ? source.rDoc : source;
    this.aIdle.SetInvokeHandler(
      /** Original TimerHdl link. @returns Nothing. */ () => this.TimerHdl(),
    );
    this.aIdle.SetPriority(TaskPriority.REPAINT);
  }
  /** Original std::map iteration order is UTF16 key order,rather than JS insertion order. @returns Sorted actual entries. */
  private entries(): [string, ScChartListener][] {
    return [...this.m_Listeners].sort(
      /** Compares native string values without locale collation. @param first - Entry. @param second - Entry. @returns Signed ordering. */
      (first, second) => Number(first[0] > second[0]) - Number(first[0] < second[0]),
    );
  }
  /** Original insert takes ownership even on duplicate failure;attempts during update invalidate iteration. @param listener - Transferred native owner. @returns Inserted. */
  insert(listener: ScChartListener): boolean {
    if (this.meModifiedDuringUpdate === UpdateStatus.SC_CLCUPDATE_RUNNING)
      this.meModifiedDuringUpdate = UpdateStatus.SC_CLCUPDATE_MODIFIED;
    const key = text(listener.GetName());
    if (this.m_Listeners.has(key)) {
      listener.Dispose();
      return false;
    }
    this.m_Listeners.set(key, listener);
    return true;
  }
  /** Original erase destroys the owned listener and marks update iteration modified even when no name matches. @param name - Actual key. @returns Nothing. */
  removeByName(name: OUStringConstReference): void {
    if (this.meModifiedDuringUpdate === UpdateStatus.SC_CLCUPDATE_RUNNING)
      this.meModifiedDuringUpdate = UpdateStatus.SC_CLCUPDATE_MODIFIED;
    const key = text(name),
      listener = this.m_Listeners.get(key);
    this.m_Listeners.delete(key);
    listener?.Dispose();
  }
  /** Original nullable lookup by value. @param name - Actual key. @returns Owned listener or null. */
  findByName(name: OUStringConstReference): ScChartListener | null {
    return this.m_Listeners.get(text(name)) ?? null;
  }
  /** Original native container query. @returns Nonempty. */
  hasListeners(): boolean {
    return this.m_Listeners.size !== 0;
  }
  /** Original starts all owned reference subscriptions. @returns Nothing. */
  StartAllListeners(): void {
    for (const [, listener] of this.entries()) listener.StartListeningTo();
  }
  /** Original reuse-or-create subscription replacement does not reset existing listener flags. @param name - Actual key. @param ranges - Native ranges. @returns Nothing. */
  ChangeListening(name: OUStringConstReference, ranges: ScRangeList): void {
    let listener = this.findByName(name);
    if (listener) {
      listener.EndListeningTo();
      listener.SetRangeList(ranges);
    } else {
      listener = new ScChartListener(name, this.rDoc, ranges);
      this.insert(listener);
    }
    listener.StartListeningTo();
  }
  /** Original schedules the actual repaint Idle. @returns Nothing. */
  StartTimer(): void {
    this.aIdle.Start();
  }
  /** Original keyboard-admission guard projected to non-continuous host input. @returns Nothing. */
  private TimerHdl(): void {
    if (isSchedulerInputPending(false)) {
      this.aIdle.Start();
      return;
    }
    this.UpdateDirtyCharts();
  }
  /** Original reentrant update loop stops on modified iteration or an interfering non-import Idle restart. @returns Nothing. */
  UpdateDirtyCharts(): void {
    this.meModifiedDuringUpdate = UpdateStatus.SC_CLCUPDATE_RUNNING;
    for (const [, listener] of this.entries()) {
      if (listener.IsDirty()) listener.Update();
      if ((this.meModifiedDuringUpdate as UpdateStatus) === UpdateStatus.SC_CLCUPDATE_MODIFIED)
        break;
      if (this.aIdle.IsActive() && !this.rDoc.IsImportingXML()) break;
    }
    this.meModifiedDuringUpdate = UpdateStatus.SC_CLCUPDATE_NONE;
  }
  /** Original marks every listener then starts the timer,including an empty collection. @returns Nothing. */
  SetDirty(): void {
    for (const [, listener] of this.entries()) listener.SetDirty(true);
    this.StartTimer();
  }
  /** Original intersects reconstructed references,starts Idle only for dirty chart listeners,then notifies externally owned hidden-range clients. @param range - Actual changed geometry. @returns Nothing. */
  SetRangeDirty(range: ScRange): void {
    let dirty = false;
    for (const [, listener] of this.entries()) {
      const ranges = listener.GetRangeList();
      if (ranges.Intersects(range)) {
        dirty = true;
        listener.SetDirty(true);
      }
    }
    if (dirty) this.StartTimer();
    for (const [listener, ranges] of this.maHiddenListeners)
      for (const hidden of ranges) if (hidden.Intersects(range)) listener.notify();
  }
  /** Original permits multiple copied ranges for the same externally owned client. @param range - Range value. @param listener - Borrowed client. @returns Nothing. */
  StartListeningHiddenRange(range: ScRange, listener: ScChartHiddenRangeListener): void {
    const ranges = this.maHiddenListeners.get(listener);
    if (ranges) ranges.push(new ScRange(range));
    else this.maHiddenListeners.set(listener, [new ScRange(range)]);
  }
  /** Original erases all registrations of the client without deleting it. @param listener - Borrowed client. @returns Nothing. */
  EndListeningHiddenRange(listener: ScChartHiddenRangeListener): void {
    this.maHiddenListeners.delete(listener);
  }
  /** Original listener destruction precedes Idle destruction because ending subscriptions may schedule a refresh. @returns Nothing. */
  Dispose(): void {
    for (const [, listener] of this.entries()) listener.Dispose();
    this.m_Listeners.clear();
    this.aIdle.Dispose();
  }
}
