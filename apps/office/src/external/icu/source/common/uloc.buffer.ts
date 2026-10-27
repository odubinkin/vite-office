/** @fileoverview Original ICU78.3 locale C-buffer name/component facades from uloc.cpp. Default lookup precedes the shared checked-array status guard exactly as upstream. */
import { ByteSinkUtil } from "./bytesinkutil";
import * as N from "./uloc.normalize";
import { ulocimp_getSubtags } from "./uloc.subtags";
import { locale_get_default } from "./locid.default";
/** Original nullable C locale ID boundary. @param id - Source C ID/null current-default request. @returns C prefix. */
function localeID(id: string | null): string {
  if (id === null) return locale_get_default();
  const i = id.indexOf("\0");
  return i < 0 ? id : id.slice(0, i);
}
/** Original C name normalizer. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_getName(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Runs source normalization on the actual checked sink. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => N.ulocimp_getName(text, sink, s),
    status,
  );
}
/** Original C base-name normalizer. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_getBaseName(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Runs source base-name mode. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => N.ulocimp_getBaseName(text, sink, s),
    status,
  );
}
/** Original C legacy canonicalizer. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_canonicalize(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Runs source legacy canonicalization. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => N.ulocimp_canonicalize(text, sink, s),
    status,
  );
}
/** Original C language getter keeps subtag-parser early return for language-only output. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_getLanguage(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Selects original language sink only. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_getSubtags(text, sink, null, null, null, null, s),
    status,
  );
}
/** Original C script getter. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_getScript(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Selects original script sink. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_getSubtags(text, null, sink, null, null, null, s),
    status,
  );
}
/** Original C country getter. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_getCountry(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Selects original region sink. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_getSubtags(text, null, null, sink, null, null, s),
    status,
  );
}
/** Original C variant getter. @param id - C ID/null. @param buffer - Actual output. @param capacity - Native capacity. @param status - Sticky status. @returns Required length/failure zero. */
export function uloc_getVariant(
  id: string | null,
  buffer: Uint8Array | null,
  capacity: number,
  status: [number],
): number {
  const text = localeID(id);
  return ByteSinkUtil.viaByteSinkToTerminatedChars(
    buffer,
    capacity,
    /** Selects original variant sink. @param sink - Owner. @param s - Status. @returns Nothing. */ (
      sink,
      s,
    ) => ulocimp_getSubtags(text, null, null, null, sink, null, s),
    status,
  );
}
