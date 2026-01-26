import styles from "./NoteEditor.module.css";
import { Note } from "@/app/type/electron";
import BlockFactory from "@/app/components/NoteEditor/blocks/BlockFactory";
import { useBlocks } from "@/app/components/NoteEditor/hooks/useBlocks";

export default function NoteEditor({ note }: { note: Note }) {
	const { blocks, addBlockBelow, focusedBlockId } = useBlocks(note.id);

	return (
		<div className={styles["note-editor"]}>
			{blocks.map((block) => (
				<BlockFactory
					key={block.id}
					block={block}
					addBlockBelow={addBlockBelow}
					autoFocus={block.id === focusedBlockId}
				/>
			))}
		</div>
	);
}
