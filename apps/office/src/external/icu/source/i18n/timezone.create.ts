/** @fileoverview ICU78.3 synchronous system/custom/Unknown zone creation, static GMT/Unknown owners and public canonical-ID dispatch. Free functions avoid a base/concrete class evaluation cycle. Host/default factory dispatch is owned by timezone.default.ts. */
import { UnicodeString } from "../common/unistr";
import { U_FAILURE } from "../common/unicode/utypes";
import { UResourceBundle, ures_close } from "../common/uresbund";
import { openOlsonResource } from "./timezone.resources";
import { OlsonTimeZone } from "./olsontz";
import { SimpleTimeZone } from "./simpletz";
import type { TimeZone, TimeZoneConstReference } from "./timezone";
import { createCustomTimeZone, getCustomID } from "./timezone.custom";
import { ZoneMeta } from "./zonemeta";
let GMT: SimpleTimeZone | null = null;
let UNKNOWN: SimpleTimeZone | null = null;
/** Original static fixed-zone initialization, independent of mapped data and default-zone state. @returns Nothing. */
function initStaticTimeZones(): void {
  if (GMT !== null) return;
  GMT = new SimpleTimeZone(0, new UnicodeString("GMT"));
  UNKNOWN = new SimpleTimeZone(0, new UnicodeString("Etc/Unknown"));
}
/** Original borrowed GMT static owner; callers use clone for mutable ownership. @returns Static zone. */
export function getGMT(): TimeZoneConstReference {
  initStaticTimeZones();
  return GMT as SimpleTimeZone;
}
/** Original borrowed Unknown static owner. @returns Static zone. */
export function getUnknown(): TimeZoneConstReference {
  initStaticTimeZones();
  return UNKNOWN as SimpleTimeZone;
}
/** Original public synchronous system/custom/Unknown dispatch; failures to resolve an ID return an owned unknown clone. @param id - Requested ID. @returns Owned zone. */
export function createTimeZone(id: UnicodeString): TimeZone {
  return createSystemTimeZone(id) ?? createCustomTimeZone(id) ?? getUnknown().clone();
}
/** Original convenience canonical-ID overload. @param id - Input. @param canonical - Output. @param status - Status. @returns Output. */
export function getCanonicalID(
  id: UnicodeString,
  canonical: UnicodeString,
  status: [number],
): UnicodeString;
/** Original canonical-ID overload with system identity output. @param id - Input. @param canonical - Output. @param isSystem - Identity output. @param status - Status. @returns Output. */
export function getCanonicalID(
  id: UnicodeString,
  canonical: UnicodeString,
  isSystem: [boolean],
  status: [number],
): UnicodeString;
/** Original output-clear/error-reset/system/custom dispatch, including aliased input/output behavior. @param id - Input. @param canonical - Output. @param third - Status or identity output. @param fourth - Optional status. @returns Output. */
export function getCanonicalID(
  id: UnicodeString,
  canonical: UnicodeString,
  third: [number] | [boolean],
  fourth?: [number],
): UnicodeString {
  const status = fourth ?? (third as [number]),
    isSystem: [boolean] = fourth === undefined ? [false] : (third as [boolean]);
  canonical.remove();
  isSystem[0] = false;
  if (U_FAILURE(status[0])) return canonical;
  if (id.compare(new UnicodeString("Etc/Unknown")) === 0) canonical.assign(id);
  else {
    const value = ZoneMeta.getCanonicalCLDRID(id, status);
    if (!U_FAILURE(status[0])) {
      canonical.assign(new UnicodeString(value));
      isSystem[0] = true;
    } else {
      status[0] = 0;
      getCustomID(id, canonical, status);
    }
  }
  return canonical;
}
/** Original internal factory with both local-status and explicit-status overloads. @param id - Requested system ID. @param status - ICU status, local zero by default. @returns Owned Olson zone/null. */
export function createSystemTimeZone(
  id: UnicodeString,
  status: [number] = [0],
): OlsonTimeZone | null {
  if (U_FAILURE(status[0])) return null;
  const res = new UResourceBundle(),
    top = openOlsonResource(id, res, status);
  let zone: OlsonTimeZone | null = null;
  if (!U_FAILURE(status[0])) zone = new OlsonTimeZone(top, res, id, status);
  ures_close(top);
  ures_close(res);
  return U_FAILURE(status[0]) ? null : zone;
}
