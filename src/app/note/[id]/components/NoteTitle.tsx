"use client";

import { useNotes, Note } from "@/app/context/NotesContext";
import React, { useRef } from "react";
import styles from "./NoteTitle.module.css";

interface NoteTitleProps {
    note: Note;
}

export default function NoteTitle({ note }: NoteTitleProps) {
    const { updateNoteTitle } = useNotes();
    const divRef = useRef<HTMLDivElement>(null);

    const handleUpdate = () => {
        let text = divRef.current?.textContent?.trim() || "";
        if (!text) text = "New note";
        if (text !== note.title) {
            window.electron.notes.updateNoteTitle(note.id, text);
        }
    };

    const handleBlur = () => {
        void handleUpdate();
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleUpdate();
            divRef.current?.blur();
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const div = e.currentTarget;
        if (div.textContent === "\n" || div.textContent === "") {
            div.textContent = "";
        }
        const text = div.textContent?.trim() || "New note";
        updateNoteTitle(note.id, text);
    };

    return (
        <div
            ref={divRef}
            className={styles["note-title"]}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="New note"
            onInput={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
        >
            {note.title !== "New note" ? note.title : null}
        </div>
    );
}
