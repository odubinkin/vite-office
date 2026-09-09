/**
 * @fileoverview Verifies deterministic React mounting and the explicit missing-root bootstrap failure.
 */

import { act, screen } from "@testing-library/react";
import type { Root } from "react-dom/client";
import { describe, expect, it } from "vitest";

import { mountApplication } from "./bootstrap";

describe("mountApplication" /**
 * Groups browser-root lifecycle tests for the static entry adapter.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineBootstrapTests(): void {
  it("mounts and returns a controllable React root" /**
   * Mounts the launcher into a detached test container and unmounts it cleanly.
   *
   * @returns Nothing; assertions verify the mounted office launcher.
   */, function verifyMount(): void {
    globalThis.history.replaceState(null, "", "/");
    const container = document.createElement("div");
    document.body.append(container);
    let root: Root | undefined;

    /**
     * Performs the React mount inside Testing Library's synchronous act boundary.
     *
     * @returns Nothing; the created root is retained for deterministic cleanup.
     */
    function performMount(): void {
      root = mountApplication(container);
    }

    /**
     * Removes the mounted React tree inside Testing Library's act boundary.
     *
     * @returns Nothing; the retained root releases component resources.
     */
    function performUnmount(): void {
      root?.unmount();
    }

    act(performMount);
    expect(screen.getByRole("navigation", { name: "Office applications" })).toBeInTheDocument();
    expect(document.querySelector("#workspace")).not.toBeInTheDocument();
    act(performUnmount);
    container.remove();
  });

  it("throws when the static HTML root is missing" /**
   * Exercises the negative bootstrap branch with a null root reference.
   *
   * @returns Nothing; the expected error is asserted synchronously.
   */, function verifyMissingRootFailure(): void {
    /**
     * Attempts to mount without the required static HTML root.
     *
     * @returns No usable root because the mount adapter throws synchronously.
     */
    function mountWithoutRoot(): Root {
      return mountApplication(null);
    }

    expect(mountWithoutRoot).toThrowError("Vite Office could not find its #root mount element.");
  });
});
