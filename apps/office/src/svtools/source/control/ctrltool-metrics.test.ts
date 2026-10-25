/** @fileoverview Native FontList face ordering and system-charset duplicate replacement over actual Font values and identities. */
import { expect, it } from "vitest";
import { Font } from "../../../vcl/source/font/font";
import { FontItalic as I, FontWeight as W } from "../../../tools/inc/fontenum";
import { compareFontListMetrics, insertFontListMetric, type FontListMetricEntry } from "./ctrltool";
import { FontList } from "../../browser/font-list";
import type { BrowserPhysicalFont } from "../../../vcl/browser/font-list";

/** Creates an explicit source metric value without parsing names or browser descriptors. @param weight - Original enum. @param italic - Original enum. @param style - Actual style name. @param charset - Actual encoding. @returns Actual Font value. */
function metric(weight: W, italic = I.ITALIC_NONE, style = "", charset = 1): Font {
  const font = new Font();
  font.SetWeight(weight);
  font.SetItalic(italic);
  font.SetStyleName(style);
  font.SetCharSet(charset);
  return font;
}

it("orders nonitalic before oblique/italic/unknown and normal before the remaining native weights", /** Checks exact ranks and both comparison directions. @returns Nothing. */ () => {
  const italics = [I.ITALIC_NONE, I.ITALIC_OBLIQUE, I.ITALIC_NORMAL, I.ITALIC_DONTKNOW];
  const weights = [
    W.WEIGHT_NORMAL,
    W.WEIGHT_DONTKNOW,
    W.WEIGHT_THIN,
    W.WEIGHT_ULTRALIGHT,
    W.WEIGHT_LIGHT,
    W.WEIGHT_SEMILIGHT,
    W.WEIGHT_MEDIUM,
    W.WEIGHT_SEMIBOLD,
    W.WEIGHT_BOLD,
    W.WEIGHT_ULTRABOLD,
    W.WEIGHT_BLACK,
  ];
  const ranks = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9];
  for (let i = 0; i < italics.length; ++i)
    for (let j = 0; j < italics.length; ++j)
      for (let w = 0; w < weights.length; ++w)
        for (let v = 0; v < weights.length; ++v)
          expect(
            Math.sign(
              compareFontListMetrics(
                metric(weights[w] as W, italics[i]),
                metric(weights[v] as W, italics[j]),
              ),
            ),
          ).toBe(Math.sign(i - j) || Math.sign((ranks[w] as number) - (ranks[v] as number)));
});

it("uses exact UTF16 style comparisons,including case,embedded NUL,prefix and supplementary units", /** Retains OUString comparison instead of locale/numeric/name heuristics. @returns Nothing. */ () => {
  for (const [first, second] of [
    ["A", "a"],
    ["A", "AA"],
    ["A\0B", "A\0C"],
    ["\ud800\udc00", "\ue000"],
    ["Style 10", "Style 2"],
  ] as const) {
    expect(
      compareFontListMetrics(
        metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, first),
        metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, second),
      ),
    ).toBe(-1);
    expect(
      compareFontListMetrics(
        metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, second),
        metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, first),
      ),
    ).toBe(1);
  }
});

it("inserts before/after actual rows and overwrites a duplicate only for the system charset", /** Preserves first identity on all other metric-equal records. @returns Nothing. */ () => {
  const rows: FontListMetricEntry<string>[] = [];
  const bold = { metric: metric(W.WEIGHT_BOLD), value: "bold" },
    normal = { metric: metric(W.WEIGHT_NORMAL), value: "normal" },
    thin = { metric: metric(W.WEIGHT_THIN), value: "thin" };
  for (const item of [bold, normal, thin]) insertFontListMetric(rows, item, 2);
  expect(
    rows.map(
      /** Reads retained opaque identity. @param row - Source row. @returns Identity. */ (row) =>
        row.value,
    ),
  ).toEqual(["normal", "thin", "bold"]);
  insertFontListMetric(
    rows,
    { metric: metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, "", 3), value: "other" },
    2,
  );
  expect(rows[0]?.value).toBe(normal.value);
  const system = { metric: metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, "", 2), value: "system" };
  insertFontListMetric(rows, system, 2);
  expect(rows[0]?.value).toBe(system.value);
  insertFontListMetric(
    rows,
    { metric: metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, "", 2), value: "second-system" },
    2,
  );
  expect(rows[0]?.value).toBe(system.value);
  insertFontListMetric(rows, { metric: metric(W.WEIGHT_NORMAL), value: "old-encoding" }, 2);
  expect(rows[0]?.value).toBe(system.value);
  expect(rows[1]?.value).toBe(thin.value);
  expect(rows[2]?.value).toBe(bold.value);
});

