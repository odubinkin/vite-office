/** @fileoverview Measures table frames for JSDOM and sends actual mounted native mouse events. */
import { fireEvent, screen } from "@testing-library/react";

/** Returns an original mounted row, excluding repeated headlines. @param name - Native table name. @param row - One-based original row. @returns Actual row element. */
export function tableRowElement(name: string, row: number): HTMLElement {
  const element = screen.getAllByRole("table", { name }).flatMap(
    /** Locates only original row frames across physical follows. @param table - Mounted frame. @returns Original row or no match. */
    (table) => [
      ...table.querySelectorAll<HTMLElement>(
        `tr[data-writer-table-row="${row - 1}"]:not([data-writer-repeated-headline])`,
      ),
    ],
  )[0];
  if (element === undefined) throw new Error("Missing original table row");
  return element;
}

/** Gives JSDOM physical frame bounds and selects through the real editing host. @param name - Native table name. @param row - One-based original row. @returns Whether native mouse down was prevented. */
export function selectMountedTableRow(name: string, row: number): boolean {
  const target = tableRowElement(name, row),
    table = target.closest("table") as HTMLTableElement;
  const restores: (() => void)[] = [],
    rows = [...table.querySelectorAll<HTMLElement>("tr")];
  const width = (rows[0]?.children.length ?? 1) * 100;
  /** Installs only the missing device measurement, preserving prior text geometry mocks. @param element - Mounted frame. @param x - Physical left. @param y - Physical top. @param w - Width. @param h - Height. @returns Nothing. */
  function measure(element: Element, x: number, y: number, w: number, h: number): void {
    const before = element.getBoundingClientRect;
    element.getBoundingClientRect =
      /** Returns literal fixture geometry. @returns Device rectangle. */
      () => ({
        x,
        y,
        left: x,
        top: y,
        right: x + w,
        bottom: y + h,
        width: w,
        height: h,
        toJSON:
          /** Provides the device rectangle serialization boundary. @returns Nothing. */
          () => undefined,
      });
    restores.push(
      /** Restores the original device getter. @returns Nothing. */
      () => {
        element.getBoundingClientRect = before;
      },
    );
  }
  measure(table, 100, 100, width, rows.length * 50);
  for (const [r, element] of rows.entries()) {
    measure(element, 100, 100 + r * 50, width, 50);
    for (const [c, cell] of [...element.children].entries())
      measure(cell, 100 + c * 100, 100 + r * 50, 100, 50);
  }
  try {
    const y = 125 + rows.indexOf(target) * 50;
    const prevented = !fireEvent.mouseDown(target, {
      button: 0,
      detail: 1,
      clientX: 93,
      clientY: y,
    });
    fireEvent.mouseUp(target, { button: 0, clientX: 93, clientY: y });
    return prevented;
  } finally {
    for (const restore of restores) restore();
  }
}
