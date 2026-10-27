/** @fileoverview Source public timezone factories, Unicode GMT parsing and consumed full-fold primitives. */
import { expect, it } from "vitest";
import { UnicodeString } from "../common/unistr";
import { ICU_Utility } from "../common/util_props";
import { u_strncasecmp } from "../common/ustrcase";
import { ucase_toFullFolding, type FullFoldingPointer } from "../common/ucase";
import { u_charDigitValue, u_digit } from "../common/uchar";
import { createTimeZone, getCanonicalID, getGMT, getUnknown } from "./timezone.create";
import { parseCustomID } from "./timezone.custom";
import { ZoneMeta } from "./zonemeta";

it("uses the source system/custom/Unknown order and independent static clones", /** Checks public failure fallback and const static identity. @returns Nothing. */ () => {
  const id = new UnicodeString(),
    source = createTimeZone(new UnicodeString("US/Pacific"));
  expect(source.getID(id).getBuffer()).toBe("US/Pacific");
  expect(createTimeZone(new UnicodeString("gmt+5:30")).getID(id).getBuffer()).toBe("GMT+05:30");
  const unknown = createTimeZone(new UnicodeString("unknown")),
    other = createTimeZone(new UnicodeString("unknown"));
  expect(unknown).not.toBe(other);
  expect(unknown).not.toBe(getUnknown());
  expect(unknown.getID(id).getBuffer()).toBe("Etc/Unknown");
  unknown.setID(new UnicodeString("changed"));
  expect(getUnknown().getID(id).getBuffer()).toBe("Etc/Unknown");
  expect(getGMT().getID(id).getBuffer()).toBe("GMT");
  expect(getGMT()).toBe(getGMT());
});
it("preserves canonical output clearing, status guards and aliased input/output", /** Checks source public wrapper order instead of adding validation before output reset. @returns Nothing. */ () => {
  const canonical = new UnicodeString("before"),
    status: [number] = [0],
    system: [boolean] = [false];
  getCanonicalID(new UnicodeString("US/Pacific"), canonical, system, status);
  expect(canonical.getBuffer()).toBe("America/Los_Angeles");
  expect(system[0]).toBe(true);
  getCanonicalID(new UnicodeString("GMT+05:30"), canonical, system, status);
  expect(canonical.getBuffer()).toBe("GMT+05:30");
  expect(system[0]).toBe(false);
  getCanonicalID(new UnicodeString("Etc/Unknown"), canonical, system, status);
  expect(canonical.getBuffer()).toBe("Etc/Unknown");
  expect(system[0]).toBe(false);
  getCanonicalID(canonical, canonical, system, status);
  expect(canonical.getBuffer()).toBe("");
  expect(status[0]).toBe(1);
  canonical.setToBogus();
  getCanonicalID(new UnicodeString("GMT+1"), canonical, system, status);
  expect(canonical.isBogus()).toBe(false);
  expect(canonical.isEmpty()).toBe(true);
  expect(status[0]).toBe(1);
});
it("retains Unicode integer positions and source supplementary-digit double consumption", /** Preserves CALC-315, including overflow without a committed parse position. @returns Nothing. */ () => {
  const text = new UnicodeString("𝟙"),
    pos: [number] = [0];
  expect(text.char32At(0)).toBe(0x1d7d9);
  expect(text.char32At(1)).toBe(0x1d7d9);
  expect(u_charDigitValue(0x1d7d9)).toBe(1);
  expect(ICU_Utility.parseNumber(text, pos, 10)).toBe(11);
  expect(pos[0]).toBe(2);
  const id = new UnicodeString(),
    zone = createTimeZone(new UnicodeString("GMT+𝟙"));
  expect(zone.getID(id).getBuffer()).toBe("GMT+11:00");
  expect(zone.getRawOffset()).toBe(39600000);
  pos[0] = 2;
  expect(ICU_Utility.parseNumber(new UnicodeString("xx2147483648"), pos, 10)).toBe(-1);
  expect(pos[0]).toBe(2);
  expect(u_digit(0xff26, 16)).toBe(15);
  expect(u_digit(0xff26, 10)).toBe(-1);
  expect(createTimeZone(new UnicodeString("GMT+１２:٣٤")).getID(id).getBuffer()).toBe("GMT+12:34");
});
it("retains the warmed NUL-terminated canonical cache key although system lookup rejects the full ID", /** Preserves CALC-317 rather than adding source-incompatible input trimming or cache validation. @returns Nothing. */ () => {
  createTimeZone(new UnicodeString("America/New_York"));
  const text = "America/New_York\0trailing",
    input = new UnicodeString(text, text.length),
    id = new UnicodeString(),
    status: [number] = [0],
    system: [boolean] = [false];
  expect(createTimeZone(input).getID(id).getBuffer()).toBe("Etc/Unknown");
  getCanonicalID(input, id, system, status);
  expect(id.getBuffer()).toBe("America/New_York");
  expect(system[0]).toBe(true);
  expect(status[0]).toBe(0);
});
it("keeps private-parser partial output writes on source failure", /** Exercises the source-internal helper from its inspected algorithm; native public factory results are checked separately. @returns Nothing. */ () => {
  const sign: [number] = [77],
    hour: [number] = [88],
    minute: [number] = [99],
    second: [number] = [66];
  expect(parseCustomID(new UnicodeString("bad"), sign, hour, minute, second)).toBe(false);
  expect([sign[0], hour[0], minute[0], second[0]]).toEqual([77, 88, 99, 66]);
  expect(parseCustomID(new UnicodeString("GMT-1:60"), sign, hour, minute, second)).toBe(false);
  expect([sign[0], hour[0], minute[0], second[0]]).toEqual([-1, 1, 60, 0]);
});
it("uses actual full folding, surrogate rewind and code-point-order differences", /** Checks the consumed native comparison and borrowed mapping tags. @returns Nothing. */ () => {
  expect(u_strncasecmp("Fuß", "FUSS", 4, 0)).toBe(0);
  expect(u_strncasecmp("İ", "i\u0307", 2, 0)).toBe(0);
  expect(u_strncasecmp("I", "ı", 1, 1)).toBe(0);
  expect(u_strncasecmp("\ud801\udc00", "\ud801\udc28", 2, 0)).toBe(0);
  expect(u_strncasecmp("\ue000", "\ud800\udc00", 2, 0)).toBe(2048);
  expect(u_strncasecmp("\ue000", "\ud800\udc00", 2, 0x8000)).toBe(-8192);
  const pointer: [FullFoldingPointer | null] = [null];
  expect(ucase_toFullFolding(0xdf, pointer, 0)).toBe(2);
  const span = pointer[0] as FullFoldingPointer;
  expect([span.data[span.index], span.data[span.index + 1]]).toEqual([0x73, 0x73]);
  expect(ucase_toFullFolding(0x21, pointer, 0)).toBe(~0x21);
  expect(pointer[0]).toBeNull();
});
it("preserves the numeric ZoneMeta seconds-only name separately from string GMT normalization", /** Retains CALC-316 instead of unifying the two source formatters. @returns Nothing. */ () => {
  const id = new UnicodeString(),
    numeric = ZoneMeta.createCustomTimeZone(30000),
    text = createTimeZone(new UnicodeString("GMT+00:00:30"));
  expect(numeric.getID(id).getBuffer()).toBe("GMT");
  expect(numeric.getRawOffset()).toBe(30000);
  expect(text.getID(id).getBuffer()).toBe("GMT+00:00:30");
  expect(text.getRawOffset()).toBe(30000);
});
