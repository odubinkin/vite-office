/** @fileoverview Original processfactory.cxx setter/getters, DefaultContext UNO query and successful-once component-context cache. No context, manager or component is manufactured here. */
import {
  Reference,
  UNO_QUERY,
  type BaseReference,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import type { XMultiServiceFactory } from "../../../udkapi/com/sun/star/lang/XMultiServiceFactory";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";

/** Original const-reference return view: the actual cached owner is borrowed, without mutable ownership operations. */
export type ProcessComponentContextConstReference = Pick<
  Reference<XComponentContext>,
  "get" | "operatorArrow" | "operatorStar"
> &
  BaseReference;
/** Original process-local factory reference. Browser-realm calls retain source ownership/replacement semantics; native mutex/thread and reentrant-destructor behavior are outside this binding. */
class LocalProcessFactory {
  private readonly xProcessFactory = new Reference<XMultiServiceFactory>();
  /** Original copy assignment. @param factory - Actual source factory or null reference. @returns Nothing. */
  set(factory: Reference<XMultiServiceFactory>): void {
    this.xProcessFactory.assign(factory);
  }
  /** Original by-value acquired return. @returns Owned factory reference. */
  get(): Reference<XMultiServiceFactory> {
    return new Reference(this.xProcessFactory);
  }
}
const localProcessFactory = new LocalProcessFactory();
let processComponentContext: Reference<XComponentContext> | undefined;
/** Materializes a compiler-known ASCII literal. @param character - Original literal unit. @returns Original byte. */
function ascii(character: string): number {
  return character.charCodeAt(0);
}
/** Original DeploymentException value construction; explicit owners materialize the generated default Context argument and source query temporaries. @param literal - Original ASCII message/prefix. @param factory - Actual source factory when the source supplies Context. @param detail - Original caught message. @returns Never. */
function deployment(
  literal: string,
  factory?: Reference<XMultiServiceFactory>,
  detail?: OUStringConstReference,
): never {
  const message = new OUString(Uint8Array.from(literal + "\0", ascii));
  try {
    const context =
      factory === undefined
        ? new Reference<XInterface>()
        : new Reference<XInterface>(factory, UNO_QUERY);
    try {
      if (detail !== undefined) message.append(detail);
      throw new DeploymentException(message, context);
    } finally {
      context.dispose();
    }
  } finally {
    message.dispose();
  }
}
/** Original process factory replacement; the separate function-local context cache is not reset. @param factory - Actual source reference. @returns Nothing. */
export function setProcessServiceFactory(factory: Reference<XMultiServiceFactory>): void {
  localProcessFactory.set(factory);
}
/** Original acquired factory getter and missing-factory exception. @returns Owned actual factory. */
export function getProcessServiceFactory(): Reference<XMultiServiceFactory> {
  const factory = localProcessFactory.get();
  if (!factory.is()) {
    factory.dispose();
    deployment("null process service factory");
  }
  return factory;
}
/** Original XPropertySet query, exact DefaultContext lookup and XComponentContext query. Only UnknownPropertyException is translated. @param factory - Actual source factory, possibly null. @returns Acquired actual context or original exception. */
export function getComponentContext(
  factory: Reference<XMultiServiceFactory>,
): Reference<XComponentContext> {
  const result = new Reference<XComponentContext>(),
    properties = new Reference<XPropertySet>(factory, UNO_QUERY, XPropertySet.static_type);
  try {
    if (properties.is()) {
      const name = new OUString(Uint8Array.from("DefaultContext\0", ascii));
      try {
        try {
          const value = (properties.get() as XPropertySet).getPropertyValue(name);
          try {
            result.set(value, UNO_QUERY, XComponentContext.static_type);
          } finally {
            value.dispose();
          }
        } catch (error) {
          if (!(error instanceof UnknownPropertyException)) throw error;
          try {
            deployment("unknown service factory DefaultContext property: ", factory, error.Message);
          } finally {
            error.dispose();
          }
        }
      } finally {
        name.dispose();
      }
    }
    if (!result.is()) deployment("no service factory DefaultContext", factory);
    return result;
  } catch (error) {
    result.dispose();
    throw error;
  } finally {
    properties.dispose();
  }
}
/** Original successful-once static initialization. Failed initialization is retried; later factory replacement does not invalidate the cached const reference. @returns Borrowed actual cached context owner. */
export function getProcessComponentContext(): ProcessComponentContextConstReference {
  if (processComponentContext === undefined) {
    const factory = getProcessServiceFactory();
    try {
      processComponentContext = getComponentContext(factory);
    } finally {
      factory.dispose();
    }
  }
  return processComponentContext;
}
