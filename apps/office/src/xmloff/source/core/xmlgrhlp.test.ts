/** @fileoverview ODF embedded raster resource identity and local-only graphic relations. */
import { expect, it } from "vitest";
import { isEmbeddedRaster, SvXMLGraphicHelper } from "./xmlgrhlp";

it("stores encoded raster assets under stable Pictures paths", /** Checks the supported native raster extensions and resource cache. @returns Nothing. */ () => {
  const helper = new SvXMLGraphicHelper();
  const bytes = Uint8Array.of(0xff, 0xd8, 0xff, 0xe0);
  const mediaType = "image/jpeg";
  const path = helper.saveGraphic({ bytes, mediaType });
  expect(path).toMatch(/^Pictures\/[0-9a-f]+\.jpg$/u);
  expect(helper.saveGraphic({ bytes: bytes.slice(), mediaType })).toBe(path);
  expect(helper.getEntries().size).toBe(1);
  expect(helper.loadGraphicByURL("./" + path)?.bytes).toEqual(bytes);
  expect(isEmbeddedRaster("image/png")).toBe(true);
  expect(isEmbeddedRaster("image/svg+xml")).toBe(false);
  expect(
    /** Attempts an unrepresented encoding. @returns Image path or throws. */ () =>
      helper.saveGraphic({ bytes, mediaType: "image/gif" }),
  ).toThrow("cannot store");
  expect(
    /** Attempts an empty native payload. @returns Image path or throws. */ () =>
      helper.saveGraphic({ bytes: new Uint8Array(), mediaType }),
  ).toThrow("cannot store");
});

it("uses package-relative URLs and recognizes percent-escaped entry names", /** Confirms package-only reads for external, missing and malformed references. @returns Nothing. */ () => {
  const image = { bytes: Uint8Array.of(137, 80, 78, 71), mediaType: "image/png" };
  const helper = new SvXMLGraphicHelper(new Map([["Pictures/image one.png", image]]));
  expect(helper.loadGraphicByURL("./Pictures/image%20one.png")).toBe(image);
  expect(helper.loadGraphicByURL("Pictures/%")).toBeUndefined();
  expect(helper.loadGraphicByURL("Pictures/missing.png")).toBeUndefined();
  expect(helper.loadGraphicByURL("/Pictures/image one.png")).toBeUndefined();
  expect(helper.loadGraphicByURL("file:///Pictures/image one.png")).toBeUndefined();
});

it("keeps the original resource when its generated path is already occupied", /** Exercises picture storage collisions without overwriting the earlier package entry. @returns Nothing. */ () => {
  const graphic = { bytes: Uint8Array.of(137, 80, 78, 71), mediaType: "image/png" };
  const existing = { ...graphic, bytes: Uint8Array.of(137, 80, 78, 72) };
  const path = new SvXMLGraphicHelper().saveGraphic(graphic);
  const helper = new SvXMLGraphicHelper(new Map([[path, existing]]));
  const escaped = helper.saveGraphic(graphic);
  expect(escaped).not.toBe(path);
  expect(helper.loadGraphicByURL(path)).toBe(existing);
  expect(helper.loadGraphicByURL(escaped)).toBe(graphic);
});
