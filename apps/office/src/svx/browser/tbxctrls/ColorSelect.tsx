/** @fileoverview Shared palette binding for consumed native toolbox defaults and document-owned recent colors. */
import { type ReactNode, useEffect } from "react";
import { ColorControl } from "./ColorControl";
import { SvxColorItem } from "../../../editeng/inc/colritem";
import { createBrowserColorItem } from "./color-item";
import { COL_DEFAULT_FONT, COL_DEFAULT_HIGHLIGHT, COL_DEFAULT_FRAMELINE } from "../../inc/xdef";
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
  icon,
}: {
  readonly objectShell: SfxObjectShell;
  readonly slotId: 10017 | 10186 | 10202;
  readonly icon?: ReactNode;
  readonly label: string;
  readonly value: unknown;
  readonly enabled: boolean;
  readonly onSelect: (item: SvxColorItem) => void;
  readonly onApply: () => void;
}): React.JSX.Element {
  const font = slotId === 10017,
    defaultColor = font
      ? COL_DEFAULT_FONT
      : slotId === 10202
        ? COL_DEFAULT_FRAMELINE
        : COL_DEFAULT_HIGHLIGHT;
  useEffect(
    /** Seeds the native non-persisted toolbox default without broadcasting. @returns Nothing. */ () => {
      const name = unicode(slotId === 10017 ? "Dark Red 2" : slotId === 10202 ? "Blue" : "Yellow"),
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
      property={slotId === 10186 ? "highlight" : "color"}
      icon={icon}
      value={
        value instanceof SvxColorItem
          ? browserColor(value.GetValue())
          : slotId !== 10186
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
