/** @fileoverview Consumed Writer Paragraph panel bindings and native fresh-item edit contracts from ParaPropertyPanel.cxx. */
import { useRef, type ReactNode } from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  ListX,
  IndentIncrease,
  Outdent,
} from "lucide-react";
import { SidebarPanel } from "../../../../sfx2/browser/presentation/SidebarPanel";
import { MetricSpinButton } from "../../../../svtools/browser/control/MetricSpinButton";
import { CommandButton } from "../../../../framework/browser/presentation/CommandToolbar";
import {
  useBrowserCommandState,
  type BrowserCommandSurfaceProps,
  type BrowserCommandPresentationResource,
} from "../../../../framework/browser/presentation/command-surface";
import { SvxIndentValue, SvxLRSpaceItem } from "../../../../editeng/inc/lrspitem";
import { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { SID_ATTR_PARA_LRSPACE, SID_ATTR_PARA_ULSPACE } from "../../../../editeng/inc/editids";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import type { FieldUnit } from "../../../../tools/inc/fldunit";

const alignments = [
  { command: ".uno:StartPara", icon: AlignLeft },
  { command: ".uno:CenterPara", icon: AlignCenter },
  { command: ".uno:EndPara", icon: AlignRight },
  { command: ".uno:JustifyPara", icon: AlignJustify },
] as const;
const lists = [
  { command: ".uno:DefaultBullet", icon: List },
  { command: ".uno:DefaultNumbering", icon: ListOrdered },
  { command: ".uno:RemoveBullets", icon: ListX },
] as const;
const indents = [
  { command: ".uno:IncrementIndent", icon: IndentIncrease },
  { command: ".uno:DecrementIndent", icon: Outdent },
] as const;

/** Consumed Writer text/table context and actual command/resource ports. */
export interface ParaPropertyPanelProps extends BrowserCommandSurfaceProps {
  readonly title: string;
  readonly unit: FieldUnit;
  readonly focusDocument?: () => void;
  readonly moreOptions: ReactNode;
  readonly lineSpacing: ReactNode;
  readonly getCommandResource: (url: string) => BrowserCommandPresentationResource;
}

/** Renders supported source toolbar groups and five native metric fields;hyphenation/background/writing-direction services remain unported. @param props - Frame bindings,unit and composed commands. @returns Paragraph panel. */
export function ParaPropertyPanel(props: ParaPropertyPanelProps): React.JSX.Element {
  const content = useRef<HTMLDivElement>(null),
    lrState = useBrowserCommandState(props.commandSource, ".uno:LeftRightParaMargin"),
    ulState = useBrowserCommandState(props.commandSource, ".uno:ULSpacing"),
    lr = lrState.value as SvxLRSpaceItem | undefined,
    ul = ulState.value as SvxULSpaceItem | undefined,
    left = lr?.ResolveTextLeft(),
    right = lr?.ResolveRight(),
    first = lr?.ResolveTextFirstLineOffset(),
    upper = ul?.GetUpper(),
    lower = ul?.GetLower();

  /** Executes source ModifyIndentHdl_Impl's fresh combined item. @param index - Changed native field. @param value - Accepted twips. @returns Nothing. */
  function changeIndent(index: number, value: number): void {
    const values = [left ?? 0, right ?? 0, first ?? 0],
      item = new SvxLRSpaceItem(SID_ATTR_PARA_LRSPACE);
    values[index] = value;
    item.SetTextLeft(SvxIndentValue.twips(values[0] as number));
    item.SetRight(SvxIndentValue.twips(values[1] as number));
    item.SetTextFirstLineOffset(SvxIndentValue.twips(values[2] as number));
    props.commandSource.Execute(".uno:LeftRightParaMargin", [item]);
  }

  /** Executes source ULSpaceHdl_Impl's fresh item,including reset contextual/proportion defaults. @param index - Changed native field. @param value - Accepted twips. @returns Nothing. */
  function changeSpacing(index: number, value: number): void {
    const item = new SvxULSpaceItem(SID_ATTR_PARA_ULSPACE);
    item.SetUpper(index === 0 ? value : (upper ?? 0));
    item.SetLower(index === 1 ? value : (lower ?? 0));
    props.commandSource.Execute(".uno:ULSpacing", [item]);
  }

  /** Converts native mm100 bounds to the physical widget boundary. @param value - Native bound. @returns Integral twips. */
  function bound(value: number): number {
    return Number(convert(BigInt(value), Length.mm100, Length.twip));
  }
  /** Renders an existing source toolbar group. @param entries - Ordered native commands. @param label - Accessible toolbar label. @returns Bound controls. */
  function toolbar(
    entries: readonly { readonly command: string; readonly icon: typeof AlignLeft }[],
    label: string,
  ): ReactNode {
    return (
      <div role="group" aria-label={label} className="flex flex-wrap gap-1">
        {entries.map(
          /** Connects one native toolbar placement. @param entry - Native identity and icon. @returns Bound command. */ (
            entry,
          ) => (
            <CommandButton
              key={entry.command}
              {...props}
              commandId={entry.command}
              icon={entry.icon}
            />
          ),
        )}
      </div>
    );
  }
  const leftMM = Number(convert(BigInt(left ?? 0), Length.twip, Length.mm100)),
    rightMM = Number(convert(BigInt(right ?? 0), Length.twip, Length.mm100));
  return (
    <SidebarPanel
      title={props.title}
      focusDocument={props.focusDocument}
      moreOptions={props.moreOptions}
      focusContent={
        /** Enters the first eligible actual paragraph widget. @returns Nothing. */ () =>
          content.current?.querySelector<HTMLButtonElement>("button:not(:disabled)")?.focus()
      }
    >
      <div className="space-y-2 py-2" ref={content}>
        {toolbar(alignments, "Horizontal Alignment")}
        {toolbar(lists, "Bullets and Numbering")}
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs">Spacing:</span>
          {props.lineSpacing}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {["Above Paragraph Spacing", "Below Paragraph Spacing"].map(
            /** Projects the source upper/lower spacing entries. @param label - Native tooltip label. @param index - Native field. @returns Metric entry. */ (
              label,
              index,
            ) => (
              <MetricSpinButton
                key={label}
                aria-label={label}
                title={label}
                className="w-full min-w-0 rounded border border-slate-300 px-1 text-sm"
                value={index === 0 ? upper : lower}
                unit={props.unit}
                maximum={31680}
                disabled={!ulState.enabled || ulState.pending === true}
                onValueChange={
                  /** Dispatches the changed spacing field. @param value - Physical twips. @returns Nothing. */ (
                    value,
                  ) => changeSpacing(index, value)
                }
              />
            ),
          )}
        </div>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs">Indent:</span>
          {toolbar(indents, "Indent")}
        </div>
        <div className="grid grid-cols-2 gap-1">
          {["Before Text Indent", "After Text Indent", "First Line Indent"].map(
            /** Projects the three native indent fields and Writer-specific bounds. @param label - Source tooltip label. @param index - Native field. @returns Metric entry. */ (
              label,
              index,
            ) => (
              <MetricSpinButton
                key={label}
                aria-label={label}
                title={label}
                className="w-full min-w-0 rounded border border-slate-300 px-1 text-sm"
                value={[left, right, first][index]}
                unit={props.unit}
                minimum={bound(-10000000)}
                maximum={bound(
                  1709400 - (index === 0 ? rightMM : index === 1 ? leftMM : leftMM + rightMM),
                )}
                disabled={!lrState.enabled || lrState.pending === true}
                onValueChange={
                  /** Dispatches one changed native indent. @param value - Physical twips. @returns Nothing. */ (
                    value,
                  ) => changeIndent(index, value)
                }
              />
            ),
          )}
        </div>
      </div>
    </SidebarPanel>
  );
}
