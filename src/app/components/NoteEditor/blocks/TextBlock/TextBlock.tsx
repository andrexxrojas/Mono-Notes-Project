"use client";

import { Block } from "@/app/type/electron";
import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import focusAndSelectAll from "@/app/components/NoteEditor/helper/focusAndSelectAll";
import styles from "./TextBlock.module.css";

interface TextBlockProps {
    block: Block;
    addBlockBelow?: (block: Block) => Promise<void>;
    autoFocus?: boolean;
    onMeasured?: (height: number) => void;
}

export default function TextBlock({ block, addBlockBelow, autoFocus, onMeasured }: TextBlockProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);
    const lastHeightRef = useRef<number>(0);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced height measurement
    const measureHeight = useCallback(() => {
        if (!divRef.current || !onMeasured) return;

        const height = divRef.current.offsetHeight;
        if (height !== lastHeightRef.current) {
            lastHeightRef.current = height;
            onMeasured(height);
        }
    }, [onMeasured]);

    // Measure height with RAF batching
    useLayoutEffect(() => {
        if (!onMeasured) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(measureHeight);
        });

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        // Initial measurement
        requestAnimationFrame(measureHeight);

        return () => observer.disconnect();
    }, [measureHeight, onMeasured]);

    // Auto-focus - FIXED: Use effect with proper cleanup
    useEffect(() => {
        if (!autoFocus || !divRef.current) return;

        const timer = setTimeout(() => {
            focusAndSelectAll(divRef.current!);
        }, 10); // Small delay to avoid layout thrashing

        return () => clearTimeout(timer);
    }, [autoFocus]);

    // Debounced update function
    const handleUpdate = useCallback(() => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
            const text = divRef.current?.textContent?.trim() || "";
            if (text !== block.content) {
                window.electron.notes.updateBlock(block.id, text);
            }
        }, 500); // 500ms debounce
    }, [block.id, block.content]);

    // Stable event handlers
    const handleBlur = useCallback(() => {
        setIsFocused(false);
        handleUpdate(); // Immediate update on blur
    }, [handleUpdate]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            // Clear any pending updates
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = null;
            }

            // Immediate update
            const text = divRef.current?.textContent?.trim() || "";
            if (text !== block.content) {
                window.electron.notes.updateBlock(block.id, text);
            }

            divRef.current?.blur();

            if (addBlockBelow) {
                await addBlockBelow(block);
            }
        }
    }, [block, addBlockBelow]);

    const handleInput = useCallback((e: React.FormEvent<HTMLDivElement>) => {
        const div = e.currentTarget;
        if (div.textContent === "\n" || div.textContent === "") {
            div.textContent = "";
        }

        // Trigger debounced update
        handleUpdate();
    }, [handleUpdate]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={divRef}
            className={`${styles.textBlock} ${isFocused ? styles.focused : ""}`}
            contentEditable
            suppressContentEditableWarning
            data-placeholder="Type '/' for commands"
            onInput={handleInput}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            // CRITICAL: Disable spellcheck and autocorrect for performance
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
        >
            {block.content ? block.content : null}
        </div>
    );
}