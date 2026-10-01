/** Compares actual XML transitions/metadata and valid Writer projections to primary probes. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportTextParagraphs,type XMLTextParagraphSource,type XMLTextListSource} from '../../../apps/office/src/xmloff/source/text/txtparae';
import {XMLTextNumRuleInfo} from '../../../apps/office/src/xmloff/source/text/XMLTextNumRuleInfo';
import {createWriterDocument} from '../../../apps/office/src/sw/source/core/doc/doc';
import {applyWriterParagraphList} from '../../../apps/office/src/sw/source/core/doc/list';
import {SfxInt16Item} from '../../../apps/office/src/svl/source/items/intitem';
import {RES_PARATR_LIST_RESTARTVALUE} from '../../../apps/office/src/sw/inc/hintids';
import {exportContentXml} from '../../../apps/office/src/sw/source/filter/xml/xmlexp';
type Item={level:number;counted:boolean;restart:boolean;start:number;formatStart:number|null};
const data=JSON.parse(readFileSync(new URL('./native-results.json',import.meta.url),'utf8')) as {
 exports:{bullet:boolean;starts:number[];items:Item[];expected:string[]}[];
 metadata:{inputs:Item[];expected:number[][]}[];
 getters:{inputs:{present:boolean;rule:boolean;restart:boolean;direct:boolean;start:number}[];expected:number[][]};
};
function events(xml:string):string[]{
 const result:string[]=[];let paragraph=0;
 for(const match of xml.matchAll(/<(\/?)(?:text:)(list-header|list-item|list|p)(?=[\s>])([^>]*)>/gu)){
  if(match[2]==='p'){if(match[1]!=='/')result.push('p'+paragraph++);}
  else result.push((match[1]==='/'?'-':'+')+match[2]+(match[1]!=='/'&&/text:start-value="([^"]*)"/u.test(match[3]??'')?':'+/text:start-value="([^"]*)"/u.exec(match[3]??'')?.[1]:''));
 }
 return result;
}
for(const [index,test]of data.exports.entries()){
 const rule={name:'Numbers',levels:test.starts.map(startWith=>({kind:test.bullet?'bullet' as const:'numbered' as const,bulletChar:'●',suffix:'.',startWith}))};
 const paragraphs:XMLTextParagraphSource[]=test.items.map((item,i)=>({style:'default',runs:[{text:'x'+i,properties:{bold:false,italic:false,underline:false}}],...(item.level<0?{}:{list:{rule,listId:'list1',level:item.level,counted:item.counted,restart:item.restart,...(item.start===-1?{}:{startValue:item.start})}})}));
 const body=exportTextParagraphs({*paragraphs(){yield*paragraphs;}}).body;
 assert.deepEqual(events(body),test.expected,`native restart export sequence${index}`);
}
for(const [index,test]of data.metadata.entries()){
 const info=new XMLTextNumRuleInfo();const actual:number[][]=[];
 for(const item of test.inputs){
  const list:XMLTextListSource|undefined=item.level<0?undefined:{listId:'list1',level:item.level,counted:item.counted,restart:item.restart,...(item.start===-1?{}:{startValue:item.start}),rule:{name:'Numbers',levels:Array.from({length:10},()=>({kind:'numbered' as const,...(item.formatStart===null?{}:{startWith:item.formatStart})}))}};
  info.Set(list);actual.push([info.GetLevel(),Number(info.IsNumbered()),Number(info.IsRestart()),Number(info.HasStartValue()),info.GetStartValue(),info.GetListLevelStartValue()]);
 }
 assert.deepEqual(actual,test.expected,`native metadata sequence${index}`);
}
let validGetters=0;
for(const [index,test]of data.getters.inputs.entries()){
 if(!test.present||!test.rule)continue;
 const doc=createWriterDocument();const node=doc.paragraphs[0]!;applyWriterParagraphList(node,{kind:'numbered',styleId:'Numbers',listId:'list1'});node.SetListRestart(test.restart);
 if(test.direct)node.SetAttr(new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE,test.start));
 const body=exportContentXml(doc,()=>false).match(/<office:text>([\s\S]*)<\/office:text>/u)![1]!;
 const starts=[...body.matchAll(/<text:list-item[^>]*text:start-value="([^"]*)"/gu)].map(m=>Number(m[1]));
 const native=data.getters.expected[index]![0]!;
 assert.deepEqual(starts,native===-1?[]:[native],`actual Writer projection/native IsNodeNumStart${index}`);validGetters++;
}
console.log(`Matched ${data.exports.length} actual XML restart sequences/${data.metadata.length*3} metadata states; ${validGetters} valid Writer projections against48 normative IsNodeNumStart states. Explicit adapters;no whole native/UNO/helper claim.`);
