/** @fileoverview Actual Chromium contextual folding,embedded-NUL lengths and native locale catalog values/fallback. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("preserves original context transforms and ordered locale catalog values in Chromium", /** Loads actual production values and modules. @param fixtures - Browser fixture. @returns Acceptance completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeContextCatalogFixture", [
    {
      module: "src/i18npool/source/transliteration/ignoreIandEfollowedByYa_ja_JP.ts",
      names: ["ignoreIandEfollowedByYa_ja_JP"],
    },
    {
      module: "src/i18npool/source/transliteration/ignoreKiKuFollowedBySa_ja_JP.ts",
      names: ["ignoreKiKuFollowedBySa_ja_JP"],
    },
    {
      module: "src/i18npool/source/transliteration/ignoreIterationMark_ja_JP.ts",
      names: ["ignoreIterationMark_ja_JP"],
    },
    {
      module: "src/i18npool/source/transliteration/ignoreProlongedSoundMark_ja_JP.ts",
      names: ["ignoreProlongedSoundMark_ja_JP"],
    },
    {
      module: "src/i18npool/source/localedata/localedata.ts",
      names: ["getLocaleTransliterations"],
    },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
    { module: "src/cppu/inc/com/sun/star/uno/Sequence.ts", names: ["Sequence"] },
  ]);
  const observed = await page.evaluate(
    /** Executes actual modules and reads actual UTF16 sequence values. @returns Browser observations. */ () => {
      const native = Reflect.get(window, "OfficeContextCatalogFixture"),
        Integers = native.Sequence.specialize("sal_Int32", 4),
        offset = new Integers();
      /** Constructs native source text. @param text - UTF16 text. @returns Owner. */
      function u(text: string) {
        const units = new Uint16Array(text.length);
        for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
        return new native.OUString(units, units.length);
      }
      /** Reads actual borrowed text. @param value - Native owner/reference. @returns Text. */
      function text(value: InstanceType<typeof native.OUString>): string {
        let output = "";
        for (let i = 0; i < value.getLength(); i++)
          output += String.fromCharCode(value.getStr()[i]);
        return output;
      }
      const rows = [];
      try {
        for (const [name, input] of [
          ["ignoreIandEfollowedByYa_ja_JP", "キヤ"],
          ["ignoreKiKuFollowedBySa_ja_JP", "クサ"],
          ["ignoreIterationMark_ja_JP", "かゞゝ"],
          ["ignoreProlongedSoundMark_ja_JP", "ンーー"],
        ]) {
          const owner = new native[name as string](),
            source = u("x" + input + "z");
          let output;
          try {
            output = owner.folding(source, 1, (input as string).length, offset);
            const positions = [];
            for (let i = 0; i < offset.getLength(); i++) positions.push(offset.operatorIndex(i)[0]);
            rows.push([text(output), output.getLength(), positions]);
          } finally {
            output?.dispose();
            source.dispose();
            owner.dispose();
          }
        }
        const language = u("ja"),
          country = u("ZZ"),
          empty = u(""),
          locale = new native.Locale(language, country, empty);
        language.dispose();
        country.dispose();
        empty.dispose();
        const list = native.getLocaleTransliterations(locale),
          names = [];
        try {
          for (let i = 0; i < list.getLength(); i++)
            names.push(text(native.OUString.unacquired(list.operatorIndex(i))));
        } finally {
          list.dispose();
          locale.dispose();
        }
        return { rows, names };
      } finally {
        offset.dispose();
      }
    },
  );
  expect(observed.rows).toEqual([
    ["キア", 2, [1, 2]],
    ["キサ", 2, [1, 2]],
    ["かがが", 3, [1, 2, 3]],
    ["ン\0ー", 3, [1, 2, 3]],
  ]);
  expect(observed.names).toHaveLength(28);
  expect(observed.names.slice(0, 4)).toEqual([
    "HALFWIDTH_FULLWIDTH",
    "FULLWIDTH_HALFWIDTH",
    "KATAKANA_HIRAGANA",
    "HIRAGANA_KATAKANA",
  ]);
  expect(observed.names.slice(-3)).toEqual([
    "ignoreProlongedSoundMark_ja_JP",
    "ignoreMiddleDot_ja_JP",
    "ignoreSpace_ja_JP",
  ]);
  await test.info().attach("actual-context-and-catalog-observations", {
    body: JSON.stringify(observed, null, 2),
    contentType: "application/json",
  });
});
