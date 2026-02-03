import React, { useMemo, useRef, useLayoutEffect, useState } from "react";
import { Note } from "@/app/type/electron";
import styles from "./NoteEditor.module.css";
import { useBlocks } from "@/app/components/NoteEditor/hooks/useBlocks";
import { BlockActionsProvider } from "@/app/context/BlockActionsContext";
import { DragProvider, useDrag } from "@/app/context/DragContext";
import BlockFactory from "@/app/components/NoteEditor/blocks/BlockFactory";
import DropGap from "@/app/components/NoteEditor/blocks/DropGap/DropGap";

function NoteEditorContent({ note }: { note: Note }) {
	const {
		blocks,
		addBlockBelow,
		focusedBlockId,
		updateBlockContent,
		setFocusedBlockId,
	} = useBlocks(note.id);

	const { draggingBlockId } = useDrag();
	const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
	const [gapPositions, setGapPositions] = useState<number[]>([]);
	const editorRef = useRef<HTMLDivElement>(null);

	const draggingIndex = useMemo(() => {
		if (!draggingBlockId) return -1;
		return blocks.findIndex(b => b.id === draggingBlockId);
	}, [draggingBlockId, blocks]);

	const isGapEnabled = (gapIndex: number) => {
		if (draggingIndex === -1) return false;

		if (gapIndex === draggingIndex || gapIndex === draggingIndex + 1) {
			return false;
		}

		return true;
	};

	useLayoutEffect(() => {
		const positions: number[] = [];

		if (blocks.length === 0) {
			requestAnimationFrame(() => {
				setGapPositions([]);
			});
			return;
		}

		const firstBlock = blockRefs.current.get(blocks[0].id);
		if (firstBlock) {
			positions[0] = firstBlock.offsetTop / 2;
		}

		blocks.forEach((block, i) => {
			const el = blockRefs.current.get(block.id);
			const nextEl = blockRefs.current.get(blocks[i + 1]?.id);
			if (!el || !nextEl) return;

			const top = el.offsetTop + el.offsetHeight;
			const nextTop = nextEl.offsetTop;
			positions[i + 1] = top + (nextTop - top) / 2;
		});

		const lastBlock = blockRefs.current.get(blocks[blocks.length - 1].id);
		if (lastBlock && editorRef.current) {
			const editorHeight = editorRef.current.offsetHeight;
			const lastBlockBottom = lastBlock.offsetTop + lastBlock.offsetHeight;
			const remainingSpace = editorHeight - lastBlockBottom;
			positions[blocks.length] = lastBlockBottom + remainingSpace / 2;
		}

		requestAnimationFrame(() => {
			setGapPositions(positions);
		});
	}, [blocks]);

	return (
		<BlockActionsProvider
			value={{
				addBlockBelow,
				updateBlockContent,
				setFocusedBlockId,
				focusedBlockId,
			}}
		>
			<div className={styles["note-editor"]} ref={editorRef}>
				{blocks.map((block, i) => (
					<React.Fragment key={block.id}>
						{gapPositions[i] !== undefined && (
							<DropGap
								index={i}
								top={gapPositions[i]}
								enabled={isGapEnabled(i)}
								targetBlock={block}
							/>
						)}

						<div
							ref={el => {
								if (el) blockRefs.current.set(block.id, el);
							}}
						>
							<BlockFactory
								block={block}
								autoFocus={block.id === focusedBlockId}
							/>
						</div>
					</React.Fragment>
				))}

				{blocks.length > 0 && gapPositions[blocks.length] !== undefined && (
					<DropGap
						index={blocks.length}
						top={gapPositions[blocks.length]}
						enabled={isGapEnabled(blocks.length)}
						targetBlock={null}
					/>
				)}
			</div>
		</BlockActionsProvider>
	);
}

export default function NoteEditor({ note,  scrollContainerRef }: {
	note: Note;
	scrollContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
	return (
		<DragProvider>
			<NoteEditorContent note={note} />
		</DragProvider>
	);
}