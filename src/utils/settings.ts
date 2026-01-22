import { invoke } from "@tauri-apps/api/core";

export interface Settings {
    sidebar_width: number;
    interface_font: string;
    content_font: string;
    theme: string;
    background: string;
}

export async function loadSettings(): Promise<Settings> {
    return await invoke<Settings>("load_settings");
}

export async function updateSettings(partial: Partial<Settings>): Promise<void> {
    const current = await invoke<Settings>("load_settings");
    await invoke("save_settings", {
        settings: { ...current, ...partial }
    });
}