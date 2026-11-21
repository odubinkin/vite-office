/** @fileoverview Named Writer fly frame bitmap fills and native ODT geometry round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import { encodeBase64 } from "../../../../comphelper/source/misc/base64";
import { BitmapMode } from "../../../../offapi/com/sun/star/drawing/BitmapMode";
import { FillStyle } from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { RectanglePoint } from "../../../../offapi/com/sun/star/drawing/RectanglePoint";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES as NS } from "../../../../xmloff/source/core/xmltoken";
import { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import { getBitmapMode, XFillBitmapItem } from "../../../../svx/inc/xbtmpit";
import { Size } from "../../../../tools/inc/gen";
import { Graphic } from "../../../../vcl/source/gdi/graph";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import type { SwDoc } from "../../core/doc/doc";
import { getBitmapFillItem, getBitmapGeometry, getFillProperties } from "./xmlexp-fill";
import { importWriterXml } from "./xmlimp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Frame fill" };
const fixture =
  "../../vendor/libreoffice-reference/sw/qa/extras/odfexport/data/framebackgrounds.odt";
const pngPath = "Pictures/100000000000005E0000005E47394922.png";

/** Borrows the original frame attributes by frame name. @param document - Writer document. @param name - Frame name. @returns Native attributes. */
function frameItems(document: SwDoc, name: string) {
  const format = document.GetSpzFrameFormats().FindFormatByName(name);
  assert(format);
  return format.GetAttrSet();
}

it("ports the bitmap frame assertions from testFramebackgrounds", /** Checks the original named graphic, transparency and offsets through ODT save and reload. @returns Completion. */ async () => {
  const bytes = new Uint8Array(readFileSync(fixture));
  const original = await DocumentArchive.open(bytes);
  const png = await original.readEntry(pngPath);
  const source = (await readOdtDocument(bytes, metadata)).document;
  let reopened: SwDoc | undefined;
  try {
    const saved = await writeOdtDocument(source, metadata);
    reopened = (await readOdtDocument(saved, metadata)).document;
    const archive = await DocumentArchive.open(saved);
    const styles = new DOMParser().parseFromString(
      await archive.readTextEntry("content.xml"),
      "application/xml",
    );
    const backgrounds = Array.from(styles.getElementsByTagNameNS(NS.style, "background-image"));
    expect(backgrounds).toHaveLength(3);
    for (const background of backgrounds)
      expect(background.getAttributeNS(NS.style, "repeat")).toBe("stretch");
    const translucent = backgrounds.find(
      /** Selects the original scalar 55-percent opacity case. @param element - Compatible brush element. @returns Match. */
      (element) => element.getAttributeNS(NS.draw, "opacity") === "55%",
    );
    assert(translucent);
    expect(translucent.parentElement?.getAttributeNS(NS.fo, "background-color")).toBe(
      "transparent",
    );
    expect(translucent.parentElement?.getAttributeNS(NS.draw, "opacity")).toBe("55%");
    for (const document of [source, reopened]) {
      expect([...document.GetSpzFrameFormats()]).toHaveLength(16);
      for (const [name, alpha] of [
        ["Frame14", 0],
        ["Frame15", 45],
        ["Frame16", 0],
      ] as const) {
        const items = frameItems(document, name);
        expect(getFillProperties(items).fillStyle).toBe(FillStyle.BITMAP);
        expect(getFillProperties(items).fillTransparency ?? 0).toBe(alpha);
        const bitmap = getBitmapFillItem(items);
        expect(bitmap?.GetName()).toBe("Sky");
        expect(bitmap?.GetGraphic()?.GetNativeData()).toEqual(png);
        expect(getBitmapMode(items)).toBe(BitmapMode.REPEAT);
        const geometry = getBitmapGeometry(items);
        expect(geometry?.positionX ?? 0).toBe(0);
        expect(geometry?.positionY ?? 0).toBe(0);
        expect(geometry?.offsetX ?? 0).toBe(0);
        expect(geometry?.offsetY ?? 0).toBe(0);
      }
    }
  } finally {
    reopened?.Dispose();
    source.Dispose();
  }
});

