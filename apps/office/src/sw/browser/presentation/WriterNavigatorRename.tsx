/** @fileoverview Inline editor for renamable rows in the native Writer Navigator tree. */
import { useLayoutEffect, useRef } from "react";

/** Original row text and its inline edit completion. */
interface WriterNavigatorRenameProps {
  readonly title: string;
  readonly label: string;
  readonly onComplete: (value?: string) => void;
}

/** Edits the tree label in place, using native form input and focus. @param props - Original label and completion callback. @returns Inline editor. */
export function WriterNavigatorRename({
  title,
  label,
  onComplete,
}: WriterNavigatorRenameProps): React.JSX.Element {
  const field = useRef<HTMLInputElement>(null);
  const finished = useRef(false);
  useLayoutEffect(
    /** Starts with the old name selected, like the native tree label editor. @returns Nothing. */
    () => {
      field.current?.focus();
      field.current?.select();
    },
    [],
  );
  /** Completes the edit once even when focus leaves during activation. @param value - Accepted value or undefined for cancel. @returns Nothing. */
  function complete(value?: string): void {
    if (finished.current) return;
    finished.current = true;
    onComplete(value);
  }
  return (
    <input
      ref={field}
      aria-label={label}
      className="min-w-0 flex-1 rounded border border-slate-300 bg-white px-1"
      defaultValue={title}
      type="text"
      onBlur={
        /** Commits the current native row draft when leaving the input. @param event - Focus transfer. @returns Nothing. */
        (event) => complete(event.currentTarget.value)
      }
      onClick={
        /** Retains ordinary editing inside the inline field. @param event - Pointer action. @returns Nothing. */
        (event) => event.stopPropagation()
      }
      onDoubleClick={
        /** Prevents activation while selecting the name's text. @param event - Pointer action. @returns Nothing. */
        (event) => event.stopPropagation()
      }
      onKeyDown={
        /** Handles Enter and Escape inside the tree editor. @param event - Keyboard action. @returns Nothing. */
        (event) => {
          event.stopPropagation();
          if (event.key === "Enter" || event.key === "Escape") {
            event.preventDefault();
            complete(event.key === "Enter" ? event.currentTarget.value : undefined);
          }
        }
      }
    />
  );
}
