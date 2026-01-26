"use client";

import { useEffect, useState } from "react";
import { Block } from "@/app/type/electron";

export function useBlocks(noteId: string) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    useEffect(() => {
        const loadBlocks = async () => {
            const fetched = window.electron.notes.getBlocks(noteId);
            setBlocks(fetched);
        }

        void loadBlocks();
    }, [noteId]);

    const addBlockBelow = async (currentBlock: Block) => {
        const newBlockId = window.electron.notes.addBlock(noteId, "text", "");

        const currentIndex = blocks.findIndex(b => b.id === currentBlock.id);
        const newPosition = currentIndex + 1;

        const newBlock: Block = {
            id: newBlockId,
            note_id: noteId,
            block_type: "text",
            content: "",
            position: newPosition,
        };

        const updatedBlocks = [
            ...blocks.slice(0, newPosition),
            newBlock,
            ...blocks.slice(newPosition),
        ].map((b, index) => ({ ...b, position: index }));

        setBlocks(updatedBlocks);
        setFocusedBlockId(newBlockId);
    }

    return { blocks, setBlocks, addBlockBelow, focusedBlockId, setFocusedBlockId };
}