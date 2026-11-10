/** @fileoverview Pinned ICU charset detector rank, score and status observations. */
import { assert, expect, it } from "vitest";
import { UErrorCode } from "../common/unicode/utypes";
import {
  ucsdet_close,
  ucsdet_detect,
  ucsdet_detectAll,
  ucsdet_enableInputFilter,
  ucsdet_getConfidence,
  ucsdet_getLanguage,
  ucsdet_getName,
  ucsdet_isInputFilterEnabled,
  ucsdet_open,
  ucsdet_setText,
} from "./unicode/ucsdet";

it.each([
  ["", ["UTF-8::15"]],
  ["c0af", ["UTF-8::80", "GB18030:zh:10", "EUC-JP:ja:10", "EUC-KR:ko:10", "Big5:zh:10"]],
  ["e282", ["UTF-8::15", "Shift_JIS:ja:10", "GB18030:zh:10", "Big5:zh:10"]],
  ["0010ffff", ["UTF-16BE::10", "UTF-16LE::10", "GB18030:zh:10", "EUC-JP:ja:10", "EUC-KR:ko:10"]],
  ["01b8", ["ISO-8859-5:ru:98", "IBM420_ltr:ar:75"]],
  [
    "817f817f817f817f817f817f817f817f817f817f",
    [
      "UTF-16BE::10",
      "UTF-16LE::10",
      "Shift_JIS:ja:10",
      "GB18030:zh:10",
      "EUC-JP:ja:10",
      "EUC-KR:ko:10",
    ],
  ],
  [
    "4e616d652c56616c75650a",
    [
      "ISO-8859-1:nl:50",
      "ISO-8859-2:cs:25",
      "UTF-8::15",
      "UTF-16BE::10",
      "UTF-16LE::10",
      "Shift_JIS:ja:10",
      "GB18030:zh:10",
      "EUC-JP:ja:10",
      "EUC-KR:ko:10",
      "Big5:zh:10",
    ],
  ],
] as const)(
  "matches the pinned native order, languages and scores for %j",
  /** Compares the complete source match vector, including ties and IBM registrations. @param hex - Raw source bytes. @param expected - Pinned native result vector. @returns Nothing. */ (
    hex,
    expected,
  ) => {
    const status: [UErrorCode] = [UErrorCode.U_ZERO_ERROR];
    const detector = ucsdet_open(status);
    assert(detector);
    try {
      const input = Buffer.from(hex, "hex");
      ucsdet_setText(detector, input, input.length, status);
      const count: [number] = [0];
      const matches = ucsdet_detectAll(detector, count, status);
      assert(matches);
      expect(status[0]).toBe(UErrorCode.U_ZERO_ERROR);
      expect(
        matches
          .slice(0, count[0])
          .map(
            /** Projects actual match fields for the native comparison. @param match - Borrowed match. @returns Name, language and score. */ (
              match,
            ) =>
              `${ucsdet_getName(match, status)}:${ucsdet_getLanguage(match, status)}:${ucsdet_getConfidence(match, status)}`,
          ),
      ).toEqual(expected);
      expect(ucsdet_detect(detector, status)).toBe(matches[0]);
      expect(ucsdet_detectAll(detector, count, status)).toBe(matches);
    } finally {
      ucsdet_close(detector);
    }
  },
);

it("retains the original unset and failed status and the counted NUL contract", /** Checks the C entry points over the real detector and its reused result storage. @returns Nothing. */ () => {
  const status: [UErrorCode] = [UErrorCode.U_ILLEGAL_ARGUMENT_ERROR];
  expect(ucsdet_open(status)).toBeNull();
  status[0] = UErrorCode.U_ZERO_ERROR;
  const detector = ucsdet_open(status);
  assert(detector);
  try {
    const count: [number] = [77];
    expect(ucsdet_detectAll(detector, count, status)).toBeNull();
    expect(status[0]).toBe(UErrorCode.U_MISSING_RESOURCE_ERROR);
    expect(count[0]).toBe(77);
    const source = Uint8Array.of(0, 0xff);
    ucsdet_setText(detector, source, -1, status);
    expect(ucsdet_detect(detector, status)).toBeNull();
    status[0] = UErrorCode.U_ZERO_ERROR;
    ucsdet_setText(detector, source, -1, status);
    const match = ucsdet_detect(detector, status);
    assert(match);
    expect(ucsdet_getName(match, status)).toBe("UTF-8");
    expect(ucsdet_getConfidence(match, status)).toBe(15);
    expect(ucsdet_enableInputFilter(detector, true)).toBe(false);
    expect(ucsdet_isInputFilterEnabled(detector)).toBe(true);
    expect(ucsdet_enableInputFilter(detector, false)).toBe(true);
  } finally {
    ucsdet_close(detector);
  }
});
