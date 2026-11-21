/** @fileoverview Owns the supported Writer view-shell execute/state handlers. */

import type { SfxInterface } from "../../../../sfx2/source/control/objface";
import { createSfxShell, type SfxShell } from "../../../../sfx2/source/control/shell";
import { WRITER_COMMAND_IDS } from "../../../uiconfig/swriter/menubar/menubar-commands";
import {
  createWriterInterface,
  getWriterCommandArguments,
  getWriterSlotId,
  type WriterSlotHandler,
  type WriterViewCommandTarget,
} from "../../../sdi/swriter";
import { SfxUInt16Item } from "../../../../svl/source/items/intitem";
import { SvxSearchItem } from "../../../../svl/source/items/srchitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SID_SEARCH_QUIET } from "../../../../sfx2/inc/sfxsids";
import {
  ProjectWriterSearchItem,
  TransformWriterSearchParameters,
} from "../uiview/search-dispatch";
import type { WriterExecuteSearchArguments, WriterSearchSlotItem } from "../uiview/viewsrch";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SID_ATTR_PARA_ULSPACE } from "../../../../editeng/inc/editids";

/** Dedicated view command shell owning Writer view and chrome registration. */
export class SwViewCommandShell {
  private readonly shell: SfxShell;
  /** Creates the view-shell slot owner. @param target - Active Writer view. @returns Nothing. */
  public constructor(target: WriterViewCommandTarget) {
    this.shell = createSfxShell(target, createWriterViewCommandRegistry(target));
  }
  /** Returns the dispatcher-facing shell. @returns Registered Sfx shell. */
  public GetShell(): SfxShell {
    return this.shell;
  }
}

