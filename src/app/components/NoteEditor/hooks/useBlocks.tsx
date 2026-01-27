"use client";

import { useEffect, useState } from "react";
import { Block } from "@/app/type/electron";

export function useBlocks(noteId: string) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    useEffect(() => {
        const loadBlocks = async () => {
            const fetched = window.electron.notes.getBlocks(noteId);

            console.table(
                fetched.map(b => ({
                    id: b.id,
                    prev: b.prevId,
                    next: b.nextId,
                }))
            );

            const map = new Map(fetched.map(b => [b.id, b]));
            let head = fetched.find(b => !b.prevId) || null;
            const ordered: Block[] = [];

            while (head) {
                ordered.push(head);
                head = head.nextId ? map.get(head.nextId) || null : null;
            }

            console.log("Blocks: ", ordered);

            setBlocks(ordered);
        }

        void loadBlocks();
    }, [noteId]);

    const addBlockBelow = async (currentBlock: Block) => {
        if (!currentBlock) return;

        const newBlockId = window.electron.notes.addBlockBelow(
            noteId,
            currentBlock.id,
            "text",
            ""
        );

        const newBlock: Block = {
            id: newBlockId,
            noteId: noteId,
            blockType: "text",
            content: "",
            prevId: currentBlock.id,
            nextId: currentBlock.nextId,
        };

        const updatedBlocksMap = new Map<string, Block>();
        blocks.forEach(b => {
            if (b.id === currentBlock.id) updatedBlocksMap.set(b.id, { ...b, nextId: newBlockId });
            else if (b.id === currentBlock.nextId) updatedBlocksMap.set(b.id, { ...b, prevId: newBlockId });
            else updatedBlocksMap.set(b.id, b);
        });
        updatedBlocksMap.set(newBlockId, newBlock);

        const map = updatedBlocksMap;
        let head = Array.from(map.values()).find(b => !b.prevId) || null;
        const ordered: Block[] = [];
        while (head) {
            ordered.push(head);
            head = head.nextId ? map.get(head.nextId) || null : null;
        }

        setBlocks(ordered);
        setFocusedBlockId(newBlockId);
    };

    return { blocks, setBlocks, addBlockBelow, focusedBlockId, setFocusedBlockId };
}