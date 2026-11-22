/** @fileoverview Encoded native graphics for browser image elements. */
import { encodeBase64 } from "../../comphelper/source/misc/base64";
import type { Graphic } from "../source/gdi/graph";

const imageSources = new WeakMap<Graphic, string>();

/** Encodes an image for isolated browser image presentation. @param graphic - Native encoded value. @returns Image URL. */
export function graphicImageSource(graphic: Graphic): string {
  const existing = imageSources.get(graphic);
  if (existing !== undefined) return existing;
  const source = `data:${graphic.mediaType};base64,${encodeBase64(graphic.GetNativeData())}`;
  imageSources.set(graphic, source);
  return source;
}
