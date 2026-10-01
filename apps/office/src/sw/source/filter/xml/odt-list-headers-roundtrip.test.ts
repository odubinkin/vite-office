/** @fileoverview Verifies native list headers, item continuations and counted-state ODT/copy/Worker transport. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import type { SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Replaces a genuine package's list declarations and body. @param baseline - Package. @param body - Literal list content. @param common - Common versus automatic styles. @param bullet - Root marker family. @returns ODT package. */
async function input(
  baseline: Uint8Array,
  body: string,
  common: boolean,
  bullet = false,
): Promise<Uint8Array> {
  const zip = new ZipFile(baseline),
    output = new ZipOutputStream();
  const declaration = `<text:list-style style:name="Headers"><text:list-level-style-${bullet ? "bullet" : "number"} text:level="1" ${bullet ? 'text:bullet-char="●"' : 'style:num-format="1" text:start-value="7"'} style:num-suffix="."/><text:list-level-style-number text:level="2" style:num-format="1" style:num-suffix="." text:start-value="5" text:display-levels="2"/><text:list-level-style-number text:level="3" style:num-format="1" style:num-suffix="." text:start-value="3" text:display-levels="3"/></text:list-style>`;
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml" || entry === "content.xml") {
      let xml = await zip.readTextEntry(entry);
      if (entry === "styles.xml" && common)
        xml = xml.replace("</office:styles>", `${declaration}</office:styles>`);
      if (entry === "content.xml") {
        if (!common)
          xml = xml.replace(
            "</office:automatic-styles>",
            `${declaration}</office:automatic-styles>`,
          );
        xml = xml.replace(
          /<office:text>[\s\S]*?<\/office:text>/u,
          `<office:text><text:list text:style-name="Headers">${body}</text:list></office:text>`,
        );
      }
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}
/** Reads canonical text, participation, restart, counters and visible labels. @param document - Writer model. @returns State records. */
function state(document: SwDoc) {
  return document.paragraphs.map(
    /** Reads one validated paragraph. @param node - Writer node. @returns State. */
    (node) => ({
      text: node.GetText(),
      counted: node.IsCountedInList(),
      level: node.GetAttrListLevel(),
      restart: node.IsListRestart(),
      number: node.GetListItemNumber(),
      vector: document
        .GetDocumentListsManager()
        .GetListByName(node.GetListId())
        ?.GetListItemNumberVector(node),
      label: node.GetListLabel(),
    }),
  );
}
/** Projects list tags and paragraph positions independent of attribute order. @param xml - XML stream. @returns Structural event sequence. */
function events(xml: string): string[] {
  const body = xml.match(/<office:text>([\s\S]*?)<\/office:text>/u)?.[1] as string;
  const result: string[] = [];
  for (const token of body.matchAll(
    /<(\/?)(?:text:)(list-header|list-item|list|p)(?=[\s>])[^>]*>/gu,
  )) {
    if (token[2] === "p") {
      if (token[1] !== "/") result.push("p");
    } else result.push(`${token[1] === "/" ? "-" : "+"}${token[2]}`);
  }
  return result;
}

