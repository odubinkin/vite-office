/** @fileoverview Pinned Writer line spacing popover with preset and custom percentages. */
import { useEffect, useRef, useState } from "react";
import {
  useBrowserCommandPresentation,
  type BrowserCommandSource,
} from "../../../framework/browser/presentation/command-surface";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";

const presets = [
  { label: "Spacing: 1", percent: 100 },
  { label: "Spacing: 1.15", percent: 115 },
  { label: "Spacing: 1.5", percent: 150 },
  { label: "Spacing: 2", percent: 200 },
] as const;

/** Executes line spacing from a compact upstream-style control. @param props - Command source and resources. @returns Quick control. */
export function WriterLineSpacingControl({
  commandSource,
  getCommandResource,
}: Readonly<{
  commandSource: BrowserCommandSource;
  getCommandResource: (commandUrl: string) => WriterCommandResource;
}>): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const presentation = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.lineSpacing,
    getCommandResource,
  );
  const [custom, setCustom] = useState(100);
  const [open, setOpen] = useState(false);
  useEffect(
    /** Installs dismissal listeners. @returns Cleanup. */ () => {
      /** Closes the quick panel on outside press. @param event - Pointer event. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        if (!ref.current?.contains(event.target as Node)) setOpen(false);
      }
      /** Closes the quick panel on Escape. @param event - Key event. @returns Nothing. */
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
  /** Applies the selected proportional spacing. @param percent - Proportional value. @returns Nothing. */
  function apply(percent: number): void {
    commandSource.Execute(WRITER_COMMAND_IDS.lineSpacing, { percent });
    setOpen(false);
  }
  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label="Line Spacing"
        className="grid size-8 cursor-pointer list-none place-items-center rounded-md border border-slate-300 bg-white text-sm hover:border-indigo-400"
        title="Line Spacing"
        type="button"
        onClick={/** Toggles the control. @returns Nothing. */ () => setOpen(!open)}
      >
        ↕
      </button>
      {open && (
        <div className="absolute left-0 top-full z-40 w-44 rounded border border-slate-300 bg-white p-2 shadow-lg">
          {presets.map(
            /** Renders a preset. @param preset - Preset descriptor. @returns Button. */ ({
              label,
              percent,
            }) => (
              <button
                aria-pressed={presentation.selectedValue === percent}
                className="block w-full rounded px-2 py-1 text-left text-sm hover:bg-indigo-50 aria-pressed:bg-indigo-100"
                key={percent}
                onClick={/** Applies a preset. @returns Nothing. */ () => apply(percent)}
                type="button"
              >
                {label}
              </button>
            ),
          )}
          <label className="mt-2 grid gap-1 border-t pt-2 text-xs">
            Custom Value (%)
            <input
              aria-label="Custom line spacing"
              className="rounded border p-1"
              min="1"
              onChange={
                /** Sets a custom value. @param event - Input event. @returns Nothing. */ (event) =>
                  setCustom(Number(event.target.value))
              }
              type="number"
              value={custom}
            />
          </label>
          <button
            className="mt-2 w-full rounded bg-indigo-700 px-2 py-1 text-xs text-white"
            disabled={custom < 1}
            onClick={/** Applies the custom value. @returns Nothing. */ () => apply(custom)}
            type="button"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
