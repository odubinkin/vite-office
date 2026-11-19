/** @fileoverview Native paragraph SdtBlockHelper output for interop building-block metadata. */
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import { FSNS, type FastSerializerHelper } from "../../../../sax/inc/fshelper";
import type { SfxGrabBagItem } from "../../../../svl/inc/grabbagitem";
import { RES_PARATR_GRABBAG } from "../../../inc/hintids";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { readDocPartSdt, type DocPartSdt } from "../../writerfilter/dmapper/SdtHelper";

const w = token("w");
const val = FSNS(w, token("val"));
const sdtToken = token("sdt");
const properties = token("sdtPr");
const content = token("sdtContent");

/** Writes the native paragraph interop start/end markers in the original text stream. */
export class SdtBlockHelper {
  private open = false;

  /** Binds one body, story or cell serializer. @param serializer - Active fragment serializer. @returns Output owner. */
  constructor(private readonly serializer: FastSerializerHelper) {}

  /** Closes earlier blocks and starts the SDT before its first paragraph when the grab bag declares one. @param node - Actual paragraph. @returns Nothing. */
  StartParagraph(node: SwTextNode): void {
    const item = node.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_GRABBAG, false) as
      SfxGrabBagItem | undefined;
    if (!item) return;
    const bag = item.GetGrabBag();
    if (bag.has("ParaSdtEndBefore")) this.EndSdtBlock();
    const block = readDocPartSdt(bag.get("SdtPr"));
    if (block) {
      this.EndSdtBlock();
      this.WriteSdtBlock(block);
    }
  }

  /** Writes the source SdtPr parameters and opens its actual content element. @param block - Original interop properties. @returns Nothing. */
  private WriteSdtBlock(block: DocPartSdt): void {
    const xml = this.serializer;
    xml.startElementNS(w, sdtToken);
    xml.startElementNS(w, properties);
    for (const key of ["alias", "tag", "id", "lock"] as const) {
      const value = block[key];
      if (value) xml.singleElementNS(w, token(key), val, String(value));
    }
    xml.startElementNS(w, token(block.kind));
    for (const [key, value] of Object.entries(block.part))
      xml.singleElementNS(w, token(key), val, key === "docPartUnique" && !value ? "true" : value);
    xml.endElementNS(w, token(block.kind));
    xml.endElementNS(w, properties);
    xml.startElementNS(w, content);
    this.open = true;
  }

  /** Completes the currently open block, including at the end of a native story. @returns Nothing. */
  EndSdtBlock(): void {
    if (!this.open) return;
    this.serializer.endElementNS(w, content);
    this.serializer.endElementNS(w, sdtToken);
    this.open = false;
  }
}
