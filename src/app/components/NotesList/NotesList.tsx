"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Tab from "@/app/components/SideBarTab/SideBarTab";
import NoteTab from "@/app/components/NotesListTab/NotesListTab";
import { PlusIcon } from "@phosphor-icons/react";
import { getNotes, addNote, Note } from "@/utils/notes";
import styles from "./NotesList.module.css";

export default function NotesList() {
    const [notes, setNotes] = useState<Note[]>([]);
    const isMounted = useRef(true);

    const fetchNotes = useCallback(async () => {
        try {
            const notesData = await getNotes();
            if (isMounted.current) setNotes(notesData);
        } catch (err) {
            console.error("Failed to fetch notes:", err);
        }
    }, []);

    useEffect(() => {
        isMounted.current = true;
        void fetchNotes();

        return () => {
            isMounted.current = false;
        };
    }, [fetchNotes]);

    const handleAddNote = async () => {
        try {
            const title = "New note";
            await addNote(title);

            void fetchNotes();
        } catch (err) {
            console.error("Failed to add note:", err);
        }
    };

    return (
        <>
            {notes.map((note) => (
                <NoteTab
                    key={note.id}
                    icon={note.icon ? <span>{note.icon}</span>: undefined}
                    label={note.title}
                    onClick={() => console.log("Clicked note:", note.id)}
                />
            ))}

            <Tab
                icon={<PlusIcon size={19} />}
                label="Add new"
                onClick={handleAddNote}
            />
        </>
    );
}
