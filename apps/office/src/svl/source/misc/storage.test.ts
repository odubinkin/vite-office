/** @fileoverview Verifies that invalid persistence records never reach an adapter. */

import { describe, expect, it, vi } from "vitest";

import { saveStorageRecord } from "./storage";

describe("versioned storage validation", /** Groups versioned storage validation. @returns Test callback result. */ () => {
  it("rejects blank identities and invalid generations before writing", /** Checks rejects blank identities and invalid generations before writing. @returns Test callback result. */ async () => {
    const save = vi.fn(
      /** Runs the test callback. @returns Test callback result. */ async () => undefined,
    );
    for (const record of [
      { id: " ", version: 0, state: "text" },
      { id: "doc", version: -1, state: "text" },
      { id: "doc", version: 0.5, state: "text" },
    ]) {
      await expect(saveStorageRecord({ save }, record)).rejects.toThrow(/id and version/);
    }
    expect(save).not.toHaveBeenCalled();
  });
});
