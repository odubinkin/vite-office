/** @fileoverview Verifies the framework facade delegates dispatch ownership to Sfx. */

import { describe, expect, it, vi } from "vitest";

import { FrameworkDispatchProvider } from "./dispatchprovider";
import type { SfxDispatcher } from "../../../sfx2/source/control/dispatch";

describe("FrameworkDispatchProvider", /** Registers framework facade tests. @returns Nothing. */ () => {
  it("delegates command URL lookup to the active Sfx dispatcher", /** Verifies delegation without framework-owned routing. @returns Nothing. */ () => {
    const resolved = {
      Execute: vi.fn(/** Executes the fixture command. @returns Nothing. */ () => undefined),
      GetState: vi.fn(
        /** Reads fixture command state. @returns Enabled state. */ () => ({ enabled: true }),
      ),
    };
    const QueryDispatch = vi.fn(
      /** Resolves the fixture command. @returns Fixture dispatch. */ () => resolved,
    );
    const provider = new FrameworkDispatchProvider({ QueryDispatch } as unknown as SfxDispatcher);
    expect(provider.QueryDispatch(".uno:Bold")).toBe(resolved);
    expect(QueryDispatch).toHaveBeenCalledWith(".uno:Bold");
  });
});
