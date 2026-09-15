/** @fileoverview Loads deterministic Writer command resources generated from pinned LibreOffice XML/XCU files. */

import { WRITER_PARAGRAPH_STYLE_POOL } from "../../inc/poolfmt";
import generated from "./writer-ui.generated.json" with { type: "json" };

/** Presentation metadata owned by generated UI resources rather than Writer shells or React. */
export interface WriterCommandResource {
  readonly browserOwned: boolean;
  readonly capabilityId?: `CAP-${string}`;
  readonly controlLabel: string;
  readonly label: string;
  readonly placements: readonly string[];
  readonly selectionValue?: string;
  readonly semantics: "action" | "check" | "radio";
  readonly showsDialog: boolean;
  readonly shortcuts: readonly string[];
}

/** Resolves generated metadata, including parameterized StyleApply URLs. @param commandUrl - Canonical URL. @returns Resource metadata. */
export function getWriterCommandResource(commandUrl: string): WriterCommandResource {
  const direct = generated.commands[commandUrl as keyof typeof generated.commands];
  if (direct !== undefined) return direct as WriterCommandResource;
  if (commandUrl.startsWith(`${generated.commandAliases.styleApply}?`)) {
    const parameters = new URLSearchParams(commandUrl.slice(commandUrl.indexOf("?") + 1));
    const label = parameters.get("Style:string");
    const style = WRITER_PARAGRAPH_STYLE_POOL.find(
      /** Matches a style's upstream programmatic name. @param candidate - Supported style. @returns Whether names match. */
      (candidate) =>
        (candidate.name === "Standard" ? "Default Paragraph Style" : candidate.name) === label,
    );
    if (style !== undefined)
      return {
        browserOwned: false,
        capabilityId: "CAP-0112",
        controlLabel: label as string,
        label: label as string,
        placements: ["sw/uiconfig/swriter/toolbar/textobjectbar.xml"],
        selectionValue: style.id,
        semantics: "radio",
        showsDialog: false,
        shortcuts: [],
      };
  }
  throw new Error(`Missing generated Writer command resource: ${commandUrl}`);
}

/** Upstream resource entries excluded from the supported browser slice (divergence class X). */
export const WRITER_FILTERED_X_COMMANDS = generated.unsupported;
