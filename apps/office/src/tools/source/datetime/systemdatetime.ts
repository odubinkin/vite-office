/** @fileoverview Native optional local date/time outputs. The browser clock supplies local fields and millisecond precision; native platform nanosecond precision/ABI is unverified. */
/** Packs both requested outputs from one successful host clock sample, preserving outputs on failure. @param date - Optional native signed32 date output. @param time - Optional native signed64 clock output. @returns Whether platform conversion succeeded. */
export function GetSystemDateTime(date: [number] | null, time: [bigint] | null): boolean {
  const local = new globalThis.Date(globalThis.Date.now());
  if (Number.isNaN(local.getTime())) return false;
  if (date)
    date[0] = (local.getFullYear() * 10000 + (local.getMonth() + 1) * 100 + local.getDate()) | 0;
  if (time)
    time[0] =
      BigInt(local.getHours()) * 10000000000000n +
      BigInt(local.getMinutes()) * 100000000000n +
      BigInt(local.getSeconds()) * 1000000000n +
      BigInt(local.getMilliseconds()) * 1000000n;
  return true;
}
