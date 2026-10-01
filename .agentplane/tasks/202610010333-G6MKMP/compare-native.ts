/** Compare actual context/helper API with compiled primary constructor/query output. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FastAttributeList} from '../../../apps/office/src/xmloff/source/core/xmlimp';
import {ODF_NAMESPACES} from '../../../apps/office/src/xmloff/source/core/xmltoken';
import {XMLTextListsHelper} from '../../../apps/office/src/xmloff/source/text/txtlists';
import {XMLTextListBlockContext} from '../../../apps/office/src/xmloff/source/text/XMLTextListBlockContext';
import type {XMLTextImportTarget} from '../../../apps/office/src/xmloff/source/text/txtparai';
const data=JSON.parse(readFileSync(new URL('./native-results.json',import.meta.url),'utf8')) as {cases:{defaults:boolean;actions:{op:number;signal?:boolean;attrs?:[number,string][];id?:string}[];expected:string}[]};
const RealDate=Date,random=crypto.getRandomValues;
globalThis.Date=class extends RealDate{constructor(){super(new RealDate(2026,9,1,12,34,56,789).getTime());}} as DateConstructor;
crypto.getRandomValues=(array)=>{(array as Uint32Array).fill(0);return array;};
let states=0;
try{
for(const [index,test]of data.cases.entries()){
 const helper=new XMLTextListsHelper(),stack:XMLTextListBlockContext[]=[];
 const rules=new Map(['S','T'].map(name=>[name,{name,levelCount:10,levels:[],...(test.defaults?{defaultListId:'D'+name}:{})}]));
 const target:XMLTextImportTarget={getListRule:name=>rules.get(name),getStyle:()=>undefined,getAutoStyle:()=>undefined,createParagraph:()=>{throw new Error('No paragraph adapter in constructor comparison');}};
 const rows:unknown[][]=[];
 for(const action of test.actions){
  if(action.op===0){
   const attributes=new FastAttributeList((action.attrs??[]).map(([token,value])=>{const local=['id','continue-numbering','style-name','continue-list'][token]!;const prefix=token===0?'xml':'text';return{name:prefix+':'+local,prefix,local,uri:ODF_NAMESPACES[prefix],value};}));
   const block=new XMLTextListBlockContext(target,attributes,helper,action.signal);stack.push(block);
   rows.push([block.level,Number(block.IsRestartNumbering()),block.GetListId(),block.GetContinueListId(),helper.GetListIdForListBlock(block),helper.GetLastProcessedListId(),helper.GetListStyleOfLastProcessedList(),helper.GetLastIdOfStyleName('S')]);
  }else if(action.op===1)stack.at(-1)!.ResetRestartNumbering();
  else if(action.op===2){stack.at(-1)!.endFastElement();stack.pop();}
  else rows.push([Number(helper.IsListProcessed(action.id!)),helper.GetListStyleOfProcessedList(action.id!),helper.GetContinueListIdOfProcessedList(action.id!)]);
 }
 const expected=test.expected.split(';').filter(Boolean).map(row=>JSON.parse('['+row+']'));
 assert.deepEqual(rows,expected,`native context/helper sequence${index}`);assert.equal(helper.ListContextTop(),undefined);states+=rows.length;
}
}finally{globalThis.Date=RealDate;crypto.getRandomValues=random;}
console.log(`Matched ${data.cases.length} actual block/helper sequences/${states} raw/effective identity and restart/query states against unmodified native constructor,processed/default/generator bodies. Fixed DateTime/RNG and explicit typed/platform/reference/modern/resolved-rule adapters;no full native/UNO/factory/legacy/MSO/stable-env claim.`);
