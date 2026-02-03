import React, { createContext, useContext, useState } from "react";

interface DragContextValue {
    draggingBlockId: string | null;
    setDraggingBlockId: (id: string | null) => void;
    hoveredGapIndex: number | null;
    setHoveredGapIndex: (index: number | null) => void;
}

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
    const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
    const [hoveredGapIndex, setHoveredGapIndex] = useState<number | null>(null);

    return (
        <DragContext.Provider
            value={{
                draggingBlockId,
                setDraggingBlockId,
                hoveredGapIndex,
                setHoveredGapIndex,
            }}
        >
            {children}
        </DragContext.Provider>
    );
}

export function useDrag() {
    const ctx = useContext(DragContext);
    if (!ctx) throw new Error("useDrag must be used within DragProvider");
    return ctx;
}
