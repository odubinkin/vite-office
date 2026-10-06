/** @fileoverview Actual Worker and ODF geometry preservation for native absolute table orientations. */
import { it, expect } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTabFrame } from "../../core/layout/tabfrm";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { writeOdtDocument } from "./wrtxml";
import { readOdtDocument } from "./swxml";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
for (const [orient, left, right, width, token, leftExport, rightExport] of [
  [H.FULL, 0, 0, 8000, "margins", false, false],
  [H.LEFT, 0, 5000, 3000, "left", false, false],
  [H.LEFT_AND_WIDTH, 300, 4700, 3000, "left", true, false],
  [H.RIGHT, 5000, 0, 3000, "right", false, false],
  [H.CENTER, 2500, 2500, 3000, "center", false, false],
  [H.NONE, 300, 600, 7100, "margins", true, true],
] as const)
  it(`preserves native orientation=${orient} through Worker and fresh ODF`, /** Checks literal geometry, conditional attributes and native import. @returns Completion. */ async () => {
    const doc = new SwDoc(),
      table = doc.nodes.MakeTableNode("Geometry", {
        horiOrient: orient,
        width,
        marginLeft: left,
        marginRight: right,
        marginTop: 113,
        marginBottom: 170,
      });
    table.AddColumnWidth(1000);
    table.AddColumnWidth(2000);
    doc.nodes.AppendTableRow(table, 2).GetTabBoxes()[0]?.GetParagraphs()[0]?.SetText("Original");
    const worker = decodeWriterDocument(encodeWriterDocument(doc)),
      actual = worker.GetTables()[0];
    expect(actual?.GetFormat()).toEqual(table.GetFormat());
    const metadata = { title: "Geometry" },
      bytes = writeOdtDocument(worker, metadata);
    const xml = await new ZipFile(bytes).readTextEntry("content.xml");
    const attributes = xml.match(/<style:table-properties[^>]*\/>/)?.[0];
    expect(attributes).toContain(`table:align="${token}"`);
    expect(attributes?.includes("fo:margin-left=")).toBe(leftExport);
    expect(attributes?.includes("fo:margin-right=")).toBe(rightExport);
    expect(attributes).toContain('fo:margin-top="0.1993cm"');
    const reopened = (await readOdtDocument(bytes, metadata)).document.GetTables()[0];
    if (reopened === undefined) throw new Error("Missing reopened table");
    expect(reopened.GetHoriOrient()).toBe(orient);
    expect(new SwTabFrame(reopened).Format(8000)).toEqual({ width, left, right });
    expect(reopened.GetFormat().marginTop).toBe(113);
    expect(reopened.GetFormat().marginBottom).toBe(170);
    expect(reopened.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "Original",
    );
  });
