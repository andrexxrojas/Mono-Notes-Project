import styles from "./NoteEditor.module.css";
import {Note} from "@/utils/notes";

export default function NoteEditor({ note }: { note: Note }) {
    return (
        <div className={styles["note-editor"]}>
            <h1>{note.id}</h1>
        </div>
    )
}