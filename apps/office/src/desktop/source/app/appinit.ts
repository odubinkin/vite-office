/** @fileoverview Original Desktop::InitApplicationServiceManager process-factory installation. */
import { setProcessServiceFactory } from "../../../comphelper/inc/processfactory";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import type { Implementation } from "../../../cppuhelper/source/servicemanager";
import { XMultiServiceFactory } from "../../../udkapi/com/sun/star/lang/XMultiServiceFactory";

/** Original initialization takes the initial context's service manager and publishes the queried process factory. @param implementations - Statically linked service records. @returns Nothing. */
export function InitApplicationServiceManager(implementations: readonly Implementation[]): void {
  const context = defaultBootstrap_InitialComponentContext(implementations);
  try {
    const manager = context.operatorStar().getServiceManager();
    try {
      const factory = new Reference<XMultiServiceFactory>(
        manager,
        UNO_QUERY_THROW,
        XMultiServiceFactory.static_type,
      );
      try {
        setProcessServiceFactory(factory);
      } finally {
        factory.dispose();
      }
    } finally {
      manager.dispose();
    }
  } finally {
    context.dispose();
  }
}
