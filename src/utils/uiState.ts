import { invoke } from "@tauri-apps/api/core";

export type UiState = {
    sidebar_open: boolean;
    sidebar_width: number;
};

export function getUIState(): Promise<UiState> {
    return invoke("get_ui_state");
}

export function setSidebarOpen(open: boolean) {
    return invoke("set_sidebar_open", { open });
}

export function setSidebarWidth(width: number) {
    return invoke("set_sidebar_width", { width });
}