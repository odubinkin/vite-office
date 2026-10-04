/** @fileoverview Ports the supported paragraph StyleApply request boundary from pinned sw/source/uibase/app/docst.cxx. */

import { SfxInterface } from "../../../../sfx2/source/control/objface";
import type { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { getWriterCommandArguments, getWriterSlotId } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterCommandResource } from "../../../uiconfig/swriter/writer-command-resources";
import type { SwDoc } from "../../core/doc/doc";
import type { SwDocShell } from "./docsh";

const SID_STYLE_APPLY = getWriterSlotId(WRITER_COMMAND_IDS.styleApply);
const SID_STYLE_FAMILY = 5553;
const SID_STYLE_FAMILYNAME = 5566;
const SID_APPLY_STYLE = 6703;
const paragraphFamily = 2;
const namedFamilies: Readonly<Record<string, number>> = {
  CharacterStyles: 1,
  ParagraphStyles: 2,
  FrameStyles: 4,
  PageStyles: 8,
  NumberingStyles: 16,
  TableStyles: 32,
};

/** Resolves actual paragraph display names before unused supported built-in pool names. @param doc - Current model. @param name - Exact requested display name. @returns Owned or available style identity. */
export function findParagraphStyle(doc: SwDoc, name: string): string | undefined {
  const owned = doc.FindTextFormatCollByName(name);
  if (owned !== undefined) return owned.id;
  const pool = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
    /** Matches the bounded native pool name or the existing default display alias. @param entry - Pool entry. @returns Match. */
    (entry) =>
      entry.name === name || (entry.name === "Standard" && name === "Default Paragraph Style"),
  );
  if (pool === undefined || doc.FindTextFormatColl(pool.id) !== undefined) return undefined;
  return pool.id;
}

/** Reads a typed request item or the ordinary UNO presentation payload. @param request - Caller-owned request. @param which - Native argument identity. @param key - UNO argument name. @returns Argument value. */
function readArgument(request: SfxRequest, which: number, key: string): unknown {
  const item = request.GetArgs().find(
    /** Matches an exact native argument identity. @param candidate - Argument item. @returns Match. */
    (candidate) => candidate.Which() === which,
  );
  if (item instanceof SfxStringItem || item instanceof SfxUInt16Item) return item.GetValue();
  const payload = getWriterCommandArguments<unknown>(request.GetArgs());
  return typeof payload === "object" && payload !== null
    ? (payload as Readonly<Record<string, unknown>>)[key]
    : undefined;
}

/** Executes the implemented StyleApply case with native family precedence and unsigned completion. @param owner - Document-shell command owner. @param request - Caller-owned request. @returns Applied family, or no result for an absent template. */
export function execStyleSheet(owner: SwDocShell, request: SfxRequest): number | undefined {
  if (request.GetSlot() !== SID_STYLE_APPLY) return undefined;
  const template = readArgument(request, SID_STYLE_APPLY, "Template");
  const style = readArgument(request, SID_APPLY_STYLE, "Style");
  const familyName = readArgument(request, SID_STYLE_FAMILYNAME, "FamilyName");
  const family = readArgument(request, SID_STYLE_FAMILY, "Family");
  let name = typeof template === "string" ? template : "";
  if (typeof style === "string" && familyName === "ParagraphStyles") {
    const doc = owner.GetDoc();
    const pool = WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.find(
      /** Finds an available programmatic pool name. @param entry - Pool entry. @returns Match. */
      (entry) => entry.name === style,
    );
    const owned =
      doc.FindTextFormatColl(style) ??
      doc.FindTextFormatCollByName(style) ??
      (pool === undefined ? undefined : doc.FindTextFormatColl(pool.id));
    const display = owned?.GetName();
    if (display !== undefined && display.length > 0) name = display;
    else if (findParagraphStyle(doc, style) !== undefined) name = style;
  }
  if (name.length === 0) return undefined;
  const numeric = typeof family === "string" && /^\d+$/.test(family) ? Number(family) : family;
  let resolved =
    family === undefined
      ? paragraphFamily
      : typeof numeric === "number" && Number.isInteger(numeric) && numeric >= 0 && numeric <= 65535
        ? numeric
        : 0;
  if (typeof familyName === "string" && Object.hasOwn(namedFamilies, familyName))
    resolved = namedFamilies[familyName] as number;
  const result = owner.ApplyStyles(name, resolved);
  request.Done(new SfxUInt16Item(SID_STYLE_APPLY, result));
  return result;
}

/** Builds the document-shell interface without discarding the native SfxRequest. @returns Bounded generated interface. */
export function createWriterDocStyleInterface(): SfxInterface<SwDocShell> {
  const resource = getWriterCommandResource(WRITER_COMMAND_IDS.styleApply);
  return new SfxInterface([
    {
      capabilityId: "CAP-0112",
      commandUrl: WRITER_COMMAND_IDS.styleApply,
      /** Executes at the native document owner. @param owner - Owning shell. @param request - Request. @returns Applied family. */
      execute: (owner, request) => owner.ExecStyleSheet(request),
      /** Preserves the existing active-style ID binding and view eligibility. @param owner - Owning shell. @returns Existing binding state. */
      getState: (owner) => ({
        enabled: owner.GetWrtShell() !== undefined,
        value: owner.GetWrtShell()?.GetActiveParagraph().GetParagraphStyle(),
      }),
      label: resource.label,
      shortcuts: resource.shortcuts,
      slotId: SID_STYLE_APPLY,
    },
  ]);
}
