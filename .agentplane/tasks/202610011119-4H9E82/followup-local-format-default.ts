import { SwNumFormat } from "../../../apps/office/src/sw/source/core/doc/number";
const format = new SwNumFormat("numbered");
console.log(JSON.stringify({bullet:format.GetBulletChar(),type:format.GetNumberingType(),prototype:Object.getPrototypeOf(SwNumFormat.prototype).constructor.name},null,2));
