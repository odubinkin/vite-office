/** @fileoverview Verifies native list-item integer normalization through genuine ODT, owned copies and Worker16. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import type { SwNumRule } from "../../core/doc/number";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Encodes literal attribute characters without XML whitespace normalization. @param value - Original spelling. @returns Attribute fragment or absence. */
function startAttribute(value: string | undefined): string {
  return value === undefined
    ? ""
    : ` text:start-value="${[...value]
        .map(
          /** Uses character references for original XML-legal characters. @param character - Source character. @returns Reference. */
          (character) => `&#${character.codePointAt(0)};`,
        )
        .join("")}"`;
}
/** Builds a genuine common/automatic numbered or bullet package. @param baseline - Base ODT. @param common - Common style container. @param bullet - Marker family. @param value - Raw start spelling. @returns Package. */
async function input(
  baseline: Uint8Array,
  common: boolean,
  bullet: boolean,
  value: string | undefined,
): Promise<Uint8Array> {
  const zip = new ZipFile(baseline),
    output = new ZipOutputStream();
  const style = `<text:list-style style:name="Starts"><text:list-level-style-${bullet ? "bullet" : "number"} text:level="1" ${bullet ? 'text:bullet-char="●"' : 'style:num-format="1" text:start-value="7"'} style:num-suffix="."/><text:list-level-style-number text:level="2" style:num-format="1" text:start-value="5" text:display-levels="2" style:num-suffix="."/></text:list-style>`;
  const attr = startAttribute(value);
  const nested = bullet
    ? ""
    : `<text:list><text:list-item${attr}><text:p>child</text:p><text:p>child tail</text:p></text:list-item></text:list><text:p>after nested</text:p>`;
  const body = `<text:list text:style-name="Starts"><text:list-header${attr}><text:p>header</text:p></text:list-header><text:list-item${attr}><text:p>first</text:p><text:p>tail</text:p>${nested}</text:list-item><text:list-item><text:p>next</text:p></text:list-item></text:list>`;
  for (const entry of zip.getEntryNames()) {
    if (entry === "content.xml" || entry === "styles.xml") {
      let xml = await zip.readTextEntry(entry);
      if (common && entry === "styles.xml")
        xml = xml.replace("</office:styles>", `${style}</office:styles>`);
      if (entry === "content.xml") {
        if (!common)
          xml = xml.replace("</office:automatic-styles>", `${style}</office:automatic-styles>`);
        xml = xml.replace(
          /<office:text>[\s\S]*?<\/office:text>/u,
          `<office:text>${body}</office:text>`,
        );
      }
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}
/** Reads authoritative Writer participation and counter state. @param document - Model. @returns Paragraph states. */
function state(document: SwDoc) {
  return document.paragraphs.map(
    /** Reads a real node and its owned tree. @param node - Paragraph. @returns State. */
    (node) => ({
      text: node.GetText(),
      counted: node.IsCountedInList(),
      level: node.GetAttrListLevel(),
      restart: node.IsListRestart(),
      start: node.GetActualListStartValue(),
      number: node.GetListItemNumber(),
      vector: document
        .GetDocumentListsManager()
        .GetListByName(node.GetListId())
        ?.GetListItemNumberVector(node),
      label: node.GetListLabel(),
    }),
  );
}

it("normalizes native ordinary starts and ignores header starts across document boundaries", /** Verifies literal expected state, independent copies, Worker16, XML and reopen in both style containers and marker families. @returns Completion. */ async () => {
  const baseline = writeOdtDocument(createWriterDocument(), { title: "Starts" });
  for (const [value, start] of [
    [undefined, undefined],
    ["", 0],
    ["+", 0],
    ["-", 0],
    ["garbage", 0],
    ["-0", 0],
    ["+1", 1],
    ["  \t+12", 12],
    ["+12tail", 12],
    ["1.5", 1],
    ["0x10", 0],
    ["0002", 2],
    ["-1", undefined],
    ["32767", 32767],
    ["32768", undefined],
    ["2147483647", undefined],
    ["2147483648", 0],
    ["-2147483648", undefined],
    ["-2147483649", 0],
    ["9223372036854775808", 0],
    ["\u00a012", 0],
    ["\u200012", 0],
  ] as const)
    for (const common of [false, true])
      for (const bullet of [false, true]) {
        const document = (
          await readOdtDocument(await input(baseline, common, bullet, value), { title: "Starts" })
        ).document;
        const number = start ?? (bullet ? 1 : 7),
          child = start ?? 5;
        const texts = bullet
          ? ["header", "first", "tail", "next"]
          : ["header", "first", "tail", "child", "child tail", "after nested", "next"];
        const counted = bullet
          ? [false, true, false, true]
          : [false, true, false, true, false, false, true];
        const numbers = bullet
          ? [0, number, number, number + 1]
          : [6, number, number, child, child, number, number + 1];
        const vectors = bullet
          ? [[0], [number], [number], [number + 1]]
          : [[6], [number], [number], [number, child], [number, child], [number], [number + 1]];
        const labels = bullet
          ? [undefined, "●", undefined, "●"]
          : [
              undefined,
              `${number}.`,
              undefined,
              `${number}.${child}.`,
              undefined,
              undefined,
              `${number + 1}.`,
            ];
        const levels = bullet ? [0, 0, 0, 0] : [0, 0, 0, 1, 1, 0, 0];
        const restarts = bullet
          ? [false, start !== undefined, false, false]
          : [false, start !== undefined, false, start !== undefined, false, false, false];
        const actual = state(document);
        expect(
          actual.map(/** Reads text. @param node - State. @returns Text. */ (node) => node.text),
        ).toEqual(texts);
        expect(
          actual.map(
            /** Reads participation. @param node - State. @returns Counted. */ (node) =>
              node.counted,
          ),
        ).toEqual(counted);
        expect(
          actual.map(/** Reads level. @param node - State. @returns Level. */ (node) => node.level),
        ).toEqual(levels);
        expect(
          actual.map(
            /** Reads restart. @param node - State. @returns Restart. */ (node) => node.restart,
          ),
        ).toEqual(restarts);
        expect(
          actual.map(
            /** Reads number. @param node - State. @returns Number. */ (node) => node.number,
          ),
        ).toEqual(numbers);
        expect(
          actual.map(
            /** Reads vector. @param node - State. @returns Vector. */ (node) => node.vector,
          ),
        ).toEqual(vectors);
        expect(
          actual.map(/** Reads label. @param node - State. @returns Label. */ (node) => node.label),
        ).toEqual(labels);
        expect(document.paragraphs[1]?.HasAttrListRestartValue()).toBe(start !== undefined);
        expect(document.paragraphs[1]?.GetActualListStartValue()).toBe(number);
        if (!bullet) expect(document.paragraphs[3]?.GetActualListStartValue()).toBe(child);
        const rule = document.paragraphs[1]?.GetNumRule() as SwNumRule;
        const copy = createWriterDocument();
        copy.GetDocumentListsManager().AddNumRule(rule.clone());
        const owned = copy.FindNumRulePtr(rule.GetName());
        expect(owned).not.toBe(rule);
        for (const [index, node] of document.paragraphs.entries()) {
          const target =
            index === 0 ? (copy.paragraphs[0] as SwTextNode) : copy.nodes.MakeTextNode();
          target.SetText(node.GetText());
          target.SetListItems(node.CaptureListItems());
        }
        expect(state(copy)).toEqual(actual);
        const record = encodeWriterDocument(document);
        expect(record.swModelVersion).toBe(16);
        expect(state(decodeWriterDocument(record))).toEqual(actual);
        const output = writeOdtDocument(document, { title: "Starts" });
        const content = await new ZipFile(output).readTextEntry("content.xml");
        const body = content.match(/<office:text>([\s\S]*?)<\/office:text>/u)?.[1] as string;
        const starts = [...body.matchAll(/text:start-value="([^"]*)"/gu)].map(
          /** Reads emitted canonical restart values. @param match - XML attribute. @returns Value. */
          (match) => match[1],
        );
        expect(starts).toEqual(
          start === undefined ? [] : bullet ? [String(start)] : [String(start), String(start)],
        );
        expect(body).toContain("<text:list-header><text:p");
        expect(content).toContain('office:version="1.3"');
        expect(state((await readOdtDocument(output, { title: "Starts" })).document)).toEqual(
          actual,
        );
      }
});
