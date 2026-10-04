/** @fileoverview Projects native sidebar panel expansion and title-entry behavior. */
import {
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SidebarFocusContext } from "./SidebarFocusManager";

/** Supplies one existing sidebar panel without coupling to command or localization layers. */
export interface SidebarPanelProps {
  readonly children: ReactNode;
  readonly title: string;
  readonly focusContent: () => void;
  readonly focusDocument?: (() => void) | undefined;
  readonly initiallyExpanded?: boolean;
  readonly moreOptions?: ReactNode;
}

/** Renders a panel title and persistent content with optional source-owned toolbar controls.
 * @param props - Panel content and source-owned command projection.
 * @param props.children - Content retained when the panel is collapsed.
 * @param props.title - Localized native panel title.
 * @param props.focusContent - Focuses the first eligible child control.
 * @param props.focusDocument - Returns header focus to this panel's owning document.
 * @param props.initiallyExpanded - Native context's initial expansion state.
 * @param props.moreOptions - Existing bindings-backed title toolbar control.
 * @returns Panel title, expander, toolbar and retained content.
 */
export function SidebarPanel({
  children,
  title,
  focusContent,
  focusDocument,
  initiallyExpanded = true,
  moreOptions,
}: SidebarPanelProps): React.JSX.Element {
  const [expanded, setExpanded] = useState(initiallyExpanded);
  const contentId = useId();
  const titleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const focusManager = useContext(SidebarFocusContext);
  const Icon = expanded ? ChevronDown : ChevronRight;

  useLayoutEffect(
    /** Registers this title for the enclosing deck's mounted lifetime. @returns Listener cleanup. */ () => {
      if (focusManager === undefined) return;
      return focusManager.RegisterPanel({
        element: panelRef.current as HTMLElement,
        focusTitle: focusPanelTitle,
      });
    },
    [focusManager],
  );

  /** Expands retained content before title focus. @returns Nothing. */
  function focusPanelTitle(): void {
    flushSync(
      /** Restores the expanded native focus state. @returns Nothing. */ () => setExpanded(true),
    );
    (titleRef.current as HTMLButtonElement).focus();
  }

  /** Enters the first eligible content control. @returns Nothing. */
  function focusPanelContent(): void {
    flushSync(
      /** Shows content before browser child focus. @returns Nothing. */ () => setExpanded(true),
    );
    focusContent();
  }

  /** Returns unconsumed header cancellation to the owning client without closing the panel.
   * @param event - Panel title or toolbar key input.
   * @returns Nothing.
   */
  function returnToDocument(event: KeyboardEvent<HTMLElement>): void {
    if (event.defaultPrevented) return;
    if (event.key === "Escape") {
      if (focusDocument === undefined) return;
      event.preventDefault();
      focusDocument();
      return;
    }
    if (focusManager === undefined) return;
    if (event.key === "Tab" && !event.shiftKey) {
      event.preventDefault();
      if (event.target === titleRef.current && toolbarRef.current?.querySelector("button")) {
        toolbarRef.current.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus();
      } else focusPanelContent();
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      focusManager.MovePanel(panelRef.current as HTMLElement, -1);
    } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      focusManager.MovePanel(panelRef.current as HTMLElement, 1);
    }
  }

  /** Moves unconsumed content cancellation to the visible panel title.
   * @param event - Descendant content key input.
   * @returns Nothing.
   */
  function returnToPanelTitle(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.defaultPrevented || event.key !== "Escape") return;
    event.preventDefault();
    if (focusManager === undefined) focusPanelTitle();
    else focusManager.FocusPanel(focusManager.GetPanelIndex(panelRef.current as HTMLElement), true);
  }
  return (
    <section aria-label={title} ref={panelRef}>
      <header
        className="flex min-h-9 items-center justify-between gap-1 border-b border-slate-200"
        onKeyDown={returnToDocument}
      >
        <h2 className="min-w-0 flex-1 text-sm font-bold text-slate-950">
          <button
            aria-controls={contentId}
            aria-expanded={expanded}
            ref={titleRef}
            className="flex min-h-9 w-full items-center gap-1 text-left"
            onClick={
              /** Updates only this panel's expansion. @returns Nothing. */ () =>
                setExpanded(
                  /** Toggles retained panel visibility. @param current - Current state. @returns Requested state. */ (
                    current,
                  ) => !current,
                )
            }
            onKeyDown={
              /** Enters panel content without toggling its expander. @param event - Title key input. @returns Nothing. */ (
                event,
              ) => {
                if (event.key !== "Enter") return;
                event.preventDefault();
                focusPanelContent();
              }
            }
            type="button"
          >
            <Icon aria-hidden size={16} />
            {title}
          </button>
        </h2>
        {moreOptions == null ? null : (
          <div aria-label={`${title} options`} role="toolbar" ref={toolbarRef}>
            {moreOptions}
          </div>
        )}
      </header>
      <div hidden={!expanded} id={contentId} onKeyDown={returnToPanelTitle}>
        {children}
      </div>
    </section>
  );
}
