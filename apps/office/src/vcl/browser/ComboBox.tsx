/** @fileoverview Browser editable weld ComboBox presentation, with controller-owned acceptance and custom row rendering. */
import {
  useId,
  useRef,
  useState,
  useLayoutEffect,
  type ReactNode,
  type RefObject,
  type HTMLAttributes,
} from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

/** Browser widget ports; document commands and focus ownership belong to the calling controller. */
export interface ComboBoxProps<T> {
  readonly options: readonly T[];
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
  const [draft, setDraft] = useState<Readonly<{ bound: string; text: string; owner: unknown }>>();
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null),
    popup = useRef<HTMLDivElement>(null);
  const selected = draft?.bound === saved && draft.owner === props.resetKey ? draft.text : saved;
  const activeIndex = options.findIndex(
    /** Resolves the current row for accessible keyboard travel. @param entry - Row. @returns Whether selected. */
    (entry) => getLabel(entry) === selected,
  );
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
            const index = options.findIndex(
              /** Finds tentative travel row. @param entry - Candidate row. @returns Match. */
              (entry) => getLabel(entry) === selected,
            );
            let next: number;
            switch (event.key) {
              case "ArrowDown":
                next = Math.min(options.length - 1, index + 1);
                break;
              case "ArrowUp":
                next = Math.max(0, index - 1);
                break;
              case "PageUp":
                next = 0;
                break;
              case "PageDown":
                next = options.length - 1;
                break;
              default:
                return;
            }
            event.preventDefault();
            const entry = options[next];
            if (entry !== undefined)
              setDraft({ owner: props.resetKey, bound: saved, text: getLabel(entry) });
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
            {options.map(
              /** Direct list picks accept once; travel remains tentative. @param entry - Original row. @param index - Stable row position for the accessible descendant. @returns Option. */
              (entry, index) => (
                <button
                  type="button"
                  id={`${listId}-${index}`}
                  aria-label={getLabel(entry)}
                  role="option"
                  key={props.getId(entry)}
                  tabIndex={-1}
                  aria-selected={getLabel(entry) === selected}
                  className="block w-full px-2 py-1 text-left text-sm hover:bg-[Highlight] hover:text-[HighlightText]"
                  style={
                    getLabel(entry) === selected
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
                    : props.renderItem(entry, getLabel(entry) === selected)}
                </button>
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
  readonly anchor: RefObject<HTMLSpanElement | null>;
  readonly popup: RefObject<HTMLDivElement | null>;
  readonly onDismiss: () => void;
}

/** Positions actual measured content within the current viewport; native UI command ownership is outside this primitive. @param props - Actual anchor, popup and DOM attributes. @returns Overlay list. */
function ComboBoxPopup({ anchor, popup, onDismiss, ...attributes }: PopupProps): React.JSX.Element {
  useLayoutEffect(
    /** Tracks browser geometry and pointer dismissal for this mounted list only. @returns Cleanup. */
    () => {
      /** Repositions from real layout rather than estimating text width. @returns Nothing. */
      function position(): void {
        const owner = anchor.current as HTMLSpanElement,
          list = popup.current as HTMLDivElement;
        const rect = owner.getBoundingClientRect();
        const width = Math.min(window.innerWidth, Math.max(rect.width, list.scrollWidth));
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
      window.addEventListener("resize", position);
      window.addEventListener("scroll", position, true);
      document.addEventListener("pointerdown", dismiss, true);
      return /** Releases this mounted popup's browser listeners. @returns Nothing. */ () => {
        window.removeEventListener("resize", position);
        window.removeEventListener("scroll", position, true);
        document.removeEventListener("pointerdown", dismiss, true);
      };
    },
    [anchor, popup, onDismiss],
  );
  return (
    <div
      {...attributes}
      ref={popup}
      className="fixed z-50 overflow-y-auto border border-slate-300 bg-white py-1 shadow-md"
    />
  );
}
