/** @fileoverview Source-derived real AttributeList order,copy,interface append,first-match and signed16 value cases. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XAttributeList } from "../../../offapi/com/sun/star/xml/sax/XAttributeList";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
/** Application-owned forwarding list has a real UNO identity and delegates to actual native attribute storage; no registry/provider is supplied. */
class Forwarded extends WeakImplHelper.specialize(XAttributeList) implements XAttributeList {
  private readonly source: Reference<XAttributeList>;
  /** Acquires the source owner. @param source - Actual source. @returns Observer. */ constructor(
    source: Reference<XAttributeList>,
  ) {
    super();
    this.source = new Reference(source);
  }
  /** Source member destruction. @returns Nothing. */ protected override destroy(): void {
    this.source.dispose();
    super.destroy();
  }
  /** Original forwarding count. @returns Count. */ getLength() {
    return this.source.operatorStar().getLength();
  }
  /** Original forwarding name. @param index - Index. @returns Name. */ getNameByIndex(
    index: number,
  ) {
    return this.source.operatorStar().getNameByIndex(index);
  }
  /** Original forwarding value. @param index - Index. @returns Value. */ getValueByIndex(
    index: number,
  ) {
    return this.source.operatorStar().getValueByIndex(index);
  }
  /** Original forwarding type. @param index - Index. @returns Type. */ getTypeByIndex(
    index: number,
  ) {
    return this.source.operatorStar().getTypeByIndex(index);
  }
  /** Original forwarding named type. @param name - Name. @returns Type. */ getTypeByName(
    name: OUStringConstReference,
  ) {
    return this.source.operatorStar().getTypeByName(name);
  }
  /** Original forwarding named value. @param name - Name. @returns Value. */ getValueByName(
    name: OUStringConstReference,
  ) {
    return this.source.operatorStar().getValueByName(name);
  }
}
import { expect, it } from "vitest";
import { AttributeList } from "../../inc/attributelist";
import { unicode } from "../../../test/fixtures/manifest";
/** Reads native text and ends a returned value scope. @param value - Actual string. @returns Text. */
function text(value: ReturnType<typeof unicode>): string {
  try {
    return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
  } finally {
    value.dispose();
  }
}
it("copies actual attribute values and preserves first-match duplicates and independent mutations", /** Runs actual owners. @returns Nothing. */ () => {
  const a = new AttributeList(),
    name = unicode("a"),
    value = unicode('<&"'),
    other = unicode("b");
  a.AddAttribute(name, value);
  a.AddAttribute(name, other);
  const clone = a.createClone(),
    b = clone.get() as AttributeList;
  expect(a.getLength()).toBe(2);
  expect(a.GetIndexByName(name)).toBe(0);
  expect(text(a.getValueByName(name))).toBe('<&"');
  expect(text(a.getTypeByIndex(999))).toBe("CDATA");
  expect(text(a.getTypeByName(other))).toBe("CDATA");
  b.SetValueByIndex(0, other);
  b.RenameAttributeByIndex(0, other);
  expect(text(b.getNameByIndex(0))).toBe("b");
  expect(text(a.getNameByIndex(0))).toBe("a");
  expect(text(a.getValueByIndex(0))).toBe('<&"');
  expect(text(b.getValueByIndex(0))).toBe("b");
  b.RemoveAttributeByIndex(0);
  expect(text(b.getValueByName(name))).toBe("b");
  a.RemoveAttribute(name);
  expect(text(a.getValueByName(name))).toBe("b");
  a.RemoveAttribute(name);
  a.RemoveAttribute(name);
  expect(a.GetIndexByName(name)).toBe(-1);
  expect(text(a.getValueByName(name))).toBe("");
  b.Clear();
  expect(b.getLength()).toBe(0);
  clone.dispose();
  name.dispose();
  value.dispose();
  other.dispose();
});
it("copies foreign SAX interface lists through their real methods and captures self-append length", /** A forwarding interface remains a real attribute-list contract. @returns Nothing. */ () => {
  const a = new AttributeList(),
    key = unicode("x"),
    value = unicode("y");
  a.AddAttribute(key, value);
  const source = new Reference<XAttributeList>(a),
    foreign = new Reference<XAttributeList>(new Forwarded(source)),
    copyOwner = new Reference(new AttributeList(foreign)),
    copy = copyOwner.operatorStar();
  expect(copy.getLength()).toBe(1);
  copy.AppendAttributeList(copyOwner);
  expect(copy.getLength()).toBe(2);
  expect(text(copy.getValueByIndex(1))).toBe("y");
  expect(text(copy.getValueByName(key))).toBe("y");
  a.Clear();
  copy.Clear();
  copyOwner.dispose();
  foreign.dispose();
  source.dispose();
  key.dispose();
  value.dispose();
});
it("retains native name preconditions but copy and rename do not repeat AddAttribute validation", /** No invented duplicate-name rejection. @returns Nothing. */ () => {
  const list = new AttributeList(),
    empty = unicode(""),
    bad = unicode("a:b:c"),
    qualified = unicode("a:b"),
    expanded = unicode("urn:some:namespace^x"),
    value = unicode("v");
  expect(
    /** Invalid native empty name. @returns Nothing. */ () => list.AddAttribute(empty, value),
  ).toThrow("empty attribute");
  expect(
    /** Invalid native colon count. @returns Nothing. */ () => list.AddAttribute(bad, value),
  ).toThrow("too many colons");
  list.AddAttribute(qualified, value);
  list.AddAttribute(expanded, value);
  list.RenameAttributeByIndex(0, empty);
  const copy = new AttributeList(list);
  expect(text(copy.getNameByIndex(0))).toBe("");
  expect(copy.getLength()).toBe(2);
  list.Clear();
  copy.Clear();
  for (const s of [empty, bad, qualified, expanded, value]) s.dispose();
});
it("narrows native signed16 counts and query indices while named erasure still uses the full vector", /** Valid named operations beyond short index range. @returns Nothing. */ () => {
  const list = new AttributeList(),
    key = unicode("x"),
    last = unicode("last"),
    value = unicode("v");
  for (let i = 0; i < 32768; ++i) list.AddAttribute(key, value);
  list.AddAttribute(last, value);
  expect(list.getLength()).toBe(-32767);
  expect(list.GetIndexByName(last)).toBe(-32768);
  expect(text(list.getValueByName(last))).toBe("v");
  list.RemoveAttribute(last);
  expect(list.GetIndexByName(last)).toBe(-1);
  expect(list.getLength()).toBe(-32768);
  list.Clear();
  key.dispose();
  last.dispose();
  value.dispose();
});

