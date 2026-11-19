/** @fileoverview Actual pre-bootstrap native security admission; no reset, mock runtime or fake handles. */
import { FileStatus } from "../../inc/osl/file.hxx";
import { osl_getLocalHostname } from "./socket";
import { OUString } from "../../inc/rtl/ustring";
import { expect, it } from "vitest";
import { getRuntime } from "../../../external/emscripten/runtime";
import { osl_getCurrentSecurity } from "./security";
it("requires genuine runtime initialization before native handle allocation", /** A premature call must fail before invoking an absent WASM export. @returns Nothing. */ () => {
  expect(getRuntime()).toBeUndefined();
  expect(osl_getCurrentSecurity).toThrow(
    "Emscripten runtime must be initialized before OSL security operations",
  );
});

it("rejects local hostname lookup before actual native bootstrap", /** The real absent runtime prevents buffer allocation and preserves the caller output. @returns Nothing. */ () => {
  expect(getRuntime()).toBeUndefined();
  const output = new OUString();
  try {
    const before = output.pData;
    expect(
      /** Calls the actual pre-bootstrap native boundary. @returns Original status or initialization error. */ () =>
        osl_getLocalHostname(output.getDataAddress()),
    ).toThrow("Emscripten runtime must be initialized before OSL hostname operations");
    expect(output.pData).toBe(before);
  } finally {
    output.dispose();
  }
});

it("constructs original zeroed FileStatus before native initialization", /** sizeof is a compiled header constant; construction does not query a replacement native provider. @returns Nothing. */ () => {
  expect(getRuntime()).toBeUndefined();
  const status = new FileStatus(0);
  try {
    expect(status._aStatus.uStructSize).toBe(72);
    expect(status.getFileType()).toBe(FileStatus.Unknown);
    expect(status.getFileSize()).toBe(0n);
    expect(status.getCreationTime().Seconds).toBe(0);
  } finally {
    status.dispose();
  }
});
