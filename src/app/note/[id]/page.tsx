"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getNote, Note } from "@/utils/notes";
import styles from "./page.module.css";

export default function NotePage() {
    const params = useParams();
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const id = params.id as string;
                console.log("ID:", id);
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

    if(!note) return <h1>Note not found.</h1>

    return (
        <div className={styles["note-page-wrapper"]}>
            <div className={styles["note-page-container"]}>
                <h1>{note?.id}</h1>
            </div>
        </div>
    );
}