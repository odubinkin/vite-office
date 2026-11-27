/** @fileoverview Writer text section data and its native frame format from section.cxx. */
import { SvxProtectItem } from "../../../../editeng/source/items/frmitems";
import { RES_PROTECT } from "../../../inc/hintids";
import type { SwDoc } from "../doc/doc";
import { SwFrameFormat } from "../layout/atrfrm";

/** Native ordinary and linked section types. */
export enum SectionType {
  Content = 0,
  ToxHeader,
  ToxContent,
  FileLink = 0x90,
}

/** Native section data, with protection stored on the connected format. */
export class SwSectionData {
  public condition = "";
  public hidden = false;
  public condHidden = true;
  public password: Uint8Array = new Uint8Array();
  public linkFileName = "";

  /** Creates section data using the original model defaults. @param type - Native section kind. @param name - Document section name. @returns New section data. */
  public constructor(
    public type: SectionType,
    public name: string,
  ) {}
}

/** Writer frame format associated with a named text section. */
export class SwSectionFormat extends SwFrameFormat {
  /** Derives the section format from the nearest enclosing section or the default frame format. @param doc - Owning Writer document. @param parent - Enclosing section format. @returns New section format. */
  public constructor(doc: SwDoc, parent?: SwSectionFormat) {
    super(doc.GetAttrPool(), "", undefined, parent ?? doc.GetDfltFrameFormat());
  }
}

/** Content section owned by a SwSectionNode. */
export class SwSection {
  /** Connects the native section data to its format. @param data - Owned section data. @param format - Connected section format. @returns New section. */
  public constructor(
    private readonly data: SwSectionData,
    private readonly format: SwSectionFormat,
  ) {}

  /** Returns the writable native section state. @returns Section data. */
  public GetSectionData(): SwSectionData {
    return this.data;
  }

  /** Borrows the native format assigned to the section. @returns Section format. */
  public GetFormat(): SwSectionFormat {
    return this.format;
  }

  /** Resolves the content protection item through the section format. @returns Effective content protection. */
  public IsProtect(): boolean {
    const protect = this.format.GetAttrSet().Get(RES_PROTECT);
    return protect instanceof SvxProtectItem && protect.IsContentProtected();
  }

  /** Updates the native format protection item. @param value - Content protection flag. @returns Nothing. */
  public SetProtect(value: boolean): void {
    const item = new SvxProtectItem(RES_PROTECT);
    item.SetContentProtect(value);
    this.format.SetFormatAttr(item);
  }
}
