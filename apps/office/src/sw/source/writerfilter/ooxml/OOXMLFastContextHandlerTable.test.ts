/** @fileoverview Native resource-table and property-table contexts through real DOCX ZIP input, SAX factories, value tables and ordered reference callbacks. */
import { BorderHandler } from "../dmapper/BorderHandler";
import { TDefTableHandler } from "../dmapper/TDefTableHandler";
import { TablePropertyMap } from "../dmapper/PropertyMap";
import { PropertyIds as P } from "../dmapper/PropertyIds";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { MeasureHandler } from "../dmapper/MeasureHandler";
import { CellMarginHandler } from "../dmapper/CellMarginHandler";
import { CellColorHandler } from "../dmapper/CellColorHandler";
import { TablePositionHandler } from "../dmapper/TablePositionHandler";
import { SequenceAsHashMap } from "../../../../comphelper/source/misc/sequenceashashmap";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { LatentStyleHandler } from "../dmapper/LatentStyleHandler";
import { SizeType } from "../../../../offapi/com/sun/star/text/SizeType";
import { expect, it } from "vitest";
import {
  OOXMLFastContextHandler as Base,
  OOXMLFastContextHandlerProperties as PropertiesContext,
  OOXMLFastContextHandlerTable as TableContext,
  OOXMLFastContextHandlerPropertyTable as PropertyTable,
  ResourceEnum_t,
} from "./OOXMLFastContextHandler";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import { OOXMLDocument } from "./OOXMLDocumentImpl";
import { OOXMLFactory_wml } from "./OOXMLFactory_wml";
import { defines } from "./OOXMLFactory_wml.tables";
import { OOXMLFactory } from "./OOXMLFactory";
import { nativeToken as token } from "./OOXMLFactory_wml";
import { OOXMLPropertySet, OOXMLPropertyType, OOXMLValue as V } from "./OOXMLPropertySet";
import type { Stream, Table, Reference, Properties, Value } from "../inc/dmapper/resourcemodel";
import { StreamType_t } from "../inc/ooxml/OOXMLDocument";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { WriteRelationsInfoSequence } from "../../../../comphelper/source/xml/ofopxmlhelper";
import { text, unicode } from "../../core/unocore/unocrsrhelper";

/** Test-only callback receiver rejects accidental non-table delivery. @returns Actual Stream callback contract and retained table references. */
function receiver() {
  const tables: [number, Reference<Table>][] = [];
  /** Rejects callbacks outside this resource-table stream. @returns Never. */
  function unexpected(): never {
    throw new Error("Unexpected non-table callback");
  }
  const stream: Stream = {
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
    /** Retains the original cloned table reference and resource identity. @param id - Native ID. @param table - Table. @returns Nothing. */
    table(id, table) {
      tables.push([id, table]);
    },
  };
  return { stream, tables };
}
/** Resolves table entries without projecting resource values into a document model. @param table - Actual native reference. @returns Positional property sets. */
function entries(table: Reference<Table>): [number, Reference<Properties>][] {
  const result: [number, Reference<Properties>][] = [];
  table.resolve({
    /** Receives original entry position and borrowed property set. @param index - Position. @param properties - Set. @returns Nothing. */
    entry(index, properties) {
      result.push([index, properties]);
    },
  });
  return result;
}
/** Resolves attributes and modifiers in their native stored order. @param properties - Native reference. @returns Ordered values. */
function values(properties: Reference<Properties>): [number, Value][] {
  const result: [number, Value][] = [];
  properties.resolve({
    /** Retains the original attribute value. @param id - Native ID. @param value - Value. @returns Nothing. */
    attribute(id, value) {
      result.push([id, value]);
    },
    /** Retains the original modifier's owned value. @param sprm - Native modifier. @returns Nothing. */
    sprm(sprm) {
      const value = sprm.getValue();
      if (value) result.push([sprm.getId(), value]);
    },
  });
  return result;
}
/** Resolves one actual nested modifier without a replacement parser or value projection. @param properties - Native set. @param id - Modifier ID. @returns Referenced property set. */
function nested(properties: Reference<Properties>, id: number): Reference<Properties> {
  let result: Reference<Properties> | null = null;
  properties.resolve({
    /** Attributes belong to the containing set, not the requested nested modifier. @param attribute - ID. @param value - Value. @returns Nothing. */
    attribute(attribute, value) {
      void attribute;
      void value;
    },
    /** Borrows the exact stored reference. @param modifier - Native modifier. @returns Nothing. */
    sprm(modifier) {
      if (modifier.getId() === id) result = modifier.getProps();
    },
  });
  if (!result) throw new Error("Missing native nested properties: " + id);
  return result;
}
/** Gets one actual resource's Unicode value and releases its temporary owner. @param properties - Set. @param id - Native identity. @returns String or absent. */
function string(properties: Reference<Properties>, id: number): string | undefined {
  const value = values(properties).find(
    /** Selects the exact native resource identity. @param entry - Stored resource. @returns Match. */ (
      entry,
    ) => entry[0] === id,
  )?.[1];
  if (!value) return undefined;
  const unicode = value.getString();
  try {
    return text(unicode);
  } finally {
    unicode.dispose();
  }
}
/** Writes actual ZIP part bytes. @param storage - Native host storage. @param path - Part path. @param xml - XML. @returns Nothing. */
function put(storage: ZipStorage, path: string, xml: string): void {
  storage.openOutputStream(path, "application/xml").writeBytes(new TextEncoder().encode(xml));
}

