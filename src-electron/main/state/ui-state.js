import { app } from "electron";
import fs from "fs";
import path from "path";
import { deepMerge } from "./deepMerge.js";

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
		const saved = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		return deepMerge(defaultState, saved);
	} catch {
		return structuredClone(defaultState);
	}
}

export function saveUIState(state) {
	fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}
