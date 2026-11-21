/** @fileoverview Original Writer page background fixture and native ODT fill round trips. */
import { readFileSync } from "node:fs";
import { assert, expect, it } from "vitest";
import {
  BitmapMode,
  cppu_detail_getUnoType_BitmapMode as bitmapModeType,
} from "../../../../offapi/com/sun/star/drawing/BitmapMode";
import {
  FillStyle,
  cppu_detail_getUnoType_FillStyle as fillStyleType,
} from "../../../../offapi/com/sun/star/drawing/FillStyle";
import { SvXMLGraphicHelper } from "../../../../xmloff/source/core/xmlgrhlp";
import {
  RectanglePoint,
  cppu_detail_getUnoType_RectanglePoint as pointType,
} from "../../../../offapi/com/sun/star/drawing/RectanglePoint";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { getBitmapMode, type XFillBitmapItem } from "../../../../svx/inc/xbtmpit";
import {
  XATTR_FILLBITMAP,
  XATTR_FILLSTYLE,
  XATTR_FILLCOLOR,
  XATTR_FILLTRANSPARENCE,
} from "../../../../svx/inc/xdef";
import type { XFillStyleItem } from "../../../../svx/inc/xfillit0";
import type { XFillColorItem } from "../../../../svx/inc/xflclit";
import type { XFillTransparenceItem } from "../../../../svx/inc/xfltrit";
import { DocumentArchive } from "../../../../package/source/zippackage/document-archive";
import { ODF_NAMESPACES } from "../../../../xmloff/source/core/xmltoken";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
import { getActivePageStory } from "../../core/layout/atrfrm";
import { SwXPageStyle } from "../../core/unocore/unostyle";
import { stringValue, unicode } from "../../core/unocore/unocrsrhelper";
import type { SwDoc } from "../../core/doc/doc";
import { importWriterXml } from "./xmlimp";
import { exportStylesXml } from "./xmlexp";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

const metadata = { title: "Page background" };
const fixturePath =
  "../../vendor/libreoffice-reference/sw/qa/extras/odfimport/data/PageBackground.odt";
const imagePath = "Pictures/100000000000005E0000005E71533790.png";

/** Reads a page geometry long through its native style. @param page - Property owner. @param name - Property name. @returns Value. */
function longProperty(page: SwXPageStyle, name: string): number {
  const key = unicode(name);
  const value = page.getPropertyValue(key);
  try {
    return value.get("sal_Int32") as number;
  } finally {
    key.dispose();
    value.dispose();
  }
}

/** Sets a native bitmap geometry long without retaining temporary UNO values. @param page - Property owner. @param name - Name. @param number - Value. @returns Nothing. */
function setLongProperty(page: SwXPageStyle, name: string, number: number): void {
  const key = unicode(name);
  const value = new Any([number], "sal_Int32");
  try {
    page.setPropertyValue(key, value);
  } finally {
    key.dispose();
    value.dispose();
  }
}

