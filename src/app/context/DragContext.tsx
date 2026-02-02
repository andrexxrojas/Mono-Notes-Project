import React, { createContext, useContext, useState } from "react";

interface DragContextValue {
    draggingBlockId: string | null;
    setDraggingBlockId: (id: string | null) => void;
}

const DragContext = createContext<DragContextValue | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
    const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);

    return (
        <DragContext.Provider value={{ draggingBlockId, setDraggingBlockId }}>
            {children}
        </DragContext.Provider>
    );
}

export function useDrag() {
    const ctx = useContext(DragContext);
    if (!ctx) throw new Error("useDrag must be used inside DragProvider");
    return ctx;
}
