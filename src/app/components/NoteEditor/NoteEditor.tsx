import styles from "./NoteEditor.module.css";
import { Note } from "@/app/type/electron";
import BlockFactory from "@/app/components/NoteEditor/blocks/BlockFactory";
import {Block} from "@babel/types";

export default function NoteEditor({ note }: { note: Note }) {
	const blocks = window.electron.notes.getBlocks(note.id);

	return (
		<div className={styles["note-editor"]}>
			{blocks.map((block) => (
				<BlockFactory key={block.id} block={block}/>
			))}
		</div>
	);
}
