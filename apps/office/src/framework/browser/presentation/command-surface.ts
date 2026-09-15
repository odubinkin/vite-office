/** @fileoverview Browser-only adapter exposing Sfx dispatch and bindings to presentation controls. */

import type {
  CommandDefinition,
  CommandDispatchResult,
  CommandState,
} from "../../source/dispatch/dispatchprovider";
import type { OfficeFrame } from "../../source/dispatch/dispatchprovider";

/** Browser presentation view of one active Sfx frame. */
export interface BrowserCommandSource {
  readonly Execute: (commandUrl: string, arguments_?: unknown) => CommandDispatchResult<unknown>;
  readonly QueryCommand: (
    commandUrl: string,
  ) => CommandDefinition<unknown, unknown, unknown> | undefined;
  readonly QueryState: (commandUrl: string) => CommandState;
}

/** Common properties consumed by generic Writer command presenters. */
export interface BrowserCommandSurfaceProps {
  readonly commandSource: BrowserCommandSource;
  readonly resolveArguments: (commandUrl: string) => unknown;
}

/** Adapts one active Sfx frame without adding presentation-owned command semantics. @param frame - Active frame. @returns Stable command source. */
export function createBrowserCommandSource<View>(frame: OfficeFrame<View>): BrowserCommandSource {
  const dispatcher = frame.GetDispatcher();
  const bindings = frame.GetBindings();
  return {
    Execute:
      /** Dispatches through the frame dispatcher. @param commandUrl - Command URL. @param arguments_ - Optional typed payload. @returns Dispatch outcome. */ (
        commandUrl,
        arguments_,
      ) => dispatcher.Execute(commandUrl, arguments_),
    QueryCommand:
      /** Resolves the active descriptor. @param commandUrl - Command URL. @returns Command descriptor or undefined. */ (
        commandUrl,
      ) => dispatcher.QueryDispatch(commandUrl)?.command,
    QueryState:
      /** Reads current bindings state. @param commandUrl - Command URL. @returns Command state. */ (
        commandUrl,
      ) => bindings.QueryState(commandUrl),
  };
}
