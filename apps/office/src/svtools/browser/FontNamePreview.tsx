/** @fileoverview React host for native FontNameBox sizing/paint over actual Canvas and acquired physical faces. */
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { FontList } from "./font-list";
import { BrowserFontPreviewResources, type BrowserFontNamePreview } from "./font-preview-resources";
import { Font } from "../../vcl/source/font/font";
import { BrowserFontPreviewDevice } from "../../vcl/browser/font-preview-device";
import { drawFontNamePreview, getFontNamePreviewSize } from "../source/control/ctrlbox.fontname";
import { Size } from "../../tools/inc/gen";

/** Actual native row inputs;the owning combo retains all keyboard,pointer,selection and command behavior. */
interface FontNamePreviewProps {
  readonly family: string;
  readonly selected: boolean;
  readonly source: Readonly<{ list: FontList; resources: BrowserFontPreviewResources }> | undefined;
}

/** Presents one readable font name and the original source-selected sample. Unknown source data retains a readable ordinary label. @param props - Actual family/selection/source ports. @returns Row content. */
export function FontNamePreview({
  family,
  selected,
  source,
}: FontNamePreviewProps): React.JSX.Element {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const [canPaint, setCanPaint] = useState(false);
  const attachCanvas = useCallback(
    /** Binds the real mounted Canvas context and leaves its ordinary label visible when Canvas is unavailable. @param element - Actual canvas or unmounted node. @returns Nothing. */ (
      element: HTMLCanvasElement | null,
    ) => {
      canvas.current = element;
      context.current = element === null ? null : element.getContext("2d");
      setCanPaint(context.current !== null);
    },
    [],
  );
  const [acquired, setAcquired] = useState<
    Readonly<{
      family: string;
      list: FontList;
      resources: BrowserFontPreviewResources;
      value: BrowserFontNamePreview | undefined;
    }>
  >();
  const preview =
    source !== undefined &&
    acquired?.family === family &&
    acquired.list === source.list &&
    acquired.resources === source.resources
      ? acquired.value
      : undefined;
  useEffect(
    /** Acquires only the retained physical file and prevents stale publication across inventory/family changes. @returns Cleanup. */ () => {
      if (source === undefined) return;
      const { list, resources } = source;
      let active = true;
      void resources.Get(list, family).then(
        /** Publishes actual acquired values. @param value - Acquired preview or unknown. @returns Nothing. */ (
          value,
        ) => {
          if (active) setAcquired({ family, list, resources, value });
        },
        /** A rejected real font/load source remains an ordinary readable name,not invented glyph coverage. @returns Nothing. */ () => {
          if (active) setAcquired({ family, list, resources, value: undefined });
        },
      );
      return /** Stops publication to a removed row. @returns Nothing. */ () => {
        active = false;
      };
    },
    [family, source],
  );
  useLayoutEffect(
    /** Paints real source geometry and follows host color/size changes without moving combo focus. @returns Cleanup or nothing while source data is unknown. */ () => {
      const currentContext = context.current;
      if (preview === undefined || currentContext === null) return;
      const loaded = preview;
      const element = canvas.current as HTMLCanvasElement;
      const host = element.closest("button") as HTMLButtonElement;
      const paintContext = currentContext;
      /** Reads current actual UI font/color for native source sizing and selected/hover paint. @returns Nothing. */
      function paint(): void {
        const style = getComputedStyle(host),
          fontHeight = Math.max(1, Math.round(Number.parseFloat(style.fontSize)));
        const ui = new Font();
        ui.SetFamilyName(style.fontFamily);
        ui.SetFontHeight(fontHeight);
        paintContext.font = `${style.fontStyle} ${style.fontWeight} ${fontHeight}px ${style.fontFamily}`;
        const size = getFontNamePreviewSize(
          Math.ceil(paintContext.measureText("0").width),
          fontHeight,
        );
        const width = Math.max(1, Math.min(size.Width(), host.clientWidth - 16));
        const height = size.Height(),
          ratio = window.devicePixelRatio;
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.width = Math.ceil(width * ratio);
        element.height = Math.ceil(height * ratio);
        paintContext.setTransform(ratio, 0, 0, ratio, 0, 0);
        const device = new BrowserFontPreviewDevice(
          paintContext,
          ui,
          { style: style.fontStyle, weight: style.fontWeight, color: style.color },
          /** Resolves only the actual acquired face for this logical family. @param name - Logical family requested by the source device. @returns Physical data or unknown UI font. */ (
            name,
          ) => (name === loaded.metric.GetFamilyName() ? loaded.face : undefined),
        );
        drawFontNamePreview(loaded.metric, device, new Size(width, height), selected, {
          text: style.color,
          highlightText: style.color,
        });
      }
      paint();
      const observer = new ResizeObserver(paint);
      observer.observe(host);
      host.addEventListener("pointerenter", paint);
      host.addEventListener("pointerleave", paint);
      window.addEventListener("resize", paint);
      return /** Releases only this row's actual host observers and paint listeners. @returns Nothing. */ () => {
        observer.disconnect();
        host.removeEventListener("pointerenter", paint);
        host.removeEventListener("pointerleave", paint);
        window.removeEventListener("resize", paint);
      };
    },
    [family, preview, selected, canPaint],
  );
  if (preview === undefined)
    return (
      <span className="block" style={{ width: "52ch", maxWidth: "100%", height: "1.6em" }}>
        {family}
      </span>
    );
  return (
    <span className="block" style={{ width: "52ch", maxWidth: "100%", height: "1.6em" }}>
      <span className={!canPaint ? undefined : "sr-only"}>{family}</span>
      <canvas
        ref={attachCanvas}
        aria-hidden="true"
        hidden={!canPaint}
        data-office-font-preview={family}
        className={!canPaint ? "hidden" : "block"}
      />
    </span>
  );
}
