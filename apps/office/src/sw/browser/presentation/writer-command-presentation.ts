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

/** Selects the original native PopupLabel for context menus while retaining general resource defaults and localization elsewhere. @param localization - Active browser locale. @param commandUrl - Native slot URL. @returns Localized popup resource. */
export function selectWriterPopupCommandResource(
  localization: BrowserLocalizationService,
  commandUrl: string,
): WriterCommandResource {
  const resource = selectWriterCommandResource(localization, commandUrl);
  return resource.popupLabel === undefined
    ? resource
    : {
        ...resource,
        label: localization.GetText(
          `writer.command.${commandUrl}.popup-label`,
          resource.popupLabel,
        ),
      };
}
