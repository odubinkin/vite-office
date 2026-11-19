/** @fileoverview Real descriptor ComponentData and medium argument retention in main/DOM-free Worker; not native medium storage or filter acceptance. */
import { SequenceAsHashMap } from "../../apps/office/src/comphelper/source/misc/sequenceashashmap";
import {
  getComponentDataEntry,
  setComponentDataEntry,
  clearComponentDataEntry,
} from "../../apps/office/src/unotools/inc/mediadescriptor";
import { Any } from "../../apps/office/src/cppu/inc/com/sun/star/uno/Any";
import { unicode } from "../../apps/office/src/i18nlangtag/source/isolang/isolang.tables";
import { SfxMedium } from "../../apps/office/src/sfx2/source/doc/docfile";
/** Uses only actual public value/medium owners and native descriptor sequences. @returns Boolean observations. */
export function probeNativeMediumData() {
  const descriptor = new SequenceAsHashMap(),
    component = unicode("filter字😀"),
    stream = unicode("InputStream"),
    flag = unicode("ReadOnly"),
    value = new Any([42], "sal_Int32"),
    medium = new SfxMedium({ kind: "untitled", name: "Native descriptor probe" });
  try {
    setComponentDataEntry(descriptor, component, value);
    descriptor.operatorIndex(stream).insert([1], "sal_Int32");
    descriptor.operatorIndex(flag).insert([false], "bool");
    const args = descriptor.getAsConstPropertyValueList();
    try {
      medium.SetArgs(args);
    } finally {
      args.dispose();
    }
    clearComponentDataEntry(descriptor, component);
    const retained = getComponentDataEntry(medium.GetArgs(), component);
    try {
      return {
        componentData: retained.get("sal_Int32") === 42,
        mediumArgs: !medium.GetArgs().contains(stream),
        defaults: medium.GetArgs().getUnpackedValueOrDefault(flag, true, "bool") === false,
      };
    } finally {
      retained.dispose();
    }
  } finally {
    const empty = new SequenceAsHashMap(),
      args = empty.getAsConstPropertyValueList();
    try {
      medium.SetArgs(args);
    } finally {
      args.dispose();
      empty.dispose();
    }
    medium.Close();
    descriptor.dispose();
    component.dispose();
    stream.dispose();
    flag.dispose();
    value.dispose();
  }
}
