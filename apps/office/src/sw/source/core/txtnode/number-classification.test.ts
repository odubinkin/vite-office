/** @fileoverview Compares Writer classification and distinct raw-owned layout predicates with complete unchanged pinned native output. */
import { expect, it } from "vitest";
import native from "./number-classification-native.json";
import { createWriterDocument } from "../doc/doc";
import { applyWriterParagraphList } from "../doc/list";
import { SwNumFormat, SwNumRule, SvxNumType } from "../doc/number";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import { DocumentListItemsManager } from "../doc/DocumentListItemsManager";
import { HasNumberingWhichNeedsLayoutUpdate } from "./ndtxt-attribute-handlers";
import {
  encodeWriterDocument,
  decodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";
/** Requires a real graph owner/record so missing fixture state fails explicitly. @param value - Optional graph member. @returns Present member. */
function requireMember<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing classification fixture member");
  return value;
}
/** Builds a real document/format/record graph and supplies the same bounded actual-level and diagnostic shown-record inputs as the native oracle. @param actual - Actual tree-level read profile. @param attribute - Stored attribute level. @param type - Native numeric type. @param owned - Own the attribute slot. @param attachment - Absent/diagnostic/real attached record. @param counted - Counted text policy. @returns Graph. */
function graph(
  actual: number,
  attribute: number,
  type: number,
  owned: boolean,
  attachment: number,
  counted: boolean,
) {
  const doc = createWriterDocument(),
    node = requireMember(doc.paragraphs[0]);
  const rule = new SwNumRule("profile", "label-alignment");
  rule.SetDefaultListId("list");
  rule.SetAutoRule(false);
  if (owned) {
    const format = new SwNumFormat();
    format.SetNumberingType(type as SvxNumType);
    rule.Set(attribute, format);
  }
  doc.AddNumRule(rule);
  let record: SwNodeNum;
  if (attachment === 2) {
    applyWriterParagraphList(node, {
      kind: owned && type === 6 ? "bullet" : "numbered",
      styleId: "profile",
      listId: "list",
      level: attribute,
    });
    record = requireMember(node.GetNum());
  } else {
    record = new SwNodeNum(node);
    if (attachment === 1)
      node.GetNum =
        /** Supplies an actual diagnostic record with no bound rule. @returns Record. */ () =>
          record;
  }
  node.SetCountedInList(counted);
  node.GetActualListLevel =
    /** Supplies the native bounded-level input without altering the underlying graph's counter algorithm. @returns Actual read profile. */ () =>
      actual;
  node.GetAttrListLevel =
    /** Supplies the independent raw attribute-level read. @returns Attribute level. */ () =>
      attribute;
  return { doc, node, rule, record };
}
it("matches native format enumeration itemize copy and type-change predicates", /** Checks source-owned classification independently of show-symbol and base IsTextFormat. @returns Nothing. */ () => {
  expect(new SwNumFormat().IsEnumeration()).toBe(true);
  for (const [type, enumeration, itemize, copyEnumeration, copyItemize] of native.native.formats) {
    const format = new SwNumFormat();
    format.SetNumberingType(type as SvxNumType);
    const copy = format.clone();
    format.SetShowSymbol(false);
    expect(format.IsEnumeration()).toBe(enumeration);
    expect(format.IsItemize()).toBe(itemize);
    expect(copy.IsEnumeration()).toBe(copyEnumeration);
    expect(copy.IsItemize()).toBe(copyItemize);
    copy.SetNumberingType(SvxNumType.SVX_NUM_NUMBER_NONE);
    expect(copy.IsEnumeration()).toBe(true);
    expect(copy.IsItemize()).toBe(false);
    expect(copy.IsTextFormat()).toBe(false);
    expect(format.GetNumberingType()).toBe(type);
  }
});
it("matches all native effective classification raw-layout counting and registry profiles", /** Compares 1008 literal source-emitted cases through real production methods and explicit diagnostic input adapters. @returns Nothing. */ () => {
  for (const [
    actual,
    attribute,
    type,
    owned,
    attachment,
    counted,
    number,
    bullet,
    layout,
    countedNumbering,
    registered,
  ] of native.native.nodes) {
    const context = graph(
      actual as number,
      attribute as number,
      type as number,
      owned === 1,
      attachment as number,
      counted as boolean,
    );
    const { doc, node, record, rule } = context;
    expect(node.HasNumber()).toBe(number);
    expect(node.HasBullet()).toBe(bullet);
    expect(HasNumberingWhichNeedsLayoutUpdate(node)).toBe(layout);
    expect(record.IsCountedForNumbering()).toBe(countedNumbering);
    const registry = new DocumentListItemsManager(),
      output: SwNodeNum[] = [];
    registry.addListItem(record);
    registry.getNumItems(output);
    expect(output.length).toBe(registered);
    expect(rule.GetNumFormat(attribute as number) !== undefined).toBe(owned === 1);
    if (attachment === 2) {
      doc.getIDocumentListItems().getNumItems(output);
      expect(output.length).toBe(registered);
    }
    doc.Dispose();
  }
});
/** Supplies native root/phantom policy inputs without claiming native base-tree defaults beyond this contract. */
class PolicyRoot extends SwNodeNum {
  /** Binds the source-provided policy profile. @param counted - Count flag. @param phantom - Phantom flag. @returns Nothing. */
  public constructor(
    private readonly counted: boolean,
    private readonly profilePhantom: boolean,
  ) {
    super(undefined);
  }
  /** Supplies the named native counted-policy input. @returns Flag. */
  public override IsCounted(): boolean {
    return this.counted;
  }
  /** Supplies the named native phantom-policy input. @returns Flag. */
  public override IsPhantom(): boolean {
    return this.profilePhantom;
  }
}
it("matches native root phantom and counted numbered-registry filtering", /** Checks dependent production policy, actual document order and 16 literal registry masks. @returns Nothing. */ () => {
  for (const [counted, phantom, expected, included] of native.native.roots) {
    const root = new PolicyRoot(counted as boolean, phantom as boolean),
      registry = new DocumentListItemsManager(),
      output: SwNodeNum[] = [];
    expect(root.IsCountedForNumbering()).toBe(expected);
    registry.addListItem(root);
    registry.getNumItems(output);
    expect(output.length).toBe(included);
  }
  for (const [mask, included] of native.native.registry) {
    const doc = createWriterDocument(),
      records: SwNodeNum[] = [];
    for (const [index, type] of [4, 5, 6, 8].entries()) {
      const node = index === 0 ? requireMember(doc.paragraphs[0]) : doc.nodes.MakeTextNode();
      const name = `profile${index}`,
        rule = new SwNumRule(name, "label-alignment"),
        format = new SwNumFormat();
      format.SetNumberingType(type as SvxNumType);
      rule.Set(0, format);
      rule.SetAutoRule(false);
      rule.SetDefaultListId(name);
      doc.AddNumRule(rule);
      applyWriterParagraphList(node, {
        kind: type === 6 ? "bullet" : "numbered",
        styleId: name,
        listId: name,
        level: 0,
      });
      node.SetCountedInList(((mask as number) & (1 << index)) !== 0);
      records.push(requireMember(node.GetNum()));
    }
    const output: SwNodeNum[] = [];
    doc.getIDocumentListItems().getNumItems(output);
    expect(
      output.map(
        /** Projects native ordered record identity. @param item - Registered item. @returns Index. */ (
          item,
        ) => records.indexOf(item),
      ),
    ).toEqual(included);
    doc.Dispose();
  }
});
it("retains existing supported classifications and sparse ownership through Worker16", /** Checks actual attached decoded graph policies for Arabic NONE and character-special without a bitmap rendering claim. @returns Nothing. */ () => {
  for (const type of [4, 5, 6])
    for (const owned of [false, true]) {
      const { doc, node } = graph(0, 0, type, owned, 2, true);
      const restored = decodeWriterDocument(encodeWriterDocument(doc)),
        copy = requireMember(restored.paragraphs[0]);
      expect(copy.HasNumber()).toBe(node.HasNumber());
      expect(copy.HasBullet()).toBe(node.HasBullet());
      expect(HasNumberingWhichNeedsLayoutUpdate(copy)).toBe(
        HasNumberingWhichNeedsLayoutUpdate(node),
      );
      expect(copy.GetNum()?.IsCountedForNumbering()).toBe(node.GetNum()?.IsCountedForNumbering());
      const expected: SwNodeNum[] = [],
        output: SwNodeNum[] = [];
      doc.getIDocumentListItems().getNumItems(expected);
      restored.getIDocumentListItems().getNumItems(output);
      expect(output.length).toBe(expected.length);
      doc.Dispose();
      restored.Dispose();
    }
});