it("round-trips native headers and unnumbered item continuations", /** Verifies literal common/automatic state, structure, independent copies, Worker16 and reopen. @returns Completion. */ async () => {
  const baseline = writeOdtDocument(createWriterDocument(), { title: "Headers" });
  for (const test of [
    {
      body: '<text:list-header text:start-value="ignored"><text:p>header</text:p><text:p>header tail</text:p></text:list-header><text:list-item text:start-value="0"><text:p>zero</text:p><text:p>tail</text:p></text:list-item><text:list-header><text:p>after</text:p></text:list-header><text:list-item><text:p>next</text:p></text:list-item>',
      texts: ["header", "header tail", "zero", "tail", "after", "next"],
      counted: [false, false, true, false, false, true],
      levels: [0, 0, 0, 0, 0, 0],
      numbers: [6, 6, 0, 0, 0, 1],
      vectors: [[6], [6], [0], [0], [0], [1]],
      labels: [undefined, undefined, "0.", undefined, undefined, "1."],
      restarts: [false, false, true, false, false, false],
      events: [
        "+list",
        "+list-header",
        "p",
        "p",
        "-list-header",
        "+list-item",
        "p",
        "p",
        "p",
        "-list-item",
        "+list-item",
        "p",
        "-list-item",
        "-list",
      ],
    },
    {
      body: "<text:list-item><text:p>root</text:p><text:list><text:list-header><text:p>header</text:p><text:p>tail</text:p></text:list-header><text:list-item><text:p>child</text:p></text:list-item></text:list><text:p>after nested</text:p></text:list-item><text:list-item><text:p>end</text:p></text:list-item>",
      texts: ["root", "header", "tail", "child", "after nested", "end"],
      counted: [true, false, false, true, false, true],
      levels: [0, 1, 1, 1, 0, 0],
      numbers: [7, 4, 4, 5, 7, 8],
      vectors: [[7], [7, 4], [7, 4], [7, 5], [7], [8]],
      labels: ["7.", undefined, undefined, "7.5.", undefined, "8."],
      restarts: [false, false, false, false, false, false],
      events: [
        "+list",
        "+list-item",
        "p",
        "+list",
        "+list-header",
        "p",
        "p",
        "-list-header",
        "+list-item",
        "p",
        "-list-item",
        "-list",
        "p",
        "-list-item",
        "+list-item",
        "p",
        "-list-item",
        "-list",
      ],
    },
    {
      body: '<text:list-item text:start-value="0"><text:list><text:list-item><text:p>child first</text:p></text:list-item></text:list><text:p>outer after</text:p></text:list-item><text:list-item><text:p>next</text:p></text:list-item>',
      texts: ["child first", "outer after", "next"],
      counted: [true, false, true],
      levels: [1, 0, 0],
      numbers: [5, 7, 8],
      vectors: [[7, 5], [7], [8]],
      labels: ["7.5.", undefined, "8."],
      restarts: [false, false, false],
      events: [
        "+list",
        "+list-item",
        "+list",
        "+list-item",
        "p",
        "-list-item",
        "-list",
        "p",
        "-list-item",
        "+list-item",
        "p",
        "-list-item",
        "-list",
      ],
    },
    {
      body: '<text:list-item><text:list><text:list-item><text:list><text:list-header text:start-value="-not-a-start"><text:p>deep header</text:p></text:list-header><text:list-item text:start-value="0"><text:p>leaf</text:p></text:list-item></text:list></text:list-item></text:list></text:list-item>',
      texts: ["deep header", "leaf"],
      counted: [false, true],
      levels: [2, 2],
      numbers: [2, 0],
      vectors: [
        [7, 5, 2],
        [7, 5, 0],
      ],
      labels: [undefined, "7.5.0."],
      restarts: [false, true],
      events: [
        "+list",
        "+list-item",
        "+list",
        "+list-item",
        "+list",
        "+list-header",
        "p",
        "-list-header",
        "+list-item",
        "p",
        "-list-item",
        "-list",
        "-list-item",
        "-list",
        "-list-item",
        "-list",
      ],
    },
    {
      body: "<text:list-header><text:p>parent header</text:p><text:list><text:list-item><text:p>child</text:p></text:list-item></text:list><text:p>continuation</text:p></text:list-header><text:list-item><text:p>end</text:p></text:list-item>",
      texts: ["parent header", "child", "continuation", "end"],
      counted: [false, true, false, true],
      levels: [0, 1, 0, 0],
      numbers: [7, 5, 7, 8],
      vectors: [[7], [7, 5], [7], [8]],
      labels: [undefined, "7.5.", undefined, "8."],
      restarts: [false, false, false, false],
      events: [
        "+list",
        "+list-header",
        "p",
        "+list",
        "+list-item",
        "p",
        "-list-item",
        "-list",
        "p",
        "-list-header",
        "+list-item",
        "p",
        "-list-item",
        "-list",
      ],
    },
    {
      bullet: true,
      body: '<text:list-header><text:p>bullet header</text:p></text:list-header><text:list-item text:start-value="0"><text:p>bullet</text:p><text:p>bullet tail</text:p></text:list-item><text:list-item><text:p>next</text:p></text:list-item>',
      texts: ["bullet header", "bullet", "bullet tail", "next"],
      counted: [false, true, false, true],
      levels: [0, 0, 0, 0],
      numbers: [0, 0, 0, 1],
      vectors: [[0], [0], [0], [1]],
      labels: [undefined, "●", undefined, "●"],
      restarts: [false, true, false, false],
      events: [
        "+list",
        "+list-header",
        "p",
        "-list-header",
        "+list-item",
        "p",
        "p",
        "-list-item",
        "+list-item",
        "p",
        "-list-item",
        "-list",
      ],
    },
  ])
    for (const common of [false, true]) {
      const imported = await readOdtDocument(
        await input(baseline, test.body, common, test.bullet ?? false),
        { title: "Headers" },
      );
      const expected = test.texts.map(
        /** Combines independent literal source-derived state. @param text - Paragraph text. @param index - Position. @returns Expected state. */
        (text, index) => ({
          text,
          counted: test.counted[index],
          level: test.levels[index],
          restart: test.restarts[index],
          number: test.numbers[index],
          vector: test.vectors[index],
          label: test.labels[index],
        }),
      );
      expect(state(imported.document)).toEqual(expected);
      const rule = imported.document.FindNumRulePtr("Headers") as SwNumRule;
      const copied = createWriterDocument();
      copied.GetDocumentListsManager().AddNumRule(rule.clone());
      imported.document.paragraphs.forEach(
        /** Copies owned list item sets and text into another document. @param node - Source. @param index - Position. @returns Nothing. */
        (node, index) => {
          const target =
            index === 0 ? (copied.paragraphs[0] as SwTextNode) : copied.nodes.MakeTextNode();
          target.SetText(node.GetText());
          target.SetListItems(node.CaptureListItems());
        },
      );
      expect(state(copied)).toEqual(expected);
      expect(copied.FindNumRulePtr("Headers")).not.toBe(rule);
      const record = encodeWriterDocument(imported.document);
      expect(record.swModelVersion).toBe(16);
      const transferred = decodeWriterDocument(record);
      expect(state(transferred)).toEqual(expected);
      const exported = writeOdtDocument(imported.document, { title: "Headers" });
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      expect(xml).toContain('office:version="1.3"');
      expect(events(xml)).toEqual(test.events);
      expect(xml).not.toContain("list-header text:start-value=");
      const reopened = await readOdtDocument(exported, { title: "Headers" });
      expect(state(reopened.document)).toEqual(expected);
    }
});

