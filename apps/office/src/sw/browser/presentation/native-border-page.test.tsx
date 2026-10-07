/** @fileoverview Verifies native border-page UI composition and original document/history integration. */
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { WriterBorderPage } from "./WriterBorderPage";
import { SvxBorderTabPage } from "../../../cui/source/tabpages/border";
import { SvxBoxItem, SvxBoxInfoItem } from "../../../editeng/source/items/frmitems";
import {
  SvxBorderLine,
  SvxBorderLineStyle as Style,
} from "../../../editeng/source/items/borderline";
import { SfxItemPool } from "../../../svl/source/items/itempool";
import { SfxItemSet } from "../../../svl/source/items/itemset";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { selectMountedTableRow } from "../../../../test-support/table-mouse-dom";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { RES_BOX } from "../../inc/hintids";
import { WriterTableDialog } from "./WriterTableDialog";
afterEach(cleanup);
it("native pointer focus suppresses auto-selection on empty hits while keyboard focus selects first edge", /** Checks source SilentGrabFocus semantics on the DOM device boundary. @returns Nothing. */ () => {
  const f = fixture();
  cleanup();
  const box = f.input.Get(1) as SvxBoxItem;
  for (const edge of [0, 1, 2, 3]) box.SetLine(undefined, edge);
  f.input.Put(box);
  const page = new SvxBorderTabPage(f.input, 1);
  render(<Host page={page} />);
  const group = screen.getByRole("group", { name: "User-defined borders" });
  fireEvent.focus(screen.getByRole("button", { name: "Right border" }));
  for (const control of group.querySelectorAll<HTMLButtonElement>("[data-writer-border-edge]"))
    vi.spyOn(control, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 10, 10));
  fireEvent.mouseDown(group);
  fireEvent.click(group, { detail: 1, clientX: 500, clientY: 500 });
  expect(screen.getByRole("button", { name: "Left border" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  expect(page.frameSelector.IsAnyBorderVisible()).toBe(false);
  fireEvent.blur(group);
  fireEvent.focus(group);
  expect(screen.getByRole("button", { name: "Left border" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});
it("native pointer intersection dispatches every hit line and keeps modifier selection", /** Checks browser stacking cannot suppress source multi-line hit processing. @returns Nothing. */ () => {
  for (const modifier of [{}, { shiftKey: true }, { ctrlKey: true }, { metaKey: true }]) {
    cleanup();
    const f = fixture(),
      group = screen.getByRole("group", { name: "User-defined borders" });
    for (const control of group.querySelectorAll<HTMLButtonElement>("[data-writer-border-edge]")) {
      const inner = Number(control.dataset.writerBorderEdge) >= 5;
      vi.spyOn(control, "getBoundingClientRect").mockReturnValue(
        new DOMRect(inner ? 40 : 0, inner ? 40 : 0, 20, 20),
      );
    }
    fireEvent.focus(screen.getByRole("button", { name: "Top border" }));
    fireEvent.click(screen.getByRole("button", { name: "Vertical border" }), {
      detail: 1,
      clientX: 50,
      clientY: 50,
      ...modifier,
    });
    for (const name of ["Horizontal", "Vertical"])
      expect(screen.getByRole("button", { name: name + " border" })).toHaveAttribute(
        "data-writer-border-state",
        "0",
      );
    expect(screen.getByRole("button", { name: "Left border" })).toHaveAttribute(
      "aria-pressed",
      Object.keys(modifier).length ? "true" : "false",
    );
    for (const [clientX, clientY] of [
      [-1, -1],
      [50, 30],
      [50, 80],
      [500, 500],
    ])
      fireEvent.click(group, { detail: 1, clientX, clientY });
    expect(f.page.frameSelector.IsAnyBorderVisible()).toBe(true);
  }
});
it("default outer input admits native unchanged-output publication from mounted page", /** Checks native default equality removes output without losing original document ownership. @returns Nothing. */ () => {
  const session = createWriterDocumentSession();
  try {
    const doc = session.docShell.GetDoc(),
      table = doc.nodes.MakeTableNode("Defaults", { width: 3000 });
    table.AddColumnWidth(3000);
    doc.nodes.AppendTableRow(table, 1);
    const pool = new SfxItemPool(),
      info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
    pool.RegisterDefaultItem(new SvxBoxItem(RES_BOX));
    info.SetDist(true);
    const input = new SfxItemSet(pool, [
      [RES_BOX, RES_BOX],
      [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
    ]);
    input.Put(info);
    const submit = vi.fn();
    render(
      <WriterTableDialog
        table={table}
        borderItems={input}
        availableWidth={6000}
        onCancel={vi.fn()}
        onSubmit={submit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("borderItems");
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    session.Close();
  }
});
/** Mounts source-owned widgets with only a browser display revision. @param props - Native page owner. @returns Presentation. */
function Host({ page }: Readonly<{ page: SvxBorderTabPage }>) {
  const [, update] = useState(0);
  return (
    <WriterBorderPage
      page={page}
      onChange={
        /** Invalidates display without owning draft. @returns Nothing. */ () =>
          update(
            /** Advances display. @param version - Old revision. @returns Next revision. */ (
              version,
            ) => version + 1,
          )
      }
    />
  );
}
/** Creates a standalone native page with all six lines and four independent padding values. @param distance - Padding visibility. @returns Native page/input. */
function fixture(distance = true) {
  const pool = new SfxItemPool(),
    box = new SvxBoxItem(1),
    info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  for (const edge of [0, 1, 2, 3]) {
    box.SetLine(new SvxBorderLine(0x123456, 20), edge);
    box.SetDistance(100 + edge * 37, edge);
  }
  info.SetTable(true);
  info.SetDist(distance);
  info.SetMinDist(true);
  info.SetDefDist(28);
  pool.RegisterDefaultItem(new SvxBoxItem(1));
  pool.RegisterDefaultItem(info);
  const input = new SfxItemSet(pool, [
    [1, 1],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  input.Put(box);
  input.Put(info);
  const page = new SvxBorderTabPage(input, 1);
  render(<Host page={page} />);
  return { page, input };
}
it("native page presents six lines, source presets and separate padding/style/color/thickness controls", /** Checks source control composition and absence of aggregate adapters. @returns Nothing. */ () => {
  fixture();
  for (const name of ["Left", "Right", "Top", "Bottom", "Horizontal", "Vertical"])
    expect(screen.getByRole("button", { name: name + " border" })).toBeVisible();
  expect(
    screen.getByRole("button", { name: "Outer Border Without Changing Inner Lines" }),
  ).toBeVisible();
  expect(
    screen.getByRole("combobox", { name: "Border line style" }).querySelectorAll("option"),
  ).toHaveLength(18);
  expect(screen.getByRole("checkbox", { name: "Synchronize" })).not.toBeChecked();
  expect(screen.getByRole("spinbutton", { name: "Left padding (cm)" })).toHaveValue(0.31);
  expect(screen.queryByRole("combobox", { name: "Cell border" })).toBeNull();
  expect(screen.queryByRole("spinbutton", { name: "Cell padding (cm)" })).toBeNull();
});
it("native preset and selected style/color/thickness changes retain independent distances", /** Checks actual DOM dispatch to native owned item deltas. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(screen.getByRole("button", { name: "Outer Border and All Inner Lines" }));
  fireEvent.change(screen.getByRole("combobox", { name: "Border line style" }), {
    target: { value: Style.DOUBLE_THIN },
  });
  expect(screen.getByRole("combobox", { name: "Border thickness" })).toHaveValue("-1");
  expect(screen.getByRole("spinbutton", { name: "Border thickness (pt)" })).toHaveValue(1.1);
  fireEvent.change(screen.getByRole("combobox", { name: "Border thickness" }), {
    target: { value: "-1" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Border thickness (pt)" }), {
    target: { value: "1.25" },
  });
  fireEvent.change(screen.getByLabelText("Border line color"), { target: { value: "#abcdef" } });
  const output = f.input.Clone(false);
  f.page.FillItemSet(output);
  const box = output.Get(1) as SvxBoxItem;
  expect(box.GetTop()?.GetWidth()).toBe(25);
  expect(box.GetTop()?.GetColor()).toBe(0xabcdef);
  expect(box.GetTop()?.GetBorderLineStyle()).toBe(Style.DOUBLE_THIN);
  expect(
    [0, 1, 2, 3].map(
      /** Reads retained native distances. @param edge - Box edge. @returns Twips. */ (edge) =>
        box.GetDistance(edge),
    ),
  ).toEqual([100, 137, 174, 211]);
});
it("mouse selection and native space/arrow keyboard preserve tri-state and modifier extension", /** Checks native interaction rather than aggregate dropdown behavior. @returns Nothing. */ () => {
  const f = fixture(),
    left = screen.getByRole("button", { name: "Left border" }),
    group = screen.getByRole("group", { name: "User-defined borders" });
  fireEvent.mouseDown(left);
  fireEvent.click(left);
  expect(left).toHaveAttribute("data-writer-border-state", "2");
  fireEvent.click(left);
  expect(left).toHaveAttribute("data-writer-border-state", "1");
  fireEvent.click(screen.getByRole("button", { name: "Right border" }), { ctrlKey: true });
  expect(left).toHaveAttribute("aria-pressed", "true");
  expect(left).toHaveAttribute("data-writer-border-state", "0");
  fireEvent.keyDown(group, { key: " ", shiftKey: true });
  expect(left).toHaveAttribute("data-writer-border-state", "0");
  fireEvent.keyDown(group, { key: "Escape" });
  fireEvent.keyDown(group, { key: "ArrowDown" });
  expect(screen.getByRole("button", { name: "Bottom border" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.keyDown(group, { key: " " });
  expect(screen.getByRole("button", { name: "Bottom border" })).toHaveAttribute(
    "data-writer-border-state",
    "2",
  );
  f.page.frameSelector.DeselectAllBorders();
  fireEvent.focus(group);
  expect(left).toHaveAttribute("aria-pressed", "true");
});
it("Synchronize changes only following edits and native info hides unsupported padding", /** Checks independent metric dispatch and visibility. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
    target: { value: "0.2" },
  });
  expect(f.page.GetDistance(0)).toBe(113);
  expect(f.page.GetDistance(1)).toBe(137);
  fireEvent.click(screen.getByRole("checkbox", { name: "Synchronize" }));
  expect(f.page.GetDistance(1)).toBe(137);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Left padding (cm)" }), {
    target: { value: "0.4" },
  });
  expect(f.page.GetDistance(1)).toBe(227);
  cleanup();
  fixture(false);
  expect(screen.queryByRole("spinbutton", { name: "Top padding (cm)" })).toBeNull();
});
it("empty native metric displays blank and transitions through actual browser input", /** Checks source invalid-box field representation. @returns Nothing. */ () => {
  const f = fixture();
  cleanup();
  f.input.InvalidateItem(1);
  const page = new SvxBorderTabPage(f.input, 1);
  render(<Host page={page} />);
  expect(screen.getByRole("spinbutton", { name: "Top padding (cm)" })).toHaveValue(null);
  fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
    target: { value: "0.1" },
  });
  expect(page.GetDistance(0)).toBe(57);
});
it("actual selected native border page applies inner/outer/padding items to original owners and grouped history", /** Checks mounted command capture, original cells, ODT and repeated undo/redo. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  try {
    const doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("NativePage", { width: 6000 }, doc.paragraphs[0]);
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    for (let row = 0; row < 2; row++)
      for (const cell of doc.nodes.AppendTableRow(table, 2).GetTabBoxes())
        cell.GetParagraphs()[0]?.SetText("Original " + row);
    const boxes = table
        .GetTabLines()
        .flatMap(
          /** Reads original table boxes. @param row - Native row. @returns Original boxes. */ (
            row,
          ) => row.GetTabBoxes(),
        ),
      first = boxes[0]?.GetParagraphs()[0] as (typeof doc.paragraphs)[number];
    shell.FocusNode(first);
    render(<WriterWorkbench isActive view={session.view} />);
    selectMountedTableRow("NativePage", 2);
    fireEvent.click(screen.getByRole("button", { name: "Table Properties" }));
    fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
    fireEvent.click(screen.getByRole("button", { name: "Outer Border and All Inner Lines" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Border thickness" }), {
      target: { value: "225" },
    });
    fireEvent.change(screen.getByLabelText("Border line color"), { target: { value: "#abcdef" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "Synchronize" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Top padding (cm)" }), {
      target: { value: "0.3" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(boxes[0]?.GetBox().GetTop()).toBeUndefined();
    expect(boxes[2]?.GetBox().GetTop()?.GetWidth()).toBe(45);
    expect(boxes[2]?.GetBox().GetTop()?.GetColor()).toBe(0xabcdef);
    expect(boxes[2]?.GetBox().GetDistance(0)).toBe(170);
    expect(boxes[2]?.GetBox().GetDistance(1)).toBe(28);
    expect(boxes[2]?.GetBox().GetRight()).toBeUndefined();
    expect(boxes[3]?.GetBox().GetLeft()?.GetWidth()).toBe(45);
    for (let cycle = 0; cycle < 3; cycle++) {
      expect(shell.Undo()).toBe(true);
      expect(boxes[2]?.GetBox().GetTop()).toBeUndefined();
      expect(shell.Redo()).toBe(true);
      expect(boxes[2]?.GetBox().GetTop()?.GetColor()).toBe(0xabcdef);
      expect(table.GetTabLines()[1]?.GetTabBoxes()[0]).toBe(boxes[2]);
    }
    const reopened = await readOdtDocument(writeOdtDocument(doc, { title: "Native page" }), {
      title: "Native page",
    });
    expect(
      reopened.document.GetTables()[0]?.GetTabLines()[1]?.GetTabBoxes()[0]?.GetBox().GetDistance(0),
    ).toBe(170);
    fireEvent.focus(screen.getByRole("textbox", { name: "Row 2 column 1 paragraph 1" }));
    shell.ClearMark();
    session.view.GetEditWin().SetSelection({
      point: {
        nodeIndex: (boxes[2]?.GetParagraphs()[0] as (typeof doc.paragraphs)[number]).GetIndex(),
        contentIndex: 2,
      },
    });
    session.view.GetEditWin().InsertText("!");
    expect(boxes[2]?.GetParagraphs()[0]?.GetText()).toContain("!");
    expect(doc.GetUndoManager().GetUndoActionCount()).toBeGreaterThan(0);
    expect(boxes[2]?.GetBox().Which()).toBe(RES_BOX);
  } finally {
    session.Close();
  }
});
