/** Compares real xmloff list/item/header events to compiled unmodified pinned exportListChange. */
import {readFileSync} from "node:fs";
import assert from "node:assert/strict";
import {exportTextParagraphs, type XMLTextParagraphSource} from "../../../apps/office/src/xmloff/source/text/txtparae";
interface Item {level:number;counted:boolean;restart:boolean;start:number;}
interface Row {items:Item[];expected:string[];}
const rows:Row[]=JSON.parse(readFileSync(new URL("./native-results.json",import.meta.url),"utf8"));
const rule={name:"Counters",levels:Array.from({length:10},()=>({kind:"numbered" as const,startWith:7}))};
for(const [index,row] of rows.entries()){
 const paragraphs:XMLTextParagraphSource[]=row.items.map((item,i)=>({style:"Standard",runs:[{text:String(i),properties:{bold:false,italic:false,underline:false}}],list:{listId:"list1",level:item.level,counted:item.counted,rule,...(item.restart?{startValue:item.start}:{})}}));
 const output=exportTextParagraphs({paragraphs:()=>paragraphs.values()});
 let p=0;const events:string[]=[];
 for(const token of output.body.matchAll(/<(\/?)(?:text:)(list-header|list-item|list|p)(?=[\s>])[^>]*>/gu)){
  if(token[2]==="p"){if(token[1]!=="/")events.push(`p${p++}`);}
  else events.push(`${token[1]==="/"?"-":"+"}${token[2]}`);
 }
 assert.deepEqual(events,row.expected,`native export event case ${index}`);
}
console.log(`Matched ${rows.length} list/item/header event sequences from the actual xmloff exporter against unmodified pinned exportListChange.`);
