/** @fileoverview RTF charset and font-name encoding tables from rtftok/rtfcharsets.cxx. */

/** RTF 1.9.1 font charset to Windows or Mac code page. */
export const RTF_CHARSET_CODEPAGE: ReadonlyMap<number, number> = new Map([
  [0, 1252],
  [1, 0],
  [2, 42],
  [77, 10000],
  [78, 10001],
  [79, 10003],
  [80, 10008],
  [81, 10002],
  [83, 10005],
  [84, 10004],
  [85, 10006],
  [86, 10081],
  [87, 10021],
  [88, 10029],
  [89, 10007],
  [128, 932],
  [129, 949],
  [130, 1361],
  [134, 936],
  [136, 950],
  [161, 1253],
  [162, 1254],
  [163, 1258],
  [177, 1255],
  [178, 1256],
  [186, 1257],
  [204, 1251],
  [222, 874],
  [238, 1250],
  [254, 437],
  [255, 850],
]);

/** Word font suffixes take precedence over explicit cpg and fcharset values. */
export const RTF_FONT_SUFFIX_CODEPAGE: ReadonlyMap<string, number> = new Map([
  ["Baltic", 1257],
  ["CE", 1250],
  ["Cyr", 1251],
  ["Greek", 1253],
  ["Tur", 1254],
  ["(Hebrew)", 1255],
  ["(Arabic)", 1256],
  ["(Vietnamese)", 1258],
]);

/** Browser decoder labels for the Windows code pages represented by the RTF table. */
export function rtfDecoderLabel(codepage: number): string {
  if (codepage === 932) return "shift_jis";
  if (codepage === 936) return "gbk";
  if (codepage === 949) return "euc-kr";
  if (codepage === 950) return "big5";
  if (codepage === 10000) return "macintosh";
  return `windows-${codepage}`;
}
