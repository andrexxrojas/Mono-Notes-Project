import { contextBridge, ipcRenderer } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const nativeModulePath = path.join(__dirname, '..', 'rust', 'notes_backend.win32-x64-msvc.node');

const { NotesDb } = require(nativeModulePath);

const dbPath = path.join(__dirname, '..', 'notes.sqlite');
const db = new NotesDb(dbPath);

contextBridge.exposeInMainWorld("electron", {
    window: {
        minimize: () => ipcRenderer.send("window-minimize"),
        maximize: () => ipcRenderer.send("window-maximize"),
        close: () => ipcRenderer.send("window-close"),
    },
    ui: {
        get: () => ipcRenderer.invoke("ui:get"),
        patch: (patch) => ipcRenderer.invoke("ui:patch", patch),
    },
    settings: {
        get: () => ipcRenderer.invoke("settings:get"),
        patch: (patch) => ipcRenderer.invoke("settings:patch", patch),
    },
    notes: {
        addNote: (title, icon) => db.addNote(title, icon),
        getNotes: () => db.getNotes(),
        getNote: (id) => db.getNote(id),
        updateNoteTitle: (id, title) => db.updateNoteTitle(id, title),
        addBlockBelow: (nodeId, currentBlockId, blockType, content) => db.addBlockBelow(nodeId, currentBlockId, blockType, content),
        updateBlock: (blockId, content) => db.updateBlock(blockId, content),
        getBlocks: (noteId) => db.getBlocks(noteId),
    },
});