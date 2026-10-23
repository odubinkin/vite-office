/** @fileoverview Writer frame binding and popup lifecycle for the original eight-mode native line-spacing control. */
import { useEffect, useRef, useState } from "react";
import { ParaLineSpacingControl } from "../../../svx/browser/sidebar/paragraph/ParaLineSpacingControl";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { SfxItemState } from "../../../svl/inc/itemset";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import {
  useBrowserCommandPresentation,
  type BrowserCommandSource,
} from "../../../framework/browser/presentation/command-surface";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { WriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";

/** Executes line spacing from a compact upstream-style control. @param props - Command source and resources. @returns Quick control. */
export function WriterLineSpacingControl({
  commandSource,
  getCommandResource,
  unit,
}: Readonly<{
  commandSource: BrowserCommandSource;
  unit: FieldUnit;
  getCommandResource: (commandUrl: string) => WriterCommandResource;
}>): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const presentation = useBrowserCommandPresentation(
    commandSource,
    WRITER_COMMAND_IDS.lineSpacing,
    getCommandResource,
  );
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
  return (
    <div className="relative" ref={ref}>
      <button
        aria-expanded={open}
        aria-label="Line Spacing"
        disabled={!presentation.enabled}
        className="grid size-8 cursor-pointer list-none place-items-center rounded-md border border-slate-300 bg-white text-sm hover:border-indigo-400"
        title="Line Spacing"
        type="button"
        onClick={/** Toggles the control. @returns Nothing. */ () => setOpen(!open)}
      >
        ↕
      </button>
      {open && (
        <div className="absolute right-0 top-full z-40">
          <ParaLineSpacingControl
            unit={unit}
            state={
              !presentation.enabled
                ? SfxItemState.DISABLED
                : presentation.mixed
                  ? SfxItemState.INVALID
                  : presentation.selectedValue instanceof SvxLineSpacingItem
                    ? SfxItemState.SET
                    : SfxItemState.UNKNOWN
            }
            item={
              presentation.selectedValue instanceof SvxLineSpacingItem
                ? presentation.selectedValue
                : undefined
            }
            dispatch={
              /** Sends the original complete native item through actual SfxRequest. @param item - Accepted item. @returns Nothing. */ (
                item,
              ) => {
                commandSource.Execute(WRITER_COMMAND_IDS.lineSpacing, [item]);
              }
            }
            close={/** Original preset path closes popup. @returns Nothing. */ () => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
