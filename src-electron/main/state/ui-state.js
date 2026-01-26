import { app } from "electron";
import fs from "fs";
import path from "path";

const filePath = path.join(app.getPath("userData"), "ui-state.json");

const defaultState = {
    version: 1,
    layout: {
        sidebar: {
            open: true,
            width: 260,
        },
    },
};

export function loadUIState() {
    try {
        return { ...defaultState, ...JSON.parse(fs.readFileSync(filePath, "utf-8")) };
    } catch {
        return defaultState;
    }
}

export function saveUIState(state) {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}
