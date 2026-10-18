/** @fileoverview Shared Vite Office control styles, extracted from Writer formatting controls for consistent Writer and Calc presentation. */
/** Existing Writer command-button shape, palette, sizing and enabled/active states. */
export const officeToolbarButtonClassName =
  "grid size-8 place-items-center rounded-md border border-slate-300 bg-white text-sm font-bold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-800 disabled:cursor-not-allowed disabled:opacity-50 data-[active=true]:border-indigo-700 data-[active=true]:bg-indigo-700 data-[active=true]:text-white";
/** Browser text-field companion using the same Writer slate/indigo control palette. */
export const officeTextInputClassName =
  "h-8 min-w-0 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200";
