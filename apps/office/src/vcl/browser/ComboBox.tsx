/** @fileoverview Browser editable weld ComboBox presentation, with controller-owned acceptance and custom row rendering. */
import {
  useId,
  useRef,
  useState,
  useLayoutEffect,
  Fragment,
  type ReactNode,
  type RefObject,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

/** Browser widget ports; document commands and focus ownership belong to the calling controller. */
export interface ComboBoxProps<T> {
  readonly popupWidth?: number;
  readonly options: readonly T[];
  readonly mruOptions?: readonly T[];
  readonly value: string;
  /** Actual parent assignment identity; asynchronous list refreshes need not discard an unchanged editable assignment. */
  readonly resetKey: unknown;
  readonly enabled: boolean;
  readonly label: string;
  readonly getText: (entry: T) => string;
  readonly getId: (entry: T) => string;
  readonly onAccept: (text: string, release: boolean) => void;
  readonly onCancel: () => boolean;
  readonly renderItem?: (entry: T, selected: boolean) => ReactNode;
}

/** Presents editable text, nondispatching travel and explicit controller acceptance. @param props - Widget ports and optional row drawing. @returns Combo box. */
export function ComboBox<T>(props: ComboBoxProps<T>): React.JSX.Element {
  const { options, value: saved, enabled, label, getText: getLabel } = props;
  const listId = useId(),
    input = useRef<HTMLInputElement>(null);
  const [draft, setDraft] =
    useState<Readonly<{ bound: string; text: string; owner: unknown; rowKey?: string }>>();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null),
    popup = useRef<HTMLDivElement>(null);
  const recent = props.mruOptions ?? [];
  const rows = [...recent, ...options];
  /** Native MRU copies may repeat the same model identity;browser row identity remains distinct from command identity. @param entry - Actual entry. @param index - Visible row index excluding separator. @returns Stable row key. */
  function rowKey(entry: T, index: number): string {
    return index < recent.length
      ? `mru:${index}:${props.getId(entry)}`
      : `main:${props.getId(entry)}`;
  }
  const currentDraft = draft?.bound === saved && draft.owner === props.resetKey ? draft : undefined;
  const selected = currentDraft?.text ?? saved;
  const travelIndex =
    currentDraft?.rowKey === undefined
      ? -1
      : rows.findIndex(
          /** Keeps explicit travel on its actual repeated row. @param entry - Actual row. @param index - Visible position. @returns Match. */ (
            entry,
            index,
          ) => rowKey(entry, index) === currentDraft.rowKey && getLabel(entry) === selected,
        );
  const mainIndex = options.findIndex(
    /** Resolves the current row for accessible keyboard travel. @param entry - Row. @returns Whether selected. */
    (entry) => getLabel(entry) === selected,
  );
  // Native find_text/set_active assignments search the main list,not recent copies.
  const activeIndex =
    travelIndex >= 0 ? travelIndex : mainIndex < 0 ? -1 : recent.length + mainIndex;
  const activeId = activeIndex < 0 ? undefined : `${listId}-${activeIndex}`;
  useLayoutEffect(
    /** Keeps actual popup travel visible without moving input focus. @returns Nothing. */
    () => {
      if (open && activeId !== undefined)
        document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
    },
    [open, activeId],
  );
  /** Releases focus before dispatch, preserving the exact raw typed name. @param text - Accepted entry text. @param release - Whether Tab suppresses explicit document focus. @returns Nothing. */
  function accept(text: string, release: boolean): void {
    if (!enabled) return;
    setDraft(undefined);
    setOpen(false);
    props.onAccept(text, release);
  }
  return (
    <span
      ref={anchor}
      className="relative inline-flex min-w-0 max-w-full"
      onBlur={
        /** Restores the saved value when the entire combo loses focus. @param event - Actual focus transfer. @returns Nothing. */
        (event) => {
          if (
            event.currentTarget.contains(event.relatedTarget) ||
            popup.current?.contains(event.relatedTarget)
          )
            return;
          setDraft(undefined);
          setOpen(false);
        }
      }
    >
      <input
        ref={input}
        role="combobox"
        aria-label={label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open ? activeId : undefined}
        disabled={!enabled}
        value={selected}
        className="h-8 w-44 min-w-0 rounded-l-md border border-slate-300 bg-white px-2 text-sm text-slate-700"
        onFocus={
          /** Native focus selects the entire entry. @param event - Entry focus. @returns Nothing. */
          (event) => event.currentTarget.select()
        }
        onChange={
          /** Typing retains a tentative draft only. @param event - Entry change. @returns Nothing. */
          (event) => setDraft({ owner: props.resetKey, bound: saved, text: event.target.value })
        }
        onKeyDown={
          /** Routes original Enter, Tab, Escape and nondispatching travel. @param event - Actual key. @returns Nothing. */
          (event) => {
            if (!enabled) return;
            if (event.key === "Escape") {
              setDraft(undefined);
              setOpen(false);
              if (props.onCancel()) {
                event.preventDefault();
                event.stopPropagation();
              }
              return;
            }
            if (event.key === "Tab") {
              accept(selected, false);
              return;
            }
            if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
            if (event.key === "Enter") {
              event.preventDefault();
              accept(selected, true);
              return;
            }
            const index = activeIndex;
            let next: number;
            switch (event.key) {
              case "ArrowDown":
                next = Math.min(rows.length - 1, index + 1);
                break;
              case "ArrowUp":
                next = Math.max(0, index - 1);
                break;
              case "PageUp":
                next = 0;
                break;
              case "PageDown":
                next = rows.length - 1;
                break;
              default:
                return;
            }
            event.preventDefault();
            const entry = rows[next];
            if (entry !== undefined)
              setDraft({
                owner: props.resetKey,
                bound: saved,
                text: getLabel(entry),
                rowKey: rowKey(entry, next),
              });
          }
        }
      />
      <button
        type="button"
        tabIndex={-1}
        disabled={!enabled}
        aria-label={`Show ${label}`}
        aria-expanded={open}
        aria-controls={listId}
        data-office-combobox-toggle="true"
        className="grid w-5 shrink-0 place-items-center rounded-r-md border border-l-0 border-slate-300 bg-white"
        onMouseDown={
          /** Retains entry focus before popup pick. @param event - Pointer. @returns Nothing. */
          (event) => event.preventDefault()
        }
        onClick={
          /** Opens the original full list. @returns Nothing. */
          () => {
            input.current?.focus();
            setOpen(!open);
          }
        }
      >
        <ChevronDown aria-hidden size={12} />
      </button>
      {open &&
        createPortal(
          <ComboBoxPopup
            preferredWidth={props.popupWidth ?? 0}
            anchor={anchor}
            popup={popup}
            onDismiss={
              /** Outside dismissal discards tentative travel just like leaving the composite widget. @returns Nothing. */
              () => {
                setDraft(undefined);
                setOpen(false);
              }
            }

            id={listId}
            role="listbox"
            aria-label={label}
          >
            {rows.map(
              /** Direct list picks accept once; travel remains tentative. @param entry - Original row. @param index - Stable row position for the accessible descendant. @returns Option. */
              (entry, index) => (
                <Fragment key={rowKey(entry, index)}>
                  <button
                    type="button"
                    id={`${listId}-${index}`}
                    aria-label={getLabel(entry)}
                    role="option"
                    tabIndex={-1}
                    aria-selected={index === activeIndex}
                    data-office-combobox-recent-option={index < recent.length || undefined}
                    data-office-combobox-main-option={index >= recent.length || undefined}
                    className="block w-full px-2 py-1 text-left text-sm hover:bg-[Highlight] hover:text-[HighlightText]"
                    style={
                      index === activeIndex
                        ? { backgroundColor: "Highlight", color: "HighlightText" }
                        : undefined
                    }
                    onMouseDown={
                      /** Retains focus until explicit release. @param event - Pointer. @returns Nothing. */
                      (event) => event.preventDefault()
                    }
                    onClick={
                      /** Accepts the direct native row. @returns Nothing. */
                      () => accept(getLabel(entry), true)
                    }
                  >
                    {props.renderItem === undefined
                      ? getLabel(entry)
                      : props.renderItem(entry, index === activeIndex)}
                  </button>
                  {index === recent.length - 1 ? (
                    <div
                      role="separator"
                      aria-hidden="true"
                      className="my-1 border-t border-slate-300"
                    />
                  ) : null}
                </Fragment>
              ),
            )}
          </ComboBoxPopup>,
          document.body,
        )}
    </span>
  );
}

