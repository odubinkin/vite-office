/** @fileoverview Native settings scalar/default/nested resource contracts through actual DomainMapper ownership and unchanged upstream DOCX settings fixtures. */
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DomainMapper } from "./DomainMapper";
import { SourceDocumentType as Source } from "../inc/dmapper/DomainMapperFactory";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { createWriterDocument } from "../../core/doc/doc";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import {
  OOXMLProperty,
  OOXMLPropertySet,
  OOXMLValue as V,
  OOXMLPropertyType as T,
} from "../ooxml/OOXMLPropertySet";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { SvxZoomType } from "../../../../sfx2/inc/zoomitem";
import { OOXMLStreamImpl } from "../ooxml/OOXMLStreamImpl";
import { OOXMLDocument } from "../ooxml/OOXMLDocumentImpl";
import { StreamType_t } from "../inc/ooxml/OOXMLDocument";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import type { Stream } from "../inc/dmapper/resourcemodel";
/** Creates the real model/mapper; settings creation must be lazy because it queries the fully initialized mapper's source format. @param source - Original source format. @returns Owners. */
function session(source = Source.OOXML) {
  const model = new SwXTextDocument(createWriterDocument()),
    mapper = new DomainMapper(model, source);
  const table = mapper.impl.GetSettingsTable();
  return {
    model,
    mapper,
    table,
    /** Native filter owner teardown. @returns Nothing. */ dispose() {
      mapper.dispose();
      model.dispose();
    },
  };
}
/** Creates an original scalar modifier. @param id - Resource ID. @param value - Signed value. @returns Modifier. */
function scalar(id: number, value: number): OOXMLProperty {
  return new OOXMLProperty(id, V.createInteger(value), T.SPRM);
}

const flags = [
  [N.LN_CT_Settings_evenAndOddHeaders, "GetEvenAndOddHeaders", false],
  [N.LN_CT_Compat_usePrinterMetrics, "GetUsePrinterMetrics", false],
  [N.LN_CT_Settings_embedTrueTypeFonts, "GetEmbedTrueTypeFonts", false],
  [N.LN_CT_Settings_embedSystemFonts, "GetEmbedSystemFonts", false],
  [N.LN_CT_Compat_doNotUseHTMLParagraphAutoSpacing, "GetDoNotUseHTMLParagraphAutoSpacing", false],
  [N.LN_CT_Compat_noColumnBalance, "GetNoColumnBalance", false],
  [N.LN_CT_Compat_splitPgBreakAndParaMark, "GetSplitPgBreakAndParaMark", false],
  [N.LN_CT_Settings_mirrorMargins, "GetMirrorMarginSettings", false],
  [N.LN_CT_Settings_displayBackgroundShape, "GetDisplayBackgroundShape", false],
  [N.LN_CT_Compat_doNotExpandShiftReturn, "GetDoNotExpandShiftReturn", true],
  [N.LN_CT_Compat_balanceSingleByteDoubleByteWidth, "GetBalanceSingleByteDoubleByteWidth", true],
  [N.LN_CT_Settings_doNotHyphenateCaps, "GetNoHyphenateCaps", false],
  [N.LN_CT_Compat_ulTrailSpace, "GetMsWordUlTrailSpace", true],
  [N.LN_CT_Settings_longerSpaceSequence, "GetLongerSpaceSequence", false],
  [N.LN_CT_Compat_noLeading, "GetNoLeading", false],
  [N.LN_CT_Settings_gutterAtTop, "GetGutterAtTop", false],
  [N.LN_CT_Settings_trackRevisions, "GetRecordChanges", false],
  [N.LN_CT_Compat_doNotVertAlignCellWithSp, "GetDoNotVertAlignCellWithSp", false],
  [N.LN_CT_Compat_adjustLineHeightInTable, "GetAdjustLineHeightInTable", false],
] as const;

it.each(flags)(
  "retains original flag %s and getter %s",
  /** Tests both normal reset and the original explicit-false-ignoring compatibility cases. @param id - Source ID. @param getter - Original getter. @param sticky - Native presence-only assignment. @returns Nothing. */ (
    id,
    getter,
    sticky,
  ) => {
    const s = session();
    try {
      expect(s.table[getter]()).toBe(false);
      s.table.sprm(scalar(id, -1));
      expect(s.table[getter]()).toBe(true);
      s.table.sprm(scalar(id, 0));
      expect(s.table[getter]()).toBe(sticky);
    } finally {
      s.dispose();
    }
  },
);

it("keeps real RTF and OOXML defaults, lazy stable identity and native units", /** Does not supply a fake mapper merely to select a constructor branch. @returns Nothing. */ () => {
  for (const source of [Source.OOXML, Source.RTF]) {
    const s = session(source);
    try {
      expect(s.mapper.impl.GetSettingsTable()).toBe(s.table);
      expect(s.table.GetDefaultTabStop()).toBe(1270);
      expect(s.table.GetHyphenationZone()).toBe(360);
      expect(s.table.GetConsecutiveHyphenLimit()).toBe(0);
      expect(s.table.GetZoomFactor()).toBe(0);
      expect(s.table.GetZoomType()).toBe(SvxZoomType.PERCENT);
      expect(s.table.GetView()).toBe(0);
      expect(s.table.GetLinkStyles()).toBe(false);
      expect(s.table.GetLongerSpaceSequence()).toBe(source === Source.RTF);
      expect(s.table.GetDoNotUseHTMLParagraphAutoSpacing()).toBe(source === Source.RTF);
      expect(text(s.table.GetDecimalSymbol())).toBe(".");
      expect(text(s.table.GetListSeparator())).toBe(",");
    } finally {
      s.dispose();
    }
  }
  // Also covers mapper teardown when its lazy settings table was never requested.
  const model = new SwXTextDocument(createWriterDocument()),
    mapper = new DomainMapper(model, Source.OOXML);
  mapper.dispose();
  model.dispose();
});

