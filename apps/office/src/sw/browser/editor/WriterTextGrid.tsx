/** @fileoverview Paints native Writer text grid lines through a CSS page device. */
import type { CSSProperties } from "react";
import type { SwDoc } from "../../source/core/doc/doc";
import type { SwPageFrame } from "../../source/core/layout/newfrm";
import { GetGridWidth, IsVerticalTextGrid } from "../../source/core/layout/pagechg";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import { SwTextGrid, type SwTextGridItem } from "../../inc/tgrditem";
import { writerTextGridColor } from "./frame-decoration";

/** Paints the line and character boundaries of the represented Writer page grid. @param props - Native grid and device geometry. @returns Ground layer for the page or preview. */
export function WriterTextGrid({
  grid,
  direction,
  scale,
  style,
  squaredMode,
  example = false,
}: Readonly<{
  grid: SwTextGridItem;
  direction: SvxFrameDirection;
  scale: number;
  style: CSSProperties;
  squaredMode: boolean;
  example?: boolean;
}>): React.JSX.Element | null {
  const type = grid.GetGridType();
  const base = grid.GetBaseHeight() * scale;
  const ruby = (example && !squaredMode ? 0 : grid.GetRubyHeight()) * scale;
  if (
    type === SwTextGrid.NONE ||
    base <= 0 ||
    (!example && !grid.IsDisplayGrid() && !grid.IsPrintGrid())
  )
    return null;

  const pitch = base + ruby;
  const vertical = IsVerticalTextGrid(direction);
  const block = vertical ? (example ? "right" : "left") : "bottom";
  const inline = vertical ? "bottom" : "right";
  const before = grid.IsRubyTextBelow() ? 0 : ruby;
  const after = before + base;
  const rule = Math.min(example ? 0.65 : 1, base, ruby || base);
  const color = writerTextGridColor(grid.GetColor());
  const divider = before || base;
  const split =
    ruby > 0
      ? `, ${color} ${divider}px ${divider + rule}px, transparent ${divider + rule}px ${pitch}px`
      : "";
  const cells = example || vertical ? base : GetGridWidth(grid, squaredMode) * scale;
  return (
    <div
      aria-hidden="true"
      data-writer-page-text-grid={example ? "preview" : "page"}
      className={`pointer-events-none absolute ${example ? "" : "-z-10"} ${example || grid.IsDisplayGrid() ? "" : "hidden"} ${example || grid.IsPrintGrid() ? "print:block" : "print:hidden"}`}
      style={{
        ...style,
        boxShadow: `inset 0 0 0 ${rule}px ${color}`,
        backgroundImage: `repeating-linear-gradient(to ${block}, ${color} 0 ${rule}px, transparent ${rule}px ${ruby > 0 ? divider : pitch}px${split})`,
      }}
    >
      {type === SwTextGrid.LinesAndChars && cells > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(to ${inline}, ${color} 0 ${Math.min(rule, cells)}px, transparent ${rule}px ${cells}px)`,
            maskImage:
              ruby > 0
                ? `repeating-linear-gradient(to ${block}, transparent 0 ${before}px, black ${before}px ${after}px, transparent ${after}px ${pitch}px)`
                : undefined,
          }}
        />
      )}
    </div>
  );
}

/** Resolves the master format grid and paints it inside the body print rectangle. @param props - Physical page and its document. @returns Grid layer. */
export function WriterPageTextGrid({
  document,
  page,
}: Readonly<{ document: SwDoc; page: SwPageFrame }>): React.JSX.Element | null {
  const body = page.descriptor;
  const format = document.FindPageDesc(body.name)?.GetMaster();
  if (!format) return null;
  return (
    <WriterTextGrid
      grid={format.GetTextGrid()}
      direction={format.GetFrameDir().GetValue()}
      squaredMode={document.IsSquaredPageMode()}
      scale={1 / 15}
      style={{
        top: body.topMargin / 15,
        bottom: body.bottomMargin / 15,
        left: body.leftMargin / 15,
        right: body.rightMargin / 15,
      }}
    />
  );
}
