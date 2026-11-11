/**
 * @fileoverview Installs DOM assertions shared by Vitest component and bootstrap tests.
 */

import "@testing-library/jest-dom/vitest";
import "./css-style-matchers";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