it.each([
  [
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/",
  ],
  [
    "http://purl.oclc.org/ooxml/wordprocessingml/main",
    "http://purl.oclc.org/ooxml/officeDocument/relationships/",
  ],
] as const)(
  "routes ZIP style resources through table contexts for %s",
  /** Opens the relationship-selected styles stream and its real SAX parser. @param namespace - Native namespace. @param relationNamespace - Relationship base. @returns Nothing. */ async (
    namespace,
    relationNamespace,
  ) => {
    const storage = new ZipStorage();
    put(
      storage,
      "[Content_Types].xml",
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/main.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/styles/data.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
    );
    put(
      storage,
      "_rels/.rels",
      WriteRelationsInfoSequence([
        [
          { First: "Id", Second: "root" },
          { First: "Type", Second: relationNamespace + "officeDocument" },
          { First: "Target", Second: "word/main.xml" },
        ],
      ]),
    );
    put(storage, "word/main.xml", `<w:document xmlns:w="${namespace}"/>`);
    put(
      storage,
      "word/_rels/main.xml.rels",
      WriteRelationsInfoSequence([
        [
          { First: "Id", Second: "styles" },
          { First: "Type", Second: relationNamespace + "styles" },
          { First: "Target", Second: "../styles/data.xml" },
        ],
      ]),
    );
    put(
      storage,
      "styles/data.xml",
      `<w:styles xmlns:w="${namespace}" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"><w:docDefaults><w:rPrDefault><w:rPr><w:b/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:styleId="Normal" w:default="1" w:type="paragraph"><w:name w:val="Normal"/><w:rPr><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="character" w:styleId="Strong"><w:name w:val="Strong"/><w:rPr><w:b/></w:rPr></w:style><mc:AlternateContent><mc:Choice Requires="w14"><w:style w:styleId="Chosen"><w:name w:val="Chosen"/></w:style></mc:Choice><mc:Fallback><w:style w:styleId="Skipped"><w:name w:val="Skipped"/></w:style></mc:Fallback></mc:AlternateContent><w:latentStyles w:defLockedState="0" w:defUIPriority="99" w:defSemiHidden="1" w:defUnhideWhenUsed="1" w:defQFormat="0" w:count="276"><w:lsdException w:name="Заголовок😀" w:locked="false" w:uiPriority="9" w:semiHidden="0" w:unhideWhenUsed="1" w:qFormat="true"/></w:latentStyles><w:style w:type="table" w:styleId="Grid"><w:name w:val="Grid"/><w:tblPr><w:tblpPr w:horzAnchor="page" w:vertAnchor="text" w:tblpXSpec="outside" w:tblpYSpec="bottom" w:tblpX="1440" w:tblpY="-720" w:leftFromText="120" w:rightFromText="240" w:topFromText="-120" w:bottomFromText="360"/><w:tblInd w:w="1440" w:type="dxa"/><w:tblBorders><w:top w:val="single" w:sz="8" w:color="123456"/><w:bottom w:val="double" w:sz="8" w:color="auto"/></w:tblBorders><w:tblCellMar><w:top w:w="120" w:type="dxa"/><w:start w:w="240" w:type="dxa"/><w:bottom w:w="-120" w:type="dxa"/><w:end w:w="360" w:type="dxa"/></w:tblCellMar></w:tblPr><w:trPr><w:trHeight w:val="720" w:hRule="exact"/></w:trPr><w:tcPr><w:shd w:val="pct25" w:color="auto" w:fill="4070A0" w:themeFill="accent2" w:themeFillTint="80"/><w:tcBorders><w:left w:val="dotted" w:sz="16" w:color="ABCDEF"/><w:right w:val="single" w:sz="8"/></w:tcBorders><w:tcMar><w:left w:w="480" w:type="dxa"/><w:right w:w="600" w:type="dxa"/></w:tcMar></w:tcPr></w:style></w:styles>`,
    );
    const main = await OOXMLStreamImpl.createStream(new ZipStorage(storage.commit())),
      part = await OOXMLStreamImpl.createStream(main, StreamType_t.STYLES),
      output = receiver(),
      parser = part.getFastParser();
    const document = new OOXMLDocument(part, null);
    expect(document.getXNoteId()).toBe(0);
    document.setXNoteId(-1);
    expect(document.getXNoteId()).toBe(-1);
    document.incrementProgress();
    expect(document.getTarget()).toBe("styles/data.xml");
    expect(document.getTargetForId("missing")).toBe("");
    parser.setFastDocumentHandler(new OOXMLFastDocumentHandler(output.stream, document, 7));
    parser.setTokenHandler(part.getFastTokenHandler());
    const xml = part.getDocumentXml();
    if (xml === null) throw new Error("Missing real styles part");
    parser.parseStream(xml);
    expect(document.getXNoteId()).toBe(7);
    expect(part.getTarget()).toBe("styles/data.xml");
    expect(output.tables).toHaveLength(1);
    const delivered = output.tables[0] as [number, Reference<Table>];
    expect(delivered[0]).toBe(N.LN_STYLESHEET);
    const styles = entries(delivered[1]);
    expect(
      styles.map(
        /** Retains original resource positions. @param entry - Entry. @returns Position. */ (
          entry,
        ) => entry[0],
      ),
    ).toEqual([0, 1, 2, 3, 4, 5]);
    const defaults = styles[0]?.[1] as Reference<Properties>,
      normal = styles[1]?.[1] as Reference<Properties>,
      strong = styles[2]?.[1] as Reference<Properties>;
    expect(
      values(defaults).map(
        /** Reads the native default property IDs. @param entry - Entry. @returns ID. */ (entry) =>
          entry[0],
      ),
    ).toEqual([N.LN_CT_DocDefaults_rPrDefault]);
    expect(string(normal, N.LN_CT_Style_styleId)).toBe("Normal");
    expect(string(normal, N.LN_CT_Style_name)).toBe("Normal");
    expect(string(strong, N.LN_CT_Style_styleId)).toBe("Strong");
    expect(string(strong, N.LN_CT_Style_name)).toBe("Strong");
    expect(string(styles[3]?.[1] as Reference<Properties>, N.LN_CT_Style_styleId)).toBe("Chosen");
    const grid = styles[5]?.[1] as Reference<Properties>;
    expect(string(grid, N.LN_CT_Style_styleId)).toBe("Grid");
    const tableProperties = nested(grid, N.LN_CT_Style_tblPr),
      indent = new MeasureHandler(),
      row = new MeasureHandler(),
      margins = new CellMarginHandler(),
      cell = new CellMarginHandler(),
      latent = new LatentStyleHandler();
    const position = new TablePositionHandler(),
      positionProperties = nested(tableProperties, N.LN_CT_TblPrBase_tblpPr);
    expect(values(positionProperties)).toHaveLength(10);
    positionProperties.resolve(position);
    const positionSequence = position.getTablePosition(),
      positionMap = new SequenceAsHashMap(positionSequence, "PropertyValue");
    positionSequence.dispose();
    position.dispose();
    for (const [name, expected] of [
      ["HoriOrient", 5],
      ["HoriOrientRelation", 7],
      ["HoriOrientPosition", 2540],
      ["VertOrient", 3],
      ["VertOrientRelation", 0],
      ["VertOrientPosition", -1270],
      ["LeftMargin", 212],
      ["RightMargin", 423],
      ["TopMargin", -212],
      ["BottomMargin", 635],
    ] as const) {
      const key = unicode(name),
        value = positionMap.getValue(key);
      try {
        expect(value.get("sal_Int32"), name).toBe(expected);
      } finally {
        value.dispose();
        key.dispose();
      }
    }
    positionMap.dispose();
    nested(tableProperties, N.LN_CT_TblPrBase_tblInd).resolve(indent);
    nested(tableProperties, N.LN_CT_TblPrBase_tblCellMar).resolve(margins);
    nested(nested(grid, N.LN_CT_Style_trPr), N.LN_CT_TrPrBase_trHeight).resolve(row);
    nested(nested(grid, N.LN_CT_Style_tcPr), N.LN_CT_TcPrBase_tcMar).resolve(cell);
    const shading = new CellColorHandler();
    nested(nested(grid, N.LN_CT_Style_tcPr), N.LN_CT_TcPrBase_shd).resolve(shading);
    const shadingMap = shading.getProperties(),
      shadingColor = shadingMap.getProperty(P.PROP_BACK_COLOR);
    expect(shadingColor).toBeDefined();
    const rgb: [number] = [0];
    expect(shadingColor?.[1].extract(rgb, "sal_Int32")).toBe(true);
    expect(rgb[0]).toBe(0x305478);
    expect(shading.getFillComplexColor().getThemeColorType()).toBe(ThemeColorType.Accent2);
    expect(shading.getFillComplexColor().getTransformations()[0]?.mnValue).toBe(4980);
    shadingColor?.[1].dispose();
    shadingMap.dispose();
    shading.dispose();
    const latentProperties = styles[4]?.[1] as Reference<Properties>;
    expect(string(latentProperties, N.LN_CT_LatentStyles_count)).toBe("276");
    nested(latentProperties, N.LN_CT_LatentStyles_lsdException).resolve(latent);
    expect(indent.getValue()).toBe(1440);
    expect(indent.getMeasureValue()).toBe(2540);
    expect(row.getValue()).toBe(720);
    expect(row.getMeasureValue()).toBe(1270);
    expect(row.GetRowHeightSizeType()).toBe(SizeType.FIX);
    expect([
      margins.m_nTopMargin,
      margins.m_nLeftMargin,
      margins.m_nBottomMargin,
      margins.m_nRightMargin,
    ]).toEqual([212, 423, 0, 635]);
    expect([cell.m_nLeftMargin, cell.m_nRightMargin]).toEqual([847, 1058]);
    expect(
      latent.getAttributes().map(
        /** Reads original string alternative of each latent style field. @param property - Generated value. @returns Name/text pair. */ (
          property,
        ) => {
          const value = unicode("");
          expect(property.Value.extract(value, "OUString")).toBe(true);
          try {
            return [text(property.Name), text(value)];
          } finally {
            value.dispose();
          }
        },
      ),
    ).toEqual([
      ["name", "Заголовок😀"],
      ["locked", "false"],
      ["uiPriority", "9"],
      ["semiHidden", "0"],
      ["unhideWhenUsed", "1"],
      ["qFormat", "true"],
    ]);
    const tableBorders = new BorderHandler(true),
      cellBorders = new TDefTableHandler();
    nested(tableProperties, N.LN_CT_TblPrBase_tblBorders).resolve(tableBorders);
    nested(nested(grid, N.LN_CT_Style_tcPr), N.LN_CT_TcPrBase_tcBorders).resolve(cellBorders);
    const tableMap = tableBorders.getProperties(),
      cellMap = new TablePropertyMap();
    cellBorders.fillCellProperties(cellMap);
    for (const [map, id, width, color] of [
      [tableMap, P.PROP_TOP_BORDER, 35, 0x123456],
      [tableMap, P.PROP_BOTTOM_BORDER, 106, 0],
      [cellMap, P.PROP_LEFT_BORDER, 71, 0xabcdef],
      [cellMap, P.PROP_RIGHT_BORDER, 35, 0],
    ] as const) {
      const property = map.getProperty(id),
        line = new BorderLine2();
      if (!property) throw new Error("Missing parsed border");
      try {
        expect(property[1].extract(line, cppu_detail_getUnoType_BorderLine2)).toBe(true);
        expect(line.LineWidth).toBe(width);
        expect(line.Color).toBe(color);
      } finally {
        property[1].dispose();
      }
    }
    tableMap.dispose();
    cellMap.dispose();
    tableBorders.dispose();
    cellBorders.dispose();
    indent.dispose();
    row.dispose();
    margins.dispose();
    cell.dispose();
    latent.dispose();
  },
);

