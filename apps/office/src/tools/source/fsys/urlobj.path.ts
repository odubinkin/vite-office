/** @fileoverview Native INetURLObject::parsePath protocol branches, delimiter handling and escaped-character admission. */
import { EncodeMechanism, EscapeType, INetProtocol as Protocol, Part } from "../../inc/urlobj";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import { isAsciiAlpha } from "../../../sal/inc/rtl/character";
import { getUTF32, appendUCS4, type UriCursor } from "./urlobj";

/** Original path parser. The returned full string binds rSynPath; null binds failure/rollback. Cursor is updated only after a successful production. @param protocol - Native selected scheme. @param cursor - Native pointer range. @param mechanism - Escape interpretation. @param charset - Source encoding. @param skippedInitialSlash - File-path initial slash already admitted. @param segmentDelimiter - File segment delimiter. @param altSegmentDelimiter - Alternate file delimiter or disabled sentinel. @param queryDelimiter - Active query delimiter or disabled sentinel. @param fragmentDelimiter - Active fragment delimiter or disabled sentinel. @param initial - Already-produced native URI buffer. @returns Complete native buffer or null on failure. */
export function parsePath(
  protocol: Protocol,
  cursor: UriCursor,
  mechanism: EncodeMechanism,
  charset: rtl_TextEncoding,
  skippedInitialSlash: boolean,
  segmentDelimiter: number,
  altSegmentDelimiter: number,
  queryDelimiter: number,
  fragmentDelimiter: number,
  initial: string,
): string | null {
  const p = { ...cursor };
  let result = initial;
  const before = initial.length;
  switch (protocol) {
    case Protocol.NotValid:
      return null;
    case Protocol.Ftp:
      if (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== 47 &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      )
        return null;
      while (p.index < p.end && p.text.charCodeAt(p.index) !== fragmentDelimiter)
        result += appendUCS4(getUTF32(p, mechanism, charset), Part.PART_HTTP_PATH, charset, true);
      if (result.length === before) result += "/";
      break;
    case Protocol.Http:
    case Protocol.VndSunStarWebdav:
    case Protocol.Https:
    case Protocol.Smb:
    case Protocol.Cmis:
      if (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== 47 &&
        p.text.charCodeAt(p.index) !== queryDelimiter &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      )
        return null;
      while (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== queryDelimiter &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      )
        result += appendUCS4(getUTF32(p, mechanism, charset), Part.PART_HTTP_PATH, charset, true);
      if (result.length === before) result += "/";
      break;
    case Protocol.File:
      if (skippedInitialSlash) result += "/";
      else if (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== segmentDelimiter &&
        p.text.charCodeAt(p.index) !== altSegmentDelimiter
      )
        return null;
      while (p.index < p.end && p.text.charCodeAt(p.index) !== fragmentDelimiter) {
        const scalar = getUTF32(p, mechanism, charset);
        if (scalar.escape === EscapeType.NONE) {
          if (scalar.value === segmentDelimiter || scalar.value === altSegmentDelimiter) {
            result += "/";
            continue;
          }
          if (
            scalar.value === 124 &&
            (p.index === p.end ||
              p.text.charCodeAt(p.index) === fragmentDelimiter ||
              p.text.charCodeAt(p.index) === segmentDelimiter ||
              p.text.charCodeAt(p.index) === altSegmentDelimiter) &&
            result.length - before === 2 &&
            isAsciiAlpha(result.charCodeAt(before + 1))
          ) {
            result += ":";
            continue;
          }
        }
        result += appendUCS4(scalar, Part.PART_PCHAR, charset, true);
      }
      if (result.length === before) result += "/";
      break;
    case Protocol.Mailto:
      while (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== queryDelimiter &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      )
        result += appendUCS4(getUTF32(p, mechanism, charset), Part.PART_MAILTO, charset, true);
      break;
    case Protocol.PrivSoffice:
    case Protocol.Slot:
    case Protocol.Hid:
    case Protocol.Macro:
    case Protocol.Uno:
    case Protocol.Component:
    case Protocol.Ldap:
      while (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== queryDelimiter &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      )
        result += appendUCS4(
          getUTF32(p, mechanism, charset),
          Part.PART_PATH_BEFORE_QUERY,
          charset,
          true,
        );
      break;
    case Protocol.VndSunStarHelp:
      if (
        p.index === p.end ||
        p.text.charCodeAt(p.index) === queryDelimiter ||
        p.text.charCodeAt(p.index) === fragmentDelimiter
      )
        result += "/";
      else {
        if (p.text.charCodeAt(p.index) !== 47) return null;
        while (
          p.index < p.end &&
          p.text.charCodeAt(p.index) !== queryDelimiter &&
          p.text.charCodeAt(p.index) !== fragmentDelimiter
        )
          result += appendUCS4(getUTF32(p, mechanism, charset), Part.PART_HTTP_PATH, charset, true);
      }
      break;
    case Protocol.Javascript:
    case Protocol.Data:
    case Protocol.Cid:
    case Protocol.Db:
      while (p.index < p.end && p.text.charCodeAt(p.index) !== fragmentDelimiter)
        result += appendUCS4(getUTF32(p, mechanism, charset), Part.PART_URIC, charset, true);
      break;
    case Protocol.VndSunStarHier:
    case Protocol.VndSunStarPkg:
      if (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== 47 &&
        p.text.charCodeAt(p.index) !== queryDelimiter &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      )
        return null;
      while (
        p.index < p.end &&
        p.text.charCodeAt(p.index) !== queryDelimiter &&
        p.text.charCodeAt(p.index) !== fragmentDelimiter
      ) {
        const scalar = getUTF32(p, mechanism, charset);
        result +=
          scalar.escape === EscapeType.NONE && scalar.value === 47
            ? "/"
            : appendUCS4(scalar, Part.PART_PCHAR, charset, false);
      }
      if (result.length === before) result += "/";
      break;
    case Protocol.VndSunStarCmd:
    case Protocol.VndSunStarExpand: {
      if (p.index === p.end || p.text.charCodeAt(p.index) === fragmentDelimiter) return null;
      let part = Part.PART_URIC_NO_SLASH;
      while (p.index < p.end && p.text.charCodeAt(p.index) !== fragmentDelimiter) {
        result += appendUCS4(getUTF32(p, mechanism, charset), part, charset, true);
        part = Part.PART_URIC;
      }
      break;
    }
    case Protocol.Telnet:
      if (p.index < p.end) {
        if (p.text.charCodeAt(p.index) !== 47 || p.end - p.index > 1) return null;
        ++p.index;
      }
      result += "/";
      break;
    case Protocol.VndSunStarTdoc:
      if (p.index === p.end || p.text.charCodeAt(p.index) !== 47) return null;
      while (p.index < p.end && p.text.charCodeAt(p.index) !== fragmentDelimiter) {
        const scalar = getUTF32(p, mechanism, charset);
        result +=
          scalar.escape === EscapeType.NONE && scalar.value === 47
            ? "/"
            : appendUCS4(scalar, Part.PART_PCHAR, charset, false);
      }
      break;
    case Protocol.Generic:
    case Protocol.Sftp:
      while (p.index < p.end && p.text.charCodeAt(p.index) !== fragmentDelimiter)
        result += appendUCS4(getUTF32(p, mechanism, charset), Part.PART_URIC, charset, true);
      if (result.length === 0) return null;
      break;
  }
  cursor.index = p.index;
  return result;
}