it("preserves page and story bitmap geometry and resolves both repeat axes only at ODT export", /** Covers metric and percent dimensions, legacy anchors, typed UNO and worker preservation. @returns Completion. */ async () => {
  const source = await DocumentArchive.open(new Uint8Array(readFileSync(fixturePath)));
  const image = await source.readEntry(imagePath);
  const helper = new SvXMLGraphicHelper(
    new Map([[imagePath, { bytes: image, mediaType: "image/png" }]]),
  );
  const xml = `<office:document-styles xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:draw="${ODF_NAMESPACES.draw}" xmlns:xlink="${ODF_NAMESPACES.xlink}" xmlns:text="${ODF_NAMESPACES.text}"><office:styles><draw:fill-image draw:name="Sky" xlink:href="${imagePath}"/></office:styles><office:automatic-styles><style:page-layout style:name="pm"><style:page-layout-properties fo:page-width="8in" fo:page-height="11in" draw:fill="bitmap" draw:fill-image-name="Sky" style:repeat="repeat" draw:fill-image-width="75%" draw:fill-image-height="2.54cm" draw:fill-image-ref-point="top-right" draw:fill-image-ref-point-x="-12%" draw:fill-image-ref-point-y="19%" draw:tile-repeat-offset="37% horizontal"/><style:header-style><style:header-footer-properties><style:background-image xlink:href="${imagePath}" style:position="20% 50%" style:repeat="no-repeat"/></style:header-footer-properties></style:header-style></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm"><style:header><text:p>Header</text:p></style:header></style:master-page></office:master-styles></office:document-styles>`;
  const document = importWriterXml(xml, undefined, metadata, undefined, {
    graphicHelper: helper,
  }).document;
  const style = new SwXPageStyle(document, document.GetPageDesc(0));
  try {
    expect(longProperty(style, "FillBitmapSizeX")).toBe(-75);
    expect(longProperty(style, "FillBitmapSizeY")).toBe(2540);
    expect(longProperty(style, "FillBitmapPositionOffsetX")).toBe(-12);
    expect(longProperty(style, "FillBitmapPositionOffsetY")).toBe(19);
    setLongProperty(style, "FillBitmapOffsetY", 64);
    for (const [name, expected] of [
      ["FillBitmapRectanglePoint", RectanglePoint.RIGHT_TOP],
      ["HeaderFillBitmapRectanglePoint", RectanglePoint.LEFT_BOTTOM],
    ] as const) {
      const key = unicode(name);
      const point = style.getPropertyValue(key);
      try {
        const actual: [number] = [-1];
        expect(point.extract(actual, pointType)).toBe(true);
        expect(actual[0]).toBe(expected);
      } finally {
        key.dispose();
        point.dispose();
      }
    }
    const copy = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    const copiedStyle = new SwXPageStyle(copy, copy.GetPageDesc(0));
    try {
      expect(longProperty(copiedStyle, "FillBitmapOffsetX")).toBe(37);
      expect(longProperty(copiedStyle, "FillBitmapOffsetY")).toBe(64);
      const archive = await DocumentArchive.open(await writeOdtDocument(copy, metadata));
      const styles = await archive.readTextEntry("styles.xml");
      expect(styles).toContain('draw:fill-image-width="75%"');
      expect(styles).toContain('draw:fill-image-height="2.54cm"');
      expect(styles).toContain('draw:tile-repeat-offset="37% horizontal"');
      expect(styles).toContain('style:position="bottom left"');
      setLongProperty(copiedStyle, "FillBitmapOffsetX", 0);
      const bytes = await writeOdtDocument(copy, metadata);
      const vertical = await DocumentArchive.open(bytes);
      expect(await vertical.readTextEntry("styles.xml")).toContain(
        'draw:tile-repeat-offset="64% vertical"',
      );
      const reopened = (await readOdtDocument(bytes, metadata)).document;
      const reopenedStyle = new SwXPageStyle(reopened, reopened.GetPageDesc(0));
      try {
        expect(longProperty(reopenedStyle, "FillBitmapOffsetX")).toBe(0);
        expect(longProperty(reopenedStyle, "FillBitmapOffsetY")).toBe(64);
      } finally {
        reopenedStyle.dispose();
        reopened.Dispose();
      }
    } finally {
      copiedStyle.dispose();
      copy.Dispose();
    }
  } finally {
    style.dispose();
    document.Dispose();
  }
});

