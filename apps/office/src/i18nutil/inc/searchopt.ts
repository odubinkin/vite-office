/** @fileoverview i18nutil::SearchOptions2 value fields and native defaults from searchopt.hxx. */
import { OUString } from "../../sal/inc/rtl/ustring";
import { Locale } from "../../udkapi/com/sun/star/lang/Locale";

/** Native typed search options. The default algorithm identity is zero, not ABSOLUTE. */
export class SearchOptions2 {
  public searchFlag = 0;
  public readonly searchString = new OUString();
  public readonly replaceString = new OUString();
  public readonly Locale = new Locale();
  public changedChars = 0;
  public deletedChars = 0;
  public insertedChars = 0;
  public transliterateFlags = 0;
  public AlgorithmType2 = 0;
  public WildcardEscapeCharacter = 0;

  /** Copies the complete native value, retaining independent string/locale fields. @param source - Optional copied options. @returns Initialized options. */
  public constructor(source?: SearchOptions2) {
    if (source !== undefined) {
      this.searchFlag = source.searchFlag;
      this.searchString.assign(source.searchString);
      this.replaceString.assign(source.replaceString);
      this.Locale.assign(source.Locale);
      this.changedChars = source.changedChars;
      this.deletedChars = source.deletedChars;
      this.insertedChars = source.insertedChars;
      this.transliterateFlags = source.transliterateFlags;
      this.AlgorithmType2 = source.AlgorithmType2;
      this.WildcardEscapeCharacter = source.WildcardEscapeCharacter;
    }
  }
}
