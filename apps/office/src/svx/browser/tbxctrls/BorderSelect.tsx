/** @fileoverview Shared SVX browser toolbox border popup and line-style list over actual native item dispatch,using the Writer popup lifecycle and caller-supplied common toolbar styling. */
import { useMemo, useRef, useState, type ReactNode, type KeyboardEvent } from "react";
import { useToolboxPopup } from "./use-toolbox-popup";
import {
  DispatchBorderItem,
  SvxFrameToolBoxControl,
  type BorderDispatch,
} from "../../source/tbxctrls/tbcontrl";
import { SvxLineItem } from "../../../editeng/inc/lineitem";
import {
  SvxBorderLine,
  SvxBorderLineStyle as LineStyle,
} from "../../../editeng/source/items/borderline";
import { browserBorderLine } from "../dialog/border-line";
/** Native Calc InitImageList labels and order from tbcontrl.cxx/strings.hrc. */
const calcBorderPresets = [
  "No Borders",
  "Outer Border",
  "Outer Border and All Inner Lines",
  "Criss-Cross Border",
  "Left Border",
  "Right Border",
  "Top Border",
  "Bottom Border",
  "Diagonal Down Border",
  "Diagonal Up Border",
  "Top and Bottom Borders",
  "Left and Right Borders",
] as const;
/** Browser icon projection of the twelve actual native frame images. @param preset - Original Calc id. @returns Paint-only glyph. */
function BorderPresetIcon({ preset }: { readonly preset: number }): React.JSX.Element {
  const paths = [
    "",
    "M3 3H21V21H3Z",
    "M3 3H21V21H3ZM12 3V21M3 12H21",
    "M3 3L21 21M3 21L21 3",
    "M3 3V21",
    "M21 3V21",
    "M3 3H21",
    "M3 21H21",
    "M3 3L21 21",
    "M3 21L21 3",
    "M3 3H21M3 21H21",
    "M3 3V21M21 3V21",
  ];
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M3 3H21V21H3ZM12 3V21M3 12H21" stroke="#cbd5e1" strokeDasharray="1 2" />
      <path d={paths[preset - 1]} />
    </svg>
  );
}
/** Native ValueSet keyboard navigation across the configured column count. @param event - Platform key. @param columns - Popup column count. @returns Nothing. */
function movePopupFocus(event: KeyboardEvent<HTMLDivElement>, columns: number): void {
  const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button")),
    index = items.indexOf(event.target as HTMLButtonElement);
  if (index < 0) return;
  const next =
    event.key === "ArrowRight"
      ? index + 1
      : event.key === "ArrowLeft"
        ? index - 1
        : event.key === "ArrowDown"
          ? index + columns
          : event.key === "ArrowUp"
            ? index - columns
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? items.length - 1
                : undefined;
  if (next !== undefined) {
    event.preventDefault();
    items[(next + items.length) % items.length]?.focus();
  }
}
/** Actual Calc frame toolbox controller,split apply and four-column twelve-preset popup. @param props - Real dispatch and shared styling/icon ports. @returns Toolbox. */
export function BorderSelect({
  dispatch,
  enabled,
  label,
  className,
  icon,
}: {
  readonly dispatch: BorderDispatch;
  readonly enabled: boolean;
  readonly label: string;
  readonly className: string;
  readonly icon: ReactNode;
}): React.JSX.Element {
  const { ref: popup, open, toggle, close } = useToolboxPopup();
  const main = useRef<HTMLButtonElement>(null),
    control = useMemo(
      /** Owns original last-used preset state for this actual toolbox lifecycle. @returns Native controller. */ () =>
        new SvxFrameToolBoxControl(dispatch),
      [dispatch],
    );
  // Native m_aLastImage is an actual browser glyph owned by this controller's toolbar view.
  const [lastImage, setLastImage] = useState<{
    readonly owner: SvxFrameToolBoxControl;
    readonly image: ReactNode;
  }>();
  return (
    <div className="flex shrink-0 items-center">
      <button
        ref={main}
        type="button"
        aria-label={label}
        disabled={!enabled}
        className={className}
        onClick={
          /** Executes the actual native last-used preset or toggles its initial popup. @returns Nothing. */ () =>
            control.execute(toggle)
        }
      >
        {lastImage?.owner === control ? lastImage.image : icon}
      </button>
      <details ref={popup} className="relative">
        <summary
          aria-label={`${label} presets`}
          aria-disabled={!enabled}
          tabIndex={enabled ? 0 : -1}
          className="grid h-8 w-5 cursor-pointer place-items-center rounded-r border border-l-0 border-slate-300 bg-white text-xs text-slate-700"
          onClick={
            /** Retains source disabled admission. @param event - Popup click. @returns Nothing. */ (
              event,
            ) => {
              event.preventDefault();
              if (enabled) toggle();
            }
          }
        >
          ▾
        </summary>
        {open && (
          <div
            role="group"
            aria-label={`${label} presets`}
            className="absolute left-0 top-full z-40 grid w-44 grid-cols-4 gap-1 rounded border border-slate-300 bg-white p-2 shadow-lg"
            onKeyDown={
              /** Uses source four-column ValueSet navigation and Escape focus return. @param event - Platform key. @returns Nothing. */ (
                event,
              ) => {
                if (event.key === "Escape") {
                  close();
                  main.current?.focus();
                } else movePopupFocus(event, 4);
              }
            }
          >
            {calcBorderPresets.map(
              /** Paints one native Calc preset. @param name - Source label. @param index - Original index. @returns Actual preset button. */ (
                name,
                index,
              ) => (
                <button
                  key={name}
                  type="button"
                  aria-label={name}
                  title={name}
                  disabled={!enabled}
                  className={className}
                  onClick={
                    /** Dispatches original modifier-sensitive preset and records it in the source controller. @param event - Platform selection. @returns Nothing. */ (
                      event,
                    ) => {
                      control.SetLastUsedBorderItem(index + 1, true);
                      setLastImage({
                        owner: control,
                        image: <BorderPresetIcon preset={index + 1} />,
                      });
                      DispatchBorderItem(
                        dispatch,
                        index + 1,
                        true,
                        event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey
                          ? 0x1000
                          : 0,
                      );
                      close();
                      main.current?.focus();
                    }
                  }
                >
                  <BorderPresetIcon preset={index + 1} />
                </button>
              ),
            )}
          </div>
        )}
      </details>
    </div>
  );
}
/** Original SvxLineWindow style order,excluding its None row. */
const styles = [
  LineStyle.SOLID,
  LineStyle.DOTTED,
  LineStyle.DASHED,
  LineStyle.DOUBLE,
  LineStyle.THINTHICK_SMALLGAP,
  LineStyle.THINTHICK_MEDIUMGAP,
  LineStyle.THINTHICK_LARGEGAP,
  LineStyle.THICKTHIN_SMALLGAP,
  LineStyle.THICKTHIN_MEDIUMGAP,
  LineStyle.THICKTHIN_LARGEGAP,
  LineStyle.EMBOSSED,
  LineStyle.ENGRAVED,
  LineStyle.OUTSET,
  LineStyle.INSET,
] as const;
/** Original accessible style names from svtools/inc/borderline.hrc. */
const styleNames = [
  "Solid",
  "Dotted",
  "Dashed",
  "Double",
  "Thin Thick, Small Gap",
  "Thin Thick, Medium Gap",
  "Thin Thick, Large Gap",
  "Thick Thin, Small Gap",
  "Thick Thin, Medium Gap",
  "Thick Thin, Large Gap",
  "Embossed",
  "Engraved",
  "Outset",
  "Inset",
] as const;
/** Native line-style popup uses original Thin width and a genuine null-line None item. @param props - Actual source binding and common icon/style ports. @returns Line-style popup. */
export function BorderLineStyleSelect({
  enabled,
  label,
  value,
  onSelect,
  className,
  icon,
}: {
  readonly enabled: boolean;
  readonly label: string;
  readonly value: unknown;
  readonly onSelect: (item: SvxLineItem) => void;
  readonly className: string;
  readonly icon: ReactNode;
}): React.JSX.Element {
  const { ref: popup, open, toggle, close } = useToolboxPopup();
  const current = value instanceof SvxLineItem ? value.GetLine()?.GetBorderLineStyle() : undefined;
  return (
    <details ref={popup} className="relative">
      <summary
        aria-label={label}
        aria-disabled={!enabled}
        tabIndex={enabled ? 0 : -1}
        className={`${className} list-none cursor-pointer`}
        onClick={
          /** Leaves disabled native command closed. @param event - Press. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            if (enabled) toggle();
          }
        }
      >
        {icon}
      </summary>
      {open && (
        <div
          role="group"
          aria-label={label}
          className="absolute left-0 top-full z-40 max-h-[min(24rem,70dvh)] w-48 overflow-auto rounded border border-slate-300 bg-white p-2 shadow-lg"
          onKeyDown={
            /** Uses native one-column list navigation. @param event - Platform key. @returns Nothing. */ (
              event,
            ) => movePopupFocus(event, 1)
          }
        >
          {[undefined, ...styles].map(
            /** Projects one actual source style entry. @param style - Native style or None. @returns Style button. */ (
              style,
            ) => {
              const line = style === undefined ? undefined : new SvxBorderLine(null, 20, style),
                name = style === undefined ? "None" : styleNames[styles.indexOf(style)];
              return (
                <button
                  type="button"
                  aria-label={name}
                  aria-pressed={style === current}
                  key={name}
                  disabled={!enabled}
                  className="mb-1 flex h-8 w-full items-center rounded border border-slate-300 px-2 text-left text-xs text-slate-700 hover:border-indigo-400"
                  onClick={
                    /** Dispatches native LineStyle item with source fixed Thin width. @returns Nothing. */ () => {
                      const item = new SvxLineItem(10201);
                      if (style !== undefined) item.SetLine(new SvxBorderLine(null, 15, style));
                      onSelect(item);
                      close();
                      (popup.current?.firstElementChild as HTMLElement | null)?.focus({
                        preventScroll: true,
                      });
                    }
                  }
                >
                  {line ? (
                    <span
                      aria-hidden="true"
                      className="block w-full"
                      style={{ borderTop: browserBorderLine(line, false) }}
                    />
                  ) : (
                    name
                  )}
                </button>
              );
            },
          )}
        </div>
      )}
    </details>
  );
}
