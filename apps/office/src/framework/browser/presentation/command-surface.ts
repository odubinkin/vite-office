/** @fileoverview Browser-only adapter exposing Sfx dispatch and bindings to presentation controls. */

import type {
  CommandDefinition,
  CommandDispatchResult,
  CommandState,
} from "../../../sfx2/source/control/dispatch";
import type { SfxViewFrame } from "../../../sfx2/source/view/viewfrm";
import { SfxControllerItem } from "../../../sfx2/source/control/ctrlitem";
import { useEffect, useMemo, useSyncExternalStore } from "react";

/** Browser presentation view of one active Sfx frame. */
export interface BrowserCommandControllerItem {
  readonly Dispose: () => void;
  readonly GetState: () => CommandState;
  readonly Subscribe: (listener: () => void) => () => void;
}

/** Browser presentation view of one active Sfx frame. */
export interface BrowserCommandSource {
  readonly CreateControllerItem: (commandUrl: string) => BrowserCommandControllerItem;
  readonly Execute: (commandUrl: string, arguments_?: unknown) => CommandDispatchResult<unknown>;
  readonly QueryCommand: (
    commandUrl: string,
  ) => CommandDefinition<unknown, unknown, unknown> | undefined;
}

/** Common properties consumed by generic Writer command presenters. */
export interface BrowserCommandSurfaceProps {
  readonly commandSource: BrowserCommandSource;
  readonly resolveArguments: (commandUrl: string) => unknown;
}

/** Adapts one active Sfx frame without adding presentation-owned command semantics. @param frame - Active frame. @returns Stable command source. */
export function createBrowserCommandSource<View>(frame: SfxViewFrame<View>): BrowserCommandSource {
  const dispatcher = frame.GetDispatcher();
  const bindings = frame.GetBindings();
  return {
    CreateControllerItem:
      /** Creates one slot-specific bindings client. @param commandUrl - Bound command URL. @returns Controller item. */ (
        commandUrl,
      ) => new SfxControllerItem(commandUrl, bindings),
    Execute:
      /** Dispatches through the frame dispatcher. @param commandUrl - Command URL. @param arguments_ - Optional typed payload. @returns Dispatch outcome. */ (
        commandUrl,
        arguments_,
      ) => dispatcher.Execute(commandUrl, arguments_),
    QueryCommand:
      /** Resolves the active descriptor. @param commandUrl - Command URL. @returns Command descriptor or undefined. */ (
        commandUrl,
      ) => dispatcher.QueryDispatch(commandUrl)?.command,
  };
}

/** Reads one slot through a persistent SfxControllerItem instead of querying during render. @param commandSource - Active frame adapter. @param commandUrl - Bound command URL. @returns Current stable slot state. */
export function useBrowserCommandState(
  commandSource: BrowserCommandSource,
  commandUrl: string,
): CommandState {
  const controller = useMemo(
    /** Creates the slot-specific subscription owner. @returns Controller item. */ () =>
      commandSource.CreateControllerItem(commandUrl),
    [commandSource, commandUrl],
  );
  useEffect(
    /** Disposes the controller item when its control unmounts or changes slot. @returns Cleanup. */ () =>
      /** Releases the bindings subscription. @returns Nothing. */ () =>
        controller.Dispose(),
    [controller],
  );
  return useSyncExternalStore(controller.Subscribe, controller.GetState, controller.GetState);
}

/** Resource fields combined with a live bindings state for one browser command control. */
export interface BrowserCommandPresentationResource {
  readonly argumentSchema?: readonly string[];
  readonly controlLabel?: string;
  readonly label: string;
  readonly selectionValue?: string;
  readonly semantics: "action" | "check" | "radio";
  readonly shortcuts?: readonly string[];
}

/** Selects one resource and its live Sfx slot state for every presentation surface. @param commandSource - Active frame adapter. @param commandUrl - Canonical slot URL. @param getCommandResource - Localized generated resource lookup. @returns Resource and live control state. */
export function useBrowserCommandPresentation<Resource extends BrowserCommandPresentationResource>(
  commandSource: BrowserCommandSource,
  commandUrl: string,
  getCommandResource: (commandUrl: string) => Resource,
): Readonly<{
  resource: Resource;
  enabled: boolean;
  checked: boolean;
  selectedValue: CommandState["value"];
  pending: boolean;
  error: CommandState["error"];
}> {
  const state = useBrowserCommandState(commandSource, commandUrl);
  return {
    resource: getCommandResource(commandUrl),
    enabled: state.enabled && state.pending !== true,
    checked: state.checked === true,
    selectedValue: state.value,
    pending: state.pending === true,
    error: state.error,
  };
}
