/** @fileoverview Actual Chromium Canvas paint from real Writer style preview items;script data is explicit and this is not a live dropdown or native raster-parity certificate. */
import { writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
/** Actual source-owned exports used by this isolated device witness. */
type SourceExports = typeof import("../../src/sw/browser/composition/writer-module") &
  typeof import("../../src/sw/source/uibase/app/docstyle") &
  typeof import("../../src/svx/source/tbxctrls/tbcontrl.stylepreview") &
  typeof import("../../src/svx/source/tbxctrls/tbcontrl.stylerender") &
  typeof import("../../src/vcl/browser/style-preview-device") &
  typeof import("../../src/vcl/source/font/font") &
  typeof import("../../src/tools/inc/gen") &
  typeof import("../../src/tools/inc/mapunit") &
  typeof import("../../src/tools/inc/fontenum") &
  typeof import("../../src/editeng/inc/editids") &
  typeof import("../../src/svl/inc/languageoptions") &
  typeof import("../../src/o3tl/inc/unit_conversion");
test("actual Canvas style paint from real Writer preview items", /** Measures and paints actual style fonts on a production page using separately bundled repository exports. @param fixtures - Chromium page. @param testInfo - Local witness artifacts. @returns Completion. */ async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on(
    "pageerror",
    /** Collects actual browser exceptions. @param error - Browser error. @returns Nothing. */ (
      error,
    ) => {
      errors.push(error.message);
    },
  );
  page.on(
    "console",
    /** Collects actual console errors without suppressing font or layout failures. @param message - Browser message. @returns Nothing. */ (
      message,
    ) => {
      if (message.type() === "error") errors.push(message.text());
    },
  );
  await page.goto("/writer");
  await installKernelFixture(page, "WriterStylePaint", [
    {
      module: "src/sw/browser/composition/writer-module.tsx",
      names: ["createWriterDocumentSession"],
    },
    {
      module: "src/sw/source/uibase/app/docstyle.ts",
      names: ["getParagraphStyleItemSetForPreview"],
    },
    {
      module: "src/svx/source/tbxctrls/tbcontrl.stylepreview.ts",
      names: ["setStylePreviewFontName", "setStylePreviewFontStyle", "setStylePreviewFontSize"],
    },
    {
      module: "src/svx/source/tbxctrls/tbcontrl.stylerender.ts",
      names: ["calcStylePreviewBounds", "drawStylePreviewEntry"],
    },
    { module: "src/vcl/browser/style-preview-device.ts", names: ["BrowserStylePreviewDevice"] },
    { module: "src/vcl/source/font/font.ts", names: ["Font"] },
    { module: "src/tools/inc/gen.ts", names: ["Rectangle", "Size"] },
    { module: "src/tools/inc/mapunit.ts", names: ["MapUnit"] },
    { module: "src/tools/inc/fontenum.ts", names: ["FontWeight"] },
    {
      module: "src/editeng/inc/editids.ts",
      names: [
        "SID_ATTR_CHAR_FONT",
        "SID_ATTR_CHAR_FONTHEIGHT",
        "SID_ATTR_CHAR_POSTURE",
        "SID_ATTR_CHAR_WEIGHT",
      ],
    },
    { module: "src/svl/inc/languageoptions.ts", names: ["SvtScriptType"] },
    { module: "src/o3tl/inc/unit_conversion.ts", names: ["convert", "Length"] },
  ]);
  const result = await page.evaluate(
    /** Uses actual document/style/value/device owners;the supplied Latin ScriptInfo is an explicit analyzer fixture. @returns Source values and real host measurements. */ async () => {
      const api = (globalThis as unknown as { WriterStylePaint: SourceExports }).WriterStylePaint;
      const session = api.createWriterDocumentSession(),
        doc = session.docShell.GetDoc();
      const stylesBefore = doc.GetTextFormatColls().length;
      const canvas = document.createElement("canvas");
      canvas.width = 360;
      canvas.height = 80;
      canvas.setAttribute("data-testid", "style-device-witness");
      canvas.setAttribute("aria-label", "Actual Writer style Canvas device witness");
      canvas.style.cssText =
        "position:fixed;right:8px;bottom:8px;z-index:99999;background:white;border:1px solid #999";
      document.body.append(canvas);
      const context = canvas.getContext("2d");
      if (context === null) throw new Error("Missing actual Canvas device");
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
      const ui = new api.Font();
      ui.SetFamilyName("system-ui");
      ui.SetFontHeight(14);
      ui.SetWeight(api.FontWeight.WEIGHT_NORMAL);
      const device = new api.BrowserStylePreviewDevice(context, ui, "#202020");
      const observations = [];
      try {
        for (const [index, id] of ["heading-1", "heading-4"].entries()) {
          const items = api.getParagraphStyleItemSetForPreview(doc, id);
          if (items === undefined) throw new Error(`Missing actual builtin ${id}`);
          const value = new api.Font();
          api.setStylePreviewFontStyle(
            items,
            api.SID_ATTR_CHAR_POSTURE,
            api.SID_ATTR_CHAR_WEIGHT,
            value,
          );
          if (!api.setStylePreviewFontName(items, api.SID_ATTR_CHAR_FONT, value))
            throw new Error("Missing native font item");
          if (
            !api.setStylePreviewFontSize(
              items,
              api.SID_ATTR_CHAR_FONTHEIGHT,
              value,
              api.MapUnit.MapTwip,
              /** Actual source integer unit conversion at the CSS pixel device boundary. @param size - Native twip geometry. @returns Pixel geometry. */ (
                size,
              ) =>
                new api.Size(
                  Number(api.convert(BigInt(size.Width()), api.Length.twip, api.Length.px)),
                  Number(api.convert(BigInt(size.Height()), api.Length.twip, api.Length.px)),
                ),
            )
          )
            throw new Error("Missing native height item");
          device.SetFont(value);
          const cssFont = context.font;
          await document.fonts.load(cssFont);
          device.SetFont(ui);
          const name = index === 0 ? "Heading 1" : "Heading 4";
          const changes = [
            { scriptType: api.SvtScriptType.LATIN, changePos: name.length, textWidth: 0 },
          ];
          const fonts = { latin: value };
          const bounds = api.calcStylePreviewBounds(device, name, changes, fonts);
          api.drawStylePreviewEntry(
            device,
            new api.Rectangle(0, index * 40, 359, index * 40 + 29),
            bounds,
            name,
            changes,
            fonts,
          );
          observations.push({
            id,
            family: value.GetFamilyName(),
            height: value.GetFontHeight(),
            weight: value.GetWeight(),
            cssFont,
            advance: changes[0]?.textWidth,
            bounds: [bounds.Left(), bounds.Top(), bounds.Right(), bounds.Bottom()],
          });
        }
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let darkPixels = 0;
        for (let i = 0; i < pixels.length; i += 4)
          if (
            (pixels[i] as number) < 128 &&
            (pixels[i + 1] as number) < 128 &&
            (pixels[i + 2] as number) < 128
          )
            darkPixels++;
        return {
          observations,
          darkPixels,
          fontRestored: device.GetFont().Equals(ui),
          styleTableStable: doc.GetTextFormatColls().length === stylesBefore,
        };
      } finally {
        session.Close();
      }
    },
  );
  expect(result.darkPixels).toBeGreaterThan(100);
  expect(result.fontRestored).toBe(true);
  expect(result.styleTableStable).toBe(true);
  expect(result.observations[0]?.height).toBe(24);
  expect(result.observations[0]?.weight).toBe(8);
  for (const value of result.observations) {
    expect(value.advance).toBeGreaterThan(0);
    expect(value.bounds[3]).toBeGreaterThan(0);
    expect(value.family.length).toBeGreaterThan(0);
  }
  await writeFile(
    testInfo.outputPath("style-preview-device.json"),
    JSON.stringify(result, null, 2),
  );
  await page
    .getByTestId("style-device-witness")
    .screenshot({ path: testInfo.outputPath("style-preview-device.png") });
  expect(errors).toEqual([]);
});