import { XCloneable } from "../../../offapi/com/sun/star/util/XCloneable";
import { XTypeProvider } from "../../../udkapi/com/sun/star/lang/XTypeProvider";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import { XComponent } from "../../../udkapi/com/sun/star/lang/XComponent";
import { UNO_QUERY, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
it("ports qadevOOo XCloneable createClone/name/implementation-ID criteria for actual AttributeList", /** Original optional interface queries and empty defaults remain visible. @returns Nothing. */ () => {
  const source = new Reference(new AttributeList()),
    cloneable = new Reference<XCloneable>(source, UNO_QUERY_THROW, XCloneable.static_type),
    clone = cloneable.operatorStar().createClone();
  /** Original getImplementationName fallback. @param value - Source interface. @returns Original name or empty. */
  function implementationName(value: Reference<XCloneable>): string {
    const info = new Reference<XServiceInfo>(value, UNO_QUERY, XServiceInfo.static_type);
    try {
      return info.is() ? text(info.operatorStar().getImplementationName()) : "";
    } finally {
      info.dispose();
    }
  }
  /** Original getImplementationID fallback. @param value - Source interface. @returns Original byte values. */
  function implementationId(value: Reference<XCloneable>): number[] {
    const provider = new Reference<XTypeProvider>(value, UNO_QUERY, XTypeProvider.static_type);
    try {
      if (!provider.is()) return [];
      const id = provider.operatorStar().getImplementationId();
      try {
        return Array.from(
          { length: id.getLength() },
          /** Actual byte cell. @param unused - Unused. @param index - Index. @returns Byte. */ (
            _,
            index,
          ) => (id.operatorIndex(index) as unknown as [number])[0],
        );
      } finally {
        id.dispose();
      }
    } finally {
      provider.dispose();
    }
  }
  try {
    expect(implementationName(clone)).toBe(implementationName(cloneable));
    expect(implementationId(clone)).toEqual(implementationId(cloneable));
    const component = new Reference<XComponent>(clone, UNO_QUERY, XComponent.static_type);
    try {
      if (component.is()) component.operatorStar().dispose();
    } finally {
      component.dispose();
    }
    expect(clone.get()).not.toBe(source.get());
  } finally {
    clone.dispose();
    cloneable.dispose();
    source.dispose();
  }
});

import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
/** Actual application wrapper raises a typed callback failure after one successful source element. */
class FailedRead extends Forwarded {
  /** Original foreign callback can fail after the acquired name temporary. @param index - Native index. @returns Actual value or original failure. */
  override getValueByIndex(index: number) {
    if (index === 1) throw new RuntimeException();
    return super.getValueByIndex(index);
  }
}
it("unwinds partial constructor members and acquired name temporaries on an actual foreign callback failure", /** Reads real public RTL refcounts without mutating native owners. @returns Nothing. */ () => {
  const source = new Reference(new AttributeList()),
    key = unicode("key"),
    value = unicode("value");
  source.operatorStar().AddAttribute(key, value);
  source.operatorStar().AddAttribute(key, value);
  const foreign = new Reference<XAttributeList>(new FailedRead(source)),
    before = key.pData?.refCount;
  try {
    let caught = false;
    try {
      new AttributeList(foreign);
    } catch (error) {
      if (!(error instanceof RuntimeException)) throw error;
      caught = true;
      error.dispose();
    }
    expect(caught).toBe(true);
    expect(key.pData?.refCount).toBe(before);
    expect(source.operatorStar().getLength()).toBe(2);
    expect(
      /** Original null-reference constructor precondition. @returns Never. */ () =>
        new AttributeList(new Reference<XAttributeList>()),
    ).toThrow("assert(r.is())");
  } finally {
    foreign.dispose();
    source.dispose();
    key.dispose();
    value.dispose();
  }
});
