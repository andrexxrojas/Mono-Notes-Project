import styles from "./NotesListTab.module.css";
import { FileIcon } from "@phosphor-icons/react";
import {MouseEventHandler, ReactNode} from "react";

type NotesListTabProps = {
    icon?: ReactNode;
    label?: string;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}

export default function NotesListTab({ icon, label, onClick }: NotesListTabProps) {
    return (
        <button className={styles["note-tab"]} onClick={onClick}>
            {icon ? icon : <FileIcon size={19}/>}
            <span className={styles["note-tab-txt"]}>{label ? label : "New note"}</span>
        </button>
    )
}