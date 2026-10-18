/** @fileoverview Real measured hidden-suffix projection,resize and cleanup contracts for shared office menus. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MenuBarOverflow } from "./menubar-overflow";
import { CommandMenuBar, type CommandMenuPlacement } from "./CommandMenuBar";
const menus: readonly CommandMenuPlacement[] = ["File", "Edit", "Help"].map(
  /** Defines real immutable command trees for suffix identity assertions. @param label - Native root. @returns Placement. */
  (label) => ({ id: label, label, items: [{ kind: "command", commandId: label }] }),
);
/** Uses actual label fallback. @param _id - Resource identity. @param label - Fallback. @returns Label. */
function getMenuLabel(_id: string, label: string): string {
  return label;
}
/** Exposes the actual projection without rendering a second menu state machine. @param roots - Projected roots. @returns Probe. */
function children(roots: readonly CommandMenuPlacement[]): React.JSX.Element {
  return <output data-testid="projection">{JSON.stringify(roots)}</output>;
}
afterEach(
  /** Releases real subscriptions and geometry stubs. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  },
);
it("retains unmeasured or empty sources and observes container/font extents", /** Covers actual geometry availability,source suffix references and both resize observer notifications. @returns Nothing. */ () => {
  let available = 0;
  let measured = false;
  let notify: ResizeObserverCallback;
  const observe = vi.fn(),
    disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    /** Browser geometry observer fixture. */ class {
      /** Retains browser geometry delivery. @param callback - Native observer callback. @returns Observer. */
      constructor(callback: ResizeObserverCallback) {
        notify = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    /** Supplies measured label/indicator geometry including actual4px gaps. @param this - Measured label. @returns Box. */ function (
      this: HTMLElement,
    ) {
      if (this.tagName !== "SPAN") return new DOMRect(0, 0, available, 32);
      if (!measured) return new DOMRect();
      const index = [...(this.parentElement as HTMLElement).children].indexOf(this);
      return new DOMRect(index * 64, 0, this.textContent === "»" ? 40 : 60.25, 32);
    },
  );
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
    /** Matches browser integer rounding at the fractional fit boundary. @returns Rounded width. */ () =>
      Math.round(available),
  );
  const mounted = render(
    <MenuBarOverflow menus={menus} getMenuLabel={getMenuLabel}>
      {children}
    </MenuBarOverflow>,
  );
  expect(JSON.parse(screen.getByTestId("projection").textContent as string)).toEqual(menus);
  expect(observe).toHaveBeenCalledTimes(2);
  measured = true;
  fireEvent.resize(window);
  expect(JSON.parse(screen.getByTestId("projection").textContent as string)).toEqual(menus);
  available = 150;
  act(
    /** Delivers actual native resize. @returns Nothing. */ () => notify([], {} as ResizeObserver),
  );
  const suffix = JSON.parse(screen.getByTestId("projection").textContent as string);
  expect(
    suffix.map(
      /** Reads native root identity. @param menu - Root. @returns Identity. */ (
        menu: CommandMenuPlacement,
      ) => menu.id,
    ),
  ).toEqual(["File", "office-hidden-menus"]);
  expect(suffix[1].items).toEqual(
    menus
      .slice(1)
      .map(
        /** Retains original subtree in expected suffix. @param menu - Native root. @returns Parent child. */ (
          menu,
        ) => ({ kind: "submenu", id: menu.id, label: menu.label, items: menu.items }),
      ),
  );
  fireEvent.resize(window);
  available = 40;
  fireEvent.resize(window);
  expect(JSON.parse(screen.getByTestId("projection").textContent as string)[0].items).toHaveLength(
    3,
  );
  available = 188.25;
  fireEvent.resize(window);
  expect(JSON.parse(screen.getByTestId("projection").textContent as string)).toEqual(menus);
  mounted.rerender(
    <MenuBarOverflow menus={[]} getMenuLabel={getMenuLabel}>
      {children}
    </MenuBarOverflow>,
  );
  expect(screen.getByTestId("projection")).toHaveTextContent("[]");
  mounted.unmount();
  expect(disconnect).toHaveBeenCalledTimes(2);
});
it("uses window resize and releases it when ResizeObserver is unavailable", /** Retains the browser window notification port without a polyfill. @returns Nothing. */ () => {
  vi.stubGlobal("ResizeObserver", undefined);
  const remove = vi.spyOn(window, "removeEventListener");
  const mounted = render(
    <MenuBarOverflow menus={menus} getMenuLabel={getMenuLabel}>
      {children}
    </MenuBarOverflow>,
  );
  mounted.unmount();
  expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
});
it("restores the actual saved owner before a measured root replacement removes a popup", /** Covers the menu state machine teardown used by responsive projection changes. @returns Nothing. */ () => {
  const owner = document.createElement("button");
  owner.textContent = "Owner";
  document.body.append(owner);
  owner.focus();
  const source = { CreateControllerItem: vi.fn(), Execute: vi.fn(), QueryCommand: vi.fn() };
  const mounted = render(
    <CommandMenuBar
      ariaLabel="Menus"
      idPrefix="resize-owner"
      commandSource={source}
      getCommandResource={vi.fn()}
      resolveArguments={vi.fn()}
      menus={[
        {
          id: "File",
          label: "File",
          items: [{ kind: "submenu", id: "child", label: "Child", items: [] }],
        },
      ]}
    />,
  );
  fireEvent.click(screen.getByRole("menuitem", { name: /^File$/ }));
  expect(screen.getByRole("menu")).toHaveFocus();
  mounted.unmount();
  expect(owner).toHaveFocus();
  expect(source.CreateControllerItem).not.toHaveBeenCalled();
  owner.remove();
});
