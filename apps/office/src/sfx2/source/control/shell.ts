/** @fileoverview Ports bounded SfxShell interface ownership from pinned `sfx2/source/control/shell.cxx`. */

import type { SfxRequest } from "./request";
import type { SfxSlot } from "./msg";
import type { SfxInterface } from "./objface";
import type { CommandDispatchResult } from "./dispatch";
import type { SfxSlotState } from "./bindings";

/** One active shell that exposes a generated SfxInterface. */
export interface SfxShell {
  readonly GetInterface: () => SfxInterface<unknown>;
  readonly ResolveSlot: (slotId: number) => ResolvedShellCommand | undefined;
}

/** One slot already bound to the shell context that owns Execute and GetState. */
export interface ResolvedShellCommand {
  readonly command: SfxSlot<unknown>;
  readonly execute: (request: SfxRequest) => CommandDispatchResult<unknown>;
  readonly getState: () => SfxSlotState;
  readonly slot: SfxSlot<unknown>;
}

/** Binds one generated interface to the long-lived shell owner. @param context - Shell context. @param sfxInterface - Generated interface. @returns Active shell. */
export function createSfxShell<Context>(
  context: Context,
  sfxInterface: SfxInterface<Context>,
): SfxShell {
  return {
    GetInterface: /** Returns the generated interface. @returns Interface. */ () =>
      sfxInterface as SfxInterface<unknown>,
    ResolveSlot:
      /** Resolves one interface slot. @param slotId - Numeric slot. @returns Bound command. */ (
        slotId,
      ): ResolvedShellCommand | undefined => {
        const slot = sfxInterface.GetSlot(slotId);
        if (slot === undefined) return undefined;
        return {
          command: slot as SfxSlot<unknown>,
          execute:
            /** Executes one bound request. @param request - Slot request. @returns Dispatch result. */ (
              request,
            ): CommandDispatchResult<unknown> => {
              if (request.GetSlot() !== slotId)
                throw new Error(`SfxRequest slot does not match command: ${slot.commandUrl}`);
              const state = slot.GetState(context);
              if (!state.enabled) return { commandId: slot.commandUrl, status: "disabled" };
              return {
                commandId: slot.commandUrl,
                status: "executed",
                value: slot.Execute(context, request),
              };
            },
          getState: /** Queries bound slot state. @returns Slot state. */ () =>
            slot.GetState(context),
          slot: slot as SfxSlot<unknown>,
        };
      },
  };
}
