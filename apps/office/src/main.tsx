/**
 * @fileoverview Boots the static browser entrypoint by connecting the HTML root to the documented React mount adapter.
 */

import { initializeExceptionAbi } from "./cppuhelper/browser/exception-abi";
import { initializeLibXml2 } from "./external/libxml2/libxml2";
import { implementations } from "./desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "./desktop/source/app/appinit";
import { createCalcModuleFactory } from "./sc/browser/composition/calc-module";
import { mountApplication } from "./framework/browser/app/bootstrap";
import { createOfficeModuleDescriptors } from "./framework/browser/app/modulemanager";
import {
  createWriterModuleFactory,
  prepareWriterBrowserFonts,
} from "./sw/browser/composition/writer-module";
import "./vcl/browser/styles.css";

initializeExceptionAbi();
InitApplicationServiceManager(implementations);

void Promise.all([
  initializeLibXml2(),
  prepareWriterBrowserFonts(document, globalThis.navigator?.language ?? "en-US"),
]).then(
  /** Constructs document sessions only after their configured web-font candidates are available. @returns Nothing. */ () => {
    mountApplication(
      document.getElementById("root"),
      createOfficeModuleDescriptors([createWriterModuleFactory(), createCalcModuleFactory()]),
    );
  },
);