it("connects actual browser family records to native first-metric selection without disturbing inventory order", /** Requires actual metadata for every candidate and retains native alias lookup and charset replacement. @returns Nothing. */ () => {
  const bold: BrowserPhysicalFont = { kind: "local", family: "Face", data: { family: "Face" } },
    normal: BrowserPhysicalFont = { kind: "local", family: "FACE", data: { family: "FACE" } },
    system: BrowserPhysicalFont = { kind: "local", family: "Face", data: { family: "Face" } };
  const list = new FontList(["Face"], [bold, normal, system], [["Alias", "Face"]]);
  const metrics = new Map([
    [bold, metric(W.WEIGHT_BOLD)],
    [normal, metric(W.WEIGHT_NORMAL)],
    [system, metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, "", 2)],
  ]);
  expect(list.GetBrowserPreviewMetric("ALIAS:liga=0;Missing", metrics, 2)).toEqual({
    metric: metrics.get(system),
    value: system,
  });
  expect(list.GetBrowserFaces("Face")).toEqual([bold, normal, system]);
  expect(list.GetBrowserPreviewMetric("Missing;Face", metrics, 2)).toBeUndefined();
  metrics.delete(bold);
  expect(list.GetBrowserPreviewMetric("Face", metrics, 2)).toBeUndefined();
  expect(
    new FontList(["Fallback"]).GetBrowserPreviewMetric("Fallback", new Map(), 2),
  ).toBeUndefined();
});

it("preserves the SEMILIGHT/MEDIUM rank collision and duplicate removal WRITER083", /** Source weight normalization gives both enums rank5;the style name and charset rules still apply. @returns Nothing. */ () => {
  const semilight = metric(W.WEIGHT_SEMILIGHT),
    medium = metric(W.WEIGHT_MEDIUM);
  expect(compareFontListMetrics(semilight, medium)).toBe(0);
  const rows: FontListMetricEntry<string>[] = [];
  insertFontListMetric(rows, { metric: semilight, value: "semilight" }, 2);
  insertFontListMetric(rows, { metric: medium, value: "medium" }, 2);
  expect(rows).toHaveLength(1);
  expect(rows[0]?.value).toBe("semilight");
  medium.SetCharSet(2);
  insertFontListMetric(rows, { metric: medium, value: "medium-system" }, 2);
  expect(rows).toHaveLength(1);
  expect(rows[0]?.value).toBe("medium-system");
  medium.SetStyleName("Different");
  expect(compareFontListMetrics(semilight, medium)).not.toBe(0);
});

it("copies incoming metric values while retaining actual physical identity", /** Original ImplFontListFontMetric copies FontMetric;later caller changes cannot rewrite retained rows. @returns Nothing. */ () => {
  const font = metric(W.WEIGHT_NORMAL),
    value = { physical: "real identity" },
    rows: FontListMetricEntry<typeof value>[] = [];
  insertFontListMetric(rows, { metric: font, value }, 2);
  const retained = rows[0] as FontListMetricEntry<typeof value>;
  expect(retained.value).toBe(value);
  expect(retained.metric).not.toBe(font);
  font.SetWeight(W.WEIGHT_BOLD);
  font.SetStyleName("Changed");
  font.SetCharSet(2);
  expect(retained.metric.GetWeight()).toBe(W.WEIGHT_NORMAL);
  expect(retained.metric.GetStyleName()).toBe("");
  expect(retained.metric.GetCharSet()).toBe(1);
  insertFontListMetric(rows, { metric: metric(W.WEIGHT_NORMAL, I.ITALIC_NONE, "", 2), value }, 2);
  expect(rows[0]?.metric.GetCharSet()).toBe(2);
  expect(retained.metric.GetCharSet()).toBe(1);
});
