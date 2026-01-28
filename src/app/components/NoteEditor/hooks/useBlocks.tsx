"use client";

import { useEffect, useState } from "react";
import { Block } from "@/app/type/electron";

export function useBlocks(noteId: string) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

    useEffect(() => {
        const loadBlocks = async () => {
            const fetched = window.electron.notes.getBlocks(noteId);
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

        const newBlockId = window.electron.notes.addBlockBelow(
            noteId,
            currentBlock.id,
            "text",
            ""
        );

        setBlocks(prevBlocks => {
            const updatedBlocksMap = new Map(
                prevBlocks.map(b => {
                    const div = document.getElementById(b.id);
                    const domContent = div?.textContent?.trim() ?? b.content;
                    return [b.id, { ...b, content: domContent }];
                })
            );

            const curr = updatedBlocksMap.get(currentBlock.id)!;
            const oldNextId = curr.nextId;

            curr.nextId = newBlockId;
            updatedBlocksMap.set(curr.id, curr);

            const newBlock: Block = {
                id: newBlockId,
                noteId,
                blockType: "text",
                content: "",
                prevId: curr.id,
                nextId: oldNextId || undefined,
            };
            updatedBlocksMap.set(newBlockId, newBlock);

            if (oldNextId) {
                const oldNext = updatedBlocksMap.get(oldNextId);
                if (oldNext) {
                    oldNext.prevId = newBlockId;
                    updatedBlocksMap.set(oldNextId, oldNext);
                }
            }

            const ordered: Block[] = [];
            let head = Array.from(updatedBlocksMap.values()).find(b => !b.prevId) || null;
            const visited = new Set<string>();
            while (head && !visited.has(head.id)) {
                visited.add(head.id);
                ordered.push(head);
                head = head.nextId ? updatedBlocksMap.get(head.nextId) || null : null;
            }

            return ordered;
        });

        setFocusedBlockId(newBlockId);
    };

    return { blocks, setBlocks, addBlockBelow, focusedBlockId, setFocusedBlockId };
}