/** @fileoverview Verifies deterministic upstream invariant generation and exact drift diagnostics. */

import { describe, expect, it } from "vitest";

import { runInvariantCli } from "./invariants-cli";
import {
  createUpstreamInvariantManifest,
  serializeUpstreamInvariantManifest,
  validateUpstreamInvariantEvidence,
  type UpstreamInvariantManifest,
} from "./upstream-invariants";

describe("upstream invariant manifest", /** Registers invariant tests. @returns Nothing. */ () => {
  it("serializes deterministically and validates all exact markers", /** Verifies canonical generation. @returns Completion after assertions. */ async () => {
    const manifest = createUpstreamInvariantManifest();
    expect(manifest.entries).toHaveLength(34);
    expect(
      manifest.entries.map(
        /** Selects an identifier. @param item - Invariant entry. @returns Stable identifier. */ (
          item,
        ) => item.id,
      ),
    ).toEqual(
      [
        ...manifest.entries.map(
          /** Selects an identifier. @param item - Invariant entry. @returns Stable identifier. */ (
            item,
          ) => item.id,
        ),
      ].sort(),
    );
    const local = new Map(
      manifest.entries.map(
        /** Selects a local path. @param item - Invariant entry. @returns Map tuple. */ (item) => [
          item.local.path,
          "",
        ],
      ),
    );
    const upstream = new Map(
      manifest.entries.map(
        /** Selects an upstream path. @param item - Invariant entry. @returns Map tuple. */ (
          item,
        ) => [item.upstream.path, ""],
      ),
    );
    for (const item of manifest.entries) {
      local.set(item.local.path, `${local.get(item.local.path)}\n${item.local.marker}`);
      upstream.set(
        item.upstream.path,
        `${upstream.get(item.upstream.path)}\n${item.upstream.marker}`,
      );
    }
    await expect(
      validateUpstreamInvariantEvidence(
        manifest,
        /** Reads local fixture text. @param path - Fixture path. @returns Fixture contents. */ async (
          path,
        ) => local.get(path) ?? "",
        /** Reads upstream fixture text. @param path - Fixture path. @returns Fixture contents. */ async (
          path,
        ) => upstream.get(path) ?? "",
      ),
    ).resolves.toBeUndefined();
    expect(serializeUpstreamInvariantManifest(manifest).endsWith("\n")).toBe(true);
  });

  it("rejects schema, baseline, duplicate, marker, and undeclared value drift", /** Verifies strict diagnostics. @returns Completion after assertions. */ async () => {
    const source = createUpstreamInvariantManifest();
    const read = /** Reads complete fixture text. @returns Fixture contents. */ async () =>
      source.entries
        .flatMap(
          /** Selects exact markers. @param item - Invariant entry. @returns Marker pair. */ (
            item,
          ) => [item.local.marker, item.upstream.marker],
        )
        .join("\n");
    await expect(
      validateUpstreamInvariantEvidence(
        { ...source, schemaVersion: 2 } as unknown as UpstreamInvariantManifest,
        read,
        read,
      ),
    ).rejects.toThrow("schemaVersion");
    await expect(
      validateUpstreamInvariantEvidence({ ...source, baselineTag: "other" }, read, read),
    ).rejects.toThrow("baseline");
    await expect(
      validateUpstreamInvariantEvidence(
        { ...source, entries: [source.entries[0]!, source.entries[0]!] },
        read,
        read,
      ),
    ).rejects.toThrow("Duplicate");
    await expect(
      validateUpstreamInvariantEvidence(
        source,
        /** Returns missing local evidence. @returns Empty contents. */ async () => "",
        read,
      ),
    ).rejects.toThrow("Local invariant drift");
    await expect(
      validateUpstreamInvariantEvidence(
        source,
        read,
        /** Returns missing upstream evidence. @returns Empty contents. */ async () => "",
      ),
    ).rejects.toThrow("Pinned upstream invariant drift");
    const first = source.entries.find(
      /** Selects a parity entry. @param item - Invariant entry. @returns Whether values must match. */ (
        item,
      ) => item.divergenceClass === "none",
    )!;
    await expect(
      validateUpstreamInvariantEvidence(
        { ...source, entries: [{ ...first, local: { ...first.local, value: -1 } }] },
        read,
        read,
      ),
    ).rejects.toThrow("Undeclared invariant divergence");
  });

  it("checks the committed canonical payload and CLI arguments", /** Verifies CLI check and write modes. @returns Completion after assertions. */ async () => {
    const canonical = serializeUpstreamInvariantManifest(createUpstreamInvariantManifest());
    const read =
      /** Reads CLI fixture data. @param path - Requested fixture path. @returns Fixture contents. */ async (
        path: string,
      ) =>
        path.endsWith("upstream-invariants.json")
          ? canonical
          : createUpstreamInvariantManifest()
              .entries.flatMap(
                /** Selects exact markers. @param item - Invariant entry. @returns Marker pair. */ (
                  item,
                ) => [item.local.marker, item.upstream.marker],
              )
              .join("\n");
    let output = "";
    await runInvariantCli(
      [],
      read,
      /** Captures CLI output. @param value - Output chunk. @returns Nothing. */ (value) => {
        output += value;
      },
    );
    expect(JSON.parse(output)).toMatchObject({ invariantCount: 34, status: "valid" });
    let written = "";
    await runInvariantCli(
      ["--write", "custom.json"],
      read,
      /** Ignores validation output. @returns Nothing. */ () => undefined,
      /** Captures generated data. @param path - Output path. @param value - Canonical JSON. @returns Completion. */ async (
        path,
        value,
      ) => {
        expect(path).toBe("custom.json");
        written = value;
      },
    );
    expect(written).toBe(canonical);
    await expect(
      runInvariantCli(["a", "b"], read, /** Ignores output. @returns Nothing. */ () => undefined),
    ).rejects.toThrow("Usage");
    await expect(
      runInvariantCli(
        [],
        /** Returns a stale manifest. @param path - Requested fixture path. @returns Fixture contents. */ async (
          path,
        ) => (path.endsWith("upstream-invariants.json") ? "{}\n" : read(path)),
        /** Ignores output. @returns Nothing. */ () => undefined,
      ),
    ).rejects.toThrow("stale");
  });
});
