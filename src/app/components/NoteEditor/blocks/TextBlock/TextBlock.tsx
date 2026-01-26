"use client";

import { Block } from "@/app/type/electron";
import React, { useRef, useState } from "react";
import styles from "./TextBlock.module.css";

interface TextBlockProps {
    block: Block;
}

export default function TextBlock({ block }: TextBlockProps) {
    const divRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

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

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            void handleUpdate();
            divRef.current?.blur();
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
