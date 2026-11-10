/** @fileoverview Writer configuration settings export from pinned xmlexp.cxx. */
import { exportConfigurationSettings } from "../../../../xmloff/source/core/SettingsExportHelper";
import type { SwDoc } from "../../core/doc/doc";
import { SwXDocumentSettings } from "../../uibase/uno/SwXDocumentSettings";

/** Exports represented Writer configuration through the original common settings format. @param document - Canonical Writer model. @returns Settings stream. */
export function exportSettingsXml(document: SwDoc): string {
  const properties = new SwXDocumentSettings(document).getConfigurationSettings();
  try {
    return exportConfigurationSettings(properties);
  } finally {
    for (const property of properties) {
      property.Name.dispose();
      property.Value.dispose();
    }
  }
}
