/** Compares complete canonical no-phantom trees to compiled unmodified pinned counter/node/vector bodies. */
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {createWriterDocument} from "../../../apps/office/src/sw/source/core/doc/doc";
import {applyWriterParagraphList} from "../../../apps/office/src/sw/source/core/doc/list";
interface Item {level:number;counted:boolean;restart:boolean;actualStart:number;}
interface Row {starts:number[];items:Item[];expected:{number:number;continuation:boolean;vector:number[]}[];}
const rows:Row[]=JSON.parse(readFileSync(new URL("./native-results.json",import.meta.url),"utf8"));
let total=0;
for(const [index,row] of rows.entries()){
 const document=createWriterDocument();const rule=document.EnsureNumRule("Counters","numbered",0);
 row.starts.forEach((start,level)=>rule.GetNumFormat(level).SetStart(start));
 row.items.forEach((item,i)=>{
  const node=i===0?document.paragraphs[0]!:document.nodes.MakeTextNode();
  applyWriterParagraphList(node,{kind:"numbered",styleId:"Counters",listId:"counter-list",level:item.level});
  node.SetCountedInList(item.counted);if(item.restart)node.SetListRestart(true,item.actualStart);
 });
 const list=document.GetDocumentListsManager().GetListByName("counter-list")!;
 const actual=document.paragraphs.map(node=>({number:node.GetListItemNumber(),continuation:list.GetListItem(node)!.IsContinueingPreviousSubTree(),vector:list.GetListItemNumberVector(node)}));
 assert.deepEqual(actual,row.expected,`canonical hierarchy ${index}`);total+=actual.length;
}
console.log(`Matched ${rows.length} complete canonical hierarchies and ${total} counter/continuation/vector states against compiled unmodified pinned excerpts.`);
