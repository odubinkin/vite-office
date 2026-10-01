/** @fileoverview Verifies native processed-root continuation, DefaultListId and restart projection in genuine ODT packages. */
import { expect, it, vi } from "vitest";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { RES_PARATR_LIST_ID } from "../../../inc/hintids";
import { createWriterDocument, type SwDoc } from "../../core/doc/doc";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Independently specified native paragraph state. */
interface Row {
  text: string;
  id: string;
  rule: string | undefined;
  level: number;
  counted: boolean;
  restart: boolean;
  direct: number | undefined;
  vector: number[] | undefined;
}
/** Creates a literal numbered paragraph expectation. @param text - Content. @param id - Effective native ID. @param vector - Native vector. @param restart - Flag. @param direct - Direct item. @param counted - Participation. @param rule - Rule. @returns Row. */
function p(
  text: string,
  id: string,
  vector: number[],
  restart = false,
  direct?: number,
  counted = true,
  rule = "Counters",
): Row {
  return { text, id, vector, level: vector.length - 1, restart, direct, counted, rule };
}
const gap: Row = {
  text: "gap",
  id: "",
  rule: undefined,
  level: 0,
  counted: true,
  restart: false,
  direct: undefined,
  vector: undefined,
};
/** Wraps an ordinary item. @param text - Content. @param children - Descendants. @param start - Optional explicit zero. @returns XML. */
function item(text: string, children = "", start?: number): string {
  return `<text:list-item${start === undefined ? "" : ` text:start-value="${start}"`}><text:p>${text}</text:p>${children}</text:list-item>`;
}
/** Wraps a root with raw ID and optional continuation attributes. @param id - Own ID. @param body - Items. @param attrs - List attributes. @param style - Raw style. @returns XML. */
function root(id: string, body: string, attrs = "", style = "Counters"): string {
  return `<text:list text:style-name="${style}" xml:id="${id}"${attrs}>${body}</text:list>`;
}
/** Creates a genuine independently declared common/automatic package. @param baseline - Baseline ZIP. @param body - office:text children. @param common - Style container. @param bullet - Family. @returns ODT. */
async function input(
  baseline: Uint8Array,
  body: string,
  common: boolean,
  bullet: boolean,
): Promise<Uint8Array> {
  const zip = new ZipFile(baseline),
    output = new ZipOutputStream();
  const declarations = ["Counters", "Other"]
    .map(
      /** Emits independent native rule declarations. @param name - Style name. @returns Declaration. */ (
        name,
      ) =>
        `<text:list-style style:name="${name}">${[7, 5, 3]
          .map(
            /** Emits a declared native level. @param start - Start. @param index - Level. @returns XML. */ (
              start,
              index,
            ) =>
              `<text:list-level-style-${bullet ? "bullet" : "number"} text:level="${index + 1}" ${bullet ? 'text:bullet-char="●"' : `style:num-format="1" style:num-suffix="." text:start-value="${start}" text:display-levels="${index + 1}"`}/>`,
          )
          .join("")}</text:list-style>`,
    )
    .join("");
  for (const entry of zip.getEntryNames()) {
    if (entry === "content.xml" || entry === "styles.xml") {
      let xml = await zip.readTextEntry(entry);
      if (entry === "styles.xml" && common)
        xml = xml.replace("</office:styles>", `${declarations}</office:styles>`);
      if (entry === "content.xml") {
        if (!common)
          xml = xml.replace(
            "</office:automatic-styles>",
            `${declarations}</office:automatic-styles>`,
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
/** Reads public model state independently of XML stream shape. @param doc - Model. @returns States. */
function state(doc: SwDoc) {
  return doc.paragraphs.map(
    /** Captures one canonical paragraph. @param node - Node. @returns State. */ (node) => ({
      text: node.GetText(),
      id: node.GetListId(),
      rule: node.GetNumRule()?.GetName(),
      level: node.GetAttrListLevel(),
      counted: node.IsCountedInList(),
      restart: node.IsListRestart(),
      direct: node.HasAttrListRestartValue() ? node.GetAttrListRestartValue() : undefined,
      number: node.GetListItemNumber(),
      vector: doc
        .GetDocumentListsManager()
        .GetListByName(node.GetListId())
        ?.GetListItemNumberVector(node),
      label: node.GetListLabel(),
      start: node.GetActualListStartValue(),
    }),
  );
}
/** Expected root identity/continuation exported for one native projection. */
interface Case {
  name: string;
  body: string;
  before: Row[];
  after: Row[];
  roots: string[][];
  starts: string[];
}
it("imports native root continuation and default IDs through common and automatic ODT cycles", /** Verifies literal state, owned copies, Worker16, selected XML and source-derived reopen projections. @returns Completion. */ async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 9, 1, 12, 34, 56, 789));
  const random = vi.spyOn(crypto, "getRandomValues").mockImplementation(
    /** Supplies the primary fixed RNG value. @param array - Output. @returns Array. */ (array) => {
      (array as Uint32Array).fill(0);
      return array;
    },
  );
  try {
    const baseline = writeOdtDocument(createWriterDocument(), { title: "Continuation" });
    for (const bullet of [false, true]) {
      const r = bullet ? 1 : 7,
        c = bullet ? 1 : 5;
      const first = root("A", item("a") + item("b")),
        separator = "<text:p>gap</text:p>";
      const head = [p("a", "Counters", [r]), p("b", "Counters", [r + 1]), gap];
      const separateRoots = [
        ["Counters", ""],
        ["B", ""],
      ];
      const continuedRoots = [
        ["Counters", ""],
        ["Counters-2", "Counters"],
      ];
      const cases: Case[] = [];
      for (const flag of [undefined, "", "true", "false", "1", "TRUE", " true ", "0"]) {
        const continued = flag === "true",
          id = continued ? "Counters" : "B",
          n = continued ? r + 2 : r;
        cases.push({
          name: `root flag ${String(flag)}`,
          body:
            first +
            separator +
            root(
              "B",
              item("c") + item("d"),
              flag === undefined ? "" : ` text:continue-numbering="${flag}"`,
            ),
          before: [...head, p("c", id, [n], flag !== undefined && !continued), p("d", id, [n + 1])],
          after: [...head, p("c", id, [n]), p("d", id, [n + 1])],
          roots: continued ? continuedRoots : separateRoots,
          starts: [],
        });
      }
      cases.push(
        {
          name: "known master",
          body: first + separator + root("B", item("c"), ' text:continue-list="A"'),
          before: [...head, p("c", "Counters", [r + 2])],
          after: [...head, p("c", "Counters", [r + 2])],
          roots: continuedRoots,
          starts: [],
        },
        {
          name: "unknown master",
          body: first + separator + root("B", item("c"), ' text:continue-list="unknown"'),
          before: [...head, p("c", "B", [r])],
          after: [...head, p("c", "B", [r])],
          roots: separateRoots,
          starts: [],
        },
        {
          name: "empty master",
          body: first + separator + root("B", item("c"), ' text:continue-list=""'),
          before: [...head, p("c", "B", [r])],
          after: [...head, p("c", "B", [r])],
          roots: separateRoots,
          starts: [],
        },
        {
          name: "empty master true",
          body:
            first +
            separator +
            root("B", item("c"), ' text:continue-list="" text:continue-numbering="true"'),
          before: [...head, p("c", "Counters", [r + 2])],
          after: [...head, p("c", "Counters", [r + 2])],
          roots: continuedRoots,
          starts: [],
        },
        {
          name: "unknown master true",
          body:
            first +
            separator +
            root("B", item("c"), ' text:continue-list="unknown" text:continue-numbering="true"'),
          before: [...head, p("c", "B", [r])],
          after: [...head, p("c", "B", [r])],
          roots: separateRoots,
          starts: [],
        },
        {
          name: "known master explicit false",
          body:
            first +
            separator +
            root(
              "B",
              item("c") + item("d"),
              ' text:continue-list="A" text:continue-numbering="false"',
            ),
          before: [...head, p("c", "Counters", [r], true), p("d", "Counters", [r + 1])],
          after: [...head, p("c", "Counters", [r], true, r), p("d", "Counters", [r + 1])],
          roots: continuedRoots,
          starts: [String(r)],
        },
        {
          name: "known master explicit zero",
          body:
            first +
            separator +
            root(
              "B",
              item("c", "", 0) + item("d"),
              ' text:continue-list="A" text:continue-numbering="true"',
            ),
          before: [...head, p("c", "Counters", [0], true, 0), p("d", "Counters", [1])],
          after: [...head, p("c", "Counters", [0], true, 0), p("d", "Counters", [1])],
          roots: continuedRoots,
          starts: ["0"],
        },
        {
          name: "chain",
          body:
            first +
            separator +
            root("B", item("c"), ' text:continue-list="A"') +
            separator +
            root("C", item("d"), ' text:continue-list="B"'),
          before: [...head, p("c", "Counters", [r + 2]), gap, p("d", "Counters", [r + 3])],
          after: [...head, p("c", "Counters", [r + 2]), gap, p("d", "Counters", [r + 3])],
          roots: [...continuedRoots, ["Counters-3", "Counters"]],
          starts: [],
        },
        {
          name: "empty processed continuation",
          body:
            first +
            separator +
            root("B", "", ' text:continue-list="A" text:continue-numbering="false"') +
            root("C", item("c"), ' text:continue-numbering="true"'),
          before: [...head, p("c", "Counters", [r + 2])],
          after: [...head, p("c", "Counters", [r + 2])],
          roots: continuedRoots,
          starts: [],
        },
        {
          name: "duplicate own ID",
          body: first + separator + root("A", item("c"), ' text:continue-numbering="true"'),
          before: [...head, p("c", "Counters", [r + 2])],
          after: [...head, p("c", "Counters", [r + 2])],
          roots: continuedRoots,
          starts: [],
        },
        {
          name: "style mismatch auto continuation",
          body:
            first +
            separator +
            root("B", item("c"), ' text:continue-numbering="true"', "Other") +
            separator +
            root("C", item("d"), ' text:continue-numbering="true"'),
          before: [
            ...head,
            p("c", "Other", [r], false, undefined, true, "Other"),
            gap,
            p("d", "C", [r]),
          ],
          after: [
            ...head,
            p("c", "Other", [r], false, undefined, true, "Other"),
            gap,
            p("d", "C", [r]),
          ],
          roots: [
            ["Counters", ""],
            ["Other", ""],
            ["C", ""],
          ],
          starts: [],
        },
        {
          name: "generated absent own ID",
          body:
            first +
            separator +
            '<text:list text:style-name="Counters"><text:list-item><text:p>c</text:p></text:list-item></text:list>',
          before: [...head, p("c", "list123456809261001", [r])],
          after: [...head, p("c", "list123456809261001", [r])],
          roots: [
            ["Counters", ""],
            ["list123456809261001", ""],
          ],
          starts: [],
        },
        {
          name: "generated empty own ID",
          body: first + separator + root("", item("c")),
          before: [...head, p("c", "list123456809261001", [r])],
          after: [...head, p("c", "list123456809261001", [r])],
          roots: [
            ["Counters", ""],
            ["list123456809261001", ""],
          ],
          starts: [],
        },
        {
          name: "collision",
          body:
            root("list123456809261001", item("a")) +
            separator +
            root("", item("b")) +
            separator +
            root("", item("c")),
          before: [
            p("a", "Counters", [r]),
            gap,
            p("b", "list1234568092610011", [r]),
            gap,
            p("c", "list1234568092610012", [r]),
          ],
          after: [
            p("a", "Counters", [r]),
            gap,
            p("b", "list1234568092610011", [r]),
            gap,
            p("c", "list1234568092610012", [r]),
          ],
          roots: [
            ["Counters", ""],
            ["list1234568092610011", ""],
            ["list1234568092610012", ""],
          ],
          starts: [],
        },
        {
          name: "header consumes root restart",
          body:
            first +
            separator +
            root(
              "B",
              "<text:list-header><text:p>header</text:p></text:list-header>" + item("c"),
              ' text:continue-list="A" text:continue-numbering="false"',
            ),
          before: [
            ...head,
            p("header", "Counters", [r + 1], true, undefined, false),
            p("c", "Counters", [r + 2]),
          ],
          after: [
            ...head,
            p("header", "Counters", [r + 1], false, undefined, false),
            p("c", "Counters", [r + 2]),
          ],
          roots: continuedRoots,
          starts: [],
        },
      );
      for (const flag of [undefined, "true", "false", "1", ""]) {
        const restarted = flag !== "true";
        const sub = `<text:list xml:id="poison" text:continue-list="unknown"${flag === undefined ? "" : ` text:continue-numbering="${flag}"`}>${item("second")}</text:list>`;
        cases.push({
          name: `nested flag ${String(flag)}`,
          body: root("A", item("a", `<text:list>${item("first")}</text:list>` + sub)),
          before: [
            p("a", "Counters", [r]),
            p("first", "Counters", [r, c]),
            p("second", "Counters", [r, restarted ? c : c + 1], restarted),
          ],
          after: [
            p("a", "Counters", [r]),
            p("first", "Counters", [r, c]),
            p("second", "Counters", [r, restarted ? c : c + 1], restarted),
          ],
          roots: [["Counters", ""]],
          starts: [],
        });
      }
      for (const test of cases)
        for (const common of [false, true]) {
          const doc = (
            await readOdtDocument(await input(baseline, test.body, common, bullet), {
              title: "Continuation",
            })
          ).document;
          /** Adds literal native defaults and marker projection to the independent row table. @param rows - Expected rows. @returns States. */
          function expected(rows: Row[]) {
            return rows.map(
              /** Projects literal expected native getters. @param row - Row. @returns State. */ (
                row,
              ) => ({
                ...row,
                number: row.vector?.at(-1),
                label:
                  row.vector === undefined || !row.counted
                    ? undefined
                    : bullet
                      ? "●"
                      : `${row.vector.join(".")}.`,
                start:
                  row.vector === undefined
                    ? 1
                    : row.restart && row.direct !== undefined
                      ? row.direct
                      : row.level === 0
                        ? r
                        : c,
              }),
            );
          }
          expect(state(doc), `${test.name}/${common}/${bullet}`).toEqual(expected(test.before));
          const copied = createWriterDocument();
          for (const name of ["Counters", "Other"]) {
            const rule = doc.FindNumRulePtr(name);
            if (rule === undefined) throw new Error("Missing declared rule");
            expect(rule.GetDefaultListId()).toBe(name);
            copied.GetDocumentListsManager().AddNumRule(rule.clone());
            expect(copied.FindNumRulePtr(name)).not.toBe(rule);
          }
          doc.paragraphs.forEach(
            /** Copies owned paragraph items and text. @param node - Source. @param index - Position. @returns Nothing. */ (
              node,
              index,
            ) => {
              const target =
                index === 0 ? (copied.paragraphs[0] as SwTextNode) : copied.nodes.MakeTextNode();
              target.SetText(node.GetText());
              const items = node.CaptureListItems();
              target.SetListItems(items);
              if (node.GetListId().length !== 0) {
                const identityItem = items.GetItemIfSet(RES_PARATR_LIST_ID, false);
                expect(identityItem).toBeDefined();
                expect(target.GetAttr(RES_PARATR_LIST_ID)).not.toBe(
                  node.GetAttr(RES_PARATR_LIST_ID),
                );
                expect(target.CaptureListItems().GetItemIfSet(RES_PARATR_LIST_ID, false)).not.toBe(
                  identityItem,
                );
              }
            },
          );
          expect(state(copied)).toEqual(expected(test.before));
          const record = encodeWriterDocument(doc);
          expect(record.swModelVersion).toBe(16);
          const worker = decodeWriterDocument(record);
          expect(worker.FindNumRulePtr("Counters")).not.toBe(doc.FindNumRulePtr("Counters"));
          expect(state(worker)).toEqual(expected(test.before));
          const bytes = writeOdtDocument(doc, { title: "Continuation" });
          const xml = await new ZipFile(bytes).readTextEntry("content.xml");
          expect(xml).toContain('office:version="1.3"');
          const body = xml.match(/<office:text>([\s\S]*)<\/office:text>/u)?.[1];
          if (body === undefined) throw new Error("Missing exported body");
          expect(
            [...body.matchAll(/<text:list\b([^>]*)>/gu)].flatMap(
              /** Captures only exported root identities. @param match - List tag. @returns Root or empty. */ (
                match,
              ) => {
                const id = match[1]?.match(/xml:id="([^"]*)"/u)?.[1];
                return id === undefined
                  ? []
                  : [[id, match[1]?.match(/text:continue-list="([^"]*)"/u)?.[1] ?? ""]];
              },
            ),
            test.name,
          ).toEqual(test.roots);
          expect(
            [...body.matchAll(/<text:list-item[^>]*text:start-value="([^"]*)"/gu)].map(
              /** Reads item starts excluding style declarations. @param match - Item. @returns Start. */ (
                match,
              ) => match[1],
            ),
            test.name,
          ).toEqual(test.starts);
          const reopened = (await readOdtDocument(bytes, { title: "Continuation" })).document;
          expect(state(reopened), `reopen ${test.name}`).toEqual(expected(test.after));
        }
    }
  } finally {
    random.mockRestore();
    vi.useRealTimers();
  }
});
