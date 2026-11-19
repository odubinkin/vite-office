/** @fileoverview Original ScServiceProvider catalog, exact provider lookup and ordered name sequence. This module supplies no replacement MakeInstance factory or concrete service. */
import { ScServiceProviderType as Type } from "../../../inc/servuno";
import {
  OUString,
  OUStringLiteral,
  type OUStringConstReference,
} from "../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../sal/inc/rtl/ustring.h";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  SC_SERVICENAME_VALBIND,
  SC_SERVICENAME_LISTCELLBIND,
  SC_SERVICENAME_LISTSOURCE,
  SC_SERVICENAME_CELLADDRESS,
  SC_SERVICENAME_RANGEADDRESS,
  SC_SERVICENAME_CHDATAPROV,
  SC_SERVICENAME_CHART_PIVOTTABLE_DATAPROVIDER,
  SC_SERVICENAME_FORMULAPARS,
  SC_SERVICENAME_OPCODEMAPPER,
} from "../../../inc/unonames";
/** Original constexpr catalog record. */
interface ProvNamesId_Type {
  readonly pName: OUStringConstReference;
  readonly nType: Type;
}
/** Original static Unicode literal materialization. @param value - Compiler-known source text. @returns Borrowed constant. */
function literal(value: string): OUStringConstReference {
  return new OUString(
    new OUStringLiteral(
      Uint16Array.from(
        value + "\0",
        /** Literal code unit. @param unit - Original character. @returns Unit. */ (unit) =>
          unit.charCodeAt(0),
      ),
    ),
  );
}
const aProvNamesId: readonly ProvNamesId_Type[] = [
  { pName: literal("com.sun.star.sheet.Spreadsheet"), nType: Type.SHEET },
  { pName: literal("com.sun.star.text.TextField.URL"), nType: Type.URLFIELD },
  { pName: literal("com.sun.star.text.TextField.PageNumber"), nType: Type.PAGEFIELD },
  { pName: literal("com.sun.star.text.TextField.PageCount"), nType: Type.PAGESFIELD },
  { pName: literal("com.sun.star.text.TextField.Date"), nType: Type.DATEFIELD },
  { pName: literal("com.sun.star.text.TextField.Time"), nType: Type.TIMEFIELD },
  { pName: literal("com.sun.star.text.TextField.DateTime"), nType: Type.EXT_TIMEFIELD },
  { pName: literal("com.sun.star.text.TextField.DocInfo.Title"), nType: Type.TITLEFIELD },
  { pName: literal("com.sun.star.text.TextField.FileName"), nType: Type.FILEFIELD },
  { pName: literal("com.sun.star.text.TextField.SheetName"), nType: Type.SHEETFIELD },
  { pName: literal("com.sun.star.style.CellStyle"), nType: Type.CELLSTYLE },
  { pName: literal("com.sun.star.style.PageStyle"), nType: Type.PAGESTYLE },
  { pName: literal("com.sun.star.style.GraphicStyle"), nType: Type.GRAPHICSTYLE },
  { pName: literal("com.sun.star.sheet.TableAutoFormat"), nType: Type.AUTOFORMAT },
  { pName: literal("com.sun.star.sheet.TableAutoFormats"), nType: Type.AUTOFORMATS },
  { pName: literal("com.sun.star.sheet.SheetCellRanges"), nType: Type.CELLRANGES },
  { pName: literal("com.sun.star.sheet.FunctionDescriptions"), nType: Type.FUNCTIONDESCRIPTIONS },
  { pName: literal("com.sun.star.sheet.GlobalSheetSettings"), nType: Type.GLOBALSHEETSETTINGS },
  { pName: literal("com.sun.star.sheet.RecentFunctions"), nType: Type.RECENTFUNCTIONS },
  { pName: literal("com.sun.star.drawing.GradientTable"), nType: Type.GRADTAB },
  { pName: literal("com.sun.star.drawing.HatchTable"), nType: Type.HATCHTAB },
  { pName: literal("com.sun.star.drawing.BitmapTable"), nType: Type.BITMAPTAB },
  { pName: literal("com.sun.star.drawing.TransparencyGradientTable"), nType: Type.TRGRADTAB },
  { pName: literal("com.sun.star.drawing.MarkerTable"), nType: Type.MARKERTAB },
  { pName: literal("com.sun.star.drawing.DashTable"), nType: Type.DASHTAB },
  { pName: literal("com.sun.star.text.NumberingRules"), nType: Type.NUMRULES },
  { pName: literal("com.sun.star.sheet.Defaults"), nType: Type.DOCDEFLTS },
  { pName: literal("com.sun.star.drawing.Defaults"), nType: Type.DRAWDEFLTS },
  { pName: literal("com.sun.star.comp.SpreadsheetSettings"), nType: Type.DOCSPRSETT },
  { pName: literal("com.sun.star.document.Settings"), nType: Type.DOCCONF },
  { pName: literal("com.sun.star.image.ImageMapRectangleObject"), nType: Type.IMAP_RECT },
  { pName: literal("com.sun.star.image.ImageMapCircleObject"), nType: Type.IMAP_CIRC },
  { pName: literal("com.sun.star.image.ImageMapPolygonObject"), nType: Type.IMAP_POLY },
  {
    pName: literal("com.sun.star.document.ExportGraphicStorageHandler"),
    nType: Type.EXPORT_GRAPHIC_STORAGE_HANDLER,
  },
  {
    pName: literal("com.sun.star.document.ImportGraphicStorageHandler"),
    nType: Type.IMPORT_GRAPHIC_STORAGE_HANDLER,
  },
  { pName: literal("com.sun.star.document.ExportEmbeddedObjectResolver"), nType: Type.EXPORT_EOR },
  { pName: literal("com.sun.star.document.ImportEmbeddedObjectResolver"), nType: Type.IMPORT_EOR },
  { pName: SC_SERVICENAME_VALBIND, nType: Type.VALBIND },
  { pName: SC_SERVICENAME_LISTCELLBIND, nType: Type.LISTCELLBIND },
  { pName: SC_SERVICENAME_LISTSOURCE, nType: Type.LISTSOURCE },
  { pName: SC_SERVICENAME_CELLADDRESS, nType: Type.CELLADDRESS },
  { pName: SC_SERVICENAME_RANGEADDRESS, nType: Type.RANGEADDRESS },
  { pName: literal("com.sun.star.sheet.DocumentSettings"), nType: Type.SHEETDOCSET },
  { pName: SC_SERVICENAME_CHDATAPROV, nType: Type.CHDATAPROV },
  {
    pName: SC_SERVICENAME_CHART_PIVOTTABLE_DATAPROVIDER,
    nType: Type.CHART_PIVOTTABLE_DATAPROVIDER,
  },
  { pName: SC_SERVICENAME_FORMULAPARS, nType: Type.FORMULAPARS },
  { pName: SC_SERVICENAME_OPCODEMAPPER, nType: Type.OPCODEMAPPER },
  { pName: literal("ooo.vba.VBAObjectModuleObjectProvider"), nType: Type.VBAOBJECTPROVIDER },
  { pName: literal("ooo.vba.VBACodeNameProvider"), nType: Type.VBACODENAMEPROVIDER },
  { pName: literal("ooo.vba.VBAGlobals"), nType: Type.VBAGLOBALS },
  { pName: literal("com.sun.star.text.textfield.URL"), nType: Type.URLFIELD },
  { pName: literal("com.sun.star.text.textfield.PageNumber"), nType: Type.PAGEFIELD },
  { pName: literal("com.sun.star.text.textfield.PageCount"), nType: Type.PAGESFIELD },
  { pName: literal("com.sun.star.text.textfield.Date"), nType: Type.DATEFIELD },
  { pName: literal("com.sun.star.text.textfield.Time"), nType: Type.TIMEFIELD },
  { pName: literal("com.sun.star.text.textfield.DateTime"), nType: Type.EXT_TIMEFIELD },
  { pName: literal("com.sun.star.text.textfield.docinfo.Title"), nType: Type.TITLEFIELD },
  { pName: literal("com.sun.star.text.textfield.FileName"), nType: Type.FILEFIELD },
  { pName: literal("com.sun.star.text.textfield.SheetName"), nType: Type.SHEETFIELD },
  { pName: literal("ooo.vba.VBAGlobals"), nType: Type.VBAGLOBALS },
];
const aOldNames: readonly ProvNamesId_Type[] = [
  { pName: literal("stardiv.one.text.TextField.URL"), nType: Type.URLFIELD },
  { pName: literal("stardiv.one.text.TextField.PageNumber"), nType: Type.PAGEFIELD },
  { pName: literal("stardiv.one.text.TextField.PageCount"), nType: Type.PAGESFIELD },
  { pName: literal("stardiv.one.text.TextField.Date"), nType: Type.DATEFIELD },
  { pName: literal("stardiv.one.text.TextField.Time"), nType: Type.TIMEFIELD },
  { pName: literal("stardiv.one.text.TextField.DocumentTitle"), nType: Type.TITLEFIELD },
  { pName: literal("stardiv.one.text.TextField.FileName"), nType: Type.FILEFIELD },
  { pName: literal("stardiv.one.text.TextField.SheetName"), nType: Type.SHEETFIELD },
  { pName: literal("stardiv.one.style.CellStyle"), nType: Type.CELLSTYLE },
  { pName: literal("stardiv.one.style.PageStyle"), nType: Type.PAGESTYLE },
];
/** Original implemented catalog operations; MakeInstance remains absent until its real service owners are implemented. */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Preserve the original static ScServiceProvider owner.
export class ScServiceProvider {
  /** Original first exact modern match, then old-name compatibility lookup. The source debug-only old-name diagnosis does not reject the release call. @param name - Borrowed counted source string view. @returns Original enum or INVALID. */
  static GetProviderType(name: OUStringConstReference): Type {
    if (!name.isEmpty()) {
      for (const entry of aProvNamesId) if (name.equals(entry.pName)) return entry.nType;
      for (const entry of aOldNames) if (name.equals(entry.pName)) return entry.nType;
    }
    return Type.INVALID;
  }
  /** Original list preserves source table order, duplicate aliases and excludes old compatibility names. @returns Owned actual UNO string sequence. */
  static GetAllServiceNames(): Sequence<rtl_uStringSlot> {
    return new (Sequence.specialize<rtl_uStringSlot>("OUString", 8))(
      {
        /** Compiler-erased original initializer/vector copy source. @param offset - Source byte offset. @returns Actual string cell. */
        get(offset: number): rtl_uStringSlot {
          return [(aProvNamesId[offset / 8] as ProvNamesId_Type).pName.pData];
        },
      },
      aProvNamesId.length,
    );
  }
}
