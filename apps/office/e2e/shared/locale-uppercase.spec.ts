/** @fileoverview Exercises actual locale uppercase kernel owners and native-JS counterexamples in Chromium using real shared values. */
import { expect, test } from "@playwright/test";
import cases from "../../src/unotools/source/i18n/native-uppercase-cases.json" with { type: "json" };
import { installKernelFixture } from "./kernel-fixture";

test("preserves native uppercase QA and locale differences in actual Chromium", /** Runs production kernel modules independently of any Calc UI substitute. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeLocaleUppercaseFixture", [
    { module: "src/unotools/inc/charclass.ts", names: ["uppercase"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
  ]);
  const observed = await page.evaluate(
    /** Uses actual shared constructors and original field operation. @param input - Source-derived fixtures. @returns Browser observations. */ (
      input,
    ) => {
      const native = Reflect.get(window, "OfficeLocaleUppercaseFixture");
      /** Constructs the actual shared value. @param value - Text. @returns Native value. */
      function unicode(value: string) {
        const units = new Uint16Array(value.length);
        for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
        return new native.OUString(units, units.length);
      }
      /** Executes the real operation over prepared original Locale. @param value - Text. @param language - Language. @returns Actual uppercase text. */
      function mapped(value: string, language: string): string {
        const lang = unicode(language),
          blank = new native.OUString(),
          locale = new native.Locale(lang, blank, blank),
          source = unicode(value);
        lang.dispose();
        blank.dispose();
        const result = native.uppercase(source, locale);
        let text = "";
        for (let i = 0; i < result.getLength(); i++)
          text += String.fromCharCode(result.getStr()[i]);
        result.dispose();
        source.dispose();
        locale.dispose();
        return text;
      }
      return {
        qa: input.nativeUppercaseCases.map(
          /** Replays a direct native uppercase assertion. @param row - Source fixture. @returns Mapped output. */ (
            row,
          ) => mapped(row[2] as string, row[1] as string),
        ),
        witnesses: input.nativeJsWitnesses.map(
          /** Records kernel and actual browser built-in outputs. @param row - Source witness. @returns Observation. */ (
            row,
          ) => ({
            language: row[0],
            source: row[1],
            mapped: mapped(row[1] as string, row[0] as string),
            js: (row[1] as string).toLocaleUpperCase(row[0] as string),
          }),
        ),
      };
    },
    cases,
  );
  expect(observed.qa).toEqual(
    cases.nativeUppercaseCases.map(
      /** Selects original native assertion. @param row - Fixture. @returns Expected result. */ (
        row,
      ) => row[3],
    ),
  );
  for (let i = 0; i < observed.witnesses.length; i++) {
    expect(observed.witnesses[i]?.mapped).toBe(cases.nativeJsWitnesses[i]?.[2]);
    expect(observed.witnesses[i]?.js).toBe(cases.nativeJsWitnesses[i]?.[3]);
    expect(observed.witnesses[i]?.js).not.toBe(observed.witnesses[i]?.mapped);
  }
  await test.info().attach("actual-browser-uppercase-observations", {
    body: JSON.stringify(observed, null, 2),
    contentType: "application/json",
  });
});
