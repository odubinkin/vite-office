/** @fileoverview Browser ScTabControl presenter over actual document sheet names and view-owned active/selected sheets. */
import type { KeyboardEvent, MouseEvent } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus } from "lucide-react";
import { officeToolbarButtonClassName } from "../../../framework/browser/presentation/office-control-styles";
import type { ScViewData } from "../../source/ui/inc/viewdata";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
/** Sheet-tab controller bindings; the presenter never inserts or changes a sheet itself. */
export interface ScTabControlProps {
  readonly viewData: ScViewData;
  readonly canInsert: boolean;
  readonly onContextPopup: (
    tab: number | undefined,
    position: Readonly<{ x: number; y: number }>,
    owner: HTMLButtonElement,
  ) => void;
  readonly onSelect: (tab: number, event: MouseEvent<HTMLButtonElement>) => void;
  readonly onInsert: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly onScroll: (direction: "first" | "previous" | "next" | "last") => void;
}
/** Renders the native tab strip, navigation and insert-sheet control. @param props - Canonical sheet/view owner and action bindings. @returns Sheet tab bar. */
export function ScTabControl(props: ScTabControlProps): React.JSX.Element {
  const document = props.viewData.GetDocument(),
    name = new OUString();
  const tabs = Array.from(
    { length: document.GetTableCount() },
    /** Projects a source sheet name without storing a second sheet inventory. @param unused - Unused entry. @param tab - Native sheet index. @returns Native identity/name. */ (
      _,
      tab,
    ) => {
      document.GetName(tab, name);
      return { tab, name: text(name) };
    },
  );
  name.dispose();
  return (
    <div
      role="group"
      aria-label="Sheet controls"
      onContextMenu={
        /** Native page-id zero keeps selection when the pointer is over the strip rather than a tab. @param event - Background context request. @returns Nothing. */ (
          event,
        ) => {
          if (event.defaultPrevented) return;
          event.preventDefault();
          const owner = event.currentTarget.querySelector<HTMLButtonElement>(
            '[aria-current="page"]',
          ) as HTMLButtonElement;
          props.onContextPopup(undefined, { x: event.clientX, y: event.clientY }, owner);
        }
      }
      className="flex min-h-10 shrink-0 items-stretch gap-1 border-t border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
    >
      {(
        [
          ["first", "First sheet", ChevronsLeft],
          ["previous", "Previous sheet", ChevronLeft],
          ["next", "Next sheet", ChevronRight],
          ["last", "Last sheet", ChevronsRight],
        ] as const
      ).map(
        /** Renders the tab-strip scrolling commands. @param control - Direction,label,icon. @returns Control. */ ([
          direction,
          label,
          Icon,
        ]) => (
          <button
            key={direction}
            type="button"
            aria-label={label}
            onClick={
              /** Scrolls tab visibility through the tab-strip owner. @returns Nothing. */ () =>
                props.onScroll(direction)
            }
            className={officeToolbarButtonClassName}
          >
            <Icon aria-hidden="true" size={16} />
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Insert Sheet"
        disabled={!props.canInsert}
        onClick={props.onInsert}
        className={officeToolbarButtonClassName}
      >
        <Plus aria-hidden="true" size={16} />
      </button>
      <div
        role="tablist"
        onKeyDown={props.onKeyDown}
        aria-label="Sheets"
        aria-multiselectable="true"
        className="flex min-w-0 flex-1 overflow-x-auto"
      >
        {tabs.map(
          /** Renders one native sheet identity, preserving separate active and selected markers. @param entry - Actual sheet name/index. @returns Sheet tab. */ ({
            tab,
            name: label,
          }) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={props.viewData.GetMarkData().GetTableSelect(tab)}
              aria-current={props.viewData.GetTabNumber() === tab ? "page" : undefined}
              tabIndex={props.viewData.GetTabNumber() === tab ? 0 : -1}
              onContextMenu={
                /** Suppresses browser chrome and forwards the original sheet pointer target. @param event - Actual context event. @returns Nothing. */ (
                  event,
                ) => {
                  event.preventDefault();
                  props.onContextPopup(
                    tab,
                    { x: event.clientX, y: event.clientY },
                    event.currentTarget,
                  );
                }
              }
              onKeyDown={
                /** Forwards native keyboard popup requests from the actual focused tab. @param event - Keyboard event. @returns Nothing. */ (
                  event,
                ) => {
                  if (
                    event.nativeEvent.isComposing ||
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
                  )
                    return;
                  if (
                    (event.key === "ContextMenu" && !event.shiftKey) ||
                    (event.key === "F10" && event.shiftKey)
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    const rect = event.currentTarget.getBoundingClientRect();
                    props.onContextPopup(
                      tab,
                      { x: rect.left, y: rect.bottom },
                      event.currentTarget,
                    );
                  }
                }
              }
              onClick={
                /** Forwards sheet selection with source modifier intent intact. @param event - Platform click. @returns Nothing. */ (
                  event,
                ) => props.onSelect(tab, event)
              }
              className={`shrink-0 rounded-md border px-4 ${props.viewData.GetTabNumber() === tab ? "border-indigo-700 bg-indigo-50 font-semibold text-indigo-800" : props.viewData.GetMarkData().GetTableSelect(tab) ? "border-indigo-400 bg-indigo-50 text-indigo-800" : "border-slate-300 bg-white hover:border-indigo-400 hover:text-indigo-800"}`}
            >
              {label}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
