/** @fileoverview Original GetSystemDateTime date-output branch. The browser host supplies system_clock/localtime through numeric Date construction and local field getters; text date parsing and calendar arithmetic are not delegated to it. Native nanosecond time output is not exposed by this binding. */
/** Original local date packing after a successful platform clock conversion. @param date - Packed signed32 date output. @param time - Unrequested native time output. @returns Whether the host conversion succeeded. */
export function GetSystemDateTime(date: [number], time: null): boolean {
  void time;
  const local = new globalThis.Date(globalThis.Date.now());
  if (Number.isNaN(local.getTime())) return false;
  date[0] = (local.getFullYear() * 10000 + (local.getMonth() + 1) * 100 + local.getDate()) | 0;
  return true;
}
