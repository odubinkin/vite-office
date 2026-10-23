/** @fileoverview Real Chromium CSSOM and same-origin font-byte witness over production Writer/Calc pages; not a dropdown raster-parity certificate. */
import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
/** Actual repository exports used by the isolated browser witness. */
type SourceExports = typeof import("../../src/svtools/browser/font-list");
for (const app of ["writer", "calc"]) {
  test(`${app} actual registered CSS font sources`, /** Checks actual registered face identity, CSS serialization and byte reads without app test globals. @param fixtures - Actual Chromium page. @param testInfo - Source evidence output. @returns Completion. */ async ({
    page,
  }, testInfo) => {
    await page.goto(`/${app}`);
    await installKernelFixture(page, "BrowserFontSources", [
      {
        module: "src/svtools/browser/font-list.ts",
        names: ["FontList", "readBrowserPhysicalFont", "readBrowserFontCapabilities"],
      },
    ]);
    const result = await page.evaluate(
      /** Runs the actual bundled repository adapter against real browser FontFaces and CSSOM. @returns Bounded source observations. */ async () => {
        const api = (globalThis as unknown as { BrowserFontSources: SourceExports })
          .BrowserFontSources;
        const list = await api.FontList.FromBrowser();
        const base = list.GetBrowserFaces("Liberation Serif");
        const feature = list.GetBrowserFaces("LIBERATION SERIF:liga=0;Missing");
        const alternate = list.GetBrowserFaces("Liberation Serif;Missing:liga=0");
        const nativeLookup = {
          count: base.length,
          featureSame:
            feature.length === base.length &&
            feature.every(
              /** Checks the actual retained physical identity,not only name equality. @param face - Actual record. @param index - Position. @returns Identity match. */ (
                face,
                index,
              ) => face === base[index],
            ),
          alternateSame:
            alternate.length === base.length &&
            alternate.every(
              /** Checks source first-family resolution against the actual original records. @param face - Actual record. @param index - Position. @returns Identity match. */ (
                face,
                index,
              ) => face === base[index],
            ),
          missing: list.GetBrowserFaces("Missing;Liberation Serif").length,
        };
        const registered = list
          .GetFontNames()
          .flatMap(
            /** Collects actual registered records. @param name - Real family. @returns Registered records. */ (
              name,
            ) =>
              list
                .GetBrowserFaces(name)
                .filter(
                  /** Excludes OS names from the bundled-CSS witness. @param font - Actual physical record. @returns Whether registered. */ (
                    font,
                  ) => font.kind === "registered",
                ),
          );
        const sources = registered.filter(
          /** Counts established CSS sources only. @param font - Registered record. @returns Whether known. */ (
            font,
          ) => "sourceUrl" in font,
        );
        const samples = [];
        for (const family of ["Liberation Serif", "OpenSymbol", "Noto Sans Arabic"]) {
          const record = registered.find(
            /** Selects an actual normal face with an established CSS source. @param font - Actual record. @returns Match. */ (
              font,
            ) =>
              font.family === family &&
              font.kind === "registered" &&
              (font.face.weight === "400" || font.face.weight === "normal"),
          );
          if (record === undefined) throw new Error(`Missing actual face: ${family}`);
          const bytes = await api.readBrowserPhysicalFont(record);
          if (bytes === undefined) throw new Error(`Missing physical source: ${family}`);
          const capabilities = await api.readBrowserFontCapabilities(record);
          samples.push({
            unicodeCoverage: capabilities?.oUnicodeRange?.size,
            codePageCoverage: capabilities?.oCodePageRange?.size,
            family,
            bytes: bytes.byteLength,
            signature: [...new Uint8Array(bytes, 0, 4)],
            loaded: record.kind === "registered" && record.face.status === "loaded",
          });
        }
        return {
          nativeLookup,
          registered: registered.length,
          known: sources.length,
          unresolved: registered
            .filter(
              /** Identifies unresolved registered descriptors for evidence. @param font - Record. @returns Whether unresolved. */ (
                font,
              ) => !("sourceUrl" in font),
            )
            .map(
              /** Projects source identity without claiming missing glyph data. @param font - Record. @returns Family. */ (
                font,
              ) => font.family,
            ),
          samples,
        };
      },
    );
    const evidence = testInfo.outputPath("actual-css-font-sources.json");
    await writeFile(evidence, JSON.stringify(result, null, 2));
    await testInfo.attach("actual-css-font-sources.json", {
      path: evidence,
      contentType: "application/json",
    });
    expect(result.registered).toBeGreaterThan(100);
    expect(result.nativeLookup.count).toBeGreaterThan(0);
    expect(result.nativeLookup.featureSame).toBe(true);
    expect(result.nativeLookup.alternateSame).toBe(true);
    expect(result.nativeLookup.missing).toBe(0);
    expect(result.known).toBe(result.registered);
    expect(result.unresolved).toEqual([]);
    for (const sample of result.samples) {
      expect(sample.bytes).toBeGreaterThan(1000);
      expect(sample.loaded).toBe(true);
      expect(sample.unicodeCoverage).toBeGreaterThan(0);
      expect(sample.codePageCoverage).toBeGreaterThanOrEqual(0);
      expect([
        [0, 1, 0, 0],
        [79, 84, 84, 79],
      ]).toContainEqual(sample.signature);
    }
  });
}
