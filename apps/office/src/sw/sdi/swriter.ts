/** @fileoverview Exposes bounded Writer slot identities generated from pinned SDI/HRC sources. */

import { SfxInterface } from "../../sfx2/source/control/objface";
import type { SfxSlotDefinition } from "../../sfx2/source/control/msg";
import { SfxUnoAnyItem } from "../../sfx2/source/view/frame";
import { type SfxPoolItem } from "../../svl/source/items/poolitem";
import type { WriterHyperlink } from "../source/core/txtnode/fmtinfmt";
import { getWriterCommandResource } from "../uiconfig/swriter/writer-command-resources";
import generated from "../uiconfig/swriter/writer-ui.generated.json" with { type: "json" };

/** Shell-owned Execute/GetState declaration before generated slot metadata is attached. */
export interface WriterSlotHandler<Context> {
  readonly capabilityId?: `CAP-${string}`;
  readonly execute: (context: Context, arguments_: readonly SfxPoolItem[]) => unknown;
  readonly getStateValue?: (context: Context) => unknown;
  readonly id: string;
  readonly isChecked?: (context: Context) => boolean;
  readonly isEnabled?: (context: Context) => boolean;
  readonly isMixed?: (context: Context) => boolean;
}

/** Builds one Writer SfxInterface from generated SDI/HRC/XCU metadata and shell handlers. @param handlers - Shell handlers. @returns Generated interface. */
export function createWriterInterface<Context>(
  handlers: readonly WriterSlotHandler<Context>[],
): SfxInterface<Context> {
  return new SfxInterface(
    handlers.map(
      /** Attaches generated metadata. @param handler - Shell handler. @returns Slot definition. */ (
        handler,
      ): SfxSlotDefinition<Context> => {
        const resource = getWriterCommandResource(handler.id);
        return {
          ...(handler.capabilityId === undefined ? {} : { capabilityId: handler.capabilityId }),
          commandUrl: handler.id,
          execute:
            /** Executes through SfxRequest items. @param context - Shell context. @param request - Request. @returns Handler result. */ (
              context,
              request,
            ) => handler.execute(context, request.GetArgs()),
          getState:
            /** Queries shell-owned slot state. @param context - Shell context. @returns Slot state. */ (
              context,
            ) => ({
              enabled: handler.isEnabled?.(context) ?? true,
              ...(handler.isChecked === undefined ? {} : { checked: handler.isChecked(context) }),
              ...(handler.isMixed === undefined ? {} : { mixed: handler.isMixed(context) }),
              ...(handler.getStateValue === undefined
                ? {}
                : { value: handler.getStateValue(context) }),
            }),
          label: resource.label,
          shortcuts: resource.shortcuts,
          slotId: getWriterSlotId(handler.id),
        };
      },
    ),
  );
}

/** Reads the structured Any item installed by the request boundary. @param arguments_ - Request items. @returns Typed value. */
export function getWriterCommandArguments<Value>(arguments_: unknown): Value | undefined {
  if (!Array.isArray(arguments_)) return undefined;
  const item = arguments_.find(
    /** Finds the Any item. @param candidate - Request item. @returns Whether Any. */
    (candidate: unknown): candidate is SfxUnoAnyItem => candidate instanceof SfxUnoAnyItem,
  );
  return item?.GetValue() as Value | undefined;
}

/** Character-format arguments carried by a Writer SfxRequest Any item. */
export interface WriterCharacterCommandArguments {
  readonly fontFamily?: string;
  readonly fontSizePt?: number;
}

/** Hyperlink arguments carried by a Writer SfxRequest Any item. */
export interface WriterHyperlinkCommandArguments {
  readonly hyperlink?: WriterHyperlink;
  readonly text?: string;
}

/** Bounded view-shell target for generated Writer view slots. */
export interface WriterViewCommandTarget {
  readonly IsHorizontalRulerVisible: () => boolean;
  readonly IsVerticalRulerVisible: () => boolean;
  readonly IsSidebarVisible: () => boolean;
  readonly IsStatusBarVisible: () => boolean;
  readonly IsStoragePending: () => boolean;
  readonly NewDocument: () => void;
  readonly OpenPageDialog: () => Promise<boolean>;
  readonly RequestSelectAll: () => void;
  readonly ToggleHorizontalRuler: () => void;
  readonly ToggleVerticalRuler: () => void;
  readonly ToggleSidebar: () => void;
  readonly ToggleStatusBar: () => void;
}

/** Resolves URL parameters to their declaring slot and rejects ungenerated commands. @param commandUrl - Canonical command URL. @returns Numeric slot ID. */
export function getWriterSlotId(commandUrl: string): number {
  const baseUrl = commandUrl.startsWith(".uno:")
    ? (commandUrl.split("?", 1)[0] as string)
    : commandUrl;
  const slotId = generated.commands[baseUrl as keyof typeof generated.commands]?.slotId;
  if (slotId === undefined) throw new Error(`Unsupported Writer command URL: ${commandUrl}`);
  return slotId;
}

/** Exposes the generated supported upstream slots for parity tests. */
export const WRITER_UPSTREAM_SLOT_IDS = Object.freeze(
  Object.fromEntries(
    Object.entries(generated.commands)
      .filter(
        /** Keeps only upstream UNO slots. @param entry - Command resource pair. @returns Whether the URL is a UNO command. */ ([
          commandUrl,
        ]) => commandUrl.startsWith(".uno:"),
      )
      .map(
        /** Projects a command resource to its numeric slot. @param entry - Command resource pair. @returns URL and slot pair. */ ([
          commandUrl,
          resource,
        ]) => [commandUrl, resource.slotId],
      ),
  ),
);
