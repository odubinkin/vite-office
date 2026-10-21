/** @fileoverview Local-only ODT diagnostic entry point; prints no document text or file path. */

import { runOdtImportDiagnosticsCli } from "./odt-import-diagnostics-cli-runner";

await runOdtImportDiagnosticsCli(process.argv.slice(2));
