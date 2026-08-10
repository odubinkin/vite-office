/**
 * @fileoverview Boots the static browser entrypoint by connecting the HTML root to the documented React mount adapter.
 */

import { mountApplication } from "./bootstrap";
import "./styles.css";

mountApplication(document.getElementById("root"));
