/** @fileoverview Verifies real ODT body/cell list ownership, continued roots, native restart values and repeated reopen. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Requires a real fixture owner instead of silently accepting a missing native node. @param value - Actual fixture value. @returns Valid owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing actual native fixture owner");
  return value;
}

/** Builds a literal root list with explicit identity and continuation. @param id - Raw XML ID. @param body - List children. @param attrs - Optional native list flags. @returns XML. */
function list(id: string, body: string, attrs = ""): string {
  return '<text:list text:style-name="S" xml:id="' + id + '"' + attrs + ">" + body + "</text:list>";
}
/** Builds an ordinary item with an optional direct restart. @param text - Text. @param start - Optional direct start. @returns XML. */
function item(text: string, start?: number): string {
  return (
    "<text:list-item" +
    (start === undefined ? "" : ' text:start-value="' + start + '"') +
    "><text:p>" +
    text +
    "</text:p></text:list-item>"
  );
}
/** Creates a local real package with common or automatic two-level declarations. @param body - Literal office:text children. @param common - Common declaration. @param bullet - Marker family. @returns ODT bytes. */
async function input(body: string, common: boolean, bullet: boolean): Promise<Uint8Array> {
  const zip = new ZipFile(writeOdtDocument(createWriterDocument(), { title: "Cell lists" })),
    out = new ZipOutputStream();
  const declaration =
    '<text:list-style style:name="S"><text:list-level-style-' +
    (bullet
      ? 'bullet text:level="1" text:bullet-char="●"'
      : 'number text:level="1" style:num-format="1" text:start-value="4"') +
    ' style:num-suffix="."/><text:list-level-style-' +
    (bullet
      ? 'bullet text:level="2" text:bullet-char="○"'
      : 'number text:level="2" style:num-format="1" text:start-value="2" text:display-levels="2"') +
    ' style:num-suffix="."/></text:list-style>';
  for (const name of zip.getEntryNames()) {
    if (name === "styles.xml" || name === "content.xml") {
      let xml = await zip.readTextEntry(name);
      if (name === "styles.xml" && common)
        xml = xml.replace("</office:styles>", declaration + "</office:styles>");
      if (name === "content.xml") {
        if (!common)
          xml = xml.replace(
            "</office:automatic-styles>",
            declaration + "</office:automatic-styles>",
          );
        xml = xml.replace(
          /<office:text>[\s\S]*?<\/office:text>/u,
          "<office:text>" + body + "</office:text>",
        );
      }
      out.putNextEntry(name, new TextEncoder().encode(xml));
    } else out.putNextEntry(name, await zip.readEntry(name));
  }
  return out.finish();
}
/** Wraps two cells in an actual header row. @param first - First cell text/list content. @param second - Second cell text/list content. @returns Table XML. */
function table(first: string, second: string): string {
  return (
    '<table:table table:name="Lists"><table:table-column table:number-columns-repeated="2"/><table:table-header-rows><table:table-row><table:table-cell>' +
    first +
    "</table:table-cell><table:table-cell>" +
    second +
    "</table:table-cell></table:table-row></table:table-header-rows></table:table>"
  );
}
/** Reads every actual body/cell text node in native order. @param doc - Actual Writer graph. @returns Text nodes. */
function nodes(doc: SwDoc): SwTextNode[] {
  return doc.nodes
    .entries()
    .filter(
      /** Selects actual text owners. @param node - Native node. @returns Whether text. */ (
        node,
      ): node is SwTextNode => node instanceof SwTextNode,
    );
}
/** Captures supported exact list item state without a body-only paragraph adapter. @param doc - Graph. @returns Values. */
function state(doc: SwDoc) {
  return nodes(doc).map(
    /** Reads canonical list metadata. @param node - Native node. @returns State. */ (node) => ({
      text: node.GetText(),
      kind: node.GetListKind(),
      id: node.GetListId(),
      rule: node.GetNumRuleName(),
      level: node.GetAttrListLevel(),
      counted: node.IsCountedInList(),
      restart: node.IsListRestart(),
      direct: node.HasAttrListRestartValue() ? node.GetAttrListRestartValue() : undefined,
      label: node.GetListLabel(),
    }),
  );
}
/** Copies actual independently owned rules and cell item sets into another graph. @param doc - Source. @returns Owned copied graph. */
function copy(doc: SwDoc): SwDoc {
  const result = createWriterDocument();
  for (const rule of doc.GetDocumentListsManager().GetNumRuleTable())
    result.GetDocumentListsManager().AddNumRule(rule.clone());
  const sourceTable = required(doc.GetTables()[0]);
  const copied = result.nodes.MakeTableNode(sourceTable.GetName(), sourceTable.GetFormat());
  for (const width of sourceTable.GetColumnWidths()) copied.AddColumnWidth(width);
  for (const line of sourceTable.GetTabLines()) {
    const target = result.nodes.AppendTableRow(copied, line.GetTabBoxes().length, line.GetFormat());
    for (const [index, cell] of line.GetTabBoxes().entries()) {
      const targetCell = required(target.GetTabBoxes()[index]);
      targetCell.SetFormat(cell.GetFormat());
      for (const [paragraph, node] of cell.GetParagraphs().entries()) {
        const targetNode =
          paragraph === 0
            ? required(targetCell.GetParagraphs()[0])
            : result.nodes.AppendTableCellParagraph(targetCell);
        targetNode.SetText(node.GetText());
        targetNode.SetListItems(node.CaptureListItems());
      }
    }
  }
  const sourceBody = doc.paragraphs;
  required(result.paragraphs[0]).SetText(required(sourceBody[0]).GetText());
  required(result.paragraphs[0]).SetListItems(required(sourceBody[0]).CaptureListItems());
  for (const node of sourceBody.slice(1)) {
    const target = result.nodes.MakeTextNode();
    target.SetText(node.GetText());
    target.SetListItems(node.CaptureListItems());
  }
  return result;
}

