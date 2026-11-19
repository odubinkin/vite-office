/** @fileoverview Original file_url.cxx system-path/URL and reverse byte/Unicode conversion with source authority and home contracts; other entry points remain unbound. */
import { osl_systemPathRemoveSeparator } from "./file_path_helper";
import { OString } from "../../inc/rtl/string";
import { Security } from "../../inc/osl/security";
import { Uri } from "../../inc/rtl/uri";
import { MalformedUriException } from "../../inc/rtl/malformeduriexception";
import { isAsciiAlpha, isAsciiAlphanumeric } from "../../inc/rtl/character";
import { osl_getLocalHostnameFQDN } from "./socket";
import { oslSocketResult } from "../../inc/osl/socket.h";
import {
  rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths,
  rtl_ustr_compareIgnoreAsciiCase_WithLength,
} from "../../inc/rtl/ustring.h";
import { rtl_UriDecodeMechanism } from "../../inc/rtl/uri.h";
import { decodeFromUtf8 } from "./file_url.encoding";
import { OUString, type OUStringConstReference } from "../../inc/rtl/ustring";
import {
  rtl_uString_assign,
  rtl_uString_newFromString,
  rtl_uString_newFromStr_WithLength,
  rtl_uString_newReplaceStrAt,
  rtl_uString_newFromAscii,
  rtl_uString_newConcat,
  rtl_uString_release,
  type rtl_uString,
  type rtl_uStringSlot,
} from "../../inc/rtl/ustring.h";
import { rtl_uriEncode, rtl_UriEncodeMechanism } from "../../inc/rtl/uri.h";
import { RTL_TEXTENCODING_UTF8 } from "../../inc/rtl/textenc";
import { oslFileError } from "../../inc/osl/file";
import { osl_getCurrentSecurity, osl_freeSecurityHandle, osl_getHomeDir } from "./security";
import { uriCharClass } from "./file_url.encoding";
/** Original UNIX system-path conversion, including source tilde recursion, repeated-slash index adaptation and UTF8 encoding. @param systemPathData - Borrowed original input pointer. @param fileURL - Inout original output pointer slot. @returns Original file status; early rejection preserves output. */
export function osl_getFileURLFromSystemPath(
  systemPathData: rtl_uString,
  fileURL: rtl_uStringSlot,
): oslFileError {
  const source: rtl_uStringSlot = [systemPathData],
    systemPath = OUString.unacquired(source),
    temporary: rtl_uStringSlot = [null];
  if (systemPath.isEmpty()) return oslFileError.INVAL;
  if (systemPath.startsWith(Uint16Array.of(102, 105, 108, 101, 58))) return oslFileError.INVAL;
  try {
    if (systemPath.startsWith(Uint16Array.of(126))) {
      if (systemPath.getLength() === 1 || systemPath.getStr()[1] === 47) {
        const security = osl_getCurrentSecurity();
        try {
          osl_getHomeDir(security, temporary);
        } finally {
          osl_freeSecurityHandle(security);
        }
        if (!temporary[0]) return oslFileError.INVAL;
        rtl_uString_newFromStr_WithLength(
          temporary,
          temporary[0].buffer.subarray(7),
          temporary[0].length - 7,
        );
        rtl_uString_newReplaceStrAt(temporary, systemPathData, 0, 1, temporary[0]);
      } else return oslFileError.INVAL;
    }
    let index = systemPath.indexOf(Uint16Array.of(47, 47));
    if (index >= 0) {
      let deleted = 0;
      if (temporary[0] === null) rtl_uString_newFromString(temporary, systemPath.pData);
      const value = temporary[0] as rtl_uString;
      index += value.length - systemPath.getLength();
      for (let sourceIndex = index + 1; sourceIndex < value.length; sourceIndex++) {
        if (value.buffer[sourceIndex] === 47 && value.buffer[index] === 47) deleted++;
        else value.buffer[++index] = value.buffer[sourceIndex] as number;
      }
      value.length -= deleted;
    }
    if (temporary[0] === null) rtl_uString_assign(temporary, systemPathData);
    rtl_uriEncode(
      temporary[0] as rtl_uString,
      uriCharClass,
      rtl_UriEncodeMechanism.rtl_UriEncodeIgnoreEscapes,
      RTL_TEXTENCODING_UTF8,
      fileURL,
    );
    rtl_uString_release(temporary[0] as rtl_uString);
    temporary[0] = null;
    if ((fileURL[0] as rtl_uString).buffer[0] === 47) {
      const protocol: rtl_uStringSlot = [null];
      try {
        rtl_uString_newFromAscii(protocol, Uint8Array.of(102, 105, 108, 101, 58, 47, 47, 0));
        rtl_uString_newConcat(fileURL, protocol[0], fileURL[0]);
      } finally {
        if (protocol[0]) rtl_uString_release(protocol[0]);
      }
    }
    return oslFileError.None;
  } finally {
    if (temporary[0]) rtl_uString_release(temporary[0]);
  }
}

