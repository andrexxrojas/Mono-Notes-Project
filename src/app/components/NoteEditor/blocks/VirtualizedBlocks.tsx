"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import BlockFactory from "./BlockFactory";
import { Block } from "@/app/type/electron";

const DEFAULT_BLOCK_HEIGHT = 32;
const BUFFER = 6;

interface VirtualizedBlocksProps {
    blocks: Block[];
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    addBlockBelow: (block: Block) => Promise<void>;
    focusedBlockId: string | null;
}

export default function VirtualizedBlocks({
                                              blocks,
                                              scrollContainerRef,
                                              addBlockBelow,
                                              focusedBlockId,
                                          }: VirtualizedBlocksProps) {
    const [scrollTop, setScrollTop] = useState(0);
    const [viewportHeight, setViewportHeight] = useState(0);

    const heightCacheRef = useRef<Map<string, number>>(new Map());
    const [heightSnapshot, setHeightSnapshot] = useState<Map<string, number>>(new Map());

    const pendingUpdates = useRef<Map<string, number>>(new Map());
    const rafScheduled = useRef(false);

    const updateHeight = useCallback((id: string, height: number) => {
        const prev = heightCacheRef.current.get(id);
        if (prev === height) return;

        pendingUpdates.current.set(id, height);

        if (!rafScheduled.current) {
            rafScheduled.current = true;
            requestAnimationFrame(() => {
                pendingUpdates.current.forEach((h, id) => heightCacheRef.current.set(id, h));
                setHeightSnapshot(new Map(heightCacheRef.current));
                pendingUpdates.current.clear();
                rafScheduled.current = false;
            });
        }
    }, []);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const onScroll = () => {
            const newScrollTop = el.scrollTop;
            setScrollTop(newScrollTop);
        };

        onScroll();

        el.addEventListener("scroll", onScroll);
        return () => el.removeEventListener("scroll", onScroll);
    }, [scrollContainerRef]);

    useLayoutEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const updateViewport = () => setViewportHeight(el.clientHeight);
        updateViewport();

        const ro = new ResizeObserver(updateViewport);
        ro.observe(el);

        return () => ro.disconnect();
    }, [scrollContainerRef]);

    const heights: number[] = blocks.map((b) => heightSnapshot.get(b.id) ?? DEFAULT_BLOCK_HEIGHT);
    const cumHeights: number[] = [];
    let sum = 0;
    for (const h of heights) {
        sum += h;
        cumHeights.push(sum);
    }

    const findStart = (scrollTop: number) => {
        let low = 0, high = cumHeights.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (cumHeights[mid] < scrollTop) low = mid + 1;
            else high = mid - 1;
        }
        return Math.max(0, low - BUFFER);
    };

    const findEnd = (scrollBottom: number) => {
        let low = 0, high = cumHeights.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (cumHeights[mid] < scrollBottom) low = mid + 1;
            else high = mid - 1;
        }
        return Math.min(blocks.length - 1, low + BUFFER);
    };

    const start = findStart(scrollTop);
    const end = findEnd(scrollTop + viewportHeight);

    const topSpacer = heights.slice(0, start).reduce((a, b) => a + b, 0);
    const visibleHeight = heights.slice(start, end + 1).reduce((a, b) => a + b, 0);
    const totalHeight = cumHeights[cumHeights.length - 1] ?? 0;
    const bottomSpacer = totalHeight - topSpacer - visibleHeight;

    return (
        <>
            <div style={{ height: topSpacer }} />

            {blocks.slice(start, end + 1).map((block) => (
                <BlockFactory
                    key={block.id}
                    block={block}
                    data-virtual-block
                    addBlockBelow={addBlockBelow}
                    autoFocus={block.id === focusedBlockId}
                    onMeasured={(h) => updateHeight(block.id, h)}
                />
            ))}

            <div style={{ height: bottomSpacer }} />
        </>
    );
}