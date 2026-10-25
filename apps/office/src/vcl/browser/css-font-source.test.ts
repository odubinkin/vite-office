/** @fileoverview CSSOM source resolution and physical-byte reads, with conservative ambiguity and conditional-state contracts. */
import { afterEach, expect, it, vi } from "vitest";
import { getSingleCssFontUrl, getCssFontFaceSources } from "./css-font-source";
import { FontList, readBrowserPhysicalFont } from "../../svtools/browser/font-list";
const styles: HTMLStyleElement[] = [];
afterEach(
  /** Removes actual connected CSSOM fixtures and platform instrumentation. @returns Nothing. */ () => {
    for (const style of styles.splice(0)) style.remove();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  },
);
/** Connects an actual stylesheet to the current document. @param css - CSS input. @returns Actual sheet. */
function sheet(css: string): CSSStyleSheet {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
  styles.push(style);
  // jsdom drops font-face-only descriptors such as src. Supply the standard
  // descriptor port explicitly; the Chromium witness checks real CSSOM values.
  const descriptors = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(
    /** Builds one explicit font-face descriptor fixture. @param match - Literal rule body. @returns Declared values. */
    (match) =>
      new Map(
        (match[1] as string)
          .split(";")
          .filter(Boolean)
          .map(
            /** Retains descriptor values exactly as written in this fixture. @param declaration - Declaration. @returns Name/value. */
            (declaration) => {
              const colon = declaration.indexOf(":");
              return [declaration.slice(0, colon).trim(), declaration.slice(colon + 1).trim()];
            },
          ),
      ),
  );
  let index = 0;
  /** Supplies the standard descriptor port on jsdom's actual connected rule tree. @param rules - Actual parsed hierarchy. @returns Nothing. */
  function supply(rules: CSSRuleList): void {
    for (const rule of rules) {
      if (rule.type === 5) {
        const values = descriptors[index++] as Map<string, string>;
        vi.spyOn((rule as CSSFontFaceRule).style, "getPropertyValue").mockImplementation(
          /** Represents standard font-face CSSOM descriptor serialization. @param name - Descriptor. @returns Declared value. */
          (name) => values.get(name) ?? "",
        );
      } else if ("cssRules" in rule) supply((rule as CSSGroupingRule).cssRules);
    }
  }
  supply((style.sheet as CSSStyleSheet).cssRules);
  return style.sheet as CSSStyleSheet;
}
/** Supplies a registered face protocol with actual descriptors and controlled load completion. @param family - Family descriptor. @param weight - CSS weight. @returns Physical face boundary. */
function face(family: string, weight = "400"): FontFace {
  const value = {
    family,
    style: "normal",
    weight,
    stretch: "normal",
    unicodeRange: "U+0-10FFFF",
    status: "unloaded",
    load: vi.fn(),
  };
  value.load.mockResolvedValue(value);
  return value as unknown as FontFace;
}

it("reads CSSOM string escapes and leaves unsupported source choices unknown", /** Checks URLs and format qualifications without selecting a guessed fallback candidate. @returns Nothing. */ () => {
  expect(
    getSingleCssFontUrl(
      'url("../fonts/A\\20 B.ttf") format("truetype")',
      "https://example.test/css/a.css",
    )?.href,
  ).toBe("https://example.test/fonts/A%20B.ttf");
  expect(
    getSingleCssFontUrl("url('a.otf') format('opentype')", "https://example.test/")?.pathname,
  ).toBe("/a.otf");
  expect(getSingleCssFontUrl('url("a.ttf")', "https://example.test/")?.pathname).toBe("/a.ttf");
  for (const source of [
    'local("A")',
    'url("a.ttf"), url("b.ttf")',
    'url("a.woff2") format("woff2")',
    'url("a.ttf") tech(variations)',
  ])
    expect(getSingleCssFontUrl(source, document.baseURI)).toBeUndefined();
  expect(getSingleCssFontUrl('url("http://[")', document.baseURI)).toBeUndefined();
});

it("matches distinct registered faces to actual connected CSS declarations and retains lazy byte acquisition", /** Uses real CSSOM and FontList, never a second manually maintained family registry. @returns Completion. */ async () => {
  sheet(
    '@font-face { font-family: "Actual Serif"; src: url("/fonts/regular.ttf") format("truetype"); font-weight: normal; } @font-face { font-family: "Actual Serif"; src: url("/fonts/bold.otf") format("opentype"); font-weight: 700; }',
  );
  const regular = face('"Actual Serif"'),
    bold = face('"Actual Serif"', "bold");
  const fetch = vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3]).buffer),
  });
  vi.stubGlobal("fetch", fetch);
  const boundary = {
    document: {
      fonts: new Set([regular, bold]),
      styleSheets: document.styleSheets,
      baseURI: document.baseURI,
      defaultView: window,
    },
    queryLocalFonts: /** Returns no OS records. @returns Records. */ async () => [],
  } as unknown as Window;
  const list = await FontList.FromBrowser(boundary),
    records = list.GetBrowserFaces("actual serif");
  expect(records).toHaveLength(2);
  expect(records[0]).toMatchObject({
    sourceUrl: new URL("/fonts/regular.ttf", document.baseURI).href,
  });
  expect(records[1]).toMatchObject({
    sourceUrl: new URL("/fonts/bold.otf", document.baseURI).href,
  });
  expect(fetch).not.toHaveBeenCalled();
  expect(
    new Uint8Array(
      (await readBrowserPhysicalFont(records[0] as (typeof records)[number])) as ArrayBuffer,
    ),
  ).toEqual(new Uint8Array([1, 2, 3]));
  expect(regular.load).toHaveBeenCalledOnce();
  expect(fetch).toHaveBeenCalledWith(new URL("/fonts/regular.ttf", document.baseURI).href, {
    credentials: "same-origin",
  });
  fetch.mockResolvedValueOnce({ ok: false, status: 404 });
  await expect(readBrowserPhysicalFont(records[1] as (typeof records)[number])).rejects.toThrow(
    "404",
  );
});

