/** @fileoverview Verifies the bounded Writer HTML transfer import. */

import { describe, expect, it } from "vitest";

import { parseWriterClipboardPaste } from "../../../browser/filter/html/swhtml";

describe("Writer HTML transfer import", /** Groups bounded HTML filter tests. @returns Nothing. */ function defineWriterHtmlTransferTests(): void {
  it("imports only bounded direct formats and ignores unsafe markup", /** Verifies allowlisted inline semantics. @returns Nothing. */ function importsSafeRuns(): void {
    expect(
      parseWriterClipboardPaste(
        '<strong>Bold <em>italic</em></strong><span style="text-decoration: underline">under</span><br><a href="https://invalid.example" onclick="alert(1)">link</a><script>ignored</script>',
        "plain fallback",
        document,
      ),
    ).toEqual({
      isBlock: false,
      paragraphs: [
        {
          listKind: "none",
          listLevel: 0,
          runs: [
            { attributes: { bold: true, italic: false, underline: false }, text: "Bold " },
            { attributes: { bold: true, italic: true, underline: false }, text: "italic" },
            { attributes: { bold: false, italic: false, underline: true }, text: "under" },
            { attributes: { bold: false, italic: false, underline: false }, text: "\n" },
            {
              attributes: { bold: false, italic: false, underline: false },
              hyperlink: { url: "https://invalid.example" },
              text: "link",
            },
          ],
        },
      ],
      source: "html",
    });
  });

  it("discards unsafe anchor destinations while retaining text", /** Checks browser URL safety at the transfer boundary. @returns Nothing. */ function rejectsUnsafeHyperlinks(): void {
    const paste = parseWriterClipboardPaste(
      '<a href="javascript:alert(1)">unsafe</a><a href="https://example.com">safe</a>',
      "fallback",
      document,
    );
    expect(paste?.paragraphs[0]?.runs).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "unsafe" },
      {
        attributes: { bold: false, italic: false, underline: false },
        hyperlink: { url: "https://example.com" },
        text: "safe",
      },
    ]);
    const control = parseWriterClipboardPaste(
      '<a href="https://example.com&#10;broken">control</a><a href="//example.com">protocol-relative</a>',
      "",
      document,
    );
    expect(control?.paragraphs[0]?.runs).toEqual([
      {
        attributes: { bold: false, italic: false, underline: false },
        text: "controlprotocol-relative",
      },
    ]);
    const missing = parseWriterClipboardPaste('<a>missing</a><a href="">empty</a>', "", document);
    expect(missing?.paragraphs[0]?.runs).toEqual([
      { attributes: { bold: false, italic: false, underline: false }, text: "missingempty" },
    ]);
  });

  it("retains semantic block and nested-list order", /** Verifies paragraph and list import order. @returns Nothing. */ function importsStructuredHtml(): void {
    const paste = parseWriterClipboardPaste(
      "<p>Intro</p><ol><li><strong>Parent</strong><ul><li><em>Child</em></li></ul></li><li>Sibling</li></ol><div>Outro</div>",
      "",
      document,
    );
    expect(
      paste?.paragraphs.map(
        /** Projects one imported paragraph for assertions. @param paragraph - Imported paragraph. @returns Observable list state and text. */ (
          paragraph,
        ) => ({
          kind: paragraph.listKind,
          level: paragraph.listLevel,
          text: paragraph.runs
            .map(
              /** Reads one imported run's text. @param run - Imported run. @returns Visible text. */ (
                run,
              ) => run.text,
            )
            .join(""),
        }),
      ),
    ).toEqual([
      { kind: "none", level: 0, text: "Intro" },
      { kind: "numbered", level: 0, text: "Parent" },
      { kind: "bullet", level: 1, text: "Child" },
      { kind: "numbered", level: 0, text: "Sibling" },
      { kind: "none", level: 0, text: "Outro" },
    ]);
  });

  it("falls back to plain text when rich content has no visible supported data", /** Verifies empty and unsupported rich transfers. @returns Nothing. */ function fallsBackToPlainText(): void {
    expect(
      parseWriterClipboardPaste("<script>ignored</script>", "fallback", document),
    ).toMatchObject({ source: "plain-text", paragraphs: [{ runs: [{ text: "fallback" }] }] });
    expect(parseWriterClipboardPaste("", "plain\ntext", document)).toMatchObject({
      isBlock: true,
      source: "plain-text",
    });
    expect(parseWriterClipboardPaste("", "", document)).toBeUndefined();
  });

  it("imports supported root text while ignoring non-element and malformed list children", /** Verifies defensive block-node handling. @returns Nothing. */ function importsDefensiveBlockNodes(): void {
    const paste = parseWriterClipboardPaste(
      " \n<!-- whitespace boundary -->root<!-- ignored --><span>ignored block sibling</span><p>Body<!-- ignored --></p><ol><div>not an item</div><li>Item</li></ol>",
      "",
      document,
    );
    expect(
      paste?.paragraphs.map(
        /** Reads one imported paragraph's text. @param paragraph - Imported paragraph. @returns Visible text. */ (
          paragraph,
        ) =>
          paragraph.runs
            .map(
              /** Reads one imported run. @param run - Imported run. @returns Run text. */ (run) =>
                run.text,
            )
            .join(""),
      ),
    ).toEqual(["root", "Body", "Item"]);
  });
});
