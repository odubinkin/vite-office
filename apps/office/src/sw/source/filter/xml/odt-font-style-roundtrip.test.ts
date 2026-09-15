/** @fileoverview Verifies complete Writer style and font ODT round-trip compatibility. */

import { describe, expect, it } from "vitest";

import { SvxFontItem } from "../../../../editeng/source/items/textitem";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT, RES_CHRATR_FONT } from "../../../inc/hintids";
import { getWriterOdfStyleName, WRITER_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { createWriterDocument } from "../../core/doc/writer";
import { readOdtDocument } from "./swxml";
import { writeOdtDocument } from "./wrtxml";

/** Rebuilds an ODT after transforming its named-style stream. @param bytes - Source package. @param transform - styles.xml transform. @returns Rebuilt package. */
async function rewriteStylesXml(
  bytes: Uint8Array,
  transform: (styles: string) => string,
): Promise<Uint8Array> {
  const input = new ZipFile(bytes);
  const output = new ZipOutputStream();
  for (const name of input.getEntryNames())
    output.putNextEntry(
      name,
      name === "styles.xml"
        ? new TextEncoder().encode(transform(await input.readTextEntry(name)))
        : await input.readEntry(name),
    );
  return output.finish();
}

describe("Writer ODT font and style compatibility", /** Groups file compatibility tests. @returns Nothing. */ () => {
  it("preserves LibreOffice-declared Title parents across export and import", /** Verifies named-style parent linkage follows the ODF declaration instead of the built-in pool default. @returns Nothing. */ async () => {
    const writer = createWriterDocument("title-parent");
    writer.GetTextFormatColl("title");
    writer.GetTextFormatColl("subtitle");
    const state = createDocument({ id: "title-parent", suiteId: "writer", title: "Title parent" });
    const bytes = writeOdtDocument(writer, state);
    const replaceTitleParent =
      /** Replaces Title's declared parent. @param styles - Named-style XML. @param parent - Replacement ODF style name. @returns Updated XML. */ (
        styles: string,
        parent: string,
      ): string =>
        styles.replace(
          /(<style:style style:name="Title"[^>]*style:parent-style-name=")[^"]+/,
          `$1${parent}`,
        );
    const standardBytes = await rewriteStylesXml(
      bytes,
      /** Selects Standard as Title's parent. @param styles - Named-style XML. @returns Updated XML. */ (
        styles,
      ) => replaceTitleParent(styles, "Standard"),
    );

    const imported = await readOdtDocument(standardBytes, state);
    expect(imported.document.GetTextFormatColl("title").DerivedFrom()).toBe(
      imported.document.GetDfltTextFormatColl(),
    );
    const exported = new ZipFile(writeOdtDocument(imported.document, imported.documentState));
    expect(await exported.readTextEntry("styles.xml")).toMatch(
      /<style:style style:name="Title"[^>]*style:parent-style-name="Standard"/,
    );
    const reopened = await readOdtDocument(
      writeOdtDocument(imported.document, imported.documentState),
      state,
    );
    expect(reopened.document.GetTextFormatColl("title").DerivedFrom()).toBe(
      reopened.document.GetDfltTextFormatColl(),
    );

    for (const parent of ["Missing", "Title"])
      expect(
        (
          await readOdtDocument(
            await rewriteStylesXml(
              bytes,
              /** Selects one invalid Title parent. @param styles - Named-style XML. @returns Updated XML. */ (
                styles,
              ) => replaceTitleParent(styles, parent),
            ),
            state,
          )
        ).document
          .GetTextFormatColl("title")
          .DerivedFrom(),
      ).toBeUndefined();

    const cycleBytes = await rewriteStylesXml(
      bytes,
      /** Creates a two-style inheritance cycle. @param styles - Named-style XML. @returns Updated XML. */ (
        styles,
      ) =>
        replaceTitleParent(styles, "Subtitle").replace(
          /(<style:style style:name="Subtitle"[^>]*style:parent-style-name=")[^"]+/,
          "$1Title",
        ),
    );
    const cycle = await readOdtDocument(cycleBytes, state);
    expect(cycle.document.GetTextFormatColl("title").DerivedFrom()).toBe(
      cycle.document.GetTextFormatColl("subtitle"),
    );
    expect(cycle.document.GetTextFormatColl("subtitle").DerivedFrom()).toBeUndefined();
  });

  it("preserves LibreOffice-declared Title follow styles across export and import", /** Verifies named-style follow linkage is resolved after style creation with upstream fallback semantics. @returns Nothing. */ async () => {
    const writer = createWriterDocument("title-follow");
    writer.GetTextFormatColl("title");
    writer.GetTextFormatColl("subtitle");
    const state = createDocument({ id: "title-follow", suiteId: "writer", title: "Title follow" });
    const bytes = writeOdtDocument(writer, state);
    const replaceTitleFollow =
      /** Replaces Title's declared follow style. @param styles - Named-style XML. @param follow - Replacement ODF style name. @returns Updated XML. */ (
        styles: string,
        follow: string,
      ): string =>
        styles.replace(
          /(<style:style style:name="Title"[^>]*style:next-style-name=")[^"]+/,
          `$1${follow}`,
        );

    const subtitleBytes = await rewriteStylesXml(
      bytes,
      /** Selects Subtitle as Title's follow style. @param styles - Named-style XML. @returns Updated XML. */ (
        styles,
      ) => replaceTitleFollow(styles, "Subtitle"),
    );
    const imported = await readOdtDocument(subtitleBytes, state);
    expect(imported.document.GetTextFormatColl("title").GetNextTextFormatColl()).toBe(
      imported.document.GetTextFormatColl("subtitle"),
    );
    const exported = new ZipFile(writeOdtDocument(imported.document, imported.documentState));
    expect(await exported.readTextEntry("styles.xml")).toMatch(
      /<style:style style:name="Title"[^>]*style:next-style-name="Subtitle"/,
    );
    const reopened = await readOdtDocument(
      writeOdtDocument(imported.document, imported.documentState),
      state,
    );
    expect(reopened.document.GetTextFormatColl("title").GetNextTextFormatColl()).toBe(
      reopened.document.GetTextFormatColl("subtitle"),
    );

    for (const transform of [
      /** Removes Title's follow declaration. @param styles - Named-style XML. @returns Updated XML. */ (
        styles: string,
      ) =>
        styles.replace(
          /(<style:style style:name="Title"[^>]*) style:next-style-name="[^"]+"/,
          "$1",
        ),
      /** Selects an unresolved Title follow style. @param styles - Named-style XML. @returns Updated XML. */ (
        styles: string,
      ) => replaceTitleFollow(styles, "Missing"),
    ]) {
      const fallback = await readOdtDocument(await rewriteStylesXml(bytes, transform), state);
      const title = fallback.document.GetTextFormatColl("title");
      expect(title.GetNextTextFormatColl()).toBe(title);
    }
  });

  it("round-trips the complete LibreOffice paragraph-style hierarchy and font-face references", /** Verifies open-save-reopen semantics. @returns Nothing. */ async () => {
    const writer = createWriterDocument("all-styles");
    for (const style of WRITER_PARAGRAPH_STYLE_POOL) writer.GetTextFormatColl(style.id);
    const textBody = writer.GetTextFormatColl("text-body");
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      textBody.SetFormatAttr(new SvxFontItem("Source Serif 4", which));
    const paragraph = writer.paragraphs[0];
    paragraph?.ChgFormatColl(writer.GetTextFormatColl("numbering-1-cont"));
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      paragraph?.SetAttr(new SvxFontItem("Paragraph Serif", which));
    paragraph?.ReplaceRange(0, 0, [
      {
        attributes: {
          bold: false,
          fontFamily: "Noto Sans",
          italic: false,
          underline: false,
        },
        text: "font round trip",
      },
    ]);

    const state = createDocument({ id: "odt-all", suiteId: "writer", title: "All styles" });
    const firstBytes = writeOdtDocument(writer, state);
    const firstArchive = new ZipFile(firstBytes);
    const stylesXml = await firstArchive.readTextEntry("styles.xml");
    const contentXml = await firstArchive.readTextEntry("content.xml");
    expect(stylesXml).toContain(
      '<style:font-face style:name="Source Serif 4" svg:font-family="&apos;Source Serif 4&apos;"/>',
    );
    expect(contentXml).toContain(
      '<style:font-face style:name="Noto Sans" svg:font-family="&apos;Noto Sans&apos;"/>',
    );
    expect(contentXml).toContain('style:parent-style-name="Numbering_20_1_20_Cont."');
    for (const style of WRITER_PARAGRAPH_STYLE_POOL) {
      const name = getWriterOdfStyleName(style.id);
      const start = stylesXml.indexOf(`<style:style style:name="${name}"`);
      expect(start, name).toBeGreaterThanOrEqual(0);
      const openingTag = stylesXml.slice(start, stylesXml.indexOf(">", start) + 1);
      if (style.parentId === undefined) expect(openingTag).not.toContain("style:parent-style-name");
      else
        expect(openingTag).toContain(
          `style:parent-style-name="${getWriterOdfStyleName(style.parentId)}"`,
        );
      if (style.followId === style.id) expect(openingTag).not.toContain("style:next-style-name");
      else
        expect(openingTag).toContain(
          `style:next-style-name="${getWriterOdfStyleName(style.followId)}"`,
        );
    }

    const opened = await readOdtDocument(firstBytes, state);
    expect(opened.document.GetTextFormatColls()).toHaveLength(126);
    expect(
      (
        opened.document
          .GetTextFormatColl("text-body")
          .GetAttrSet()
          .GetItemIfSet(RES_CHRATR_FONT, false) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Source Serif 4");
    expect(opened.document.paragraphs[0]?.style).toBe("numbering-1-cont");
    expect(opened.document.paragraphs[0]?.runs[0]?.attributes.fontFamily).toBe("Noto Sans");

    const reopened = await readOdtDocument(
      writeOdtDocument(opened.document, opened.documentState),
      state,
    );
    const projectStyles =
      /** Projects file-relevant style state. @param document - Writer snapshot. @returns Comparable styles. */ (
        document: ReturnType<typeof opened.document.toSnapshot>,
      ) =>
        document.textFormatCollections.map(
          /** Projects one style. @param style - Snapshot style. @returns Comparable style. */ (
            style,
          ) => ({
            followId: style.followId,
            id: style.id,
            items: style.items,
            parentId: style.parentId,
          }),
        );
    expect(projectStyles(reopened.document.toSnapshot())).toEqual(
      projectStyles(opened.document.toSnapshot()),
    );
    expect(reopened.document.paragraphs[0]?.style).toBe("numbering-1-cont");
    expect(reopened.document.paragraphs[0]?.runs[0]?.attributes.fontFamily).toBe("Noto Sans");
  });
});
