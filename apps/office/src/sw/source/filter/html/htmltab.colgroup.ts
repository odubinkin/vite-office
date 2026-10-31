/** @fileoverview Original synchronous SwHTMLParser BuildTableColGroup and TableColGrpSaveStruct from htmltab.cxx. Actual inherited lexer/ring/filter operations are consumed directly; the bound virtual consumer crosses protected TypeScript responsibility visibility without another parser or token stream. */
import type { SwHTMLParser } from "./swhtml";
import type { HTMLTable } from "./htmltab";
import { HtmlTokenId as T, HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { aHTMLPAlignTable } from "./swhtml.options";
import { aHTMLTableVAlignTable } from "./htmltab.options";
/** Original synchronous save value retains group defaults and the source span-zero child-COL marker. Pending input is unrepresented by the current real memory stream. */
class TableColGrpSaveStruct {
  nColGrpSpan = 1;
  nColGrpWidth = 0;
  bRelColGrpWidth = false;
  eColGrpAdjust = A.End;
  eColGrpVertOri: number = V.TOP;
  /** Original final group publication. @param table - Actual grid. @returns Nothing. */
  CloseColGroup(table: HTMLTable): void {
    table.CloseColGroup(
      this.nColGrpSpan,
      this.nColGrpWidth,
      this.bRelColGrpWidth,
      this.eColGrpAdjust,
      this.eColGrpVertOri,
    );
  }
}
/** Original group/COL options use reverse duplicate precedence, uint16 narrowing before the256limit and asterisk-only relative-width admission. @param parser - Actual lexer/options owner. @param value - Actual source save fields. @returns Nothing. */
function ReadColumnOptions(parser: SwHTMLParser, value: TableColGrpSaveStruct): void {
  const options = parser.GetOptions();
  for (let i = options.length; i;) {
    const option = options[--i];
    if (!option) throw new Error("assert(HTML column option)");
    switch (option.GetToken()) {
      case O.ID:
        parser.InsertBookmark(option.GetString());
        break;
      case O.SPAN:
        value.nColGrpSpan = option.GetNumber() & 65535;
        if (value.nColGrpSpan > 256) value.nColGrpSpan = 1;
        break;
      case O.WIDTH:
        value.nColGrpWidth = option.GetNumber() & 65535;
        value.bRelColGrpWidth = option.GetString().includes("*");
        break;
      case O.ALIGN:
        value.eColGrpAdjust = option.GetEnum(aHTMLPAlignTable, value.eColGrpAdjust);
        break;
      case O.VALIGN:
        value.eColGrpVertOri = option.GetEnum(aHTMLTableVAlignTable, value.eColGrpVertOri);
        break;
    }
  }
}
/** Original synchronous column-group loop, including retained boundary tokens, source whitespace admission and real native body fallback. Current streams cannot yield pending device input; unrepresented floating/applet virtual-consumer modes are not fabricated. @param parser - Actual importer/lexer. @param current - Actual outer current table. @param table - Actual current group grid. @param readOptions - COLGROUP was consumed. @param consume - Bound original NextToken virtual consumer. @returns Nothing. */
export function BuildTableColGroup(
  parser: SwHTMLParser,
  current: HTMLTable,
  table: HTMLTable,
  readOptions: boolean,
  consume: (token: T) => void,
): void {
  if (!parser.IsParserWorking()) return;
  const saved = new TableColGrpSaveStruct();
  if (readOptions) ReadColumnOptions(parser, saved);
  parser.SaveState(T.NONE);
  let token = parser.GetNextToken(),
    done = false;
  while (parser.IsParserWorking() && !done) {
    parser.SaveState(token);
    token = parser.FilterToken(token);
    switch (token) {
      case T.TABLE_ON:
        if (!table.GetContext()) {
          parser.SkipToken(-1);
          done = true;
        }
        break;
      case T.COLGROUP_ON:
      case T.THEAD_ON:
      case T.TFOOT_ON:
      case T.TBODY_ON:
      case T.TABLEROW_ON:
      case T.TABLE_OFF:
        parser.SkipToken(-1);
        done = true;
        break;
      case T.COLGROUP_OFF:
        done = true;
        break;
      case T.COL_ON: {
        const col = new TableColGrpSaveStruct();
        col.nColGrpWidth = saved.nColGrpWidth;
        col.bRelColGrpWidth = saved.bRelColGrpWidth;
        col.eColGrpAdjust = saved.eColGrpAdjust;
        col.eColGrpVertOri = saved.eColGrpVertOri;
        ReadColumnOptions(parser, col);
        table.InsertCol(
          col.nColGrpSpan,
          col.nColGrpWidth,
          col.bRelColGrpWidth,
          col.eColGrpAdjust,
          col.eColGrpVertOri,
        );
        saved.nColGrpSpan = 0;
        break;
      }
      case T.COL_OFF:
      case T.MULTICOL_ON:
        break;
      case T.TEXTTOKEN:
        if (
          (table.GetContext() || !table.HasParentSection()) &&
          parser.aToken.length === 1 &&
          parser.aToken === " "
        )
          break;
        table.MakeParentContents(current);
        consume(token);
        break;
      default:
        table.MakeParentContents(current);
        consume(token);
        break;
    }
    if (parser.IsParserWorking()) parser.SaveState(T.NONE);
    if (!done) token = parser.GetNextToken();
  }
  if (parser.GetStatus() === S.Pending)
    throw new Error(
      "HTML column-group pending input requires the native pending-stack/device owner",
    );
  saved.CloseColGroup(table);
}
