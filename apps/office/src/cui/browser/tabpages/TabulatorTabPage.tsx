/** @fileoverview Browser controls corresponding to the original paratabspage.ui; native source handlers own all tab values. */
import {
  RULER_TAB_LEFT,
  RULER_TAB_RIGHT,
  RULER_TAB_CENTER,
  RULER_TAB_DECIMAL,
} from "../../../svtools/inc/ruler";
import { RulerTabSymbol } from "../../../svtools/browser/control/RulerTabSymbol";
import { useLayoutEffect, useReducer, useRef, useState } from "react";
import type { SvxTabulatorTabPage } from "../../source/tabpages/tabstpge";
import { SvxTabAdjust as A } from "../../../editeng/inc/tstpitem";
import { TabulatorDisableFlags as F } from "../../../svx/inc/flagsdef";
import type { TabulatorFill } from "../../source/tabpages/tabstpge";
import type { TabulatorDialogSession } from "./tabstpge-session";
/** Presents the original position combo, type/fill groups and explicit action buttons. @param props - Actual retained page session. @returns Page controls. */
export function TabulatorTabPage({
  session,
}: Readonly<{ session: TabulatorDialogSession }>): React.JSX.Element {
  const page = session.Open();
  const [, repaint] = useReducer(
    /** Advances only browser rendering identity. @param version - Current identity. @returns Next identity. */
    (version: number) => version + 1,
    0,
  );
  const [entry, setEntry] = useState<HTMLInputElement | null>(null);
  const pendingFocus = useRef<boolean | undefined>(undefined);
  useLayoutEffect(
    /** Connects the actual mounted entry to source focus operations. @returns Unmount cleanup. */
    () => {
      session.SetFocus(
        /** Applies source focus and selection to the real input. @param selectAll - Source selection flag. @returns Nothing. */
        (selectAll) => {
          pendingFocus.current = selectAll;
        },
      );
      return /** Releases the mounted browser focus operation. @returns Nothing. */ () =>
        session.SetFocus();
    },
    [session],
  );
  useLayoutEffect(
    /** Applies native focus/selection only after the corresponding source text is committed to DOM. @returns Nothing. */
    () => {
      if (entry === null) return;
      const selectAll = pendingFocus.current;
      if (selectAll === undefined) return;
      pendingFocus.current = undefined;
      entry.focus();
      if (selectAll) entry.select();
    },
  );
  /** Dispatches source handling then refreshes widget projections. @param action - Native handler. @returns Nothing. */
  function run(action: (value: SvxTabulatorTabPage) => void): void {
    session.Run(action);
    repaint();
  }
  return (
    <div className="grid min-w-0 gap-3 sm:col-span-2 sm:grid-cols-[1.15fr_1fr_1.15fr_auto]">
      <div className="flex min-w-0 flex-col gap-2">
        <label htmlFor="writer-tab-position">Position</label>
        <input
          id="writer-tab-position"
          ref={setEntry}
          role="combobox"
          aria-label="Position"
          aria-controls="writer-tab-positions"
          aria-expanded="true"
          autoComplete="off"
          className="min-w-0 border px-2 py-1"
          value={page.entryText}
          onChange={
            /** Forwards native entry modification. @param event - Actual input. @returns Nothing. */ (
              event,
            ) =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => {
                  value.entryText = event.target.value;
                  value.ModifyHdl_Impl();
                },
              )
          }
          onBlur={
            /** Applies original focus-departure formatting. @returns Nothing. */ () =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => value.ReformatHdl_Impl(),
              )
          }
        />
        <select
          onDoubleClick={
            /** Activates the original tree row independently of selection change. @returns Nothing. */ () =>
              run(
                /** Invokes native activation. @param value - Page. @returns Nothing. */ (
                  value,
                ) => {
                  value.SelectHdl_Impl();
                },
              )
          }
          onKeyDown={
            /** Maps Enter to native row activation. @param event - Keyboard event. @returns Nothing. */ (
              event,
            ) => {
              if (event.key === "Enter")
                run(
                  /** Invokes native activation. @param value - Page. @returns Nothing. */ (
                    value,
                  ) => {
                    value.SelectHdl_Impl();
                  },
                );
            }
          }
          id="writer-tab-positions"
          aria-label="Tab stops"
          size={8}
          className="min-w-0 border px-2"
          value={page.FindCurrentTab()}
          onChange={
            /** Runs original combo selection activation. @param event - Actual selection. @returns Nothing. */ (
              event,
            ) =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => {
                  value.entryText = value.GetEntries()[Number(event.target.value)] ?? "";
                  value.ModifyHdl_Impl();
                },
              )
          }
        >
          {page.GetEntries().map(
            /** Projects original formatted list rows. @param text - Native text. @param index - List index. @returns Option. */ (
              text,
              index,
            ) => (
              <option key={index} value={index}>
                {text}
              </option>
            ),
          )}
        </select>
      </div>

      <fieldset disabled={!page.typeFrameEnabled} className="flex flex-col gap-1">
        <legend>Type</legend>
        {(
          [
            [A.Left, "Left", F.TypeLeft, RULER_TAB_LEFT],
            [A.Right, "Right", F.TypeRight, RULER_TAB_RIGHT],
            [A.Center, "Centered", F.TypeCenter, RULER_TAB_CENTER],
            [A.Decimal, "Decimal", F.TypeDecimal, RULER_TAB_DECIMAL],
          ] as const
        ).map(
          /** Projects native type radios. @param row - Original identity, label and mask. @returns Radio. */
          ([type, label, flag, style]) => (
            <label key={type} className="flex items-center gap-1 whitespace-nowrap">
              <input
                type="radio"
                name="writer-tab-type"
                checked={page.selectedType === type}
                disabled={!page.IsControlEnabled(flag)}
                onChange={
                  /** Runs activated source type handler. @returns Nothing. */ () =>
                    run(
                      /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                        value,
                      ) => value.TabTypeCheckHdl_Impl(type),
                    )
                }
              />{" "}
              {label}
              <RulerTabSymbol style={style} />
            </label>
          ),
        )}
        <label className="flex min-w-0 flex-col">
          Character
          <input
            aria-label="Decimal character"
            className="min-w-0 border px-2"
            value={page.decimalText}
            disabled={!page.decimalEnabled}
            onChange={
              /** Retains original entry text until focus departure. @param event - Actual text. @returns Nothing. */ (
                event,
              ) =>
                run(
                  /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                    value,
                  ) => {
                    value.decimalText = event.target.value;
                  },
                )
            }
            onBlur={
              /** Commits original first UTF16 unit. @returns Nothing. */ () =>
                run(
                  /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                    value,
                  ) => value.GetDezCharHdl_Impl(),
                )
            }
          />
        </label>
      </fieldset>
      <fieldset disabled={!page.fillFrameEnabled} className="flex flex-col gap-1">
        <legend>Fill Character</legend>
        {(
          [
            ["none", "None", F.FillNone],
            ["points", "........", F.FillPoint],
            ["dash", "--------", F.FillDashLine],
            ["solid", "________", F.FillSolidLine],
            ["other", "Character", F.FillSpecial],
          ] as const satisfies readonly (readonly [TabulatorFill, string, F])[]
        ).map(
          /** Projects original five filler choices. @param row - Native choice, text and mask. @returns Radio. */
          ([fill, label, flag]) => (
            <label key={fill} className="flex items-center gap-1 whitespace-nowrap">
              <input
                type="radio"
                name="writer-tab-fill"
                checked={page.selectedFill === fill}
                disabled={!page.IsControlEnabled(flag)}
                onChange={
                  /** Runs activated source fill handler. @returns Nothing. */ () =>
                    run(
                      /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                        value,
                      ) => value.FillTypeCheckHdl_Impl(fill),
                    )
                }
              />{" "}
              {label}
            </label>
          ),
        )}
        <input
          aria-label="Fill character"
          className="min-w-0 border px-2"
          value={page.fillText}
          disabled={!page.fillEnabled}
          onChange={
            /** Retains original custom filler entry. @param event - Actual text. @returns Nothing. */ (
              event,
            ) =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => {
                  value.fillText = event.target.value;
                },
              )
          }
          onBlur={
            /** Commits original filler focus handler. @returns Nothing. */ () =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => value.GetFillCharHdl_Impl(),
              )
          }
        />
      </fieldset>
      <div className="flex flex-col items-stretch gap-2">
        <button
          type="button"
          className="border px-3 py-1"
          disabled={!page.newEnabled}
          onClick={
            /** Explicit New permits the native zero tab. @returns Nothing. */ () =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => value.NewHdl_Impl(true),
              )
          }
        >
          New
        </button>
        <button
          type="button"
          className="border px-3 py-1"
          disabled={!page.deleteEnabled}
          onClick={
            /** Deletes original current row. @returns Nothing. */ () =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => value.DelHdl_Impl(),
              )
          }
        >
          Delete
        </button>
        <button
          type="button"
          className="border px-3 py-1"
          onClick={
            /** Preserves original Delete All state. @returns Nothing. */ () =>
              run(
                /** Dispatches the corresponding original widget handler. @param value - Actual native page. @returns Nothing. */ (
                  value,
                ) => value.DelAllHdl_Impl(),
              )
          }
        >
          Delete All
        </button>
      </div>
    </div>
  );
}
