/**
 * @fileoverview Verifies safe Git execution and canonical origin normalization used by the inventory boundary.
 */

import { describe, expect, it } from "vitest";

import { createGitExecutor, normalizeRepositoryUrl } from "./git";

describe("Git inventory boundary" /**
 * Groups production executor and supported origin-normalization cases.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineGitBoundaryTests(): void {
  it("runs a read-only Git query without shell interpolation" /**
   * Verifies the production adapter can inspect the current repository.
   *
   * @returns A promise resolving after the Git output assertion completes.
   */, async function runsGitQuery(): Promise<void> {
    const output = await createGitExecutor().run(process.cwd(), [
      "rev-parse",
      "--is-inside-work-tree",
    ]);

    expect(output.trim()).toBe("true");
  });

  it("normalizes HTTPS and supported GitHub SSH origins consistently" /**
   * Verifies provenance comparison ignores only transport notation and trailing Git syntax.
   *
   * @returns Nothing; assertions validate canonical origins.
   */, function normalizesOrigins(): void {
    expect(normalizeRepositoryUrl("https://github.com/LibreOffice/core.git/\n")).toBe(
      "https://github.com/LibreOffice/core",
    );
    expect(normalizeRepositoryUrl("git@github.com:LibreOffice/core.git")).toBe(
      "https://github.com/LibreOffice/core",
    );
  });
});
