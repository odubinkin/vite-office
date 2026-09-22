/**
 * @fileoverview Displays focused paragraph formatting in the browser Properties panel without
 * claiming LibreOffice Writer Inspector ownership.
 */

import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { CommandButton } from "../../../framework/browser/presentation/CommandToolbar";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  List,
  ListOrdered,
  ListX,
  type LucideIcon,
} from "lucide-react";
import type { WriterParagraphListKind } from "../../source/core/doc/list";
import type { WriterParagraphAlignment } from "../../source/core/txtnode/ndtxt";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";

const alignmentLabels: Readonly<Record<WriterParagraphAlignment, string>> = {
  center: "Centered",
  justify: "Justified",
  left: "Left",
  right: "Right",
};

const listLabels: Readonly<Record<WriterParagraphListKind, string>> = {
  bullet: "Unordered List",
  none: "No List",
  numbered: "Ordered List",
};

const sidebarIcons: Readonly<Record<string, LucideIcon>> = {
  [WRITER_COMMAND_IDS.alignLeft]: AlignLeft,
  [WRITER_COMMAND_IDS.alignCenter]: AlignCenter,
  [WRITER_COMMAND_IDS.alignRight]: AlignRight,
  [WRITER_COMMAND_IDS.alignJustify]: AlignJustify,
  [WRITER_COMMAND_IDS.removeBullets]: ListX,
  [WRITER_COMMAND_IDS.unorderedList]: List,
  [WRITER_COMMAND_IDS.orderedList]: ListOrdered,
};

/** Resolves the required icon for one fixed sidebar command placement. */
function getSidebarIcon(commandId: string): LucideIcon {
  const icon = sidebarIcons[commandId];
  if (icon === undefined) throw new Error(`Writer sidebar icon is missing for ${commandId}.`);
  return icon;
}

/** Defines the focused paragraph details rendered by the Writer properties sidebar. */
export interface WriterParagraphPropertiesProps extends BrowserCommandSurfaceProps {
  readonly alignment: WriterParagraphAlignment;
  readonly listKind: WriterParagraphListKind;
  /** One-based document position of the focused Writer paragraph. */
  readonly paragraphNumber: number;
  readonly styleDisplayName: string;
}

/**
 * Renders focused paragraph formatting feedback in the Writer properties sidebar.
 *
 * @param props - Immutable selected paragraph information supplied by the Writer workbench.
 * @param props.alignment - Current paragraph alignment.
 * @param props.commandSource - Active bindings-backed command source.
 * @param props.listKind - Current paragraph list kind.
 * @param props.paragraphNumber - One-based visible position for the active paragraph.
 * @param props.resolveArguments - Browser argument adapter.
 * @param props.styleDisplayName - Current paragraph style display name.
 * @returns A command- and bindings-backed paragraph sidebar.
 */
export function WriterParagraphProperties({
  alignment,
  commandSource,
  listKind,
  paragraphNumber,
  resolveArguments,
  styleDisplayName,
}: WriterParagraphPropertiesProps): React.JSX.Element {
  const localization = useBrowserLocalization();
  const getCommandResource =
    /** Localizes one generated sidebar command. @param commandUrl - Command URL. @returns Localized resource. */ (
      commandUrl: string,
    ) => {
      const resource = getWriterCommandResource(commandUrl);
      return {
        ...resource,
        label: `Properties: ${localization.GetText(`writer.command.${commandUrl}.label`, resource.label)}`,
      };
    };
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
        {localization.GetText("writer.properties.title", "Properties")}
      </p>
      <h2 className="mt-1 text-base font-bold text-slate-950">
        {localization.GetText("writer.properties.paragraph", "Paragraph")}
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        {localization.GetText(
          "writer.properties.active-paragraph",
          "Paragraph {number} is active.",
          { number: paragraphNumber },
        )}
      </p>
      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {localization.GetText("writer.properties.alignment", "Alignment")}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">
          {localization.GetText(`writer.alignment.${alignment}`, alignmentLabels[alignment])}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            WRITER_COMMAND_IDS.alignLeft,
            WRITER_COMMAND_IDS.alignCenter,
            WRITER_COMMAND_IDS.alignRight,
            WRITER_COMMAND_IDS.alignJustify,
          ].map(
            /** Renders one alignment command. @param commandId - Generated command URL. @returns Command button. */ (
              commandId,
            ) => (
              <CommandButton
                commandId={commandId}
                commandSource={commandSource}
                getCommandResource={getCommandResource}
                icon={getSidebarIcon(commandId)}
                key={commandId}
                resolveArguments={resolveArguments}
              />
            ),
          )}
        </div>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {localization.GetText("writer.properties.style", "Style")}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">{styleDisplayName}</p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {localization.GetText("writer.properties.list", "List")}
        </p>
        <p className="mt-1 text-sm font-bold text-slate-900">
          {localization.GetText(`writer.list.${listKind}`, listLabels[listKind])}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {[
            WRITER_COMMAND_IDS.removeBullets,
            WRITER_COMMAND_IDS.unorderedList,
            WRITER_COMMAND_IDS.orderedList,
          ].map(
            /** Renders one list command. @param commandId - Generated command URL. @returns Command button. */ (
              commandId,
            ) => (
              <CommandButton
                commandId={commandId}
                commandSource={commandSource}
                getCommandResource={getCommandResource}
                icon={getSidebarIcon(commandId)}
                key={commandId}
                resolveArguments={resolveArguments}
              />
            ),
          )}
        </div>
      </div>
    </>
  );
}
