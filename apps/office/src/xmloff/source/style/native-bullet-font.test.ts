/** @fileoverview Checks pinned numbering font lookup, family quoting and native import precedence. */
import { expect, it, vi } from "vitest";
import { parseOdfXmlStream } from "../core/xmlimp";
import { ODF_NAMESPACES, XMLToken } from "../core/xmltoken";
import { escapeXml } from "../text/txtparae";
import type { XMLTextListRule } from "../text/txtparai";
import { SvxXMLNumRuleExport } from "./xmlnume";
import { SvxXMLListStyleContext } from "./xmlnumi";

it("exports only nonempty CHAR_SPECIAL font descriptors through borrowed lookup or native family fallback", /** Checks literal source omission and escaped family lists without registering another font owner. @returns Nothing. */ () => {
  const lookup = vi.fn(
    /** Reads existing pool aliases without registration. @param name - Family. @returns Existing alias or absence. */ (
      name: string,
    ) => (name === "Declared" ? "Face&Alias" : name === "EmptyLookup" ? "" : undefined),
  );
  const exporter = new SvxXMLNumRuleExport(escapeXml, lookup);
  const bullet = { kind: "bullet" as const, bulletChar: "•" };
  expect(exporter.exportLevelStyle(0, { ...bullet, bulletFont: { name: "Declared" } })).toContain(
    '<style:text-properties style:font-name="Face&amp;Alias"/>',
  );
  expect(
    exporter.exportLevelStyle(0, {
      ...bullet,
      bulletFont: { name: "Liberation Mono;Comma, Face" },
    }),
  ).toContain(
    '<style:text-properties fo:font-family="&apos;Liberation Mono&apos;, &apos;Comma, Face&apos;"/>',
  );
  expect(
    exporter.exportLevelStyle(0, { ...bullet, bulletFont: { name: "EmptyLookup" } }),
  ).toContain('<style:text-properties fo:font-family="EmptyLookup"/>');
  expect(
    new SvxXMLNumRuleExport(escapeXml).exportLevelStyle(0, {
      ...bullet,
      bulletFont: { name: "NoPool" },
    }),
  ).toContain('fo:font-family="NoPool"');
  lookup.mockClear();
  for (const properties of [
    bullet,
    { ...bullet, bulletFont: { name: "" } },
    { kind: "numbered" as const, bulletFont: { name: "Declared" } },
    { ...bullet, numberingType: 5, bulletFont: { name: "Declared" } },
  ])
    expect(exporter.exportLevelStyle(0, properties)).not.toContain("style:text-properties");
  expect(lookup).not.toHaveBeenCalled();
});

/** Imports actual source-owned list contexts with an optional existing font declaration port. @param children - Literal property children. @param kind - Numbering family. @param declarations - Whether a declaration owner is available. @returns Published rule. */
function parse(children: string, kind = "bullet", declarations = true): XMLTextListRule {
  let rule: XMLTextListRule | undefined;
  const target = {
    /** Retains the actual publication. @param name - Style identity. @param value - Rule. @returns Nothing. */
    registerListStyle(name: string, value: XMLTextListRule) {
      expect(name).toBe("Native");
      rule = value;
    },
    ...(declarations
      ? {
          /** Resolves existing faces only. @param name - Declaration alias. @returns Family or absence. */
          getFontFace(name: string) {
            return name === "Alias" ? "Declared Serif" : name === "Empty" ? "" : undefined;
          },
        }
      : {}),
  };
  parseOdfXmlStream(
    `<text:list-style xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:fo="${ODF_NAMESPACES.fo}" style:name="Native"><text:list-level-style-${kind} text:level="1">${children}</text:list-level-style-${kind}></text:list-style>`,
    {
      /** Creates the actual owning rule context. @param token - Root. @param values - Attributes. @returns Rule context or null. */
      createFastContext(token, values) {
        return token === XMLToken.TEXT_LIST_STYLE
          ? new SvxXMLListStyleContext(target, values)
          : null;
      },
      /** Ignores unknown roots. @returns Null. */ createUnknownContext: () => null,
    },
  );
  if (rule === undefined) throw Error("Missing rule publication");
  return rule;
}

it("resolves declared families then direct overrides while retaining prior values after absent or unknown faces", /** Checks both native property-child contexts, empty descriptors, family lists and nonbullet omission. @returns Nothing. */ () => {
  for (const element of ["style:text-properties", "style:list-level-properties"]) {
    expect(parse(`<${element} style:font-name="Alias"/>`).levels[0]?.bulletFont).toEqual({
      name: "Declared Serif",
    });
    expect(
      parse(
        `<${element} style:font-name="Alias" fo:font-family="&apos;Direct Serif&apos;, &quot;Comma, Face&quot;"/>`,
      ).levels[0]?.bulletFont,
    ).toEqual({ name: "Direct Serif;Comma, Face" });
    expect(
      parse(
        `<${element} style:font-name="Alias" fo:font-family=""/><${element} style:font-name="Missing"/>`,
      ).levels[0]?.bulletFont,
    ).toEqual({ name: "Declared Serif" });
    expect(
      parse(`<${element} style:font-name="Alias"/><${element} style:font-name="Empty"/>`).levels[0]
        ?.bulletFont,
    ).toEqual({ name: "" });
    expect(parse(`<${element} style:font-name="Missing"/>`).levels[0]?.bulletFont).toEqual({
      name: "",
    });
    expect(
      parse(`<${element} style:font-name="Alias"/>`, "bullet", false).levels[0]?.bulletFont,
    ).toEqual({ name: "" });
    expect(
      parse(`<${element} fo:font-family="Mono"/>`, "number").levels[0]?.bulletFont,
    ).toBeUndefined();
  }
  expect(parse("").levels[0]?.bulletFont).toEqual({ name: "" });
});
