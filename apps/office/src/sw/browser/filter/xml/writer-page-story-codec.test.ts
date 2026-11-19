/** @fileoverview Real page-frame section topology across Writer's Worker graph boundary. */
import { assert, expect, it } from "vitest";
import { SwFormatFooter, SwFormatHeader } from "../../../inc/fmthdft";
import { RES_CNTNT, RES_FOOTER, RES_HEADER } from "../../../inc/hintids";
import { SwPaM, SwPosition } from "../../../source/core/crsr/pam";
import { SwDoc } from "../../../source/core/doc/doc";
import { SwTableNode } from "../../../source/core/docnode/node";
import { SwXHeadFootText } from "../../../source/core/unocore/unotext";
import { unicode } from "../../../source/core/unocore/unocrsrhelper";
import { decodeWriterDocument, encodeWriterDocument } from "./writer-document-codec";

it("restores shared native page stories, inactive variants, tables and bookmarks", /** Checks the existing Worker clone format with real section owners across two descriptors. @returns Nothing. */ () => {
  const doc = new SwDoc();
  let restored: SwDoc | undefined;
  try {
    const page = doc.GetPageDesc(),
      master = page.GetMaster(),
      left = page.GetLeft();
    master.SetFormatAttr(new SwFormatFooter(true));
    master.SetFormatAttr(new SwFormatHeader(true));
    const footer = master.GetFooter().GetFooterFormat(),
      header = master.GetHeader().GetHeaderFormat();
    assert(footer && header);
    footer.SetFormatName("Imported footer");
    const size = footer.GetFrameSize().Clone();
    try {
      size.SetWidth(6400);
      footer.SetFormatAttr(size);
    } finally {
      size.Dispose();
    }
    left.SetFormatAttr(master.GetFooter());
    const second = doc.MakePageDesc("Second");
    second.GetMaster().SetFormatAttr(master.GetFooter());
    const inactive = new SwFormatHeader(false);
    inactive.RegisterToFormat(header);
    second.GetFirstLeft().GetAttrSet().Put(inactive, true);
    page.GetFirstMaster().SetFormatAttr(new SwFormatHeader(false));
    page.GetFirstMaster().GetAttrSet().Put(new SwFormatFooter(true), true);
    page.ChgFooterShare(false);
    const footerText = SwXHeadFootText.CreateXHeadFootText(footer);
    const headerText = SwXHeadFootText.CreateXHeadFootText(header);
    const firstText = unicode("Page footer");
    const otherText = unicode("Page header");
    try {
      footerText.setString(firstText);
      headerText.setString(otherText);
      const start = footerText.GetStartNode();
      const table = doc.nodes.MakeTableNodeBefore(start.EndOfSectionNode(), "FooterTable", {});
      const row = doc.nodes.AppendTableRow(table, 1);
      const box = row.GetTabBoxes()[0];
      assert(box);
      const boxFormat = box.GetFrameFormat();
      boxFormat.SetFormatAttr(boxFormat.GetFrameSize());
      const nestedText = box.GetContentNodes()[0]?.GetTextNode();
      assert(nestedText);
      nestedText.SetText("Footer cell");
      const point = new SwPosition(nestedText, 2),
        range = new SwPaM(point);
      try {
        doc.GetIDocumentMarkAccess().MakeBookmark(range, "page-note");
      } finally {
        range.Dispose();
        point.Dispose();
      }
    } finally {
      firstText.dispose();
      otherText.dispose();
      footerText.dispose();
      headerText.dispose();
    }

    const record = structuredClone(encodeWriterDocument(doc));
    expect(record.pageStories?.stories).toHaveLength(2);
    restored = decodeWriterDocument(record);
    const pageCopy = restored.GetPageDesc(),
      secondCopy = restored.GetPageDesc(1);
    const footerCopy = pageCopy.GetMaster().GetFooter().GetFooterFormat();
    const headerCopy = pageCopy.GetMaster().GetHeader().GetHeaderFormat();
    assert(footerCopy && headerCopy);
    expect(footerCopy.GetName()).toBe("Imported footer");
    expect(footerCopy.GetFrameSize().GetWidth()).toBe(6400);
    expect(pageCopy.IsFooterShared()).toBe(false);
    expect(pageCopy.GetLeft().GetFooter().GetFooterFormat()).toBe(footerCopy);
    expect(secondCopy.GetMaster().GetFooter().GetFooterFormat()).toBe(footerCopy);
    expect(secondCopy.GetFirstLeft().GetHeader().GetHeaderFormat()).toBe(headerCopy);
    expect(secondCopy.GetFirstLeft().GetHeader().IsActive()).toBe(false);
    expect(pageCopy.GetFirstMaster().GetAttrSet().GetItemIfSet(RES_HEADER, false)).toBeInstanceOf(
      SwFormatHeader,
    );
    expect(pageCopy.GetFirstMaster().GetHeader().IsActive()).toBe(false);
    expect(pageCopy.GetFirstMaster().GetFooter().IsActive()).toBe(true);
    expect(pageCopy.GetFirstMaster().GetFooter().GetFooterFormat()).toBeNull();
    expect(pageCopy.GetFirstLeft().GetAttrSet().GetItemIfSet(RES_FOOTER, false)).toBeUndefined();
    const start = footerCopy.GetContent().GetContentIdx()?.GetNode();
    assert(start?.IsStartNode());
    const [paragraph, table] = restored.nodes.GetSectionContent(start);
    expect(paragraph?.GetTextNode()?.GetText()).toBe("Page footer");
    assert(table instanceof SwTableNode);
    const cell = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetContentNodes()[0];
    expect(cell?.GetTextNode()?.GetText()).toBe("Footer cell");
    expect(restored.GetIDocumentMarkAccess().GetBookmarks()[0]?.GetMarkStart().GetNode()).toBe(
      cell,
    );
    expect(restored.paragraphs[0]?.GetText()).toBe("");
    expect(restored.GetTables()).toHaveLength(0);
    expect(encodeWriterDocument(restored)).toEqual(record);
  } finally {
    restored?.Dispose();
    doc.Dispose();
  }
});

