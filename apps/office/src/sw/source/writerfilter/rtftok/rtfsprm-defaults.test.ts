/** @fileoverview Original RTF style defaults and sparse-list boundaries over genuine intrusive value/property owners; checked empty-back access is a local host guard, not native undefined-access parity. */
import { expect, it } from "vitest";
import { SvRef } from "../../../../tools/inc/ref";
import { RTFSprms, getDefaultSPRM } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { text } from "../../core/unocore/unocrsrhelper";
import { putNestedAttribute, getNestedAttribute } from "./rtfdocumentimpl.properties";

it.each([
  [N.LN_CT_Spacing_before, 0],
  [N.LN_CT_Spacing_after, 0],
  [N.LN_CT_Ind_left, 0],
  [N.LN_CT_Ind_right, 0],
  [N.LN_CT_Ind_firstLine, 0],
  [N.LN_CT_NumPr_numId, 0],
  [N.LN_CT_Spacing_lineRule, N.LN_Value_doc_ST_LineSpacingRule_auto],
  [N.LN_CT_Spacing_line, 240],
] as const)(
  "retains original paragraph default %i = %i",
  /** Both unspecified and explicit paragraph style select the original scalar defaults. @param id - Native property. @param expected - Original scalar. @returns Nothing. */ (
    id,
    expected,
  ) => {
    for (const style of [0, N.LN_Value_ST_StyleType_paragraph]) {
      const value = getDefaultSPRM(id, style);
      try {
        expect(value.is()).toBe(true);
        expect(value.operatorDereference().getInt()).toBe(expected);
      } finally {
        value.dispose();
      }
    }
  },
);

it.each([N.LN_CT_Fonts_ascii, N.LN_CT_Fonts_eastAsia, N.LN_CT_Fonts_cs])(
  "owns the original character font fallback %i",
  /** The actual returned string is copied and released independently of the intrusive value. @param id - Native font property. @returns Nothing. */ (
    id,
  ) => {
    const value = getDefaultSPRM(id, N.LN_Value_ST_StyleType_character);
    try {
      const name = value.operatorDereference().getString();
      try {
        expect(text(name)).toBe("Times New Roman");
      } finally {
        name.dispose();
      }
    } finally {
      value.dispose();
    }
  },
);

it("builds original spacing and four-edge border defaults as separate owned property trees", /** Native border fallback omits between; spacing inserts only after=0. @returns Nothing. */ () => {
  const spacing = getDefaultSPRM(N.LN_CT_PPrBase_spacing, 0),
    border = getDefaultSPRM(N.LN_CT_PrBase_pBdr, N.LN_Value_ST_StyleType_paragraph);
  try {
    const attrs = spacing.operatorDereference().getAttributes();
    expect(
      [...attrs].map(
        /** Reads actual resource/value pairs. @param entry - Borrowed entry. @returns Primitive pair. */ ([
          id,
          value,
        ]) => [id, value.operatorDereference().getInt()],
      ),
    ).toEqual([[N.LN_CT_Spacing_after, 0]]);
    expect(spacing.operatorDereference().getSprms().empty()).toBe(true);
    const edges = [...border.operatorDereference().getSprms()];
    expect(
      edges.map(
        /** Reads original edge order. @param entry - Borrowed edge. @returns Resource ID. */ ([
          id,
        ]) => id,
      ),
    ).toEqual([N.LN_CT_PBdr_top, N.LN_CT_PBdr_left, N.LN_CT_PBdr_bottom, N.LN_CT_PBdr_right]);
    for (const [, edge] of edges) {
      const value = edge.operatorDereference().getAttributes().find(N.LN_CT_Border_val);
      try {
        expect(value.operatorDereference().getInt()).toBe(N.LN_Value_ST_Border_none);
      } finally {
        value.dispose();
      }
      expect(edge.operatorDereference().getSprms().empty()).toBe(true);
    }
  } finally {
    spacing.dispose();
    border.dispose();
  }
});

it("retains explicit style-category absence and the local empty-back guard", /** No native C++ empty vector access is performed or claimed. @returns Nothing. */ () => {
  for (const [id, type] of [
    [N.LN_CT_PPrBase_spacing, N.LN_Value_ST_StyleType_character],
    [N.LN_EG_RPrBase_sz, N.LN_Value_ST_StyleType_paragraph],
    [N.LN_CT_PPrBase_spacing, N.LN_Value_ST_StyleType_table],
  ]) {
    const absent = getDefaultSPRM(id!, type!);
    try {
      expect(absent.is()).toBe(false);
    } finally {
      absent.dispose();
    }
  }
  const list = new RTFSprms();
  try {
    expect(
      /** Checks only the local checked adapter boundary. @returns Never. */ () => list.back(),
    ).toThrow("assert(!empty())");
    list.set(N.LN_CT_Ind_left, new RTFValue(240));
    expect(list.back()[0]).toBe(N.LN_CT_Ind_left);
    list.eraseLast(N.LN_CT_Ind_right);
    expect(list.erase(N.LN_CT_Ind_right)).toBe(false);
    expect(list.size()).toBe(1);
  } finally {
    list.dispose();
  }
});

