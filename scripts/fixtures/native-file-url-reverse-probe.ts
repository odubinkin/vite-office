/** @fileoverview Actual native authority/Unicode/escaped-byte reverse file URL path in browser and DOM-free Worker. */
import { getFileSystem } from "../../apps/office/src/external/emscripten/runtime";
import {
  osl_openFile,
  osl_File_OpenFlag_Create,
  osl_File_OpenFlag_Read,
  type oslFileHandle,
} from "../../apps/office/src/sal/inc/osl/file";
import { osl_closeFile, osl_writeFile, osl_readFile } from "../../apps/office/src/sal/osl/unx/file";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { OString } from "../../apps/office/src/sal/inc/rtl/string";
import { oslFileError, osl_getSystemPathFromFileURL } from "../../apps/office/src/sal/inc/osl/file";
import { getSystemPathFromFileUrl } from "../../apps/office/src/sal/osl/unx/file_url";
import { osl_getLocalHostnameFQDN } from "../../apps/office/src/sal/osl/unx/socket";
import { oslSocketResult } from "../../apps/office/src/sal/inc/osl/socket.h";
/** Executes genuine local authority matching and source byte decoder. @returns Public scalars/bytes. */
export function probeNativeFileUrlReverse(): {
  hostname: string;
  path: string;
  bytes: number[];
  rejected: boolean;
  preserved: boolean;
  openedBytes: number[];
} {
  const owners: { dispose(): void }[] = [];
  /** Tracks a real value. @param value - Value. @returns Same value. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Constructs counted UTF16. @param text - Text. @returns Original string. */
  function unicode(text: string): OUString {
    const units = Uint16Array.from(
      text
        .split("")
        .map(
          /** Reads a UTF16 unit. @param unit - Unit. @returns Code. */ (unit) =>
            unit.charCodeAt(0),
        ),
    );
    return own(new OUString(units, units.length));
  }
  /** Reads a live original value. @param value - String. @returns Text. */
  function text(value: OUString): string {
    return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
  }
  try {
    const hostname = unicode("");
    if (osl_getLocalHostnameFQDN(hostname.getDataAddress()) !== oslSocketResult.Ok)
      throw new Error("Native hostname failed");
    const path = unicode("file://" + text(hostname).toUpperCase() + "/é/a%20b"),
      rejected = unicode("prior"),
      before = rejected.pData,
      bytes = own(new OString());
    if (osl_getSystemPathFromFileURL(path.pData, path.getDataAddress()) !== oslFileError.None)
      throw new Error("Native reverse URL failed");
    if (getSystemPathFromFileUrl(unicode("file:///%FF"), bytes, true) !== oslFileError.None)
      throw new Error("Native byte URL failed");
    const handle: [oslFileHandle] = [null],
      fs = getFileSystem(),
      fileURL = unicode("file:///tmp/native-url-probe%20%C3%A9"),
      openedBytes = new Uint8Array(3);
    try {
      if (osl_openFile(fileURL.pData, handle, osl_File_OpenFlag_Create) !== oslFileError.None)
        throw new Error("Native URL create failed");
      const count: [bigint] = [0n];
      if (
        osl_writeFile(handle[0], Uint8Array.of(7, 8, 9), 3n, count) !== oslFileError.None ||
        count[0] !== 3n
      )
        throw new Error("Native URL write failed");
      if (osl_closeFile(handle[0]) !== oslFileError.None)
        throw new Error("Native URL close failed");
      handle[0] = null;
      if (osl_openFile(fileURL.pData, handle, osl_File_OpenFlag_Read) !== oslFileError.None)
        throw new Error("Native URL reopen failed");
      if (osl_readFile(handle[0], openedBytes, 3n, count) !== oslFileError.None || count[0] !== 3n)
        throw new Error("Native URL read failed");
    } finally {
      if (handle[0]) osl_closeFile(handle[0]);
      fs.unlink("/tmp/native-url-probe é");
    }
    return {
      openedBytes: Array.from(openedBytes),
      hostname: text(hostname),
      path: text(path),
      bytes: Array.from(bytes.getStr().subarray(0, bytes.getLength())),
      rejected:
        osl_getSystemPathFromFileURL(
          unicode("file://localhost:80/a").pData,
          rejected.getDataAddress(),
        ) === oslFileError.INVAL,
      preserved: rejected.pData === before,
    };
  } finally {
    for (let i = owners.length - 1; i >= 0; i--) owners[i]?.dispose();
  }
}
