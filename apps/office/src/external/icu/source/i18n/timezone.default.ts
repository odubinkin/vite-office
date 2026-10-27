/** @fileoverview Original ICU78.3 host detection and default-zone initialization/adoption/clone lifecycle from timezone.cpp. The browser host hook binding is separate from the source decision logic; native mutex/allocator/cleanup remain uncertified. */
import { UnicodeString } from "../common/unistr";
import { browserTimeZoneHost, type TimeZoneHost } from "../../browser/putil-tz";
import type { LocaleConstReference } from "../common/locid";
import { UErrorCode, U_FAILURE } from "../common/unicode/utypes";
import { createTimeZone, createSystemTimeZone, getUnknown } from "./timezone.create";
import { SimpleTimeZone } from "./simpletz";
import type { TimeZone, TimeZoneConstReference } from "./timezone";
let DEFAULT_ZONE: TimeZone | null = null;
let defaultZoneInitialized = false;

/** Original detectHostTimeZone body over its actual platform dependency boundary. No time-zone rules or fallback policy are injected by the host. @param host - Native host hooks. @returns Owned detected/fixed/Unknown zone. */
export function detectHostTimeZoneFromHost(host: TimeZoneHost): TimeZone {
  host.uprv_tzset();
  host.uprv_tzname_clear_cache();
  const hostID = host.uprv_tzname(0),
    rawOffset = (host.uprv_timezone() * -1000) | 0;
  let detected = true,
    id = new UnicodeString(hostID);
  if (id.length() === 0) {
    id = new UnicodeString("Etc/Unknown");
    detected = false;
  }
  let zone: TimeZone | null = createSystemTimeZone(id);
  const length = id.length();
  if (zone !== null && rawOffset !== zone.getRawOffset() && length >= 3 && length <= 4) zone = null;
  if (zone === null && detected) zone = new SimpleTimeZone(rawOffset, id);
  if (zone === null) zone = getUnknown().clone();
  return zone;
}
/** Original public host detection delegates only its platform queries to the browser binding. @returns Owned zone. */
export function detectHostTimeZone(): TimeZone {
  return detectHostTimeZoneFromHost(browserTimeZoneHost);
}
/** Original initialization skips host detection after an earlier adoptDefault/setDefault. @returns Nothing. */
function initDefault(): void {
  if (DEFAULT_ZONE !== null) return;
  DEFAULT_ZONE = detectHostTimeZone();
}
/** Original once-only initialization and owned result clone. Native allocator-null returns are retained in the result type, without simulating allocation failures. @returns Owned default-zone clone or null. */
export function createDefault(): TimeZone | null {
  if (!defaultZoneInitialized) {
    initDefault();
    defaultZoneInitialized = true;
  }
  // initDefault always installs detectHostTimeZone's owned fallback; adoptDefault(null)
  // cannot clear it. The established owner may still expose a nullable native clone result.
  return (DEFAULT_ZONE as TimeZone).clone();
}
/** Original non-null pointer adoption leaves the once-only state unchanged. @param zone - Transferred zone or ignored null. @returns Nothing. */
export function adoptDefault(zone: TimeZone | null): void {
  if (zone !== null) DEFAULT_ZONE = zone;
}
/** Original const-reference setter clones before adopting. @param zone - Copied zone. @returns Nothing. */
export function setDefault(zone: TimeZoneConstReference): void {
  adoptDefault(zone.clone());
}

/** Original locale-zone factory ignores malformed, oversized and exactly-un-terminated keyword results, then returns a cloned default. A valid unknown ID still follows createTimeZone Unknown fallback. @param locale - Actual borrowed locale. @returns Owned zone/null on native allocation failure. */
export function forLocaleOrDefault(locale: LocaleConstReference): TimeZone | null {
  const buffer = new Uint8Array(96),
    status: [number] = [0];
  let count = locale.getKeywordValue("timezone", buffer, buffer.length, status);
  if (U_FAILURE(status[0]) || status[0] === UErrorCode.U_STRING_NOT_TERMINATED_WARNING) count = 0;
  if (count > 0) {
    let id = "";
    for (let i = 0; i < count; ++i) id += String.fromCharCode(buffer[i] as number);
    return createTimeZone(new UnicodeString(id, count));
  }
  return createDefault();
}