it("emits an empty cloned table and preserves nonzero-ID/forwarding guards", /** Uses actual factory-assigned style resource identity and public context flags. @returns Nothing. */ async () => {
  const output = receiver(),
    document = new OOXMLDocument(await OOXMLStreamImpl.createStream(new ZipStorage()), null),
    handler = new OOXMLFastDocumentHandler(output.stream, document, 0),
    context = handler.createFastChildContext(token("doc:styles"));
  expect(context).toBeInstanceOf(TableContext);
  const table = context as TableContext;
  expect(table.getResource()).toBe(ResourceEnum_t.TABLE);
  table.startFastElement(token("doc:styles"), []);
  table.endFastElement(token("doc:styles"));
  expect(entries((output.tables[0] as [number, Reference<Table>])[1])).toEqual([]);
  table.setForwardEvents(false);
  table.endFastElement(token("doc:styles"));
  table.setForwardEvents(true);
  table.setId(0);
  table.endFastElement(token("doc:styles"));
  expect(output.tables).toHaveLength(1);
  expect(table.createFastChildContext(token("doc:unmapped"))).toBeNull();
});

it("retains native current-child state and clones only the table vector at each delivery", /** Repeated closure deliberately collects the last child again, as in upstream. @returns Nothing. */ async () => {
  const output = receiver(),
    document = new OOXMLDocument(await OOXMLStreamImpl.createStream(new ZipStorage()), null),
    handler = new OOXMLFastDocumentHandler(output.stream, document, 0),
    table = handler.createFastChildContext(token("doc:styles")) as TableContext;
  const child = table.createFastChildContext(token("doc:style")) as Base;
  child.startFastElement(token("doc:style"), [{ token: token("doc:styleId"), value: "Retained" }]);
  child.endFastElement(token("doc:style"));
  table.endFastElement(token("doc:styles"));
  table.endFastElement(token("doc:styles"));
  const first = entries((output.tables[0] as [number, Reference<Table>])[1]),
    second = entries((output.tables[1] as [number, Reference<Table>])[1]);
  expect(first).toHaveLength(1);
  expect(second).toHaveLength(2);
  expect(first[0]?.[1]).toBe(second[0]?.[1]);
  expect(string(first[0]?.[1] as Reference<Properties>, N.LN_CT_Style_styleId)).toBe("Retained");
});