/** Checks both original page styles and compares the native images. @param document - Writer document. @returns Embedded image bytes. */
function checkBitmapPages(document: SwDoc): Uint8Array {
  const images = ["Standard", "OldStandard"].map(
    /** Reads the original fill assertions from the actual page frame. @param name - Page style. @returns Embedded graphic. */
    (name) => {
      const page = document.FindPageDesc(name);
      assert(page);
      const items = page.GetMaster().GetAttrSet();
      expect((items.Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.BITMAP);
      expect(getBitmapMode(items)).toBe(BitmapMode.REPEAT);
      const item = items.Get(XATTR_FILLBITMAP) as XFillBitmapItem;
      expect(item.GetName()).toBe("Sky");
      const image = item.GetGraphic();
      assert(image);
      const style = new SwXPageStyle(document, page);
      try {
        for (const [name, expected, type] of [
          ["FillStyle", FillStyle.BITMAP, fillStyleType],
          ["FillBitmapMode", BitmapMode.REPEAT, bitmapModeType],
        ] as const) {
          const key = unicode(name);
          const value = style.getPropertyValue(key);
          try {
            const actual: [number] = [-1];
            expect(value.extract(actual, type)).toBe(true);
            expect(actual[0]).toBe(expected);
          } finally {
            key.dispose();
            value.dispose();
          }
        }
        const key = unicode("FillBitmapName");
        const value = style.getPropertyValue(key);
        try {
          expect(stringValue(value)).toBe("Sky");
        } finally {
          key.dispose();
          value.dispose();
        }
      } finally {
        style.dispose();
      }
      return image.GetNativeData();
    },
  );
  expect(images[1]).toEqual(images[0]);
  assert(images[0]);
  return images[0];
}

it("ports testPageBackground with modern and legacy fills in the pinned ODT", /** Checks style, name, mode and identical embedded bytes through Worker storage and reopening. @returns Completion. */ async () => {
  const fixture = new Uint8Array(readFileSync(fixturePath));
  const { document } = await readOdtDocument(fixture, metadata);
  try {
    const source = await DocumentArchive.open(fixture);
    const original = await source.readEntry(imagePath);
    expect(checkBitmapPages(document)).toEqual(original);
    const copy = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    try {
      expect(checkBitmapPages(copy)).toEqual(original);
      const bytes = await writeOdtDocument(copy, metadata);
      const archive = await DocumentArchive.open(bytes);
      const xml = await archive.readTextEntry("styles.xml");
      const dom = new DOMParser().parseFromString(xml, "application/xml");
      expect(dom.getElementsByTagNameNS(ODF_NAMESPACES.draw, "fill-image")).toHaveLength(1);
      expect(dom.getElementsByTagNameNS(ODF_NAMESPACES.style, "background-image")).toHaveLength(2);
      const picture = archive
        .getEntryNames()
        .filter(
          /** Selects packaged images. @param path - Entry. @returns Whether a picture. */ (path) =>
            path.startsWith("Pictures/"),
        );
      expect(picture).toHaveLength(1);
      assert(picture[0]);
      expect(await archive.readEntry(picture[0])).toEqual(original);
      const reopened = (await readOdtDocument(bytes, metadata)).document;
      try {
        expect(checkBitmapPages(reopened)).toEqual(original);
      } finally {
        reopened.Dispose();
      }
    } finally {
      copy.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("lets legacy placement override a modern bitmap mode and retains unused images", /** Checks native compatibility precedence and named image lifetime. @returns Completion. */ async () => {
  const fixture = await DocumentArchive.open(new Uint8Array(readFileSync(fixturePath)));
  const file = await fixture.readEntry(imagePath);
  const helper = new SvXMLGraphicHelper(
    new Map([[imagePath, { bytes: file, mediaType: "image/png" }]]),
  );
  const xml = `<office:document-styles xmlns:office="${ODF_NAMESPACES.office}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" xmlns:draw="${ODF_NAMESPACES.draw}" xmlns:xlink="${ODF_NAMESPACES.xlink}"><office:styles><draw:fill-image draw:name="Sky" xlink:href="${imagePath}"/><draw:fill-image draw:name="Unused" xlink:href="${imagePath}"/></office:styles><office:automatic-styles><style:page-layout style:name="pm"><style:page-layout-properties fo:page-width="8in" fo:page-height="11in" draw:fill="bitmap" draw:fill-image-name="Sky" style:repeat="stretch"><style:background-image xlink:href="${imagePath}" draw:opacity="75%"/></style:page-layout-properties></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm"/></office:master-styles></office:document-styles>`;
  const document = importWriterXml(xml, undefined, metadata, undefined, {
    graphicHelper: helper,
  }).document;
  try {
    const items = document.GetPageDesc(0).GetMaster().GetAttrSet();
    expect(getBitmapMode(items)).toBe(BitmapMode.REPEAT);
    expect((items.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue()).toBe(25);
    const copy = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    try {
      expect(copy.GetBitmapTable().has("Unused")).toBe(true);
      const reopened = (await readOdtDocument(await writeOdtDocument(copy, metadata), metadata))
        .document;
      try {
        expect(reopened.GetBitmapTable().has("Unused")).toBe(true);
        expect(getBitmapMode(reopened.GetPageDesc(0).GetMaster().GetAttrSet())).toBe(
          BitmapMode.REPEAT,
        );
      } finally {
        reopened.Dispose();
      }
    } finally {
      copy.Dispose();
    }
  } finally {
    document.Dispose();
  }
});

it("imports legacy page color and preserves independent modern header fill", /** Checks the real page and header frame collections plus XML export. @returns Nothing. */ () => {
  const ns = Object.entries(ODF_NAMESPACES)
    .map(
      /** Declares available ODF namespaces. @param entry - Namespace entry. @returns XML attribute. */ ([
        prefix,
        value,
      ]) => `xmlns:${prefix}="${value}"`,
    )
    .join(" ");
  const xml = `<office:document-styles ${ns}><office:styles/><office:automatic-styles><style:page-layout style:name="pm"><style:page-layout-properties fo:page-width="8in" fo:page-height="11in" fo:background-color="#102030"/><style:header-style><style:header-footer-properties draw:fill="solid" draw:fill-color="#405060" draw:opacity="65%"/></style:header-style></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm"><style:header><text:p>Header</text:p></style:header></style:master-page></office:master-styles></office:document-styles>`;
  const { document } = importWriterXml(xml, undefined, metadata);
  try {
    const master = document.GetPageDesc(0).GetMaster();
    const header = getActivePageStory(master, true);
    assert(header);
    for (const [frame, color] of [
      [master, 0x102030],
      [header, 0x405060],
    ] as const) {
      const items = frame.GetAttrSet();
      expect((items.Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.SOLID);
      expect((items.Get(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue().toInt32()).toBe(color);
    }
    expect(
      (header.GetAttrSet().Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue(),
    ).toBe(35);
    const styles = exportStylesXml(document);
    expect(styles).toContain('draw:fill-color="#102030"');
    expect(styles).toContain('draw:fill-color="#405060" draw:opacity="65%"');
  } finally {
    document.Dispose();
  }
});
