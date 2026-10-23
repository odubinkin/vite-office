/** @fileoverview Ports the supported paragraph StyleApply request boundary from pinned sw/source/uibase/app/docst.cxx. */

import { SfxInterface } from "../../../../sfx2/source/control/objface";
import { SfxRequest } from "../../../../sfx2/source/control/request";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { getWriterCommandArguments, getWriterSlotId } from "../../../sdi/swriter";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterCommandResource } from "../../../uiconfig/swriter/writer-command-resources";
import type { SwDoc } from "../../core/doc/doc";
import type { SwDocShell } from "./docsh";

import { SwUndoTextFormatCollCreate } from "../../core/undo/SwUndoFmt";

const SID_STYLE_NEW = getWriterSlotId(WRITER_COMMAND_IDS.styleNewByExample);
const SID_STYLE_UPDATE = getWriterSlotId(WRITER_COMMAND_IDS.styleUpdateByExample);
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

/** Resolves the common native style-family argument precedence. @param request - Caller-owned request. @returns Source family, zero for an invalid numeric payload. */
function readStyleFamily(request: SfxRequest): number {
  const family = readArgument(request, SID_STYLE_FAMILY, "Family");
  const familyName = readArgument(request, SID_STYLE_FAMILYNAME, "FamilyName");
  const numeric = typeof family === "string" && /^\d+$/.test(family) ? Number(family) : family;
  let resolved =
    family === undefined
      ? paragraphFamily
      : typeof numeric === "number" && Number.isInteger(numeric) && numeric >= 0 && numeric <= 65535
        ? numeric
        : 0;
  if (typeof familyName === "string" && Object.hasOwn(namedFamilies, familyName))
    resolved = namedFamilies[familyName] as number;
  return resolved;
}

/** Executes the implemented StyleApply case with native family precedence and unsigned completion. @param owner - Document-shell command owner. @param request - Caller-owned request. @returns Applied family, or no result for an absent template. */
export function execStyleSheet(
  owner: SwDocShell,
  request: SfxRequest,
): number | undefined | Promise<void> {
  if (request.GetSlot() === SID_STYLE_NEW || request.GetSlot() === SID_STYLE_UPDATE)
    return execByExample(owner, request);
  if (request.GetSlot() !== SID_STYLE_APPLY) return undefined;
  const template = readArgument(request, SID_STYLE_APPLY, "Template");
  const style = readArgument(request, SID_APPLY_STYLE, "Style");
  const familyName = readArgument(request, SID_STYLE_FAMILYNAME, "FamilyName");
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
  const resolved = readStyleFamily(request);
  const result = owner.ApplyStyles(name, resolved, request.GetModifier());
  request.SetReturnValue(new SfxUInt16Item(SID_STYLE_APPLY, result));
  request.Done();
  return result;
}

