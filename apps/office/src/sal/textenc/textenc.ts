/** @fileoverview Original core byte-converter data from textenc.cxx;table pointers/nullness and shared identity are retained without introducing a converter registry. */
import type { ImplByteConvertData, ImplUniCharTabData } from "./tenchelp";
/** Original aImpl8090SameToUniTab const table. */
export const aImpl8090SameToUniTab = Object.freeze([
  128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146,
  147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
]);
/** Original aImpl8090SameToCharTab const table. */
export const aImpl8090SameToCharTab = Object.freeze([
  128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146,
  147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159,
]);
/** Original aImplA0FFSameToCharTab const table. */
export const aImplA0FFSameToCharTab = Object.freeze([
  160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178,
  179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197,
  198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216,
  217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235,
  236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254,
  255,
]);
/** Original aImplMS1252ToUniTab const table. */
export const aImplMS1252ToUniTab = Object.freeze([
  8364, 0, 8218, 402, 8222, 8230, 8224, 8225, 710, 8240, 352, 8249, 338, 0, 381, 0, 0, 8216, 8217,
  8220, 8221, 8226, 8211, 8212, 732, 8482, 353, 8250, 339, 0, 382, 376, 160, 161, 162, 163, 164,
  165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183,
  184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202,
  203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221,
  222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240,
  241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255,
]);
/** Original aImplISO88591ToUniTab const table. */
export const aImplISO88591ToUniTab = Object.freeze([
  160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178,
  179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197,
  198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216,
  217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235,
  236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254,
  255,
]);
/** Original reverse extension entries,each retaining both byte fields. */
export const aImplMS1252ToCharTabEx: readonly ImplUniCharTabData[] = Object.freeze([
  Object.freeze({ mnUniChar: 338, mnChar: 140, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 339, mnChar: 156, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 352, mnChar: 138, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 353, mnChar: 154, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 376, mnChar: 159, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 381, mnChar: 142, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 382, mnChar: 158, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 402, mnChar: 131, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 710, mnChar: 136, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 732, mnChar: 152, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8211, mnChar: 150, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8212, mnChar: 151, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8216, mnChar: 145, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8217, mnChar: 146, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8218, mnChar: 130, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8220, mnChar: 147, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8221, mnChar: 148, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8222, mnChar: 132, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8224, mnChar: 134, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8225, mnChar: 135, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8226, mnChar: 149, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8230, mnChar: 133, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8240, mnChar: 137, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8249, mnChar: 139, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8250, mnChar: 155, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8364, mnChar: 128, mnChar2: 0 }),
  Object.freeze({ mnUniChar: 8482, mnChar: 153, mnChar2: 0 }),
]);
/** Original aImplMS1252ByteCvtData aggregate. */
export const aImplMS1252ByteCvtData: ImplByteConvertData = Object.freeze({
  mpToUniTab1: aImplMS1252ToUniTab,
  mpToUniTab2: null,
  mpToCharTab1: aImplA0FFSameToCharTab,
  mpToCharTab2: null,
  mpToCharExTab: aImplMS1252ToCharTabEx,
  mnToUniStart1: 0x80,
  mnToUniEnd1: 0xff,
  mnToUniStart2: 0xff,
  mnToUniEnd2: 0x00,
  mnToCharStart1: 0x00a0,
  mnToCharEnd1: 0x00ff,
  mnToCharStart2: 0xffff,
  mnToCharEnd2: 0x0000,
  mnToCharExCount: 27,
});
/** Original aImplISO88591ByteCvtData aggregate. */
export const aImplISO88591ByteCvtData: ImplByteConvertData = Object.freeze({
  mpToUniTab1: aImplISO88591ToUniTab,
  mpToUniTab2: aImpl8090SameToUniTab,
  mpToCharTab1: aImplA0FFSameToCharTab,
  mpToCharTab2: aImpl8090SameToCharTab,
  mpToCharExTab: null,
  mnToUniStart1: 0xa0,
  mnToUniEnd1: 0xff,
  mnToUniStart2: 0x80,
  mnToUniEnd2: 0x9f,
  mnToCharStart1: 0x00a0,
  mnToCharEnd1: 0x00ff,
  mnToCharStart2: 0x0080,
  mnToCharEnd2: 0x009f,
  mnToCharExCount: 0,
});
/** Original aImplUSASCIIByteCvtData aggregate. */
export const aImplUSASCIIByteCvtData: ImplByteConvertData = Object.freeze({
  mpToUniTab1: aImplMS1252ToUniTab,
  mpToUniTab2: null,
  mpToCharTab1: null,
  mpToCharTab2: null,
  mpToCharExTab: null,
  mnToUniStart1: 0x80,
  mnToUniEnd1: 0xff,
  mnToUniStart2: 0xff,
  mnToUniEnd2: 0x00,
  mnToCharStart1: 0xffff,
  mnToCharEnd1: 0x0000,
  mnToCharStart2: 0xffff,
  mnToCharEnd2: 0x0000,
  mnToCharExCount: 0,
});
