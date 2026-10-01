/** @fileoverview Verifies native repeated-sublist pending restart and bounded ODT/copy/Worker transport. */
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

/** Pairs literal paragraph metadata with independently derived native counters. */
interface ExpectedParagraph {
  text: string;
  level: number;
  counted: boolean;
  restart: boolean;
  explicit?: number;
  vector: number[];
}
/** Creates literal expected state. @param text - Text. @param level - Zero-based level. @param counted - Participation. @param restart - Restart flag. @param vector - Native counter vector. @param explicit - Optional direct start. @returns Expected paragraph. */
function p(
  text: string,
  level: number,
  counted: boolean,
  restart: boolean,
  vector: number[],
  explicit?: number,
): ExpectedParagraph {
  return { text, level, counted, restart, vector, ...(explicit === undefined ? {} : { explicit }) };
}
/** Wraps a literal ordinary item. @param text - Paragraph text. @returns Item XML. */
function item(text: string): string {
  return `<text:list-item><text:p>${text}</text:p></text:list-item>`;
}
/** Wraps a literal nested list. @param body - Children. @returns List XML. */
function list(body: string): string {
  return `<text:list>${body}</text:list>`;
}
/** Builds a genuine common/automatic package with three declared number or bullet levels. @param baseline - Package. @param body - Literal body. @param common - Style container. @param bullet - Marker family. @returns Package. */
async function input(
  baseline: Uint8Array,
  body: string,
  common: boolean,
  bullet: boolean,
): Promise<Uint8Array> {
  const zip = new ZipFile(baseline),
    output = new ZipOutputStream();
  const declaration = `<text:list-style style:name="Sublist">${[7, 5, 3].map(/** Emits the literal declared level. @param start - Number start. @param index - Level. @returns XML. */ (start, index) => `<text:list-level-style-${bullet ? "bullet" : "number"} text:level="${index + 1}" ${bullet ? 'text:bullet-char="●"' : `style:num-format="1" text:start-value="${start}" text:display-levels="${index + 1}"`} style:num-suffix="."/>`).join("")}</text:list-style>`;
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
          `<office:text><text:list text:style-name="Sublist">${body}</text:list></office:text>`,
        );
      }
      output.putNextEntry(entry, new TextEncoder().encode(xml));
    } else output.putNextEntry(entry, await zip.readEntry(entry));
  }
  return output.finish();
}
/** Reads direct items, effective starts, counters and visible labels. @param document - Model. @returns Paragraph states. */
function state(document: SwDoc) {
  return document.paragraphs.map(
    /** Reads a validated listed node. @param node - Node. @returns State. */ (node) => ({
      text: node.GetText(),
      level: node.GetAttrListLevel(),
      counted: node.IsCountedInList(),
      restart: node.IsListRestart(),
      explicit: node.HasAttrListRestartValue() ? node.GetAttrListRestartValue() : undefined,
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

it("imports native repeated-sublist restart and pending return through real packages", /** Verifies literal numbered/bullet common/automatic cases, owned copies, Worker16 and bounded reopen projection. @returns Completion. */ async () => {
  const baseline = writeOdtDocument(createWriterDocument(), { title: "Sublist" });
  const cases = [
    {
      body: `<text:list-item><text:p>root</text:p>${list(item("first"))}${list(item("second"))}${list("<text:list-item><text:p>third</text:p><text:p>tail</text:p></text:list-item>")}<text:p>after</text:p></text:list-item>${item("next")}`,
      expected: [
        p("root", 0, true, false, [7]),
        p("first", 1, true, false, [7, 5]),
        p("second", 1, true, true, [7, 5]),
        p("third", 1, true, true, [7, 5]),
        p("tail", 1, false, false, [7, 5]),
        p("after", 0, false, false, [7]),
        p("next", 0, true, false, [8]),
      ],
    },
    {
      body: `<text:list-item>${list("")}${list(item("second") + item("child next"))}<text:p>after</text:p></text:list-item>${item("next")}`,
      expected: [
        p("second", 1, true, true, [7, 5]),
        p("child next", 1, true, false, [7, 6]),
        p("after", 0, false, false, [7]),
        p("next", 0, true, false, [8]),
      ],
    },
    {
      body: `<text:list-item><text:p>root</text:p>${list(item("first"))}${list("")}<text:p>after</text:p></text:list-item>${item("next")}`,
      expected: [
        p("root", 0, true, false, [7]),
        p("first", 1, true, false, [7, 5]),
        p("after", 0, false, true, [7]),
        p("next", 0, true, false, [8]),
      ],
    },
    {
      body: `<text:list-item><text:p>root</text:p>${list(item("first"))}${list("<text:list-header><text:p>header</text:p></text:list-header>" + item("second"))}<text:p>after</text:p></text:list-item>`,
      expected: [
        p("root", 0, true, false, [7]),
        p("first", 1, true, false, [7, 5]),
        p("header", 1, false, true, [7, 5]),
        p("second", 1, true, false, [7, 6]),
        p("after", 0, false, false, [7]),
      ],
    },
    {
      body: `<text:list-item><text:p>root</text:p>${list(item("first"))}${list(`<text:list-item>${list(item("deep"))}<text:p>parent tail</text:p></text:list-item>`)}<text:p>after</text:p></text:list-item>`,
      expected: [
        p("root", 0, true, false, [7]),
        p("first", 1, true, false, [7, 5]),
        p("deep", 2, true, true, [7, 5, 3]),
        p("parent tail", 1, false, false, [7, 5]),
        p("after", 0, false, false, [7]),
      ],
    },
    {
      body: `<text:list-item><text:p>root</text:p>${list(item("first"))}${list(`<text:list-item>${list("")}</text:list-item>`)}<text:p>after</text:p></text:list-item>${item("next")}`,
      expected: [
        p("root", 0, true, false, [7]),
        p("first", 1, true, false, [7, 5]),
        p("after", 0, false, true, [7]),
        p("next", 0, true, false, [8]),
      ],
    },
    {
      body: `<text:list-item><text:p>root</text:p>${list(item("first"))}${list(item("second"))}</text:list-item><text:list-item><text:p>next</text:p>${list(item("new first"))}</text:list-item>`,
      expected: [
        p("root", 0, true, false, [7]),
        p("first", 1, true, false, [7, 5]),
        p("second", 1, true, true, [7, 5]),
        p("next", 0, true, false, [8]),
        p("new first", 1, true, false, [8, 5]),
      ],
    },
    {
      body: `<text:list-item text:start-value="0"><text:p>root</text:p>${list('<text:list-item text:start-value="2"><text:p>first</text:p></text:list-item>')}${list('<text:list-item text:start-value="0"><text:p>second</text:p><text:p>tail</text:p></text:list-item>')}<text:p>after</text:p></text:list-item>${item("next")}`,
      expected: [
        p("root", 0, true, true, [0], 0),
        p("first", 1, true, true, [0, 2], 2),
        p("second", 1, true, true, [0, 0], 0),
        p("tail", 1, false, false, [0, 0]),
        p("after", 0, false, false, [0]),
        p("next", 0, true, false, [1]),
      ],
    },
  ];
  for (const test of cases)
    for (const common of [false, true])
      for (const bullet of [false, true]) {
        const expected = test.expected.map(
          /** Adapts independent literal counters to the bullet family's default starts. @param paragraph - Expected numbered paragraph. @returns Expected transport state. */ (
            paragraph,
          ) => {
            const vector = paragraph.vector.map(
              /** Maps the literal level defaults, preserving explicit starts. @param value - Counter. @param level - Level. @returns Bullet or numeric counter. */ (
                value,
                level,
              ) =>
                bullet &&
                !test.expected.some(
                  /** Detects this fixture's explicit zero/two starts. @param candidate - Paragraph. @returns Whether explicit. */ (
                    candidate,
                  ) => candidate.explicit !== undefined,
                )
                  ? value - ([6, 4, 2][level] as number)
                  : value,
            );
            return {
              ...paragraph,
              explicit: paragraph.explicit,
              start: paragraph.explicit ?? (bullet ? 1 : [7, 5, 3][paragraph.level]),
              vector,
              number: vector.at(-1),
              label: paragraph.counted ? (bullet ? "●" : `${vector.join(".")}.`) : undefined,
            };
          },
        );
        const imported = (
          await readOdtDocument(await input(baseline, test.body, common, bullet), {
            title: "Sublist",
          })
        ).document;
        expect(state(imported)).toEqual(expected);
        const rule = imported.FindNumRulePtr("Sublist") as SwNumRule;
        const copied = createWriterDocument();
        copied.GetDocumentListsManager().AddNumRule(rule.clone());
        imported.paragraphs.forEach(
          /** Copies owned items and text into independent nodes. @param node - Source. @param index - Position. @returns Nothing. */ (
            node,
            index,
          ) => {
            const target =
              index === 0 ? (copied.paragraphs[0] as SwTextNode) : copied.nodes.MakeTextNode();
            target.SetText(node.GetText());
            target.SetListItems(node.CaptureListItems());
          },
        );
        expect(copied.FindNumRulePtr("Sublist")).not.toBe(rule);
        expect(state(copied)).toEqual(expected);
        const record = encodeWriterDocument(imported);
        expect(record.swModelVersion).toBe(16);
        expect(state(decodeWriterDocument(record))).toEqual(expected);
        const exported = writeOdtDocument(imported, { title: "Sublist" });
        const xml = await new ZipFile(exported).readTextEntry("content.xml");
        expect(xml).toContain('office:version="1.3"');
        for (const paragraph of expected)
          if (paragraph.restart && paragraph.counted)
            expect(xml).toContain(`text:start-value="${paragraph.start}"`);
        const reopened = (await readOdtDocument(exported, { title: "Sublist" })).document;
        // Current export canonicalizes counted implicit restart to an explicit start.
        // Native same-level nested restart splitting is a separate export audit obligation.
        // Native NumberingIsNumber projection drops uncounted restart metadata.
        expect(state(reopened)).toEqual(
          expected.map(
            /** Applies the documented bounded export projection. @param paragraph - Imported state. @returns Reopened state. */ (
              paragraph,
            ) => ({
              ...paragraph,
              restart: paragraph.counted && paragraph.restart,
              explicit:
                paragraph.counted && paragraph.restart ? paragraph.start : paragraph.explicit,
            }),
          ),
        );
      }
});
