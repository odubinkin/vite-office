/** @fileoverview Stack-local fields of the original FinalScan function. This lifetime groups source locals across responsibility fragments; the actual scanner remains the sole format/token owner. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import type { LocaleDataWrapper } from "../../../unotools/source/i18n/localedatawrapper";
import type { CharClass } from "../../../unotools/source/i18n/charclass";
import { NfKeywordIndex as K } from "../../inc/nfkeytab";
import type { ImpSvNumberformatScan } from "./zforscan";
/** Actual source FinalScan automatic locals and seven owned saved strings, disposed when the original function returns. */
export class FinalScanState {
  readonly sOldDecSep = new OUString();
  readonly sOldThousandSep = new OUString();
  readonly sOldDateSep = new OUString();
  readonly sOldTimeSep = new OUString();
  readonly sOldTime100SecSep = new OUString();
  readonly sOldCurSymbol = new OUString();
  readonly sOldCurString = new OUString();
  readonly cOldKeyH: number;
  readonly cOldKeyMI: number;
  readonly cOldKeyS: number;
  readonly eOldDateOrder: number;
  pLoc: LocaleDataWrapper;
  readonly pChrCls: CharClass;
  nDayPos = 65535;
  nMonthPos = 65535;
  nYearPos = 65535;
  bNewDateOrder = false;
  nPos = 0;
  i = 0;
  nCounter = 0;
  bThaiT = false;
  bTimePart = false;
  bDenomin = false;
  /** Original setup saves old-language fields before changing the actual current-language service. @param scanner - Real owner. @returns Source automatic lifetime. */
  constructor(scanner: ImpSvNumberformatScan) {
    const language = scanner.GetCurrentLanguageData();
    this.pLoc = language.GetLocaleData();
    try {
      this.sOldDecSep.assign(language.GetNumDecimalSep());
      this.sOldThousandSep.assign(language.GetNumThousandSep());
      this.sOldDateSep.assign(language.GetDateSep());
      this.sOldTimeSep.assign(this.pLoc.getTimeSep());
      this.sOldTime100SecSep.assign(this.pLoc.getTime100SecSep());
      this.sOldCurSymbol.assign(scanner.GetCurSymbol());
      this.sOldCurString.assign(scanner.GetCurString());
      this.cOldKeyH = (scanner["sKeyword"][K.H] as OUString).getStr()[0] as number;
      this.cOldKeyMI = (scanner["sKeyword"][K.MI] as OUString).getStr()[0] as number;
      this.cOldKeyS = (scanner["sKeyword"][K.S] as OUString).getStr()[0] as number;
      this.eOldDateOrder = this.pLoc.getDateOrder();
      if (
        this.sOldThousandSep.getLength() === 1 &&
        (this.sOldThousandSep.getStr()[0] === 160 || this.sOldThousandSep.getStr()[0] === 8239)
      ) {
        const space = unicode(" ");
        try {
          this.sOldThousandSep.assign(space);
        } finally {
          space.dispose();
        }
      }
      if (scanner["bConvertMode"]) {
        language.ChangeIntl(scanner["eNewLnge"]);
        this.pLoc = language.GetLocaleData();
        scanner["InitKeywords"]();
        this.bNewDateOrder =
          scanner["mbConvertDateOrder"] && this.eOldDateOrder !== this.pLoc.getDateOrder();
      }
      this.pChrCls = language.GetCharClass();
      scanner["nResultStringsCnt"] = scanner["nStringsCnt"];
      scanner["bDecSep"] = false;
    } catch (error) {
      this.dispose();
      throw error;
    }
  }
  /** Original automatic string destruction at function return. @returns Nothing. */
  dispose(): void {
    this.sOldCurString.dispose();
    this.sOldCurSymbol.dispose();
    this.sOldTime100SecSep.dispose();
    this.sOldTimeSep.dispose();
    this.sOldDateSep.dispose();
    this.sOldThousandSep.dispose();
    this.sOldDecSep.dispose();
  }
}
