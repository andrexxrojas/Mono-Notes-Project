use rusqlite::{params, Connection, Result};
use std::sync::Mutex;
use serde::{Serialize, Deserialize};
use uuid::Uuid;
use chrono::Utc;

#[derive(Serialize, Deserialize, Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub icon: Option<String>
}

#[derive(Serialize, Deserialize, Clone)]
pub enum BlockType {
    H1,
    H2,
    H3,
    Paragraph,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Block {
    pub id: String,
    pub note_id: String,
    pub block_type: BlockType,
    pub content: String,
    pub position: i64
}

pub struct NotesDb {
    pub conn: Mutex<Connection>
}

impl NotesDb {
    pub fn new(path: &str) -> Result<Self> {
        let conn = Connection::open(path)?;
        conn.execute_batch(
            "
            PRAGMA foreign_keys = ON;

            CREATE TABLE IF NOT EXISTS notes (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                icon TEXT
            );

            CREATE TABLE IF NOT EXISTS blocks (
                id TEXT PRIMARY KEY,
                note_id TEXT NOT NULL,
                type TEXT NOT NULL,
                content TEXT NOT NULL,
                position INTEGER NOT NULL,
                FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
            );
            "
        )?;

        Ok(Self { conn: Mutex::new(conn)})
    }

    pub fn add_note(&self, title: &str, icon: Option<&str>) -> Result<String> {
        let note = Note {
            id: Uuid::new_v4().to_string(),
            title: title.to_string(),
            created_at: Utc::now().timestamp(),
            icon: icon.map(|s| s.to_string()),
        };
        self.conn.lock().unwrap().execute(
            "INSERT INTO notes (id, title, created_at, icon) VALUES (?1, ?2, ?3, ?4)",
            params![note.id, note.title, note.created_at, note.icon],
        )?;
        Ok(note.id)
    }

    pub fn get_notes(&self) -> Result<Vec<Note>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, created_at, icon FROM notes ORDER BY created_at DESC"
        )?;
        let notes_iter = stmt.query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                icon: row.get(3)?,
            })
        })?;
        notes_iter.collect()
    }

    // --- Blocks ---
    pub fn add_block(&self, note_id: &str, block_type: BlockType, content: &str) -> Result<String> {
        let conn = self.conn.lock().unwrap();

        let pos = conn.query_row(
            "SELECT COUNT(*) FROM blocks WHERE note_id = ?1",
            params![note_id],
            |row| row.get::<_, i64>(0),
        )?;

        let block = Block {
            id: Uuid::new_v4().to_string(),
            note_id: note_id.to_string(),
            block_type: block_type.clone(),
            content: content.to_string(),
            position: pos,
        };

        let block_type_str = match block.block_type {
            BlockType::H1 => "H1",
            BlockType::H2 => "H2",
            BlockType::H3 => "H3",
            BlockType::Paragraph => "Paragraph",
        };

        conn.execute(
            "INSERT INTO blocks (id, note_id, type, content, position) VALUES (?1, ?2, ?3, ?4, ?5)",
            params![block.id, block.note_id, block_type_str, block.content, block.position],
        )?;

        Ok(block.id)
    }

    pub fn get_blocks(&self, note_id: &str) -> Result<Vec<Block>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, note_id, type, content, position FROM blocks WHERE note_id = ?1 ORDER BY position ASC"
        )?;

        let blocks_iter = stmt.query_map([note_id], |row| {
            let type_str: String = row.get(2)?;
            let block_type = match type_str.as_str() {
                "H1" => BlockType::H1,
                "H2" => BlockType::H2,
                "H3" => BlockType::H3,
                _ => BlockType::Paragraph,
            };

            Ok(Block {
                id: row.get(0)?,
                note_id: row.get(1)?,
                block_type,
                content: row.get(3)?,
                position: row.get(4)?,
            })
        })?;

        blocks_iter.collect()
    }
}