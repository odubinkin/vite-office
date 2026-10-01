/** @fileoverview Verifies native implicit/direct restart XML transitions and literal model/copy/Worker/reopen states. */
import { expect, it } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { RES_PARATR_LIST_RESTARTVALUE } from "../../../inc/hintids";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import type { SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Literal source-derived paragraph state. */
interface Row {
  text: string;
  level: number;
  counted: boolean;
  restart: boolean;
  vector?: number[];
  direct?: number;
}
/** Builds an independently specified paragraph state. @param text - Text. @param level - Level. @param counted - Participation. @param restart - Flag. @param vector - Counter vector, absent for plain text. @param direct - Optional direct item. @returns State. */
function p(
  text: string,
  level: number,
  counted: boolean,
  restart: boolean,
  vector?: number[],
  direct?: number,
): Row {
  return {
    text,
    level,
    counted,
    restart,
    ...(vector === undefined ? {} : { vector }),
    ...(direct === undefined ? {} : { direct }),
  };
}
/** Wraps an ordinary item's paragraph and optional descendants. @param text - Text. @param children - Descendants. @returns XML. */
function item(text: string, children = ""): string {
  return `<text:list-item><text:p>${text}</text:p>${children}</text:list-item>`;
}
/** Wraps a nested list. @param body - Items. @returns XML. */
function list(body: string): string {
  return `<text:list>${body}</text:list>`;
}
/** Wraps a root with stable imported identity. @param body - Items. @param continued - Whether this root resumes L. @returns XML. */
function root(body: string, continued = false): string {
  return `<text:list text:style-name="Restart" xml:id="${continued ? "L-segment" : "L"}"${continued ? ' text:continue-list="L"' : ""}>${body}</text:list>`;
}
/** Creates a genuine common/automatic package with independently declared starts. @param baseline - ZIP. @param body - Full office:text children. @param common - Container. @param bullet - Marker family. @param starts - Declared starts. @returns ODT. */
async function input(
  baseline: Uint8Array,
  body: string,
  common: boolean,
  bullet: boolean,
  starts: number[],
): Promise<Uint8Array> {
  const zip = new ZipFile(baseline),
    output = new ZipOutputStream();
  const declaration = `<text:list-style style:name="Restart">${starts.map(/** Emits a literal native declared level. @param start - Start. @param index - Level. @returns XML. */ (start, index) => `<text:list-level-style-${bullet ? "bullet" : "number"} text:level="${index + 1}" ${bullet ? 'text:bullet-char="●"' : `style:num-format="1" style:num-suffix="." text:start-value="${start}" text:display-levels="${index + 1}"`}/>`).join("")}</text:list-style>`;
  for (const entry of zip.getEntryNames()) {
    if (entry === "styles.xml" || entry === "content.xml") {
      let xml = await zip.readTextEntry(entry);
      if (common && entry === "styles.xml")
        xml = xml.replace("</office:styles>", `${declaration}</office:styles>`);
      if (entry === "content.xml") {
        if (!common)
          xml = xml.replace(
            "</office:automatic-styles>",
            `${declaration}</office:automatic-styles>`,
          );
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
/** Reads effective/direct starts, actual counters and stable rule/list ownership. @param doc - Model. @returns State. */
function state(doc: SwDoc) {
  return doc.paragraphs.map(
    /** Reads one canonical node. @param node - Node. @returns State. */ (node) => ({
      text: node.GetText(),
      level: node.GetAttrListLevel(),
      counted: node.IsCountedInList(),
      restart: node.IsListRestart(),
      direct: node.HasAttrListRestartValue() ? node.GetAttrListRestartValue() : undefined,
      start: node.GetActualListStartValue(),
      identity: node.GetListId(),
      rule: node.GetNumRule()?.GetName(),
      number: node.GetListItemNumber(),
      vector: doc
        .GetDocumentListsManager()
        .GetListByName(node.GetListId())
        ?.GetListItemNumberVector(node),
      label: node.GetListLabel(),
    }),
  );
}
/** Reads actual body list/item/header and start-attribute events, excluding style declarations. @param xml - Content stream. @returns Events. */
function events(xml: string): string[] {
  const body = xml.match(/<office:text>([\s\S]*)<\/office:text>/u)?.[1];
  if (body === undefined) throw new Error("Missing office:text body");
  const result: string[] = [];
  let paragraph = 0;
  for (const match of body.matchAll(
    /<(\/?)(?:text:)(list-header|list-item|list|p)(?=[\s>])([^>]*)>/gu,
  )) {
    if (match[2] === "p") {
      if (match[1] !== "/") result.push(`p${paragraph++}`);
    } else {
      const start = /text:start-value="([^"]*)"/u.exec(match[3] ?? "");
      result.push(
        `${match[1] === "/" ? "-" : "+"}${match[2]}${match[1] !== "/" && start !== null ? `:${start[1]}` : ""}`,
      );
    }
  }
  return result;
}

it("exports native implicit restart positions and direct starts through genuine ODT", /** Verifies literal native omissions/gains/splits,independent owned copies,Worker16 and reopen. @returns Completion. */ async () => {
  const baseline = writeOdtDocument(createWriterDocument(), { title: "Restart" });
  for (const bullet of [false, true]) {
    const r = bullet ? 1 : 7,
      c = bullet ? 1 : 5,
      d = bullet ? 1 : 3,
      starts = [r, c, d];
    const tests = [
      {
        body: root(item("first")),
        before: [p("first", 0, true, true, [r])],
        after: [p("first", 0, true, false, [r])],
        events: "+list +list-item p0 -list-item -list",
      },
      {
        body: root(item("first") + item("restart") + item("next")),
        before: [
          p("first", 0, true, false, [r]),
          p("restart", 0, true, true, [r]),
          p("next", 0, true, false, [r + 1]),
        ],
        after: [
          p("first", 0, true, false, [r]),
          p("restart", 0, true, true, [r], r),
          p("next", 0, true, false, [r + 1]),
        ],
        events: `+list +list-item p0 -list-item +list-item:${r} p1 -list-item +list-item p2 -list-item -list`,
      },
      {
        body: root(item("root", list(item("child") + item("restart")))),
        before: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("restart", 1, true, true, [r, c]),
        ],
        after: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("restart", 1, true, true, [r, c]),
        ],
        events:
          "+list +list-item p0 +list +list-item p1 -list-item -list +list +list-item p2 -list-item -list -list-item -list",
      },
      {
        body: root(item("root", list(item("child", list(item("deep"))) + item("restart")))),
        before: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("deep", 2, true, false, [r, c, d]),
          p("restart", 1, true, true, [r, c]),
        ],
        after: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("deep", 2, true, false, [r, c, d]),
          p("restart", 1, true, true, [r, c]),
        ],
        events:
          "+list +list-item p0 +list +list-item p1 +list +list-item p2 -list-item -list -list-item -list +list +list-item p3 -list-item -list -list-item -list",
      },
      {
        body: root(item("root", list(item("child", list(item("restart")))))),
        before: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("restart", 2, true, true, [r, c, d]),
        ],
        after: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("restart", 2, true, true, [r, c, d], d),
        ],
        events: `+list +list-item p0 +list +list-item p1 +list +list-item:${d} p2 -list-item -list -list-item -list -list-item -list`,
      },
      {
        body: root(
          `<text:list-item>${list(`<text:list-item>${list(item("restart"))}</text:list-item>`)}</text:list-item>`,
        ),
        before: [p("restart", 2, true, true, [r, c, d])],
        after: [p("restart", 2, true, true, [r, c, d], d)],
        events: `+list +list-item +list +list-item +list +list-item:${d} p0 -list-item -list -list-item -list -list-item -list`,
      },
      {
        body: root(item("first")) + "<text:p>gap</text:p>" + root(item("restart"), true),
        before: [
          p("first", 0, true, false, [r]),
          p("gap", 0, true, false),
          p("restart", 0, true, true, [r]),
        ],
        after: [
          p("first", 0, true, false, [r]),
          p("gap", 0, true, false),
          p("restart", 0, true, true, [r], r),
        ],
        events: `+list +list-item p0 -list-item -list p1 +list +list-item:${r} p2 -list-item -list`,
      },
      {
        body:
          root(item("first")) +
          "<text:p>gap</text:p>" +
          root(
            `<text:list-item>${list(`<text:list-item>${list(item("restart"))}</text:list-item>`)}</text:list-item>`,
            true,
          ),
        before: [
          p("first", 0, true, false, [r]),
          p("gap", 0, true, false),
          p("restart", 2, true, true, [r, c, d]),
        ],
        after: [
          p("first", 0, true, false, [r]),
          p("gap", 0, true, false),
          p("restart", 2, true, true, [r, c, d], d),
        ],
        events: `+list +list-item p0 -list-item -list p1 +list +list-item +list +list-item +list +list-item:${d} p2 -list-item -list -list-item -list -list-item -list`,
      },
      {
        body: root(item("root", list(item("zero") + item("restart")))),
        before: [
          p("root", 0, true, false, [r]),
          p("zero", 1, true, true, [r, 0], 0),
          p("restart", 1, true, true, [r, c]),
        ],
        after: [
          p("root", 0, true, false, [r]),
          p("zero", 1, true, true, [r, 0], 0),
          p("restart", 1, true, true, [r, c]),
        ],
        events:
          "+list +list-item p0 +list +list-item:0 p1 -list-item -list +list +list-item p2 -list-item -list -list-item -list",
      },
      {
        body: root(
          item(
            "root",
            list(
              item("child") +
                "<text:list-header><text:p>header</text:p></text:list-header>" +
                item("next"),
            ),
          ),
        ),
        before: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("header", 1, false, true, [r, c], 2),
          p("next", 1, true, false, [r, c + 1]),
        ],
        after: [
          p("root", 0, true, false, [r]),
          p("child", 1, true, false, [r, c]),
          p("header", 1, false, false, [r, c]),
          p("next", 1, true, false, [r, c + 1]),
        ],
        events:
          "+list +list-item p0 +list +list-item p1 p2 -list-item +list-item p3 -list-item -list -list-item -list",
      },
      {
        body: root(item("inactive")),
        before: [p("inactive", 0, true, false, [r], 2)],
        after: [p("inactive", 0, true, false, [r])],
        events: "+list +list-item p0 -list-item -list",
      },
      {
        body: root(item("zero", list(item("child"))) + item("next")),
        before: [
          p("zero", 0, true, true, [0], 0),
          p("child", 1, true, false, [0, c]),
          p("next", 0, true, false, [1]),
        ],
        after: [
          p("zero", 0, true, true, [0], 0),
          p("child", 1, true, false, [0, c]),
          p("next", 0, true, false, [1]),
        ],
        events:
          "+list +list-item:0 p0 +list +list-item p1 -list-item -list -list-item +list-item p2 -list-item -list",
      },
      {
        body: root("<text:list-header><text:p>header</text:p></text:list-header>" + item("next")),
        before: [p("header", 0, false, true, [1], 2), p("next", 0, true, false, [2])],
        after: [p("header", 0, false, false, [r - 1]), p("next", 0, true, false, [r])],
        events: "+list +list-header p0 -list-header +list-item p1 -list-item -list",
      },
    ];
    for (const test of tests)
      for (const common of [false, true]) {
        const doc = (
          await readOdtDocument(await input(baseline, test.body, common, bullet, starts), {
            title: "Restart",
          })
        ).document;
        for (const [index, row] of test.before.entries()) {
          if (row.vector === undefined) continue;
          const node = doc.paragraphs[index];
          if (node === undefined) throw new Error("Missing fixture paragraph");
          node.SetCountedInList(row.counted);
          node.SetListRestart(row.restart);
          if (row.direct !== undefined)
            node.SetAttr(new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, row.direct));
        }
        /** Converts literal native expectations to public model getters. @param rows - Literal states. @returns Expected snapshots. */
        function expected(rows: Row[]) {
          return rows.map(
            /** Adds literal rule ownership,effective starts and labels. @param row - State. @returns Snapshot. */ (
              row,
            ) => ({
              text: row.text,
              level: row.level,
              counted: row.counted,
              restart: row.restart,
              direct: row.direct,
              start:
                row.vector === undefined
                  ? 1
                  : row.restart && row.direct !== undefined
                    ? row.direct
                    : starts[row.level],
              identity: row.vector === undefined ? "" : "Restart",
              rule: row.vector === undefined ? undefined : "Restart",
              number: row.vector?.at(-1),
              vector: row.vector,
              label:
                row.counted && row.vector !== undefined
                  ? bullet
                    ? "●"
                    : `${row.vector.join(".")}.`
                  : undefined,
            }),
          );
        }
        expect(state(doc)).toEqual(expected(test.before));
        const rule = doc.FindNumRulePtr("Restart") as SwNumRule;
        const copied = createWriterDocument();
        copied.GetDocumentListsManager().AddNumRule(rule.clone());
        doc.paragraphs.forEach(
          /** Copies independent owned list-item sets and text. @param node - Source. @param index - Position. @returns Nothing. */ (
            node,
            index,
          ) => {
            const target =
              index === 0 ? (copied.paragraphs[0] as SwTextNode) : copied.nodes.MakeTextNode();
            target.SetText(node.GetText());
            target.SetListItems(node.CaptureListItems());
          },
        );
        expect(copied.FindNumRulePtr("Restart")).not.toBe(rule);
        expect(state(copied)).toEqual(expected(test.before));
        const record = encodeWriterDocument(doc);
        expect(record.swModelVersion).toBe(16);
        const worker = decodeWriterDocument(record);
        expect(worker.FindNumRulePtr("Restart")).not.toBe(rule);
        expect(state(worker)).toEqual(expected(test.before));
        const bytes = writeOdtDocument(doc, { title: "Restart" });
        const xml = await new ZipFile(bytes).readTextEntry("content.xml");
        expect(xml).toContain('office:version="1.3"');
        expect(events(xml)).toEqual(test.events.split(" "));
        const reopened = (await readOdtDocument(bytes, { title: "Restart" })).document;
        expect(state(reopened)).toEqual(expected(test.after));
      }
  }
});
