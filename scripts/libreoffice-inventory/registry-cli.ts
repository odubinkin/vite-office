/** @fileoverview Provides UUID allocation, canonical compatibility generation, and app-scoped inventory validation. */
import { readFile, readdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createCapabilityId } from "./capability-identity";
import { isDirectModule } from "./cli";
import {
  loadInventoryRegistry,
  projectRegistryViews,
  registryOwners,
  type InventoryRegistry,
  type RegistryScope,
} from "./registry-storage";
import {
  loadRegistryCommands,
  parseInventoryRegistry,
  validateRegistryEvidence,
} from "./registry-validation";
import { selectRuntimeModulePaths } from "./runtime-inventory";

/** Strict registry command options. */
export interface RegistryCliOptions {
  readonly mode: "id" | "check" | "build";
  readonly scope: RegistryScope;
}
/** Injectable command boundaries keep checks independent of filesystem and source availability. */
export interface RegistryCliDependencies {
  readonly load: () => Promise<InventoryRegistry>;
  readonly read: (path: string) => Promise<string>;
  readonly listRuntime: () => Promise<readonly string[]>;
  readonly loadModule: (path: string) => Promise<Record<string, unknown>>;
  readonly write: (path: string, value: string) => Promise<unknown>;
  readonly generateUuid: () => string;
}

/** Parses one operation and optional app scope. @param args - Shell arguments. @returns Validated options. */
export function parseRegistryCliOptions(args: readonly string[]): RegistryCliOptions {
  const [mode, flag, scope] = args;
  if (
    (mode !== "id" && mode !== "check" && mode !== "build") ||
    (args.length !== 1 &&
      (args.length !== 3 ||
        flag !== "--scope" ||
        mode !== "check" ||
        (scope !== "all" && !registryOwners.includes(scope as (typeof registryOwners)[number]))))
  )
    throw new Error("Usage: registry-cli <id|build|check> [--scope all|writer|calc|shared]");
  return { mode, scope: (scope ?? "all") as RegistryScope };
}

/** Executes read-only scoped checks or writes explicitly requested ignored compatibility views. @param args - CLI arguments. @param dependencies - Injected boundaries. @param output - JSON or identity output. @returns Completion after all checks pass. */
export async function runRegistryCli(
  args: readonly string[],
  dependencies: RegistryCliDependencies,
  output: (value: string) => void,
): Promise<void> {
  const options = parseRegistryCliOptions(args);
  if (options.mode === "id") {
    output(`${createCapabilityId(dependencies.generateUuid)}\n`);
    return;
  }
  const registry = await dependencies.load();
  const parsed = parseInventoryRegistry(
    registry,
    await dependencies.read("docs/program/libreoffice-baseline.json"),
  );
  if (options.mode === "build") {
    for (const [path, view] of Object.entries(projectRegistryViews(registry)))
      await dependencies.write(path, `${JSON.stringify(view, null, 2)}\n`);
    output(`${JSON.stringify({ status: "generated", viewCount: 4 })}\n`);
    return;
  }
  const commands = await loadRegistryCommands(registry, options.scope, dependencies.loadModule);
  const report = await validateRegistryEvidence(
    registry,
    parsed,
    options.scope,
    selectRuntimeModulePaths("apps/office/src", await dependencies.listRuntime()),
    dependencies.read,
    commands,
    "vendor/libreoffice-reference",
  );
  output(`${JSON.stringify(report, null, 2)}\n`);
}

/* v8 ignore start -- production shell wiring is exercised by task CLI checks; all behavior is tested through injectable boundaries. */
if (isDirectModule(import.meta.url, process.argv[1])) {
  const { randomUUID } = await import("node:crypto");
  await runRegistryCli(
    process.argv.slice(2),
    {
      load: loadInventoryRegistry,
      /** Reads a repository-local file. @param path - File path. @returns UTF-8 contents. */
      read: (path) => readFile(path, "utf8"),
      /** Discovers production source entries. @returns Recursive relative paths. */
      listRuntime: () => readdir("apps/office/src", { recursive: true }),
      /** Imports the declared app-owned command registry. @param path - Validated module path. @returns Module exports. */
      loadModule: (path) => import(pathToFileURL(resolve(path)).href),
      write: writeFile,
      generateUuid: randomUUID,
    },
    process.stdout.write.bind(process.stdout),
  );
}
/* v8 ignore stop */
