/** @fileoverview Verifies complete Writer style and font ODT round-trip compatibility. */

import { describe, expect, it, vi } from "vitest";

import { SvxFontHeightItem, SvxFontItem } from "../../../../editeng/source/items/textitem";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { ZipOutputStream } from "../../../../package/source/zipapi/ZipOutputStream";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import {
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
} from "../../../inc/hintids";
import { getWriterOdfStyleName, WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL } from "../../../inc/poolfmt";
import { createWriterDocument } from "../../core/doc/doc";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { createWriterTextFragment } from "../basflt/writer-transfer";
import { encodeWriterDocument } from "../../../browser/filter/xml/writer-document-codec";
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
  it("keeps Latin, Asian and complex-script family identities separate", /** Mirrors Writer's three SvxFontItem slots in named styles. @returns Completion. */ async () => {
    const writer = createWriterDocument();
    const style = writer.GetTextFormatColl("text-body");
    style.SetFormatAttr(new SvxFontItem("Latin Serif", RES_CHRATR_FONT));
    style.SetFormatAttr(new SvxFontItem("Asian Serif", RES_CHRATR_CJK_FONT));
    style.SetFormatAttr(new SvxFontItem("Complex Serif", RES_CHRATR_CTL_FONT));
    const metadata = { title: "Script families" };
    const saved = writeOdtDocument(writer, metadata);
    const stylesXml = await new ZipFile(saved).readTextEntry("styles.xml");
    expect(stylesXml).toContain('style:font-name-asian="Asian Serif"');
    expect(stylesXml).toContain('style:font-name-complex="Complex Serif"');
    const reopened = await readOdtDocument(saved, metadata);
    const imported = reopened.document.GetTextFormatColl("text-body").GetAttrSet();
    expect((imported.Get(RES_CHRATR_FONT, true) as SvxFontItem).GetFamilyName()).toBe(
      "Latin Serif",
    );
    expect((imported.Get(RES_CHRATR_CJK_FONT, true) as SvxFontItem).GetFamilyName()).toBe(
      "Asian Serif",
    );
    expect((imported.Get(RES_CHRATR_CTL_FONT, true) as SvxFontItem).GetFamilyName()).toBe(
      "Complex Serif",
    );
    for (const attribute of ["font-name-asian", "font-name-complex"]) {
      const invalid = await rewriteStylesXml(
        saved,
        /** Breaks one declared script face reference. @param styles - Named-style XML. @returns Invalid XML. */ (
          styles,
        ) =>
          styles.replace(
            new RegExp(`style:${attribute}="[^"]+"`, "u"),
            `style:${attribute}="Missing"`,
          ),
      );
      await expect(readOdtDocument(invalid, metadata)).rejects.toThrow("ODF XML is malformed");
    }
  });

  it("preserves LibreOffice-declared Title parents across export and import", /** Verifies named-style parent linkage follows the ODF declaration instead of the built-in pool default. @returns Nothing. */ async () => {
    const writer = createWriterDocument();
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
    const exported = new ZipFile(writeOdtDocument(imported.document, { title: imported.title }));
    expect(await exported.readTextEntry("styles.xml")).toMatch(
      /<style:style style:name="Title"[^>]*style:parent-style-name="Standard"/,
    );
    const reopened = await readOdtDocument(
      writeOdtDocument(imported.document, { title: imported.title }),
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
    const writer = createWriterDocument();
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
    const exported = new ZipFile(writeOdtDocument(imported.document, { title: imported.title }));
    expect(await exported.readTextEntry("styles.xml")).toMatch(
      /<style:style style:name="Title"[^>]*style:next-style-name="Subtitle"/,
    );
    const reopened = await readOdtDocument(
      writeOdtDocument(imported.document, { title: imported.title }),
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

  it("round-trips the supported LibreOffice paragraph-style hierarchy and font-face references", /** Verifies open-save-reopen semantics. @returns Nothing. */ async () => {
    const writer = createWriterDocument();
    for (const style of WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL) writer.GetTextFormatColl(style.id);
    const textBody = writer.GetTextFormatColl("text-body");
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      textBody.SetFormatAttr(
        new SvxFontItem(
          "Source Serif 4",
          which,
          "Source Serif 4",
          which === RES_CHRATR_FONT ? "roman" : undefined,
        ),
      );
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      textBody.SetFormatAttr(new SvxFontHeightItem(13 * 20, which));
    const paragraph = writer.paragraphs[0];
    paragraph?.ChgFormatColl(writer.GetTextFormatColl("heading-1"));
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      paragraph?.SetAttr(new SvxFontItem("Paragraph Serif", which));
    paragraph?.ReplaceRange(
      0,
      0,
      createWriterTextFragment(paragraph, [
        {
          attributes: {
            bold: false,
            fontFamily: "Noto Sans",
            fontSizeTwips: 15 * 20,
            italic: false,
            underline: false,
          },
          text: "font round trip",
        },
      ]),
    );

    const state = createDocument({ id: "odt-all", suiteId: "writer", title: "All styles" });
    const firstBytes = writeOdtDocument(writer, state);
    const firstArchive = new ZipFile(firstBytes);
    const stylesXml = await firstArchive.readTextEntry("styles.xml");
    const contentXml = await firstArchive.readTextEntry("content.xml");
    expect(stylesXml).toContain(
      '<style:font-face style:name="Source Serif 4" svg:font-family="&apos;Source Serif 4&apos;" style:font-family-generic="roman"/>',
    );
    expect(contentXml).toContain(
      '<style:font-face style:name="Noto Sans" svg:font-family="&apos;Noto Sans&apos;"/>',
    );
    expect(stylesXml).toContain('fo:font-size="13pt"');
    expect(contentXml).toContain('fo:font-size="15pt"');
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses expected diagnostics. @returns Nothing. */ () => undefined,
      );
    for (const unsupportedSize of ["0pt", "130%"])
      await expect(
        readOdtDocument(
          await rewriteStylesXml(
            firstBytes,
            /** Replaces one absolute size with an unsupported form. @param xml - Styles XML. @returns Updated XML. */ (
              xml,
            ) => xml.replace(/fo:font-size="[^"]+"/, `fo:font-size="${unsupportedSize}"`),
          ),
          state,
        ),
      ).resolves.toBeDefined();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("font size ignored"));
    warn.mockRestore();
    expect(contentXml).toContain('style:parent-style-name="Heading_20_1"');
    for (const style of WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL) {
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
    expect(opened.document.GetTextFormatColls()).toHaveLength(26);
    expect(
      (
        opened.document
          .GetTextFormatColl("text-body")
          .GetAttrSet()
          .GetItemIfSet(RES_CHRATR_FONT, false) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Source Serif 4");
    expect(
      (
        opened.document
          .GetTextFormatColl("text-body")
          .GetAttrSet()
          .GetItemIfSet(RES_CHRATR_FONT, false) as SvxFontItem
      ).GetGenericFamily(),
    ).toBe("roman");
    expect(
      (
        opened.document
          .GetTextFormatColl("text-body")
          .GetAttrSet()
          .GetItemIfSet(RES_CHRATR_FONTSIZE, false) as SvxFontHeightItem
      ).GetHeight(),
    ).toBe(13 * 20);
    expect(opened.document.paragraphs[0]?.GetParagraphStyle()).toBe("heading-1");
    expect(projectWriterTextRuns(opened.document.paragraphs[0]).at(0)?.attributes.fontFamily).toBe(
      "Noto Sans",
    );
    expect(
      projectWriterTextRuns(opened.document.paragraphs[0]).at(0)?.attributes.fontSizeTwips,
    ).toBe(15 * 20);

    const reopened = await readOdtDocument(
      writeOdtDocument(opened.document, { title: opened.title }),
      state,
    );
    const projectStyles =
      /** Projects file-relevant style state. @param document - Writer snapshot. @returns Comparable styles. */ (
        document: ReturnType<typeof encodeWriterDocument>,
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
    expect(projectStyles(encodeWriterDocument(reopened.document))).toEqual(
      projectStyles(encodeWriterDocument(opened.document)),
    );
    expect(reopened.document.paragraphs[0]?.GetParagraphStyle()).toBe("heading-1");
    expect(
      projectWriterTextRuns(reopened.document.paragraphs[0]).at(0)?.attributes.fontFamily,
    ).toBe("Noto Sans");
  });
});
