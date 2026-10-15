/** @fileoverview Original SharedStringPool QA scenarios and actual prepared-locale, alias and caller-lifetime regressions through reused shared value owners. */
import { expect, it, vi } from "vitest";
import { SharedStringPool } from "../../inc/sharedstringpool";
import { SharedString } from "../../inc/sharedstring";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../sal/inc/rtl/ustring";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { uppercase } from "../../../unotools/inc/charclass";

/** Builds the actual UTF16 value, including embedded nul or isolated surrogate units. @param text - Input. @returns Owned value. */
function unicode(text: string): OUString {
  const units = new Uint16Array(text.length);
  for (let i = 0; i < text.length; i++) units[i] = text.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Reads logical UTF16 without normalizing it. @param value - Shared value view. @returns Exact text. */
function text(value: OUStringConstReference): string {
  let result = "";
  for (let i = 0; i < value.getLength(); i++)
    result += String.fromCharCode(value.getStr()[i] as number);
  return result;
}
/** Binds the actual source uppercase operation to a real prepared Locale at the borrowed receiver boundary; no fake production service is constructed. @param language - Prepared language. @returns Actual pool and caller cleanup. */
function context(language = "en") {
  const lang = unicode(language),
    blank = new OUString(),
    locale = new Locale(lang, blank, blank);
  lang.dispose();
  blank.dispose();
  const classifier = {
      /** Executes the actual existing uppercase implementation. @param value - Source. @returns Source mapped value. */
      uppercase(value: OUStringConstReference): OUString {
        return uppercase(value, locale);
      },
    },
    pool = new SharedStringPool(classifier),
    held = new Set<SharedString>();
  /** Interns a nonstatic caller value and ends its temporary scope. @param value - Text. @returns Tracked shared value. */
  function intern(value: string): SharedString {
    const source = unicode(value);
    try {
      const result = pool.intern(source);
      held.add(result);
      return result;
    } finally {
      source.dispose();
    }
  }
  /** Ends one caller's actual shared value scope. @param value - Tracked value. @returns Nothing. */
  function release(value: SharedString): void {
    held.delete(value);
    value.dispose();
  }
  /** Ends all remaining caller and pool scopes. @returns Nothing. */
  function dispose(): void {
    for (const value of held) value.dispose();
    pool.dispose();
    locale.dispose();
  }
  return { pool, classifier, intern, release, dispose };
}

it("ports testSharedStringPool original and case-insensitive canonical identities", /** Replays native Andy/Bruce value identity assertions. @returns Nothing. */ () => {
  const x = context();
  try {
    const p1 = x.intern("Andy"),
      same = x.intern("Andy"),
      bruce = x.intern("Bruce");
    expect(p1.getData()).toBe(same.getData());
    expect(p1.getData()).not.toBe(bruce.getData());
    const andy = unicode("Andy"),
      fromCaller = x.pool.intern(andy);
    expect(fromCaller.getData()).not.toBeNull();
    expect(p1.getData()).toBe(fromCaller.getData());
    fromCaller.dispose();
    andy.dispose();
    for (const value of [x.intern("andy"), x.intern("ANDY")]) {
      expect(value.getData()).not.toBe(p1.getData());
      expect(value.getDataIgnoreCase()).toBe(p1.getDataIgnoreCase());
    }
  } finally {
    x.dispose();
  }
});

it("ports testSharedStringPoolPurge original held-value count sequence", /** Replays every source count assertion and both purge passes. @returns Nothing. */ () => {
  const x = context(),
    extra = x.pool.getCount(),
    extraCase = x.pool.getCountIgnoreCase();
  /** Checks native counts relative to internal empty entries. @param total - Added map entries. @param folded - Added uppercase values. @returns Nothing. */
  function counts(total: number, folded: number): void {
    expect(x.pool.getCount()).toBe(extra + total);
    expect(x.pool.getCountIgnoreCase()).toBe(extraCase + folded);
  }
  try {
    for (const name of ["Andy", "andy", "ANDY"]) x.release(x.intern(name));
    counts(3, 1);
    x.pool.purge();
    counts(0, 0);
    const p1 = x.intern("Andy"),
      p2 = x.intern("andy"),
      p3 = x.intern("ANDY"),
      p4 = x.intern("Bruce");
    counts(5, 2);
    x.pool.purge();
    counts(5, 2);
    x.release(p1);
    x.pool.purge();
    counts(4, 2);
    x.release(p3);
    x.pool.purge();
    counts(4, 2);
    x.release(p2);
    x.pool.purge();
    counts(2, 1);
    x.release(p4);
    x.pool.purge();
    counts(0, 0);
  } finally {
    x.dispose();
  }
});

it("ports testSharedStringPoolPurgeBug1 shared uppercase mapping cleanup", /** Verifies the original two-lowercase regression without native memory instrumentation. @returns Nothing. */ () => {
  const x = context(),
    extra = x.pool.getCount(),
    extraCase = x.pool.getCountIgnoreCase();
  try {
    x.release(x.intern("Andy"));
    x.release(x.intern("andy"));
    x.pool.purge();
    expect(x.pool.getCount()).toBe(extra);
    expect(x.pool.getCountIgnoreCase()).toBe(extraCase);
  } finally {
    x.dispose();
  }
});

it("ports testSharedStringPoolEmptyString singleton identity before and after purge", /** Verifies original empty input and internal singleton pointer equality. @returns Nothing. */ () => {
  const x = context();
  try {
    for (let i = 0; i < 2; i++) {
      const empty = x.intern(""),
        staticEmpty = x.pool.intern(SharedString.EMPTY_STRING),
        singleton = SharedString.getEmptyString();
      expect(empty.equals(singleton)).toBe(true);
      expect(empty.getData()).toBe(singleton.getData());
      expect(empty.getDataIgnoreCase()).toBe(singleton.getDataIgnoreCase());
      expect(staticEmpty.getData()).toBe(singleton.getData());
      staticEmpty.dispose();
      x.release(empty);
      x.pool.purge();
    }
    expect(x.pool.getCount()).toBe(1);
    expect(x.pool.getCountIgnoreCase()).toBe(1);
  } finally {
    x.dispose();
  }
});

it("reuses preexisting uppercase key identities and exact unequal colliding keys", /** Covers uppercase-first insertion and native hash collision separation using JS UTF16 value equality. @returns Nothing. */ () => {
  const x = context(),
    a = unicode("Ag"),
    b = unicode("BB");
  try {
    expect(a.hashCode()).toBe(b.hashCode());
    const upper = x.intern("ANDY"),
      lower = x.intern("Andy");
    expect(lower.getDataIgnoreCase()).toBe(upper.getData());
    const first = x.pool.intern(a),
      second = x.pool.intern(b);
    expect(first.getData()).not.toBe(second.getData());
    expect(text(first.getString())).toBe("Ag");
    expect(text(second.getString())).toBe("BB");
    first.dispose();
    second.dispose();
  } finally {
    a.dispose();
    b.dispose();
    x.dispose();
  }
});

it.each([
  ["en", "ß", "ẞ"],
  ["tr", "i", "İ"],
  ["az", "i", "İ"],
  ["lt", "i\u0307", "I\u0307"],
  ["el", "ά", "Ά"],
  ["en", "ﬃ", "FFI"],
  ["en", "𐐨", "𐐀"],
  ["en", "a\0b", "A\0B"],
  ["en", "\ud800a", "\ud800A"],
])(
  "interns actual source locale mapping %s %s",
  /** Verifies genuine source mapping and canonical uppercase identity. @param language - Prepared locale. @param source - Input. @param want - Source uppercase. @returns Nothing. */ (
    language,
    source,
    want,
  ) => {
    const x = context(language);
    try {
      const original = x.intern(source),
        upper = x.intern(want),
        again = x.intern(source);
      expect(original.getData()).toBe(again.getData());
      expect(original.getDataIgnoreCase()).toBe(upper.getData());
      expect(text(original.getIgnoreCaseString())).toBe(want);
      expect(text(original.getString())).toBe(source);
      expect(x.pool.getCountIgnoreCase()).toBe(2);
    } finally {
      x.dispose();
    }
  },
);

it("preserves external OUString owners, folded views and static source values during purge", /** Uses existing real ownership state without a new lifetime counter. @returns Nothing. */ () => {
  const x = context(),
    source = unicode("Andy"),
    first = x.pool.intern(source);
  const upperView = new OUString(first.getIgnoreCaseString());
  first.dispose();
  try {
    x.pool.purge();
    expect(x.pool.getCount()).toBe(3);
    source.dispose();
    x.pool.purge();
    expect(x.pool.getCount()).toBe(2);
    expect(text(upperView)).toBe("ANDY");
    upperView.dispose();
    x.pool.purge();
    expect(x.pool.getCount()).toBe(1);
    const literal = new OUString(new OUStringLiteral(new Uint16Array([65, 0]))),
      value = x.pool.intern(literal);
    value.dispose();
    literal.dispose();
    x.pool.purge();
    expect(x.pool.getCount()).toBe(2);
  } finally {
    x.dispose();
  }
});

it("keeps shared values valid after the pool ends and independent pools independent", /** Verifies caller-visible values rather than native heap reclamation. @returns Nothing. */ () => {
  const first = context(),
    second = context(),
    a = first.intern("Andy"),
    b = second.intern("Andy");
  expect(a.getData()).not.toBe(b.getData());
  expect(a.equals(b)).toBe(true);
  first.pool.dispose();
  expect(text(a.getString())).toBe("Andy");
  expect(text(a.getIgnoreCaseString())).toBe("ANDY");
  first.release(a);
  first.dispose();
  second.dispose();
});

it("retains the source's initial mapping if uppercase throws and avoids remapping a found key", /** Verifies source exception ordering through the actual borrowed operation boundary. @returns Nothing. */ () => {
  const x = context(),
    failure = new Error("mapping failed"),
    source = unicode("abc"),
    spy = vi.spyOn(x.classifier, "uppercase").mockImplementationOnce(
      /** Simulates a propagated operation failure after the original insertion. @returns Never. */ () => {
        throw failure;
      },
    );
  try {
    expect(
      /** Executes original insertion ordering. @returns Shared value. */ () =>
        x.pool.intern(source),
    ).toThrow(failure);
    const found = x.pool.intern(source);
    expect(found.getData()).toBe(source.pData);
    expect(found.getDataIgnoreCase()).toBe(source.pData);
    expect(spy).toHaveBeenCalledOnce();
    found.dispose();
    source.dispose();
    x.pool.purge();
    expect(x.pool.getCount()).toBe(1);
  } finally {
    spy.mockRestore();
    x.dispose();
  }
});
