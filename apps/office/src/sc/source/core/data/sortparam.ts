/** @fileoverview Native Calc sort parameter values consumed by the database range and ODS filter. */
import { LANGUAGE_SYSTEM } from "../../../../i18nlangtag/inc/lang";
import { LanguageTag } from "../../../../i18nlangtag/inc/languagetag";

/** Original ODF embedded-number behavior. */
export enum ScSortNumberBehavior {
  ALPHA_NUMERIC,
  DOUBLE,
  INTEGER,
}

/** Original individual sort key, with an absolute field on the native range axis. */
export class ScSortKeyState {
  public nField = 0;
  public bDoSort = false;
  public bAscending = true;
}

/** Original options attached to data moved or copied by the sort. */
export class ScDataAreaExtras {
  public mbCellNotes = false;
  public mbCellDrawObjects = false;
  public mbCellFormats = false;
}

/** Native sort descriptor, including original Clear defaults relevant to XML. */
export class ScSortParam {
  public nCol1 = 0;
  public nRow1 = 0;
  public nCol2 = 0;
  public nRow2 = 0;
  public nSourceTab = 0;
  public readonly aDataAreaExtras = new ScDataAreaExtras();
  public nUserIndex = 0;
  public bHasHeader = false;
  public bByRow = true;
  public bCaseSens = false;
  public eSortNumberBehavior = ScSortNumberBehavior.ALPHA_NUMERIC;
  public bUserDef = false;
  public bInplace = true;
  public nDestTab = 0;
  public nDestCol = 0;
  public nDestRow = 0;
  public maKeyState = [new ScSortKeyState(), new ScSortKeyState(), new ScSortKeyState()];
  public readonly aCollatorLocale = LanguageTag.convertToLocale(LANGUAGE_SYSTEM, false);
  public aCollatorAlgorithm = "";
  public nCompatHeader = 2;

  /** Initializes the original data area inclusion flags. @returns A default sort descriptor. */
  public constructor() {
    this.aDataAreaExtras.mbCellDrawObjects = true;
    this.aDataAreaExtras.mbCellFormats = true;
  }

  /** Copies the native value fields and independently owned locale and keys. @param source - Source descriptor. @returns This descriptor. */
  public assign(source: ScSortParam): this {
    const { aCollatorLocale, aDataAreaExtras, maKeyState, ...scalar } = source;
    Object.assign(this, scalar);
    this.aCollatorLocale.assign(aCollatorLocale);
    Object.assign(this.aDataAreaExtras, aDataAreaExtras);
    this.maKeyState = maKeyState.map(
      /** Copies a key without sharing mutation. @param key - Source key. @returns Independent key. */
      (key) => Object.assign(new ScSortKeyState(), key),
    );
    return this;
  }

  /** Releases the retained native locale members. @returns Nothing. */
  public Dispose(): void {
    this.aCollatorLocale.dispose();
  }
}
