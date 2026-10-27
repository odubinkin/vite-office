/** @fileoverview Observes complete logical bundle values using native-witness scalar encoding; no resource lookup algorithm is reconstructed here. */
import { type Resource } from "../external/icu/source/common/uresbund";
import {
  type UResourceDataEntry,
  ures_flushCache,
} from "../external/icu/source/common/uresbund.entries";
import * as R from "../external/icu/source/common/uresbund";
import { ResourceDataValue } from "../external/icu/source/common/uresdata";
import { init_resb_result } from "../external/icu/source/common/uresbund.alias";
import { ures_appendResPath } from "../external/icu/source/common/uresbund.lifecycle";
import {
  resPointer,
  res_findResource,
  resCString,
} from "../external/icu/source/common/uresdata.path";
import { locale_set_default_internal } from "../external/icu/source/common/locid.default";
const hashes = new WeakMap<Resource, number>();
/** Full immutable content hash, memoized by raw node identity. @param r - Node/bogus. @returns Native uint32 digest. */
function hash(r: Resource | null): number {
  if (r === null) return 0;
  if (hashes.has(r)) return hashes.get(r) as number;
  let h = 2166136261;
  /** Adds one canonical uint32 in little-endian order. @param v - Value. @returns Nothing. */
  function mix(v: number): void {
    for (let i = 0; i < 4; ++i) {
      h ^= (v >>> (8 * i)) & 255;
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  mix(r.type);
  if (r.type === 0 || r.type === 3) {
    mix(r.value.length);
    for (let i = 0; i < r.value.length; ++i) mix(r.value.charCodeAt(i));
  } else if (r.type === 7) mix(r.value);
  else if (r.type === 1 || r.type === 14) {
    mix(r.value.length);
    for (const n of r.value) mix(n);
  } else if (r.type === 8) {
    mix(r.value.length);
    for (const child of r.value) mix(hash(child));
  } else if (r.type === 2) {
    mix(r.keys.length);
    for (const k of r.keys) {
      mix(k.length);
      for (let i = 0; i < k.length; ++i) mix(k.charCodeAt(i));
      mix(hash(r.value[k] as Resource));
    }
  }
  hashes.set(r, h);
  return h;
}
/** Narrow transport retains counted NUL. @param s - Storage. @returns Hex. */
function hex(s: string): string {
  return Buffer.from(s, "latin1").toString("hex") || "-";
}
/** C key transport. @param s - Key/null. @returns Hex. */
function cHex(s: string | null): string {
  return s === null ? "~" : hex(resCString(s));
}
/** Native complete retained entry line, including pool references. @param e - Entry/null. @returns Snapshot. */
function line(e: UResourceDataEntry | null): string {
  if (e === null) return "~";
  const items = [];
  for (; e !== null; e = e.fParent)
    items.push([hex(e.fName), e.fCountExisting, e.fPool?.fCountExisting ?? -1].join(":"));
  return items.join(",");
}
/** Exact initialized logical bundle fields and source-valid path bytes. @param b - Bundle/null. @returns Snapshot. */
function snap(b: R.UResourceBundle | null): string {
  if (b === null) return "~";
  return [
    cHex(b.fKey),
    cHex(b.fData?.fName ?? null),
    cHex(b.fValidLocaleDataEntry?.fName ?? null),
    Number(b.fHasFallback),
    Number(b.fIsTopLevel),
    b.fIndex,
    b.fSize,
    R.ures_getType(b),
    b.fResPath === null ? "~" : cHex(resCString(b.fResPath)),
    b.fResPathLen,
    Number(b.fResPath === b.fResBuf),
    Buffer.from(b.fResBuf).toString("hex"),
    b.fResPath === null
      ? "~"
      : Buffer.from(b.fResPath.subarray(0, b.fResPathLen + 1)).toString("hex"),
    Number(b.isStackObject),
    b.fData === null ? 0 : hash(b.fRes),
    line(b.fData),
  ].join(" ");
}
/** Source UTF16 buffer transport, including counted NUL. @param s - String/null. @returns Hex. */
function uhex(s: string | null): string {
  if (s === null) return "~";
  let out = "";
  for (let i = 0; i < s.length; ++i) out += s.charCodeAt(i).toString(16).padStart(4, "0");
  return out || "-";
}
/** Decodes original narrow query transport. @param text - Hex bytes. @returns Counted narrow span. */
function unhex(text: string | undefined): string {
  if (text === undefined) throw new Error("Incomplete native bundle query");
  return text === "-" ? "" : Buffer.from(text, "hex").toString("latin1");
}
/** Replays a public native bundle query with its initialized ownership boundaries. @param query - Native input tuple. @returns Complete logical observation. */
export function observeNativeBundle(query: string): string {
  const [modeText, primeText, nameText, baseText, op, queryText, initialText, fillText] =
    query.split(" ");
  const mode = Number(modeText),
    prime = Number(primeText),
    initial = Number(initialText),
    fillMode = Number(fillText);
  const name = nameText === "~" ? null : unhex(nameText),
    basePath = unhex(baseText),
    q = unhex(queryText);
  locale_set_default_internal("en_US", [0]);
  if (prime) R.ures_close(R.ures_open(null, name, [0]));
  const status: [number] = [op === "O" ? initial : 0],
    root =
      mode === 3
        ? openFill(name, status)
        : mode === 2
          ? R.ures_openDirect(null, name, status)
          : mode === 1
            ? R.ures_openNoDefault(null, name, status)
            : R.ures_open(null, name, status),
    opening = status[0];
  let base = root;
  if (status[0] <= 0 && basePath !== "")
    base = R.ures_getByKeyWithFallback(root, basePath, null, status);
  const baseStatus = status[0],
    fill = new R.UResourceBundle(),
    dest = fillMode === 0 ? null : fillMode === 2 ? base : fill;
  if (fillMode === 3 && root !== null) R.ures_copyResb(fill, root, [0]);
  let result = dest,
    scalar = "~";
  const length: [number] = [77];
  if (status[0] <= 0 && base !== null) {
    status[0] = initial;
    if (op === "V") {
      if (dest === null) throw new Error("Value queries require a caller-owned temporary");
      const value = new ResourceDataValue();
      R.ures_getValueWithFallback(base, "", dest, value, [0]);
      R.ures_getValueWithFallback(base, q, dest, value, status);
      scalar = [
        value.getType(),
        hash(value.getResource()),
        cHex(value.getValidLocaleDataEntry()?.fName ?? null),
        Number(value.getData() === base?.fData?.fData),
        Number(dest !== null && dest.fData !== null && value.getData() === dest.fData.fData),
      ].join(":");
    } else if (op === "D") {
      const sep = q.indexOf("/"),
        key: [string | null] = [null],
        path: [ReturnType<typeof resPointer>] = [resPointer(q.slice(sep + 1))],
        raw = res_findResource(base?.fRes ?? null, path, key);
      result = init_resb_result(
        base?.fData as UResourceDataEntry,
        raw,
        key[0],
        -1,
        base?.fValidLocaleDataEntry ?? null,
        base?.fResPath ?? null,
        Number(q.slice(0, sep)),
        dest,
        status,
      );
    } else if (op === "A") {
      result = R.ures_copyResb(dest, base, status);
      if (status[0] <= 0 && result !== null) {
        const sep = q.indexOf("/");
        ures_appendResPath(result, q.slice(sep + 1), Number(q.slice(0, sep)), status);
      }
    } else if (op === "F") result = R.ures_getByKeyWithFallback(base, q, dest, status);
    else if (op === "R") result = R.ures_getByKey(base, q, dest, status);
    else if (op === "I") result = R.ures_getByIndex(base, Number(q), dest, status);
    else if (op === "C") result = R.ures_copyResb(dest, base, status);
    else if (op === "N") result = R.ures_getNextResource(base, dest, status);
    else if (op === "S") scalar = uhex(R.ures_getStringByKey(base, q, length, status));
    else if (op === "G") scalar = uhex(R.ures_getStringByKeyWithFallback(base, q, length, status));
    else if (op === "s") scalar = uhex(R.ures_getStringByIndex(base, Number(q), length, status));
    else if (op === "L") scalar = cHex(R.ures_getLocaleByType(base, Number(q), status));
  }
  const observed = [
    opening,
    baseStatus,
    status[0],
    length[0],
    scalar,
    snap(result),
    "|",
    snap(base),
    "|",
    line(root?.fData ?? null),
  ].join(" ");
  if (result !== null && result !== base && result !== root && result !== fill)
    R.ures_close(result);
  if (base !== root) R.ures_close(base);
  R.ures_close(root);
  R.ures_close(fill);
  ures_flushCache();
  return observed;
}
/** Original fill-in open reuses an already-owned stack handle. @param name - Locale/default. @param status - Status. @returns Stack result. */
function openFill(name: string | null, status: [number]): R.UResourceBundle {
  const root = new R.UResourceBundle(),
    old = R.ures_openDirect(null, "root", [0]);
  R.ures_copyResb(root, old, [0]);
  R.ures_close(old);
  R.ures_openFillIn(root, null, name, status);
  return root;
}
