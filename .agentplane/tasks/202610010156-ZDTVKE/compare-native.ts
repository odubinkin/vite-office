/** Compares actual SAX import to native item/block/paragraph pending-restart traces. */
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {parseOdfXmlStream} from '../../../apps/office/src/xmloff/source/core/xmlimp';
import {ODF_NAMESPACES} from '../../../apps/office/src/xmloff/source/core/xmltoken';
import {XMLTextBodyContext,type XMLTextImportTarget} from '../../../apps/office/src/xmloff/source/text/txtparai';
type State={level:number;counted:boolean;restart:boolean;start:number};
const rows:{xml:string;expected:State[]}[]=JSON.parse(readFileSync(new URL('./native-results.json',import.meta.url),'utf8'));
let states=0;
for(const [index,row]of rows.entries()){
 const actual:State[]=[];
 const target:XMLTextImportTarget={getListRule:()=>({name:'L',levels:[],levelCount:10}),getStyle:()=>undefined,getAutoStyle:()=>undefined,createParagraph(_s,_a,_l,_p,_c,list){assert.ok(list);actual.push({level:list.level,counted:list.counted!==false,restart:list.restart===true,start:list.startValue??-1});return{appendText(){},addBookmark(){},addBookmarkStart(){},addBookmarkEnd(){},addSoftPageBreak(){},finishParagraph(){}};}};
 parseOdfXmlStream(`<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}">${row.xml.replace('<text:list>','<text:list text:style-name="L">')}</office:text>`,{createFastContext:()=>new XMLTextBodyContext(target),createUnknownContext:()=>null});
 assert.deepEqual(actual,row.expected,`native item/block restart tree${index}`);states+=actual.length;
}
console.log(`Matched ${rows.length} input trees/${states} paragraph counted,level,restart,start states to unmodified pinned item/block/paragraph excerpts.`);
