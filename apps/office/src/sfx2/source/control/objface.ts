/**
 * @fileoverview Ports the bounded SfxInterface slot-map contract from pinned
 * LibreOffice `sfx2/source/control/objface.cxx`.
 */

import { SfxSlot, type SfxSlotDefinition } from "./msg";

/** Immutable generated slot map for one concrete SfxShell class. */
export class SfxInterface<Context> {
  private readonly byCommand = new Map<string, SfxSlot<Context>>();
  private readonly byId = new Map<number, SfxSlot<Context>>();
  private readonly slots: readonly SfxSlot<Context>[];

  /** Validates and installs one generated slot map. @param definitions - Generated slots. @returns Nothing. */
  public constructor(definitions: readonly SfxSlotDefinition<Context>[]) {
    this.slots = Object.freeze(
      definitions.map(
        /** Validates and indexes one slot. @param definition - Generated slot. @returns Immutable slot. */ (
          definition,
        ) => {
          validateSlotDefinition(definition);
          if (this.byCommand.has(definition.commandUrl))
            throw new Error(`Duplicate command id: ${definition.commandUrl}`);
          if (this.byId.has(definition.slotId))
            throw new Error(`Duplicate command slot id: ${definition.slotId}`);
          const slot = new SfxSlot(definition);
          this.byCommand.set(slot.commandUrl, slot);
          this.byId.set(slot.slotId, slot);
          return slot;
        },
      ),
    );
    const shortcuts = new Set<string>();
    for (const slot of this.slots)
      for (const shortcut of slot.shortcuts) {
        if (shortcuts.has(shortcut)) throw new Error(`Duplicate command shortcut: ${shortcut}`);
        shortcuts.add(shortcut);
      }
  }

  /** Returns the complete interface slot map in generated declaration order. @returns Slots. */
  public GetSlots(): readonly SfxSlot<Context>[] {
    return this.slots;
  }

  /** Resolves a slot by numeric identity or canonical command URL. @param identity - Slot or URL. @returns Slot. */
  public GetSlot(identity: number | string): SfxSlot<Context> | undefined {
    return typeof identity === "number" ? this.byId.get(identity) : this.byCommand.get(identity);
  }
}

/** Validates one generated slot definition before interface registration. @param definition - Generated definition. @returns Nothing. */
function validateSlotDefinition<Context>(definition: SfxSlotDefinition<Context>): void {
  assertNonBlank(definition.commandUrl, "Command id");
  assertNonBlank(definition.label, "Command label");
  if (!Number.isInteger(definition.slotId) || definition.slotId <= 0)
    throw new Error(`Command slot id is invalid: ${definition.commandUrl}`);
  if (definition.presentation !== undefined) {
    assertNonBlank(definition.presentation.labelKey, "Command label key");
    if (
      definition.presentation.semantics === "check" &&
      definition.presentation.stateType !== "boolean"
    )
      throw new Error("Check commands require boolean state.");
    if (
      definition.presentation.semantics === "radio" &&
      definition.presentation.stateType === "none"
    )
      throw new Error("Radio commands require boolean or value state.");
    for (const placement of definition.presentation.placements)
      assertNonBlank(placement, "Command placement");
    if (definition.presentation.argumentSchema !== undefined)
      assertNonBlank(
        definition.presentation.argumentSchema.description,
        "Command argument schema description",
      );
  }
  for (const shortcut of definition.shortcuts ?? []) assertNonBlank(shortcut, "Command shortcut");
}

/** Rejects blank generated resource fields. @param value - Candidate. @param label - Field label. @returns Nothing. */
function assertNonBlank(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`${label} must not be blank.`);
}
