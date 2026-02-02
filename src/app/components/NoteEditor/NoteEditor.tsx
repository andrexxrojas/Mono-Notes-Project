import React from "react";
import { Note } from "@/app/type/electron";
import styles from "./NoteEditor.module.css";
import { useBlocks } from "@/app/components/NoteEditor/hooks/useBlocks";
import VirtualizedBlocks from "@/app/components/NoteEditor/blocks/VirtualizedBlocks";
import { BlockActionsProvider } from "@/app/context/BlockActionsContext";
import { DragProvider } from "@/app/context/DragContext";

export default function NoteEditor({ note, scrollContainerRef }: { note: Note, scrollContainerRef: React.RefObject<HTMLDivElement | null> }) {
	const { blocks, addBlockBelow, focusedBlockId, updateBlockContent, setFocusedBlockId } = useBlocks(note.id);

	return (
		<BlockActionsProvider
			value={{
				addBlockBelow,
				updateBlockContent,
				setFocusedBlockId,
				focusedBlockId,
			}}
		>
			<div className={styles["note-editor"]}>
				<DragProvider>
					<VirtualizedBlocks
						blocks={blocks}
						scrollContainerRef={scrollContainerRef}
						focusedBlockId={focusedBlockId}
					/>
				</DragProvider>
			</div>
		</BlockActionsProvider>
	);
}
