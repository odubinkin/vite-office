/** @fileoverview Owns Writer popup presentation while native edit-window and dispatcher retain selection and command policy. */
import { useCallback, useState } from "react";
import {
  CommandPopupMenu,
  type CommandPopupMenuProps,
} from "../../../framework/browser/presentation/CommandPopupMenu";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import type { BrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { getWriterPopupMenuPlacements } from "../../uiconfig/swriter/menubar/menubar-commands";
import { selectWriterPopupCommandResource } from "./writer-command-presentation";
/** Receives only the final resource name and device position selected by native owners. */
type PresentPopup = (name: string, position: CommandPopupMenuProps["position"]) => void;
/** Owns the active frame's popup state, localization and mounted shared bindings clients. @param enabled - Whether the owning frame admits document input. @param commandSource - Original frame bindings and dispatcher. @param resolveArguments - Existing native command argument route. @returns Editor callback and popup element. */
export function useWriterContextMenu(
  enabled: boolean,
  commandSource: BrowserCommandSource,
  resolveArguments: NonNullable<CommandPopupMenuProps["resolveArguments"]>,
): readonly [PresentPopup | undefined, React.JSX.Element | null] {
  const localization = useBrowserLocalization();
  const [popup, setPopup] = useState<Pick<CommandPopupMenuProps, "items" | "position">>();
  const close = useCallback(
    /** Releases the frame's native-selected popup. @returns Nothing. */ () => setPopup(undefined),
    [],
  );
  const present = useCallback(
    /** Presents only an actual generated native resource. @param name - Native resource name. @param position - Device point. @returns Nothing. */ (
      name: string,
      position: CommandPopupMenuProps["position"],
    ) => {
      const items = getWriterPopupMenuPlacements(name);
      if (items !== undefined) setPopup({ items, position });
    },
    [],
  );
  const getMenuLabel = useCallback(
    /** Localizes original resource labels. @param id - Native menu identity. @param fallback - Resource label. @returns Localized label. */ (
      id: string,
      fallback: string,
    ) => localization.GetText(`writer.menu.${id}.label`, fallback),
    [localization],
  );
  const getCommandResource = useCallback(
    /** Selects native popup-specific labels through the existing localization owner. @param url - Native command URL. @returns Localized resource. */ (
      url: string,
    ) => selectWriterPopupCommandResource(localization, url),
    [localization],
  );
  if (!enabled && popup !== undefined) setPopup(undefined);
  return [
    enabled ? present : undefined,
    popup === undefined || !enabled ? null : (
      <CommandPopupMenu
        {...popup}
        ariaLabel="Writer context menu"
        commandSource={commandSource}
        getMenuLabel={getMenuLabel}
        getCommandResource={getCommandResource}
        onClose={close}
        resolveArguments={resolveArguments}
      />
    ),
  ];
}