it("does not match duplicate descriptors, opaque source choices or foreign-origin files", /** Preserves unknown data instead of assigning another registered face's glyph metadata. @returns Nothing. */ () => {
  sheet(
    '@font-face { font-family: "Duplicate"; src: url("/a.ttf"); } @font-face { font-family: "Duplicate"; src: url("/b.ttf"); } @font-face { font-family: "Foreign"; src: url("https://foreign.test/a.ttf"); } @font-face { font-family: "Local"; src: local("Local"); } @font-face { font-family: "Face duplicate"; src: url("/a.ttf"); }',
  );
  const sources = getCssFontFaceSources(document, [
    face("Duplicate"),
    face("Foreign"),
    face("Local"),
    face("Face duplicate"),
    face("Face duplicate"),
    face("Absent"),
  ]);
  expect(sources.size).toBe(0);
});

it("uses active media/supports groups and excludes disabled and opaque sheets", /** Exercises browser CSSOM condition and access boundaries independently of font bytes. @returns Nothing. */ () => {
  vi.stubGlobal(
    "matchMedia",
    /** Supplies actual conditional-state results for this layout fixture. @param media - Query. @returns Match result. */ (
      media: string,
    ) => ({ matches: media === "screen" }),
  );
  vi.stubGlobal("CSS", {
    supports:
      /** Supplies browser support-query results. @param condition - Query. @returns Whether supported. */ (
        condition: string,
      ) => condition.includes("grid"),
  });
  const active = sheet(
    '@media screen { @font-face { font-family: "Media active"; src: url("/a.ttf"); } } @media print { @font-face { font-family: "Media inactive"; src: url("/b.ttf"); } } @supports (display: grid) { @font-face { font-family: "Supports active"; src: url("/c.ttf"); font-style: italic; font-weight: 600; font-stretch: condensed; unicode-range: U+0-FF; } } @supports (display: unknown) { @font-face { font-family: "Supports inactive"; src: url("/d.ttf"); } }',
  );
  const disabled = sheet('@font-face { font-family: "Disabled"; src: url("/d.ttf"); }');
  disabled.disabled = true;
  const opaque = {
    /** Represents an inaccessible cross-origin CSSOM sheet. @returns Never. */
    get cssRules(): CSSRuleList {
      throw new DOMException("opaque", "SecurityError");
    },
  } as CSSStyleSheet;
  const medium = face("Media active"),
    supported = {
      ...face("Supports active", "600"),
      style: "italic",
      stretch: "condensed",
      unicodeRange: "U+0-FF",
    } as FontFace;
  const boundary = {
    styleSheets: [active, disabled, opaque],
    adoptedStyleSheets: [active],
    baseURI: document.baseURI,
    defaultView: window,
  } as unknown as Document;
  const sources = getCssFontFaceSources(boundary, [
    medium,
    supported,
    face("Media inactive"),
    face("Supports inactive"),
    face("Disabled"),
  ]);
  expect([...sources.keys()]).toEqual([medium, supported]);
});

it("tracks import bases and uses only actual accessible active imported and adopted sheets", /** Exercises original CSSOM hierarchy and separate stylesheet source bases using explicit platform-protocol fixtures. @returns Nothing. */ () => {
  const child = sheet('@font-face { font-family: "Imported"; src: url("relative.ttf"); }');
  Object.defineProperty(child, "href", {
    value: new URL("/assets/fonts.css", document.baseURI).href,
  });
  const imported = {
    cssRules: [
      { type: 3, styleSheet: child, media: { mediaText: "all" } },
      { type: 3, styleSheet: null, media: { mediaText: "" } },
      { type: 3, styleSheet: child, media: { mediaText: "print" } },
      { type: 1 },
    ],
    media: { mediaText: "" },
  } as unknown as CSSStyleSheet;
  const inactive = { media: { mediaText: "print" }, cssRules: [] } as unknown as CSSStyleSheet;
  const f = face("Imported");
  const boundary = {
    styleSheets: [imported, inactive],
    baseURI: document.baseURI,
    defaultView: null,
  } as unknown as Document;
  expect(getCssFontFaceSources(boundary, [f]).get(f)).toBe(
    new URL("/assets/relative.ttf", document.baseURI).href,
  );
});
