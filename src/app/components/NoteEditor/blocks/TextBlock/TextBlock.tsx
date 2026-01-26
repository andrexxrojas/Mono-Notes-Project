"use client";

import { Block } from "@/app/type/electron";
import React, { useRef, useState, useEffect } from "react";
import focusAndSelectAll from "@/app/components/NoteEditor/helper/focusAndSelectAll";
import styles from "./TextBlock.module.css";

interface TextBlockProps {
    block: Block;
    addBlockBelow?: (block: Block) => Promise<void>;
    autoFocus?: boolean;
}

export default function TextBlock({ block, addBlockBelow, autoFocus  }: TextBlockProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (autoFocus && divRef.current) {
            setTimeout(() => {
                focusAndSelectAll(divRef.current!);
            }, 0);
        }
    }, [autoFocus]);

    const handleUpdate = () => {
        const text = divRef.current?.textContent?.trim() || "";
        if (text !== block.content) {
            window.electron.notes.updateBlock(block.id, text);
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        void handleUpdate();
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleUpdate();
            divRef.current?.blur();

            if (addBlockBelow) {
                await addBlockBelow(block);
            }
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const div = e.currentTarget;
        if (div.textContent === "\n" || div.textContent === "") {
            div.textContent = "";
        }
    };

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
        >
            {block.content ? block.content : null}
        </div>
    );
}
