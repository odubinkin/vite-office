/** @fileoverview Runs the production generic configured-font binding against actual Chromium FontFaceSet/FontFace and bundled font bytes. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("prepares Writer fonts before mount and shares native candidate matching with Calc roles", /** Verifies real platform availability, serialization, loading and live deletion without a fake physical-font service. @param fixtures - Browser fixture. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/writer");
  await expect(page.getByRole("textbox", { name: "Writer document text" })).toBeVisible();
  await installKernelFixture(page, "OfficeConfiguredFontFixture", [
    {
      module: "src/vcl/browser/default-font-device.ts",
      names: ["createBrowserDefaultFontDevice", "createDefaultFontLocale"],
    },
    { module: "src/unotools/inc/fontdefs.ts", names: ["DefaultFontType"] },
  ]);
  const evidence = await page.evaluate(
    /** Exercises the actual browser font backend and shared Calc role. @returns Observable platform/owner results. */ async () => {
      const native = Reflect.get(window, "OfficeConfiguredFontFixture");
      const loadedBefore = [...document.fonts]
        .filter(
          /** Selects successfully prepared platform faces. @param face - Real face. @returns Loaded state. */ (
            face,
          ) => face.status === "loaded",
        )
        .map(
          /** Records serialized platform family names. @param face - Face. @returns Family descriptor. */ (
            face,
          ) => face.family,
        );
      const iframe = document.createElement("iframe");
      document.body.append(iframe);
      const host = iframe.contentDocument;
      if (host === null) throw Error("Missing isolated font host");
      const device = native.createBrowserDefaultFontDevice(host),
        locale = native.createDefaultFontLocale("en-US");
      const bytes = await (await fetch("/fonts/truetype/LiberationSans-Regular.ttf")).arrayBuffer();
      const alias = "ＬＩＢＥＲＡＴＩＯＮ SANS",
        face = new FontFace(alias, 'url("/fonts/truetype/LiberationSans-Regular.ttf")');
      host.fonts.add(face);
      const missingCheck = host.fonts.check('12px "not-an-installed-office-family-2973"');
      const before = device.getDefaultFont(native.DefaultFontType.LATIN_SPREADSHEET, locale);
      const prepared = await device.prepareDefaultFont(
        native.DefaultFontType.LATIN_SPREADSHEET,
        locale,
      );
      const after = device.getDefaultFont(native.DefaultFontType.LATIN_SPREADSHEET, locale);
      host.fonts.delete(face);
      const deleted = device.getDefaultFont(native.DefaultFontType.LATIN_SPREADSHEET, locale);
      const quoted = new FontFace('Liberation "Sans"', bytes.slice(0));
      host.fonts.add(quoted);
      const quotedName = await device.prepareDefaultFont(
        native.DefaultFontType.LATIN_SPREADSHEET,
        locale,
      );
      host.fonts.delete(quoted);
      const broken = new FontFace("Liberation Sans", new Uint8Array([0, 1, 2]).buffer),
        later = new FontFace("Arimo", bytes.slice(0));
      await broken.loaded.catch(
        /** Consumes the deliberately invalid platform font rejection. @returns Nothing. */ () =>
          undefined,
      );
      host.fonts.add(broken);
      host.fonts.add(later);
      const laterName = await device.prepareDefaultFont(
        native.DefaultFontType.LATIN_SPREADSHEET,
        locale,
      );
      const result = {
        loadedBefore,
        missingCheck,
        before,
        prepared,
        after,
        deleted,
        serializedFamily: face.family,
        status: face.status,
        quotedDescriptor: quoted.family,
        quotedName,
        brokenStatus: broken.status,
        laterName,
      };
      locale.dispose();
      iframe.remove();
      return result;
    },
  );
  expect(
    evidence.loadedBefore.some(
      /** Finds prepared serif family. @param name - Descriptor. @returns Presence. */ (name) =>
        name.includes("Liberation Serif"),
    ),
  ).toBe(true);
  expect(
    evidence.loadedBefore.some(
      /** Finds prepared fixed family. @param name - Descriptor. @returns Presence. */ (name) =>
        name.includes("Liberation Mono"),
    ),
  ).toBe(true);
  expect(evidence.missingCheck).toBe(true);
  expect(evidence.before).toBeUndefined();
  expect(evidence.prepared).toBe("ＬＩＢＥＲＡＴＩＯＮ SANS");
  expect(evidence.after).toBe(evidence.prepared);
  expect(evidence.deleted).toBeUndefined();
  expect(evidence.status).toBe("loaded");
  expect(evidence.quotedName).toBe('Liberation "Sans"');
  expect(evidence.brokenStatus).toBe("error");
  expect(evidence.laterName).toBe("Arimo");
  await test.info().attach("actual-configured-font-evidence", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
});
