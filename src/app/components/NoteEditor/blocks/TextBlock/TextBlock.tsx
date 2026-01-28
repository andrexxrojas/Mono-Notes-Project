"use client";

import { Block } from "@/app/type/electron";
import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
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

    const measureHeight = useCallback(() => {
        if (!divRef.current || !onMeasured) return;

        const height = divRef.current.offsetHeight;
        if (height !== lastHeightRef.current) {
            lastHeightRef.current = height;
            onMeasured(height);
        }
    }, [onMeasured]);

    useLayoutEffect(() => {
        if (!onMeasured) return;

        const observer = new ResizeObserver(() => {
            requestAnimationFrame(measureHeight);
        });

        if (divRef.current) {
            observer.observe(divRef.current);
        }

        requestAnimationFrame(measureHeight);

        return () => observer.disconnect();
    }, [measureHeight, onMeasured]);

    useEffect(() => {
        if (!autoFocus || !divRef.current) return;
        const timer = setTimeout(() => focusAndSelectAll(divRef.current!), 10);
        return () => clearTimeout(timer);
    }, [autoFocus]);

    const handleUpdate = useCallback(() => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
            const text = divRef.current?.innerText ?? "";

            if (text !== block.content) {
                window.electron.notes.updateBlock(block.id, text);
            }
        }, 500);
    }, [block.id, block.content]);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
        handleUpdate();
    }, [handleUpdate]);

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleKeyDown = useCallback(async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();

            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
                updateTimeoutRef.current = null;
            }

            const text = divRef.current?.innerText ?? "";
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

        handleUpdate();
    }, [handleUpdate]);

    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLDivElement>) => {
            e.preventDefault();

            const text = e.clipboardData.getData("text/plain");
            if (!text) return;

            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) return;

            const range = selection.getRangeAt(0);
            range.deleteContents();

            const lines = text.split(/\r?\n/);
            const fragment = document.createDocumentFragment();

            lines.forEach((line, index) => {
                fragment.appendChild(document.createTextNode(line));
                if (index < lines.length - 1) {
                    fragment.appendChild(document.createElement("br"));
                }
            });

            range.insertNode(fragment);
            range.collapse(false);

            selection.removeAllRanges();
            selection.addRange(range);
        },
        []
    );


    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="block-wrapper">
            <div className="hover-zone" />
            <DotsSixVerticalIcon size={21} className="drag-icon"/>
            <div
                id={block.id}
                ref={divRef}
                className={`${styles["text-block"]} ${isFocused ? styles["focused"] : ""}`}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Type '/' for commands"
                onInput={handleInput}
                onBlur={handleBlur}
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
            >
                {block.content ? block.content : null}
            </div>
        </div>
    );
}