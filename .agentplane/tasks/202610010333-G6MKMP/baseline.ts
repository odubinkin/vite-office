import {writeFileSync} from 'node:fs';
import {ZipFile} from '../../../apps/office/src/package/source/zipapi/ZipFile';
import {ZipOutputStream} from '../../../apps/office/src/package/source/zipapi/ZipOutputStream';
import {createWriterDocument} from '../../../apps/office/src/sw/source/core/doc/doc';
import {readOdtDocument} from '../../../apps/office/src/sw/source/filter/xml/swxml';
import {writeOdtDocument} from '../../../apps/office/src/sw/source/filter/xml/wrtxml';
const baseline=await writeOdtDocument(createWriterDocument(),{title:"Counters"});
const cases={flag:'<text:list text:style-name="Counters" text:continue-numbering="true"><text:list-item><text:p>x</text:p></text:list-item></text:list>',unknown:'<text:list text:style-name="Counters" xml:id="B" text:continue-list="unknown"><text:list-item><text:p>x</text:p></text:list-item></text:list>',nested:'<text:list text:style-name="Counters" xml:id="A"><text:list-item><text:p>a</text:p><text:list xml:id="nested"><text:list-item><text:p>b</text:p></text:list-item></text:list></text:list-item></text:list>',default:'<text:list text:style-name="Counters" xml:id="A"><text:list-item><text:p>x</text:p></text:list-item></text:list>'};
const result={};
for(const [name,body] of Object.entries(cases)){
 const zip=new ZipFile(baseline),out=new ZipOutputStream();
 for(const entry of zip.getEntryNames()){
  if(entry==='content.xml')out.putNextEntry(entry,new TextEncoder().encode((await zip.readTextEntry(entry)).replace('</office:automatic-styles>','<text:list-style style:name="Counters"><text:list-level-style-number text:level="1" style:num-format="1" text:start-value="7"/><text:list-level-style-number text:level="2" style:num-format="1" text:start-value="5"/></text:list-style></office:automatic-styles>').replace(/<office:text>[\s\S]*?<\/office:text>/u,`<office:text>${body}</office:text>`)));
  else out.putNextEntry(entry,await zip.readEntry(entry));
 }
 try{const doc=(await readOdtDocument(out.finish(),{title:"Counters"})).document;result[name]=doc.paragraphs.map(p=>({text:p.GetText(),id:p.GetListId(),restart:p.IsListRestart(),number:p.GetListItemNumber()}));}catch(e){result[name]={error:String(e)};}
}
writeFileSync(new URL('./baseline.json',import.meta.url),JSON.stringify(result,null,2)+'\n');console.log(result);
