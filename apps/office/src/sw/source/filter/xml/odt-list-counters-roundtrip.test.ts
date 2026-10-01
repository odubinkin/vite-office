/** @fileoverview Verifies native zero list counters in real common/automatic ODT, owned copies and Worker transfers. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import type { SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Replaces a baseline package with literal native list declarations/body. @param baseline - Package bytes. @param body - List contents. @param start - Root start. @param common - Common versus automatic style. @param bullet - Marker family. @returns Real ODT bytes. */
async function input(
  baseline: Uint8Array,
  body: string,
  start: number,
  common: boolean,
  bullet: boolean,
): Promise<Uint8Array> {
  const zip = new ZipFile(baseline),
    output = new ZipOutputStream();
  const declaration = `<text:list-style style:name="Counters"><text:list-level-style-${bullet ? "bullet" : "number"} text:level="1" ${bullet ? 'text:bullet-char="●"' : 'style:num-format="1"'} style:num-suffix="." text:start-value="${start}"/><text:list-level-style-number text:level="2" style:num-format="1" style:num-suffix="." text:start-value="0" text:display-levels="2"/></text:list-style>`;
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
          `<office:text><text:list text:style-name="Counters">${body}</text:list></office:text>`,
        );
      }
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}
/** Projects canonical counters and labels after actual tree validation. @param document - Writer model. @returns State. */
function state(document: SwDoc) {
  return document.paragraphs.map(
    /** Reads one item after validation. @param node - Item. @returns Counter, vector and label. */
    (node) => ({
      number: node.GetListItemNumber(),
      label: node.GetListLabel(),
      vector: document
        .GetDocumentListsManager()
        .GetListByName(node.GetListId())
        ?.GetListItemNumberVector(node),
    }),
  );
}

it("round-trips zero starts and restarts through native list trees", /** Verifies literal common/automatic package values, labels, copied rules/item sets, Worker v16 and XML/reopen. @returns Completion. */ async () => {
  const baseline = writeOdtDocument(createWriterDocument(), { title: "Counters" });
  const first = "<text:list-item><text:p>first</text:p></text:list-item>";
  const zero = '<text:list-item text:start-value="0"><text:p>restart</text:p></text:list-item>';
  for (const test of [
    {
      body: first.repeat(3),
      start: 0,
      values: [0, 1, 2],
      labels: ["0.", "1.", "2."],
      vectors: [[0], [1], [2]],
    },
    {
      body: first + zero + first,
      start: 7,
      values: [7, 0, 1],
      labels: ["7.", "0.", "1."],
      vectors: [[7], [0], [1]],
    },
    {
      body: zero + zero + first,
      start: 0,
      values: [0, 0, 1],
      labels: ["0.", "0.", "1."],
      vectors: [[0], [0], [1]],
    },
    {
      body: `<text:list-item><text:p>root</text:p><text:list>${first.repeat(2)}</text:list></text:list-item><text:list-item><text:p>next root</text:p><text:list>${first}</text:list></text:list-item>`,
      start: 0,
      values: [0, 0, 1, 1, 0],
      labels: ["0.", "0.0.", "0.1.", "1.", "1.0."],
      vectors: [[0], [0, 0], [0, 1], [1], [1, 0]],
    },
    {
      body: `<text:list-item><text:p>root</text:p><text:list>${first + zero + first}</text:list></text:list-item>`,
      start: 7,
      values: [7, 0, 0, 1],
      labels: ["7.", "7.0.", "7.0.", "7.1."],
      vectors: [[7], [7, 0], [7, 0], [7, 1]],
    },
    {
      bullet: true,
      body: first.repeat(3),
      start: 0,
      values: [1, 2, 3],
      labels: ["●", "●", "●"],
      vectors: [[1], [2], [3]],
    },
    {
      bullet: true,
      body: zero + first.repeat(2),
      start: 0,
      values: [0, 1, 2],
      labels: ["●", "●", "●"],
      vectors: [[0], [1], [2]],
    },
  ])
    for (const common of [false, true]) {
      const result = await readOdtDocument(
        await input(baseline, test.body, test.start, common, test.bullet ?? false),
        { title: "Counters" },
      );
      const expected = test.values.map(
        /** Combines independent literal expectations. @param number - Counter. @param index - Item. @returns State. */
        (number, index) => ({ number, label: test.labels[index], vector: test.vectors[index] }),
      );
      expect(state(result.document)).toEqual(expected);
      const rule = result.document.FindNumRulePtr("Counters") as SwNumRule;
      const copied = createWriterDocument();
      copied.GetDocumentListsManager().AddNumRule(rule.clone());
      result.document.paragraphs.forEach(
        /** Applies captured items to an independent model with an owned rule copy. @param node - Source. @param index - Item. @returns Nothing. */
        (node, index) =>
          (index === 0
            ? (copied.paragraphs[0] as SwTextNode)
            : copied.nodes.MakeTextNode()
          ).SetListItems(node.CaptureListItems()),
      );
      expect(state(copied)).toEqual(expected);
      expect(copied.FindNumRulePtr("Counters")).not.toBe(rule);
      const transferred = decodeWriterDocument(encodeWriterDocument(result.document));
      expect(state(transferred)).toEqual(expected);
      const exported = writeOdtDocument(result.document, { title: "Counters" });
      const xml = await new ZipFile(exported).readTextEntry("content.xml");
      expect(xml).toContain('office:version="1.3"');
      const rootDeclaration = xml.match(
        /<text:list-level-style-(?:number|bullet) text:level="1"[^>]*>/u,
      )?.[0];
      if (test.bullet || test.start === 1)
        expect(rootDeclaration).not.toContain("text:start-value=");
      else expect(rootDeclaration).toContain(`text:start-value="${test.start}"`);
      if (test.body.includes('text:start-value="0"'))
        expect(xml).toContain('<text:list-item text:start-value="0">');
      const reopened = await readOdtDocument(exported, { title: "Counters" });
      expect(state(reopened.document)).toEqual(expected);
    }
});
