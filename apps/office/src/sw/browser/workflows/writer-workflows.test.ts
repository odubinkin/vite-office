/** @fileoverview Verifies explicit Writer browser-platform failures. */

import { describe, expect, it } from "vitest";

import { WriterPlatformError } from "./writer-workflows";

describe("WriterPlatformError", /** Registers platform-error tests. @returns Nothing. */ function definePlatformErrorTests(): void {
  it("retains a stable machine-readable code for Sfx command completion", /** Verifies stable failure identity. @returns Nothing. */ function retainsCode(): void {
    const error = new WriterPlatformError("storage-unavailable", "Browser storage is unavailable.");
    expect(error).toMatchObject({
      code: "storage-unavailable",
      message: "Browser storage is unavailable.",
      name: "WriterPlatformError",
    });
  });
});
