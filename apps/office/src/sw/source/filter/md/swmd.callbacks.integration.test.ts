/** @fileoverview Exercises public Markdown callback sequencing, spacing and unsupported import failures with native Writer owners. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SvxAdjustItem, SvxAdjust } from "../../../../editeng/inc/adjustitem";
import { RES_UL_SPACE, RES_PARATR_ADJUST } from "../../../inc/hintids";
import { MD_ALIGN, MD_BLOCKTYPE, MD_SPANTYPE } from "../../../../external/md4c/src/md4c.h";
import { enter_span_callback, leave_span_callback } from "./mdcallbcks";
import { MarkdownReader, SwMarkdownParser, SwMdAppendMode as A } from "./swmd";

/** Owns an actual document and registered callback cursor for one source sequence. @param run - Sequence. @returns Nothing. */
function withParser(run: (parser: SwMarkdownParser, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  const position = new SwPosition(first),
    pam = new SwPaM(position);
  position.Dispose();
  try {
    run(new SwMarkdownParser(doc, pam), doc);
  } finally {
    pam.Dispose();
    doc.Dispose();
  }
}

it("rejects empty parser input and list items without a preceding list", /** Verifies public callback preconditions. @returns Nothing. */ () => {
  withParser(
    /** Exercises actual callback errors. @param parser - Parser. @returns Nothing. */ (parser) => {
      expect(
        /** Calls rejected input. @returns Nothing. */ () => parser.CallParser(new Uint8Array()),
      ).toThrow("Invalid Markdown byte stream.");
      expect(
        /** Calls rejected item. @returns Nothing. */ () =>
          parser.StartNumberedBulletListItem({ is_task: 0, task_mark: 0, task_mark_offset: 0 }),
      ).toThrow("Markdown item callback has no list rule.");
      parser.SetNodeNum(0);
      parser.EndNumberedBulletList();
      parser.StartCell(MD_ALIGN.MD_ALIGN_CENTER);
      parser.StartRow();
      parser.EndTable();
      parser.SetAttrs(parser.m_pPam);
    },
  );
});

it("preserves explicit and soft paragraph spacing and strips at most two trailing newlines", /** Verifies source append modes. @returns Nothing. */ () => {
  withParser(
    /** Exercises native geometry. @param parser - Parser. @param doc - Document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const first = parser.GetTextNode();
      first.SetAttr(new SvxULSpaceItem(123, 456, RES_UL_SPACE));
      parser.InsertText("first\n\n\n");
      expect(parser.AppendTextNode(A.AM_NOSPACE)).toBe(true);
      expect(first.GetText()).toBe("first\n");
      expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(456);
      parser.InsertText("second");
      parser.AppendTextNode(A.AM_NOSPACE);
      const second = doc.paragraphs[1];
      assert(second);
      expect((second.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(0);
      parser.AddParSpace();
      expect((second.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(
        Math.round((5 * 1440) / 25.4),
      );
      parser.AppendTextNode(A.AM_SOFTNOSPACE);
      parser.AddParSpace();
      parser.AppendTextNode(A.AM_NORMAL, false);
      parser.AppendTextNode(A.AM_NONE, false);
      parser.EndBlockQuote();
      expect(parser.GetTextNode().GetParagraphStyle()).toBe("text-body");
    },
  );
});

it("accepts task callbacks and keeps image links and itemless nested spans balanced", /** Verifies represented callbacks using actual imported hints. @returns Nothing. */ () => {
  withParser(
    /** Exercises native task states. @param parser - Parser. @returns Nothing. */ (parser) => {
      parser.InsertText("before");
      parser.StartNumberedBulletList(MD_BLOCKTYPE.MD_BLOCK_UL);
      for (const task_mark of [120, 88, 32]) {
        parser.InsertText("prior");
        parser.StartNumberedBulletListItem({ is_task: 1, task_mark, task_mark_offset: 0 });
        expect(parser.GetTextNode().GetText()).toBe(task_mark === 32 ? "☐ " : "☒ ");
        parser.EndNumberedBulletListItem();
      }
      parser.EndNumberedBulletList();
      parser.InsertText("rule");
      parser.AddHR();
      const bytes = new TextEncoder().encode("topic");
      enter_span_callback(
        MD_SPANTYPE.MD_SPAN_WIKILINK,
        {
          target: {
            text: bytes,
            size: bytes.length,
            substr_types: [0],
            substr_offsets: [0, bytes.length],
          },
        },
        parser,
      );
      expect(parser.m_aAttrStack).toHaveLength(1);
      leave_span_callback(MD_SPANTYPE.MD_SPAN_WIKILINK, undefined, parser);
      enter_span_callback(MD_SPANTYPE.MD_SPAN_U, undefined, parser);
      parser.InsertText("underlined");
      leave_span_callback(MD_SPANTYPE.MD_SPAN_U, undefined, parser);
      leave_span_callback(MD_SPANTYPE.MD_SPAN_U, undefined, parser);
      parser.m_aAttrStack.push(undefined);
      parser.InsertText("plain");
      parser.m_aAttrStack.pop();
    },
  );
  const doc = new MarkdownReader().Read(
    new TextEncoder().encode("[![image](image.png)](https://example.test)"),
  );
  doc.Dispose();
});

it("selects all native table alignments and ignores cells beyond represented rows", /** Verifies source table bounds. @returns Nothing. */ () => {
  withParser(
    /** Exercises source table cursor movement. @param parser - Parser. @returns Nothing. */ (
      parser,
    ) => {
      parser.StartTable(1, 4);
      parser.StartRow();
      for (const [align, value] of [
        [MD_ALIGN.MD_ALIGN_CENTER, SvxAdjust.Center],
        [MD_ALIGN.MD_ALIGN_RIGHT, SvxAdjust.Right],
        [MD_ALIGN.MD_ALIGN_LEFT, SvxAdjust.Left],
        [MD_ALIGN.MD_ALIGN_DEFAULT, SvxAdjust.Left],
      ] as const) {
        parser.StartCell(align);
        expect((parser.GetTextNode().GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust()).toBe(
          value,
        );
      }
      parser.StartCell(MD_ALIGN.MD_ALIGN_CENTER);
      parser.StartRow();
      parser.StartCell(MD_ALIGN.MD_ALIGN_CENTER);
      parser.EndTable();
    },
  );
});

it("imports native HTML blocks and clears the completed HTML buffer", /** Uses the actual reader and borrowed Markdown cursor rather than an unsupported placeholder. @returns Nothing. */ () => {
  const doc = new MarkdownReader().Read(new TextEncoder().encode("<div>raw</div>"));
  try {
    expect(
      doc.paragraphs.map(
        /** Reads real native body nodes. @param node - Node. @returns Text. */ (node) =>
          node.GetText(),
      ),
    ).toEqual(["raw"]);
  } finally {
    doc.Dispose();
  }
  withParser(
    /** Exercises the public block completion on its actual cursor. @param parser - Parser. @param document - Real model. @returns Nothing. */ (
      parser,
      document,
    ) => {
      parser.BeginHtmlBlock();
      parser.m_htmlData = "<p>body</p>";
      parser.EndHtmlBlock();
      expect(parser.m_htmlData).toBe("");
      expect(document.paragraphs[0]?.GetText()).toBe("body");
    },
  );
});

it("restores inherited paragraph spacing and tolerates a structural predecessor", /** Verifies source reset decisions with native style inheritance. @returns Nothing. */ () => {
  withParser(
    /** Exercises native no-space history. @param parser - Parser. @param doc - Document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const first = parser.GetTextNode();
      first.GetTextFormatColl().SetFormatAttr(new SvxULSpaceItem(0, 200, RES_UL_SPACE));
      parser.InsertText("first");
      parser.AppendTextNode(A.AM_NOSPACE);
      parser.AddParSpace();
      expect((first.GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetLower()).toBe(
        Math.round((5 * 1440) / 25.4),
      );
      parser.GetTextNode().SetAttr(new SvxULSpaceItem(0, 200, RES_UL_SPACE));
      parser.AppendTextNode(A.AM_SOFTNOSPACE);
      parser.AddParSpace();
      parser.AppendTextNode(A.AM_NOSPACE);
      parser.m_pPam.GetPoint().Assign(first, 0);
      parser.AddParSpace();
      parser.m_pPam.GetPoint().Assign(doc.GetNodes().GetEndOfContent(), 0);
      expect(
        /** Requests a structural node as callback text. @returns Native text owner. */ () =>
          parser.GetTextNode(),
      ).toThrow("Markdown callback has no text node.");
    },
  );
});
it("lets the actual HTML callback owner consume buffered raw bytes before clearing the buffer", /** Verifies supported virtual ownership transfer. @returns Nothing. */ () => {
  withParser(
    /** Exercises virtual HTML consumer. @param parser - Original cursor owner. @param doc - Document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      /** Provides the represented HTML insertion boundary through the native document. */
      class HtmlConsumer extends SwMarkdownParser {
        /** Inserts buffered callback text through the original cursor. @returns Nothing. */ public override InsertHtmlData(): void {
          this.InsertText(this.m_htmlData);
        }
      }
      const owner = new HtmlConsumer(doc, parser.m_pPam);
      owner.m_htmlData = "raw callback data";
      owner.EndHtmlBlock();
      expect(owner.m_htmlData).toBe("");
      expect(owner.GetTextNode().GetText()).toBe("raw callback data");
    },
  );
});