it("omits restart metadata on uncounted paragraphs as native NumberingIsNumber projection does", /** Verifies native export omission without inventing header restart retention. @returns Completion. */ async () => {
  const document = createWriterDocument();
  const rule = document.EnsureNumRule("Headers", "numbered", 0);
  rule.GetNumFormat(0).SetStart(7);
  for (let index = 0; index < 3; index++) {
    const node =
      index === 0 ? (document.paragraphs[0] as SwTextNode) : document.nodes.MakeTextNode();
    applyWriterParagraphList(node, { kind: "numbered", styleId: "Headers", listId: "L" });
    if (index === 1) {
      node.SetCountedInList(false);
      node.SetListRestart(true);
      node.SetAttrListRestartValue(0);
    }
  }
  const expected = ["7.", undefined, "8."];
  expect(
    document.paragraphs.map(
      /** Reads a visible marker. @param node - Item. @returns Marker. */ (node) =>
        node.GetListLabel(),
    ),
  ).toEqual(expected);
  const worker = decodeWriterDocument(encodeWriterDocument(document));
  expect(worker.paragraphs[1]?.IsListRestart()).toBe(true);
  const exported = writeOdtDocument(document, { title: "Headers" });
  const xml = await new ZipFile(exported).readTextEntry("content.xml");
  expect(xml).not.toContain('text:list-item text:start-value="0"');
  expect(xml).not.toContain("text:list-header");
  const reopened = await readOdtDocument(exported, { title: "Headers" });
  expect(reopened.document.paragraphs[1]?.IsListRestart()).toBe(false);
  expect(
    reopened.document.paragraphs.map(
      /** Reads a reopened marker. @param node - Item. @returns Marker. */ (node) =>
        node.GetListLabel(),
    ),
  ).toEqual(expected);
  expect(reopened.document.paragraphs[1]?.IsCountedInList()).toBe(false);
});
