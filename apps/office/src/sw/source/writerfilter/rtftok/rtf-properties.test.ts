/** @fileoverview Native differential property trees over actual RTFValue/RTFSprms/SvRef owners, ordered resource delivery and real Writer mapper integration. */
import { afterEach, expect, it } from "vitest";
import native from "./rtf-properties-native.json";
import { RTFSprms, RTFConflictPolicy as P, RTFSprm } from "./rtfsprm";
import { RTFValue } from "./rtfvalue";
import { RTFReferenceProperties } from "./rtfreferenceproperties";
import { putNestedAttribute as put, eraseNestedAttribute } from "./rtfdocumentimpl.properties";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { SvRef } from "../../../../tools/inc/ref";
import type { Properties, Sprm, Value } from "../inc/dmapper/resourcemodel";
import { DomainMapper } from "../dmapper/DomainMapper";
import { createWriterDocument } from "../../core/doc/doc";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { unicode, text } from "../../core/unocore/unocrsrhelper";
import { projectWriterTextRuns } from "../../core/txtnode/ndtxt";
const lists: RTFSprms[] = [],
  refs: SvRef<RTFValue>[] = [];
afterEach(
  /** Releases actual borrowed and owned references before stack list destruction. @returns Nothing. */ () => {
    for (const ref of refs.splice(0)) ref.clear();
    for (const list of lists.splice(0)) list.dispose();
  },
);
/** Creates an actual stack list or shares its native payload. @param source - Optional source. @returns Owned list. */
function list(source?: RTFSprms): RTFSprms {
  const value = new RTFSprms(source);
  lists.push(value);
  return value;
}
/** Admits a new native value pointer into one actual intrusive owner. @param value - Unacquired pointer. @returns Reference. */
function own(value: RTFValue): SvRef<RTFValue> {
  const ref = new SvRef(value);
  refs.push(ref);
  return ref;
}
/** Constructs native string values with caller-owned argument lifetime. @param value - Host text. @param force - Native force flag. @returns Unacquired value. */
function string(value: string, force = false): RTFValue {
  const s = unicode(value);
  try {
    return new RTFValue(s, force);
  } finally {
    s.dispose();
  }
}
/** Reads a by-value native return string. @param value - Actual value. @returns Host text. */
function readString(value: RTFValue): string {
  const s = value.getString();
  try {
    return text(s);
  } finally {
    s.dispose();
  }
}
/** Canonical nested result matching the compiled source witness. @param value - Actual list. @returns Native tree. */
function tree(value: RTFSprms): unknown {
  return [...value].map(
    /** Reads actual entry identity and child lists. @param entry - Entry. @returns Canonical tree entry. */ ([
      id,
      ref,
    ]) => {
      const v = ref.operatorDereference();
      return [id, [v.getInt(), readString(v), tree(v.getAttributes()), tree(v.getSprms())]];
    },
  );
}
/** Retains an actual normalized by-value result for destruction. @param direct - Direct list. @param style - Reference list. @param type - Native style token. @param implicit - Native pPr dereference. @param root - Actual direct root. @returns Native result. */
function normalize(
  direct: RTFSprms,
  style: RTFSprms,
  type: number,
  implicit = false,
  root: RTFSprms | null = null,
): RTFSprms {
  const result = direct.cloneAndDeduplicate(style, type, implicit, root);
  lists.push(result);
  return result;
}
it("matches unchanged native ordered duplicate-key policies and first/last erasure", /** Source conflict policies preserve original entry positions and pointer cells. @returns Nothing. */ () => {
  const s = list();
  s.set(1, new RTFValue(10));
  s.set(1, new RTFValue(20), P.Append);
  s.set(2, new RTFValue(30));
  s.set(1, new RTFValue(40));
  s.set(1, new RTFValue(50), P.Ignore);
  expect(tree(s)).toEqual(native.cases.policies);
  s.eraseLast(1);
  expect(tree(s)).toEqual(native.cases.eraseLast);
  s.set(1, new RTFValue(60), P.ReplaceAtStart);
  expect(tree(s)).toEqual(native.cases.prepend);
  s.erase(1);
  expect(tree(s)).toEqual(native.cases.eraseFirst);
});
it("matches native read aliasing and write barriers while keeping actual intrusive lifetimes", /** A read result shares the value object; a for-write lookup first clones a shared list. @returns Nothing. */ () => {
  const a = list();
  const original = new RTFValue(10);
  a.set(1, original);
  expect(original.GetRefCount()).toBe(1);
  const b = list(a);
  const read = b.find(1);
  try {
    const s = unicode("shared");
    try {
      read.operatorDereference().setString(s);
    } finally {
      s.dispose();
    }
  } finally {
    read.dispose();
  }
  expect(tree(a)).toEqual(native.cases.readAliasA);
  expect(tree(b)).toEqual(native.cases.readAliasB);
  const write = b.find(1, true, true);
  try {
    const s = unicode("isolated");
    try {
      write.operatorDereference().setString(s);
    } finally {
      s.dispose();
    }
  } finally {
    write.dispose();
  }
  expect(tree(a)).toEqual(native.cases.writeA);
  expect(tree(b)).toEqual(native.cases.writeB);
  b.clear();
  expect(tree(a)).toEqual(native.cases.clearA);
  expect(tree(b)).toEqual(native.cases.clearB);
});
it("preserves native nested erase aliasing and isolates later nested writes", /** The original erase helper deliberately has no outer write barrier. @returns Nothing. */ () => {
  const a = list();
  put(a, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine, new RTFValue(120));
  const b = list(a);
  expect(eraseNestedAttribute(b, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine)).toBe(true);
  expect(tree(a)).toEqual(native.cases.nestedEraseA);
  expect(tree(b)).toEqual(native.cases.nestedEraseB);
  put(b, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_left, new RTFValue(300));
  expect(tree(a)).toEqual(native.cases.nestedWriteA);
  expect(tree(b)).toEqual(native.cases.nestedWriteB);
});
it("matches native cell shading auto defaults", /** Nested insertion uses actual COL_AUTO values before its explicit fill. @returns Nothing. */ () => {
  const a = list();
  put(a, N.LN_CT_TcPrBase_shd, N.LN_CT_Shd_fill, new RTFValue(0x123456));
  expect(tree(a)).toEqual(native.cases.shading);
});
it("matches native recursive defaults and character-only duplicate removal", /** Actual scalar and nested owners exercise both style normalization modes. @returns Nothing. */ () => {
  const style = list(),
    direct = list();
  style.set(N.LN_EG_RPrBase_b, new RTFValue(1));
  style.set(N.LN_EG_RPrBase_sz, new RTFValue(36));
  put(style, N.LN_EG_RPrBase_rFonts, N.LN_CT_Fonts_ascii, string("Arial"));
  put(style, N.LN_EG_RPrBase_color, N.LN_CT_Color_val, new RTFValue(0xff0000));
  put(
    style,
    N.LN_EG_RPrBase_u,
    N.LN_CT_Underline_val,
    new RTFValue(N.LN_Value_ST_Underline_double),
  );
  expect(tree(normalize(direct, style, N.LN_Value_ST_StyleType_character))).toEqual(
    native.cases.defaults,
  );
  expect(tree(normalize(direct, style, N.LN_Value_ST_StyleType_paragraph))).toEqual(
    native.cases.paragraphNoCharDefault,
  );
  direct.set(N.LN_EG_RPrBase_b, new RTFValue(1));
  expect(tree(normalize(direct, style, N.LN_Value_ST_StyleType_character))).toEqual(
    native.cases.equalCharacter,
  );
  expect(tree(normalize(direct, style, N.LN_Value_ST_StyleType_paragraph))).toEqual(
    native.cases.equalParagraph,
  );
});
it("matches native denylist and direct-numbering indent retention", /** Equal tab metadata and list-dependent indents remain explicit. @returns Nothing. */ () => {
  const style = list(),
    direct = list();
  style.set(N.LN_CT_TabStop_val, new RTFValue(3));
  direct.set(N.LN_CT_TabStop_val, new RTFValue(3));
  expect(tree(normalize(direct, style, N.LN_Value_ST_StyleType_character))).toEqual(
    native.cases.denylist,
  );
  const reference = list(),
    paragraph = list();
  reference.set(N.LN_CT_Ind_left, new RTFValue(120));
  paragraph.set(N.LN_CT_Ind_left, new RTFValue(120));
  paragraph.set(N.LN_CT_PPrBase_numPr, new RTFValue());
  expect(
    tree(normalize(paragraph, reference, N.LN_Value_ST_StyleType_character, false, paragraph)),
  ).toEqual(native.cases.listDenylist);
});
it("retains the source existing expected-child modifier when all normalized children disappear", /** A skipped replacement leaves the original modifier instead of erasing it. @returns Nothing. */ () => {
  const reference = list(),
    direct = list(),
    a = own(new RTFValue(1)),
    b = own(new RTFValue(2));
  a.operatorDereference().getAttributes().set(N.LN_CT_Ind_firstLine, new RTFValue(120));
  b.operatorDereference().getAttributes().set(N.LN_CT_Ind_firstLine, new RTFValue(120));
  reference.set(N.LN_CT_PPrBase_ind, a);
  direct.set(N.LN_CT_PPrBase_ind, b);
  expect(tree(normalize(direct, reference, N.LN_Value_ST_StyleType_character))).toEqual(
    native.cases.emptyExpectedChildren,
  );
});
it("matches native implicit paragraph property normalization", /** Native style pPr children are flattened at the defined boundary. @returns Nothing. */ () => {
  const attrs = list(),
    children = list(),
    style = list(),
    direct = list();
  attrs.set(N.LN_CT_Ind_left, new RTFValue(500));
  children.set(N.LN_CT_PPrBase_ind, new RTFValue(attrs));
  style.set(N.LN_CT_Style_pPr, new RTFValue(list(), children));
  expect(tree(normalize(direct, style, N.LN_Value_ST_StyleType_paragraph, true))).toEqual(
    native.cases.implicitParagraph,
  );
});
it("matches native abstract-level list defaults and invalid first-indent removal", /** The real abstract level/indent structure feeds original list methods. @returns Nothing. */ () => {
  const attrs = list(),
    sprms = list(),
    abstractSprms = list(),
    indent = list();
  attrs.set(N.LN_CT_Lvl_ilvl, new RTFValue(0));
  indent.set(N.LN_CT_Ind_left, new RTFValue(900));
  indent.set(N.LN_CT_Ind_firstLine, new RTFValue(-300));
  sprms.set(N.LN_CT_PPrBase_ind, new RTFValue(indent));
  abstractSprms.set(N.LN_CT_AbstractNum_lvl, new RTFValue(attrs, sprms), P.Append);
  const abstract = own(new RTFValue(list(), abstractSprms)),
    direct = list();
  direct.duplicateList(abstract);
  expect(tree(direct)).toEqual(native.cases.duplicateList);
  put(direct, N.LN_CT_PPrBase_ind, N.LN_CT_Ind_firstLine, new RTFValue(-300));
  direct.deduplicateList(new Map([[0, -300]]));
  expect(tree(direct)).toEqual(native.cases.deduplicateList);
});
it("preserves native force-string equality and lazy empty-list behavior with different observable string values", /** Native equality deliberately ignores the force flag. @returns Nothing. */ () => {
  const a = own(new RTFValue()),
    b = own(string("", true));
  expect(a.operatorDereference().equals(b.operatorDereference())).toBe(native.cases.forceEquality);
  expect(readString(a.operatorDereference())).toBe("0");
  expect(readString(b.operatorDereference())).toBe("");
  a.operatorDereference().getAttributes();
  a.operatorDereference().getSprms();
  expect(a.operatorDereference().equals(b.operatorDereference())).toBe(true);
  const clone = own(b.operatorDereference().Clone());
  expect(readString(clone.operatorDereference())).toBe("");
  expect(clone.operatorDereference().getBinary()).toBeNull();
  const any = a.operatorDereference().getAny();
  try {
    const name = any.getValueTypeName();
    try {
      expect(text(name)).toBe("long");
    } finally {
      name.dispose();
    }
  } finally {
    any.dispose();
  }
});
it("delivers original attributes before modifiers and keeps an RTFSprm bound to its native pointer cell", /** The receiver observes actual values and order through the resource model contracts. @returns Nothing. */ () => {
  const attrs = list(),
    sprms = list();
  attrs.set(2, new RTFValue(20));
  sprms.set(1, new RTFValue(10));
  const reference = new RTFReferenceProperties(attrs, sprms),
    seen: number[] = [];
  const receiver: Properties = {
    attribute:
      /** Observes native attributes. @param id - Resource ID. @param value - Real value. @returns Nothing. */ (
        id: number,
        value: Value,
      ) => {
        seen.push(id, value.getInt());
      },
    sprm: /** Observes original modifier values. @param modifier - Native modifier. @returns Nothing. */ (
      modifier: Sprm,
    ) => {
      seen.push(modifier.getId(), modifier.getValue()?.getInt() ?? -1);
    },
  };
  try {
    reference.resolve(receiver);
    expect(seen).toEqual([2, 20, 1, 10]);
  } finally {
    reference.dispose();
  }
  const entry = sprms.back(),
    modifier = new RTFSprm(entry[0], entry[1]);
  sprms.set(1, new RTFValue(11));
  expect(modifier.getValue()?.getInt()).toBe(11);
});
it("resolves real RTFReferenceProperties through the genuine mapper into Writer text", /** No synthetic document or property receiver replaces the actual import owner chain. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML),
    attrs = list(),
    sprms = list();
  sprms.set(N.LN_EG_RPrBase_b, new RTFValue(1));
  const properties = new RTFReferenceProperties(attrs, sprms);
  try {
    mapper.startParagraphGroup();
    mapper.startCharacterGroup();
    mapper.props(properties);
    const content = unicode("RTF");
    try {
      mapper.utext(content.getStr(), content.getLength());
    } finally {
      content.dispose();
    }
    mapper.endCharacterGroup();
    mapper.utext(new Uint16Array([13]));
    mapper.endParagraphGroup();
    mapper.finishDocument();
    expect(projectWriterTextRuns(doc.paragraphs[0])[0]?.attributes.bold).toBe(true);
    expect(doc.paragraphs[0]?.GetText()).toBe("RTF");
  } finally {
    properties.dispose();
    mapper.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("matches native copy/move assignment and the explicit CopyForWrite constructor", /** The real shared reference cells preserve the source value semantics and detach only at the native barrier. @returns Nothing. */ () => {
  const a = list();
  a.set(1, new RTFValue(5));
  const b = list();
  b.assign(a);
  b.set(1, new RTFValue(6));
  expect(tree(a)).toEqual(native.cases.copyAssignmentA);
  expect(tree(b)).toEqual(native.cases.copyAssignmentB);
  const c = list();
  c.moveAssign(b);
  expect(tree(c)).toEqual(native.cases.moveAssignment);
  const empty = list();
  b.moveAssign(empty);
  expect(tree(b)).toEqual(native.cases.reinitializedMoved);
  const d = new RTFSprms(a, true);
  lists.push(d);
  const pointer = d.find(1),
    name = unicode("detached");
  try {
    pointer.operatorDereference().setString(name);
  } finally {
    pointer.dispose();
    name.dispose();
  }
  expect(tree(a)).toEqual(native.cases.copyForWriteA);
  expect(tree(d)).toEqual(native.cases.copyForWriteB);
});

