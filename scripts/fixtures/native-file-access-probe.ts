/** @fileoverview Actual native file access/open integration shared by the main-realm and DOM-free Worker consumer probe. */
import { getFileSystem } from "../../apps/office/src/external/emscripten/runtime";
import { OString } from "../../apps/office/src/sal/inc/rtl/string";
import { OUString } from "../../apps/office/src/sal/inc/rtl/ustring";
import { RTL_TEXTENCODING_UTF8 } from "../../apps/office/src/sal/inc/rtl/textenc";
import {
  openFilePath,
  setAllowedPaths,
  osl_closeFile,
  type oslFileHandle,
} from "../../apps/office/src/sal/osl/unx/file";
import {
  oslFileError,
  osl_File_OpenFlag_Create,
  osl_File_OpenFlag_Read,
  osl_File_OpenFlag_Write,
} from "../../apps/office/src/sal/inc/osl/file";
/** Executes genuine create/read/denied-write and restores source allowlists/files. @returns Real operation results. */
export function probeNativeFileAccess(): { created: boolean; read: boolean; denied: boolean } {
  const owners: { dispose(): void }[] = [];
  /** Tracks original value destructors. @param value - Actual original value. @returns Same value. */
  function own<T extends { dispose(): void }>(value: T): T {
    owners.push(value);
    return value;
  }
  /** Creates the original counted UTF16 value. @param value - Fixture text. @returns Actual OUString. */
  function unicode(value: string): OUString {
    const units = Uint16Array.from(
      value
        .split("")
        .map(
          /** Encodes one unit. @param unit - UTF16 unit. @returns Code unit. */ (unit) =>
            unit.charCodeAt(0),
        ),
    );
    return new OUString(units, units.length);
  }
  const fileSystem = getFileSystem();
  try {
    const accessDirectory = own(unicode("/tmp/native-access-probe")),
      accessPath = own(unicode("/tmp/native-access-probe/created")),
      accessBytes = own(
        new OString(accessPath.getStr(), accessPath.getLength(), RTL_TEXTENCODING_UTF8),
      ),
      accessHandle: [oslFileHandle] = [null];
    fileSystem.mkdir("/tmp/native-access-probe");
    const accessSpec = own(unicode("w:/tmp/native-access-probe"));
    setAllowedPaths(accessSpec.getStr().subarray(0, accessSpec.getLength()));
    let accessCreated, accessRead, accessDenied;
    try {
      accessCreated = openFilePath(accessBytes, accessHandle, osl_File_OpenFlag_Create, -1);
      if (accessCreated !== oslFileError.None) throw new Error("Native allowed create failed");
      osl_closeFile(accessHandle[0]);
      accessHandle[0] = null;
      setAllowedPaths(accessDirectory.getStr().subarray(0, accessDirectory.getLength()));
      accessDenied = openFilePath(accessBytes, accessHandle, osl_File_OpenFlag_Write, -1);
      accessRead = openFilePath(accessBytes, accessHandle, osl_File_OpenFlag_Read, -1);
      if (accessRead !== oslFileError.None) throw new Error("Native allowed read failed");
      osl_closeFile(accessHandle[0]);
      accessHandle[0] = null;
    } finally {
      setAllowedPaths(new Uint16Array());
      fileSystem.unlink("/tmp/native-access-probe/created");
      fileSystem.rmdir("/tmp/native-access-probe");
    }
    return {
      created: accessCreated === oslFileError.None,
      read: accessRead === oslFileError.None,
      denied: accessDenied === oslFileError.ACCES,
    };
  } finally {
    for (let i = owners.length - 1; i >= 0; i--) owners[i]?.dispose();
  }
}
