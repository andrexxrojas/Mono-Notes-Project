import { BrowserWindow } from "electron";
import serve from "electron-serve";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appServe = process.env.NODE_ENV === "production"
    ? serve({ directory: path.join(__dirname, "../out") })
    : null;

export function createMainWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 840,
        minHeight: 485,
        show: false,
        frame: false,
        titleBarStyle: false,
        webPreferences: {
            preload: path.join(__dirname, "../preload/preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false
        },
    });

    win.once("ready-to-show", () => win.show());

    if (appServe) {
        appServe(win).then(() => win.loadURL("app://-"));
    } else {
        win.loadURL("http://localhost:3000");
    }

    return win;
}
