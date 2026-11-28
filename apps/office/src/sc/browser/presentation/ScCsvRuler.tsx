/** @fileoverview Native web ruler for the Calc fixed-width import preview. */
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";

/** One fixed-width split drag, with the initial state for toggling or cancellation. */
interface SplitDrag {
  readonly original: readonly number[];
  readonly start: number;
  moved: boolean;
}

/** Native visual-column ruler for the fixed-width preview. @param props - Visual width, split positions and their update port. @returns Ruler. */
export function ScCsvRuler({
  width,
  splits,
  onChange,
}: {
  readonly width: number;
  readonly splits: readonly number[];
  readonly onChange: (splits: readonly number[]) => void;
}): React.JSX.Element {
  const [position, setPosition] = useState(1);
  const drag = useRef<SplitDrag | null>(null);
  const end = Math.max(1, width - 1);
  const current = Math.min(position, end);

  /** Inserts one valid position in the same order as the source ruler. @param positions - Existing positions. @param next - New split. @returns Updated positions. */
  function insert(positions: readonly number[], next: number): readonly number[] {
    return [...new Set([...positions, next])].sort(
      /** Orders values numerically in ascending order. @param left - First value. @param right - Second value. @returns Numeric comparison. */ (
        left,
        right,
      ) => left - right,
    );
  }

  /** Converts a pointer's X coordinate to the visual column on the ruler. @param event - Actual ruler pointer. @returns Split position. */
  function pointerPosition(event: PointerEvent<HTMLButtonElement>): number {
    const rulerBounds = event.currentTarget.getBoundingClientRect();
    const offset = event.clientX - rulerBounds.left;
    return Math.max(1, Math.min(end, Math.round((offset * width) / rulerBounds.width)));
  }

  /** Routes the source ruler's keyboard movement and split commands. @param event - Ruler key event. @returns Nothing. */
  function keyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    const { key, shiftKey, ctrlKey, metaKey } = event;
    const primary = ctrlKey || metaKey;
    const direction = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
    if (direction) {
      let next = Math.max(1, Math.min(end, current + direction));
      if (primary && !shiftKey) {
        next =
          direction < 0
            ? (splits
                .filter(
                  /** Checks whether `split` is less than `current`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                    split,
                  ) => split < current,
                )
                .at(-1) ?? 1)
            : (splits.find(
                /** Checks whether `split` is greater than `current`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                  split,
                ) => split > current,
              ) ?? end);
      } else if (primary && shiftKey && splits.includes(current))
        onChange(
          insert(
            splits.filter(
              /** Checks whether `split` differs from `current`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                split,
              ) => split !== current,
            ),
            next,
          ),
        );
      setPosition(next);
    } else if (key === "Home" || key === "End") setPosition(key === "Home" ? 1 : end);
    else if (key === "Insert") onChange(insert(splits, current));
    else if (key === "Delete")
      onChange(
        shiftKey
          ? []
          : splits.filter(
              /** Checks whether `split` differs from `current`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                split,
              ) => split !== current,
            ),
      );
    else return;
    event.preventDefault();
  }

  return (
    <button
      type="button"
      aria-label="Fixed width ruler"
      aria-description={`Column ${current}`}
      aria-pressed={splits.includes(current)}
      disabled={width < 2}
      className="relative block h-6 border-b border-slate-400 bg-slate-100 text-left font-mono focus-visible:outline-sky-600"
      style={{
        width: `${width}ch`,
        backgroundImage:
          "repeating-linear-gradient(90deg, transparent 0 calc(1ch - 1px), #94a3b8 calc(1ch - 1px) 1ch)",
      }}
      onKeyDown={keyDown}
      onClick={
        /** Activates the "Fixed width ruler" control. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.detail !== 0) return;
          onChange(
            splits.includes(current)
              ? splits.filter(
                  /** Checks whether `split` differs from `current`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                    split,
                  ) => split !== current,
                )
              : insert(splits, current),
          );
        }
      }
      onPointerDown={
        /** Starts pointer interaction on the "Fixed width ruler" control. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          if (event.button !== 0) return;
          const start = pointerPosition(event);
          drag.current = { original: splits, start, moved: false };
          event.currentTarget.setPointerCapture(event.pointerId);
          setPosition(start);
          onChange(insert(splits, start));
        }
      }
      onPointerMove={
        /** Updates the pointer interaction on the "Fixed width ruler" control. @param event - Browser event. @returns Nothing. */ (
          event,
        ) => {
          const tracking = drag.current;
          if (!tracking) return;
          const next = pointerPosition(event);
          if (next !== tracking.start) tracking.moved = true;
          setPosition(next);
          onChange(
            insert(
              tracking.original.filter(
                /** Checks whether `split` differs from `tracking.start`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                  split,
                ) => split !== tracking.start,
              ),
              next,
            ),
          );
        }
      }
      onPointerUp={
        /** Finishes the pointer interaction on the "Fixed width ruler" control. @returns Nothing. */ () => {
          const tracking = drag.current;
          if (tracking && !tracking.moved && tracking.original.includes(tracking.start))
            onChange(
              tracking.original.filter(
                /** Checks whether `split` differs from `tracking.start`. @param split - Candidate entry. @returns Whether the condition holds. */ (
                  split,
                ) => split !== tracking.start,
              ),
            );
          drag.current = null;
        }
      }
      onPointerCancel={
        /** Restores the original marker position after a cancelled ruler drag. @returns Nothing. */ () => {
          if (drag.current) onChange(drag.current.original);
          drag.current = null;
        }
      }
    >
      {splits.map(
        /** Renders one span for the source entry. @param split - Source entry. @returns Rendered element. */ (
          split,
        ) => (
          <span
            key={split}
            aria-hidden="true"
            className="absolute inset-y-0 w-0.5 bg-sky-700"
            style={{ left: `${split}ch` }}
          />
        ),
      )}
      <span
        aria-hidden="true"
        className="absolute bottom-0 h-2 w-1 bg-slate-700"
        style={{ left: `${current}ch` }}
      />
    </button>
  );
}
