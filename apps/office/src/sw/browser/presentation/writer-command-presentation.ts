/** @fileoverview Projects pinned Writer command resources through browser localization. */

import type { CommandFailure } from "../../../sfx2/source/control/dispatch";
import type { SwView } from "../../source/uibase/uiview/view";
import type { WriterViewSnapshot } from "./writer-view-projection";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { BrowserLocalizationService } from "../../../framework/browser/localization/browser-localization";
import {
  getWriterCommandResource,
  type WriterCommandResource,
} from "../../uiconfig/swriter/writer-command-resources";

/** Selects the same command metadata for every Writer presentation surface. @param localization - Active browser locale. @param commandUrl - Canonical Writer slot URL. @param view - Active view for dynamic annotation command labels. @returns Localized generated resource. */
export function selectWriterCommandResource(
  localization: BrowserLocalizationService,
  commandUrl: string,
  view?: SwView,
): WriterCommandResource {
  const resource = getWriterCommandResource(commandUrl);
  const author =
    commandUrl === WRITER_COMMAND_IDS.deleteAuthor
      ? view?.GetPostItMgr().GetActiveField()?.GetField().GetData().author
      : undefined;
  return {
    ...resource,
    controlLabel: localization.GetText(
      `writer.command.${commandUrl}.control-label`,
      resource.controlLabel,
    ),
    label:
      author === undefined
        ? localization.GetText(`writer.command.${commandUrl}.label`, resource.label)
        : writerDeleteAuthorLabel(localization, author),
  };
}

/** Formats the native DeleteAuthor label for an active annotation. @param localization - Browser localization. @param author - Exact annotation author. @returns Localized action label. */
export function writerDeleteAuthorLabel(
  localization: BrowserLocalizationService,
  author: string,
): string {
  return localization
    .GetText("writer.comments.deleteAuthor", "Delete All Comments by $1")
    .replace(
      "$1",
      /** Substitutes the author's name literally. @returns Author name. */ () => author,
    );
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

/** Formats command completion and shell/medium state at the browser presentation boundary. @param view - Active Writer view. @param snapshot - Current projection. @param getText - Localization lookup. @returns Status text. */
export function presentWriterStatus(
  view: SwView,
  snapshot: WriterViewSnapshot,
  getText: (messageId: string, fallback: string) => string,
): string {
  const commandError = presentWriterCommandError(view, getText);
  if (commandError !== undefined) return commandError;
  const operation = snapshot.mediumOperation;
  if (operation.state === "failed")
    return (
      operation.message ?? getText("writer.status.operation-failed", "Document operation failed.")
    );
  if (operation.state === "pending")
    return getText("writer.status.operation-pending", "Document operation in progress.");
  if (operation.operation === "save" || operation.operation === "save-as")
    return operation.state === "succeeded"
      ? getText("writer.status.saved-local", "Saved locally in this browser.")
      : getText("writer.status.saving", "Saving document.");
  if (operation.operation === "open" && operation.state === "succeeded")
    return getText("writer.status.opened", "Document opened.");
  return snapshot.documentState.isModified
    ? getText("writer.status.modified", "Document has unsaved changes.")
    : getText("writer.status.not-saved", "Not saved in this browser.");
}

/** Resolves explicit Sfx command failures into browser presentation text. @param view - Active Writer view. @param getText - Localization lookup. @returns Status text, if a command failed. */
export function presentWriterCommandError(
  view: SwView,
  getText: (messageId: string, fallback: string) => string,
): string | undefined {
  const failure = view.GetViewFrame().GetDispatcher().GetLastCommandError();
  if (failure === undefined) return undefined;
  const errors: readonly Readonly<{
    commandId: string;
    present: (failure: CommandFailure) => string;
  }>[] = [
    {
      commandId: WRITER_COMMAND_IDS.openOdt,
      present:
        /** Presents an ODT-open failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) => `${getText("writer.error.open-odt", "Could not open ODT")}: ${commandFailure.error}`,
    },
    {
      commandId: WRITER_COMMAND_IDS.saveOdt,
      present:
        /** Presents an ODT-save failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) => `${getText("writer.error.save-odt", "Could not save ODT")}: ${commandFailure.error}`,
    },
    {
      commandId: WRITER_COMMAND_IDS.exportText,
      present: /** Presents an export failure. @returns Status text. */ () =>
        getText("writer.error.export-text", "Could not start plain-text download."),
    },
    {
      commandId: WRITER_COMMAND_IDS.copy,
      present:
        /** Presents a Copy failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "selection-required"
            ? getText("writer.error.copy-selection-required", "Select text to copy.")
            : getText("writer.error.copy", "Could not copy selection."),
    },
    {
      commandId: WRITER_COMMAND_IDS.cut,
      present:
        /** Presents a Cut failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "selection-required"
            ? getText("writer.error.cut-selection-required", "Select text to cut.")
            : getText("writer.error.cut", "Could not copy selection."),
    },
    {
      commandId: WRITER_COMMAND_IDS.paste,
      present:
        /** Presents a Paste failure. @param commandFailure - Failure state. @returns Status text. */ (
          commandFailure,
        ) =>
          commandFailure.code === "clipboard-empty"
            ? getText("writer.error.clipboard-empty", "Clipboard has no text to paste.")
            : getText("writer.error.paste", "Could not read browser clipboard."),
    },
  ];
  for (const candidate of errors) {
    if (candidate.commandId === failure.commandId) return candidate.present(failure);
  }
  /* istanbul ignore next -- an attached SwView dispatcher contains only the exhaustively mapped Writer commands above. */
  return failure.error;
}
