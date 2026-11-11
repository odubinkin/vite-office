/** @fileoverview Original entry defaults and DOS clock packing over real ZipEntry/OSL values; no fake package or model providers. */
import { afterEach, expect, it, vi } from "vitest";
import { ZipEntry } from "../../inc/ZipEntry";
import { ZipOutputStream } from "./ZipOutputStream";
import { ZipFile } from "./ZipFile";
import { CRC32 } from "./CRC32";
import {
  TimeValue,
  oslDateTime,
  osl_getSystemTime,
  osl_getDateTimeFromTimeValue,
} from "../../../sal/inc/osl/time";
/** Resets only the controlled platform clock. @returns Nothing. */
afterEach(
  /** Restores the controlled platform Date binding. @returns Test runtime. */
  () => vi.useRealTimers(),
);
/** Fixes the Date platform primitive without changing native time/entry owners. @param value - ISO UTC time. @returns Nothing. */
function clock(value: string): void {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(value));
}
/** Fully initialized actual source aggregate. @returns Entry. */
function entry(): ZipEntry {
  const value = new ZipEntry();
  value.nVersion = 10;
  value.nFlag = 7;
  value.nMethod = 0;
  value.nTime = 123;
  value.nCrc = 17;
  value.nCompressedSize = 4n;
  value.nSize = 4n;
  value.nOffset = 0n;
  value.nPathLen = 0;
  value.nExtraLen = 0;
  return value;
}
it("applies original version/flag defaults while retaining known metadata and timestamp", /** Actual reference assignment changes only original default fields. @returns Nothing. */ () => {
  const value = entry();
  try {
    ZipOutputStream.setEntry(value);
    expect([
      value.nVersion,
      value.nFlag,
      value.nMethod,
      value.nTime,
      value.nCrc,
      value.nCompressedSize,
      value.nSize,
    ]).toEqual([20, 2048, 0, 123, 17, 4n, 4n]);
  } finally {
    value.dispose();
  }
});
it.each(["crc", "compressed"] as const)(
  "marks unknown %s with the original descriptor flag",
  /** Original signed32/signed64 sentinel conditions. @param field - Unknown source field. @returns Nothing. */ (
    field,
  ) => {
    const value = entry();
    try {
      if (field === "crc") value.nCrc = -1;
      else value.nCompressedSize = -1n;
      value.nMethod = -1;
      ZipOutputStream.setEntry(value);
      expect([value.nMethod, value.nFlag, value.nCompressedSize, value.nSize]).toEqual([
        8,
        2056,
        0n,
        4n,
      ]);
    } finally {
      value.dispose();
    }
  },
);
it("retains the original checked assertion for an unknown uncompressed size", /** The genuine signed64 sentinel reaches the source assertion; release-only fallback is not invented. @returns Nothing. */ () => {
  const value = entry();
  value.nSize = -1n;
  try {
    expect(
      /** Actual source entry reference. @returns Nothing. */ () => ZipOutputStream.setEntry(value),
    ).toThrow("assert(false)");
  } finally {
    value.dispose();
  }
});
it("uses source UTC packing and truncates odd seconds to two-second units", /** Fixed external clock checks both native static functions and actual LOC/CEN output. @returns Nothing. */ () => {
  clock("2026-01-02T03:04:05.006Z");
  expect(ZipOutputStream.getCurrentDosTime()).toBe(0x5c221882);
  const value = entry();
  value.nTime = -1;
  try {
    ZipOutputStream.setEntry(value);
    expect(value.nTime >>> 0).toBe(0x5c221882);
  } finally {
    value.dispose();
  }
  const output = new ZipOutputStream();
  output.putNextEntry("a", new Uint8Array([65]));
  const bytes = output.finish(),
    view = new DataView(bytes.buffer);
  expect(view.getUint32(10, true)).toBe(0x5c221882);
  expect(view.getUint32(32 + 12, true)).toBe(0x5c221882);
});
it("preserves the checked year assertion excluding1980", /** Original source assertion, not a new repair or range normalization. @returns Nothing. */ () => {
  clock("1980-01-01T00:00:00Z");
  expect(
    /** Native clock path. @returns Packed value. */ () => ZipOutputStream.getCurrentDosTime(),
  ).toThrow("aDateTime.Year > 1980");
});
it("retains signed high DOS dates after2044 as uint32 bytes", /** nTime is a signed32 field but the original output writes its exact unsigned bits. @returns Nothing. */ () => {
  clock("2099-12-31T23:59:59Z");
  const value = entry();
  value.nTime = -1;
  try {
    ZipOutputStream.setEntry(value);
    expect(value.nTime).toBeLessThan(0);
    expect(value.nTime >>> 0).toBe(0xef9fbf7d);
  } finally {
    value.dispose();
  }
});
it("preserves the source all-ones CRC sentinel collision on a real STORE payload", /** Four ff octets have CRC32 ffffffff; source setEntry treats its signed bits as unknown. @returns Nothing. */ () => {
  const payload = Uint8Array.of(255, 255, 255, 255);
  expect(CRC32.compute(payload)).toBe(0xffffffff);
  const output = new ZipOutputStream();
  output.putNextEntry("a", payload);
  const bytes = output.finish(),
    view = new DataView(bytes.buffer);
  expect(view.getUint16(6, true)).toBe(2056);
  expect(view.getUint32(14, true)).toBe(0);
  expect(view.getUint32(35 + 20, true)).toBe(0);
  expect(
    /** Native STORE consistency rejects the source result. @returns Archive. */ () =>
      new ZipFile(bytes),
  ).toThrow("entry STORED with inconsistent size");
});
it.each([0, 1, 0xffffffff])(
  "converts initialized OSL seconds %i through GMT and copies nanoseconds without normalization",
  /** Original uint32 time domain is representable; inconsistent nanoseconds are copied as the source does. @param seconds - Native seconds. @returns Nothing. */ (
    seconds,
  ) => {
    const value = new TimeValue(seconds, 1500000000),
      result = new oslDateTime();
    expect(osl_getDateTimeFromTimeValue(value, result)).toBe(true);
    expect(result.NanoSeconds).toBe(1500000000);
    if (seconds === 0)
      expect([
        result.Year,
        result.Month,
        result.Day,
        result.DayOfWeek,
        result.Hours,
        result.Minutes,
        result.Seconds,
      ]).toEqual([1970, 1, 1, 4, 0, 0, 0]);
    if (seconds === 0xffffffff)
      expect([
        result.Year,
        result.Month,
        result.Day,
        result.Hours,
        result.Minutes,
        result.Seconds,
      ]).toEqual([2106, 2, 7, 6, 28, 15]);
  },
);
it("retains native unsigned seconds wrapping at the browser realtime boundary", /** The source TimeValue stores uint32 seconds even for a negative native clock result. @returns Nothing. */ () => {
  clock("1969-12-31T23:59:59.999Z");
  const value = new TimeValue();
  expect(osl_getSystemTime(value)).toBe(true);
  expect([value.Seconds, value.Nanosec]).toEqual([0xffffffff, 999000000]);
});
