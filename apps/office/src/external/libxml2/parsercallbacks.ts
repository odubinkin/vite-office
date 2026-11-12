/** @fileoverview C variadic SAX callback ABI lowering for the original document builder. Bindings key actual parser-context addresses; they introduce no alternate XML owner, parser policy or UNO provider. */
import { getLibXml2 } from "./libxml2";

/** Consumed native SAX function-pointer signatures after erasing unused printf arguments. */
export interface ParserCallbacks {
  /** Original SAX error callback. @param context - Actual native parser. @returns Nothing. */
  error(context: number): void;
  /** Original SAX warning callback. @param context - Actual native parser. @returns Nothing. */
  warning(context: number): void;
  /** Original SAX entity resolver callback. @param context - Actual parser. @param publicId - Native public identifier or NULL. @param systemId - Native system identifier or NULL. @returns Native xmlParserInput pointer. */
  resolveEntity(context: number, publicId: number, systemId: number): number;
}

/** Each native callback installation has its own scope identity, even when the same callback object is reused. */
interface ParserBinding {
  readonly callbacks: ParserCallbacks;
}
const bindings = new Map<number, ParserBinding>();
let entryPoints: readonly [error: number, warning: number, resolver: number] | undefined;

/** Original C static function lifetime is the native module lifetime. Each call resolves the current binding by the real parser pointer, including during nested parsing. @returns The shared native table indices. */
function staticEntryPoints(): readonly [number, number, number] {
  if (!entryPoints) {
    const m = getLibXml2();
    entryPoints = [
      m.addFunction(
        /** Forwards the original parser address through the C varargs trampoline. @param context - Native parser. @returns Nothing. */
        (context: number) => (bindings.get(context) as ParserBinding).callbacks.error(context),
        "vi",
      ),
      m.addFunction(
        /** Forwards warning without inspecting the unused format message. @param context - Native parser. @returns Nothing. */
        (context: number) => (bindings.get(context) as ParserBinding).callbacks.warning(context),
        "vi",
      ),
      m.addFunction(
        /** Keeps the native resolver pointer/count contract. @param context - Native parser. @param publicId - Native identifier. @param systemId - Native identifier. @returns Native parser input. */
        (context: number, publicId: number, systemId: number) =>
          (bindings.get(context) as ParserBinding).callbacks.resolveEntity(
            context,
            publicId,
            systemId,
          ),
        "iiii",
      ),
    ];
  }
  return entryPoints;
}

/** Installs the three original builder SAX callbacks on an actual parser. The scope must remain live through xmlFreeParserCtxt, just like the source IO context. No callback is replaced by a no-op. @param context - Actual allocated parser. @param callbacks - Actual synchronous callback bodies. @returns Native binding scope. */
export function installParserCallbacks(
  context: number,
  callbacks: ParserCallbacks,
): { dispose(): void } {
  const m = getLibXml2(),
    points = staticEntryPoints(),
    binding = { callbacks };
  bindings.set(context, binding);
  m._office_xmlParserInstallCallbacks(context, points[0], points[1], points[2]);
  return {
    /** Releases only this binding after the native parser is destroyed. @returns Nothing. */
    dispose(): void {
      if (bindings.get(context) === binding) bindings.delete(context);
    },
  };
}
