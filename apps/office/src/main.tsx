/**
 * @fileoverview Boots the static browser entrypoint by connecting the HTML root to the documented React mount adapter.
 */

import { mountApplication } from "./framework/source/services/bootstrap";
import { createOfficeModuleDescriptors } from "./framework/source/services/modulemanager";
import { createWriterModuleFactory } from "./sw/source/uibase/app/swmodule";
import "./vcl/browser/styles.css";

mountApplication(
  document.getElementById("root"),
  createOfficeModuleDescriptors([createWriterModuleFactory()]),
);
