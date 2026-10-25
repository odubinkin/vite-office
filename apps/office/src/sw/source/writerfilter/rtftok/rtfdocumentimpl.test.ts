/** @fileoverview RTF document import through native Writer paragraph and text hint owners. */
import { expect, it } from "vitest";
import { SwTableNode } from "../../core/docnode/node";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { FontStrikeout } from "../../../../tools/inc/fontenum";
import { DFLT_ESC_PROP, DFLT_ESC_SUPER } from "../../../../editeng/inc/escapementitem";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import { RtfTokenizer } from "./rtftokenizer";

/** Imports one RTF fixture. @param input - RTF source. @returns Writer document. */
function read(input: string) {
  return new RtfDocumentImpl().Resolve(
    new RtfTokenizer(new TextEncoder().encode(input)).Tokenize(),
  );
}

it("keeps a table before the first body paragraph", /** Checks physical body order when RTF starts with a table. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi\\trowd\\cellx1440\\intbl Cell\\cell\\row\\pard After}");
  try {
    expect(document.GetNodes().getBodyContent()[0]).toBeInstanceOf(SwTableNode);
    expect(document.paragraphs.map((paragraph) => paragraph.GetText())).toEqual(["After"]);
  } finally {
    document.Dispose();
  }
});

it("imports group-scoped bold and paragraph alignment into native nodes", /** Checks actual text hints and paragraph items. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi\\qc Plain {\\b Bold} plain\\par\\ql Next}");
  try {
    expect(document.paragraphs.map((paragraph) => paragraph.GetText())).toEqual([
      "Plain Bold plain",
      "Next",
    ]);
    expect(document.paragraphs.map((paragraph) => paragraph.GetParagraphAlignment())).toEqual([
      "center",
      "left",
    ]);
    expect(
      projectWriterTextRuns(document.paragraphs[0])?.map((run) => [run.text, run.attributes.bold]),
    ).toEqual([
      ["Plain ", false],
      ["Bold", true],
      [" plain", false],
    ]);
  } finally {
    document.Dispose();
  }
});

it("resolves font and color tables into native character hints", /** Checks RTF table ownership. @returns Nothing. */ () => {
  const document = read(
    "{\\rtf1{\\fonttbl{\\f0 Arial;}}{\\colortbl;\\red255\\green0\\blue0;}\\f0\\cf1\\fs28 Red}",
  );
  try {
    const run = projectWriterTextRuns(document.paragraphs[0])?.[0];
    expect(run?.text).toBe("Red");
    expect(run?.attributes).toMatchObject({
      color: "#ff0000",
      fontFamily: "Arial",
      fontSizeTwips: 280,
    });
  } finally {
    document.Dispose();
  }
});

it("imports first-line indentation, strikeout, superscript and hyperlink field results", /** Checks represented RTF dispatch and native owners. @returns Nothing. */ () => {
  const document = read(
    '{\\rtf1\\ansi\\fi-120 Base {\\strike crossed} {\\super raised} {\\field{\\*\\fldinst HYPERLINK "https://example.test"}{\\fldrslt linked}}}',
  );
  try {
    const node = document.paragraphs[0];
    expect(node?.GetParagraphFirstLineIndent()).toBe(-120);
    const runs = projectWriterTextRuns(node);
    expect(runs.find((run) => run.text === "crossed")?.attributes.strikeout).toBe(
      FontStrikeout.STRIKEOUT_SINGLE,
    );
    expect(runs.find((run) => run.text === "raised")?.attributes.escapement).toEqual({
      offset: DFLT_ESC_SUPER,
      height: DFLT_ESC_PROP,
    });
    expect(runs.find((run) => run.text === "linked")?.hyperlink?.url).toBe("https://example.test");
  } finally {
    document.Dispose();
  }
});

it("retains visible non-link field results without assigning a hyperlink", /** Checks unrelated fields stay plain at the represented field boundary. @returns Nothing. */ () => {
  const document = read("{\\rtf1\\ansi Before {\\field{\\*\\fldinst PAGE}{\\fldrslt 3}} after}");
  try {
    expect(document.paragraphs[0]?.GetText()).toBe("Before 3 after");
    expect(
      projectWriterTextRuns(document.paragraphs[0]).every((run) => run.hyperlink === undefined),
    ).toBe(true);
  } finally {
    document.Dispose();
  }
});
