/** @fileoverview Calc filter worker composition root with its own UNO process services. */
import { initializeExceptionAbi } from "./cppuhelper/browser/exception-abi";
import { initializeLibXml2 } from "./external/libxml2/libxml2";
import { implementations } from "./desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "./desktop/source/app/appinit";
import { bindOdsWorker } from "./sc/browser/filter/xml/ods-worker";

initializeExceptionAbi();
InitApplicationServiceManager(implementations);
bindOdsWorker(initializeLibXml2());
