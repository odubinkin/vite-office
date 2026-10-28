import {Text2UnicodeConverter,Unicode2TextConverter} from '../../../../apps/office/src/sax/source/expatwrap/xml2utf';
import {OString} from '../../../../apps/office/src/sal/inc/rtl/string';
import {Sequence, type SequenceElements} from '../../../../apps/office/src/cppu/inc/com/sun/star/uno/Sequence';
import {RTL_TEXTENCODING_UTF8} from '../../../../apps/office/src/sal/inc/rtl/textenc';
const B=Sequence.specialize<number>('sal_Int8',1),U=Sequence.specialize<number>('sal_Unicode',2),name=new OString(Uint8Array.from([83,104,105,102,116,95,74,73,83]),9),decoder=new Text2UnicodeConverter(name),encoder=new Unicode2TextConverter(RTL_TEXTENCODING_UTF8);
for(const [ctor,converter,list,stride] of [[B,decoder,[[0x82],[0xa0]],2],[U,encoder,[[0xd83d],[0xde00]],1]] as const){for(const a of list){const input=new ctor(a.length),p=input.getArray() as SequenceElements;for(let i=0;i<a.length;++i)(p.get(i*(ctor===B?1:2))as[number])[0]=a[i] as number;const output=converter===decoder?decoder.convert(input):encoder.convert(input.getConstArray() as SequenceElements,input.getLength());console.log(a,output.getLength(),Array.from({length:output.getLength()},(_,i)=>((output.getConstArray()as SequenceElements).get(i*stride)as[number])[0]));output.dispose();input.dispose();}}
encoder.dispose();decoder.dispose();name.dispose();
