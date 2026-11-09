/** @fileoverview RTF direction export through the actual Writer model, format owners, and byte stream. */
import { afterEach, assert, expect, it } from "vitest";
import { SvxFrameDirection as Direction } from "../../../../editeng/inc/frmdir";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { RES_FRAMEDIR } from "../../../inc/hintids";
import { SwStartNodeType } from "../../../inc/ndtyp";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwNodeRange } from "../../../inc/ndindex";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import { SwPosition } from "../../core/crsr/pam";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { SwTextFrame } from "../../core/text/txtfrm";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { RtfDocumentImpl } from "../../writerfilter/rtftok/rtfdocumentimpl";
import { GetPseudoCharRuns } from "./writerwordglue";
import { RtfExport } from "./rtfexport";

const documents: SwDoc[] = [];
afterEach(
  /** Releases genuine model owners after all their borrowers. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
  },
);

/** Creates a document and actual paragraph with a source-specific direction item. @returns Actual model owners. */
function fixture() {
  const document = createWriterDocument();
  documents.push(document);
  const node = document.paragraphs[0];
  assert(node);
  node.SetText("Sample");
  return { document, node };
}

/** Constructs the original direction item. @param value - Native enum. @returns Original item. */
function direction(value: Direction): SvxFrameDirectionItem {
  return new SvxFrameDirectionItem(value, RES_FRAMEDIR);
}

/** Reads the real document query with a scoped position. @param node - Actual source paragraph. @returns Physical or model fallback direction. */
function query(node: SwTextNode): Direction {
  const position = new SwPosition(node);
  try {
    return node.GetDoc().GetTextDirection(position);
  } finally {
    position.Dispose();
  }
}

/** Serializes actual Writer bytes. @param document - Actual document. @returns Original output. */
function write(document: SwDoc): string {
  return new TextDecoder().decode(RtfExport.WriteDocument(document));
}

it.each([
  [Direction.Horizontal_RL_TB, "\\rtlpar", Direction.Horizontal_RL_TB],
  [Direction.Horizontal_LR_TB, "\\ltrpar", Direction.Horizontal_LR_TB],
  [Direction.Vertical_LR_BT, "\\ltrpar", Direction.Horizontal_LR_TB],
] as const)(
  "writes explicit item %i through the original paragraph callback",
  /** Exercises the full writer, then native reimport including the source vertical collapse. @param input - Direct source mode. @param control - Expected body token. @param result - Effective direction after reimport. @returns Nothing. */ (
    input,
    control,
    result,
  ) => {
    const { document, node } = fixture();
    node.SetAttr(direction(input));
    const rtf = write(document);
    expect(rtf.slice(rtf.indexOf("\\pard"))).toContain(control);
    const imported = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
    documents.push(imported);
    expect(imported.paragraphs[0]?.GetSwAttrSet().GetFrameDir().GetValue()).toBe(result);
  },
);

it("uses the page master when an unformatted paragraph lacks a physical frame", /** A direct paragraph item can differ from the actual unformatted direction result. @returns Nothing. */ () => {
  const { document, node } = fixture();
  node.SetAttr(direction(Direction.Horizontal_LR_TB));
  document.GetPageDesc().GetMaster().SetFormatAttr(direction(Direction.Horizontal_RL_TB));
  expect(query(node)).toBe(Direction.Horizontal_RL_TB);
  expect(write(document)).toMatch(/\\pard[^\n]*\\ltrpar/u);
});

it("normalizes Environment through the active model page and keeps a direct LTR override", /** Sets a genuine page item, with an Environment paragraph and then an explicit override. @returns Nothing. */ () => {
  const { document, node } = fixture(),
    page = document.MakePageDesc("RTL", document.GetPageDesc());
  page.GetMaster().SetFormatAttr(direction(Direction.Horizontal_RL_TB));
  node.SetAttr(new SwFormatPageDesc(page.GetName()));
  expect(node.FindPageDesc()).toBe(page);
  expect(write(document)).toMatch(/\\pard[^\n]*\\rtlpar/u);
  node.SetAttr(direction(Direction.Horizontal_LR_TB));
  expect(write(document)).toMatch(/\\pard[^\n]*\\ltrpar/u);
});

it("uses a real registered text frame for bidi runs and resets its cache after editing the item", /** Changes real direction items and observes the owner and run producer without formatting. @returns Nothing. */ () => {
  const { node } = fixture();
  node.SetText("");
  node.SetAttr(direction(Direction.Horizontal_RL_TB));
  const frame = new SwTextFrame(node, "source", 0, 0, 0, []);
  try {
    expect(query(node)).toBe(Direction.Horizontal_RL_TB);
    expect(GetPseudoCharRuns(node)[0]?.mbRTL).toBe(true);
    node.SetAttr(direction(Direction.Horizontal_LR_TB));
    expect(query(node)).toBe(Direction.Horizontal_LR_TB);
    expect(GetPseudoCharRuns(node)[0]?.mbRTL).toBe(false);
  } finally {
    frame.DestroyImpl();
  }
});

/** Creates a real fly content section in Autotext and a registered native fly format anchored to an actual node. @param document - Actual document. @param target - Actual anchor node. @param name - Native format name. @returns Actual fly owners. */
function fly(document: SwDoc, target: SwTextNode, name: string) {
  const nodes = document.GetNodes(),
    boundary = nodes.GetEndOfAutotext(),
    text = nodes.MakeTextNode(boundary, document.GetDfltTextFormatColl()),
    range = new SwNodeRange(boundary, -1, boundary);
  nodes.SectionDown(range, SwStartNodeType.SwFlyStartNode);
  range.Dispose();
  const format = document.MakeFlyFrameFormat(name, document.GetDfltFrameFormat()),
    content = new SwFormatContent(text.StartOfSectionNode()),
    anchor = new SwFormatAnchor(RndStdIds.FLY_AT_PARA),
    position = new SwPosition(target);
  try {
    anchor.SetAnchor(position);
    format.SetFormatAttr(content);
    format.SetFormatAttr(anchor);
  } finally {
    position.Dispose();
    anchor.Dispose();
    content.Dispose();
  }
  return { format, text };
}

it("walks real fly sections by their content indices and stops at an at-page anchor", /** Tests nested actual fly formats and the original at-page boundary. @returns Nothing. */ () => {
  const { document, node } = fixture(),
    outer = fly(document, node, "Outer"),
    inner = fly(document, outer.text, "Inner");
  outer.format.SetFormatAttr(direction(Direction.Horizontal_RL_TB));
  expect(inner.text.GetFlyFormat()).toBe(inner.format);
  expect(query(inner.text)).toBe(Direction.Horizontal_RL_TB);
  inner.format.SetFormatAttr(new SwFormatAnchor(RndStdIds.FLY_AT_PAGE));
  expect(query(inner.text)).toBe(document.GetPageDesc().GetMaster().GetFrameDir().GetValue());
});

it("writes vertical section and cell direction with the native RTF tokens", /** Tests document and table export callbacks over physical format items. @returns Nothing. */ () => {
  const { document, node } = fixture();
  document.GetPageDesc().GetMaster().SetFormatAttr(direction(Direction.Vertical_RL_TB));
  const table = document.nodes.MakeTableNode("Direction", {}, node);
  table.GetFrameFormat().SetFormatAttr(direction(Direction.Horizontal_RL_TB));
  const boxes = document.nodes.AppendTableRow(table, 2).GetTabBoxes();
  assert(boxes[0] && boxes[1]);
  boxes[0].ClaimFrameFormat().SetFormatAttr(direction(Direction.Vertical_RL_TB));
  boxes[1].ClaimFrameFormat().SetFormatAttr(direction(Direction.Vertical_LR_BT));
  const rtf = write(document);
  expect(rtf).toContain("\\stextflow1");
  expect(rtf).toMatch(/\\trowd[^\n]*\\rtlrow/u);
  expect(rtf).toContain("\\cltxtbrl");
  expect(rtf).toContain("\\cltxbtlr");
});

it("exports a named RTL style and an explicit paragraph override through separate output contexts", /** Both native style and node direction are preserved across the real byte pipeline. @returns Nothing. */ () => {
  const { document, node } = fixture();
  const style = document.MakeTextFormatColl("DirectionStyle");
  style.SetFormatAttr(direction(Direction.Horizontal_RL_TB));
  node.ChgFormatColl(style);
  const next = document.GetNodes().MakeTextNode("Override");
  next.ChgFormatColl(style);
  next.SetAttr(direction(Direction.Horizontal_LR_TB));
  const rtf = write(document);
  expect(rtf.slice(0, rtf.indexOf("\\pard"))).toMatch(/\\rtlpar[^{}]*DirectionStyle;/u);
  const imported = new RtfDocumentImpl().ResolveBytes(new TextEncoder().encode(rtf));
  documents.push(imported);
  expect(imported.paragraphs[0]?.GetSwAttrSet().GetFrameDir().GetValue()).toBe(
    Direction.Horizontal_RL_TB,
  );
  expect(imported.paragraphs[1]?.GetSwAttrSet().GetFrameDir().GetValue()).toBe(
    Direction.Horizontal_LR_TB,
  );
});
