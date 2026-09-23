/** @fileoverview Projects pinned Writer command resources through browser localization. */

import type { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import {
  getWriterCommandResource,
  type WriterCommandResource,
} from "../../uiconfig/swriter/writer-command-resources";

/** Selects the same command metadata for every Writer presentation surface. @param localization - Active browser locale. @param commandUrl - Canonical Writer slot URL. @returns Localized generated resource. */
export function selectWriterCommandResource(
  localization: BrowserLocalizationService,
  commandUrl: string,
): WriterCommandResource {
  const resource = getWriterCommandResource(commandUrl);
  return {
    ...resource,
    controlLabel: localization.GetText(
      `writer.command.${commandUrl}.control-label`,
      resource.controlLabel,
    ),
    label: localization.GetText(`writer.command.${commandUrl}.label`, resource.label),
  };
}
