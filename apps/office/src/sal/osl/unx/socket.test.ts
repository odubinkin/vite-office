/** @fileoverview Actual pinned local hostname/FQDN dependencies and source independent static result ownership. */
import { beforeAll, afterEach, expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { OUString } from "../../inc/rtl/ustring";
import { oslSocketResult, osl_getLocalHostname } from "../../inc/osl/socket.h";
import { osl_getLocalHostnameFQDN } from "./socket";
beforeAll(
  /** Initializes actual pinned libc. @returns Completion. */ async () => {
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
it("retains original separate static local/FQDN result values", /** Both values come from real gethostname/getaddrinfo; output replacement does not mutate either cached value. @returns Nothing. */ () => {
  const local = u("prior"),
    qualified = u("prior");
  expect(osl_getLocalHostname(local.getDataAddress())).toBe(oslSocketResult.Ok);
  expect(osl_getLocalHostnameFQDN(qualified.getDataAddress())).toBe(oslSocketResult.Ok);
  expect(read(new OUString(local))).toBe("emscripten");
  expect(read(new OUString(qualified))).toBe("emscripten");
  const first = own(new OUString(local)),
    second = own(new OUString(qualified));
  local.assign(u("changed"));
  qualified.assign(u("changed"));
  expect(osl_getLocalHostname(local.getDataAddress())).toBe(oslSocketResult.Ok);
  expect(osl_getLocalHostnameFQDN(qualified.getDataAddress())).toBe(oslSocketResult.Ok);
  expect(local.pData).toBe(first.pData);
  expect(qualified.pData).toBe(second.pData);
});
