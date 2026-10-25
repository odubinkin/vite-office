/** @fileoverview Writer frame binding and popup lifecycle for the original eight-mode native line-spacing control. */
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const ref = useRef<HTMLDivElement>(null),
    popup = useRef<HTMLDivElement>(null);
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
        if (
          !ref.current?.contains(event.target as Node) &&
          !popup.current?.contains(event.target as Node)
        )
          setOpen(false);
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
  useLayoutEffect(
    /** Positions the actual floating panel in the viewport,independent of toolbar overflow and current popup content size. @returns Observer cleanup or nothing while closed. */ () => {
      if (!open) return;
      const panel = popup.current as HTMLDivElement,
        anchor = ref.current as HTMLDivElement;
      /** Repositions using actual native browser geometry. @returns Nothing. */
      function position(): void {
        const rect = anchor.getBoundingClientRect();
        panel.style.maxWidth = `${window.innerWidth}px`;
        panel.style.maxHeight = `${window.innerHeight}px`;
        const width = panel.offsetWidth,
          height = Math.min(panel.offsetHeight, window.innerHeight),
          below = window.innerHeight - rect.bottom;
        const down = below >= height || below >= rect.top;
        panel.style.left = `${Math.max(0, Math.min(rect.right - width, window.innerWidth - width))}px`;
        panel.style.top = `${down ? Math.max(0, Math.min(rect.bottom, window.innerHeight - height)) : Math.max(0, rect.top - height)}px`;
      }
      position();
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(position);
      observer?.observe(panel);
      window.addEventListener("resize", position);
      window.addEventListener("scroll", position, true);
      return /** Releases the actual floating panel host listeners. @returns Nothing. */ () => {
        observer?.disconnect();
        window.removeEventListener("resize", position);
        window.removeEventListener("scroll", position, true);
      };
    },
    [open],
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
      {open &&
        createPortal(
          <div ref={popup} className="fixed z-40 w-max overflow-auto">
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
              close={
                /** Original preset path closes popup. @returns Nothing. */ () => setOpen(false)
              }
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
