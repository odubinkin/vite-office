/** @fileoverview Browser-only adapter exposing Sfx dispatch and bindings to React controls. */

import type {
  CommandDefinition,
  CommandDispatchResult,
  CommandState,
} from "../../../framework/source/dispatch/dispatchprovider";

/** Browser presentation view of one active Sfx frame. */
export interface WriterCommandSource {
  readonly Execute: (commandUrl: string, arguments_?: unknown) => CommandDispatchResult<unknown>;
  readonly QueryCommand: (
    commandUrl: string,
  ) => CommandDefinition<unknown, unknown, unknown> | undefined;
  readonly QueryState: (commandUrl: string) => CommandState;
}

/** Common properties consumed by generic Writer command presenters. */
export interface WriterCommandSurfaceProps {
  readonly commandSource: WriterCommandSource;
  readonly resolveArguments: (commandUrl: string) => unknown;
}
