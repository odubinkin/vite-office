/** @fileoverview Checks actual cursor-owned marked levels and view-option gates without upstream invocation. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwView } from "../../uibase/uiview/view";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwViewOption, ViewOptFlags } from "../../../inc/viewopt";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwPosition } from "./pam";
const views: SwView[] = [];
afterEach(
  /** Releases real native graphs. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const view of views.splice(0)) view.Close();
  },
);
/** Creates real body or table members with two list identities. @param cell - Use table paragraphs. @returns Existing native owners. */
function fixture(cell = false) {
  const doc = new SwDoc(),
    body = doc.paragraphs[0];
  if (body === undefined) throw Error("Missing body");
  const plain = doc.GetNodes().MakeTextNode("Plain");
  const nodes = cell
    ? (
        /** Creates original cell paragraph owners. @returns Native text members. */ () => {
          const table = doc.GetNodes().MakeTableNode("Marked cells");
          table.AddColumnWidth(6000);
          return [0, 1, 2].map(
            /** Creates original cell text. @param index - Row. @returns Original paragraph. */ (
              index,
            ) => {
              const node = doc
                .GetNodes()
                .AppendTableRow(table, 1)
                .GetTabBoxes()[0]
                ?.GetParagraphs()[0];
              if (node === undefined) throw Error("Missing cell");
              node.SetText(`Item${index}`);
              return node;
            },
          );
        }
      )()
    : [body, doc.GetNodes().MakeTextNode("Child"), doc.GetNodes().MakeTextNode("Other")];
  for (const [index, node] of nodes.entries()) {
    node.SetText(`Item${index}`);
    applyWriterParagraphList(node, {
      kind: index === 2 ? "numbered" : "bullet",
      level: index === 1 ? 1 : 0,
      listId: index === 2 ? "B" : "A",
      ruleName: index === 2 ? "Rule B" : "Rule A",
    });
  }
  const docShell = new SwDocShell(
      doc,
      createDocument({ id: "marked-cursor", suiteId: "writer", title: "Marked cursor" }),
    ),
    view = new SwView(docShell);
  views.push(view);
  doc.GetUndoManager().Clear();
  return { doc, docShell, view, shell: view.GetWrtShell(), edit: view.GetEditWin(), nodes, plain };
}
it("native appearance bits use desktop defaults and the actual shared view options", /** Checks configured defaults, independent bits and no setter-owned redraw. @returns Nothing. */ () => {
  const f = fixture(),
    changes = vi.fn(),
    options = new SwViewOption(changes);
  expect(f.shell.GetViewOptions()).toBe(f.shell.GetViewOptions());
  expect(f.shell.GetViewOptions().IsFieldShadings()).toBe(true);
  expect(options.IsAppearanceFlag(ViewOptFlags.NONE)).toBe(false);
  expect(options.IsAppearanceFlag(ViewOptFlags.IndexShadings | ViewOptFlags.Shadow)).toBe(true);
  expect(options.IsAppearanceFlag(ViewOptFlags.Links | ViewOptFlags.VisitedLinks)).toBe(false);
  options.SetAppearanceFlag(ViewOptFlags.FieldShadings | ViewOptFlags.Shadow, false);
  expect(options.IsFieldShadings()).toBe(false);
  expect(options.IsAppearanceFlag(ViewOptFlags.IndexShadings)).toBe(true);
  options.SetAppearanceFlag(ViewOptFlags.FieldShadings | ViewOptFlags.Links, true);
  expect(options.IsFieldShadings()).toBe(true);
  expect(options.IsAppearanceFlag(ViewOptFlags.Links)).toBe(true);
  expect(changes).not.toHaveBeenCalled();
  f.shell.GetViewOptions().ToggleHorizontalRuler();
  expect(f.view.IsHorizontalRulerVisible()).toBe(false);
});
it("native cursor mark preserves exact pair no-op and former clear before new depth", /** Checks real list state and source delegation order. @returns Nothing. */ () => {
  const f = fixture(),
    calls = vi.spyOn(f.doc, "MarkListLevel");
  f.shell.MarkListLevel("", 0);
  expect(calls).not.toHaveBeenCalled();
  f.shell.MarkListLevel("A", 0);
  expect(f.nodes[0]?.HasMarkedLabel()).toBe(true);
  f.shell.MarkListLevel("A", 0);
  expect(calls).toHaveBeenCalledTimes(1);
  f.shell.MarkListLevel("A", 1);
  expect(calls.mock.calls).toEqual([
    ["A", 0, true],
    ["A", 0, false],
    ["A", 1, true],
  ]);
  expect(f.nodes[0]?.HasMarkedLabel()).toBe(false);
  expect(f.nodes[1]?.HasMarkedLabel()).toBe(true);
  f.shell.MarkListLevel("B", 0);
  expect(calls.mock.calls.slice(-2)).toEqual([
    ["A", 1, false],
    ["B", 0, true],
  ]);
  f.shell.MarkListLevel("", 0);
  expect(calls.mock.calls.at(-1)).toEqual(["B", 0, false]);
  expect(f.docShell.IsModified()).toBe(false);
  expect(f.docShell.GetContentGeneration()).toBe(0);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native shading gate retains bookkeeping and does not invent implicit mark repair", /** Checks source transitions while visual marking is disabled. @returns Nothing. */ () => {
  const f = fixture(),
    options = f.shell.GetViewOptions(),
    calls = vi.spyOn(f.doc, "MarkListLevel");
  options.SetAppearanceFlag(ViewOptFlags.FieldShadings, false);
  f.shell.MarkListLevel("A", 0);
  expect(calls).not.toHaveBeenCalled();
  options.SetAppearanceFlag(ViewOptFlags.FieldShadings, true);
  f.shell.MarkListLevel("A", 0);
  expect(calls).not.toHaveBeenCalled();
  f.shell.MarkListLevel("A", 1);
  expect(calls.mock.calls).toEqual([
    ["A", 0, false],
    ["A", 1, true],
  ]);
  options.SetAppearanceFlag(ViewOptFlags.FieldShadings, false);
  f.shell.MarkListLevel("", 0);
  expect(f.nodes[1]?.HasMarkedLabel()).toBe(true);
  expect(calls).toHaveBeenCalledTimes(2);
  options.SetAppearanceFlag(ViewOptFlags.FieldShadings, true);
  f.shell.MarkListLevel("B", 0);
  expect(calls.mock.calls.at(-1)).toEqual(["B", 0, true]);
  expect(f.nodes[1]?.HasMarkedLabel()).toBe(true);
  expect(f.nodes[2]?.HasMarkedLabel()).toBe(true);
});
it.each([false, true])(
  "native label-to-label admission refreshes original marked levels cell=%s",
  /** Checks real edit-window roundtrip, ordinary text and Insert cleanup. @param cell - Cell context. @returns Nothing. */ (
    cell,
  ) => {
    const f = fixture(cell),
      [first, child, other] = f.nodes;
    if (first === undefined || child === undefined || other === undefined)
      throw Error("Missing members");
    for (const node of [first, child, other]) {
      expect(
        f.edit.SetSelection({
          point: { nodeIndex: node.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
        }),
      ).toBe(true);
      expect(f.shell.IsInFrontOfLabel()).toBe(true);
      expect(node.HasMarkedLabel()).toBe(true);
      for (const previous of f.nodes)
        if (previous !== node) expect(previous.HasMarkedLabel()).toBe(false);
    }
    expect(f.docShell.IsModified()).toBe(false);
    expect(f.docShell.GetContentGeneration()).toBe(0);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(f.edit.SetSelection({ point: { nodeIndex: other.GetIndex(), contentIndex: 0 } })).toBe(
      true,
    );
    expect(other.HasMarkedLabel()).toBe(false);
    expect(
      f.edit.SetSelection({
        point: { nodeIndex: other.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
      }),
    ).toBe(true);
    expect(f.edit.InsertText("X")).toBe(true);
    expect(f.shell.IsInFrontOfLabel()).toBe(false);
    expect(other.HasMarkedLabel()).toBe(false);
    expect(other.GetText()).toBe("XItem2");
    expect(f.docShell.IsModified()).toBe(true);
  },
);
it("native marked-level update preserves nontext early return and resets unnumbered label affinity", /** Checks native pointer domains and counted-rule semantics. @returns Nothing. */ () => {
  const f = fixture(),
    first = f.nodes[0];
  if (first === undefined) throw Error("Missing member");
  expect(first.IsNumbered()).toBe(true);
  expect(f.plain.IsNumbered()).toBe(false);
  expect(
    f.edit.SetSelection({
      point: { nodeIndex: first.GetIndex(), contentIndex: 0, inFrontOfLabel: true },
    }),
  ).toBe(true);
  expect(f.shell.SetInFrontOfLabel(true)).toBe(false);
  f.shell.getShellCursor().GetPoint().Assign(f.doc.GetNodes().GetEndOfContent(), 0);
  f.shell.UpdateMarkedListLevel();
  expect(first.HasMarkedLabel()).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(true);
  f.shell.getShellCursor().GetPoint().Assign(f.plain, 0);
  f.shell.UpdateMarkedListLevel();
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  expect(first.HasMarkedLabel()).toBe(false);
  f.shell.getShellCursor().GetPoint().Assign(first, 0);
  first.SetCountedInList(false);
  expect(first.IsNumbered()).toBe(false);
  expect(f.shell.SetInFrontOfLabel(true)).toBe(true);
  expect(f.shell.IsInFrontOfLabel()).toBe(false);
  first.SetCountedInList(true);
  const number = first.GetNum(),
    rule = first.GetNumRule();
  if (number === undefined || rule === undefined) throw Error("Missing native number");
  number.RemoveMe(f.doc);
  number.ChangeNumRule(rule);
  expect(first.IsNumbered()).toBe(true);
  expect(first.IsInList()).toBe(false);
  expect(f.shell.SetInFrontOfLabel(true)).toBe(true);
  expect(first.HasMarkedLabel()).toBe(false);
});

it("native standalone options stay independent and allow view commands without an attached frame", /** Checks real standalone owner defaults and lifecycle without global view state. @returns Nothing. */ () => {
  const a = new SwDocShell(
      new SwDoc(),
      createDocument({ id: "standalone-a", suiteId: "writer", title: "A" }),
    ),
    b = new SwDocShell(
      new SwDoc(),
      createDocument({ id: "standalone-b", suiteId: "writer", title: "B" }),
    );
  const first = new SwWrtShell(a),
    second = new SwWrtShell(b);
  try {
    expect(first.GetViewOptions()).not.toBe(second.GetViewOptions());
    expect(first.GetViewOptions().IsFieldShadings()).toBe(true);
    first.GetViewOptions().SetAppearanceFlag(ViewOptFlags.FieldShadings, false);
    expect(second.GetViewOptions().IsFieldShadings()).toBe(true);
    first.GetViewOptions().ToggleHorizontalRuler();
    expect(first.GetViewOptions().IsHorizontalRulerVisible()).toBe(false);
    expect(second.GetViewOptions().IsHorizontalRulerVisible()).toBe(true);
    expect(a.IsModified()).toBe(false);
    expect(b.IsModified()).toBe(false);
  } finally {
    first.Close();
    second.Close();
    a.Close();
    b.Close();
  }
});
it("native label admission publishes one complete cursor and repaint transaction across guarded ranges", /** Checks native CallLink-shaped publication and original endpoint admission. @returns Nothing. */ () => {
  const f = fixture(),
    [first, child] = f.nodes,
    foreign = new SwDoc();
  if (first === undefined || child === undefined || foreign.paragraphs[0] === undefined)
    throw Error("Missing nodes");
  const points = [
    new SwPosition(first, 0),
    new SwPosition(child, 0),
    new SwPosition(child, 1),
    new SwPosition(child, 2),
    new SwPosition(child, 3),
    new SwPosition(foreign.paragraphs[0], 0),
    new SwPosition(f.plain, 0),
  ];
  const [a, b, text, mark, otherMark, rejected, plain] = points;
  if (
    a === undefined ||
    b === undefined ||
    text === undefined ||
    mark === undefined ||
    otherMark === undefined ||
    rejected === undefined ||
    plain === undefined
  )
    throw Error("Missing positions");
  const states: { label: boolean; first: boolean; child: boolean; kinds: string[] }[] = [];
  const stop = f.shell.Subscribe(
    /** Reads only complete actual cursor/list state at publication. @param hint - Native transaction. @returns Nothing. */ (
      hint,
    ) =>
      states.push({
        label: f.shell.IsInFrontOfLabel(),
        first: first.HasMarkedLabel(),
        child: child.HasMarkedLabel(),
        kinds:
          hint.kind === "model-transaction"
            ? hint.hints.map(
                /** Reads nested identity. @param nested - Native hint. @returns Discriminator. */ (
                  nested,
                ) => nested.kind,
              )
            : [hint.kind],
      }),
  );
  try {
    expect(f.shell.SetPaM(rejected)).toBe(false);
    expect(f.shell.SetPaM(a, rejected)).toBe(false);
    expect(states).toEqual([]);
    expect(f.shell.SetPaM(a, undefined, true)).toBe(true);
    expect(states).toHaveLength(1);
    expect(states[0]).toMatchObject({ label: true, first: true, child: false });
    expect(states[0]?.kinds).toContain("numbering-changed");
    expect(states[0]?.kinds).toContain("cursor-selection-changed");
    expect(f.shell.SetPaM(a, undefined, true)).toBe(false);
    expect(states).toHaveLength(1);
    expect(f.shell.SetPaM(b, undefined, true)).toBe(true);
    expect(states).toHaveLength(2);
    expect(states[1]).toMatchObject({ label: true, first: false, child: true });
    expect(f.shell.SetPaM(text)).toBe(true);
    expect(states).toHaveLength(3);
    expect(states[2]).toMatchObject({ label: false, first: false, child: false });
    expect(f.shell.SetPaM(text, mark)).toBe(true);
    expect(f.shell.SetPaM(text, mark)).toBe(false);
    expect(f.shell.SetPaM(text, otherMark)).toBe(true);
    expect(f.shell.SetPaM(plain)).toBe(true);
    expect(states).toHaveLength(6);
    expect(f.docShell.IsModified()).toBe(false);
    expect(f.docShell.GetContentGeneration()).toBe(0);
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  } finally {
    stop();
    for (const position of points) position.Dispose();
    foreign.Dispose();
  }
});
