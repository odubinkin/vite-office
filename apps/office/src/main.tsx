/**
 * @fileoverview Boots the static browser entrypoint by connecting the HTML root to the documented React mount adapter.
 */

import { mountApplication } from "./framework/browser/app/bootstrap";
import { createOfficeModuleDescriptors } from "./framework/browser/app/modulemanager";
import { createWriterModuleFactory } from "./sw/browser/composition/writer-module";
import "./vcl/browser/styles.css";

mountApplication(
  document.getElementById("root"),
  createOfficeModuleDescriptors([createWriterModuleFactory()]),
);
