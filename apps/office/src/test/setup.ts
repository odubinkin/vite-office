/**
 * @fileoverview Installs DOM assertions shared by Vitest component and bootstrap tests.
 */

import "@testing-library/jest-dom/vitest";
import "./css-style-matchers";
import { cleanup } from "@testing-library/react";
import { initializeOfficeServices } from "./native-office-services";
import { afterEach } from "vitest";

afterEach(cleanup);

// Package/filter fixtures now require the same real service bootstrap as application composition roots.
initializeOfficeServices();
