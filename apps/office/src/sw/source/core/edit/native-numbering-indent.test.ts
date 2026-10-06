/** @fileoverview Checks native label-indent shell policy and existing rule/history owners. */
import { afterEach, expect, it, vi } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwNumRule, SwNumFormat } from "../doc/number";
import { applyWriterParagraphList } from "../doc/list";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwUndoInsNum } from "../undo/unnum";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { readOdtDocument } from "../../filter/xml/swxml";

const shells: SwWrtShell[] = [];
afterEach(
  /** Releases actual shell and test seams. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    for (const shell of shells.splice(0)) shell.Close();
  },
);
/** Builds native numbered nodes with stable identities and independently owned geometry. @returns Actual owners. */
function fixture() {
  const doc = new SwDoc(),
    first = doc.paragraphs[0],
    second = doc.nodes.MakeTextNode(),
    plain = doc.nodes.MakeTextNode();
  if (first === undefined) throw new Error("Missing first paragraph");
  first.SetText("First");
  second.SetText("Second");
  plain.SetText("Plain");
  for (const [node, level] of [
    [first, 0],
    [second, 1],
  ] as const)
    applyWriterParagraphList(node, {
      kind: "numbered",
      styleId: "IndentRule",
      listId: "indent-list",
      level,
    });
  const rule = first.GetNumRule();
  if (rule === undefined) throw new Error("Missing rule");
  const format = new SwNumFormat(rule.Get(0));
  format.SetIndentAt(400);
  format.SetListtabPos(300);
  rule.Set(0, format);
  const metadata = createDocument({ id: "indent", suiteId: "writer", title: "Indent" }),
    shell = new SwWrtShell(new SwDocShell(doc, metadata));
  shells.push(shell);
  const point = new SwPosition(first, 2);
  try {
    shell.SetCursor(point);
  } finally {
    point.Dispose();
  }
  doc.GetUndoManager().Clear();
  return { doc, first, second, plain, rule, shell, metadata };
}
/** Calls the actual shell with one borrowed explicit label position. @param shell - Owner. @param node - Label node. @param indent - Native signed16 target. @returns Native admission. */
function indent(shell: SwWrtShell, node: ReturnType<typeof fixture>["first"], indent: number) {
  const point = new SwPosition(node, 0);
  try {
    return shell.SetIndent(indent, point);
  } finally {
    point.Dispose();
  }
}

it("uses the current first cursor rather than target level and changes only the existing rule with UndoRedo", /** Checks explicit label position, first-current-cursor policy and history. @returns Nothing. */ () => {
  const f = fixture(),
    before = new SwNumRule(f.rule),
    items = f.second.CaptureListItems(),
    record = f.second.GetNum(),
    cursor = f.shell.GetCursor();
  expect(indent(f.shell, f.second, 700)).toBe(true);
  expect(f.first.GetNumRule()).toBe(f.rule);
  expect(f.second.GetNumRule()).toBe(f.rule);
  expect([f.rule.Get(0).GetIndentAt(), f.rule.Get(0).GetListtabPos()]).toEqual([700, 600]);
  expect(f.rule.Get(1).GetIndentAt()).toBe(before.Get(1).GetIndentAt() + 300);
  expect(f.second.GetNum()).toBe(record);
  expect(f.second.GetListId()).toBe("indent-list");
  expect(f.second.CaptureListItems().Equals(items, true)).toBe(true);
  expect(f.shell.GetCursor()).toBe(cursor);
  expect(cursor.GetPoint().GetNode()).toBe(f.first);
  expect(cursor.GetPoint().GetContentIndex()).toBe(2);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(f.rule.Equals(before)).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect(f.rule.Get(0).GetIndentAt()).toBe(700);
  expect([f.first.GetText(), f.second.GetText(), f.plain.GetText()]).toEqual([
    "First",
    "Second",
    "Plain",
  ]);
  expect(cursor.GetPoint().GetContentIndex()).toBe(2);
});

it("retains native non-first level-copy behavior and accepts a numbering history operation without changing fields", /** Checks source non-writing level branch and unchanged native identities. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.second, 1);
  try {
    f.shell.SetCursor(point);
  } finally {
    point.Dispose();
  }
  const before = new SwNumRule(f.rule);
  expect(indent(f.shell, f.second, 900)).toBe(true);
  expect(f.rule.Equals(before)).toBe(true);
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  expect(f.shell.Undo()).toBe(true);
  expect(f.shell.Redo()).toBe(true);
  expect(f.rule.Equals(before)).toBe(true);
  expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.second);
});

it("keeps multi-selection and plain current cursors out of the all-level first branch", /** Checks native ring admission and actual unrelated cursor. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.second, 0),
    ring = new SwPaM(point, undefined, f.shell.GetCursor());
  point.Dispose();
  const before = new SwNumRule(f.rule);
  try {
    expect(indent(f.shell, f.first, 900)).toBe(true);
    expect(f.rule.Equals(before)).toBe(true);
  } finally {
    ring.Dispose();
  }
  const plain = new SwPosition(f.plain, 0);
  try {
    f.shell.SetCursor(plain);
  } finally {
    plain.Dispose();
  }
  expect(indent(f.shell, f.second, 900)).toBe(true);
  expect(f.rule.Equals(before)).toBe(true);
  const structural = f.doc.GetNodes().at(0);
  const actual = f.shell.GetCursor().GetPoint();
  vi.spyOn(actual, "GetNode").mockReturnValue(structural);
  expect(indent(f.shell, f.second, 900)).toBe(true);
  expect(f.rule.Equals(before)).toBe(true);
});

it("rejects unnumbered and nontext target positions without history", /** Checks no-rule native guard. @returns Nothing. */ () => {
  const f = fixture();
  expect(indent(f.shell, f.plain, 700)).toBe(false);
  const point = new SwPosition(f.doc.GetNodes().at(0));
  try {
    expect(f.shell.SetIndent(700, point)).toBe(false);
  } finally {
    point.Dispose();
  }
  expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
});

it("retains negative-level target and missing shown-record current policy", /** Checks real detached numbering level guard. @returns Nothing. */ () => {
  const f = fixture(),
    point = new SwPosition(f.plain, 0);
  try {
    f.shell.SetCursor(point);
  } finally {
    point.Dispose();
  }
  vi.spyOn(f.second, "GetActualListLevel").mockReturnValue(-1);
  const before = new SwNumRule(f.rule);
  expect(indent(f.shell, f.second, 700)).toBe(true);
  expect(f.rule.Equals(before)).toBe(true);
});

it("owns independent old and new rule-format history values and preserves ODT and Worker geometry", /** Checks actual history constructor and package/graph boundaries. @returns Completion. */ async () => {
  const f = fixture(),
    before = new SwNumRule(f.rule),
    after = new SwNumRule(f.rule);
  after.ChangeIndent(300);
  const action = new SwUndoInsNum(before, after, f.doc, f.shell.CaptureCursorState());
  expect(action.GetPayloadSize()).toBe(20);
  before.ChangeIndent(900);
  after.ChangeIndent(900);
  f.shell.ApplyAction(action);
  expect(f.rule.Get(0).GetIndentAt()).toBe(700);
  expect(f.shell.Undo()).toBe(true);
  expect(f.rule.Get(0).GetIndentAt()).toBe(400);
  expect(f.shell.Redo()).toBe(true);
  expect(f.rule.Get(0).GetIndentAt()).toBe(700);
  const reopened = (await readOdtDocument(writeOdtDocument(f.doc, f.metadata), f.metadata))
    .document;
  for (const candidate of [reopened, decodeWriterDocument(encodeWriterDocument(f.doc))]) {
    expect(candidate.paragraphs[0]?.GetNumRule()?.Get(0).GetIndentAt()).toBe(700);
    expect(candidate.paragraphs[0]?.GetNumRule()?.Get(0).GetListtabPos()).toBe(600);
    expect(candidate.paragraphs[1]?.GetText()).toBe("Second");
    candidate.Dispose();
  }
});
