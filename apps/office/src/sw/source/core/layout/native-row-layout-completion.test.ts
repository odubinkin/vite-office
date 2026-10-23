/** @fileoverview Verifies persistent root device inputs complete invalidated row geometry without replaying browser paint. */
import { expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwRootFrame } from "./newfrm";
import { SwRowFrame } from "./tabfrm";
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
it("reuses actual root frames and their original areas when completing invalidated native row layout", /** Checks native geometry ownership and independent natural device input. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Completion", { width: 6000 });
  table.AddColumnWidth(6000);
  const row = doc.nodes.AppendTableRow(table, 1, {
      frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 900),
    }),
    root = new SwRootFrame(
      /** Returns the original formatted document. @returns Native document. */ () => doc,
    );
  try {
    expect(root.Calc()).toBeUndefined();
    const first = root.Format(
        [],
        doc.GetPageDesc().GetValue(),
        undefined,
        doc.GetLineNumberInfo().QueryValue(),
        0,
        [{ tableName: "Completion", rowHeights: [300] }],
      ),
      frame = first.tableFrames[0]?.Lower() as SwRowFrame | undefined;
    if (!frame) throw new Error("Missing original row frame");
    const area = frame.getFrameArea(),
      print = frame.getFramePrintArea();
    expect(area.Height()).toBe(900);
    row.ClaimFrameFormat().SetFormatAttr(new SwFormatFrameSize(SwFrameSize.Minimum, 0, 600));
    root.Calc();
    expect(frame.getFrameArea()).toBe(area);
    expect(frame.getFramePrintArea()).toBe(print);
    expect(area.Height()).toBe(600);
    expect(print.Height()).toBe(600);
    row.ClaimFrameFormat().SetFormatAttr(new SwFormatFrameSize());
    root.Calc();
    expect(area.Height()).toBe(300);
    expect(print.Height()).toBe(300);
  } finally {
    root.DestroyImpl();
    doc.Dispose();
  }
});
it("never applies retained device inputs to a replacement native document", /** Checks root ownership before any stale formatting entry. @returns Nothing. */ () => {
  const first = new SwDoc(),
    second = new SwDoc();
  let current = first;
  const root = new SwRootFrame(
    /** Resolves the current document owner. @returns Native document. */ () => current,
  );
  try {
    root.Format(
      [],
      first.GetPageDesc().GetValue(),
      undefined,
      first.GetLineNumberInfo().QueryValue(),
    );
    const format = vi.spyOn(root, "Format");
    current = second;
    root.Calc();
    expect(format).not.toHaveBeenCalled();
  } finally {
    root.DestroyImpl();
    first.Dispose();
    second.Dispose();
  }
});
