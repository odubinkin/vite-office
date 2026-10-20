/** @fileoverview Static presenter review fixture; emitted intents are journaled, not implemented as fake document commands. */
import { createRoot } from "react-dom/client";
import { ScDocument } from "../../../apps/office/src/sc/inc/document";
import { ScAddress } from "../../../apps/office/src/sc/inc/address";
import { ScViewData } from "../../../apps/office/src/sc/source/ui/inc/viewdata";
import { FormulaGrammar } from "../../../apps/office/src/formula/inc/grammar";
import { CellType } from "../../../apps/office/src/sc/inc/global";
import { unicode, text } from "../../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
import { ScGridWindow } from "../../../apps/office/src/sc/browser/presentation/ScGridWindow";
import { ScInputWindow } from "../../../apps/office/src/sc/browser/presentation/ScInputWindow";
import { ScTabControl } from "../../../apps/office/src/sc/browser/presentation/ScTabControl";
import "../../../apps/office/src/vcl/browser/styles.css";
const document = new ScDocument();
document.InsertTab(0, unicode("Sheet1"));
document.InsertTab(1, unicode("Forecast"));
for (const [column, row, value] of [[0,0,"Item"],[1,0,"Quantity"],[2,0,"Unit price"],[3,0,"Total"],[0,1,"Notebook"],[0,2,"Pen"]] as const) document.SetTextCell(new ScAddress(column,row,0),unicode(value));
for (const [column,row,value] of [[1,1,3],[2,1,4.5],[1,2,10],[2,2,1.2]] as const) document.SetValue(new ScAddress(column,row,0),value);
document.SetFormula(new ScAddress(3,1,0),unicode("=B2*C2"),FormulaGrammar.Grammar.GRAM_NATIVE);
document.SetFormula(new ScAddress(3,2,0),unicode("=B3*C3"),FormulaGrammar.Grammar.GRAM_NATIVE);
const view = new ScViewData(document); view.SetCurX(3); view.SetCurY(1);
const journal: unknown[][] = [];
/** Retains emitted UI intents for fixture inspection. @param args - Controller intent. @returns Nothing. */
function record(...args: unknown[]): void { journal.push(args); }
/** Reads actual scalar/formula cell content for the static review fixture. @param position - Native cell. @returns Presentation. */
function getCell(position:ScAddress) {
  if (document.GetCellType(position)===CellType.CELLTYPE_STRING) { const value=document.GetSharedString(position); try {return {text:text(value.getString()),alignment:"left" as const};}finally {value.dispose();} }
  return {text:document.GetCellType(position)===CellType.CELLTYPE_NONE?"":String(document.GetValue(position)),alignment:"right" as const};
}
const host = globalThis.document.getElementById("root");
if (!host) throw new Error("Review host missing");
createRoot(host).render(<main className="flex h-screen flex-col overflow-hidden bg-white">
  <ScInputWindow addressText="D2" inputText="=B2*C2" editing={false} enabledActions={new Set()} onAddressChange={record} onAddressKeyDown={record} onInput={record} onInputFocus={record} onInputKeyDown={record} onAction={record}/>
  <ScGridWindow idPrefix="review" viewData={view} viewport={{firstColumn:0,firstRow:0,columns:14,rows:32,columnWidth:96,rowHeight:22,scrollTop:0,scrollHeight:1000000}} editing={false} inputText="" getCell={getCell} onSelect={record} onHeader={record} onEdit={record} onKeyDown={record} onScroll={record} onInput={record} onInputKeyDown={record}/>
  <ScTabControl viewData={view} canInsert={false} onSelect={record} onInsert={record} onScroll={record} onKeyDown={record}/>
</main>);
