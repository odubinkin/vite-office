/** @fileoverview Native Outline & List exchange for Writer's paragraph dialog. */
import { useState } from "react";
import { SfxBoolItem } from "../../../svl/inc/eitem";
import { SfxInt16Item, SfxUInt16Item } from "../../../svl/inc/intitem";
import type { SfxItemSet } from "../../../svl/inc/itemset";
import { FN_NUMBER_NEWSTART, FN_NUMBER_NEWSTART_AT } from "../../inc/cmdid";
import {
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_NUMRULE,
  RES_PARATR_OUTLINELEVEL,
} from "../../inc/hintids";
import { WRITER_MAX_LIST_LEVEL } from "../../source/core/doc/list";
import { SwNumRuleItem } from "../../source/core/para/paratr";

const styleDefaultStart = 0xffff;
const maximumStart = 9999;
const levels = Array.from(
  { length: WRITER_MAX_LIST_LEVEL + 1 },
  /** Maps the one-based level. @param unused - Empty entry. @param index - Zero-based level. @returns Displayed level. */ (
    unused,
    index,
  ) => {
    void unused;
    return index + 1;
  },
);

/** Exchanges the outline, numbering style, list level and restart fields. @param props - Native set and dialog population. @returns Paragraph outline and list page. */
export function WriterParagraphOutlinePage({
  input,
  output,
  label,
  listStyleNames = [],
  outlineLocked = false,
}: Readonly<{
  input: SfxItemSet;
  output: SfxItemSet;
  label: (key: string, fallback: string) => string;
  listStyleNames?: readonly string[];
  outlineLocked?: boolean;
}>): React.JSX.Element {
  const originalOutline = input.GetItem(RES_PARATR_OUTLINELEVEL);
  const originalLevel = input.GetItem(RES_PARATR_LIST_LEVEL);
  const originalStyle = input.GetItem(RES_PARATR_NUMRULE);
  const originalRestart = input.GetItemIfSet(FN_NUMBER_NEWSTART, false);
  const originalStart = input.GetItemIfSet(FN_NUMBER_NEWSTART_AT, false);
  const outlineValue =
    originalOutline instanceof SfxUInt16Item ? originalOutline.GetValue() : undefined;
  const listLevel = originalLevel instanceof SfxInt16Item ? originalLevel.GetValue() : undefined;
  const listChoice =
    listLevel === undefined
      ? undefined
      : listLevel === Math.max(1, outlineValue ?? 1) - 1
        ? 0
        : listLevel + 1;
  const initialStyle =
    originalStyle instanceof SwNumRuleItem ? originalStyle.GetValue() : undefined;
  const initialRestart =
    originalRestart instanceof SfxBoolItem ? originalRestart.GetValue() : false;
  const initialStart =
    originalStart instanceof SfxUInt16Item ? originalStart.GetValue() : styleDefaultStart;
  const [outline, setOutline] = useState(outlineValue);
  const [list, setList] = useState(listChoice);
  const [style, setStyle] = useState(initialStyle);
  const [restart, setRestart] = useState(initialRestart);
  const [explicitStart, setExplicitStart] = useState(initialStart !== styleDefaultStart);
  const [start, setStart] = useState(
    initialStart === styleDefaultStart ? 1 : Math.min(initialStart, maximumStart),
  );
  const hasStyle = style !== undefined && style !== "";
  const isKnownStyle =
    style === "" || style === "Outline" || (style !== undefined && listStyleNames.includes(style));

  /** Updates native list-level synchronization while keeping a distinct display choice. @param nextList - One-based list level or zero for synchronized. @param nextOutline - One-based outline level or zero. @param nextStyle - Selected rule name. @returns Nothing. */
  function writeLevel(
    nextList: number | undefined,
    nextOutline: number | undefined,
    nextStyle: string | undefined,
  ): void {
    if (nextList === undefined || !nextStyle) {
      output.ClearItem(RES_PARATR_LIST_LEVEL);
      return;
    }
    const value = (nextList || Math.max(1, nextOutline ?? 1)) - 1;
    if (value === listLevel) output.ClearItem(RES_PARATR_LIST_LEVEL);
    else output.Put(new SfxInt16Item(RES_PARATR_LIST_LEVEL, value));
  }

  /** Writes the two native restart slots together. @param enabled - Restart flag. @param explicit - Whether to use an explicit value. @param value - Start value. @returns Nothing. */
  function writeRestart(enabled: boolean, explicit: boolean, value: number): void {
    const startAt = enabled && explicit ? value : styleDefaultStart;
    if (enabled === initialRestart && startAt === initialStart) {
      output.ClearItem(FN_NUMBER_NEWSTART);
      output.ClearItem(FN_NUMBER_NEWSTART_AT);
      return;
    }
    output.Put(new SfxBoolItem(FN_NUMBER_NEWSTART, enabled));
    output.Put(new SfxUInt16Item(FN_NUMBER_NEWSTART_AT, startAt));
  }

  return (
    <div className="grid gap-3">
      <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
        <legend>{label("outline", "Outline")}</legend>
        <label className="grid gap-1 text-sm">
          {label("outline-level", "Outline level")}
          <select
            className="rounded border border-slate-400 p-1"
            value={outline ?? ""}
            disabled={outlineLocked}
            onChange={
              /** Changes the native outline level. @param event - Selected row. @returns Nothing. */
              (event) => {
                const value = Number(event.currentTarget.value);
                setOutline(value);
                if (value === outlineValue) output.ClearItem(RES_PARATR_OUTLINELEVEL);
                else output.Put(new SfxUInt16Item(RES_PARATR_OUTLINELEVEL, value));
                writeLevel(list, value, style);
              }
            }
          >
            {outline === undefined && <option value="" disabled />}
            <option value="0">{label("no-outline", "[None]")}</option>
            {levels.map(
              /** Provides one outline level. @param level - One-based index. @returns Option. */
              (level) => (
                <option key={level} value={level}>
                  {label(`level.${level}`, `Level ${level}`)}
                </option>
              ),
            )}
          </select>
        </label>
      </fieldset>
      <fieldset className="grid gap-2 rounded border border-slate-200 p-2">
        <legend>{label("apply-list-style", "Apply List Style")}</legend>
        <label className="grid gap-1 text-sm">
          {label("list-style", "List style")}
          <select
            className="rounded border border-slate-400 p-1"
            value={isKnownStyle ? style : "\u0001"}
            onChange={
              /** Stages the native list rule name. @param event - Selected style. @returns Nothing. */
              (event) => {
                const value = event.currentTarget.value;
                setStyle(value);
                if (value === initialStyle) output.ClearItem(RES_PARATR_NUMRULE);
                else output.Put(new SwNumRuleItem(value));
                writeLevel(list, outline, value);
              }
            }
          >
            {!isKnownStyle && <option value={"\u0001"} disabled />}
            <option value="">{label("no-list", "No List")}</option>
            {initialStyle === "Outline" && (
              <option value="Outline">{label("chapter-numbering", "Chapter Numbering")}</option>
            )}
            {listStyleNames.map(
              /** Lists one native named numbering rule. @param name - UI style name. @returns Option. */
              (name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ),
            )}
          </select>
        </label>
        {list !== undefined && (
          <label className="grid gap-1 text-sm">
            {label("list-level", "List level")}
            <select
              className="rounded border border-slate-400 p-1"
              value={list}
              disabled={!hasStyle}
              onChange={
                /** Selects a fixed or synchronized list level. @param event - Selected row. @returns Nothing. */
                (event) => {
                  const value = Number(event.currentTarget.value);
                  setList(value);
                  writeLevel(value, outline, style);
                }
              }
            >
              <option value="0">{label("same-as-outline", "Same as outline level")}</option>
              {levels.map(
                /** Provides one list level. @param level - One-based index. @returns Option. */
                (level) => (
                  <option key={level} value={level}>
                    {label(`level.${level}`, `Level ${level}`)}
                  </option>
                ),
              )}
            </select>
          </label>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={restart}
            disabled={!hasStyle}
            onChange={
              /** Stages the native restart checkbox. @param event - Changed checkbox. @returns Nothing. */
              (event) => {
                setRestart(event.currentTarget.checked);
                writeRestart(event.currentTarget.checked, explicitStart, start);
              }
            }
          />
          {label("restart-numbering", "Restart numbering at this paragraph")}
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={explicitStart}
              disabled={!hasStyle || !restart}
              onChange={
                /** Stages whether to override the rule's start value. @param event - Changed checkbox. @returns Nothing. */
                (event) => {
                  setExplicitStart(event.currentTarget.checked);
                  writeRestart(restart, event.currentTarget.checked, start);
                }
              }
            />
            {label("start-with", "Start with")}
          </label>
          <input
            type="number"
            min={0}
            max={maximumStart}
            className="w-24 rounded border border-slate-400 p-1"
            aria-label={label("numbering-start-value", "Numbering start value")}
            disabled={!hasStyle || !restart || !explicitStart}
            value={start}
            onChange={
              /** Accepts the native explicit unsigned start. @param event - Numeric change. @returns Nothing. */
              (event) => {
                const value = event.currentTarget.valueAsNumber;
                if (!Number.isInteger(value) || value < 0 || value > maximumStart) return;
                setStart(value);
                writeRestart(restart, explicitStart, value);
              }
            }
          />
        </div>
      </fieldset>
    </div>
  );
}
