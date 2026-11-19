/** @fileoverview Genuine current-security and byte-home boundary in browser main and DOM-free Worker. */
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { osl_getFileURLFromSystemPath } from "../../apps/office/src/sal/inc/osl/file";
import { OString } from "../../apps/office/src/sal/inc/rtl/string";
import {
  osl_getCurrentSecurity,
  osl_freeSecurityHandle,
  osl_psz_getHomeDir,
  osl_getHomeDir,
} from "../../apps/office/src/sal/osl/unx/security";
/** Allocates, queries and frees the real native context. @returns Public scalar observations only. */
export function probeNativeSecurity(): {
  current: boolean;
  home: boolean;
  nonempty: boolean;
  rejectedNull: boolean;
  unchanged: boolean;
  homeURL: boolean;
  pathURL: string;
} {
  const security = osl_getCurrentSecurity(),
    directory = new OString(),
    unicodeHome = new OUString(),
    units = Uint16Array.of(47, 116, 109, 112, 47, 233, 47, 47, 97, 32, 98),
    path = new OUString(units, units.length);
  try {
    const home = osl_psz_getHomeDir(security, directory),
      before = directory.getStr().slice(0, directory.getLength()),
      rejectedNull = !osl_psz_getHomeDir(0, directory),
      unchanged =
        before.length === directory.getLength() &&
        before.every(
          /** Compares the retained output bytes. @param value - Prior byte. @param index - Position. @returns Equality. */ (
            value,
            index,
          ) => directory.getStr()[index] === value,
        );
    const homeURL = osl_getHomeDir(security, unicodeHome.getDataAddress());
    osl_getFileURLFromSystemPath(path.pData, path.getDataAddress());
    return {
      current: security !== 0,
      home,
      nonempty: directory.getLength() > 0,
      rejectedNull,
      unchanged,
      homeURL,
      pathURL: String.fromCharCode(...path.getStr().subarray(0, path.getLength())),
    };
  } finally {
    path.dispose();
    unicodeHome.dispose();
    directory.dispose();
    osl_freeSecurityHandle(security);
  }
}
