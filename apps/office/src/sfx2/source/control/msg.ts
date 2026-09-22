/**
 * @fileoverview Ports the bounded SfxSlot metadata contract from pinned
 * LibreOffice `include/sfx2/msg.hxx`.
 */

import type { SfxRequest } from "./request";
import type { SfxSlotState } from "./bindings";

/** Presentation metadata attached by generated resources, never by the dispatcher. */
export interface CommandPresentation {
  readonly argumentSchema?: Readonly<{ readonly description: string }>;
  readonly labelKey: string;
  readonly placements: readonly string[];
  readonly selectionValue?: string;
  readonly semantics: "action" | "check" | "radio";
  readonly stateType: "boolean" | "none" | "value";
}

/** Handler declarations used to construct one immutable slot. */
export interface SfxSlotDefinition<Context, Result = unknown> {
  readonly capabilityId?: `CAP-${string}`;
  readonly commandUrl: string;
  readonly debugLabel?: string;
  readonly execute: (context: Context, request: SfxRequest) => Result;
  readonly getState?: (context: Context) => SfxSlotState;
  readonly label: string;
  readonly presentation?: CommandPresentation;
  readonly shortcuts?: readonly string[];
  readonly slotId: number;
}

/** Immutable slot metadata and Execute/GetState callbacks generated for one shell interface. */
export class SfxSlot<Context = unknown, Result = unknown> {
  public readonly capabilityId: `CAP-${string}` | undefined;
  public readonly commandUrl: string;
  public readonly debugLabel: string | undefined;
  public readonly label: string;
  public readonly presentation: CommandPresentation | undefined;
  public readonly shortcuts: readonly string[];
  public readonly slotId: number;

  /** Creates immutable slot metadata from one generated definition. @param definition - Generated definition. @returns Nothing. */
  public constructor(private readonly definition: SfxSlotDefinition<Context, Result>) {
    this.capabilityId = definition.capabilityId;
    this.commandUrl = definition.commandUrl;
    this.debugLabel = definition.debugLabel;
    this.label = definition.label;
    this.presentation = definition.presentation;
    this.shortcuts = Object.freeze([...(definition.shortcuts ?? [])]);
    this.slotId = definition.slotId;
  }

  /** Compatibility spelling used by browser presentation adapters. @returns Command URL. */
  public get id(): string {
    return this.commandUrl;
  }

  /** Primary generated accelerator, when present. @returns Primary accelerator. */
  public get shortcut(): string | undefined {
    return this.shortcuts[0];
  }

  /** Executes this slot against its owning shell context. @param context - Shell context. @param request - Slot request. @returns Handler result. */
  public Execute(context: Context, request: SfxRequest): Result {
    return this.definition.execute(context, request);
  }

  /** Queries this slot through its owning shell state callback. @param context - Shell context. @returns Slot state. */
  public GetState(context: Context): SfxSlotState {
    return this.definition.getState?.(context) ?? { enabled: true };
  }
}
