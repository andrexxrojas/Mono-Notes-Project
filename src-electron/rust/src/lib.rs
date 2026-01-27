use rusqlite::{params, Connection, Result as SqliteResult};
use std::sync::Mutex;
use uuid::Uuid;
use chrono::Utc;
use napi_derive::napi;
use napi::Error;

#[napi(object)]
#[derive(Clone)]
pub struct Note {
    pub id: String,
    pub title: String,
    pub created_at: i64,
    pub icon: Option<String>,
}

#[napi(object)]
#[derive(Clone)]
pub struct Block {
    pub id: String,
    pub note_id: String,
    pub block_type: String,
    pub content: String,
    pub prev_id: Option<String>,
    pub next_id: Option<String>,
}

fn to_napi_error(err: rusqlite::Error) -> Error {
    Error::from_reason(format!("Database error: {}", err))
}

#[napi]
pub struct NotesDb {
    conn: Mutex<Connection>,
}

#[napi]
impl NotesDb {
    #[napi(constructor)]
    pub fn new(path: String) -> napi::Result<Self> {
        let conn = Connection::open(path).map_err(to_napi_error)?;
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
                prev_id TEXT,
                next_id TEXT,
                FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE,
                FOREIGN KEY(prev_id) REFERENCES blocks(id) ON DELETE SET NULL,
                FOREIGN KEY(next_id) REFERENCES blocks(id) ON DELETE SET NULL
            );
            ",
        ).map_err(to_napi_error)?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    #[napi]
    pub fn add_note(&self, title: String, icon: Option<String>) -> napi::Result<String> {
        let note_id = Uuid::new_v4().to_string();
        let created_at = Utc::now().timestamp();

        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO notes (id, title, created_at, icon) VALUES (?1, ?2, ?3, ?4)",
            params![note_id, title, created_at, icon],
        ).map_err(to_napi_error)?;

        let block_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO blocks (id, note_id, type, content, prev_id, next_id) VALUES (?1, ?2, 'Paragraph', '', NULL, NULL)",
            params![block_id, note_id],
        ).map_err(to_napi_error)?;

        Ok(note_id)
    }

    #[napi]
    pub fn get_notes(&self) -> napi::Result<Vec<Note>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, title, created_at, icon FROM notes ORDER BY created_at DESC")
            .map_err(to_napi_error)?;

        let notes_iter = stmt.query_map([], |row| {
            Ok(Note {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                icon: row.get(3)?,
            })
        }).map_err(to_napi_error)?;

        notes_iter.collect::<SqliteResult<Vec<Note>>>().map_err(to_napi_error)
    }

    #[napi]
    pub fn get_note(&self, id: String) -> napi::Result<Note> {
        let conn = self.conn.lock().unwrap();
        conn.query_row(
            "SELECT id, title, created_at, icon FROM notes WHERE id = ?1",
            params![id],
            |row| {
                Ok(Note {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    created_at: row.get(2)?,
                    icon: row.get(3)?,
                })
            },
        )
        .map_err(to_napi_error)
    }

    #[napi]
    pub fn update_note_title(&self, note_id: String, title: String) -> napi::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("UPDATE notes SET title = ?1 WHERE id = ?2", params![title, note_id])
            .map_err(to_napi_error)?;
        Ok(())
    }

    #[napi]
    pub fn add_block_below(&self, note_id: String, current_block_id: String, block_type: String, content: String) -> napi::Result<String> {
        let conn = self.conn.lock().unwrap();
        let new_block_id = Uuid::new_v4().to_string();

        let next_id: Option<String> = conn.query_row(
            "SELECT next_id FROM blocks WHERE id = ?1",
            params![current_block_id],
            |row| row.get(0)
        ).map_err(to_napi_error)?;

        conn.execute(
            "INSERT INTO blocks (id, note_id, type, content, prev_id, next_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![new_block_id, note_id, block_type, content, Some(current_block_id.clone()), next_id]
        ).map_err(to_napi_error)?;

        conn.execute(
            "UPDATE blocks SET next_id = ?1 WHERE id = ?2",
            params![new_block_id, current_block_id]
        ).map_err(to_napi_error)?;

        if let Some(next_block_id) = next_id {
            conn.execute(
                "UPDATE blocks SET prev_id = ?1 WHERE id = ?2",
                params![new_block_id, next_block_id]
            ).map_err(to_napi_error)?;
        }

        Ok(new_block_id)
    }

    #[napi]
    pub fn update_block(&self, block_id: String, content: String) -> napi::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE blocks SET content = ?1 WHERE id = ?2",
            params![content, block_id],
        )
        .map_err(to_napi_error)?;
        Ok(())
    }

    #[napi]
    pub fn get_blocks(&self, note_id: String) -> napi::Result<Vec<Block>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, note_id, type, content, prev_id, next_id FROM blocks WHERE note_id = ?1")
            .map_err(to_napi_error)?;

        let blocks_iter = stmt.query_map([note_id], |row| {
            Ok(Block {
                id: row.get(0)?,
                note_id: row.get(1)?,
                block_type: row.get(2)?,
                content: row.get(3)?,
                prev_id: row.get(4)?,
                next_id: row.get(5)?,
            })
        }).map_err(to_napi_error)?;

        blocks_iter.collect::<SqliteResult<Vec<Block>>>().map_err(to_napi_error)
    }
}
