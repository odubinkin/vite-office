/** @fileoverview DOCX projection of native table style interoperability properties. */
import type { GrabBagValueConstReference } from "../../../../svl/inc/grabbagitem";
import { FastSerializerHelper, FSNS } from "../../../../sax/inc/fshelper";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { SwDoc } from "../../core/doc/doc";
import { stringValue } from "../../core/unocore/unocrsrhelper";
import { forEachProperty } from "../../writerfilter/dmapper/SettingsTable.compat";

const w = token("w");
const val = FSNS(w, token("val"));

/** Serializer and emitted header style tracking, shared across the document and styles parts. */
export class DocxTableStyleExport {
  private readonly m_vStylesWithTblHeaderInFirstRow = new Set<string>();

  /** Borrows the native document owning tableStyles. @param document - Source document. @returns Exporter. */
  constructor(private readonly document: SwDoc) {}

  /** Emits table styles within the original remaining Word style slots. @param serializer - Active styles serializer. @param limit - Available style count. @returns Nothing. */
  TableStyles(serializer: FastSerializerHelper, limit: number): void {
    forEachProperty(
      this.document.interopGrabBag.GetGrabBag().get("tableStyles"),
      /** Reads one native table style. @param _name - Sequence entry name. @param style - Original style bag. @returns Nothing. */
      (_name, style) => this.TableStyle(serializer, style),
      limit,
    );
  }

  /** Tests whether the emitted style contributed a conditional header. @param style - Word style ID. @returns Header presence. */
  FirstRowHasTblHeader(style: string): boolean {
    return this.m_vStylesWithTblHeaderInFirstRow.has(style);
  }

  /** Projects the native style's identity, metadata and represented table properties. @param serializer - Styles serializer. @param style - Structured style properties. @returns Nothing. */
  private TableStyle(serializer: FastSerializerHelper, style: GrabBagValueConstReference): void {
    const attrs = FastSerializerHelper.createAttrList();
    const strings = new Map<string, string>();
    const presence = new Set<string>();
    try {
      const list = attrs.operatorArrow();
      list.add(FSNS(w, token("type")), "table");
      forEachProperty(
        style,
        /** Reads style metadata in native order. @param name - Property name. @param value - Native value. @returns Nothing. */ (
          name,
          value,
        ) => {
          presence.add(name);
          if (value.has("OUString")) strings.set(name, stringValue(value));
          if ((name === "default" || name === "customStyle") && value.getBoolean())
            list.add(FSNS(w, token(name)), "1");
        },
      );
      const styleId = strings.get("styleId") ?? "";
      if (styleId) list.add(FSNS(w, token("styleId")), styleId);
      serializer.startElementNS(w, token("style"), attrs);
      serializer.singleElementNS(w, token("name"), val, strings.get("name") ?? "");
      for (const name of [
        "basedOn",
        "uiPriority",
        "semiHidden",
        "unhideWhenUsed",
        "qFormat",
        "rsid",
      ]) {
        const value = strings.get(name);
        if (value) serializer.singleElementNS(w, token(name), val, value);
        else if (
          presence.has(name) &&
          (name === "semiHidden" || name === "unhideWhenUsed" || name === "qFormat")
        )
          serializer.singleElementNS(w, token(name));
      }
      forEachProperty(
        style,
        /** Emits the base table properties before conditional styles. @param name - Field. @param value - Native group. @returns Nothing. */ (
          name,
          value,
        ) => {
          if (name === "tblPr") TableStyleTablePr(serializer, value);
        },
      );
      forEachProperty(
        style,
        /** Emits every conditional group in source order. @param name - Field. @param value - Native group. @returns Nothing. */ (
          name,
          value,
        ) => {
          if (name === "tblStylePr") this.TableStyleTableStylePr(serializer, value, styleId);
        },
      );
      serializer.endElementNS(w, token("style"));
    } finally {
      attrs.dispose();
    }
  }

