/** @fileoverview Native Writer Word compatibility output from its document property and settings owners. */
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS, FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { SwDoc } from "../../core/doc/doc";
import {
  FindWordCompatibilityMode,
  ReadCompatSettings,
  wordCompatibilityUri,
  type CompatSetting,
} from "../../writerfilter/dmapper/SettingsTable.compat";

import { ReadDocumentProtection } from "../../writerfilter/dmapper/DocumentProtection";

const w = token("w");

/** Emits imported, unenforced editing settings in original DOCX attribute order. @param document - Actual Writer graph. @param serializer - Open settings serializer. @returns Nothing. */
export function WriteDocumentProtection(document: SwDoc, serializer: FastSerializerHelper): void {
  const settings = ReadDocumentProtection(
    document.interopGrabBag.GetGrabBag().get("DocumentProtection"),
  );
  if (!settings || !Object.keys(settings).length) return;
  const attributes = FastSerializerHelper.createAttrList();
  try {
    for (const [name, value] of Object.entries(settings)) {
      if (name === "cryptAlgorithmSid" && value.length === 0) continue;
      attributes.operatorArrow().add(FSNS(w, token(name)), value);
    }
    serializer.singleElementNS(w, token("documentProtection"), attributes);
  } finally {
    attributes.dispose();
  }
}

/** Resolves the source compatibility level shared by settings and table export. @param document - Actual Writer graph. @param version - Selected OOXML version. @returns Word compatibility mode. */
export function GetWordCompatibilityMode(document: SwDoc, version: OoxmlVersion): number {
  const rows = ReadCompatSettings(document.interopGrabBag.GetGrabBag().get("CompatSettings"));
  const imported = FindWordCompatibilityMode(rows ?? []);
  let mode = imported > 0 && imported <= 15 ? imported : 15;
  if (mode > 12 && version === OoxmlVersion.ECMA_376_1ST_EDITION) mode = 12;
  if (mode > 14 && !document.GetDocumentSettingManager().get("ADD_EXT_LEADING")) mode = 14;
  return mode;
}

/** Writes represented native flags and original compatibility rows. @param document - Actual Writer graph. @param serializer - Open settings serializer. @param version - Selected export filter version. @returns Nothing. */
export function WriteCompat(
  document: SwDoc,
  serializer: FastSerializerHelper,
  version: OoxmlVersion,
): void {
  const rows = ReadCompatSettings(document.interopGrabBag.GetGrabBag().get("CompatSettings"));
  const settings = document.GetDocumentSettingManager();
  const mode = GetWordCompatibilityMode(document, version);

  serializer.startElementNS(w, token("compat"));
  if (!settings.get("ADD_EXT_LEADING")) serializer.singleElementNS(w, token("noLeading"));
  if (settings.get("DO_NOT_JUSTIFY_LINES_WITH_MANUAL_BREAK"))
    serializer.singleElementNS(w, token("doNotExpandShiftReturn"));
  if (settings.get("PARA_SPACE_MAX"))
    serializer.singleElementNS(w, token("doNotUseHTMLParagraphAutoSpacing"));

  let hasMode = false;
  for (const row of rows ?? []) {
    const isMode = row.name === "compatibilityMode";
    hasMode ||= isMode;
    WriteCompatSetting(serializer, isMode ? { ...row, val: String(mode) } : row);
  }
  if (!hasMode)
    WriteCompatSetting(serializer, {
      name: "compatibilityMode",
      uri: wordCompatibilityUri,
      val: String(mode),
    });

  // This branch represents the native defaults with no document interoperability
  // sequence. The current model has no explicit hyphenation keep item.
  if (rows === undefined && mode >= 12) {
    WriteCompatSetting(serializer, {
      name: "useWord2013TrackBottomHyphenation",
      uri: wordCompatibilityUri,
      val: "1",
    });
    WriteCompatSetting(serializer, {
      name: "allowHyphenationAtTrackBottom",
      uri: wordCompatibilityUri,
      val: "1",
    });
  }
  serializer.endElementNS(w, token("compat"));
}

/** Writes the exact name, URI and lexical value fields of one source row. @param serializer - Active DOCX settings writer. @param row - Ordered compatibility property. @returns Nothing. */
function WriteCompatSetting(serializer: FastSerializerHelper, row: CompatSetting): void {
  serializer.singleElementNS(
    w,
    token("compatSetting"),
    FSNS(w, token("name")),
    row.name ?? "",
    FSNS(w, token("uri")),
    row.uri ?? "",
    FSNS(w, token("val")),
    row.val ?? "",
  );
}
