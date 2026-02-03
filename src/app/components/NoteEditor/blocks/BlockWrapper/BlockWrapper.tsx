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
    const [isDragging, setIsDragging] = useState(false);

    const {
        draggingBlockId,
        setDraggingBlockId,
        setHoveredGapIndex,
    } = useDrag();

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
        setHoveredGapIndex(null);
    };

    return (
        <div
            ref={wrapperRef}
            className={`${styles["block-wrapper"]} ${
                isSelfDragging ? styles["dragging"] : ""
            }`}
            data-block-id={blockId}
        >
            <div className={styles["extra-hover-zone"]} />

            <div
                className={`${styles["drag-icon"]} ${
                    isDragging ? styles["hidden"] : ""
                }`}
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