it("rejects an invalid or mismatched Worker page story binding", /** Prevents unknown story indices and footer-to-header substitution. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    doc.GetPageDesc().GetMaster().SetFormatAttr(new SwFormatFooter(true));
    const record = encodeWriterDocument(doc);
    assert(record.pageStories);
    for (const header of [
      { frame: 0, active: true },
      { frame: 5, active: true },
    ]) {
      const damaged = {
        ...record,
        pageStories: { ...record.pageStories, bindings: [[{ header }, {}, {}, {}]] },
      };
      expect(
        /** Decodes the complete Worker record to test validation and cleanup. @returns Resulting document on unexpected success. */
        () => decodeWriterDocument(damaged),
      ).toThrow("Stored Writer page story reference is invalid.");
    }
    const [story] = record.pageStories.stories;
    assert(story);
    for (const [pageStories, message] of [
      [{ ...record.pageStories, bindings: [] }, "page story graph"],
      [{ ...record.pageStories, bindings: [[]] }, "page story bindings"],
      [{ ...record.pageStories, bindings: [[null, {}, {}, {}]] }, "page story binding"],
      [{ ...record.pageStories, bindings: [[{}, {}, {}, {}]] }, "page story has no owner"],
      [
        { ...record.pageStories, stories: [{ ...story, blocks: undefined }] },
        "page story is invalid",
      ],
      [
        {
          ...record.pageStories,
          stories: [{ ...story, items: [{ which: RES_CNTNT, value: true }] }],
        },
        "page story item",
      ],
    ] as const) {
      expect(
        /** Exercises actual document teardown after invalid transport. @returns Result on unexpected acceptance. */
        () => decodeWriterDocument({ ...record, pageStories }),
      ).toThrow(message);
    }
  } finally {
    doc.Dispose();
  }
});
