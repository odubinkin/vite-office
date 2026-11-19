/** @fileoverview Complete original exchange.cxx FormatArray_Impl151-entry native DataFlavor initializer table. Every source row creates actual SDK string/Type members; this does not infer or synthesize UNO values/types from payloads. */
import { DataFlavor } from "../../../offapi/com/sun/star/datatransfer/DataFlavor";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { Type } from "../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType } from "../../../cppu/inc/unotype";
import {
  MIMETYPE_OASIS_OPENDOCUMENT_CHART,
  MIMETYPE_OASIS_OPENDOCUMENT_CHART_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_DATABASE,
  MIMETYPE_OASIS_OPENDOCUMENT_DRAWING,
  MIMETYPE_OASIS_OPENDOCUMENT_DRAWING_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_FORMULA,
  MIMETYPE_OASIS_OPENDOCUMENT_FORMULA_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION,
  MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET,
  MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_TEMPLATE,
  MIMETYPE_OASIS_OPENDOCUMENT_TEXT_WEB,
  MIMETYPE_VND_SUN_XML_CALC,
  MIMETYPE_VND_SUN_XML_CHART,
  MIMETYPE_VND_SUN_XML_DRAW,
  MIMETYPE_VND_SUN_XML_IMPRESS,
  MIMETYPE_VND_SUN_XML_MATH,
  MIMETYPE_VND_SUN_XML_WRITER,
  MIMETYPE_VND_SUN_XML_WRITER_GLOBAL,
  MIMETYPE_VND_SUN_XML_WRITER_WEB,
} from "../../../comphelper/inc/documentconstants";
/** Exact source literal initializer; temporary RTL owners unwind after the real native struct copies their fields. @param mime - Original literal. @param name - Original display literal. @param type - Actual explicitly declared CPPU Type. @returns Native source table entry. */
function entry(mime: string, name: string, type: Type): DataFlavor {
  const first = new OUString(
      Uint16Array.from(
        mime.split(""),
        /** Converts a literal character to its code unit without normalization. @param c - Character from the literal. @returns Character code unit. */ (
          c,
        ) => c.charCodeAt(0),
      ),
      mime.length,
    ),
    second = new OUString(
      Uint16Array.from(
        name.split(""),
        /** Converts a literal character to its code unit without normalization. @param c - Character from the literal. @returns Character code unit. */ (
          c,
        ) => c.charCodeAt(0),
      ),
      name.length,
    );
  try {
    return new DataFlavor(first, second, type);
  } finally {
    second.dispose();
    first.dispose();
  }
}
let table: DataFlavor[] | undefined;
/** Original function-local static table. @returns Borrowed immutable entries. */
export function FormatArray_Impl(): readonly DataFlavor[] {
  if (table === undefined)
    table = [
      entry("", "", UnoType.get(["Sequence", "sal_Int8"])),
      entry("text/plain;charset=utf-16", "Text", UnoType.get("OUString")),
      entry(
        'application/x-openoffice-bitmap;windows_formatname="Bitmap"',
        "Bitmap",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-gdimetafile;windows_formatname="GDIMetaFile"',
        "GDIMetaFile",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-private;windows_formatname="Private"',
        "Private",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-file;windows_formatname="FileNameW"',
        "FileNameW",
        UnoType.get("OUString"),
      ),
      entry(
        'application/x-openoffice-filelist;windows_formatname="FileList"',
        "FileList",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("", "", UnoType.get(["Sequence", "sal_Int8"])),
      entry("", "", UnoType.get(["Sequence", "sal_Int8"])),
      entry("", "", UnoType.get(["Sequence", "sal_Int8"])),
      entry("text/rtf", "Rich Text Format", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-drawing;windows_formatname="Drawing Format"',
        "Drawing Format",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-svxb;windows_formatname="SVXB (StarView Bitmap/Animation)"',
        "SVXB (StarView Bitmap/Animation)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-svim;windows_formatname="SVIM (StarView ImageMap)"',
        "SVIM (StarView ImageMap)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-libreoffice-xfa;windows_formatname="XFA (XOutDev FillAttr Any)"',
        "XFA (XOutDev FillAttr Any)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        "application/vnd.oasis.opendocument.text-flat-xml",
        "Flat XML format (EditEngine ODF)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-internallink-state;windows_formatname="StatusInfo of SvxInternalLink"',
        "StatusInfo of SvxInternalLink",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-solk;windows_formatname="SOLK (StarOffice Link)"',
        "SOLK (StarOffice Link)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-netscape-bookmark;windows_formatname="Netscape Bookmark"',
        "Netscape Bookmark",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-treelistbox;windows_formatname="SV_LBOX_DD_FORMAT"',
        "SV_LBOX_DD_FORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-native;windows_formatname="Native"',
        "Native",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-ownerlink;windows_formatname="OwnerLink"',
        "OwnerLink",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starserver;windows_formatname="StarServerFormat"',
        "StarServerFormat",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starobject;windows_formatname="StarObjectFormat"',
        "StarObjectFormat",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-appletobject;windows_formatname="Applet Object"',
        "Applet Object",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-plugin-object;windows_formatname="PlugIn Object"',
        "PlugIn Object",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriter-30;windows_formatname="StarWriter 3.0"',
        "StarWriter 3.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriter-40;windows_formatname="StarWriter 4.0"',
        "StarWriter 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriter-50;windows_formatname="StarWriter 5.0"',
        "StarWriter 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriterweb-40;windows_formatname="StarWriter/Web 4.0"',
        "StarWriter/Web 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriterweb-50;windows_formatname="StarWriter/Web 5.0"',
        "StarWriter/Web 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriterglob-40;windows_formatname="StarWriter/Global 4.0"',
        "StarWriter/Global 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starwriterglob-50;windows_formatname="StarWriter/Global 5.0"',
        "StarWriter/Global 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-stardraw;windows_formatname="StarDrawDocument"',
        "StarDrawDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-stardraw-40;windows_formatname="StarDrawDocument 4.0"',
        "StarDrawDocument 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starimpress-50;windows_formatname="StarImpress 5.0"',
        "StarImpress 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-stardraw-50;windows_formatname="StarDraw 5.0"',
        "StarDraw 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starcalc;windows_formatname="StarCalcDocument"',
        "StarCalcDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starcalc-40;windows_formatname="StarCalc 4.0"',
        "StarCalc 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starcalc-50;windows_formatname="StarCalc 5.0"',
        "StarCalc 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starchart;windows_formatname="StarChartDocument"',
        "StarChartDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starchart-40;windows_formatname="StarChartDocument 4.0"',
        "StarChartDocument 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starchart-50;windows_formatname="StarChart 5.0"',
        "StarChart 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starimage;windows_formatname="StarImageDocument"',
        "StarImageDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starimage-40;windows_formatname="StarImageDocument 4.0"',
        "StarImageDocument 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starimage-50;windows_formatname="StarImage 5.0"',
        "StarImage 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starmath;windows_formatname="StarMath"',
        "StarMath",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starmath-40;windows_formatname="StarMathDocument 4.0"',
        "StarMathDocument 4.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starmath-50;windows_formatname="StarMath 5.0"',
        "StarMath 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-starobject-paintdoc;windows_formatname="StarObjectPaintDocument"',
        "StarObjectPaintDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-filled-area;windows_formatname="FilledArea"',
        "FilledArea",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("text/html", "HTML (HyperText Markup Language)", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-html-simple;windows_formatname="HTML Format"',
        "HTML Format",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-chaos;windows_formatname="FORMAT_CHAOS"',
        "FORMAT_CHAOS",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-cnt-msgattachfile;windows_formatname="CNT_MSGATTACHFILE_FORMAT"',
        "CNT_MSGATTACHFILE_FORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-biff5;windows_formatname="Biff5"',
        "Biff5",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-biff-5;windows_formatname="Biff 5"',
        "Biff 5",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sylk;windows_formatname="Sylk"',
        "Sylk",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sylk-bigcaps;windows_formatname="SYLK"',
        "SYLK",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-link;windows_formatname="Link"',
        "Link",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-dif;windows_formatname="DIF"',
        "DIF",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-stardraw-tabbar;windows_formatname="StarDraw TabBar"',
        "StarDraw TabBar",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sonlk;windows_formatname="SONLK (StarOffice Navi Link)"',
        "SONLK (StarOffice Navi Link)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("application/msword", "MSWordDoc", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-star-frameset-doc;windows_formatname="StarFrameSetDocument"',
        "StarFrameSetDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-office-doc;windows_formatname="OfficeDocument"',
        "OfficeDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-notes-docinfo;windows_formatname="NotesDocInfo"',
        "NotesDocInfo",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-notes-hnote;windows_formatname="NoteshNote"',
        "NoteshNote",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-notes-native;windows_formatname="Native"',
        "Native",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sfx-doc;windows_formatname="SfxDocument"',
        "SfxDocument",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-evdf;windows_formatname="EVDF (Explorer View Dummy Format)"',
        "EVDF (Explorer View Dummy Format)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-esdf;windows_formatname="ESDF (Explorer Search Dummy Format)"',
        "ESDF (Explorer Search Dummy Format)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-idf;windows_formatname="IDF (Iconview Dummy Format)"',
        "IDF (Iconview Dummy Format)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-eftp;windows_formatname="EFTP (Explorer Ftp File)"',
        "EFTP (Explorer Ftp File)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-efd;windows_formatname="EFD (Explorer Ftp Dir)"',
        "EFD (Explorer Ftp Dir)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-svx-formfieldexch;windows_formatname="SvxFormFieldExch"',
        "SvxFormFieldExch",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-extended-tabbar;windows_formatname="ExtendedTabBar"',
        "ExtendedTabBar",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-dataexchange;windows_formatname="SBA-DATAFORMAT"',
        "SBA-DATAFORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-fielddataexchange;windows_formatname="SBA-FIELDFORMAT"',
        "SBA-FIELDFORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-private-url;windows_formatname="SBA-PRIVATEURLFORMAT"',
        "SBA-PRIVATEURLFORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-tabed;windows_formatname="Tabed"',
        "Tabed",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-tabid;windows_formatname="Tabid"',
        "Tabid",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-join;windows_formatname="SBA-JOINFORMAT"',
        "SBA-JOINFORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-objectdescriptor-xml;windows_formatname="Star Object Descriptor (XML)"',
        "Star Object Descriptor (XML)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-linksrcdescriptor-xml;windows_formatname="Star Link Source Descriptor (XML)"',
        "Star Link Source Descriptor (XML)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-embed-source-xml;windows_formatname="Star Embed Source (XML)"',
        "Star Embed Source (XML)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-link-source-xml;windows_formatname="Star Link Source (XML)"',
        "Star Link Source (XML)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-embedded-obj-xml;windows_formatname="Star Embedded Object (XML)"',
        "Star Embedded Object (XML)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-filecontent;windows_formatname="FileContents"',
        "FileContents",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-filegrpdescriptor;windows_formatname="FileGroupDescriptorW"',
        "FileGroupDescriptorW",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-filename;windows_formatname="FileNameW"',
        "FileNameW",
        UnoType.get("OUString"),
      ),
      entry(
        'application/x-openoffice-sd-ole;windows_formatname="SD-OLE"',
        "SD-OLE",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-embedded-obj-ole;windows_formatname="Embedded Object"',
        "Embedded Object",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-embed-source-ole;windows_formatname="Embed Source"',
        "Embed Source",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-objectdescriptor-ole;windows_formatname="Object Descriptor"',
        "Object Descriptor",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-linkdescriptor-ole;windows_formatname="Link Source Descriptor"',
        "Link Source Descriptor",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-link-source-ole;windows_formatname="Link Source"',
        "Link Source",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-ctrldataexchange;windows_formatname="SBA-CTRLFORMAT"',
        "SBA-CTRLFORMAT",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-outplace-obj;windows_formatname="OutPlace Object"',
        "OutPlace Object",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-cnt-own-clip;windows_formatname="CntOwnClipboard"',
        "CntOwnClipboard",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-inet-image;windows_formatname="SO-INet-Image"',
        "SO-INet-Image",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-netscape-image;windows_formatname="Netscape Image Format"',
        "Netscape Image Format",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-formexchange;windows_formatname="SBA_FORMEXCHANGE"',
        "SBA_FORMEXCHANGE",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-sba-reportexchange;windows_formatname="SBA_REPORTEXCHANGE"',
        "SBA_REPORTEXCHANGE",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-uniformresourcelocator;windows_formatname="UniformResourceLocatorW"',
        "UniformResourceLocatorW",
        UnoType.get("OUString"),
      ),
      entry(
        'application/x-openoffice-starchartdocument-50;windows_formatname="StarChartDocument 5.0"',
        "StarChartDocument 5.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-graphobj;windows_formatname="Graphic Object"',
        "Graphic Object",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(MIMETYPE_VND_SUN_XML_WRITER, "Writer 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        MIMETYPE_VND_SUN_XML_WRITER_WEB,
        "Writer/Web 6.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_VND_SUN_XML_WRITER_GLOBAL,
        "Writer/Global 6.0",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(MIMETYPE_VND_SUN_XML_DRAW, "Draw 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(MIMETYPE_VND_SUN_XML_IMPRESS, "Impress 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(MIMETYPE_VND_SUN_XML_CALC, "Calc 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(MIMETYPE_VND_SUN_XML_CHART, "Chart 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(MIMETYPE_VND_SUN_XML_MATH, "Math 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-wmf;windows_formatname="Image WMF"',
        "Windows MetaFile",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-dbaccess-query;windows_formatname="Data source Query Object"',
        "Data source Query Object",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-dbaccess-table;windows_formatname="Data source Table"',
        "Data source Table",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-dbaccess-command;windows_formatname="SQL query"',
        "SQL query",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("application/vnd.sun.xml.dialog", "Dialog 6.0", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-emf;windows_formatname="Image EMF"',
        "Windows Enhanced MetaFile",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-biff-8;windows_formatname="Biff8"',
        "Biff8",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("image/bmp", "Windows Bitmap", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-html-no-comment;windows_formatname="HTML Format"',
        "HTML (no comment)",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(MIMETYPE_OASIS_OPENDOCUMENT_TEXT, "Writer 8", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_TEXT_WEB,
        "Writer/Web 8",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL,
        "Writer/Global 8",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(MIMETYPE_OASIS_OPENDOCUMENT_DRAWING, "Draw 8", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION,
        "Impress 8",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET,
        "Calc 8",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(MIMETYPE_OASIS_OPENDOCUMENT_CHART, "Chart 8", UnoType.get(["Sequence", "sal_Int8"])),
      entry(MIMETYPE_OASIS_OPENDOCUMENT_FORMULA, "Math 8", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'application/x-openoffice-xforms;windows_formatname="??? Format"',
        "???",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_TEXT_TEMPLATE,
        "Writer 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_DRAWING_TEMPLATE,
        "Draw 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_PRESENTATION_TEMPLATE,
        "Impress 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_SPREADSHEET_TEMPLATE,
        "Calc 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_CHART_TEMPLATE,
        "Chart 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_FORMULA_TEMPLATE,
        "Math 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_DATABASE,
        "StarBase 8",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry(
        'application/x-openoffice-highcontrast-gdimetafile;windows_formatname="GDIMetaFile"',
        "High Contrast GDIMetaFile",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("image/png", "PNG", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        MIMETYPE_OASIS_OPENDOCUMENT_TEXT_GLOBAL_TEMPLATE,
        "Writer/Global 8 Template",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("application/mathml+xml", "MathML", UnoType.get(["Sequence", "sal_Int8"])),
      entry("image/jpeg", "JPEG Bitmap", UnoType.get(["Sequence", "sal_Int8"])),
      entry("text/richtext", "Richtext Format", UnoType.get(["Sequence", "sal_Int8"])),
      entry("application/x-libreoffice-tsvc", "Text TSV-Calc", UnoType.get("OUString")),
      entry("application/pdf", "PDF Document", UnoType.get(["Sequence", "sal_Int8"])),
      entry(
        'image/svg+xml;windows_formatname="image/svg+xml"',
        "SVG",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
      entry("text/markdown", "Markdown", UnoType.get("OUString")),
      entry(
        'application/x-openoffice-biff-12;windows_formatname="Biff12"',
        "Biff12",
        UnoType.get(["Sequence", "sal_Int8"]),
      ),
    ];
  return table;
}
