import { createWriterDocument } from '../../../apps/office/src/sw/source/core/doc/doc';
import { applyWriterParagraphList } from '../../../apps/office/src/sw/source/core/doc/list';
import { SwNumFormat, SwNumRule, SvxNumType } from '../../../apps/office/src/sw/source/core/doc/number';
import { HasNumberingWhichNeedsLayoutUpdate } from '../../../apps/office/src/sw/source/core/txtnode/ndtxt-attribute-handlers';
const rows=[];
for(const type of [4,5,6,8]) {
 const doc=createWriterDocument(),node=doc.paragraphs[0]!;
 const rule=new SwNumRule('profile','label-alignment');rule.SetDefaultListId('list');rule.SetAutoRule(false);
 const format=new SwNumFormat();format.SetNumberingType(type as SvxNumType);rule.Set(0,format);doc.AddNumRule(rule);
 applyWriterParagraphList(node,{kind:type===6?'bullet':'numbered',styleId:'profile',listId:'list',level:0});
 const output=[];doc.getIDocumentListItems().getNumItems(output);
 rows.push({type,hasNumber:node.HasNumber(),hasBullet:node.HasBullet(),layout:HasNumberingWhichNeedsLayoutUpdate(node),counted:node.GetNum()?.IsCountedForNumbering(),registry:output.length});doc.Dispose();
}
const doc=createWriterDocument(),node=doc.paragraphs[0]!,rule=new SwNumRule('sparse','label-alignment');rule.SetDefaultListId('list');rule.SetAutoRule(false);doc.AddNumRule(rule);applyWriterParagraphList(node,{kind:'numbered',styleId:'sparse',listId:'list',level:0});
console.log(JSON.stringify({rows,sparse:{hasNumber:node.HasNumber(),raw:rule.GetNumFormat(0)!==undefined,layout:HasNumberingWhichNeedsLayoutUpdate(node)}},null,2));doc.Dispose();
