use tauri::State;
use crate::db::notes_db::{NotesDb, BlockType, Note, Block};
use std::sync::Arc;

#[tauri::command]
pub fn add_note_cmd(db: State<Arc<NotesDb>>, title: String) -> Result<String, String> {
    db.add_note(&title, None).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_notes_cmd(db: State<Arc<NotesDb>>) -> Result<Vec<Note>, String> {
    db.get_notes().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_note_cmd(db: State<Arc<NotesDb>>, id: String) -> Result<Note, String> {
    db.get_note(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_note_title(db: State<Arc<NotesDb>>, note_id: String, title: String) -> Result<(), String> {
    db.update_note_title(&note_id, &title).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn add_block_cmd(
    db: State<Arc<NotesDb>>,
    note_id: String,
    block_type: String,
    content: String,
) -> Result<String, String> {
    let btype = match block_type.as_str() {
        "H1" => BlockType::H1,
        "H2" => BlockType::H2,
        "H3" => BlockType::H3,
        _ => BlockType::Paragraph,
    };

    db.add_block(&note_id, btype, &content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_blocks_cmd(db: State<Arc<NotesDb>>, note_id: String) -> Result<Vec<Block>, String> {
    db.get_blocks(&note_id).map_err(|e| e.to_string())
}
