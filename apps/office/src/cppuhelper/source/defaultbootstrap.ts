/** @fileoverview Initial UNO component context and service manager binding for bundled implementations. */
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { UnoType } from "../../cppu/inc/unotype";
import type { XComponentContext } from "../../udkapi/com/sun/star/uno/XComponentContext";
import { ContextEntry_Init } from "../inc/component_context";
import { ComponentContext } from "./component_context";
import { ServiceManager, type Implementation } from "./servicemanager";

/** Original initial-context bootstrap for the bundled component services. A browser realm binds both sides of createComponentContext to its single UNO environment. @param implementations - Statically linked component records. @returns Acquired initial context. */
export function defaultBootstrap_InitialComponentContext(
  implementations: readonly Implementation[],
): Reference<XComponentContext> {
  const owner = new ServiceManager(implementations);
  const manager = new Reference<XInterface>(owner);
  const name = new OUString(
    Uint8Array.from(
      "/singletons/com.sun.star.lang.theServiceManager\0",
      /** Materializes one source ASCII byte in this realm. @param unit - Source character. @returns Byte. */
      (unit) => unit.charCodeAt(0),
    ),
  );
  const value = new Any(manager.getAddress(), UnoType.get("XInterface"));
  const entry = new ContextEntry_Init(name, value);
  const delegate = new Reference<XComponentContext>();
  try {
    const context = new Reference<XComponentContext>(new ComponentContext([entry], 1, delegate));
    try {
      owner.setContext(context);
      return context;
    } catch (error) {
      context.dispose();
      throw error;
    }
  } finally {
    delegate.dispose();
    entry.dispose();
    value.dispose();
    name.dispose();
    manager.dispose();
  }
}
