/** @fileoverview Verifies original native table frame identities survive actual browser geometry resampling. */
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { SwTabFrame, SwRowFrame, SwCellFrame } from "../../source/core/layout/tabfrm";
import type { SwModify } from "../../inc/calbck";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { SwTab } from "../../inc/fesh";
import { SwTableLine } from "../../source/core/table/swtable";
const cleanups: (() => void)[] = [];
afterEach(
  /** Releases original native owners and DOM devices. @returns Nothing. */ () => {
    for (const close of cleanups.splice(0)) close();
    vi.restoreAllMocks();
  },
);
/** Reads registered actual native clients. @param format - Original format. @returns Client objects. */
function clients(format: SwModify): unknown[] {
  const values: unknown[] = [];
  format.ForAllListeners(
    /** Visits original listeners without replacing notification state. @param client - Native client. @returns Continue. */ (
      client,
    ) => {
      values.push(client);
      return false;
    },
  );
  return values;
}
/** Mounts the actual native pointer boundary over a measurable table device. @returns Native owners and measurement controls. */
function fixture() {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    table = doc.nodes.MakeTableNode("Reuse");
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    boxes = [...row.GetTabBoxes()],
    root = document.createElement("article"),
    element = document.createElement("table");
  element.setAttribute("aria-label", table.GetName());
  let left = 0,
    width = 200;
  vi.spyOn(element, "getBoundingClientRect").mockImplementation(
    /** Reads current actual device coordinates. @returns Current rectangle. */ () =>
      new DOMRect(left, 10, width, 100),
  );
  boxes.forEach(
    /** Creates native cell device identity. @param box - Original box. @param index - Actual column. @returns Nothing. */ (
      box,
      index,
    ) => {
      const cell = document.createElement("td");
      cell.dataset.writerTableBox = String(box.GetStartNode().GetIndex());
      element.append(cell);
      vi.spyOn(cell, "getBoundingClientRect").mockImplementation(
        /** Reads current cell device coordinates. @returns Cell rectangle. */ () =>
          new DOMRect(left + (index * width) / 2, 10, width / 2, 100),
      );
    },
  );
  root.append(element);
  document.body.append(root);
  const controller = new BrowserWriterEditWindow(
      session.view.GetEditWin(),
      {
        document,
        getSelection: /** Uses original browser selection. @returns Selection. */ () =>
          window.getSelection(),
      },
      /** No paragraph sample is needed for table edges. @returns Absent paragraph. */ () =>
        undefined,
    ),
    unsubscribe = controller.Subscribe(root);
  cleanups.push(
    /** Ends native ownership after DOM measurement. @returns Nothing. */ () => {
      unsubscribe();
      root.remove();
      session.Close();
    },
  );
  const hover =
    /** Samples original pointer geometry through the real native edit window. @returns Nothing. */ () =>
      controller.HandlePointerMove({
        clientX: 9999,
        clientY: 9999,
        currentTarget: root,
        preventDefault: /** Retains real pointer cancellation boundary. @returns Nothing. */ () =>
          undefined,
      } as unknown as React.MouseEvent<HTMLElement>);
  const frames = /** Reads actual registered table frames. @returns Native frames. */ () =>
    clients(table.GetFrameFormat()).filter(
      /** Keeps native table layout clients. @param client - Original listener. @returns Whether table frame. */ (
        client,
      ): client is SwTabFrame => client instanceof SwTabFrame,
    );
  hover();
  return {
    session,
    doc,
    table,
    row,
    boxes,
    root,
    element,
    controller,
    unsubscribe,
    hover,
    frames,
    move: /** Changes only browser device rectangles. @param nextLeft - New device origin. @param nextWidth - New device extent. @returns Nothing. */ (
      nextLeft: number,
      nextWidth: number,
    ) => {
      left = nextLeft;
      width = nextWidth;
    },
  };
}
it("original table row and cell identities remain stable while native hit geometry advances", /** Checks source native GetBox consults the same actual layout hierarchy. @returns Nothing. */ () => {
  const f = fixture(),
    frame = f.frames()[0] as SwTabFrame,
    row = frame.Lower() as SwRowFrame,
    cell = row.Lower() as SwCellFrame;
  f.hover();
  f.move(500, 400);
  f.hover();
  expect(f.frames()).toEqual([frame]);
  expect(frame.Lower()).toBe(row);
  expect(row.Lower()).toBe(cell);
  const shell = f.session.view.GetWrtShell(),
    hit = shell.GetBox({ x: 700, y: 50 });
  expect(hit?.frame).toBe(frame);
  expect(hit?.cell.box).toBe(f.boxes[0]);
  expect(shell.WhichMouseTabCol({ x: 700, y: 50 })).toBe(SwTab.COL_HORI);
  expect(shell.GetBox({ x: 100, y: 50 })).toBeUndefined();
});
it("original attribute clients remain connected across device resampling", /** Checks native row item updates do not require a replacement frame. @returns Nothing. */ () => {
  const f = fixture(),
    frame = f.frames()[0] as SwTabFrame,
    row = frame.Lower() as SwRowFrame;
  f.row.SetFormat({ frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 6000, 700) });
  f.hover();
  expect(f.frames()[0]).toBe(frame);
  expect(frame.Lower()).toBe(row);
  expect(row.HasFixSize()).toBe(true);
  expect(row.Format(0)).toBe(700);
  expect(row.GetRegisteredIn()).toBe(f.row.GetFrameFormat());
});
it("native added and removed model rows replace only the obsolete hierarchy", /** Checks actual structural owners determine frame compatibility. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.frames()[0] as SwTabFrame,
    added = f.doc.nodes.AppendTableRow(f.table, 2);
  f.hover();
  const second = f.frames()[0] as SwTabFrame;
  expect(second).not.toBe(first);
  expect(first.GetRegisteredIn()).toBeUndefined();
  expect((second.Lower()?.GetNext() as SwRowFrame).GetTabLine()).toBe(added);
  f.table.RemoveLine(added);
  f.hover();
  expect(f.frames()[0]).not.toBe(second);
  expect(second.GetRegisteredIn()).toBeUndefined();
});
it("native box reorder and removal replace incompatible cell links", /** Checks actual native cell identity rather than mirrored counters. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.frames()[0] as SwTabFrame,
    box = f.boxes[0];
  if (box === undefined) throw Error("Missing original box");
  f.row.RemoveBox(box);
  f.row.AddBox(box);
  f.hover();
  const second = f.frames()[0] as SwTabFrame;
  expect(second).not.toBe(first);
  expect(((second.Lower() as SwRowFrame).Lower() as SwCellFrame).GetTabBox()).toBe(f.boxes[1]);
  f.row.RemoveBox(box);
  f.hover();
  expect(f.frames()[0]).not.toBe(second);
});
it("mounted fragments of one original table retain independent frame identities", /** Checks native device instances are keyed by actual DOM window ownership. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.frames()[0] as SwTabFrame,
    fragment = f.element.cloneNode(true) as HTMLTableElement;
  vi.spyOn(fragment, "getBoundingClientRect").mockReturnValue(new DOMRect(500, 10, 200, 100));
  Array.from(fragment.children).forEach(
    /** Measures an actual repeated device cell. @param cell - Device element. @param index - Original column. @returns Nothing. */ (
      cell,
      index,
    ) =>
      vi
        .spyOn(cell, "getBoundingClientRect")
        .mockReturnValue(new DOMRect(500 + 100 * index, 10, 100, 100)),
  );
  f.root.append(fragment);
  f.hover();
  const second = f
    .frames()
    .find(
      /** Finds the second original native device frame. @param frame - Registered frame. @returns Whether different. */ (
        frame,
      ) => frame !== first,
    );
  f.hover();
  expect(f.frames()).toEqual([first, second]);
  fragment.remove();
  f.hover();
  expect(f.frames()).toEqual([first]);
  expect(second?.GetRegisteredIn()).toBeUndefined();
});
it("a failed later device preserves original accepted frame and exact geometry", /** Checks measurements commit only after the complete sample succeeds. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.frames()[0] as SwTabFrame,
    geometry = first.mouseGeometry;
  f.move(500, 400);
  const broken = f.element.cloneNode(true) as HTMLTableElement;
  broken.setAttribute("aria-label", f.table.GetName());
  vi.spyOn(broken, "getBoundingClientRect").mockImplementation(
    /** Rejects the later device sample. @returns Never. */ () => {
      throw Error("Late device unavailable");
    },
  );
  f.root.append(broken);
  expect(f.hover).toThrow("Late device unavailable");
  expect(f.frames()).toEqual([first]);
  expect(first.mouseGeometry).toBe(geometry);
  expect(f.session.view.GetWrtShell().GetBox({ x: 100, y: 50 })?.frame).toBe(first);
  broken.remove();
  f.hover();
  expect(f.frames()).toEqual([first]);
});
it("disconnected native frame is replaced and unsubscribe retires actual clients", /** Checks original frame registration controls lifetime. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.frames()[0] as SwTabFrame;
  first.Dispose();
  f.hover();
  const second = f.frames()[0] as SwTabFrame;
  expect(second).not.toBe(first);
  f.unsubscribe();
  expect(second.GetRegisteredIn()).toBeUndefined();
  expect(f.frames()).toEqual([]);
  expect(f.session.view.GetWrtShell().GetBox({ x: 100, y: 50 })).toBeUndefined();
});

it("empty native model rows preserve the original nonempty linked hierarchy", /** Checks original zero-box row admission without reconstructing retained clients. @returns Nothing. */ () => {
  const f = fixture(),
    frame = f.frames()[0] as SwTabFrame,
    row = frame.Lower(),
    empty = new SwTableLine(f.doc.MakeTableLineFormat());
  f.table.AddLine(empty, 0);
  f.hover();
  f.hover();
  expect(f.frames()).toEqual([frame]);
  expect(frame.Lower()).toBe(row);
  expect((row as SwRowFrame).GetTabLine()).toBe(f.row);
  expect(clients(empty.GetFrameFormat())).toEqual([empty]);
  expect(f.session.view.GetWrtShell().GetBox({ x: 100, y: 50 })?.frame).toBe(frame);
});
it("failed later measurement destroys only a newly allocated native candidate", /** Checks atomic sample failure with an actual new registered table hierarchy. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.frames()[0] as SwTabFrame,
    geometry = first.mouseGeometry,
    fragment = f.element.cloneNode(true) as HTMLTableElement,
    broken = f.element.cloneNode(true) as HTMLTableElement;
  vi.spyOn(fragment, "getBoundingClientRect").mockReturnValue(new DOMRect(500, 10, 200, 100));
  Array.from(fragment.children).forEach(
    /** Measures each actual candidate device. @param cell - Native cell device. @param index - Original column. @returns Nothing. */ (
      cell,
      index,
    ) =>
      vi
        .spyOn(cell, "getBoundingClientRect")
        .mockReturnValue(new DOMRect(500 + 100 * index, 10, 100, 100)),
  );
  let candidate: SwTabFrame | undefined;
  vi.spyOn(broken, "getBoundingClientRect").mockImplementation(
    /** Observes actual registered candidate before rejecting the next device. @returns Never. */ () => {
      candidate = f
        .frames()
        .find(
          /** Reads the real candidate registration. @param frame - Native listener. @returns Whether newly allocated. */ (
            frame,
          ) => frame !== first,
        );
      throw Error("Candidate device unavailable");
    },
  );
  f.move(250, 400);
  f.root.append(fragment, broken);
  expect(f.hover).toThrow("Candidate device unavailable");
  expect(candidate).toBeInstanceOf(SwTabFrame);
  expect(candidate?.GetRegisteredIn()).toBeUndefined();
  expect(candidate?.Lower()).toBeUndefined();
  expect(f.frames()).toEqual([first]);
  expect(first.mouseGeometry).toBe(geometry);
  expect(f.session.view.GetWrtShell().GetBox({ x: 100, y: 50 })?.frame).toBe(first);
  fragment.remove();
  broken.remove();
  f.hover();
  expect(f.frames()).toEqual([first]);
});
