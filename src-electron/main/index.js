import { app } from "electron";
import { createMainWindow } from "./window.js";
import "./ipc/index.js";
import "./app-events.js";

let mainWindow;

app.disableHardwareAcceleration();

app.whenReady().then(() => {
    mainWindow = createMainWindow();
});
