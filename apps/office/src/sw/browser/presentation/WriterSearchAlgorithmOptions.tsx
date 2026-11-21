/** @fileoverview Algorithm and character-width controls of the native Find and Replace options grid. */
import type { RefObject } from "react";
import { SearchOptionFlags } from "../../../svl/inc/srchdefs";
import type { WriterSearchItem } from "../../source/uibase/uiview/viewsrch";

/** Dialog state and callbacks for the algorithm rows. */
interface WriterSearchAlgorithmOptionsProps {
  readonly item: WriterSearchItem;
  readonly styleMode: boolean;
  readonly hasOption: (flag: SearchOptionFlags) => boolean;
  readonly update: (changes: Partial<WriterSearchItem>) => void;
  readonly text: (key: string, fallback: string) => string;
  readonly buttonStyle: string;
  readonly similarityOptionsButton: RefObject<HTMLButtonElement | null>;
  readonly openSimilarity: () => void;
}

/** Shows the source controls and disables incompatible search algorithms. @param props - Current search options and handlers. @returns Search option rows. */
export function WriterSearchAlgorithmOptions({
  item,
  styleMode,
  hasOption,
  update,
  text,
  buttonStyle,
  similarityOptionsButton,
  openSimilarity,
}: WriterSearchAlgorithmOptionsProps) {
  return (
    <>
      <label className="flex items-center gap-1 text-sm sm:col-start-1 sm:row-start-3">
        <input
          type="checkbox"
          checked={item.regularExpression}
          disabled={styleMode || item.similaritySearch || !hasOption(SearchOptionFlags.REG_EXP)}
          onChange={
            /** Enables the platform regular-expression engine. @param event - Updated control. @returns Nothing. */ (
              event,
            ) =>
              update(
                event.currentTarget.checked
                  ? { regularExpression: true, wholeWords: false, similaritySearch: false }
                  : { regularExpression: false },
              )
          }
        />
        {text("regexp", "Regular expressions")}
      </label>
      <label className="flex items-center gap-1 text-sm sm:col-start-2 sm:row-start-3">
        <input
          type="checkbox"
          checked={item.matchCharacterWidth}
          disabled={item.useAsianOptions}
          onChange={
            /** Updates the dialog width option. @param event - Updated control. @returns Nothing. */ (
              event,
            ) => update({ matchCharacterWidth: event.currentTarget.checked })
          }
        />
        {text("match-character-width", "Match character width")}
      </label>
      <div className="flex items-center gap-2 sm:col-start-1 sm:row-start-4">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={item.similaritySearch}
            disabled={
              item.regularExpression || styleMode || !hasOption(SearchOptionFlags.SIMILARITY)
            }
            onChange={
              /** Enables the native similarity algorithm. @param event - Updated control. @returns Nothing. */ (
                event,
              ) => update({ similaritySearch: event.currentTarget.checked })
            }
          />
          {text("similarity-search", "Similarity search")}
        </label>
        <button
          type="button"
          ref={similarityOptionsButton}
          className={buttonStyle}
          disabled={!item.similaritySearch || !hasOption(SearchOptionFlags.SIMILARITY)}
          onClick={openSimilarity}
        >
          {text("similarities", "Similarities…")}
        </button>
      </div>
    </>
  );
}