it("uses source level zero when numbering is absent and erases only the matching invalid first indent", /** Real nested attributes preserve unrelated left indent during invalid-list normalization. @returns Nothing. */ () => {
  const list = new RTFSprms();
  try {
    putNestedAttribute(list, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine, new RTFValue(240));
    putNestedAttribute(list, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_left, new RTFValue(720));
    list.deduplicateList(new Map([[0, 240]]));
    const removed = getNestedAttribute(list, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine),
      retained = getNestedAttribute(list, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_left);
    try {
      expect(removed.is()).toBe(false);
      expect(retained.operatorDereference().getInt()).toBe(720);
    } finally {
      removed.dispose();
      retained.dispose();
    }
    list.deduplicateList(new Map([[0, 240]]));
    list.deduplicateList(new Map());
    expect(list.size()).toBe(1);
  } finally {
    list.dispose();
  }
});

it("ignores unrelated abstract-list properties, absent target levels and unsupported indent defaults", /** The actual abstract tree first lacks level zero, then gains it without an indent and finally with only hanging indent. @returns Nothing. */ () => {
  const direct = new RTFSprms(),
    attrs = new RTFSprms(),
    sprms = new RTFSprms(),
    levelAttrs = new RTFSprms(),
    levelSprms = new RTFSprms();
  const abstract = new SvRef(new RTFValue(attrs, sprms));
  try {
    const tree = abstract.operatorDereference().getSprms();
    tree.set(N.LN_CT_Style_type, new RTFValue(N.LN_Value_ST_StyleType_paragraph));
    levelAttrs.set(N.LN_CT_Lvl_ilvl, new RTFValue(2));
    tree.set(N.LN_CT_AbstractNum_lvl, new RTFValue(levelAttrs, levelSprms));
    direct.duplicateList(abstract);
    expect(direct.empty()).toBe(true);
    const level = tree.find(N.LN_CT_AbstractNum_lvl, true, true);
    try {
      level.operatorDereference().getAttributes().set(N.LN_CT_Lvl_ilvl, new RTFValue(0));
      direct.duplicateList(abstract);
      expect(direct.empty()).toBe(true);
      putNestedAttribute(
        level.operatorDereference().getSprms(),
        N.LN_CT_PPrBase_ind,
        N.LN_CT_Ind_hanging,
        new RTFValue(240),
      );
      direct.duplicateList(abstract);
      expect(direct.empty()).toBe(true);
      putNestedAttribute(
        level.operatorDereference().getSprms(),
        N.LN_CT_PPrBase_ind,
        N.LN_CT_Ind_left,
        new RTFValue(720),
      );
      putNestedAttribute(direct, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_left, new RTFValue(320));
      direct.duplicateList(abstract);
      const retained = getNestedAttribute(direct, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_left);
      try {
        expect(retained.operatorDereference().getInt()).toBe(320);
      } finally {
        retained.dispose();
      }
    } finally {
      level.dispose();
    }
  } finally {
    abstract.dispose();
    levelSprms.dispose();
    levelAttrs.dispose();
    sprms.dispose();
    attrs.dispose();
    direct.dispose();
  }
});

it.each([
  [N.LN_CT_PBdr_top, N.LN_CT_Border_val, N.LN_Value_ST_Border_single, N.LN_Value_ST_Border_none],
  [N.LN_CT_PBdr_left, N.LN_CT_Border_val, N.LN_Value_ST_Border_single, N.LN_Value_ST_Border_none],
  [N.LN_CT_PBdr_bottom, N.LN_CT_Border_val, N.LN_Value_ST_Border_single, N.LN_Value_ST_Border_none],
  [N.LN_CT_PBdr_right, N.LN_CT_Border_val, N.LN_Value_ST_Border_single, N.LN_Value_ST_Border_none],
  [N.LN_CT_PrBase_shd, N.LN_CT_Shd_val, N.LN_Value_ST_Shd_solid, N.LN_Value_ST_Shd_clear],
] as const)(
  "retains direct child properties in native expected-child parent %i",
  /** Explicit direct border/shading values survive a different reference style through recursive normalization. @param parent - Native modifier. @param attribute - Valid child property. @param directValue - Explicit direct enum. @param referenceValue - Different reference enum. @returns Nothing. */ (
    parent,
    attribute,
    directValue,
    referenceValue,
  ) => {
    const direct = new RTFSprms(),
      reference = new RTFSprms();
    try {
      putNestedAttribute(direct, parent, attribute, new RTFValue(directValue));
      putNestedAttribute(reference, parent, attribute, new RTFValue(referenceValue));
      const normalized = direct.cloneAndDeduplicate(reference, N.LN_Value_ST_StyleType_paragraph);
      try {
        const retained = getNestedAttribute(normalized, parent, attribute);
        try {
          expect(retained.operatorDereference().getInt()).toBe(directValue);
        } finally {
          retained.dispose();
        }
        expect(normalized.size()).toBe(1);
      } finally {
        normalized.dispose();
      }
    } finally {
      reference.dispose();
      direct.dispose();
    }
  },
);

it.each([
  [N.LN_EG_RPrBase_szCs, 24],
  [N.LN_EG_RPrBase_sz, 24],
  [N.LN_CT_Color_val, 0],
  [N.LN_EG_RPrBase_b, 0],
  [N.LN_EG_RPrBase_i, 0],
  [N.LN_CT_Underline_val, N.LN_Value_ST_Underline_none],
] as const)(
  "owns the original scalar character fallback %i = %i",
  /** Original character normalization resets size to twelve points and other represented effects to their source default. @param id - Native property. @param expected - Source scalar. @returns Nothing. */ (
    id,
    expected,
  ) => {
    const value = getDefaultSPRM(id, N.LN_Value_ST_StyleType_character);
    try {
      expect(value.operatorDereference().getInt()).toBe(expected);
    } finally {
      value.dispose();
    }
  },
);
