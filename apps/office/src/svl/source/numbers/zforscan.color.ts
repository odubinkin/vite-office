/** @fileoverview Original scanner color-name recognition, conversion and real formatter color callbacks. */
import { strip } from "../../../comphelper/source/misc/string";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { getLoadedLocale } from "../../../unotools/source/i18n/localedatawrapper";
import { convertLocaleToLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { CharClass } from "../../../unotools/source/i18n/charclass";
import {
  Color,
  COL_BLACK,
  COL_LIGHTBLUE,
  COL_LIGHTGREEN,
  COL_LIGHTCYAN,
  COL_LIGHTRED,
  COL_LIGHTMAGENTA,
  COL_BROWN,
  COL_GRAY,
  COL_YELLOW,
  COL_WHITE,
} from "../../../tools/inc/color";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import { GermanColorName } from "./zforscan.keywords";
import { ImpSvNumberformatScan, KeywordLocalization } from "./zforscan";
/** Original zforscan.hxx bound. */
export const NF_MAX_DEFAULT_COLORS = 10;
/** Original const standard-color vector and ordering. */
export const StandardColor: readonly Color[] = Object.freeze(
  [
    COL_BLACK,
    COL_LIGHTBLUE,
    COL_LIGHTGREEN,
    COL_LIGHTCYAN,
    COL_LIGHTRED,
    COL_LIGHTMAGENTA,
    COL_BROWN,
    COL_GRAY,
    COL_YELLOW,
    COL_WHITE,
  ].map(
    /** Copies the original vector initializer values into their own Color elements. @param color - Native constant. @returns Owned vector value. */ (
      color,
    ) => new Color(color),
  ),
);
/** Original German locale anyOf list used for color conversion. @param language - Native language ID. @returns Whether one of the original German variants. */
function german(language: number): boolean {
  return [0x0407, 0x0807, 0x0c07, 0x1007, 0x1407].includes(language);
}
/** Materializes the original lazy prefix+string expression and moves it into the target owner. @param target - Actual result. @param prefix - Borrowed original prefix. @param suffix - Borrowed original suffix. @returns Nothing. */
function prepend(
  target: OUString,
  prefix: OUStringConstReference,
  suffix: OUStringConstReference,
): void {
  const result = new OUString(new StringConcat(prefix, suffix));
  try {
    target.moveAssign(result);
  } finally {
    result.dispose();
  }
}
/** Original GetColor, including German legacy names, AllowEnglish fallback and callback-index validation. @param this - Actual scanner. @param name - Mutable color prefix. @returns Borrowed native palette/callback color or null. */
export function GetColor(this: ImpSvNumberformatScan, name: OUString): Color | null {
  const upper = this.GetChrCls().uppercase(name),
    keywords = this.GetKeywords();
  try {
    let index = 0;
    while (
      index < NF_MAX_DEFAULT_COLORS &&
      !upper.equals(keywords[K.FIRSTCOLOR + index] as OUStringConstReference)
    )
      ++index;
    if (
      index >= NF_MAX_DEFAULT_COLORS &&
      this["meKeywordLocalization"] === KeywordLocalization.AllowEnglish
    ) {
      const loaded = getLoadedLocale(this.GetLoc().getMyLocale());
      let language: number;
      try {
        language = convertLocaleToLanguage(loaded);
      } finally {
        loaded.dispose();
      }
      if (german(language)) {
        let english = 0;
        while (
          english < NF_MAX_DEFAULT_COLORS &&
          !upper.equals(
            ImpSvNumberformatScan.GetEnglishKeywords()[
              K.FIRSTCOLOR + english
            ] as OUStringConstReference,
          )
        )
          ++english;
        if (english < NF_MAX_DEFAULT_COLORS) index = english;
      }
    }
    let conversion = 0;
    if (this["bConvertMode"]) {
      const from = german(this["eTmpLnge"]),
        to = german(this["eNewLnge"]);
      if (from && !to) conversion = 1;
      else if (!from && to) conversion = 2;
    }
    let result: Color | null = null;
    if (index >= NF_MAX_DEFAULT_COLORS) {
      const colorWord = keywords[K.COLOR] as OUStringConstReference;
      let localized = true;
      if (
        (localized = upper.startsWith(colorWord)) ||
        (this["meKeywordLocalization"] === KeywordLocalization.AllowEnglish &&
          upper.startsWith(
            ImpSvNumberformatScan.GetEnglishKeywords()[K.COLOR] as OUStringConstReference,
          ))
      ) {
        const position = localized
            ? colorWord.getLength()
            : (
                ImpSvNumberformatScan.GetEnglishKeywords()[K.COLOR] as OUStringConstReference
              ).getLength(),
          tail = name.copy(position);
        try {
          name.moveAssign(tail);
          const trimmed = strip(name, 32);
          try {
            name.moveAssign(trimmed);
          } finally {
            trimmed.dispose();
          }
          switch (conversion) {
            case 0:
              prepend(name, colorWord, name);
              break;
            case 1:
              prepend(
                name,
                ImpSvNumberformatScan.GetEnglishKeywords()[K.COLOR] as OUStringConstReference,
                name,
              );
              break;
            case 2: {
              const word = unicode(GermanColorName(K.COLOR - K.COLOR));
              try {
                prepend(name, word, name);
              } finally {
                word.dispose();
              }
              break;
            }
          }
          const upperTail = upper.copy(position);
          try {
            upper.moveAssign(upperTail);
          } finally {
            upperTail.dispose();
          }
          const stripped = strip(upper, 32);
          try {
            upper.moveAssign(stripped);
          } finally {
            stripped.dispose();
          }
          if (CharClass.isAsciiNumeric(text(upper))) {
            const ordinal = upper.toInt32();
            if (ordinal > 0 && ordinal <= 64)
              result = this.getColorCallback().GetUserDefColor(ordinal - 1);
          }
        } finally {
          tail.dispose();
        }
      }
    } else {
      name.clear();
      switch (conversion) {
        case 0:
          name.assign(keywords[K.FIRSTCOLOR + index] as OUStringConstReference);
          break;
        case 1:
          name.assign(
            ImpSvNumberformatScan.GetEnglishKeywords()[
              K.FIRSTCOLOR + index
            ] as OUStringConstReference,
          );
          break;
        case 2: {
          const word = unicode(GermanColorName(K.FIRSTCOLOR - K.COLOR + index));
          try {
            name.moveAssign(word);
          } finally {
            word.dispose();
          }
          break;
        }
      }
      result = StandardColor[index] as Color;
    }
    return result;
  } finally {
    upper.dispose();
  }
}