it("retains native signed widths, tab units and all zoom mappings through nested settings resources", /** Resolves actual property references rather than changing private settings fields. @returns Nothing. */ () => {
  const s = session();
  try {
    for (const [token, expected] of [
      [N.LN_Value_doc_ST_Zoom_fullPage, SvxZoomType.WHOLEPAGE],
      [N.LN_Value_doc_ST_Zoom_bestFit, SvxZoomType.PAGEWIDTH],
      [N.LN_Value_doc_ST_Zoom_textFit, SvxZoomType.OPTIMAL],
      [0, SvxZoomType.PERCENT],
    ] as const) {
      const properties = new OOXMLPropertySet();
      properties.add(N.LN_CT_Zoom_percent, V.createInteger(65535), T.ATTRIBUTE);
      properties.add(N.LN_CT_Zoom_val, V.createInteger(token), T.ATTRIBUTE);
      s.table.sprm(
        new OOXMLProperty(N.LN_CT_Settings_zoom, V.createPropertySet(properties), T.SPRM),
      );
      expect(s.table.GetZoomType()).toBe(expected);
      expect(s.table.GetZoomFactor()).toBe(-1);
    }
    s.table.attribute(N.LN_CT_View_val, V.createInteger(-1));
    expect(s.table.GetView()).toBe(0xffffffff);
    s.table.attribute(0, V.createInteger(1));
    s.table.sprm(scalar(N.LN_CT_Settings_defaultTabStop, 1440));
    expect(s.table.GetDefaultTabStop()).toBe(2540);
    s.table.sprm(scalar(N.LN_CT_Settings_hyphenationZone, 65535));
    s.table.sprm(scalar(N.LN_CT_Settings_consecutiveHyphenLimit, 32768));
    expect(s.table.GetHyphenationZone()).toBe(-1);
    expect(s.table.GetConsecutiveHyphenLimit()).toBe(-32768);
    const empty = new OOXMLProperty(N.LN_CT_Settings_hyphenationZone, new V(), T.SPRM);
    s.table.sprm(empty);
    expect(s.table.GetHyphenationZone()).toBe(0);
  } finally {
    s.dispose();
  }
});

it("keeps optional linked-style precedence and source missing-properties handling", /** Attached templates always disable linked styles in upstream; later linkStyles does not override this. @returns Nothing. */ () => {
  const s = session();
  try {
    s.table.sprm(scalar(N.LN_CT_Settings_linkStyles, 1));
    expect(s.table.GetLinkStyles()).toBe(true);
    s.table.sprm(scalar(N.LN_CT_Settings_linkStyles, 0));
    expect(s.table.GetLinkStyles()).toBe(true);
    s.table.sprm(new OOXMLProperty(N.LN_CT_Settings_attachedTemplate, new V(), T.SPRM));
    expect(s.table.GetLinkStyles()).toBe(false);
    s.table.sprm(scalar(N.LN_CT_Settings_linkStyles, 1));
    expect(s.table.GetLinkStyles()).toBe(false);
    for (const id of [N.LN_CT_Settings_decimalSymbol, N.LN_CT_Settings_listSeparator]) {
      const string = unicode("字😀");
      try {
        s.table.sprm(new OOXMLProperty(id, V.createString(string), T.SPRM));
      } finally {
        string.dispose();
      }
    }
    expect(text(s.table.GetDecimalSymbol())).toBe("字😀");
    expect(text(s.table.GetListSeparator())).toBe("字😀");
  } finally {
    s.dispose();
  }
});

it.each([
  ["fdo106029.docx", "GetDoNotExpandShiftReturn", true],
  ["tdf146171.docx", "GetHyphenationZone", 360],
] as const)(
  "ports the settings prerequisite in native %s",
  /** Full upstream export/layout assertions remain pending; settings bytes are unchanged. @param name - Native fixture. @param getter - Native state getter. @param expected - Native prerequisite. @returns Completion. */ async (
    name,
    getter,
    expected,
  ) => {
    const bytes = new Uint8Array(readFileSync(resolve("src/sw/qa/extras/ooxmlexport/data", name)));
    expect(bytes).toEqual(
      new Uint8Array(
        readFileSync(
          resolve("../../vendor/libreoffice-reference/sw/qa/extras/ooxmlexport/data", name),
        ),
      ),
    );
    const stream = await OOXMLStreamImpl.createStream(new ZipStorage(bytes)),
      document = new OOXMLDocument(stream, null),
      s = session();
    /** Refuses body callbacks in a settings part. @returns Never. */ function unexpected(): never {
      throw new Error("Unexpected body callback");
    }
    const receiver: Stream = {
      props: unexpected,
      text: unexpected,
      utext: unexpected,
      info: unexpected,
      startSectionGroup: unexpected,
      endSectionGroup: unexpected,
      markLastSectionGroup: unexpected,
      startParagraphGroup: unexpected,
      endParagraphGroup: unexpected,
      markLastParagraphInSection: unexpected,
      startCharacterGroup: unexpected,
      endCharacterGroup: unexpected,
      /** Resolves native settings into the actual mapper. @param id - Resource ID. @param table - Native reference. @returns Nothing. */ table(
        id,
        table,
      ) {
        s.mapper.table(id, table);
      },
    };
    try {
      await document.resolveFastSubStream(receiver, StreamType_t.SETTINGS);
      expect(s.table[getter]()).toBe(expected);
    } finally {
      document.dispose();
      stream.dispose();
      s.dispose();
    }
  },
);
