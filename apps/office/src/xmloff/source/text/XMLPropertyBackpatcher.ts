/** @fileoverview Original XML field property backpatching for forward references. */
import type { XMLTextContent } from "../../inc/txtimp";

/** Resolves an XML reference value immediately or after its declaration arrives. */
export class XMLPropertyBackpatcher<Value> {
  private readonly ids = new Map<string, Value>();
  private readonly pending = new Map<string, XMLTextContent[]>();

  /** Binds the typed property writer. @param write - Applies the original UNO property. */
  public constructor(private readonly write: (target: XMLTextContent, value: Value) => void) {}

  /** Publishes a target and patches any existing references. @param name - XML identity. @param value - Native reference value. */
  public ResolveId(name: string, value: Value): void {
    this.ids.set(name, value);
    const waiting = this.pending.get(name);
    this.pending.delete(name);
    for (const field of waiting ?? []) this.write(field, value);
  }

  /** Applies the native property if known or retains the reference for backpatching. @param field - Native reference field. @param name - XML identity. */
  public SetProperty(field: XMLTextContent, name: string): void {
    if (this.ids.has(name)) {
      this.write(field, this.ids.get(name) as Value);
      return;
    }
    const waiting = this.pending.get(name);
    if (waiting) waiting.push(field);
    else this.pending.set(name, [field]);
  }
}
