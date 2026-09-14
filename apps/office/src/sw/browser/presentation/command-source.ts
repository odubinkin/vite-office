/** @fileoverview Browser presentation boundary for querying and dispatching shared command descriptors. */
import type {
  CommandDefinition,
  CommandDispatchResult,
  CommandState,
} from "../../../framework/source/dispatch/dispatchprovider";

/** Supplies descriptor, state, and execution access to browser command surfaces. */
export interface WriterCommandSource {
  readonly Execute: (commandId: string, arguments_?: unknown) => CommandDispatchResult<unknown>;
  readonly QueryCommand: (
    commandId: string,
  ) => CommandDefinition<unknown, unknown, unknown> | undefined;
  readonly QueryState: (commandId: string) => CommandState;
}

/** Common properties consumed by generic Writer command presenters. */
export interface WriterCommandSurfaceProps {
  readonly commandSource: WriterCommandSource;
  readonly resolveArguments: (commandId: string) => unknown;
}