it("clones property sets before unconditional property-table delivery even at zero ID with forwarding disabled", /** Preserves the native difference from ordinary resource-table suppression. @returns Nothing. */ () => {
  const output = receiver(),
    parent = new Base(),
    context = new PropertyTable(parent);
  parent.setStream(output.stream);
  context.setStream(output.stream);
  context.setForwardEvents(false);
  expect(context.getResource()).toBe(ResourceEnum_t.PROPERTIES);
  const properties = new OOXMLPropertySet();
  properties.add(1, V.createInteger(10), OOXMLPropertyType.ATTRIBUTE);
  context.setPropertySet(properties);
  context.endFastElement(token("doc:settings"));
  properties.add(2, V.createInteger(20), OOXMLPropertyType.ATTRIBUTE);
  context.endFastElement(token("doc:settings"));
  expect(
    output.tables.map(
      /** Reads original zero IDs without normalization. @param entry - Delivery. @returns ID. */ (
        entry,
      ) => entry[0],
    ),
  ).toEqual([0, 0]);
  const first = entries((output.tables[0] as [number, Reference<Table>])[1]),
    second = entries((output.tables[1] as [number, Reference<Table>])[1]);
  expect(first).toHaveLength(1);
  expect(second).toHaveLength(2);
  expect(first[0]?.[1]).not.toBe(properties);
  expect(
    values(first[0]?.[1] as Reference<Properties>).map(
      /** Reads immutable snapshot values. @param entry - Resource. @returns Pair. */ (entry) => [
        entry[0],
        entry[1].getInt(),
      ],
    ),
  ).toEqual([[1, 10]]);
  expect(
    values(second[1]?.[1] as Reference<Properties>).map(
      /** Reads latest cloned set. @param entry - Resource. @returns Pair. */ (entry) => [
        entry[0],
        entry[1].getInt(),
      ],
    ),
  ).toEqual([
    [1, 10],
    [2, 20],
  ]);
  expect(
    /** The factory reaches the native property-table owner but preserves the unported definition guard. @returns Never. */ () =>
      OOXMLFactory.createFastChildContextFromStart(new Base(), token("doc:settings")),
  ).toThrow("OOXML definition is not implemented");
});