/** Original counted Unicode versus ASCII literal comparison. @param text - Source value. @param begin - Source offset. @param end - Exclusive source end. @param ascii - Literal bytes. @returns Whether equal ignoring ASCII case. */
function equalsAscii(
  text: OUStringConstReference,
  begin: number,
  end: number,
  ascii: Uint8Array,
): boolean {
  return (
    rtl_ustr_ascii_compareIgnoreAsciiCase_WithLengths(
      text.getStr().subarray(begin),
      end - begin,
      ascii,
      ascii.length,
    ) === 0
  );
}
/** Original byte/Unicode template path parser with exact authority and escaped-octet behavior; native length-error/physical allocation domains remain unqualified. @param url - Borrowed original URL. @param path - Original internal result, mutated at source-defined points. @param resolveHome - Original recursion guard. @returns Original file status. */
export function getSystemPathFromFileUrl(
  url: OUStringConstReference,
  path: OUString | OString,
  resolveHome: boolean,
): oslFileError {
  const length = url.getLength(),
    units = url.getStr();
  if (url.isEmpty() || (units[0] === 47 && (length === 1 || units[1] !== 47)))
    return oslFileError.INVAL;
  let i = 0;
  if (isAsciiAlpha(units[0] as number)) {
    for (let j = 1; j !== length; ++j) {
      const c = units[j] as number;
      if (c === 58) {
        if (!equalsAscii(url, 0, j, Uint8Array.of(102, 105, 108, 101))) return oslFileError.INVAL;
        i = j + 1;
        break;
      }
      if (!isAsciiAlphanumeric(c) && c !== 43 && c !== 45 && c !== 46) break;
    }
  }
  if (url.indexOf(63, i) !== -1 || url.indexOf(35, i) !== -1) return oslFileError.INVAL;
  if (length - i >= 2 && units[i] === 47 && units[i + 1] === 47) {
    i += 2;
    let j = url.indexOf(47, i);
    if (j === -1) j = length;
    if (
      j !== i &&
      !equalsAscii(url, i, j, Uint8Array.of(108, 111, 99, 97, 108, 104, 111, 115, 116)) &&
      !equalsAscii(url, i, j, Uint8Array.of(49, 50, 55, 46, 48, 46, 48, 46, 49))
    ) {
      const hostname = new OUString();
      try {
        if (
          osl_getLocalHostnameFQDN(hostname.getDataAddress()) !== oslSocketResult.Ok ||
          rtl_ustr_compareIgnoreAsciiCase_WithLength(
            units.subarray(i),
            j - i,
            hostname.getStr(),
            hostname.getLength(),
          ) !== 0
        )
          return oslFileError.INVAL;
      } finally {
        hostname.dispose();
      }
    }
    i = j;
  }
  if (i === length) {
    const root =
      path instanceof OString
        ? new OString(Uint8Array.of(47), 1)
        : new OUString(Uint16Array.of(47), 1);
    try {
      if (path instanceof OString) path.assign(root as OString);
      else path.assign(root as OUString);
    } finally {
      root.dispose();
    }
    return oslFileError.None;
  }
  if (
    url.indexOf(Uint16Array.of(37, 50, 70), i) !== -1 ||
    url.indexOf(Uint16Array.of(37, 50, 102), i) !== -1
  )
    return oslFileError.INVAL;
  if (path instanceof OString) {
    if (!decodeFromUtf8(units.subarray(i, length), path)) return oslFileError.INVAL;
  } else {
    const tail = url.copy(i);
    try {
      const decoded = Uri.decode(
        tail,
        rtl_UriDecodeMechanism.rtl_UriDecodeWithCharset,
        RTL_TEXTENCODING_UTF8,
      );
      try {
        path.assign(decoded);
      } finally {
        decoded.dispose();
      }
    } finally {
      tail.dispose();
    }
  }
  if (path.indexOf(0) !== -1) return oslFileError.INVAL;
  if (resolveHome && path.getLength() >= 2 && path.getStr()[1] === 126) {
    let j = path.indexOf(47, 2);
    if (j === -1) j = path.getLength();
    if (j === 2) {
      const home = new OUString();
      try {
        const security = new Security();
        let hasHome: boolean;
        try {
          hasHome = security.getHomeDir(home);
        } finally {
          security.dispose();
        }
        if (!hasHome) return oslFileError.INVAL;
        i = url.indexOf(47, i + 1);
        if (i === -1) i = length;
        else ++i;
        if (!home.isEmpty() && home.getStr()[home.getLength() - 1] !== 47)
          home.append(Uint16Array.of(47));
        const tail = url.copy(i);
        try {
          try {
            const absolute = Uri.convertRelToAbs(home, tail);
            try {
              home.assign(absolute);
            } finally {
              absolute.dispose();
            }
          } catch (error) {
            if (!(error instanceof MalformedUriException)) throw error;
            error.dispose();
            return oslFileError.INVAL;
          }
        } finally {
          tail.dispose();
        }
        return getSystemPathFromFileUrl(home, path, false);
      } finally {
        home.dispose();
      }
    }
    return oslFileError.INVAL;
  }
  return oslFileError.None;
}
/** Original public Unicode wrapper adopts the temporary only on success; source std::length_error boundary remains unqualified in this JS allocation profile. @param fileURL - Borrowed input pointer. @param systemPath - Original output pointer slot. @returns Source status. */
export function osl_getSystemPathFromFileURL(
  fileURL: rtl_uString,
  systemPath: rtl_uStringSlot,
): oslFileError {
  const path = new OUString(),
    input: rtl_uStringSlot = [fileURL];
  try {
    const status = getSystemPathFromFileUrl(OUString.unacquired(input), path, true);
    if (status === oslFileError.None) rtl_uString_assign(systemPath, path.pData);
    return status;
  } finally {
    path.dispose();
  }
}

