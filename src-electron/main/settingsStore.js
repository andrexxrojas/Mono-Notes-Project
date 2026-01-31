import fs from "fs";
import path from "path";
import { app } from "electron";
import { DEFAULT_SETTINGS } from "./settings.js";

const settingsPath = path.join(app.getPath("userData"), "settings.json");

function readSettings() {
    if (!fs.existsSync(settingsPath)) {
        fs.writeFileSync(
            settingsPath,
            JSON.stringify(DEFAULT_SETTINGS, null, 2)
        );
        return { ...DEFAULT_SETTINGS };
    }

    try {
        const raw = fs.readFileSync(settingsPath, "utf-8");
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
        fs.writeFileSync(
            settingsPath,
            JSON.stringify(DEFAULT_SETTINGS, null, 2)
        );
        return { ...DEFAULT_SETTINGS };
    }
}

function writeSettings(settings) {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
}

export const SettingsStore = {
    get() {
        return readSettings();
    },

    patch(patch) {
        const current = readSettings();
        const next = { ...current, ...patch };
        writeSettings(next);
        return next;
    },
};
