/** @fileoverview Original portable PaperInfo value algorithms. Platform/config/libpaper discovery and owning OString toPSName remain unported;no printer or system-paper substitute is supplied. */
import { Paper } from "../../inc/paper";
import { aDinTab, MAXSLOPPY } from "./paper-data";
import type { LocaleConstReference } from "../../../udkapi/com/sun/star/lang/Locale";

/** Original country ASCII literals lowered to borrowed byte constants for OUString's actual literal equality. */
const letterCountries = [
  "US",
  "PR",
  "CA",
  "VE",
  "CL",
  "MX",
  "CO",
  "PH",
  "BZ",
  "CR",
  "GT",
  "NI",
  "PA",
  "SV",
].map(
  /** Encodes original two-byte ASCII literal. @param country - Native literal. @returns Bytes. */ (
    country,
  ) => Uint8Array.of(country.charCodeAt(0), country.charCodeAt(1)),
);

/** Original physical paper value in100th millimetres. */
export class PaperInfo {
  private m_eType: Paper;
  private m_nPaperWidth: number;
  private m_nPaperHeight: number;
  /** Original enum and explicit-dimension overloads. Native valid enum and integral tools::Long arguments are caller preconditions. @param args - Paper or width,height,optional rotated search. @returns Value. */
  constructor(...args: [paper: Paper] | [width: number, height: number, rotated?: boolean]) {
    if (args.length === 1) {
      this.m_eType = args[0];
      const row = aDinTab[this.m_eType] as (typeof aDinTab)[number];
      this.m_nPaperWidth = row[0];
      this.m_nPaperHeight = row[1];
      return;
    }
    this.m_eType = Paper.PAPER_USER;
    this.m_nPaperWidth = args[0];
    this.m_nPaperHeight = args[1];
    for (let i = 0; i < aDinTab.length; i++) {
      const row = aDinTab[i] as (typeof aDinTab)[number];
      if (args[0] === row[0] && args[1] === row[1]) {
        this.m_eType = i;
        return;
      }
    }
    if (!args[2]) return;
    for (let i = 0; i < aDinTab.length; i++) {
      const row = aDinTab[i] as (typeof aDinTab)[number];
      if (args[1] === row[0] && args[0] === row[1]) {
        this.m_eType = i;
        return;
      }
    }
  }
  /** Original paper identity. @returns Paper. */
  getPaper(): Paper {
    return this.m_eType;
  }
  /** Original physical width. @returns mm100. */
  getWidth(): number {
    return this.m_nPaperWidth;
  }
  /** Original physical height. @returns mm100. */
  getHeight(): number {
    return this.m_nPaperHeight;
  }
  /** Original first-match snapping;rotation temporarily swaps dimensions and restores their orientation. @param rotated - Try rotated only after normal pass. @returns Nothing. */
  doSloppyFit(rotated = false): void {
    if (this.m_eType !== Paper.PAPER_USER) return;
    for (let i = 0; i < aDinTab.length; i++) {
      if (i === Paper.PAPER_USER) continue;
      const row = aDinTab[i] as (typeof aDinTab)[number];
      if (
        Math.abs(row[0] - this.m_nPaperWidth) < MAXSLOPPY &&
        Math.abs(row[1] - this.m_nPaperHeight) < MAXSLOPPY
      ) {
        this.m_nPaperWidth = row[0];
        this.m_nPaperHeight = row[1];
        this.m_eType = i;
        return;
      }
    }
    if (rotated) {
      [this.m_nPaperWidth, this.m_nPaperHeight] = [this.m_nPaperHeight, this.m_nPaperWidth];
      this.doSloppyFit();
      [this.m_nPaperWidth, this.m_nPaperHeight] = [this.m_nPaperHeight, this.m_nPaperWidth];
    }
  }
  /** Original orientation-sensitive strict tolerance test. @param other - Physical value. @returns Equality within tolerance. */
  sloppyEqual(other: Readonly<PaperInfo>): boolean {
    return (
      Math.abs(this.m_nPaperWidth - (other as PaperInfo).m_nPaperWidth) < MAXSLOPPY &&
      Math.abs(this.m_nPaperHeight - (other as PaperInfo).m_nPaperHeight) < MAXSLOPPY
    );
  }
  /** Original ordered width-before-height dimension snap. @param value - mm100. @returns First matching physical dimension or original value. */
  static sloppyFitPageDimension(value: number): number {
    for (let i = 0; i < aDinTab.length; i++) {
      if (i === Paper.PAPER_USER) continue;
      const row = aDinTab[i] as (typeof aDinTab)[number];
      if (Math.abs(row[0] - value) < MAXSLOPPY) return row[0];
      if (Math.abs(row[1] - value) < MAXSLOPPY) return row[1];
    }
    return value;
  }
  /** Original ASCII-only PostScript primary/alternate matching over borrowed std::string_view bytes. @param name - Borrowed bytes,including embedded NUL. @returns Native first identity or USER. */
  static fromPSName(name: Uint8Array): Paper {
    if (name.length === 0) return Paper.PAPER_USER;
    for (let i = 0; i < aDinTab.length; i++) {
      const row = aDinTab[i] as (typeof aDinTab)[number];
      if (
        (row[2] !== null && equalAscii(row[2], name)) ||
        (row[3] !== null && equalAscii(row[3], name))
      )
        return i;
    }
    return Paper.PAPER_USER;
  }
  /** Original exact country selection;language,variant and case normalization are not consulted. @param locale - Actual borrowed UNO Locale. @returns Independent native paper value. */
  static getDefaultPaperForLocale(locale: LocaleConstReference): PaperInfo {
    return new PaperInfo(
      letterCountries.some(
        /** Uses actual source string literal equality without normalization. @param country - Native borrowed literal bytes. @returns Exact country match. */
        (country) => locale.Country.equalsAsciiL(country, 2),
      )
        ? Paper.PAPER_LETTER
        : Paper.PAPER_A4,
    );
  }
}
/** Original equalsIgnoreAsciiCase byte semantics;table names contain ASCII only. @param left - Native table name. @param right - Borrowed byte view. @returns Equality. */
function equalAscii(left: string, right: Uint8Array): boolean {
  if (left.length !== right.length) return false;
  for (let i = 0; i < left.length; i++) {
    const a = left.charCodeAt(i),
      b = right[i] as number;
    if ((a >= 65 && a <= 90 ? a + 32 : a) !== (b >= 65 && b <= 90 ? b + 32 : b)) return false;
  }
  return true;
}
