/** @fileoverview Actual chart collection subscriptions,UNO clients and reentrant scheduling through native documents and the browser platform timer. */
import { assert, beforeEach, afterEach, expect, it, vi } from "vitest";
import type { ScChartDataChangeEvent } from "../../../inc/chartlis";

/** Actual source APIs from one isolated process-static realm. */
type Native = typeof import("../../../inc/document") &
  typeof import("../../../inc/chartlis") &
  typeof import("../../../inc/address") &
  typeof import("../../../inc/rangelst") &
  typeof import("../../../../i18nlangtag/source/isolang/isolang.tables") &
  typeof import("../../../../vcl/inc/scheduler") &
  typeof import("../../../../vcl/browser/sal-timer");
let n: Native;
let documents: InstanceType<Native["ScDocument"]>[];
beforeEach(
  /** Initializes actual per-realm static ownership with controlled host time. @returns Initialization. */ async () => {
    vi.resetModules();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "performance", "Date"] });
    vi.advanceTimersByTime(1000);
    n = Object.assign(
      {},
      ...(await Promise.all([
        import("../../../inc/document"),
        import("../../../inc/chartlis"),
        import("../../../inc/address"),
        import("../../../inc/rangelst"),
        import("../../../../i18nlangtag/source/isolang/isolang.tables"),
        import("../../../../vcl/inc/scheduler"),
        import("../../../../vcl/browser/sal-timer"),
      ])),
    ) as Native;
    n.bindSchedulerPlatform(n.browserSchedulerPlatform);
    documents = [];
  },
);
afterEach(
  /** Destroys real documents before static scheduler shutdown. @returns Nothing. */ () => {
    for (const doc of documents) doc.Dispose();
    n.Scheduler.ImplDeInitScheduler();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  },
);
/** Creates a genuine document and sheet. @param mode - Native mode. @returns Owner. */
function document(mode = n.ScDocumentMode.SCDOCMODE_DOCUMENT) {
  const doc = new n.ScDocument(mode),
    name = n.unicode("Data");
  doc.InsertTab(0, name);
  name.dispose();
  documents.push(doc);
  return doc;
}
/** Creates an actual collection-owned UNO chart listener. @param doc - Owner. @param name - Key. @param callback - Real callback client. @param range - Native geometry. @returns Listener. */
function listen(
  doc: InstanceType<Native["ScDocument"]>,
  name: string,
  callback: (event: ScChartDataChangeEvent) => void,
  range = new n.ScRange(1, 2, 0, 1, 2, 0),
) {
  const key = n.unicode(name),
    listener = new n.ScChartListener(key, doc, new n.ScRangeList(range));
  key.dispose();
  listener.SetUno({ chartDataChanged: callback }, null);
  const collection = doc.GetChartListenerCollection();
  assert(collection);
  expect(collection.insert(listener)).toBe(true);
  return listener;
}
it("allocates native collections only in ordinary/function-access modes and saturates interpreter nesting", /** Exercises original mode resources and unsigned-short guards. @returns Nothing. */ () => {
  for (const mode of Object.values(n.ScDocumentMode).filter(
    /** Selects original numeric modes from the enum. @param v - Enum entry. @returns Numeric mode. */
    (v): v is number => typeof v === "number",
  )) {
    const doc = document(mode);
    expect(doc.GetChartListenerCollection() !== null).toBe(mode === 0 || mode === 3);
    expect(doc.IsImportingXML()).toBe(false);
    expect(doc.IsInDtorClear()).toBe(false);
    doc.DecInterpretLevel();
    expect(doc.IsInInterpreter()).toBe(false);
    for (let i = 0; i < 65536; ++i) doc.IncInterpretLevel();
    for (let i = 0; i < 65534; ++i) doc.DecInterpretLevel();
    expect(doc.IsInInterpreter()).toBe(true);
    doc.DecInterpretLevel();
    expect(doc.IsInInterpreter()).toBe(false);
  }
});
it("delivers real cell and area changes as native ALL events and replaces subscriptions", /** Genuine document broadcasts traverse actual listeners and the actual Idle. @returns Nothing. */ () => {
  const doc = document(),
    events: ScChartDataChangeEvent[] = [],
    listener = listen(
      doc,
      "Point",
      /** Records actual UNO data changes. @param event - Native event. @returns Recorded length. */ (
        event,
      ) => events.push(event),
    ),
    collection = doc.GetChartListenerCollection();
  assert(collection);
  collection.StartAllListeners();
  expect(listener.HasBroadcaster()).toBe(true);
  expect(listener.IsUno()).toBe(true);
  expect(listener.GetUnoListener()).not.toBeNull();
  expect(listener.GetUnoSource()).toBeNull();
  doc.SetValue(new n.ScAddress(1, 2, 0), 9);
  expect(listener.IsDirty()).toBe(true);
  expect(events).toEqual([]);
  vi.advanceTimersByTime(10);
  expect(events).toEqual([
    { Source: null, Type: 0, StartColumn: 0, EndColumn: 0, StartRow: 0, EndRow: 0 },
  ]);
  const area = new n.ScRangeList(new n.ScRange(4, 3, 0, 7, 8, 0));
  listener.ChangeListening(area, true);
  expect(listener.IsDirty()).toBe(true);
  listener.ChangeListening(area, false);
  expect(listener.IsDirty()).toBe(true);
  listener.SetDirty(false);
  doc.SetValue(new n.ScAddress(1, 2, 0), 10);
  expect(listener.IsDirty()).toBe(false);
  doc.SetValue(new n.ScAddress(5, 4, 0), 11);
  expect(listener.IsDirty()).toBe(true);
  vi.advanceTimersByTime(10);
  expect(events).toHaveLength(2);
  listener.EndListeningTo();
  expect(listener.HasBroadcaster()).toBe(false);
  collection.removeByName(listener.GetName());
  expect(collection.hasListeners()).toBe(false);
});
it("defers real callbacks during interpretation and respects native manual-calculation policy", /** Explicit unsupported drawing ownership stays observable. @returns Nothing. */ () => {
  const doc = document(),
    events: ScChartDataChangeEvent[] = [],
    listener = listen(
      doc,
      "Uno",
      /** Records actual UNO data changes. @param event - Native event. @returns Recorded length. */ (
        event,
      ) => events.push(event),
    ),
    collection = doc.GetChartListenerCollection();
  assert(collection);
  doc.IncInterpretLevel();
  listener.SetDirty(true);
  collection.UpdateDirtyCharts();
  expect(events).toEqual([]);
  expect(listener.IsDirty()).toBe(true);
  doc.DecInterpretLevel();
  vi.advanceTimersByTime(10);
  expect(events).toHaveLength(1);
  const key = n.unicode("Draw"),
    plain = new n.ScChartListener(key, doc, []);
  key.dispose();
  expect(plain.IsUno()).toBe(false);
  expect(plain.GetUnoListener()).toBeNull();
  expect(plain.GetUnoSource()).toBeNull();
  doc.SetAutoCalc(false);
  plain.SetDirty(true);
  plain.Update();
  expect(plain.IsDirty()).toBe(true);
  doc.SetAutoCalc(true);
  expect(
    /** Admits the actual drawing-backed path. @returns Nothing. */ () => plain.Update(),
  ).toThrow("drawing-layer owner");
  expect(plain.IsDirty()).toBe(false);
  plain.Dispose();
});
it("uses native value ordering and interrupts iteration after reentrant insertion or removal", /** UNO clients modify the actual collection during notification. @returns Nothing. */ () => {
  const doc = document(),
    calls: string[] = [],
    collection = doc.GetChartListenerCollection();
  assert(collection);
  listen(
    doc,
    "z",
    /** Records actual callback delivery. @returns Recorded length. */ () => calls.push("z"),
  );
  listen(
    doc,
    "a",
    /** Reenters the native collection. @returns Nothing. */ () => {
      calls.push("a");
      listen(
        doc,
        "m",
        /** Records actual callback delivery. @returns Recorded length. */ () => calls.push("m"),
      );
    },
  );
  collection.SetDirty();
  vi.advanceTimersByTime(10);
  expect(calls).toEqual(["a"]);
  collection.UpdateDirtyCharts();
  expect(calls).toEqual(["a", "z"]);
  const name = n.unicode("a");
  collection.removeByName(name);
  name.dispose();
  listen(
    doc,
    "b",
    /** Reenters the native collection. @returns Nothing. */ () => {
      calls.push("b");
      const missing = n.unicode("missing");
      collection.removeByName(missing);
      missing.dispose();
    },
  );
  collection.SetDirty();
  vi.advanceTimersByTime(10);
  expect(calls).toEqual(["a", "z", "b"]);
  collection.UpdateDirtyCharts();
  expect(calls).toEqual(["a", "z", "b", "m", "z"]);
});
it("copies an empty collection,owns duplicate insertions and reuses subscription identities", /** Original copy construction does not duplicate listeners. @returns Nothing. */ () => {
  const doc = document(),
    collection = doc.GetChartListenerCollection();
  assert(collection);
  expect(collection.hasListeners()).toBe(false);
  const key = n.unicode("Same"),
    ranges = new n.ScRangeList(new n.ScRange(0, 0, 0, 2, 2, 0));
  expect(collection.findByName(key)).toBeNull();
  collection.ChangeListening(key, ranges);
  const original = collection.findByName(key);
  assert(original);
  original.SetUsed(true);
  original.SetDirty(true);
  collection.ChangeListening(key, ranges);
  expect(collection.findByName(key)).toBe(original);
  expect([original.IsUsed(), original.IsDirty()]).toEqual([true, true]);
  const duplicate = new n.ScChartListener(key, doc, ranges);
  duplicate.StartListeningTo();
  expect(collection.insert(duplicate)).toBe(false);
  expect(duplicate.HasBroadcaster()).toBe(false);
  const copy = new n.ScChartListenerCollection(collection);
  expect(copy.hasListeners()).toBe(false);
  copy.SetDirty();
  copy.Dispose();
  collection.removeByName(key);
  collection.removeByName(key);
  key.dispose();
});
it("intersects actual listener ranges and retains copied hidden ranges without owning clients", /** Multiple intersecting registrations notify the same borrowed client separately. @returns Nothing. */ () => {
  const doc = document(),
    calls: ScChartDataChangeEvent[] = [],
    collection = doc.GetChartListenerCollection();
  assert(collection);
  const chart = listen(
    doc,
    "Chart",
    /** Records actual UNO data changes. @param event - Native event. @returns Recorded length. */ (
      event,
    ) => calls.push(event),
  );
  /** Actual externally owned native notification client. */
  class Hidden extends n.ScChartHiddenRangeListener {
    count = 0;
    /** Receives native range notification. @returns Nothing. */ notify(): void {
      ++this.count;
    }
  }
  const hidden = new Hidden(),
    range = new n.ScRange(1, 2, 0, 2, 3, 0);
  collection.StartListeningHiddenRange(range, hidden);
  collection.StartListeningHiddenRange(range, hidden);
  range.aStart.SetCol(9);
  collection.SetRangeDirty(new n.ScRange(0, 0, 0, 0, 0, 0));
  expect(hidden.count).toBe(0);
  expect(chart.IsDirty()).toBe(false);
  collection.SetRangeDirty(new n.ScRange(1, 2, 0, 1, 2, 0));
  expect(hidden.count).toBe(2);
  vi.advanceTimersByTime(10);
  expect(calls).toHaveLength(1);
  collection.EndListeningHiddenRange(hidden);
  collection.SetRangeDirty(new n.ScRange(1, 2, 0, 1, 2, 0));
  expect(hidden.count).toBe(2);
  hidden.Dispose();
});
it("rechecks host input in TimerHdl and preserves an interfering Idle restart", /** Actual host capability flags distinguish scheduler and chart-handler admission. @returns Nothing. */ () => {
  let blocked = true;
  const flags: boolean[] = [];
  vi.stubGlobal("navigator", {
    scheduling: {
      /** Exposes controlled host input capability. @param options - Host policy. @returns Pending. */
      isInputPending: ({ includeContinuous }: { includeContinuous: boolean }) => {
        flags.push(includeContinuous);
        if (!includeContinuous && blocked) {
          blocked = false;
          return true;
        }
        return false;
      },
    },
  });
  expect(n.isSchedulerInputPending()).toBe(false);
  const doc = document(),
    calls: ScChartDataChangeEvent[] = [],
    collection = doc.GetChartListenerCollection();
  assert(collection);
  const a = listen(
    doc,
    "a",
    /** Restarts the native Idle during callback. @param event - Native event. @returns Nothing. */ (
      event,
    ) => {
      calls.push(event);
      collection.StartTimer();
    },
  );
  const b = listen(
    doc,
    "b",
    /** Records actual UNO data changes. @param event - Native event. @returns Recorded length. */ (
      event,
    ) => calls.push(event),
  );
  a.SetDirty(true);
  b.SetDirty(true);
  collection.StartTimer();
  collection.UpdateDirtyCharts();
  expect(calls).toHaveLength(1);
  expect(b.IsDirty()).toBe(true);
  vi.advanceTimersByTime(10);
  expect(calls).toHaveLength(2);
  expect(flags).toContain(false);
});
it("ignores unrelated/dying hints and rejects unsupported external subscriptions", /** Scalar tokens are skipped while actual external owners fail at admission. @returns Completion. */ async () => {
  const [
    { SfxHint, SfxHintId },
    { FormulaDoubleToken },
    { ScExternalSingleRefToken },
    { ScSingleRefData },
  ] = await Promise.all([
    import("../../../../svl/inc/hint"),
    import("../../../../formula/inc/token"),
    import("../../../inc/token"),
    import("../../../inc/refdata"),
  ]);
  const doc = document(),
    key = n.unicode("Plain"),
    scalar = new FormulaDoubleToken(3),
    listener = new n.ScChartListener(key, doc, [scalar]);
  listener.Notify(new SfxHint(SfxHintId.Dying));
  listener.Notify({ kind: "dying" });
  listener.StartListeningTo();
  listener.EndListeningTo();
  expect(listener.IsDirty()).toBe(false);
  listener.Dispose();
  scalar.dispose();
  const shared = doc.GetSharedStringPool().intern(key),
    data = new ScSingleRefData();
  data.InitAddress(new n.ScAddress());
  const token = new ScExternalSingleRefToken(1, shared, data),
    external = new n.ScChartListener(key, doc, [token]);
  expect(
    /** Admits the actual external-link path. @returns Nothing. */ () =>
      external.StartListeningTo(),
  ).toThrow("external-reference ownership");
  external.Dispose();
  token.dispose();
  shared.dispose();
  key.dispose();
});

