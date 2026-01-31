import { ipcMain } from "electron";
import { SettingsStore } from "../settingsStore.js";

ipcMain.handle("settings:get", () => {
    return SettingsStore.get();
});

ipcMain.handle("settings:patch", (_event, patch) => {
    return SettingsStore.patch(patch);
});
