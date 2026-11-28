/** @fileoverview Native office settings groups and indexed view XML admission. */
import { expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { PropertyState } from "../../../udkapi/com/sun/star/beans/PropertyState";
import { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XMLDocumentSettingsContext, type ViewSettings } from "./DocumentSettingsContext";
import { exportConfigurationSettings, exportViewSettings } from "./SettingsExportHelper";
import { parseOdfXmlStream, SvXMLImportContext } from "./xmlimp";
import { ODF_NAMESPACES, XMLToken } from "./xmltoken";

/** Wraps literal properties in standard ODF settings namespaces. @param settings - Office settings children. @returns Complete XML. */
function settingsDocument(settings: string): string {
  const { office, config, ooo } = ODF_NAMESPACES;
  return `<office:document-settings xmlns:office="${office}" xmlns:c="${config}" xmlns:app="${ooo}" xmlns:foreign="urn:example"><office:settings>${settings}</office:settings></office:document-settings>`;
}

/** Parses the shared settings stream and retains copied scalar properties. @param xml - Native XML text. @returns Published view and configuration values. */
function readSettings(xml: string) {
  let views: ViewSettings | undefined;
  const configuration: [string, boolean | string][] = [];
  parseOdfXmlStream(xml, {
    /** Selects the settings document root. @returns Root context. */
    createFastContext() {
      /** Test settings document root. */
      class SettingsRoot extends SvXMLImportContext {
        /** Attaches both supported consumers at the settings element. @param element - Child token. @returns Child context. */
        override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
          return element === XMLToken.OFFICE_SETTINGS
            ? new XMLDocumentSettingsContext(
                /** Copies the represented settings values. @param properties - Borrowed values. @returns Nothing. */
                (properties) => {
                  for (const property of properties) {
                    const name = text(property.Name);
                    const value: [boolean] = [false];
                    if (property.Value.extract(value, "bool")) {
                      configuration.push([name, value[0]]);
                      continue;
                    }
                    const string = new OUString();
                    try {
                      expect(property.Value.extract(string, "OUString")).toBe(true);
                      configuration.push([name, text(string)]);
                    } finally {
                      string.dispose();
                    }
                  }
                },
                /** Receives the represented index map. @param values - Parsed views. @returns Nothing. */
                (values) => (views = values),
              )
            : null;
        }
      }
      return new SettingsRoot();
    },
    /** Leaves an unrelated root unsupported. @returns Absent context. */
    createUnknownContext: () => null,
  });
  return { views, configuration };
}

it("decodes string view records in position order and independent configuration settings", /** Verifies native group QNames, property types and nested content boundaries. @returns Nothing. */ () => {
  const result = readSettings(
    settingsDocument(`
    <foreign:other><c:config-item-set c:name="app:configuration-settings"/></foreign:other>
    <c:config-item-set c:name="foreign:view-settings"><c:config-item-map-indexed c:name="Views"/></c:config-item-set>
    <c:config-item-set c:name="app:view-settings">
      <c:config-item c:name="Ignored" c:type="string">none</c:config-item>
      <foreign:other><c:config-item-map-indexed c:name="Views"/></foreign:other>
      <c:config-item-map-indexed c:name="Invalid"/>
      <c:config-item-map-indexed c:name="Views">
        <c:config-item c:name="Invalid" c:type="string">ignored</c:config-item>
        <foreign:other><c:config-item-map-entry/></foreign:other>
        <c:config-item-map-entry/>
        <c:config-item-map-entry>
          <c:config-item c:name="ViewId" c:type="string">view2</c:config-item>
          <c:config-item c:name="ActiveTable" c:type="int">1</c:config-item>
          <c:config-item c:type="string">no name</c:config-item>
          <foreign:other><c:config-item c:name="Nested" c:type="string">ignored</c:config-item></foreign:other>
          <c:config-item c:name="ActiveTable" c:type="string">A&amp;<![CDATA[B]]><foreign:other>ignored</foreign:other></c:config-item>
          <c:config-item c:name="ShowGrid" c:type="boolean">0</c:config-item>
          <c:config-item-map-named c:name="Tables">
            <foreign:other><c:config-item-map-entry c:name="Nested"/></foreign:other>
            <c:config-item-map-entry/>
            <c:config-item c:name="Wrong" c:type="boolean">true</c:config-item>
            <c:config-item-map-entry c:name="A&amp;B">
              <foreign:other><c:config-item c:name="Nested" c:type="boolean">true</c:config-item></foreign:other>
              <c:config-item c:name="ShowGrid" c:type="boolean">false</c:config-item>
              <c:config-item c:name="ShortValue" c:type="short">65541</c:config-item>
            </c:config-item-map-entry>
          </c:config-item-map-named>
        </c:config-item-map-entry>
      </c:config-item-map-indexed>
    </c:config-item-set>
    <c:config-item-set c:name="app:configuration-settings">
      <c:config-item c:name="True" c:type="boolean">true</c:config-item>
      <c:config-item c:name="False" c:type="boolean">false</c:config-item>
      <c:config-item c:name="String" c:type="string">true</c:config-item>
      <foreign:other><c:config-item c:name="Nested" c:type="boolean">true</c:config-item></foreign:other>
    </c:config-item-set>`),
  );
  expect(result.views).toEqual([
    [],
    [
      ["ViewId", "view2"],
      ["ActiveTable", 1],
      ["ActiveTable", "A&B"],
      [
        "Tables",
        [
          [
            "A&B",
            [
              ["ShowGrid", false],
              ["ShortValue", 5, "short"],
            ],
          ],
        ],
      ],
    ],
  ]);
  expect(result.configuration).toEqual([
    ["True", true],
    ["False", false],
    ["String", "true"],
  ]);
});

it("skips absent native configuration values", /** Exercises typed export admission without affecting the view group. @returns Nothing. */ () => {
  const value = new PropertyValue();
  const name = unicode("Show & Layout");
  const flag = new Any(false);
  const supported = new PropertyValue(name, 0, flag, PropertyState.DIRECT_VALUE);
  try {
    expect(readSettings(exportConfigurationSettings([value, supported]))).toEqual({
      views: undefined,
      configuration: [["Show & Layout", false]],
    });
  } finally {
    supported.dispose();
    flag.dispose();
    name.dispose();
    value.dispose();
  }
});

it("round-trips escaped view data and distinguishes absent and empty views", /** Verifies the shared serializer and optional view group. @returns Nothing. */ () => {
  const views = [
    [
      ["ViewId", "view1"],
      ["ActiveTable", "R&D <Total>"],
      ["ShowGrid", true],
      [
        "Tables",
        [
          [
            "R&D <Total>",
            [
              ["ShowGrid", false],
              ["CursorPositionX", 13],
              ["HorizontalSplitMode", 2, "short"],
              ["Text", "<&>"],
            ],
          ],
        ],
      ],
    ],
  ] as const;
  expect(exportViewSettings(views)).toContain(
    'config:name="HorizontalSplitMode" config:type="short">2<',
  );
  expect(readSettings(exportViewSettings(views))).toEqual({ views, configuration: [] });
  expect(readSettings(exportViewSettings([]))).toEqual({ views: [], configuration: [] });
  expect(
    readSettings(
      settingsDocument(
        '<c:config-item-set c:name="app:view-settings"><c:config-item-map-indexed c:name="Views"/></c:config-item-set><c:config-item-set c:name="app:view-settings"/>',
      ),
    ),
  ).toEqual({ views: undefined, configuration: [] });
  expect(readSettings(settingsDocument('<c:config-item-set c:name="view-settings"/>'))).toEqual({
    views: undefined,
    configuration: [],
  });
});
