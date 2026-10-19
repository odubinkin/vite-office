/** @fileoverview Native NamedColor value copies, theme defaults and document-owned recent-color notifications. */
import { expect, it } from "vitest";
import { NamedColor } from "../../inc/namedcolor";
import { SfxObjectShell, createDocument } from "./objsh";
import { Color } from "../../../tools/inc/color";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ThemeColorType } from "../../../docmodel/inc/theme/ThemeColorType";
import { TransformationType } from "../../../docmodel/inc/color/Transformation";
import { SfxListener } from "../../../svl/source/notify/lstner";
import { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../../svl/inc/hint";
it("retains native NamedColor defaults and independent theme values", /** Checks source field values and actual complex conversion. @returns Nothing. */ () => {
  const empty = new NamedColor(),
    name = unicode("Accent"),
    value = new NamedColor(new Color(0x123456), name);
  try {
    expect([
      empty.m_aColor.toUInt32(),
      text(empty.m_aName),
      empty.m_nThemeIndex,
      empty.m_nLumMod,
      empty.m_nLumOff,
    ]).toEqual([0, "", -1, 10000, 0]);
    expect(value.getComplexColor().getFinalColor().toUInt32()).toBe(0x123456);
    value.m_nThemeIndex = ThemeColorType.Accent2;
    const standard = value.getComplexColor();
    expect(standard.getThemeColorType()).toBe(ThemeColorType.Accent2);
    expect(standard.getTransformations()).toEqual([]);
    value.m_nLumMod = 8500;
    value.m_nLumOff = 1200;
    const copy = new NamedColor(value),
      complex = copy.getComplexColor();
    value.m_aColor.assign(new Color(0));
    value.m_nLumMod = 0;
    expect(copy.m_aColor.toUInt32()).toBe(0x123456);
    expect(complex.getFinalColor().toUInt32()).toBe(0x123456);
    expect(
      complex
        .getTransformations()
        .map(
          /** Reads native transformation values. @param item - Transformation. @returns Pair. */ (
            item,
          ) => [item.meType, item.mnValue],
        ),
    ).toEqual([
      [TransformationType.LumMod, 8500],
      [TransformationType.LumOff, 1200],
    ]);
    expect(text(copy.m_aName)).toBe("Accent");
    copy.Dispose();
  } finally {
    empty.Dispose();
    value.Dispose();
    name.dispose();
  }
});
it("copies recent colors per slot and publishes original ColorsChanged defaults", /** Checks actual shell,reciprocal listeners and native value ownership. @returns Nothing. */ () => {
  const shell = new SfxObjectShell(
      createDocument({ id: "colors", suiteId: "calc", title: "Colors" }),
      { kind: "untitled", name: "Colors" },
    ),
    hints: SfxHintId[] = [];
  /** Actual native listener observing the shared shell. */
  class Listener extends SfxListener {
    /** Observes the actual shell identity. @param source - Broadcaster. @param hint - Native hint. @returns Nothing. */
    override Notify(source: SfxBroadcaster, hint: SfxHint): void {
      expect(source).toBe(shell);
      hints.push(hint.GetId());
    }
  }
  const listener = new Listener(),
    value = new NamedColor();
  value.m_aColor.assign(new Color(0xabcdef));
  listener.StartListening(shell);
  expect(shell.GetRecentColor(10017)).toBeUndefined();
  shell.SetRecentColor(10017, value);
  value.m_aColor.assign(new Color(0x102030));
  shell.SetRecentColor(10017, value, false);
  shell.SetRecentColor(10018, value);
  const first = shell.GetRecentColor(10017),
    second = shell.GetRecentColor(10018);
  expect(first?.m_aColor.toUInt32()).toBe(0x102030);
  first?.m_aColor.assign(new Color(0));
  const again = shell.GetRecentColor(10017);
  expect(again?.m_aColor.toUInt32()).toBe(0x102030);
  expect(hints).toEqual([SfxHintId.ColorsChanged, SfxHintId.ColorsChanged]);
  first?.Dispose();
  second?.Dispose();
  again?.Dispose();
  value.Dispose();
  shell.Dispose();
  expect(hints.at(-1)).toBe(SfxHintId.Dying);
  expect(listener.GetBroadcasterCount()).toBe(0);
  expect(shell.GetRecentColor(10017)).toBeUndefined();
  listener.Dispose();
});
