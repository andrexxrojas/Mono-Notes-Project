"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Note } from "@/app/type/electron";
import NoteTitle from "@/app/note/[id]/components/NoteTitle";
import NoteEditor from "@/app/components/NoteEditor/NoteEditor";
import styles from "./page.module.css";

export default function NotePage() {
    const params = useParams();
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [note, setNote] = useState<Note | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const id = params.id as string;
                const noteData = window.electron.notes.getNote(id);
                setNote(noteData);
            } catch (err) {
                console.error("Failed to fetch note:", err);
            } finally {
                setLoading(false);
            }
        };

        void fetchNote();
    }, [params.id]);

    const [blockCount, setBlockCount] = useState(1000);
    const [performanceLog, setPerformanceLog] = useState([]);

    const testBlocks = Array.from({ length: blockCount }, (_, i) => ({
        id: `test-${i}`,
        type: 'paragraph',
        content: `Test block ${i}`
    }));

    const runTest = () => {
        const start = performance.now();
        // Trigger re-render with many blocks
        // Measure and log results
    };

    return (
        <div ref={wrapperRef} className={styles["note-page-wrapper"]}>
            <div className={styles["note-page-container"]}>
                <div className={styles["note-info"]}>
                    {note?.id && <NoteTitle note={note} />}
                </div>
                {note && (
                    <NoteEditor note={note} scrollContainerRef={wrapperRef}/>
                )}
            </div>
        </div>
    );
}