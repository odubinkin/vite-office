/** @fileoverview Verifies native row frame registration, movement hints and final-client destruction. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTableLine } from "../table/swtable";
import { SwClient } from "../../../inc/calbck";
import { MoveTableLineHint, TableLineFormatChanged } from "../../../inc/hints";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwRowFrame } from "./tabfrm";
/** Creates two original rows sharing one native owner and distinct physical frame clients. @returns Actual native owners. */
function fixture() {
  const doc = new SwDoc(),
    format = doc.MakeTableLineFormat(),
    first = new SwTableLine(format),
    second = new SwTableLine(format),
    a = new SwRowFrame(first),
    repeated = new SwRowFrame(first),
    b = new SwRowFrame(second);
  return { doc, format, first, second, a, repeated, b };
}
it("registered native row frame borrows its exact format and reads native complete size directly", /** Checks original registration and native item query ownership. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    format = doc.MakeTableLineFormat(),
    row = new SwTableLine(format),
    frame = new SwRowFrame(row),
    size = new SwFormatFrameSize(SwFrameSize.Fixed, 200, 660);
  try {
    expect(frame).toBeInstanceOf(SwClient);
    expect(frame.GetTabLine()).toBe(row);
    expect(frame.GetFormat()).toBe(format);
    expect(frame.GetRegisteredIn()).toBe(format);
    expect(frame.GetFormat().GetAttrSet()).toBe(format.GetAttrSet());
    format.SetFormatAttr(size);
    expect(frame.HasFixSize()).toBe(true);
    expect(frame.Format(900)).toBe(660);
    expect(row.ClaimFrameFormat()).toBe(format);
    row.Dispose();
    expect(row.GetRegisteredIn()).toBeUndefined();
    expect(format.HasListeners()).toBe(true);
    expect(format.IsDisposed()).toBe(false);
    expect(frame.Format(900)).toBe(660);
    frame.DestroyImpl();
    expect(frame.GetRegisteredIn()).toBeUndefined();
    expect(format.HasListeners()).toBe(false);
    expect(format.IsDisposed()).toBe(true);
    frame.DestroyImpl();
    frame.Dispose();
    row.Dispose();
  } finally {
    frame.Dispose();
    row.Dispose();
  }
});
it("native claim retargets all physical clients of the claiming line and leaves shared peer frames", /** Checks original row identity rather than format-wide frame movement. @returns Nothing. */ () => {
  const f = fixture();
  try {
    f.format.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 800));
    const copy = f.first.ClaimFrameFormat();
    expect(copy).not.toBe(f.format);
    expect(f.a.GetFormat()).toBe(copy);
    expect(f.repeated.GetFormat()).toBe(copy);
    expect(f.b.GetFormat()).toBe(f.format);
    expect(f.second.GetFrameFormat()).toBe(f.format);
    expect(f.first.GetFrameFormat()).toBe(copy);
    expect(copy.GetFrameSize()).not.toBe(f.format.GetFrameSize());
    copy.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 600));
    expect(f.a.Format(1000)).toBe(600);
    expect(f.repeated.HasFixSize()).toBe(true);
    expect(f.b.HasFixSize()).toBe(false);
    expect(f.b.Format(500)).toBe(800);
    f.a.DestroyImpl();
    expect(copy.HasListeners()).toBe(true);
    f.first.Dispose();
    expect(copy.IsDisposed()).toBe(false);
    f.repeated.DestroyImpl();
    expect(copy.IsDisposed()).toBe(true);
    expect(f.format.IsDisposed()).toBe(false);
  } finally {
    f.a.Dispose();
    f.repeated.Dispose();
    f.b.Dispose();
    f.first.Dispose();
    f.second.Dispose();
  }
});
it("native change hint arrives before row registration and moves matching frame clients only", /** Checks borrowed hint references and native publication order. @returns Nothing. */ () => {
  const f = fixture(),
    next = f.doc.MakeTableLineFormat(),
    events: unknown[] = [],
    observer = new SwClient(
      /** Observes actual native change publication. @param source - Emitting owner. @param hint - Native hint. @returns Nothing. */ (
        source,
        hint,
      ) => {
        if (hint instanceof TableLineFormatChanged)
          events.push([source, hint.m_rNewFormat, hint.m_rTabLine, f.first.GetRegisteredIn()]);
      },
    );
  observer.RegisterToModify(f.format);
  try {
    next.SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 700));
    f.first.ChgFrameFormat(next);
    expect(events).toEqual([[f.format, next, f.first, f.format]]);
    expect(f.a.GetFormat()).toBe(next);
    expect(f.repeated.GetFormat()).toBe(next);
    expect(f.b.GetFormat()).toBe(f.format);
    expect(f.first.GetFrameFormat()).toBe(next);
    expect(f.second.GetFrameFormat()).toBe(f.format);
    expect(f.a.Format(1000)).toBe(700);
    f.first.ChgFrameFormat(next);
    expect(f.a.GetFormat()).toBe(next);
    expect(next.IsDisposed()).toBe(false);
  } finally {
    observer.Dispose();
    f.a.Dispose();
    f.repeated.Dispose();
    f.b.Dispose();
    f.first.Dispose();
    f.second.Dispose();
  }
});
it("typed history movement and queued hints follow exact line references without moving peer clients", /** Checks native MoveTableLine fields and represented notification transactions. @returns Nothing. */ () => {
  const f = fixture(),
    next = f.doc.MakeTableLineFormat(),
    third = f.doc.MakeTableLineFormat();
  try {
    const move = new MoveTableLineHint(next, f.first),
      change = new TableLineFormatChanged(third, f.second);
    expect(move.kind).toBe("move-table-line");
    expect(move.m_rNewFormat).toBe(next);
    expect(move.m_rTableLine).toBe(f.first);
    expect(change.kind).toBe("table-line-format-changed");
    expect(change.m_rNewFormat).toBe(third);
    expect(change.m_rTabLine).toBe(f.second);
    f.format.RunNotificationTransaction(
      /** Queues exact native move and change hints. @returns Nothing. */ () => {
        f.format.CallSwClientNotify(move);
        f.format.CallSwClientNotify(change);
        f.format.CallSwClientNotify({
          kind: "attribute-set-changed",
          formatId: f.format.GetName(),
        });
      },
    );
    expect(f.a.GetFormat()).toBe(next);
    expect(f.repeated.GetFormat()).toBe(next);
    expect(f.b.GetFormat()).toBe(third);
    expect(f.first.GetFrameFormat()).toBe(f.format);
    expect(f.second.GetFrameFormat()).toBe(f.format);
    f.first.RegisterToModify(next);
    f.second.RegisterToModify(third);
    expect(f.format.HasListeners()).toBe(false);
    f.format.DisposeModify();
    expect(f.format.IsDisposed()).toBe(true);
  } finally {
    f.a.Dispose();
    f.repeated.Dispose();
    f.b.Dispose();
    f.first.Dispose();
    f.second.Dispose();
  }
});
it("changing a final row owner deletes its old format after matching frame clients move", /** Checks last-client cleanup at native ChgFrameFormat. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    old = doc.MakeTableLineFormat(),
    row = new SwTableLine(old),
    frame = new SwRowFrame(row),
    next = doc.MakeTableLineFormat();
  row.ChgFrameFormat(next);
  expect(frame.GetFormat()).toBe(next);
  expect(row.GetFrameFormat()).toBe(next);
  expect(old.HasListeners()).toBe(false);
  expect(old.IsDisposed()).toBe(true);
  frame.Dispose();
  expect(next.IsDisposed()).toBe(false);
  row.Dispose();
  expect(next.IsDisposed()).toBe(true);
});
