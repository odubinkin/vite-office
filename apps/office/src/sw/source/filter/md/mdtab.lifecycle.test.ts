/** @fileoverview Actual Markdown table cursor registration/release, source callback movement/append order, constructor defaults and owned span cleanup. */
import { assert, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwMarkdownParser, MarkdownReader, SwMdAppendMode } from "./swmd";
import { MDTable } from "./mdtab";
import { enter_span_callback, leave_span_callback } from "./mdcallbcks";
import { MD_ALIGN, MD_SPANTYPE } from "../../../../external/md4c/src/md4c.h";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_UL_SPACE } from "../../../inc/hintids";
/** Owns actual model and cursor, with explicit original parser destruction before borrowed owners. @returns Real fixture. */
function fixture() {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point),
    parser = new SwMarkdownParser(doc, pam);
  point.Dispose();
  return {
    doc,
    node,
    pam,
    parser,
    /** Releases actual parser and caller-owned model objects. @returns Nothing. */ close() {
      parser.SourceDispose();
      pam.Dispose();
      doc.Dispose();
    },
  };
}
it("registers and deregisters an actual borrowed table cursor", /** Spies call through to the real parser; no table/registry results are substituted. @returns Nothing. */ () => {
  const f = fixture(),
    registered = vi.spyOn(f.parser, "RegisterTable"),
    removed = vi.spyOn(f.parser, "DeRegisterTable"),
    table = new MDTable(f.parser);
  expect(registered).toHaveBeenCalledWith(table);
  expect(table.GetTable()).toBeNull();
  expect([table.GetCurRow(), table.GetCurCol()]).toEqual([-1, -1]);
  table.SourceDispose();
  expect(removed).toHaveBeenCalledExactlyOnceWith(table);
  f.close();
});
it("registers a replacement before releasing the previous active table cursor", /** Source make_shared/assignment owns current cursor while old model tables stay owned by the document. @returns Nothing. */ () => {
  const f = fixture(),
    registered = vi.spyOn(f.parser, "RegisterTable"),
    removed = vi.spyOn(f.parser, "DeRegisterTable");
  f.parser.StartTable(1, 1);
  const first = registered.mock.calls[0]?.[0];
  assert(first);
  const model = first.GetTable();
  assert(model);
  f.parser.StartTable(1, 1);
  const second = registered.mock.calls[1]?.[0];
  assert(second);
  expect(registered.mock.invocationCallOrder[1]).toBeLessThan(
    removed.mock.invocationCallOrder[0] as number,
  );
  expect(removed).toHaveBeenCalledExactlyOnceWith(first);
  expect(f.doc.GetTables()).toContain(model);
  f.parser.StartRow();
  f.parser.StartCell(MD_ALIGN.MD_ALIGN_DEFAULT);
  f.parser.EndTable();
  expect(removed).toHaveBeenLastCalledWith(second);
  f.close();
});
it("moves, appends with source spacing, then releases the actual table cursor", /** Existing post-table paragraph is retained instead of consumed by a shortcut. @returns Nothing. */ () => {
  const f = fixture(),
    registered = vi.spyOn(f.parser, "RegisterTable"),
    removed = vi.spyOn(f.parser, "DeRegisterTable");
  f.parser.StartTable(1, 1);
  f.parser.StartRow();
  f.parser.StartCell(MD_ALIGN.MD_ALIGN_DEFAULT);
  f.parser.InsertText("cell");
  const append = vi.spyOn(f.parser, "AppendTextNode"),
    table = registered.mock.calls[0]?.[0];
  assert(table);
  f.pam.SetInFrontOfLabel_(true);
  f.parser.EndTable();
  expect(append).toHaveBeenCalledExactlyOnceWith(SwMdAppendMode.AM_SPACE);
  expect(append.mock.invocationCallOrder[0]).toBeLessThan(
    removed.mock.invocationCallOrder[0] as number,
  );
  expect(removed).toHaveBeenCalledExactlyOnceWith(table);
  expect(f.doc.paragraphs).toHaveLength(2);
  expect(f.doc.paragraphs[0]).toBe(f.node);
  expect(f.pam.GetPoint().GetNode()).toBe(f.doc.paragraphs[1]);
  expect(f.pam.IsInFrontOfLabel()).toBe(false);
  expect((f.node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(283);
  f.close();
});
it("retains native post-table paragraphs through the actual md4c callbacks", /** New-document read has no EndPaste normalization (WRITER343). @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(
    new TextEncoder().encode(`| H |
| --- |
| cell |

After
`),
  );
  expect(
    doc.paragraphs.map(
      /** Reads actual body text. @param node - Actual owner. @returns Text. */ (node) =>
        node.GetText(),
    ),
  ).toEqual(["", "After", ""]);
  doc.Dispose();
});
it("starts quote nesting at minus one and restores body style after the outer quote", /** Uses actual nested quote callbacks and original zero-before-decrement condition. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.AddBlockQuote();
  f.parser.AddBlockQuote();
  f.parser.EndBlockQuote();
  expect(f.parser.GetTextNode().GetParagraphStyle()).toBe("quotations");
  f.parser.EndBlockQuote();
  expect(f.parser.GetTextNode().GetParagraphStyle()).toBe("text-body");
  f.close();
});
it("starts no-paragraph-space true and restores actual previous paragraph spacing", /** Original constructor default is observable before the first parsed block. @returns Nothing. */ () => {
  const f = fixture(),
    next = f.doc.nodes.MakeTextNode("");
  f.node.SetAttr(new SvxULSpaceItem(0, 0, RES_UL_SPACE));
  f.pam.GetPoint().Assign(next, 0);
  f.parser.StartPara();
  expect((f.node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(283);
  f.close();
});
it("destroys a popped owned span item and releases remaining items with its parser", /** Actual Dispose calls are observed without reading released resources or overriding implementations. @returns Nothing. */ () => {
  const f = fixture();
  enter_span_callback(MD_SPANTYPE.MD_SPAN_EM, undefined, f.parser);
  const item = f.parser.m_aAttrStack[0];
  assert(item);
  const released = vi.spyOn(item, "Dispose");
  leave_span_callback(MD_SPANTYPE.MD_SPAN_EM, undefined, f.parser);
  expect(released).toHaveBeenCalledOnce();
  expect(f.parser.m_aAttrStack).toHaveLength(0);
  enter_span_callback(MD_SPANTYPE.MD_SPAN_STRONG, undefined, f.parser);
  const remaining = f.parser.m_aAttrStack[0];
  assert(remaining);
  const destroyed = vi.spyOn(remaining, "Dispose");
  f.close();
  expect(destroyed).toHaveBeenCalledOnce();
});
it("releases the active cursor on real rejected footnote table callbacks", /** This proves the translated callback precondition, not upstream reader reachability or native crash behavior (WRITER342). @returns Nothing. */ () => {
  const f = fixture(),
    start = f.doc.nodes.MakeTextSection(
      f.doc.nodes.GetEndOfInserts(),
      SwStartNodeType.SwFootnoteStartNode,
      f.doc.GetDfltTextFormatColl(),
    ),
    node = f.doc.nodes.at(start.GetIndex() + 1);
  assert(node instanceof SwTextNode);
  f.pam.GetPoint().Assign(node, 0);
  const registered = vi.spyOn(f.parser, "RegisterTable"),
    removed = vi.spyOn(f.parser, "DeRegisterTable");
  expect(
    /** Runs the real pinned parser callbacks. @returns Nothing. */ () =>
      f.parser.CallParser(
        new TextEncoder().encode(`| H |
| --- |
| cell |`),
      ),
  ).toThrow("Markdown cell requires an inserted table");
  const cursor = registered.mock.calls[0]?.[0];
  assert(cursor);
  expect(cursor.GetTable()).toBeNull();
  f.close();
  expect(removed).toHaveBeenCalledExactlyOnceWith(cursor);
});

it("requires real active row and cell owners instead of silently skipping invalid callbacks", /** Assertion translation exposes violated native pointer/index preconditions; it does not certify C++ undefined behavior. @returns Nothing. */ () => {
  const f = fixture();
  expect(
    /** Calls the actual invalid row boundary. @returns Nothing. */ () => f.parser.StartRow(),
  ).toThrow("active table cursor");
  expect(
    /** Calls the actual invalid cell boundary. @returns Nothing. */ () =>
      f.parser.StartCell(MD_ALIGN.MD_ALIGN_DEFAULT),
  ).toThrow("active table cursor");
  f.parser.StartTable(1, 1);
  expect(
    /** Calls the actual invalid cell boundary. @returns Nothing. */ () =>
      f.parser.StartCell(MD_ALIGN.MD_ALIGN_DEFAULT),
  ).toThrow("actual table box");
  f.close();
});
it("retains the original checked alignment-map contract for an actual cell", /** The real md4c producer supplies only the four native enum values; this tests the consumer boundary without mocking a table. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.StartTable(1, 1);
  f.parser.StartRow();
  expect(
    /** Calls the real checked alignment lookup. @returns Nothing. */ () =>
      f.parser.StartCell(99 as MD_ALIGN),
  ).toThrow(RangeError);
  f.close();
});
