/** @fileoverview Source-generated Calc menubar projection using shared Writer/Calc presentation contracts. */
import type {
  CommandMenuPlacement,
  CommandMenuItemPlacement,
  MenuCommandResource,
} from "../../../../framework/browser/presentation/CommandMenuBar";
import generated from "../calc-ui.generated.json" with { type: "json" };
/** Immutable generated source graph alternatives consumed by browser placement adapters. */
interface ResourceNode {
  readonly kind: string;
  readonly id?: string;
  readonly label?: string;
  readonly commandUrl?: string;
  readonly visible?: boolean;
  readonly items?: readonly ResourceNode[];
}
/** Projects original nested menu order with source identities kept literal. @param nodes - Generated source nodes. @returns Shared menu placements. */
function adaptItems(nodes: readonly ResourceNode[]): CommandMenuItemPlacement[] {
  return nodes.map(
    /** Converts one native resource node without inventing commands. @param node - Source. @returns Shared placement. */ (
      node,
    ) => {
      if (node.kind === "separator") return { kind: "separator" };
      if (node.kind === "menu")
        return {
          kind: "submenu",
          id: node.id as string,
          label: node.label as string,
          items: adaptItems(node.items as readonly ResourceNode[]),
        };
      const commandId = node.commandUrl as string;
      return {
        kind: "command",
        commandId,
        showsDialog: generated.commands[commandId as keyof typeof generated.commands].showsDialog,
      };
    },
  );
}
/** Native complete menubar excluding only explicit shared Writer browser-policy dispositions. */
export const calcMenus: readonly CommandMenuPlacement[] = (
  generated.surfaces.menubar as readonly ResourceNode[]
).map(
  /** Adapts one generated native top menu. @param menu - Source. @returns Placement. */ (
    menu,
  ) => ({
    id: menu.id as string,
    label: menu.label as string,
    items: adaptItems(menu.items as readonly ResourceNode[]),
  }),
);
/** Reads source labels,default accelerators and toggle properties;unregistered commands stay disabled in shared Sfx bindings. @param url - Original identity. @returns Resource. */
export function getCalcCommandResource(url: string): MenuCommandResource {
  return selectCalcResource(url, false);
}
/** Selects native popup-specific command labels with source fallback. @param url - Original command. @returns Popup presentation. */
export function getCalcPopupCommandResource(url: string): MenuCommandResource {
  return selectCalcResource(url, true);
}
/** Reads one source resource without guessing labels. @param url - Original identity. @param popup - Whether PopupLabel applies. @returns Presentation. */
function selectCalcResource(url: string, popup: boolean): MenuCommandResource {
  const resource = (
    generated.commands as Readonly<
      Record<
        string,
        Readonly<{
          label: string;
          popupLabel?: string;
          semantics: string;
          shortcuts: readonly string[];
        }>
      >
    >
  )[url];
  if (resource === undefined) throw new Error(`Unknown Calc command resource: ${url}`);
  return {
    label: (popup ? (resource.popupLabel ?? resource.label) : resource.label).replaceAll(
      "%PRODUCTNAME",
      "Vite Office",
    ),
    semantics: resource.semantics as "action" | "check",
    shortcuts: resource.shortcuts,
  };
}
