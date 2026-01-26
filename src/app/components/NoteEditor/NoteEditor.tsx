import styles from "./NoteEditor.module.css";
import { Note } from "@/app/type/electron";

export default function NoteEditor({ note }: { note: Note }) {
    return (
        <div className={styles["note-editor"]}>

        </div>
    )
}