/** Creates SwView-owned document, selection, and view-option commands. @param target - Persistent Writer view. @returns Validated immutable descriptors. */
export function createWriterViewCommandRegistry(
  target: WriterViewCommandTarget,
): SfxInterface<WriterViewCommandTarget> {
  const lifecycleEnabled =
    /** Reads lifecycle command availability. @returns True outside a pending medium operation. */ (): boolean =>
      !target.IsStoragePending();
  return createWriterInterface([
    {
      id: WRITER_COMMAND_IDS.searchOn,
      capabilityId: "CAP-0111",
      /** Requests selection initialization for the modeless dialog. @param context - Active view. @returns Nothing. */
      execute: (context): void => context.GetSearch().SearchOn(),
    },
    {
      id: WRITER_COMMAND_IDS.searchOptions,
      capabilityId: "CAP-0111",
      /** Supplies the native unsigned search option mask. @param context - Active view. @returns SID_SEARCH_OPTIONS state. */
      getStateValue: (context) =>
        new SfxUInt16Item(
          getWriterSlotId(WRITER_COMMAND_IDS.searchOptions),
          context.GetSearch().GetSearchOptions(),
        ),
    },
    {
      id: WRITER_COMMAND_IDS.searchProperties,
      capabilityId: "CAP-0111",
      /** Saves the dialog's properties. @param context - Active view. @param args - SID_SEARCH_ITEM request. @returns Nothing. */
      execute(context, args): void {
        const item = getWriterCommandArguments<WriterSearchSlotItem>(args);
        if (item !== undefined) context.GetSearch().SetSearchProperties(item);
      },
      /** Supplies the search state for the dialog. @param context - Active view. @returns Current properties. */
      getStateValue: (context) => context.GetSearch().StateSearch(),
    },
    {
      id: WRITER_COMMAND_IDS.searchOff,
      capabilityId: "CAP-0111",
      /** Saves the dialog's final search item. @param context - Active view. @param args - Request items. @returns Nothing. */
      execute(context, args): void {
        const request =
          getWriterCommandArguments<Pick<WriterExecuteSearchArguments, "SearchItem">>(args);
        if (request?.SearchItem !== undefined)
          context.GetSearch().SetSearchProperties(request.SearchItem, true);
      },
    },
    {
      id: WRITER_COMMAND_IDS.executeSearch,
      capabilityId: "CAP-0111",
      /** Dispatches the native SearchItem request. @param context - Active view. @param args - Request items. @returns Whether the search matched. */
      execute(context, args): boolean {
        const search = context.GetSearch();
        const defaults = search.GetSearchItem();
        const pooled = args.find(
          /** Resolves the native SID_SEARCH_ITEM argument. @param argument - Candidate. @returns Whether it is the native search item. */
          (argument): argument is SvxSearchItem =>
            argument instanceof SvxSearchItem &&
            argument.Which() === getWriterSlotId(WRITER_COMMAND_IDS.searchProperties),
        );
        const quiet = args.find(
          /** Resolves the optional native Quiet argument. @param argument - Candidate. @returns Whether it is the Quiet item. */
          (argument): argument is SfxBoolItem =>
            argument instanceof SfxBoolItem && argument.Which() === SID_SEARCH_QUIET,
        );
        const request = pooled
          ? {
              SearchItem: ProjectWriterSearchItem(pooled, defaults),
              Quiet: quiet?.GetValue(),
              UseAttrItemList: true,
            }
          : TransformWriterSearchParameters(
              getWriterCommandArguments(args),
              defaults,
              search.configuration,
            );
        if (request?.SearchItem === undefined) return false;
        const { SearchItem: item, Quiet, UseAttrItemList } = request;
        const active =
          UseAttrItemList === false
            ? { ...item, searchAttributes: undefined, replaceAttributes: undefined }
            : item;
        return (
          (Quiet
            ? search.ExecSearch(active, active.command, active.backward, true)
            : search.ExecSearch(active, active.command, active.backward)
          ).matches > 0
        );
      },
    },
    {
      capabilityId: "CAP-0111",
      id: WRITER_COMMAND_IDS.repeatSearch,
      execute:
        /** Repeats the dispatched Writer search item. @returns Whether a match was found. */ () =>
          target.RepeatSearch(),
    },
    {
      capabilityId: "CAP-0125",
      id: WRITER_COMMAND_IDS.paragraphSpacing,
      /** Executes SwView's actual native paragraph spacing branch. @param context - Active view. @param args - Typed request items. @returns Whether changed. */
      execute: (context, args): boolean => {
        const item = args.find(
          /** Resolves the native spacing argument. @param item - Actual request item. @returns Whether this slot. */
          (item) => item.Which() === SID_ATTR_PARA_ULSPACE,
        );
        return item instanceof SvxULSpaceItem && context.ApplyParagraphULSpace(item);
      },
      /** Returns uniform native spacing state. @returns Slot item or mixed state. */
      getStateValue: () => target.GetParagraphULSpace(),
      /** Reports aggregate invalidation. @returns Whether selected values differ. */
      isMixed: () => target.GetParagraphULSpace() === undefined,
    },
    {
      capabilityId: "CAP-0114",
      /** Creates a new document in the persistent shell. @returns Nothing. */
      execute: (): void => target.NewDocument(),
      id: WRITER_COMMAND_IDS.newDocument,
      isEnabled: lifecycleEnabled,
    },
    {
      capabilityId: "CAP-0103",
      /** Requests browser Select All projection. @returns Nothing. */
      execute: (): void => target.RequestSelectAll(),
      id: WRITER_COMMAND_IDS.selectAll,
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles status-bar visibility. @returns Nothing. */
      execute: (): void => target.ToggleStatusBar(),
      id: WRITER_COMMAND_IDS.toggleStatusBar,
      /** Reads status-bar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsStatusBarVisible(),
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles horizontal-ruler visibility. @returns Nothing. */
      execute: (): void => target.ToggleHorizontalRuler(),
      id: WRITER_COMMAND_IDS.toggleHorizontalRuler,
      /** Reads horizontal-ruler visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsHorizontalRulerVisible(),
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles vertical-ruler visibility. @returns Nothing. */
      execute: (): void => target.ToggleVerticalRuler(),
      id: WRITER_COMMAND_IDS.toggleVerticalRuler,
      /** Reads vertical-ruler visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsVerticalRulerVisible(),
    },
    {
      capabilityId: "CAP-0136",
      /** Opens the Page Style dialog. @returns Whether accepted geometry changed the document. */
      execute: (): Promise<boolean> => target.OpenPageDialog(),
      id: WRITER_COMMAND_IDS.pageDialog,
    },
    {
      capabilityId: "CAP-0104",
      /** Toggles sidebar visibility. @returns Nothing. */
      execute: (): void => target.ToggleSidebar(),
      id: WRITER_COMMAND_IDS.toggleSidebar,
      /** Reads sidebar visibility. @returns Checked state. */
      isChecked: (): boolean => target.IsSidebarVisible(),
    },
    ...([false, true] as const).map<WriterSlotHandler<WriterViewCommandTarget>>(
      /** Binds the two native comment visibility options. @param resolved - Whether this slot filters resolved comments. @returns Slot handler. */
      (resolved) => {
        const id = resolved
          ? WRITER_COMMAND_IDS.showResolvedAnnotations
          : WRITER_COMMAND_IDS.showAnnotations;
        return {
          id,
          capabilityId: "CAP-0104",
          /** Executes the original toggle or explicit slot request. @param _context - Active view. @param args - Request items. @returns Nothing. */
          execute: (_context, args) => {
            const requested = args.find(
              /** Finds the native bool for the requested slot. @param item - Request item. @returns Whether it belongs to this slot. */
              (item): item is SfxBoolItem =>
                item instanceof SfxBoolItem && item.Which() === getWriterSlotId(id),
            );
            const value = requested?.GetValue();
            if (resolved) target.SetResolvedPostIts(!(value ?? target.IsResolvedPostIts()));
            else target.SetPostIts(value ?? !target.IsPostIts());
          },
          /** Both commands are available when the document has comments. @returns Whether enabled. */
          isEnabled: () => target.HasNotes(),
          /** Reports the source view option value. @returns Whether checked. */
          isChecked: () => (resolved ? target.IsResolvedPostIts() : target.IsPostIts()),
        };
      },
    ),
  ]);
}
