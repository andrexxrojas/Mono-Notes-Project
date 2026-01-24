import { invoke } from "@tauri-apps/api/core";

export type Note = {
    id: string;
    title: string;
    created_at: number;
    icon?: string;
};

export type BlockType = "H1" | "H2" | "H3" | "Paragraph";

export type Block = {
    id: string;
    note_id: string;
    block_type: BlockType;
    content: string;
    position: number;
};

export const getNotes = async (): Promise<Note[]> => {
    return invoke<Note[]>("get_notes_cmd");
};

export const getNote = async (id: string): Promise<Note> => {
    return invoke<Note>("get_note_cmd", { id });
}

export const addNote = async (title: string): Promise<Note> => {
    const id = await invoke<string>("add_note_cmd", { title });
    return {
        id,
        title,
        created_at: Date.now(),
    };
};

export const getBlocks = async (noteId: string): Promise<Block[]> => {
    return invoke<Block[]>("get_blocks_cmd", { noteId });
};

export const addBlock = async (noteId: string, blockType: BlockType, content: string): Promise<Block> => {
    const id = await invoke<string>("add_block_cmd", { noteId, blockType, content });
    return {
        id,
        note_id: noteId,
        block_type: blockType,
        content,
        position: 0,
    };
};