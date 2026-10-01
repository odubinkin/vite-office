/** Compares actual shared conversion and item contexts to compiled pinned integer/range bodies. */
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {FastAttributeList,parseOdfXmlStream} from '../../../apps/office/src/xmloff/source/core/xmlimp';
import {ODF_NAMESPACES,XMLToken} from '../../../apps/office/src/xmloff/source/core/xmltoken';
import {XMLTextBodyContext,type XMLParagraphListState,type XMLTextImportTarget} from '../../../apps/office/src/xmloff/source/text/txtparai';
const rows:{value:string;number:number;start:number;header:number}[]=JSON.parse(readFileSync(new URL('./native-results.json',import.meta.url),'utf8'));
assert.equal(new FastAttributeList([]).getAsInteger(XMLToken.TEXT_START_VALUE),null);
let contexts=0;
for(const row of rows){
 const attributes=new FastAttributeList([{name:'text:start-value',prefix:'text',local:'start-value',uri:ODF_NAMESPACES.text,value:row.value}]);
 assert.equal(attributes.getAsInteger(XMLToken.TEXT_START_VALUE),row.number,JSON.stringify(row.value));
 if([...row.value].some(c=>{const n=c.codePointAt(0)!;return n<32&&n!==9&&n!==10&&n!==13;}))continue;
 const value=[...row.value].map(c=>`&#${c.codePointAt(0)};`).join('');
 for(const header of [false,true]){
  const captured:(XMLParagraphListState|undefined)[]=[];
  const target:XMLTextImportTarget={getListRule:()=>({name:'L',levels:[],levelCount:10}),getStyle:()=>undefined,getAutoStyle:()=>undefined,createParagraph(_s,_a,_l,_p,_c,list){captured.push(list);return{appendText(){},finishParagraph(){}};}};
  const tag=header?'list-header':'list-item';
  parseOdfXmlStream(`<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}"><text:list text:style-name="L"><text:${tag} text:start-value="${value}"><text:p>x</text:p><text:p>tail</text:p></text:${tag}></text:list></office:text>`,{createFastContext:()=>new XMLTextBodyContext(target),createUnknownContext:()=>null});
  const start=header?row.header:row.start;
  assert.deepEqual(captured,[{level:0,listId:'L-1',ruleName:'L',...(header?{counted:false}:{}),...(start<0?{}:{restart:true,startValue:start})},{level:0,listId:'L-1',ruleName:'L',counted:false}],JSON.stringify(row.value));
  contexts++;
 }
}
console.log(`Matched ${rows.length} shared byte-int values and ${contexts} actual ordinary/header SAX contexts to unmodified pinned conversion/range bodies.`);
