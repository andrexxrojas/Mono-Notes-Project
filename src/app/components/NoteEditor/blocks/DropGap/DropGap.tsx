import React from "react";
import styles from "./DropGap.module.css";
import { useDrag } from "@/app/context/DragContext";
import { useBlocks } from "@/app/components/NoteEditor/hooks/useBlocks";
import { Block } from "@/app/type/electron";

interface DropGapProps {
    index: number;
    top: number;
    enabled: boolean;
    targetBlock: Block | null;
    onReorder: (draggedId: string, targetIndex: number) => void;
}

export default function DropGap({ index, top, enabled, targetBlock, onReorder }: DropGapProps) {
    const {
        draggingBlockId,
        hoveredGapIndex,
        setHoveredGapIndex,
    } = useDrag();

    if (!draggingBlockId || !enabled) return null;

    const isActive = hoveredGapIndex === index;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setHoveredGapIndex(index);

        if (targetBlock) {
            console.log(`Hovering above Block ${index + 1}, with ID: ${targetBlock.id} and text: ${targetBlock.content}`);
        } else {
            console.log(`Hovering at the bottom (after all blocks)`);
        }
    };

    const handleDrop = () => {
        if (!enabled || !draggingBlockId) return;

        onReorder(draggingBlockId, index);
    }

    return (
        <div
            className={styles["drop-zone"]}
            style={{ top }}
            onDragOver={handleDragOver}
            onDragLeave={() => {
                if (hoveredGapIndex === index) {
                    setHoveredGapIndex(null);
                }
            }}
            onDrop={handleDrop}
        >
            <div
                className={`${styles["indicator"]} ${
                    isActive ? styles["active"] : ""
                }`}
            />
        </div>
    );
}