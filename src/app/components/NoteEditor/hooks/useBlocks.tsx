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

            setBlocks(ordered);
        }

        void loadBlocks();
    }, [noteId]);

    const addBlockBelow = async (currentBlock: Block) => {
        if (!currentBlock) return;

        const currentDiv = document.getElementById(currentBlock.id);
        const latestContent = currentDiv?.textContent?.trim() ?? currentBlock.content;

        const newBlockId = window.electron.notes.addBlockBelow(
            noteId,
            currentBlock.id,
            "text",
            ""
        );

        const newBlock: Block = {
            id: newBlockId,
            noteId,
            blockType: "text",
            content: "",
            prevId: currentBlock.id,
            nextId: currentBlock.nextId,
        };

        setBlocks(prevBlocks => {
            const updatedBlocksMap = new Map(prevBlocks.map(b => [b.id, b]));

            const curr = updatedBlocksMap.get(currentBlock.id)!;
            curr.nextId = newBlockId;
            curr.content = latestContent;
            updatedBlocksMap.set(currentBlock.id, curr);

            const nextBlockId = curr.nextId;
            if (nextBlockId) {
                const nextBlock = updatedBlocksMap.get(nextBlockId);
                if (nextBlock && nextBlock.prevId === currentBlock.id) {
                    nextBlock.prevId = newBlockId;
                    updatedBlocksMap.set(nextBlockId, nextBlock);
                    newBlock.nextId = nextBlockId;
                }
            }

            updatedBlocksMap.set(newBlockId, newBlock);

            const map = updatedBlocksMap;
            let head = Array.from(map.values()).find(b => !b.prevId) || null;
            const ordered: Block[] = [];
            while (head) {
                ordered.push(head);
                head = head.nextId ? map.get(head.nextId) || null : null;
            }

            return ordered;
        });

        setFocusedBlockId(newBlockId);
    };

    return { blocks, setBlocks, addBlockBelow, focusedBlockId, setFocusedBlockId };
}