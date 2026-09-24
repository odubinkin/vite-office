/** @fileoverview Verifies the local diagnostic CLI's redacted output and argument failures. */

import { afterEach, describe, expect, it, vi } from "vitest";

const originalArgv = process.argv;
const originalExitCode = process.exitCode;

afterEach(
  /** Restores process state after each CLI import. @returns Nothing. */ () => {
    process.argv = originalArgv;
    process.exitCode = originalExitCode;
    vi.restoreAllMocks();
    vi.resetModules();
  },
);

describe("ODT diagnostic CLI", /** Groups local CLI assertions. @returns Nothing. */ () => {
  it("prints numeric/structural fixture results without source text", /** Checks successful redacted output. @returns Completion after CLI import. */ async () => {
    const stdout = vi
      .spyOn(process.stdout, "write")
      .mockImplementation(/** Swallows test stdout. @returns Accepted write. */ () => true);
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(/** Swallows test stderr. @returns Accepted write. */ () => true);
    process.argv = [
      "node",
      "odt-import-diagnostics-cli.ts",
      "apps/office/src/sw/qa/extras/odfimport/data/feature_text.odt",
    ];
    await import("./odt-import-diagnostics-cli");
    expect(stderr).not.toHaveBeenCalled();
    const output = String(stdout.mock.calls[0]?.[0]);
    expect(JSON.parse(output)).toMatchObject({ imported: true, canonical: { paragraphs: 1 } });
    expect(output).not.toContain("Hello World!");
  });

  it("reports a missing argument and a bad path without printing the path", /** Checks bounded failure messages. @returns Completion after CLI imports. */ async () => {
    const stderr = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(/** Swallows test stderr. @returns Accepted write. */ () => true);
    process.argv = ["node", "odt-import-diagnostics-cli.ts"];
    await import("./odt-import-diagnostics-cli");
    expect(process.exitCode).toBe(2);
    expect(String(stderr.mock.calls[0]?.[0])).toContain("Usage:");

    vi.resetModules();
    process.argv = ["node", "odt-import-diagnostics-cli.ts", "/missing-private-path.odt"];
    await import("./odt-import-diagnostics-cli");
    expect(process.exitCode).toBe(1);
    expect(String(stderr.mock.calls[1]?.[0])).toBe(
      "ODT diagnostic could not read or inspect the package.\n",
    );
  });
});
