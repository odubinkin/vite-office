import { readFileSync } from 'node:fs';
import { readOdtDocument } from '../../../apps/office/src/sw/source/filter/xml/swxml.ts';
import { ZipFile } from '../../../apps/office/src/package/source/zipapi/ZipFile.ts';
const bytes=new Uint8Array(readFileSync('apps/office/src/sw/qa/extras/odfimport/data/tdf94882.odt'));
const diagnostics:any[]=[];await readOdtDocument(bytes,{title:'probe'},undefined,{onDiagnostic:d=>diagnostics.push(d)});
console.log(JSON.stringify(diagnostics.filter(d=>d.kind==='unknown-element'),null,2));
const zip=new ZipFile(bytes);for(const entry of ['styles.xml','content.xml']){const xml=await zip.readTextEntry(entry);console.log(entry,xml.match(/.{0,140}<[^>]*unknown[^>]*>.{0,140}/g));}
