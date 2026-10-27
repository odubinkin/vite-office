/** @fileoverview Browser binding of the consumed putil.cpp host-timezone hooks. Intl supplies a semantic zone identifier; pinned ICU supplies its standard offset. Missing identities are reported as host-remapping failure, never guessed from sampled dates. No independent libc timezone/abbreviation field is available in the browser. */
import { UnicodeString } from "../source/common/unistr";
import { createSystemTimeZone } from "../source/i18n/timezone.create";
import { createCustomTimeZone } from "../source/i18n/timezone.custom";

/** Original host-hook dependency boundary consumed by TimeZone::detectHostTimeZone. */
export interface TimeZoneHost {
  /** Initializes platform timezone state. @returns Nothing. */
  uprv_tzset(): void;
  /** Invalidates the host-name capture. @returns Nothing. */
  uprv_tzname_clear_cache(): void;
  /** Supplies the consumed standard-name index. @param index - Standard index zero. @returns Invariant identifier, or empty on remapping failure. */
  uprv_tzname(index: 0): string;
  /** Supplies standard seconds west of UTC, matching the native sign convention. @returns Seconds. */
  uprv_timezone(): number;
}
/** Coherent browser host capture for the two original queries. */
interface HostInfo {
  readonly id: string;
  readonly westSeconds: number;
}
let captured: HostInfo | null = null;
/** Maps browser semantic IANA/fixed-offset identifiers through actual pinned source zone owners. The browser exposes no separate POSIX abbreviation/raw-bias pair; unresolved IDs therefore use the native empty-name failure channel. @returns Captured host fields. */
function hostInfo(): HostInfo {
  if (captured !== null) return captured;
  let id: string;
  try {
    id = Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return (captured = { id: "", westSeconds: 0 });
  }
  if (!id) return (captured = { id: "", westSeconds: 0 });
  const text = new UnicodeString(id, id.length),
    zone =
      createSystemTimeZone(text) ??
      createCustomTimeZone(text) ??
      createCustomTimeZone(new UnicodeString("GMT" + id));
  if (zone === null) return (captured = { id: "", westSeconds: 0 });
  return (captured = { id, westSeconds: (-zone.getRawOffset() / 1000) | 0 });
}
/** Browser Intl has no separate tzset operation; capture invalidation remains the next explicit native hook. @returns Nothing. */
export function uprv_tzset(): void {
  // Intl initializes its own host state; the following explicit cache-clear hook controls our capture.
}
/** Original host-name-cache invalidation boundary. @returns Nothing. */
export function uprv_tzname_clear_cache(): void {
  captured = null;
}
/** Original consumed name hook. @param index - Standard-name index. @returns Browser semantic ID or empty. */
export function uprv_tzname(index: 0): string {
  void index;
  return hostInfo().id;
}
/** Original standard-offset sign/units hook over a successfully mapped semantic zone. @returns Seconds west of UTC. */
export function uprv_timezone(): number {
  return hostInfo().westSeconds;
}
export const browserTimeZoneHost: TimeZoneHost = {
  uprv_tzset,
  uprv_tzname_clear_cache,
  uprv_tzname,
  uprv_timezone,
};
