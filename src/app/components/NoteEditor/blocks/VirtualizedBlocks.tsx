"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import BlockFactory from "./BlockFactory";
import { Block } from "@/app/type/electron";

const DEFAULT_BLOCK_HEIGHT = 100;
const BASE_BUFFER = 30;
const FAST_SCROLL_VELOCITY = 100;
const FAST_SCROLL_BUFFER = 100;

interface VirtualizedBlocksProps {
    blocks: Block[];
    scrollContainerRef: React.RefObject<HTMLDivElement | null>;
    addBlockBelow: (block: Block) => Promise<void>;
    focusedBlockId: string | null;
    updateBlockContent: (blockId: string, content: any) => void
}

export default function VirtualizedBlocks({
    blocks,
    scrollContainerRef,
    addBlockBelow,
    focusedBlockId,
    updateBlockContent,
                                          }: VirtualizedBlocksProps) {
    const [viewportHeight, setViewportHeight] = useState(0);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 0 });
    const [hasMeasured, setHasMeasured] = useState(false);
    const [totalHeight, setTotalHeight] = useState(0);
    const [topSpacer, setTopSpacer] = useState(0);

    const blockHeightsRef = useRef<Map<string, number>>(new Map());
    const cumulativeHeightsRef = useRef<Float32Array>(new Float32Array(0));
    const scrollRafId = useRef<number | null>(null);

    const rebuildCumulative = useCallback(() => {
        const count = blocks.length;
        if (cumulativeHeightsRef.current.length !== count) {
            cumulativeHeightsRef.current = new Float32Array(count);
        }

        let sum = 0;
        const cum = cumulativeHeightsRef.current;
        for (let i = 0; i < count; i++) {
            sum += blockHeightsRef.current.get(blocks[i].id) ?? DEFAULT_BLOCK_HEIGHT;
            cum[i] = sum;
        }

        setTotalHeight(sum);
    }, [blocks]);

    const updateHeight = useCallback(
        (id: string, height: number) => {
            const prev = blockHeightsRef.current.get(id) ?? DEFAULT_BLOCK_HEIGHT;
            if (Math.abs(prev - height) < 1) return;

            blockHeightsRef.current.set(id, height);
            const diff = height - prev;

            const idx = blocks.findIndex(b => b.id === id);
            if (idx === -1) return;

            const cum = cumulativeHeightsRef.current;
            for (let i = idx; i < cum.length; i++) cum[i] += diff;

            setTotalHeight(prev => prev + diff);

            const el = scrollContainerRef.current;

            if (el) {
                const blockTop = idx > 0 ? cumulativeHeightsRef.current[idx - 1] : 0;
                if (blockTop < el.scrollTop) {
                    el.scrollTop += diff;
                }
            }


            setTopSpacer(start => (visibleRange.start > 0 ? cum[visibleRange.start - 1] : 0));
            if (!hasMeasured) { setHasMeasured(true); }
        },
        [blocks, scrollContainerRef, visibleRange.start, hasMeasured]
    );

    const findIndex = useCallback((offset: number) => {
        const cum = cumulativeHeightsRef.current;
        if (!cum.length) return 0;

        let low = 0, high = cumulativeHeightsRef.current.length - 1;
        while (low <= high) {
            const mid = (low + high) >>> 1;
            if (cum[mid] < offset) low = mid + 1;
            else high = mid - 1;
        }
        return low;
    }, []);

    useLayoutEffect(() => {
        const el = scrollContainerRef.current;
        if (!el) return;

        const ro = new ResizeObserver(() => {
            const el = scrollContainerRef.current;
            if (!el) return;

            const vh = el.clientHeight;
            setViewportHeight(vh);

            requestAnimationFrame(() => {
                rebuildCumulative();
            });
        });

        ro.observe(el);

        requestAnimationFrame(() => {
            rebuildCumulative();
        });

        return () => ro.disconnect();
    }, [scrollContainerRef, rebuildCumulative]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el || !viewportHeight) return;

        let lastScrollTop = el.scrollTop;
        let scrollStopTimer: NodeJS.Timeout;

        const updateRange = () => {
            const scrollTop = el.scrollTop;
            const velocity = Math.abs(scrollTop - lastScrollTop);
            lastScrollTop = scrollTop;

            const startIdx = findIndex(scrollTop);
            const endIdx = findIndex(scrollTop + viewportHeight);

            const buffer = velocity > FAST_SCROLL_VELOCITY ? FAST_SCROLL_BUFFER : BASE_BUFFER;

            const start = Math.max(0, startIdx - buffer);
            const end = Math.min(blocks.length - 1, endIdx + buffer);

            setVisibleRange(prev => {
                if (prev.start !== start || prev.end !== end) {
                    setTopSpacer(start > 0 ? cumulativeHeightsRef.current[start - 1] : 0);
                    return { start, end };
                }
                return prev;
            });
        };

        const onScroll = () => {
            if (scrollRafId.current) cancelAnimationFrame(scrollRafId.current);
            scrollRafId.current = requestAnimationFrame(updateRange);

            clearTimeout(scrollStopTimer);
            scrollStopTimer = setTimeout(updateRange, 150);
        };

        el.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            el.removeEventListener("scroll", onScroll);
            clearTimeout(scrollStopTimer);
            if (scrollRafId.current) cancelAnimationFrame(scrollRafId.current);
        };
    }, [blocks.length, viewportHeight, scrollContainerRef, findIndex]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (!el || !viewportHeight) return;

        requestAnimationFrame(() => {
            const scrollTop = el.scrollTop;
            const startIdx = findIndex(scrollTop);
            const endIdx = findIndex(scrollTop + viewportHeight);

            const start = Math.max(0, startIdx - BASE_BUFFER);
            const end = Math.min(blocks.length - 1, endIdx + BASE_BUFFER);

            setVisibleRange({ start, end });
            setTopSpacer(start > 0 ? cumulativeHeightsRef.current[start - 1] : 0);
        });
    }, [viewportHeight, findIndex, blocks.length, scrollContainerRef]);

    const { start, end } = visibleRange;

    return (
        <div style={{ height: hasMeasured ? totalHeight : "auto", position: "relative", width: "100%", contain: "layout" }}>
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translate3d(0, ${topSpacer}px, 0)`,
                    willChange: "transform",
                }}
            >
                {blocks.slice(start, end + 1).map(block => (
                    <BlockFactory
                        key={block.id}
                        block={block}
                        addBlockBelow={addBlockBelow}
                        autoFocus={block.id === focusedBlockId}
                        onMeasured={height => updateHeight(block.id, height)}
                        updateBlockContent={updateBlockContent}
                    />
                ))}
            </div>
        </div>
    );
}
