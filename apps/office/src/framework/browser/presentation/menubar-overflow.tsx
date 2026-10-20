/** @fileoverview Measures the shared menubar and projects native MenuBarWindow's hidden suffix into one parent popup. */
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { CommandMenuPlacement } from "./CommandMenuBar";
/** Presentation-only identity for the native hidden-item parent popup. */
export const MENUBAR_OVERFLOW_ID = "office-hidden-menus";
/** Actual Writer trigger geometry shared by measured labels and rendered controls. */
export const menuBarTriggerClassName =
  "rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 data-[menubar-highlighted]:bg-slate-100";
/** Projects hidden trailing roots without copying command state or changing their original submenu identities. @param props - Original resources,labels and actual menu renderer. @returns Measured menubar. */
export function MenuBarOverflow({
  menus,
  getMenuLabel,
  children,
}: {
  readonly menus: readonly CommandMenuPlacement[];
  readonly getMenuLabel: (id: string, fallback: string) => string;
  readonly children: (menus: readonly CommandMenuPlacement[]) => ReactNode;
}): React.JSX.Element {
  const host = useRef<HTMLDivElement>(null);
  const measurement = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ count: menus.length, width: 0 });
  useLayoutEffect(
    /** Measures native label extents against the actual available width and watches frame/font changes. @returns Listener cleanup. */ () => {
      const owner = host.current as HTMLDivElement;
      const row = measurement.current as HTMLDivElement;
      /** Reprojects only when measured geometry changes the visible prefix. @returns Nothing. */
      function measure(): void {
        const nodes = [...row.children] as HTMLElement[];
        const origin = row.getBoundingClientRect().left;
        const ends = nodes.slice(0, menus.length).map(
          /** Includes the real CSS gap before each measured trigger. @param node - Label box. @returns Right extent. */
          (node) => node.getBoundingClientRect().right - origin,
        );
        const width = ends.at(-1) ?? 0;
        const available = owner.getBoundingClientRect().width;
        if (width === 0 || available === 0) return;
        const moreWidth = (nodes[menus.length] as HTMLElement).getBoundingClientRect().width;
        const gap =
          (nodes[1] as HTMLElement).getBoundingClientRect().left -
          (nodes[0] as HTMLElement).getBoundingClientRect().right;
        const count =
          width <= available
            ? menus.length
            : ends.filter(
                /** Reserves the same measured gap and More trigger width before hiding a source suffix. @param end - Native root extent. @returns Whether root fits. */
                (end) => end + gap + moreWidth <= available,
              ).length;
        setLayout(
          /** Avoids layout loops when ResizeObserver reports unchanged geometry. @param previous - Last layout. @returns Current projection. */
          (previous) =>
            previous.count === count && previous.width === width ? previous : { count, width },
        );
      }
      measure();
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(measure);
      observer?.observe(owner);
      observer?.observe(row);
      window.addEventListener("resize", measure);
      return /** Releases the actual mounted geometry observers. @returns Nothing. */ () => {
        observer?.disconnect();
        window.removeEventListener("resize", measure);
      };
    },
    [menus, getMenuLabel],
  );
  const projected =
    layout.count >= menus.length
      ? menus
      : [
          ...menus.slice(0, layout.count),
          {
            id: MENUBAR_OVERFLOW_ID,
            label: "More menus",
            items: menus.slice(layout.count).map(
              /** Retains original hidden menu identity,label and resource tree as native ImplCreatePopup does. @param menu - Native hidden root. @returns Parent-popup child. */
              (menu) => ({
                kind: "submenu" as const,
                id: menu.id,
                label: getMenuLabel(menu.id, menu.label),
                items: menu.items,
              }),
            ),
          },
        ];
  return (
    <div className="relative max-w-full" ref={host} style={{ width: layout.width || undefined }}>
      <div
        aria-hidden="true"
        inert
        className="pointer-events-none invisible absolute left-0 top-0 flex w-max items-center gap-1 whitespace-nowrap"
        ref={measurement}
      >
        {menus.map(
          /** Measures real translated labels using the exact visible trigger style without adding focusable controls. @param menu - Native root. @returns Hidden label geometry. */
          (menu) => (
            <span className={menuBarTriggerClassName} key={menu.id}>
              {getMenuLabel(menu.id, menu.label)}
            </span>
          ),
        )}
        <span className={menuBarTriggerClassName}>»</span>
      </div>
      {children(projected)}
    </div>
  );
}
