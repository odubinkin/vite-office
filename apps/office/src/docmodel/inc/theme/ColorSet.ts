/** @fileoverview Named document theme palette indexed by the original ThemeColorType. */
import { Color, COL_AUTO, COL_BLACK } from "../../../tools/inc/color";
import { ThemeColorType } from "./ThemeColorType";

/** Original document-model theme color set. */
export class ColorSet {
  private readonly colors = new Map<ThemeColorType, Color>();

  /** Creates the named set before the importing contexts populate its slots. @param name - Source color scheme name. @returns Color set. */
  constructor(readonly name: string) {}

  /** Assigns one theme slot. @param type - Native index. @param color - Resolved DrawingML color. @returns Nothing. */
  add(type: ThemeColorType, color: Readonly<Color>): void {
    if (type !== ThemeColorType.Unknown) this.colors.set(type, new Color(color));
  }

  /** Borrows a model slot with its default black value. @param type - Native index. @returns Stored or default color. */
  getColor(type: ThemeColorType): Readonly<Color> {
    return type === ThemeColorType.Unknown ? COL_AUTO : (this.findColor(type) ?? COL_BLACK);
  }

  /** Resolves slots explicitly supplied in a DrawingML scheme. @param type - Native index. @returns Stored color or absence. */
  findColor(type: ThemeColorType): Readonly<Color> | undefined {
    return this.colors.get(type);
  }
}
