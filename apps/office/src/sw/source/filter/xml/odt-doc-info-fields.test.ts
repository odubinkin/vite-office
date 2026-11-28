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

it("retains the title field presentation from LibreOffice testFieldRotation", /** Retains the title field presentation from LibreOffice testFieldRotation. @returns Completion. */ async () => {
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

it("roundtrips live metadata and fixed presentations through the Worker", /** Roundtrips live metadata and fixed presentations through the Worker. @returns Completion. */ async () => {
  const ns = `xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:dc="${ODF_NAMESPACES.dc}" xmlns:meta="${ODF_NAMESPACES.meta}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:number="${ODF_NAMESPACES.number}"`;
  const bytes = await packXmlPackage({
    mimetype: mime,
    "META-INF/manifest.xml": manifest,
    "meta.xml": `<office:document-meta ${ns}><office:meta><dc:title>Live title</dc:title><dc:subject>Live subject</dc:subject><dc:description>Summary</dc:description><meta:keyword>one</meta:keyword><meta:keyword>two</meta:keyword><meta:initial-creator>Creator</meta:initial-creator><meta:creation-date>2020-02-07T13:06:45</meta:creation-date><dc:creator>Editor</dc:creator><dc:date>2020-02-07T14:00:00</dc:date><meta:printed-by>Print author without date</meta:printed-by><meta:editing-cycles>3</meta:editing-cycles><meta:editing-duration>PT25H2M3S</meta:editing-duration><meta:user-defined meta:name="Build">Release &amp; Next</meta:user-defined><meta:user-defined meta:name="Score" meta:value-type="float">12.5</meta:user-defined><meta:user-defined meta:name="Delivery" meta:value-type="date">2020-02-08</meta:user-defined><meta:user-defined meta:name="Span" meta:value-type="time">PT1H2M3.123S</meta:user-defined></office:meta></office:document-meta>`,
    "content.xml": `<office:document-content ${ns}><office:automatic-styles><style:style style:name="T1" style:family="text"><style:text-properties fo:font-weight="bold"/></style:style><number:date-style style:name="D" fo:language="en" fo:country="US"><number:year number:style="long"/><number:text>-</number:text><number:month number:style="long"/><number:text>-</number:text><number:day number:style="long"/></number:date-style></office:automatic-styles><office:body><office:text><text:p><text:span text:style-name="T1"><text:title>Stale title</text:title></text:span>|<text:subject text:fixed="true">Fixed subject</text:subject>|<text:description/>|<text:keywords/>|<text:initial-creator/>|<text:creator/>|<text:printed-by>Stale</text:printed-by>|<text:editing-cycles text:fixed="true">0007</text:editing-cycles>|<text:creation-date style:data-style-name="D" text:date-value="1999-01-01T00:00:00">Stale</text:creation-date>|<text:creation-time/>|<text:modification-time/>|<text:print-date text:fixed="true">Fixed date</text:print-date>|<text:editing-duration/>|<text:user-defined text:name="Build"/>|<text:user-defined text:name="Score"/>|<text:user-defined text:name="Delivery" style:data-style-name="D"/>|<text:user-defined text:name="Span"/>|<text:user-defined text:name="Build" text:fixed="true">Fixed build</text:user-defined>|<text:user-defined>Unnamed display</text:user-defined></text:p></office:text></office:body></office:document-content>`,
  });
  const source = await readOdtDocument(bytes, metadata);
  let restored: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    const result = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(source)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
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
      "2020-02-07",
      "13:06",
      "14:00",
      "Fixed date",
      "01:02:03",
      "Release & Next",
      "12.5",
      "2020-02-08",
      "+ Y: 0 M: 0 D: 0 H: 1 M: 2 S: 3",
      "Fixed build",
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
    expect(content).toMatch(
      /<text:creation-date style:data-style-name="[^"]+">2020-02-07<\/text:creation-date>/,
    );
    expect(content).toMatch(
      /<text:print-date style:data-style-name="[^"]+" text:fixed="true">Fixed date<\/text:print-date>/,
    );
    expect(content).toMatch(
      /<text:user-defined style:data-style-name="[^"]+" text:name="Delivery">2020-02-08<\/text:user-defined>/,
    );
    expect(content).toContain("Unnamed<text:s/>display");
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

it("reads the native modification fields from the LibreOffice testBadSplitSection fixture", /** Reads the native modification fields from the LibreOffice testBadSplitSection fixture. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/core/layout/data/bad-split-section.odt",
  );
  const { document } = await readOdtDocument(new Uint8Array(fixture), metadata);
  try {
    const formats = fields(document).map((hint) => hint.GetAttr().GetField());
    const date = formats.find(
      (field) => field.GetSubType() === (SwDocInfoSubType.Change | SwDocInfoSubType.SubDate),
    );
    const time = formats.find(
      (field) => field.GetSubType() === (SwDocInfoSubType.Change | SwDocInfoSubType.SubTime),
    );
    // The source references missing N36 and N61 definitions, so both fields use the locale defaults.
    expect(date?.GetFormat()).toBe(0);
    expect(time?.GetFormat()).toBe(0);
    expect(date?.Expand()).toBe("03/06/2024");
    expect(time?.Expand()).toBe("15:14");
  } finally {
    document.Dispose();
  }
});

it("exports the native first-page classification property from LibreOffice testTdf160877", /** Exports the native first-page classification property from LibreOffice testTdf160877. @returns Completion. */ async () => {
  const fixture = readFileSync(
    "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/tdf160877.odt",
  );
  const loaded = await readOdtDocument(new Uint8Array(fixture), metadata);
  let worker: SwDoc | undefined;
  try {
    const result = await restoreOdtWorkerDocumentAsync(
      structuredClone(createOdtWorkerDocument(loaded)),
      undefined,
      /** Keeps the worker restore active for the round trip. @returns False, since the operation remains active. */ () =>
        false,
    );
    worker = result.document;
    const property = "urn:bails:IntellectualProperty:Marking:document-header";
    const original = fields(worker).map((hint) => hint.GetAttr().GetField());
    const marking = original.find((field) => field.GetName() === property);
    expect(marking?.Expand()).toBe("Classification: General Business");
    const archive = await DocumentArchive.open(await writeOdtDocument(worker, metadata));
    const styles = await archive.readTextEntry("styles.xml");
    expect(styles).toContain(
      `text:name="${property}">Classification: General Business</text:user-defined>`,
    );
  } finally {
    worker?.Dispose();
    loaded.document.Dispose();
  }
});
