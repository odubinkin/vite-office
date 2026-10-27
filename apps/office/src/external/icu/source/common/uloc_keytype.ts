/** @fileoverview Original ICU78.3 locale key/type resource initialization and bidirectional lookup from uloc_keytype.cpp. Maps preserve counted case-insensitive narrow string-view identity; native pools/mutex/allocator/cleanup/ABI are not simulated. */
import * as R from "./uresbund";
import { U_FAILURE, U_SUCCESS } from "./unicode/utypes";
import { u_UCharsToChars } from "./uinvchar";
const SPECIALTYPE_CODEPOINTS = 1,
  SPECIALTYPE_REORDER_CODE = 2,
  SPECIALTYPE_RG_KEY_VALUE = 4;
/** Original owned type entry, shared by all its legacy/BCP/alias keys. */
interface LocExtType {
  readonly legacyId: string;
  readonly bcpId: string;
}
/** Original key entry owns one type map and special-type flags. */
interface LocExtKeyData {
  readonly legacyId: string;
  readonly bcpId: string;
  readonly typeMap: Map<string, LocExtType>;
  readonly specialTypes: number;
}
let gLocExtKeyMap: Map<string, LocExtKeyData> | null = null;
/** Original uhash_compareIStringView semantic key, including embedded NUL and original counted length. @param text - Narrow view. @returns ASCII-folded map key. */
function hashKey(text: string): string {
  let value = "";
  for (let i = 0; i < text.length; ++i) {
    const c = text.charCodeAt(i);
    value += String.fromCharCode(c >= 65 && c <= 90 ? c + 32 : c);
  }
  return value;
}
/** Projects source UnicodeString/copyInvariantChars output through the actual invariant conversion; strings own the consumed FixedString bytes without a native allocator claim. @param bundle - Resource owner. @param status - Sticky status. @returns Narrow C-string content. */
function invariantValue(bundle: R.UResourceBundle | null, status: [number]): string {
  const text = R.ures_getString(bundle, null, status);
  if (text === null) return "";
  const bytes = new Uint8Array(text.length);
  u_UCharsToChars(text, bytes, text.length);
  let value = "";
  for (const c of bytes) {
    if (c === 0) break;
    value += String.fromCharCode(c);
  }
  return value;
}
/** Original timezone resource-only colon/slash remapping. @param text - Owned/borrowed resource ID. @returns Normalized source ID. */
function timezoneId(text: string): string {
  let value = "";
  for (let i = 0; i < text.length; ++i) value += text[i] === ":" ? "/" : text[i];
  return value;
}
/** Original map initialization consumes the actual pinned resource owners and iterator protocol. Native allocation failures, init races and global cleanup remain outside this port; local bundle owners follow source close boundaries. @param sts - Sticky resource status. @returns Nothing. */
function initFromResourceBundle(sts: [number]): void {
  const map = new Map<string, LocExtKeyData>();
  gLocExtKeyMap = map;
  const root = R.ures_openDirect(null, "keyTypeData", sts),
    keyMap = R.ures_getByKey(root, "keyMap", null, sts),
    typeMap = R.ures_getByKey(root, "typeMap", null, sts);
  let typeAlias: R.UResourceBundle | null = null,
    bcpTypeAlias: R.UResourceBundle | null = null,
    keyEntry: R.UResourceBundle | null = null;
  try {
    if (U_FAILURE(sts[0])) return;
    typeAlias = R.ures_getByKey(root, "typeAlias", null, [0]);
    bcpTypeAlias = R.ures_getByKey(root, "bcpTypeAlias", null, [0]);
    while (R.ures_hasNext(keyMap)) {
      keyEntry = R.ures_getNextResource(keyMap, keyEntry, sts);
      if (U_FAILURE(sts[0])) break;
      const legacyKeyId = R.ures_getKey(keyEntry) as string,
        uBcpKeyId = invariantValue(keyEntry, sts);
      if (U_FAILURE(sts[0])) break;
      const bcpKeyId = uBcpKeyId.length === 0 ? legacyKeyId : uBcpKeyId,
        isTZ = legacyKeyId === "timezone",
        types = new Map<string, LocExtType>();
      let specialTypes = 0;
      const typeAliasStatus: [number] = [0],
        bcpAliasStatus: [number] = [0];
      let typeAliasByKey =
          typeAlias !== null
            ? R.ures_getByKey(typeAlias, legacyKeyId, null, typeAliasStatus)
            : null,
        bcpAliasByKey =
          bcpTypeAlias !== null
            ? R.ures_getByKey(bcpTypeAlias, bcpKeyId, null, bcpAliasStatus)
            : null;
      if (U_FAILURE(typeAliasStatus[0])) typeAliasByKey = null;
      if (U_FAILURE(bcpAliasStatus[0])) bcpAliasByKey = null;
      const typeMapByKey = R.ures_getByKey(typeMap, legacyKeyId, null, sts);
      if (U_SUCCESS(sts[0])) {
        let typeEntry: R.UResourceBundle | null = null;
        while (R.ures_hasNext(typeMapByKey)) {
          typeEntry = R.ures_getNextResource(typeMapByKey, typeEntry, sts);
          if (U_FAILURE(sts[0])) break;
          let legacyTypeId = R.ures_getKey(typeEntry) as string;
          if (legacyTypeId === "CODEPOINTS") {
            specialTypes |= SPECIALTYPE_CODEPOINTS;
            continue;
          }
          if (legacyTypeId === "REORDER_CODE") {
            specialTypes |= SPECIALTYPE_REORDER_CODE;
            continue;
          }
          if (legacyTypeId === "RG_KEY_VALUE") {
            specialTypes |= SPECIALTYPE_RG_KEY_VALUE;
            continue;
          }
          if (isTZ) legacyTypeId = timezoneId(legacyTypeId);
          const uBcpTypeId = invariantValue(typeEntry, sts);
          if (U_FAILURE(sts[0])) break;
          const bcpTypeId = uBcpTypeId.length === 0 ? legacyTypeId : uBcpTypeId,
            t: LocExtType = { legacyId: legacyTypeId, bcpId: bcpTypeId };
          types.set(hashKey(t.legacyId), t);
          if (bcpTypeId !== legacyTypeId) types.set(hashKey(t.bcpId), t);
          if (typeAliasByKey !== null) {
            let aliasEntry: R.UResourceBundle | null = null;
            R.ures_resetIterator(typeAliasByKey);
            while (R.ures_hasNext(typeAliasByKey) && U_SUCCESS(sts[0])) {
              aliasEntry = R.ures_getNextResource(typeAliasByKey, aliasEntry, sts);
              const to = R.ures_getString(aliasEntry, null, sts);
              if (U_FAILURE(sts[0])) break;
              if (t.legacyId === to) {
                let from = R.ures_getKey(aliasEntry) as string;
                if (isTZ) from = timezoneId(from);
                types.set(hashKey(from), t);
              }
            }
            R.ures_close(aliasEntry);
            if (U_FAILURE(sts[0])) break;
          }
          if (bcpAliasByKey !== null) {
            let aliasEntry: R.UResourceBundle | null = null;
            R.ures_resetIterator(bcpAliasByKey);
            while (R.ures_hasNext(bcpAliasByKey) && U_SUCCESS(sts[0])) {
              aliasEntry = R.ures_getNextResource(bcpAliasByKey, aliasEntry, sts);
              const to = R.ures_getString(aliasEntry, null, sts);
              if (U_FAILURE(sts[0])) break;
              if (t.bcpId === to) types.set(hashKey(R.ures_getKey(aliasEntry) as string), t);
            }
            R.ures_close(aliasEntry);
            if (U_FAILURE(sts[0])) break;
          }
        }
        R.ures_close(typeEntry);
      }
      R.ures_close(typeMapByKey);
      R.ures_close(bcpAliasByKey);
      R.ures_close(typeAliasByKey);
      // The source unreachable assertion on a missing required typeMap does not turn into a new release-mode error.
      if (U_FAILURE(sts[0])) break;
      const keyData: LocExtKeyData = {
        legacyId: legacyKeyId,
        bcpId: bcpKeyId,
        specialTypes,
        typeMap: types,
      };
      map.set(hashKey(legacyKeyId), keyData);
      if (legacyKeyId !== bcpKeyId) map.set(hashKey(bcpKeyId), keyData);
    }
  } finally {
    R.ures_close(keyEntry);
    R.ures_close(bcpTypeAlias);
    R.ures_close(typeAlias);
    R.ures_close(typeMap);
    R.ures_close(keyMap);
    R.ures_close(root);
  }
}
let initialized = false;
/** Original successful init-once gate. @returns Initialized. */
function init(): boolean {
  if (initialized) return true;
  const status: [number] = [0];
  initFromResourceBundle(status);
  if (U_FAILURE(status[0])) return false;
  initialized = true;
  return true;
}
/** Original CODEPOINTS grammar, without codepoint-range validation. @param value - Counted source view. @returns Accepted. */
function isSpecialTypeCodepoints(value: string): boolean {
  let n = 0;
  for (let i = 0; i < value.length; ++i) {
    const c = value[i] as string;
    if (c === "-") {
      if (n < 4 || n > 6) return false;
      n = 0;
    } else if ((c >= "0" && c <= "9") || (c >= "A" && c <= "F") || (c >= "a" && c <= "f")) ++n;
    else return false;
  }
  return n >= 4 && n <= 6;
}
/** Original REORDER_CODE grammar. @param value - Counted view. @returns Accepted. */
function isSpecialTypeReorderCode(value: string): boolean {
  let n = 0;
  for (let i = 0; i < value.length; ++i) {
    const c = value[i] as string;
    if (c === "-") {
      if (n < 3 || n > 8) return false;
      n = 0;
    } else if ((c >= "A" && c <= "Z") || (c >= "a" && c <= "z")) ++n;
    else return false;
  }
  return n >= 3 && n <= 8;
}
/** Original RG_KEY_VALUE accepts two letters followed by exactly four z letters. @param value - Counted view. @returns Accepted. */
function isSpecialTypeRgKeyValue(value: string): boolean {
  let n = 0;
  for (let i = 0; i < value.length; ++i) {
    const c = value[i] as string;
    if (
      (n < 2 && ((c >= "A" && c <= "Z") || (c >= "a" && c <= "z"))) ||
      (n >= 2 && (c === "Z" || c === "z"))
    )
      ++n;
    else return false;
  }
  return n === 6;
}
/** Original consumed special-type checks preserve the input view when matched. @param data - Key owner. @param value - Source view. @returns Match. */
function special(data: LocExtKeyData, value: string): boolean {
  let matched = false;
  if (data.specialTypes & SPECIALTYPE_CODEPOINTS) matched = isSpecialTypeCodepoints(value);
  if (!matched && data.specialTypes & SPECIALTYPE_REORDER_CODE)
    matched = isSpecialTypeReorderCode(value);
  if (!matched && data.specialTypes & SPECIALTYPE_RG_KEY_VALUE)
    matched = isSpecialTypeRgKeyValue(value);
  return matched;
}
/** Consumed std::string_view return projection. inputAlias records the actual source-pointer distinction used by uloc_tag conversion; no native address/ABI identity is synthesized. */
export interface KeyTypeStringView {
  readonly value: string;
  readonly inputAlias: boolean;
}
/** Original BCP key map lookup, no syntax fallback. @param key - Counted view. @returns Canonical borrowed view/null. */
export function ulocimp_toBcpKey(key: string): KeyTypeStringView | null {
  if (!init()) return null;
  const value = gLocExtKeyMap?.get(hashKey(key))?.bcpId;
  return value === undefined ? null : { value, inputAlias: false };
}
/** Original legacy key map lookup. @param key - Counted view. @returns Canonical borrowed view/null. */
export function ulocimp_toLegacyKey(key: string): KeyTypeStringView | null {
  if (!init()) return null;
  const value = gLocExtKeyMap?.get(hashKey(key))?.legacyId;
  return value === undefined ? null : { value, inputAlias: false };
}
/** Original BCP type map lookup and special-type input alias. @param key - Counted key. @param type - Counted type. @returns Canonical or input view/null. */
export function ulocimp_toBcpType(key: string, type: string): KeyTypeStringView | null {
  if (!init()) return null;
  const data = gLocExtKeyMap?.get(hashKey(key));
  if (data !== undefined) {
    const t = data.typeMap.get(hashKey(type));
    if (t !== undefined) return { value: t.bcpId, inputAlias: false };
    if (special(data, type)) return { value: type, inputAlias: true };
  }
  return null;
}
/** Original legacy type map lookup and special-type input alias. @param key - Counted key. @param type - Counted type. @returns Canonical or input view/null. */
export function ulocimp_toLegacyType(key: string, type: string): KeyTypeStringView | null {
  if (!init()) return null;
  const data = gLocExtKeyMap?.get(hashKey(key));
  if (data !== undefined) {
    const t = data.typeMap.get(hashKey(type));
    if (t !== undefined) return { value: t.legacyId, inputAlias: false };
    if (special(data, type)) return { value: type, inputAlias: true };
  }
  return null;
}
