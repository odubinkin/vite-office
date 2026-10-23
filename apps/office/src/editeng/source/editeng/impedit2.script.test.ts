/** @fileoverview Source single-paragraph script lookup and SvxStyleBox caret sampling over actual native value objects;cached script runs are explicit initialized inputs,not ICU analysis evidence. */
import { expect, it, vi } from "vitest";
import { ESelection } from "../../inc/ESelection";
import { ScriptTypePosInfo } from "../../inc/ParagraphPortion";
import { getSingleParagraphItemScriptType } from "./impedit2.script";
import * as Script from "../../../offapi/com/sun/star/i18n/ScriptType";
import { SvtScriptType as Svt } from "../../../svl/inc/languageoptions";
import { LANGUAGE_ENGLISH_US, LANGUAGE_ARABIC_SAUDI_ARABIA } from "../../../i18nlangtag/inc/lang";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { checkStylePreviewScripts } from "../../../svx/source/tbxctrls/tbcontrl.stylerender";

/** Actual native cached-position value objects with explicit initialized Latin/Asian/CTL spans. */
const types = [
  new ScriptTypePosInfo(Script.LATIN, 0, 1),
  new ScriptTypePosInfo(Script.ASIAN, 1, 2),
  new ScriptTypePosInfo(Script.COMPLEX, 2, 3),
];
it("uses the next character at zero and preceding character at other collapsed UTF16 positions", /** Mirrors source bare-cursor adjustment rather than ordinary right-open caret membership. @returns Nothing. */ () => {
  expect(
    [0, 1, 2, 3].map(
      /** Queries actual caret values. @param position - UTF16 offset. @returns Source flags. */ (
        position,
      ) =>
        getSingleParagraphItemScriptType(types, new ESelection(0, position), LANGUAGE_ENGLISH_US),
    ),
  ).toEqual([Svt.LATIN, Svt.LATIN, Svt.ASIAN, Svt.COMPLEX]);
  expect([types[0]?.nScriptType, types[0]?.nStartPos, types[0]?.nEndPos]).toEqual([
    Script.LATIN,
    0,
    1,
  ]);
});
it("retains endpoint-only membership and therefore omits an entirely interior script span", /** This apparent native range-union defect is preserved as WRITER077. @returns Nothing. */ () => {
  const forward = new ESelection(0, 0, 0, 3),
    reverse = new ESelection(0, 3, 0, 0);
  expect(getSingleParagraphItemScriptType(types, forward, LANGUAGE_ENGLISH_US)).toBe(
    Svt.LATIN | Svt.COMPLEX,
  );
  expect(getSingleParagraphItemScriptType(types, reverse, LANGUAGE_ENGLISH_US)).toBe(
    Svt.LATIN | Svt.COMPLEX,
  );
  expect(reverse.start.nIndex).toBe(3);
  expect(reverse.end.nIndex).toBe(0);
  expect(
    getSingleParagraphItemScriptType(types, new ESelection(0, 0, 0, 2), LANGUAGE_ENGLISH_US),
  ).toBe(Svt.LATIN | Svt.ASIAN);
  expect(
    getSingleParagraphItemScriptType(types, new ESelection(0, 1, 0, 3), LANGUAGE_ENGLISH_US),
  ).toBe(Svt.ASIAN | Svt.COMPLEX);
});
it("ignores WEAK spans and uses the actual default-language owner for an empty result", /** Empty initialized data also represents the native empty-paragraph path. @returns Nothing. */ () => {
  const weak = [new ScriptTypePosInfo(Script.WEAK, 0, 1)];
  expect(
    getSingleParagraphItemScriptType(weak, new ESelection(0, 0), LANGUAGE_ARABIC_SAUDI_ARABIA),
  ).toBe(Svt.COMPLEX);
  expect(getSingleParagraphItemScriptType([], new ESelection(0, 0), LANGUAGE_ENGLISH_US)).toBe(
    Svt.LATIN,
  );
  expect(
    /** A multi-paragraph EditEngine operation is outside this explicitly extracted helper. @returns Source flags. */ () =>
      getSingleParagraphItemScriptType(types, new ESelection(0, 0, 1, 1), LANGUAGE_ENGLISH_US),
  ).toThrow("one resolved paragraph");
});
it("preserves original CheckScript sampling/emission through the actual collapsed-selection operation", /** WRITER073 remains visible even with correct initialized native script spans. @returns Nothing. */ () => {
  const name = unicode("A字ش"),
    calls: number[][] = [];
  try {
    const result = checkStylePreviewScripts(
      name,
      /** Executes actual native value/range code rather than a fabricated EditEngine instance. @param selection - Actual ESelection. @returns Source script flags. */ (
        selection,
      ) => {
        calls.push([
          selection.start.nPara,
          selection.start.nIndex,
          selection.end.nPara,
          selection.end.nIndex,
        ]);
        return getSingleParagraphItemScriptType(types, selection, LANGUAGE_ENGLISH_US);
      },
    );
    expect(calls).toEqual([
      [0, 0, 0, 0],
      [0, 1, 0, 1],
      [0, 2, 0, 2],
      [0, 3, 0, 3],
    ]);
    expect(result).toEqual([
      { scriptType: Svt.LATIN, changePos: 2, textWidth: 0 },
      { scriptType: Svt.ASIAN, changePos: 3, textWidth: 0 },
    ]);
  } finally {
    name.dispose();
  }
});
it("emits the last unchanged run and refuses an empty style label before querying", /** Original nonempty assertion is an explicit JS input boundary. @returns Nothing. */ () => {
  const name = unicode("AB"),
    empty = unicode("");
  const query = vi.fn(
    /** Explicit unchanged source script. @returns Latin flag. */ () => Svt.LATIN,
  );
  try {
    expect(checkStylePreviewScripts(name, query)).toEqual([
      { scriptType: Svt.LATIN, changePos: 2, textWidth: 0 },
    ]);
    expect(query).toHaveBeenCalledTimes(3);
    query.mockClear();
    expect(
      /** Empty labels violate the source preview precondition. @returns Native run values. */ () =>
        checkStylePreviewScripts(empty, query),
    ).toThrow("nonempty text");
    expect(query).not.toHaveBeenCalled();
  } finally {
    name.dispose();
    empty.dispose();
  }
});
