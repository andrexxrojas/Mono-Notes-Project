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

    const reorderBlock = useCallback((draggedId: string, targetIndex: number) => {
        const map = blocksMapRef.current;
        const dragged = map.get(draggedId);
        if (!dragged) return;

        const currentOrder = blocks.map(b => b.id);
        const fromIndex = currentOrder.indexOf(draggedId);
        if (fromIndex === -1) return;
        if (fromIndex === targetIndex || fromIndex + 1 === targetIndex) return;

        const oldPrevId = dragged.prevId;
        const oldNextId = dragged.nextId;

        if (oldPrevId) {
            const oldPrev = map.get(oldPrevId);
            if (oldPrev) map.set(oldPrevId, { ...oldPrev, nextId: oldNextId });
        }
        if (oldNextId) {
            const oldNext = map.get(oldNextId);
            if (oldNext) map.set(oldNextId, { ...oldNext, prevId: oldPrevId });
        }

        let insertIndex = targetIndex;
        if (fromIndex < targetIndex) {
            insertIndex = targetIndex - 1;
        }

        const newOrderIds = [...currentOrder];
        newOrderIds.splice(fromIndex, 1);
        newOrderIds.splice(insertIndex, 0, draggedId);

        const newPrevId = newOrderIds[insertIndex - 1] ?? undefined;
        const newNextId = newOrderIds[insertIndex + 1] ?? undefined;

        map.set(draggedId, { ...dragged, prevId: newPrevId, nextId: newNextId });

        if (newPrevId) {
            const prev = map.get(newPrevId);
            if (prev) map.set(newPrevId, { ...prev, nextId: draggedId });
        }
        if (newNextId) {
            const next = map.get(newNextId);
            if (next) map.set(newNextId, { ...next, prevId: draggedId });
        }

        const newBlocks = [...blocks];
        newBlocks.splice(fromIndex, 1);
        newBlocks.splice(insertIndex, 0, dragged);
        setBlocks(newBlocks);

        window.electron.notes.reorderBlock(draggedId, newPrevId, newNextId);
    }, [blocks]);

    return {
        blocks,
        focusedBlockId,
        setFocusedBlockId,
        updateBlockContent,
        addBlockBelow,
        removeBlock,
        reorderBlock,
    };
}