"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Tab from "@/app/components/SideBarTab/SideBarTab";
import NoteTab from "@/app/components/NotesListTab/NotesListTab";
import { PlusIcon } from "@phosphor-icons/react";
import { getNotes, addNote, Note } from "@/utils/notes";
import styles from "./NotesList.module.css";
import { useRouter } from "next/navigation";

export default function NotesList() {
    const [notes, setNotes] = useState<Note[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const notesData = await getNotes();
                setNotes(notesData);
            } catch (err) {
                console.error("Failed to fetch notes:", err);
            }
        };

        void fetchNotes();
    }, []);

    const handleAddNote = async () => {
        try {
            const title = "New note";
            const note = await addNote(title);

            const notesData = await getNotes();
            setNotes(notesData);

            router.push(`/note/${note.id}`);
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
                    onClick={() => router.push(`/note/${note.id}`)}
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
