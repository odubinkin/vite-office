/**
 * @fileoverview Boots the static browser entrypoint by connecting the HTML root to the documented React mount adapter.
 */

import { mountApplication } from "./framework/source/services/bootstrap";
import "./vcl/browser/styles.css";

mountApplication(document.getElementById("root"));
