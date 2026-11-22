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
  readonly showsDialog?: boolean;
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
      const resource = generated.commands[commandId as keyof typeof generated.commands];
      const target = "targetUrl" in resource ? resource.targetUrl : undefined;
      return {
        kind: "command",
        commandId: target ?? commandId,
        label: node.label ?? (target ? resource.label : undefined),
        showsDialog: node.showsDialog ?? resource.showsDialog,
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
/** Metadata shared by direct commands and source dispatch redirects. */
const calcCommandResources: Readonly<
  Record<string, MenuCommandResource & { popupLabel?: string; targetUrl?: string }>
> = generated.commands as typeof calcCommandResources;
const calcTargetResources = new Map<string, (typeof calcCommandResources)[string]>();
for (const resource of Object.values(calcCommandResources)) {
  if (resource.targetUrl !== undefined) calcTargetResources.set(resource.targetUrl, resource);
}
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
  const resource = calcCommandResources[url] ?? calcTargetResources.get(url);
  if (resource === undefined) throw new Error(`Unknown Calc command resource: ${url}`);
  return {
    label: (popup ? (resource.popupLabel ?? resource.label) : resource.label).replaceAll(
      "%PRODUCTNAME",
      "Vite Office",
    ),
    semantics: resource.semantics as MenuCommandResource["semantics"],
    shortcuts: resource.shortcuts,
  };
}
