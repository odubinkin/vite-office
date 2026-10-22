/** @fileoverview Consumed native TableEditPanel toolbar composition from sidebartableedit.ui,using existing Writer table slots. */
import { useRef } from "react";
import {
  Ellipsis,
  Minimize2,
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Square,
  Rows3,
  Columns3,
  Table2,
} from "lucide-react";
import { SidebarPanel } from "../../../sfx2/browser/presentation/SidebarPanel";
import { CommandButton } from "../../../framework/browser/presentation/CommandToolbar";
import { useBrowserCommandState } from "../../../framework/browser/presentation/command-surface";
import { MetricSpinButton } from "../../../svtools/browser/control/MetricSpinButton";
import type { FieldUnit } from "../../../tools/inc/fldunit";
import { SfxUInt16Item, SfxUInt32Item, SfxInt32Item } from "../../../svl/source/items/intitem";
import {
  SID_ATTR_TABLE_ROW_HEIGHT,
  SID_ATTR_TABLE_COLUMN_WIDTH,
  SID_ATTR_TABLE_ALIGNMENT,
  SID_ATTR_TABLE_LEFT_SPACE,
  SID_ATTR_TABLE_RIGHT_SPACE,
} from "../../inc/cmdid";
import { HoriOrientation } from "../../../offapi/com/sun/star/text/HoriOrientation";
import { convert, Length } from "../../../o3tl/inc/unit_conversion";
import type {
  BrowserCommandSurfaceProps,
  BrowserCommandPresentationResource,
} from "../../../framework/browser/presentation/command-surface";

const groups = [
  {
    label: "Insert",
    commands: [
      ".uno:InsertRowsBefore",
      ".uno:InsertRowsAfter",
      ".uno:InsertColumnsBefore",
      ".uno:InsertColumnsAfter",
    ],
  },
  {
    label: "Select",
    commands: [".uno:EntireCell", ".uno:EntireRow", ".uno:EntireColumn", ".uno:SelectTable"],
  },
] as const;

const icons = {
  ".uno:InsertRowsBefore": ArrowUpToLine,
  ".uno:InsertRowsAfter": ArrowDownToLine,
  ".uno:InsertColumnsBefore": ArrowLeftToLine,
  ".uno:InsertColumnsAfter": ArrowRightToLine,
  ".uno:EntireCell": Square,
  ".uno:EntireRow": Rows3,
  ".uno:EntireColumn": Columns3,
  ".uno:SelectTable": Table2,
} as const;

