"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react";
import { useNotes } from "@/app/context/NotesContext";
import Tab from "@/app/components/SideBarTab/SideBarTab";
import NoteTab from "@/app/components/NotesListTab/NotesListTab";
import {Note} from "@/app/type/electron";

export default function NotesList() {
    const { notes, setNotes } = useNotes();
    const router = useRouter();

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                const notesData = window.electron.notes.getNotes();
                setNotes(notesData);
            } catch (err) {
                console.error("Failed to fetch notes:", err);
            }
        };

        void fetchNotes();
    }, [setNotes]);

    const handleAddNote = async () => {
        try {
            const title = "New note";
            const noteId: string = window.electron.notes.addNote(title);
            const notesData: Note[] = window.electron.notes.getNotes();

            setNotes(notesData);

            router.push(`/note/${noteId}`);
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
