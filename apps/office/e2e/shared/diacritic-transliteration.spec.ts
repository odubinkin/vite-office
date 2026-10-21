/** @fileoverview Actual Chromium module folding, scalar fallback and native UTF16 source offsets. */
import { expect, test } from "@playwright/test";
import cases from "../../src/i18npool/source/transliteration/native-diacritics-cases.json" with { type: "json" };
import { installKernelFixture } from "./kernel-fixture";
test("preserves actual diacritic module offsets and original whole-string differences in Chromium", /** Verifies original module behavior with actual runtime values. @param fixtures - Actual test input or browser fixtures. @returns Assertion completion or browser observations. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeDiacriticFixture", [
    {
      module: "src/i18npool/source/transliteration/ignoreDiacritics_CTL.ts",
      names: ["ignoreDiacritics_CTL"],
    },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    { module: "src/cppu/inc/com/sun/star/uno/Sequence.ts", names: ["Sequence"] },
  ]);
  const observed = await page.evaluate(
    /** Verifies original module behavior with actual runtime values. @param input - Actual test input or browser fixtures. @returns Assertion completion or browser observations. */ (
      input,
    ) => {
      const native = Reflect.get(window, "OfficeDiacriticFixture"),
        owner = new native.ignoreDiacritics_CTL(),
        Integers = native.Sequence.specialize("sal_Int32", 4),
        offset = new Integers();
      /** Constructs actual source value. @param text - Text. @returns Native value. */
      function u(text: string) {
        const units = new Uint16Array(text.length);
        for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
        return new native.OUString(units, units.length);
      }
      /** Observes actual source result. @param value - Native owner. @returns Text. */
      function result(value: InstanceType<typeof native.OUString>): string {
        let text = "";
        for (let i = 0; i < value.getLength(); i++) text += String.fromCharCode(value.getStr()[i]);
        value.dispose();
        return text;
      }
      try {
        const rows = [];
        for (const row of input) {
          const source = u(row[0] as string);
          try {
            const text = result(owner.folding(source, row[1], row[2], offset)),
              positions = [];
            for (let i = 0; i < offset.getLength(); i++) positions.push(offset.operatorIndex(i)[0]);
            rows.push([text, positions]);
          } finally {
            source.dispose();
          }
        }
        const jamo = u("가"),
          pair = u("😀"),
          broken = u("\ud800é\udc00");
        try {
          return {
            rows,
            wholeJamo: result(owner.transliterateString2String(jamo, 0, 2)),
            halfPair: result(owner.transliterateString2String(pair, 0, 1)),
            broken: result(owner.folding(broken, 0, 4, offset)),
            scalarFallback: owner.transliterateChar2Char(0xfa6c),
            scalarString: result(owner.transliterateChar2String(0xfa6c)),
          };
        } finally {
          broken.dispose();
          pair.dispose();
          jamo.dispose();
        }
      } finally {
        offset.dispose();
        owner.dispose();
      }
    },
    cases.folding,
  );
  expect(observed.rows).toEqual(
    cases.folding.map(
      /** Verifies original module behavior with actual runtime values. @param row - Actual test input or browser fixtures. @returns Assertion completion or browser observations. */ (
        row,
      ) => [row[3], row[4]],
    ),
  );
  expect(observed.wholeJamo).toBe("가");
  expect(observed.halfPair).toBe("\ud83d");
  expect(observed.broken).toBe("\ud800e\udc00");
  expect(observed.scalarFallback).toBe(0xfa6c);
  expect(observed.scalarString).toBe("𤋮");
  await test.info().attach("actual-diacritic-observations", {
    body: JSON.stringify(observed, null, 2),
    contentType: "application/json",
  });
});
