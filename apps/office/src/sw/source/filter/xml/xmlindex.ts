/** @fileoverview Connects shared contents-index XML properties to the Writer index service. */
import { SwGetPoolIdFromName } from "../../../inc/SwGetPoolIdFromName";
import { SwStyleNameMapper } from "../../core/doc/SwStyleNameMapper";
import type { SwDoc } from "../../core/doc/doc";
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import type {
  XMLIndexImport,
  XMLIndexImportProperties,
  XMLIndexSource,
} from "../../../../xmloff/source/text/XMLIndexTOCContext";
import type {
  XMLIndexFamily,
  XMLIndexSourceProperties,
} from "../../../../xmloff/source/text/XMLIndexSourceBaseContext";
import type { XMLIndexEntry } from "../../../../xmloff/source/text/XMLIndexTemplateContext";
import type { XMLSectionStyle } from "../../../../xmloff/source/text/XMLSectionStyleContext";
import type { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import {
  FormTokenType,
  SwCaptionDisplay,
  SwTOOElements,
  MAXLEVEL,
  SwChapterFormat,
  SwFormToken,
  SwTOXElement,
  SwTOIOptions,
  TOXTypes,
  TOX_STYLE_DELIMITER,
  type SwTOXBase,
} from "../../core/tox/tox";
import type { SwXTextCursor } from "../../core/unocore/unoobj";
import {
  getUserIndexProgrammaticName,
  getUserIndexTypeName,
  SwXDocumentIndex,
} from "../../core/unocore/unoidx";
import { importSectionStyle, pushSectionCursor } from "./xmlsection";

const formTypes: Readonly<Record<XMLIndexEntry["kind"], FormTokenType>> = {
  chapter: FormTokenType.EntryNo,
  text: FormTokenType.EntryText,
  span: FormTokenType.Text,
  "tab-stop": FormTokenType.TabStop,
  "page-number": FormTokenType.PageNums,
  "link-start": FormTokenType.LinkStart,
  "link-end": FormTokenType.LinkEnd,
};

const xmlTypes = new Map<FormTokenType, XMLIndexEntry["kind"]>(
  Object.entries(formTypes).map(
    /** Reverses the original represented field mapping. @param entry - XML kind and corresponding form identity. @returns Native type and XML kind. */
    ([kind, type]) => [type, kind as XMLIndexEntry["kind"]],
  ),
);

xmlTypes.set(FormTokenType.Entry, "text");
xmlTypes.set(FormTokenType.ChapterInfo, "chapter");

const indexTypes: Readonly<Record<XMLIndexFamily, TOXTypes>> = {
  "table-of-content": TOXTypes.Content,
  "user-index": TOXTypes.User,
  "alphabetical-index": TOXTypes.Index,
  "table-index": TOXTypes.Tables,
  "illustration-index": TOXTypes.Illustrations,
  "object-index": TOXTypes.Objects,
};

const captionFormats = ["text", "category-and-value", "caption"] as const;

const chapterDisplay = [
  "number",
  "name",
  "number-and-name",
  "plain-number-and-name",
  "plain-number",
] as const;

/** Resolves the native display name declared for a referenced ODF style. */
type IndexStyleName = (family: "text" | "paragraph", name: string) => string | undefined;

/** Writes the index source through the original Writer descriptor and form. @param tox - Attached index descriptor. @param source - Shared parsed properties. @param styleName - Original style-name boundary. @param document - Owns the native index type definitions. @returns Nothing. */
function importIndexSource(
  tox: SwTOXBase,
  source: XMLIndexSource,
  styleName: IndexStyleName,
  document: SwDoc,
): void {
  if (source.family === "alphabetical-index") {
    tox.indexOptions =
      (source.combineEntries ? SwTOIOptions.SameEntry : SwTOIOptions.None) |
      (source.combineWithPP ? SwTOIOptions.FF : SwTOIOptions.None) |
      (!source.ignoreCase ? SwTOIOptions.CaseSensitive : SwTOIOptions.None) |
      (source.useKeysAsEntries ? SwTOIOptions.KeyAsEntry : SwTOIOptions.None) |
      (source.separators ? SwTOIOptions.AlphaDelimiter : SwTOIOptions.None) |
      (source.combineWithDash ? SwTOIOptions.Dash : SwTOIOptions.None) |
      (source.capitalizeEntries ? SwTOIOptions.InitialCaps : SwTOIOptions.None);
    tox.mainEntryCharStyle = styleName("text", source.mainEntryStyle) ?? "";
    tox.form.SetCommaSeparated(source.commaSeparated);
    if (source.language !== undefined) tox.language = source.language;
    if (source.sortAlgorithm) tox.sortAlgorithm = source.sortAlgorithm;
  } else if (source.family === "table-of-content" || source.family === "user-index") {
    tox.createType =
      (source.useMarks ? SwTOXElement.Mark : SwTOXElement.None) |
      (source.useStyles ? SwTOXElement.Template : SwTOXElement.None);
    if (source.family === "table-of-content") {
      tox.level = source.outlineLevel;
      if (source.useOutline) tox.createType |= SwTOXElement.OutlineLevel;
    } else {
      if (source.useObjects) tox.createType |= SwTOXElement.Ole;
      if (source.useGraphics) tox.createType |= SwTOXElement.Graphic;
      if (source.useTables) tox.createType |= SwTOXElement.Table;
      if (source.useFrames) tox.createType |= SwTOXElement.Frame;
      tox.levelFromChapter = source.copyOutlineLevels;
      if (source.indexName)
        tox.type = document.GetTOXType(
          TOXTypes.User,
          getUserIndexTypeName(document, source.indexName),
        );
    }
  } else {
    if (source.family === "object-index") {
      tox.objectOptions =
        (source.useOtherObjects ? SwTOOElements.Other : SwTOOElements.None) |
        (source.useSpreadsheetObjects ? SwTOOElements.Calc : SwTOOElements.None) |
        (source.useChartObjects ? SwTOOElements.Chart : SwTOOElements.None) |
        (source.useDrawObjects ? SwTOOElements.DrawImpress : SwTOOElements.None) |
        (source.useMathObjects ? SwTOOElements.Math : SwTOOElements.None);
    } else {
      tox.fromObjectNames = !source.useCaption;
      if (source.sequenceName !== undefined)
        tox.sequenceName = SwStyleNameMapper.GetSpecialExtraUIName(source.sequenceName);
      if (source.captionFormat !== undefined)
        tox.captionDisplay = captionFormats.indexOf(source.captionFormat) as SwCaptionDisplay;
    }
    if (source.sourceStyle) {
      const style = styleName("paragraph", source.sourceStyle) ?? source.sourceStyle;
      if (style.includes(TOX_STYLE_DELIMITER))
        throw new Error("Writer index source style must contain one paragraph style.");
      tox.SetStyleNames(style, 0);
      tox.createType |= SwTOXElement.Template;
    }
  }
  tox.fromChapter = source.fromChapter;
  tox.form.SetRelTabPos(source.relativeTabs);
  if (source.title) {
    tox.title = source.title.text;
    const headingStyle = styleName("paragraph", source.title.styleName);
    if (headingStyle) tox.form.SetTemplate(0, headingStyle);
  }
  for (const template of source.templates) {
    const paraStyle = styleName("paragraph", template.styleName ?? "");
    if (paraStyle) tox.form.SetTemplate(template.level, paraStyle);
    const tokens: SwFormToken[] = [];
    for (const entry of template.entries) {
      const type =
        entry.kind === "chapter" && source.family !== "table-of-content"
          ? FormTokenType.ChapterInfo
          : formTypes[entry.kind];
      const token = new SwFormToken(type);
      token.sCharStyleName = styleName("text", entry.styleName) ?? entry.styleName;
      if (entry.kind === "link-start" && !token.sCharStyleName) token.sCharStyleName = "Index Link";
      if (entry.kind === "span") token.sText = entry.text ?? "";
      if (entry.kind === "tab-stop") {
        token.eTabAlign = entry.tabRight ? SvxTabAdjust.End : SvxTabAdjust.Left;
        token.nTabStopPosition = Number(
          convert(BigInt(entry.tabPosition ?? 0), Length.mm100, Length.twip),
        );
        if (token.nTabStopPosition < 0 || (entry.tabFill?.length ?? 0) > 1)
          throw new Error("Writer TOC entry tab stop is invalid.");
        token.cTabFillChar = entry.tabFill ?? " ";
        token.bWithTab = entry.withTab ?? true;
      }
      if (entry.kind === "chapter") {
        const chapter = chapterDisplay.findIndex(
          /** Finds the recognized native chapter field. @param display - Original spelling. @returns Match. */
          (display) => display === entry.display,
        );
        if (chapter >= 0) token.nChapterFormat = chapter;
        if (entry.chapterLevel !== undefined) {
          if (entry.chapterLevel < 1 || entry.chapterLevel > MAXLEVEL)
            throw new Error("Writer TOC entry chapter outline level is invalid.");
          token.nOutlineLevel = entry.chapterLevel;
        }
      }
      tokens.push(token);
    }
    tox.form.SetPattern(template.level, tokens);
  }
  for (const [level, styles] of source.sourceStyles)
    tox.SetStyleNames(
      styles
        .map(
          /** Resolves one source paragraph style. @param name - ODF style name. @returns Native style. */ (
            name,
          ) => styleName("paragraph", name) ?? name,
        )
        .join(TOX_STYLE_DELIMITER),
      level - 1,
    );
}

/** Creates the original Writer index section and scopes the stream cursor to its cached content. @param helper - Shared text dispatcher. @param properties - Section properties. @param style - Resolved section style. @param styleName - Native style resolution. @returns Connected operations. */
export function importDocumentIndex(
  helper: XMLTextImportHelper,
  properties: XMLIndexImportProperties,
  style: XMLSectionStyle | undefined,
  styleName: IndexStyleName,
): XMLIndexImport {
  const parent = helper.GetCursor() as SwXTextCursor;
  const document = parent.GetDoc();
  const index = new SwXDocumentIndex(document, indexTypes[properties.family]);
  const descriptor = index.GetTOXBase();
  descriptor.name = properties.name;
  descriptor.protected = properties.protected;
  const node = index.attach(parent);
  if (style) importSectionStyle(node.GetSection().GetFormat(), style);
  return {
    outlineLevels: MAXLEVEL,
    /** Sets the attached native index source before exposure. @param source - Parsed source definition. @returns Nothing. */
    setSource(source): void {
      importIndexSource(index.GetTOXBase(), source, styleName, document);
    },
    end: pushSectionCursor(helper, node, parent),
  };
}

/** Projects the original index properties through the common section exporter. @param tox - Connected index properties. @param document - Actual index owner. @returns ODF index data. */
export function exportDocumentIndex(tox: SwTOXBase, document: SwDoc): XMLIndexSource {
  const templates: XMLIndexSourceProperties["templates"][number][] = [];
  const sourceStyles = new Map<number, readonly string[]>();
  for (let level = 1; level < tox.form.GetFormMax(); level++) {
    const entries: XMLIndexEntry[] = [];
    for (const token of tox.form.GetPattern(level)) {
      const kind = xmlTypes.get(token.eTokenType);
      if (!kind) continue;
      const styleName = token.sCharStyleName;
      if (kind === "chapter")
        entries.push({
          kind,
          styleName,
          ...(token.eTokenType === FormTokenType.ChapterInfo
            ? {
                chapterLevel: token.nOutlineLevel,
                display: chapterDisplay[token.nChapterFormat],
              }
            : {
                ...(token.nOutlineLevel === MAXLEVEL ? {} : { chapterLevel: token.nOutlineLevel }),
                ...(token.nChapterFormat === SwChapterFormat.NumberNoPrePostAndTitle
                  ? { display: "plain-number" }
                  : {}),
              }),
        });
      else if (kind === "span") entries.push({ kind, styleName, text: token.sText });
      else if (kind === "tab-stop")
        entries.push({
          kind,
          styleName,
          tabPosition: Number(convert(BigInt(token.nTabStopPosition), Length.twip, Length.mm100)),
          tabRight: token.eTabAlign === SvxTabAdjust.End,
          tabFill: token.cTabFillChar,
          withTab: token.bWithTab,
        });
      else entries.push({ kind, styleName });
    }
    templates.push({
      level,
      styleName: SwStyleNameMapper.FillProgName(
        tox.form.GetTemplate(level),
        SwGetPoolIdFromName.TxtColl,
      ),
      entries,
    });
    const styles = tox.GetStyleNames(level - 1);
    if (styles && (tox.type.type === TOXTypes.Content || tox.type.type === TOXTypes.User))
      sourceStyles.set(level, styles.split(TOX_STYLE_DELIMITER));
  }
  const common = {
    fromChapter: tox.fromChapter,
    relativeTabs: tox.form.IsRelTabPos(),
    title: {
      styleName: SwStyleNameMapper.FillProgName(
        tox.form.GetTemplate(0),
        SwGetPoolIdFromName.TxtColl,
      ),
      text: tox.title,
    },
    templates,
    sourceStyles,
  };
  if (tox.type.type === TOXTypes.Index) {
    const options = tox.indexOptions;
    return {
      ...common,
      family: "alphabetical-index",
      mainEntryStyle: SwStyleNameMapper.FillProgName(
        tox.mainEntryCharStyle,
        SwGetPoolIdFromName.ChrFmt,
      ),
      separators: Boolean(options & SwTOIOptions.AlphaDelimiter),
      ignoreCase: !(options & SwTOIOptions.CaseSensitive),
      combineEntries: Boolean(options & SwTOIOptions.SameEntry),
      combineWithDash: Boolean(options & SwTOIOptions.Dash),
      useKeysAsEntries: Boolean(options & SwTOIOptions.KeyAsEntry),
      combineWithPP: Boolean(options & SwTOIOptions.FF),
      capitalizeEntries: Boolean(options & SwTOIOptions.InitialCaps),
      commaSeparated: tox.form.IsCommaSeparated(),
      sortAlgorithm: tox.sortAlgorithm,
      language: tox.language,
    };
  }
  const paragraphStyle = tox.createType & SwTOXElement.Template ? tox.GetStyleNames(0) : "";
  const sourceStyle = paragraphStyle
    ? {
        sourceStyle: SwStyleNameMapper.FillProgName(paragraphStyle, SwGetPoolIdFromName.TxtColl),
      }
    : {};
  if (tox.type.type === TOXTypes.Objects)
    return {
      ...common,
      ...sourceStyle,
      family: "object-index",
      useOtherObjects: Boolean(tox.objectOptions & SwTOOElements.Other),
      useSpreadsheetObjects: Boolean(tox.objectOptions & SwTOOElements.Calc),
      useChartObjects: Boolean(tox.objectOptions & SwTOOElements.Chart),
      useDrawObjects: Boolean(tox.objectOptions & SwTOOElements.DrawImpress),
      useMathObjects: Boolean(tox.objectOptions & SwTOOElements.Math),
    };
  if (tox.type.type === TOXTypes.Tables || tox.type.type === TOXTypes.Illustrations)
    return {
      ...common,
      ...sourceStyle,
      family: tox.type.type === TOXTypes.Tables ? "table-index" : "illustration-index",
      useCaption: !tox.fromObjectNames,
      sequenceName: SwStyleNameMapper.GetSpecialExtraProgName(tox.sequenceName),
      captionFormat: captionFormats[tox.captionDisplay],
    };
  const useMarks = Boolean(tox.createType & SwTOXElement.Mark);
  const useStyles = Boolean(tox.createType & SwTOXElement.Template);
  if (tox.type.type === TOXTypes.User)
    return {
      ...common,
      family: "user-index",
      indexName: getUserIndexProgrammaticName(document, tox.type.name),
      useMarks,
      useStyles,
      useObjects: Boolean(tox.createType & SwTOXElement.Ole),
      useGraphics: Boolean(tox.createType & SwTOXElement.Graphic),
      useTables: Boolean(tox.createType & SwTOXElement.Table),
      useFrames: Boolean(tox.createType & SwTOXElement.Frame),
      copyOutlineLevels: tox.levelFromChapter,
    };
  return {
    ...common,
    family: "table-of-content",
    outlineLevel: tox.level,
    useOutline: Boolean(tox.createType & SwTOXElement.OutlineLevel),
    useMarks,
    useStyles,
  };
}
