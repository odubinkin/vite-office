/** @fileoverview Tests resource initialization failure propagation and retry through real ICU key/type map owners. */
import { afterEach, expect, it, vi } from "vitest";
import { UErrorCode as E } from "./unicode/utypes";

afterEach(
  /** Restores dependency behavior and module-owned init state. @returns Nothing. */ () => {
    vi.restoreAllMocks();
    vi.resetModules();
  },
);

it.each([
  "open",
  "key-iterator",
  "key-value",
  "type-lookup",
  "type-iterator",
  "type-value",
  "legacy-alias",
  "bcp-alias",
] as const)(
  "retries resource initialization after %s failure",
  /** Injects a native resource-read error at one owned dependency boundary, then retries with actual mapped data. @param stage - Original resource read stage. @returns Completion after recovery. */ async (
    stage,
  ) => {
    vi.resetModules();
    const resources = await import("./uresbund"),
      { resCString } = await import("./uresdata.path");
    const failure = E.U_MEMORY_ALLOCATION_ERROR;
    if (stage === "open") {
      const original = resources.ures_openDirect;
      vi.spyOn(resources, "ures_openDirect").mockImplementation(
        /** Preserves the original sticky-error open contract. @param path - Package. @param name - Resource file. @param status - Status. @returns Original owner or failure. */ (
          path,
          name,
          status,
        ) => {
          if (name === "keyTypeData") status[0] = failure;
          return original(path, name, status);
        },
      );
    } else if (stage === "key-iterator" || stage === "type-iterator") {
      const original = resources.ures_getNextResource;
      vi.spyOn(resources, "ures_getNextResource").mockImplementation(
        /** Fails an actual iterator read before its normal failure guard. @param bundle - Actual source owner. @param fill - Reused output. @param status - Native status. @returns Previous output on failure. */ (
          bundle,
          fill,
          status,
        ) => {
          const path = resCString(bundle?.fResPath ?? null);
          if (
            status !== null &&
            ((stage === "key-iterator" && path === "keyMap/") ||
              (stage === "type-iterator" && path.startsWith("typeMap/")))
          )
            status[0] = failure;
          return original(bundle, fill, status);
        },
      );
    } else if (stage === "type-lookup") {
      const original = resources.ures_getByKey;
      vi.spyOn(resources, "ures_getByKey").mockImplementation(
        /** Fails a required type-map lookup with the original error return. @param bundle - Actual table. @param key - Source key. @param fill - Reused output. @param status - Status. @returns Original failure output. */ (
          bundle,
          key,
          fill,
          status,
        ) => {
          if (status !== null && resCString(bundle?.fResPath ?? null) === "typeMap/")
            status[0] = failure;
          return original(bundle, key, fill, status);
        },
      );
    } else {
      const original = resources.ures_getString;
      const prefix =
        stage === "key-value"
          ? "keyMap/"
          : stage === "type-value"
            ? "typeMap/"
            : stage === "legacy-alias"
              ? "typeAlias/"
              : "bcpTypeAlias/";
      vi.spyOn(resources, "ures_getString").mockImplementation(
        /** Preserves nullable string failure while retaining real resource handles. @param bundle - Actual string owner. @param length - Output length. @param status - Status. @returns Original string or failure. */ (
          bundle,
          length,
          status,
        ) => {
          if (status !== null && resCString(bundle?.fResPath ?? null).startsWith(prefix))
            status[0] = failure;
          return original(bundle, length, status);
        },
      );
    }
    const map = await import("./uloc_keytype");
    expect(map.ulocimp_toBcpKey("calendar")).toBeNull();
    expect(map.ulocimp_toLegacyKey("ca")).toBeNull();
    expect(map.ulocimp_toBcpType("calendar", "gregorian")).toBeNull();
    expect(map.ulocimp_toLegacyType("ca", "gregory")).toBeNull();
    vi.restoreAllMocks();
    expect(map.ulocimp_toBcpKey("calendar")).toEqual({ value: "ca", inputAlias: false });
    expect(map.ulocimp_toLegacyType("ca", "gregory")).toEqual({
      value: "gregorian",
      inputAlias: false,
    });
  },
);

it.each(["typeAlias", "bcpTypeAlias"])(
  "loads required maps when optional %s data is absent",
  /** Optional alias tables have separate statuses and do not prevent canonical lookup. @param missing - Optional native table. @returns Completion after canonical reads. */ async (
    missing,
  ) => {
    vi.resetModules();
    const resources = await import("./uresbund"),
      original = resources.ures_getByKey;
    vi.spyOn(resources, "ures_getByKey").mockImplementation(
      /** Models the original missing-resource result without inventing a substitute table. @param bundle - Actual owner. @param key - Resource key. @param fill - Reused output. @param status - Status. @returns Real lookup result. */ (
        bundle,
        key,
        fill,
        status,
      ) => {
        if (status !== null && key === missing) status[0] = E.U_MISSING_RESOURCE_ERROR;
        return original(bundle, key, fill, status);
      },
    );
    const map = await import("./uloc_keytype");
    expect(map.ulocimp_toBcpKey("calendar")).toEqual({ value: "ca", inputAlias: false });
    expect(map.ulocimp_toBcpType("calendar", "gregorian")).toEqual({
      value: "gregory",
      inputAlias: false,
    });
  },
);

it("retains C termination when a resource key value contains counted embedded NUL", /** Resource strings are counted UTF16; their invariant key view is a terminated native C string. @returns Completion after lookup. */ async () => {
  vi.resetModules();
  const resources = await import("./uresbund"),
    { resCString } = await import("./uresdata.path"),
    original = resources.ures_getString;
  vi.spyOn(resources, "ures_getString").mockImplementation(
    /** Supplies one well-formed counted Unicode resource value while retaining all actual owners and statuses. @param bundle - Actual resource owner. @param length - Native length output. @param status - Status. @returns Native counted text. */ (
      bundle,
      length,
      status,
    ) => {
      const value = original(bundle, length, status);
      if (value !== null && resCString(bundle?.fResPath ?? null) === "keyMap/calendar/") {
        const counted = value + "\0ignored";
        if (length !== null) length[0] = counted.length;
        return counted;
      }
      return value;
    },
  );
  const map = await import("./uloc_keytype");
  expect(map.ulocimp_toBcpKey("calendar")).toEqual({ value: "ca", inputAlias: false });
});
