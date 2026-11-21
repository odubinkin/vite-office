/** @fileoverview Projects native rotation and glyph advance into the browser's inline formatting context. */
import { useLayoutEffect, useRef, type ReactNode } from "react";

import { connectWriterCharacterGeometry } from "./writer-line-measurement";

/** Paints a single accessible Writer portion at the native width and orientation. @param props - Item values and actual content. @returns Layout-adjusted text. */
export function WriterCharacterGeometryText({
  scaleWidth,
  rotation,
  children,
}: Readonly<{
  scaleWidth: number;
  rotation: number;
  children: ReactNode;
}>): React.JSX.Element {
  const element = useRef<HTMLSpanElement>(null);
  useLayoutEffect(
    /** Connects the mounted portion to its actual shape. @returns Device cleanup. */
    () => {
      const target = element.current as HTMLSpanElement;
      return connectWriterCharacterGeometry(target, scaleWidth, rotation);
    },
    [scaleWidth, rotation],
  );
  return (
    <span
      ref={element}
      data-writer-character-scale={scaleWidth}
      data-writer-character-rotation={rotation}
    >
      {children}
    </span>
  );
}
