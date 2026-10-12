/** @fileoverview Complete original generated interface observations over actual shared owners, with independent cold processes and both full initialization orders. */
import { it } from "vitest";
import fixture from "./native-generated-interface-cases.json";
import { createUnoNativeInterfaceContext } from "../../../../../../test/uno-native-interface-values";
import type { Type } from "./Type";

/** Loads one genuine fresh source-caller process; supplies no replacement type/default/interface implementation. @param mode - Whole native mode. @returns Exact initialized observations and actual getters. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeInterfaceContext(fixture.captures[mode]),
    modules = [
      await import("./XWeak"),
      await import("./XAdapter"),
      await import("./XReference"),
      await import("./XAggregation"),
      await import("../lang/XServiceInfo"),
    ] as const,
    classes = [
      modules[0].XWeak,
      modules[1].XAdapter,
      modules[2].XReference,
      modules[3].XAggregation,
      modules[4].XServiceInfo,
    ],
    { UnoType } = await import("../../../../unotype");
  /** Original caller selects a declared C++ getter expression. @param index - Declared interface. @param kind - Original helper expression. @returns Actual borrowed original type. */
  function get(index: number, kind: number): Type {
    const module = modules[index] as (typeof modules)[number];
    if (kind === 0) return UnoType.get(module.cppu_detail_getUnoType);
    if (kind === 1) return (classes[index] as (typeof classes)[number]).static_type();
    if (kind === 2) return module.getCppuType(null);
    if (kind === 3) return UnoType.get(["Reference", module.cppu_detail_getUnoType]);
    return module.cppu_detail_getUnoType();
  }
  return { ...x, get };
}

for (const mode of ["cold0", "cold1", "cold2", "cold3", "cold4", "forward", "reverse"] as const) {
  it(`matches complete original generated interface ${mode} stream`, /** Pure declared native caller expressions and complete metadata; no selected summary hash or virtual implementation. @returns Whole native byte parity. */ async () => {
    const x = await context(mode),
      order =
        mode === "forward"
          ? [0, 1, 2, 3, 4]
          : mode === "reverse"
            ? [4, 3, 2, 1, 0]
            : [Number(mode.slice(4))];
    for (const index of order) {
      x.emit(7, index);
      const t = x.get(index, 0);
      x.observe(t);
      for (let kind = 1; kind < 5; kind++) {
        const v = x.get(index, kind);
        x.emit(kind, v === t, v.getTypeLibType() === t.getTypeLibType());
        x.ref(v.getTypeLibType());
      }
    }
    for (const index of order) {
      x.emit(8, index);
      x.observe(x.get(index, 0));
    }
    x.finish();
  });
}