import { ReferencePointer, resolveReturnedReference } from "../inc/dmapper/resourcemodel";

it("keeps borrowed stream properties live and releases nested pointer returns after mapper resolution", /** Real mapper nested queries must not retain COW owners after the full expression ends. @returns Nothing. */ () => {
  const doc = createWriterDocument(),
    model = new SwXTextDocument(doc),
    mapper = new DomainMapper(model, SourceDocumentType.OOXML),
    attrs = list(),
    sprms = list();
  put(sprms, N.LN_EG_RPrBase_color, N.LN_CT_Color_val, new RTFValue(0x123456));
  const root = new ReferencePointer<Properties>(new RTFReferenceProperties(attrs, sprms));
  const color = sprms.find(N.LN_EG_RPrBase_color);
  const nested = color.operatorDereference().getProperties();
  const nestedOwner = nested.operatorDereference();
  const copy = new ReferencePointer(nested);
  try {
    expect(nestedOwner.GetRefCount()).toBe(2);
    nested.clear();
    expect(nestedOwner.GetRefCount()).toBe(1);
    mapper.startCharacterGroup();
    mapper.props(root);
    expect(root.is()).toBe(true);
    expect(root.operatorDereference().GetRefCount()).toBe(1);
    resolveReturnedReference(copy, mapper);
    expect(copy.is()).toBe(false);
    expect(nestedOwner.GetRefCount()).toBe(1 << 30);
    const changed = sprms.find(N.LN_EG_RPrBase_color, true, true);
    try {
      // The root deliberately shares the source list, so its write barrier still detaches.
      expect(changed.operatorDereference()).not.toBe(color.operatorDereference());
    } finally {
      changed.clear();
    }
    mapper.endCharacterGroup();
  } finally {
    copy.clear();
    nested.clear();
    color.clear();
    root.clear();
    mapper.dispose();
    model.dispose();
    doc.Dispose();
  }
});

