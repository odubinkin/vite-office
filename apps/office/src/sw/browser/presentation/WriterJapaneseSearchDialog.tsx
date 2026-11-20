/** @fileoverview Writer Sounds dialog for the pinned cui/ui/optjsearchpage.ui options. */
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useBrowserLocalization } from "../../../framework/browser/localization/browser-localization-context";
import { TransliterationFlags as Flags } from "../../../i18nutil/inc/transliteration";
import { WriterDialogHeader } from "./WriterDialogHeader";

const equivalences = [
  [Flags.IGNORE_CASE, "uppercase/lowercase"],
  [Flags.IGNORE_WIDTH, "full-width/half-width forms"],
  [Flags.IGNORE_KANA, "hiragana/katakana"],
  [Flags.ignoreSize_ja_JP, "contractions (yo-on, sokuon)"],
  [Flags.ignoreMinusSign_ja_JP, "minus/dash/cho-on"],
  [Flags.ignoreIterationMark_ja_JP, "Iteration marks"],
  [Flags.ignoreTraditionalKanji_ja_JP, "variant-form kanji (itaiji)"],
  [Flags.ignoreTraditionalKana_ja_JP, "old Kana forms"],
  [Flags.ignoreZiZu_ja_JP, "di/zi, du/zu"],
  [Flags.ignoreBaFa_ja_JP, "ba/va, ha/fa"],
  [Flags.ignoreTiJi_ja_JP, "tsi/thi/chi, dhi/zi"],
  [Flags.ignoreHyuByu_ja_JP, "hyu/fyu, byu/vyu"],
  [Flags.ignoreSeZe_ja_JP, "se/she, ze/je"],
  [Flags.ignoreIandEfollowedByYa_ja_JP, "ia/iya (piano/piyano)"],
  [Flags.ignoreKiKuFollowedBySa_ja_JP, "ki/ku (tekisuto/tekusuto)"],
  [Flags.ignoreProlongedSoundMark_ja_JP, "Prolonged vowels (ka-/kaa)"],
] as const;
const ignored = [
  [Flags.ignoreSeparator_ja_JP, "Punctuation characters"],
  [Flags.ignoreSpace_ja_JP, "Whitespace characters"],
  [Flags.ignoreMiddleDot_ja_JP, "Middle dots"],
] as const;

/** Edits the source transliteration flags with an isolated draft. @param props - Initial flags and dialog bindings. @returns Japanese search options. */
export function WriterJapaneseSearchDialog(
  props: Readonly<{
    initialFlags: number;
    onClose: (flags?: number) => void;
    restoreFocus: RefObject<HTMLButtonElement | null>;
  }>,
): React.JSX.Element {
  const [flags, setFlags] = useState(props.initialFlags);
  const root = useRef<HTMLFormElement>(null);
  const localization = useBrowserLocalization();
  const title = localization.GetText("writer.search.japanese.title", "Japanese Search Options");
  const restoreFocus = props.restoreFocus;

  useLayoutEffect(
    /** Focuses the modal on entry and returns to its invoker on exit. @returns Modal cleanup. */ () => {
      const invoker = restoreFocus.current;
      root.current?.focus();
      return /** Returns focus to the parent search control. @returns Nothing. */ () => {
        // The parent's inert attribute is removed when this commit finishes.
        queueMicrotask(
          /** Focuses the re-enabled parent. @returns Nothing. */ () => invoker?.focus(),
        );
      };
    },
    [restoreFocus],
  );

  /** Cancels the draft without applying any flags. @returns Nothing. */
  function cancel(): void {
    props.onClose();
  }

  /** Projects one native option group. @param legend - Group title. @param options - Flags and captions. @returns Browser fieldset. */
  function group(
    legend: string,
    options: readonly (readonly [number, string])[],
  ): React.JSX.Element {
    return (
      <fieldset className="grid gap-2 rounded border border-slate-200 p-3 sm:grid-cols-2">
        <legend className="px-1 text-sm font-semibold">{legend}</legend>
        {options.map(
          /** Presents one flag control. @param option - Native flag and caption. @returns Checkbox. */ ([
            flag,
            label,
          ]) => (
            <label key={flag} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={(flags & flag) !== 0}
                onChange={
                  /** Updates the independent draft. @param event - Changed input. @returns Nothing. */ (
                    event,
                  ) => setFlags(event.currentTarget.checked ? flags | flag : flags & ~flag)
                }
              />
              {localization.GetText(`writer.search.japanese.option.${flag}`, label)}
            </label>
          ),
        )}
      </fieldset>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4">
      <form
        ref={root}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className="grid max-h-[90dvh] w-full max-w-2xl gap-3 overflow-auto rounded-lg border border-slate-300 bg-white p-4 shadow-xl"
        onSubmit={
          /** Accepts the complete source flag set. @param event - Form submission. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            props.onClose(flags);
          }
        }
        onKeyDown={
          /** Closes only this modal on Escape. @param event - Browser key. @returns Nothing. */ (
            event,
          ) => {
            if (event.key === "Escape") {
              event.preventDefault();
              event.stopPropagation();
              cancel();
            }
          }
        }
      >
        <WriterDialogHeader title={title} onClose={cancel} />
        {group(
          localization.GetText("writer.search.japanese.equal", "Treat as Equal"),
          equivalences,
        )}
        {group(localization.GetText("writer.search.japanese.ignore", "Ignore"), ignored)}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-1"
            onClick={cancel}
          >
            {localization.GetText("writer.search.japanese.cancel", "Cancel")}
          </button>
          <button type="submit" className="rounded bg-indigo-700 px-3 py-1 text-white">
            {localization.GetText("writer.search.japanese.ok", "OK")}
          </button>
        </div>
      </form>
    </div>
  );
}
