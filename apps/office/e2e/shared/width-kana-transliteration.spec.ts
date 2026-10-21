/** @fileoverview Actual Chromium width/kana/size/traditional module behavior and original UTF16 offset quirks. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";
test("preserves width stages and kana/size/traditional source behavior in Chromium", /** Loads real production exports in the test-only bundler. @param fixtures - Browser fixture. @returns Acceptance completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeWidthKanaFixture", [
    {
      module: "src/i18npool/source/transliteration/fullwidthToHalfwidth.ts",
      names: [
        "fullwidthToHalfwidth",
        "FULLWIDTHKATAKANA_HALFWIDTHKATAKANA",
        "FULLWIDTH_HALFWIDTH_LIKE_ASC",
      ],
    },
    {
      module: "src/i18npool/source/transliteration/halfwidthToFullwidth.ts",
      names: [
        "halfwidthToFullwidth",
        "HALFWIDTHKATAKANA_FULLWIDTHKATAKANA",
        "HALFWIDTH_FULLWIDTH_LIKE_JIS",
      ],
    },
    { module: "src/i18npool/source/transliteration/ignoreKana.ts", names: ["ignoreKana"] },
    {
      module: "src/i18npool/source/transliteration/ignoreSize_ja_JP.ts",
      names: ["ignoreSize_ja_JP"],
    },
    {
      module: "src/i18npool/source/transliteration/ignoreTraditionalKanji_ja_JP.ts",
      names: ["ignoreTraditionalKanji_ja_JP"],
    },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    { module: "src/cppu/inc/com/sun/star/uno/Sequence.ts", names: ["Sequence"] },
  ]);
  const observed = await page.evaluate(
    /** Exercises real modules without substituting a mapping backend. @returns Original outputs and offsets. */ () => {
      const native = Reflect.get(window, "OfficeWidthKanaFixture"),
        Integers = native.Sequence.specialize("sal_Int32", 4),
        offset = new Integers();
      /** Constructs actual shared source values. @param text - Text. @returns Owner. */
      function u(text: string) {
        const units = new Uint16Array(text.length);
        for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
        return new native.OUString(units, units.length);
      }
      /** Reads and releases native output. @param value - Owner. @returns Text. */
      function result(value: InstanceType<typeof native.OUString>): string {
        let text = "";
        for (let i = 0; i < value.getLength(); i++) text += String.fromCharCode(value.getStr()[i]);
        value.dispose();
        return text;
      }
      const rows = [];
      try {
        for (const name of [
          "fullwidthToHalfwidth",
          "FULLWIDTHKATAKANA_HALFWIDTHKATAKANA",
          "FULLWIDTH_HALFWIDTH_LIKE_ASC",
          "halfwidthToFullwidth",
          "HALFWIDTHKATAKANA_FULLWIDTHKATAKANA",
          "HALFWIDTH_FULLWIDTH_LIKE_JIS",
        ]) {
          const full = name.startsWith("fullwidth") || name.startsWith("FULLWIDTH"),
            owner = new native[name](),
            source = u(full ? "xＡガあz" : "xxAｶﾞｳﾞz");
          try {
            const text = result(owner.transliterate(source, full ? 1 : 2, full ? 3 : 5, offset)),
              positions = [];
            for (let i = 0; i < offset.getLength(); i++) positions.push(offset.operatorIndex(i)[0]);
            rows.push([name, text, positions]);
          } finally {
            source.dispose();
            owner.dispose();
          }
        }
        const kana = new native.ignoreKana(),
          size = new native.ignoreSize_ja_JP(),
          traditional = new native.ignoreTraditionalKanji_ja_JP(),
          source = u("あア");
        try {
          return {
            rows,
            kana: result(kana.folding(source, 0, 2, offset)),
            sizeSmall: size.transliterateChar2Char(0x3041),
            sizeLarge: size.transliterateChar2Char(0x3042),
            bom: traditional.transliterateChar2Char(0xfeff),
            commentedOut: traditional.transliterateChar2Char(0x5b9d),
          };
        } finally {
          source.dispose();
          traditional.dispose();
          size.dispose();
          kana.dispose();
        }
      } finally {
        offset.dispose();
      }
    },
  );
  expect(observed.rows).toEqual([
    ["fullwidthToHalfwidth", "Aｶﾞあ", [1, 2, 2, 3]],
    ["FULLWIDTHKATAKANA_HALFWIDTHKATAKANA", "Ａｶﾞあ", [1, 2, 2, 3]],
    ["FULLWIDTH_HALFWIDTH_LIKE_ASC", "Aｶﾞあ", [1, 2, 2, 3]],
    ["halfwidthToFullwidth", "Ａガヴ", [0, 2, 4]],
    ["HALFWIDTHKATAKANA_FULLWIDTHKATAKANA", "Aガヴ", [0, 2, 4]],
    ["HALFWIDTH_FULLWIDTH_LIKE_JIS", "Ａガウ゛", [0, 2, 3, 4]],
  ]);
  expect([
    observed.kana,
    observed.sizeSmall,
    observed.sizeLarge,
    observed.bom,
    observed.commentedOut,
  ]).toEqual(["アア", 0x3042, 0x3042, 0x4e9c, 0x5b9d]);
  await test.info().attach("actual-width-kana-observations", {
    body: JSON.stringify(observed, null, 2),
    contentType: "application/json",
  });
});
