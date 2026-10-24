/** @fileoverview Real browser host for SvxStyleBox source font/script/bounds/draw decisions over actual pool preview sets. Canvas supplies metrics and background;browser SVG supplies native text decoration. */
import type { SvxColorItem } from "../../../editeng/inc/colritem";
import { SID_ATTR_CHAR_COLOR } from "../../../editeng/inc/editids";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Font } from "../../../vcl/source/font/font";
import { Rectangle } from "../../../tools/inc/gen";
import { FontLineStyle, FontStrikeout } from "../../../tools/inc/fontenum";
import {
  BrowserStylePreviewDevice,
  BrowserStylePreviewUnavailable,
  type BrowserStylePreviewText,
} from "../../../vcl/browser/style-preview-device";
import { browserComputedColor } from "../../../vcl/browser/color";
import {
  checkStylePreviewScripts,
  calcStylePreviewBounds,
  drawStylePreviewEntry,
} from "../../source/tbxctrls/tbcontrl.stylerender";
import { applyStylePreviewColors } from "../../source/tbxctrls/tbcontrl.stylecolor";
import {
  initPlainParagraphScriptTypes,
  getSingleParagraphItemScriptType,
} from "../../../editeng/source/editeng/impedit2.script";
import { LANGUAGE_DONTKNOW } from "../../../i18nlangtag/inc/lang";
import type { StylePreviewSource } from "./style-preview-state";
import { OUString } from "../../../sal/inc/rtl/ustring";

/** Native current row label/selection and owning pool adapter. */
interface Props {
  readonly id: string;
  readonly name: string;
  readonly selected: boolean;
  readonly source: StylePreviewSource;
}

