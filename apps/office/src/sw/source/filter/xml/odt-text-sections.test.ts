/** @fileoverview Native named Writer sections across ODT and the Worker transport. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { SwSectionNode } from "../../core/docnode/ndsect";
import { SwXTextSection } from "../../core/unocore/unosect";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Writer text sections" };
const namespaces =
  'xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0" xmlns:writer="http://openoffice.org/2004/writer"';

it("retains all four protection keys from LibreOffice testProtectionKey", /** Ports the original digest and exact ODT assertions. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/protection-key.fodt",
    "utf8",
  );
  const content = fixture.replace(/(<\/?office:document)(?=[ >])/gu, "$1-content");
  const source = importWriterXml(undefined, content, metadata).document;
  let reopened: SwDoc | undefined;
  try {
    const bytes = await writeOdtDocument(source, metadata);
    const archive = await DocumentArchive.open(bytes);
    const xml = new DOMParser().parseFromString(
      await archive.readTextEntry("content.xml"),
      "application/xml",
    );
    const textNamespace = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";
    const sections = Array.from(xml.getElementsByTagNameNS(textNamespace, "section"));
    const password = "1012345678901234567890123456789012345678901234567890";
    const expected = [
      "vbnhxyBKtPHCA1wB21zG1Oha8ZA=",
      createHash("sha1").update(password, "utf8").digest("base64"),
      createHash("sha256").update(password, "utf8").digest("base64"),
      createHash("sha256").update(password, "utf8").digest("base64"),
    ];
    expect(sections).toHaveLength(4);
    for (const [index, section] of sections.entries()) {
      expect(section.getAttributeNS(textNamespace, "name")).toBe("Section" + index);
      expect(section.getAttributeNS(textNamespace, "protected")).toBe("true");
      expect(section.getAttributeNS(textNamespace, "protection-key")).toBe(expected[index]);
      expect(section.getAttributeNS(textNamespace, "protection-key-digest-algorithm")).toBe(
        index < 2 ? null : "http://www.w3.org/2000/09/xmldsig#sha256",
      );
    }
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const document of [source, reopened]) {
      const keys = document
        .GetNodes()
        .entries()
        .flatMap(
          /** Reads original native section digest bytes. @param node - Document node. @returns Digest projection. */
          (node) => {
            const section = node.GetSectionNode()?.GetSection();
            if (!section) return [];
            expect(section.IsProtect()).toBe(true);
            return [Buffer.from(section.GetSectionData().password).toString("base64")];
          },
        );
      expect(keys).toEqual(expected);
    }
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("preserves native section order, conditional visibility, frame style and file links through Worker and ODT", /** Exercises section nesting and table cell ownership at both boundaries. @returns Completion. */ async () => {
  const content = `<office:document-content ${namespaces}><office:automatic-styles>
    <style:style style:name="Original" style:family="section"><style:section-properties fo:margin-left="72pt" fo:background-color="#123456"/></style:style>
    </office:automatic-styles><office:body><office:text><text:p><text:bookmark-start text:name="Across"/>Before</text:p>
    <text:section text:name="Outer" text:style-name="Original" text:condition="writer:flag EQ 1" text:display="condition" text:is-hidden="true">
      <text:p>First<text:bookmark-end text:name="Across"/></text:p><text:section text:name="Inner"><text:p>Nested</text:p></text:section>
      <table:table table:name="Table"><table:table-column table:number-columns-repeated="2"/><table:table-row><table:table-cell table:number-columns-repeated="2">
        <text:section text:name="Cell"><text:section-source xlink:href="linked.odt" text:filter-name="writer8" text:section-name="Target"/><text:p>Cell text</text:p></text:section>
      </table:table-cell></table:table-row></table:table><text:p>Last</text:p>
    </text:section><text:p>After</text:p></office:text></office:body></office:document-content>`;
  const source = importWriterXml(undefined, content, metadata).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    const bytes = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const document of [source, worker, reopened]) {
      const nodes = document.GetNodes();
      const body = nodes.GetSectionBlocks(nodes.GetEndOfContent().StartOfSectionNode());
      expect(body).toHaveLength(3);
      expect(body[0]?.GetTextNode()?.GetText()).toBe("Before");
      expect(body[2]?.GetTextNode()?.GetText()).toBe("After");
      const outer = body[1];
      assert(outer instanceof SwSectionNode);
      const section = outer.GetSection();
      expect(section.GetSectionData()).toMatchObject({
        name: "Outer",
        condition: "flag EQ 1",
        hidden: true,
        condHidden: true,
      });
      expect(section.GetFormat().GetLRSpace(false).ResolveLeft()).toBe(1440);
      expect(section.GetFormat().GetContent(false).GetContentIdx()?.GetNode()).toBe(outer);
      const [first, inner, table, last] = nodes.GetSectionBlocks(outer);
      const [bookmark] = document.GetIDocumentMarkAccess().GetBookmarks();
      assert(bookmark);
      expect(bookmark.GetMarkStart().GetNode()).toBe(body[0]);
      expect(bookmark.GetMarkEnd().GetNode()).toBe(first);
      assert(inner instanceof SwSectionNode);
      expect(inner.GetSection().GetFormat().DerivedFrom()).toBe(section.GetFormat());
      expect(nodes.GetSectionBlocks(inner)[0]?.GetTextNode()?.GetText()).toBe("Nested");
      expect(last?.GetTextNode()?.GetText()).toBe("Last");
      assert(table instanceof SwTableNode);
      const cell = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[0];
      assert(cell);
      const cellStart = cell.GetStartNode();
      const blocks = nodes.GetSectionBlocks(cellStart);
      expect(blocks).toHaveLength(1);
      const [linked] = blocks;
      assert(linked instanceof SwSectionNode);
      const repeatedCell = table.GetTable().GetTabLines()[0]?.GetTabBoxes()[1];
      assert(repeatedCell);
      const [repeatedSection] = nodes.GetSectionBlocks(repeatedCell.GetStartNode());
      assert(repeatedSection instanceof SwSectionNode);
      expect(repeatedSection.GetSection().GetSectionData().name).toBe("Section1");
      expect(nodes.GetSectionBlocks(repeatedSection)[0]?.GetTextNode()?.GetText()).toBe(
        "Cell text",
      );
      expect(linked.StartOfSectionNode()).toBe(cellStart);
      expect(SwXTextSection.GetFileLink(linked.GetSection().GetSectionData())).toEqual({
        url: "linked.odt",
        filter: "writer8",
        region: "Target",
      });
      expect(nodes.GetSectionBlocks(linked)[0]?.GetTextNode()?.GetText()).toBe("Cell text");
      expect(
        document.paragraphs.map(
          /** Reads the Writer editing projection. @param node - Body text node. @returns Text. */
          (node) => node.GetText(),
        ),
      ).toEqual(["Before", "First", "Nested", "Last", "After"]);
    }
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});
