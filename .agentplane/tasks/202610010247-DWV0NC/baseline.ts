/** Runs the actual preceding Writer/XML modules with only relative import relocation. */
import {writeFileSync} from 'node:fs';
import {createWriterDocument} from '../../../apps/office/src/sw/source/core/doc/doc';
import {applyWriterParagraphList} from '../../../apps/office/src/sw/source/core/doc/list';
import {exportContentXml} from './baseline-xmlexp';
const doc=createWriterDocument();const rule=doc.EnsureNumRule('Numbers','numbered',0);rule.GetNumFormat(0).SetStart(7);rule.GetNumFormat(1).SetStart(5);
for(const [index,level]of [0,1,1,0].entries()){const node=index===0?doc.paragraphs[0]!:doc.nodes.MakeTextNode();node.SetText('x'+index);applyWriterParagraphList(node,{kind:'numbered',styleId:'Numbers',listId:'list1',level});if(index>=2)node.SetListRestart(true);}
const xml=exportContentXml(doc,()=>false);writeFileSync(new URL('./baseline.xml',import.meta.url),xml+'\n');
const body=xml.match(/<office:text>([\s\S]*)<\/office:text>/u)![1]!;
console.log('Actual preceding Writer/export modules turn absent direct starts into item starts:',[...body.matchAll(/<text:list-item[^>]*text:start-value="([^"]*)"/gu)].map(m=>m[1]));
