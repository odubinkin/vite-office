/** @fileoverview Source SfxMedium argument-map retention over real native property sequences, independent of the existing browser persistence contract. */
import { expect, it } from "vitest";
import { SfxMedium } from "./docfile";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("replaces retained arguments, removes both stream names and preserves the caller sequence", /** Original maps retain value copies and stable owner identity. @returns Nothing. */ () => {
  const medium = new SfxMedium({ kind: "untitled", name: "Document" }),
    source = new SequenceAsHashMap(),
    stream = unicode("Stream"),
    input = unicode("InputStream"),
    name = unicode("URL"),
    old = unicode("Old"),
    output = unicode("OutputStream"),
    empty = new SequenceAsHashMap();
  try {
    expect(medium.GetArgs().empty()).toBe(true);
    source.operatorIndex(stream).insert([1], "sal_Int32");
    source.operatorIndex(input).insert([2], "sal_Int32");
    source.operatorIndex(output).insert([3], "sal_Int32");
    source.operatorIndex(name).insert([4], "sal_Int32");
    source.operatorIndex(old).insert([5], "sal_Int32");
    const args = source.getAsConstPropertyValueList(),
      identity = medium.GetArgs();
    try {
      medium.SetArgs(args);
      const copy = new SequenceAsHashMap(identity);
      expect(copy.size()).toBe(3);
      copy.dispose();
      expect(medium.GetArgs()).toBe(identity);
      expect(identity.contains(stream)).toBe(false);
      expect(identity.contains(input)).toBe(false);
      expect(identity.getUnpackedValueOrDefault(output, -1, "sal_Int32")).toBe(3);
      expect(identity.getUnpackedValueOrDefault(name, -1, "sal_Int32")).toBe(4);
      const original = new SequenceAsHashMap(args, "PropertyValue");
      expect(original.size()).toBe(5);
      original.dispose();
      source.clear();
      source.operatorIndex(name).insert([9], "sal_Int32");
      const replacement = source.getAsConstPropertyValueList();
      try {
        medium.SetArgs(replacement);
      } finally {
        replacement.dispose();
      }
      expect(identity.size()).toBe(1);
      expect(identity.contains(old)).toBe(false);
      expect(identity.getUnpackedValueOrDefault(name, -1, "sal_Int32")).toBe(9);
    } finally {
      args.dispose();
    }
  } finally {
    const args = empty.getAsConstPropertyValueList();
    try {
      medium.SetArgs(args);
    } finally {
      args.dispose();
    }
    empty.dispose();
    source.dispose();
    stream.dispose();
    input.dispose();
    name.dispose();
    old.dispose();
    output.dispose();
    medium.Close();
  }
});
it("keeps external read-only routing and operation state while replacing native filter arguments", /** The new native argument map must not change the established browser opening contract. @returns Nothing. */ () => {
  const reference = new Uint8Array([80, 75]),
    medium = new SfxMedium({
      kind: "input",
      name: "external.xlsx",
      displayName: "External workbook",
      source: { kind: "external", reference },
      filterId: "Calc MS Excel 2007 XML",
      filterOptions: "original-options",
      mediaType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    data = new SequenceAsHashMap();
  const args = data.getAsConstPropertyValueList();
  try {
    medium.SetOperation("open", "pending", 12);
    medium.SetArgs(args);
    expect(medium.source).toEqual({ kind: "external", reference });
    expect(medium.readOnly).toBe(true);
    expect(medium.capabilities.canRead).toBe(true);
    expect(medium.capabilities.canWrite).toBe(false);
    expect(medium.filterId).toBe("Calc MS Excel 2007 XML");
    expect(medium.filterOptions).toBe("original-options");
    expect(medium.displayName).toBe("External workbook");
    expect(medium.lastOperation).toEqual({ operation: "open", state: "pending", generation: 12 });
    medium.Close();
    expect(medium.GetArgs().empty()).toBe(true);
    expect(medium.GetLastOperation().state).toBe("pending");
  } finally {
    args.dispose();
    data.dispose();
  }
});
