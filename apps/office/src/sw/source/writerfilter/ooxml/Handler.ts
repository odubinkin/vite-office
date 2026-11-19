/** @fileoverview Native break controls and hyperlink field command construction. */
import type { Id, Properties, Sprm, Stream, Value } from "../inc/dmapper/resourcemodel";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import type { OOXMLPropertySet } from "./OOXMLPropertySet";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";

/** Original header/footer reference attribute receiver shared by the two part selectors. */
export class OOXMLHeaderFooterHandler implements Properties {
  private type = 0;
  private id = "";

  /** Binds the original header or footer resolver from the surrounding context. @param resolve - Native part resolver. @returns Handler. */
  constructor(private readonly resolve: (type: number, id: string) => void) {}

  /** Retains the native page type and relationship identity. @param id - Attribute resource. @param value - Attribute value. @returns Nothing. */
  attribute(id: Id, value: Value): void {
    if (id === N.LN_CT_HdrFtrRef_type) this.type = value.getInt();
    else if (id === N.LN_CT_HdrFtrRef_id) {
      const name = value.getString();
      try {
        this.id = text(name);
      } finally {
        name.dispose();
      }
    }
  }

  /** The original receiver ignores nested modifiers. @returns Nothing. */
  sprm(): void {}

  /** Resolves the selected relationship after all attributes are known. @returns Nothing. */
  finalize(): void {
    this.resolve(this.type, this.id);
  }
}

/** Original stream-context operations consumed by the hyperlink attribute receiver. */
interface HyperlinkContext {
  getTargetForId(id: string): string;
  text(value: string): void;
}

/** Converts hyperlink element attributes into the original Word field instruction. */
export class OOXMLHyperlinkHandler implements Properties {
  private url = "";
  private fieldCode = "";

  /** Binds the surrounding stream context. @param context - Part's current context. @returns Handler. */
  constructor(private readonly context: HyperlinkContext) {}

  /** Delivers the complete command through the native UTF16 stream. @returns Nothing. */
  writetext(): void {
    this.context.text(` HYPERLINK "${this.url}"${this.fieldCode}`);
  }

  /** Consumes the original relation and field switches. @param name - Resource ID. @param value - Typed XML value. @returns Nothing. */
  attribute(name: Id, value: Value): void {
    const fieldSwitch = hyperlinkSwitch.get(name);
    if (fieldSwitch === undefined && name !== N.LN_CT_Hyperlink_r_id) return;
    const native = value.getString();
    try {
      if (fieldSwitch !== undefined) this.fieldCode += ` ${fieldSwitch} "${text(native)}"`;
      else this.url = this.context.getTargetForId(text(native));
    } finally {
      native.dispose();
    }
  }

  /** The original handler ignores nested modifiers. @param _sprm - Modifier. @returns Nothing. */
  sprm(_sprm: Sprm): void {
    void _sprm;
  }
}

const hyperlinkSwitch = new Map<number, string>([
  [N.LN_CT_Hyperlink_tgtFrame, "\\t"],
  [N.LN_CT_Hyperlink_tooltip, "\\o"],
  [N.LN_CT_Hyperlink_anchor, "\\l"],
]);

/** Consumed original context operations used by the native break-handler destructor. */
export interface BreakContext {
  getPropertySet(): OOXMLPropertySet;
  clearProps(): void;
}

/** Native break properties are emitted before the byte control marker when context-owned. */
export class OOXMLBreakHandler implements Properties {
  private mnType = 0;
  /** Borrows context and stream for the native lexical handler lifetime. @param mpFastContext - Context, null for postponed breaks. @param mrStream - Stream. @returns Handler. */
  constructor(
    private readonly mpFastContext: BreakContext | null,
    private readonly mrStream: Pick<Stream, "props" | "text">,
  ) {}
  /** Original type selection ignores clear and other attributes. @param name - Resource ID. @param value - Native value. @returns Nothing. */
  attribute(name: Id, value: Value): void {
    if (name === N.LN_CT_Br_type) this.mnType = value.getInt();
  }
  /** Original modifier callback is intentionally empty. @param _sprm - Ignored native modifier. @returns Nothing. */
  sprm(_sprm: Sprm): void {
    void _sprm;
  }
  /** Explicit host binding of the native destructor; call once at the end of the handler's scope. @returns Nothing. */
  dispose(): void {
    if (this.mpFastContext) {
      this.mrStream.props(this.mpFastContext.getPropertySet());
      this.mpFastContext.clearProps();
    }
    const code =
      this.mnType === N.LN_Value_ST_BrType_column
        ? 0x0e
        : this.mnType === N.LN_Value_ST_BrType_page
          ? 0x0c
          : 0x0a;
    this.mrStream.text(Uint8Array.of(code), 1);
  }
}