/** Builds the document-shell interface without discarding the native SfxRequest. @returns Bounded generated interface. */
export function createWriterDocStyleInterface(): SfxInterface<SwDocShell> {
  const resource = getWriterCommandResource(WRITER_COMMAND_IDS.styleApply);
  return new SfxInterface([
    ...[WRITER_COMMAND_IDS.styleNewByExample, WRITER_COMMAND_IDS.styleUpdateByExample].map(
      /** Registers native by-example commands at the document shell. @param commandUrl - Original command. @returns Slot definition. */
      (commandUrl) => ({
        commandUrl,
        slotId: getWriterSlotId(commandUrl),
        label: getWriterCommandResource(commandUrl).label,
        shortcuts: getWriterCommandResource(commandUrl).shortcuts,
        /** Executes the caller-owned request. @param owner - Document shell. @param request - Original request. @returns Completion. */
        execute: (owner: SwDocShell, request: SfxRequest) => owner.ExecStyleSheet(request),
        /** The represented text/table paragraph family is eligible whenever an edit shell exists. @param owner - Actual shell. @returns State. */
        getState: (owner: SwDocShell) => ({ enabled: owner.GetWrtShell() !== undefined }),
      }),
    ),
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

/** Resolves native paragraph by-example names, family precedence and optional asynchronous name dialog. @param owner - Document shell. @param request - Caller request. @returns Optional dialog completion. */
function execByExample(owner: SwDocShell, request: SfxRequest): undefined | Promise<void> {
  const shell = owner.GetWrtShell();
  if (shell === undefined) return;
  const slot = request.GetSlot();
  if (slot === SID_STYLE_NEW && request.GetArgs().length === 0) {
    request.Ignore();
    const document = owner.GetDoc();
    const names = document
      .GetTextFormatColls()
      .filter(
        /** The dialog lists user-defined styles only. @param collection - Actual owner. @returns User-defined. */
        (collection) => collection.poolId === 0 && collection !== document.GetDfltTextFormatColl(),
      )
      .map(
        /** Detaches native name. @param collection - Actual owner. @returns Name. */
        (collection) => collection.GetName(),
      );
    return shell
      .GetView()
      .GetDialogController()
      .RequestNewStyleDialog(WRITER_COMMAND_IDS.styleNewByExample, names, [
        ...document
          .GetTextFormatColls()
          .filter(
            /** Protects owned builtins by current name. @param collection - Native style. @returns Builtin. */
            (collection) => !names.includes(collection.GetName()),
          )
          .map(
            /** Detaches the builtin name. @param collection - Native style. @returns Name. */
            (collection) => collection.GetName(),
          ),
        ...WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL.filter(
          /** Includes native unused builtin names without materialization. @param entry - Factory metadata. @returns Absent. */
          (entry) => document.FindTextFormatColl(entry.id) === undefined,
        ).map(
          /** Uses unused pool names; the default is already represented among owned styles. @param entry - Factory metadata. @returns Name. */
          (entry) => entry.name,
        ),
      ])
      .then(
        /** Continues only the owning document request after acceptance. @param result - Accepted raw name. @returns Nothing. */
        (result) => {
          if (
            result === undefined ||
            owner.GetDoc() !== document ||
            owner.GetWrtShell() === undefined
          )
            return;
          // The native asynchronous path completes a request copy, leaving the original ignored.
          const copy = new SfxRequest(slot, request.GetArgs(), request.GetCallMode());
          copy.SetModifier(request.GetModifier());
          copy.AppendItem(new SfxStringItem(slot, result.name));
          execByExample(owner, copy);
        },
      );
  }
  const param = readArgument(request, slot, "Param");
  let name = typeof param === "string" ? param : "";
  const resolved = readStyleFamily(request);
  if (slot === SID_STYLE_UPDATE && name.length === 0 && resolved === paragraphFamily) {
    name = shell.GetCurTextFormatColl()?.GetName() ?? "";
    request.AppendItem(new SfxStringItem(slot, name));
  }
  if (name.length === 0) return;
  if (slot === SID_STYLE_UPDATE) owner.UpdateStyle(name, resolved);
  else owner.MakeByExample(name, resolved);
  request.Done();
}

/** Native document-shell paragraph UpdateStyle operation and grouped history. @param owner - Actual document shell. @param name - Exact pool name. @param family - Source family. @returns Nothing. */
export function updateStyle(owner: SwDocShell, name: string, family: number): void {
  const shell = owner.GetWrtShell();
  if (family !== paragraphFamily || shell === undefined) return;
  const document = owner.GetDoc(),
    id = findParagraphStyle(document, name);
  if (id === undefined) return;
  const collection = document.GetTextFormatColl(id),
    undo = document.GetUndoManager();
  shell.RunNotificationTransaction(
    /** Brackets native all-action notifications and final history state. @returns Nothing. */
    () =>
      document.RunModelTransaction(
        /** Mutates the actual format and resets direct items in original order. @returns Nothing. */
        () => {
          undo.StartUndo("Update Paragraph Style");
          try {
            shell.FillByEx(collection);
            shell.SetParagraphStyle(collection.id);
          } finally {
            undo.EndUndo();
          }
        },
      ),
  );
}

/** Native default-mask paragraph MakeByExample and distinct attribute/create/apply histories. @param owner - Document shell. @param name - Exact native name. @param family - Source family. @returns Nothing. */
export function makeByExample(owner: SwDocShell, name: string, family: number): void {
  const shell = owner.GetWrtShell();
  if (family !== paragraphFamily || shell === undefined) return;
  const document = owner.GetDoc();
  shell.RunNotificationTransaction(
    /** Releases notifications after native all-action work finishes. @returns Nothing. */
    () =>
      document.RunModelTransaction(
        /** Creates the original format, fills it and applies through existing collection history. @returns Nothing. */
        () => {
          const id = findParagraphStyle(document, name);
          const collection =
            id === undefined
              ? document.MakeTextFormatColl(name, document.GetDfltTextFormatColl())
              : document.GetTextFormatColl(id);
          shell.FillByEx(collection);
          const parent = shell.GetCurTextFormatColl();
          collection.SetDerivedFrom(parent);
          document
            .GetUndoManager()
            .AddUndoAction(new SwUndoTextFormatCollCreate(collection, parent, document));
          shell.SetParagraphStyle(collection.id);
        },
      ),
  );
}
