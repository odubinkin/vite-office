/**
 * @fileoverview Provides the minimal asynchronous Git boundary used by the read-only LibreOffice inventory validator.
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const executeFile = promisify(execFile);

/** Describes the single Git operation required by inventory validation and easily replaced by tests. */
export interface GitExecutor {
  /**
   * Runs Git in one repository and returns standard output.
   *
   * @param repositoryPath - Existing local Git worktree to inspect without mutation.
   * @param argumentsList - Git arguments excluding the executable and repository selector.
   * @returns A promise resolving to Git standard output.
   */
  run(repositoryPath: string, argumentsList: readonly string[]): Promise<string>;
}

/**
 * Creates the production Git executor with a bounded output buffer suitable for the large core file list.
 *
 * @returns A read-only Git executor backed by the local git executable.
 */
export function createGitExecutor(): GitExecutor {
  return {
    run: runGitCommand,
  };
}

/**
 * Runs Git with no shell interpolation and returns its unmodified standard output.
 *
 * @param repositoryPath - Existing local Git worktree to inspect without mutation.
 * @param argumentsList - Git arguments excluding the executable and repository selector.
 * @returns A promise resolving to Git standard output.
 */
async function runGitCommand(
  repositoryPath: string,
  argumentsList: readonly string[],
): Promise<string> {
  const result = await executeFile("git", ["-C", repositoryPath, ...argumentsList], {
    maxBuffer: 16 * 1024 * 1024,
  });

  return result.stdout;
}

/**
 * Normalizes supported GitHub HTTPS and SSH repository origins before exact provenance comparison.
 *
 * @param origin - Git remote URL emitted by remote get-url origin.
 * @returns Canonical HTTPS repository URL without a trailing .git or slash.
 */
export function normalizeRepositoryUrl(origin: string): string {
  const trimmed = origin.trim().replace(/\/+$/u, "");
  const sshMatch = /^git@github\.com:([^\s]+)$/u.exec(trimmed);
  const httpsValue = sshMatch === null ? trimmed : `https://github.com/${sshMatch[1]}`;

  return httpsValue.replace(/\.git$/u, "");
}
