/** @fileoverview Connects the Writer Navigator movement controls to the native view slots. */
import { ArrowDown, ArrowUp } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { SfxUInt32Item } from "../../../svl/source/items/intitem";
import { getWriterSlotId } from "../../sdi/swriter";
import {
  IsNavigationElement,
  navigationElements,
  SwNavigationElement,
} from "../../source/uibase/ribbar/workctrl";
import type { SwView } from "../../source/uibase/uiview/view";
import type { SwVisiblePageNumbers } from "../../source/uibase/uiview/viewmdi";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { queueWriterCursorReveal } from "./writer-cursor-reveal";

/** Reads the displayed page interval through the browser's actual scroll clipping. @param host - Mounted Writer editing host. @returns Visible physical page range. */
function getVisiblePages(host: HTMLElement): SwVisiblePageNumbers | undefined {
  const window = host.ownerDocument.defaultView;
  if (!window) return undefined;
  let top = 0;
  let bottom = window.innerHeight;
  for (let parent = host.parentElement; parent; parent = parent.parentElement) {
    if (!/^(auto|scroll|hidden|clip)$/u.test(window.getComputedStyle(parent).overflowY)) continue;
    const bounds = parent.getBoundingClientRect();
    top = Math.max(top, bounds.top + parent.clientTop);
    bottom = Math.min(bottom, bounds.top + parent.clientTop + parent.clientHeight);
  }
  let first: number | undefined;
  let last: number | undefined;
  for (const page of host.querySelectorAll<HTMLElement>("[data-writer-page]")) {
    const bounds = page.getBoundingClientRect();
    if (bounds.bottom <= top || bounds.top >= bottom || bounds.height <= 0) continue;
    const number = Number(page.dataset.writerPage);
    first ??= number;
    last = number;
  }
  return first === undefined || last === undefined ? undefined : { first, last };
}

/** Native navigation controls and their browser view binding. */
interface WriterNavigatorNavigationProps {
  readonly view: SwView;
  readonly editingHost: RefObject<HTMLElement | null>;
  readonly visible: boolean;
  readonly label: (key: string, fallback: string) => string;
  readonly selectType: (type: SwNavigationElement) => void;
}

/** Renders the native page and element navigation groups. @param props - Active view and browser fields. @returns Navigator movement controls. */
export function WriterNavigatorNavigation({
  view,
  editingHost,
  visible,
  label,
  selectType,
}: WriterNavigatorNavigationProps): React.JSX.Element {
  const tree = view.GetNavigator();
  const type = view.GetMoveType();
  const choice = navigationElements.find(
    /** Selects the current native tooltip pair. @param item - Chooser item. @returns Whether this is the chosen element. */
    ([id]) => id === type,
  );
  const [visiblePage, setVisiblePage] = useState<number>();
  const [pageDraft, setPageDraft] = useState<string>();
  useEffect(
    /** Registers physical view movement and tracks the first visible page during scrolling. @returns Listener cleanup. */
    () => {
      const host = editingHost.current;
      if (!host) return;
      const window = host.ownerDocument.defaultView;
      /** Reads the physical page range from the active editing host. @returns Visible pages. */
      function getPages() {
        return getVisiblePages(host);
      }
      /** Refreshes the page control after the document viewport changes. @returns Nothing. */
      function sync(): void {
        if (visible) setVisiblePage(getPages()?.first);
      }
      const initial = window?.requestAnimationFrame(sync);
      window?.addEventListener("scroll", sync, true);
      window?.addEventListener("resize", sync);
      view.SetNavigationViewport({
        GetVisiblePageNumbers: getPages,
        GoToPage:
          /** Scrolls without moving the editing cursor. @param number - Target physical page. @returns Nothing. */
          (number) => {
            queueWriterCursorReveal(editingHost, number);
          },
      });
      /** Releases the viewport and its listeners. @returns Nothing. */
      function releaseViewport(): void {
        if (initial !== undefined) window?.cancelAnimationFrame(initial);
        window?.removeEventListener("scroll", sync, true);
        window?.removeEventListener("resize", sync);
        view.SetNavigationViewport();
      }
      return releaseViewport;
    },
    [editingHost, view, visible],
  );
  const page = tree.GetPageState();
  /** Executes the native movement slot and reveals the result. @param forward - True for next. @returns Nothing. */
  function move(forward: boolean): void {
    if (type === SwNavigationElement.Page) editingHost.current?.focus({ preventScroll: true });
    const result = view.Execute(
      forward ? WRITER_COMMAND_IDS.scrollToNext : WRITER_COMMAND_IDS.scrollToPrevious,
    );
    if (type === SwNavigationElement.Comment || type === SwNavigationElement.Page) return;
    editingHost.current?.focus({ preventScroll: true });
    if (result.status === "executed" && result.value === true) queueWriterCursorReveal(editingHost);
  }
  const previous = label(`navigate-${type}-previous`, choice?.[2] ?? "Previous");
  const next = label(`navigate-${type}-next`, choice?.[3] ?? "Next");
  return (
    <>
      <select
        aria-label={label("navigate-by", "Navigate By")}
        value={type}
        className="rounded border border-slate-300 px-1 text-sm"
        onChange={
          /** Dispatches the native chooser item. @param event - Browser input. @returns Nothing. */
          (event) => {
            const id = Number(event.currentTarget.value);
            if (!IsNavigationElement(id)) return;
            const url = WRITER_COMMAND_IDS.navElement;
            view.Execute(url, [new SfxUInt32Item(getWriterSlotId(url), id)]);
            selectType(id);
          }
        }
      >
        {navigationElements.map(
          /** Renders an existing native navigation element. @param option - Chooser entry. @returns Select option. */
          ([id, title]) => (
            <option key={id} value={id}>
              {label(`navigate-${id}`, title)}
            </option>
          ),
        )}
      </select>
      <button
        type="button"
        aria-label={previous}
        title={previous}
        className="rounded p-1 hover:bg-slate-100"
        onClick={/** Runs the previous navigation slot. @returns Nothing. */ () => move(false)}
      >
        <ArrowUp size={16} />
      </button>
      {type === SwNavigationElement.Page && (
        <input
          type="number"
          min={1}
          max={page.count}
          value={pageDraft ?? visiblePage ?? page.current}
          aria-label={label("go-to-page", "Go to page")}
          className="w-14 rounded border border-slate-300 px-1 text-sm"
          onChange={
            /** Retains an unsubmitted physical page number. @param event - Browser input. @returns Nothing. */
            (event) => setPageDraft(event.currentTarget.value)
          }
          onKeyDown={
            /** Sends an explicit page jump to the model cursor. @param event - Browser key. @returns Nothing. */
            (event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              const requested = event.currentTarget.valueAsNumber;
              if (!Number.isFinite(requested)) return;
              const number = Math.max(1, Math.min(page.count, Math.trunc(requested)));
              if (tree.GotoPage(number)) {
                setPageDraft(undefined);
                editingHost.current?.focus({ preventScroll: true });
                queueWriterCursorReveal(editingHost, number);
              }
            }
          }
        />
      )}
      <button
        type="button"
        aria-label={next}
        title={next}
        className="rounded p-1 hover:bg-slate-100"
        onClick={/** Runs the next navigation slot. @returns Nothing. */ () => move(true)}
      >
        <ArrowDown size={16} />
      </button>
    </>
  );
}