  /** Emits the original conditional type followed by table and row properties. @param serializer - Styles serializer. @param style - Native conditional style. @param styleId - Containing Word style ID. @returns Nothing. */
  private TableStyleTableStylePr(
    serializer: FastSerializerHelper,
    style: GrabBagValueConstReference,
    styleId: string,
  ): void {
    let type = "";
    forEachProperty(
      style,
      /** Reads the original conditional name. @param name - Field. @param value - Native property. @returns Nothing. */ (
        name,
        value,
      ) => {
        if (name === "type") type = stringValue(value);
      },
    );
    serializer.startElementNS(w, token("tblStylePr"), FSNS(w, token("type")), type);
    let hasTablePr = false;
    forEachProperty(
      style,
      /** Finds table properties before rows. @param name - Field. @param value - Native group. @returns Nothing. */ (
        name,
        value,
      ) => {
        if (name === "tblPr") hasTablePr = TableStyleTablePr(serializer, value);
      },
    );
    if (!hasTablePr) serializer.singleElementNS(w, token("tblPr"));
    forEachProperty(
      style,
      /** Writes row properties from the original nested sequence. @param name - Field. @param value - Native group. @returns Nothing. */ (
        name,
        value,
      ) => {
        if (name !== "trPr") return;
        let written = false;
        forEachProperty(
          value,
          /** Emits the source presence-based row header. @param property - Row field. @returns Nothing. */ (
            property,
          ) => {
            if (!written) serializer.startElementNS(w, token("trPr"));
            written = true;
            if (property !== "tblHeader") return;
            serializer.singleElementNS(w, token("tblHeader"));
            if (styleId) this.m_vStylesWithTblHeaderInFirstRow.add(styleId);
          },
        );
        if (written) serializer.endElementNS(w, token("trPr"));
      },
    );
    serializer.endElementNS(w, token("tblStylePr"));
  }
}

/** Emits represented band counts and cell margins in the native order. @param serializer - Styles serializer. @param source - Native table properties. @returns Whether there was a table property group to write. */
function TableStyleTablePr(
  serializer: FastSerializerHelper,
  source: GrabBagValueConstReference,
): boolean {
  let hasProperties = false;
  const bands = new Map<string, number>();
  forEachProperty(
    source,
    /** Checks for the source group and reads band sizes. @param name - Table field. @param value - Native field value. @returns Nothing. */ (
      name,
      value,
    ) => {
      hasProperties = true;
      if (name === "tblStyleRowBandSize" || name === "tblStyleColBandSize")
        bands.set(name, value.get("sal_Int32"));
    },
  );
  if (!hasProperties) return false;
  serializer.startElementNS(w, token("tblPr"));
  for (const name of ["tblStyleRowBandSize", "tblStyleColBandSize"]) {
    const count = bands.get(name);
    if (count !== undefined) serializer.singleElementNS(w, token(name), val, String(count));
  }
  forEachProperty(
    source,
    /** Writes the preserved table cell margins. @param name - Field name. @param value - Margin list. @returns Nothing. */ (
      name,
      value,
    ) => {
      if (name === "tblCellMar") TableStyleTableCellMar(serializer, value);
    },
  );
  serializer.endElementNS(w, token("tblPr"));
  return true;
}

/** Emits the raw width and unit of each declared margin in LibreOffice's order. @param serializer - Styles serializer. @param source - Native edge values. @returns Nothing. */
function TableStyleTableCellMar(
  serializer: FastSerializerHelper,
  source: GrabBagValueConstReference,
): void {
  const edges = new Map<string, { width: number; type: string }>();
  forEachProperty(
    source,
    /** Reads the native width record. @param name - Edge name. @param value - Native width and type. @returns Nothing. */ (
      name,
      value,
    ) => {
      const edge = { width: 0, type: "" };
      forEachProperty(
        value,
        /** Reads one width field. @param key - Field. @param field - Raw native value. @returns Nothing. */ (
          key,
          field,
        ) => {
          if (key === "w") edge.width = field.get("sal_Int32");
          else if (key === "type") edge.type = stringValue(field);
        },
      );
      edges.set(name, edge);
    },
  );
  if (!edges.size) return;
  serializer.startElementNS(w, token("tblCellMar"));
  for (const name of ["top", "start", "left", "bottom", "end", "right"]) {
    const edge = edges.get(name);
    if (edge)
      serializer.singleElementNS(
        w,
        token(name),
        FSNS(w, w),
        String(edge.width),
        FSNS(w, token("type")),
        edge.type,
      );
  }
  serializer.endElementNS(w, token("tblCellMar"));
}
