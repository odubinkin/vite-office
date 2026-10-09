/** @fileoverview Verifies native detached frame validity and original table replacement/history transitions. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTableLine } from "../table/swtable";
import { SwFrame, SwFrameType, InvalidationType } from "./wsfrm";
import { SwRowFrame, SwCellFrame, SwTabFrame } from "./tabfrm";
import { HoriOrientation } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import type { SwFrameFormat } from "./atrfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import {
  TableLineFormatChanged,
  TableBoxFormatChanged,
  MoveTableLineHint,
  MoveTableBoxHint,
} from "../../../inc/hints";
import { createWriterDocumentSession } from "../../../browser/composition/writer-module";
import { SwPosition } from "../crsr/pam";
/** Exposes native invalidation hooks on a real registered frame. */
class ProbeFrame extends SwFrame {
  public readonly events: (InvalidationType | "page")[] = [];
  public readonly denied = new Set<InvalidationType>();
  /** Registers the probe at an original native owner. @param format - Original format. @returns Nothing. */
  public constructor(format: SwFrameFormat) {
    super(format);
  }
  /** Records the native page-notification dispatch point. @returns Nothing. */
  protected override InvalidatePage(): void {
    this.events.push("page");
  }
  /** Controls native virtual permission. @param type - Native discriminator. @returns Whether admitted. */
  protected override InvalidationAllowed(type: InvalidationType): boolean {
    return !this.denied.has(type);
  }
  /** Records original post-invalidation action ordering. @param type - Native discriminator. @returns Nothing. */
  protected override ActionOnInvalidation(type: InvalidationType): void {
    this.events.push(type);
  }
}
/** Assigns a physical frame's independently supplied geometry validity. @param frame - Native frame. @param mask - Size1, print2, position4. @returns Nothing. */
function validate(frame: SwFrame, mask = 7): void {
  frame.setFrameAreaSizeValid((mask & 1) !== 0);
  frame.setFramePrintAreaValid((mask & 2) !== 0);
  frame.setFrameAreaPositionValid((mask & 4) !== 0);
}
/** Reads independently observable native geometry state. @param frame - Native frame. @returns Size, print, position flags. */
function state(frame: SwFrame): boolean[] {
  return [
    frame.isFrameAreaSizeValid(),
    frame.isFramePrintAreaValid(),
    frame.isFrameAreaPositionValid(),
  ];
}
const singles = [
  ["InvalidateSize", "InvalidateSize_", "ImplInvalidateSize", InvalidationType.INVALID_SIZE, 0],
  ["InvalidatePrt", "InvalidatePrt_", "ImplInvalidatePrt", InvalidationType.INVALID_PRTAREA, 1],
  ["InvalidatePos", "InvalidatePos_", "ImplInvalidatePos", InvalidationType.INVALID_POS, 2],
] as const;
it.each(singles)(
  "native %s guards valid state and preserves page/action ordering",
  /** Checks actual native public, local and direct contracts. @param full - Public invalidator. @param local - Local invalidator. @param impl - Direct implementation. @param type - Native hook type. @param index - Changed state. @returns Nothing. */ (
    full,
    local,
    impl,
    type,
    index,
  ) => {
    const doc = new SwDoc(),
      frame = new ProbeFrame(doc.MakeTableLineFormat());
    try {
      expect(frame.GetType()).toBe(SwFrameType.None);
      expect(state(frame)).toEqual([false, false, false]);
      expect(frame.isFrameAreaDefinitionValid()).toBe(false);
      expect(frame.IsCompletePaint()).toBe(true);
      frame.ResetCompletePaint();
      frame.SetCompletePaint();
      expect(frame.IsCompletePaint()).toBe(true);
      for (const method of [full, local]) {
        for (const allowed of [true, false]) {
          validate(frame);
          validate(frame);
          frame.events.length = 0;
          frame.denied.clear();
          if (!allowed) frame.denied.add(type);
          frame[method]();
          const expected = [true, true, true];
          expected[index] = !allowed;
          expect(state(frame)).toEqual(expected);
          expect(frame.events).toEqual(allowed ? (method === full ? ["page", type] : [type]) : []);
          frame.events.length = 0;
          frame[method]();
          expect(frame.events).toEqual([]);
          validate(frame, 0);
          frame[method]();
          expect(frame.events).toEqual([]);
        }
      }
      validate(frame, 0);
      frame.denied.clear();
      frame.events.length = 0;
      frame[impl]();
      expect(frame.events).toEqual(["page", type]);
      frame.events.length = 0;
      frame.denied.add(type);
      frame[impl]();
      expect(frame.events).toEqual([]);
      expect(frame.IsCompletePaint()).toBe(true);
      frame.ReinitializeFrameSizeAttrFlags();
    } finally {
      frame.DestroyImpl();
    }
  },
);
it.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "native all-area invalidation retains partial-validity semantics for mask%s",
  /** Checks native complete validity, local hooks and separate position permission. @param mask - Independent geometry state. @returns Nothing. */ (
    mask,
  ) => {
    const doc = new SwDoc(),
      frame = new ProbeFrame(doc.MakeTableLineFormat());
    try {
      for (const local of [true, false])
        for (const allowAll of [true, false])
          for (const allowPos of [true, false]) {
            validate(frame, mask);
            frame.events.length = 0;
            frame.denied.clear();
            if (!allowAll) frame.denied.add(InvalidationType.INVALID_ALL);
            if (!allowPos) frame.denied.add(InvalidationType.INVALID_POS);
            expect(frame.isFrameAreaDefinitionValid()).toBe(mask === 7);
            if (local) frame.InvalidateAll_();
            else frame.InvalidateAll();
            const admitted = allowAll && (!local || mask !== 0);
            expect(state(frame)).toEqual(
              admitted
                ? [false, false, false]
                : [(mask & 1) !== 0, (mask & 2) !== 0, (mask & 4) !== 0],
            );
            expect(frame.events).toEqual(
              !admitted
                ? []
                : !local && mask === 7 && allowPos
                  ? ["page", InvalidationType.INVALID_POS, InvalidationType.INVALID_ALL]
                  : [InvalidationType.INVALID_ALL],
            );
          }
    } finally {
      frame.DestroyImpl();
    }
  },
);
/** Requires an original fixture owner. @param value - Optional native owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native validity fixture owner");
  return value;
}
/** Creates original shared row and cell owners with linked physical clients. @returns Native graph. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Validity");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const first = doc.nodes.AppendTableRow(table, 2),
    second = doc.nodes.AppendTableRow(table, 2);
  second.ChgFrameFormat(first.GetFrameFormat());
  const box = required(first.GetTabBoxes()[0]),
    peer = required(first.GetTabBoxes()[1]);
  peer.ChgFrameFormat(box.GetFrameFormat());
  const row = new SwRowFrame(first),
    repeat = new SwRowFrame(first),
    other = new SwRowFrame(second);
  const a = required(row.Lower()) as SwCellFrame,
    b = required(a.GetNext()) as SwCellFrame;
  return { doc, table, first, second, box, peer, row, repeat, other, a, b };
}
it.each([SwFrameSize.Variable, SwFrameSize.Minimum, SwFrameSize.Fixed])(
  "row format replacement and native history invalidate physical areas, size type%s",
  /** Checks matching rows, distinct peers, lower invalidation and paint differences. @param type - Native size type. @returns Nothing. */ (
    type,
  ) => {
    const f = fixture(),
      next = f.doc.MakeTableLineFormat();
    next.SetFormatAttr(new SwFormatFrameSize(type, 0, 400));
    try {
      for (const frame of [f.row, f.repeat, f.other, f.a, f.b]) {
        validate(frame);
        frame.ResetCompletePaint();
      }
      expect(f.row.GetType()).toBe(SwFrameType.Row);
      expect(f.a.GetType()).toBe(SwFrameType.Cell);
      const original = f.first.GetFrameFormat();
      original.CallSwClientNotify(new TableLineFormatChanged(next, f.first));
      for (const row of [f.row, f.repeat]) {
        expect(row.GetFormat()).toBe(next);
        expect(state(row)).toEqual([false, false, true]);
        expect(row.IsCompletePaint()).toBe(true);
      }
      expect(state(f.other)).toEqual([true, true, true]);
      expect(f.other.IsCompletePaint()).toBe(false);
      expect(state(f.a)).toEqual(
        type === SwFrameSize.Fixed ? [true, true, true] : [false, false, true],
      );
      expect(state(f.b)).toEqual(state(f.a));
      for (const row of [f.row, f.repeat]) {
        validate(row);
        row.ResetCompletePaint();
      }
      next.CallSwClientNotify(new MoveTableLineHint(original, f.first));
      for (const row of [f.row, f.repeat]) {
        expect(row.GetFormat()).toBe(original);
        expect(state(row)).toEqual([false, false, false]);
        expect(row.IsCompletePaint()).toBe(false);
      }
      expect(state(f.other)).toEqual([true, true, true]);
    } finally {
      f.row.Dispose();
      f.repeat.Dispose();
      f.other.Dispose();
    }
  },
);
it("cell replacement and history update matching linked and repeated clients without changing peers", /** Checks original physical owner and distinct painting semantics. @returns Nothing. */ () => {
  const f = fixture(),
    repeat = new SwCellFrame(f.box),
    next = f.doc.MakeTableBoxFormat();
  try {
    for (const frame of [f.a, repeat, f.b, f.row]) {
      validate(frame);
      frame.ResetCompletePaint();
    }
    const original = f.box.GetFrameFormat();
    original.CallSwClientNotify(new TableBoxFormatChanged(next, f.box));
    for (const frame of [f.a, repeat]) {
      expect(frame.GetFormat()).toBe(next);
      expect(state(frame)).toEqual([false, false, true]);
      expect(frame.IsCompletePaint()).toBe(true);
      validate(frame);
      frame.ResetCompletePaint();
    }
    expect(state(f.b)).toEqual([true, true, true]);
    expect(state(f.row)).toEqual([true, true, true]);
    next.CallSwClientNotify(new MoveTableBoxHint(original, f.box));
    for (const frame of [f.a, repeat]) {
      expect(frame.GetFormat()).toBe(original);
      expect(state(frame)).toEqual([false, false, false]);
      expect(frame.IsCompletePaint()).toBe(false);
    }
    expect(state(f.b)).toEqual([true, true, true]);
  } finally {
    f.row.Dispose();
    f.repeat.Dispose();
    f.other.Dispose();
    repeat.Dispose();
  }
});
it("silent shared claims move registrations without inventing invalidation or paint requests", /** Checks the native distinction between direct claims and published changes. @returns Nothing. */ () => {
  const f = fixture();
  try {
    for (const frame of [f.row, f.repeat, f.a, f.b, f.other]) {
      validate(frame);
      frame.ResetCompletePaint();
    }
    const rowFormat = f.first.ClaimFrameFormat(),
      boxFormat = f.box.ClaimFrameFormat();
    expect(f.row.GetFormat()).toBe(rowFormat);
    expect(f.repeat.GetFormat()).toBe(rowFormat);
    expect(f.a.GetFormat()).toBe(boxFormat);
    expect(f.other.GetFormat()).toBe(f.second.GetFrameFormat());
    expect(f.b.GetFormat()).toBe(f.peer.GetFrameFormat());
    for (const frame of [f.row, f.repeat, f.a, f.b, f.other]) {
      expect(state(frame)).toEqual([true, true, true]);
      expect(frame.IsCompletePaint()).toBe(false);
    }
  } finally {
    f.row.Dispose();
    f.repeat.Dispose();
    f.other.Dispose();
  }
});
it("actual row-height undo and redo invalidate original physical geometry and preserve native content", /** Exercises actual history owners rather than fabricated notification replay. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell();
  const table = doc.nodes.MakeTableNode("HistoryValidity");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    box = required(row.GetTabBoxes()[0]),
    node = required(box.GetParagraphs()[0]);
  node.SetText("Native content");
  const position = new SwPosition(node, 2);
  shell.SetCursor(position);
  position.Dispose();
  const frame = new SwRowFrame(row),
    cell = required(frame.Lower()) as SwCellFrame,
    cursor = shell.CaptureCursorState();
  try {
    doc.GetUndoManager().Clear();
    expect(shell.SetRowHeight(new SwFormatFrameSize(SwFrameSize.Fixed, 0, 700))).toBe(true);
    for (const direction of ["Undo", "Redo"] as const) {
      validate(frame);
      validate(cell);
      frame.ResetCompletePaint();
      cell.ResetCompletePaint();
      expect(shell[direction]()).toBe(true);
      expect(state(frame)).toEqual([false, false, false]);
      expect(state(cell)).toEqual([false, false, false]);
      expect(frame.GetFormat()).toBe(row.GetFrameFormat());
      expect(cell.GetFormat()).toBe(box.GetFrameFormat());
      expect(frame.IsCompletePaint()).toBe(false);
      expect(cell.IsCompletePaint()).toBe(false);
      expect(node.GetText()).toBe("Native content");
      expect(shell.CaptureCursorState()).toEqual(cursor);
    }
  } finally {
    frame.Dispose();
    session.Close();
  }
});

/** Collects actual native registered clients. @param format - Original owner. @returns Original client identities. */
function listeners(format: SwFrameFormat): unknown[] {
  const clients: unknown[] = [];
  format.ForAllListeners(
    /** Visits each original client. @param client - Native registration. @returns Continue iteration. */ (
      client,
    ) => {
      clients.push(client);
      return false;
    },
  );
  return clients;
}
it("native reinitialization follows empty and populated natural rows while retaining fixed and cell geometry", /** Exercises current source with original empty rows and separately validated linked lowers. @returns Nothing. */ () => {
  const f = fixture(),
    empty = new SwRowFrame(new SwTableLine(f.doc.MakeTableLineFormat()));
  try {
    for (const type of [SwFrameSize.Variable, SwFrameSize.Minimum, SwFrameSize.Fixed]) {
      f.first.GetFrameFormat().SetFormatAttr(new SwFormatFrameSize(type, 0, 900));
      validate(f.a);
      validate(f.b);
      f.row.ReinitializeFrameSizeAttrFlags();
      expect(state(f.a)).toEqual(
        type === SwFrameSize.Fixed ? [true, true, true] : [false, false, true],
      );
      expect(state(f.b)).toEqual(state(f.a));
      const size = f.a.GetFormat().GetFrameSize().Clone();
      size.SetHeightSizeType(type);
      f.a.GetFormat().SetFormatAttr(size);
      validate(f.a);
      f.a.ReinitializeFrameSizeAttrFlags();
      expect(state(f.a)).toEqual([true, true, true]);
    }
    empty.ReinitializeFrameSizeAttrFlags();
    expect(empty.Lower()).toBeUndefined();
  } finally {
    f.row.Dispose();
    f.repeat.Dispose();
    f.other.Dispose();
    empty.Dispose();
  }
});
it("native print frame retains original table and omitted margin defaults and releases zero-width cell measurement", /** Checks previous native geometry contracts on original owners. @returns Nothing. */ () => {
  const f = fixture(),
    frame = new SwTabFrame(f.table);
  try {
    expect(frame.GetTable()).toBe(f.table);
    f.table.SetFormat({ horiOrient: HoriOrientation.NONE });
    expect(frame.Format(8000)).toEqual({ left: 0, right: 0, width: 8000 });
    f.table.SetFormat({ horiOrient: HoriOrientation.LEFT_AND_WIDTH, width: 3000 });
    expect(frame.Format(8000)).toEqual({ left: 0, right: 5000, width: 3000 });
    f.table.SetFormat({ horiOrient: HoriOrientation.FULL, width: 0 });
    const format = f.box.GetFrameFormat(),
      beforeClients = listeners(format);
    expect(frame.GetBoxPrintWidth(f.box, 8000)).toBe(0);
    expect(listeners(format)).toEqual(beforeClients);
    expect(f.a.GetFormat()).toBe(format);
  } finally {
    f.row.Dispose();
    f.repeat.Dispose();
    f.other.Dispose();
  }
});