/** Browser popup stays in the document overlay layer while retaining the combo's actual focus boundary. */
interface PopupProps extends HTMLAttributes<HTMLDivElement> {
  readonly preferredWidth: number;
  readonly anchor: RefObject<HTMLSpanElement | null>;
  readonly popup: RefObject<HTMLDivElement | null>;
  readonly onDismiss: () => void;
}

/** Positions actual measured content within the current viewport; native UI command ownership is outside this primitive. @param props - Actual anchor, popup and DOM attributes. @returns Overlay list. */
function ComboBoxPopup({
  anchor,
  popup,
  onDismiss,
  preferredWidth,
  ...attributes
}: PopupProps): React.JSX.Element {
  useLayoutEffect(
    /** Tracks browser geometry and pointer dismissal for this mounted list only. @returns Cleanup. */
    () => {
      /** Repositions from real layout rather than estimating text width. @returns Nothing. */
      function position(): void {
        const owner = anchor.current as HTMLSpanElement,
          list = popup.current as HTMLDivElement;
        const rect = owner.getBoundingClientRect();
        const width = Math.min(
          window.innerWidth,
          Math.max(rect.width, preferredWidth > 0 ? preferredWidth : list.scrollWidth),
        );
        const below = window.innerHeight - rect.bottom;
        const above = rect.top;
        const down = below >= Math.min(240, list.scrollHeight) || below >= above;
        const height = Math.max(0, Math.min(240, down ? below : above));
        list.style.width = `${width}px`;
        list.style.left = `${Math.max(0, Math.min(rect.left, window.innerWidth - width))}px`;
        list.style.maxHeight = `${height}px`;
        list.style.top = `${down ? rect.bottom : Math.max(0, rect.top - Math.min(height, list.scrollHeight))}px`;
      }
      /** Closes only for a pointer outside both the anchor and the portal list. @param event - Browser pointer. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        const target = event.target as Node;
        if (
          !(anchor.current as HTMLSpanElement).contains(target) &&
          !(popup.current as HTMLDivElement).contains(target)
        )
          onDismiss();
      }
      position();
      const observer = new MutationObserver(position);
      observer.observe(popup.current as HTMLDivElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      window.addEventListener("resize", position);
      window.addEventListener("scroll", position, true);
      document.addEventListener("pointerdown", dismiss, true);
      return /** Releases this mounted popup's browser listeners. @returns Nothing. */ () => {
        observer.disconnect();
        window.removeEventListener("resize", position);
        window.removeEventListener("scroll", position, true);
        document.removeEventListener("pointerdown", dismiss, true);
      };
    },
    [anchor, popup, onDismiss, preferredWidth],
  );
  return (
    <div
      {...attributes}
      ref={popup}
      className="fixed z-50 overflow-y-auto border border-slate-300 bg-white py-1 shadow-md"
    />
  );
}
