/** @fileoverview Actual shared pool, casing and value identities in Chromium without a substitute Calc document or grid. */
import { expect, test } from "@playwright/test";
import { installKernelFixture } from "./kernel-fixture";

test("preserves original shared string mapping and two-pass purge in Chromium", /** Runs actual kernel value and mapping owners. @param fixtures - Browser fixtures. @returns Completion. */ async ({
  page,
}) => {
  await page.goto("/");
  await installKernelFixture(page, "OfficeSharedStringPoolFixture", [
    { module: "src/svl/inc/sharedstringpool.ts", names: ["SharedStringPool"] },
    { module: "src/unotools/inc/charclass.ts", names: ["uppercase"] },
    { module: "src/sal/inc/rtl/ustring.ts", names: ["OUString"] },
    { module: "src/udkapi/com/sun/star/lang/Locale.ts", names: ["Locale"] },
  ]);
  const result = await page.evaluate(
    /** Uses real shared values and the actual prepared-locale operation at its borrowed boundary. @returns Observations. */ () => {
      const native = Reflect.get(window, "OfficeSharedStringPoolFixture");
      /** Creates exact logical UTF16. @param value - Text. @returns Owned value. */
      function unicode(value: string) {
        const units = new Uint16Array(value.length);
        for (let i = 0; i < value.length; i++) units[i] = value.charCodeAt(i);
        return new native.OUString(units, units.length);
      }
      /** Reads original value text. @param value - Shared string view. @returns Exact text. */
      function text(value: { getLength(): number; getStr(): Uint16Array }): string {
        let result = "";
        for (let i = 0; i < value.getLength(); i++)
          result += String.fromCharCode(value.getStr()[i] as number);
        return result;
      }
      const lang = unicode("tr"),
        blank = new native.OUString(),
        locale = new native.Locale(lang, blank, blank);
      lang.dispose();
      blank.dispose();
      const pool = new native.SharedStringPool({
        /** Executes the actual source operation on existing Locale state. @param value - Shared value. @returns Original uppercase result. */
        uppercase(value: unknown) {
          return native.uppercase(value, locale);
        },
      });
      /** Interns an actual temporary value. @param value - Text. @returns Shared pool result. */
      function intern(value: string) {
        const source = unicode(value);
        try {
          return pool.intern(source);
        } finally {
          source.dispose();
        }
      }
      const counts = [pool.getCount()],
        a = intern("Andy"),
        b = intern("andy"),
        c = intern("ANDY");
      const identity =
        a.getData() !== b.getData() &&
        a.getDataIgnoreCase() === b.getDataIgnoreCase() &&
        c.getData() === a.getDataIgnoreCase();
      pool.purge();
      counts.push(pool.getCount());
      a.dispose();
      pool.purge();
      counts.push(pool.getCount());
      c.dispose();
      pool.purge();
      counts.push(pool.getCount());
      b.dispose();
      pool.purge();
      counts.push(pool.getCount());
      const lower = intern("i"),
        upper = intern("İ"),
        localeIdentity = lower.getDataIgnoreCase() === upper.getData();
      pool.dispose();
      const surviving = [text(lower.getString()), text(lower.getIgnoreCaseString())];
      lower.dispose();
      upper.dispose();
      locale.dispose();
      return { counts, identity, localeIdentity, surviving };
    },
  );
  expect(result).toEqual({
    counts: [1, 4, 3, 3, 1],
    identity: true,
    localeIdentity: true,
    surviving: ["i", "İ"],
  });
});
