import styles from "./BlockWrapper.module.css";
import React, { ReactNode, useRef, useState } from "react";
import { DotsSixVerticalIcon } from "@phosphor-icons/react";
import { useDrag } from "@/app/context/DragContext";

interface BlockWrapperProps {
    children: ReactNode;
    blockId: string;
}

export default function BlockWrapper({ children, blockId }: BlockWrapperProps) {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const { draggingBlockId, setDraggingBlockId } = useDrag();

    const isSelfDragging = draggingBlockId === blockId;

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        setDraggingBlockId(blockId);

        e.dataTransfer.setData("text/plain", blockId);
        e.dataTransfer.effectAllowed = "move";

        if (wrapperRef.current) {
            const ghost = wrapperRef.current.cloneNode(true) as HTMLElement;
            ghost.style.position = "absolute";
            ghost.style.top = "-9999px";
            ghost.style.left = "-9999px";
            ghost.style.width = `${wrapperRef.current.offsetWidth}px`;
            ghost.classList.add(styles["drag-ghost"]);

            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 0, 0);

            requestAnimationFrame(() => {
                document.body.removeChild(ghost);
            });
        }
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        setDraggingBlockId(null);
        setDropPosition(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDropPosition(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (draggingBlockId === blockId) {
            setDropPosition(null);
            return;
        }

        e.dataTransfer.dropEffect = "move";

        const rect = wrapperRef.current!.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;

        if (offsetY < rect.height / 2) {
            setDropPosition(null);
        } else {
            setDropPosition("bottom");
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.relatedTarget as Node)) {
            setDropPosition(null);
        }
    };

    return (
        <div
            ref={wrapperRef}
            className={`${styles["block-wrapper"]} ${
                dropPosition ? styles[`drop-${dropPosition}`] : ""
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-block-id={blockId}
        >
            <div className={styles["extra-hover-zone"]} />
            <div
                className={`${styles["drag-icon"]} ${isDragging ? styles["hidden"] : ""}`}
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <DotsSixVerticalIcon size={21} />
            </div>
            {children}
        </div>
    );
}
