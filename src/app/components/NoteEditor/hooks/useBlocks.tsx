"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Block } from "@/app/type/electron";

export function useBlocks(noteId: string) {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const blocksMapRef = useRef<Map<string, Block>>(new Map());

    useEffect(() => {
        const loadBlocks = async () => {
            const fetched: Block[] = window.electron.notes.getBlocks(noteId);

            const map = new Map(fetched.map(b => [b.id, b]));
            blocksMapRef.current = map;

            const ordered: Block[] = [];
            let head = fetched.find(b => !b.prevId) || null;
            while (head) {
                ordered.push(head);
                head = head.nextId ? map.get(head.nextId) || null : null;
            }

            setBlocks(ordered);
        };

        void loadBlocks();
    }, [noteId]);

    const updateBlockContent = useCallback((blockId: string, content: any) => {
        const map = blocksMapRef.current;
        const block = map.get(blockId);
        if (!block) return;

        if (block.content !== content) {
            const updatedBlock = { ...block, content };
            map.set(blockId, updatedBlock);
            window.electron.notes.updateBlock(blockId, content);
        }
    }, []);

    const addBlockBelow = useCallback(async (currentBlock: Block, type: string = "text") => {
        if (!currentBlock) return;

        const map = blocksMapRef.current;
        const curr = map.get(currentBlock.id);
        if (!curr) return;

        const newBlockId = window.electron.notes.addBlockBelow(noteId, curr.id, type, "");

        const newBlock: Block = {
            id: newBlockId,
            noteId,
            blockType: type,
            content: "",
            prevId: curr.id,
            nextId: curr.nextId || undefined,
        };

        map.set(curr.id, { ...curr, nextId: newBlockId });
        map.set(newBlockId, newBlock);

        if (curr.nextId) {
            const oldNext = map.get(curr.nextId);
            if (oldNext) {
                map.set(oldNext.id, { ...oldNext, prevId: newBlockId });
            }
        }

        setBlocks(() => {
            const ordered: Block[] = [];
            let head = Array.from(map.values()).find(b => !b.prevId) || null;
            const visited = new Set<string>();

            while (head && !visited.has(head.id)) {
                visited.add(head.id);
                ordered.push(head);
                head = head.nextId ? map.get(head.nextId) || null : null;
            }

            return ordered;
        });

        setFocusedBlockId(newBlockId);
    }, [noteId]);

    const removeBlock = useCallback((blockId: string) => {
        const map = blocksMapRef.current;
        const block = map.get(blockId);
        if (!block) return;

        if (block.prevId) {
            const prev = map.get(block.prevId);
            if (prev) map.set(prev.id, { ...prev, nextId: block.nextId });
        }
        if (block.nextId) {
            const next = map.get(block.nextId);
            if (next) map.set(next.id, { ...next, prevId: block.prevId });
        }

        map.delete(blockId);

        setBlocks(prev => prev.filter(b => b.id !== blockId));
    }, []);

    return {
        blocks,
        focusedBlockId,
        setFocusedBlockId,
        updateBlockContent,
        addBlockBelow,
        removeBlock,
    };
}