/** Creates real SVG text at the already resolved source pen and font. Native SVGAttributeWriter decoration semantics are used; no case conversion or script guessing occurs here. @param svg - Actual SVG layer. @param output - Actual source device text operation. @param rtl - Actual host text direction. @returns Nothing. */
function appendText(svg: SVGSVGElement, output: BrowserStylePreviewText, rtl: boolean): void {
  const node = document.createElementNS("http://www.w3.org/2000/svg", "text");
  node.textContent = output.text;
  node.setAttribute("x", String(output.x));
  node.setAttribute("y", String(output.y));
  node.setAttribute("fill", output.color);
  node.setAttribute("text-anchor", rtl ? "end" : "start");
  node.style.font = output.cssFont;
  const decorations: string[] = [];
  if (output.font.GetUnderline() !== FontLineStyle.LINESTYLE_NONE) decorations.push("underline");
  if (output.font.GetStrikeout() !== FontStrikeout.STRIKEOUT_NONE) decorations.push("line-through");
  node.style.textDecorationLine = decorations.length === 0 ? "none" : decorations.join(" ");
  svg.append(node);
}
/** Renders one actual source style preview without changing document state or taking focus. Unknown host metrics retain the accessible ordinary label. @param props - Actual row and pool ports. @returns Row host. */
export function StylePreviewRow({ id, name, selected, source }: Props): React.JSX.Element {
  const wrapper = useRef<HTMLSpanElement | null>(null),
    canvas = useRef<HTMLCanvasElement | null>(null),
    svg = useRef<SVGSVGElement | null>(null),
    context = useRef<CanvasRenderingContext2D | null>(null);
  const [canPaint, setCanPaint] = useState(false);
  const attachCanvas = useCallback(
    /** Binds only a real host context. @param element - Mounted canvas or no node. @returns Nothing. */ (
      element: HTMLCanvasElement | null,
    ) => {
      canvas.current = element;
      context.current = element === null ? null : element.getContext("2d");
      setCanPaint(context.current !== null);
    },
    [],
  );
  useLayoutEffect(
    /** Executes actual source preview paint and releases browser observers when this row/owner changes. @returns Cleanup or nothing without a host device. */ () => {
      const currentContext = context.current;
      if (currentContext === null) return;
      const paintContext = currentContext;
      const box = wrapper.current as HTMLSpanElement,
        element = canvas.current as HTMLCanvasElement,
        layer = svg.current as SVGSVGElement,
        host = box.closest("button") as HTMLButtonElement;
      let active = true;
      /** Leaves an ordinary label only for unavailable host font/device metrics;model failures remain visible to the owner. @returns Nothing. */
      function paint(): void {
        if (!active) return;
        try {
          paintKnown();
        } catch (error) {
          if (!(error instanceof BrowserStylePreviewUnavailable)) throw error;
          layer.replaceChildren();
        }
      }
      /** Measures and draws current host values through native source algorithms. @returns Nothing. */
      function paintKnown(): void {
        box.dataset.previewReady = "false";
        layer.replaceChildren();
        const style = getComputedStyle(host),
          fontHeight = Math.round(Number.parseFloat(style.fontSize));
        let background = browserComputedColor(style.backgroundColor);
        let ancestor: HTMLElement | null = host;
        while (background?.GetAlpha() === 0 && ancestor.parentElement !== null) {
          ancestor = ancestor.parentElement;
          background = browserComputedColor(getComputedStyle(ancestor).backgroundColor);
        }
        if (background === undefined || !Number.isFinite(fontHeight) || fontHeight <= 0) return;
        const set = source.getItemSet();
        const height = 30,
          width = Math.max(
            1,
            host.clientWidth -
              Number.parseFloat(style.paddingLeft) -
              Number.parseFloat(style.paddingRight),
          ),
          ratio = window.devicePixelRatio;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.width = Math.ceil(width * ratio);
        element.height = Math.ceil(height * ratio);
        paintContext.setTransform(ratio, 0, 0, ratio, 0, 0);
        layer.setAttribute("width", String(width));
        layer.setAttribute("height", String(height));
        layer.setAttribute("viewBox", `0 0 ${width} ${height}`);
        layer.style.direction = style.direction;
        const ui = new Font();
        ui.SetFamilyName(style.fontFamily);
        ui.SetFontHeight(fontHeight);
        const device = new BrowserStylePreviewDevice(
          paintContext,
          ui,
          style.color,
          { background, fillColor: background, lineColor: undefined },
          /** Emits actual native text operations to browser SVG. @param output - Resolved source text operation. @returns Nothing. */ (
            output,
          ) => appendText(layer, output, style.direction === "rtl"),
        );
        const row = new Rectangle(0, 0, width - 1, height - 1);
        const fonts = source.controller.Prepare(set, source.mapUnit);
        const normal = device.GetTextBoundRect(name, 0, name.length)?.GetWidth() ?? 0;
        const foreground = set?.GetItem(SID_ATTR_CHAR_COLOR) as SvxColorItem | undefined;
        if (set !== undefined)
          applyStylePreviewColors(device, row, selected || host.matches(":hover"), {
            ...source.colors,
            ...(foreground === undefined ? {} : { foreground: foreground.GetValue() }),
          });
        const units = new Uint16Array(name.length);
        for (let index = 0; index < name.length; ++index) units[index] = name.charCodeAt(index);
        const text = new OUString(units, units.length);
        try {
          // Native fresh EditEngine defaults are LANGUAGE_DONTKNOW and pool horizontal LTR.
          const types = initPlainParagraphScriptTypes(text, LANGUAGE_DONTKNOW, false);
          const changes = checkStylePreviewScripts(
            text,
            /** Queries the actual initialized paragraph values. @param selection - Original collapsed selection. @returns Native script flags. */ (
              selection,
            ) => getSingleParagraphItemScriptType(types, selection, LANGUAGE_DONTKNOW),
          );
          const bounds = calcStylePreviewBounds(device, name, changes, fonts);
          const fitted =
            bounds.Bottom() > height
              ? calcStylePreviewBounds(
                  device,
                  name,
                  changes.map(
                    /** Keeps native optimal-size advance measurements separate from the drawing pass. @param change - Actual source run. @returns Independent measurement record. */ (
                      change,
                    ) => ({ ...change }),
                  ),
                  fonts,
                  height / bounds.Bottom(),
                )
              : bounds;
          source.controller.ReportWidth(
            id,
            Math.max(normal, fitted.GetWidth() + 10) +
              Number.parseFloat(style.paddingLeft) +
              Number.parseFloat(style.paddingRight),
          );
          drawStylePreviewEntry(device, row, bounds, name, changes, fonts);
          box.dataset.previewReady = "true";
        } finally {
          text.dispose();
        }
      }
      paint();
      const observer = new ResizeObserver(paint);
      observer.observe(host);
      host.addEventListener("pointerenter", paint);
      host.addEventListener("pointerleave", paint);
      window.addEventListener("resize", paint);
      document.fonts.addEventListener("loadingdone", paint);
      void document.fonts.ready.then(paint);
      return /** Releases only this row's resources;the document/style/font-state owner stays with the controller. @returns Nothing. */ () => {
        active = false;
        observer.disconnect();
        host.removeEventListener("pointerenter", paint);
        host.removeEventListener("pointerleave", paint);
        window.removeEventListener("resize", paint);
        document.fonts.removeEventListener("loadingdone", paint);
      };
    },
    [id, name, selected, source, canPaint],
  );
  return (
    <span
      ref={wrapper}
      data-office-style-preview={name}
      data-preview-ready="false"
      className="group/style-preview relative block"
      style={{ width: "100%", maxWidth: "100%", height: 30 }}
    >
      <span className="group-data-[preview-ready=true]/style-preview:sr-only">{name}</span>
      <canvas
        ref={attachCanvas}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden group-data-[preview-ready=true]/style-preview:block"
      />
      <svg
        ref={svg}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 hidden group-data-[preview-ready=true]/style-preview:block"
      />
    </span>
  );
}
