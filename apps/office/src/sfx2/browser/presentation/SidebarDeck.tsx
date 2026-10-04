/** @fileoverview Projects the existing sidebar deck's native close and activation lifecycle. */
import { useId, useState, type ReactNode, type KeyboardEvent } from "react";
import { SlidersHorizontal, X } from "lucide-react";

/** Supplies one implemented sidebar deck and its owning document client. */
export interface SidebarDeckProps {
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly title: string;
  readonly focusDocument?: () => void;
  readonly closeLabel?: string;
  readonly selectionLabel?: string;
}

/** Renders a deck title and activation rail independently of whole-sidebar visibility.
 * @param props - Existing deck content and document ownership.
 * @param props.ariaLabel - Sidebar accessible name.
 * @param props.children - Mounted deck content retained across collapse.
 * @param props.title - Localized deck title and activation label.
 * @param props.focusDocument - Returns focus to the owning client without dispatch.
 * @param props.closeLabel - Localized deck close label.
 * @param props.selectionLabel - Localized activation rail label.
 * @returns Sidebar deck chrome and its activation rail.
 */
export function SidebarDeck({
  ariaLabel,
  children,
  title,
  focusDocument,
  closeLabel = "Close Sidebar Deck",
  selectionLabel = "Sidebar deck selection",
}: SidebarDeckProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(true);
  const contentId = useId();

  /** Handles native deck-toolbox and tab-bar cancellation without closing the deck.
   * @param event - Control key event.
   * @returns Nothing.
   */
  function returnToDocument(event: KeyboardEvent<HTMLButtonElement>): void {
    if (event.key !== "Escape") return;
    event.preventDefault();
    focusDocument?.();
  }

  return (
    <aside
      aria-label={ariaLabel}
      className={`flex min-h-0 max-h-[40vh] min-w-0 border-t border-slate-200 bg-white lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-h-none lg:border-l lg:border-t-0 ${isOpen ? "lg:w-60" : "lg:w-9"}`}
    >
      <div className="min-w-0 flex-1" hidden={!isOpen} id={contentId}>
        <header className="flex items-center justify-between gap-2 border-b border-slate-200 px-3 py-1">
          <h2 className="truncate text-sm font-bold text-slate-950">{title}</h2>
          <button
            aria-label={closeLabel}
            className="grid size-7 shrink-0 place-items-center rounded hover:bg-slate-100"
            onClick={
              /** Requests a closed deck while retaining the tab bar and children. @returns Nothing. */ () =>
                setIsOpen(false)
            }
            onKeyDown={returnToDocument}
            title={closeLabel}
            type="button"
          >
            <X aria-hidden size={16} />
          </button>
        </header>
        <div className="max-h-[32vh] overflow-auto p-4 lg:h-[calc(100%_-_2.5rem)] lg:max-h-none">
          {children}
        </div>
      </div>
      <div
        aria-label={selectionLabel}
        className="flex w-9 shrink-0 flex-col items-center border-l border-slate-200 bg-slate-50 py-1"
        role="toolbar"
      >
        <button
          aria-controls={contentId}
          aria-label={title}
          aria-pressed={isOpen}
          className={`grid size-8 place-items-center rounded ${isOpen ? "bg-indigo-100 text-indigo-800" : "hover:bg-slate-100"}`}
          onClick={
            /** Activates the selected deck after returning focus to its document. @returns Nothing. */ () => {
              focusDocument?.();
              setIsOpen(
                /** Toggles the current selected deck. @param open - Current deck state. @returns Requested state. */ (
                  open,
                ) => !open,
              );
            }
          }
          onKeyDown={returnToDocument}
          title={title}
          type="button"
        >
          <SlidersHorizontal aria-hidden size={18} />
        </button>
      </div>
    </aside>
  );
}
