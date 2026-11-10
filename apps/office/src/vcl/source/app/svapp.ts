/** @fileoverview Original Application::GetSettings lazy application state. */
import { AllSettings } from "./settings";
import { ImplGetSVData } from "./svdata";

/** Original application settings initialize on the first request. @returns Stable settings owner. */
export function GetSettings(): AllSettings {
  const app = ImplGetSVData().maAppData;
  return (app.mxSettings ??= new AllSettings());
}
