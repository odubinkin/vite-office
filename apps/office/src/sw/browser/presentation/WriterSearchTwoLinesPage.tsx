/** @fileoverview Browser binding of the native SvxCharTwoLinesPage in Writer Search Format. */
import { useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, type Ref } from "react";
import { SvxTwoLinesItem } from "../../../editeng/inc/twolinesitem";
import { FontCharMap } from "../../../vcl/source/font/fontcharmap";
import { FontList } from "../../../svtools/browser/font-list";
import { readBrowserFontCharMap } from "../../../vcl/browser/font-character-map";
import { RES_CHRATR_TWO_LINES } from "../../inc/hintids";
import { WriterSearchCharacterMap } from "./writer-search-character-map";
import { WriterDialogHeader } from "./WriterDialogHeader";

/** Resolves labels from the active search dialog locale. */
type Label = (key: string, fallback: string) => string;
/** Leading or trailing enclosure list. */
type Side = "start" | "end";

const brackets = {
  start: [0, 40, 91, 60, 123],
  end: [0, 41, 93, 62, 125],
} as const;

const fallbackMap = FontCharMap.GetDefaultMap(false);
const pageSize = 64;

/** Selects a codepoint from the fixed browser font for the native bracket chooser. @param props - Picker controls and selected-symbol callback. @returns Dialog. */
function BracketCharacterMap({
  label,
  family,
  close,
}: Readonly<{ label: Label; family: string; close: (code?: number) => void }>): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [map, setMap] = useState(fallbackMap);
  const [hex, setHex] = useState("");
  const [offset, setOffset] = useState(0);
  const [resources, setResources] = useState<WriterSearchCharacterMap>();
  const [query, setQuery] = useState("");
  const subsets = useMemo(
    /** Resolves the subsets with at least one glyph in the active font. @returns Available subsets. */
    () => resources?.GetSubsets(map) ?? [],
    [resources, map],
  );
  const matches = useMemo(
    /** Searches the actual character map only when search is active. @returns Matching codes. */
    () => (query === "" ? undefined : (resources?.Search(map, query) ?? [])),
    [query, resources, map],
  );
  const code = hex === "" ? undefined : Number(`0x${hex}`);
  const selected = code !== undefined && map.HasChar(code) ? code : undefined;

  useLayoutEffect(
    /** Focuses the code input and resolves the immutable device glyph inventory. @returns Cleanup. */
    () => {
      const element = dialog.current;
      if (element) {
        if (typeof element.showModal === "function") element.showModal();
        else element.open = true;
      }
      input.current?.focus();
      let active = true;
      void WriterSearchCharacterMap.Load()
        .then(
          /** Enables the native name search and subset controls. @param data - Pinned resources. @returns Nothing. */
          (data) => {
            if (active) setResources(data);
          },
        )
        .catch(
          /** Keeps numeric selection available if the character resources cannot be loaded. @returns Nothing. */
          () => undefined,
        );
      void (
        /** Resolves the fixed font character map. @returns Nothing. */ async function loadFace() {
          const list = await FontList.FromBrowser();
          const face = list.GetBrowserFaces(family)[0];
          if (!face) return;
          const characters = await readBrowserFontCharMap(face, false);
          if (active && characters !== undefined) setMap(characters);
        }
      )().catch(
        /** Keeps the native default character map when device bytes are unavailable. @returns Nothing. */
        () => undefined,
      );
      return /** Discards results after the picker closes. @returns Nothing. */ () => {
        active = false;
      };
    },
    [family],
  );

  /** Selects a numeric character and scrolls its glyph page into view. @param value - Entered codepoint. @returns Nothing. */
  function choose(value: number): void {
    setHex(value.toString(16).toUpperCase());
    const index = matches?.indexOf(value) ?? map.GetIndexFromChar(value);
    if (index >= 0) setOffset(Math.floor(index / pageSize) * pageSize);
  }

  const count = matches?.length ?? map.GetCharCount();
  const start = Math.min(offset, Math.max(0, Math.floor((count - 1) / pageSize) * pageSize));
  const displayed = selected ?? map.GetCharFromIndex(start);
  const subset = subsets.find(
    /** Finds the subset highlighted by the current character. @param row - Native subset. @returns Membership. */
    ([first, last]) => first <= displayed && displayed <= last,
  );
  const caption = label("special-characters", "Special Characters");
  return (
    <dialog
      ref={dialog}
      aria-label={caption}
      aria-modal="true"
      className="fixed inset-0 z-[60] m-auto max-h-[85dvh] w-[min(90vw,30rem)] overflow-auto rounded-lg border border-slate-300 bg-white p-4 shadow-xl"
      onKeyDown={
        /** Keeps Enter and Escape in the character picker. @param event - Picker keyboard event. @returns Nothing. */
        (event) => {
          if (event.key !== "Escape" && event.key !== "Enter") return;
          event.stopPropagation();
          if (event.key === "Enter" && !(event.target instanceof HTMLInputElement)) return;
          event.preventDefault();
          if (event.key === "Escape") close();
          else if (selected !== undefined) close(selected);
        }
      }
    >
      <WriterDialogHeader
        title={caption}
        onClose={/** Cancels selection. @returns Nothing. */ () => close()}
      />
      <div className="grid gap-3 px-2 py-3">
        <label className="grid gap-1 text-sm">
          {label("character-font", "Font")}
          <input disabled value={family} className="rounded border border-slate-300 p-1" />
        </label>
        <label className="grid gap-1 text-sm">
          {label("character-subset", "Subset")}
          <select
            disabled={matches !== undefined || subsets.length === 0}
            className="rounded border border-slate-400 p-1"
            value={subset?.[0] ?? ""}
            onChange={
              /** Jumps to the first supported codepoint in the chosen subset. @param event - Subset choice. @returns Nothing. */
              (event) => {
                if (event.currentTarget.value === "") return;
                const first = Number(event.currentTarget.value);
                choose(map.HasChar(first) ? first : map.GetNextChar(first));
              }
            }
          >
            <option value="" />
            {subsets.map(
              /** Presents an available native subset. @param row - Subset range and resource. @returns Option. */
              ([first, , id, name]) => (
                <option key={first} value={first}>
                  {label(`character-subset.${id}`, name)}
                </option>
              ),
            )}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          {label("character-search", "Search")}
          <input
            disabled={resources === undefined}
            className="rounded border border-slate-400 p-1"
            value={query}
            onChange={
              /** Switches to search results and clears the previous selection. @param event - Search entry. @returns Nothing. */
              (event) => {
                setQuery(event.currentTarget.value);
                setHex("");
                setOffset(0);
              }
            }
          />
        </label>
        <div className="grid grid-cols-8 gap-1" style={{ fontFamily: family }}>
          {Array.from(
            { length: Math.min(pageSize, count - start) },
            /** Presents one glyph from the current character range. @param unused - Empty array slot. @param index - Page index. @returns Glyph button. */
            (_unused, index) => {
              const value = matches?.[start + index] ?? map.GetCharFromIndex(start + index);
              return (
                <button
                  type="button"
                  key={value}
                  aria-label={`U+${value.toString(16).toUpperCase().padStart(4, "0")}`}
                  aria-pressed={selected === value}
                  className="rounded border border-slate-300 p-1 aria-pressed:border-indigo-700"
                  onClick={/** Selects the glyph. @returns Nothing. */ () => choose(value)}
                  onDoubleClick={/** Accepts the glyph. @returns Nothing. */ () => close(value)}
                >
                  {String.fromCodePoint(value)}
                </button>
              );
            },
          )}
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            disabled={start === 0}
            onClick={
              /** Shows previous glyphs. @returns Nothing. */ () => setOffset(start - pageSize)
            }
          >
            {label("characters-previous", "Previous")}
          </button>
          <button
            type="button"
            disabled={start + pageSize >= count}
            onClick={/** Shows more glyphs. @returns Nothing. */ () => setOffset(start + pageSize)}
          >
            {label("characters-next", "Next")}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label className="grid gap-1 text-sm">
            {label("character-hex", "Hexadecimal")}
            <input
              ref={input}
              readOnly={matches !== undefined}
              className="rounded border border-slate-400 p-1"
              maxLength={6}
              value={hex}
              onChange={
                /** Resolves the Unicode value from the native hex field. @param event - Edited field. @returns Nothing. */
                (event) => {
                  const value = event.currentTarget.value.toUpperCase();
                  if (!/^[0-9A-F]{0,6}$/u.test(value)) return;
                  if (value) choose(Number(`0x${value}`));
                  else setHex("");
                }
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            {label("character-decimal", "Decimal")}
            <input
              className="rounded border border-slate-400 p-1"
              inputMode="numeric"
              readOnly={matches !== undefined}
              value={code ?? ""}
              onChange={
                /** Resolves the Unicode value from the native decimal field. @param event - Edited field. @returns Nothing. */
                (event) => {
                  const value = event.currentTarget.value;
                  if (!/^[0-9]{0,7}$/u.test(value)) return;
                  if (value) choose(Number(value));
                  else setHex("");
                }
              }
            />
          </label>
        </div>
        <output className="p-1 text-center text-2xl" style={{ fontFamily: family }}>
          {selected === undefined ? "" : String.fromCodePoint(selected)}
        </output>
        <output
          aria-label={label("character-name", "Character Name")}
          className="text-center text-sm"
        >
          {selected === undefined ? "" : resources?.GetName(selected)}
        </output>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded border px-3 py-1"
            onClick={/** Cancels the picker. @returns Nothing. */ () => close()}
          >
            {label("character-cancel", "Cancel")}
          </button>
          <button
            type="button"
            disabled={selected === undefined}
            className="rounded bg-indigo-700 px-3 py-1 text-white disabled:opacity-50"
            onClick={/** Accepts the selected glyph. @returns Nothing. */ () => close(selected)}
          >
            {label("character-ok", "OK")}
          </button>
        </div>
      </div>
    </dialog>
  );
}

