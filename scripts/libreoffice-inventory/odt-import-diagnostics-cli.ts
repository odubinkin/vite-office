/** @fileoverview Local-only ODT diagnostic entry point; prints no document text or file path. */

import fs from "node:fs";
import { diagnoseOdtImport } from "./odt-import-diagnostics";

const file = process.argv[2];
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
