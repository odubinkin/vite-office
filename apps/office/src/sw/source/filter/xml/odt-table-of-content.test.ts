/** @fileoverview Original Writer contents index and cached body through ODT and the Worker. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { SwSectionNode } from "../../core/docnode/ndsect";
import { SectionType } from "../../core/docnode/section";
import { SwTOXBaseSection } from "../../core/inc/doctxm";
import { FormTokenType, MAXLEVEL, SwTOXElement } from "../../core/tox/tox";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

it("retains the native SimpleTOC index, level forms and cached linked contents", /** Ports testTableOfContentLinksHaveContentSet's native index assertion at the ODT boundaries. @returns Completion. */ async () => {
  const metadata = { title: "Writer table of contents" };
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/globalfilter/data/SimpleTOC.odt",
  );
  const source = (await readOdtDocument(new Uint8Array(fixture), metadata)).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    const bytes = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const doc of [source, worker, reopened]) {
      const nodes = doc.GetNodes();
      const indexes = Array.from(nodes.entries()).filter(
        /** Finds connected TOX sections, as in the original native count. @param node - Document node. @returns Whether the node is a TOX section. */
        (node): node is SwSectionNode =>
          node instanceof SwSectionNode && node.GetSection() instanceof SwTOXBaseSection,
      );
      expect(indexes).toHaveLength(1);
      const toc = indexes[0];
      assert(toc);
      const section = toc.GetSection();
      assert(section instanceof SwTOXBaseSection);
      const { tox } = section;
      expect(tox.name).toBe("Table of Contents1");
      expect(tox.title).toBe("Table of Contents");
      expect(tox.protected).toBe(true);
      expect(tox.type).toBe(doc.GetTOXType());
      expect(tox.level).toBe(MAXLEVEL);
      expect(tox.createType).toBe(SwTOXElement.OutlineLevel | SwTOXElement.Mark);
      expect(tox.form.GetTemplate(0)).toBe("Contents Heading");
      expect(tox.form.GetTemplate(1)).toBe("Contents 1");
      const fields = tox.form.GetPattern(1);
      expect(fields.map((field) => field.eTokenType)).toEqual([
        FormTokenType.LinkStart,
        FormTokenType.EntryNo,
        FormTokenType.EntryText,
        FormTokenType.TabStop,
        FormTokenType.PageNums,
        FormTokenType.LinkEnd,
      ]);
      expect(fields[0]?.sCharStyleName).toBe("Index Link");
      expect(fields[3]).toMatchObject({
        eTabAlign: SvxTabAdjust.End,
        cTabFillChar: ".",
        bWithTab: true,
      });
      const [title, entry] = nodes.GetSectionBlocks(toc);
      assert(title instanceof SwSectionNode);
      expect(title.GetSection().GetSectionData().type).toBe(SectionType.ToxHeader);
      expect(nodes.GetSectionBlocks(title)[0]?.GetTextNode()?.GetText()).toBe("Table of Contents");
      expect(entry?.GetTextNode()?.GetText()).toBe("Heading 1\t1");
    }
    const archive = await DocumentArchive.open(bytes);
    const content = await archive.readTextEntry("content.xml");
    const xml = new DOMParser().parseFromString(content, "application/xml");
    const [toc] = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "table-of-content");
    assert(toc);
    expect(
      toc.getElementsByTagNameNS(ODF_NAMESPACES.text, "table-of-content-entry-template"),
    ).toHaveLength(10);
    const [link] = toc.getElementsByTagNameNS(ODF_NAMESPACES.text, "a");
    const [bookmark] = xml.getElementsByTagNameNS(ODF_NAMESPACES.text, "bookmark-start");
    expect(link?.getAttributeNS(ODF_NAMESPACES.xlink, "href")).toBe(
      "#" + bookmark?.getAttributeNS(ODF_NAMESPACES.text, "name"),
    );
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});
