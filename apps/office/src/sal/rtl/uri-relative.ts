/** @fileoverview Original independent RFC3986 relative-resolution algorithm from sal/rtl/uri.cxx. */
import { isAsciiAlpha, isAsciiAlphanumeric } from "../inc/rtl/character";
import { OUStringBuffer } from "../inc/rtl/ustrbuf";
import { StringConcat } from "../inc/rtl/stringconcat";
import { OUString } from "../inc/rtl/ustring";
import {
  rtl_uString_assign,
  rtl_ustr_lastIndexOfChar_WithLength,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../inc/rtl/ustring.h";
/** Original pointer range; null preserves absence separately from an empty present component. */
type Component = Uint16Array | null;
/** Original liberal parser components including their delimiters. */
interface Components {
  scheme: Component;
  authority: Component;
  path: Uint16Array;
  query: Component;
  fragment: Component;
}
/** Original liberal reference parser over borrowed native units. @param input - Actual string data. @returns Borrowed component views. */
function parseUriRef(input: rtl_uString): Components {
  const data = input.buffer,
    end = input.length;
  let pos = 0,
    scheme: Component = null,
    authority: Component = null,
    query: Component = null,
    fragment: Component = null;
  if (pos !== end && isAsciiAlpha(data[pos] as number)) {
    for (let p = pos + 1; p !== end; ++p) {
      if (data[p] === 0x3a) {
        scheme = data.subarray(0, ++p);
        pos = p;
        break;
      }
      if (
        !isAsciiAlphanumeric(data[p] as number) &&
        data[p] !== 0x2b &&
        data[p] !== 0x2d &&
        data[p] !== 0x2e
      )
        break;
    }
  }
  if (end - pos >= 2 && data[pos] === 0x2f && data[pos + 1] === 0x2f) {
    const begin = pos;
    pos += 2;
    while (pos !== end && data[pos] !== 0x2f && data[pos] !== 0x3f && data[pos] !== 0x23) ++pos;
    authority = data.subarray(begin, pos);
  }
  const begin = pos;
  while (pos !== end && data[pos] !== 0x3f && data[pos] !== 0x23) ++pos;
  const path = data.subarray(begin, pos);
  if (pos !== end && data[pos] === 0x3f) {
    const begin = pos++;
    while (pos !== end && data[pos] !== 0x23) ++pos;
    query = data.subarray(begin, pos);
  }
  if (pos !== end) {
    if (data[pos] !== 0x23) throw new Error("assert(*pPos == '#')");
    fragment = data.subarray(pos, end);
  }
  return { scheme, authority, path, query, fragment };
}
/** Original dot-segment append, preserving output boundary and preceding-slash state. @param buffer - Actual RTL owner. @param start - Protected output prefix. @param precedingSlash - Original slash state. @param path - Borrowed path range. @returns Nothing. */
function appendPath(
  buffer: OUStringBuffer,
  start: number,
  precedingSlash: boolean,
  path: Uint16Array,
): void {
  let begin = 0;
  while (precedingSlash || begin !== path.length) {
    let p = begin;
    while (p !== path.length && path[p] !== 0x2f) ++p;
    const n = p - begin;
    if (n === 1 && path[begin] === 0x2e) {
      /* Original dot removal preserves slash state. */
    } else if (n === 2 && path[begin] === 0x2e && path[begin + 1] === 0x2e) {
      if (precedingSlash)
        buffer.truncate(
          start +
            Math.max(
              rtl_ustr_lastIndexOfChar_WithLength(
                buffer.getStr().subarray(start),
                buffer.getLength() - start,
                0x2f,
              ),
              0,
            ),
        );
    } else {
      if (precedingSlash) buffer.append(Uint16Array.of(0x2f), 1);
      buffer.append(path.subarray(begin, p), n);
      precedingSlash = p !== path.length;
    }
    begin = p + (p === path.length ? 0 : 1);
  }
}
/** Original C entry point; malformed base changes only exception, leaving result intact. @param base - Borrowed base. @param relative - Borrowed relative reference. @param result - Native result slot. @param exception - Native exception-message slot. @returns Original success flag. */
export function rtl_uriConvertRelToAbs(
  base: rtl_uString,
  relative: rtl_uString,
  result: rtl_uStringSlot,
  exception: rtl_uStringSlot,
): boolean {
  const rel = parseUriRef(relative),
    buffer = new OUStringBuffer(256);
  const append =
    /** Appends a present URI component to the result buffer. @param component - Borrowed component, or null when absent. @returns Nothing. */ (
      component: Component,
    ): void => {
      if (component !== null) buffer.append(component, component.length);
    };
  try {
    if (rel.scheme !== null) {
      append(rel.scheme);
      append(rel.authority);
      appendPath(buffer, buffer.getLength(), false, rel.path);
      append(rel.query);
    } else {
      const abs = parseUriRef(base);
      if (abs.scheme === null) {
        const suffix = Uint16Array.from(
          "> does not start with a scheme component",
          /** Converts a literal character to its code unit without normalization. @param c - Character from the literal. @returns Character code unit. */ (
            c,
          ) => c.charCodeAt(0),
        );
        const value = new OUString(
          new StringConcat(
            new StringConcat(OUString.Concat(Uint16Array.of(0x3c)), OUString.unacquired([base])),
            suffix,
          ),
        );
        try {
          rtl_uString_assign(exception, value.pData as rtl_uString);
        } finally {
          value.dispose();
        }
        return false;
      }
      append(abs.scheme);
      if (rel.authority !== null) {
        append(rel.authority);
        appendPath(buffer, buffer.getLength(), false, rel.path);
        append(rel.query);
      } else {
        append(abs.authority);
        if (rel.path.length === 0) {
          append(abs.path);
          append(rel.query !== null ? rel.query : abs.query);
        } else {
          if (rel.path[0] === 0x2f) appendPath(buffer, buffer.getLength(), false, rel.path);
          else if (abs.authority !== null && abs.path.length === 0)
            appendPath(buffer, buffer.getLength(), true, rel.path);
          else {
            const n = buffer.getLength(),
              i = rtl_ustr_lastIndexOfChar_WithLength(abs.path, abs.path.length, 0x2f);
            if (i >= 0) appendPath(buffer, n, false, abs.path.subarray(0, i));
            appendPath(buffer, n, i >= 0, rel.path);
          }
          append(rel.query);
        }
      }
    }
    append(rel.fragment);
    const value = buffer.makeStringAndClear();
    try {
      rtl_uString_assign(result, value.pData as rtl_uString);
    } finally {
      value.dispose();
    }
    return true;
  } finally {
    buffer.dispose();
  }
}