it("retains original send-before-clear actions and virtual property-set replacement", /** Actual factory contexts send the old set before replacing it; the base setter remains inert. @returns Nothing. */ async () => {
  const output = receiver(),
    delivered: Reference<Properties>[] = [];
  output.stream.props =
    /** Records original resource-reference delivery. @param properties - Native set. @returns Nothing. */ (
      properties,
    ) => {
      delivered.push(properties);
    };
  const document = new OOXMLDocument(await OOXMLStreamImpl.createStream(new ZipStorage()), null),
    root = new OOXMLFastDocumentHandler(output.stream, document, 0).getContextHandler(),
    context = new PropertiesContext(root);
  const definition = Object.entries(defines).find(
    /** Selects the exact native TrackChange definition. @param entry - Generated pair. @returns Match. */ (
      entry,
    ) => entry[1] === "CT_TrackChange",
  );
  if (!definition) throw new Error("Missing original TrackChange definition");
  context.setDefine(Number(definition[0]));
  const factory = OOXMLFactory_wml.getInstance(),
    actions = factory.getActions(context.getDefine(), "end");
  expect(actions).toHaveLength(16);
  for (let index = 0; index < actions.length; index += 2) {
    const action = actions[index];
    if (!action) throw new Error("Missing native action");
    expect([action[2], actions[index + 1]?.[2]]).toEqual(["sendPropertiesWithId", "clearProps"]);
    context.setId(action[3]);
    context.newProperty(N.LN_CT_TrackChange_author, V.createInteger(index));
    const before = context.getPropertySet();
    context.endFastElement(token("doc:customXmlInsRangeStart"));
    expect(context.getPropertySet()).not.toBe(before);
    expect([...context.getPropertySet()]).toHaveLength(0);
    const wrapped = delivered.at(-2);
    if (!wrapped) throw new Error("Missing wrapped resource");
    expect(nested(wrapped, action[4])).toBe(before);
    expect([...before]).toHaveLength(1);
  }
  context.setForwardEvents(false);
  const firstAction = actions[0];
  if (!firstAction) throw new Error("Missing source action");
  context.setId(firstAction[3]);
  context.newProperty(N.LN_CT_TrackChange_author, V.createInteger(99));
  const count = delivered.length;
  context.endFastElement(token("doc:customXmlInsRangeStart"));
  expect(delivered.length).toBe(count + 1);
  expect([...context.getPropertySet()]).toHaveLength(0);
  const base = new Base();
  base.clearProps();
  expect(base.getPropertySet()).toBeNull();
});
