import { createWriterDocument } from '../../../apps/office/src/sw/source/core/doc/doc';
import { applyWriterParagraphList } from '../../../apps/office/src/sw/source/core/doc/list';
import { SwNumFormat, SvxNumType } from '../../../apps/office/src/sw/source/core/doc/number';
const states = [];
for (const type of [4,5,6,8]) {
  const doc = createWriterDocument(), node = doc.paragraphs[0]!;
  const rule = doc.EnsureNumRule('profile', 'numbered'), format = new SwNumFormat();
  format.SetNumberingType(type as SvxNumType); rule.Set(0, format);
  applyWriterParagraphList(node, {kind: type===6 ? 'bullet' : 'numbered',styleId:'profile',listId:'list',level:0});
  states.push([type,node.HasNumber(),node.HasBullet()]);doc.Dispose();
}
console.log(JSON.stringify(states));