/** Renders consumed native table metrics,alignment,insertion and selection;additional toolbar groups remain unported. @param props - Actual Writer frame and localization ports. @returns Contextual Table panel. */
export function TableEditPanel(
  props: BrowserCommandSurfaceProps &
    Readonly<{
      title: string;
      unit: FieldUnit;
      focusDocument?: () => void;
      getCommandResource: (url: string) => BrowserCommandPresentationResource;
    }>,
): React.JSX.Element {
  const content = useRef<HTMLDivElement>(null),
    row = useBrowserCommandState(props.commandSource, ".uno:TableRowHeight"),
    column = useBrowserCommandState(props.commandSource, ".uno:TableColumWidth"),
    align = useBrowserCommandState(props.commandSource, ".uno:TableAlignment"),
    left = useBrowserCommandState(props.commandSource, ".uno:TableLeftSpace"),
    right = useBrowserCommandState(props.commandSource, ".uno:TableRightSpace"),
    alignment = align.value instanceof SfxUInt16Item ? align.value.GetValue() : undefined,
    leftValue = left.value instanceof SfxInt32Item ? left.value.GetValue() : undefined,
    rightValue = right.value instanceof SfxInt32Item ? right.value.GetValue() : undefined;
  const options = [
    [HoriOrientation.FULL, "Automatic"],
    [HoriOrientation.LEFT, "Left"],
    [HoriOrientation.LEFT_AND_WIDTH, "From left"],
    [HoriOrientation.RIGHT, "Right"],
    [HoriOrientation.CENTER, "Center"],
    [HoriOrientation.NONE, "Manual"],
  ] as const;
  /** Reads native alignment-dependent sensitivity. @param value - Alignment. @returns Left/right admission. */
  function sensitivity(value: number | undefined): readonly [boolean, boolean] {
    return [
      value !== HoriOrientation.FULL && value !== HoriOrientation.LEFT,
      value !== HoriOrientation.FULL &&
        value !== HoriOrientation.RIGHT &&
        value !== HoriOrientation.CENTER &&
        value !== HoriOrientation.LEFT_AND_WIDTH,
    ];
  }
  /** Sends the original AlignmentModify three-item request. @param value - Alignment. @param changed - Alignment selector changed. @param l - Accepted left. @param r - Accepted right. @returns Nothing. */
  function changeAlignment(
    value: number,
    changed: boolean,
    l = leftValue ?? 0,
    r = rightValue ?? 0,
  ): void {
    if (changed) {
      if (value === HoriOrientation.CENTER) l = r = Math.trunc((l + r) / 2);
      else if (value === HoriOrientation.LEFT) {
        r += l;
        l = 0;
      } else if (value === HoriOrientation.RIGHT) {
        l += r;
        r = 0;
      } else {
        const enabled = sensitivity(value);
        if (!enabled[0]) l = 0;
        if (!enabled[1]) r = 0;
      }
    }
    props.commandSource.Execute(".uno:TableAlignment", [
      new SfxUInt16Item(SID_ATTR_TABLE_ALIGNMENT, value),
      new SfxInt32Item(SID_ATTR_TABLE_LEFT_SPACE, l),
      new SfxInt32Item(SID_ATTR_TABLE_RIGHT_SPACE, r),
    ]);
  }
  const spacingMaximum = Number(convert(99990n, Length.mm100, Length.twip));
  return (
    <SidebarPanel
      title={props.title}
      focusDocument={props.focusDocument}
      focusContent={
        /** Enters the first eligible table command. @returns Nothing. */ () =>
          content.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus()
      }
      moreOptions={<CommandButton {...props} commandId=".uno:TableDialog" icon={Ellipsis} />}
    >
      <div ref={content} className="space-y-2 py-2">
        <div className="grid grid-cols-2 gap-2">
          {groups.map(
            /** Projects ordered source toolbar groups. @param group - Native group. @returns Actual controls. */ (
              group,
            ) => (
              <div
                key={group.label}
                role="group"
                aria-label={group.label}
                className="flex flex-wrap gap-0.5"
              >
                <span className="w-full text-xs">{group.label}:</span>
                {group.commands.map(
                  /** Binds an existing native table command. @param command - Slot URL. @returns Command control. */ (
                    command,
                  ) => (
                    <CommandButton
                      {...props}
                      className="grid size-5 shrink-0 place-items-center rounded text-slate-700 hover:bg-indigo-50 disabled:opacity-50 [&_svg]:size-4"
                      commandId={command}
                      key={command}
                      icon={icons[command]}
                    />
                  ),
                )}
              </div>
            ),
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              label: "Row height",
              state: row,
              url: ".uno:TableRowHeight",
              which: SID_ATTR_TABLE_ROW_HEIGHT,
            },
            {
              label: "Column width",
              state: column,
              url: ".uno:TableColumWidth",
              which: SID_ATTR_TABLE_COLUMN_WIDTH,
            },
          ].map(
            /** Connects native row/column metric items. @param entry - Slot binding. @returns Metric control. */
            (entry) => (
              <label key={entry.url} className="grid min-w-0 gap-1 text-xs">
                {entry.label}:
                <MetricSpinButton
                  aria-label={entry.label}
                  className="w-full min-w-0 rounded border border-slate-300 px-1 text-sm"
                  value={
                    entry.state.value instanceof SfxUInt32Item
                      ? entry.state.value.GetValue()
                      : undefined
                  }
                  unit={props.unit}
                  minimum={23}
                  maximum={2147483647}
                  disabled={!entry.state.enabled || entry.state.pending === true}
                  onValueChange={
                    /** Executes the original unsigned metric item. @param value - Twips. @returns Nothing. */
                    (value) => {
                      props.commandSource.Execute(entry.url, [
                        new SfxUInt32Item(entry.which, value),
                      ]);
                    }
                  }
                />
              </label>
            ),
          )}
        </div>
        <div role="group" aria-label="Row sizing" className="flex gap-0.5">
          <CommandButton
            {...props}
            commandId=".uno:SetMinimalRowHeight"
            icon={Minimize2}
            className="grid size-5 shrink-0 place-items-center rounded text-slate-700 hover:bg-indigo-50 disabled:opacity-50 [&_svg]:size-4"
          />
        </div>
        <label className="grid gap-1 text-xs">
          Alignment:
          <select
            aria-label="Table alignment"
            className="min-w-0 rounded border border-slate-300 text-sm"
            value={alignment ?? ""}
            disabled={!align.enabled || align.pending === true}
            onChange={
              /** Applies native alignment conversion. @param event - Selected native ID. @returns Nothing. */
              (event) => changeAlignment(Number(event.target.value), true)
            }
          >
            {alignment === undefined && <option value="" />}
            {options.map(
              /** Preserves native list order and numeric identities. @param option - Native option. @returns Entry. */
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Left spacing", state: left, value: leftValue },
            { label: "Right spacing", state: right, value: rightValue },
          ].map(
            /** Binds exact native spacing sensitivity and saved-value edits. @param entry - State. @param index - Native side. @returns Control. */
            (entry, index) => (
              <label key={entry.label} className="grid min-w-0 gap-1 text-xs">
                {entry.label}:
                <MetricSpinButton
                  aria-label={entry.label}
                  className="w-full min-w-0 rounded border border-slate-300 px-1 text-sm"
                  value={entry.value}
                  unit={props.unit}
                  minimum={-spacingMaximum}
                  maximum={spacingMaximum}
                  disabled={
                    !entry.state.enabled ||
                    entry.state.pending === true ||
                    !sensitivity(alignment)[index]
                  }
                  onValueChange={
                    /** Skips unchanged saved values and dispatches alignment. @param value - Twips. @returns Nothing. */
                    (value) => {
                      if (value !== entry.value)
                        changeAlignment(
                          alignment ?? 0,
                          false,
                          index === 0 ? value : (leftValue ?? 0),
                          index === 1 ? value : (rightValue ?? 0),
                        );
                    }
                  }
                />
              </label>
            ),
          )}
        </div>
      </div>
    </SidebarPanel>
  );
}
