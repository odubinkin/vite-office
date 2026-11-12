/** @fileoverview Writer filter worker composition root with its own native UNO process services. */
import { initializeExceptionAbi } from "./cppuhelper/browser/exception-abi";
import { implementations } from "./desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "./desktop/source/app/appinit";
import "./sw/browser/filter/xml/odt-worker";

initializeExceptionAbi();
InitApplicationServiceManager(implementations);
