/** @fileoverview Native Word section page-border property receiver. */
import type { BorderLine2 } from "../../../../offapi/com/sun/star/table/BorderLine2";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import {
  resolveReturnedReference,
  type Id,
  type Properties,
  type Sprm,
  type Value,
} from "../inc/dmapper/resourcemodel";
import { BorderHandler } from "./BorderHandler";
import type { SectionPropertyMap } from "./PropertyMap";

/** Native section border application values. */
export enum BorderApply {
  ToAllInSection,
  ToFirstPageInSection,
  ToAllButFirstInSection,
}

/** Native offsets from either text or physical page edge. */
export enum BorderOffsetFrom {
  Text,
  Edge,
}

/** Source SectionPropertyMap order for physical page sides. */
export enum BorderPosition {
  Left,
  Right,
  Top,
  Bottom,
}

const positions = new Map<number, BorderPosition>([
  [N.LN_CT_PageBorders_top, BorderPosition.Top],
  [N.LN_CT_PageBorders_left, BorderPosition.Left],
  [N.LN_CT_PageBorders_bottom, BorderPosition.Bottom],
  [N.LN_CT_PageBorders_right, BorderPosition.Right],
]);

/** A native page border before conversion to the page style's frame geometry. */
export interface PgBorder {
  readonly position: BorderPosition;
  readonly line: BorderLine2;
  readonly distance: number;
  readonly shadow: boolean;
}

/** Collects page sides with an independent BorderHandler for each side. */
export class PageBordersHandler implements Properties {
  private readonly borders: PgBorder[] = [];
  private apply = BorderApply.ToAllInSection;
  private offset = BorderOffsetFrom.Text;

  /** Parses the original display and offset controls. @param id - Native attribute ID. @param value - Parsed value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    const number = value.getInt();
    if (id === N.LN_CT_PageBorders_display) {
      switch (number) {
        case N.LN_Value_doc_ST_PageBorderDisplay_firstPage:
          this.apply = BorderApply.ToFirstPageInSection;
          break;
        case N.LN_Value_doc_ST_PageBorderDisplay_notFirstPage:
          this.apply = BorderApply.ToAllButFirstInSection;
          break;
        default:
          this.apply = BorderApply.ToAllInSection;
      }
    } else if (id === N.LN_CT_PageBorders_offsetFrom) {
      this.offset =
        number === N.LN_Value_doc_ST_PageBorderOffset_text
          ? BorderOffsetFrom.Text
          : BorderOffsetFrom.Edge;
    }
  }

  /** Resolves a supplied side, including native suppression of the explicit none token. @param modifier - Native side resource. @returns Nothing. */
  sprm(modifier: Sprm): void {
    const position = positions.get(modifier.getId());
    if (position === undefined) return;
    const properties = modifier.getProps();
    if (!properties) return;
    const border = new BorderHandler(true);
    resolveReturnedReference(properties, border);
    if (border.getLineType() === N.LN_Value_ST_Border_none) return;
    this.borders.push({
      position,
      line: border.getBorderLine(),
      distance: border.getLineDistance(),
      shadow: border.getShadow(),
    });
  }

  /** Transfers the accumulated native section settings. @param section - Actual section property map. @returns Nothing. */
  SetBorders(section: SectionPropertyMap): void {
    for (const border of this.borders)
      section.SetBorder(border.position, border.distance, border.line, border.shadow);
    section.SetBorderApply(this.apply);
    section.SetBorderOffsetFrom(this.offset);
  }
}