/** Reports the double-line page's native item at the dialog boundary. */
export interface WriterSearchTwoLinesPageHandle {
  GetItem(): SvxTwoLinesItem | undefined;
  Reset(): void;
}

/** Shows the native double-lined and enclosing-character groups. @param props - Initial item, font, formatting output and localized labels. @returns Asian Layout controls. */
export function WriterSearchTwoLinesPage({
  ref,
  initial,
  family,
  label,
}: Readonly<{
  ref: Ref<WriterSearchTwoLinesPageHandle>;
  initial: SvxTwoLinesItem;
  family: string;
  label: Label;
}>): React.JSX.Element {
  const [enabled, setEnabled] = useState(initial.GetValue());
  const [start, setStart] = useState(initial.GetValue() ? initial.GetStartBracket() : 0);
  const [end, setEnd] = useState(initial.GetValue() ? initial.GetEndBracket() : 0);
  const [custom, setCustom] = useState<Side>();
  const [choices, setChoices] = useState<Readonly<Record<Side, readonly number[]>>>({
    start: initial.GetValue() && initial.GetStartBracket() ? [initial.GetStartBracket()] : [],
    end: initial.GetValue() && initial.GetEndBracket() ? [initial.GetEndBracket()] : [],
  });
  const initialSelect = useRef<HTMLSelectElement>(null);
  const finalSelect = useRef<HTMLSelectElement>(null);

  useImperativeHandle(
    ref,
    /** Provides the same item delta and reset entry points as the source page. @returns Page handle. */
    () => ({
      /** Normalizes disabled bracket values and compares against the original criterion. @returns Updated native item. */
      GetItem() {
        if (
          enabled === initial.GetValue() &&
          (!enabled || (start === initial.GetStartBracket() && end === initial.GetEndBracket()))
        )
          return undefined;
        return new SvxTwoLinesItem(
          enabled,
          enabled ? start : 0,
          enabled ? end : 0,
          RES_CHRATR_TWO_LINES,
        );
      },
      /** Restores the original value, retaining inactive bracket rows like the source. @returns Nothing. */
      Reset() {
        setEnabled(initial.GetValue());
        if (initial.GetValue()) {
          setStart(initial.GetStartBracket());
          setEnd(initial.GetEndBracket());
        }
      },
    }),
    [enabled, start, end, initial],
  );

  /** Displays one of the two source enclosure lists. @param side - Bracket position. @returns Labeled whitelist plus the character picker entry. */
  function bracket(side: Side): React.JSX.Element {
    const first = side === "start";
    return (
      <label className="grid gap-1 text-sm">
        {first
          ? label("initial-character", "Initial character")
          : label("final-character", "Final character")}
        <select
          ref={first ? initialSelect : finalSelect}
          className="rounded border border-slate-400 p-1"
          value={first ? start : end}
          onChange={
            /** Stages an enclosure or opens the special-character dialog. @param event - Source selector change. @returns Nothing. */
            (event) => {
              const code = Number(event.currentTarget.value);
              if (code === -1) setCustom(side);
              else (first ? setStart : setEnd)(code);
            }
          }
        >
          {[...brackets[side]].map(
            /** Renders the pinned predefined row. @param code - Bracket value. @returns Row. */
            (code) => (
              <option key={code} value={code}>
                {code === 0 ? label("no-bracket", "(None)") : String.fromCharCode(code)}
              </option>
            ),
          )}
          <option value="-1">{label("other-characters", "Other Characters...")}</option>
          {choices[side]
            .filter(
              /** Leaves predefined characters at their original positions. @param code - Appended character. @returns Whether it is a custom row. */
              (code) =>
                !brackets[side].some(
                  /** Tests membership in the original bracket list. @param preset - Native row. @returns Whether the code matches. */
                  (preset) => preset === code,
                ),
            )
            .map(
              /** Renders the appended native custom row. @param code - UTF-16 unit. @returns Row. */
              (code) => (
                <option key={code} value={code}>
                  {String.fromCharCode(code)}
                </option>
              ),
            )}
        </select>
      </label>
    );
  }

  const sample = label("double-lined-preview", "Double-lined");
  const split = Math.ceil(sample.length / 2);
  return (
    <>
      <div inert={custom !== undefined} className="grid gap-2">
        <fieldset className="rounded border border-slate-200 p-2">
          <legend className="text-sm">{label("double-lined", "Double-lined")}</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={enabled}
              onChange={
                /** Toggles double lines. @param event - Checkbox change. @returns Nothing. */ (
                  event,
                ) => setEnabled(event.currentTarget.checked)
              }
            />
            {label("write-double-lines", "Write in double lines")}
          </label>
        </fieldset>
        <fieldset
          disabled={!enabled}
          className="grid grid-cols-2 gap-2 rounded border border-slate-200 p-2"
        >
          <legend className="text-sm">
            {label("enclosing-characters", "Enclosing Characters")}
          </legend>
          {bracket("start")}
          {bracket("end")}
        </fieldset>
        <output className="flex min-h-12 items-center justify-center gap-1 rounded border border-slate-200">
          {enabled ? (
            <>
              <span>{start ? String.fromCharCode(start) : ""}</span>
              <span className="grid text-xs leading-none">
                <span>{sample.slice(0, split)}</span>
                <span>{sample.slice(split)}</span>
              </span>
              <span>{end ? String.fromCharCode(end) : ""}</span>
            </>
          ) : (
            sample
          )}
        </output>
      </div>
      {custom === undefined ? null : (
        <BracketCharacterMap
          family={family}
          label={label}
          close={
            /** Appends the UTF-16 bracket and restores focus to its source list. @param code - Selected Unicode codepoint. @returns Nothing. */
            (code) => {
              if (code !== undefined) {
                const unit = code & 0xffff;
                if (unit !== 0)
                  setChoices(
                    /** Retains each appended character once. @param previous - Existing list rows. @returns Updated rows. */
                    (previous) => ({
                      ...previous,
                      [custom]: [...new Set([...previous[custom], unit])],
                    }),
                  );
                (custom === "start" ? setStart : setEnd)(unit);
              }
              setCustom(undefined);
              queueMicrotask(
                /** Focuses the invoking bracket list. @returns Nothing. */
                () => (custom === "start" ? initialSelect : finalSelect).current?.focus(),
              );
            }
          }
        />
      )}
    </>
  );
}
