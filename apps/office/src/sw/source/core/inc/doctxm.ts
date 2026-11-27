/** @fileoverview Connected Writer index section from doctxm.hxx. */
import { SwSection, type SwSectionData, type SwSectionFormat } from "../docnode/section";
import type { SwTOXBase } from "../tox/tox";

/** Native index content section with its original TOX descriptor. */
export class SwTOXBaseSection extends SwSection {
  /** Connects the descriptor to the section owned by the nodes array. @param data - Native section data. @param format - Connected section format. @param tox - Owned index descriptor. @returns Connected contents section. */
  public constructor(
    data: SwSectionData,
    format: SwSectionFormat,
    public readonly tox: SwTOXBase,
  ) {
    super(data, format);
  }
}