/** Original absolute byte pathname wrapper; internal decoded output remains as source defines even when the final absolute-path check fails. @param url - Original borrowed URL. @param pathname - Original byte result. @returns Original status. */
export function convertUrlToPathname(url: OUStringConstReference, pathname: OString): oslFileError {
  const status = getSystemPathFromFileUrl(url, pathname, true);
  return status === oslFileError.None && (pathname.getLength() === 0 || pathname.getStr()[0] !== 47)
    ? oslFileError.INVAL
    : status;
}
/** Original bounded char-buffer conversion followed by source in-place trailing-separator removal. @param buffer - Actual output storage. @param bufferLength - Native buffer capacity. @param fileURL - Borrowed URL pointer. @returns Original status; errors leave the char buffer unchanged. */
export function FileURLToPath(
  buffer: Uint8Array,
  bufferLength: number,
  fileURL: rtl_uString,
): oslFileError {
  const path = new OString(),
    input: rtl_uStringSlot = [fileURL];
  try {
    const status = convertUrlToPathname(OUString.unacquired(input), path);
    if (status !== oslFileError.None) return status;
    osl_systemPathRemoveSeparator(path.pData);
    if (path.getLength() >= bufferLength) return oslFileError.OVERFLOW;
    buffer.set(path.getStr().subarray(0, path.getLength() + 1));
    return status;
  } finally {
    path.dispose();
  }
}
