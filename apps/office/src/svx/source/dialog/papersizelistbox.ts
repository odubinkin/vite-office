/** @fileoverview Original SvxPaperSizeListBox fill and fallback selection from papersizelistbox.cxx; browser controls supply translated labels and actual selection events. */
import { Paper } from "../../../i18nutil/inc/paper";
import { RID_SVXSTRARY_PAPERSIZE_STD, RID_SVXSTRARY_PAPERSIZE_DRAW } from "./page";
/** Original papersizelistbox.hxx application identity. */
export enum PaperSizeApp {
  Std,
  Draw,
}
/** Immutable browser projection of one actual native list row. */
export interface PaperSizeEntry {
  readonly paper: Paper;
  readonly label: string;
}
/** Original value/list selection owner; no duplicate Writer-specific paper catalog. */
export class SvxPaperSizeListBox {
  private entries: PaperSizeEntry[] = [];
  private selected = -1;
  /** Original fill appends rather than silently clearing caller state. @param app - Source application list. @param translate - Actual label translation port. @returns Nothing. */
  FillPaperSizeEntries(
    app: PaperSizeApp,
    translate: (context: string, text: string) => string = sourceLabel,
  ): void {
    const rows =
        app === PaperSizeApp.Std ? RID_SVXSTRARY_PAPERSIZE_STD : RID_SVXSTRARY_PAPERSIZE_DRAW,
      context =
        app === PaperSizeApp.Std ? "RID_SVXSTRARY_PAPERSIZE_STD" : "RID_SVXSTRARY_PAPERSIZE_DRAW";
    for (const [label, paper] of rows)
      this.entries.push(Object.freeze({ paper, label: translate(context, label) }));
  }
  /** Original set-active scans source order and falls back to the last prior USER row. @param paper - Requested Paper identity. @returns Nothing. */
  set_active_id(paper: Paper): void {
    let selected = -1,
      user = -1;
    for (let index = 0; index < this.entries.length; index++) {
      const candidate = (this.entries[index] as PaperSizeEntry).paper;
      if (candidate === paper) {
        selected = index;
        break;
      }
      if (candidate === Paper.PAPER_USER) user = index;
    }
    this.selected = selected !== -1 ? selected : user;
  }
  /** Original empty active id converts to integer0. @returns Native selected paper. */
  get_active_id(): Paper {
    return this.entries[this.selected]?.paper ?? Paper.PAPER_A0;
  }
  /** Platform list snapshot retains actual insertion order. @returns Immutable rows. */
  GetEntries(): readonly PaperSizeEntry[] {
    return Object.freeze([...this.entries]);
  }
  /** Original caller clears the control before a reset/fill. @returns Nothing. */
  clear(): void {
    this.entries = [];
    this.selected = -1;
  }
}
/** Source English fallback without inventing a translation service. @param context - Original resource context. @param text - Source label. @returns Source text. */
function sourceLabel(context: string, text: string): string {
  void context;
  return text;
}
