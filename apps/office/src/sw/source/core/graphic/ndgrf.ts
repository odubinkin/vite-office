/** @fileoverview Writer embedded graphical content node from ndgrf.cxx. */
import type { Size } from "../../../../tools/inc/gen";
import type { Graphic } from "../../../../vcl/source/gdi/graph";
import type { SwGrfFormatColl } from "../../../inc/fmtcol";
import { SwNoTextNode } from "../docnode/ndnotxt";
import type { SwStartNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";

/** Real non-text content of a floating Writer image frame. */
export class SwGrfNode extends SwNoTextNode {
  /** Binds embedded data to a Writer node and graphic collection. @param nodes - Actual node array. @param section - Containing section. @param coll - Native graphic style. @param graphic - Immutable embedded image. @returns Graphic node. */
  constructor(
    nodes: SwNodes,
    section: SwStartNode,
    coll: SwGrfFormatColl,
    private readonly graphic: Graphic,
  ) {
    super(nodes, section, coll);
  }

  /** Borrows the immutable embedded graphic value. @returns Graphic. */
  GetGraphic(): Graphic {
    return this.graphic;
  }

  /** Uses the native graphic extent. @returns Independent twip size. */
  override GetTwipSize(): Size {
    return this.graphic.GetPrefSize();
  }
}
