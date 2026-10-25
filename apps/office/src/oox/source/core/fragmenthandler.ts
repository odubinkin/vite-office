/** @fileoverview Ports consumed FragmentHandler callbacks and fragment/relationship ownership; expanded XML names replace generated C++ token integers at the SAX binding. */
import type { SaxesAttributeNS, SaxesTagNS } from "saxes";
import type { Relations } from "./relations";

/** Consumed filter contract avoids a runtime import cycle between filter and fragment handlers. */
export interface FragmentFilter {
  importRelations(path: string): Promise<Relations>;
  openInputStream(path: string): Promise<Uint8Array | null>;
}

/** Native XFastContextHandler callback subset consumed by XML fragments. */
export interface FragmentContext {
  createFastChildContext(
    tag: SaxesTagNS,
    attributes: readonly SaxesAttributeNS[],
  ): FragmentContext | null;
  startFastElement(tag: SaxesTagNS, attributes: readonly SaxesAttributeNS[]): void;
  endFastElement(tag: SaxesTagNS): void;
  characters(value: string): void;
}

/** Original inert base callbacks; derived handlers select contexts and own model changes. */
export class FragmentHandler implements FragmentContext {
  /** Retains filter, path and optional already-resolved relationships. @param filter - Filter owner. @param path - Fragment. @param relations - Explicit relationships, used by RelationsFragment to avoid recursion. @returns Handler. */
  constructor(
    protected readonly filter: FragmentFilter,
    private readonly path: string,
    private readonly relations?: Relations,
  ) {}
  /** Borrows the original path. @returns Fragment. */
  getFragmentPath(): string {
    return this.path;
  }
  /** Resolves the original shared relation owner. @returns Relations. */
  async getRelations(): Promise<Relations> {
    return this.relations ?? this.filter.importRelations(this.path);
  }
  /** Opens this fragment through its filter. @returns Bytes or null. */
  openFragmentStream(): Promise<Uint8Array | null> {
    return this.filter.openInputStream(this.path);
  }
  /** Original inert document callback. @returns Nothing. */ startDocument(): void {}
  /** Original inert document callback. @returns Nothing. */ endDocument(): void {}
  /** Original base declines unknown child contexts. @param tag - Unused element. @param attributes - Unused attributes. @returns Null. */ createFastChildContext(
    tag: SaxesTagNS,
    attributes: readonly SaxesAttributeNS[],
  ): FragmentContext | null {
    void tag;
    void attributes;
    return null;
  }
  /** Original inert start hook. @param tag - Unused element. @param attributes - Unused attributes. @returns Nothing. */ startFastElement(
    tag: SaxesTagNS,
    attributes: readonly SaxesAttributeNS[],
  ): void {
    void tag;
    void attributes;
  }
  /** Original inert end hook. @param tag - Unused element. @returns Nothing. */ endFastElement(
    tag: SaxesTagNS,
  ): void {
    void tag;
  }
  /** Original inert text hook. @param value - Unused text. @returns Nothing. */ characters(
    value: string,
  ): void {
    void value;
  }
}
