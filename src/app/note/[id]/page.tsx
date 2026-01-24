"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getNote, Note } from "@/utils/notes";
import NoteEditor from "@/app/components/NoteEditor/NoteEditor";
import styles from "./page.module.css";

export default function NotePage() {
    const params = useParams();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const id = params.id as string;
                const noteData = await getNote(id);
                setNote(noteData);
            } catch (err) {
                console.error("Failed to fetch note:", err);
            } finally {
                setLoading(false);
            }
        };

        void fetchNote();
    }, [params.id]);

    return (
        <div className={styles["note-page-wrapper"]}>
            <div className={styles["note-page-container"]}>
                {note && (
                    <NoteEditor note={note}/>
                )}
            </div>
        </div>
    );
}