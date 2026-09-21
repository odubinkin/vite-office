/**
 * @fileoverview Verifies strict parity dimension evidence and complete B/X divergence classification.
 */

import { describe, expect, it } from "vitest";

import { parseParityClosure, validateParityClosureEvidence } from "./parity-mappings";

/** Mutable JSON fixture shape used to exercise strict parsing. */
interface ClosureFixture {
  readonly behavior: Record<string, unknown>;
  readonly contract: Record<string, unknown>;
  readonly defaults: Record<string, unknown>;
  readonly differential: Record<string, unknown>;
  readonly divergences: readonly unknown[];
  readonly operationCycle: Record<string, unknown>;
  readonly ownership: Record<string, unknown>;
  readonly serialization: Record<string, unknown>;
}

describe("parity closure" /** @returns Nothing; Vitest registers enclosed tests. */, function defineParityClosureTests(): void {
  it("parses and resolves a complete bounded closure" /** @returns A promise resolving after all markers are checked. */, async function resolvesCompleteClosure(): Promise<void> {
    const closure = parseParityClosure(
      createClosure(["Desktop dialogs remain excluded."], "browser-adaptation"),
      "LO-WRITER-0101",
      ["Desktop dialogs remain excluded."],
      "browser-adaptation",
    );
    const resolved = await validateParityClosureEvidence(
      closure,
      { local: "local", upstream: "upstream" },
      /** Returns the marker encoded by the synthetic path. @param path - Rooted evidence path. @returns Marker text. */
      async function readEvidence(path): Promise<string> {
        return path.split("/").at(-1)?.replace(".ts", "") ?? "";
      },
    );
    expect(resolved).toHaveLength(16);
    expect(resolved[0]).toEqual({
      dimension: "contract",
      path: "contract.ts",
      side: "local",
    });
    expect(resolved.at(-1)).toEqual({
      dimension: "divergence",
      path: "implementation.ts",
      side: "upstream",
    });
  });

  it("rejects missing universal dimensions, weak differential methods, and malformed applicability" /** @returns Nothing; all malformed closures throw. */, function rejectsWeakEvidence(): void {
    const closure = createClosure([], "none");
    expectInvalid(null);
    expectInvalid({ ...closure, contract: null });
    expectInvalid({ ...closure, divergences: null });
    expectInvalid({ ...closure, divergences: [null] });
    expectInvalid({
      ...closure,
      ownership: {
        method: "not-applicable",
        rationale: "Ownership cannot be skipped.",
        status: "not-applicable",
      },
    });
    expectInvalid({ ...closure, differential: { ...closure.differential, method: "unit-test" } });
    expectInvalid({ ...closure, differential: { ...closure.differential, method: "invalid" } });
    expectInvalid({ ...closure, serialization: { ...closure.serialization, method: "unit-test" } });
    expectInvalid({ ...closure, behavior: { ...closure.behavior, local: undefined } });
    expectInvalid({ ...closure, defaults: { ...closure.defaults, status: "unknown" } });
  });

  it("rejects unclassified, mismatched, and architecture-only divergences" /** @returns Nothing; classification failures throw. */, function rejectsDivergenceDrift(): void {
    const limitation = "Desktop dialogs remain excluded.";
    expectInvalid(
      { ...createClosure([], "browser-adaptation"), divergences: [] },
      [],
      "browser-adaptation",
    );
    expectInvalid(createClosure([limitation], "browser-adaptation"), [limitation], "none");
    expectInvalid(createClosure([], "local-infrastructure"), [], "local-infrastructure");
    expectInvalid(createClosure([], "none"), [limitation], "none");
    expectInvalid(
      {
        ...createClosure([], "none"),
        divergences: [
          {
            classification: "A",
            description: "Convenience layer.",
            local: reference("docs"),
            upstream: reference("implementation"),
          },
        ],
      },
      [],
      "none",
    );
  });

  it("reports an absent parity closure marker" /** @returns A promise resolving after expected rejection. */, async function rejectsMissingMarker(): Promise<void> {
    const closure = parseParityClosure(createClosure([], "none"), "LO-WRITER-0101", [], "none");
    await expect(
      validateParityClosureEvidence(
        closure,
        { local: "local", upstream: "upstream" },
        /** Returns unrelated evidence. @returns Unrelated text. */
        async function readMissingEvidence(): Promise<string> {
          return "unrelated";
        },
      ),
    ).rejects.toThrowError("parity closure local contract marker is absent");
    await expect(
      validateParityClosureEvidence(
        {
          ...closure,
          contract: { ...closure.contract, local: undefined },
        } as unknown as Parameters<typeof validateParityClosureEvidence>[0],
        { local: "local", upstream: "upstream" },
        /** Echoes the synthetic path. @param path - Evidence path. @returns The same path. */
        async function readEvidence(path): Promise<string> {
          return path;
        },
      ),
    ).rejects.toThrowError("Missing contract local parity closure evidence");
  });
});

/** Creates a valid closure. @param scopeLimitations - X boundaries. @param stackKind - Stack classification. @returns Closure fixture. */
function createClosure(
  scopeLimitations: readonly string[],
  stackKind: "browser-adaptation" | "local-infrastructure" | "none",
): ClosureFixture {
  /** Creates paired synthetic evidence. @param name - Marker name. @returns Dimension fixture. */
  function dimension(name: string): Record<string, unknown> {
    return {
      local: reference(name),
      method: "api-invariant",
      rationale: `Checks ${name}.`,
      status: "pass",
      upstream: reference(name),
    };
  }
  return {
    behavior: { ...dimension("behavior"), method: "unit-test" },
    contract: dimension("contract"),
    defaults: { ...dimension("defaults"), method: "unit-test" },
    differential: { ...dimension("differential"), method: "source-derived-golden" },
    divergences: [
      ...(stackKind === "browser-adaptation"
        ? [
            {
              classification: "B",
              description: "Browser platform boundary.",
              local: reference("docs"),
              upstream: reference("implementation"),
            },
          ]
        : []),
      ...scopeLimitations.map(
        /** Creates one excluded boundary. @param description - Boundary text. @returns X evidence. */
        function createExcluded(description) {
          return {
            classification: "X",
            description,
            local: reference("docs"),
            upstream: reference("implementation"),
          };
        },
      ),
    ],
    operationCycle: dimension("operation-cycle"),
    ownership: dimension("ownership"),
    serialization: {
      method: "not-applicable",
      rationale: "No serialization is involved.",
      status: "not-applicable",
    },
  };
}

/** Creates one reference. @param name - Marker name. @returns Synthetic reference. */
function reference(name: string): Record<string, string> {
  return { marker: name, path: `${name}.ts` };
}

/** Expects parsing failure. @param candidate - Malformed closure. @param scopeLimitations - X boundaries. @param stackKind - Stack classification. @returns Nothing after assertion. */
function expectInvalid(
  candidate: unknown,
  scopeLimitations: readonly string[] = [],
  stackKind: "browser-adaptation" | "local-infrastructure" | "none" = "none",
): void {
  expect(
    /** Parses the malformed fixture. @returns A result that should never be accepted. */
    function parseInvalidClosure(): unknown {
      return parseParityClosure(candidate, "LO-WRITER-0101", scopeLimitations, stackKind);
    },
  ).toThrowError();
}