it("combines inherited frame bitmap geometry and shares a single package declaration", /** Checks alias mapping and independent properties through native items, Worker and ODT. @returns Completion. */ async () => {
  const archive = await DocumentArchive.open(new Uint8Array(readFileSync(fixture)));
  const png = await archive.readEntry(pngPath);
  const helper = new SvXMLGraphicHelper(
    new Map([[pngPath, { bytes: png, mediaType: "image/png" }]]),
  );
  const scope = `xmlns:office="${NS.office}" xmlns:text="${NS.text}" xmlns:style="${NS.style}" xmlns:draw="${NS.draw}" xmlns:xlink="${NS.xlink}" xmlns:svg="${NS.svg}"`;
  const styles = `<office:document-styles ${scope}><office:styles>
    <draw:fill-image draw:name="SkyAlias" draw:display-name="Sky Fill" xlink:href="${pngPath}"/>
    <style:style style:family="graphic" style:name="BitmapParent"><style:graphic-properties draw:fill="bitmap" draw:fill-image-name="SkyAlias" draw:fill-image-width="75%" draw:fill-image-ref-point="top-right" draw:fill-image-ref-point-x="-12%"/></style:style>
    </office:styles></office:document-styles>`;
  const content = `<office:document-content ${scope}><office:automatic-styles>
    <style:style style:family="graphic" style:name="Local" style:parent-style-name="BitmapParent"><style:graphic-properties draw:fill-image-height="2.54cm" draw:tile-repeat-offset="27% vertical" draw:opacity="55%" style:repeat="no-repeat"/></style:style>
    </office:automatic-styles><office:body><office:text><text:p>Anchor<draw:frame draw:name="Fly" draw:style-name="Local" text:anchor-type="paragraph" svg:width="3cm" svg:height="3cm"><draw:text-box><text:p>Frame content</text:p></draw:text-box></draw:frame></text:p></office:text></office:body></office:document-content>`;
  const original = importWriterXml(styles, content, metadata, undefined, {
    graphicHelper: helper,
  }).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  let collision: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(original)));
    const bytes = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const document of [original, worker, reopened]) {
      const items = frameItems(document, "Fly");
      expect(getBitmapMode(items)).toBe(BitmapMode.NO_REPEAT);
      const bitmap = getBitmapFillItem(items);
      expect(bitmap?.GetName()).toBe("Sky Fill");
      expect(bitmap?.GetGraphic()?.GetNativeData()).toEqual(png);
      expect(getBitmapGeometry(items)).toMatchObject({
        sizeX: -75,
        sizeY: 2540,
        point: RectanglePoint.RIGHT_TOP,
        positionX: -12,
        offsetY: 27,
      });
    }
    const output = await DocumentArchive.open(bytes);
    expect(await output.readTextEntry("styles.xml")).toContain('draw:display-name="Sky Fill"');
    const xml = await output.readTextEntry("content.xml");
    expect(xml).toContain('draw:fill-image-name="Sky_20_Fill"');
    expect(xml).toContain('draw:tile-repeat-offset="27% vertical"');
    expect(
      output.getEntryNames().filter(
        /** Counts reused resource streams. @param path - Package path. @returns Whether a raster. */
        (path) => path.startsWith("Pictures/"),
      ),
    ).toHaveLength(1);
    const fly = worker.GetSpzFrameFormats().FindFormatByName("Fly");
    assert(fly);
    const jpeg = new Uint8Array(
      readFileSync("../../vendor/libreoffice-reference/sw/qa/extras/unowriter/data/test.jpg"),
    );
    const replacement = new XFillBitmapItem(
      "Sky Fill",
      new Graphic(jpeg, "image/jpeg", new Size()),
    );
    try {
      fly.SetFormatAttr(replacement);
    } finally {
      replacement.Dispose();
    }
    collision = (await readOdtDocument(await writeOdtDocument(worker, metadata), metadata))
      .document;
    const alternate = getBitmapFillItem(frameItems(collision, "Fly"));
    expect(alternate?.GetName()).toBe("Sky Fill 1");
    expect(alternate?.GetGraphic()?.GetNativeData()).toEqual(jpeg);
  } finally {
    collision?.Dispose();
    reopened?.Dispose();
    worker?.Dispose();
    original.Dispose();
  }
});

