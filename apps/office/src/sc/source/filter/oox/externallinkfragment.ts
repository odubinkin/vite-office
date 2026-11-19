/** @fileoverview XLSX external book metadata and embedded sheet cache contexts. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import { AttributeConversion } from "../../../../oox/source/helper/attributelist";
import { text, unicode } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  FragmentHandler,
  type FragmentContext,
  type FragmentFilter,
} from "../../../../oox/source/core/fragmenthandler";
import type { Relations } from "../../../../oox/source/core/relations";
import type { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { ScAddress } from "../../../inc/address";
import type { ScDocument } from "../../../inc/document";
import { toDouble, toInt32 } from "../../../../o3tl/inc/string_view";
import { FormulaDoubleToken, FormulaStringToken } from "../../../../formula/inc/token";
import { CreateDoubleError, FormulaError } from "../../../../formula/inc/errorcodes";
import { errorSymbols } from "../../../../formula/inc/FormulaCompiler";
import type { ScExternalRefCacheTable } from "../../ui/docshell/externalrefmgr";
import type { ExternalLink, ExternalLinkBuffer } from "./externallinkbuffer";
import { AddressConverter } from "./addressconverter";
import { attribute, isSpreadsheetTag, relationshipId } from "./workbookfragment";

const sheetElements: Readonly<Record<string, string>> = {
  sheetData: "row",
  row: "cell",
  cell: "v",
};

/** Reads cached addresses and typed scalar values for one external worksheet. */
class ExternalSheetDataContext implements FragmentContext {
  private readonly stack: string[] = [];
  private readonly position = new ScAddress();
  private cellType = "";

  /** Binds the real document and the resolved sheet cache, when supplied. @param document - Workbook. @param table - Cache selected by sheet index. @returns Context. */
  constructor(
    private readonly document: ScDocument,
    private readonly table: ScExternalRefCacheTable | undefined,
  ) {}

  /** Admits the sheet's native row, cell and value contexts. @param tag - Expanded XML name. @returns Active context or null. */
  createFastChildContext(tag: SaxesTagNS): ExternalSheetDataContext | null {
    return isSpreadsheetTag(tag) && sheetElements[this.stack.at(-1) ?? ""] === tag.local
      ? this
      : null;
  }

  /** Reads a typed cell's complete source address. @param tag - Expanded XML name. @param attributes - Borrowed attributes. @returns Nothing. */
  startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    this.stack.push(tag.local);
    if (tag.local !== "cell") return;
    const address = unicode(attribute(attributes, "r"));
    try {
      this.cellType = AddressConverter.convertToCellAddressUnchecked(
        this.position,
        address,
        0,
        this.document,
      )
        ? attribute(attributes, "t") || "n"
        : "";
    } finally {
      address.dispose();
    }
  }

  /** Stores the original typed value from the first text callback. @param value - Cell value text. @returns Nothing. */
  characters(value: string): void {
    if (this.stack.at(-1) !== "v") return;
    const type = this.cellType;
    this.cellType = "";
    if (!this.table) return;
    const row = this.position.Row(),
      col = this.position.Col();
    if (!this.document.ValidColRow(col, row)) return;
    if (type === "e") {
      const error = errorSymbols.get(value);
      const code =
        error !== FormulaError.Spill
          ? (error ?? FormulaError.NotAvailable)
          : FormulaError.NotAvailable;
      this.table.setCell(col, row, new FormulaDoubleToken(CreateDoubleError(code)));
    } else if (type === "str" || type === "n" || type === "b") {
      const unicodeValue = unicode(value);
      try {
        if (type === "str") {
          const string = this.document.GetSharedStringPool().intern(unicodeValue);
          try {
            this.table.setCell(col, row, new FormulaStringToken(string));
          } finally {
            string.dispose();
          }
        } else
          this.table.setCell(col, row, new FormulaDoubleToken(toDouble(unicodeValue.getStr())));
      } finally {
        unicodeValue.dispose();
      }
    }
  }

  /** Releases a sheet-data lexical context. @returns Nothing. */
  endFastElement(): void {
    this.stack.pop();
  }
}

const childElements: Readonly<Record<string, readonly string[]>> = {
  "": ["externalLink"],
  externalLink: ["externalBook"],
  externalBook: ["sheetNames", "sheetDataSet"],
  sheetNames: ["sheetName"],
};

/** Admits the external workbook's XML contexts and delegates each sheet cache. */
export class ExternalLinkFragment extends FragmentHandler {
  private readonly stack: string[] = [];
  private fileId: number | undefined;

  /** Binds one internal OPC part and its external workbook model. @param filter - Package filter. @param path - Internal part. @param relations - Its relationship table. @param link - Workbook link model. @param document - Actual Calc document. @returns Fragment. */
  constructor(
    filter: FragmentFilter,
    path: string,
    private readonly relationsModel: Relations,
    private readonly link: ExternalLink,
    private readonly document: ScDocument,
  ) {
    super(filter, path, relationsModel);
  }

  /** Selects the exact SpreadsheetML child context. @param tag - Expanded element name. @param attributes - Borrowed element attributes. @returns Active context or null. */
  override createFastChildContext(
    tag: SaxesTagNS,
    attributes: readonly SaxesAttributeNS[],
  ): FragmentContext | null {
    if (!isSpreadsheetTag(tag)) return null;
    const parent = this.stack.at(-1) ?? "";
    if (parent === "sheetDataSet" && tag.local === "sheetData" && this.fileId !== undefined) {
      const id = attribute(attributes, "sheetId");
      const name = id ? this.link.getSheetNames()[toInt32(id)] : undefined;
      const table =
        name === undefined
          ? undefined
          : this.document.GetExternalRefManager().getCacheTable(this.fileId, name);
      return new ExternalSheetDataContext(this.document, table);
    }
    return childElements[parent]?.includes(tag.local) ? this : null;
  }

  /** Collects typed relation metadata and decoded sheet names. @param tag - Expanded element name. @param attributes - Source attributes. @returns Nothing. */
  override startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void {
    this.stack.push(tag.local);
    if (tag.local === "externalBook") {
      this.link.importExternalBook(this.relationsModel, relationshipId(attributes));
      if (this.link.getType() === "document" || this.link.getType() === "missingDocument")
        this.fileId = this.document
          .GetExternalRefManager()
          .getExternalFileId(this.link.getTarget());
    } else if (tag.local === "sheetName") {
      const value = unicode(attribute(attributes, "val"));
      const decoded = AttributeConversion.decodeXString(value);
      try {
        const name = text(decoded);
        this.link.importSheetName(name);
        if (this.fileId !== undefined)
          this.document.GetExternalRefManager().getCacheTable(this.fileId, name, true);
      } finally {
        decoded.dispose();
        value.dispose();
      }
    }
  }

  /** Releases the current lexical context. @returns Nothing. */
  override endFastElement(): void {
    this.stack.pop();
  }
}

/** Loads workbook link fragments using only package-internal part paths. @param filter - Open package. @param workbookRelations - Workbook part relationships. @param links - Workbook link slots in source order. @param document - Actual Calc document. @returns Completion. */
export async function importExternalLinkFragments(
  filter: XmlFilterBase,
  workbookRelations: Relations,
  links: ExternalLinkBuffer,
  document: ScDocument,
): Promise<void> {
  const relations = workbookRelations.getRelationsFromTypeFromOfficeDoc("externalLink");
  for (const link of links) {
    const path = relations.getFragmentPathFromRelId(link.relationshipId);
    if (!path) continue;
    await filter.importFragment(
      new ExternalLinkFragment(filter, path, await filter.importRelations(path), link, document),
    );
  }
}
