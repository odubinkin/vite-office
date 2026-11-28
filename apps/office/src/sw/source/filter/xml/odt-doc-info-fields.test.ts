/** @fileoverview Document-owned Writer DocInfo fields through ODT and Worker transport. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { packXmlPackage } from "../../../../package/source/zippackage/xml-package";
import {
  createManifestProperty,
  createManifestXml,
} from "../../../../package/source/manifest/ManifestWriter";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  createOdtWorkerDocument,
  restoreOdtWorkerDocumentAsync,
} from "../../../browser/filter/xml/odt-transfer";
import { CH_TXTATR_BREAKWORD } from "../../../inc/hintids";
import { SwDocInfoSubType } from "../../core/fields/docufld";
import type { SwDoc } from "../../core/doc/doc";
import { GetTextNodeExpandedText } from "../../core/txtnode/ndtxt-hints";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const mime = "application/vnd.oasis.opendocument.text";
const metadata = { title: "Fallback" };
const manifest = createManifestXml([
  [createManifestProperty("FullPath", "/"), createManifestProperty("MediaType", mime)],
  [
    createManifestProperty("FullPath", "content.xml"),
    createManifestProperty("MediaType", "text/xml"),
  ],
  [createManifestProperty("FullPath", "meta.xml"), createManifestProperty("MediaType", "text/xml")],
]);

/** Enumerates the native fields in body order. @param document - Actual Writer document. @returns Text field hints. */
function fields(document: SwDoc) {
  return document
    .GetNodes()
    .entries()
    .flatMap(
      /** Retrieves the native DocInfo family only. @param node - Source node. @returns Native hints. */
      (node) => node.GetTextNode()?.GetpSwpHints()?.GetDocInfoFields() ?? [],
    );
}

it("retains the title field presentation from LibreOffice testFieldRotation", async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data/field-rotated.fodt",
    "utf8",
  );
  const root = fixture.match(/<office:document\b([^>]+)>/)?.[1];
  const meta = fixture.match(/<office:meta>.*?<\/office:meta>/s)?.[0];
  assert(root && meta);
  const bytes = await packXmlPackage({
    mimetype: mime,
    "META-INF/manifest.xml": manifest,
    "content.xml": fixture
      .replace(meta, "")
      .replace(/(<\/?office:document)(?=[ >])/gu, "$1-content"),
    "meta.xml": `<office:document-meta${root}>${meta}</office:document-meta>`,
  });
  const loaded = await readOdtDocument(bytes, metadata);
  try {
    const [hint] = fields(loaded.document);
    assert(hint);
    expect(hint.GetAttr().GetField().GetSubType()).toBe(SwDocInfoSubType.Title);
    expect(hint.GetAttr().GetField().Expand()).toBe("Rotationeering");
    const node = hint.GetTextNode();
    assert(node);
    expect(GetTextNodeExpandedText(node, 0, node.GetText().length)).toBe("Rotationeering");
  } finally {
    loaded.document.Dispose();
  }
});

it("roundtrips live metadata and fixed presentations through the Worker", async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}"`;
  const bytes = await packXmlPackage({
    mimetype: mime,
    "META-INF/manifest.xml": manifest,
    "meta.xml": `<office:document-meta ${ns}><office:meta><dc:title>Live title</dc:title><dc:subject>Live subject</dc:subject><dc:description>Summary</dc:description><meta:keyword>one</meta:keyword><meta:keyword>two</meta:keyword><meta:initial-creator>Creator</meta:initial-creator><meta:creation-date>2020-02-07T13:06:45</meta:creation-date><dc:creator>Editor</dc:creator><dc:date>2020-02-07T14:00:00</dc:date><meta:printed-by>Print author without date</meta:printed-by><meta:editing-cycles>3</meta:editing-cycles></office:meta></office:document-meta>`,
    "content.xml": `<office:document-content ${ns}><office:automatic-styles><style:style style:name="T1" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style></office:automatic-styles><office:body><office:text><text:p><text:span text:style-name="T1"><text:title>Stale title</text:title></text:span>|<text:subject text:fixed="true">Fixed subject</text:subject>|<text:description/>|<text:keywords/>|<text:initial-creator/>|<text:creator/>|<text:printed-by>Stale</text:printed-by>|<text:editing-cycles text:fixed="true">0007</text:editing-cycles></text:p></office:text></office:body></office:document-content>`,
  });
  const source = await readOdtDocument(bytes, metadata);
  let restored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const result = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      () => false,
    );
    restored = result.document;
    const old = [
      "Live title",
      "Fixed subject",
      "Summary",
      "one, two",
      "Creator",
      "Editor",
      "",
      "0007",
    ];
    expect(fields(restored).map((hint) => hint.GetAttr().GetField().Expand())).toEqual(old);
    const title = unicode("Changed title");
    try {
      restored.documentProperties.GetDocumentProperties().setTitle(title);
    } finally {
      title.dispose();
    }
    const saved = await writeOdtDocument(restored, { title: "Changed title" });
    const content = await (await DocumentArchive.open(saved)).readTextEntry("content.xml");
    expect(content).toMatch(/<text:span[^>]+><text:title>Changed title<\/text:title><\/text:span>/);
    expect(content).toContain('<text:subject text:fixed="true">Fixed subject</text:subject>');
    expect(content).not.toContain(CH_TXTATR_BREAKWORD);
    reopened = (await readOdtDocument(saved, metadata)).document;
    expect(fields(reopened).map((hint) => hint.GetAttr().GetField().Expand())).toEqual([
      "Changed title",
      ...old.slice(1),
    ]);
  } finally {
    source.document.Dispose();
    restored?.Dispose();
    reopened?.Dispose();
  }
});
