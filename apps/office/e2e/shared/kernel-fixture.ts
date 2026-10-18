/** @fileoverview Bundles actual repository kernel exports for isolated browser acceptance without shipping test globals in application code. */
import type { Page } from "@playwright/test";
import { build } from "vite";
import { resolve } from "node:path";
/** Source-owned public exports included in one test-only kernel bundle. */
interface KernelExports {
  readonly module: string;
  readonly names: readonly string[];
}
/** Installs real TypeScript runtime exports in the test page. Callers supply static repository-owned names and module paths. @param page - Actual browser page. @param name - Static JavaScript global identifier. @param exports - Source modules. @returns Installation completion. */
export async function installKernelFixture(
  page: Page,
  name: string,
  exports: readonly KernelExports[],
): Promise<void> {
  const root = resolve(import.meta.dirname, "../.."),
    id = name + "-entry";
  const result = await build({
    configFile: false,
    root,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    plugins: [
      {
        name: id,
        /** Resolves the test-only entry. @param value - Module ID. @returns Virtual ID. */
        resolveId(value) {
          return value === id || value === resolve(root, id) ? "\0" + id : undefined;
        },
        /** Emits actual source export declarations. @param value - Module ID. @returns Source. */
        load(value) {
          return value === "\0" + id
            ? exports
                .map(
                  /** Names actual source exports. @param entry - Module declaration. @returns Export statement. */ (
                    entry,
                  ) =>
                    "export {" +
                    entry.names.join(",") +
                    "} from " +
                    JSON.stringify(resolve(root, entry.module)) +
                    ";",
                )
                .join("\n")
            : undefined;
        },
      },
    ],
    build: { write: false, minify: false, lib: { entry: id, name, formats: ["iife"] } },
  });
  const outputs = Array.isArray(result)
    ? result.flatMap(
        /** Collects actual compiler outputs. @param value - Build result. @returns Outputs. */ (
          value,
        ) => value.output,
      )
    : "output" in result
      ? result.output
      : [];
  const chunk = outputs.find(
    /** Selects executable code. @param value - Output. @returns Chunk flag. */ (value) =>
      value.type === "chunk",
  );
  if (chunk === undefined || chunk.type !== "chunk") throw Error("Missing kernel fixture bundle");
  await page.addScriptTag({
    content: chunk.code + "\n;globalThis[" + JSON.stringify(name) + "]=" + name + ";",
  });
}
