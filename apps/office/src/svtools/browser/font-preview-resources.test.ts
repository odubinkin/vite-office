/** @fileoverview Browser preview metadata,actual source bytes,private rendering registrations and asynchronous selector disposal. */
import { RTL_TEXTENCODING_SYMBOL } from "../../sal/inc/rtl/textenc";
import { afterEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { Blob as NodeBlob } from "node:buffer";
import { FontList, type BrowserPhysicalFont } from "./font-list";
import { BrowserFontPreviewResources, getBrowserPreviewMetric } from "./font-preview-resources";
import { FontItalic as I, FontWeight as W } from "../../tools/inc/fontenum";
import { rememberBrowserFontFaceSource } from "../../vcl/browser/font-face-source";
import {
  isBrowserFontPreviewFace,
  rememberBrowserFontPreviewFace,
} from "../../vcl/browser/font-preview-registration";
const actual = new Uint8Array(readFileSync("public/fonts/truetype/opens___.ttf")).buffer;

/** Supplies an actual registered source identity and constructor bytes. @param family - Logical family. @param weight - Real CSS descriptor. @param style - Real CSS descriptor. @returns Physical record. */
function registered(family = "Face", weight = "400", style = "normal"): BrowserPhysicalFont {
  const face = { family, weight, style } as FontFace;
  rememberBrowserFontFaceSource(face, actual);
  return { kind: "registered", family, face };
}
/** Supplies an acquired local-font blob with optional opaque style metadata. @param bytes - Actual source bytes. @param style - Actual named style. @returns Physical record. */
function local(bytes: ArrayBuffer = actual, style?: string): BrowserPhysicalFont {
  return {
    kind: "local",
    family: "Local",
    data: {
      family: "Local",
      ...(style === undefined ? {} : { style }),
      blob: /** Returns supplied acquired bytes. @returns Source blob. */ async () =>
        new NodeBlob([bytes]) as unknown as Blob,
    },
  };
}
/** Creates an actual selector device-shaped font set and controllable FontFace load port. @param load - Optional real asynchronous boundary fixture. @returns Owner document and observable registrations. */
function device(
  load: () => Promise<unknown> = /** Completes a normal browser load. @returns Completion. */ async () =>
    undefined,
) {
  const installed = new Set<FontFace>();
  const add = vi.fn(
    /** Registers one actual private face. @param face - Real constructed identity. @returns Font set. */ (
      face: FontFace,
    ) => {
      installed.add(face);
      return installed;
    },
  );
  const remove = vi.fn(
    /** Removes only an owned face. @param face - Real private identity. @returns Whether removed. */ (
      face: FontFace,
    ) => installed.delete(face),
  );
  const constructed: FontFace[] = [];
  vi.stubGlobal(
    "FontFace",
    /** FontFace constructor/load protocol;not a font engine replacement. */ class {
      /** Retains the actual constructor packet;no glyph behavior is simulated. @param family - Private CSS family. @param source - Acquired file bytes. @returns Actual protocol fixture. */
      constructor(
        public family: string,
        public source: ArrayBuffer,
      ) {
        constructed.push(this as unknown as FontFace);
      }
      /** Crosses the actual load boundary fixture. @returns Same real protocol identity. */
      async load() {
        await load();
        return this;
      }
    },
  );
  const document_ = {
    characterSet: "UTF-8",
    fonts: { add, delete: remove },
  } as unknown as Document;
  return { document_, installed, add, remove, constructed };
}

afterEach(
  /** Restores the browser constructor boundary. @returns Nothing. */ () => vi.unstubAllGlobals(),
);

it("projects actual descriptor values and leaves unavailable native fields unknown", /** Covers all represented native weights and italic descriptors without parsing named local styles. @returns Nothing. */ () => {
  const weights = [
    ["normal", W.WEIGHT_NORMAL],
    ["bold", W.WEIGHT_BOLD],
    ["100", W.WEIGHT_THIN],
    ["200", W.WEIGHT_ULTRALIGHT],
    ["300", W.WEIGHT_LIGHT],
    ["350", W.WEIGHT_SEMILIGHT],
    ["400", W.WEIGHT_NORMAL],
    ["500", W.WEIGHT_MEDIUM],
    ["600", W.WEIGHT_SEMIBOLD],
    ["700", W.WEIGHT_BOLD],
    ["800", W.WEIGHT_ULTRABOLD],
    ["900", W.WEIGHT_BLACK],
    ["100 900", W.WEIGHT_DONTKNOW],
  ] as const;
  for (const [css, expected] of weights)
    expect(getBrowserPreviewMetric(registered("Face", css)).GetWeight()).toBe(expected);
  for (const [css, expected] of [
    ["normal", I.ITALIC_NONE],
    ["italic", I.ITALIC_NORMAL],
    ["oblique 12deg", I.ITALIC_OBLIQUE],
    ["unknown", I.ITALIC_DONTKNOW],
  ] as const)
    expect(getBrowserPreviewMetric(registered("Face", "400", css)).GetItalic()).toBe(expected);
  expect(getBrowserPreviewMetric(local(actual, "Bold Italic")).GetStyleName()).toBe("Bold Italic");
  const opaque = getBrowserPreviewMetric(local());
  expect(opaque.GetStyleName()).toBe("");
  expect(opaque.GetWeight()).toBe(W.WEIGHT_DONTKNOW);
  expect(opaque.GetItalic()).toBe(I.ITALIC_DONTKNOW);
  expect([opaque.GetFamilyType(), opaque.GetPitch()]).toEqual([0, 0]);
});

it("loads only the source-selected regular file,caches physical identity and cleans private registrations", /** Uses real bundled font bytes and the real native selector/map readers. @returns Completion. */ async () => {
  const d = device(),
    owner = new BrowserFontPreviewResources(d.document_),
    bold = registered("Face", "700"),
    regular = registered(),
    list = new FontList(["Face"], [bold, regular]);
  const first = owner.Get(list, "Face"),
    second = owner.Get(list, "Face");
  expect(first).toBe(second);
  const row = await first;
  expect(row?.metric.GetWeight()).toBe(W.WEIGHT_NORMAL);
  expect(row?.metric.GetFamilyName()).toBe("Face");
  expect(row?.face.characterMap?.IsDefaultMap()).toBe(false);
  expect(row?.face.capabilities).toBeDefined();
  expect(d.constructed).toHaveLength(1);
  expect(isBrowserFontPreviewFace(d.constructed[0] as FontFace)).toBe(true);
  expect(d.add).toHaveBeenCalledOnce();
  expect(row?.face.renderingFamily).toMatch(/^office-font-preview-/u);
  owner.dispose();
  expect(d.remove).toHaveBeenCalledWith(d.constructed[0]);
  expect(d.installed.size).toBe(0);
  expect(await owner.Get(list, "Face")).toBeUndefined();
});

it("keeps absent sources,collections,missing cmap and unsupported document encodings unknown", /** No invented face or implicit TTC index is introduced. @returns Completion. */ async () => {
  const d = device(),
    owner = new BrowserFontPreviewResources(d.document_);
  expect(await owner.Get(new FontList([]), "Missing")).toBeUndefined();
  const missing: BrowserPhysicalFont = {
    kind: "local",
    family: "Local",
    data: { family: "Local" },
  };
  expect(await owner.Get(new FontList(["Local"], [missing]), "Local")).toBeUndefined();
  for (const signature of [0x74746366, 0x10000]) {
    const bytes = new ArrayBuffer(12);
    new DataView(bytes).setUint32(0, signature);
    const face = local(bytes);
    expect(await owner.Get(new FontList(["Local"], [face]), "Local")).toBeUndefined();
  }
  const other = { ...d.document_, characterSet: "ISO-8859-1" } as unknown as Document;
  expect(
    await new BrowserFontPreviewResources(other).Get(
      new FontList(["Face"], [registered()]),
      "Face",
    ),
  ).toBeUndefined();
  expect(d.add).not.toHaveBeenCalled();
});

it("does not register or publish a face when disposal happens during source or FontFace loading", /** Both actual asynchronous boundaries respect the owning selector's lifetime. @returns Completion. */ async () => {
  let release: () => void = /** Initial unused source completion. @returns Nothing. */ () =>
    undefined;
  const sourceDone = new Promise<void>(
    /** Holds the actual source boundary. @param resolve - Completion callback. @returns Nothing. */ (
      resolve,
    ) => {
      release = resolve;
    },
  );
  const d = device(),
    owner = new BrowserFontPreviewResources(d.document_);
  const face: BrowserPhysicalFont = {
    kind: "local",
    family: "Held",
    data: {
      family: "Held",
      blob: /** Holds then returns actual acquired bytes. @returns Source blob. */ async () => {
        await sourceDone;
        return new NodeBlob([actual]) as unknown as Blob;
      },
    },
  };
  const pending = owner.Get(new FontList(["Held"], [face]), "Held");
  owner.dispose();
  release();
  expect(await pending).toBeUndefined();
  expect(d.constructed).toHaveLength(0);
  let loaded: () => void = /** Initial unused load completion. @returns Nothing. */ () => undefined;
  const loadDone = new Promise<void>(
    /** Holds private face loading. @param resolve - Completion callback. @returns Nothing. */ (
      resolve,
    ) => {
      loaded = resolve;
    },
  );
  const late = device(
      /** Waits for the controlled actual load boundary. @returns Completion. */ () => loadDone,
    ),
    second = new BrowserFontPreviewResources(late.document_);
  const result = second.Get(new FontList(["Face"], [registered()]), "Face");
  await Promise.resolve();
  await Promise.resolve();
  expect(late.constructed).toHaveLength(1);
  second.dispose();
  loaded();
  expect(await result).toBeUndefined();
  expect(late.add).not.toHaveBeenCalled();
});

it("excludes real private identities from subsequent inventories without interpreting names", /** A document face with a similar name remains a real visible family. @returns Completion. */ async () => {
  const privateFace = { family: "Hidden alias", status: "loaded" } as FontFace,
    ordinary = { family: "office-font-preview-visible", status: "loaded" } as FontFace;
  rememberBrowserFontPreviewFace(privateFace);
  expect(isBrowserFontPreviewFace(ordinary)).toBe(false);
  const list = await FontList.FromBrowser({
    document: { fonts: new Set([privateFace, ordinary]) },
  } as unknown as Window);
  expect(list.GetFontNames()).toEqual(["office-font-preview-visible"]);
});

/** Encodes a controlled standalone cmap boundary;not an installed-font fixture. @param version - Cmap version. @returns Minimal file bytes. */
function scalarFont(version: number): ArrayBuffer {
  const bytes = new ArrayBuffer(12 + 16 + 4 + 8 + 262),
    data = new DataView(bytes);
  data.setUint32(0, 0x10000);
  data.setUint16(4, 1);
  data.setUint32(12, 0x636d6170);
  data.setUint32(20, 28);
  data.setUint32(24, 274);
  data.setUint16(28, version);
  data.setUint16(30, 1);
  data.setUint16(32, 3);
  data.setUint16(34, 0);
  data.setUint32(36, 12);
  data.setUint16(42, 262);
  data.setUint8(40 + 6 + 65, 1);
  return bytes;
}

it("preserves explicit symbol/default-map values at the raw table boundary and absent OS2 capabilities", /** These synthetic files test byte/value projection with an accepting FontFace protocol port;they are not native installed-font evidence. @returns Completion. */ async () => {
  const d = device(),
    owner = new BrowserFontPreviewResources(d.document_);
  const symbol = local(scalarFont(0));
  const result = await owner.Get(new FontList(["Local"], [symbol]), "Local");
  expect(result?.metric.GetCharSet()).toBe(RTL_TEXTENCODING_SYMBOL);
  expect(result?.face.characterMap?.HasChar(65)).toBe(true);
  expect(result?.face.capabilities).toBeUndefined();
  const unknown = local(scalarFont(1));
  const fallback = await owner.Get(new FontList(["Local"], [unknown]), "Local");
  expect(fallback?.face.characterMap?.IsDefaultMap()).toBe(true);
  owner.dispose();
});

it("propagates actual load rejection and accepts the actual default document boundary", /** Failed private faces are never installed;the row controller owns readable fallback. @returns Completion. */ async () => {
  const d = device(
      /** Rejects at the real browser load boundary. @returns Rejection. */ async () => {
        throw new Error("bad font");
      },
    ),
    owner = new BrowserFontPreviewResources(d.document_);
  await expect(owner.Get(new FontList(["Face"], [registered()]), "Face")).rejects.toThrow(
    "bad font",
  );
  expect(d.add).not.toHaveBeenCalled();
  owner.dispose();
  const actualDefault = new BrowserFontPreviewResources();
  expect(await actualDefault.Get(new FontList([]), "Missing")).toBeUndefined();
  actualDefault.dispose();
});
