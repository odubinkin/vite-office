/** @fileoverview Currently consumed native movement collection fields from pamtyp.hxx; unported search/document/section slots are not fabricated. */
import type { SwNode, SwContentNode } from "../docnode/node";
import type { SwContentIndex } from "../bastyp/index";
import type { SwPosition } from "../crsr/pam";
/** Currently consumed fnNd/fnPos part of the original movement collection from pamtyp.hxx. The other six search/document/section function fields and cell/hidden services are not represented or fabricated here. */
export interface SwMoveFnCollection {
  readonly fnNd: (node: SwNode, index: SwContentIndex, mode: 0) => boolean;
  readonly fnPos: (position: SwPosition, check: boolean) => SwContentNode | undefined;
}
