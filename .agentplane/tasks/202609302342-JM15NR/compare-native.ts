/** Compares bounded native declaration, UNO marker state and standard export attribute predicates. */
import { readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { FastAttributeList } from "../../../apps/office/src/xmloff/source/core/xmlimp";
import { XMLToken, ODF_NAMESPACES } from "../../../apps/office/src/xmloff/source/core/xmltoken";
import { SvxXMLListLevelStyleContext_Impl } from "../../../apps/office/src/xmloff/source/style/xmlnumi";
import { SvxXMLNumRuleExport } from "../../../apps/office/src/xmloff/source/style/xmlnume";
import { escapeXml } from "../../../apps/office/src/xmloff/source/text/txtparae";
import { SwNumRule } from "../../../apps/office/src/sw/source/core/doc/number";
import { SwXNumberingRules } from "../../../apps/office/src/sw/source/core/unocore/unosett";
interface State {prefix:string;suffix:string;start:number;includeUpperLevels:number;listFormat:string;}
interface Row {kind:"numbered"|"bullet";level:number;attributes:[string,string][];declaration:State;applied:State;exportAttributes:Record<string,string>;}
const rows:Row[]=JSON.parse(readFileSync(new URL("./native-results.json",import.meta.url),"utf8"));
const exporter=new SvxXMLNumRuleExport(escapeXml);
for(const [index,row] of rows.entries()){
 const attributes=new FastAttributeList([["text:level",String(row.level+1)],...row.attributes].map(([name,value])=>{
  const [prefix,local]=name.split(":") as [keyof typeof ODF_NAMESPACES,string];
  return {name,prefix,local,value:value as string,uri:ODF_NAMESPACES[prefix]};
 }));
 const context=new SvxXMLListLevelStyleContext_Impl(row.kind==="numbered"?XMLToken.TEXT_LIST_LEVEL_STYLE_NUMBER:XMLToken.TEXT_LIST_LEVEL_STYLE_BULLET,attributes);
 const declaration=context.GetProperties();
 assert.deepEqual({prefix:declaration.prefix,suffix:declaration.suffix,start:declaration.startWith??1,includeUpperLevels:declaration.parentNumbering??1,listFormat:declaration.listFormat},row.declaration,`declaration ${index}`);
 const rule=new SwNumRule("comparison");
 const {level,position,...properties}=declaration;
 new SwXNumberingRules(rule).replaceByIndex(level,{...position.values,...properties});
 const format=rule.GetNumFormat(level);
 assert.deepEqual(format.GetMarkerProperties(),row.applied,`applied ${index}`);
 const xml=exporter.exportLevelStyle(level,{kind:row.kind,prefix:format.GetPrefix(),suffix:format.GetSuffix(),startWith:(format.GetStart()<<16)>>16,parentNumbering:format.GetIncludeUpperLevels()});
 const attributesOut:Record<string,string>={};
 for(const [,name,value] of xml.matchAll(/(style:num-prefix|style:num-suffix|text:start-value|text:display-levels)="([^"]*)"/g))attributesOut[name as string]=(value as string).replaceAll("&quot;",'"').replaceAll("&apos;","'").replaceAll("&lt;","<").replaceAll("&gt;",">").replaceAll("&amp;","&");
 assert.deepEqual(attributesOut,row.exportAttributes,`export ${index}`);
}
console.log(`Matched ${rows.length} declarations, ${rows.length} applied marker states and ${rows.length} standard ODF export attribute sets against compiled unmodified pinned excerpts.`);
