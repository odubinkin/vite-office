/** @fileoverview Connects shared contents-index XML properties to the Writer index service. */
import { SvxTabAdjust } from "../../../../editeng/inc/svxenum";
import { convert, Length } from "../../../../o3tl/inc/unit_conversion";
import type {
  XMLIndexImport,
  XMLIndexImportProperties,
} from "../../../../xmloff/source/text/XMLIndexTOCContext";
import type { XMLIndexTOCSource } from "../../../../xmloff/source/text/XMLIndexTOCSourceContext";
import type { XMLIndexEntry } from "../../../../xmloff/source/text/XMLIndexTemplateContext";
import type { XMLSectionStyle } from "../../../../xmloff/source/text/XMLSectionStyleContext";
import type { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import {
  FormTokenType,
  MAXLEVEL,
  SwChapterFormat,
  SwFormToken,
  SwTOXElement,
  TOX_STYLE_DELIMITER,
  type SwTOXBase,
} from "../../core/tox/tox";
import type { SwXTextCursor } from "../../core/unocore/unoobj";
import { SwXDocumentIndex } from "../../core/unocore/unoidx";
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

/** Resolves the native display name declared for a referenced ODF style. */
type IndexStyleName = (family: "text" | "paragraph", name: string) => string | undefined;

/** Writes the index source through the original Writer descriptor and form. @param tox - Attached index descriptor. @param source - Shared parsed properties. @param styleName - Original style-name boundary. @returns Nothing. */
function importIndexSource(
  tox: SwTOXBase,
  source: XMLIndexTOCSource,
  styleName: IndexStyleName,
): void {
  tox.level = source.outlineLevel;
  tox.createType =
    (source.useMarks ? SwTOXElement.Mark : SwTOXElement.None) |
    (source.useOutline ? SwTOXElement.OutlineLevel : SwTOXElement.None) |
    (source.useStyles ? SwTOXElement.Template : SwTOXElement.None);
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
      const token = new SwFormToken(formTypes[entry.kind]);
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
        if (entry.display === "plain-number")
          token.nChapterFormat = SwChapterFormat.NumberNoPrePostAndTitle;
        else if (
          entry.display === "name" ||
          entry.display === "number-and-name" ||
          entry.display === "plain-number-and-name"
        )
          throw new Error("Writer TOC entry requires a chapter-number format.");
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
  const index = new SwXDocumentIndex(parent.GetPaM().GetPoint().GetNode().GetDoc());
  const descriptor = index.GetTOXBase();
  descriptor.name = properties.name;
  descriptor.protected = properties.protected;
  const node = index.attach(parent);
  if (style) importSectionStyle(node.GetSection().GetFormat(), style);
  return {
    outlineLevels: MAXLEVEL,
    /** Sets the attached native index source before exposure. @param source - Parsed source definition. @returns Nothing. */
    setSource(source): void {
      importIndexSource(index.GetTOXBase(), source, styleName);
    },
    end: pushSectionCursor(helper, node, parent),
  };
}

/** Projects the original TOC property values through the common section exporter. @param tox - Connected index properties. @returns ODF index data. */
export function exportDocumentIndex(tox: SwTOXBase): XMLIndexTOCSource {
  const templates: XMLIndexTOCSource["templates"][number][] = [];
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
          ...(token.nOutlineLevel === MAXLEVEL ? {} : { chapterLevel: token.nOutlineLevel }),
          ...(token.nChapterFormat === SwChapterFormat.NumberNoPrePostAndTitle
            ? { display: "plain-number" }
            : {}),
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
    templates.push({ level, styleName: tox.form.GetTemplate(level), entries });
    const styles = tox.GetStyleNames(level - 1);
    if (styles) sourceStyles.set(level, styles.split(TOX_STYLE_DELIMITER));
  }
  return {
    outlineLevel: tox.level,
    useOutline: Boolean(tox.createType & SwTOXElement.OutlineLevel),
    useMarks: Boolean(tox.createType & SwTOXElement.Mark),
    useStyles: Boolean(tox.createType & SwTOXElement.Template),
    fromChapter: tox.fromChapter,
    relativeTabs: tox.form.IsRelTabPos(),
    title: { styleName: tox.form.GetTemplate(0), text: tox.title },
    templates,
    sourceStyles,
  };
}
