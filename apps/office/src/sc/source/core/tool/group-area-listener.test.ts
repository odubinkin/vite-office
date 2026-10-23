/** @fileoverview Source-bound selective shared-group notifications over actual column stores and segmented bulk spans. */
import { assert, expect, it, vi } from "vitest";
import { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { ScFormulaCell, ScFormulaCellGroup } from "../../../inc/formulacell";
import { StartListeningContext, EndListeningContext } from "../../../inc/listenercontext";
import { ScCompiler } from "../../../inc/compiler";
import { FormulaGroupAreaListener } from "../../../inc/grouparealistener";
import { ColumnSpanSet, type ColumnAction } from "../../../inc/columnspanset";
import { BulkDataHint } from "../../../inc/bulkdatahint";
import { RefQueryFormulaGroup, QueryRange } from "../../../inc/listenerquery";
import { ScRangeList } from "../../../inc/rangelst";
import { ScHint } from "../../../inc/brdcst";
import { ScBulkBroadcast, ScBroadcastArea } from "../inc/bcaslot";
import { SfxHint, SfxHintId } from "../../../../svl/inc/hint";
import {
  SvtQueryBase,
  SvtListener,
  type SvtDyingHint,
} from "../../../../svl/source/notify/listener";
import { FormulaGrammar } from "../../../../formula/inc/grammar";
import { unicode, text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { readOdsDocument, writeOdsDocument } from "../../filter/xml/xmlwrap";

/** Observes actual native broadcaster delivery without replacing the area machine or listener services. */
class HintObserver extends SvtListener<SfxHint> {
  readonly hints: SfxHint[] = [];
  /** Receives original hints and ignores shared lifecycle-only values. @param hint - Actual hint. @returns Nothing. */
  override Notify(hint: SfxHint | SvtDyingHint): void {
    if (hint instanceof SfxHint) this.hints.push(hint);
  }
}

/** Builds actual native group constructors in real column storage;automatic production column grouping remains separate acceptance. @param startFixed - Start policy. @param endFixed - End policy. @param wide - Reference both source columns. @param length - Actual contiguous group length. @returns Real owners. */
function fixture(startFixed = false, endFixed = false, wide = false, length = 4) {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  for (let row = 0; row < 10; row++) doc.SetValue(new ScAddress(0, row, 0), row + 1);
  const topPosition = new ScAddress(1, 10, 0),
    compiler = new ScCompiler(doc, topPosition, FormulaGrammar.Grammar.GRAM_NATIVE),
    code = compiler.CompileString(
      unicode(`=SUM(A${startFixed ? "$" : ""}3:${wide ? "B" : "A"}${endFixed ? "$" : ""}5)`),
    );
  compiler.CompileTokenArray();
  const group = new ScFormulaCellGroup(),
    cells: ScFormulaCell[] = [];
  group.setCode(code);
  group.mnLength = length;
  for (let offset = 0; offset < length; offset++) {
    const position = new ScAddress(1, 10 + offset, 0),
      cell = new ScFormulaCell(doc, position, group, doc.GetGrammar());
    if (!offset) group.mpTopCell = cell;
    doc
      .FetchTable(position.Tab())
      ?.CreateColumnIfNotExists(position.Col())
      .SetFormulaCell(position.Row(), cell);
    cells.push(cell);
  }
  // Native individual listening and native group listening are distinct admission paths.
  for (const cell of cells) cell.EndListeningTo(doc);
  const table = doc.FetchTable(0);
  assert(table);
  const column = table.FetchColumn(1);
  assert(column);
  const pointer = column.GetFormulaCellBlockAddress(10, [0]);
  assert(pointer);
  const range = new ScRange(0, 2, 0, wide ? 1 : 0, 4, 0),
    listener = group.getAreaListener(pointer, range, startFixed, endFixed);
  return { doc, group, cells, column, pointer, range, listener };
}
/** Observes selected actual formula positions. @param listener - Real listener. @param first - First changed row. @param last - Last changed row. @returns Selected rows. */
function selected(listener: FormulaGroupAreaListener, first: number, last = first): number[] {
  const cells: ScFormulaCell[] = [];
  listener.collectFormulaCells(0, 0, first, last, cells);
  return cells.map(
    /** Reads actual formula position. @param cell - Selected cell. @returns Row. */ (cell) =>
      cell.aPos.Row(),
  );
}
it("retains all four original fixed/relative selection branches including fixed-end overnotification", /** Literal source witnesses retain the fixed-end loop's refFirst<=refLast guard rather than inventing a changed-last cutoff. @returns Nothing. */ () => {
  for (const [startFixed, endFixed, middle, late] of [
    [false, false, [10, 11], [12, 13]],
    [true, false, [10, 11, 12, 13], [12, 13]],
    [false, true, [10, 11, 12], []],
    [true, true, [10, 11, 12, 13], []],
  ] as const) {
    const { doc, listener } = fixture(startFixed, endFixed, false, !startFixed && endFixed ? 3 : 4);
    expect(selected(listener, 3)).toEqual(middle);
    expect(selected(listener, 6)).toEqual(late);
    expect(selected(listener, 1)).toEqual([]);
    expect(selected(listener, 8)).toEqual([]);
    expect(listener.getListeningRange()).toEqual(new ScRange(0, 2, 0, 0, endFixed ? 4 : 7, 0));
    expect(selected(listener, 4, 3)).toEqual(selected(listener, 3, 4));
    const outside: ScFormulaCell[] = [];
    for (const [tab, col] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ] as const)
      listener.collectFormulaCells(tab, col, 2, 4, outside);
    expect(outside).toEqual([]);
    doc.Dispose();
  }
});
it("keeps group range/policy cache identity and tears down actual ordinary and always-listen registrations", /** Cached listeners own actual subscriptions and are disposed only through native group teardown. @returns Nothing. */ () => {
  const { doc, group, pointer, range, listener } = fixture();
  expect(group.getAreaListener(pointer, new ScRange(range), false, false)).toBe(listener);
  const fixed = group.getAreaListener(pointer, range, true, true),
    mixed = group.getAreaListener(pointer, range, false, true),
    always = group.getAreaListener(pointer, BCA_LISTEN_ALWAYS(), true, true);
  expect(fixed).not.toBe(listener);
  expect(group.m_AreaListeners.size).toBe(4);
  for (const current of [listener, fixed, mixed, always]) {
    const area = current.getListeningRange();
    doc.StartListeningArea(area, !area.equals(BCA_LISTEN_ALWAYS()), current);
    expect(current.HasBroadcaster()).toBe(true);
  }
  group.endAllGroupListening(doc);
  expect(group.m_AreaListeners.size).toBe(0);
  for (const current of [listener, fixed, mixed, always])
    expect(current.HasBroadcaster()).toBe(false);
  group.endAllGroupListening(doc);
  doc.Dispose();
});
it("notifies only affected real cells and aggregates bulk changes through actual segmented owners", /** Default document broadcasts reach the group listener through native area identity rather than per-cell area expansion. @returns Nothing. */ () => {
  const { doc, cells, listener } = fixture(),
    machine = doc.GetBASM();
  assert(machine);
  doc.StartListeningArea(listener.getListeningRange(), true, listener);
  for (const cell of cells) cell.GetValue();
  expect(
    cells.map(
      /** Reads dirty state. @param cell - Actual cell. @returns Dirty. */ (cell) =>
        cell.GetDirty(),
    ),
  ).toEqual([false, false, false, false]);
  doc.SetValue(new ScAddress(0, 3, 0), 40);
  expect(
    cells.map(
      /** Reads actual group results. @param cell - Actual cell. @returns Value. */ (cell) =>
        cell.GetValue(),
    ),
  ).toEqual([48, 51, 18, 21]);
  const bulk = new ScBulkBroadcast(machine, SfxHintId.ScDataChanged);
  doc.SetValue(new ScAddress(0, 2, 0), 30);
  doc.SetValue(new ScAddress(0, 6, 0), 70);
  expect(
    cells.every(
      /** Delayed group delivery retains clean results until native flush. @param cell - Actual cell. @returns Clean. */ (
        cell,
      ) => !cell.GetDirty(),
    ),
  ).toBe(true);
  bulk.Dispose();
  expect(
    cells.map(
      /** Reads dirty state. @param cell - Actual cell. @returns Dirty. */ (cell) =>
        cell.GetDirty(),
    ),
  ).toEqual([true, false, true, true]);
  expect(
    cells.map(
      /** Reads actual recalculated values. @param cell - Actual cell. @returns Value. */ (cell) =>
        cell.GetValue(),
    ),
  ).toEqual([75, 51, 81, 84]);
  expect(machine.BulkBroadcastGroupAreas()).toBe(false);
  doc.Dispose();
});
it("uses original query owners,skip ranges and duplicate positions without a synthetic listener index", /** Actual formulas and the group listener answer existing Svt query hooks. @returns Nothing. */ () => {
  const { doc, cells, listener } = fixture(),
    query = new RefQueryFormulaGroup();
  for (const cell of cells) cell.Query(query);
  const top = cells[0];
  assert(top);
  top.Query(query);
  query.add(new ScAddress(ScAddress.INITIALIZE_INVALID));
  query.setSkipRange(new ScRange(1, 10, 0, 1, 11, 0));
  top.Query(query);
  expect(query.getAllPositions().get(0)?.get(1)).toEqual([10, 11, 12, 13, 10]);
  query.add(new ScAddress(2, 12, 0));
  query.add(new ScAddress(0, 0, 1));
  expect(query.getAllPositions().get(1)?.get(0)).toEqual([0]);
  const ranges = new ScRangeList(),
    rangeQuery = new QueryRange();
  listener.Query(rangeQuery);
  rangeQuery.swapRanges(ranges);
  expect(ranges.size()).toBe(1);
  expect(ranges.at(0)).toEqual(new ScRange(1, 10, 0, 1, 13, 0));
  listener.Query(new SvtQueryBase(99));
  top.Query(new SvtQueryBase(99));
  const ordinary = new ScFormulaCell(doc, new ScAddress(0, 20, 0), unicode("=2"), doc.GetGrammar());
  const singletonQuery = new RefQueryFormulaGroup();
  ordinary.Query(singletonQuery);
  expect(singletonQuery.getAllPositions().size).toBe(0);
  ordinary.Dispose();
  doc.Dispose();
});
it("retains native span flags,boundaries and nonallocating missing-sheet/column traversal", /** The actual source data structure emits false as well as true runs. @returns Nothing. */ () => {
  const { doc } = fixture(),
    spans = new ColumnSpanSet(),
    observed: number[][] = [];
  spans.set(doc, 0, 0, 2, 4, true);
  spans.set(doc, 0, 0, 3, false);
  spans.set(doc, new ScRange(0, doc.MaxRow(), 0, 0, doc.MaxRow(), 0), true);
  spans.set(doc, 2, 0, 0, true);
  spans.set(doc, 0, 4, 0, true);
  for (const [tab, col, first, last] of [
    [-1, 0, 0, 0],
    [0, -1, 0, 0],
    [0, 0, -1, 0],
    [0, 0, 0, doc.MaxRow() + 1],
  ] as const)
    spans.set(doc, tab, col, first, last, true);
  let col = -1;
  const action: ColumnAction = {
    /** Reads current real column. @param column - Actual column. @returns Nothing. */
    startColumn(column) {
      col = column.GetCol();
    },
    /** Records native inclusive runs. @param first - First row. @param last - Last row. @param value - Flag. @returns Nothing. */
    execute(first, last, value) {
      observed.push([col, first, last, Number(value)]);
    },
  };
  spans.executeColumnAction(doc, action);
  expect(observed).toEqual([
    [0, 0, 1, 0],
    [0, 2, 2, 1],
    [0, 3, 3, 0],
    [0, 4, 4, 1],
    [0, 5, doc.MaxRow() - 1, 0],
    [0, doc.MaxRow(), doc.MaxRow(), 1],
  ]);
  const extra = fixture(),
    emptyHint = new BulkDataHint(doc),
    listener = extra.listener;
  expect(emptyHint.getDoc()).toBe(doc);
  expect(emptyHint.getSpans()).toBeNull();
  listener.Notify(emptyHint);
  emptyHint.setSpans(spans);
  expect(emptyHint.getSpans()).toBe(spans);
  listener.Notify(new SfxHint(SfxHintId.Dying));
  listener.Notify({ kind: "dying" });
  extra.doc.Dispose();
  doc.Dispose();
});

it("retains row-span table-operation notification and deduplicates overlapping column hits", /** Spies observe genuine public Notify calls while retaining their actual implementation. @returns Nothing. */ () => {
  const { doc, cells, listener } = fixture(false, false, true),
    machine = doc.GetBASM();
  assert(machine);
  for (const cell of cells) cell.GetValue();
  const forwarding = cells.map(
    /** Observes original forwarded hints without replacing cell services. @param cell - Actual cell. @returns Observation. */ (
      cell,
    ) => vi.spyOn(cell, "Notify"),
  );
  listener.Notify(new ScHint(SfxHintId.ScTableOpDirty, new ScAddress(0, 3, 0), 2));
  expect(
    forwarding.map(
      /** Reads original forwarding counts. @param observation - Actual observation. @returns Count. */ (
        observation,
      ) => observation.mock.calls.length,
    ),
  ).toEqual([1, 1, 1, 0]);
  const forwarded = forwarding[0]?.mock.calls[0]?.[0];
  assert(forwarded instanceof SfxHint);
  expect(forwarded.GetId()).toBe(SfxHintId.ScTableOpDirty);
  for (const observation of forwarding) observation.mockRestore();
  // Table-operation cell services are unported;the listener must still forward the native hint unchanged.
  listener.Notify(new ScHint(SfxHintId.ScDataChanged, new ScAddress(0, 3, 0), 2));
  expect(
    cells.map(
      /** Reads native dirty flags. @param cell - Actual cell. @returns Dirty. */ (cell) =>
        cell.GetDirty(),
    ),
  ).toEqual([true, true, true, false]);
  for (const cell of cells) cell.GetValue();
  doc.TrackFormulas(SfxHintId.ScDataChanged);
  doc.StartListeningArea(listener.getListeningRange(), true, listener);
  const observations = cells.map(
    /** Observes without replacing the native implementation. @param cell - Actual cell. @returns Notification observation. */ (
      cell,
    ) => vi.spyOn(cell, "Notify"),
  );
  const bulk = new ScBulkBroadcast(machine, SfxHintId.ScDataChanged);
  doc.SetValue(new ScAddress(0, 3, 0), 40);
  doc.SetValue(new ScAddress(1, 3, 0), 7);
  bulk.Dispose();
  expect(
    observations.map(
      /** Reads actual invocation count. @param observation - Public method observation. @returns Count. */ (
        observation,
      ) => observation.mock.calls.length,
    ),
  ).toEqual([1, 1, 0, 0]);
  expect(
    cells.map(
      /** Reads actual results after delivery. @param cell - Actual cell. @returns Value. */ (
        cell,
      ) => cell.GetValue(),
    ),
  ).toEqual([55, 58, 18, 21]);
  for (const observation of observations) observation.mockRestore();
  doc.Dispose();
});

it("keeps ordinary/group area identity distinct and cancels queued group delivery at native teardown", /** Public machine operations retain immediate scalar/range delivery and segmented bulk delivery. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const machine = doc.GetBASM(),
    range = new ScRange(0, 0, 0, 0, 2, 0),
    normal = new HintObserver(),
    grouped = new HintObserver();
  assert(machine);
  machine.StartListeningArea(range, false, normal);
  machine.StartListeningArea(range, true, grouped);
  expect(machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(0, 1, 0)))).toBe(
    true,
  );
  expect(normal.hints.length).toBe(1);
  expect(grouped.hints.length).toBe(1);
  normal.hints.length = grouped.hints.length = 0;
  const changed = new ScRange(0, 0, 0, 0, 1, 0);
  expect(machine.AreaBroadcast(changed, SfxHintId.ScDataChanged)).toBe(true);
  expect(grouped.hints.length).toBe(2);
  normal.hints.length = grouped.hints.length = 0;
  machine.EnterBulkBroadcast();
  machine.AreaBroadcast(changed, SfxHintId.ScDataChanged);
  machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(0, 2, 0)));
  expect(normal.hints.length).toBe(2);
  expect(grouped.hints.length).toBe(0);
  machine.LeaveBulkBroadcast(SfxHintId.ScDataChanged);
  expect(grouped.hints.length).toBe(1);
  expect(grouped.hints[0]?.GetId()).toBe(SfxHintId.ScBulkData);
  machine.EnterBulkBroadcast();
  machine.AreaBroadcast(new ScHint(SfxHintId.ScDataChanged, new ScAddress(0, 1, 0)));
  machine.EndListeningArea(range, true, grouped);
  expect(grouped.HasBroadcaster()).toBe(false);
  machine.LeaveBulkBroadcast(SfxHintId.ScDataChanged);
  expect(grouped.hints.length).toBe(1);
  expect(normal.HasBroadcaster()).toBe(true);
  machine.EndListeningArea(range, false, normal);
  doc.Dispose();
});
it("flushes original queued area identities and skips an actual area with no listeners", /** Real caller-owned area values cover the source diagnostic case without simulating dangling native memory. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const machine = doc.GetBASM(),
    range = new ScRange(0, 0, 0, 0, 2, 0),
    empty = new ScBroadcastArea(range),
    live = new ScBroadcastArea(range),
    observer = new HintObserver();
  assert(machine);
  empty.SetGroupListening(true);
  live.SetGroupListening(true);
  observer.StartListening(live.GetBroadcaster());
  machine.InsertBulkGroupArea(live, range);
  machine.InsertBulkGroupArea(empty, range);
  expect(machine.BulkBroadcastGroupAreas()).toBe(true);
  expect(observer.hints.length).toBe(1);
  expect(machine.BulkBroadcastGroupAreas()).toBe(false);
  observer.Dispose();
  machine.InsertBulkGroupArea(empty, range);
  expect(machine.BulkBroadcastGroupAreas()).toBe(false);
  doc.Dispose();
});

it("retains native constructor assertions and cold-listener missing-formula lookup", /** Actual public input boundaries use genuine empty/scalar document owners. @returns Nothing. */ () => {
  const empty = new ScDocument(),
    range = new ScRange(0, 0, 0, 0, 2, 0);
  expect(
    /** Missing sheet violates the original constructor assertion. @returns Listener. */ () =>
      new FormulaGroupAreaListener(range, empty, new ScAddress(), 3, false, false),
  ).toThrow(/sheet exists/);
  empty.InsertTab(0, unicode("Data"));
  expect(
    /** Missing allocated column violates the original const lookup assertion. @returns Listener. */ () =>
      new FormulaGroupAreaListener(range, empty, new ScAddress(5, 0, 0), 3, false, false),
  ).toThrow(/column exists/);
  empty.SetValue(new ScAddress(), 2);
  const cold = new FormulaGroupAreaListener(range, empty, new ScAddress(), 3, false, false),
    cells: ScFormulaCell[] = [];
  expect(cold.getTopCell()).toBeNull();
  cold.collectFormulaCells(0, 2, cells);
  expect(cells).toEqual([]);
  cold.Dispose();
  empty.Dispose();
});
it("resynchronizes a separately owned cold listener after genuine group shortening", /** The real column remains contiguous while the final cell becomes an independent singleton. @returns Nothing. */ () => {
  const { doc, cells, group, range } = fixture(),
    cold = new FormulaGroupAreaListener(range, doc, new ScAddress(1, 10, 0), 4, false, false),
    last = cells[3];
  assert(last);
  last.SetCellGroup(null);
  group.mnLength = 3;
  expect(selected(cold, 6)).toEqual([12]);
  expect(cold.getListeningRange()).toEqual(new ScRange(0, 2, 0, 0, 6, 0));
  cold.Dispose();
  doc.Dispose();
});
it("retains source top/length repair for a separately owned cold listener after group ownership joins", /** Production insertion joins the real group;the separately owned listener repairs its original top/length. @returns Nothing. */ () => {
  const { doc, cells, group, range } = fixture(),
    cold = new FormulaGroupAreaListener(range, doc, new ScAddress(1, 10, 0), 4, false, false),
    top = new ScFormulaCell(doc, new ScAddress(1, 9, 0), unicode("=SUM(A2:A4)"), doc.GetGrammar());
  doc.SetFormulaCell(top.aPos, top);
  top.EndListeningTo(doc);
  group.endAllGroupListening(doc);
  const joined = top.GetCellGroup();
  assert(joined);
  expect(joined).toBe(group);
  expect(joined.mnLength).toBe(5);
  for (const cell of cells) expect(cell.GetCellGroup()).toBe(joined);
  expect(selected(cold, 3)).toEqual([9, 10]);
  expect(cold.getTopCell()).toBe(top);
  expect(cold.getListeningRange()).toEqual(new ScRange(0, 2, 0, 0, 8, 0));
  cold.Dispose();
  doc.Dispose();
});

it("serializes actual shared code at every member position and reopens formulas with live dependencies", /** ODS preserves formula content and ordinary column insertion rebuilds actual shared groups. @returns Completion. */ async () => {
  const { doc, group, cells, listener } = fixture();
  doc.StartListeningArea(listener.getListeningRange(), true, listener);
  doc.SetValue(new ScAddress(0, 3, 0), 40);
  const reopened = await readOdsDocument(writeOdsDocument(doc));
  expect(
    cells.every(
      /** Original cells still share their actual group code. @param cell - Actual cell. @returns Shared. */ (
        cell,
      ) => cell.GetCode() === group.mpCode,
    ),
  ).toBe(true);
  const formulas: string[] = [],
    values: number[] = [];
  for (let row = 10; row < 14; row++) {
    const position = new ScAddress(1, row, 0),
      cell = reopened.GetFormulaCell(position);
    assert(cell);
    expect(cell.GetSharedTopRow()).toBe(10);
    expect(cell.GetSharedLength()).toBe(4);
    formulas.push(text(cell.GetFormula(reopened.GetGrammar())));
    values.push(reopened.GetValue(position));
  }
  expect(formulas).toEqual(["=SUM(A3:A5)", "=SUM(A4:A6)", "=SUM(A5:A7)", "=SUM(A6:A8)"]);
  expect(values).toEqual([48, 51, 18, 21]);
  reopened.SetValue(new ScAddress(0, 5, 0), 60);
  expect(
    [10, 11, 12, 13].map(
      /** Reads real reopened results after dependency delivery. @param row - Formula row. @returns Value. */ (
        row,
      ) => reopened.GetValue(new ScAddress(1, row, 0)),
    ),
  ).toEqual([48, 105, 72, 75]);
  reopened.Dispose();
  doc.Dispose();
});

it("repairs a retained cold listener when a real top formula becomes an independent singleton", /** Production column edits unshare every member;the separately retained listener observes the resulting live store. @returns Nothing. */ () => {
  const { doc, range } = fixture(),
    cold = new FormulaGroupAreaListener(range, doc, new ScAddress(1, 10, 0), 4, false, false);
  for (let row = 10; row < 14; row++)
    doc.SetFormula(new ScAddress(1, row, 0), unicode("=" + row), doc.GetGrammar());
  expect(selected(cold, 3)).toEqual([]);
  cold.Dispose();
  doc.Dispose();
});

it.each([false, true])(
  "retains native cold-listener diagnostics during unfinished group adoption,missingTop=%s",
  /** The public native group constructor permits allocation before every cell has entered the column;the retained observer handles that transfer boundary. @param missingTop - Top still awaiting adoption. @returns Nothing. */ (
    missingTop,
  ) => {
    const doc = new ScDocument();
    doc.InsertTab(0, unicode("Data"));
    const compiler = new ScCompiler(doc, new ScAddress(1, 0, 0)),
      code = compiler.CompileString(unicode("=SUM(A1:A3)"));
    compiler.CompileTokenArray();
    const group = new ScFormulaCellGroup();
    group.setCode(code);
    group.mnLength = 3;
    const top = new ScFormulaCell(doc, new ScAddress(1, 0, 0), group, doc.GetGrammar());
    group.mpTopCell = top;
    const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
    assert(column);
    if (!missingTop) column.SetFormulaCell(0, top, 1);
    const member = new ScFormulaCell(doc, new ScAddress(1, 1, 0), group, doc.GetGrammar());
    column.SetFormulaCell(1, member, 1);
    const cold = new FormulaGroupAreaListener(
        new ScRange(0, 0, 0, 0, 2, 0),
        doc,
        new ScAddress(1, missingTop ? 1 : 0, 0),
        3,
        false,
        false,
      ),
      cells: ScFormulaCell[] = [];
    if (missingTop) {
      cold.collectFormulaCells(0, 2, cells);
      expect(cells).toEqual([]);
      expect(cold.getTopCell()).toBeNull();
    } else {
      expect(
        /** Native span assertion runs after recording the actual available block size. @returns No notification. */ () =>
          cold.collectFormulaCells(0, 2, cells),
      ).toThrow("formula group length exceeds formula block");
      expect(cold.getListeningRange()).toEqual(new ScRange(0, 0, 0, 0, 3, 0));
    }
    cold.Dispose();
    doc.Dispose();
    if (missingTop) top.Dispose();
  },
);
it("retains native backtracking validation while an incoming group top is not adopted", /** A genuine detached top and adopted member exercise the column listening boundary before transfer completes. @returns Nothing. */ () => {
  const doc = new ScDocument();
  doc.InsertTab(0, unicode("Data"));
  const compiler = new ScCompiler(doc, new ScAddress(1, 0, 0)),
    code = compiler.CompileString(unicode("=7"));
  compiler.CompileTokenArray();
  const group = new ScFormulaCellGroup();
  group.setCode(code);
  group.mnLength = 2;
  const top = new ScFormulaCell(doc, new ScAddress(1, 0, 0), group, doc.GetGrammar());
  group.mpTopCell = top;
  const column = doc.FetchTable(0)?.CreateColumnIfNotExists(1);
  assert(column);
  column.SetFormulaCell(
    1,
    new ScFormulaCell(doc, new ScAddress(1, 1, 0), group, doc.GetGrammar()),
    1,
  );
  const start = new StartListeningContext(doc),
    end = new EndListeningContext(doc);
  expect(
    /** Source assertion rejects traversal before the actual block begins. @returns No listening traversal. */ () =>
      column.StartListeningFormulaCells(start, end, 1, 1),
  ).toThrow("Shared top precedes formula block");
  doc.Dispose();
  top.Dispose();
});
