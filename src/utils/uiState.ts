import { load as loadStore } from "@tauri-apps/plugin-store";

const STORE_FILE = "ui_state.json";

export async function loadUIStore() {
    const store = await loadStore(STORE_FILE);
    return store;
}

export async function getSidebarOpen(): Promise<boolean | undefined> {
    const store = await loadUIStore();
    return store.get<boolean>("sidebarOpen");
}

export async function setSidebarOpen(isOpen: boolean) {
    const store = await loadUIStore();
    await store.set("sidebarOpen", isOpen);
    await store.save();
}

export async function getSidebarWidth(): Promise<number | undefined> {
    const store = await loadUIStore();
    return store.get<number>("sidebarWidth");
}

export async function setSidebarWidth(width: number) {
    const store = await loadUIStore();
    await store.set("sidebarWidth", width);
    await store.save();
}
