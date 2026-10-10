/** @fileoverview Owns original content-node frame registration from pinned ssfrm.cxx; native flow/redline layout remains incomplete. */
import { SwFrame } from "./wsfrm";
import type { SwContentNode } from "../docnode/node";

/** Native content-frame base registering the original content node rather than a projected geometry owner. */
export abstract class SwContentFrame extends SwFrame {
  /** Registers the original native content owner. @param node - Existing source node. @returns Nothing. */
  protected constructor(node: SwContentNode) {
    super(node);
  }
}