it("converts legacy frame brushes and preserves DrawingLayer precedence", /** Checks compatible image placement, inline streams, RGB and opacity using native items after ODT and Worker. @returns Completion. */ async () => {
  const fixtureArchive = await DocumentArchive.open(new Uint8Array(readFileSync(fixture)));
  const png = await fixtureArchive.readEntry(pngPath);
  const helper = new SvXMLGraphicHelper(
    new Map([[pngPath, { bytes: png, mediaType: "image/png" }]]),
  );
  const ns = `xmlns:office="${NS.office}" xmlns:text="${NS.text}" xmlns:style="${NS.style}" xmlns:draw="${NS.draw}" xmlns:xlink="${NS.xlink}" xmlns:svg="${NS.svg}" xmlns:fo="${NS.fo}"`;
  const positioned = `<style:background-image xlink:href="${pngPath}" style:position="bottom right" style:repeat="no-repeat" draw:opacity="65%"/>`;
  const inline = `<style:background-image style:repeat="repeat"><office:binary-data>${encodeBase64(png)}</office:binary-data></style:background-image>`;
  const rules = [
    ["LegacyRaster", 'fo:background-color="#802010"', positioned],
    ["InlineRaster", "", inline],
    ["LegacyColor", 'fo:background-color="#102030" style:background-transparency="45%"', ""],
    [
      "ModernRaster",
      'draw:fill="bitmap" draw:fill-image-name="Sky" style:repeat="repeat" style:background-transparency="80%"',
      positioned,
    ],
    [
      "ModernSolid",
      'draw:fill="solid" draw:fill-color="#405060" style:background-transparency="45%"',
      positioned,
    ],
    ["TransparentSolid", 'draw:fill="solid" fo:background-color="transparent"', ""],
    ["LegacyRgbOnly", 'draw:fill="solid" fo:background-color="#102030"', ""],
  ] as const;
  const declaration = `<office:document-styles ${ns}><office:styles><draw:fill-image draw:name="Sky" xlink:href="${pngPath}"/></office:styles></office:document-styles>`;
  const automatic = rules
    .map(
      /** Renders independent authored graphic styles. @param rule - Style definition. @returns ODF style. */
      ([name, attrs, image]) =>
        `<style:style style:family="graphic" style:name="${name}"><style:graphic-properties ${attrs}>${image}</style:graphic-properties></style:style>`,
    )
    .join("");
  const frames = rules
    .map(
      /** Anchors a real Writer text box in the body. @param rule - Style definition. @returns Frame XML. */
      ([name]) =>
        `<draw:frame draw:name="${name}" draw:style-name="${name}" text:anchor-type="paragraph" svg:width="2cm" svg:height="2cm"><draw:text-box><text:p>${name}</text:p></draw:text-box></draw:frame>`,
    )
    .join("");
  const content = `<office:document-content ${ns}><office:automatic-styles>${automatic}</office:automatic-styles><office:body><office:text><text:p>${frames}</text:p></office:text></office:body></office:document-content>`;
  const source = importWriterXml(declaration, content, metadata, undefined, {
    graphicHelper: helper,
  }).document;
  let worker: SwDoc | undefined;
  let reopened: SwDoc | undefined;
  try {
    worker = decodeWriterDocument(structuredClone(encodeWriterDocument(source)));
    const bytes = await writeOdtDocument(worker, metadata);
    reopened = (await readOdtDocument(bytes, metadata)).document;
    for (const document of [source, worker, reopened]) {
      const raster = frameItems(document, "LegacyRaster");
      expect(getBitmapFillItem(raster)?.GetGraphic()?.GetNativeData()).toEqual(png);
      expect(getBitmapMode(raster)).toBe(BitmapMode.NO_REPEAT);
      expect(getBitmapGeometry(raster)?.point).toBe(RectanglePoint.RIGHT_BOTTOM);
      expect(getFillProperties(raster).fillTransparency).toBe(35);
      const tiled = frameItems(document, "InlineRaster");
      expect(getBitmapFillItem(tiled)?.GetGraphic()?.GetNativeData()).toEqual(png);
      expect(getBitmapMode(tiled)).toBe(BitmapMode.REPEAT);
      expect(getBitmapGeometry(tiled)?.point).toBe(RectanglePoint.LEFT_TOP);
      const modern = frameItems(document, "ModernRaster");
      expect(getBitmapFillItem(modern)?.GetName()).toBe("Sky");
      expect(getBitmapMode(modern)).toBe(BitmapMode.REPEAT);
      expect(getFillProperties(modern).fillTransparency ?? 0).toBe(0);
      expect(getFillProperties(frameItems(document, "LegacyColor"))).toEqual({
        fillStyle: FillStyle.SOLID,
        fillColor: 0x102030,
        fillTransparency: 45,
      });
      expect(getFillProperties(frameItems(document, "ModernSolid"))).toEqual({
        fillStyle: FillStyle.SOLID,
        fillColor: 0x405060,
        fillTransparency: 45,
      });
      expect(getFillProperties(frameItems(document, "TransparentSolid")).fillStyle).toBe(
        FillStyle.NONE,
      );
      expect(getFillProperties(frameItems(document, "LegacyRgbOnly"))).toMatchObject({
        fillStyle: FillStyle.NONE,
        fillColor: 0x102030,
      });
    }
    const output = await DocumentArchive.open(bytes);
    const xml = await output.readTextEntry("content.xml");
    expect(xml).toMatch(
      /style:background-image[^>]+style:position="bottom right" style:repeat="no-repeat" draw:opacity="65%"/u,
    );
    expect(xml).toContain('style:background-transparency="45%"');
  } finally {
    reopened?.Dispose();
    worker?.Dispose();
    source.Dispose();
  }
});
