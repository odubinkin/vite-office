/** @fileoverview Verifies actual configured/native role matching over registered browser face state and preparation. */
import { expect, it, vi } from "vitest";
import { createBrowserDefaultFontDevice, createDefaultFontLocale } from "./default-font-device";
import { DefaultFontType } from "../../unotools/inc/fontdefs";
/** Creates one platform boundary face with observable load behavior. @param family - Serialized family. @param status - Initial state. @param fail - Resource failure. @returns Browser boundary face. */
function face(family: string, status: FontFaceLoadStatus = "loaded", fail = false): FontFace {
  const value = {
    family,
    status,
    load: vi.fn(
      /** Loads the platform resource. @returns Face or failure. */ async () => {
        if (fail) {
          value.status = "error";
          throw new Error("font decoding");
        }
        value.status = "loaded";
        return value as unknown as FontFace;
      },
    ),
  };
  return value as unknown as FontFace;
}
/** Binds a live platform set and a check function that falsely accepts any unknown family. @param faces - Real-boundary face values. @returns Test host. */
function host(faces: FontFace[]) {
  const check = vi.fn(/** Simulates CSS fallback success. @returns True. */ () => true);
  const fonts = Object.assign(new Set(faces), { check });
  return { document: { fonts } as unknown as Document, fonts, check };
}

it("uses configured candidate order, normalization and live loaded faces for spreadsheet and Writer roles", /** Reuses the same generic boundary for both applications. @returns Nothing. */ () => {
  const available = host([face('"Arimo"'), face('"LIBERATION  SANS"'), face('"Liberation Serif"')]);
  const device = createBrowserDefaultFontDevice(available.document),
    locale = createDefaultFontLocale("en-US");
  expect(device.getDefaultFont(DefaultFontType.LATIN_SPREADSHEET, locale)).toBe("LIBERATION  SANS");
  expect(device.getDefaultFont(DefaultFontType.LATIN_TEXT, locale)).toBe("Liberation Serif");
  available.fonts.delete([...available.fonts][1] as FontFace);
  expect(device.getDefaultFont(DefaultFontType.LATIN_SPREADSHEET, locale)).toBe("Arimo");
  expect(available.check).not.toHaveBeenCalled();
  locale.dispose();
});

it("does not treat missing/error/unloaded/loading faces or CSS fallback checks as installed fonts", /** Rejects unsupported availability assumptions. @returns Completion. */ async () => {
  const available = host([
    face('"Liberation Sans"', "unloaded"),
    face("Arimo", "loading"),
    face("Arial", "error"),
    face('""'),
  ]);
  const device = createBrowserDefaultFontDevice(available.document),
    locale = createDefaultFontLocale("en-US");
  expect(device.getDefaultFont(DefaultFontType.LATIN_SPREADSHEET, locale)).toBeUndefined();
  expect(device.getDefaultFont(-1 as DefaultFontType, locale)).toBeUndefined();
  expect(await device.prepareDefaultFont(-1 as DefaultFontType, locale)).toBeUndefined();
  const absent = createBrowserDefaultFontDevice({} as Document);
  expect(absent.getDefaultFont(DefaultFontType.LATIN_TEXT, locale)).toBeUndefined();
  expect(await absent.prepareDefaultFont(DefaultFontType.LATIN_TEXT, locale)).toBeUndefined();
  expect(available.check).not.toHaveBeenCalled();
  locale.dispose();
});

it("prepares every face of the first successful configured family and continues past resource failure", /** Verifies platform loading rather than a guessed presence check. @returns Completion. */ async () => {
  const broken = face('"Liberation Sans"', "unloaded", true),
    regular = face('"Arimo"', "unloaded"),
    italic = face('"Arimo"', "loading");
  const available = host([broken, regular, italic]),
    device = createBrowserDefaultFontDevice(available.document),
    locale = createDefaultFontLocale("en-US");
  expect(await device.prepareDefaultFont(DefaultFontType.LATIN_SPREADSHEET, locale)).toBe("Arimo");
  expect(broken.load).toHaveBeenCalledOnce();
  expect(regular.load).toHaveBeenCalledOnce();
  expect(italic.load).toHaveBeenCalledOnce();
  expect(device.getDefaultFont(DefaultFontType.LATIN_SPREADSHEET, locale)).toBe("Arimo");
  const onlyBroken = createBrowserDefaultFontDevice(
    host([face("Liberation Serif", "unloaded", true)]).document,
  );
  expect(await onlyBroken.prepareDefaultFont(DefaultFontType.LATIN_TEXT, locale)).toBeUndefined();
  locale.dispose();
});

it.each([
  ['"Liberation\\20 Serif"', "Liberation Serif"],
  ["'Liberation Serif'", "Liberation Serif"],
  ["Liberation Serif", "Liberation Serif"],
  ['"Liberation\\ Serif"', "Liberation Serif"],
  ['"Liberation\\\n Serif"', "Liberation Serif"],
  ['"Liberation\\\r\n Serif"', "Liberation Serif"],
  ['"Liberation\\000020\r\nSerif"', "Liberation Serif"],
])(
  "decodes actual CSS family serialization %s",
  /** Checks quoted/unquoted and escaped descriptor lookup. @param descriptor - Platform serialization. @param want - Raw family. @returns Nothing. */ (
    descriptor,
    want,
  ) => {
    const device = createBrowserDefaultFontDevice(host([face(descriptor)]).document),
      locale = createDefaultFontLocale("en-US");
    expect(device.getDefaultFont(DefaultFontType.LATIN_TEXT, locale)).toBe(want);
    locale.dispose();
  },
);

it("rejects unrelated or replacement-codepoint families despite CSS escapes", /** Covers CSS numeric escape validity and actual unmatched families. @returns Nothing. */ () => {
  const values = [
    "\\0 ",
    "\\110000 ",
    "\\d800 ",
    "\\dfff ",
    "\\d7ff ",
    "\\10ffff ",
    "\\x",
    "\\\n",
    "'unmatched",
    '"unmatched',
  ];
  const device = createBrowserDefaultFontDevice(
      host(
        values.map(
          /** Creates platform descriptor faces. @param name - Descriptor. @returns Face. */ (
            name,
          ) => face(name),
        ),
      ).document,
    ),
    locale = createDefaultFontLocale("en-US");
  expect(device.getDefaultFont(DefaultFontType.LATIN_TEXT, locale)).toBeUndefined();
  locale.dispose();
});

it("honors actual Japanese and Arabic configured locales through the same generic device", /** Verifies the language is part of font selection rather than an ignored browser parameter. @returns Nothing. */ () => {
  const available = host([
    face('"Noto Serif CJK JP"'),
    face('"Noto Sans CJK JP"'),
    face('"Tahoma"'),
  ]);
  const device = createBrowserDefaultFontDevice(available.document),
    japanese = createDefaultFontLocale("ja-JP"),
    arabic = createDefaultFontLocale("ar-SA"),
    english = createDefaultFontLocale("en-US");
  expect(device.getDefaultFont(DefaultFontType.CJK_TEXT, japanese)).toBe("Noto Serif CJK JP");
  expect(device.getDefaultFont(DefaultFontType.LATIN_SPREADSHEET, japanese)).toBe(
    "Noto Sans CJK JP",
  );
  expect(device.getDefaultFont(DefaultFontType.CTL_TEXT, arabic)).toBe("Tahoma");
  expect(device.getDefaultFont(DefaultFontType.LATIN_TEXT, english)).toBeUndefined();
  japanese.dispose();
  arabic.dispose();
  english.dispose();
});
