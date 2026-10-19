/** @fileoverview Shared palette binding for consumed native toolbox defaults and document-owned recent colors. */
import { useEffect } from "react";
import { ColorControl } from "./ColorControl";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { createBrowserColorItem } from "./color-item";
import { COL_DEFAULT_FONT, COL_DEFAULT_HIGHLIGHT } from "../../inc/xdef";
import type { SfxObjectShell } from "../../../sfx2/source/doc/objsh";
import { NamedColor } from "../../../sfx2/inc/namedcolor";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { browserColor } from "../../../vcl/browser/color";
/** Uses the actual shared Writer palette over native toolbox state and recent-color ownership. @param props - Borrowed shell,slot and command ports. @returns Palette. */
export function ColorSelect({
  objectShell,
  slotId,
  label,
  value,
  enabled,
  onSelect,
  onApply,
}: {
  readonly objectShell: SfxObjectShell;
  readonly slotId: 10017 | 10186;
  readonly label: string;
  readonly value: unknown;
  readonly enabled: boolean;
  readonly onSelect: (item: SvxColorItem) => void;
  readonly onApply: () => void;
}): React.JSX.Element {
  const font = slotId === 10017,
    defaultColor = font ? COL_DEFAULT_FONT : COL_DEFAULT_HIGHLIGHT;
  useEffect(
    /** Seeds the native non-persisted toolbox default without broadcasting. @returns Nothing. */ () => {
      const name = unicode(slotId === 10017 ? "Dark Red 2" : "Yellow"),
        color = new NamedColor(defaultColor, name);
      try {
        objectShell.SetRecentColor(slotId, color, false);
      } finally {
        color.Dispose();
        name.dispose();
      }
    },
    [objectShell, slotId, defaultColor],
  );
  const recent = objectShell.GetRecentColor(slotId);
  let applyColor: string;
  try {
    applyColor = browserColor(recent?.m_aColor ?? defaultColor);
  } finally {
    recent?.Dispose();
  }
  return (
    <ColorControl
      label={label}
      property={font ? "color" : "highlight"}
      value={
        value instanceof SvxColorItem
          ? browserColor(value.GetValue())
          : font
            ? "auto"
            : "transparent"
      }
      fallback={browserColor(defaultColor)}
      disabled={!enabled}
      applyColor={applyColor}
      onApply={onApply}
      onColor={
        /** Records native recent color before dispatching the selected toolbox item. @param property - Palette property. @param selected - RGB/default choice. @returns Nothing. */ (
          _property,
          selected,
        ) => {
          const item = createBrowserColorItem(selected, slotId),
            name = unicode(selected),
            color = new NamedColor(item.GetValue(), name);
          try {
            objectShell.SetRecentColor(slotId, color);
            onSelect(item);
          } finally {
            color.Dispose();
            name.dispose();
          }
        }
      }
    />
  );
}
