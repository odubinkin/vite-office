/** @fileoverview Verifies Writer hyperlink import and export against exact pinned LibreOffice ODT fixtures. */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Reads an exact tracked upstream ODT fixture. @param relativePath - Path below the mirrored sw/qa tree. @returns Fixture bytes. */
function upstreamOdt(relativePath: string): Uint8Array {
  return new Uint8Array(
    readFileSync(
      path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../qa", relativePath),
    ),
  );
}

describe("Writer upstream hyperlink ODT fixtures", /** Runs exact LibreOffice package compatibility cases. @returns Nothing. */ () => {
  it("exports link transitions and all supported ODF hyperlink attributes", /** Covers adjacent links, link closure before plain text, and target-frame show mapping. @returns Nothing. */ async () => {
    const document = createWriterDocument();
    const paragraph = document.paragraphs[0];
    if (paragraph === undefined) throw new Error("Writer hyperlink export paragraph is missing.");
    paragraph.InsertText("one two plain", 0);
    paragraph.ToggleTextRangeFormat(1, 2, "bold");
    paragraph.SetHyperlink(0, 3, {
      name: "named",
      styleName: "Internet_20_link",
      targetFrame: "_self",
      url: "relative-one",
      visitedStyleName: "Visited_20_Internet_20_Link",
    });
    paragraph.SetHyperlink(4, 7, { targetFrame: "_blank", url: "relative-two" });
    paragraph.SetHyperlink(8, 13, { url: "relative-three" });
    const state = createDocument({ id: "link-export", suiteId: "writer", title: "Links" });
    const xml = await new ZipFile(writeOdtDocument(document, state)).readTextEntry("content.xml");
    expect(xml).toContain(
      '<text:a xlink:type="simple" xlink:href="relative-one" office:name="named" office:target-frame-name="_self" xlink:show="replace" text:style-name="Internet_20_link" text:visited-style-name="Visited_20_Internet_20_Link">',
    );
    expect(xml).toContain(
      '<text:a xlink:type="simple" xlink:href="relative-two" office:target-frame-name="_blank" xlink:show="new">two</text:a><text:s/><text:a xlink:type="simple" xlink:href="relative-three">plain</text:a>',
    );
    expect(xml.match(/xlink:href="relative-one"/gu)).toHaveLength(1);
    expect(xml).toContain("<text:span");
  });

  it("opens and round-trips pinned upstream hyperlink ODT fixtures", /** Verifies real LibreOffice examples retain hyperlink metadata and nested formatting. @returns Nothing. */ async () => {
    const fixtures = [
      {
        href: "http://example.com/",
        path: "extras/tiledrendering/data/hyperlink.odt",
        text: "Normal text, hyperlink",
      },
      {
        href: "https://www.google.com/",
        path: "extras/ooxmlexport/data/151384Hyperlink.odt",
        text: "googleurl",
      },
    ] as const;
    for (const fixture of fixtures) {
      const metadata = createDocument({ id: "odt-link", suiteId: "writer", title: "Imported" });
      const imported = await readOdtDocument(upstreamOdt(fixture.path), metadata);
      expect(imported.document.paragraphs[0]?.GetText()).toBe(fixture.text);
      const linked = projectWriterTextRuns(imported.document.paragraphs[0]).find(
        /** Finds the imported hyperlink portion. @param run - Writer run. @returns Whether linked. */
        (run) => run.hyperlink !== undefined,
      );
      expect(linked?.hyperlink).toMatchObject({
        styleName: "Internet_20_link",
        url: fixture.href,
        visitedStyleName: "Visited_20_Internet_20_Link",
      });
      const exported = writeOdtDocument(imported.document, { title: imported.title });
      expect(await new ZipFile(exported).readTextEntry("content.xml")).toContain(
        `xlink:href="${fixture.href}"`,
      );
      const restored = await readOdtDocument(exported, metadata);
      expect(projectWriterTextRuns(restored.document.paragraphs[0])).toEqual(
        projectWriterTextRuns(imported.document.paragraphs[0]),
      );
    }
  });
});
