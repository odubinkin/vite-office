/** @fileoverview Original OOXML workbook theme color and font scheme export. */
import type { ColorSet } from "../../../docmodel/inc/theme/ColorSet";
import { convertToThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import type { FontScheme, Theme } from "../../../docmodel/inc/theme/Theme";
import { FSNS, type FastSerializerHelper } from "../../../sax/inc/fshelper";
import { OFFICE_DOCUMENT_RELATION } from "../core/relations";
import { colorSchemeNames, drawingNamespace } from "../drawingml/themefragmenthandler";
import { getTokenFromUtf8 as token } from "../token/tokenmap";

const a = token("a");

/** Expands one original DrawingML element token with the document prefix. @param name - Local token. @returns Serializer token. */
function tag(name: string): number {
  return FSNS(a, token(name));
}

/** Writes the original theme with the represented model and source default format scheme. @param stream - Active theme part. @param theme - Actual workbook theme. @returns Nothing. */
export function writeTheme(stream: FastSerializerHelper, theme: Theme): void {
  stream.startElement(
    tag("theme"),
    FSNS(token("xmlns"), a),
    drawingNamespace,
    FSNS(token("xmlns"), token("r")),
    OFFICE_DOCUMENT_RELATION.slice(0, -1),
    token("name"),
    theme.name,
  );
  stream.startElement(tag("themeElements"));
  if (theme.colorSet) writeColorSet(stream, theme.colorSet);
  writeFontScheme(stream, theme.fontScheme);
  writeFormatScheme(stream);
  stream.endElement(tag("themeElements"));
  stream.endElement(tag("theme"));
  stream.endDocument();
}

/** Writes the original palette in document-model order. @param stream - Active theme part. @param colors - Actual theme colors. @returns Nothing. */
function writeColorSet(stream: FastSerializerHelper, colors: ColorSet): void {
  stream.startElement(tag("clrScheme"), token("name"), colors.name);
  for (const [index, name] of colorSchemeNames.entries()) {
    const color = colors.getColor(convertToThemeColorType(index));
    const rgb = color.GetRGBColor().toUInt32().toString(16).padStart(6, "0").toUpperCase();
    stream.startElement(tag(name));
    stream.singleElement(tag("srgbClr"), token("val"), rgb);
    stream.endElement(tag(name));
  }
  stream.endElement(tag("clrScheme"));
}

/** Writes the native major/minor collections and supplemental entries in order. @param stream - Active theme part. @param scheme - Represented font scheme. @returns Nothing. */
function writeFontScheme(stream: FastSerializerHelper, scheme: FontScheme): void {
  stream.startElement(tag("fontScheme"), token("name"), scheme.name);
  for (const [role, supplemental] of [
    ["majorFont", scheme.majorSupplemental],
    ["minorFont", scheme.minorSupplemental],
  ] as const) {
    stream.startElement(tag(role));
    for (const language of ["latin", "ea", "cs"] as const) {
      const font = scheme[role].get(language);
      stream.singleElement(
        tag(language),
        token("typeface"),
        font?.typeface ?? "",
        token("panose"),
        font?.typeface && font.panose ? font.panose : null,
        token("pitchFamily"),
        font?.typeface ? String(font.pitchFamily) : null,
        token("charset"),
        font?.typeface ? String(font.charset) : null,
      );
    }
    for (const font of supplemental)
      stream.singleElement(
        tag("font"),
        token("script"),
        font.script,
        token("typeface"),
        font.typeface,
      );
    stream.endElement(tag(role));
  }
  stream.endElement(tag("fontScheme"));
}

/** Writes the native empty-model format matrix defaults. @param stream - Active theme part. @returns Nothing. */
function writeFormatScheme(stream: FastSerializerHelper): void {
  stream.startElement(tag("fmtScheme"));
  for (const list of ["fillStyleLst", "lnStyleLst", "effectStyleLst", "bgFillStyleLst"]) {
    stream.startElement(tag(list));
    for (let entry = 0; entry < 3; ++entry) {
      if (list === "effectStyleLst") {
        stream.singleElement(tag("effectStyle"));
        continue;
      }
      if (list === "lnStyleLst")
        stream.startElement(
          tag("ln"),
          token("w"),
          "6350",
          token("cap"),
          "flat",
          token("algn"),
          "ctr",
          token("cmpd"),
          "sng",
        );
      stream.startElement(tag("solidFill"));
      stream.singleElement(tag("schemeClr"), token("val"), "phClr");
      stream.endElement(tag("solidFill"));
      if (list === "lnStyleLst") {
        stream.singleElement(tag("prstDash"), token("val"), "solid");
        stream.singleElement(tag("miter"));
        stream.endElement(tag("ln"));
      }
    }
    stream.endElement(tag(list));
  }
  stream.endElement(tag("fmtScheme"));
}
