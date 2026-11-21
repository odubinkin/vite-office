/** @fileoverview Writer inline raster sources through the native ODT and Worker paths. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { decodeBase64, encodeBase64 } from "../../../../comphelper/source/misc/base64";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import type { XFillBitmapItem } from "../../../../svx/inc/xbtmpit";
import { XATTR_FILLBITMAP } from "../../../../svx/inc/xdef";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { getActivePageStory } from "../../core/layout/atrfrm";
import { CollectGraphicFlyFrames } from "../../core/layout/flycnt";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";
import { importWriterXml } from "./xmlimp";

const metadata = { title: "Inline graphics" };
const fixture = readFileSync(
  "../../vendor/libreoffice-reference/sw/qa/extras/odfimport/data/draw-image-embedded.fodt",
  "utf8",
);
const binary = /<office:binary-data>([^<]+)<\/office:binary-data>/u.exec(fixture)?.[1] ?? "";
const png = decodeBase64(binary);
const jpeg = new Uint8Array(
  readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/unowriter/data/test.jpg"),
);

/** Finds the native graphic frames, including as-character anchors. @param doc - Writer document. @returns Owned array of borrowed frame pairs. */
function graphicFrames(doc: SwDoc) {
  return [...CollectGraphicFlyFrames(doc, true).values()].flat();
}

it("loads pixels from the original testDrawImageEmbeddedNotBlocked fixture", /** Ports the original native graphic assertion and verifies Worker and package storage. @returns Completion. */ async () => {
  const content = fixture
    .replace(/(<\/?office:document)(?=[\s>])/gu, "$1-content")
    .replace('office:mimetype="application/vnd.oasis.opendocument.text"', "");
  const source = importWriterXml(undefined, content, metadata).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    const bytes = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const doc of [source, worker, reopened]) {
      const images = graphicFrames(doc);
      expect(images).toHaveLength(1);
      const image = images[0];
      assert(image);
      expect(image.graphic.GetGraphic().mediaType).toBe("image/png");
      expect(image.graphic.GetGraphic().GetNativeData()).toEqual(png);
      expect(image.format.GetAnchor().GetAnchorId()).toBe(RndStdIds.FLY_AS_CHAR);
    }
    const archive = await DocumentArchive.open(bytes);
    const path = archive.getEntryNames().find(
      /** Finds the package raster created from inline bytes. @param name - Entry path. @returns Match. */
      (name) => name.startsWith("Pictures/"),
    );
    assert(path);
    expect(await archive.readEntry(path)).toEqual(png);
    expect(await archive.readTextEntry("content.xml")).toContain(`xlink:href="${path}"`);
  } finally {
    source.Dispose();
    worker?.Dispose();
    reopened?.Dispose();
  }
});

it("uses distinct URL precedence for BitmapStyle and legacy background contexts", /** Covers source fallback, first-stream selection, name replacement and real story fills. @returns Completion. */ async () => {
  const href = "Pictures/main.jpg";
  const helper = new SvXMLGraphicHelper(
    new Map([[href, { bytes: jpeg, mediaType: "image/jpeg" }]]),
  );
  const inline = `<office:binary-data>${binary}</office:binary-data>`;
  const inlineJpeg = `<office:binary-data>${encodeBase64(jpeg)}</office:binary-data>`;
  const styles = `<office:document-styles xmlns:office="${NS.office}" xmlns:text="${NS.text}" xmlns:style="${NS.style}" xmlns:draw="${NS.draw}" xmlns:xlink="${NS.xlink}" xmlns:fo="${NS.fo}">
    <office:styles>
      <draw:fill-image draw:name="Primary" xlink:href="${href}">${inline}</draw:fill-image>
      <draw:fill-image draw:name="Fallback" xlink:href="Pictures/missing.png">${inline}${inlineJpeg}</draw:fill-image>
      <draw:fill-image draw:name="Duplicate">${inline}</draw:fill-image>
      <draw:fill-image draw:name="Duplicate">${inlineJpeg}</draw:fill-image>
      <draw:fill-image draw:name="Invalid"><office:binary-data>dGV4dA==</office:binary-data></draw:fill-image>
    </office:styles>
    <office:automatic-styles>
      <style:page-layout style:name="pm"><style:page-layout-properties fo:page-width="8in" fo:page-height="11in" draw:fill="bitmap" draw:fill-image-name="Primary"/>
        <style:header-style><style:header-footer-properties><style:background-image style:repeat="stretch">${inline}</style:background-image></style:header-footer-properties></style:header-style>
        <style:footer-style><style:header-footer-properties><style:background-image xlink:href="Pictures/missing.png">${inline}</style:background-image></style:header-footer-properties></style:footer-style>
      </style:page-layout>
    </office:automatic-styles>
    <office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm"><style:header><text:p>Header</text:p></style:header><style:footer><text:p>Footer</text:p></style:footer></style:master-page></office:master-styles>
  </office:document-styles>`;
  const source = importWriterXml(styles, undefined, metadata, undefined, {
    graphicHelper: helper,
  }).document;
  let reopened: SwDoc | undefined;
  try {
    expect(source.GetBitmapTable().get("Fallback")?.GetGraphic()?.GetNativeData()).toEqual(png);
    expect(source.GetBitmapTable().get("Duplicate")?.GetGraphic()?.GetNativeData()).toEqual(jpeg);
    expect(source.GetBitmapTable().has("Invalid")).toBe(false);
    reopened = (await readOdtDocument(await writeOdtDocument(source, metadata), metadata)).document;
    for (const document of [source, reopened]) {
      const page = document.GetPageDesc(0).GetMaster();
      const header = getActivePageStory(page, true);
      const footer = getActivePageStory(page, false);
      assert(header && footer);
      const bodyImage = page.GetAttrSet().GetItemIfSet(XATTR_FILLBITMAP, false) as
        XFillBitmapItem | undefined;
      const headerImage = header.GetAttrSet().GetItemIfSet(XATTR_FILLBITMAP, false) as
        XFillBitmapItem | undefined;
      expect(bodyImage?.GetGraphic()?.GetNativeData()).toEqual(jpeg);
      expect(headerImage?.GetGraphic()?.GetNativeData()).toEqual(png);
      expect(footer.GetAttrSet().GetItemIfSet(XATTR_FILLBITMAP, false)).toBeUndefined();
    }
  } finally {
    source.Dispose();
    reopened?.Dispose();
  }
});

it("loads direct graphic text and leaves an unresolved nonempty frame URL unfilled", /** Covers the native legacy direct-text source and linked-frame selection. @returns Nothing. */ () => {
  const content = `<office:document-content xmlns:office="${NS.office}" xmlns:text="${NS.text}" xmlns:draw="${NS.draw}" xmlns:xlink="${NS.xlink}">
    <office:body><office:text><text:p>
      <draw:frame draw:name="Unresolved"><draw:image xlink:href="Pictures/absent.png"><office:binary-data>${binary}</office:binary-data></draw:image></draw:frame>
      <draw:frame draw:name="Legacy"><draw:image>${binary}</draw:image></draw:frame>
    </text:p></office:text></office:body>
  </office:document-content>`;
  const doc = importWriterXml(undefined, content, metadata).document;
  try {
    const images = graphicFrames(doc);
    expect(images).toHaveLength(1);
    expect(images[0]?.format.GetName()).toBe("Legacy");
    expect(images[0]?.graphic.GetGraphic().GetNativeData()).toEqual(png);
  } finally {
    doc.Dispose();
  }
});
