import { SwNumFormat } from '../../../apps/office/src/sw/source/core/doc/number';
import { SvxNumberFormat } from '../../../apps/office/src/editeng/source/items/numitem';
const numbered = new SwNumFormat('numbered'), bullet = new SwNumFormat('bullet');
console.log(JSON.stringify({numbered:{type:numbered.GetNumberingType(),bullet:numbered.GetBulletChar(),font:numbered.GetBulletFont()},bullet:{type:bullet.GetNumberingType(),bullet:bullet.GetBulletChar(),font:bullet.GetBulletFont()},baseTypeGetter:typeof(new SvxNumberFormat() as unknown as {GetNumberingType?:unknown}).GetNumberingType,baseParent:Object.getPrototypeOf(SvxNumberFormat.prototype).constructor.name},null,2));
