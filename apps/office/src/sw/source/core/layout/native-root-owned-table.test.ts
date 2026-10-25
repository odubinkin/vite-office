/** @fileoverview Verifies original root ownership and reuse of native table masters without temporary measurement graphs. */
import { SwClient, SwIterator } from "../../../inc/calbck";

import { expect, it, vi } from "vitest";
import { SwTableLine } from "../table/swtable";
import { SwDoc } from "../doc/doc";
import { SwRootFrame } from "./newfrm";
import { SwTabFrame, SwRowFrame } from "./tabfrm";
import { createDefaultWriterPageDescriptor } from "../../../../test/writer-page-descriptor";
import { SwLineNumberInfo } from "../../../inc/lineinfo";
import type { SwModify } from "../../../inc/calbck";
/** Requires an actual original owner. @param value - Original optional owner. @returns Original owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing original table master");
  return value;
}
/** Reads original native registered clients. @param owner - Native format owner. @returns Registered objects. */
function clients(owner: SwModify): unknown[] {
  const out: unknown[] = [];
  writerClients0: for (const client of new SwIterator(SwClient, owner)) {
    out.push(client);
    continue writerClients0;
  }
  return out;
}
/** Allocates original model and root, with canonical table position. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Owned master");
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 1),
    root = new SwRootFrame(/** Reads original document. @returns Document. */ () => doc);
  return { doc, table, row, root };
}
/** Formats actual native model without fabricated paragraph projections. @param root - Original root. @param height - Browser measured row height. @returns Original snapshot. */
function format(root: SwRootFrame, height = 240) {
  return root.Format(
    root
      .GetFormat()
      .GetDoc()
      .paragraphs.map(
        /** Supplies actual native node addresses to controlled device line geometry. @param node - Original body node. @returns Measured original paragraph. */
        (node) => ({
          id: String(node.GetIndex()),
          lines: [{ start: 0, end: node.GetText().length, height: 240 }],
        }),
      ),
    createDefaultWriterPageDescriptor("en-GB").GetValue(),
    undefined,
    new SwLineNumberInfo().QueryValue(),
    0,
    [{ tableName: "Owned master", rowHeights: [height] }],
  );
}
it("native root retains its original table hierarchy across cached format and measured reflow", /** Checks existing actual native master identity and one registered row. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const first = format(f.root),
      frame = required(first.tableFrames[0]),
      row = required(frame.Lower());
    expect(frame.getRootFrame()).toBe(f.root);
    expect(first.pages[0]?.tableFrames[0]?.nativeFrame).toBe(frame);
    expect(format(f.root)).toBe(first);
    const next = format(f.root, 600);
    expect(next.tableFrames[0]).toBe(frame);
    expect(frame.Lower()).toBe(row);
    expect(clients(f.row.GetFrameFormat())).toEqual([f.row, row]);
    f.root.DestroyImpl();
    expect(frame.IsInDtor()).toBe(true);
    expect(clients(f.row.GetFrameFormat())).toEqual([f.row]);
  } finally {
    f.root.DestroyImpl();
  }
});
it("native root rebuilds only a changed original table hierarchy", /** Checks structural invalidation removes obsolete clients and preserves all unchanged original ownership. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const old = required(format(f.root).tableFrames[0]);
    f.doc.nodes.AppendTableRow(f.table, 1);
    f.root.Invalidate();
    const next = required(format(f.root).tableFrames[0]);
    expect(next).not.toBe(old);
    expect(old.IsInDtor()).toBe(true);
    expect(next.Lower()?.GetNext()).toBeDefined();
    expect(
      clients(f.table.GetFrameFormat()).filter(
        /** Retains actual native table frames. @param client - Original registered object. @returns Whether table frame. */ (
          client,
        ) => client instanceof SwTabFrame,
      ),
    ).toEqual([next]);
  } finally {
    f.root.DestroyImpl();
  }
});
it("native root replaces masters when the current document owner changes", /** Checks existing root document-shell boundary releases old table clients. @returns Nothing. */ () => {
  const f = fixture();
  let doc = f.doc;
  const root = new SwRootFrame(
    /** Reads current original document. @returns Document. */ () => doc,
  );
  try {
    const old = required(format(root).tableFrames[0]);
    doc = new SwDoc();
    const table = doc.nodes.MakeTableNode("Owned master");
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1);
    const next = required(format(root).tableFrames[0]);
    expect(next.GetTable()).toBe(table);
    expect(next.getRootFrame()).toBe(root);
    expect(old.IsInDtor()).toBe(true);
    expect(clients(f.table.GetFrameFormat())).not.toContain(old);
  } finally {
    root.DestroyImpl();
    f.root.DestroyImpl();
  }
});
it("native formatting failure releases new owned masters without publishing a snapshot", /** Checks exception cleanup at actual native row measurement. @returns Nothing. */ () => {
  const f = fixture(),
    spy = vi.spyOn(SwRowFrame.prototype, "Format").mockImplementation(
      /** Fails original device measurement. @returns Never. */ () => {
        throw Error("native measurement failed");
      },
    );
  try {
    expect(
      /** Invokes real root formatter. @returns Actual snapshot. */ () => format(f.root),
    ).toThrow("native measurement failed");
    expect(clients(f.table.GetFrameFormat())).toEqual([f.table]);
    expect(clients(f.row.GetFrameFormat())).toEqual([f.row]);
    spy.mockRestore();
    expect(format(f.root).tableFrames).toHaveLength(1);
  } finally {
    spy.mockRestore();
    f.root.DestroyImpl();
  }
});
it("native formatting failure does not destroy a borrowed existing master", /** Checks original root ownership survives an interrupted reflow. @returns Nothing. */ () => {
  const f = fixture();
  try {
    const frame = required(format(f.root).tableFrames[0]);
    f.root.Invalidate();
    const spy = vi.spyOn(SwRowFrame.prototype, "Format").mockImplementation(
      /** Interrupts actual row formatting. @returns Never. */ () => {
        throw Error("borrowed measurement failed");
      },
    );
    try {
      expect(
        /** Invokes original root reflow. @returns Actual snapshot. */ () => format(f.root, 700),
      ).toThrow("borrowed measurement failed");
      expect(frame.IsInDtor()).toBe(false);
    } finally {
      spy.mockRestore();
    }
    expect(format(f.root, 700).tableFrames[0]).toBe(frame);
  } finally {
    f.root.DestroyImpl();
  }
});
it("native root skips empty physical rows without constructing another measurement row", /** Checks original constructor's empty-row admission and zero natural height. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Owned master"),
    root = new SwRootFrame(/** Reads original document. @returns Document. */ () => doc);
  try {
    const snapshot = format(root);
    expect(snapshot.tableFrames).toHaveLength(1);
    expect(snapshot.tableFrames[0]?.GetTable()).toBe(table);
    expect(snapshot.tableFrames[0]?.Lower()).toBeUndefined();
    expect(snapshot.pages[0]?.tableFrames).toHaveLength(0);
  } finally {
    root.DestroyImpl();
  }
});

it("native root skips an original empty physical row without a duplicate measurement client", /** Checks actual constructor rejection reaches the zero-height measure path. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("Owned master"),
    line = new SwTableLine(doc.MakeTableLineFormat()),
    root = new SwRootFrame(/** Reads original document. @returns Document. */ () => doc);
  table.AddLine(line);
  try {
    const snapshot = format(root);
    expect(snapshot.tableFrames[0]?.Lower()).toBeUndefined();
    expect(clients(line.GetFrameFormat())).toEqual([line]);
  } finally {
    root.DestroyImpl();
  }
});
