/** @fileoverview Native full-section deletion orders mark removal, cursor correction, frame/list/hint teardown and borrowed node-index reassignment. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "./doc";
import { SwNodeIndex, SwPosition, SwPaM } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import { SwDocShell } from "../../uibase/app/docsh";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwXText } from "../unocore/unotext";
import { SwXTextCursor } from "../unocore/unoobj";
import { RuntimeException } from "../../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { SwRootFrame } from "../layout/newfrm";
import { SwTextFrame } from "../text/txtfrm";
import { SwHTMLParser } from "../../filter/html/swhtml";
import { InsertTempTableCaptionSection } from "../../filter/html/htmltab.sections";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
/** Builds an actual temporary section immediately before a fixed structural successor. @returns Native owners. */
function fixture() {
  const doc = new SwDoc(),
    where = doc.nodes.GetEndOfExtras();
  const section = doc.nodes.MakeTextSection(
    where,
    K.SwNormalStartNode,
    doc.GetDfltTextFormatColl(),
  );
  const text = doc.nodes.at(section.GetIndex() + 1);
  assert(text instanceof SwTextNode);
  text.SetText("caption");
  return { doc, where, section, text };
}
it.each(["start", "content", "end"] as const)(
  "deletes a whole section selected through its %s node",
  /** Source DeleteSection accepts any node in that designated section. @param kind - Actual input category. @returns Nothing. */ (
    kind,
  ) => {
    const f = fixture(),
      first = f.section.GetIndex(),
      count = f.doc.nodes.Count(),
      body = f.doc.paragraphs[0];
    const indices = [f.section, f.text, f.section.EndOfSectionNode()].map(
      /** Owns an actual borrowed index. @param node - Original node. @returns Index. */ (node) =>
        new SwNodeIndex(node),
    );
    f.doc
      .GetDocumentContentOperationsManager()
      .DeleteSection(
        kind === "start" ? f.section : kind === "content" ? f.text : f.section.EndOfSectionNode(),
      );
    expect(f.doc.nodes.Count()).toBe(count - 3);
    expect(f.doc.nodes.at(first)).toBe(f.where);
    expect(f.doc.paragraphs[0]).toBe(body);
    for (const index of indices) {
      expect(index.GetNode()).toBe(f.where);
      index.Dispose();
    }
    f.doc.Dispose();
  },
);
it("moves every actual shell and saved cursor to the structural successor before destroying the section", /** Preserves GetCorrPosition's original structural target rather than choosing body text. @returns Nothing. */ () => {
  const f = fixture(),
    ds = new SwDocShell(
      f.doc,
      createDocument({ id: "section", suiteId: "writer", title: "Section" }),
    ),
    shell = new SwWrtShell(ds);
  const position = new SwPosition(f.text, 3);
  shell.GetCursor_().Assign(position);
  position.Dispose();
  shell.Push();
  shell.Push();
  f.doc.GetDocumentContentOperationsManager().DeleteSection(f.section);
  expect(shell.GetCursor_().GetPoint().GetNode()).toBe(f.where);
  expect(shell.GetCursor_().GetPoint().nContent.GetContentNode()).toBeUndefined();
  const stack = shell.GetStackCursor();
  assert(stack);
  for (const cursor of stack.GetRingContainer()) expect(cursor.GetPoint().GetNode()).toBe(f.where);
  shell.Close();
  ds.Close();
});
it("deletes contained native marks and invalidates the actual cell-like text API owner", /** Actual mark and UNO-cursor lifetimes end before node removal. @returns Nothing. */ () => {
  const f = fixture(),
    pos = new SwPosition(f.text, 2),
    range = new SwPaM(pos),
    owner = new SwXText(f.doc, f.section);
  const cursor = new SwXTextCursor(range, owner),
    marks = f.doc.GetIDocumentMarkAccess();
  marks.MakeMark(f.text, 1, "inside");
  marks.MakeUnoMark(range);
  range.Dispose();
  pos.Dispose();
  f.doc.GetDocumentContentOperationsManager().DeleteSection(f.section);
  expect(marks.GetAllMarks()).toHaveLength(0);
  let failure: unknown;
  try {
    cursor.GetCursor();
  } catch (error) {
    failure = error;
  }
  expect(failure).toBeInstanceOf(RuntimeException);
  cursor.dispose();
  f.doc.Dispose();
});
it("destroys actual content-frame chains and owned hints before removing nodes", /** Uses real source clients and call-through destruction observers without querying freed frame/node state. @returns Nothing. */ () => {
  const f = fixture(),
    root = new SwRootFrame(/** Borrows actual document. @returns Document. */ () => f.doc);
  const frame = new SwTextFrame(
    f.text,
    "native",
    0,
    7,
    0,
    [{ start: 0, end: 7, height: 300 }],
    root,
  );
  frame.InsertBehind(root);
  const hints = f.text.GetOrCreateSwpHints(),
    disposed = vi.spyOn(hints, "Dispose"),
    destroyed = vi.spyOn(frame, "DestroyImpl");
  f.doc.GetDocumentContentOperationsManager().DeleteSection(f.section);
  expect(disposed).toHaveBeenCalledOnce();
  expect(destroyed).toHaveBeenCalledOnce();
  expect(root.Lower()).toBeUndefined();
  vi.restoreAllMocks();
  root.DestroyImpl();
  f.doc.Dispose();
});
it("deletes a complete table before a structural successor through the native section path", /** Existing table-history deletion's following-text restriction is not imposed on DelNodes. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    table = doc.nodes.MakeTableNode("delete"),
    row = doc.nodes.AppendTableRow(table, 2),
    end = doc.nodes.GetEndOfContent();
  const formats = [
    table.GetFrameFormat(),
    row.GetFrameFormat(),
    ...row
      .GetTabBoxes()
      .map(
        /** Borrows actual frame owner. @param box - Native box. @returns Native frame. */ (box) =>
          box.GetFrameFormat(),
      ),
  ];
  const disposed = formats.map(
    /** Observes actual owner release. @param format - Frame owner. @returns Call-through spy. */ (
      format,
    ) => vi.spyOn(format, "DisposeModify"),
  );
  doc.GetDocumentContentOperationsManager().DeleteSection(table.GetTableNode());
  expect(doc.GetTables()).toHaveLength(0);
  expect(doc.nodes.at(doc.nodes.Count() - 1)).toBe(end);
  for (const spy of disposed) expect(spy).toHaveBeenCalledOnce();
  vi.restoreAllMocks();
  doc.Dispose();
});
it("uses the real importer wrapper to delete its temporary caption section", /** Full caption token orchestration remains separate, but its actual section owner and deletion route are connected. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const p = new SwPosition(node),
    pam = new SwPaM(p);
  p.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8)),
    before = doc.nodes.Count();
  const start = InsertTempTableCaptionSection(parser),
    where = start
      .EndOfSectionNode()
      .GetNodes()
      .at(start.EndOfSectionNode().GetIndex() + 1);
  // Original caption callers restore the importer cursor before deleting its saved section.
  const restored = new SwPosition(node);
  pam.Assign(restored);
  restored.Dispose();
  parser.DeleteSection(start);
  expect(doc.nodes.Count()).toBe(before);
  expect(pam.GetPoint().GetNode()).toBe(node);
  expect(where).toBe(doc.nodes.GetEndOfExtras());
  parser.SourceDispose();
  pam.Dispose();
  doc.Dispose();
});
it("filters real content frames by layout while preserving another live view", /** Root-filtered teardown retains native follow-chain and sibling owners in other layouts. @returns Nothing. */ () => {
  const f = fixture(),
    a = new SwRootFrame(/** Borrows actual document. @returns Document. */ () => f.doc),
    b = new SwRootFrame(/** Borrows actual document. @returns Document. */ () => f.doc);
  const master = new SwTextFrame(f.text, "a", 0, 3, 0, [{ start: 0, end: 3, height: 300 }], a),
    follow = new SwTextFrame(f.text, "a", 3, 7, 0, [{ start: 3, end: 7, height: 300 }], a),
    other = new SwTextFrame(f.text, "b", 0, 7, 0, [{ start: 0, end: 7, height: 300 }], b);
  master.InsertBehind(a);
  follow.InsertBehind(a, master);
  master.SetFollow(follow);
  other.InsertBehind(b);
  const first = vi.spyOn(master, "DestroyImpl"),
    second = vi.spyOn(follow, "DestroyImpl"),
    retained = vi.spyOn(other, "DestroyImpl");
  f.text.DelFrames(a);
  expect(first).toHaveBeenCalledOnce();
  expect(second).toHaveBeenCalledOnce();
  expect(retained).not.toHaveBeenCalled();
  expect(a.Lower()).toBeUndefined();
  expect(b.Lower()).toBe(other);
  f.doc.GetDocumentContentOperationsManager().DeleteSection(f.section);
  expect(retained).toHaveBeenCalledOnce();
  expect(b.Lower()).toBeUndefined();
  vi.restoreAllMocks();
  a.DestroyImpl();
  b.DestroyImpl();
  f.doc.Dispose();
});
it("invalidates the actual named numbering rule before destroying section text", /** The surviving rule records native invalidation even after its text/list client is removed. @returns Nothing. */ () => {
  const f = fixture(),
    rule = f.doc.GetOutlineNumRule();
  f.text.SetNumRule(rule.GetName());
  rule.Validate(f.doc);
  expect(rule.IsInvalidRule()).toBe(false);
  f.doc.GetDocumentContentOperationsManager().DeleteSection(f.section);
  expect(rule.IsInvalidRule()).toBe(true);
  f.doc.Dispose();
});
