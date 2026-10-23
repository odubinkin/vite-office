/** @fileoverview Actual browser physical-record identity and source-byte ownership, without pretending fixture bytes are installed fonts. */
import { Blob as NodeBlob } from "node:buffer";
import { expect, it, vi } from "vitest";
import { FontList, readBrowserPhysicalFont } from "./font-list";
import { rememberBrowserFontFaceSource, readBrowserFontFaceSource } from "./font-face-source";

it("retains distinct registered faces and approved local data without flattening physical records to family names", /** Checks actual record identity, CSS descriptors and lazy Local Font Access reads. @returns Completion. */ async () => {
  const regular = {
    family: '"Package Serif"',
    style: "normal",
    weight: "400",
    status: "loaded",
  } as FontFace;
  const bold = {
    family: '"Package Serif"',
    style: "normal",
    weight: "700",
    status: "loaded",
  } as FontFace;
  const blob = vi.fn(
    /** Returns source bytes through the actual local-data method binding. @param this - Native FontData receiver. @returns Byte blob. */ async function blob(this: {
      postscriptName?: string;
    }) {
      expect(this.postscriptName).toBe("PackageSerif-Regular");
      return new NodeBlob([new Uint8Array([3, 4, 5])]) as unknown as Blob;
    },
  );
  const local = {
    family: "package serif",
    fullName: "Package Serif Regular",
    postscriptName: "PackageSerif-Regular",
    style: "Regular",
    blob,
  };
  const boundary = {
    document: { fonts: new Set([regular, bold]) },
    queryLocalFonts:
      /** Returns approved physical records. @returns Local font records. */ async () => [local],
  } as unknown as Window;
  const list = await FontList.FromBrowser(boundary);
  expect(list.GetFontNames()).toEqual(["Package Serif"]);
  const faces = list.GetBrowserFaces("PACKAGE SERIF");
  expect(faces).toEqual([
    { kind: "registered", family: "Package Serif", face: regular },
    { kind: "registered", family: "Package Serif", face: bold },
    { kind: "local", family: "package serif", data: local },
  ]);
  expect(list.GetBrowserFaces("Missing Font")).toEqual([]);
  expect(blob).not.toHaveBeenCalled();
  expect(await readBrowserPhysicalFont(faces[0] as (typeof faces)[number])).toBeUndefined();
  expect(
    new Uint8Array(
      (await readBrowserPhysicalFont(faces[2] as (typeof faces)[number])) as ArrayBuffer,
    ),
  ).toEqual(new Uint8Array([3, 4, 5]));
  expect(blob).toHaveBeenCalledOnce();
});

it("retains constructor bytes by actual face identity and returns independent buffers", /** Checks real byte-value isolation without native lifetime or name-based caches. @returns Completion. */ async () => {
  const face = { family: "Document Face" } as FontFace;
  const other = { family: "Document Face" } as FontFace;
  const source = new Uint8Array([1, 2, 3]).buffer;
  rememberBrowserFontFaceSource(face, source);
  new Uint8Array(source)[0] = 9;
  const first = readBrowserFontFaceSource(face) as ArrayBuffer;
  expect(new Uint8Array(first)).toEqual(new Uint8Array([1, 2, 3]));
  new Uint8Array(first)[1] = 9;
  expect(
    new Uint8Array(
      (await readBrowserPhysicalFont({
        kind: "registered",
        family: "Document Face",
        face,
      })) as ArrayBuffer,
    ),
  ).toEqual(new Uint8Array([1, 2, 3]));
  expect(readBrowserFontFaceSource(other)).toBeUndefined();
  expect(new FontList(["Missing Font"]).GetBrowserFaces("Missing Font")).toEqual([]);
});

it("leaves names-only sources absent and propagates actual blob acquisition failures", /** Avoids substituting guessed glyph metadata when physical data is unavailable. @returns Completion. */ async () => {
  expect(
    await readBrowserPhysicalFont({
      kind: "local",
      family: "Names only",
      data: { family: "Names only" },
    }),
  ).toBeUndefined();
  await expect(
    readBrowserPhysicalFont({
      kind: "local",
      family: "Denied",
      data: {
        family: "Denied",
        blob: /** Represents a source whose browser permission was revoked after enumeration. @returns Rejected read. */ async () => {
          throw new Error("revoked");
        },
      },
    }),
  ).rejects.toThrow("revoked");
});
