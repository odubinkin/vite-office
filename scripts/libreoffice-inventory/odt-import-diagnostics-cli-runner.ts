/** @fileoverview Executes the local ODT diagnostic CLI with explicit arguments and the actual diagnostic owner. */
import fs from "node:fs";
import { diagnoseOdtImport } from "./odt-import-diagnostics";

/** Runs the same privacy-safe CLI operation without an import-time process-state capture. @param args - Arguments after the executable and entry path. @returns Completion. */
export async function runOdtImportDiagnosticsCli(args: readonly string[]): Promise<void> {
  const file = args[0];
  if (file === undefined) {
    process.stderr.write("Usage: tsx odt-import-diagnostics-cli.ts <local-odt-file>\n");
    process.exitCode = 2;
  } else {
    try {
      const report = await diagnoseOdtImport(new Uint8Array(fs.readFileSync(file)));
      process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
    } catch {
      process.stderr.write("ODT diagnostic could not read or inspect the package.\n");
      process.exitCode = 1;
    }
  }
}
