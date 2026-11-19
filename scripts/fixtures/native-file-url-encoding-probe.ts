/** @fileoverview Actual source charset/URI byte roundtrip in Chromium main and DOM-free Worker. */
import { OString } from "../../apps/office/src/sal/inc/rtl/string";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { osl_setThreadTextEncoding } from "../../apps/office/src/sal/inc/osl/thread";
import { RTL_TEXTENCODING_UTF8 } from "../../apps/office/src/sal/inc/rtl/textenc";
import {
  convertPathnameToUrl,
  decodeFromUtf8,
} from "../../apps/office/src/sal/osl/unx/file_url.encoding";
/** Executes the genuine byte-preserving source helpers and restores the thread encoding. @returns Actual results. */
export function probeNativeFileUrlEncoding(): { url: string; bytes: number[]; decoded: boolean } {
  const previous = osl_setThreadTextEncoding(RTL_TEXTENCODING_UTF8),
    input = new OString(Uint8Array.of(47, 97, 32, 195, 169, 47, 255), 7),
    url = new OUString(),
    output = new OString();
  try {
    convertPathnameToUrl(input, url);
    const body = url.copy(7);
    try {
      const decoded = decodeFromUtf8(body.getStr().subarray(0, body.getLength()), output);
      return {
        url: String.fromCharCode(...url.getStr().subarray(0, url.getLength())),
        bytes: Array.from(output.getStr().subarray(0, output.getLength())),
        decoded,
      };
    } finally {
      body.dispose();
    }
  } finally {
    output.dispose();
    url.dispose();
    input.dispose();
    osl_setThreadTextEncoding(previous);
  }
}
