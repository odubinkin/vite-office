/** @fileoverview Actual paragraph normalization through shared string pool and prepared-locale uppercase owner. */
import { expect, it } from "vitest";
import { ContentInfo } from "./editobj2";
import { SfxItemPool } from "../../../svl/inc/itempool";
import { SharedStringPool } from "../../../svl/inc/sharedstringpool";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { uppercase } from "../../../unotools/inc/charclass";
/** Actual native UTF16 producer. @param s - Text. @returns String. */ function unicode(
  s: string,
): OUString {
  return new OUString(
    Uint16Array.from(
      s
        .split("")
        .map(/** Reads code unit. @param c - Unit. @returns Code. */ (c) => c.charCodeAt(0)),
    ),
    s.length,
  );
}
it("normalizes initialized paragraph values using the actual pool while retaining shared member identity", /** Uppercase operation borrows its actual prepared locale. @returns Nothing. */ () => {
  const en = unicode("en"),
    blank = new OUString(),
    locale = new Locale(en, blank, blank),
    pool = new SharedStringPool({
      /** Binds original uppercase to actual locale data. @param value - Source. @returns Mapped native string. */ uppercase(
        value: OUStringConstReference,
      ) {
        return uppercase(value, locale);
      },
    }),
    items = new SfxItemPool(),
    a = new ContentInfo(items),
    b = new ContentInfo(items),
    c = new ContentInfo(items),
    lower = unicode("a\0ß"),
    equal = unicode("a\0ß"),
    upper = unicode("A\0ẞ");
  a.SetText(lower);
  b.SetText(equal);
  c.SetText(upper);
  const borrow = a.GetSharedString();
  a.NormalizeString(pool);
  b.NormalizeString(pool);
  c.NormalizeString(pool);
  expect(a.GetSharedString()).toBe(borrow);
  expect(a.GetSharedString().getData()).toBe(b.GetSharedString().getData());
  expect(a.GetSharedString().getDataIgnoreCase()).toBe(c.GetSharedString().getDataIgnoreCase());
  expect(a.GetText().equals(lower)).toBe(true);
  a.NormalizeString(pool);
  expect(a.GetSharedString().getData()).toBe(b.GetSharedString().getData());
  for (const s of [en, blank, lower, equal, upper]) s.dispose();
});
