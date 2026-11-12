/** @fileoverview Actual application service bootstrap for package/filter/UI fixtures that use source UNO services. No alternate registry, context or provider is installed. */
import { initializeExceptionAbi } from "../cppuhelper/browser/exception-abi";
import { InitApplicationServiceManager } from "../desktop/source/app/appinit";
import { implementations } from "../desktop/browser/app/uno-components";
/** Runs the same real bootstrap as main/Calc/Writer Worker composition roots. @returns Nothing. */
export function initializeOfficeServices(): void {
  initializeExceptionAbi();
  InitApplicationServiceManager(implementations);
}