it("notifies real chart listeners after native full-axis hidden geometry copying", /** The native table copy retains the source sheet index in chart-dirty ranges. @returns Completion. */ async () => {
  const [{ CopyToDocContext }, { InsertDeleteFlags, ScCloneFlags }] = await Promise.all([
    import("../../../inc/clipcontext"),
    import("../../../inc/global"),
  ]);
  const doc = document(),
    name = n.unicode("Target");
  doc.InsertTab(1, name);
  name.dispose();
  const source = doc.FetchTable(0),
    target = doc.FetchTable(1);
  assert(source && target);
  const calls: ScChartDataChangeEvent[] = [];
  listen(
    doc,
    "Geometry",
    /** Receives actual queued geometry data changes. @param event - Native event. @returns Recorded length. */ (
      event,
    ) => calls.push(event),
  );
  source.SetColWidth(1, 444);
  source.SetColHidden(1, 1, true);
  source.CopyToTable(
    new CopyToDocContext(doc),
    1,
    0,
    2,
    doc.MaxRow(),
    InsertDeleteFlags.NONE,
    false,
    target,
    null,
    false,
    true,
    ScCloneFlags.Default,
    true,
  );
  expect(target.ColHidden(1)).toBe(true);
  expect(target.GetColWidth(1, false)).toBe(444);
  vi.advanceTimersByTime(10);
  expect(calls).toHaveLength(1);
  source.SetRowHeightOnly(1, 3, 300);
  source.SetRowHidden(2, 2, true);
  source.getFilterData().setRowFiltered(3, 3, true);
  source.CopyToTable(
    new CopyToDocContext(doc),
    0,
    1,
    doc.MaxCol(),
    3,
    InsertDeleteFlags.NONE,
    false,
    target,
    null,
    false,
    true,
    ScCloneFlags.Default,
    true,
  );
  expect(target.RowHidden(2)).toBe(true);
  expect(target.GetRowHeight(1, 3, false)).toBe(900);
  expect(target.getFilterData().rowFiltered(3)).toBe(true);
  vi.advanceTimersByTime(10);
  expect(calls).toHaveLength(2);
});
