export {};

export interface Note {
    id: string;
    title: string;
    created_at: number;
    icon?: string;
}

export interface Block {
    id: string;
    note_id: string;
    block_type: string;
    content: string;
    position: number;
}

export interface UIState {
    sidebarOpen: boolean;
    sidebarWidth: number;
}

export interface ElectronAPI {
    window: {
        minimize: () => void;
        maximize: () => void;
        close: () => void;
    };
    ui: {
        get: () => Promise<UIState>;
        patch: (patch: Partial<UIState>) => Promise<{ success: boolean }>;
    };
    notes: {
        addNote: (title: string, icon?: string) => string;
        getNotes: () => Note[];
        getNote: (id: string) => Note;
        updateNoteTitle: (id: string, title: string) => void;
        addBlock: (noteId: string, type: string, content: string) => string;
        getBlocks: (noteId: string) => Block[];
        updateBlock: (blockId: string, content: string) => void;
    };
}

declare global {
    interface Window {
        electron: ElectronAPI;
    }
}