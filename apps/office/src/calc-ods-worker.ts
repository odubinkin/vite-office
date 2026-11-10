/** @fileoverview Calc filter worker composition root with its own UNO process services. */
import { implementations } from "./desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "./desktop/source/app/appinit";
import { bindOdsWorker } from "./sc/browser/filter/xml/ods-worker";

InitApplicationServiceManager(implementations);
bindOdsWorker();
