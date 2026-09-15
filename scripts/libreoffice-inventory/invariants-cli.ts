/** @fileoverview Checks the committed Writer invariant manifest against local and pinned LibreOffice evidence. */

import { readFile, writeFile } from "node:fs/promises";

import { isDirectModule } from "./cli";
import {
  createUpstreamInvariantManifest,
  serializeUpstreamInvariantManifest,
  validateUpstreamInvariantEvidence,
} from "./upstream-invariants";

/** Runs the invariant gate. @param argumentsList - Optional manifest path. @param readTextFile - Injected reader. @param writeOutput - Output boundary. @param writeTextFile - Injected generator output writer. @returns Completion after validation. */
export async function runInvariantCli(
  argumentsList: readonly string[],
  readTextFile: (path: string) => Promise<string>,
  writeOutput: (value: string) => void,
  writeTextFile: (path: string, value: string) => Promise<void> = writeFile,
): Promise<void> {
  if (argumentsList.length > 2 || (argumentsList.length === 2 && argumentsList[0] !== "--write"))
    throw new Error("Usage: inventory:invariants -- [--write] [manifest-path]");
  const write = argumentsList[0] === "--write";
  const manifestPath =
    argumentsList[write ? 1 : 0] ?? "docs/program/parity/upstream-invariants.json";
  const expected = createUpstreamInvariantManifest();
  const canonical = serializeUpstreamInvariantManifest(expected);
  if (write) await writeTextFile(manifestPath, canonical);
  else {
    const committed = await readTextFile(manifestPath);
    if (committed !== canonical)
      throw new Error(
        "Committed upstream invariant manifest is stale; regenerate it from the catalog.",
      );
  }
  await validateUpstreamInvariantEvidence(
    expected,
    readTextFile,
    /** Reads pinned evidence. @param path - Upstream-relative path. @returns File contents. */ async (
      path,
    ) => readTextFile(`vendor/libreoffice-reference/${path}`),
  );
  writeOutput(`${JSON.stringify({ invariantCount: expected.entries.length, status: "valid" })}\n`);
}

/* v8 ignore next 10 -- direct shell execution is covered by the task-level command; injected boundaries cover command behavior. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  await runInvariantCli(
    process.argv.slice(2),
    /** Reads one CLI file. @param path - Repository-relative path. @returns File contents. */ (
      path,
    ) => readFile(path, "utf8"),
    process.stdout.write.bind(process.stdout),
  );
}
