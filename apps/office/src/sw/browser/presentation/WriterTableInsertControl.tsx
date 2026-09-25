/** @fileoverview Writer standard-bar Insert Table grid and More Options popover. */
import { useEffect, useRef, useState } from "react";
import { Table2 } from "lucide-react";

const COLUMNS = 10;
const ROWS = 15;

/** Presents the pinned 10 × 15 table picker. @param props - Grid callbacks. @returns Quick control. */
export function WriterTableInsertControl({
  onInsert,
  onMoreOptions,
}: Readonly<{
  onInsert: (columns: number, rows: number) => void;
  onMoreOptions: () => void;
}>): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<readonly [number, number]>([0, 0]);
  const [open, setOpen] = useState(false);
  useEffect(
    /** Installs dismissal listeners. @returns Cleanup. */ () => {
      /** Closes the grid when a pointer press starts outside it. @param event - Pointer event. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        if (!ref.current?.contains(event.target as Node)) setOpen(false);
      }
      /** Closes the grid with Escape. @param event - Key event. @returns Nothing. */
      function onKeyDown(event: KeyboardEvent): void {
        if (event.key === "Escape") setOpen(false);
      }
      document.addEventListener("pointerdown", dismiss);
      document.addEventListener("keydown", onKeyDown);
      return /** Removes dismissal listeners. @returns Nothing. */ () => {
        document.removeEventListener("pointerdown", dismiss);
        document.removeEventListener("keydown", onKeyDown);
      };
    },
    [],
  );
  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label="Insert Table"
        className="grid size-9 cursor-pointer list-none place-items-center rounded-lg hover:bg-indigo-50"
        title="Insert Table"
        type="button"
        onClick={/** Toggles the grid. @returns Nothing. */ () => setOpen(!open)}
      >
        <Table2 aria-hidden={true} size={18} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 w-max max-h-[80dvh] overflow-auto rounded border border-slate-300 bg-white p-3 shadow-xl">
          <p className="mb-2 text-xs font-semibold" aria-live="polite">
            {hover[0] > 0 ? `${hover[0]} × ${hover[1]}` : "Insert Table"}
          </p>
          <div
            className="grid grid-cols-10 gap-0.5"
            aria-label="Table size"
            onKeyDown={
              /** Moves the size preview and confirms it from the keyboard. @param event - Grid key event. @returns Nothing. */
              (event) => {
                const step = {
                  ArrowRight: [1, 0],
                  ArrowLeft: [-1, 0],
                  ArrowDown: [0, 1],
                  ArrowUp: [0, -1],
                }[event.key];
                if (step !== undefined) {
                  event.preventDefault();
                  setHover(
                    /** Advances the selected size. @param size - Previous dimensions. @returns New dimensions. */
                    ([columns, rows]) => [
                      Math.min(COLUMNS, Math.max(1, columns + (step[0] as number))),
                      Math.min(ROWS, Math.max(1, rows + (step[1] as number))),
                    ],
                  );
                } else if (event.key === "Enter" && hover[0] > 0) {
                  event.preventDefault();
                  setOpen(false);
                  onInsert(hover[0], hover[1]);
                }
              }
            }
          >
            {Array.from(
              { length: COLUMNS * ROWS },
              /** Renders one grid cell. @param _unused - Array value. @param index - Cell index. @returns Button. */ (
                _,
                index,
              ) => {
                const columns = (index % COLUMNS) + 1;
                const rows = Math.floor(index / COLUMNS) + 1;
                return (
                  <button
                    aria-label={`${columns} columns, ${rows} rows`}
                    className={`size-4 border ${columns <= hover[0] && rows <= hover[1] ? "border-indigo-600 bg-indigo-200" : "border-slate-300 bg-white"}`}
                    key={index}
                    onClick={
                      /** Inserts the selected size. @returns Nothing. */ () => {
                        setOpen(false);
                        onInsert(columns, rows);
                      }
                    }
                    onFocus={
                      /** Updates the selection preview. @returns Nothing. */ () =>
                        setHover([columns, rows])
                    }
                    onMouseEnter={
                      /** Updates the selection preview. @returns Nothing. */ () =>
                        setHover([columns, rows])
                    }
                    type="button"
                  />
                );
              },
            )}
          </div>
          <button
            className="mt-3 w-full border-t border-slate-200 pt-2 text-left text-sm hover:text-indigo-700"
            onClick={
              /** Opens full table options. @returns Nothing. */ () => {
                setOpen(false);
                onMoreOptions();
              }
            }
            type="button"
          >
            More Options
          </button>
        </div>
      )}
    </div>
  );
}
