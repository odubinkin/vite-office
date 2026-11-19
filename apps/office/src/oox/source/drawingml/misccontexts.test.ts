/** @fileoverview Native BlipContext package relationship and encoded image ownership. */
import { readFileSync } from "node:fs";
import { expect, it, vi } from "vitest";
import { DocumentArchive } from "../../../package/source/zippackage/document-archive";
import { XmlFilterBase } from "../core/xmlfilterbase";
import { GraphicHelper } from "../helper/graphichelper";
import { ZipStorage } from "../helper/zipstorage";
import { BlipContext } from "./misccontexts";

vi.setConfig({ testTimeout: 120_000 });

const fixtureRoot = "../../vendor/libreoffice-reference/sw/qa/extras/";

it.each([
  ["layout/data/testHeaderImageAlignment.docx", "image1.png", "image/png"],
  ["ooxmlexport/data/TestVMLData.docx", "image1.jpeg", "image/jpeg"],
])(
  "imports embedded header image bytes from %s",
  /** Checks owning fragment, encoded data and per-package cache while ignoring external targets. @param fixture - Pinned Writer test package. @param filename - Media basename. @param mediaType - Expected native image type. @returns Completion. */ async (
    fixture,
    filename,
    mediaType,
  ) => {
    const bytes = new Uint8Array(readFileSync(fixtureRoot + fixture));
    const archive = await DocumentArchive.open(bytes);
    const storage = await ZipStorage.openForImport(bytes, "writer");
    try {
      const filter = new XmlFilterBase(storage);
      const header = new BlipContext(filter, "word/header1.xml");
      const helper = filter.getGraphicHelper();
      expect(filter.getGraphicHelper()).toBe(helper);
      expect(
        await new BlipContext(filter, "word/nonexistent-header.xml").importEmbeddedGraphic("rId1"),
      ).toBeUndefined();
      const imagePath = "word/media/" + filename;
      expect(
        (await filter.importRelations("word/header1.xml")).getFragmentPathFromRelId("rId1"),
      ).toBe(imagePath);
      const [first, second] = await Promise.all([
        header.importEmbeddedGraphic("rId1"),
        header.importEmbeddedGraphic("rId1"),
      ]);
      const authored = await archive.readEntry(imagePath);
      expect(first?.mediaType).toBe(mediaType);
      const detached = first?.GetNativeData();
      expect(detached).toEqual(authored);
      detached?.fill(0);
      expect(first?.GetNativeData()).toEqual(authored);
      expect(second).toBe(first);
      expect(await helper.importEmbeddedGraphic(imagePath)).toBe(first);
      expect(await header.importEmbeddedGraphic("rId2")).toBeUndefined();
      expect(await helper.importEmbeddedGraphic("word/absent.jpg")).toBeUndefined();
      expect(await helper.importEmbeddedGraphic("word/document.xml")).toBeUndefined();
      expect(await helper.importEmbeddedGraphic("word/document.xml")).toBeUndefined();
    } finally {
      storage.dispose();
    }
  },
);

it("keeps the device-only constructor independent of any document storage", /** Checks the preexisting helper construction path. @returns Completion. */ async () => {
  const helper = new GraphicHelper(0, 100000);
  expect(helper.convertScreenPixelXToHmm(5)).toBe(0);
  expect(helper.convertScreenPixelYToHmm(5)).toBe(5);
  expect(await helper.importEmbeddedGraphic("word/media/image1.png")).toBeUndefined();
});

it("declines an empty internal picture stream", /** Exercises a real package stream without an encoded raster header. @returns Completion. */ async () => {
  const storage = new ZipStorage();
  try {
    storage.openOutputStream("word/media/empty.png", "image/png").closeOutput();
    const filter = new XmlFilterBase(storage);
    expect(
      await filter.getGraphicHelper().importEmbeddedGraphic("word/media/empty.png"),
    ).toBeUndefined();
  } finally {
    storage.dispose();
  }
});
