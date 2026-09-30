/** Compare actual local SAX dispatch with compiled unmodified native dispatch bodies. */
import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';
import { parseOdfXmlStream, SvXMLImportContext } from '../../../apps/office/src/xmloff/source/core/xmlimp.ts';
import { XMLToken,ODF_NAMESPACES } from '../../../apps/office/src/xmloff/source/core/xmltoken.ts';
const rows=JSON.parse(readFileSync(new URL('native-traces.json',import.meta.url),'utf8'));
const tags=['office:text','text:p','style:text-properties'];
const ids=new Map([[XMLToken.OFFICE_TEXT,0],[XMLToken.TEXT_P,1],[XMLToken.STYLE_TEXT_PROPERTIES,2]]);
class Context extends SvXMLImportContext {
 constructor(private label:string,private events:string[]){super();}
 startFastElement(token:XMLToken){this.events.push(`${this.label}:start:${ids.get(token)}`);}
 endFastElement(token:XMLToken){this.events.push(`${this.label}:end:${ids.get(token)}`);}
 startUnknownElement(uri:string,name:string){this.events.push(`${this.label}:unknown-start:${uri}:${name}`);}
 endUnknownElement(uri:string,name:string){this.events.push(`${this.label}:unknown-end:${uri}:${name}`);}
 characters(text:string){this.events.push(`${this.label}:text:${text}`);}
 createFastChildContext(token:XMLToken){this.events.push(`${this.label}:child:${ids.get(token)}`);return ids.get(token)===2?null:new Context('child',this.events);}
 createUnknownChildContext(uri:string,name:string){this.events.push(`${this.label}:unknown-child:${uri}:${name}`);return name==='owned'?new Context('owned',this.events):null;}
}
for(const row of rows){let xml='',names:string[]=[];for(const line of row.input.trim().split('\n')){const [op,a,b]=line.split(' ');if(op==='K'||op==='U'){const name=op==='K'?tags[Number(a)]:`f:${b}`;xml+=`<${name}${names.length===0?` xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:f="urn:foreign"`:''}>`;names.push(name);}else if(op==='E'||op==='V')xml+=`</${names.pop()}>`;else xml+=a;}assert.equal(names.length,0);const events:string[]=[];parseOdfXmlStream(xml,{createFastContext:()=>new Context('root',events),createUnknownContext:()=>new Context('root',events)},{onDiagnostic:()=>undefined});assert.deepEqual(events,row.events);}
console.log(`Matched ${rows.length} compiled native traces / ${rows.reduce((n,row)=>n+row.events.length,0)} identity and event entries.`);