it("releases a returned native property pointer when a resource callback throws", /** Pointer-return cleanup is a caller full-expression responsibility and must survive exceptional callbacks. @returns Nothing. */ () => {
  const attrs = list(),
    sprms = list();
  sprms.set(N.LN_EG_RPrBase_b, new RTFValue(1));
  const pointer = new ReferencePointer<Properties>(new RTFReferenceProperties(attrs, sprms)),
    owner = pointer.operatorDereference();
  const receiver: Properties = {
    attribute: /** No attributes in this fixture. @returns Nothing. */ () => {},
    sprm: /** Interrupts a real modifier callback. @returns Never. */ () => {
      throw new Error("callback interrupted");
    },
  };
  expect(
    /** Calls the throwing resource owner. @returns Nothing. */ () =>
      resolveReturnedReference(pointer, receiver),
  ).toThrow("callback interrupted");
  expect(pointer.is()).toBe(false);
  expect(owner.GetRefCount()).toBe(1 << 30);
  const existing = sprms.find(N.LN_EG_RPrBase_b);
  const changed = sprms.find(N.LN_EG_RPrBase_b, true, true);
  try {
    expect(changed.operatorDereference()).toBe(existing.operatorDereference());
  } finally {
    changed.clear();
    existing.clear();
  }
});

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
