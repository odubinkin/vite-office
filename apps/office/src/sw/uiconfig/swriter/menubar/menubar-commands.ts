/** @fileoverview Adapts the generated pinned Writer menubar graph to presentation types. */

import { WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import type { WriterMenuItemPlacement, WriterMenuPlacement } from "../ui-resource";
import { getWriterCommandResource } from "../writer-command-resources";
import generated from "../writer-ui.generated.json" with { type: "json" };

/** All stable supported command aliases are generated from the one resource manifest. */
export const WRITER_COMMAND_IDS = generated.commandAliases;

/** Creates a stable parameterized StyleApply URL. @param styleId - Model style ID. @returns Command URL. */
export function getWriterParagraphStyleCommandId(styleId: string): string {
  const style = WRITER_PARAGRAPH_STYLE_POOL.find(
    /** Matches a Writer style identity. @param candidate - Pool style. @returns Whether IDs match. */ (
      candidate,
    ) => candidate.id === styleId,
  );
  if (style === undefined) throw new Error(`Unknown Writer paragraph style: ${styleId}`);
  const programmaticName = style.name === "Standard" ? "Default Paragraph Style" : style.name;
  return `${WRITER_COMMAND_IDS.styleApply}?Style:string=${encodeURIComponent(programmaticName)}&FamilyName:string=ParagraphStyles`;
}

/** Inventory projection generated from the supported command manifest. */
export const writerUserCommands: readonly Readonly<{
  capabilityId: `CAP-${string}`;
  id: string;
  label: string;
}>[] = generated.commandInventory.map(
  /** Projects one generated inventory record. @param record - Generated capability mapping. @returns Public inventory entry. */ ({
    capabilityId,
    commandUrl,
  }) => ({
    capabilityId: capabilityId as `CAP-${string}`,
    id: commandUrl,
    label: getWriterCommandResource(commandUrl).label,
  }),
);

/** Structural view of recursive nodes inferred too broadly from generated JSON. */
type GeneratedMenuNode =
  | Readonly<{ kind: "command"; commandUrl: string }>
  | Readonly<{ kind: "separator" }>
  | GeneratedMenu;

/** One generated recursive menu. */
interface GeneratedMenu {
  readonly id: string;
  readonly items: readonly GeneratedMenuNode[];
  readonly kind: "menu";
  readonly label: string;
}

const generatedMenubar = generated.surfaces.menubar as unknown as readonly GeneratedMenu[];

/** Converts generated resource nodes and expands the bounded StyleApply collection. @param nodes - Generated nodes. @returns Presentation placements. */
function adaptItems(nodes: readonly GeneratedMenuNode[]): readonly WriterMenuItemPlacement[] {
  return nodes.flatMap(
    /** Adapts one generated menu node. @param node - Generated node. @returns Presentation placements. */ (
      node,
    ): readonly WriterMenuItemPlacement[] => {
      if (node.kind === "separator") return [{ kind: "separator" }];
      if (node.kind === "command") {
        const commandUrl = node.commandUrl;
        if (commandUrl === WRITER_COMMAND_IDS.styleApply)
          return WRITER_PARAGRAPH_STYLE_POOL.map(
            /** Expands one style. @param style - Pool style. @returns Parameterized placement. */ (
              style,
            ) => ({
              commandId: getWriterParagraphStyleCommandId(style.id),
              kind: "command" as const,
            }),
          );
        const resource = getWriterCommandResource(commandUrl);
        return [
          {
            commandId: commandUrl,
            kind: "command",
            ...(resource.showsDialog ? { showsDialog: true } : {}),
          },
        ];
      }
      return [
        {
          id: resourceId(node.id),
          items: adaptItems(node.items),
          kind: "submenu",
          label: node.label,
        },
      ];
    },
  );
}

/** Converts an upstream URL into a stable DOM-safe presentation key. @param value - Resource URL. @returns DOM key. */
function resourceId(value: string): string {
  return value
    .replace(/^\.uno:/, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();
}

/** Complete supported menubar, filtered and ordered by the generated upstream graph. */
export const writerMenuPlacements: readonly WriterMenuPlacement[] = generatedMenubar.map(
  /** Adapts one generated top-level menu. @param menu - Generated menu. @returns Presentation menu. */ (
    menu,
  ) => {
    return {
      id: resourceId(menu.id),
      items: adaptItems(menu.items),
      label: menu.label,
    };
  },
);

/** Collects nested command IDs in generated resource order. @param items - Menu items. @returns Command IDs. */
function collectCommandIds(items: WriterMenuPlacement["items"]): string[] {
  return items.flatMap(
    /** Collects one menu node. @param item - Menu item. @returns Nested command IDs. */ (
      item,
    ): string[] =>
      item.kind === "command"
        ? [item.commandId]
        : item.kind === "submenu"
          ? collectCommandIds(item.items)
          : [],
  );
}

export const writerMenuCommandIds = writerMenuPlacements.flatMap(
  /** Collects one generated menu. @param menu - Menu placement. @returns Command IDs. */ (menu) =>
    collectCommandIds(menu.items),
);