for (const common of [false, true])
  for (const bullet of [false, true])
    for (const mode of ["explicit", "implicit", "nested"] as const)
      it(
        "imports native table cell list roots " + mode + "/common=" + common + "/bullet=" + bullet,
        /** Checks literal counters, shared catalogue, actual section ownership, Worker/copies and three ODT cycles. @returns Completion. */ async () => {
          const continued = mode !== "nested",
            attrA =
              mode === "explicit"
                ? ' text:continue-list="Before"'
                : mode === "implicit"
                  ? ' text:continue-numbering="true"'
                  : "",
            attrB =
              mode === "explicit"
                ? ' text:continue-list="A"'
                : mode === "implicit"
                  ? ' text:continue-numbering="true"'
                  : "",
            first = continued
              ? list("A", item("First"), attrA) + "<text:p>Plain tail</text:p>"
              : "<text:p>Lead</text:p>" +
                list(
                  "A",
                  '<text:list-header><text:p>Header</text:p></text:list-header><text:list-item text:start-value="0"><text:p>First</text:p><text:p>Tail</text:p><text:list><text:list-item><text:p>Child</text:p></text:list-item></text:list></text:list-item>' +
                    item("Next"),
                ),
            second = list("B", item("Second"), attrB),
            body =
              list("Before", item("Before")) +
              table(first, second) +
              list("After", item("After"), ' text:continue-list="B"'),
            doc = (
              await readOdtDocument(await input(body, common, bullet), { title: "Cell lists" })
            ).document,
            byText = new Map(
              nodes(doc).map(
                /** Indexes independently labelled owners. @param node - Owner. @returns Pair. */ (
                  node,
                ) => [node.GetText(), node],
              ),
            ),
            firstNode = required(byText.get("First")),
            secondNode = required(byText.get("Second")),
            before = required(byText.get("Before")),
            after = required(byText.get("After")),
            rule = required(firstNode.GetNumRule()),
            defaultId = rule.GetDefaultListId();
          expect(
            doc.paragraphs.map(
              /** Reads body-only text. @param node - Body. @returns Text. */ (node) =>
                node.GetText(),
            ),
          ).toEqual(["Before", "After"]);
          expect(doc.GetTables()).toHaveLength(1);
          const nativeTable = required(doc.GetTables()[0]);
          expect(nativeTable.GetFormat()).toMatchObject({ headerRows: 1, repeatHeaderRows: true });
          expect(nativeTable.GetColumnWidths()).toEqual([0, 0]);
          for (const box of required(nativeTable.GetTabLines()[0]).GetTabBoxes())
            for (const node of box.GetParagraphs()) {
              expect(node.StartOfSectionNode()).toBe(box.GetStartNode());
              expect(node.GetNodes()).toBe(doc.nodes);
            }
          expect(before.GetListId()).toBe(defaultId);
          expect(firstNode.GetListId()).toBe(continued ? defaultId : "A");
          expect(secondNode.GetListId()).toBe(continued ? defaultId : "B");
          expect(after.GetListId()).toBe(secondNode.GetListId());
          expect(firstNode.GetAttrListLevel()).toBe(0);
          expect(firstNode.IsListRestart()).toBe(!continued);
          expect(firstNode.HasAttrListRestartValue()).toBe(!continued);
          if (!continued) expect(firstNode.GetAttrListRestartValue()).toBe(0);
          const expectedNumbers = continued ? [4, 5, 6, 7] : [4, 0, 4, 5];
          for (const [index, node] of [before, firstNode, secondNode, after].entries()) {
            expect(node.GetListLabel()).toBe(bullet ? "●" : expectedNumbers[index] + ".");
            expect(node.IsCountedInList()).toBe(true);
            expect(node.GetNumRule()).toBe(rule);
          }
          if (continued) {
            expect(required(byText.get("Plain tail")).GetListKind()).toBe("none");
          } else {
            expect(required(byText.get("Header")).IsCountedInList()).toBe(false);
            expect(required(byText.get("Header")).GetListLabel()).toBeUndefined();
            expect(required(byText.get("Tail")).IsCountedInList()).toBe(false);
            expect(required(byText.get("Tail")).GetListLabel()).toBeUndefined();
            expect(required(byText.get("Child")).GetAttrListLevel()).toBe(1);
            expect(required(byText.get("Child")).GetListId()).toBe("A");
            expect(required(byText.get("Child")).GetListLabel()).toBe(bullet ? "○" : "0.2.");
            expect(required(byText.get("Next")).GetListLabel()).toBe(bullet ? "●" : "1.");
            expect(required(byText.get("Lead")).GetListKind()).toBe("none");
          }
          const worker = decodeWriterDocument(encodeWriterDocument(doc));
          expect(state(worker)).toEqual(state(doc));
          expect(worker.FindNumRulePtr(rule.GetName())).not.toBe(rule);
          const copied = copy(doc);
          // Physical copy places the table before the copied trailing body, preserving source list order.
          expect(state(copied)).toEqual(state(doc));
          expect(copied.FindNumRulePtr(rule.GetName())).not.toBe(rule);
          for (const [index, node] of nodes(copied).entries())
            expect(node).not.toBe(nodes(doc)[index]);
          let current = doc;
          for (let cycle = 0; cycle < 3; cycle++) {
            const bytes = writeOdtDocument(current, { title: "Cell lists" }),
              xml = await new ZipFile(bytes).readTextEntry("content.xml"),
              ids = [...xml.matchAll(/xml:id="([^"]+)"/gu)].map(
                /** Reads actual XML identities. @param match - Identity. @returns Value. */ (
                  match,
                ) => match[1],
              );
            expect(new Set(ids).size).toBe(ids.length);
            expect(xml).toContain("text:continue-list=");
            const reopened = (await readOdtDocument(bytes, { title: "Cell lists" })).document;
            expect(state(reopened)).toEqual(state(current));
            expect(required(reopened.GetTables()[0]).GetFormat()).toEqual(nativeTable.GetFormat());
            expect(required(reopened.GetTables()[0]).GetColumnWidths()).toEqual([0, 0]);
            current = reopened;
          }
        },
      );
