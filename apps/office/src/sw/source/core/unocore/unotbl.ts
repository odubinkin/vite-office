/** @fileoverview Consumed SwXTextTable/SwXCell/SwXTextTableRow contracts from pinned unotbl.cxx; every property writes native table format items. */
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { IndexOutOfBoundsException } from "../../../../cppu/inc/com/sun/star/lang/IndexOutOfBoundsException";
import { SwTable, type SwTableLine } from "../table/swtable";
import { SwXText, SwXCell } from "./unotext";
export { SwXCell } from "./unotext";
import { SwPosition } from "../crsr/pam";
import { SwXTextRange } from "./unoobj2";
import { SwTextNode } from "../txtnode/ndtxt";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "./unocrsrhelper";
import type { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { scalar, stringValue, illegal, invalid, unknown } from "./unocrsrhelper";
import { toTwips, Length } from "../../../../o3tl/inc/unit_conversion";
import { SwFrameSize } from "../../../inc/fmtfsize";
import {
  BorderLine,
  cppu_detail_getUnoType_BorderLine,
} from "../../../../offapi/com/sun/star/table/BorderLine";
import type { SwTableBox } from "../table/swtable";
import { RES_BOX } from "../../../inc/hintids";
import type { SvxBoxItem } from "../../../../editeng/source/items/frmitems";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";
import { SwFormatRowSplit } from "../../../inc/fmtrowsplt";
/** Row property owner does not retain a separate row DTO. */
export class SwXTextTableRow {
  /** Binds the represented native owner and its declared inputs. @param line - Original line input. @returns Nothing. */
  constructor(private readonly line: SwTableLine) {}
  /** Queries the current native property value. @param name - Native property or element name. @returns The represented native operation result. */
  getPropertyValue(name: OUStringConstReference): Any {
    return getRowProperty(this.line, text(name));
  }
  /** Applies a typed native property without duplicating model state. @param name - Native property or element name. @param value - Declared native value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const n = text(name),
      format = this.line.ClaimFrameFormat();
    if (n === "IsSplitAllowed")
      format.SetFormatAttr(new SwFormatRowSplit(scalar(value, "bool") as boolean));
    else if (n === "Height" || n === "IsAutoHeight") {
      const size = this.line.GetFrameSize();
      if (n === "Height")
        size.SetHeight(Number(toTwips(BigInt(scalar(value, "sal_Int32") as number), Length.mm100)));
      else size.SetHeightSizeType(scalar(value, "bool") ? SwFrameSize.Variable : SwFrameSize.Fixed);
      format.SetFormatAttr(size);
    } else unknown(n);
  }
}
/** Table wrapper is constructed only over the canonical table owner. */
export class SwXTextTable {
  /** Binds the represented native owner and its declared inputs. @param table - Original table input. @returns Nothing. */
  constructor(readonly table: SwTable) {}
  /** Implements the represented native getName operation. @returns The represented native operation result. */
  getName(): OUStringConstReference {
    return unicode(this.table.GetName());
  }
  /** Implements the represented native getRows operation. @returns The represented native operation result. */
  getRows(): { getCount(): number; getByIndex(index: number): SwXTextTableRow } {
    return {
      /** Processes one ordered native value at this boundary. @returns The represented native operation result. */
      getCount: () => this.table.GetTabLines().length,
      /** Processes one ordered native value at this boundary. @param index - Native zero-based index. @returns The represented native operation result. */
      getByIndex: (index) => {
        const line = this.table.GetTabLines()[index];
        if (!line) throw new IndexOutOfBoundsException();
        return new SwXTextTableRow(line);
      },
    };
  }
  /** Implements the represented native getCellByName operation. @param name - Native property or element name. @returns The represented native operation result. */
  getCellByName(name: OUStringConstReference): SwXCell {
    const match = /^([A-Z]+)([1-9][0-9]*)$/u.exec(text(name));
    if (!match) illegal("Invalid cell name");
    let col = 0;
    for (const c of match[1] as string) col = col * 26 + c.charCodeAt(0) - 64;
    const box = this.table.GetTabLines()[Number(match[2]) - 1]?.GetTabBoxes()[col - 1];
    if (!box) invalid("No such cell");
    return new SwXCell(box);
  }
  /** Applies a typed native property without duplicating model state. @param name - Native property or element name. @param value - Declared native value. @returns Nothing. */
  setPropertyValue(name: OUStringConstReference, value: Any): void {
    const n = text(name),
      table = this.table;
    if (n === "Name") {
      table.GetTableNode().GetDoc().SetTableName(table.GetFrameFormat(), stringValue(value));
      return;
    }
    if (n === "HeaderRowCount") {
      table.SetRowsToRepeat(scalar(value, "sal_Int32") as number);
      return;
    }
    const fields: Record<
      string,
      "width" | "marginLeft" | "marginRight" | "marginTop" | "marginBottom"
    > = {
      Width: "width",
      LeftMargin: "marginLeft",
      RightMargin: "marginRight",
      TopMargin: "marginTop",
      BottomMargin: "marginBottom",
    };
    if (fields[n]) {
      table.SetFormat({
        ...table.GetFormat(),
        [fields[n] as string]: Number(
          toTwips(BigInt(scalar(value, "sal_Int32") as number), Length.mm100),
        ),
      });
      return;
    }
    if (n === "HoriOrient") {
      table.SetFormat({ ...table.GetFormat(), horiOrient: scalar(value, "sal_Int16") as number });
      return;
    }
    if (n === "Split") {
      table.SetFormat({ ...table.GetFormat(), layoutSplit: scalar(value, "bool") as boolean });
      return;
    }
    unknown(n);
  }
}
/** Validates the native [start,end] cell endpoints and wraps whole-paragraph ranges without replacing their identities. @param textOwner - Original textOwner input. @param ranges - Original ranges input. @param cellProperties - Original cellProperties input. @param rowProperties - Original rowProperties input. @param tableProperties - Original tableProperties input. @returns The represented native operation result. */
export function convertToTable(
  textOwner: SwXText,
  ranges: readonly (readonly (readonly SwXTextRange[])[])[],
  cellProperties: readonly (readonly (readonly PropertyValue[])[])[],
  rowProperties: readonly (readonly PropertyValue[])[],
  tableProperties: readonly PropertyValue[],
): SwXTextTable | null {
  if (ranges.length === 0) return null;
  if (
    ranges.some(
      /** Processes one ordered native value at this boundary. @param row - Original row input. @returns The represented native operation result. */
      (row) => row.length === 0,
    )
  )
    illegal("Table row has no cells");
  const doc = textOwner.GetDoc(),
    body = doc.GetNodes().GetEndOfContent().StartOfSectionNode(),
    positions: SwPosition[] = [];
  try {
    const bounds = ranges.map(
      /** Processes one ordered native value at this boundary. @param row - Original row input. @returns The represented native operation result. */
      (row) =>
        row.map(
          /** Processes one ordered native value at this boundary. @param cell - Original cell input. @returns The represented native operation result. */
          (cell) => {
            if (cell.length !== 2) illegal("Cell needs exactly two range endpoints");
            const a = cell[0] as SwXTextRange,
              b = cell[1] as SwXTextRange;
            if (a.GetDoc() !== doc || b.GetDoc() !== doc) illegal("Foreign table range");
            const first = a.GetPaM().Start().clone(),
              last = b.GetPaM().End().clone();
            first.nContent.SetAffinity("after");
            last.nContent.SetAffinity("before");
            positions.push(first, last);
            if (first.compare(last) > 0) illegal("Reversed table cell range");
            for (const node of doc
              .GetNodes()
              .entries()
              .slice(first.GetNodeIndex(), last.GetNodeIndex() + 1))
              if (!(node instanceof SwTextNode) || node.StartOfSectionNode() !== body)
                illegal("Table conversion requires body text");
            return { first, last };
          },
        ),
    );
    const flat = bounds.flat();
    for (let i = 1; i < flat.length; i++) {
      const prev = (flat[i - 1] as (typeof flat)[number]).last,
        next = (flat[i] as (typeof flat)[number]).first;
      if (prev.compare(next) === 0) continue;
      if (
        prev.GetNodeIndex() + 1 !== next.GetNodeIndex() ||
        prev.GetContentIndex() !== (prev.GetNode() as SwTextNode).Len() ||
        next.GetContentIndex() !== 0
      )
        illegal("Table ranges have a gap or overlap");
    }
    const ops = doc.GetDocumentContentOperationsManager();
    for (const { first, last } of flat) {
      const node = last.GetNode() as SwTextNode,
        end = last.GetContentIndex();
      if (end < node.Len()) {
        const tail = ops.SplitNode(last);
        last.Assign(node, node.Len());
        if (first.GetNode() === tail && first.GetContentIndex() === 0 && first.compare(last) > 0)
          first.Assign(node, 0);
      }
      const start = first.GetContentIndex();
      if (start > 0) {
        const tail = ops.SplitNode(first);
        first.Assign(tail, 0);
      }
    }
    const rows = bounds.map(
      /** Processes one ordered native value at this boundary. @param row - Original row input. @returns The represented native operation result. */
      (row) =>
        row.map(
          /** Processes one ordered native value at this boundary. @param entry0 - Original entry0 input. @returns The represented native operation result. */
          ({ first, last }) =>
            doc
              .GetNodes()
              .entries()
              .slice(first.GetNodeIndex(), last.GetNodeIndex() + 1) as SwTextNode[],
        ),
    );

    let index = 1;
    while (doc.FindTableFormatByName(`Table${index}`)) index++;
    const result = new SwXTextTable(doc.GetNodes().TextToTable(rows, `Table${index}`));
    const denied = new Set([
      "ParaTopBorder",
      "ParaTopBorderDistance",
      "ParaTopBorderComplexColor",
      "ParaLeftBorder",
      "ParaLeftBorderDistance",
      "ParaLeftBorderComplexColor",
      "ParaBottomBorder",
      "ParaBottomBorderDistance",
      "ParaBottomBorderComplexColor",
      "ParaRightBorder",
      "ParaRightBorderDistance",
      "ParaRightBorderComplexColor",
    ]);
    for (const p of tableProperties) {
      if (denied.has(text(p.Name))) continue;
      try {
        result.setPropertyValue(p.Name, p.Value);
      } catch (error) {
        if (!(error instanceof Exception)) throw error;
        error.dispose();
      }
    }
    for (let i = 0; i < Math.min(rowProperties.length, result.getRows().getCount()); i++)
      for (const p of rowProperties[i] as readonly PropertyValue[])
        result.getRows().getByIndex(i).setPropertyValue(p.Name, p.Value);
    for (let r = 0; r < cellProperties.length; r++)
      for (
        let c = 0;
        c < (cellProperties[r] as readonly (readonly PropertyValue[])[]).length;
        c++
      ) {
        const box = result.table.GetTabLines()[r]?.GetTabBoxes()[c];
        if (!box) illegal("Invalid cell properties");
        const cell = new SwXCell(box),
          cursor = cell.createTextCursor();
        try {
          cursor.gotoEnd(true);
          for (const p of cellProperties[r]?.[c] as readonly PropertyValue[]) {
            if (denied.has(text(p.Name)) || text(p.Name) === "LeftMargin") continue;
            try {
              if (!setCellProperty(box, text(p.Name), p.Value))
                cursor.setPropertyValue(p.Name, p.Value);
            } catch (error) {
              if (!(error instanceof Exception)) throw error;
              error.dispose();
            }
          }
        } finally {
          cursor.dispose();
        }
      }
    return result;
  } finally {
    for (const position of positions) position.Dispose();
  }
}

/** Native cell-format properties write the claimed box format rather than a browser table record. @param box - Actual cell. @param name - Native property name. @param value - Native Any. @returns Whether the cell-format map consumed the property. */
export function setCellProperty(box: SwTableBox, name: string, value: Any): boolean {
  if (name === "VertOrient") {
    const item = box.GetVertOrient();
    item.PutValue(scalar(value, "sal_Int16"), 0);
    box.ClaimFrameFormat().SetFormatAttr(item);
    return true;
  }
  const members: Record<string, number> = {
    LeftBorder: 1,
    RightBorder: 2,
    TopBorder: 3,
    BottomBorder: 4,
    BorderDistance: 5,
    LeftBorderDistance: 6,
    RightBorderDistance: 7,
    TopBorderDistance: 8,
    BottomBorderDistance: 9,
  };
  const member = members[name];
  if (member === undefined) return false;
  const item = box.GetFrameFormat().GetAttrSet().Get(RES_BOX).Clone() as SvxBoxItem;
  let input: unknown;
  if (member <= 4) {
    const line = new BorderLine();
    if (!value.extract(line, cppu_detail_getUnoType_BorderLine)) illegal("Expected BorderLine");
    input = line;
  } else input = scalar(value, "sal_Int32");
  if (!item.PutValue(input, member | 0x80)) illegal("Invalid cell border");
  box.ClaimFrameFormat().SetFormatAttr(item);
  return true;
}

/** Reads native current row values in public units. @param line - Actual row. @param name - Native property name. @returns Typed Any. */
export function getRowProperty(line: SwTableLine, name: string): Any {
  const result = new Any(),
    size = line.GetFrameSize();
  if (name === "IsSplitAllowed") result.insert([line.GetRowSplit().GetValue()], "bool");
  else if (name === "Height")
    result.insert([Number(convertTwipToMm100(BigInt(size.GetHeight())))], "sal_Int32");
  else if (name === "IsAutoHeight")
    result.insert([size.GetHeightSizeType() !== SwFrameSize.Fixed], "bool");
  else unknown(name);
  return result;
}
