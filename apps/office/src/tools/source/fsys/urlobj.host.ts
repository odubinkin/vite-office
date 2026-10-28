/** @fileoverview Native INetURLObject host state machine and NetBIOS fallback used by URI authority parsing. */
import * as rtl from "../../../sal/inc/rtl/character";
import { EncodeMechanism, Part } from "../../inc/urlobj";
import type { rtl_TextEncoding } from "../../../sal/inc/rtl/textenc";
import { appendUCS4, getUTF32, type UriCursor } from "./urlobj";
/** Original host parser states, including IPv4/IPv6 ambiguity handling. */
enum State {
  STATE_INITIAL,
  STATE_LABEL,
  STATE_LABEL_HYPHEN,
  STATE_LABEL_DOT,
  STATE_TOPLABEL,
  STATE_TOPLABEL_HYPHEN,
  STATE_TOPLABEL_DOT,
  STATE_IP4,
  STATE_IP4_DOT,
  STATE_IP6,
  STATE_IP6_COLON,
  STATE_IP6_2COLON,
  STATE_IP6_3COLON,
  STATE_IP6_HEXSEQ1,
  STATE_IP6_HEXSEQ1_COLON,
  STATE_IP6_HEXSEQ1_MAYBE_IP4,
  STATE_IP6_HEXSEQ2,
  STATE_IP6_HEXSEQ2_COLON,
  STATE_IP6_HEXSEQ2_MAYBE_IP4,
  STATE_IP6_IP4,
  STATE_IP6_IP4_DOT,
  STATE_IP6_DONE,
}
/** Original host parser; canonical string binds the native optional output buffer. Failed scans leave the caller cursor unchanged. @param cursor - Native UTF16 pointer range. @returns Canonical host on success, null on failure. */
export function parseHost(cursor: UriCursor): string | null {
  let nNumber = 0;
  let nDigits = 0;
  let nOctets = 0;
  let eState: State = State.STATE_INITIAL;
  let p = cursor.index;
  let canonic = "";
  hostLoop: for (; p != cursor.end; ++p)
    switch (eState) {
      case State.STATE_INITIAL:
        if (cursor.text.charCodeAt(p) == 91) {
          canonic += String.fromCharCode(91);
          eState = State.STATE_IP6;
        } else if (rtl.isAsciiAlpha(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_TOPLABEL;
        else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          nOctets = 1;
          eState = State.STATE_IP4;
        } else break hostLoop;
        break;

      case State.STATE_LABEL:
        if (cursor.text.charCodeAt(p) == 46) eState = State.STATE_LABEL_DOT;
        else if (cursor.text.charCodeAt(p) == 45) eState = State.STATE_LABEL_HYPHEN;
        else if (
          !rtl.isAsciiAlphanumeric(cursor.text.charCodeAt(p)) &&
          cursor.text.charCodeAt(p) != 95
        )
          break hostLoop;
        break;

      case State.STATE_LABEL_HYPHEN:
        if (rtl.isAsciiAlphanumeric(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_LABEL;
        else if (cursor.text.charCodeAt(p) != 45) break hostLoop;
        break;

      case State.STATE_LABEL_DOT:
        if (rtl.isAsciiAlpha(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_TOPLABEL;
        else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) eState = State.STATE_LABEL;
        else break hostLoop;
        break;

      case State.STATE_TOPLABEL:
        if (cursor.text.charCodeAt(p) == 46) eState = State.STATE_TOPLABEL_DOT;
        else if (cursor.text.charCodeAt(p) == 45) eState = State.STATE_TOPLABEL_HYPHEN;
        else if (
          !rtl.isAsciiAlphanumeric(cursor.text.charCodeAt(p)) &&
          cursor.text.charCodeAt(p) != 95
        )
          break hostLoop;
        break;

      case State.STATE_TOPLABEL_HYPHEN:
        if (rtl.isAsciiAlphanumeric(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_TOPLABEL;
        else if (cursor.text.charCodeAt(p) != 45) break hostLoop;
        break;

      case State.STATE_TOPLABEL_DOT:
        if (rtl.isAsciiAlpha(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_TOPLABEL;
        else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) eState = State.STATE_LABEL;
        else break hostLoop;
        break;

      case State.STATE_IP4:
        if (cursor.text.charCodeAt(p) == 46)
          if (nOctets < 4) {
            {
              canonic += String(nNumber);
              canonic += String.fromCharCode(46);
            }
            ++nOctets;
            eState = State.STATE_IP4_DOT;
          } else eState = State.STATE_LABEL_DOT;
        else if (cursor.text.charCodeAt(p) == 45) eState = State.STATE_LABEL_HYPHEN;
        else if (rtl.isAsciiAlpha(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_LABEL;
        else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p)))
          if (nDigits < 3) {
            nNumber = 10 * nNumber + (cursor.text.charCodeAt(p) - 48);
            ++nDigits;
          } else eState = State.STATE_LABEL;
        else break hostLoop;
        break;

      case State.STATE_IP4_DOT:
        if (rtl.isAsciiAlpha(cursor.text.charCodeAt(p)) || cursor.text.charCodeAt(p) == 95)
          eState = State.STATE_TOPLABEL;
        else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          eState = State.STATE_IP4;
        } else break hostLoop;
        break;

      case State.STATE_IP6:
        if (cursor.text.charCodeAt(p) == 58) eState = State.STATE_IP6_COLON;
        else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p))) {
          nNumber = Number.parseInt(cursor.text.charAt(p), 16);
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ1;
        } else break hostLoop;
        break;

      case State.STATE_IP6_COLON:
        if (cursor.text.charCodeAt(p) == 58) {
          canonic += "::";
          eState = State.STATE_IP6_2COLON;
        } else break hostLoop;
        break;

      case State.STATE_IP6_2COLON:
        if (cursor.text.charCodeAt(p) == 93) eState = State.STATE_IP6_DONE;
        else if (cursor.text.charCodeAt(p) == 58) {
          canonic += String.fromCharCode(58);
          eState = State.STATE_IP6_3COLON;
        } else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ2_MAYBE_IP4;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p))) {
          nNumber = Number.parseInt(cursor.text.charAt(p), 16);
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ2;
        } else break hostLoop;
        break;

      case State.STATE_IP6_3COLON:
        if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          nOctets = 1;
          eState = State.STATE_IP6_IP4;
        } else break hostLoop;
        break;

      case State.STATE_IP6_HEXSEQ1:
        if (cursor.text.charCodeAt(p) == 93) {
          canonic += nNumber.toString(16);
          eState = State.STATE_IP6_DONE;
        } else if (cursor.text.charCodeAt(p) == 58) {
          {
            canonic += nNumber.toString(16);
            canonic += String.fromCharCode(58);
          }
          eState = State.STATE_IP6_HEXSEQ1_COLON;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p)) && nDigits < 4) {
          nNumber = 16 * nNumber + Number.parseInt(cursor.text.charAt(p), 16);
          ++nDigits;
        } else break hostLoop;
        break;

      case State.STATE_IP6_HEXSEQ1_COLON:
        if (cursor.text.charCodeAt(p) == 58) {
          canonic += String.fromCharCode(58);
          eState = State.STATE_IP6_2COLON;
        } else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ1_MAYBE_IP4;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p))) {
          nNumber = Number.parseInt(cursor.text.charAt(p), 16);
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ1;
        } else break hostLoop;
        break;

      case State.STATE_IP6_HEXSEQ1_MAYBE_IP4:
        if (cursor.text.charCodeAt(p) == 93) {
          canonic += nNumber.toString(16);
          eState = State.STATE_IP6_DONE;
        } else if (cursor.text.charCodeAt(p) == 58) {
          {
            canonic += nNumber.toString(16);
            canonic += String.fromCharCode(58);
          }
          eState = State.STATE_IP6_HEXSEQ1_COLON;
        } else if (cursor.text.charCodeAt(p) == 46) {
          nNumber = 100 * (nNumber >> 8) + 10 * ((nNumber >> 4) & 15) + (nNumber & 15);
          {
            canonic += String(nNumber);
            canonic += String.fromCharCode(46);
          }
          nOctets = 2;
          eState = State.STATE_IP6_IP4_DOT;
        } else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p)) && nDigits < 3) {
          nNumber = 16 * nNumber + (cursor.text.charCodeAt(p) - 48);
          ++nDigits;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p)) && nDigits < 4) {
          nNumber = 16 * nNumber + Number.parseInt(cursor.text.charAt(p), 16);
          ++nDigits;
          eState = State.STATE_IP6_HEXSEQ1;
        } else break hostLoop;
        break;

      case State.STATE_IP6_HEXSEQ2:
        if (cursor.text.charCodeAt(p) == 93) {
          canonic += nNumber.toString(16);
          eState = State.STATE_IP6_DONE;
        } else if (cursor.text.charCodeAt(p) == 58) {
          {
            canonic += nNumber.toString(16);
            canonic += String.fromCharCode(58);
          }
          eState = State.STATE_IP6_HEXSEQ2_COLON;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p)) && nDigits < 4) {
          nNumber = 16 * nNumber + Number.parseInt(cursor.text.charAt(p), 16);
          ++nDigits;
        } else break hostLoop;
        break;

      case State.STATE_IP6_HEXSEQ2_COLON:
        if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ2_MAYBE_IP4;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p))) {
          nNumber = Number.parseInt(cursor.text.charAt(p), 16);
          nDigits = 1;
          eState = State.STATE_IP6_HEXSEQ2;
        } else break hostLoop;
        break;

      case State.STATE_IP6_HEXSEQ2_MAYBE_IP4:
        if (cursor.text.charCodeAt(p) == 93) {
          canonic += nNumber.toString(16);
          eState = State.STATE_IP6_DONE;
        } else if (cursor.text.charCodeAt(p) == 58) {
          {
            canonic += nNumber.toString(16);
            canonic += String.fromCharCode(58);
          }
          eState = State.STATE_IP6_HEXSEQ2_COLON;
        } else if (cursor.text.charCodeAt(p) == 46) {
          nNumber = 100 * (nNumber >> 8) + 10 * ((nNumber >> 4) & 15) + (nNumber & 15);
          {
            canonic += String(nNumber);
            canonic += String.fromCharCode(46);
          }
          nOctets = 2;
          eState = State.STATE_IP6_IP4_DOT;
        } else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p)) && nDigits < 3) {
          nNumber = 16 * nNumber + (cursor.text.charCodeAt(p) - 48);
          ++nDigits;
        } else if (rtl.isAsciiHexDigit(cursor.text.charCodeAt(p)) && nDigits < 4) {
          nNumber = 16 * nNumber + Number.parseInt(cursor.text.charAt(p), 16);
          ++nDigits;
          eState = State.STATE_IP6_HEXSEQ2;
        } else break hostLoop;
        break;

      case State.STATE_IP6_IP4:
        if (cursor.text.charCodeAt(p) == 93)
          if (nOctets == 4) {
            canonic += String(nNumber);
            eState = State.STATE_IP6_DONE;
          } else break hostLoop;
        else if (cursor.text.charCodeAt(p) == 46)
          if (nOctets < 4) {
            {
              canonic += String(nNumber);
              canonic += String.fromCharCode(46);
            }
            ++nOctets;
            eState = State.STATE_IP6_IP4_DOT;
          } else break hostLoop;
        else if (rtl.isAsciiDigit(cursor.text.charCodeAt(p)) && nDigits < 3) {
          nNumber = 10 * nNumber + (cursor.text.charCodeAt(p) - 48);
          ++nDigits;
        } else break hostLoop;
        break;

      case State.STATE_IP6_IP4_DOT:
        if (rtl.isAsciiDigit(cursor.text.charCodeAt(p))) {
          nNumber = cursor.text.charCodeAt(p) - 48;
          nDigits = 1;
          eState = State.STATE_IP6_IP4;
        } else break hostLoop;
        break;

      case State.STATE_IP6_DONE:
        break hostLoop;
    }

  switch (eState) {
    case State.STATE_LABEL:
    case State.STATE_TOPLABEL:
    case State.STATE_TOPLABEL_DOT:
      {
        canonic = "";
        canonic += cursor.text.slice(cursor.index, p);
      }
      cursor.index = p;
      return canonic;

    case State.STATE_IP4:
      if (nOctets == 4) {
        canonic += String(nNumber);
        cursor.index = p;
        return canonic;
      }
      return null;

    case State.STATE_IP6_DONE:
      canonic += String.fromCharCode(93);
      cursor.index = p;
      return canonic;

    default:
      return null;
  }
}

/** Original complete-host check followed by the file-only NetBIOS fallback. @param cursor - Host range; original caller passes its boundaries by value. @param mechanism - Native input escape interpretation. @param charset - Native input encoding. @param netBiosName - Whether the source permits NetBIOS fallback. @returns Canonical host or null on failure. */
export function parseHostOrNetBiosName(
  cursor: UriCursor,
  mechanism: EncodeMechanism,
  charset: rtl_TextEncoding,
  netBiosName: boolean,
): string | null {
  if (cursor.index >= cursor.end) return "";
  const p = { ...cursor };
  const host = parseHost(p);
  if (host !== null && p.index === p.end) return host;
  if (!netBiosName) return null;
  const source = { ...cursor };
  let canonic = "";
  while (source.index < source.end) {
    const scalar = getUTF32(source, mechanism, charset);
    if (
      scalar.value < 33 ||
      scalar.value > 126 ||
      '"*+,/:;<=>?[\\]`|'.includes(String.fromCharCode(scalar.value))
    )
      return null;
    canonic += appendUCS4(scalar, Part.PART_URIC, charset, true);
  }
  return canonic;
}
