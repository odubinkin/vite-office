/** @fileoverview Verifies source table border painting borrows the original native frame hierarchy. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { Color } from "../../../../tools/inc/color";
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "./tabfrm";
import { SwTabFramePainter } from "./paintfrm";
import type { SwModify } from "../../../inc/calbck";
import { SvxBorderLine } from "../../../../editeng/source/items/borderline";
const releases: (() => void)[] = [];
afterEach(
  /** Ends actual native caller ownership after assertions. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const release of releases.splice(0)) release();
  },
);
/** Reads original native listener objects. @param format - Native format. @returns Actual clients. */
function clients(format: SwModify) {
  const values: unknown[] = [];
  writerClients0: for (const client of new SwIterator(SwClient, format)) {
    values.push(client);
    continue writerClients0;
  }
  return values;
}
/** Owns one actual native table hierarchy for the painter call. @returns Original native owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Borrowed borders");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    frame = new SwTabFrame(table),
    nativeRow = frame.Lower() as SwRowFrame,
    cell = nativeRow.Lower() as SwCellFrame;
  releases.push(
    /** Releases the hierarchy before the native document. @returns Nothing. */ () => {
      frame.DestroyImpl();
      doc.Dispose();
    },
  );
  return { doc, table, row, frame, nativeRow, cell };
}
it("native painter accepts the original table frame and keeps all caller clients", /** Checks actual source constructor and unchanged linked identity through paint. @returns Nothing. */ () => {
  const f = fixture(),
    formats = [
      f.table.GetFrameFormat(),
      f.row.GetFrameFormat(),
      ...f.row
        .GetTabBoxes()
        .map(
          /** Borrows original native box formats. @param box - Native cell. @returns Format. */ (
            box,
          ) => box.GetFrameFormat(),
        ),
    ],
    before = formats.map(clients);
  const painter = new SwTabFramePainter(f.frame),
    lines: number[][] = [];
  painter.PaintLines(
    /** Captures actual source borders. @param line - Native interval. @returns Nothing. */ (
      line,
    ) => lines.push([line.mnKey, line.mnStartPos, line.mnEndPos]),
  );
  expect(lines).toHaveLength(7);
  expect(formats.map(clients)).toEqual(before);
  expect(f.frame.Lower()).toBe(f.nativeRow);
  expect(f.nativeRow.Lower()).toBe(f.cell);
  expect(f.cell.GetRegisteredIn()).toBe(f.row.GetTabBoxes()[0]?.GetFrameFormat());
});
it("native painter reads the actual cell frame format rather than reconstructing its model box", /** Checks registered physical frame ownership supplies border attributes. @returns Nothing. */ () => {
  const f = fixture(),
    format = f.doc.MakeTableBoxFormat(),
    box = f.cell.GetFormat().GetBox().Clone();
  box.SetLine(new SvxBorderLine(new Color(0x123456), 40), 0);
  format.SetFormatAttr(box);
  f.cell.RegisterToFormat(format);
  const painter = new SwTabFramePainter(f.frame),
    colors: number[] = [];
  painter.PaintLines(
    /** Reads the actual top border. @param line - Native interval. @param horizontal - Family. @returns Nothing. */ (
      line,
      horizontal,
    ) => {
      if (horizontal && line.mnKey === 0 && line.mnStartPos === 0)
        colors.push(line.maAttribute.GetColorPrim().toUInt32());
    },
  );
  expect(colors).toEqual([0x123456]);
  expect(f.cell.GetRegisteredIn()).toBe(format);
  expect(f.row.GetTabBoxes()[0]?.GetFrameFormat()).not.toBe(format);
});
it("native painter respects a partial actual lower chain without recreating omitted cells", /** Checks physical layout membership rather than model enumeration governs paint. @returns Nothing. */ () => {
  const f = fixture(),
    second = f.cell.GetNext() as SwCellFrame;
  second.RemoveFromLayout();
  second.DestroyImpl();
  expect(f.row.GetTabBoxes()).toHaveLength(2);
  const painter = new SwTabFramePainter(f.frame),
    lines: number[][] = [];
  painter.PaintLines(
    /** Captures only original live frame coordinates. @param line - Actual interval. @param horizontal - Family. @returns Nothing. */ (
      line,
      horizontal,
    ) => lines.push([Number(horizontal), line.mnKey, line.mnStartPos, line.mnEndPos]),
  );
  expect(lines).toEqual([
    [0, 0, 0, 1],
    [0, 1, 0, 1],
    [1, 0, 0, 1],
    [1, 1, 0, 1],
  ]);
  expect(f.nativeRow.Lower()).toBe(f.cell);
  expect(f.cell.GetNext()).toBeUndefined();
});
it("native insertion failure leaves the caller hierarchy registered and unchanged", /** Checks the painter does not own cleanup of borrowed frames. @returns Nothing. */ () => {
  const f = fixture(),
    before = clients(f.row.GetFrameFormat());
  vi.spyOn(SwTabFramePainter.prototype, "Insert").mockImplementation(
    /** Rejects the actual interval insertion boundary. @returns Never. */ () => {
      throw Error("Insert unavailable");
    },
  );
  expect(
    /** Constructs the actual source painter over its original owner. @returns Painter. */ () =>
      new SwTabFramePainter(f.frame),
  ).toThrow("Insert unavailable");
  expect(clients(f.row.GetFrameFormat())).toEqual(before);
  expect(f.frame.Lower()).toBe(f.nativeRow);
  expect(f.cell.GetRegisteredIn()).toBe(f.row.GetTabBoxes()[0]?.GetFrameFormat());
});
it("native device failure preserves caller frames and copied painter snapshots", /** Checks failed paint cannot destroy original clients or mutate stored lines. @returns Nothing. */ () => {
  const f = fixture(),
    painter = new SwTabFramePainter(f.frame),
    before = clients(f.row.GetFrameFormat());
  expect(
    /** Rejects the actual device callback. @returns Nothing. */ () =>
      painter.PaintLines(
        /** Rejects one copied interval. @returns Never. */ () => {
          throw Error("Device unavailable");
        },
      ),
  ).toThrow("Device unavailable");
  const lines: number[][] = [];
  painter.PaintLines(
    /** Reads independent retained snapshots. @param line - Native copy. @returns Nothing. */ (
      line,
    ) => {
      lines.push([line.mnKey, line.mnStartPos, line.mnEndPos]);
      line.mnEndPos = -1;
    },
  );
  expect(lines).toHaveLength(7);
  expect(clients(f.row.GetFrameFormat())).toEqual(before);
  f.frame.DestroyImpl();
  expect(f.cell.GetRegisteredIn()).toBeUndefined();
  expect(f.nativeRow.GetRegisteredIn()).toBeUndefined();
});
