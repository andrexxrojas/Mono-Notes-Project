import { ipcMain } from "electron";
import { loadUIState, saveUIState } from "../state/ui-state.js";

let uiState = loadUIState();

function deepMerge(target, patch) {
    for (const key in patch) {
        if (
            typeof patch[key] === "object" &&
            patch[key] !== null &&
            !Array.isArray(patch[key])
        ) {
            target[key] ??= {};
            deepMerge(target[key], patch[key]);
        } else {
            target[key] = patch[key];
        }
    }
}

ipcMain.handle("ui:get", () => uiState);

ipcMain.handle("ui:patch", (_, patch) => {
    deepMerge(uiState, patch);
    saveUIState(uiState);
});
