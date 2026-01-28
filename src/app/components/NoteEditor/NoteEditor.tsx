import React from "react";
import { Note } from "@/app/type/electron";
import styles from "./NoteEditor.module.css";
import { useBlocks } from "@/app/components/NoteEditor/hooks/useBlocks";
import VirtualizedBlocks from "@/app/components/NoteEditor/blocks/VirtualizedBlocks";

export default function NoteEditor({ note, scrollContainerRef }: { note: Note, scrollContainerRef: React.RefObject<HTMLDivElement | null> }) {
	const { blocks, addBlockBelow, focusedBlockId, updateBlockContent } = useBlocks(note.id);

	return (
		<div className={styles["note-editor"]}>
			<VirtualizedBlocks
				blocks={blocks}
				scrollContainerRef={scrollContainerRef}
				addBlockBelow={addBlockBelow}
				focusedBlockId={focusedBlockId}
				updateBlockContent={updateBlockContent}
			/>
		</div>
	);
}
