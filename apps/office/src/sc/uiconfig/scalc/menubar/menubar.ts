/** @fileoverview Consumed native Calc File/Edit placements from scalc/menubar.xml and English command resources;remaining native menu breadth follows separately. */
import type {
  CommandMenuPlacement,
  MenuCommandResource,
} from "../../../../framework/browser/presentation/CommandMenuBar";
import { normalizeCommandShortcut } from "../../../../framework/browser/accelerators/keymapping";
import { calcFileCommands, calcEditCommands } from "../../../sdi/scalc";
/** Native File/Edit order restricted to implemented current-core commands;browser save policy matches Writer. */
export const calcMenus: readonly CommandMenuPlacement[] = [
  {
    id: ".uno:PickList",
    label: "File",
    items: calcFileCommands.map(
      /** Places source dialog commands in upstream File order. @param item - SDI resource. @returns Placement. */ (
        item,
      ) => ({ kind: "command", commandId: item.id, showsDialog: true }),
    ),
  },
  {
    id: ".uno:EditMenu",
    label: "Edit",
    items: calcEditCommands.map(
      /** Places actual history operations. @param item - SDI resource. @returns Placement. */ (
        item,
      ) => ({ kind: "command", commandId: item.id }),
    ),
  },
];
/** Reads labels and shortcuts from consumed source command resources. @param url - Command URL. @returns Menu/toolbar resource. */
export function getCalcCommandResource(url: string): MenuCommandResource {
  const file = calcFileCommands.find(
    /** Matches original command identity. @param resource - Resource. @returns Matching. */ (
      resource,
    ) => resource.id === url,
  );
  if (file)
    return {
      label: file.label,
      semantics: "action",
      shortcuts: file.shortcuts.map(normalizeCommandShortcut),
    };
  const edit = calcEditCommands.find(
    /** Matches original history identity. @param resource - Resource. @returns Matching. */ (
      resource,
    ) => resource.id === url,
  );
  if (!edit) throw new Error(`Unknown Calc command resource: ${url}`);
  return {
    label: edit.label,
    semantics: "action",
    shortcuts: [normalizeCommandShortcut(edit.shortcut)],
  };
}
