/** @fileoverview Replays the public loader against original ICU POSIX file and package observations. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import common from "./ucmndata.native-observations.json" with { type: "json" };
import native from "./udata.open.native-observations.json" with { type: "json" };
import { udata_cleanup } from "./udata";
import {
  UDataFileAccess,
  udata_close,
  udata_getMemory,
  udata_open,
  udata_openChoice,
  udata_setAppData,
  udata_setFileAccess,
  type UDataMemoryIsAcceptable,
} from "./unicode/udata";
import { udata_getLength } from "./udatamem";
import { u_setDataDirectory, u_setTimeZoneFilesDirectory } from "./unicode/putil";
import { setDataFileReader } from "./umapfile";
import { cStringLength } from "./stringpiece";

const pkg = Uint8Array.from(Buffer.from(common.pkg.offset, "base64"));
const view = new DataView(pkg.buffer);
const toc = view.getUint16(0, true);
const commonPackage = pkg.slice();
for (let i = 0; i < view.getUint32(toc, true); ++i) {
  const name = toc + view.getUint32(toc + 4 + i * 8, true);
  commonPackage.copyWithin(name + 8, name + 10, commonPackage.indexOf(0, name) + 1);
  commonPackage.set(new TextEncoder().encode("icudt78l"), name);
}
const item = pkg.slice(toc + view.getUint32(toc + 8, true), toc + view.getUint32(toc + 16, true));
item[20] = 0xab;
const bad = item.slice();
bad[2] = 0;
const files = new Map([
  ["icudata/icudt78l.dat", commonPackage],
  ["./good/OpenOffice/count_word.brk", item],
  ["good/OpenOffice/count_word.brk", item],
  ["good/OpenOffice/tree/count_word.brk", item],
  ["good/OpenOfficea", item],
  ["bad/OpenOffice/count_word.brk", bad],
  ["disk/OpenOffice.dat", pkg],
  ["badpkg/OpenOffice.dat", bad],
  ["zone/zoneinfo64.res", item],
]);

for (const [index, c] of native.observations.entries()) {
  it(`matches original public open case ${index}`, /** Replays one native process's initial state and observable result. @returns Nothing. */ () => {
    expect(createHash("sha256").update(pkg).digest("hex")).toBe(native.packageSha256);
    expect(createHash("sha256").update(commonPackage).digest("hex")).toBe(native.commonSha256);
    udata_cleanup();
    udata_setFileAccess(UDataFileAccess.UDATA_DEFAULT_ACCESS, null);
    u_setDataDirectory(new TextEncoder().encode(c.dir + "\0"));
    u_setTimeZoneFilesDirectory(new TextEncoder().encode(c.timezone ? "zone\0" : "\0"), [0]);
    setDataFileReader(
      /** Supplies the corresponding POSIX fixture's bytes. @param path - Actual candidate. @returns File or missing. */
      (path) => files.get(new TextDecoder().decode(path.subarray(0, cStringLength(path)))) ?? null,
    );
    if (c.access >= 0) udata_setFileAccess(c.access, null);
    try {
      const status: [number] = [0];
      if (c.registered) udata_setAppData("OpenOffice", pkg, status);
      expect(status[0]).toBe(0);
      status[0] = c.initial;
      const calls: number[] = [];
      const accept: UDataMemoryIsAcceptable =
        /** Records native callback header data and validates the forwarded arguments. @param context - Caller context. @param type - Original type. @param name - Original name. @param info - Borrowed data info. @returns Acceptance. */
        (context, type, name, info) => {
          expect(context).toBe(c);
          expect(type).toBe(c.type);
          expect(name).toBe(c.name);
          calls.push(info.dataVersion[0] as number);
          return c.callback !== 2 || info.dataVersion[0] !== 0xab;
        };
      const result =
        c.callback === 0
          ? udata_open(c.path, c.type, c.name, status)
          : udata_openChoice(c.path, c.type, c.name, c.callback === 3 ? null : accept, c, status);
      const actual = [status[0]];
      if (result !== null) {
        const payload = udata_getMemory(result) as Uint8Array;
        actual.push(
          result.length,
          udata_getLength(result),
          Number(result.heapAllocated),
          Number(result.map !== null),
          result.pHeader?.info.dataVersion[0] as number,
          ...payload.subarray(0, 4),
        );
        if (result.map !== null) {
          expect(result.mapAddr).toBe(result.pHeader?.data);
          expect(result.map.byteOffset - (result.mapAddr?.byteOffset ?? 0)).toBe(result.length);
        }
        udata_close(result);
      }
      expect(calls).toEqual(c.calls);
      expect(actual).toEqual(c.result);
    } finally {
      setDataFileReader(null);
      u_setDataDirectory(null);
      u_setTimeZoneFilesDirectory(null, [0]);
      udata_cleanup();
    }
  });
}
