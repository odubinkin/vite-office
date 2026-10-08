/** @fileoverview Verifies original linked native cell frame clients and format ownership. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwRowFrame, SwCellFrame } from "./tabfrm";
import { SwFrame, SwLayoutFrame } from "./wsfrm";
import { SwClient } from "../../../inc/calbck";
import { MoveTableBoxHint, TableBoxFormatChanged } from "../../../inc/hints";
import { SwFormatVertOrient } from "../../../inc/fmtornt";
/** Requires an original owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native cell frame");
  return value;
}
/** Constructs original shared boxes and their linked layout row. @returns Actual native graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Frames");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    first = required(row.GetTabBoxes()[0]),
    second = required(row.GetTabBoxes()[1]),
    format = first.GetFrameFormat();
  second.ChgFrameFormat(format);
  const frame = new SwRowFrame(row),
    a = required(frame.Lower()) as SwCellFrame,
    b = required(a.GetNext()) as SwCellFrame;
  return { doc, table, row, first, second, format, frame, a, b };
}
it("row creates original linked native cell children through shared frame bases", /** Checks actual class ancestry, default links and typed borrowed format identity. @returns Nothing. */ () => {
  const f = fixture();
  expect(f.frame).toBeInstanceOf(SwLayoutFrame);
  expect(f.a).toBeInstanceOf(SwFrame);
  expect(f.a).toBeInstanceOf(SwClient);
  expect(Object.hasOwn(SwRowFrame.prototype, "GetFormat")).toBe(false);
  expect(Object.hasOwn(SwRowFrame.prototype, "RegisterToFormat")).toBe(false);
  expect(f.frame.GetUpper()).toBeUndefined();
  expect(f.frame.GetNext()).toBeUndefined();
  expect(f.frame.GetPrev()).toBeUndefined();
  expect(f.a.GetTabBox()).toBe(f.first);
  expect(f.b.GetTabBox()).toBe(f.second);
  expect(f.a.GetUpper()).toBe(f.frame);
  expect(f.b.GetUpper()).toBe(f.frame);
  expect(f.a.GetPrev()).toBeUndefined();
  expect(f.a.GetNext()).toBe(f.b);
  expect(f.b.GetPrev()).toBe(f.a);
  expect(f.b.GetNext()).toBeUndefined();
  expect(f.a.Lower()).toBeUndefined();
  expect(f.a.GetFormat()).toBe(f.format);
  expect(f.a.KnowsFormat(f.format)).toBe(true);
  expect(f.a.KnowsFormat(f.doc.MakeTableBoxFormat())).toBe(false);
  expect(f.a.GetFormat().GetBox()).toBe(f.format.GetBox());
  expect(f.a.GetFormat().GetVertOrient()).toBe(f.format.GetVertOrient());
  f.frame.DestroyImpl();
  expect(f.frame.Lower()).toBeUndefined();
  for (const child of [f.a, f.b]) {
    expect(child.GetUpper()).toBeUndefined();
    expect(child.GetNext()).toBeUndefined();
    expect(child.GetPrev()).toBeUndefined();
    expect(child.GetRegisteredIn()).toBeUndefined();
  }
  expect(f.first.GetFrameFormat()).toBe(f.format);
  expect(f.format.HasListeners()).toBe(true);
  f.frame.Dispose();
});
it("native sibling insertion and removal maintain first middle and final original links", /** Checks native pointer mechanics without a parallel children array. @returns Nothing. */ () => {
  const f = fixture(),
    middle = new SwCellFrame(f.first),
    last = new SwCellFrame(f.second),
    head = new SwCellFrame(f.first);
  middle.InsertBehind(f.frame, f.a);
  last.InsertBehind(f.frame, f.b);
  head.InsertBehind(f.frame);
  expect(f.frame.Lower()).toBe(head);
  expect(head.GetNext()).toBe(f.a);
  expect(f.a.GetPrev()).toBe(head);
  expect(f.a.GetNext()).toBe(middle);
  expect(middle.GetNext()).toBe(f.b);
  expect(f.b.GetPrev()).toBe(middle);
  expect(f.b.GetNext()).toBe(last);
  middle.RemoveFromLayout();
  expect(f.a.GetNext()).toBe(f.b);
  expect(f.b.GetPrev()).toBe(f.a);
  head.RemoveFromLayout();
  expect(f.frame.Lower()).toBe(f.a);
  expect(f.a.GetPrev()).toBeUndefined();
  last.RemoveFromLayout();
  expect(f.b.GetNext()).toBeUndefined();
  last.RemoveFromLayout();
  for (const frame of [head, middle, last]) {
    expect(frame.GetUpper()).toBeUndefined();
    expect(frame.GetNext()).toBeUndefined();
    expect(frame.GetPrev()).toBeUndefined();
    frame.Dispose();
  }
  f.frame.DestroyImpl();
});
it("native shared box claim moves matching cell clients before model registration", /** Checks original repeated frame identity and unrelated peers. @returns Nothing. */ () => {
  const f = fixture(),
    repeat = new SwCellFrame(f.first),
    events: unknown[] = [],
    change: unknown[] = [];
  const observer = new SwClient(
    /** Watches native change hints. @param source - Native owner. @param hint - Actual hint. @returns Nothing. */ (
      source,
      hint,
    ) => {
      if (hint instanceof TableBoxFormatChanged) change.push([source, hint]);
    },
  );
  observer.RegisterToModify(f.format);
  for (const frame of [f.a, repeat]) {
    const register = frame.RegisterToFormat.bind(frame);
    vi.spyOn(frame, "RegisterToFormat").mockImplementation(
      /** Captures native model ordering. @param format - New owner. @returns Nothing. */ (
        format,
      ) => {
        events.push([frame, f.first.GetRegisteredIn(), format]);
        register(format);
      },
    );
  }
  f.format.SetFormatAttr(new SwFormatVertOrient(720, 3, 7));
  const copy = f.first.ClaimFrameFormat();
  expect(copy).not.toBe(f.format);
  expect(events).toEqual([
    [f.a, f.format, copy],
    [repeat, f.format, copy],
  ]);
  expect(change).toEqual([]);
  expect(f.a.GetFormat()).toBe(copy);
  expect(repeat.GetFormat()).toBe(copy);
  expect(f.b.GetFormat()).toBe(f.format);
  expect(f.second.GetFrameFormat()).toBe(f.format);
  expect(copy.GetVertOrient()).toEqual(new SwFormatVertOrient(720, 3, 7));
  expect(f.first.ClaimFrameFormat()).toBe(copy);
  f.frame.DestroyImpl();
  repeat.Dispose();
  observer.Dispose();
  vi.restoreAllMocks();
});
it("native change and transaction movement hints retarget only the named original cell", /** Checks borrowed native references and foreign-cell filtering. @returns Nothing. */ () => {
  const f = fixture(),
    next = f.doc.MakeTableBoxFormat(),
    third = f.doc.MakeTableBoxFormat(),
    events: unknown[] = [];
  const register = f.a.RegisterToFormat.bind(f.a);
  vi.spyOn(f.a, "RegisterToFormat").mockImplementation(
    /** Observes old model registration. @param format - New owner. @returns Nothing. */ (
      format,
    ) => {
      events.push([f.first.GetRegisteredIn(), format]);
      register(format);
    },
  );
  f.first.ChgFrameFormat(next);
  expect(events).toEqual([[f.format, next]]);
  expect(f.a.GetFormat()).toBe(next);
  expect(f.b.GetFormat()).toBe(f.format);
  f.format.CallSwClientNotify(new TableBoxFormatChanged(third, f.first));
  expect(f.b.GetFormat()).toBe(f.format);
  next.RunNotificationTransaction(
    /** Emits actual native atomic hints as one notification transaction. @returns Nothing. */ () => {
      next.CallSwClientNotify(new MoveTableBoxHint(third, f.second));
      next.CallSwClientNotify(new MoveTableBoxHint(third, f.first));
    },
  );
  expect(f.a.GetFormat()).toBe(third);
  expect(f.first.GetFrameFormat()).toBe(next);
  expect(f.b.GetFormat()).toBe(f.format);
  third.CallSwClientNotify(new MoveTableBoxHint(next, f.first));
  expect(f.a.GetFormat()).toBe(next);
  next.CallSwClientNotify(new TableBoxFormatChanged(next, f.first));
  expect(f.a.GetFormat()).toBe(next);
  f.frame.DestroyImpl();
  vi.restoreAllMocks();
});
it("actual cell frame destruction deletes a format only after its last registered client", /** Checks model/frame destruction ordering and idempotence. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.doc.MakeTableBoxFormat();
  f.first.ChgFrameFormat(format);
  const isolated = new SwCellFrame(f.first);
  f.frame.DestroyImpl();
  expect(format.IsDisposed()).toBe(false);
  f.first.Dispose();
  expect(format.IsDisposed()).toBe(false);
  expect(format.HasListeners()).toBe(true);
  const disposed = vi.spyOn(format, "DisposeModify");
  isolated.Dispose();
  expect(disposed).toHaveBeenCalledOnce();
  expect(format.IsDisposed()).toBe(true);
  expect(isolated.GetRegisteredIn()).toBeUndefined();
  isolated.DestroyImpl();
  expect(disposed).toHaveBeenCalledOnce();
});
